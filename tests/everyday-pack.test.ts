import {replacementChapterId} from '../lib/game/original-content.ts';
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {createHash} from 'node:crypto';
import baseline from './fixtures/journey-0310.json' with {type:'json'};
import {EVERYDAY_ROUTES,EVERYDAY_CHAPTERS} from '../lib/game/everyday-content.ts';
import {PLAYABLE_JOURNEYS,journeyById,journeyBoard} from '../lib/game/content.ts';
import {MAIN_JOURNEY_IDS,mainJourneyState,mainJourneyChapters} from '../lib/game/main-journey.ts';
import {emptyProgress,cleanSave,loadProgress,mergeProgress,type Progress} from '../lib/game/progress.ts';
import {worldChapter,chapterVeils} from '../lib/game/world-presentation.ts';
import {match} from '../lib/game/engine.ts';
import {discoveryRewards,discoveryState,nextJourneyAfter,keepBestSave} from '../lib/game/discovery.ts';
import {normalize} from '../lib/game/catalog.ts';

function finish(p:Progress,id:string){const b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:b.placements,hints:0,elapsed:40,complete:false,stars:99},b);}
function veteran(){const p=emptyProgress();for(const id of baseline.ids)finish(p,id);return p;}
const signature=(words:string[])=>words.map(normalize).sort().join('|');

describe('Günün Renkleri append-only authored pack',()=>{
 it('preserves all 144 old numbers and every 181 published journey board byte for byte',()=>{
  assert.equal(baseline.ids.length,144);assert.equal(Object.keys(baseline.boards).length,181);
  assert.deepEqual(MAIN_JOURNEY_IDS.slice(0,144),baseline.ids.map(replacementChapterId));
  for(const [id,hash] of Object.entries(baseline.boards))assert.equal(createHash('sha256').update(JSON.stringify(journeyBoard(journeyById(id)!))).digest('hex'),hash,id);
  assert.deepEqual(MAIN_JOURNEY_IDS.slice(144,168),EVERYDAY_CHAPTERS.map(c=>c.id));assert.equal(MAIN_JOURNEY_IDS.length,312);
 });
 it('adds 24 distinct target sets with no pack-internal word repetition or copied old set',()=>{
  assert.equal(EVERYDAY_CHAPTERS.length,24);const words=EVERYDAY_CHAPTERS.flatMap(c=>c.words.map(normalize));assert.equal(words.length,100);assert.equal(new Set(words).size,100);
  const all=PLAYABLE_JOURNEYS.map(c=>signature(c.words));
  for(const c of EVERYDAY_CHAPTERS){assert.equal(all.filter(s=>s===signature(c.words)).length,1,c.id);assert.equal(worldChapter(c.id)?.topic,c.title,'the reviewed title must actually reach the player');assert.equal(worldChapter(c.id)?.world.title,EVERYDAY_ROUTES.find(r=>r.chapters.includes(c))!.title);}
 });
 it('has solvable small boards, four complete clue rounds and sparse concealment',()=>{
  assert.equal(EVERYDAY_CHAPTERS.filter(c=>c.clues).length,4);let hidden=0,initial=0;
  for(const c of EVERYDAY_CHAPTERS){const b=journeyBoard(c);assert(b.size>=6&&b.size<=8,c.id);assert(b.targets.length>=4&&b.targets.length<=5,c.id);
   for(const place of b.placements){assert.equal(match(b,place.a,place.b)?.id,place.id);assert.equal(match(b,place.b,place.a)?.id,place.id);}
   if(c.clues){assert.deepEqual(Object.keys(c.clues),c.words);for(const [word,clue] of Object.entries(c.clues)){assert(clue.length>=8&&clue.length<=150);assert(!normalize(clue).includes(normalize(word)),word+' answer leak');}}
   const veils=Object.values(chapterVeils(c.id,b.targets));hidden+=veils.filter(v=>v==='hidden').length;initial+=veils.filter(v=>v==='initial').length;
  }
  assert.equal(hidden,1);assert.equal(initial,4);for(const r of EVERYDAY_ROUTES)assert.equal(r.chapters[3]!.difficulty,'Rahat');
 });
 it('continues at145, preserves partial draws and keeps all prior rewards on reload and merge',()=>{
  const p=veteran(),old=loadProgress(JSON.stringify(p));assert.equal(mainJourneyState(p).current?.number,145);
  const c=EVERYDAY_CHAPTERS[0]!,b=journeyBoard(c),key='route:'+c.id;
  p.saves[key]=cleanSave({strokes:[b.placements[0]!],hints:1,elapsed:18,complete:false,stars:99},b);p.last={themeId:c.themeId,level:0,journey:c.id};
  const restored=mergeProgress(loadProgress(JSON.stringify(p)),old);assert.deepEqual(restored.saves[key],p.saves[key]);assert.equal(mainJourneyState(restored).current?.number,145);assert.equal(mainJourneyState(restored).continuing,true);assert.deepEqual(discoveryRewards(old,restored),[]);
  for(const id of baseline.ids)assert.deepEqual(restored.saves['route:'+id],old.saves['route:'+id]);assert(discoveryState(restored).slice(0,24).every(s=>s.complete));
 });
 it('plays all24 through the actual world gates, continuation and album rewards',()=>{
  let p=veteran();
  for(const [i,c] of EVERYDAY_CHAPTERS.entries()){
   const before=loadProgress(JSON.stringify(p));assert.equal(mainJourneyState(p).current?.chapter.id,c.id);assert(mainJourneyChapters(p).find(x=>x.chapter.id===c.id)!.unlocked);
   finish(p,c.id);p.last={themeId:c.themeId,level:0,journey:c.id};
   const rewards=discoveryRewards(before,p);assert.equal(rewards.filter(r=>r.kind==='piece').length,1);assert.equal(rewards.filter(r=>r.kind==='album').length,i%6===5?1:0);
   assert.equal(nextJourneyAfter(p,c.id)?.id,EVERYDAY_CHAPTERS[i+1]?.id??'kesif-zanaat-1');
   p=loadProgress(JSON.stringify(p));assert.equal(mainJourneyState(p).completed,145+i);
  }
  assert.equal(mainJourneyState(p).current?.number,169);assert(discoveryState(p).slice(0,28).every(s=>s.complete));
  const before=loadProgress(JSON.stringify(p)),c=EVERYDAY_CHAPTERS[0]!,b=journeyBoard(c),key='route:'+c.id;
  p.saves[key]=keepBestSave(p.saves[key],cleanSave({strokes:b.placements,hints:3,elapsed:80,complete:false,stars:0},b));assert.equal(p.saves[key]!.stars,3);assert.deepEqual(discoveryRewards(before,p),[]);
 });
});
