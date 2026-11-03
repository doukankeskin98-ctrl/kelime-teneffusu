import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {createHash} from 'node:crypto';
import baseline from './fixtures/journey-0271.json' with {type:'json'};
import {COAST_ROUTES,COAST_CHAPTERS} from '../lib/game/coast-content.ts';
import {journeyById,journeyBoard} from '../lib/game/content.ts';
import {MAIN_JOURNEY_IDS,mainJourneyState,mainJourneyChapters} from '../lib/game/main-journey.ts';
import {discoveryState,discoveryRewards} from '../lib/game/discovery.ts';
import {emptyProgress,cleanSave,loadProgress,mergeProgress,type Progress} from '../lib/game/progress.ts';
import {chapterVeils} from '../lib/game/world-presentation.ts';
import {reviewDraft} from '../lib/game/content-review.ts';
import {soloHintGuide} from '../lib/game/word-card.ts';
import {parseComfort} from '../lib/game/comfort.ts';
const finish=(p:Progress,id:string)=>{const board=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:board.placements,hints:0,elapsed:40,complete:false,stars:0},board);};
const veteran=()=>{const p=emptyProgress();for(const id of baseline.ids)finish(p,id);return p;};
describe('Kıyı Günlüğü append-only release',()=>{
 it('preserves all 96 published numbers and complete puzzle hashes',()=>{
  assert.equal(baseline.ids.length,96);assert.deepEqual(MAIN_JOURNEY_IDS.slice(0,96),baseline.ids);
  for(const [id,hash] of Object.entries(baseline.boards))assert.equal(createHash('sha256').update(JSON.stringify(journeyBoard(journeyById(id)!))).digest('hex'),hash,id);
  assert.deepEqual(MAIN_JOURNEY_IDS.slice(96),COAST_CHAPTERS.map(c=>c.id));
 });
 it('continues a completed old campaign at97 and keeps a new partial across load and merge',()=>{
  const p=veteran();assert.equal(mainJourneyState(p).current?.number,97);assert.equal(mainJourneyState(p).completed,96);
  const chapter=COAST_CHAPTERS[0]!,board=journeyBoard(chapter),key='route:'+chapter.id;
  p.saves[key]=cleanSave({strokes:[board.placements[0]!],hints:1,elapsed:23,stars:0,complete:false},board);p.last={themeId:chapter.themeId,level:0,journey:chapter.id};
  const restored=mergeProgress(loadProgress(JSON.stringify(p)),emptyProgress());assert.equal(mainJourneyState(restored).current?.chapter.id,chapter.id);assert.deepEqual(restored.saves[key],p.saves[key]);assert.equal(mainJourneyState(restored).completed,96);
 });
 it('uses independent 3/5/6 gates, bonus IDs, album IDs and exact reward IDs despite shared scenes',()=>{
  const p=veteran(),before=loadProgress(JSON.stringify(p)),route=COAST_ROUTES[0]!,second=COAST_ROUTES[1]!;
  assert.equal(discoveryState(p).find(s=>s.expedition.id===route.id)!.unlocked,true);
  assert.equal(discoveryState(p).find(s=>s.expedition.id===second.id)!.unlocked,false);
  for(const [i,chapter] of route.chapters.entries()){
   finish(p,chapter.id);const state=discoveryState(p).find(s=>s.expedition.id===route.id)!;
   assert.equal(state.pieces,i+1);assert.equal(state.bonus.id,route.chapters[5]!.id);assert.equal(state.album.themeId,route.id);assert.equal(state.bonusUnlocked,i>=4);assert.equal(state.complete,i===5);
   assert.equal(discoveryState(p).find(s=>s.expedition.id===second.id)!.unlocked,i>=2);
  }
  assert.equal(discoveryState(p).find(s=>s.expedition.id==='dunya')!.pieces,6);
  const rewards=discoveryRewards(before,p);assert.equal(rewards.filter(r=>r.kind==='piece').length,6);assert(rewards.some(r=>r.id==='album:'+route.id));assert.deepEqual(discoveryRewards(p,loadProgress(JSON.stringify(p))),[]);
  assert.equal(mainJourneyChapters(p).find(c=>c.chapter.id===second.chapters[5]!.id)!.unlocked,false);
 });
 it('adds24 bounded themed puzzles, four fully authored clue rounds and only one fully hidden word',()=>{
  assert.equal(COAST_CHAPTERS.length,24);assert.equal(COAST_CHAPTERS.filter(c=>c.clues).length,4);let hidden=0;
  for(const c of COAST_CHAPTERS){const b=journeyBoard(c);assert(b.size>=6&&b.size<=8);assert(b.targets.length>=4&&b.targets.length<=5);if(c.clues)assert.equal(Object.keys(c.clues).length,b.targets.length);hidden+=Object.values(chapterVeils(c.id,b.targets)).filter(v=>v==='hidden').length;}
  assert.equal(hidden,1);
 });
});
describe('content desk and comfort controls',()=>{
 it('blocks duplicate sets and unplayable drafts, reports incomplete clues and leaves original content intact',()=>{
  const c=COAST_CHAPTERS[0]!,original=JSON.stringify(c);assert(reviewDraft([...c.words].reverse(),c.size,'').errors.some(e=>e.includes('mevcut')));
  assert(reviewDraft(['GÖZLEMEVİ','AY'],6,'').errors.some(e=>e.includes('sığmıyor')));assert(reviewDraft(['DENİZ','DENİZ'],6,'').errors.some(e=>e.includes('birden fazla')));
  assert(reviewDraft(['GÜNEŞ','AY'],6,'GÜNEŞ = Gündüz gökte görünen yıldız.').errors.some(e=>e.includes('her hedef')));assert.equal(JSON.stringify(c),original);
 });
 it('exports valid authored clues and warns about mobile density without silently resizing',()=>{
  const result=reviewDraft(['KALEM','MÜREKKEP'],10,'KALEM = Yazı yazmak için kullanılan araç.\nMÜREKKEP = Yazıya renk veren sıvı.');assert.deepEqual(result.errors,[]);assert.equal(result.clues?.['KALEM'],'Yazı yazmak için kullanılan araç.');assert(result.warnings.length>0);
 });
 it('normalizes Turkish lowercase clue keys and rejects unrepresented split clues',()=>{
  const r=reviewDraft(['kalem','mürekkep'],8,'kalem = Yazı yazmaya yarayan araç.\nmürekkep = Yazıya renk veren sıvı.');assert.deepEqual(r.errors,[]);assert.equal(r.clues?.['KALEM'],'Yazı yazmaya yarayan araç.');assert.equal(r.clues?.['kalem'],undefined);
  assert(reviewDraft(['IŞIK YILI','AY'],6,'').errors.some(e=>e.includes('sığmıyor')));assert(reviewDraft(['KELİME BULMACASI','MARS'],8,'KELİME BULMACASI = Harfler arasında aranan oyun.\nMARS = Kızıl gezegen.').errors.some(e=>e.includes('tek parçalı')));
 });
 it('adds direction and path help without awarding strokes or mutating coordinates',()=>{
  for(const [a,b] of [[[1,1],[1,5]],[[5,5],[1,1]],[[5,1],[1,5]]] as const){const p={a:[...a] as [number,number],b:[...b] as [number,number]},raw=JSON.stringify(p);assert.equal(soloHintGuide(p,1).end,null);assert.deepEqual(soloHintGuide(p,2).end,[a[0]+Math.sign(b[0]-a[0]),a[1]+Math.sign(b[1]-a[1])]);assert.deepEqual(soloHintGuide(p,3).end,b);assert.equal(JSON.stringify(p),raw);}
 });
 it('accepts only explicit device preferences and safely handles old or unavailable storage',()=>{
  for(const raw of [null,'broken','null','{"leftHanded":"true","reduceMotion":1}'])assert.deepEqual(parseComfort(raw),{leftHanded:false,reduceMotion:false});
  assert.deepEqual(parseComfort('{"leftHanded":true,"reduceMotion":true}'),{leftHanded:true,reduceMotion:true});
 });
});
