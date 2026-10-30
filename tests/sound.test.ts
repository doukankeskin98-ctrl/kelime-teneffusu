import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {GameSound,SOUND_PHRASES,soundLevel,DEFAULT_SOUND_LEVEL} from '../lib/game/sound.ts';
function fixture(state='running'){
 const nodes:{kind:string;stops:number[];started:number[];disconnected:boolean;onended?:()=>void;gain:any}[]=[],params:{method:string;values:number[]}[]=[];
 let creates=0,resumes=0,closes=0,wall=1000,level=.3;
 const param=()=>({value:0,...Object.fromEntries(['setValueAtTime','linearRampToValueAtTime','exponentialRampToValueAtTime','setTargetAtTime','cancelScheduledValues'].map(method=>[method,(...values:number[])=>params.push({method,values})]))});
 const node=(kind:string)=>{const n={kind,stops:[] as number[],started:[] as number[],disconnected:false,gain:param(),frequency:param(),Q:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),type:'',connect(){},disconnect(){n.disconnected=true;},start(t:number){n.started.push(t);},stop(t:number){n.stops.push(t);}};nodes.push(n);return n;};
 const ctx={state,currentTime:10,onstatechange:null as (()=>void)|null,destination:{},createGain:()=>node('gain'),createBiquadFilter:()=>node('filter'),createDynamicsCompressor:()=>node('compressor'),createOscillator:()=>node('osc'),createBuffer:()=>({}),createBufferSource:()=>node('buffer'),resume:async()=>{resumes++;},close:async()=>{closes++;ctx.state='closed';}};
 const sound=new GameSound(()=>{creates++;return ctx as unknown as AudioContext;},()=>level,()=>wall);
 return {sound,ctx,nodes,params,setLevel(value:number){level=value;sound.refreshVolume();},advance(ms:number){wall+=ms;},get creates(){return creates;},get resumes(){return resumes;},get closes(){return closes;},osc:()=>nodes.filter(n=>n.kind==='osc')};
}
describe('gentle finite game audio',()=>{
 it('is lazy and silent when disabled, hidden, disposed, or AudioContext is unavailable',()=>{
  const f=fixture();assert.equal(f.sound.play('word'),false);assert.equal(f.creates,0);f.sound.setEnabled(true);assert.equal(f.sound.play('start'),false);assert.equal(f.creates,0);f.sound.setVisible(false);f.sound.unlock();assert.equal(f.creates,0);f.sound.setVisible(true);f.sound.unlock();assert.equal(f.sound.play('word'),true);assert.equal(f.creates,1);f.sound.dispose();assert.equal(f.closes,1);assert.equal(f.sound.play('complete'),false);
  const missing=new GameSound(()=>{throw new Error('Unsupported');});missing.setEnabled(true);assert.doesNotThrow(()=>missing.play('word'));assert.equal(missing.play('word'),false);
 });
 it('expires stale suspended events without a late success and tolerates resume rejection',async()=>{
  const f=fixture('suspended');f.sound.setEnabled(true);f.sound.unlock();assert.equal(f.sound.play('complete'),false);assert.equal(f.osc().length,0);f.advance(401);f.ctx.state='running';await Promise.resolve();assert.equal(f.osc().length,0);assert.equal(f.sound.play('select'),true);f.sound.dispose();
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
   for(const n of phrase.notes){assert.ok(n.hz>=293&&n.hz<=784);assert.ok(n.gain<=.1);assert.ok(n.length>=.03);}
  }
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();f.sound.play('complete');assert.ok(f.params.some(p=>p.method==='linearRampToValueAtTime'&&p.values[0]===0));assert.ok(f.osc().every(n=>n.started.length===1&&n.stops.length===1));f.sound.dispose();
  for(const raw of [null,'bad','Infinity',-1,2,NaN])assert.equal(soundLevel(raw),DEFAULT_SOUND_LEVEL);assert.equal(soundLevel('.55'),.55);
 });
});

describe('bounded audio recovery',()=>{
 it('plays the first fresh enable cue after asynchronous activation, with one in-flight resume',async()=>{
  const f=fixture('suspended');let resume!:()=>void;f.ctx.resume=()=>new Promise<void>(yes=>{resume=yes;});f.sound.setEnabled(true);f.sound.unlock();f.sound.unlock();f.sound.play('start');assert.equal(f.osc().length,0);assert.equal(f.nodes.filter(n=>n.kind==='buffer').length,1);f.ctx.state='running';resume();await Promise.resolve();assert.equal(f.osc().length,4);f.sound.dispose();
 });
 it('keeps only the most important fresh cue while resuming, without a backlog',async()=>{
  const f=fixture('suspended');let resume!:()=>void;f.ctx.resume=()=>new Promise<void>(yes=>{resume=yes;});f.sound.setEnabled(true);f.sound.unlock();f.sound.play('select');f.sound.play('word');f.sound.play('complete');f.sound.play('select');f.ctx.state='running';resume();await Promise.resolve();assert.equal(f.osc().length,8);f.sound.dispose();
 });
 for(const cancel of ['mute','hide','stop','dispose'] as const)it(cancel+' cancels an activation-pending success',async()=>{
  const f=fixture('suspended');let resume!:()=>void;f.ctx.resume=()=>new Promise<void>(yes=>{resume=yes;});f.sound.setEnabled(true);f.sound.unlock();f.sound.play('complete');if(cancel==='mute')f.sound.setEnabled(false);else if(cancel==='hide')f.sound.setVisible(false);else f.sound[cancel]();f.ctx.state='running';resume();await Promise.resolve();assert.equal(f.osc().length,0);f.sound.dispose();
 });
 it('recovers an interrupted context on the next gesture and a closed context with a fresh clock',async()=>{
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();assert.equal(f.sound.play('word'),true);f.ctx.state='interrupted';f.ctx.onstatechange?.();assert.ok(f.osc().every(o=>o.stops.includes(10.025)));f.sound.unlock();f.sound.play('ready');f.ctx.state='running';await Promise.resolve();assert.equal(f.osc().length,8);f.ctx.state='closed';f.ctx.currentTime=0;f.sound.unlock();f.ctx.state='running';assert.equal(f.sound.play('word'),true);assert.equal(f.creates,2);f.sound.dispose();
 });
});

