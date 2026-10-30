import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {GameSound,SOUND_PHRASES,soundLevel,DEFAULT_SOUND_LEVEL} from '../lib/game/sound.ts';
function fixture(state='running'){
 const nodes:{kind:string;stops:number[];started:number[];disconnected:boolean;onended?:()=>void;gain:any}[]=[],params:{method:string;values:number[]}[]=[];
 let creates=0,resumes=0,closes=0;
 const param=()=>({value:0,...Object.fromEntries(['setValueAtTime','linearRampToValueAtTime','exponentialRampToValueAtTime','setTargetAtTime','cancelScheduledValues'].map(method=>[method,(...values:number[])=>params.push({method,values})]))});
 const node=(kind:string)=>{const n={kind,stops:[] as number[],started:[] as number[],disconnected:false,gain:param(),frequency:param(),Q:param(),type:'',connect(){},disconnect(){n.disconnected=true;},start(t:number){n.started.push(t);},stop(t:number){n.stops.push(t);}};nodes.push(n);return n;};
 const ctx={state,currentTime:10,destination:{},createGain:()=>node('gain'),createBiquadFilter:()=>node('filter'),createOscillator:()=>node('osc'),resume:async()=>{resumes++;},close:async()=>{closes++;ctx.state='closed';}};
 const sound=new GameSound(()=>{creates++;return ctx as unknown as AudioContext;},()=>.3);
 return {sound,ctx,nodes,params,get creates(){return creates;},get resumes(){return resumes;},get closes(){return closes;},osc:()=>nodes.filter(n=>n.kind==='osc')};
}
describe('gentle finite game audio',()=>{
 it('is lazy and silent when disabled, hidden, disposed, or AudioContext is unavailable',()=>{
  const f=fixture();assert.equal(f.sound.play('word'),false);assert.equal(f.creates,0);f.sound.setEnabled(true);assert.equal(f.sound.play('start'),false);assert.equal(f.creates,0);f.sound.setVisible(false);f.sound.unlock();assert.equal(f.creates,0);f.sound.setVisible(true);f.sound.unlock();assert.equal(f.sound.play('word'),true);assert.equal(f.creates,1);f.sound.dispose();assert.equal(f.closes,1);assert.equal(f.sound.play('complete'),false);
  const missing=new GameSound(()=>{throw new Error('Unsupported');});missing.setEnabled(true);assert.doesNotThrow(()=>missing.play('word'));assert.equal(missing.play('word'),false);
 });
 it('drops suspended events without queuing a later success and tolerates resume rejection',async()=>{
  const f=fixture('suspended');f.sound.setEnabled(true);f.sound.unlock();assert.equal(f.sound.play('complete'),false);assert.equal(f.osc().length,0);f.ctx.state='running';await Promise.resolve();assert.equal(f.osc().length,0);assert.equal(f.sound.play('select'),true);f.sound.dispose();
  const rejected=fixture('suspended');rejected.ctx.resume=()=>Promise.reject(new Error('Permission'));rejected.sound.setEnabled(true);rejected.sound.unlock();assert.equal(rejected.sound.play('word'),false);await Promise.resolve();rejected.sound.dispose();
 });
 it('limits rapid repetition, lets success replace a tap and protects completion from low-priority sounds',()=>{
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();assert.equal(f.sound.play('select'),true);const first=f.osc()[0]!;assert.equal(f.sound.play('select'),false);assert.equal(f.sound.play('word'),true);assert.ok(first.stops.includes(10.025));assert.equal(f.sound.play('select'),false);assert.equal(f.sound.play('word'),false);f.ctx.currentTime+=.2;assert.equal(f.sound.play('word'),true);assert.equal(f.sound.play('complete'),true);assert.equal(f.sound.play('hint'),false);assert.equal(f.sound.play('complete'),false);f.ctx.currentTime+=1.1;assert.equal(f.sound.play('select'),true);assert.equal(f.creates,1);f.sound.dispose();
 });
 it('mute and backgrounding cancel every scheduled voice, with no replay after returning',()=>{
  for(const change of ['mute','hide'] as const){const f=fixture();f.sound.setEnabled(true);f.sound.unlock();f.sound.play('complete');const voices=f.osc();assert.equal(voices.length,8);if(change==='mute')f.sound.setEnabled(false);else f.sound.setVisible(false);assert.ok(voices.every(v=>v.stops.includes(10.025)));assert.equal(f.sound.play('word'),false);f.sound.setEnabled(true);f.sound.setVisible(true);f.sound.unlock();assert.equal(f.osc().length,8);assert.equal(f.sound.play('word'),true);f.sound.dispose();}
 });
 it('frees oscillator/gain nodes after completion and closes its one context on disposal',()=>{
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();f.sound.play('word');for(const osc of f.osc()){osc.onended?.();assert.equal(osc.disconnected,true);}f.sound.dispose();assert.equal(f.closes,1);assert.ok(f.nodes.filter(n=>n.kind==='gain'||n.kind==='filter').every(n=>n.disconnected));
 });
 it('has no loop, click-edge envelope, alarm pitch or unbounded sample level',()=>{
  for(const phrase of Object.values(SOUND_PHRASES)){
   assert.ok(phrase.notes.length<=4);assert.ok(Math.max(...phrase.notes.map(n=>n.at+n.length))<1);
   for(const n of phrase.notes){assert.ok(n.hz>=329&&n.hz<=784);assert.ok(n.gain<=.1);assert.ok(n.length>=.09);}
  }
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();f.sound.play('complete');assert.ok(f.params.some(p=>p.method==='linearRampToValueAtTime'&&p.values[0]===0));assert.ok(f.osc().every(n=>n.started.length===1&&n.stops.length===1));f.sound.dispose();
  for(const raw of [null,'bad','Infinity',-1,0,2,NaN])assert.equal(soundLevel(raw),DEFAULT_SOUND_LEVEL);assert.equal(soundLevel('.55'),.55);
 });
});
