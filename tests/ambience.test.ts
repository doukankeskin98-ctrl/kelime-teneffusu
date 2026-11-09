import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {GameAmbience,ambienceNoise} from '../lib/game/ambience.ts';
function fixture(state='running'){
 let creates=0,closes=0,resumes=0,suspends=0,time=0;const nodes:any[]=[],ramps:number[][]=[];
 const param=()=>({value:0,setValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){},linearRampToValueAtTime:(...v:number[])=>ramps.push(v)});
 function node(kind:string){const n={kind,connections:[] as any[],started:false,stopped:false,disconnected:false,onended:null as null|(()=>void),gain:param(),frequency:param(),Q:param(),connect(to:any){n.connections.push(to);},disconnect(){n.disconnected=true;},start(){n.started=true;},stop(){n.stopped=true;}};nodes.push(n);return n;}
 const ctx={state,currentTime:10,destination:{},onstatechange:null as null|(()=>void),createGain:()=>node('gain'),createBiquadFilter:()=>node('filter'),createOscillator:()=>node('osc'),createBufferSource:()=>node('source'),createBuffer:(_ch:number,len:number)=>({getChannelData:()=>new Float32Array(len)}),resume:async()=>{resumes++;ctx.state='running';},suspend:async()=>{suspends++;ctx.state='suspended';},close:async()=>{closes++;ctx.state='closed';}};
 const sound=new GameAmbience(()=>{creates++;return ctx as unknown as AudioContext;},()=>time);
 return {sound,ctx,nodes,ramps,get creates(){return creates;},get closes(){return closes;},get resumes(){return resumes;},get suspends(){return suspends;},time:(v:number)=>time=v,active:()=>nodes.filter(n=>n.started&&!n.disconnected)};
}
describe('optional ambient audio lifecycle',()=>{
 it('is lazy, bounded, deterministic and seamlessly joined without any downloaded assets',()=>{
  const f=fixture();f.sound.unlock();assert.equal(f.creates,0);f.sound.setEnabled(true);assert.equal(f.creates,0);f.sound.unlock();
  assert.equal(f.creates,1);assert.equal(f.nodes.length,7);for(let i=0;i<100;i++)f.sound.unlock();assert.equal(f.nodes.length,7);
  assert.deepEqual(f.ramps,[[1,10.8]]);const a=ambienceNoise(),b=ambienceNoise();assert.deepEqual(a,b);assert.equal(Math.abs(a[0]!),0);assert.equal(Math.abs(a.at(-1)!),0);
  assert(a.every(n=>Number.isFinite(n)&&Math.abs(n)<1));const rms=Math.sqrt(a.reduce((sum,n)=>sum+n*n,0)/a.length);assert(rms>.05&&rms<.3);f.sound.dispose();assert.equal(f.active().length,0);assert.equal(f.closes,1);
 });
 it('fades mute, releases its graph and bounds rapid toggles without overlapping texture loops',()=>{
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();f.sound.setEnabled(false);const retiring=f.nodes.find(n=>n.kind==='source');assert(retiring.stopped);assert(!retiring.disconnected);
  retiring.onended();assert.equal(f.active().length,0);assert.equal(f.suspends,1);
  f.ctx.state='running';for(let i=0;i<40;i++){f.sound.setEnabled(true);f.sound.unlock();assert(f.active().length<=2);f.sound.setEnabled(false);}
  f.sound.dispose();assert.equal(f.active().length,0);
 });
 for(const stop of ['mute','hide','dispose'] as const)it('never resurrects a late resume after '+stop,async()=>{
  const f=fixture('suspended');let resolve!:()=>void;f.ctx.resume=()=>new Promise<void>(yes=>{resolve=yes;});f.sound.setEnabled(true);f.sound.unlock();
  if(stop==='mute')f.sound.setEnabled(false);else if(stop==='hide')f.sound.setVisible(false);else f.sound.dispose();
  f.ctx.state='running';resolve();await Promise.resolve();assert.equal(f.nodes.filter(n=>n.kind==='osc').length,0);f.sound.dispose();
 });
 it('stops immediately on background, resumes only on a later gesture and handles audio interruptions',async()=>{
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();f.sound.setVisible(false);assert.equal(f.active().length,0);f.sound.setVisible(true);assert.equal(f.active().length,0);
  f.sound.unlock();await Promise.resolve();assert.equal(f.active().filter(n=>n.kind==='osc').length,1);
  f.ctx.state='interrupted';f.ctx.onstatechange?.();assert.equal(f.active().length,0);f.sound.unlock();await Promise.resolve();assert.equal(f.active().filter(n=>n.kind==='osc').length,1);f.sound.dispose();
 });
 it('contains unsupported audio and keeps old stalled resumes from winning a retry',async()=>{
  const unavailable=new GameAmbience(()=>{throw new Error('not available');});unavailable.setEnabled(true);assert.doesNotThrow(()=>unavailable.unlock());unavailable.dispose();
  const f=fixture('suspended'),waiters:(()=>void)[]=[];f.ctx.resume=()=>new Promise<void>(yes=>waiters.push(yes));f.sound.setEnabled(true);f.sound.unlock();f.sound.unlock();assert.equal(waiters.length,1);
  f.time(501);f.sound.unlock();assert.equal(waiters.length,2);f.ctx.state='running';waiters[0]!();await Promise.resolve();assert.equal(f.nodes.filter(n=>n.kind==='osc').length,0);waiters[1]!();await Promise.resolve();assert.equal(f.nodes.filter(n=>n.kind==='osc').length,1);f.sound.dispose();
 });
});
