import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {wordFeedbackLedger} from '../lib/game/word-feedback.ts';
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
 let cursor=0,time=0,reduced=false,active=true;
 const rect={left:0,top:150,width:300,height:300},dest={left:10,top:70,width:80,height:40};
 const animate=(frames:unknown,options:unknown)=>{const animation={frames,options,cancelled:false,cancel(){this.cancelled=true;}};animations.push(animation);return animation;};
 const destination={dataset:{wordGroup:'0'},hasAttribute:(name:string)=>name==='data-word-group',getBoundingClientRect:()=>dest,animate};
 const screen={getBoundingClientRect:()=>({left:0,top:0}),querySelector:(selector:string)=>selector==='.letter-board'?{getBoundingClientRect:()=>rect,animate}:destination,querySelectorAll:()=>[destination],appendChild:(node:any)=>sparks.add(node)};
 const doc=Object.assign(new EventTarget(),{hidden:false,documentElement:{dataset:{} as Record<string,string>},createElement:()=>({className:'',setAttribute(){},animate,remove(){sparks.delete(this);}})});
 const win=Object.assign(new EventTarget(),{matchMedia:()=>({matches:reduced})});
 const hooks={useRef(value:any){return slots[cursor++]??={current:value};},useEffect(fn:()=>any,deps:any[]){const i=cursor++,slot=slots[i];if(!slot||deps.some((d,j)=>!Object.is(d,slot.deps[j]))){slots[i]={deps,cleanup:slot?.cleanup};effects.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}}};
 const exports:any={};
 vm.runInNewContext(ts.transpileModule(readFileSync('components/game/WordFeedback.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:(name:string)=>name==='react'?hooks:name==='@/lib/game/word-feedback'?{wordFeedbackLedger}:name==='@/lib/game/board-view'?{viewCell}:name==='@/lib/platform/runtime'?{gameIsActive:()=>active}:{},window:win,document:doc,setTimeout:(fn:()=>void)=>{timers.set(++time,fn);return time;},clearTimeout:(id:number)=>timers.delete(id)});
 const stroke=(id:string)=>({id,a:[0,0],b:[0,3]});
 const props:any={root:{current:screen},scope:'A',board:{size:6,targets:Array.from({length:8},(_,i)=>({id:String(i),group:0,text:'KALE',label:'KALE'}))},confirmed:initial.map(stroke),turned:false,paused:false};
 const render=(changes:any={})=>{Object.assign(props,changes);cursor=0;exports.WordFeedback(props);while(effects.length)effects.shift()!();};render();
 return {render,confirm:(ids:string[])=>render({confirmed:ids.map(stroke)}),get sparks(){return sparks.size;},get labels(){return [...sparks].map(s=>s.textContent);},get timers(){return timers.size;},animations,props,reduced(value:boolean){reduced=value;},hide(){doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));},show(){doc.hidden=false;},blur(){win.dispatchEvent(new Event('blur'));},pause(){active=false;render({paused:true});},expire(){for(const fn of [...timers.values()])fn();},close(){for(const slot of slots)slot.cleanup?.();}};
}
describe('actual decorative effect lifecycle',()=>{
 it('keeps resumed ink silent; final confirmed words animate without waiting for input or awarding state',()=>{const h=harness(['0']);try{assert.equal(h.sparks,0);h.confirm(['0','1']);assert.equal(h.sparks,1);h.render();assert.equal(h.sparks,1);h.expire();assert.equal(h.sparks,0);assert.equal(h.timers,0);h.confirm(['0','1']);assert.equal(h.sparks,0);}finally{h.close();}});
 it('bounds rapid confirmations to four sparks and cleans all timers/animations on unmount',()=>{const h=harness();for(let i=1;i<=8;i++)h.confirm(Array.from({length:i},(_,j)=>String(j)));assert.equal(h.sparks,4);assert.equal(h.timers,4);h.close();assert.equal(h.sparks,0);assert.equal(h.timers,0);assert(h.animations.every(a=>a.cancelled));});
 it('cancels on rotation, background and pause without replaying consumed words',()=>{for(const action of ['turn','hide','pause'] as const){const h=harness();try{h.confirm(['0']);assert.equal(h.sparks,1);if(action==='turn')h.render({turned:true});else if(action==='hide')h.hide();else h.pause();assert.equal(h.sparks,0);assert.equal(h.timers,0);h.show();h.render({paused:false});assert.equal(h.sparks,0);}finally{h.close();}}});
 it('reduced motion consumes confirmation without movement or delayed celebration',()=>{const h=harness();try{h.reduced(true);h.confirm(['0']);assert.equal(h.sparks,0);h.reduced(false);h.confirm(['0']);assert.equal(h.sparks,0);h.confirm(['0','1']);assert.equal(h.sparks,1);}finally{h.close();}});
 it('an explicit replay is mounted fresh, cancelling previous work and accepting the same word once',()=>{const h=harness();h.confirm(['0']);h.close();assert.equal(h.timers,0);const replay=harness();try{replay.confirm(['0']);assert.equal(replay.sparks,1);replay.confirm(['0']);assert.equal(replay.sparks,1);}finally{replay.close();}});
});

it('word flight shows only the found part until every hidden part is confirmed',()=>{const h=harness();try{h.render({board:{size:6,targets:[{id:'0',group:0,text:'KUYRUKLU',label:'KUYRUKLU YILDIZ'},{id:'1',group:0,text:'YILDIZ',label:'KUYRUKLU YILDIZ'}]}});h.confirm(['0']);assert.deepEqual(h.labels,['KUYRUKLU']);h.confirm(['0','1']);assert.deepEqual(h.labels,['KUYRUKLU','KUYRUKLU YILDIZ']);}finally{h.close();}});
