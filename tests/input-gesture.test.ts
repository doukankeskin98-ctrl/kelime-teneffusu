import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {advanceGesture,CELL_HIT_RADIUS,earlyWordEnd} from '../lib/game/input-gesture.ts';
import type {Cell} from '../lib/game/engine.ts';
const center=(cell:Cell):Cell=>[cell[0]+.5,cell[1]+.5];
const directions:Cell[]=[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
describe('center weighted eight-direction gestures',()=>{
 it('covers roughly seventy percent of a cell with an aspect-independent ellipse',()=>{assert(Math.PI*CELL_HIT_RADIUS**2>.69);assert(Math.PI*CELL_HIT_RADIUS**2<.71);});
 it('does not lock on corner jitter before the intended diagonal center',()=>{
  const start:Cell=[2,2];let step=advanceGesture(start,start,null,[2.99,3.01],9);assert.equal(step.axis,null);assert.deepEqual(step.cell,start);
  step=advanceGesture(start,step.cell,step.axis,[3.5,3.5],9);assert.deepEqual(step.axis,[1,1]);assert.deepEqual(step.cell,[3,3]);
 });
 for(const direction of directions)it('advances and shortens on ray '+direction.join(','),()=>{
  const start:Cell=[4,4],next:Cell=[4+direction[0],4+direction[1]],end:Cell=[4+3*direction[0],4+3*direction[1]];
  let step=advanceGesture(start,start,null,center(next),9);assert.deepEqual(step.axis,direction);step=advanceGesture(start,step.cell,step.axis,center(end),9);assert.deepEqual(step.cell,end);
  step=advanceGesture(start,step.cell,step.axis,center(next),9,true);assert.deepEqual(step.cell,next);step=advanceGesture(start,step.cell,step.axis,center(start),9);assert.deepEqual(step.cell,start);
 });
 it('keeps the previous endpoint for a small drift between valid rays',()=>{const step=advanceGesture([2,0],[2,2],[0,1],[3.5,3.5],9,true);assert.deepEqual(step.cell,[2,2]);assert.deepEqual(step.axis,[0,1]);});
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

describe('fixed-anchor pivot selection',()=>{
 for(const order of [directions,[...directions].reverse()])it('rotates through all eight rays without returning to the anchor '+order[0],()=>{
  const start:Cell=[4,4];let step={cell:start,axis:null as Cell|null};
  for(const direction of [...order,...order]){
   const end:Cell=[4+direction[0]*3,4+direction[1]*3];
   step=advanceGesture(start,step.cell,step.axis,center(end),9);
   assert.deepEqual(step.cell,end);assert.deepEqual(step.axis,direction);
  }
 });
 it('can change direction on release and then retract to the anchor',()=>{
  const start:Cell=[3,3];const step=advanceGesture(start,[0,3],[-1,0],[3.5,6.6],9,true);
  assert.deepEqual(step.cell,[3,6]);assert.deepEqual(step.axis,[0,1]);
  assert.deepEqual(advanceGesture(start,step.cell,step.axis,center(start),9).cell,start);
 });
 it('does not flicker between rays at a sector boundary or force a remote sample into a new ray',()=>{
  const start:Cell=[4,4],current:Cell=[4,7],axis:Cell=[0,1];
  for(const point of [[5.73,7.5],[5.75,7.5],[5.77,7.5],[NaN,0],[100,100]] as Cell[]){
   const step=advanceGesture(start,current,axis,point,9);assert.deepEqual(step,{cell:current,axis});
  }
 });
});


describe('early match rays preserve straight-line rules',()=>{
 for(const direction of directions)it('recognizes a fast skipped endpoint in direction '+direction,()=>{
  const size=9,start:Cell=[4,4],end:Cell=[4+4*direction[0],4+4*direction[1]],grid=Array.from({length:size},()=>Array<string>(size).fill('X'));
  [...'KALE'].forEach((ch,i)=>{grid[start[0]+i*direction[0]]![start[1]+i*direction[1]]=ch;});
  const target={id:'0.0',group:0,label:'KALE',text:'KALE'},expected:Cell=[4+3*direction[0],4+3*direction[1]];
  assert.deepEqual(earlyWordEnd({grid,size},[target],[],start,end),expected);
  assert.equal(earlyWordEnd({grid,size},[target],[{id:target.id,a:start,b:expected}],start,end),null);
  assert.equal(earlyWordEnd({grid,size},[],[],start,end),null);
 });
});


describe('bounded edge capture preserves direction and target ambiguity',()=>{
 for(const direction of directions)for(const release of [false,true])it('accepts fractional overshoot on axis '+direction+' release '+release,()=>{
  const start:Cell=[3,3],size=7,edge:Cell=[3+direction[0]*3,3+direction[1]*3],outside:Cell=[3.5+direction[0]*4.23,3.5+direction[1]*4.23];
  for(const axis of [null,direction])assert.deepEqual(advanceGesture(start,start,axis,outside,size,release).cell,edge);
  const drift:Cell=[outside[0]+direction[1]*.8,outside[1]-direction[0]*.8];assert.deepEqual(advanceGesture(start,start,direction,drift,size,release).cell,start);
 });
 it('does not auto-accept KALE while KALEM remains possible on the same ray',()=>{
  const targets=['KALE','KALEM'].map((text,group)=>({id:group+'.0',group,label:text,text})),board={size:6,grid:[[...'KALEMX'],...Array.from({length:5},()=>Array<string>(6).fill('X'))]};
  assert.equal(earlyWordEnd(board,targets,[],[0,0],[0,3]),null);
  const step=advanceGesture([0,0],[0,0],null,[.5,7.4],6);assert.deepEqual(earlyWordEnd(board,targets,[],[0,0],step.cell),[0,4]);
 });
});

it('captures exact board edges and opposite corners but rejects beyond the two-cell grace band',()=>{
 for(const release of [false,true])for(const [start,point,expected] of [[[0,0],[6,6],[5,5]],[[5,5],[0,0],[0,0]],[[0,0],[.5,6],[0,5]],[[0,0],[.5,8],[0,5]],[[5,5],[5.5,-2],[5,0]]] as [Cell,Cell,Cell][])assert.deepEqual(advanceGesture(start,start,null,point,6,release).cell,expected);
 for(const point of [[.5,8.00001],[5.5,-2.00001]] as Cell[])assert.deepEqual(advanceGesture([0,0],[0,0],null,point,6,true).cell,[0,0]);
});
