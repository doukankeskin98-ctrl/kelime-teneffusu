import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures.ts';
import {GameService,GameError,type Database,type Statement,type RoomView} from '../lib/game/server.ts';

export function measuredDatabase(db:Database){
 const statements:string[]=[],originals=new WeakMap<Statement,Statement>(),sqls=new WeakMap<Statement,string>();
 const wrap=(statement:Statement,sql:string):Statement=>{
  const wrapped:Statement={bind:(...args)=>wrap(statement.bind(...args),sql),first:async<T>()=>{statements.push(sql);return statement.first<T>();},all:async<T>()=>{statements.push(sql);return statement.all<T>();},run:async()=>{statements.push(sql);return statement.run();}};
  originals.set(wrapped,statement);sqls.set(wrapped,sql);return wrapped;
 };
 return {statements,db:{prepare:(sql:string)=>wrap(db.prepare(sql),sql),batch:async(stmts:Statement[])=>{statements.push(...stmts.map(s=>sqls.get(s)!));return db.batch(stmts.map(s=>originals.get(s)!));}}};
}
async function active(){
 const f=fixture(),m=measuredDatabase(f.db),game=new GameService(m.db,f.clock);
 const r=(await game.enter('capacity-a','friend',undefined,true))!;await game.enter('capacity-b','friend',r.code);
 await game.ready('capacity-a',r.id,1);await game.ready('capacity-b',r.id,1);await game.start('capacity-a',r.id,1);f.advance(5000);
 const view=(await game.state('capacity-a',r.id))!;m.statements.length=0;
 return {...f,...m,game,id:r.id,view};
}
test('unchanged native poll reads active membership once; heartbeat refreshes moderated names and presence',async()=>{
 const f=await active();try{
  const rowBefore=f.room(f.id),v=await f.game.poll('capacity-a',f.id,f.view.revision);
  assert.deepEqual(v,{unchanged:true,id:f.id,revision:f.view.revision,serverNow:f.clock()});assert.equal(f.statements.length,1);assert.match(f.statements[0]!,/JOIN members/);assert.deepEqual(f.room(f.id),rowBefore);
  f.sqlite.prepare('INSERT INTO player_restrictions(user_id,name_locked,created) VALUES(?,1,?)').run('capacity-b',f.clock());
  f.advance(5001);const fresh=await f.game.poll('capacity-a',f.id,f.view.revision) as RoomView;
  assert.equal(fresh.opponent?.name,'Oyuncu');assert(fresh.revision>f.view.revision);assert.equal(f.room(f.id).players.find(p=>p.id==='capacity-a')!.seen,f.clock());
 }finally{f.sqlite.close();}
});
test('SSE skip is private and changed words always return fresh owner-specific state',async()=>{
 const f=await active();try{
  assert.equal((await f.game.watch('capacity-a',f.id,f.view.revision)).view,null);assert.equal(f.statements.length,1);
  await assert.rejects(()=>f.game.watch('outsider',f.id,f.view.revision),e=>e instanceof GameError&&e.status===403);
  await assert.rejects(()=>f.game.poll('outsider',f.id,f.view.revision),e=>e instanceof GameError&&e.status===403);
  const p=f.puzzle(f.id).placements[0]!;const claim=await f.game.claim('capacity-b',f.id,p.a,p.b,1);assert.equal(claim.you.strokes.length,1);
  const next=await f.game.poll('capacity-a',f.id,f.view.revision) as RoomView;assert.equal(next.you.strokes.length,0);assert.equal(next.opponent?.count,1);assert(next.revision>f.view.revision);
 }finally{f.sqlite.close();}
});
test('unchanged revision cannot skip a deadline or active lease expiry',async()=>{
 const f=await active();try{
  f.setTime(f.view.ends!+1);const end=await f.game.poll('capacity-a',f.id,f.view.revision) as RoomView;
  assert.equal(end.phase,'finished');assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM results').get()!['n'],2);
  f.statements.length=0;f.advance(5001);await f.game.state('capacity-a',f.id);
  assert.equal(f.statements.filter(s=>/INSERT.*results|UPDATE ratings|rating_events/.test(s)).length,0,'finished heartbeat does not reissue terminal awards');
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM results').get()!['n'],2);
  f.sqlite.prepare('UPDATE rooms SET expires=? WHERE id=?').run(f.clock()-1,f.id);
  assert(!('unchanged' in (await f.game.poll('capacity-a',f.id,end.revision))!));
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM members WHERE user_id=? AND active=1').get('capacity-a')!['n'],0);
 }finally{f.sqlite.close();}
});
test('native poll follows a newer active membership and never returns a false unchanged old room',async()=>{
 const f=await active();try{
  await f.game.leave('capacity-a',f.id,1);const newer=(await f.game.enter('capacity-a','friend',undefined,true))!;
  const result=await f.game.poll('capacity-a',f.id,f.view.revision) as RoomView;assert.equal(result.id,newer.id);assert.equal(result.you.id,'capacity-a');assert(!('unchanged' in result));
 }finally{f.sqlite.close();}
});
test('full round-one view uses one moderation query and old state clients remain supported',async()=>{
 const f=await active();try{
  const full=await f.game.state('capacity-a',f.id);assert.equal(full?.you.id,'capacity-a');assert(full?.board);assert(!('unchanged' in full!));
  assert.equal(f.statements.filter(s=>s.includes('FROM player_restrictions')).length,1);
 }finally{f.sqlite.close();}
});

test('64 waiting candidates use one block graph query and still form an authorized pair',async()=>{
 const f=fixture(),m=measuredDatabase(f.db),game=new GameService(m.db,f.clock);
 try{
  const template=(await f.game.enter('seed-host','friend',undefined,true))!;const original=f.room(template.id);
  f.sqlite.prepare('UPDATE members SET active=0').run();
  for(let n=0;n<64;n++){
   const id='00000000-0000-4000-8000-'+String(n).padStart(12,'0'),user='candidate-'+n;
   const room={...original,id,code:'QUEUE'+n,kind:'quick',phase:'waiting',roundPolicy:'words',players:[{...original.players[0]!,id:user,name:user}]};
   f.sqlite.prepare('INSERT INTO rooms(id,code,kind,phase,data,revision,expires,updated) VALUES(?,?,?,?,?,0,?,?)').run(id,room.code,room.kind,room.phase,JSON.stringify(room),f.clock()+60000,f.clock());
   f.sqlite.prepare('INSERT INTO members(room_id,user_id,active) VALUES(?,?,1)').run(id,user);
  }
  const view=await game.state('candidate-0');assert.equal(view?.phase,'ready');assert.equal(view?.players?.length,2);
  assert.equal(m.statements.filter(s=>s.includes('FROM player_blocks')).length,1);
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM members WHERE active=1 AND user_id=?').get('candidate-0')!['n'],1);
 }finally{f.sqlite.close();}
});
