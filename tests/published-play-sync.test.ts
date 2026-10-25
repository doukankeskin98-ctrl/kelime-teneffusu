// Runs the real component logic with minimal hook/IO substitutes.
// This is not a DOM, concurrent React rendering or physical-device test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as cache from '../lib/studio/chapter-cache.ts';
import * as chapterProgress from '../lib/studio/chapter-progress.ts';
import * as progress from '../lib/game/progress.ts';
import * as content from '../lib/studio/content.ts';
import {RELEASE_BATCHES} from '../lib/studio/releases.ts';
import type {SavedLevel} from '../lib/game/progress.ts';
import type {Puzzle} from '../lib/game/engine.ts';

const chapter=RELEASE_BATCHES[0]!.chapters[0]!.chapter;
const complete=progress.cleanSave({strokes:chapter.board.placements,
 elapsed:19,hints:0,complete:false,stars:0},chapter.board);
const compiled=ts.transpileModule(
 readFileSync('components/game/PublishedChapters.tsx','utf8'),
 {compilerOptions:{module:ts.ModuleKind.CommonJS,
  jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}
).outputText;
type VNode={type:unknown;key?:unknown;props:Record<string,unknown>};
type Slot={value?:unknown;ref?:{current:unknown};deps?:unknown[];cleanup?:()=>void};
type Timer={fn:()=>void;delay:number;repeat:boolean};
type SoloView={key?:unknown;props:{config:{practice:boolean};external:{
 board:Puzzle;save?:SavedLevel;resume?:SavedLevel;personalBestKnown?:boolean;onSave:(save:SavedLevel)=>void};onBack:()=>void;onNext:()=>void}};
function deferred<T>(){
 let resolve!:(value:T)=>void;
 const promise=new Promise<T>(yes=>{resolve=yes;});
 return {promise,resolve};
}
const response=(save:SavedLevel)=>({ok:true,json:async()=>({save})}) as Response;
function children(node:unknown):unknown[]{
 if(Array.isArray(node))return node;
 if(!node||typeof node!=='object')return [];
 const value=(node as VNode).props?.['children'];
 return Array.isArray(value)?value:[value];
}
function findSolo(node:unknown):SoloView|undefined{
 if(node&&typeof node==='object'&&(node as VNode).type==='Solo')
  return node as unknown as SoloView;
 for(const child of children(node)){const found=findSolo(child);if(found)return found;}
 return undefined;
}
function textOf(node:unknown):string{
 return typeof node==='string'?node:children(node).map(textOf).join(' ');
}

function harness(owner:string,mode:'reject'|'timeout'|'success',initial:SavedLevel=complete,options:{cache?:'missing'|'mismatch';offline?:boolean}={}){
 let currentOwner=owner,mounted=true,storageFails=false;
 const connectivity={onLine:!options.offline};
 let afterUnmountUpdates=0;const gets:string[]=[];
 const values=new Map<string,string>([
  [cache.BOARD_KEY,JSON.stringify(options.cache==='missing'?{}:{[chapter.id]:options.cache==='mismatch'?{...chapter,contentHash:'f'.repeat(64)}:chapter})],
  [cache.saveKey('alice'),JSON.stringify({[chapter.id]:initial})]
 ]),reads:string[]=[];
 const storage={getItem:(key:string)=>{reads.push(key);return values.get(key)??null;},
  setItem:(key:string,value:string)=>{if(storageFails)throw new Error('Quota exceeded');values.set(key,value);}};
 const puts:{id:string;save:SavedLevel;expectedOwnerId?:string;authOwner:string;signal?:AbortSignal|null}[]=[],upload=deferred<Response>(),uploads=[upload];
 const request=async(path:string,init:RequestInit={}):Promise<Response>=>{
  if(init.method==='PUT'){
   const sent=JSON.parse(String(init.body)) as {id:string;save:SavedLevel;expectedOwnerId?:string};
   puts.push({...sent,authOwner:currentOwner,signal:init.signal});
   const flight=puts.length===1?upload:deferred<Response>();if(puts.length>1)uploads.push(flight);
   return flight.promise;
  }
  gets.push(path);
  if(path.startsWith('/api/chapters?action=progress'))return response(progress.cleanSave(undefined,chapter.board));
  assert.equal(path,'/api/chapters?id='+encodeURIComponent(chapter.id));
  if(mode==='success')return {ok:true,json:async()=>chapter} as Response;
  if(mode==='reject')throw new Error('Controlled network failure');
  assert.ok(init.signal);
  const signal=init.signal;
  return new Promise((_resolve,reject)=>{
   const abort=()=>reject(new DOMException('Aborted','AbortError'));
   if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});
  });
 };
 const slots:Slot[]=[],effects:(()=>void)[]=[],timers=new Map<number,Timer>();
 let cursor=0,timerId=0,pendingRender=true,tree:unknown;
 const hooks={
  useState(initial:unknown){
   const slot=slots[cursor]??=( {value:typeof initial==='function'?initial():initial} );
   cursor++;
   return [slot.value,(next:unknown)=>{
    if(!mounted)afterUnmountUpdates++;
    const value=typeof next==='function'?next(slot.value):next;
    if(!Object.is(slot.value,value)){slot.value=value;pendingRender=true;}
   }];
  },
  useRef(initial:unknown){
   const slot=slots[cursor++]??={};return slot.ref??={current:initial};
  },
  useEffect(effect:()=>void|(()=>void),deps:unknown[]){
   const slot=slots[cursor++]??={};
   if(!slot.deps||slot.deps.length!==deps.length||
    deps.some((value,i)=>!Object.is(value,slot.deps![i]))){
    slot.deps=deps;
    effects.push(()=>{slot.cleanup?.();const cleanup=effect();
     slot.cleanup=typeof cleanup==='function'?cleanup:undefined;});
   }
  },useId:()=> 'test-id'
 };
 const windowTarget=new EventTarget();
 const documentTarget=Object.assign(new EventTarget(),{hidden:false});
 const timer=(repeat:boolean)=>(fn:()=>void,delay:number)=>{
  const id=++timerId;timers.set(id,{fn,delay,repeat});return id;
 };
 const exports:Record<string,unknown>={},queueExports:Record<string,unknown>={};
 const jsx=(type:unknown,props:Record<string,unknown>,key?:unknown)=>({type,props,key});
 const modules:Record<string,unknown>={
  react:hooks,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},
  '@/lib/game/progress':progress,'@/lib/studio/content':content,
  '@/lib/studio/chapter-progress':chapterProgress,
  '@/lib/studio/chapter-save-queue':queueExports,
  '@/lib/studio/chapter-cache':{...cache,
   dictionary:(key:string)=>cache.dictionary(key,storage),
   rememberChapter:(value:content.PlayableChapter)=>cache.rememberChapter(value,storage)},
  '@/lib/auth/firebase-client':{memberFetch:request},
  '@/lib/studio/release-stamps':{playableReleasePair:()=>null},
  './Solo':{Solo:'Solo'},
  './useChapterCards':{useChapterCards:()=>({values:{},status:'ready',retry(){}})}
 };
 const clock={setTimeout:timer(false),setInterval:timer(true),
  clearTimeout:(id:number)=>timers.delete(id),clearInterval:(id:number)=>timers.delete(id)};
 vm.runInNewContext(ts.transpileModule(readFileSync('lib/studio/chapter-save-queue.ts','utf8'),
  {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
  {exports:queueExports,require:()=>chapterProgress,AbortController,...clock});
 vm.runInNewContext(compiled,{exports,
  require:(name:string)=>modules[name]??{},fetch:request,localStorage:storage,
  navigator:connectivity,AbortController,DOMException,queueMicrotask,
  window:windowTarget,document:documentTarget,
  ...clock
 });
 const play=exports['PublishedPlay'] as (props:unknown)=>unknown;
 const render=()=>{
  pendingRender=false;cursor=0;
  tree=play({chapter,userId:currentOwner,progress:progress.emptyProgress(),
   onProgress(){},onBack(){}});
  for(const effect of effects.splice(0))effect();
 };
 return {
  puts,reads,values,upload,uploads,gets,
  get afterUnmountUpdates(){return afterUnmountUpdates;},
  async settle(){
   for(let i=0;i<30;i++){await Promise.resolve();if(pendingRender&&mounted)render();}
  },
  solo(){const solo=findSolo(tree);assert.ok(solo,'validated cached board should open');return solo;},
  hasSolo:()=>!!findSolo(tree),text:()=>textOf(tree),
  switchOwner(next:string){currentOwner=next;pendingRender=true;},
  renderOnce(){render();},
  setSave(save:SavedLevel){this.solo().props.external.onSave(save);},
  leave(){this.solo().props.onBack();this.close();},
  replay(){this.solo().props.onNext();},
  mountSolo(){
   const solo=this.solo(),external=solo.props.external;
   // Solo.tsx calls onSave with its initial save once on mount; no new move.
   external.onSave(progress.cleanSave(solo.props.config.practice?undefined:external.save,external.board));
  },
  online:()=>{connectivity.onLine=true;return windowTarget.dispatchEvent(new Event('online'));},
  offline(){connectivity.onLine=false;},
  storageFails(value:boolean){storageFails=value;},
  tick(){for(const entry of [...timers.values()])if(entry.repeat)entry.fn();},
  expireLoad(){
   const entry=[...timers.values()].find(value=>!value.repeat);
   assert.ok(entry,'request should have an abort deadline');entry.fn();
  },
  close(){if(!mounted)return;mounted=false;for(const slot of slots)slot.cleanup?.();}
 };
}

describe('PublishedPlay immediate cached startup and honest cold loading',()=>{
 it('opens the unchanged device completion before any GET or PUT acknowledgement',async()=>{
  const page=harness('alice','timeout');
  try{
   await page.settle();
   assert.equal(page.gets.length,0,'a validated cached board must not wait for a GET');
   assert.equal(page.solo().props.external.save?.complete,true);
   assert.equal(page.puts.length,1,'one account-scoped background merge starts');
   assert.equal(page.puts[0]!.expectedOwnerId,'alice');
   assert.equal(JSON.stringify(page.puts[0]!.save),JSON.stringify(complete));
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
   page.mountSolo();page.online();page.tick();await page.settle();
   assert.equal(page.puts.length,1,'bootstrap and timers share the same flight');
   page.upload.resolve(response(complete));await page.settle();
   assert.match(page.text(),/Hesabında kayıtlı/);
   assert.equal(page.solo().props.external.resume?.complete,true);
  }finally{page.close();}
 });
 it('does not open a missing board and exposes retry after a cold GET timeout',async()=>{
  const page=harness('alice','timeout',complete,{cache:'missing'});
  try{
   await page.settle();assert.equal(page.hasSolo(),false);assert.equal(page.gets.length,1);
   assert.equal(page.puts.length,0);page.expireLoad();await page.settle();
   assert.equal(page.hasSolo(),false);assert.match(page.text(),/Yeniden dene/);
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
  }finally{page.close();}
 });
 it('never reads another owner’s completion from the same cached board',async()=>{
  const page=harness('bob','reject');
  try{
   await page.settle();const save=page.solo().props.external.save!;
   assert.equal(save.strokes.length,0);assert.equal(save.complete,false);
   page.mountSolo();await page.settle();page.online();page.tick();await page.settle();
   assert.equal(page.reads.includes(cache.saveKey('alice')),false);
   for(const sent of page.puts){assert.equal(sent.save.strokes.length,0);assert.equal(sent.save.complete,false);}
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
   assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
  }finally{page.close();}
 });
});


const partial=progress.cleanSave({strokes:chapter.board.placements.slice(0,1),
 elapsed:12,hints:0,complete:false,stars:0},chapter.board);
describe('PublishedPlay owner-scoped save queue',()=>{
 it('drains the final completion after an in-app exit while a partial PUT is pending',async()=>{
  const page=harness('alice','reject',partial);
  await page.settle();page.mountSolo();page.tick();await page.settle();
  assert.equal(page.puts.length,1);assert.equal(page.puts[0]!.save.complete,false);
  page.setSave(complete);await page.settle();page.leave();
  page.upload.resolve(response(partial));await page.settle();
  assert.equal(page.puts.length,2,'exit must retain and drain the newest snapshot');
  assert.equal(page.puts[1]!.save.complete,true);
  assert.equal(page.puts[1]!.expectedOwnerId,'alice');assert.equal(page.puts[1]!.authOwner,'alice');
  page.uploads[1]!.resolve(response(complete));await page.settle();
  assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
 });
 it('cancels an old owner, ignores its late reply and preserves the new owner flight',async()=>{
  const page=harness('alice','reject',partial);
  try{
   await page.settle();page.mountSolo();page.tick();await page.settle();
   page.switchOwner('bob');page.renderOnce();
   assert.match(page.text(),/Bölümün ve kayıtların hazırlanıyor/);
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);await page.settle();
   assert.equal(page.puts[0]!.signal?.aborted,true);
   page.setSave(partial);page.tick();await page.settle();
   assert.equal(page.puts.length,2);assert.equal(page.puts[1]!.expectedOwnerId,'bob');
   page.upload.resolve(response(complete));await page.settle();page.tick();await page.settle();
   assert.equal(page.puts.length,2,'old finally must not unlock Bob’s active flight');
   assert.equal(page.solo().props.external.save?.complete,false);
   assert.equal(JSON.parse(page.values.get(cache.saveKey('bob'))!)[chapter.id].complete,false);
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
   page.uploads[1]!.resolve(response(partial));await page.settle();
   assert.match(page.text(),/Hesabında kayıtlı/);
  }finally{page.close();}
 });
 it('releases a timed-out upload and retries the latest save on the next event',async()=>{
  const page=harness('alice','reject',partial);
  try{
   await page.settle();page.mountSolo();page.tick();await page.settle();
   page.setSave(complete);await page.settle();page.expireLoad();await page.settle();
   assert.equal(page.puts[0]!.signal?.aborted,true);
   assert.equal(page.puts.length,1,'timeout must not start an immediate retry loop');
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
   page.online();await page.settle();assert.equal(page.puts.length,2);
   assert.equal(page.puts[1]!.save.complete,true);
   page.upload.resolve(response(partial));await page.settle();page.tick();await page.settle();
   assert.equal(page.puts.length,2,'late timed-out acknowledgement cannot alter the new flight');
   page.uploads[1]!.resolve(response(complete));await page.settle();
   assert.match(page.text(),/Hesabında kayıtlı/);
  }finally{page.close();}
 });
 it('keeps the local completion and stops after a failed detached upload',async()=>{
  const page=harness('alice','reject',partial);
  await page.settle();page.mountSolo();page.tick();await page.settle();
  page.setSave(complete);await page.settle();page.leave();
  page.upload.resolve({ok:false} as Response);await page.settle();
  assert.equal(page.puts.length,1);
  assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
 });
 it('merges a detached acknowledgement with a newer device result without replacing its best',async()=>{
  const page=harness('alice','reject',partial);
  await page.settle();page.mountSolo();page.tick();await page.settle();page.leave();
  const better=progress.cleanSave({...complete,elapsed:10},chapter.board);
  page.values.set(cache.saveKey('alice'),JSON.stringify({[chapter.id]:better}));
  page.upload.resolve(response(partial));await page.settle();
  assert.equal(page.puts.length,2);assert.equal(page.puts[1]!.save.elapsed,10);
  page.uploads[1]!.resolve(response(complete));await page.settle();
  assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].elapsed,10);
 });
});


