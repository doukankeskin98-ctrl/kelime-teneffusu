import {it} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures.ts';

it('quick group starts once after all ready, shares a five-second deadline and fences early claims',async()=>{
 const s=fixture();
 try{
  const first=(await s.game.enter('auto-a','quick',undefined,true))!;
  const second=(await s.game.enter('auto-b','quick',undefined,true))!;
  assert.equal(second.id,first.id);
  const ready=await s.game.ready('auto-a',first.id,1);assert.equal(ready.phase,'ready');assert.equal(ready.starts,null);
  const active=await s.game.ready('auto-b',first.id,1);assert.equal(active.phase,'active');assert.equal(active.starts,s.clock()+5000);
  const retry=await s.game.ready('auto-b',first.id,1);assert.equal(retry.starts,active.starts);
  const other=(await s.game.state('auto-a'))!;assert.equal(other.starts,active.starts);assert.deepEqual(other.board,active.board);
  const target=s.puzzle(first.id).placements[0]!;
  await assert.rejects(()=>s.game.claim('auto-a',first.id,target.a,target.b,1));
  s.advance(5000);assert.equal((await s.game.claim('auto-a',first.id,target.a,target.b,1)).you.strokes.length,1);
 }finally{s.sqlite.close();}
});
it('private group retains explicit host start; a quick player who left cannot trigger a countdown',async()=>{
 const s=fixture();try{
  const privateRoom=(await s.game.enter('host','friend',undefined,true))!;
  await s.game.enter('friend','friend',privateRoom.code);
  await s.game.ready('host',privateRoom.id,1);assert.equal((await s.game.ready('friend',privateRoom.id,1)).phase,'ready');
  assert.equal((await s.game.start('host',privateRoom.id,1)).phase,'active');
  const quick=(await s.game.enter('one','quick',undefined,true))!;await s.game.enter('two','quick',undefined,true);
  await s.game.ready('one',quick.id,1);await s.game.leave('two',quick.id,1);
  await assert.rejects(()=>s.game.ready('two',quick.id,1));assert.notEqual(s.room(quick.id).phase,'active');
 }finally{s.sqlite.close();}
});

it('last unready member leaving or timing out cannot strand ready players or create phantom receipts',async()=>{
 for(const stale of [false,true]){
  const s=fixture();try{
   const room=(await s.game.enter('a','quick',undefined,true))!;
   await s.game.enter('b','quick',undefined,true);await s.game.enter('c','quick',undefined,true);
   await s.game.ready('a',room.id,1);await s.game.ready('b',room.id,1);
   if(stale){s.advance(20000);await s.game.state('a');await s.game.state('b');s.advance(10001);}
   else await s.game.leave('c',room.id,1);
   const started=(await s.game.state('a'))!;
   assert.equal(started.phase,'active');assert.equal(started.starts,s.clock()+5000);
   assert.equal((await s.game.state('b'))!.starts,started.starts);
   assert.deepEqual(started.players!.map(p=>p.id).sort(),['a','b']);
   assert.equal(s.sqlite.prepare('SELECT COUNT(*) AS n FROM arena_seen WHERE user_id=?').get('c')!['n'],0);
   const membership=s.sqlite.prepare('SELECT active FROM members WHERE room_id=? AND user_id=?').get(room.id,'c');assert.equal(membership!['active'],0);
  }finally{s.sqlite.close();}
 }
});
