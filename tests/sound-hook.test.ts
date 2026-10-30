// Actual hook with controlled lifecycle/events. Not native browser or listening evidence.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const compiled=ts.transpileModule(readFileSync('components/game/useGameSound.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function setup(){
 const slots:any[]=[],effects:(()=>void)[]=[],listeners=new Map<string,Set<(event:any)=>void>>(),engines:FakeSound[]=[],vibrations:unknown[]=[];let cursor=0;
 class FakeSound{enabled=false;visible=true;disposed=false;unlocks=0;played:unknown[]=[];stops=0;constructor(){engines.push(this);}setEnabled(v:boolean){this.enabled=v;if(!v)this.stops++;}setVisible(v:boolean){this.visible=v;if(!v)this.stops++;}stop(){this.stops++;}unlock(){if(this.enabled&&this.visible)this.unlocks++;}play(v:unknown){if(this.enabled&&this.visible&&!this.disposed)this.played.push(v);}dispose(){this.disposed=true;}}
 const doc={hidden:false,addEventListener(type:string,fn:(e:any)=>void){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type)!.add(fn);},removeEventListener(type:string,fn:(e:any)=>void){listeners.get(type)?.delete(fn);}};
 const hooks={useRef(value:unknown){return slots[cursor++]??={current:value};},useEffect(fn:()=>void|(()=>void),deps:unknown[]){const slot=slots[cursor++]??={};if(!slot.deps||deps.some((v,i)=>!Object.is(v,slot.deps[i]))){slot.deps=deps;slot.setup=fn;effects.push(()=>{slot.cleanup?.();slot.cleanup=fn();});}}};
 const exports:Record<string,any>={};vm.runInNewContext(compiled,{exports,require:(name:string)=>name==='react'?hooks:{GameSound:FakeSound},document:doc,window:doc,navigator:{vibrate:(v:unknown)=>vibrations.push(v)}});
 const render=(enabled:boolean,haptics=false)=>{cursor=0;const play=exports['useChime'](enabled,haptics);while(effects.length)effects.shift()!();return play;};
 return {engines,vibrations,doc,render,emit(type:string,trusted=true){for(const fn of listeners.get(type)??[])fn({isTrusted:trusted});},close(){for(const slot of slots)slot.cleanup?.();},remount(){for(const slot of slots)slot.cleanup?.();slots.length=0;},strictReplay(){for(const slot of slots)slot.cleanup?.();for(const slot of slots)if(slot.setup)slot.cleanup=slot.setup();},listenerCount:()=>[...listeners.values()].reduce((n,set)=>n+set.size,0)};
}
describe('audio hook lifecycle and preference authority',()=>{
 it('arms trusted keyboard, pointer and assistive clicks without synthetic activation',()=>{
  const h=setup();const play=h.render(true);assert.equal(h.engines.length,0);h.emit('keydown',false);assert.equal(h.engines.length,0);h.emit('keydown');assert.equal(h.engines[0]!.unlocks,1);h.emit('click');h.emit('pointerdown');assert.equal(h.engines[0]!.unlocks,3);play(false);assert.deepEqual(h.engines[0]!.played,['word']);h.close();assert.equal(h.listenerCount(),0);
 });
 it('old async callbacks honor immediate mute, latest preferences, hidden state and unmount',()=>{
  const h=setup(),old=h.render(true,true);h.emit('pointerdown');old('mute');old(true);assert.equal(h.engines[0]!.played.length,0);h.render(false,false);old(false);assert.equal(h.engines[0]!.played.length,0);const play=h.render(true);h.doc.hidden=true;h.emit('visibilitychange');play(true);assert.equal(h.engines[0]!.played.length,0);h.doc.hidden=false;h.emit('visibilitychange');assert.equal(h.engines[0]!.played.length,0);h.close();old(true);assert.equal(h.engines.length,1);assert.equal(h.engines[0]!.disposed,false);assert.ok(h.engines[0]!.stops>0);
 });
 it('keeps haptics opt-in and independent from audio while muting itself never vibrates',()=>{
  const h=setup(),play=h.render(false,true);play('select');play('hint');play('mute');assert.equal(h.vibrations.length,0);play(false);assert.equal(h.vibrations.length,1);assert.equal(h.engines.length,0);h.render(false,false);play(true);assert.equal(h.vibrations.length,1);h.close();
 });
 it('explicit enable previews and strict effect replay reuse one audio context',()=>{
  const h=setup(),play=h.render(false);play('enable');assert.equal(h.engines[0]!.unlocks,1);assert.deepEqual(h.engines[0]!.played,['start']);h.render(true);h.strictReplay();assert.equal(h.engines[0]!.disposed,false);assert.ok(h.engines[0]!.stops>0);h.emit('pointerdown');play(false);assert.equal(h.engines.length,1);assert.deepEqual(h.engines[0]!.played,['start','word']);h.close();
 });
});

describe('native touch, page restoration and screen transitions',()=>{
 it('primes on actual touch start/end and pointer release, without a PointerEvent dependency',()=>{
  const h=setup();h.render(true);for(const event of ['touchstart','touchend','pointerup','mousedown'])h.emit(event);assert.equal(h.engines.length,1);assert.equal(h.engines[0]!.unlocks,4);h.close();
 });
 it('retains one engine across screen unmount/remount while retiring old callbacks',()=>{
  const h=setup(),old=h.render(true);h.emit('touchend');old(false);h.remount();old(true);const next=h.render(true);h.emit('touchstart');next(false);assert.equal(h.engines.length,1);assert.deepEqual(h.engines[0]!.played,['word','word']);assert.ok(h.engines[0]!.stops>0);h.close();
 });
 it('blocks background-page callbacks even before document.hidden changes and restores without replay',()=>{
  const h=setup(),play=h.render(true,true);h.emit('touchend');h.emit('pagehide');play(true);assert.equal(h.engines[0]!.played.length,0);assert.equal(h.vibrations.length,0);h.emit('pageshow');assert.equal(h.engines[0]!.played.length,0);h.emit('touchend');play(false);assert.deepEqual(h.engines[0]!.played,['word']);h.close();assert.equal(h.listenerCount(),0);
 });
});
