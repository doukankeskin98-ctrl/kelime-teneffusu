/** Original, finite mallet phrases. No downloads, looping music or gameplay state. */
export type SoundCue='select'|'letter'|'miss'|'word'|'hint'|'reveal'|'start'|'pause'|'ready'|'complete'|'finish';
type Note={hz:number;at:number;length:number;gain:number};
type Phrase={notes:readonly Note[];priority:number;gap:number};
const note=(hz:number,at=0,length=.26,gain=.1):Note=>({hz,at,length,gain});
// A shared C-major pentatonic palette, rounded sine fundamentals and quiet overtones.
export const SOUND_PHRASES:Record<SoundCue,Phrase>={
 letter:{notes:[note(392,0,.035,.04)],priority:0,gap:.04},
 miss:{notes:[note(329.63,0,.09,.035),note(293.66,.045,.11,.025)],priority:1,gap:.25},
 select:{notes:[note(392,0,.09,.045)],priority:0,gap:.12},
 word:{notes:[note(523.25,0,.23,.1),note(659.25,.075,.27,.075)],priority:2,gap:.18},
 hint:{notes:[note(392,0,.28,.075),note(523.25,.12,.34,.07)],priority:2,gap:.35},
 reveal:{notes:[note(392,0,.3,.08),note(523.25,.12,.35,.09),note(783.99,.26,.4,.07)],priority:3,gap:.65},
 start:{notes:[note(392,0,.2,.065),note(523.25,.1,.27,.08)],priority:1,gap:.35},
 pause:{notes:[note(392,0,.2,.055),note(329.63,.08,.24,.045)],priority:1,gap:.35},
 ready:{notes:[note(392,0,.16,.055),note(659.25,.08,.2,.045)],priority:1,gap:.35},
 complete:{notes:[note(523.25,0,.32,.09),note(659.25,.14,.34,.075),note(783.99,.28,.42,.065),note(523.25,.43,.48,.065)],priority:4,gap:.9},
 finish:{notes:[note(392,0,.36,.075),note(523.25,.15,.44,.065)],priority:4,gap:.75},
};
export const SOUND_LEVEL_KEY='kt-sound-level-v1';
export const SOUND_LEVELS=[{value:.3,label:'Hafif'},{value:.55,label:'Dengeli'},{value:.8,label:'Belirgin'}] as const;
export const DEFAULT_SOUND_LEVEL=.3;
export const SOUND_LEVEL_EVENT='kt-sound-level';
export const SOUND_MASTER_GAIN=4.5; // Ten times the previous .45 bus gain, not a physical loudness claim.
let liveLevel:number|null=null;
export function soundLevel(raw:unknown):number{if(typeof raw!=='number'&&typeof raw!=='string'||typeof raw==='string'&&!raw.trim())return DEFAULT_SOUND_LEVEL;const value=Number(raw);return Number.isFinite(value)&&value>=0&&value<=1?value:DEFAULT_SOUND_LEVEL;}
export function readSoundLevel(){if(liveLevel!==null)return liveLevel;try{return soundLevel(localStorage.getItem(SOUND_LEVEL_KEY));}catch{return DEFAULT_SOUND_LEVEL;}}
/** Apply before persistence, so a blocked device store cannot leave the slider inert. */
export function setSoundLevel(value:number){liveLevel=soundLevel(value);let saved=true;try{localStorage.setItem(SOUND_LEVEL_KEY,String(liveLevel));}catch{saved=false;}if(typeof window!=='undefined')window.dispatchEvent(new Event(SOUND_LEVEL_EVENT));return saved;}
function browserContext():AudioContext{
 const Audio=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!Audio)throw new Error('Web Audio unavailable');try{return new Audio({latencyHint:'interactive'});}catch{return new Audio();}
}
type Voice={osc:OscillatorNode;gain:GainNode};
/** One phrase at a time; only one fresh cue may wait briefly for audio activation. */
export class GameSound{
 private context:AudioContext|null=null;
 private output:GainNode|null=null;
 private filter:BiquadFilterNode|null=null;
 private compressor:DynamicsCompressorNode|null=null;
 private voices:Voice[]=[];
 private enabled=false;
 private disposed=false;
 private visible=true;
 private active:{cue:SoundCue;until:number}|null=null;
 private last:Partial<Record<SoundCue,number>>={};
 private resuming:Promise<void>|null=null;
 private resumeAt=0;
 private pending:{cue:SoundCue;at:number;step:number}|null=null;
 constructor(private create:()=>AudioContext=browserContext,private level:()=>number=readSoundLevel,private clock:()=>number=()=>performance.now()){}
 setEnabled(value:boolean){this.enabled=value;if(!value)this.stop();}
 setVisible(value:boolean){this.visible=value;if(!value)this.stop();}
 refreshVolume(){if(!this.output||!this.context)return;const now=this.context.currentTime,gain=this.output.gain,value=SOUND_MASTER_GAIN*soundLevel(this.level());gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value,now);gain.linearRampToValueAtTime(value,now+.02);if(value===0)this.stop();}
 unlock(gesture=true){
  if(!this.enabled||!this.visible||this.disposed||soundLevel(this.level())===0)return;
  try{
   if(!this.context||this.context.state==='closed'){
    this.stop();this.output?.disconnect();this.filter?.disconnect();this.compressor?.disconnect();
    if(this.context)this.context.onstatechange=null;
    this.last={};this.resuming=null;
    const context=this.create(),output=context.createGain(),filter=context.createBiquadFilter();
    output.gain.value=0;filter.type='lowpass';filter.frequency.value=1800;filter.Q.value=.5;
    const compressor=typeof context.createDynamicsCompressor==='function'?context.createDynamicsCompressor():null;
    if(compressor){compressor.threshold.value=-6;compressor.knee.value=6;compressor.ratio.value=8;compressor.attack.value=.003;compressor.release.value=.08;filter.connect(compressor);compressor.connect(context.destination);}else filter.connect(context.destination);
    output.connect(filter);this.context=context;this.output=output;this.filter=filter;this.compressor=compressor;this.refreshVolume();
    context.onstatechange=()=>{if(this.context!==context)return;if(context.state==='running')this.flush();else this.stop();};
   }
   if(this.context.state!=='running'&&(!this.resuming||(gesture&&this.clock()-this.resumeAt>=500))){
    const context=this.context;
    // A silent one-frame source, started inside the real gesture, primes older iOS audio.
    const prime=context.createBufferSource();prime.buffer=context.createBuffer(1,1,22050);prime.connect(this.output!);prime.onended=()=>prime.disconnect();prime.start(0);
    const resume=context.resume();this.resuming=resume;this.resumeAt=this.clock();
    void resume.then(()=>{if(this.context===context&&this.resuming===resume)this.flush();},()=>{if(this.context===context&&this.resuming===resume)this.pending=null;}).finally(()=>{if(this.resuming===resume)this.resuming=null;});
   }
  }catch{/* Audio is optional; input and saving must continue. */}
 }
 play(cue:SoundCue,step=0):boolean{
  if(!this.enabled||!this.visible||this.disposed||soundLevel(this.level())===0)return false;
  const context=this.context;if(!context||!this.output)return false;
  if(context.state!=='running'){
   if(context.state==='closed')return false;
   if(cue==='letter')return false; // Never queue a trail of delayed letter ticks.
   if(this.pending&&this.clock()-this.pending.at>(this.pending.cue==='select'?150:400))this.pending=null;
   this.unlock(false);
   if(this.resuming&&(!this.pending||SOUND_PHRASES[cue].priority>=SOUND_PHRASES[this.pending.cue].priority))this.pending={cue,at:this.clock(),step};
   return false;
  }
  const now=context.currentTime,phrase=SOUND_PHRASES[cue],active=this.active;
  const overlay=cue==='letter'&&active&&now<active.until&&SOUND_PHRASES[active.cue].priority>0&&SOUND_PHRASES[active.cue].priority<4;
  if(now-(this.last[cue]??-Infinity)<phrase.gap)return false;
  if(active&&now<active.until&&SOUND_PHRASES[active.cue].priority>phrase.priority&&!overlay)return false;
  // Selection taps never interrupt another selection's short release.
  if((cue==='select'||cue==='letter')&&active&&now<active.until&&!overlay)return false;
  if(!overlay)this.stop();this.last[cue]=now;
  try{
   this.refreshVolume();
   for(const n of phrase.notes){
    // Quiet octave adds a warm struck-wood body without a sharp/noisy attack.
    for(const [ratio,amount] of [[1,1],[2,.12]] as const){
     const osc=context.createOscillator(),gain=context.createGain(),at=now+n.at,end=at+n.length;
     const tones=[392,440,523.25,587.33,659.25],pitch=cue==='letter'?tones[Math.max(0,Math.floor(Number.isFinite(step)?step:0)-1)%tones.length]!:n.hz;
     osc.type='sine';osc.frequency.setValueAtTime(pitch*ratio,at);
     gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(n.gain*amount,at+(cue==='letter'?.004:.012));
     gain.gain.exponentialRampToValueAtTime(.0001,end-.025);gain.gain.linearRampToValueAtTime(0,end);
     osc.connect(gain);gain.connect(this.output);const voice={osc,gain};this.voices.push(voice);
     osc.onended=()=>{osc.disconnect();gain.disconnect();this.voices=this.voices.filter(v=>v!==voice);};
     osc.start(at);osc.stop(end+.01);
    }
   }
   if(!overlay)this.active={cue,until:now+Math.max(...phrase.notes.map(n=>n.at+n.length))};return true;
  }catch{this.stop();return false;}
 }
 private flush(){
  const pending=this.pending;this.pending=null;
  if(pending&&this.clock()-pending.at>=0&&this.clock()-pending.at<=(pending.cue==='select'?150:400))this.play(pending.cue,pending.step);
 }
 stop(){
  this.pending=null;
  const now=this.context?.currentTime??0;
  for(const {osc,gain} of this.voices){try{gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(0,now,.006);osc.stop(now+.025);}catch{}}
  this.voices=[];this.active=null;
 }
 dispose(){this.disposed=true;this.stop();if(this.context)this.context.onstatechange=null;try{void this.context?.close().catch(()=>{});}catch{}this.output?.disconnect();this.filter?.disconnect();this.compressor?.disconnect();this.context=null;}
}
