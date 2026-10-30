import {THEMES} from '../lib/game/catalog.ts';
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {RIDDLE_BANKS,RIDDLE_CHAPTERS,riddleId} from '../lib/game/riddle-content.ts';
import {ALL_JOURNEYS,PLAYABLE_JOURNEYS,MYSTERIES,journeyBoard} from '../lib/game/content.ts';
import {MAIN_JOURNEY,MAIN_JOURNEY_IDS,mainJourneyState} from '../lib/game/main-journey.ts';
import {discoveryState,discoveryRewards} from '../lib/game/discovery.ts';
import {cleanSave,emptyProgress,loadProgress,mergeProgress,progressBoard} from '../lib/game/progress.ts';
import {arenaRiddlePuzzle,ARENA_RIDDLE_POOL_SIZE,arenaPuzzle,arenaWordKey,arenaGridKey} from '../lib/game/arena-content.ts';
import {GameService,GameError} from '../lib/game/server.ts';
import {match} from '../lib/game/engine.ts';
import {fixture} from './fixtures.ts';

describe('reviewed optional riddle chapters preserve the numbered journey',()=>{
 it('adds144 complete, unique definitions and32 new four-answer chapters without renumbering existing content',()=>{
  const items=RIDDLE_BANKS.flatMap(b=>b.items.map(([word,clue])=>({id:riddleId(b.themeId,word),word,clue})));
  assert.equal(items.length,144);assert.equal(new Set(items.map(i=>i.id)).size,144);assert.equal(new Set(items.map(i=>i.clue)).size,144);
  assert.equal(RIDDLE_CHAPTERS.length,32);assert.equal(new Set(RIDDLE_CHAPTERS.map(c=>c.id)).size,32);
  assert.equal(ALL_JOURNEYS.length,96);assert.equal(PLAYABLE_JOURNEYS.length,128);assert.deepEqual(MAIN_JOURNEY_IDS,MAIN_JOURNEY.map(c=>c.chapter.id));
  for(const item of items){assert(/^[A-ZÇĞİÖŞÜ]{2,8}$/u.test(item.word));assert(item.clue.length>=12&&item.clue.length<=95);assert.notEqual(item.clue.toLocaleUpperCase('tr-TR'),item.word);}
  const oldSets=new Set(ALL_JOURNEYS.map(c=>JSON.stringify([...c.words].sort())));
  for(const c of RIDDLE_CHAPTERS){assert.equal(c.words.length,4);assert.equal(Object.keys(c.clues!).length,4);assert(!oldSets.has(JSON.stringify([...c.words].sort())),c.id);const board=journeyBoard(c);assert.equal(board.size,c.size);for(const p of board.placements){assert(c.clues![p.text]);assert.equal(match(board,p.a,p.b)?.id,p.id);}}
 });
 it('round-trips new saves, merges devices, preserves best replay and grants no main album pieces',()=>{
  const c=RIDDLE_CHAPTERS[0]!,board=journeyBoard(c),a=emptyProgress(),b=emptyProgress(),key='route:'+c.id;
  a.saves[key]=cleanSave({strokes:board.placements.slice(0,2),elapsed:12,hints:0,complete:false,stars:0},board);b.saves[key]=cleanSave({strokes:board.placements.slice(2),elapsed:18,hints:0,complete:false,stars:0},board);
  const merged=loadProgress(JSON.stringify(mergeProgress(a,b)));assert.equal(merged.saves[key]!.complete,true);assert.equal(merged.saves[key]!.stars,3);
  const replay=emptyProgress();replay.saves[key]=cleanSave({strokes:board.placements,elapsed:99,hints:2,complete:false,stars:0},board);
  const best=mergeProgress(merged,replay);assert.equal(best.saves[key]!.stars,3);assert.equal(best.saves[key]!.elapsed,18);
  assert.deepEqual(discoveryState(best),discoveryState(emptyProgress()));assert.deepEqual(discoveryRewards(emptyProgress(),best),[]);assert.equal(mainJourneyState(best).current!.number,1);
  best.last={themeId:c.themeId,level:0,journey:c.id};assert.equal(loadProgress(JSON.stringify(best)).last!.journey,c.id);
 });
});

