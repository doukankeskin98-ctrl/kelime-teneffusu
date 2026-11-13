import {replacementChapterId} from '../lib/game/original-content.ts';
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {MAIN_JOURNEY,MAIN_JOURNEY_IDS,FIRST_TEN_LESSONS,mainJourneyState,mainJourneyChapters,nextMainChapter,nextMainMilestone,nextChapterLabel} from '../lib/game/main-journey.ts';
import {ALL_JOURNEYS,journeyById,journeyBoard} from '../lib/game/content.ts';
import {cleanSave,emptyProgress,loadProgress,mergeProgress,type Progress} from '../lib/game/progress.ts';
import {discoveryState,discoveryRewards,keepBestSave} from '../lib/game/discovery.ts';
const finish=(p:Progress,id:string,hints=0)=>{const b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:b.placements,hints,elapsed:45,complete:false,stars:0},b);return p;};
const copy=(p:Progress)=>JSON.parse(JSON.stringify(p)) as Progress;

describe('numbered main journey preserves the existing saved worlds',()=>{
 it('numbers every existing journey exactly once, without introducing duplicate content',()=>{
  assert.equal(MAIN_JOURNEY.length,312);assert.equal(new Set(MAIN_JOURNEY_IDS).size,312);
  assert.deepEqual([...MAIN_JOURNEY_IDS].sort(),ALL_JOURNEYS.map(j=>replacementChapterId(j.id)).sort());
  const words=MAIN_JOURNEY.map(x=>[...x.chapter.words].map(w=>w.toLocaleUpperCase('tr-TR').replace(/\s/g,'')).sort().join('|'));
  const grids=MAIN_JOURNEY.map(x=>JSON.stringify(journeyBoard(x.chapter).grid));
  assert.equal(new Set(words).size,words.length);assert.equal(new Set(grids).size,grids.length);
 });
 it('starts at one, never substitutes a standard/archive game for the main journey, and resumes a real old partial',()=>{
  let p=emptyProgress();assert.equal(mainJourneyState(p).current?.number,1);assert.equal(mainJourneyState(p).continuing,false);
  p.last={themeId:'hababam',level:2};assert.equal(mainJourneyState(p).current?.number,1);
  const b=journeyBoard(journeyById('turkiye-4')!);p.saves['route:turkiye-4']=cleanSave({strokes:[b.placements[0]!],elapsed:12,hints:1,complete:false,stars:0},b);p.last={themeId:'turkiye',level:0,journey:'turkiye-4'};
  const loaded=loadProgress(JSON.stringify(p)),state=mainJourneyState(loaded);assert.equal(state.current?.number,10);assert.equal(state.continuing,true);assert.equal(state.completed,0);assert.equal(state.total,312);
  assert.equal(nextMainChapter(loaded)?.number,1);assert.equal(loaded.saves['route:uzay-1'],undefined);
 });
 it('retains elapsed or hinted continuations with no found word, but does not call untouched content resumed',()=>{
  const p=emptyProgress(),b=journeyBoard(journeyById('uzay-2')!);p.last={themeId:'uzay',level:0,journey:'uzay-2'};
  p.saves['route:uzay-2']=cleanSave({strokes:[],elapsed:20,hints:1,complete:false,stars:0},b);assert.equal(mainJourneyState(p).current?.number,2);assert.equal(mainJourneyState(p).continuing,true);
  p.saves['route:uzay-2']=cleanSave(undefined,b);assert.equal(mainJourneyState(p).current?.number,1);assert.equal(mainJourneyState(p).continuing,false);
 });
 it('numbers the actual path consecutively while completing a world before continuing to the next',()=>{
  const p=emptyProgress(),expected=['uzay-1','uzay-2','uzay-3','uzay-4','uzay-5','uzay-gozlemevi','turkiye-1','turkiye-2','turkiye-3','turkiye-4'];
  assert.deepEqual(MAIN_JOURNEY_IDS.slice(0,10),['uzay-1','uzay-2','uzay-3','turkiye-1','uzay-4','turkiye-2','turkiye-3','ozgun-okul-1','uzay-5','uzay-gozlemevi']);
  assert.equal(nextMainMilestone(p)?.remaining,3);
  for(const [i,id] of expected.entries()){
   const current=mainJourneyState(p).current!;assert.equal(current.chapter.id,id);assert.equal(current.number,i+1);const before=copy(p);finish(p,id,3);p.last={themeId:current.chapter.themeId,level:0,journey:id};
   const rewards=discoveryRewards(before,p);assert.equal(rewards.filter(r=>r.kind==='piece').length,1);
   if(i===2){assert.equal(nextMainMilestone(p,'uzay-4')?.remaining,3);assert.equal(mainJourneyChapters(p).find(c=>c.chapter.id==='turkiye-1')!.unlocked,true);}
   if(i===5)assert.ok(rewards.some(r=>r.kind==='album'&&r.themeId==='uzay'));
  }
  assert.equal(discoveryState(p)[0]!.pieces,6);
 });
 it('fills actual gaps without resetting old completions or assuming earlier numbers were finished',()=>{
  const p=finish(finish(emptyProgress(),'uzay-2'),'turkiye-4');p.last={themeId:'turkiye',level:0,journey:'turkiye-4'};
  assert.equal(mainJourneyState(p).current?.chapter.id,'turkiye-1');assert.equal(mainJourneyState(p).completed,2);
  const merged=mergeProgress(p,finish(emptyProgress(),'uzay-1'));assert.equal(nextMainChapter(merged)?.number,3);assert.equal(merged.saves['route:turkiye-4']?.complete,true);
 });
 it('does not multiply rewards on replay, preserves the best and reports finite completion honestly',()=>{
  const p=finish(emptyProgress(),'uzay-1'),before=copy(p),b=journeyBoard(journeyById('uzay-1')!);
  p.saves['route:uzay-1']=keepBestSave(p.saves['route:uzay-1'],cleanSave({strokes:b.placements,hints:3,elapsed:90,complete:false,stars:0},b));
  assert.deepEqual(discoveryRewards(before,p),[]);assert.equal(p.saves['route:uzay-1']!.stars,3);
  for(const item of MAIN_JOURNEY)finish(p,item.chapter.id);
  assert.equal(mainJourneyState(loadProgress(JSON.stringify(p))).current,null);assert.equal(mainJourneyState(p).completed,312);assert.equal(nextMainMilestone(p),null);
 });
 it('uses readable Turkish next-action labels',()=>{assert.equal(nextChapterLabel(2),'Bölüm 2’ye geç');assert.equal(nextChapterLabel(6),'Bölüm 6’ya geç');assert.equal(nextChapterLabel(10),'Bölüm 10’a geç');});
});


