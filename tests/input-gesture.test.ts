import {nearMissMessage} from '../lib/game/word-card.ts';
import {journeyBoard,journeyById} from '../lib/game/content.ts';
import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {advanceGesture,CELL_HIT_RADIUS,earlyWordEnd,gestureTip} from '../lib/game/input-gesture.ts';
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


describe('whole-cell acceptance on an established word ray',()=>{
 it('accepts the TROYA last-cell corner that previously painted A but kept TROY',()=>{
  for(const release of [false,true]){
   const step=advanceGesture([3,2],[6,5],[1,1],[7.01,6.99],8,release);
   assert.deepEqual(step.cell,[7,6]);
  }
 });
 for(const direction of directions)it('accepts all four corners of a distant on-ray letter '+direction,()=>{
  const start:Cell=[4,4],end:Cell=[4+3*direction[0],4+3*direction[1]],previous:Cell=[4+2*direction[0],4+2*direction[1]];
  for(const y of [.01,.99])for(const x of [.01,.99])for(const release of [false,true]){
   const step=advanceGesture(start,previous,direction,[end[0]+y,end[1]+x],9,release);
   assert.deepEqual(step.cell,end);assert.deepEqual(step.axis,direction);
  }
 });
 it('does not turn an adjacent off-ray cell into the intended final letter',()=>{
  for(const point of [[6.99,6.99],[7.01,7.01]] as Cell[]){
   const step=advanceGesture([3,2],[6,5],[1,1],point,8);assert.deepEqual(step.cell,[6,5]);
  }
 });
 it('keeps the ink at the last selected letter for off-ray samples in all eight directions',()=>{
  const start:Cell=[4,4];
  for(const [dr,dc] of directions){
   const current:Cell=[4+2*dr,4+2*dc],axis:Cell=[dr,dc];
   const besideNext:Cell=[4.5+3*dr+.6*dc,4.5+3*dc-.6*dr];
   const selection=advanceGesture(start,current,axis,besideNext,9);
   assert.deepEqual(selection.cell,current);
   assert.deepEqual(gestureTip(start,selection.cell,selection.axis,besideNext,9),center(current));
   const withinCurrent:Cell=[4.5+2.2*dr,4.5+2.2*dc];
   assert.deepEqual(gestureTip(start,current,axis,withinCurrent,9),withinCurrent);
  }
 });
});

describe('a captured swipe can follow the outside edge of the board',()=>{
 const cases:[Cell,Cell,Cell,Cell][]=[
  [[0,8],[0,2],[-.16,.5],[0,0]],
  [[8,0],[8,6],[9.16,8.5],[8,8]],
  [[8,0],[2,0],[.5,-.16],[0,0]],
  [[0,8],[6,8],[8.5,9.16],[8,8]],
 ];
 for(const [start,previous,point,end] of cases){
  it('accepts move and release along the edge from '+start,()=>{
   for(const release of [false,true]){
    const axis:Cell=[Math.sign(end[0]-start[0]),Math.sign(end[1]-start[1])];
    assert.deepEqual(advanceGesture(start,previous,axis,point,9,release).cell,end);
   }
  });
 }
 it('preserves fractional ink outside the top border without reaching a different letter',()=>{
  const [row,column]=gestureTip([0,8],[0,1],[0,-1],[-.2,1.21],9);
  assert.equal(row,.5);assert(Math.abs(column-1.21)<1e-10);
 });
 it('rejects a distant excursion above the row and a touch on another row',()=>{
  for(const y of [-1,1.42])assert.deepEqual(advanceGesture([0,8],[0,2],[0,-1],[y,.5],9,true).cell,[0,2]);
 });
});

describe('useful misses do not award or expose masked answers',()=>{
 const board=journeyBoard(journeyById('hababam-3')!);
 const visible=board.targets.filter(t=>t.label==='BADİ EKREM');
 it('distinguishes missing start, missing end and an unrelated stroke in both directions',()=>{
  assert.equal(nearMissMessage(board,[0,8],[0,1],visible),'M harfine kadar kaydır.');
  assert.equal(nearMissMessage(board,[0,8],[0,2],visible),'M harfine kadar kaydır.');
  assert.equal(nearMissMessage(board,[0,7],[0,0],visible),'B harfinden başla.');
  assert.equal(nearMissMessage(board,[0,0],[0,7],visible),'B harfine kadar kaydır.');
  assert.equal(nearMissMessage(board,[1,8],[1,1],visible),'Tekrar dene.');
  assert.equal(nearMissMessage(board,[0,8],[0,1],[]),'Tekrar dene.');
  assert.equal(nearMissMessage(board,[0,8],[0,6],visible),'Tekrar dene.');
 });
});
