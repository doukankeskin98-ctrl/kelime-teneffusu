import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {createHash} from 'node:crypto';
import baseline from './fixtures/journey-0460.json' with {type:'json'};
import {DISCOVERIES_ROUTES,DISCOVERIES_CHAPTERS} from '../lib/game/discoveries-content.ts';
import {PLAYABLE_JOURNEYS,journeyById,journeyBoard} from '../lib/game/content.ts';
import {MAIN_JOURNEY_IDS,MAIN_JOURNEY_ORDER,mainJourneyState,mainJourneyChapters} from '../lib/game/main-journey.ts';
import {EXPEDITIONS,discoveryState,discoveryRewards,nextJourneyAfter} from '../lib/game/discovery.ts';
import {emptyProgress,cleanSave,loadProgress,mergeProgress,type Progress} from '../lib/game/progress.ts';
import {chapterVeils,worldChapter} from '../lib/game/world-presentation.ts';
import {normalize} from '../lib/game/catalog.ts';
import {match} from '../lib/game/engine.ts';
const signature=(words:string[])=>words.map(normalize).sort().join('|');
function finish(p:Progress,id:string){const b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:b.placements,hints:0,elapsed:30,complete:false,stars:0},b);}
describe('Küçük Keşifler authored expansion',()=>{
 it('preserves all168 membership/display IDs,28 world gates and235 published boards exactly',()=>{
  assert.deepEqual(MAIN_JOURNEY_IDS.slice(0,168),baseline.ids);assert.deepEqual(MAIN_JOURNEY_ORDER.slice(0,168),baseline.order);
  assert.deepEqual(JSON.parse(JSON.stringify(EXPEDITIONS.slice(0,28))),baseline.worlds);
  for(const [id,hash] of Object.entries(baseline.boards))assert.equal(createHash('sha256').update(JSON.stringify(journeyBoard(journeyById(id)!))).digest('hex'),hash,id);
  assert.equal(MAIN_JOURNEY_IDS.length,312);assert.deepEqual(MAIN_JOURNEY_ORDER.slice(168,192),DISCOVERIES_CHAPTERS.map(c=>c.id));
 });
 it('adds24 distinct actual topics and101 unique targets within the pack',()=>{
  assert.equal(DISCOVERIES_CHAPTERS.length,24);assert.equal(DISCOVERIES_ROUTES.length,4);
  const words=DISCOVERIES_CHAPTERS.flatMap(c=>c.words.map(normalize));assert.equal(words.length,101);assert.equal(new Set(words).size,101);
  for(const c of DISCOVERIES_CHAPTERS){assert.equal(PLAYABLE_JOURNEYS.filter(other=>signature(other.words)===signature(c.words)).length,1,c.id);assert.equal(worldChapter(c.id)?.topic,c.title);assert.equal(PLAYABLE_JOURNEYS.filter(other=>other.title===c.title).length,1,c.title);}
 });
 it('has6–8 boards,4–5 targets,16 short clues and only five concealed targets in the whole pack',()=>{
  let clues=0,initial=0,hidden=0;
  for(const c of DISCOVERIES_CHAPTERS){const board=journeyBoard(c);assert(board.size>=6&&board.size<=8);assert(board.targets.length>=4&&board.targets.length<=5);
   for(const p of board.placements){assert.equal(match(board,p.a,p.b)?.id,p.id);assert.equal(match(board,p.b,p.a)?.id,p.id);}
   if(c.clues){assert.deepEqual(Object.keys(c.clues),c.words);for(const [word,clue] of Object.entries(c.clues)){clues++;assert(clue.length<90);assert(!normalize(clue).includes(normalize(word)),word);}}
   for(const value of Object.values(chapterVeils(c.id,board.targets))){initial+=Number(value==='initial');hidden+=Number(value==='hidden');}
  }
  assert.equal(clues,16);assert.equal(initial,4);assert.equal(hidden,1);
 });
 it('continues a veteran at169, plays each real gate and preserves all old saves through merge',()=>{
  let p=emptyProgress();baseline.ids.forEach(id=>finish(p,id));const old=loadProgress(JSON.stringify(p));
  assert.equal(mainJourneyState(p).current?.number,169);
  for(const [i,c] of DISCOVERIES_CHAPTERS.entries()){
   assert.equal(mainJourneyState(p).current?.chapter.id,c.id);assert(mainJourneyChapters(p).find(x=>x.chapter.id===c.id)!.unlocked);
   const before=structuredClone(p);finish(p,c.id);p.last={themeId:c.themeId,level:0,journey:c.id};
   assert.equal(discoveryRewards(before,p).filter(r=>r.kind==='album').length,i%6===5?1:0);
   assert.equal(nextJourneyAfter(p,c.id)?.id,DISCOVERIES_CHAPTERS[i+1]?.id??MAIN_JOURNEY_ORDER[192]);p=mergeProgress(old,loadProgress(JSON.stringify(p)));
  }
  assert.equal(mainJourneyState(p).current?.number,193);assert.equal(mainJourneyState(p).completed,192);assert(discoveryState(p).slice(0,32).every(w=>w.complete));
  for(const [key,save] of Object.entries(old.saves))assert.deepEqual(p.saves[key],save);
 });
});
