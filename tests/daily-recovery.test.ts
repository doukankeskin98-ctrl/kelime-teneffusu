// Same-tab write-ahead recovery with real GameService/SQLite, not a browser/device test.
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {fixture} from './fixtures.ts';
import {GameService,GameError,type Database,type Statement} from '../lib/game/server.ts';
import {dailySpec,makePuzzle} from '../lib/game/engine.ts';
import {DailyActionSession,DailyRequestError,DailyPersistenceError,type DailyReply,type DailyIntent,type DailyActionState} from '../lib/game/daily-action.ts';
import {dailyIntentKey,dailyIntentStore,readDailyPending} from '../lib/game/daily-pending.ts';
const key=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const hint=(n=1):DailyIntent=>({kind:'hint',requestId:key(n)});
function tab(){const values=new Map<string,string>();return{values,failRead:false,failWrite:false,failClear:false,getItem(k:string){if(this.failRead)throw new Error('getItem failed');return values.get(k)??null;},setItem(k:string,v:string){if(this.failWrite)throw new Error('setItem failed');values.set(k,v);},removeItem(k:string){if(this.failClear)throw new Error('removeItem failed');values.delete(k);}};}
function gate<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
const settle=async()=>{for(let i=0;i<24;i++)await Promise.resolve();};
async function setup(){const f=fixture(Date.parse('2026-10-28T08:00Z')),daily=await f.game.daily('alice'),s=dailySpec(daily.day),board=makePuzzle(s.themeId,s.level,s.seed);return{...f,daily,board};}
type Setup=Awaited<ReturnType<typeof setup>>;
function session(f:Setup,storage:ReturnType<typeof tab>,request?:(intent:DailyIntent|null)=>Promise<DailyReply>){
 const calls:(DailyIntent|null)[]=[],received:DailyReply[]=[],confirmed:DailyIntent[]=[],states:DailyActionState[]=[],journal=dailyIntentStore(()=>storage,'alice',f.daily);
 const send=async(intent:DailyIntent|null):Promise<DailyReply>=>{try{return intent?intent.kind==='hint'?await f.game.dailyClaim('alice',f.daily.id,null,null,true,intent.requestId):await f.game.dailyClaim('alice',f.daily.id,intent.stroke.a,intent.stroke.b):await f.game.dailyState('alice',f.daily.id);}catch(e){if(e instanceof GameError)throw new DailyRequestError(e.message,e.status,e.code);throw e;}};
 const sync=new DailyActionSession({id:f.daily.id,day:f.daily.day,board:f.daily.board,isCurrent:()=>true,persistence:journal,request:async intent=>{calls.push(intent);return request?request(intent):send(intent);},receive:r=>received.push(r),state:s=>states.push(s),confirmed:i=>confirmed.push(i)});
 return{sync,journal,send,calls,received,confirmed,states,get phase(){return states.at(-1)?.phase;}};
}