it('retries a stalled resume on a later real gesture and fences the retired rejection',async()=>{
 const f=fixture('suspended'),attempts:{resolve:()=>void;reject:(e:Error)=>void}[]=[];f.ctx.resume=()=>new Promise<void>((resolve,reject)=>attempts.push({resolve,reject}));f.sound.setEnabled(true);f.sound.unlock();f.sound.play('complete');f.advance(501);f.sound.play('select');assert.equal(attempts.length,1);f.sound.unlock();assert.equal(attempts.length,2);f.sound.play('word');attempts[0]!.reject(new Error('Old activation rejected'));await Promise.resolve();f.ctx.state='running';attempts[1]!.resolve();await Promise.resolve();assert.equal(f.osc().length,4);f.sound.dispose();
});


describe('stronger adjustable mix and bounded melodic letter channel',()=>{
 it('applies every bus change immediately and zero prevents all new effects',()=>{
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();assert(f.sound.play('word'));f.setLevel(.73);
  assert(f.params.some(p=>p.method==='linearRampToValueAtTime'&&p.values[0]===4.5*.73&&p.values[1]===f.ctx.currentTime+.02));
  f.setLevel(0);assert.equal(f.sound.play('complete'),false);assert(f.osc().every(n=>n.stops.length>=1));f.sound.dispose();
 });
 it('lets quiet ticks accompany success without interrupting it, varies pitch and protects the terminal motif',()=>{
  const f=fixture();f.sound.setEnabled(true);f.sound.unlock();f.sound.play('word');const word=f.osc().slice();
  assert(f.sound.play('letter',2));assert(word.every(n=>n.stops.length===1));assert(f.params.some(p=>p.method==='setValueAtTime'&&p.values[0]===440));
  f.ctx.currentTime+=.01;assert.equal(f.sound.play('letter',3),false);f.ctx.currentTime+=.04;assert(f.sound.play('letter',3));
  assert(f.params.some(p=>p.method==='setValueAtTime'&&p.values[0]===523.25&&p.values[1]===f.ctx.currentTime));
  f.sound.play('complete');f.ctx.currentTime+=.05;assert.equal(f.sound.play('letter',4),false);f.sound.dispose();
 });
 it('never queues skipped letter events during audio activation',async()=>{
  const f=fixture('suspended');f.sound.setEnabled(true);f.sound.unlock();for(let i=0;i<100;i++)assert.equal(f.sound.play('letter',i),false);
  f.ctx.state='running';f.ctx.onstatechange?.();await Promise.resolve();assert.equal(f.osc().length,0);assert(f.sound.play('letter',1));f.sound.dispose();
 });
 it('bounds the pre-compressor signal at100%, including a simultaneous tick, using phase-independent envelope maxima',()=>{
  const env=(t:number,amp:number,length:number,attack:number)=>t<0||t>length?0:t<attack?amp*t/attack:t<length-.025?amp*Math.exp(Math.log(.0001/amp)*(t-attack)/(length-.025-attack)):.0001*(length-t)/.025;
  const peak=(cue:keyof typeof SOUND_PHRASES)=>{const notes=SOUND_PHRASES[cue].notes,attack=cue==='letter'?.004:.012;
   // Between these breakpoints the positive envelope sum is convex, so its maximum is at an endpoint.
   const edges=notes.flatMap(n=>[n.at,n.at+attack,n.at+n.length-.025,n.at+n.length]);
   return Math.max(...edges.map(t=>4.5*notes.reduce((sum,n)=>sum+env(t-n.at,n.gain,n.length,attack)+env(t-n.at,n.gain*.12,n.length,attack),0)));
  };
  for(const cue of Object.keys(SOUND_PHRASES) as (keyof typeof SOUND_PHRASES)[]){assert(peak(cue)<.55,cue);if(SOUND_PHRASES[cue].priority>0&&SOUND_PHRASES[cue].priority<4)assert(peak(cue)+peak('letter')<.8,cue);}
  assert.equal(soundLevel(0),0);assert.equal(soundLevel(1),1);assert.equal(soundLevel('.73'),.73);
 });
});
