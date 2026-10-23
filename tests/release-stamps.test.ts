import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {releasedChapter,RELEASE_BATCHES} from '../lib/studio/releases.ts';
import {releasePairs,releaseStamp,playableReleasePair,releaseRunResult} from '../lib/studio/release-stamps.ts';
import {cardProgress,parseCardProgress,type ChapterCardProgress} from '../lib/studio/card-progress.ts';
import {ChapterStore} from '../lib/studio/store.ts';
import {cleanSave,type SavedLevel} from '../lib/game/progress.ts';
import {rememberChapter,readChapterSave,saveKey} from '../lib/studio/chapter-cache.ts';
import {fixture} from './fixtures.ts';
import {releaseArchive} from './release-fixtures.ts';

const now=Math.max(Date.parse('2026-10-22T12:00:00Z'),...RELEASE_BATCHES.flatMap(b=>b.chapters.map(c=>c.chapter.publishedAt)))+1000;
const chapters=releaseArchive(now).chapters,pairs=releasePairs(chapters),pair=pairs.find(p=>p.date==='2026-10-22')!;
const progress=(count=100,hints=0,elapsed=30)=>Object.fromEntries(pair.chapters.map(chapter=>{
 const board=releasedChapter(chapter.id,now)!.board;
 return [chapter.id,cardProgress(cleanSave({strokes:board.placements.slice(0,count),elapsed,hints,complete:false,stars:0},board),chapter.spec)];
}));

describe('permanent discovery stamps',()=>{
 it('groups dates newest first, binds each goal to its original two IDs and does not duplicate cards',()=>{
  assert.equal(pairs.length,RELEASE_BATCHES.length);assert.deepEqual(pairs.map(p=>p.date),RELEASE_BATCHES.map(b=>b.date).sort().reverse());assert.deepEqual(pair.chapters.map(c=>c.slot),[1,2]);assert.equal(pair.date,'2026-10-22');
  assert.deepEqual(releasePairs([...chapters,...chapters]),pairs);
  assert.deepEqual(releasePairs([...chapters,{...pair.chapters[0],id:crypto.randomUUID(),slot:3}]),pairs);
 });
 it('does not make goals from editor entries, malformed dates, mismatched IDs or an incomplete pair',()=>{
  assert.deepEqual(releasePairs([{...pair.chapters[0],releaseDate:'2026-02-30'},pair.chapters[1]]),[]);
  assert.deepEqual(releasePairs([{...pair.chapters[0],id:crypto.randomUUID()},pair.chapters[1]]),[]);
  const {releaseDate:_date,slot:_slot,...editor}=pair.chapters[0];assert.deepEqual(releasePairs([editor,pair.chapters[1]]),[]);
  assert.deepEqual(releasePairs([pair.chapters[0]]),[]);
 });
 it('shows unavailable records honestly through loading, offline and failure without inventing zero progress',()=>{
  for(const state of ['loading','offline','error','ready'] as const){const result=releaseStamp(pair,{},state);assert.equal(result.known,false);assert.equal(result.earned,false);assert(!result.detail.includes('0/2'));assert(result.steps.every(s=>s.progress===null));}
  const values=progress(0);assert.equal(releaseStamp(pair,values,'ready').detail,'0/2 keşif tamamlandı. İkisini de bitir, damganı aç.');
 });
 it('requires both real completions and does not trust claimed completion flags or malformed targets',()=>{
  const first=pair.chapters[0],second=pair.chapters[1],done=progress();
  delete done[second.id];const missing=releaseStamp(pair,done,'offline');assert.equal(missing.completed,1);assert.equal(missing.earned,false);assert.equal(missing.known,false);
  done[second.id]={foundIds:[],elapsed:0,hints:0,complete:true,stars:99};assert.equal(releaseStamp(pair,done,'ready').earned,false);
  done[second.id]={...done[first.id]!,foundIds:['forged']};assert.equal(releaseStamp(pair,done,'ready').known,false);
 });
 it('accepts any hints or time, keeps one fixed stamp and never adds a deadline or repeat balance',()=>{
  const earned=releaseStamp(pair,progress(100,3,604800),'ready');assert.equal(earned.earned,true);assert.equal(earned.id,'pair:2026-10-22');
  assert.equal(releaseStamp(pair,progress(100,0,3),'offline').id,earned.id);
  assert.equal(releaseStamp(pair,progress(100,3,604800),'offline').earned,true);
  const old=pairs.at(-1)!,oldValues=Object.fromEntries(old.chapters.map(c=>[c.id,parseCardProgress({foundIds:releasedChapter(c.id,now)!.board.targets.map(t=>t.id),elapsed:90,hints:3},c.spec)!]));
  const original=releaseStamp(old,oldValues,'ready');assert.equal(original.earned,true);assert.deepEqual(releaseStamp(releasePairs([...chapters,{...pair.chapters[0],id:crypto.randomUUID()}]).at(-1)!,oldValues,'ready'),original);
 });
 it('recovers old completions from actual cloud saves, isolates accounts and preserves best results on replay',async()=>{
  const f=fixture(now),store=new ChapterStore(f.db,f.clock),ids=pair.chapters.map(c=>c.id);
  const read=async(owner:string)=>Object.fromEntries((await store.cardProgress(owner,ids)).chapters.map(c=>[c.id,c.progress]));
  for(const c of pair.chapters){const board=releasedChapter(c.id,now)!.board;await store.saveProgress('alice',c.id,{strokes:board.placements,elapsed:80,hints:3,complete:false,stars:0});}
  assert.equal(releaseStamp(pair,await read('alice'),'ready').earned,true);assert.equal(releaseStamp(pair,await read('bob'),'ready').earned,false);
  const before=await read('alice');await store.saveProgress('alice',ids[0],{strokes:[],elapsed:1,hints:0,complete:true,stars:99});
  assert.deepEqual(await read('alice'),before);assert.equal((await f.game.rating('alice')).played,0);
 });
 it('uses validated owner-specific offline saves and leaves missing boards unknown',()=>{
  const memory=new Map<string,string>(),storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>{memory.set(key,value);}},saves:Record<string,unknown>={};
  for(const c of pair.chapters){const chapter=releasedChapter(c.id,now)!;rememberChapter(chapter,storage);saves[c.id]=cleanSave({strokes:chapter.board.placements,elapsed:50,hints:2,complete:false,stars:0},chapter.board);}
  storage.setItem(saveKey('alice'),JSON.stringify(saves));
  const read=(owner:string)=>{const values:Record<string,ChapterCardProgress>={};for(const c of pair.chapters){const cached=readChapterSave(storage,owner,c);if(cached)values[c.id]=cardProgress(cached.save,c.spec);}return values;};
  assert.equal(releaseStamp(pair,read('alice'),'offline').earned,true);assert.equal(releaseStamp(pair,read('bob'),'offline').earned,false);
  memory.clear();assert.equal(releaseStamp(pair,read('alice'),'offline').known,false);
 });
});

