import {fixture} from './fixtures.ts';
import {dailyBoard,SAFE_DAILY_FROM} from '../lib/game/daily-board.ts';
import {BONUS_WORDS,bonusBoard,cleanBonusSave,selectBonus,freshBonus} from '../lib/game/journey-bonus.ts';
import {RELEASE_BATCHES} from '../lib/studio/releases.ts';
import {RETIRED_RELEASE_IDS} from '../lib/game/original-content.ts';
import {ACTIVE_THEMES} from '../lib/game/catalog.ts';
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {ACTIVE_JOURNEYS,journeyBoard,MYSTERIES,mysteryBoard,TUTORIAL} from '../lib/game/content.ts';
import {MAIN_JOURNEY} from '../lib/game/main-journey.ts';
import {dailySpec,makePuzzle,hash,makeCustomPuzzle,match} from '../lib/game/engine.ts';
import {boardIssues,canonicalStroke,presentationStrokes,qualityPuzzle,wordSegments} from '../lib/game/board-quality.ts';
import {presentationBoard,journeyPolicy} from '../lib/game/journey-presentation.ts';
import {cleanSave,emptyProgress,loadProgress,mergeProgress,collectionStats} from '../lib/game/progress.ts';
import {chapterVeils} from '../lib/game/world-presentation.ts';
import {freshArenaPuzzle} from '../lib/game/arena-fresh.ts';

describe('safe layouts preserve historical player credit',()=>{
 it('shows every authored answer exactly once with no unintended blocked segment',()=>{
  for(const j of ACTIVE_JOURNEYS){
   const old=journeyBoard(j),b=presentationBoard(old,'route:'+j.id);
   assert.notEqual(b,old,j.id);assert.deepEqual(b.targets,old.targets);
   assert.deepEqual(boardIssues(b),[],j.id);
   for(const p of b.placements)assert.equal(match(b,p.a,p.b)?.id,p.id,j.id);
  }
  for(const m of MYSTERIES)assert.deepEqual(boardIssues(presentationBoard(mysteryBoard(m),'mystery:'+m.id)),[]);
  assert.deepEqual(boardIssues(presentationBoard(TUTORIAL,'tutorial')),[]);
 });
 it('preserves every old extra/reversed solution and every earned star through resume and cloud merge',()=>{
  const progress=emptyProgress();let alternate=0;
  for(const {chapter:j} of MAIN_JOURNEY){
   const old=journeyBoard(j),display=presentationBoard(old,'route:'+j.id);
   const strokes=old.targets.map(t=>{
    const paths=wordSegments(old.grid,t.text);if(paths.length>1)alternate+=paths.length-1;
    const p=paths.at(-1)!;return {id:t.id,a:p.b,b:p.a};
   });
   const saved=cleanSave({strokes,elapsed:49,hints:1,complete:false,stars:0},old);
   progress.saves['route:'+j.id]=saved;
   const before=JSON.stringify(saved),shown=presentationStrokes(old,display,saved.strokes);
   assert.equal(shown.length,saved.strokes.length);
   for(const s of shown)assert.equal(match(display,s.a,s.b)?.id,s.id,j.id);
   assert.equal(JSON.stringify(saved),before,'presentation must not mutate old coordinates');
  }
  assert.equal(alternate,19);
  const loaded=loadProgress(JSON.stringify(progress));assert.deepEqual(loaded.saves,progress.saves);
  assert.deepEqual(mergeProgress(loaded,progress).saves,progress.saves);
  assert.deepEqual(collectionStats(loaded),collectionStats(progress));
 });
 it('adds a new find in legacy coordinates without rewriting the existing partial stroke',()=>{
  const j=MAIN_JOURNEY[5]!.chapter,source=journeyBoard(j),display=presentationBoard(source,'route:'+j.id);
  const target=source.targets.find(t=>wordSegments(source.grid,t.text).length>1)!;
  const alternate=wordSegments(source.grid,target.text).at(-1)!;
  const first={id:target.id,a:alternate.b,b:alternate.a};
  const next=display.placements.find(p=>p.id!==first.id)!;
  const newStroke=canonicalStroke(source,display,next.a,next.b)!;
  assert.equal(match(source,newStroke.a,newStroke.b)?.id,next.id);
  const saved=cleanSave({strokes:[first,newStroke],elapsed:12,hints:2,complete:false,stars:0},source);
  assert.deepEqual(saved.strokes[0],first);assert.equal(saved.strokes.length,2);
  assert.equal(saved.elapsed,12);assert.equal(saved.hints,2);
 });
 it('teaches forward straight lines before diagonals and bounds reversed answers',()=>{
  for(const {number,chapter} of MAIN_JOURNEY){
   const original=journeyBoard(chapter),p=presentationBoard(original,'route:'+chapter.id),policy=journeyPolicy(chapter.id,original);
   assert.equal(p.size,policy.size);
   const reverse=p.placements.filter(x=>x.b[0]<x.a[0]||(x.b[0]===x.a[0]&&x.b[1]<x.a[1])).length;
   assert(reverse<=(policy.reverseLimit??15));
   if(number===3)assert(p.placements.some(x=>x.a[0]!==x.b[0]&&x.a[1]!==x.b[1]));
   if(number<=2)assert(p.placements.every(x=>x.a[0]===x.b[0]||x.a[1]===x.b[1]));
   if(number<=6){assert.equal(reverse,0);assert(!Object.values(chapterVeils(chapter.id,p.targets)).some(v=>v!=='open'));}
  }
  assert.equal(presentationBoard(journeyBoard(MAIN_JOURNEY[4]!.chapter),'route:uzay-5').size,10);
 });
 it('is deterministic and permits reviewed dictionary substrings without allowing random ones',()=>{
  const source=makeCustomPuzzle(['BİSİKLET','KLASİK','ÇİPURA','TOKMAK'],31,9);
  const a=qualityPuzzle(source,19),b=qualityPuzzle(source,19);
  assert.deepEqual(a,b);assert.deepEqual(boardIssues(a),[]);
 });
 it('ships safe authoritative snapshots for every new Arena round type',()=>{
  for(const group of [true,false])for(const clue of [true,false])for(let i=0;i<16;i++){
   const c=freshArenaPuzzle(hash('safety:'+i) % (2**31),{group,clue});assert(c);
   assert.deepEqual(boardIssues(c.board),[]);assert.equal(c.board.size,group?9:8);
  }
 });
});

