import assert from 'node:assert/strict';
import {test} from 'node:test';
import {projectBoard,gridShape,surfaceLine} from '../lib/game/board-projection.ts';
import {viewCell,boardView} from '../lib/game/board-view.ts';
import {match,type Cell,type Puzzle} from '../lib/game/engine.ts';
import {wordSegments,boardIssues,PRESENTATION_RULES} from '../lib/game/board-quality.ts';
import {MAIN_JOURNEY} from '../lib/game/main-journey.ts';
import {journeyBoard} from '../lib/game/content.ts';
import {presentationBoard} from '../lib/game/journey-presentation.ts';
import {wordFlightPlan} from '../lib/game/word-feedback.ts';
import {advanceGesture,earlyWordEnd,gestureTip} from '../lib/game/input-gesture.ts';
import {fitGameFrame} from '../lib/game/viewport.ts';
const fifth=()=>{const chapter=MAIN_JOURNEY[4]!.chapter;return presentationBoard(journeyBoard(chapter),'route:'+chapter.id);};

test('chapter 5 removes twenty filler cells; saves, reverse finds, turns and flight origins round-trip',()=>{
 const source=fifth(),before=JSON.stringify(source),p=projectBoard(source);
 assert(p.compacted);assert.deepEqual(p.shape,{rows:10,columns:8});assert.equal(p.board.grid.flat().length,80);
 for(const target of source.targets)for(const path of wordSegments(source.grid,target.text))for(const turned of [false,true])for(const reverse of [false,true]){
  const original={id:target.id,a:reverse?path.b:path.a,b:reverse?path.a:path.b};
  const stroke={...original,a:p.toView(original.a),b:p.toView(original.b)};
  const displayed=boardView(p.board,turned),a=viewCell(stroke.a,p.shape,turned),b=viewCell(stroke.b,p.shape,turned);
  assert.equal(match(displayed,a,b)?.id,target.id);
  assert.deepEqual({id:target.id,a:p.fromView(viewCell(a,p.shape,turned)),b:p.fromView(viewCell(b,p.shape,turned))},original);
  const flight=wordFlightPlan(p.board,stroke,target,turned,{left:0,top:0,width:320,height:400},{left:0,top:0},{left:0,top:0,width:100,height:44})!;
  assert.equal(flight.letters.map(l=>displayed.grid.flat()[l.viewIndex]).join(''),target.text);
 }
 assert.equal(JSON.stringify(source),before);
});

test('every main chapter keeps all accepted paths including alternate occurrences and has safe new neighbours',()=>{
 let compacted=0;
 for(const {chapter} of MAIN_JOURNEY){
  const source=presentationBoard(journeyBoard(chapter),'route:'+chapter.id),p=projectBoard(source);
  if(p.compacted){compacted++;assert.deepEqual(boardIssues(p.board as Puzzle,PRESENTATION_RULES),[],chapter.id);}
  for(const t of source.targets)for(const path of wordSegments(source.grid,t.text)){
   const a=p.toView(path.a),b=p.toView(path.b);
   assert.equal(match(p.board,a,b)?.id,t.id,chapter.id);
   assert.deepEqual(p.fromView(a),path.a);assert.deepEqual(p.fromView(b),path.b);
  }
 }
 assert(compacted>0);
});

function fixture(words:string[]):Puzzle{
 const grid=Array.from({length:7},()=>Array<string>(7).fill('Ö'));
 const rows=[0,1,3,4,5,6];
 const targets=words.map((text,i)=>({id:String(i),text,label:text,group:i}));
 const placements=targets.map((t,i)=>{grid[rows[i]!]!.splice(0,6,...t.text);return {...t,a:[rows[i]!,0] as Cell,b:[rows[i]!,5] as Cell};});
 return {version:2,size:7,grid,targets,placements};
}
test('compression falls back when removing filler would create a blocked sequence',()=>{
 const source=fixture(['SAMANY','İLERİX','KIRAZX','DEFABC','LMNOPR','UVYZEQ']);
 assert.deepEqual(wordSegments(source.grid,'SİK'),[]);
 const p=projectBoard(source);assert(!p.compacted);assert.equal(p.board,source);
});
test('compression preserves all alternate answers and rejects newly created answers',()=>{
 const source=fixture(['ABCDEF','AYZXDE','BYZXPQ','CYZXRS','DEFGHI','LMNOPR']);
 source.targets.push({id:'short',text:'ABC',label:'ABC',group:6});
 assert.equal(wordSegments(source.grid,'ABC').length,1);
 const p=projectBoard(source);assert(!p.compacted);assert.equal(p.board,source);
});

test('rectangular edge swipes and continuous ink stop at the actual last column',()=>{
 const p=projectBoard(fifth()),shape=p.shape;
 assert.deepEqual(advanceGesture([9,0],[9,0],null,[10.2,8.1],shape).cell,[9,7]);
 assert.deepEqual(gestureTip([9,0],[9,7],[0,1],[10.2,8.1],shape),[9.5,7.5]);
 for(let r=0;r<10;r++)for(let c=0;c<8;c++)for(const end of [[0,0],[0,7],[9,0],[9,7]] as Cell[])
  assert(surfaceLine([r,c],end,shape).every(([y,x])=>y<10&&x<8));
 for(const target of p.board.targets)for(const path of wordSegments(p.board.grid,target.text))
  assert.deepEqual(earlyWordEnd(p.board,[target],[],path.a,path.b),path.b);
 assert.deepEqual(gridShape(boardView(p.board,true).grid),shape);
});
test('rectangle fitting budgets its full height and keeps square cells',()=>{
 for(const [w,h] of [[304,568],[359,667],[398,736],[414,824]]){
  const shape={rows:10,columns:8},fit=fitGameFrame(w!,h!,180,shape);
  assert(fit.boardSize<=w!);assert(fit.boardSize*10/8+180<=Math.max(h!,fit.minHeight));
 }
});
