import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures.ts';
import {GameService,GameError} from '../lib/game/server.ts';

async function group(count=4,quick=false){
 const s=fixture(),users=Array.from({length:count},(_,i)=>'series-'+i);
 const views=quick?await Promise.all(users.map(u=>s.game.enter(u,'quick',undefined,true))):[await s.game.enter(users[0]!,'friend',undefined,true)];
 const first=views[0]!;
 if(!quick)await Promise.all(users.slice(1).map(u=>s.game.enter(u,'friend',first.code)));
 return {...s,users,id:first.id,code:first.code};
}
async function start(s:Awaited<ReturnType<typeof group>>,round:number){await Promise.all(s.users.map(u=>s.game.ready(u,s.id,round)));const v=await s.game.start(s.room(s.id).players.find(p=>!p.left)!.id,s.id,round);s.advance(4000);return v;}
async function win(s:Awaited<ReturnType<typeof group>>,who:string,round:number){for(const p of s.puzzle(s.id).placements)await s.game.claim(who,s.id,p.a,p.b,round);return (await s.game.state(who,s.id))!;}

describe('public quick groups share one authoritative lobby',()=>{
 it('does not revive a stale deterministic slot and hands an online lobby past its disconnected host',async()=>{
  const s=fixture(),old=await s.game.enter('stale-host','quick',undefined,true);s.advance(20000);const fresh=await s.game.enter('fresh-host','quick',undefined,true);assert.notEqual(fresh?.id,old?.id);
  const joined=await s.game.enter('fresh-guest','friend',fresh!.code);assert.equal(joined?.id,fresh!.id);s.advance(31000);
  await s.game.state('fresh-guest');await s.game.enter('third','friend',fresh!.code);await s.game.ready('fresh-guest',fresh!.id,1);await s.game.ready('third',fresh!.id,1);
  const view=(await s.game.state('fresh-guest'))!;assert.equal(view.hostId,'fresh-guest');assert.equal(view.canStart,true);
  const active=await s.game.start('fresh-guest',fresh!.id,1);assert.equal(active.players?.length,2);assert.equal(active.players?.some(p=>p.id==='fresh-host'),false);assert.equal(await s.game.state('fresh-host'),null);
 });
 for(const count of [4,8,16])it(count+' simultaneous players converge without a two-person closure',async()=>{
  const s=await group(count,true),states=await Promise.all(s.users.map(u=>s.game.state(u)));
  assert.equal(new Set(states.map(v=>v?.id)).size,1);assert(states.every(v=>v?.mode==='group'&&v.players?.length===count&&v.phase==='ready'));
  assert.equal(s.sqlite.prepare('SELECT COUNT(*) n FROM members WHERE active=1').get()!['n'],count);
  const active=await start(s,1);assert.equal(active.phase,'active');
  const all=await Promise.all(s.users.map(u=>s.game.state(u)));assert(all.every(v=>v?.starts===active.starts&&JSON.stringify(v.board)===JSON.stringify(active.board)));
  await assert.rejects(()=>s.game.enter('late','friend',s.code),e=>e instanceof GameError&&e.status===409);
  const next=await s.game.enter('other-quick','quick',undefined,true);assert.notEqual(next?.id,s.id);
 });
 it('keeps ranked duel queues separate and a two-player public group unranked',async()=>{
  const s=await group(2,true),d1=await s.game.enter('duel-a','quick'),d2=await s.game.enter('duel-b','quick');assert.equal(d1?.mode,'duel');assert.equal(d2?.id,d1?.id);assert.notEqual(d1?.id,s.id);
  await start(s,1);await win(s,s.users[0]!,1);assert.equal(s.sqlite.prepare('SELECT COUNT(*) n FROM rating_events').get()!['n'],0);
  await s.game.ready('duel-a',d1!.id,1);await s.game.ready('duel-b',d1!.id,1);s.advance(4000);
  for(const p of s.puzzle(d1!.id).placements)await s.game.claim('duel-a',d1!.id,p.a,p.b,1);
  assert.equal(s.sqlite.prepare('SELECT COUNT(*) n FROM rating_events').get()!['n'],1);
 });
 it('respects ready/start revision races and does not silently add a late entrant to an active round',async()=>{
  const s=await group(4,true);await Promise.all(s.users.map(u=>s.game.ready(u,s.id,1)));
  const outcomes=await Promise.allSettled([s.game.start(s.room(s.id).players[0]!.id,s.id,1),s.game.enter('racing-guest','friend',s.code)]),r=s.room(s.id);
  if(r.phase==='active')assert.equal(r.players.length,4);else{assert.equal(r.phase,'ready');assert.equal(r.players.length,5);assert.equal(r.players.find(p=>p.id==='racing-guest')?.ready,false);}
  assert(outcomes.some(x=>x.status==='fulfilled'));assert.equal(s.sqlite.prepare('SELECT COUNT(*) n FROM members WHERE active=1 AND user_id=?').get('racing-guest')!['n'],r.players.some(p=>p.id==='racing-guest')?1:0);
 });
});