describe('chapter picker and legacy continuation share access rules',()=>{
 it('locks unopened worlds and album finales without changing any progress',()=>{
  const p=emptyProgress(),before=JSON.stringify(p),items=mainJourneyChapters(p);
  assert.equal(items.length,312);assert.equal(items.find(x=>x.chapter.id==='uzay-1')!.unlocked,true);
  assert.equal(items.find(x=>x.chapter.id==='turkiye-1')!.unlocked,false);
  assert.equal(items.find(x=>x.chapter.id==='uzay-gozlemevi')!.unlocked,false);assert.equal(JSON.stringify(p),before);
  for(let i=1;i<=5;i++)finish(p,'uzay-'+i);
  assert.equal(mainJourneyChapters(p).find(x=>x.chapter.id==='uzay-gozlemevi')!.unlocked,true);
 });
 it('retains elapsed-only, hint-only and partial bonus saves in later worlds without awarding progress',()=>{
  for(const id of ['turkiye-4','turkiye-kartpostal'])for(const partial of [{elapsed:20,hints:0},{elapsed:0,hints:1}]){
   const p=emptyProgress(),b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:[],...partial,complete:false,stars:0},b);p.last={themeId:'turkiye',level:0,journey:id};
   const before=JSON.stringify(p),loaded=loadProgress(before),item=mainJourneyChapters(loaded).find(x=>x.chapter.id===id)!;
   assert.equal(item.unlocked,true);assert.equal(item.continuing,true);assert.equal(item.complete,false);assert.equal(mainJourneyState(loaded).current?.chapter.id,id);assert.equal(mainJourneyState(loaded).completed,0);assert.equal(JSON.stringify(p),before);
  }
  const untouched=emptyProgress();untouched.saves['route:turkiye-kartpostal']=cleanSave(undefined,journeyBoard(journeyById('turkiye-kartpostal')!));assert.equal(mainJourneyChapters(untouched).find(x=>x.chapter.id==='turkiye-kartpostal')!.unlocked,false);
 });
});

it('keeps optional first-ten coaching aligned with the visible journey without unlock promises',()=>{
 assert.deepEqual(Object.keys(FIRST_TEN_LESSONS).sort(),MAIN_JOURNEY.slice(0,10).map(x=>x.chapter.id).sort());
 for(const copy of Object.values(FIRST_TEN_LESSONS)){assert(copy.length<=70);assert(!/dünyayı açar|albümünü tamamlar/.test(copy));}
});