describe('tab-scoped daily write-ahead recovery',()=>{
 it('records before sending and restores an accepted hint without inferring success from its count',async()=>{
  const f=await setup(),storage=tab();let first:ReturnType<typeof session>;
  first=session(f,storage,async intent=>{assert.deepEqual(readDailyPending(()=>storage,'alice')?.intent,intent);await first.send(intent);throw new Error('Response lost');});
  await first.sync.act(hint());assert.equal(first.phase,'uncertain');first.sync.dispose();
  const next=session(f,storage);await next.sync.restore();assert.deepEqual(next.calls,[null]);assert.equal(next.phase,'uncertain');assert.equal(next.received.at(-1)!.hints,1);assert.equal(next.confirmed.length,0);assert.ok(next.journal.read());
  await next.sync.retry();assert.deepEqual(next.calls,[null,null,hint()]);assert.equal(next.phase,'idle');assert.equal(next.confirmed.length,1);assert.equal((await f.game.dailyState('alice',f.daily.id)).hints,1);assert.equal(next.journal.read(),null);next.sync.dispose();
 });
 it('keeps the original key through reload, retry429, another reload and a late original commit',async()=>{
  const f=await setup(),storage=tab(),oldGate=gate<DailyReply>(),first=session(f,storage,()=>oldGate.promise),flight=first.sync.act(hint());first.sync.dispose();await flight;
  let next:ReturnType<typeof session>;next=session(f,storage,async intent=>{if(intent)throw new DailyRequestError('Slow down',429);return next.send(null);});
  await next.sync.restore();await next.sync.retry();assert.equal(next.phase,'uncertain');assert.deepEqual(next.journal.read(),hint());next.sync.dispose();
  await f.game.dailyClaim('alice',f.daily.id,null,null,true,key(1));oldGate.resolve(await f.game.dailyState('alice',f.daily.id));await settle();assert.equal(first.received.length,0);
  const reopened=session(f,storage);await reopened.sync.restore();const before=reopened.calls.length;await reopened.sync.act(hint(2));assert.equal(reopened.calls.length,before);await reopened.sync.retry();assert.equal(reopened.phase,'idle');assert.equal((await f.game.dailyState('alice',f.daily.id)).hints,1);assert.equal(reopened.journal.read(),null);reopened.sync.dispose();
 });
 it('reconciles an already accepted claim on restore without sending it again',async()=>{
  const f=await setup(),storage=tab(),p=f.board.placements[0]!,intent:DailyIntent={kind:'claim',stroke:{id:p.id,a:p.a,b:p.b},label:p.label};let first:ReturnType<typeof session>;
  first=session(f,storage,async i=>{await first.send(i);throw new Error('Lost');});await first.sync.act(intent);first.sync.dispose();
  const next=session(f,storage);await next.sync.restore();assert.deepEqual(next.calls,[null]);assert.equal(next.phase,'idle');assert.equal(next.journal.read(),null);assert.equal(next.received.at(-1)!.strokes.length,1);next.sync.dispose();
 });
 it('does not send when persistence fails and supports read/write recovery with the same intent',async()=>{
  const f=await setup(),storage=tab(),h=session(f,storage);storage.failRead=true;await h.sync.restore();await h.sync.act(hint());assert.equal(h.phase,'storage-error');assert.equal(h.calls.length,0);storage.failRead=false;await h.sync.retry();assert.equal(h.phase,'idle');
  storage.failWrite=true;await h.sync.act(hint());assert.equal(h.phase,'storage-error');assert.equal(h.calls.length,0);storage.failWrite=false;await h.sync.retry();assert.equal(h.phase,'idle');assert.equal((await f.game.dailyState('alice',f.daily.id)).hints,1);assert.equal(h.journal.read(),null);h.sync.dispose();
 });
 it('requires matching write readback before any mutation is sent',async()=>{
  const f=await setup(),storage=tab(),write=storage.setItem;storage.setItem=()=>{};const h=session(f,storage);await h.sync.act(hint());assert.equal(h.phase,'storage-error');assert.equal(h.calls.length,0);storage.setItem=write;await h.sync.retry();assert.equal(h.phase,'idle');assert.equal((await f.game.dailyState('alice',f.daily.id)).hints,1);h.sync.dispose();
 });
 it('retains a confirmed operation on failed clear, blocks a new key and safely clears after retry',async()=>{
  const f=await setup(),storage=tab(),h=session(f,storage);storage.failClear=true;await h.sync.act(hint());assert.equal(h.phase,'storage-error');assert.equal(h.received.at(-1)!.hints,1);assert.equal(h.confirmed.length,0);const before=h.calls.length;await h.sync.act(hint(2));assert.equal(h.calls.length,before);assert.deepEqual(h.journal.read(),hint());
  storage.failClear=false;await h.sync.retry();assert.equal(h.phase,'idle');assert.equal(h.confirmed.length,1);assert.equal((await f.game.dailyState('alice',f.daily.id)).hints,1);assert.equal(h.journal.read(),null);h.sync.dispose();
 });
 it('clears a first definitive rejection before reload without weakening uncertain retry guards',async()=>{
  const f=await setup(),storage=tab();for(let i=0;i<3;i++)await f.game.dailyClaim('alice',f.daily.id,null,null,true);
  const h=session(f,storage);await h.sync.act(hint());assert.equal(h.phase,'uncertain');assert.equal(h.journal.read(),null);h.sync.dispose();const next=session(f,storage);await next.sync.restore();assert.equal(next.phase,'idle');assert.equal(next.calls.length,0);next.sync.dispose();
 });
 it('unblocks a restored unknown key only after the explicit terminal quota result and a count check',async()=>{
  const f=await setup(),storage=tab(),first=session(f,storage,async()=>{throw new Error('Lost before reply');});await first.sync.act(hint());first.sync.dispose();for(let i=0;i<3;i++)await f.game.dailyClaim('alice',f.daily.id,null,null,true);
  const next=session(f,storage);await next.sync.restore();await next.sync.retry();assert.equal(next.phase,'uncertain');assert.equal(next.journal.read(),null);await next.sync.retry();assert.equal(next.phase,'idle');assert.equal(next.received.at(-1)!.hints,3);assert.equal(next.confirmed.length,0);next.sync.dispose();
 });
 it('keeps another owner or operation intact and fails closed on corrupt, wrong-board or invalid claim data',async()=>{
  const f=await setup(),storage=tab(),a=dailyIntentStore(()=>storage,'alice',f.daily),b=dailyIntentStore(()=>storage,'bob',f.daily);a.save(hint());assert.equal(b.read(),null);b.save(hint(2));b.clear(hint(2));assert.deepEqual(a.read(),hint());assert.throws(()=>a.save(hint(2)),DailyPersistenceError);assert.throws(()=>a.clear(hint(2)),DailyPersistenceError);assert.deepEqual(a.read(),hint());
  const raw=storage.getItem(dailyIntentKey('alice'))!;for(const change of [()=>'{bad',()=>JSON.stringify({...JSON.parse(raw),owner:'bob'}),()=>JSON.stringify({...JSON.parse(raw),day:'2026-02-30'}),()=>JSON.stringify({...JSON.parse(raw),signature:'wrong'}),()=>JSON.stringify({...JSON.parse(raw),intent:{kind:'claim',stroke:{id:'bad',a:[0,0],b:[0,0]},label:'fake'}})]){
   storage.values.set(dailyIntentKey('alice'),change());const h=session(f,storage);await h.sync.restore();assert.equal(h.phase,'storage-error');await h.sync.act(hint(3));assert.equal(h.calls.length,0);assert.ok(storage.values.has(dailyIntentKey('alice')));h.sync.dispose();
  }
 });
 it('preserves the original day descriptor across midnight and rejects replay into a new daily',async()=>{
  const f=await setup(),storage=tab(),a=dailyIntentStore(()=>storage,'alice',f.daily);a.save(hint());f.advance(26*3600000);const next=await f.game.daily('alice');assert.notEqual(next.id,f.daily.id);assert.equal(readDailyPending(()=>storage,'alice')!.id,f.daily.id);assert.equal(readDailyPending(()=>storage,'alice')!.day,f.daily.day);assert.throws(()=>dailyIntentStore(()=>storage,'alice',next).read(),DailyPersistenceError);assert.deepEqual(a.read(),hint());
  const h=session(f,storage);await h.sync.restore();await h.sync.retry();assert.equal(h.phase,'expired');assert.equal(a.read(),null);assert.equal((await f.game.dailyState('alice',f.daily.id)).hints,0);const count=h.calls.length;await h.sync.act(hint(2));assert.equal(h.calls.length,count);h.sync.dispose();
 });
});