describe('room series comes only from durable terminal receipts',()=>{
 it('keeps wins and draws across rounds, duplicate next, departures, new members and service restarts',async()=>{
  const s=await group(),a=s.users[0]!,b=s.users[1]!,departing=s.users[3]!;
  await start(s,1);let v=await win(s,a,1);assert.equal(v.series?.players.find(p=>p.id===a)?.wins,1);
  await Promise.all(s.users.map(u=>s.game.nextGame(u,s.id,1)));assert.equal(s.room(s.id).round,2);
  await start(s,2);await win(s,b,2);await Promise.all([s.game.state(a,s.id),s.game.state(b,s.id),s.game.nextGame(a,s.id,2),s.game.nextGame(b,s.id,2)]);
  await start(s,3);s.advance(120001);v=(await s.game.state(a,s.id))!;assert.equal(v.winner,null);assert.equal(v.series?.rounds,3);
  assert(v.series?.players.every(p=>p.played===3&&p.draws===1));assert.equal(v.series?.players.find(p=>p.id===a)?.wins,1);assert.equal(v.series?.players.find(p=>p.id===b)?.wins,1);
  await s.game.leave(departing,s.id,3);await s.game.nextGame(a,s.id,3);await s.game.enter('newcomer','friend',s.code);
  const restarted=new GameService(s.db,s.clock);v=(await restarted.state(a,s.id))!;assert.equal(v.series?.rounds,3);assert.equal(v.series?.players.find(p=>p.id===departing)?.active,false);assert.equal(v.series?.players.find(p=>p.id==='newcomer')?.wins,0);assert.equal(v.series?.players.find(p=>p.id==='newcomer')?.played,0);
  assert.equal(v.series?.players.find(p=>p.id===a)?.rank,v.series?.players.find(p=>p.id===b)?.rank);assert.equal(s.sqlite.prepare('SELECT COUNT(*) n FROM results').get()!['n'],12);
 });
 it('does not include receipts from a finish newer than the returned room snapshot or infer missing legacy rounds',async()=>{
  const s=await group(2);await start(s,1);await win(s,s.users[0]!,1);await s.game.nextGame(s.users[0]!,s.id,1);await start(s,2);
  // A concurrent terminal transaction may become visible after the room row was read.
  for(const u of s.users)s.sqlite.prepare('INSERT INTO results(room_id,user_id,nickname,score,win,created) VALUES(?,?,?,?,?,?)').run(s.id+':2',u,u,100,Number(u===s.users[1]),s.clock());
  const restarted=new GameService(s.db,s.clock),v=(await restarted.state(s.users[0]!,s.id))!;assert.equal(v.phase,'active');assert.equal(v.series?.rounds,1);assert.equal(v.series?.players.find(p=>p.id===s.users[1])?.wins,0);
  const old=s.room(s.id);old.round=20;s.sqlite.prepare('UPDATE rooms SET data=? WHERE id=?').run(JSON.stringify(old),s.id);const restored=(await new GameService(s.db,s.clock).state(s.users[0]!,s.id))!;assert.equal(restored.series?.rounds,2);assert.notEqual(restored.series?.rounds,19);
 });
});
