import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {WORD_RESULT_DELAY_MS,RESULT_EXIT_MS,WORD_FLIGHT_MS,WORD_LANDING_MS,wordLetterDelay} from '../lib/game/word-feedback.ts';
function harness(){
 let index=0,dirty=true,done=false,scope='one',active=true,now=0,id=0;
 type Result={ready:boolean;departing:boolean;isPending:()=>boolean;wasPrepared:()=>boolean;prepare:(flight?:boolean)=>void;skip:()=>void};
 let result:Result;
 const slots:{value?:unknown;deps?:unknown[];clean?:(()=>void)|void}[]=[],effects:(()=>void)[]=[],timers=new Map<number,{at:number;fn:()=>void}>();
 const document=Object.assign(new EventTarget(),{hidden:false,documentElement:{dataset:{}}});
 const motion=Object.assign(new EventTarget(),{matches:false});
 const window=Object.assign(new EventTarget(),{matchMedia:()=>motion});
 const hooks={
  useState(initial:unknown){const s=slots[index++]??={value:initial};return[s.value,(v:unknown)=>{s.value=typeof v==='function'?v(s.value):v;dirty=true;}];},
  useRef(initial:unknown){const s=slots[index++]??={value:{current:initial}};return s.value;},
  useEffect(fn:()=>void|(()=>void),deps:unknown[]){const s=slots[index++]??={};if(!s.deps||deps.some((v,i)=>v!==s.deps![i])){s.deps=deps;effects.push(()=>{s.clean?.();s.clean=fn();});}}
 };
 const exports={} as {useResultPresentation:(done:boolean,scope:string)=>Result};
 vm.runInNewContext(ts.transpileModule(readFileSync('components/game/useResultPresentation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>n==='react'?hooks:n==='@/lib/platform/runtime'?{gameIsActive:()=>active}:{WORD_RESULT_DELAY_MS,RESULT_EXIT_MS},window,document,performance:{now:()=>now},setTimeout:(fn:()=>void,ms:number)=>{timers.set(++id,{at:now+ms,fn});return id;},clearTimeout:(i:number)=>timers.delete(i)});
 const paint=()=>{for(let n=0;dirty&&n<20;n++){dirty=false;index=0;result=exports.useResultPresentation(done,scope);while(effects.length)effects.shift()!();}return result;};paint();
 return{get result(){return result;},set(d:boolean,s=scope){done=d;scope=s;dirty=true;paint();},prepare(flight=true){result.prepare(flight);paint();},skip(){result.skip();paint();},advance(ms:number){const until=now+ms;while(true){const next=[...timers].filter(([,t])=>t.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();paint();}now=until;},nativeHide(){active=false;document.dispatchEvent(new Event('visibilitychange'));paint();},pageHide(){window.dispatchEvent(new Event('pagehide'));paint();},reduce(){motion.matches=true;motion.dispatchEvent(new Event('change'));paint();},close(){for(const s of slots)s.clean?.();},timers};
}
it('last glyph and landing finish before withdrawal; durable completion does not depend on presentation',()=>{
 assert(WORD_RESULT_DELAY_MS>=WORD_FLIGHT_MS+wordLetterDelay(15)+WORD_LANDING_MS);
 const h=harness();h.prepare();h.set(true);assert(!h.result.ready);assert(!h.result.departing);
 h.advance(WORD_RESULT_DELAY_MS-1);assert(!h.result.departing);h.advance(1);assert(h.result.departing);assert(!h.result.ready);
 h.advance(RESULT_EXIT_MS);assert(h.result.ready);assert(!h.result.departing);assert.equal(h.timers.size,0);h.close();
});
it('server ACK waits only the remaining local flight time, never a second full flight',()=>{
 const h=harness();h.prepare();const pending=h.result.isPending;h.advance(900);assert(pending());assert(!h.result.ready);h.set(true);
 h.advance(WORD_RESULT_DELAY_MS-900);assert(h.result.departing);h.advance(RESULT_EXIT_MS);assert(h.result.ready);h.close();
});
it('late ACK does not show an unconfirmed result and only withdraws the scene after confirmation',()=>{
 const h=harness();h.prepare();h.advance(5000);assert(!h.result.ready);assert(!h.result.departing);h.set(true);assert(h.result.departing);h.advance(RESULT_EXIT_MS);assert(h.result.ready);h.close();
});
it('restored result is immediate; timeout result has a short exit without a phantom flight',()=>{
 const h=harness();h.set(true);assert(h.result.ready);h.set(false,'two');h.prepare(false);h.set(true);assert(h.result.departing);h.advance(RESULT_EXIT_MS);assert(h.result.ready);h.close();
});
it('background, pagehide, skip and reduced motion finish presentation and clear timers',()=>{
 for(const action of ['nativeHide','pageHide','skip','reduce'] as const){const h=harness();h.prepare();h.set(true);h[action]();assert(h.result.ready,action);assert.equal(h.timers.size,0,action);h.close();}
 const h=harness();h.reduce();h.prepare();h.set(true);assert(h.result.ready);assert.equal(h.timers.size,0);h.close();
});
it('scope switch cancels old scene timers and a retried word gets a fresh local start',()=>{
 const h=harness();h.prepare();h.set(true);h.advance(900);h.set(false,'two');assert.equal(h.timers.size,0);h.advance(1000);assert(!h.result.ready);assert(!h.result.departing);
 h.prepare();h.advance(500);h.prepare();h.set(true);h.advance(WORD_RESULT_DELAY_MS-1);assert(!h.result.departing);h.advance(1);assert(h.result.departing);h.close();assert.equal(h.timers.size,0);
});

it('a pre-ACK background, pagehide or motion change cancels the flight without losing its receipt',()=>{
 for(const action of ['nativeHide','pageHide','reduce'] as const){const h=harness();h.prepare();const oldCallback=h.result.wasPrepared;assert(h.result.isPending());h[action]();assert(!h.result.isPending(),action);assert(oldCallback(),action);h.set(true);assert(h.result.ready,action);assert(!h.result.departing);assert.equal(h.timers.size,0);h.close();}
});