it('keeps bonus endpoint IDs, counts, partial attempts and best scores while displaying safe repeated targets',()=>{
 for(const id of Object.keys(BONUS_WORDS)){
  const source=bonusBoard(id),display=presentationBoard(source,'bonus:'+id);
  assert.deepEqual(boardIssues(display),[],id);assert.deepEqual(display.targets,source.targets);
  let save=freshBonus(3,source.targets.length);
  for(const p of display.placements){const original=source.placements.find(o=>o.id===p.id)!;const result=selectBonus(source,save,original.a,original.b);assert(result.accepted);save=result.save;}
  assert(save.finished);assert.equal(save.best,source.targets.length);assert.deepEqual(cleanBonusSave(id,save),save);
 }
});
it('checks all active standard and shipped release layouts without changing their canonical boards',()=>{
 for(const t of ACTIVE_THEMES)for(let level=0;level<6;level++){
  const source=makePuzzle(t.id,level,hash(`campaign-v2:${t.id}:${level}`));assert.deepEqual(boardIssues(presentationBoard(source,`${t.id}.${level}`)),[]);
 }
 for(const {chapter:c} of RELEASE_BATCHES.flatMap(b=>b.chapters).filter(({chapter:c})=>!RETIRED_RELEASE_IDS.has(c.id)))assert.deepEqual(boardIssues(presentationBoard(c.board,'release:'+c.id)),[],c.id);
});
it('leaves issued dailies unchanged and gives future days deterministic safe boards',()=>{
 for(const day of ['2026-10-30','2026-11-12','2026-11-13']){const s=dailySpec(day);assert.deepEqual(dailyBoard(day),makePuzzle(s.themeId,s.level,s.seed));}
 for(let n=0;n<90;n++){const day=new Date(Date.parse(SAFE_DAILY_FROM)+n*86400000).toISOString().slice(0,10),b=dailyBoard(day);assert.deepEqual(boardIssues(b),[],day);assert.deepEqual(dailyBoard(day),b);}
});

it('uses the same safe future daily on the server for both players, hints and claims',async()=>{
 const f=fixture();try{
  f.advance(Date.parse(SAFE_DAILY_FROM+'T12:00:00Z')-f.clock());
  const alice=await f.game.daily('safe-a'),bob=await f.game.daily('safe-b'),b=dailyBoard(alice.day);
  assert.deepEqual(alice.board,bob.board);assert.deepEqual(alice.board.grid,b.grid);
  const target=b.placements[0]!,receipt=await f.game.dailyClaim('safe-a',alice.id,target.b,target.a);
  assert.equal(receipt.strokes.length,1);assert.equal(receipt.strokes[0]!.id,target.id);
 }finally{f.sqlite.close();}
});
