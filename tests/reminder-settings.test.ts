import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync('components/game/DailyReminder.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const state={available:true,enabled:false,permission:'unknown',offered:false};
type Node={type:unknown;props:Record<string,unknown>};
const nodes=(v:unknown):Node[]=>Array.isArray(v)?v.flatMap(nodes):v&&typeof v==='object'&&'props' in v?[v as Node,...nodes((v as Node).props['children'])]:[];
interface Slot{value?:unknown;current?:unknown;done?:boolean;cleanup?:()=>void}
function harness(){
 let cursor=0,tree:unknown,dirty=true,writes=0;const slots:Slot[]=[],effects:(()=>void)[]=[],reads:((value:unknown)=>void)[]=[],changes:((value:unknown)=>void)[]=[],window=new EventTarget();
 const hooks={useState(value:unknown){const slot=slots[cursor++]??={value};return[slot.value,(v:unknown)=>{writes++;slot.value=v;dirty=true;}];},useRef(value:unknown){return slots[cursor++]??={current:value};},useEffect(fn:()=>void|(()=>void)){const slot=slots[cursor++]??={};if(!slot.done){slot.done=true;effects.push(()=>{const cleanup=fn();slot.cleanup=typeof cleanup==='function'?cleanup:undefined;});}}};
 const exports:Record<string,(props:object)=>unknown>={},jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
 vm.runInNewContext(source,{exports,window,require:(name:string)=>name==='react'?hooks:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name==='lucide-react'?{Bell:'Bell'}:{reminderStatus:()=>new Promise(resolve=>reads.push(resolve)),setDailyReminder:()=>new Promise(resolve=>changes.push(resolve)),dismissReminderOffer:async()=>{}}});
 const paint=()=>{if(dirty){dirty=false;cursor=0;tree=exports['DailyReminder']!({});}while(effects.length)effects.shift()!();};paint();
 return {reads,changes,window,get writes(){return writes;},async flush(){for(let i=0;i<5;i++)await Promise.resolve();paint();},button(){const found=nodes(tree).find(n=>n.props['role']==='switch');assert.ok(found);return found;},click(){const fn=nodes(tree).find(n=>n.props['role']==='switch')?.props['onClick'];assert.equal(typeof fn,'function');(fn as ()=>void)();},close(){for(const s of slots)s.cleanup?.();}};
}
test('a stale resume read cannot undo successful opt-in and the OS permission resume cannot start a competing read',async()=>{
 const h=harness();h.reads[0]!(state);await h.flush();assert.equal(h.changes.length,0);
 h.window.dispatchEvent(new Event('kt-app-resume'));assert.equal(h.reads.length,2);
 h.click();h.window.dispatchEvent(new Event('kt-app-resume'));assert.equal(h.reads.length,2);assert.equal(h.changes.length,1);
 h.changes[0]!({...state,enabled:true,permission:'granted',offered:true});await h.flush();assert.equal(h.button().props['aria-checked'],true);
 h.reads[1]!(state);await h.flush();assert.equal(h.button().props['aria-checked'],true);h.close();
});
test('unmount retires late permission and status responses without state writes',async()=>{
 const h=harness();h.reads[0]!(state);await h.flush();h.click();h.close();const writes=h.writes;h.changes[0]!({...state,enabled:true});await h.flush();assert.equal(h.writes,writes);
});
test('denied permission stays off and does not automatically request again',async()=>{
 const h=harness();h.reads[0]!({...state,permission:'denied',offered:true});await h.flush();assert.equal(h.button().props['disabled'],true);assert.equal(h.changes.length,0);h.close();
});
