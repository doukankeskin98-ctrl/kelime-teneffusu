import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {LIVING_STORIES,storyStage} from '../lib/game/story-content.ts';
import {ALL_JOURNEYS,PLAYABLE_JOURNEYS,journeyBoard} from '../lib/game/content.ts';
import {cleanSave,emptyProgress,loadProgress,mergeProgress} from '../lib/game/progress.ts';
import {discoveryRewards,keepBestSave} from '../lib/game/discovery.ts';
import {MAIN_JOURNEY_IDS,mainJourneyState} from '../lib/game/main-journey.ts';
import {match} from '../lib/game/engine.ts';

describe('living story content and existing saved worlds',()=>{
 it('adds five distinct deterministic stories without changing the 96 chapter campaign',()=>{
  assert.equal(LIVING_STORIES.length,5);assert.equal(ALL_JOURNEYS.length,96);assert.equal(MAIN_JOURNEY_IDS.length,96);
  assert.equal(new Set(LIVING_STORIES.map(s=>s.id)).size,5);
  assert.equal(LIVING_STORIES.flatMap(s=>s.steps).length,24);
  for(const story of LIVING_STORIES){
   assert(PLAYABLE_JOURNEYS.includes(story));assert(!ALL_JOURNEYS.includes(story));assert(!MAIN_JOURNEY_IDS.includes(story.id));
   const b=journeyBoard(story);assert.deepEqual(b,journeyBoard(story));assert.equal(b.targets.length,story.steps.length);
   assert.deepEqual(b.targets.map(t=>t.text),story.steps.map(s=>s.word));
   for(const placement of b.placements)assert.equal(match(b,placement.a,placement.b)?.id,placement.id);
   assert.equal(story.clues?.[story.steps[0]!.word],undefined);
   for(const step of story.steps.slice(1)){assert.equal(story.clues?.[step.word],step.clue);assert(!step.clue.toLocaleUpperCase('tr-TR').includes(step.word));}
  }
 });
 it('advances only after confirmed targets and does not complete from a filtered single-target view',()=>{
  for(const story of LIVING_STORIES){const b=journeyBoard(story),strokes=[];
   for(let i=0;i<story.steps.length;i++){
    const stage=storyStage(story,b,strokes);assert.equal(stage.index,i);assert.equal(stage.current?.word,story.steps[i]!.word);assert.equal(stage.complete,false);
    strokes.push(b.placements.find(p=>p.id===stage.target!.id)!);
    const saved=cleanSave({strokes,elapsed:12,hints:1,complete:true,stars:99},b);assert.equal(saved.complete,i===story.steps.length-1);assert.equal(saved.stars,saved.complete?2:0);
   }
   assert.equal(storyStage(story,b,strokes).complete,true);assert.equal(storyStage(story,b,strokes).current,null);
  }
 });
 it('recovers a sparse valid save at its first missing clue and merges without a second stage counter',()=>{
  const story=LIVING_STORIES[0]!,b=journeyBoard(story),key='route:'+story.id,at=(i:number)=>b.placements.find(p=>p.text===story.steps[i]!.word)!;
  const a=emptyProgress(),c=emptyProgress();a.saves[key]=cleanSave({strokes:[at(0),at(2)],elapsed:20,hints:1,complete:false,stars:0},b);c.saves[key]=cleanSave({strokes:[at(1)],elapsed:30,hints:2,complete:false,stars:0},b);
  assert.equal(storyStage(story,b,loadProgress(JSON.stringify(a)).saves[key]!.strokes).index,1);
  const merged=mergeProgress(a,c);assert.equal(storyStage(story,b,merged.saves[key]!.strokes).index,3);assert.equal(merged.saves[key]!.complete,false);
 });
 it('preserves every story and best result without awarding unrelated map pieces or moving campaign progress',()=>{
  const before=emptyProgress(),after=emptyProgress();before.last={themeId:'uzay',level:0,journey:'uzay-2'};after.last=before.last;
  for(const story of LIVING_STORIES){const b=journeyBoard(story),key='route:'+story.id;after.saves[key]=cleanSave({strokes:b.placements,elapsed:20,hints:0,complete:false,stars:0},b);after.saves[key]=keepBestSave(after.saves[key],cleanSave({strokes:b.placements,elapsed:90,hints:3,complete:false,stars:0},b));}
  const restored=loadProgress(JSON.stringify(after));assert.equal(Object.keys(restored.saves).length,5);assert.equal(restored.last?.journey,before.last.journey);assert.equal(mainJourneyState(restored).completed,0);assert.deepEqual(discoveryRewards(before,restored),[]);
  for(const save of Object.values(restored.saves)){assert.equal(save.complete,true);assert.equal(save.stars,3);assert.equal(save.elapsed,20);}
 });
});
