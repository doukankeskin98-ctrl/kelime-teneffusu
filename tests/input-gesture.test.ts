import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {advanceGesture,CELL_HIT_RADIUS} from '../lib/game/input-gesture.ts';
import type {Cell} from '../lib/game/engine.ts';
const center=(cell:Cell):Cell=>[cell[0]+.5,cell[1]+.5];
const directions:Cell[]=[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
describe('center weighted eight-direction gestures',()=>{
 it('covers roughly seventy percent of a cell with an aspect-independent ellipse',()=>{assert(Math.PI*CELL_HIT_RADIUS**2>.69);assert(Math.PI*CELL_HIT_RADIUS**2<.71);});
 it('does not lock on corner jitter before the intended diagonal center',()=>{
  const start:Cell=[2,2];let step=advanceGesture(start,start,null,[2.99,3.01],9);assert.equal(step.axis,null);assert.deepEqual(step.cell,start);
  step=advanceGesture(start,step.cell,step.axis,[3.5,3.5],9);assert.deepEqual(step.axis,[1,1]);assert.deepEqual(step.cell,[3,3]);
 });
 for(const direction of directions)it('locks, advances and reverses on axis '+direction.join(','),()=>{
  const start:Cell=[4,4],next:Cell=[4+direction[0],4+direction[1]],end:Cell=[4+3*direction[0],4+3*direction[1]];
  let step=advanceGesture(start,start,null,center(next),9);assert.deepEqual(step.axis,direction);step=advanceGesture(start,step.cell,step.axis,center(end),9);assert.deepEqual(step.cell,end);
  step=advanceGesture(start,step.cell,step.axis,center(next),9,true);assert.deepEqual(step.cell,next);step=advanceGesture(start,step.cell,step.axis,center(start),9);assert.deepEqual(step.cell,start);
 });
 it('keeps the previous endpoint when drifting onto another row instead of rotating a locked axis',()=>{const step=advanceGesture([2,0],[2,2],[0,1],[3.5,3.5],9,true);assert.deepEqual(step.cell,[2,2]);assert.deepEqual(step.axis,[0,1]);});
 it('supports a release without any move and rejects invalid/outside input',()=>{
  assert.deepEqual(advanceGesture([0,0],[0,0],null,[5.5,5.5],6,true).cell,[5,5]);
  for(const point of [[NaN,1],[Infinity,0],[-50,-50],[100,100],[1e12,-1e12]] as Cell[])assert.deepEqual(advanceGesture([0,0],[0,0],null,point,6,true).cell,[0,0]);
 });
 it('never returns an out-of-board or off-axis endpoint for sampled drags',()=>{
  for(let n=6;n<=13;n++)for(const direction of directions)for(let k=-30;k<=30;k++){
   const start:Cell=[Math.floor(n/2),Math.floor(n/2)],step=advanceGesture(start,start,direction,[start[0]+.5+k*.2*direction[0],start[1]+.5+k*.2*direction[1]],n,true);
   assert(step.cell.every(v=>v>=0&&v<n&&Number.isInteger(v)));assert.ok((step.cell[0]-start[0])*direction[1]===(step.cell[1]-start[1])*direction[0]);
  }
 });
});