describe('discovery stamp feedback at the actual chapter result',()=>{
 const first=releasedChapter(pair.chapters[0].id,now)!,second=releasedChapter(pair.chapters[1].id,now)!;
 const solve=(chapter:typeof first,hints=0)=>cleanSave({strokes:chapter.board.placements,elapsed:90,hints,complete:false,stars:0},chapter.board);
 const noProgress=(chapter:typeof first)=>cardProgress(cleanSave(undefined,chapter.board),chapter.spec);
 it('accepts only the matching immutable pair, hash, spec and date, keeping editor chapters separate',()=>{
  assert.equal(playableReleasePair(first,pair)?.date,pair.date);assert.equal(playableReleasePair(first),undefined);
  assert.equal(playableReleasePair({...first,id:crypto.randomUUID()},pair),undefined);
  assert.equal(playableReleasePair({...first,contentHash:'a'.repeat(64)},pair),undefined);
  assert.equal(playableReleasePair({...first,spec:{...first.spec,title:'Different chapter'}},pair),undefined);
  assert.equal(playableReleasePair(first,{...pair,date:'2026-02-30'}),undefined);
 });
 it('rejects an unfinished board or forged completion flags and paths before showing any result award',()=>{
  const forged:SavedLevel={strokes:[{...first.board.placements[0]!,a:[-1,-1]}],elapsed:0,hints:0,complete:true,stars:99};
  assert.equal(releaseRunResult(pair,first,forged,progress(),'ready'),null);
  assert.equal(releaseRunResult(pair,first,cleanSave(undefined,first.board),progress(),'ready'),null);
  assert.equal(releaseRunResult(undefined,first,solve(first),progress(),'ready'),null);
 });
 it('uses the last valid word immediately even when the current chapter has not reached the cloud',()=>{
  const values={[second.id]:cardProgress(solve(second,3),second.spec)},before=structuredClone(values);
  const result=releaseRunResult(pair,first,solve(first,3),values,'offline')!;
  assert.equal(result.stamp.earned,true);assert.equal(result.stamp.completed,2);assert.equal(result.next,undefined);assert.deepEqual(values,before);
 });
 it('offers precisely the other incomplete chapter in either order without opening another date',()=>{
  for(const [current,other] of [[first,second],[second,first]] as const){const result=releaseRunResult(pair,current,solve(current),{[other.id]:noProgress(other)},'ready')!;assert.equal(result.stamp.completed,1);assert.equal(result.stamp.earned,false);assert.equal(result.next?.id,other.id);assert.equal(result.next?.releaseDate,pair.date);}
 });
 it('keeps the companion unknown during loading, offline and failure and does not guess a next target',()=>{
  for(const status of ['loading','offline','error','ready'] as const){const result=releaseRunResult(pair,first,solve(first),{},status)!;assert.equal(result.stamp.known,false);assert.equal(result.stamp.earned,false);assert.equal(result.stamp.completed,1);assert.equal(result.next,undefined);}
 });
 it('keeps the same earned stamp on replays with hints or a different duration',()=>{
  const values={[second.id]:cardProgress(solve(second),second.spec)},a=releaseRunResult(pair,first,solve(first),values,'ready')!,b=releaseRunResult(pair,first,{...solve(first,3),elapsed:604800},values,'offline')!;
  assert.equal(a.stamp.id,b.stamp.id);assert.equal(a.stamp.earned,true);assert.equal(b.stamp.earned,true);assert.equal(b.next,undefined);
 });
 it('resolves an older archive pair from actual owner-only cloud records after today has changed',async()=>{
  const old=pairs.at(-1)!,current=releasedChapter(old.chapters[0].id,now)!,other=releasedChapter(old.chapters[1].id,now)!,f=fixture(now),store=new ChapterStore(f.db,f.clock);
  await store.saveProgress('alice',other.id,solve(other,3));
  const read=async(owner:string)=>Object.fromEntries((await store.cardProgress(owner,[other.id])).chapters.map(c=>[c.id,c.progress]));
  const a=releaseRunResult(old,current,solve(current,2),await read('alice'),'ready')!,b=releaseRunResult(old,current,solve(current),await read('bob'),'ready')!;
  assert.equal(a.stamp.earned,true);assert.equal(a.stamp.date,old.date);assert.notEqual(a.stamp.date,pair.date);assert.equal(b.stamp.earned,false);assert.equal(b.next?.id,other.id);assert.equal((await f.game.rating('alice')).played,0);
 });
});