describe('PublishedPlay final snapshots and bounded response parsing',()=>{
 it('also drains a completion created during the second PUT before exit',async()=>{
  const page=harness('alice','reject',partial);
  await page.settle();page.mountSolo();page.tick();await page.settle();
  const second=progress.cleanSave({...partial,strokes:chapter.board.placements.slice(0,2)},chapter.board);
  page.setSave(second);await page.settle();
  page.upload.resolve(response(partial));await page.settle();assert.equal(page.puts.length,2);
  page.setSave(complete);await page.settle();
  assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
  page.leave();page.uploads[1]!.resolve(response(second));await page.settle();
  assert.equal(page.puts.length,3);assert.equal(page.puts[2]!.save.complete,true);
  page.uploads[2]!.resolve(response(complete));await page.settle();
  assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
 });
 it('bounds a response whose JSON body never finishes, then accepts a fresh acknowledgement',async()=>{
  const page=harness('alice','reject',partial);
  try{
   await page.settle();page.mountSolo();page.tick();await page.settle();
   page.upload.resolve({ok:true,json:()=>new Promise(()=>{})} as Response);await page.settle();
   page.expireLoad();await page.settle();
   assert.equal(page.puts[0]!.signal?.aborted,true);assert.equal(page.puts.length,1);
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
   page.online();await page.settle();assert.equal(page.puts.length,2);
   page.uploads[1]!.resolve(response(partial));await page.settle();
   assert.match(page.text(),/Hesabında kayıtlı/);
  }finally{page.close();}
 });
});


