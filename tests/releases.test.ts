import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {RELEASE_BATCHES,releaseCatalogue,releasedChapter,releaseChapterId} from '../lib/studio/releases.ts';
import {checkChapter,validChapterId,StudioError} from '../lib/studio/content.ts';
import {AdminStore,ChapterStore} from '../lib/studio/store.ts';
import {digest} from '../lib/game/security.ts';
import {discoveryState} from '../lib/game/discovery.ts';
import {emptyProgress,type SavedLevel} from '../lib/game/progress.ts';
import {fixture} from './fixtures.ts';
import {chapterSyncResult,mergeChapterSave} from '../lib/studio/chapter-progress.ts';

const now=Math.max(Date.parse('2026-10-21T12:00:00Z'),...RELEASE_BATCHES.flatMap(b=>b.chapters.map(c=>c.chapter.publishedAt)))+1000;
const raw=(strokes:SavedLevel['strokes'],elapsed=25,hints=0):SavedLevel=>({strokes,elapsed,hints,complete:false,stars:99});

describe('immutable daily releases and permanent archive',()=>{
 it('contains exactly one easy and one medium chapter for every recorded UTC date with stable unique identities',()=>{
  const dates=new Set<string>(),ids=new Set<string>();for(const batch of RELEASE_BATCHES){assert(!dates.has(batch.date));dates.add(batch.date);assert.deepEqual(batch.chapters.map(c=>c.slot),[1,2]);assert.deepEqual(batch.chapters.map(c=>c.chapter.spec.difficulty),['Rahat','Dengeli']);for(const item of batch.chapters){assert.equal(item.chapter.id,releaseChapterId(batch.date,item.slot));assert(validChapterId(item.chapter.id));assert(!ids.has(item.chapter.id));ids.add(item.chapter.id);}}
  assert.throws(()=>releaseChapterId('2026-02-30',1));assert.throws(()=>releaseChapterId('2026-10-21',3));
 });
 it('verifies each committed board snapshot and spec hash without regenerating a previously published file',async()=>{
  for(const batch of RELEASE_BATCHES)for(const {chapter} of batch.chapters){const checked=checkChapter(chapter.spec);assert.deepEqual(checked.board,chapter.board);assert.equal(chapter.contentHash,await digest(JSON.stringify(chapter.spec)));assert.equal(chapter.archived,false);}
 });
 it('omits future releases, retains old ones indefinitely and returns board-free archive summaries',()=>{
  const first=RELEASE_BATCHES[0]!,old=first.chapters[0]!.chapter;assert.equal(releaseCatalogue(0,Date.parse(first.date+'T00:00:00Z')-1).total,0);
  const archive=releaseCatalogue(0,now+3650*86400000);assert.equal(archive.total,RELEASE_BATCHES.length*2);assert(archive.chapters.some(c=>c.id===old.id));assert(archive.chapters.every(c=>!('board' in c)&&!('archived' in c)));assert.equal(releaseCatalogue(20000,now).chapters.length,0);
 });
 it('returns the same source board after reload and isolates caller mutations',()=>{
  const id=RELEASE_BATCHES[0]!.chapters[0]!.chapter.id,a=releasedChapter(id,now)!,original=JSON.stringify(a);a.board.grid[0]![0]='X';a.spec.words[0]='DEĞİŞTİ';assert.equal(JSON.stringify(releasedChapter(id,now)),original);assert.equal(releasedChapter('unknown',now),undefined);
 });
 it('opens source chapters without modifying the live editor catalogue or the five-chapter discovery groups',async()=>{
  const f=fixture(now),store=new ChapterStore(f.db,f.clock),map=discoveryState(emptyProgress());for(const batch of RELEASE_BATCHES)for(const {chapter} of batch.chapters)assert.deepEqual((await store.playable(chapter.id)).board,chapter.board);
  assert.equal((await store.catalogue()).total,0);assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM studio_chapters').get()!['n'],0);assert.deepEqual(discoveryState(emptyProgress()),map);assert.deepEqual(map.map(m=>m.chapters.length),[5,5,5]);
 });
 it('merges both devices, isolates accounts and keeps best completed source-chapter results without competitive awards',async()=>{
  const f=fixture(now),store=new ChapterStore(f.db,f.clock),chapter=releasedChapter(RELEASE_BATCHES[0]!.chapters[0]!.chapter.id,now)!;
  await Promise.all([store.saveProgress('alice',chapter.id,raw([chapter.board.placements[0]!])),store.saveProgress('alice',chapter.id,raw([chapter.board.placements[1]!]))]);assert.equal((await store.progress('alice',chapter.id)).save.strokes.length,2);assert.equal((await store.progress('bob',chapter.id)).save.strokes.length,0);
  await store.saveProgress('alice',chapter.id,raw(chapter.board.placements,30));f.advance(86400000);await store.saveProgress('alice',chapter.id,raw(chapter.board.placements,4,3));assert.equal((await store.progress('alice',chapter.id)).save.elapsed,30);assert.equal((await store.progress('alice',chapter.id)).save.stars,3);assert.equal((await f.game.rating('alice')).played,0);
 });
 it('does not accept forged word paths or forged completion flags in a source release',async()=>{
  const f=fixture(now),store=new ChapterStore(f.db,f.clock),chapter=releasedChapter(RELEASE_BATCHES[0]!.chapters[1]!.chapter.id,now)!,save={...raw([{id:'0.0',a:[0,0],b:[7,6]}]),complete:true} as SavedLevel;
  const result=await store.saveProgress('alice',chapter.id,save);assert.equal(result.save.complete,false);assert.equal(result.save.stars,0);assert.equal(result.save.strokes.length,0);
 });
 it('reserves release identities against editor collisions while enforcing the existing owner boundary',async()=>{
  const f=fixture(now),token='c'.repeat(64),admin=new AdminStore(f.db,{hash:await digest('kelime-admin-setup-v1:'+token),expiresAt:String(now+86400000)},f.clock),chapter=RELEASE_BATCHES[0]!.chapters[0]!.chapter;await admin.claim('owner',token);
  await assert.rejects(()=>admin.saveDraft('other',chapter.spec,undefined,undefined,chapter.id),(e:unknown)=>e instanceof StudioError&&e.status===403);
  await assert.rejects(()=>admin.saveDraft('owner',chapter.spec,undefined,undefined,chapter.id),(e:unknown)=>e instanceof StudioError&&e.status===409);assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM studio_chapters').get()!['n'],0);
 });
});

