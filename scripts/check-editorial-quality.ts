import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {catalogueQuality,capacityProbe} from './content-quality-model.ts';
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
