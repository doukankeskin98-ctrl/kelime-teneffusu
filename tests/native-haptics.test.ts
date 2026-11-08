import {it} from 'node:test';
import assert from 'node:assert/strict';
import {nativeHaptics,type NativeHapticDriver} from '../lib/platform/native-haptics.ts';
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function gate(){let resolve!:()=>void;const promise=new Promise<void>(r=>{resolve=r;});return {promise,resolve};}
function setup(overrides:Partial<NativeHapticDriver>={}){
 const calls:string[]=[];let time=0,active=true,prepared=false;
 const driver:NativeHapticDriver={selectionStart:async()=>{calls.push('start');prepared=true;},selectionChanged:async()=>{assert(prepared,'Changed must follow Start');calls.push('tick');},selectionEnd:async()=>{calls.push('end');prepared=false;},word:async()=>{calls.push('word');},complete:async()=>{calls.push('complete');},...overrides};
 const play=nativeHaptics(driver,()=>active,()=>time);
 return {calls,play,stop:()=>play.stopSelection!(),time:(v:number)=>{time=v;},active:(v:boolean)=>{active=v;}};
}
it('prepares the selection before the first tick and reuses it until one logical end',async()=>{
 const h=setup();h.play('selection');await flush();assert.deepEqual(h.calls,['start','tick']);
 h.time(49);h.play('selection');await flush();assert.deepEqual(h.calls,['start','tick']);
 h.time(50);h.play('selection');await flush();assert.deepEqual(h.calls,['start','tick','tick']);
 h.stop();h.stop();await flush();assert.deepEqual(h.calls,['start','tick','tick','end']);
 h.time(100);h.play('selection');await flush();h.stop();await flush();assert.deepEqual(h.calls.slice(4),['start','tick','end']);
});
it('a burst during native preparation is dropped, never queued for later playback',async()=>{
 const start=gate();let starts=0,ticks=0;const h=setup({selectionStart:()=>{starts++;return start.promise;},selectionChanged:async()=>{ticks++;}});
 for(let i=0;i<100;i++){h.time(i*50);h.play('selection');}assert.equal(starts,1);assert.equal(ticks,0);
 start.resolve();await flush();assert.equal(ticks,1);await flush();assert.equal(ticks,1);h.stop();await flush();
});
it('stop during pending Start retires that gesture before another session can start',async()=>{
 const start=gate(),end=gate();let starts=0,ticks=0,ends=0;
 const h=setup({selectionStart:()=>{starts++;return starts===1?start.promise:Promise.resolve();},selectionChanged:async()=>{ticks++;},selectionEnd:()=>{ends++;return ends===1?end.promise:Promise.resolve();}});
 h.play('selection');h.stop();h.time(60);h.play('selection');assert.equal(starts,1);
 start.resolve();await flush();assert.equal(ticks,0);assert.equal(ends,1);
 h.time(120);h.play('selection');assert.equal(starts,1);end.resolve();await flush();assert.equal(ticks,0);
 h.time(180);h.play('selection');await flush();assert.equal(starts,2);assert.equal(ticks,1);assert.equal(ends,1);
 h.stop();await flush();assert.equal(ends,2);
});
it('backgrounding before native preparation completes cannot emit a stale tick',async()=>{
 const start=gate();let ticks=0;const h=setup({selectionStart:()=>start.promise,selectionChanged:async()=>{ticks++;}});
 h.play('selection');h.active(false);start.resolve();await flush();assert.equal(ticks,0);assert.deepEqual(h.calls,['end']);
 h.play('word');h.play('complete');h.play('selection');await flush();assert.deepEqual(h.calls,['end']);
 h.active(true);await flush();assert.equal(ticks,0);
});
it('word and completion feedback stay independent of selection throttling or a pending Start',async()=>{
 const start=gate();let ticks=0;const h=setup({selectionStart:()=>start.promise,selectionChanged:async()=>{ticks++;}});
 h.play('selection');h.play('word');h.play('complete');assert.deepEqual(h.calls,['word','complete']);
 start.resolve();await flush();assert.equal(ticks,0);assert.deepEqual(h.calls,['word','complete','end']);
});
it('slow Changed admits only one operation; ending waits and cleans up once',async()=>{
 const changed=gate();let ticks=0;const h=setup({selectionChanged:()=>{ticks++;return changed.promise;}});
 h.play('selection');await flush();h.time(100);h.play('selection');h.stop();h.stop();assert.equal(ticks,1);assert.deepEqual(h.calls,['start']);
 changed.resolve();await flush();assert.deepEqual(h.calls,['start','end']);
});
it('native feedback failures are contained, clean up and allow a later attempt',async()=>{
 for(const operation of ['selectionStart','selectionChanged','selectionEnd','word','complete'] as const){
  let failures=0;const h=setup({[operation]:()=>{failures++;return Promise.reject(Error('Unavailable'));}});
  assert.doesNotThrow(()=>h.play('selection'));await flush();assert.doesNotThrow(()=>{h.play('word');h.play('complete');});await flush();h.stop();await flush();assert(failures>0);
  h.time(100);assert.doesNotThrow(()=>h.play('selection'));await flush();h.stop();await flush();
 }
 const h=setup({selectionStart:()=>{throw Error('Unavailable');}});assert.doesNotThrow(()=>h.play('selection'));await flush();assert.deepEqual(h.calls,['end']);
});

it('a slow preparation starts the rate window at the actual tick, not the original request',async()=>{
 const start=gate();let ticks=0;const h=setup({selectionStart:()=>start.promise,selectionChanged:async()=>{ticks++;}});
 h.play('selection');h.time(500);start.resolve();await flush();assert.equal(ticks,1);
 h.time(501);h.play('selection');await flush();assert.equal(ticks,1);h.time(550);h.play('selection');await flush();assert.equal(ticks,2);h.stop();await flush();
});

it('menu pulses neither end an active selection nor queue delayed taps',async()=>{
 const pending=gate();let menus=0;const h=setup({menu:()=>{menus++;return pending.promise;}});
 h.play('selection');await flush();h.play('menu');h.time(100);h.play('menu');assert.equal(menus,1);assert.deepEqual(h.calls,['start','tick']);
 pending.resolve();await flush();assert.equal(menus,1);h.time(200);h.play('selection');await flush();assert.deepEqual(h.calls,['start','tick','tick']);h.stop();await flush();
});
it('menu feedback has a quiet fallback and contains failure without blocking game input',async()=>{
 const absent=setup();absent.play('menu');await flush();assert.deepEqual(absent.calls,[]);
 const broken=setup({menu:()=>{throw Error('unavailable');}});assert.doesNotThrow(()=>broken.play('menu'));broken.play('selection');await flush();assert.deepEqual(broken.calls,['start','tick']);broken.stop();await flush();
});

it('landing is a bounded independent pulse and never interrupts the next selection',async()=>{
 const pending=gate();let landed=0;const h=setup({landing:()=>{landed++;return pending.promise;}});
 h.play('selection');await flush();h.play('landing');h.time(100);h.play('landing');assert.equal(landed,1);assert.deepEqual(h.calls,['start','tick']);
 h.play('selection');await flush();assert.deepEqual(h.calls,['start','tick','tick']);pending.resolve();await flush();h.time(200);h.play('landing');assert.equal(landed,2);h.active(false);h.play('landing');assert.equal(landed,2);h.stop();await flush();
});
