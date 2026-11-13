import {SAFE_LAYOUTS} from '../lib/game/safe-layouts.ts';
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {createHash} from 'node:crypto';
import baseline from './fixtures/journey-0490.json' with {type:'json'};
import {HORIZON_CHAPTERS,HORIZON_ROUTES} from '../lib/game/horizons-content.ts';
import {MAIN_JOURNEY_IDS,MAIN_JOURNEY_ORDER,mainJourneyState,mainJourneyChapters} from '../lib/game/main-journey.ts';
import {EXPEDITIONS,discoveryRewards,discoveryState} from '../lib/game/discovery.ts';
import {journeyById,journeyBoard,PLAYABLE_JOURNEYS} from '../lib/game/content.ts';
import {presentationBoard} from '../lib/game/journey-presentation.ts';
import {boardIssues,PRESENTATION_RULES} from '../lib/game/board-quality.ts';
import {normalize,findTheme} from '../lib/game/catalog.ts';
import {emptyProgress,cleanSave,loadProgress,mergeProgress,type Progress} from '../lib/game/progress.ts';
import {chapterVeils,worldChapter} from '../lib/game/world-presentation.ts';
const signature=(words:string[])=>words.map(normalize).sort().join('|');
function finish(p:Progress,id:string){const b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:b.placements,hints:0,elapsed:35,complete:false,stars:0},b);}
describe('Yeni Ufuklar authored pack',()=>{
 it('preserves every previous ID, order, world and canonical board',()=>{
  assert.deepEqual(MAIN_JOURNEY_IDS.slice(0,192),baseline.ids);assert.deepEqual(MAIN_JOURNEY_ORDER.slice(0,192),baseline.order);
  assert.deepEqual(JSON.parse(JSON.stringify(EXPEDITIONS.slice(0,32))),baseline.worlds);
  for(const [id,digest] of Object.entries(baseline.boards))assert.equal(createHash('sha256').update(JSON.stringify(journeyBoard(journeyById(id)!))).digest('hex'),digest,id);
  for(const [key,digest] of Object.entries(baseline.presentation))assert.equal(createHash('sha256').update(JSON.stringify(SAFE_LAYOUTS[key])).digest('hex'),digest,key+' existing visible layout');
  assert.equal(MAIN_JOURNEY_IDS.length,312);assert.deepEqual(MAIN_JOURNEY_ORDER.slice(192),HORIZON_CHAPTERS.map(c=>c.id));
 });
 it('adds 120 distinct topic sets, 480 targets, 80 definitions and restrained veils',()=>{
  assert.equal(HORIZON_ROUTES.length,20);for(const route of HORIZON_ROUTES){assert.equal(route.pieces.length,6);assert.equal(new Set(route.pieces).size,6);route.pieces.forEach((piece,i)=>assert.notEqual(piece,route.chapters[i]!.title));}assert.equal(HORIZON_CHAPTERS.length,120);let definitions=0,initials=0;
  for(const c of HORIZON_CHAPTERS){
   assert.equal(c.words.length,4);assert.equal(findTheme(c.themeId).id,c.themeId);
   assert.equal(PLAYABLE_JOURNEYS.filter(x=>signature(x.words)===signature(c.words)).length,1,c.id);
   assert.equal(PLAYABLE_JOURNEYS.filter(x=>x.title===c.title).length,1,c.title);
   assert.equal(worldChapter(c.id)?.topic,c.title);
   for(const word of c.words)assert(/^[A-ZÇĞİÖŞÜ]{3,8}$/.test(word),c.id+': '+word);
   const b=presentationBoard(journeyBoard(c),'route:'+c.id);assert(b.size>=6&&b.size<=8);assert.deepEqual(boardIssues(b,PRESENTATION_RULES),[],c.id);
   if(c.clues){assert.deepEqual(Object.keys(c.clues),c.words);for(const clue of Object.values(c.clues)){assert(clue.length>=8&&clue.length<=150);definitions++;}}
   for(const veil of Object.values(chapterVeils(c.id,b.targets))){assert.notEqual(veil,'hidden');initials+=Number(veil==='initial');}
  }assert.equal(definitions,80);assert.equal(initials,20);
 });
 it('continues veterans at 193 and preserves all 312 saves through serialization and stale merge',()=>{
  let p=emptyProgress();baseline.ids.forEach(id=>finish(p,id));const old=loadProgress(JSON.stringify(p));
  assert.equal(mainJourneyState(p).current?.number,193);
  for(const [i,c] of HORIZON_CHAPTERS.entries()){
   assert.equal(mainJourneyState(p).current?.chapter.id,c.id);assert(mainJourneyChapters(p).find(x=>x.chapter.id===c.id)!.unlocked);
   const before=structuredClone(p);finish(p,c.id);p.last={themeId:c.themeId,level:0,journey:c.id};
   assert.equal(discoveryRewards(before,p).filter(x=>x.kind==='album').length,i%6===5?1:0);
  }
  assert(Buffer.byteLength(JSON.stringify({progress:p}))<150000);
  p=mergeProgress(old,loadProgress(JSON.stringify(p)));
  assert.equal(mainJourneyState(p).current,null);assert.equal(mainJourneyState(p).completed,312);assert(discoveryState(p).every(w=>w.complete));
  for(const [key,save] of Object.entries(old.saves))assert.deepEqual(p.saves[key],save);
 });
});