async function lobby(count=4){const f=fixture(),users=Array.from({length:count},(_,i)=>'riddle-'+i),first=(await f.game.enter(users[0]!,'friend',undefined,true))!;await Promise.all(users.slice(1).map(u=>f.game.enter(u,'friend',first.code)));return {...f,users,id:first.id,code:first.code};}
async function start(f:Awaited<ReturnType<typeof lobby>>,round:number){await Promise.all(f.users.map(u=>f.game.ready(u,f.id,round)));const v=await f.game.start(f.users[0]!,f.id,round);f.advance(4000);return v;}
describe('persistent alternating group rounds',()=>{
 for(const count of [4,8])it(`${count} sessions share eight alternating rounds without any reused riddle, including reload and repeated next`,async()=>{
  const f=await lobby(count),used=new Set<string>(),words=new Set<string>(),grids=new Set<string>();
  for(let round=1;round<=8;round++){
   const expected=round%2?'clue':'words',l=(await new GameService(f.db,f.clock).state(f.users[0]!))!;assert.equal(l.roundKind,expected);
   const v=await start(f,round),views=await Promise.all(f.users.map(u=>new GameService(f.db,f.clock).state(u)));
   assert(views.every(x=>x!.roundKind===expected&&x!.starts===v.starts&&x!.ends===v.ends&&JSON.stringify(x!.board)===JSON.stringify(v.board)&&JSON.stringify(x!.clues)===JSON.stringify(v.clues)));
   const board=f.puzzle(f.id),wk=arenaWordKey(board),gk=arenaGridKey(board);assert(!words.has(wk)&&!grids.has(gk));words.add(wk);grids.add(gk);
   if(expected==='clue'){
    assert.equal(Object.keys(v.clues!).length,6);for(const target of v.board!.targets)assert.equal(target.label,v.clues![target.text]);
    const all=f.room(f.id).usedRiddleIds!;const fresh=all.filter(id=>!used.has(id));assert.equal(fresh.length,6);for(const id of fresh)used.add(id);assert.equal(all.length,used.size);
    const p=board.placements[0]!;const found=await f.game.claim(f.users[0]!,f.id,p.a,p.b,round);assert.equal(found.board!.targets.find(t=>t.id===p.id)!.label,p.label);
    const other=(await f.game.state(f.users[1]!))!;assert.equal(other.board!.targets.find(t=>t.id===p.id)!.label,v.clues![p.text]);
   }else assert.equal(v.clues,undefined);
   f.advance(120000);const finished=(await f.game.state(f.users[0]!))!;assert.equal(finished.phase,'finished');
   const next=await Promise.all([...f.users,f.users[0]!,f.users[0]!].map(u=>f.game.nextGame(u,f.id,round)));
   assert(next.every(n=>n.round===round+1&&n.id===f.id&&n.code===f.code&&n.roundKind!==expected));
   assert.equal(f.room(f.id).usedRiddleIds!.length,used.size);assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM rooms').get()!['n'],1);
  }
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM arena_seen').get()!['n'],count*8);f.sqlite.close();
 });
 it('uses the union of every participant lifetime word-set and real-grid history in clue rounds',async()=>{
  for(const mode of ['words','grid']){const f=await lobby(),candidate=arenaRiddlePuzzle(0)!;
   f.sqlite.prepare('INSERT INTO arena_seen VALUES(?,?,?,?,?,?)').run(f.users[3]!,mode==='words'?candidate.wordsKey:'other words',mode==='grid'?candidate.gridKey:'other grid','old-room',1,f.clock());
   const v=await start(f,1);assert(v.contentOrdinal!>0);assert.notEqual(arenaWordKey(v.board!),candidate.wordsKey);if(mode==='grid')assert.notEqual(arenaGridKey(v.board!),candidate.gridKey);f.sqlite.close();}
 });
 it('preserves a legacy active normal board and begins alternation only at its successor',async()=>{
  const f=await lobby(),old=f.room(f.id);delete old.roundKind;old.phase='active';old.starts=f.clock()-1000;old.ends=f.clock()+1000;old.puzzle=arenaPuzzle(23)!.board;
  f.sqlite.prepare('UPDATE rooms SET data=?,phase=? WHERE id=?').run(JSON.stringify(old),'active',f.id);
  const v=(await new GameService(f.db,f.clock).state(f.users[0]!))!;assert.equal(v.roundKind,'words');assert.deepEqual(v.board!.grid,old.puzzle.grid);assert.equal(v.clues,undefined);
  f.advance(2000);const next=await f.game.nextGame(f.users[0]!,f.id,1);assert.equal(next.roundKind,'clue');assert.equal(next.board,null);f.sqlite.close();
 });
 it('makes per-room and global clue exhaustion explicit without resetting history or opening an old board',async()=>{
  for(const exhausted of ['room','pool']){const f=await lobby();if(exhausted==='room'){const room=f.room(f.id);room.usedRiddleIds=RIDDLE_BANKS.flatMap(b=>b.items.map(([w])=>riddleId(b.themeId,w)));f.sqlite.prepare('UPDATE rooms SET data=? WHERE id=?').run(JSON.stringify(room),f.id);}else f.sqlite.prepare("INSERT INTO arena_pool VALUES('arena-riddle-v1',?,'')").run(ARENA_RIDDLE_POOL_SIZE);
   await Promise.all(f.users.map(u=>f.game.ready(u,f.id,1)));await assert.rejects(()=>f.game.start(f.users[0]!,f.id,1),(e:unknown)=>e instanceof GameError&&e.code===(exhausted==='room'?'ARENA_RIDDLES_EXHAUSTED':'ARENA_CONTENT_UNAVAILABLE'));
   assert.equal(f.room(f.id).phase,'ready');assert.equal(f.room(f.id).puzzle,undefined);assert.equal(f.room(f.id).starts,null);assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM arena_seen').get()!['n'],0);
   const reloaded=(await new GameService(f.db,f.clock).state(f.users[0]!))!;if(exhausted==='room'){assert.equal(reloaded.canStart,false);assert(reloaded.roundUnavailable);}f.sqlite.close();}
 });
 it('rolls back clue history, room and cursor together when receipt persistence fails',async()=>{
  const f=await lobby();f.sqlite.exec("CREATE TRIGGER fail_riddle BEFORE INSERT ON arena_seen BEGIN SELECT RAISE(ABORT,'receipt unavailable'); END");await Promise.all(f.users.map(u=>f.game.ready(u,f.id,1)));
  await assert.rejects(()=>f.game.start(f.users[0]!,f.id,1));assert.equal(f.room(f.id).usedRiddleIds,undefined);assert.equal(f.room(f.id).clues,undefined);assert.equal(f.room(f.id).phase,'ready');assert.equal(f.sqlite.prepare("SELECT next FROM arena_pool WHERE id='arena-riddle-v1'").get()!['next'],0);f.sqlite.close();
 });
});


it('preserves every old and new solo save plus3660 daily dates within the unchanged transport/storage budget',()=>{
 const p=emptyProgress(),keys=[...THEMES.flatMap(t=>Array.from({length:6},(_,i)=>t.id+'.'+i)),...PLAYABLE_JOURNEYS.map(j=>'route:'+j.id),...MYSTERIES.map(m=>'mystery:'+m.id)];
 for(const key of keys){const b=progressBoard(key)!;assert(b,key);p.saves[key]=cleanSave({strokes:b.placements,elapsed:123,hints:0,complete:false,stars:0},b);}
 p.days=Array.from({length:3660},(_,i)=>new Date(Date.UTC(2016,0,i+1)).toISOString().slice(0,10));
 const raw=JSON.stringify(p);assert(raw.length<150000);assert(new TextEncoder().encode(JSON.stringify({action:'progress',progress:p})).length<150000);
 const restored=loadProgress(raw);assert.equal(Object.keys(restored.saves).length,230);assert.equal(restored.days.length,3660);for(const key of keys)assert.equal(restored.saves[key]!.complete,true,key);
});
