import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {assertOriginalReleases} from '../lib/studio/release-audit.ts';
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