describe('PublishedPlay device and connection status',()=>{
 it('reports a failed device write and recovers only after storage really works',async()=>{
  const page=harness('alice','reject',partial);
  try{
   await page.settle();page.storageFails(true);page.setSave(complete);await page.settle();
   assert.match(page.text(),/Cihaz kaydı kullanılamıyor/);
   page.tick();await page.settle();page.upload.resolve(response(complete));await page.settle();
   assert.match(page.text(),/Cihaz kaydı kullanılamıyor/);
   page.storageFails(false);page.setSave(complete);await page.settle();
   assert.doesNotMatch(page.text(),/Cihaz kaydı kullanılamıyor/);
   assert.match(page.text(),/Hesabında kayıtlı/);
   assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
  }finally{page.close();}
 });
 it('keeps the latest snapshot locally while offline and sends it on reconnect',async()=>{
  const page=harness('alice','reject',partial,{offline:true});
  try{
   await page.settle();page.offline();page.setSave(complete);page.tick();await page.settle();
   assert.equal(page.puts.length,0);assert.match(page.text(),/Cihazında kayıtlı/);
   assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
   page.online();await page.settle();assert.equal(page.puts.length,1);
   assert.equal(page.puts[0]!.save.complete,true);
   page.upload.resolve(response(complete));await page.settle();
   assert.match(page.text(),/Hesabında kayıtlı/);
  }finally{page.close();}
 });
});


