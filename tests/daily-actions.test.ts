// Real daily service/SQLite and session state machine with controlled IO/timers.
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {fixture} from './fixtures.ts';
import {dailySpec,makePuzzle} from '../lib/game/engine.ts';
import {DailyActionSession,DailyRequestError,DAILY_REQUEST_TIMEOUT,type DailyIntent,type DailyReply,type DailyActionState} from '../lib/game/daily-action.ts';
const key=(i:number)=>`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`;
function deferred<T>(){let resolve!:(v:T)=>void;let reject!:(e:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
const settle=async()=>{for(let i=0;i<24;i++)await Promise.resolve();};
async function setup(){const f=fixture(Date.parse('2026-10-28T08:00Z')),daily=await f.game.daily('alice'),s=dailySpec(daily.day),board=makePuzzle(s.themeId,s.level,s.seed);return{...f,daily,board};}

describe('daily hint receipts and read-only same-attempt recovery',()=>{
 it('deduplicates concurrent keys atomically and returns current progress with the original hint cell',async()=>{
  const h=await setup(),hints=await Promise.all([1,2,3].map(()=>h.game.dailyClaim('alice',h.daily.id,null,null,true,key(1))));assert.ok(hints.every(r=>r.hints===1));
  const original=(hints[0] as DailyReply).hintCell,target=h.board.placements[0]!;await h.game.dailyClaim('alice',h.daily.id,target.a,target.b);
  await h.game.dailyClaim('alice',h.daily.id,null,null,true);await h.game.dailyClaim('alice',h.daily.id,null,null,true,key(2));
  const replay=await h.game.dailyClaim('alice',h.daily.id,null,null,true,key(1)) as DailyReply;
  assert.equal(replay.hints,3);assert.equal(replay.strokes.length,1);assert.deepEqual(replay.hintCell,original);assert.equal('hintReceipts' in replay,false);
  const row=h.sqlite.prepare('SELECT data FROM dailies WHERE id=?').get(h.daily.id) as {data:string};assert.equal(JSON.parse(row.data).hintReceipts.length,2);
  await assert.rejects(()=>h.game.dailyClaim('alice',h.daily.id,null,null,true,key(3)),/Üç ipucunu/);
 });
 it('does not add a second penalty after a lost hint response, completion or expiry',async()=>{
  const h=await setup();await h.game.dailyClaim('alice',h.daily.id,null,null,true,key(1));h.advance(20000);
  for(const p of h.board.placements)await h.game.dailyClaim('alice',h.daily.id,p.a,p.b);
  const finished=await h.game.dailyState('alice',h.daily.id);assert.equal(finished.duration,35000);h.advance(26*3600000);
  const replay=await h.game.dailyClaim('alice',h.daily.id,null,null,true,key(1));assert.equal(replay.hints,1);assert.equal(replay.duration,finished.duration);assert.equal(replay.finished,finished.finished);assert.equal('hintReceipts' in replay,false);
 });
 it('reads the original attempt across midnight without creating another day or exposing it to another owner',async()=>{
  const h=await setup();h.setTime(Date.parse('2026-10-29T00:10Z'));const before=h.sqlite.prepare('SELECT COUNT(*) AS n FROM dailies').get() as {n:number};
  const read=await h.game.dailyState('alice',h.daily.id);assert.equal(read.id,h.daily.id);assert.equal(read.day,'2026-10-28');assert.equal('placements' in read.board,false);assert.equal((h.sqlite.prepare('SELECT COUNT(*) AS n FROM dailies').get() as {n:number}).n,before.n);
  await assert.rejects(()=>h.game.dailyState('bob',h.daily.id),/bulunamadı/);await assert.rejects(()=>h.game.dailyState('alice','missing'),/bulunamadı/);
 });
 it('rejects invalid operation keys without mutation and keeps old no-key clients compatible',async()=>{
  const h=await setup();for(const id of ['',null,1,'invalid'])await assert.rejects(()=>h.game.dailyClaim('alice',h.daily.id,null,null,true,id),/doğrulanamadı/);
  assert.equal((await h.game.dailyState('alice',h.daily.id)).hints,0);assert.equal((await h.game.dailyClaim('alice',h.daily.id,null,null,true)).hints,1);
 });
});

async function session(request?:(intent:DailyIntent|null,signal:AbortSignal)=>Promise<DailyReply>){
 const h=await setup(),states:DailyActionState[]=[],received:DailyReply[]=[],confirmed:DailyIntent[]=[],calls:{intent:DailyIntent|null;signal:AbortSignal}[]=[];let active=true;
 const send=async(intent:DailyIntent|null):Promise<DailyReply>=>intent?intent.kind==='hint'?h.game.dailyClaim('alice',h.daily.id,null,null,true,intent.requestId):h.game.dailyClaim('alice',h.daily.id,intent.stroke.a,intent.stroke.b):h.game.dailyState('alice',h.daily.id);
 const sync=new DailyActionSession({id:h.daily.id,day:h.daily.day,board:h.daily.board,isCurrent:()=>active,request:async(intent,signal)=>{calls.push({intent,signal});return request?request(intent,signal):send(intent);},receive:r=>received.push(r),state:s=>states.push(s),confirmed:i=>confirmed.push(i)});
 return {...h,sync,send,calls,states,received,confirmed,retire(){active=false;},get phase(){return states.at(-1)?.phase;},hint:{kind:'hint',requestId:key(1)} as DailyIntent,claim:{kind:'claim',stroke:h.board.placements[0]!,label:h.board.targets[0]!.label} as DailyIntent};
}

describe('bounded daily actions preserve a single intent until authoritative recovery',()=>{
 it('bounds an ignored abort, prevents same-turn duplicate actions and retries the same hint key after an unchanged read',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const gate=deferred<DailyReply>();let h:Awaited<ReturnType<typeof session>>;
  h=await session(async(intent)=>h.calls.length===1?gate.promise:h.send(intent));
  const first=h.sync.act(h.hint);void h.sync.act({...h.hint});assert.equal(h.calls.length,1);t.mock.timers.tick(DAILY_REQUEST_TIMEOUT);await first;
  assert.equal(h.phase,'uncertain');assert.equal(h.calls[0]!.signal.aborted,true);assert.equal(h.received.length,0);
  await h.sync.retry();assert.equal(h.phase,'idle');assert.equal(h.calls[1]!.intent,null);assert.deepEqual(h.calls[2]!.intent,h.hint);assert.notEqual(h.calls[0]!.signal,h.calls[2]!.signal);assert.equal((await h.game.dailyState('alice',h.daily.id)).hints,1);
  const count=h.received.length;gate.resolve({...h.daily,hints:3});await settle();assert.equal(h.received.length,count);assert.equal(h.confirmed.length,1);h.sync.dispose();
 });
 it('recovers a hint already accepted before response loss without charging it again',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});let h:Awaited<ReturnType<typeof session>>;
  h=await session(async intent=>{const result=await h.send(intent);if(h.calls.length===1)return new Promise<DailyReply>(()=>{});return result;});
  const pending=h.sync.act(h.hint);await settle();assert.equal((await h.game.dailyState('alice',h.daily.id)).hints,1);t.mock.timers.tick(DAILY_REQUEST_TIMEOUT);await pending;
  await h.sync.retry();assert.equal(h.phase,'idle');assert.equal(h.received.at(-1)!.hints,1);assert.ok(h.received.at(-1)!.hintCell);assert.equal(h.confirmed.length,1);h.sync.dispose();
 });
 it('handles the old hint committing after a recovery GET by replaying the original receipt key',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const gate=deferred<DailyReply>();let h:Awaited<ReturnType<typeof session>>;
  h=await session(async intent=>{if(h.calls.length===1)return gate.promise;if(!intent){const before=await h.send(null);gate.resolve(await h.send(h.hint));return before;}return h.send(intent);});
  const pending=h.sync.act(h.hint);t.mock.timers.tick(DAILY_REQUEST_TIMEOUT);await pending;await h.sync.retry();await settle();assert.equal(h.received.at(-1)!.hints,1);assert.equal((await h.game.dailyState('alice',h.daily.id)).hints,1);assert.equal(h.confirmed.length,1);h.sync.dispose();
 });
 it('checks an accepted word without resending it and confirms completion only from the server',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});let h:Awaited<ReturnType<typeof session>>;
  h=await session(async intent=>{const reply=await h.send(intent);if(h.calls.length===1)return new Promise<DailyReply>(()=>{});return reply;});
  const pending=h.sync.act(h.claim);await settle();t.mock.timers.tick(DAILY_REQUEST_TIMEOUT);await pending;await h.sync.retry();assert.equal(h.calls.length,2);assert.equal(h.calls[1]!.intent,null);assert.equal(h.received.at(-1)!.strokes.length,1);assert.equal(h.confirmed.length,1);h.sync.dispose();
 });
 it('keeps failed checks retryable and does not resend a definitively rejected mutation',async()=>{
  let h:Awaited<ReturnType<typeof session>>;
  h=await session(async intent=>{if(intent)throw new DailyRequestError('Üç ipucunu da kullandın.',400);if(h.calls.length===2)throw new Error('Read failed');return h.send(null);});
  await h.sync.act(h.hint);await h.sync.retry();assert.equal(h.phase,'uncertain');await h.sync.retry();assert.equal(h.phase,'idle');assert.equal(h.calls.filter(c=>c.intent).length,1);assert.equal(h.confirmed.length,0);h.sync.dispose();
 });
 it('retains the original hint key when retry rejection cannot disprove an earlier uncertain mutation',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const gate=deferred<DailyReply>();let h:Awaited<ReturnType<typeof session>>,rejectRetries=true;
  h=await session(async intent=>{if(h.calls.length===1)return gate.promise;if(intent&&rejectRetries)throw new DailyRequestError('Biraz sonra yeniden dene.',429);return h.send(intent);});
  const first=h.sync.act(h.hint);t.mock.timers.tick(DAILY_REQUEST_TIMEOUT);await first;
  for(let i=0;i<2;i++){await h.sync.retry();assert.equal(h.phase,'uncertain');const count=h.calls.length;await h.sync.act({kind:'hint',requestId:key(2)});assert.equal(h.calls.length,count);}
  assert.equal((await h.game.dailyState('alice',h.daily.id)).hints,0);
  gate.resolve(await h.send(h.hint));await settle();rejectRetries=false;await h.sync.retry();
  assert.equal(h.phase,'idle');assert.equal(h.confirmed.length,1);assert.equal((await h.game.dailyState('alice',h.daily.id)).hints,1);
  assert.ok(h.calls.filter(c=>c.intent).every(c=>c.intent?.kind==='hint'&&c.intent.requestId===key(1)));h.sync.dispose();
 });
 for(const change of ['dispose','owner'])it('ignores old completion and releases a pending promise on '+change,async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const gate=deferred<DailyReply>(),h=await session(()=>gate.promise);const pending=h.sync.act(h.hint);const before=h.states.length;
  if(change==='dispose')h.sync.dispose();else h.retire();t.mock.timers.tick(DAILY_REQUEST_TIMEOUT);await pending;gate.resolve({...h.daily,hints:1,hintCell:[0,0]});await settle();assert.equal(h.received.length,0);assert.equal(h.confirmed.length,0);assert.equal(h.states.length,before);
 });
 it('blocks owner errors and rejects mismatched or malformed replies before applying them',async()=>{
  const wrong=await session(async()=>{throw new DailyRequestError('Changed',409,'DAILY_OWNER_CHANGED');});await wrong.sync.act(wrong.hint);assert.equal(wrong.phase,'account-changed');await wrong.sync.retry();assert.equal(wrong.calls.length,1);assert.equal(wrong.received.length,0);wrong.sync.dispose();
  for(const mutate of [(r:DailyReply)=>({...r,id:'another'}),(r:DailyReply)=>({...r,day:'2026-10-29'}),(r:DailyReply)=>({...r,finished:undefined}),(r:DailyReply)=>({...r,starts:NaN}),(r:DailyReply)=>({...r,strokes:[null]})]){
   let h:Awaited<ReturnType<typeof session>>;h=await session(async()=>mutate(h.daily) as DailyReply);await h.sync.act(h.hint);assert.equal(h.phase,'unavailable');assert.equal(h.received.length,0);h.sync.dispose();
  }
 });
});
