import assert from 'node:assert/strict';
import {ALL_JOURNEYS,MYSTERIES,journeyBoard,mysteryBoard} from '../lib/game/content.ts';
import {exactLine,makeCustomPuzzle} from '../lib/game/engine.ts';
let count=0;
for(const entry of [...ALL_JOURNEYS,...MYSTERIES]){
 const board='answer' in entry?mysteryBoard(entry):journeyBoard(entry);
 for(const target of board.placements){const cells=exactLine(target.a,target.b,board.size);assert(cells);assert.equal(cells.map(([r,c])=>board.grid[r]![c]).join(''),target.text);}
 const slopes=new Set(board.placements.filter(p=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1]).map(p=>Math.sign((p.b[0]-p.a[0])*(p.b[1]-p.a[1]))));assert(slopes.has(1)&&slopes.has(-1));
 // A content edit must remain placeable outside its launch seed too.
 for(let seed=1;seed<=20;seed++)makeCustomPuzzle('answer' in entry?[...entry.words,entry.bonus]:entry.words,seed,entry.size);
 count++;
}
console.log(`${count} authored boards and ${count*20} alternate layouts passed.`);
