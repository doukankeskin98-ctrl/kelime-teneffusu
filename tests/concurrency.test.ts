import {it} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures.ts';
it('keeps twelve simultaneous ranked duels isolated without lost moves, duplicate ratings or queue stranding',async()=>{
 const s=fixture(),users=Array.from({length:24},(_,i)=>'player-'+i);
 await Promise.all(users.map(id=>s.game.enter(id,'quick')));
 for(let attempt=0;attempt<3;attempt++)await Promise.all(users.map(id=>s.game.state(id)));
 const states=await Promise.all(users.map(id=>s.game.state(id)));assert(states.every(r=>r?.phase==='ready'));const ids=[...new Set(states.map(r=>r!.id))];assert.equal(ids.length,12);
 for(const id of ids){const room=s.room(id);await Promise.all(room.players.map(p=>s.game.ready(p.id,id,1)));}
 s.advance(4000);
 await Promise.all(ids.map(async id=>{const room=s.room(id),board=s.puzzle(id);await Promise.all(room.players.map(p=>s.game.claim(p.id,id,board.placements[0]!.a,board.placements[0]!.b,1)));for(const target of board.placements.slice(1))await s.game.claim(room.players[0]!.id,id,target.a,target.b,1);}));
 const final=await Promise.all(users.map(id=>s.game.state(id)));assert(final.every(r=>r?.phase==='finished'));
 const count=s.sqlite.prepare('SELECT COUNT(*) AS n FROM results').get() as {n:number};assert.equal(count.n,24);
 for(const user of users)assert.equal((await s.game.rating(user)).played,1);
 const memberships=s.sqlite.prepare('SELECT user_id,COUNT(*) AS n FROM members WHERE active=1 GROUP BY user_id').all() as {n:number}[];assert(memberships.every(m=>m.n===1));
});