function holdWrite(f:Setup,sqlPrefix:string){
 const ready=gate<void>(),release=gate<void>(),changes:number[]=[];let held=false;
 const wrap=(s:Statement,sql:string):Statement=>({bind:(...args:unknown[])=>wrap(s.bind(...args),sql),first:<T>()=>s.first<T>(),all:<T>()=>s.all<T>(),run:async()=>{if(!held&&sql.startsWith(sqlPrefix)){held=true;ready.resolve();await release.promise;const r=await s.run();changes.push(r.meta.changes);return r;}return s.run();}});
 const db:Database={prepare:sql=>wrap(f.db.prepare(sql),sql),batch:statements=>f.db.batch(statements)};return{game:new GameService(db,f.clock),ready:ready.promise,release:()=>release.resolve(),changes};
}
const expired=(e:unknown)=>e instanceof GameError&&e.status===409&&e.code==='DAILY_EXPIRED';
describe('terminal daily results preserve CAS and accepted receipts',()=>{
 it('fences a delayed pre-expiry mutation without altering the saved daily JSON',async()=>{
  const f=await setup();f.advance(86400000-1);const old=holdWrite(f,'UPDATE dailies SET data='),flight=old.game.dailyClaim('alice',f.daily.id,null,null,true,key(1));await old.ready;f.advance(2);const before=(f.sqlite.prepare('SELECT data FROM dailies WHERE id=?').get(f.daily.id) as any).data;
  await assert.rejects(()=>f.game.dailyClaim('alice',f.daily.id,null,null,true,key(1)),expired);old.release();await assert.rejects(()=>flight,expired);assert.equal(old.changes[0],0);assert.equal((f.sqlite.prepare('SELECT data FROM dailies WHERE id=?').get(f.daily.id) as any).data,before);assert.equal((await f.game.dailyState('alice',f.daily.id)).hints,0);
 });
 it('reloads the accepted same-key receipt if a pre-expiry writer wins the fence race',async()=>{
  const f=await setup();f.advance(86400000-1);const old=holdWrite(f,'UPDATE dailies SET data='),flight=old.game.dailyClaim('alice',f.daily.id,null,null,true,key(1));await old.ready;f.advance(2);const fence=holdWrite(f,'UPDATE dailies SET revision='),check=fence.game.dailyClaim('alice',f.daily.id,null,null,true,key(1));await fence.ready;old.release();const accepted=await flight;fence.release();const replay=await check as DailyReply;assert.equal(fence.changes[0],0);assert.equal(replay.hints,1);assert.deepEqual(replay.hintCell,(accepted as DailyReply).hintCell);assert.equal('hintReceipts' in replay,false);
 });
 it('cannot add an old unknown key after a different key takes the final hint',async()=>{
  const f=await setup();for(let i=0;i<2;i++)await f.game.dailyClaim('alice',f.daily.id,null,null,true);const old=holdWrite(f,'UPDATE dailies SET data='),flight=old.game.dailyClaim('alice',f.daily.id,null,null,true,key(1));await old.ready;await f.game.dailyClaim('alice',f.daily.id,null,null,true,key(2));
  const limit=(e:unknown)=>e instanceof GameError&&e.status===400&&e.code==='DAILY_HINT_LIMIT';await assert.rejects(()=>f.game.dailyClaim('alice',f.daily.id,null,null,true,key(1)),limit);old.release();await assert.rejects(()=>flight,limit);assert.equal(old.changes[0],0);assert.equal((await f.game.dailyClaim('alice',f.daily.id,null,null,true,key(2))).hints,3);assert.equal((await f.game.dailyState('alice',f.daily.id)).hints,3);
 });
});
