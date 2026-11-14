import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {catalogueQuality,capacityProbe,revisionCatalogueQuality} from './content-quality-model.ts';
import {JOURNEY_REVISION_TWO,journeyRevision,journeyPresentationKey} from '../lib/game/journey-revisions.ts';
import {MAIN_JOURNEY} from '../lib/game/main-journey.ts';
import {reviewNovelty,difficultyIssues} from '../lib/game/editorial-quality.ts';
import {journeyBoard} from '../lib/game/content.ts';
import {presentationBoard} from '../lib/game/journey-presentation.ts';
import {proseSafetyIssues,targetSafetyIssues} from '../lib/game/content-safety.ts';
import {boardIssues,PRESENTATION_RULES} from '../lib/game/board-quality.ts';
const baseline=JSON.parse(readFileSync(new URL('../tests/fixtures/journey-0500-quality.json',import.meta.url),'utf8')) as {
 rows:{id:string;number:number;contentHash:string;boardHash:string;displayHash:string}[];
 capacity:{bytes:number};knownDebt:{nearCopies:{id:string;matches:string[]}[];routes:{id:string;chapters:string[];issues:string[]}[]}};
const {rows,routes}=catalogueQuality(),capacity=capacityProbe();
for(const old of baseline.rows){
 const current=rows[old.number-1];assert(current,'Released chapter removed: '+old.id);
 for(const key of ['id','number','contentHash','boardHash','displayHash'] as const)assert.equal(current[key],old[key],`${old.id}: released ${key} changed; use an approved versioned-content migration`);
}
const existing=new Set(baseline.rows.map(r=>r.id)),added=rows.filter(r=>!existing.has(r.id));
// Debt is tied to exact catalogue hashes above and the exact issue below. It is
// reported, not silently waived for every chapter whose ID happens to be old.
for(const row of rows){
 const matches=row.novelty.nearCopies.map(p=>p.id);
 if(existing.has(row.id))assert.deepEqual(matches,baseline.knownDebt.nearCopies.find(r=>r.id===row.id)?.matches??[],row.id+' changed near-copy debt');
 else {assert.equal(matches.length,0,row.id+' near-copy');assert(row.novelty.repeatRatio<=.5,row.id+' more than half the targets were seen before');assert(row.novelty.nearestRepeat===null||row.novelty.nearestRepeat>12,row.id+' target reused within twelve chapters');}
}
for(const route of routes){
 const old=baseline.knownDebt.routes.find(r=>r.id===route.id);
 if(old)assert.deepEqual(route,old,route.id+' changed difficulty debt without content revision');
 else assert.deepEqual(route.issues,[],route.id+' difficulty progression');
}
assert(capacity.bytes<=baseline.capacity.bytes,'Current save footprint grew: run the approved lossless migration before expansion');
assert(capacity.headroom>0,'Synthetic full catalogue exceeds storage budget');
if(added.length)assert(capacity.headroom>=64000,'New catalogue blocked: compact-save rollout must restore at least 64KB headroom');
const budget={savedBoards:capacity.savedBoards,legacyBytes:capacity.legacyBytes,bytes:capacity.bytes,limit:capacity.limit,headroom:capacity.headroom};
const report={releaseGate:'passed-with-explicit-existing-debt',publishedChapters:baseline.rows.length,newChapters:added.length,capacity:budget,
 existingNearCopies:rows.filter(r=>r.novelty.nearCopies.length).map(r=>({id:r.id,number:r.number,nearCopies:r.novelty.nearCopies})),
 difficultyDebt:routes.filter(r=>r.issues.length),chapters:rows};
const output=process.argv.indexOf('--report');if(output>=0&&process.argv[output+1])writeFileSync(process.argv[output+1]!,JSON.stringify(report,null,2)+'\n');
console.log(`Editorial gate: ${rows.length} immutable published chapters; ${report.existingNearCopies.length} known near-copy chapters; ${report.difficultyDebt.length} routes need authored curve review (NOT fixed).`);
console.log(`Combined synthetic save: ${capacity.bytes}/${capacity.limit} bytes; ${capacity.headroom} bytes headroom. Content expansion requires the compact-save rollout.`);

// Inactive candidates are held to word novelty/safety independently of the
// immutable released catalogue. A complete route is still NOT player acceptance.
for(const id of Object.keys(JOURNEY_REVISION_TWO)){
 const chapter=journeyRevision(id,2)!,index=MAIN_JOURNEY.findIndex(c=>c.chapter.id===id);
 const history=MAIN_JOURNEY.slice(0,index).map(c=>journeyRevision(c.chapter.id,JOURNEY_REVISION_TWO[c.chapter.id]?2:1)!);
 assert.deepEqual(proseSafetyIssues([chapter.title,chapter.note,...Object.values(chapter.clues??{})].join(' ')),[],id+' unsafe revision prose');
 assert.deepEqual(chapter.words.flatMap(targetSafetyIssues),[],id+' unsafe revision targets');
 const review=reviewNovelty(chapter.words,history);
 assert.equal(review.nearCopies.length,0,id+' revision near-copy');
 assert(review.repeatRatio<=.5,id+' revision repeats more than half its words');
 assert(review.nearestRepeat===null||review.nearestRepeat>12,id+' revision repeat within twelve chapters');
 assert.deepEqual(boardIssues(presentationBoard(journeyBoard(chapter),journeyPresentationKey(chapter)),PRESENTATION_RULES),[],id+' unsafe revision board');
}
const revisions=revisionCatalogueQuality();
assert.deepEqual(revisions.map(r=>r.id),Array.from({length:6},(_,i)=>`ufuk-gok-${i+1}`),'Full six-chapter pilot required');
assert.deepEqual(difficultyIssues(revisions.map(r=>r.load),rows.slice(0,6).map(r=>r.load)),[],'Revision route difficulty');
for(const {id,chapter,board} of revisions){
 if(chapter.clues)assert.deepEqual(Object.keys(chapter.clues).sort(),[...chapter.words].sort(),id+' complete clues');
 for(const placement of board.placements){
  const dr=Math.sign(placement.b[0]-placement.a[0]),dc=Math.sign(placement.b[1]-placement.a[1]);
  const text=Array.from({length:placement.text.length},(_,i)=>board.grid[placement.a[0]+i*dr]?.[placement.a[1]+i*dc]).join('');
  assert.equal(text,placement.text,id+' stale or misplaced revision target');
 }
}
console.log(`${revisions.length} inactive revision chapters: complete route, novelty, safe targets and difficulty checks passed; player/device acceptance still required.`);
