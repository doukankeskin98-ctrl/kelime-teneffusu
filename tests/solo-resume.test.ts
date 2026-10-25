// Executes the real Solo logic. Minimal queued hooks/JSX/clock substitute for IO;
// this does not validate a DOM, concurrent React/StrictMode or a physical phone.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as catalog from '../lib/game/catalog.ts';
import * as engine from '../lib/game/engine.ts';
import * as content from '../lib/game/content.ts';
import * as progress from '../lib/game/progress.ts';
import * as discovery from '../lib/game/discovery.ts';
import * as chapterProgress from '../lib/studio/chapter-progress.ts';
import {RELEASE_BATCHES} from '../lib/studio/releases.ts';
import type {SavedLevel} from '../lib/game/progress.ts';

const board=RELEASE_BATCHES[0]!.chapters[0]!.chapter.board;
const saved=(ids:number[],elapsed=0,hints=0)=>progress.cleanSave({
 strokes:ids.map(i=>board.placements[i]!),elapsed,hints,complete:false,stars:0},board);
const compiled=ts.transpileModule(readFileSync('components/game/Solo.tsx','utf8'),
 {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
type Node={type:unknown;props:Record<string,unknown>};
type Update=unknown|((previous:unknown)=>unknown);
type Slot={value?:unknown;ref?:{current:unknown};deps?:unknown[];cleanup?:()=>void;updates?:Update[]};
function nodes(value:unknown):Node[]{
 if(Array.isArray(value))return value.flatMap(nodes);
 if(!value||typeof value!=='object')return [];
 const node=value as Node;return [node,...['children','footer','aside','effect'].flatMap(key=>nodes(node.props?.[key]))];
}
function textOf(value:unknown):string{
 if(typeof value==='string')return value;
 if(Array.isArray(value))return value.map(textOf).join(' ');
 return value&&typeof value==='object'?textOf((value as Node).props?.['children']):'';
}
function harness({initial=saved([]),practice=false,known=false}:{initial?:SavedLevel;practice?:boolean;known?:boolean}={}){
 const slots:Slot[]=[],effects:(()=>void)[]=[],writes:SavedLevel[]=[];
 const timers=new Map<number,{fn:()=>void;repeat:boolean}>();
 let cursor=0,timerId=0,now=0,pending=true,tree:unknown,resume:SavedLevel|undefined;
 const changed=(slot:Slot,deps:unknown[])=>!slot.deps||slot.deps.length!==deps.length||deps.some((v,i)=>!Object.is(v,slot.deps![i]));
 const hooks={
  useState(initial:unknown){
   const slot=slots[cursor++]??={value:typeof initial==='function'?initial():initial};
   return [slot.value,(next:Update)=>{(slot.updates??=[]).push(next);pending=true;}];
  },
  useRef(initial:unknown){const slot=slots[cursor++]??={};return slot.ref??={current:initial};},
  useMemo(compute:()=>unknown,deps:unknown[]){const slot=slots[cursor++]??={};if(changed(slot,deps)){slot.deps=deps;slot.value=compute();}return slot.value;},
  useEffect(effect:()=>void|(()=>void),deps:unknown[]){
   const slot=slots[cursor++]??={};
   if(changed(slot,deps)){slot.deps=deps;effects.push(()=>{slot.cleanup?.();const cleanup=effect();slot.cleanup=typeof cleanup==='function'?cleanup:undefined;});}
  }
 };
 const timer=(repeat:boolean)=>(fn:()=>void)=>{const id=++timerId;timers.set(id,{fn,repeat});return id;};
 const windowTarget=Object.assign(new EventTarget(),{matchMedia:()=>({matches:true})});
 const documentTarget=Object.assign(new EventTarget(),{hidden:false});
 const modules:Record<string,unknown>={
  react:hooks,'react/jsx-runtime':{jsx:(type:unknown,props:Record<string,unknown>)=>({type,props}),jsxs:(type:unknown,props:Record<string,unknown>)=>({type,props}),Fragment:'Fragment'},
  '@/lib/game/catalog':catalog,'@/lib/game/engine':engine,'@/lib/game/content':content,
  '@/lib/game/progress':progress,'@/lib/game/discovery':discovery,
  '@/lib/studio/chapter-progress':chapterProgress,'@/lib/game/telemetry':{track(){}},
  './common':{PlayLayout:'PlayLayout',PlayControls:'PlayControls',WordList:'WordList',Modal:'Modal',Help:'Help',useChime:()=>()=>{}},
  './Discovery':{DiscoveryResult:'DiscoveryResult'}
 };
 const exports:Record<string,unknown>={};
 vm.runInNewContext(compiled,{exports,require:(name:string)=>modules[name]??{},
  window:windowTarget,document:documentTarget,performance:{now:()=>now},Event,
  setInterval:timer(true),setTimeout:timer(false),clearInterval:(id:number)=>timers.delete(id),clearTimeout:(id:number)=>timers.delete(id)
 });
 const play=exports['Solo'] as (props:unknown)=>unknown;
 const render=()=>{
  pending=false;cursor=0;
  for(const slot of slots)for(const update of slot.updates?.splice(0)??[])
   slot.value=typeof update==='function'?update(slot.value):update;
  tree=play({config:{themeId:'hayvanlar',level:0,practice},progress:progress.emptyProgress(),
   onProgress(){},onBack(){},onMap(){},onNext(){},external:{board,save:initial,resume,
    personalBestKnown:known,title:'Deneme keşfi',note:'',onSave:(value:SavedLevel)=>writes.push(value)}});
  for(const effect of effects.splice(0))effect();
 };
 const find=(type:string)=>{const node=nodes(tree).find(n=>n.type===type);assert.ok(node,type+' should be present');return node;};
 return {
  writes,
  async settle(){for(let i=0;i<25;i++){await Promise.resolve();if(pending)render();}},
  get save(){assert.ok(writes.length);return writes.at(-1)!;},
  setResume(value:SavedLevel){resume=value;pending=true;},
  queueResumeThenCommit(value:SavedLevel,index:number){resume=value;pending=true;render();this.commit(index);},
  commit(index:number){const stroke=board.placements[index]!;(find('PlayLayout').props['onCommit'] as (a:engine.Cell,b:engine.Cell)=>void)(stroke.a,stroke.b);},
  tick(seconds:number){now+=seconds*1000;for(const entry of [...timers.values()])if(entry.repeat)entry.fn();},
  expire(){for(const [id,entry] of [...timers])if(!entry.repeat){timers.delete(id);entry.fn();}},
  pause(){(find('PlayControls').props['onPause'] as ()=>void)();},
  help(){(find('PlayControls').props['onHelp'] as ()=>void)();},
  closeHelp(){(find('Help').props['onClose'] as ()=>void)();},
  has:(type:string)=>nodes(tree).some(n=>n.type===type),
  hasBurst:()=>nodes(tree).some(n=>n.props?.['className']==='word-success-burst'),
  text:()=>textOf(tree),
  close(){for(const slot of slots)slot.cleanup?.();timers.clear();}
 };
}

describe('Solo live account resumption',()=>{
 it('keeps a newly found local word and adds a different cloud word without a new run',async()=>{
  const page=harness({initial:saved([0],5)});
  try{
   await page.settle();page.commit(1);await page.settle();
   page.setResume(saved([2],30,1));await page.settle();
   assert.deepEqual(page.save.strokes.map(s=>s.id),board.placements.slice(0,3).map(s=>s.id));
   assert.equal(page.save.elapsed,30);assert.equal(page.save.hints,1);
   assert.match(page.text(),/Hesabındaki keşifler bu tahtaya eklendi/);
  }finally{page.close();}
 });
 it('preserves both discoveries when resume and a fresh selection queue before the next render',async()=>{
  const page=harness({initial:saved([0],5)});
  try{
   await page.settle();page.queueResumeThenCommit(saved([2],30),1);await page.settle();
   assert.equal(page.save.strokes.length,3);
   for(const id of board.targets.slice(0,3).map(t=>t.id))assert(page.save.strokes.some(s=>s.id===id));
  }finally{page.close();}
 });
 it('advances from a hydrated elapsed time and preserves pause/resume timing',async()=>{
  const page=harness({initial:saved([0],2)});
  try{
   await page.settle();page.tick(1);await page.settle();assert.equal(page.save.elapsed,3);
   page.setResume(saved([1],45,2));await page.settle();assert.equal(page.save.elapsed,45);
   page.tick(1);await page.settle();assert.equal(page.save.elapsed,46);
   page.pause();await page.settle();page.tick(5);await page.settle();assert.equal(page.save.elapsed,46);
   page.pause();await page.settle();page.tick(2);await page.settle();assert.equal(page.save.elapsed,48);
   assert.equal(page.save.hints,2);
  }finally{page.close();}
 });
 it('does not turn account history into a fresh word burst or overlap an open help view',async()=>{
  const page=harness({initial:saved([0],5)});
  try{
   await page.settle();page.help();await page.settle();assert.equal(page.has('Help'),true);
   page.setResume(saved([0,1,2,3],20));await page.settle();page.expire();await page.settle();
   assert.equal(page.save.complete,true);assert.equal(page.hasBurst(),false);
   assert.equal(page.has('Help'),true);assert.equal(page.has('Modal'),false);
   page.closeHelp();await page.settle();assert.equal(page.has('Modal'),true);
  }finally{page.close();}
 });
 it('keeps a better completed result when an older partial or slower account snapshot arrives',async()=>{
  const best=saved([0,1,2,3],10),page=harness({initial:best});
  try{
   await page.settle();page.setResume(saved([0,1],90,2));await page.settle();
   assert.equal(page.save.complete,true);assert.equal(page.save.elapsed,10);assert.equal(page.save.stars,3);
   page.setResume(saved([0,1,2,3],30));await page.settle();assert.equal(page.save.elapsed,10);
  }finally{page.close();}
 });
});

describe('Solo replay stays separate from account history',()=>{
 it('starts empty and ignores late completed history while keeping its own words and time',async()=>{
  const page=harness({initial:saved([0,1,2,3],60),practice:true});
  try{
   await page.settle();assert.equal(page.save.strokes.length,0);assert.equal(page.save.complete,false);
   page.tick(5);page.commit(0);await page.settle();page.setResume(saved([0,1,2,3],20));await page.settle();
   assert.equal(page.save.strokes.length,1);assert.equal(page.save.complete,false);assert.equal(page.save.elapsed,5);
  }finally{page.close();}
 });
 for(const known of [false,true])it(`only announces a new personal best with a verified baseline: ${known}`,async()=>{
  const page=harness({initial:saved([0,1,2,3],60),practice:true,known});
  try{
   await page.settle();page.tick(30);await page.settle();
   for(let i=0;i<4;i++){page.commit(i);await page.settle();}
   page.expire();await page.settle();assert.equal(page.save.complete,true);assert.equal(page.save.elapsed,30);
   assert.equal(/Bu bölümde yeni kişisel en iyin/.test(page.text()),known);
  }finally{page.close();}
 });
});
