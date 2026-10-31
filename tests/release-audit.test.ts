import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {assertOriginalReleases,assertReleaseManifest} from '../lib/studio/release-audit.ts';
import {RELEASE_BATCHES} from '../lib/studio/releases.ts';

describe('daily content originality gate',()=>{
 const first=RELEASE_BATCHES[0]!.chapters[0]!.chapter,second=RELEASE_BATCHES[0]!.chapters[1]!.chapter;
 it('accepts the distinct released chapters and an empty catalogue',()=>{
  assert.doesNotThrow(()=>assertOriginalReleases([]));
  assert.doesNotThrow(()=>assertOriginalReleases(RELEASE_BATCHES.flatMap(b=>b.chapters.map(c=>c.chapter))));
 });
 it('rejects renamed and reseeded word sets even with different order, case, spacing and duplicate labels',()=>{
  const copy=structuredClone(second);copy.id='new-identity';copy.spec.title='A different title';copy.spec.seed++;
  copy.spec.words=[...first.spec.words].reverse().map(w=>' '+w.toLocaleLowerCase('tr-TR')+' ');
  copy.spec.words.push(first.spec.words[0]!);
  assert.throws(()=>assertOriginalReleases([first,copy]),/Repeated release words/);
 });
 it('rejects the same real grid even when the identity and target word set differ',()=>{
  const copy=structuredClone(second);copy.id='new-identity';copy.board=structuredClone(first.board);
  assert.throws(()=>assertOriginalReleases([first,copy]),/Repeated release grid/);
 });
});


describe('daily archive identity and integrity gate',()=>{
 it('accepts every immutable release and permits an empty catalogue',async()=>{
  await assertReleaseManifest([]);await assertReleaseManifest(RELEASE_BATCHES);
 });
 it('rejects duplicate dates and missing, repeated or reordered slots',async()=>{
  const first=structuredClone(RELEASE_BATCHES[0]!);
  await assert.rejects(()=>assertReleaseManifest([first,first]),/Repeated release date/);
  for(const slots of [[1],[1,1],[2,1]]){const copy=structuredClone(first);copy.chapters=slots.map(slot=>({...structuredClone(first.chapters[0]!),slot}));await assert.rejects(()=>assertReleaseManifest([copy]),/Invalid release slots/);}
 });
 it('rejects mismatched IDs, invalid calendar dates and wrong easy/medium order',async()=>{
  const first=RELEASE_BATCHES[0]!;
  const wrong=structuredClone(first);wrong.chapters[1]!.chapter.id=wrong.chapters[0]!.chapter.id;
  await assert.rejects(()=>assertReleaseManifest([wrong]),/Invalid release identity/);
  const date=structuredClone(first);date.date='2026-02-30';await assert.rejects(()=>assertReleaseManifest([date]),/Invalid daily release identity/);
  const difficulty=structuredClone(first);difficulty.chapters[0]!.chapter.spec.difficulty='Dengeli';await assert.rejects(()=>assertReleaseManifest([difficulty]),/Invalid release difficulty/);
 });
 it('rejects unpublished/archived entries, adjacent-day timestamps and mutated content hashes',async()=>{
  const first=RELEASE_BATCHES[0]!,day=Date.parse(first.date+'T00:00:00Z');
  for(const timestamp of [NaN,day-1,day+86400000]){const copy=structuredClone(first);copy.chapters[0]!.chapter.publishedAt=timestamp;await assert.rejects(()=>assertReleaseManifest([copy]),/Invalid release publication/);}
  const archived=structuredClone(first);archived.chapters[0]!.chapter.archived=true;await assert.rejects(()=>assertReleaseManifest([archived]),/Invalid release publication/);
  const mutated=structuredClone(first);mutated.chapters[0]!.chapter.spec.note+=' değişti';await assert.rejects(()=>assertReleaseManifest([mutated]),/Invalid release hash/);
 });
});
