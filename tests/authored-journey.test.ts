import assert from 'node:assert/strict';
import {it} from 'node:test';
import {AUTHORED_JOURNEY,authoredRevision} from '../lib/game/authored-journey.ts';
import {MAIN_JOURNEY} from '../lib/game/main-journey.ts';
import {playableJourney,revisionSave} from '../lib/game/journey-revisions.ts';
import {projectBoard} from '../lib/game/board-projection.ts';
import {presentationBoard} from '../lib/game/journey-presentation.ts';
import {chapterVeils,worldChapter} from '../lib/game/world-presentation.ts';
import {match} from '../lib/game/engine.ts';
import {cleanSave,emptyProgress,mergeProgress,progressBoard,readProgress} from '../lib/game/progress.ts';
import {encodeProgress} from '../lib/game/progress-codec.ts';
import {wordSegments} from '../lib/game/board-quality.ts';

it('keeps published, started and completed boards pinned while opting only fresh pilot chapters into the exact reviewed grid',()=>{
 const ids=Object.keys(AUTHORED_JOURNEY);
 assert.deepEqual(ids,MAIN_JOURNEY.map(item=>item.chapter.id));
 let count=0;
 for(const id of ids){
  const key='route:'+id,p=emptyProgress(),level=AUTHORED_JOURNEY[id]!,rev=authoredRevision(id);
  assert.equal(playableJourney(id,p)?.revision,undefined);
  assert.equal(playableJourney(id,p,true)?.revision,rev);
  const board=progressBoard(key,rev)!;
  assert.deepEqual(board.grid.map(r=>r.join('')),level.grid);
  assert.equal(worldChapter(id,rev)?.topic,level.band);
  assert.equal(presentationBoard(board,key+'@'+rev),board);
  assert.equal(projectBoard(board).board,board);
  const veils=chapterVeils(id,board.targets,rev);
  for(const t of board.placements){
   assert.equal(wordSegments(board.grid,t.text).length,1);
   assert.equal(match(board,t.a,t.b)?.id,t.id);assert.equal(match(board,t.b,t.a)?.id,t.id);
   if(!level.clues)assert.equal(veils[t.group],level.hiddenIds.includes(t.id)?'initial':'open');count++;
  }
  assert.equal(match(board,[0,0],[0,board.grid[0]!.length]),null);
  for(const revision of [1,rev] as const){
   const b=progressBoard(key,revision)!;
   for(const complete of [false,true]){
    const strokes=b.placements.slice(0,complete?undefined:2).map(s=>({id:s.id,a:s.b,b:s.a}));
    p.saves[key]=cleanSave({...(revision>1?{revision:revision as 2|3}:{}),strokes,complete,hints:1,stars:complete?2:0,elapsed:35},b);
    const restored=readProgress(encodeProgress(p));
    assert.deepEqual(restored.saves[key],p.saves[key]);
    assert.equal(playableJourney(id,restored,true)?.revision??1,revision);
    assert.equal(playableJourney(id,restored,false)?.revision??1,revision);
   }
  }
  const older=emptyProgress(),old=progressBoard(key,1)!;
  older.saves[key]=cleanSave({strokes:old.placements.slice(0,1),elapsed:9,hints:0,stars:0,complete:false},old);
  const merged=mergeProgress(older,p);
  assert.deepEqual(revisionSave(merged,key,1),older.saves[key]);
  assert.deepEqual(revisionSave(merged,key,rev),p.saves[key]);
 }
 assert.equal(count,3159);

});
