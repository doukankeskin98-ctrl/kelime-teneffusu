import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {RELEASE_BATCHES,releasedChapter} from '../lib/studio/releases.ts';
import {ChapterStore,AdminStore} from '../lib/studio/store.ts';
import {StudioError} from '../lib/studio/content.ts';
import {cleanSave} from '../lib/game/progress.ts';
import {digest} from '../lib/game/security.ts';
import {cardProgress,parseCardProgress,mergeCardProgress,chapterCardCopy} from '../lib/studio/card-progress.ts';
import {BOARD_KEY,saveKey,rememberChapter,readChapterSave} from '../lib/studio/chapter-cache.ts';
import {fixture} from './fixtures.ts';

const now=Date.parse('2026-10-21T21:00:00Z'),chapter=releasedChapter(RELEASE_BATCHES[0]!.chapters[0]!.chapter.id,now)!,board=chapter.board;
const save=(count:number,elapsed=20,hints=0)=>cleanSave({strokes:board.placements.slice(0,count),elapsed,hints,complete:true,stars:99},board);
const memory=()=>{const values=new Map<string,string>();return {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};};

describe('truthful chapter card progress',()=>{
 it('shows a real partial count, then completion, stars and best elapsed time',()=>{
  const partial=cardProgress(save(2),chapter.spec),done=cardProgress(save(100,35,1),chapter.spec);
  assert.deepEqual(chapterCardCopy(partial,'ready',chapter.spec),{kind:'continue',action:'Kaldığın yerden',detail:'2/4 kelime bulundu'});assert.equal(done.stars,2);assert.equal(chapterCardCopy(done,'ready',chapter.spec).action,'Bir daha keşfet');assert.match(chapterCardCopy(done,'ready',chapter.spec).detail,/2 yıldız/);assert.match(chapterCardCopy(done,'ready',chapter.spec).detail,/35/);
 });
 it('does not call an unavailable or still-loading cloud record a fresh or completed game',()=>{
  for(const state of ['loading','offline','error'] as const){assert.equal(chapterCardCopy(undefined,state,chapter.spec).kind,'unknown');assert.equal(chapterCardCopy(undefined,state,chapter.spec).action,'Keşfi aç');}
  assert.equal(chapterCardCopy(cardProgress(save(0),chapter.spec),'ready',chapter.spec).action,'Keşfe başla');assert.equal(chapterCardCopy(cardProgress(save(0),chapter.spec),'loading',chapter.spec).action,'Keşfi aç');
 });
 it('rejects unknown target IDs and nonfinite data and derives stars from actual completion and hints',()=>{
  assert.equal(parseCardProgress({foundIds:['forged'],elapsed:1,hints:0},chapter.spec),null);assert.equal(parseCardProgress({foundIds:[],elapsed:NaN,hints:0},chapter.spec),null);
  assert.equal(parseCardProgress({foundIds:['0.0','0.0'],elapsed:1,hints:0,complete:true,stars:99},chapter.spec)!.complete,false);assert.equal(parseCardProgress({foundIds:[],elapsed:1,hints:0,complete:true,stars:99},chapter.spec)!.stars,0);
 });
 it('merges both devices without double counting and preserves a better complete result on a replay',()=>{
  const a=cardProgress(save(2,20),chapter.spec),b=parseCardProgress({foundIds:board.placements.slice(1).map(s=>s.id),elapsed:35,hints:1},chapter.spec)!,merged=mergeCardProgress(a,b,chapter.spec);assert.equal(merged.foundIds.length,4);assert.equal(merged.complete,true);assert.equal(merged.stars,2);
  const best=cardProgress(save(100,30),chapter.spec),slower=cardProgress(save(100,60),chapter.spec),worse=cardProgress(save(100,4,3),chapter.spec);assert.equal(mergeCardProgress(best,slower,chapter.spec).elapsed,30);assert.equal(mergeCardProgress(best,worse,chapter.spec).stars,3);
 });
 it('counts split long names as pieces instead of reporting a misleading word total',()=>{
  const spec={...chapter.spec,words:['UGANDA CUMHURBAŞKANI','KEL MAHMUT','DÜNYA']},progress=parseCardProgress({foundIds:['0.1'],elapsed:10,hints:0},spec)!;assert.equal(chapterCardCopy(progress,'ready',spec).detail,'1/4 kelime parçası bulundu');
 });
});

