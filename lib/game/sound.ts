/** Original, finite mallet phrases. No downloads, looping music or gameplay state. */
export type SoundCue='select'|'word'|'hint'|'reveal'|'start'|'pause'|'complete'|'finish';
type Note={hz:number;at:number;length:number;gain:number};
type Phrase={notes:readonly Note[];priority:number;gap:number};
const note=(hz:number,at=0,length=.26,gain=.1):Note=>({hz,at,length,gain});
// A shared C-major pentatonic palette, rounded sine fundamentals and quiet overtones.
export const SOUND_PHRASES:Record<SoundCue,Phrase>={
 select:{notes:[note(392,0,.09,.045)],priority:0,gap:.12},
 word:{notes:[note(523.25,0,.23,.1),note(659.25,.075,.27,.075)],priority:2,gap:.18},
 hint:{notes:[note(392,0,.28,.075),note(523.25,.12,.34,.07)],priority:2,gap:.35},
 reveal:{notes:[note(392,0,.3,.08),note(523.25,.12,.35,.09),note(783.99,.26,.4,.07)],priority:3,gap:.65},
 start:{notes:[note(392,0,.2,.065),note(523.25,.1,.27,.08)],priority:1,gap:.35},
 pause:{notes:[note(392,0,.2,.055),note(329.63,.08,.24,.045)],priority:1,gap:.35},
 complete:{notes:[note(523.25,0,.32,.09),note(659.25,.14,.34,.075),note(783.99,.28,.42,.065),note(523.25,.43,.48,.065)],priority:4,gap:.9},
 finish:{notes:[note(392,0,.36,.075),note(523.25,.15,.44,.065)],priority:4,gap:.75},
};
export const SOUND_LEVEL_KEY='kt-sound-level-v1';
export const SOUND_LEVELS=[{value:.3,label:'Hafif'},{value:.55,label:'Dengeli'},{value:.8,label:'Belirgin'}] as const;
export const DEFAULT_SOUND_LEVEL=.3;
export function soundLevel(raw:unknown):number{return SOUND_LEVELS.some(v=>v.value===Number(raw))?Number(raw):DEFAULT_SOUND_LEVEL;}
export function readSoundLevel(){try{return soundLevel(localStorage.getItem(SOUND_LEVEL_KEY));}catch{return DEFAULT_SOUND_LEVEL;}}
function browserContext():AudioContext{
 const Audio=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!Audio)throw new Error('Web Audio unavailable');return new Audio({latencyHint:'interactive'});
}
type Voice={osc:OscillatorNode;gain:GainNode};
/** One context and one phrase at a time. Suspended events are dropped, never queued. */
export class GameSound{
 private context:AudioContext|null=null;
 private output:GainNode|null=null;
 private filter:BiquadFilterNode|null=null;
 private voices:Voice[]=[];
 private enabled=false;
 private disposed=false;
 private visible=true;
 private active:{cue:SoundCue;until:number}|null=null;
 private last:Partial<Record<SoundCue,number>>={};
 constructor(private create:()=>AudioContext=browserContext,private level:()=>number=readSoundLevel){}
 setEnabled(value:boolean){this.enabled=value;if(!value)this.stop();}
 setVisible(value:boolean){this.visible=value;if(!value)this.stop();}
 unlock(){
  if(!this.enabled||!this.visible||this.disposed)return;
  try{
   if(!this.context||this.context.state==='closed'){
    const context=this.create(),output=context.createGain(),filter=context.createBiquadFilter();
    output.gain.value=.45;filter.type='lowpass';filter.frequency.value=1800;filter.Q.value=.5;
    output.connect(filter);filter.connect(context.destination);this.context=context;this.output=output;this.filter=filter;
   }
   if(this.context.state!=='running')void this.context.resume().catch(()=>{});
  }catch{/* Audio is optional; input and saving must continue. */}
 }
 play(cue:SoundCue):boolean{
  if(!this.enabled||!this.visible||this.disposed)return false;
  const context=this.context;if(!context||context.state!=='running'||!this.output)return false;
  const now=context.currentTime,phrase=SOUND_PHRASES[cue],active=this.active;
  if(now-(this.last[cue]??-Infinity)<phrase.gap)return false;
  if(active&&now<active.until&&SOUND_PHRASES[active.cue].priority>phrase.priority)return false;
  // Selection taps never interrupt another selection's short release.
  if(cue==='select'&&active&&now<active.until)return false;
  this.stop();this.last[cue]=now;
  try{
   this.output.gain.setValueAtTime(.45*soundLevel(this.level()),now);
   for(const n of phrase.notes){
    // Quiet octave adds a warm struck-wood body without a sharp/noisy attack.
    for(const [ratio,amount] of [[1,1],[2,.12]] as const){
     const osc=context.createOscillator(),gain=context.createGain(),at=now+n.at,end=at+n.length;
     osc.type='sine';osc.frequency.setValueAtTime(n.hz*ratio,at);
     gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(n.gain*amount,at+.012);
     gain.gain.exponentialRampToValueAtTime(.0001,end-.025);gain.gain.linearRampToValueAtTime(0,end);
     osc.connect(gain);gain.connect(this.output);const voice={osc,gain};this.voices.push(voice);
     osc.onended=()=>{osc.disconnect();gain.disconnect();this.voices=this.voices.filter(v=>v!==voice);};
     osc.start(at);osc.stop(end+.01);
    }
   }
   this.active={cue,until:now+Math.max(...phrase.notes.map(n=>n.at+n.length))};return true;
  }catch{this.stop();return false;}
 }
 stop(){
  const now=this.context?.currentTime??0;
  for(const {osc,gain} of this.voices){try{gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(0,now,.006);osc.stop(now+.025);}catch{}}
  this.voices=[];this.active=null;
 }
 dispose(){this.disposed=true;this.stop();try{void this.context?.close().catch(()=>{});}catch{}this.output?.disconnect();this.filter?.disconnect();this.context=null;}
}
