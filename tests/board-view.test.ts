import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {boardView,viewCell,viewStrokes} from '../lib/game/board-view.ts';
import {TUTORIAL,JOURNEYS,journeyBoard} from '../lib/game/content.ts';
import {match,exactLine,type Cell} from '../lib/game/engine.ts';

describe('presentation-only half turn preserves playable words and stored progress',()=>{
 it('round-trips every real placement without mutating the saved board or strokes',()=>{
  for(const board of [TUTORIAL,...JOURNEYS.map(journeyBoard)]){
   const original=JSON.stringify(board),strokes=board.placements.map(({id,a,b})=>({id,a,b})),saved=JSON.stringify(strokes);
   const display=boardView(board,true),ink=viewStrokes(strokes,board.size,true);
   assert.deepEqual(boardView(display,true).grid,board.grid);
   for(const [i,p] of board.placements.entries()){
    const a=viewCell(p.a,board.size,true),b=viewCell(p.b,board.size,true);
    assert.equal(exactLine(a,b,board.size)!.map(([r,c])=>display.grid[r]![c]).join(''),p.text);
    assert.equal(match(board,viewCell(a,board.size,true),viewCell(b,board.size,true))?.id,p.id);
    assert.equal(match(board,viewCell(b,board.size,true),viewCell(a,board.size,true))?.id,p.id);
    assert.deepEqual(ink[i]!.a,a);assert.deepEqual(ink[i]!.b,b);
   }
   assert.equal(JSON.stringify(board),original);assert.equal(JSON.stringify(strokes),saved);
  }
 });
 it('maps hints and corners bijectively, and retains all original references when unturned',()=>{
  const strokes=[TUTORIAL.placements[0]!];assert.equal(boardView(TUTORIAL,false),TUTORIAL);assert.equal(viewStrokes(strokes,6,false),strokes);
  for(let size=4;size<=13;size++)for(let r=0;r<size;r++)for(let c=0;c<size;c++){
   const cell:Cell=[r,c];assert.deepEqual(viewCell(viewCell(cell,size,true),size,true),cell);
  }
 });
});
