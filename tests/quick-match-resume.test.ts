import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {fixture} from './fixtures.ts';
async function separated(policy:'words'|'mixed'='words'){
 const f=fixture();const a=(await f.game.enter('return-a','quick',undefined,true,policy))!;f.advance(20000);const b=(await f.game.enter('return-b','quick',undefined,true,policy))!;assert.notEqual(a.id,b.id);return {...f,a,b};
}
describe('quick matching recovers interrupted first-round queues',()=>{
 for(const policy of ['words','mixed'] as const)it(policy+' reconnect pairs two real users and redirects polling and old SSE watches',async()=>{
  const f=await separated(policy);try{
   const first=(await f.game.state('return-a',f.a.id))!;const peer=(await f.game.state('return-b',f.b.id))!;
   assert.equal(first.id,peer.id);assert.equal(first.phase,'ready');assert.equal(first.players!.length,2);assert.equal(first.roundPolicy,policy);assert.equal(peer.roundKind,'words');
   for(const u of ['return-a','return-b']){assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM members WHERE user_id=? AND active=1').get(u)!['n'],1);assert.equal((await f.game.enter(u,'quick',undefined,true,policy))!.id,first.id);}
   assert.equal((await f.game.watch('return-a',f.a.id)).view.id,first.id);assert.equal((await f.game.watch('return-b',f.b.id)).view.id,first.id);
   await Promise.all(['return-a','return-b'].map(u=>f.game.ready(u,first.id,1)));const game=await f.game.start(first.hostId!,first.id,1);const other=(await f.game.state('return-b'))!;assert.equal(game.phase,'active');assert.deepEqual(game.board,other.board);assert.equal(game.starts,other.starts);
  }finally{f.sqlite.close();}
 });
 it('concurrent recovery preserves exactly one membership and both users',async()=>{
  const f=await separated();try{for(let i=0;i<4;i++)await Promise.all([f.game.state('return-a',f.a.id),f.game.state('return-b',f.b.id)]);const a=(await f.game.state('return-a'))!,b=(await f.game.state('return-b'))!;assert.equal(a.id,b.id);assert.equal(a.players!.length,2);assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM members WHERE active=1').get()!['n'],2);}finally{f.sqlite.close();}
 });
 it('does not merge different policies, private rooms or played series',async()=>{
  for(const variant of ['policy','private','played'] as const){const f=fixture();try{const a=(await f.game.enter('a','quick',undefined,true,'words'))!;f.advance(20000);const b=(await f.game.enter('b',variant==='private'?'friend':'quick',undefined,true,variant==='policy'?'mixed':'words'))!;if(variant==='played'){const room=f.room(a.id);room.round=2;f.sqlite.prepare('UPDATE rooms SET data=? WHERE id=?').run(JSON.stringify(room),a.id);}const resumed=(await f.game.state('a',a.id))!;assert.notEqual(resumed.id,b.id);assert.equal(resumed.phase,'waiting');}finally{f.sqlite.close();}}
 });
 it('does not resurrect someone who explicitly left, even when their old room is requested',async()=>{
  const f=await separated();try{await f.game.leave('return-a',f.a.id,1);await f.game.state('return-a',f.a.id);assert.equal(await f.game.state('return-a'),null);assert.equal((await f.game.state('return-b'))!.phase,'waiting');}finally{f.sqlite.close();}
 });
 it('rejects a pairing if a source member leaves between read and atomic transfer',async()=>{
  const f=await separated();try{const batch=f.db.batch.bind(f.db);let raced=false;f.db.batch=async statements=>{if(!raced){raced=true;await f.game.leave('return-b',f.b.id,1);}return batch(statements);};await f.game.state('return-a',f.a.id);assert.equal(await f.game.state('return-b'),null);const a=(await f.game.state('return-a'))!;assert.equal(a.phase,'waiting');assert.equal(a.players!.filter(p=>!p.left).length,1);}finally{f.sqlite.close();}
 });
 it('ignores a stale member even when a departed client refreshed the room row',async()=>{
  const f=fixture();try{const a=(await f.game.enter('a','quick',undefined,true))!;await f.game.enter('departed','friend',a.code);await f.game.leave('departed',a.id,1);f.advance(20000);const b=(await f.game.enter('b','quick',undefined,true))!;await f.game.state('departed',a.id);const waiting=(await f.game.state('b'))!;assert.equal(waiting.id,b.id);assert.equal(waiting.phase,'waiting');assert.notEqual(waiting.id,a.id);}finally{f.sqlite.close();}
 });
 it('does not put blocked players together during recovery',async()=>{
  const f=await separated();try{f.sqlite.prepare('INSERT INTO player_blocks(user_id,blocked_id,created) VALUES(?,?,?)').run('return-a','return-b',f.clock());assert.notEqual((await f.game.state('return-a'))!.id,(await f.game.state('return-b'))!.id);}finally{f.sqlite.close();}
 });
});
