import {groupPuzzle,groupRiddlePuzzle} from '../lib/game/group-content.ts';
import assert from 'node:assert/strict';
import {PLAYABLE_JOURNEYS,MYSTERIES,journeyBoard,mysteryBoard} from '../lib/game/content.ts';
import {exactLine,makeCustomPuzzle} from '../lib/game/engine.ts';
import {RELEASE_BATCHES} from '../lib/studio/releases.ts';
import {checkChapter} from '../lib/studio/content.ts';
import {assertOriginalReleases,assertReleaseManifest} from '../lib/studio/release-audit.ts';
await assertReleaseManifest(RELEASE_BATCHES);
assertOriginalReleases(RELEASE_BATCHES.flatMap(batch=>batch.chapters.map(item=>item.chapter)));
let count=0;
for(const entry of [...PLAYABLE_JOURNEYS,...MYSTERIES]){
 const board='answer' in entry?mysteryBoard(entry):journeyBoard(entry);
 for(const target of board.placements){const cells=exactLine(target.a,target.b,board.size);assert(cells);assert.equal(cells.map(([r,c])=>board.grid[r]![c]).join(''),target.text);}
 const slopes=new Set(board.placements.filter(p=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1]).map(p=>Math.sign((p.b[0]-p.a[0])*(p.b[1]-p.a[1]))));assert(slopes.has(1)&&slopes.has(-1));
 // A content edit must remain placeable outside its launch seed too.
 for(let seed=1;seed<=20;seed++)makeCustomPuzzle('answer' in entry?[...entry.words,entry.bonus]:entry.words,seed,entry.size);
 count++;
}
for(const batch of RELEASE_BATCHES)for(const {chapter} of batch.chapters){assert.deepEqual(checkChapter(chapter.spec).board,chapter.board);count++;}
console.log(`${count} authored boards and ${count*20} alternate layouts passed.`);

const groupWords=new Set<string>(),groupGrids=new Set<string>();
for(let i=0;i<64;i++){
 const candidate=i<48?groupPuzzle(i):groupRiddlePuzzle(i-48);assert(candidate,'Missing new group board '+i);
 const board=candidate.board;assert.equal(board.size,9);assert.equal(board.targets.length,7);assert.equal(new Set(board.targets.map(t=>t.text)).size,7);
 assert(!groupWords.has(candidate.wordsKey)&&!groupGrids.has(candidate.gridKey));groupWords.add(candidate.wordsKey);groupGrids.add(candidate.gridKey);
 for(const p of board.placements){const cells=exactLine(p.a,p.b,board.size);assert(cells);assert.equal(cells.map(([r,c])=>board.grid[r]![c]).join(''),p.text);}
}
console.log('64 additional distinct nine-by-nine group boards with seven solvable words passed.');
