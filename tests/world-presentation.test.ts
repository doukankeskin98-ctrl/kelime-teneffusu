import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {existsSync} from 'node:fs';
import {ALL_JOURNEYS,journeyBoard} from '../lib/game/content.ts';
import {EXPEDITIONS} from '../lib/game/discovery.ts';
import {worldChapter,chapterVeils,veilInstruction} from '../lib/game/world-presentation.ts';
import {WORLD_SCENES,sceneImage,sceneForTheme} from '../lib/game/scene.ts';
import {wordCardCopy} from '../lib/game/word-card.ts';

describe('complete world presentation without changing authored puzzles',()=>{
 it('covers all 16 worlds with distinct shipped artwork and all 96 chapters with meaningful topics',()=>{
  assert.equal(EXPEDITIONS.length,16);assert.equal(new Set(Object.values(WORLD_SCENES)).size,16);
  for(const w of EXPEDITIONS){assert(existsSync('public'+sceneImage(sceneForTheme(w.id))),w.id);const chapters=ALL_JOURNEYS.filter(j=>j.themeId===w.id);assert.equal(chapters.length,6);assert.deepEqual(chapters.map(j=>worldChapter(j.id)!.position).sort(),[0,1,2,3,4,5]);assert.equal(new Set(chapters.map(j=>worldChapter(j.id)!.topic)).size,6);}
 });
 it('gradually reduces labels, retains clue rules and reveals confirmed answers in every chapter',()=>{
  for(const j of ALL_JOURNEYS){const board=journeyBoard(j),before=JSON.stringify(board),profile=chapterVeils(j.id,board.targets),info=worldChapter(j.id)!;
   if(j.clues)assert.deepEqual(profile,{});else if(info.position===0)assert(Object.values(profile).every(v=>v==='open'));else{assert(veilInstruction(profile));if(info.position>=3)assert(Object.values(profile).includes('hidden'));}
   for(const target of board.targets){const mask=profile[target.group],copy=wordCardCopy(target,false,j.clues,mask);if(mask==='hidden'){assert(!copy.text.includes(target.text));assert.match(copy.spoken!,/Saklı kelime/);}if(mask==='initial')assert.equal([...copy.text][0],[...target.label][0]);assert.equal(wordCardCopy(target,true,j.clues,mask).text,target.label);}
   assert.equal(JSON.stringify(board),before);assert.deepEqual(chapterVeils(j.id,JSON.parse(JSON.stringify(board.targets))),profile);
  }
  assert.equal(worldChapter('unknown'),null);assert.deepEqual(chapterVeils(undefined,[]),{});
 });
});
