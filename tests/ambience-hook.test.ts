import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {observeGameActivity} from '../lib/platform/activity.ts';
it('actual ambience hook shares preferences, fences owners and removes activity/gesture listeners',()=>{
 const slots:any[]=[],effects:(()=>void)[]=[],engines:any[]=[];let cursor=0,active=true;
 class Events{hidden=false;listeners=new Map<string,Set<any>>();addEventListener(n:string,fn:any){if(!this.listeners.has(n))this.listeners.set(n,new Set());this.listeners.get(n)!.add(fn);}removeEventListener(n:string,fn:any){this.listeners.get(n)?.delete(fn);}emit(n:string,trusted=true){for(const fn of this.listeners.get(n)??[])fn({isTrusted:trusted});}get count(){return [...this.listeners.values()].reduce((n,s)=>n+s.size,0);}}
 const doc=new Events(),win=new Events(),exports:any={};
 class Audio{enabled=false;visible=true;disposed=false;unlocks=0;constructor(){engines.push(this);}setEnabled(v:boolean){this.enabled=v;}setVisible(v:boolean){this.visible=v;}unlock(){if(this.enabled&&this.visible&&!this.disposed)this.unlocks++;}dispose(){this.disposed=true;}}
 const hooks={useRef:(v:any)=>(slots[cursor++]??={current:v}),useEffect:(fn:any,deps:any[])=>{const s=slots[cursor++]??={};if(!s.deps||deps.some((v,i)=>v!==s.deps[i])){s.deps=deps;effects.push(()=>{s.cleanup?.();s.cleanup=fn();});}}};
 const modules:any={react:hooks,'@/lib/game/ambience':{GameAmbience:Audio},'@/lib/platform/activity':{observeGameActivity},'@/lib/platform/runtime':{gameIsActive:()=>active}};
 vm.runInNewContext(ts.transpileModule(readFileSync('components/game/useAmbience.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:(n:string)=>modules[n],document:doc,window:win});
 const render=(enabled:boolean,owner='a',commit=true)=>{cursor=0;const change=exports.useAmbience(enabled,owner);if(commit)while(effects.length)effects.shift()!();return change;};
 const toggle=render(false);doc.emit('pointerdown');assert.equal(engines[0].unlocks,0);toggle(true);assert.equal(engines[0].unlocks,1);render(true);doc.emit('click',false);assert.equal(engines[0].unlocks,1);
 doc.hidden=true;doc.emit('visibilitychange');doc.emit('touchend');assert.equal(engines[0].visible,false);assert.equal(engines[0].unlocks,1);
 doc.hidden=false;doc.emit('visibilitychange');assert.equal(engines[0].unlocks,1);doc.emit('pointerdown');assert.equal(engines[0].unlocks,2);
 active=false;win.emit('kt-app-resume');assert.equal(engines[0].visible,false);active=true;win.emit('kt-app-resume');
 render(false,'b',false);toggle(true);assert.equal(engines[0].unlocks,2);while(effects.length)effects.shift()!();assert.equal(engines.length,2);assert(engines[0].disposed);assert(!engines[1].enabled);assert.equal(doc.count,5);assert.equal(win.count,3);
 for(const s of slots)s.cleanup?.();assert(engines[1].disposed);assert.equal(doc.count+win.count,0);
});
