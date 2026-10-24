import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {RELEASE_BATCHES,releaseCatalogue,releaseChapterId,type ReleaseBatch} from '../lib/studio/releases.ts';
import {releasePairs} from '../lib/studio/release-stamps.ts';
const now=Math.max(...RELEASE_BATCHES.flatMap(b=>b.chapters.map(c=>c.chapter.publishedAt)))+1000;
describe('source chapters in their existing worlds',()=>{
 it('filters before paging and returns global world counts without board payloads',()=>{
  const all=releaseCatalogue(0,now),theme=all.chapters[0]!.spec.themeId,filtered=releaseCatalogue(0,now,theme);
  assert(filtered.chapters.every(c=>c.spec.themeId===theme));assert.equal(filtered.total,all.chapters.filter(c=>c.spec.themeId===theme).length);assert.equal(filtered.themeCounts[theme],filtered.total);
  assert(filtered.chapters.every(c=>!('board' in c)));assert(filtered.companions.every(c=>!('board' in c)&&c.spec.themeId!==theme));
 });
 it('keeps the original cross-world stamp pair available from a filtered selection',()=>{
  for(const batch of RELEASE_BATCHES){for(const {chapter} of batch.chapters){const page=releaseCatalogue(0,now,chapter.spec.themeId);const pairs=releasePairs([...page.chapters,...page.companions]);assert(pairs.some(p=>p.date===batch.date&&p.chapters.some(c=>c.id===chapter.id)));}}
 });
 it('keeps old world chapters reachable after more than 24 additions and excludes future ones',()=>{
  const batches=RELEASE_BATCHES as ReleaseBatch[],length=batches.length,template=structuredClone(batches[0]!),theme=template.chapters[0]!.chapter.spec.themeId;
  try{for(let i=0;i<30;i++){const copy=structuredClone(template),date=new Date(Date.UTC(2090,0,i+1)).toISOString().slice(0,10);copy.date=date;for(const item of copy.chapters){item.chapter.id=releaseChapterId(date,item.slot);item.chapter.publishedAt=Date.parse(date+'T00:00:00Z');}batches.push(copy);}
   const first=releaseCatalogue(0,Date.parse('2091-01-01'),theme),second=releaseCatalogue(24,Date.parse('2091-01-01'),theme);assert.equal(first.chapters.length,24);assert.equal(first.nextOffset,24);assert(second.chapters.length>0);assert(second.chapters.some(c=>c.id===template.chapters[0]!.chapter.id));assert.equal(releaseCatalogue(0,now,theme).total,releaseCatalogue(0,now).themeCounts[theme]);
  }finally{batches.splice(length);}
 });
 it('preserves a same-world pair split across the 24-item boundary',()=>{
  const batches=RELEASE_BATCHES as ReleaseBatch[],length=batches.length,template=structuredClone(batches[0]!),theme=template.chapters[0]!.chapter.spec.themeId;
  try{for(let i=0;i<25;i++){const copy=structuredClone(template),date=new Date(Date.UTC(2092,0,i+1)).toISOString().slice(0,10);copy.date=date;for(const item of copy.chapters){item.chapter.id=releaseChapterId(date,item.slot);item.chapter.publishedAt=Date.parse(date+'T00:00:00Z');item.chapter.spec.themeId=i===1?theme:item.slot===1?theme:'different-world';}batches.push(copy);}
   const page=releaseCatalogue(0,Date.parse('2093-01-01'),theme),edge=page.chapters.at(-1)!;
   assert.equal(edge.releaseDate,'2092-01-02');assert.equal(edge.slot,1);
   assert(page.companions.some(c=>c.releaseDate===edge.releaseDate&&c.slot===2&&c.spec.themeId===theme));
   assert(releasePairs([...page.chapters,...page.companions]).some(p=>p.chapters.some(c=>c.id===edge.id)));
  }finally{batches.splice(length);}
 });

});