describe('PublishedPlay live confirmation handoff',()=>{
 it('merges delayed cloud words with newer local discoveries without changing the Solo key',async()=>{
  const page=harness('alice','timeout',partial);
  try{
   await page.settle();const first=page.solo();
   const local=progress.cleanSave({...partial,strokes:chapter.board.placements.slice(0,2),elapsed:30},chapter.board);
   const remote=progress.cleanSave({...partial,strokes:[chapter.board.placements[2]!],elapsed:40},chapter.board);
   page.setSave(local);await page.settle();page.upload.resolve(response(remote));await page.settle();
   const resume=page.solo().props.external.resume!;
   assert.equal(resume.strokes.length,3);assert.equal(resume.elapsed,40);
   assert.equal(page.solo().props.external.save,first.props.external.save,'the run baseline is not replaced');
   assert.equal(page.solo().key,first.key,'confirmation must not remount the active Solo');
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/,'new local words still await their acknowledgement');
   assert.equal(page.puts.length,2);assert.equal(page.puts[1]!.save.strokes.length,3);
   page.uploads[1]!.resolve(response(page.puts[1]!.save));await page.settle();
   assert.match(page.text(),/Hesabında kayıtlı/);
  }finally{page.close();}
 });
 it('keeps an uncertain cached replay baseline separate and uses the confirmed best on the next replay',async()=>{
  const old=progress.cleanSave({...complete,elapsed:60},chapter.board),best=progress.cleanSave({...complete,elapsed:20},chapter.board);
  const page=harness('alice','timeout',old);
  try{
   await page.settle();page.replay();await page.settle();
   assert.equal(page.solo().props.config.practice,true);
   assert.equal(page.solo().props.external.personalBestKnown,false);
   page.mountSolo();page.upload.resolve(response(best));await page.settle();
   assert.equal(page.solo().props.external.resume?.elapsed,20);
   assert.equal(page.solo().props.external.personalBestKnown,false,'the active run did not have a verified baseline');
   page.replay();await page.settle();
   assert.equal(page.solo().props.external.save?.elapsed,20);
   assert.equal(page.solo().props.external.personalBestKnown,true);
  }finally{page.close();}
 });
 it('does not emit a UI confirmation after leaving while the detached final save drains',async()=>{
  const page=harness('alice','timeout',partial);
  await page.settle();page.setSave(complete);await page.settle();page.leave();
  page.upload.resolve(response(partial));await page.settle();
  assert.equal(page.puts.length,2);page.uploads[1]!.resolve(response(complete));await page.settle();
  assert.equal(page.afterUnmountUpdates,0);
  assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
 });
 it('rejects a mismatched cached hash and uses the existing cold board and owner-guarded read',async()=>{
  const page=harness('alice','success',partial,{cache:'mismatch'});
  try{
   await page.settle();assert.equal(page.gets.length,2);
   assert.equal(page.solo().props.external.board.size,chapter.board.size);
   assert.match(page.gets[1]!,/expectedOwnerId=alice/);
   assert.equal(page.solo().props.external.personalBestKnown,true);
  }finally{page.close();}
 });
});
