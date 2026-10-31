import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {GROUP_SIZE,GROUP_WORDS,GROUP_POOL_SIZE,GROUP_CLUE_POOL_SIZE,GROUP_CLUE_POOL,GROUP_WORD_POOL,groupPuzzle,groupRiddlePuzzle,hasGroupRiddles} from '../lib/game/group-content.ts';
import {ARENA_POOL_SIZE,ARENA_RIDDLE_POOL_SIZE,arenaPuzzle,arenaRiddlePuzzle,arenaWordKey,arenaGridKey} from '../lib/game/arena-content.ts';
import {RIDDLE_BANKS,riddleId} from '../lib/game/riddle-content.ts';
import {match} from '../lib/game/engine.ts';
import {GameService,GameError} from '../lib/game/server.ts';
import {fixture} from './fixtures.ts';
const assertBoard=(board:NonNullable<ReturnType<typeof groupPuzzle>>['board'])=>{
 assert.equal(board.size,GROUP_SIZE);assert.equal(board.grid.length,12);assert(board.grid.every(r=>r.length===12));assert.equal(board.targets.length,GROUP_WORDS);assert.equal(board.placements.length,9);assert.equal(new Set(board.targets.map(t=>t.text)).size,9);
 const slopes=new Set<number>();for(const p of board.placements){assert(/^[A-ZÇĞİÖŞÜ]{2,8}$/u.test(p.text));assert.equal(match(board,p.a,p.b)?.id,p.id);if(p.a[0]!==p.b[0]&&p.a[1]!==p.b[1])slopes.add(Math.sign((p.b[0]-p.a[0])*(p.b[1]-p.a[1])));}assert(slopes.has(1)&&slopes.has(-1));
};
async function lobby(){const f=fixture(),users=['a','b','c','d'],room=(await f.game.enter(users[0]!,'friend',undefined,true))!;for(const u of users.slice(1))await f.game.enter(u,'friend',room.code);return {...f,users,id:room.id};}
async function start(f:Awaited<ReturnType<typeof lobby>>,round:number){await Promise.all(f.users.map(u=>f.game.ready(u,f.id,round)));return f.game.start(f.users[0]!,f.id,round);}
describe('versioned group twelve by twelve with nine words',()=>{
 it('adds64 distinct, deterministic, solvable group boards across both modes; legacy generators stay six by eight',()=>{
  const words=new Set<string>(),grids=new Set<string>();
  for(let i=0;i<64;i++){const candidate=i<48?groupPuzzle(i):groupRiddlePuzzle(i-48);assert(candidate);assertBoard(candidate.board);assert(!words.has(candidate.wordsKey));assert(!grids.has(candidate.gridKey));words.add(candidate.wordsKey);grids.add(candidate.gridKey);assert.deepEqual(i<48?groupPuzzle(i):groupRiddlePuzzle(i-48),candidate);}
  for(const ordinal of [0,146,ARENA_POOL_SIZE-1]){const old=arenaPuzzle(ordinal);if(old){assert.equal(old.board.size,8);assert.equal(old.board.targets.length,6);}}
  const oldClue=arenaRiddlePuzzle(0)!;assert.equal(oldClue.board.size,8);assert.equal(oldClue.board.targets.length,6);
  assert.equal(groupPuzzle(GROUP_POOL_SIZE),null);assert.equal(groupRiddlePuzzle(GROUP_CLUE_POOL_SIZE),null);
 });
 for(const kind of ['clue','words'] as const)it(`preserves an in-flight old ${kind} board, scores/history, then upgrades its single successor`,async()=>{
  const f=await lobby();try{
   const riddle=kind==='clue'?arenaRiddlePuzzle(0)!:null,old=riddle??arenaPuzzle(0)!,room=f.room(f.id);room.phase='active';room.starts=f.clock()-4000;room.ends=f.clock()+1000;room.roundKind=kind;room.puzzle=old.board;
   if(riddle){room.clues=riddle.clues;room.usedRiddleIds=riddle.riddleIds;}
   f.sqlite.prepare('UPDATE rooms SET data=?,phase=? WHERE id=?').run(JSON.stringify(room),'active',f.id);
   const before=(await f.game.state(f.users[0]!))!;assert.deepEqual(before.board!.grid,old.board.grid);assert.equal(before.board!.targets.length,6);
   const p=old.board.placements[0]!;await f.game.claim(f.users[0]!,f.id,p.a,p.b,1);assert((await f.game.state(f.users[0]!))!.you.score>0);
   f.advance(2000);const next=await Promise.all([...f.users,'a','a'].map(u=>f.game.nextGame(u,f.id,1)));assert(next.every(v=>v.round===2&&v.id===f.id));assert.equal(next[0]!.lastResult!.players[0]!.id,'a');
   const active=await start(f,2);assertBoard(f.puzzle(f.id));assert.notEqual(arenaWordKey(active.board!),arenaWordKey(old.board));assert.notEqual(arenaGridKey(active.board!),arenaGridKey(old.board));
   const reload=await new GameService(f.db,f.clock).state('d');assert.deepEqual(reload!.board,active.board);if(riddle)assert(riddle.riddleIds.every(id=>f.room(f.id).usedRiddleIds!.includes(id)));
  }finally{f.sqlite.close();}
 });
 it('does not reset either legacy cursor and rolls only the new normal-group cursor forward',async()=>{
  const f=await lobby();try{
   const room=f.room(f.id);room.roundKind='words';f.sqlite.prepare('UPDATE rooms SET data=? WHERE id=?').run(JSON.stringify(room),f.id);
   f.sqlite.prepare("INSERT INTO arena_pool VALUES('arena-v1',123,'old')").run();f.sqlite.prepare("INSERT INTO arena_pool VALUES('arena-riddle-v1',456,'old')").run();
   await start(f,1);assert.equal(f.sqlite.prepare("SELECT next FROM arena_pool WHERE id='arena-v1'").get()!['next'],123);assert.equal(f.sqlite.prepare("SELECT next FROM arena_pool WHERE id='arena-riddle-v1'").get()!['next'],456);assert.equal(f.sqlite.prepare('SELECT next FROM arena_pool WHERE id=?').get(GROUP_WORD_POOL)!['next'],1);
  }finally{f.sqlite.close();}
 });
 it('treats six to eight unused definitions as exhausted rather than starting a short riddle board',async()=>{
  for(const left of [6,7,8]){const f=await lobby();try{
   const keep=new Set(RIDDLE_BANKS[0]!.items.slice(0,left).map(([w])=>riddleId(RIDDLE_BANKS[0]!.themeId,w))),used=RIDDLE_BANKS.flatMap(b=>b.items.map(([w])=>riddleId(b.themeId,w))).filter(id=>!keep.has(id));
   assert.equal(hasGroupRiddles(used),false);assert.equal(groupRiddlePuzzle(0,used),null);const room=f.room(f.id);room.usedRiddleIds=used;f.sqlite.prepare('UPDATE rooms SET data=? WHERE id=?').run(JSON.stringify(room),f.id);
   const view=(await f.game.state('a'))!;assert(view.roundUnavailable);assert.equal(view.canStart,false);await assert.rejects(()=>start(f,1),e=>e instanceof GameError&&e.code==='ARENA_RIDDLES_EXHAUSTED');assert.equal(f.room(f.id).puzzle,undefined);
  }finally{f.sqlite.close();}}
 });
});
