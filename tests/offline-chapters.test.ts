import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {RELEASE_BATCHES} from '../lib/studio/releases.ts';
import {BOARD_KEY,saveKey,rememberChapter,matchingCachedChapter,readChapterSave} from '../lib/studio/chapter-cache.ts';
import {cleanSave} from '../lib/game/progress.ts';

const chapter=RELEASE_BATCHES[0]!.chapters[0]!.chapter;
const memory=()=>{const values=new Map<string,string>();return {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};};

describe('offline readiness uses the exact playable device board',()=>{
 it('does not mistake a completed cloud or device save for a downloaded board',()=>{
  const storage=memory(),complete=cleanSave({strokes:chapter.board.placements,elapsed:20,hints:0,complete:false,stars:0},chapter.board);
  storage.setItem(saveKey('alice'),JSON.stringify({[chapter.id]:complete}));
  assert.equal(readChapterSave(storage,'alice',chapter),null);
  rememberChapter(chapter,storage);
  assert.equal(readChapterSave(storage,'alice',chapter)!.save.complete,true);
  assert.equal(readChapterSave(storage,'bob',chapter)!.save.complete,false);
  assert.deepEqual(readChapterSave(storage,'bob',chapter)!.board,chapter.board);
  storage.setItem(BOARD_KEY,'{}');
  assert.equal(readChapterSave(storage,'alice',chapter),null);
 });
 it('rejects a valid board under the wrong ID even if its content hash is identical',()=>{
  const other={...chapter,id:'11111111-1111-4111-8111-111111111111'},storage=memory();
  assert.equal(matchingCachedChapter(other,chapter),null);
  storage.setItem(BOARD_KEY,JSON.stringify({[chapter.id]:other}));
  assert.equal(readChapterSave(storage,'alice',chapter),null);
 });
 it('rejects mismatched hashes or content even when the cached board itself is playable',()=>{
  assert.equal(matchingCachedChapter(chapter,{...chapter,contentHash:'a'.repeat(64)}),null);
  assert.equal(matchingCachedChapter({...chapter,spec:{...chapter.spec,note:'Başka bölüm bilgisi.'}},chapter),null);
  assert.equal(matchingCachedChapter(chapter,{...chapter,spec:{...chapter.spec,title:'Farklı keşif'}}),null);
  const corrupted=structuredClone(chapter);corrupted.board.placements[0]!.b=[-1,-1];
  assert.equal(matchingCachedChapter(corrupted,chapter),null);
 });
 it('never reports readiness after storage denial, failed download storage or malformed cache JSON',()=>{
  const denied={getItem:()=>{throw new Error('Storage unavailable');},setItem:()=>{throw new Error('Quota exceeded');}};
  assert.doesNotThrow(()=>rememberChapter(chapter,denied));
  assert.equal(readChapterSave(denied,'alice',chapter),null);
  const storage=memory();storage.setItem(BOARD_KEY,'not json');
  assert.equal(readChapterSave(storage,'alice',chapter),null);
 });
 it('keeps an old archived board ready without touching its save when newer releases arrive',()=>{
  const storage=memory(),archived={...chapter,archived:true};rememberChapter(archived,storage);
  const best=cleanSave({strokes:chapter.board.placements,elapsed:17,hints:0,complete:false,stars:0},chapter.board);
  storage.setItem(saveKey('alice'),JSON.stringify({[chapter.id]:best}));
  for(const batch of RELEASE_BATCHES.slice(1))for(const item of batch.chapters)rememberChapter(item.chapter,storage);
  assert.deepEqual(matchingCachedChapter(JSON.parse(storage.getItem(BOARD_KEY)!)[chapter.id],chapter),archived);
  assert.equal(readChapterSave(storage,'alice',chapter)!.save.elapsed,17);
  assert.equal(readChapterSave(storage,'bob',chapter)!.save.strokes.length,0);
 });
});