describe('published chapter acknowledgement',()=>{
 const chapter=releasedChapter(RELEASE_BATCHES[0]!.chapters[0]!.chapter.id,now)!,board=chapter.board;
 it('keeps a word found while upload was pending and waits for its own cloud acknowledgement',()=>{
  const sent=raw([board.placements[0]!]),latest=raw(board.placements.slice(0,2));let result=chapterSyncResult(latest,sent,board);assert.equal(result.save.strokes.length,2);assert.equal(result.pending,true);result=chapterSyncResult(result.save,result.save,board);assert.equal(result.pending,false);
 });
 it('marks offline discoveries for upload when the initial cloud read is older',()=>{
  const result=chapterSyncResult(raw([board.placements[0]!]),raw([]),board);assert.equal(result.pending,true);assert.equal(result.save.strokes.length,1);
 });
 it('keeps the best replay and merges different valid words from two devices',()=>{
  const a=raw([board.placements[0]!]),b=raw([board.placements[1]!]);assert.equal(mergeChapterSave(a,b,board).strokes.length,2);const best=mergeChapterSave(undefined,raw(board.placements,30),board),slower=raw(board.placements,60),result=chapterSyncResult(best,slower,board);assert.equal(result.save.elapsed,30);assert.equal(result.pending,true);
 });
});