describe('account-scoped offline chapter cards',()=>{
 it('restores validated device progress and keeps another account’s cards empty',()=>{
  const storage=memory();rememberChapter(chapter,storage);storage.setItem(saveKey('alice'),JSON.stringify({[chapter.id]:save(2)}));assert.equal(readChapterSave(storage,'alice',chapter)!.save.strokes.length,2);assert.equal(readChapterSave(storage,'bob',chapter)!.save.strokes.length,0);assert.equal(readChapterSave(storage,undefined,chapter)!.save.strokes.length,0);
 });
 it('does not display unvalidated paths after missing, corrupted or mismatched cached boards',()=>{
  const storage=memory();storage.setItem(saveKey('alice'),JSON.stringify({[chapter.id]:save(100)}));assert.equal(readChapterSave(storage,'alice',chapter),null);rememberChapter(chapter,storage);assert.equal(readChapterSave(storage,'alice',{...chapter,contentHash:'a'.repeat(64)}),null);
  const corrupted=structuredClone(chapter);corrupted.board.placements[0]!.a=[-1,-1];storage.setItem(BOARD_KEY,JSON.stringify({[chapter.id]:corrupted}));assert.equal(readChapterSave(storage,'alice',chapter),null);storage.setItem(BOARD_KEY,'bad json');assert.equal(readChapterSave(storage,'alice',chapter),null);
 });
});

describe('private batched chapter card reads',()=>{
 it('returns only the actual account’s validated progress, without word paths or board solutions',async()=>{
  const f=fixture(now),store=new ChapterStore(f.db,f.clock);await store.saveProgress('alice',chapter.id,save(2));const a=await store.cardProgress('alice',[chapter.id,chapter.id]),b=await store.cardProgress('bob',[chapter.id]);assert.equal(a.chapters.length,1);assert.equal(a.chapters[0]!.progress.foundIds.length,2);assert.equal(b.chapters[0]!.progress.foundIds.length,0);assert(!JSON.stringify(a).includes('placements'));assert(!JSON.stringify(a).includes('strokes'));assert.equal((await f.game.rating('alice')).played,0);
 });
 it('rejects malformed and oversized batches and omits unknown or unpublished editor IDs',async()=>{
  const f=fixture(now),store=new ChapterStore(f.db,f.clock),denied=(e:unknown)=>e instanceof StudioError&&e.status===400;await assert.rejects(()=>store.cardProgress('alice',[]),denied);await assert.rejects(()=>store.cardProgress('alice',['not-an-id']),denied);await assert.rejects(()=>store.cardProgress('alice',Array(25).fill(chapter.id)),denied);assert.equal((await store.cardProgress('alice',['11111111-1111-4111-8111-111111111111'])).chapters.length,0);
  const token='e'.repeat(64),admin=new AdminStore(f.db,{hash:await digest('kelime-admin-setup-v1:'+token),expiresAt:String(now+86400000)},f.clock);await admin.claim('owner',token);const draft=await admin.saveDraft('owner',chapter.spec);assert.equal((await store.cardProgress('alice',[draft.id])).chapters.length,0);
 });
 it('retains a completed editor chapter’s card after reversible archiving',async()=>{
  const f=fixture(now),token='f'.repeat(64),admin=new AdminStore(f.db,{hash:await digest('kelime-admin-setup-v1:'+token),expiresAt:String(now+86400000)},f.clock),store=new ChapterStore(f.db,f.clock);await admin.claim('owner',token);const draft=await admin.saveDraft('owner',chapter.spec),published=await admin.transition('owner',draft.id,'publish',draft.revision,draft.spec.title);await store.saveProgress('alice',published.id,save(100,30));await admin.transition('owner',published.id,'archive',published.revision,published.spec.title);const read=await store.cardProgress('alice',[published.id]);assert.equal(read.chapters[0]!.progress.complete,true);assert.equal(read.chapters[0]!.progress.stars,3);
 });
});
