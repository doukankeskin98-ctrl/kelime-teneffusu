import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {wordFeedbackLedger,wordFlightPlan} from '../lib/game/word-feedback.ts';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {viewCell} from '../lib/game/board-view.ts';

describe('confirmed word feedback ledger',()=>{
 it('silently restores old words, consumes each new ID once and survives cancellation',()=>{const l=wordFeedbackLedger('A',['old']);assert.deepEqual(l.consume('A',['old']),[]);assert.deepEqual(l.consume('A',['old','new','new']),['new']);assert.deepEqual(l.consume('A',['old','new']),[]);assert.deepEqual(l.consume('A',['old','new','hidden'],false),[]);assert.deepEqual(l.consume('A',['old','new','hidden']),[]);});
 it('never invents success from a pending/rejected input and scopes explicit replays',()=>{const l=wordFeedbackLedger('A',[]);assert.deepEqual(l.consume('A',[]),[]);assert.deepEqual(l.consume('A',['0']),['0']);assert.deepEqual(l.consume('B',['0']),[]);assert.deepEqual(l.consume('replay',[]),[]);assert.deepEqual(l.consume('replay',['0']),['0']);});
});
function harness(initial:string[]=[]){
 const slots:any[]=[],effects:(()=>void)[]=[],timers=new Map<number,()=>void>(),sparks=new Set<any>(),animations:any[]=[];
 let cursor=0,time=0,reduced=false,active=true,reads=0,wrote=false,readsAfterWrite=0;
 const measure=(value:unknown)=>{reads++;if(wrote)readsAfterWrite++;return value;};
 const rect={left:0,top:150,width:300,height:300},dest={left:10,top:70,width:80,height:40};
 const animate=(frames:unknown,options:unknown)=>{const animation={frames,options,cancelled:false,cancel(){this.cancelled=true;}};animations.push(animation);return animation;};
 const destination={dataset:{wordGroup:'0'},hasAttribute:(name:string)=>name==='data-word-group',getBoundingClientRect:()=>measure(dest),animate};
 const screen={getBoundingClientRect:()=>measure({left:0,top:0}),querySelector:(selector:string)=>selector==='.letter-board'?{getBoundingClientRect:()=>measure(rect),animate}:destination,querySelectorAll:()=>[destination],appendChild:(node:any)=>{wrote=true;sparks.add(node);}};
 const element=()=>{let label='';const children:any[]=[];return {className:'',style:{fontSize:''},children,setAttribute(){},appendChild(child:any){children.push(child);},get textContent():string{return label+children.map(c=>c.textContent).join('');},set textContent(v:string){label=v;},animate,remove(){sparks.delete(this);}};};
 const doc=Object.assign(new EventTarget(),{hidden:false,documentElement:{dataset:{} as Record<string,string>},createElement:element});
 const win=Object.assign(new EventTarget(),{matchMedia:()=>({matches:reduced})});
 const hooks={useRef(value:any){return slots[cursor++]??={current:value};},useEffect(fn:()=>any,deps:any[]){const i=cursor++,slot=slots[i];if(!slot||deps.some((d,j)=>!Object.is(d,slot.deps[j]))){slots[i]={deps,cleanup:slot?.cleanup};effects.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}}};
 const exports:any={};
 vm.runInNewContext(ts.transpileModule(readFileSync('components/game/WordFeedback.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:(name:string)=>name==='react'?hooks:name==='@/lib/game/word-feedback'?{wordFeedbackLedger,wordFlightPlan}:name==='@/lib/game/board-view'?{viewCell}:name==='@/lib/platform/runtime'?{gameIsActive:()=>active}:{},window:win,document:doc,setTimeout:(fn:()=>void)=>{timers.set(++time,fn);return time;},clearTimeout:(id:number)=>timers.delete(id)});
 const stroke=(id:string)=>({id,a:[0,0],b:[0,3]});
 const props:any={root:{current:screen},scope:'A',board:{size:6,grid:Array.from({length:6},()=>[...'KALEXX']),targets:Array.from({length:8},(_,i)=>({id:String(i),group:0,text:'KALE',label:'KALE'}))},confirmed:initial.map(stroke),turned:false,paused:false};
 const render=(changes:any={})=>{Object.assign(props,changes);cursor=0;wrote=false;exports.WordFeedback(props);while(effects.length)effects.shift()!();};render();
 return {render,get reads(){return reads;},get readsAfterWrite(){return readsAfterWrite;},confirm:(ids:string[])=>render({confirmed:ids.map(stroke)}),get sparks(){return sparks.size;},get labels(){return [...sparks].map(s=>s.textContent);},get timers(){return timers.size;},animations,props,reduced(value:boolean){reduced=value;},hide(){doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));},show(){doc.hidden=false;},blur(){win.dispatchEvent(new Event('blur'));},pause(){active=false;render({paused:true});},expire(){for(const fn of [...timers.values()])fn();},close(){for(const slot of slots)slot.cleanup?.();}};
}
describe('actual decorative effect lifecycle',()=>{
 it('keeps resumed ink silent; final confirmed words animate without waiting for input or awarding state',()=>{const h=harness(['0']);try{assert.equal(h.sparks,0);h.confirm(['0','1']);assert.equal(h.sparks,1);h.render();assert.equal(h.sparks,1);h.expire();assert.equal(h.sparks,0);assert.equal(h.timers,0);h.confirm(['0','1']);assert.equal(h.sparks,0);}finally{h.close();}});
 it('bounds rapid confirmations to four sparks and cleans all timers/animations on unmount',()=>{const h=harness();for(let i=1;i<=8;i++)h.confirm(Array.from({length:i},(_,j)=>String(j)));assert.equal(h.sparks,4);assert.equal(h.timers,4);h.close();assert.equal(h.sparks,0);assert.equal(h.timers,0);assert(h.animations.every(a=>a.cancelled));});
 it('cancels on rotation, background and pause without replaying consumed words',()=>{for(const action of ['turn','hide','pause'] as const){const h=harness();try{h.confirm(['0']);assert.equal(h.sparks,1);if(action==='turn')h.render({turned:true});else if(action==='hide')h.hide();else h.pause();assert.equal(h.sparks,0);assert.equal(h.timers,0);h.show();h.render({paused:false});assert.equal(h.sparks,0);}finally{h.close();}}});
 it('reduced motion consumes confirmation without movement or delayed celebration',()=>{const h=harness();try{h.reduced(true);h.confirm(['0']);assert.equal(h.sparks,0);h.reduced(false);h.confirm(['0']);assert.equal(h.sparks,0);h.confirm(['0','1']);assert.equal(h.sparks,1);}finally{h.close();}});
 it('an explicit replay is mounted fresh, cancelling previous work and accepting the same word once',()=>{const h=harness();h.confirm(['0']);h.close();assert.equal(h.timers,0);const replay=harness();try{replay.confirm(['0']);assert.equal(replay.sparks,1);replay.confirm(['0']);assert.equal(replay.sparks,1);}finally{replay.close();}});
});

it('flies only the letters actually found without exposing an unfinished hidden answer',()=>{const h=harness();try{
 const first={id:'0',a:[0,0],b:[0,7]},second={id:'1',a:[1,0],b:[1,5]};
 h.render({board:{size:9,grid:[[...'KUYRUKLUX'],[...'YILDIZXXX'],...Array.from({length:7},()=>[...'XXXXXXXXX'])],targets:[{id:'0',group:0,text:'KUYRUKLU',label:'KUYRUKLU YILDIZ'},{id:'1',group:0,text:'YILDIZ',label:'KUYRUKLU YILDIZ'}]}});
 h.render({confirmed:[first]});assert.deepEqual(h.labels,['KUYRUKLU']);h.render({confirmed:[first,second]});assert.deepEqual(h.labels,['KUYRUKLU','YILDIZ']);
}finally{h.close();}});


it('does no geometry work for repeated confirmed state and batches all fresh geometry before writes',()=>{
 const h=harness(['0']);try{assert.equal(h.reads,0);h.confirm(['0']);assert.equal(h.reads,0);h.confirm(['0','1','2','3']);assert.equal(h.sparks,3);assert.equal(h.reads,3);assert.equal(h.readsAfterWrite,0);const reads=h.reads;for(let i=0;i<50;i++)h.confirm(['0','1','2','3']);assert.equal(h.reads,reads);}finally{h.close();}
});

describe('letter flight geometry',()=>{
 const rect={left:20,top:200,width:300,height:300},root={left:10,top:20},dest={left:80,top:80,width:100,height:32};
 const target={id:'0',group:0,text:'KALE',label:'KALE'};
 it('starts each glyph at its own cell, including reverse and turned selections',()=>{
  const board={size:6,grid:[[...'KALEXX'],...Array.from({length:5},()=>[...'XXXXXX'])]};
  for(const turned of [false,true])for(const reverse of [false,true]){
   const a:[number,number]=reverse?[0,3]:[0,0],b:[number,number]=reverse?[0,0]:[0,3];
   const plan=wordFlightPlan(board,{id:'0',a,b},target,turned,rect,root,dest)!;
   assert.equal(plan.letters.map(l=>l.text).join(''),'KALE');
   assert.deepEqual(plan.letters.map(l=>[l.x,l.y]),turned?[[285,455],[235,455],[185,455],[135,455]]:[[35,205],[85,205],[135,205],[185,205]]);
   assert(plan.letters.every(l=>l.ty===76));assert(plan.letters.every(l=>l.tx>=70&&l.tx<=170));
  }
 });
 it('keeps diagonal sources diagonal and never invents letters for a mismatching path',()=>{
  const grid=Array.from({length:6},()=>[...'XXXXXX']);[...'KALE'].forEach((c,i)=>grid[i]![i]=c);
  const plan=wordFlightPlan({size:6,grid},{id:'0',a:[0,0],b:[3,3]},target,false,rect,root,dest)!;
  assert.deepEqual(plan.letters.map(l=>[l.x,l.y]),[[35,205],[85,255],[135,305],[185,355]]);
  assert.equal(wordFlightPlan({size:6,grid},{id:'0',a:[0,0],b:[0,3]},target,false,rect,root,dest),null);
 });
 it('animates glyphs together and reaches the target before cleanup',()=>{
  const h=harness();try{h.confirm(['0']);assert.equal(h.animations.length,5);
   const letters=h.animations.slice(0,4);assert.deepEqual(letters.map(a=>a.options.delay),[0,10,20,30]);
   for(const a of letters){assert.equal(a.frames.at(-1).opacity,0);assert(a.options.duration+a.options.delay<800);}
   assert.equal(h.readsAfterWrite,0);h.expire();assert(h.animations.every(a=>a.cancelled));assert.equal(h.sparks,0);
  }finally{h.close();}
 });
});
