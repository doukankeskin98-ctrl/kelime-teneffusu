import {boardIssues,PRESENTATION_RULES} from '../lib/game/board-quality.ts';
import {targetSafetyIssues,proseSafetyIssues} from '../lib/game/content-safety.ts';
import {presentationBoard} from '../lib/game/journey-presentation.ts';
import {dailyBoard,STRICT_DAILY_FROM} from '../lib/game/daily-board.ts';
import {variedSprintBoard,emptySprintHistory,rememberSprintBoard} from '../lib/game/sprint-history.ts';
import {ACTIVE_SPRINT_WORDS as SPRINT_WORDS} from '../lib/game/sprint-vocabulary.ts';
import {freshArenaPuzzle} from '../lib/game/arena-fresh.ts';
import {ARENA_CLUES,ARENA_LIBRARY} from '../lib/game/arena-library.ts';
import {groupPuzzle,groupRiddlePuzzle} from '../lib/game/group-content.ts';
import assert from 'node:assert/strict';
import {ACTIVE_JOURNEYS,PLAYABLE_JOURNEYS,MYSTERIES,journeyBoard,mysteryBoard} from '../lib/game/content.ts';
import {exactLine,makeCustomPuzzle} from '../lib/game/engine.ts';
import {RELEASE_BATCHES} from '../lib/studio/releases.ts';
import {checkChapter} from '../lib/studio/content.ts';
import {assertOriginalReleases,assertReleaseManifest} from '../lib/studio/release-audit.ts';
await assertReleaseManifest(RELEASE_BATCHES);
assertOriginalReleases(RELEASE_BATCHES.flatMap(batch=>batch.chapters.map(item=>item.chapter)));
let count=0;
for(const entry of [...PLAYABLE_JOURNEYS,...MYSTERIES]){
 const board='answer' in entry?mysteryBoard(entry):journeyBoard(entry);
 if('answer' in entry||ACTIVE_JOURNEYS.some(c=>c.id===entry.id)){
  assert.equal(proseSafetyIssues(entry.title+' '+entry.note+' '+Object.values('clues' in entry?entry.clues??{}:{}).join(' ')).length,0,entry.id+' text safety');
  for(const word of entry.words)assert.deepEqual(targetSafetyIssues(word),[],entry.id+': '+word);
  const display=presentationBoard(board,('answer' in entry?'mystery:':'route:')+entry.id);
  assert.deepEqual(boardIssues(display,PRESENTATION_RULES),[],entry.id+' display safety');
 }
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

for(const options of [{group:true,clue:true},{group:true},{group:false}])for(let i=0;i<32;i++){
 const c=freshArenaPuzzle(i,{...options,safety:'wide-v1'});assert(c,'Missing fresh competition board');
 assert.deepEqual(boardIssues(c.board,PRESENTATION_RULES),[],`fresh Arena ${i}`);
 assert.equal(c.board.size,options.group?9:8);assert.equal(c.words.length,options.group?7:6);
 for(const p of c.board.placements){const cells=exactLine(p.a,p.b,c.board.size);assert(cells);assert.equal(cells.map(([r,col]):string=>c.board.grid[r]![col]!).join(''),p.text);}
}
console.log(`${ARENA_CLUES.length} Arena definitions / ${ARENA_LIBRARY.length} words;96 fresh competition boards passed.`);

const knownWords=new Set(ARENA_LIBRARY.map(e=>e.word));
assert.equal(new Set(SPRINT_WORDS).size,SPRINT_WORDS.length);
for(let offset=0;offset<SPRINT_WORDS.length;offset+=4){
 const words=Array.from({length:4},(_,i)=>SPRINT_WORDS[(offset+i)%SPRINT_WORDS.length]!);
 for(const word of words)assert(knownWords.has(word)&&/^[A-ZÇĞİÖŞÜ]{3,6}$/.test(word));
 for(let seed=1;seed<=5;seed++){const board=makeCustomPuzzle(words,seed,6,'any');assert.equal(board.size,6);assert.equal(board.targets.length,4);for(const p of board.placements){const cells=exactLine(p.a,p.b,6);assert(cells);assert.equal(cells.map(([r,c])=>board.grid[r]![c]!).join(''),p.text);}}
}
console.log(`${SPRINT_WORDS.length} reviewed fast-play words passed small-board checks.`);

let sprintHistory=emptySprintHistory();
for(let round=0;round<40;round++){
 const board=variedSprintBoard(50312,round,sprintHistory,'wide-v1');assert.deepEqual(boardIssues(board,PRESENTATION_RULES),[],`Sprint ${round}`);sprintHistory=rememberSprintBoard(sprintHistory,board);
}
for(let day=0;day<45;day++){
 const date=new Date(STRICT_DAILY_FROM+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+day);const key=date.toISOString().slice(0,10);
 assert.deepEqual(boardIssues(dailyBoard(key),PRESENTATION_RULES),[],`Daily ${key}`);
}
console.log('Wide safety scan: all authored displays, 96 Arena, 40 Sprint and 45 future daily boards passed.');
