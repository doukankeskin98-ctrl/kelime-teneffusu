import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {MAIN_JOURNEY,MAIN_JOURNEY_IDS,FIRST_TEN_LESSONS,mainJourneyState,nextMainChapter,nextMainMilestone,nextChapterLabel} from '../lib/game/main-journey.ts';
import {ALL_JOURNEYS,journeyById,journeyBoard} from '../lib/game/content.ts';
import {cleanSave,emptyProgress,loadProgress,mergeProgress,type Progress} from '../lib/game/progress.ts';
import {discoveryState,discoveryRewards,keepBestSave} from '../lib/game/discovery.ts';
const finish=(p:Progress,id:string,hints=0)=>{const b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:b.placements,hints,elapsed:45,complete:false,stars:0},b);return p;};
const copy=(p:Progress)=>JSON.parse(JSON.stringify(p)) as Progress;

describe('numbered main journey preserves the existing saved worlds',()=>{
 it('numbers every existing journey exactly once, without introducing duplicate content',()=>{
  assert.equal(MAIN_JOURNEY.length,96);assert.equal(new Set(MAIN_JOURNEY_IDS).size,96);
  assert.deepEqual([...MAIN_JOURNEY_IDS].sort(),ALL_JOURNEYS.map(j=>j.id).sort());
  const words=MAIN_JOURNEY.map(x=>[...x.chapter.words].map(w=>w.toLocaleUpperCase('tr-TR').replace(/\s/g,'')).sort().join('|'));
  const grids=MAIN_JOURNEY.map(x=>JSON.stringify(journeyBoard(x.chapter).grid));
  assert.equal(new Set(words).size,words.length);assert.equal(new Set(grids).size,grids.length);
 });
 it('starts at one, never substitutes a standard/archive game for the main journey, and resumes a real old partial',()=>{
  let p=emptyProgress();assert.equal(mainJourneyState(p).current?.number,1);assert.equal(mainJourneyState(p).continuing,false);
  p.last={themeId:'hababam',level:2};assert.equal(mainJourneyState(p).current?.number,1);
  const b=journeyBoard(journeyById('turkiye-4')!);p.saves['route:turkiye-4']=cleanSave({strokes:[b.placements[0]!],elapsed:12,hints:1,complete:false,stars:0},b);p.last={themeId:'turkiye',level:0,journey:'turkiye-4'};
  const loaded=loadProgress(JSON.stringify(p)),state=mainJourneyState(loaded);assert.equal(state.current?.number,13);assert.equal(state.continuing,true);assert.equal(state.completed,0);assert.equal(state.total,96);
  assert.equal(nextMainChapter(loaded)?.number,1);assert.equal(loaded.saves['route:uzay-1'],undefined);
 });
 it('retains elapsed or hinted continuations with no found word, but does not call untouched content resumed',()=>{
  const p=emptyProgress(),b=journeyBoard(journeyById('uzay-2')!);p.last={themeId:'uzay',level:0,journey:'uzay-2'};
  p.saves['route:uzay-2']=cleanSave({strokes:[],elapsed:20,hints:1,complete:false,stars:0},b);assert.equal(mainJourneyState(p).current?.number,2);assert.equal(mainJourneyState(p).continuing,true);
  p.saves['route:uzay-2']=cleanSave(undefined,b);assert.equal(mainJourneyState(p).current?.number,1);assert.equal(mainJourneyState(p).continuing,false);
 });
 it('makes the first ten playable in order, varies themes, teaches concrete skills and completes the first album at ten',()=>{
  const p=emptyProgress();assert.deepEqual(MAIN_JOURNEY_IDS.slice(0,10),['uzay-1','uzay-2','uzay-3','turkiye-1','uzay-4','turkiye-2','turkiye-3','hababam-1','uzay-5','uzay-gozlemevi']);
  assert.equal(nextMainMilestone(p)?.remaining,3);
  for(let i=0;i<10;i++){
   const current=mainJourneyState(p).current!;assert.equal(current.number,i+1);assert.ok(FIRST_TEN_LESSONS[current.chapter.id]);
   const before=copy(p);finish(p,current.chapter.id,3);p.last={themeId:current.chapter.themeId,level:0,journey:current.chapter.id};
   const rewards=discoveryRewards(before,p);assert.equal(rewards.filter(r=>r.kind==='piece').length,1);
   if(i===2||i===6)assert.equal(rewards.filter(r=>r.kind==='world').length,1);
   if(i===9)assert.ok(rewards.some(r=>r.kind==='album'&&r.themeId==='uzay'));
   assert.equal(nextMainChapter(p)?.number,i+2);
  }
  assert.equal(discoveryState(p)[0]!.pieces,6);assert.equal(new Set(MAIN_JOURNEY.slice(0,10).map(x=>x.chapter.themeId)).size,3);
 });
 it('fills actual gaps without resetting old completions or assuming earlier numbers were finished',()=>{
  const p=finish(finish(emptyProgress(),'uzay-2'),'turkiye-4');p.last={themeId:'turkiye',level:0,journey:'turkiye-4'};
  assert.equal(mainJourneyState(p).current?.number,1);assert.equal(mainJourneyState(p).completed,2);
  const merged=mergeProgress(p,finish(emptyProgress(),'uzay-1'));assert.equal(nextMainChapter(merged)?.number,3);assert.equal(merged.saves['route:turkiye-4']?.complete,true);
 });
 it('does not multiply rewards on replay, preserves the best and reports finite completion honestly',()=>{
  const p=finish(emptyProgress(),'uzay-1'),before=copy(p),b=journeyBoard(journeyById('uzay-1')!);
  p.saves['route:uzay-1']=keepBestSave(p.saves['route:uzay-1'],cleanSave({strokes:b.placements,hints:3,elapsed:90,complete:false,stars:0},b));
  assert.deepEqual(discoveryRewards(before,p),[]);assert.equal(p.saves['route:uzay-1']!.stars,3);
  for(const item of MAIN_JOURNEY)finish(p,item.chapter.id);
  assert.equal(mainJourneyState(loadProgress(JSON.stringify(p))).current,null);assert.equal(mainJourneyState(p).completed,96);assert.equal(nextMainMilestone(p),null);
 });
 it('uses readable Turkish next-action labels',()=>{assert.equal(nextChapterLabel(2),'Bölüm 2’ye geç');assert.equal(nextChapterLabel(6),'Bölüm 6’ya geç');assert.equal(nextChapterLabel(10),'Bölüm 10’a geç');});
});
