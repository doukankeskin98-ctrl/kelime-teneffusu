import {replacementChapterId} from '../lib/game/original-content.ts';
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {existsSync} from 'node:fs';
import {ALL_JOURNEYS,journeyById,journeyBoard} from '../lib/game/content.ts';
import {EXPEDITIONS,expeditionTheme,expeditionForChapter} from '../lib/game/discovery.ts';
import {worldChapter,chapterVeils,veilInstruction} from '../lib/game/world-presentation.ts';
import {WORLD_SCENES,sceneImage,sceneForTheme} from '../lib/game/scene.ts';
import {wordCardCopy} from '../lib/game/word-card.ts';

describe('complete world presentation without changing authored puzzles',()=>{
 it('covers 32 routes over 16 shipped worlds and all 192 chapters with meaningful topics',()=>{
  assert.equal(EXPEDITIONS.length,32);assert.equal(new Set(Object.values(WORLD_SCENES)).size,16);
  for(const w of EXPEDITIONS){assert(existsSync('public'+sceneImage(sceneForTheme(expeditionTheme(w)))),w.id);const chapters=ALL_JOURNEYS.map(j=>journeyById(replacementChapterId(j.id))!).filter(j=>expeditionForChapter(j.id)?.id===w.id);assert.equal(chapters.length,6);assert.deepEqual(chapters.map(j=>worldChapter(j.id)!.position).sort(),[0,1,2,3,4,5]);assert.equal(new Set(chapters.map(j=>worldChapter(j.id)!.topic)).size,6);}
 });
 it('keeps most words open with at most one hidden target, retains clues and reveals confirmed answers',()=>{
  for(const j of ALL_JOURNEYS.map(j=>journeyById(replacementChapterId(j.id))!)){const board=journeyBoard(j),before=JSON.stringify(board),profile=chapterVeils(j.id,board.targets),info=worldChapter(j.id)!;
   if(j.clues)assert.deepEqual(profile,{});else{
    const modes=Object.values(profile),open=modes.filter(v=>v==='open').length,initial=modes.filter(v=>v==='initial').length,hidden=modes.filter(v=>v==='hidden').length;
    assert(open>initial+hidden,j.id+' should keep most target groups fully readable');
    assert.equal(modes[0],'open',j.id+' should start with a readable target');
    assert.equal(hidden,(j.id.startsWith('kiyi-')||j.id.startsWith('doga-')||j.id.startsWith('renkler-')||j.id.startsWith('kesif-'))?((j.id==='kiyi-fener-6'||j.id==='doga-gozlem-6'||j.id==='renkler-muzik-6'||j.id==='kesif-zaman-6')?1:0):info.position>=4?1:0,j.id+' hidden target limit');
    assert.equal(initial,(j.id.startsWith('kiyi-')||j.id.startsWith('doga-')||j.id.startsWith('renkler-')||j.id.startsWith('kesif-'))?(info.position===4?1:0):info.position>=2?1:0,j.id+' initial-letter target limit');
    assert.equal(!!veilInstruction(profile),hidden+initial>0);
    assert.equal(modes.length,new Set(board.targets.map(t=>t.group)).size,'split names count as one target');
   }
   for(const target of board.targets){const mask=profile[target.group],copy=wordCardCopy(target,false,j.clues,mask);if(mask==='hidden'){assert(!copy.text.includes(target.text));assert.match(copy.spoken!,/Saklı kelime/);}if(mask==='initial')assert.equal([...copy.text][0],[...target.label][0]);assert.equal(wordCardCopy(target,true,j.clues,mask).text,target.label);}
   assert.equal(JSON.stringify(board),before);assert.deepEqual(chapterVeils(j.id,JSON.parse(JSON.stringify(board.targets))),profile);
  }
  assert.equal(worldChapter('unknown'),null);assert.deepEqual(chapterVeils(undefined,[]),{});
 });
});
