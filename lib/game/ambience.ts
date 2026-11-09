/** Original soft wind texture. No network audio, samples, frame loop or game state. */
export function ambienceNoise(length=65536):Float32Array {
 const data=new Float32Array(length);let seed=4711,last=0;
 for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;last=.97*last+.03*(seed/4294967296*2-1);data[i]=last*3;}
 // A zero-slope join avoids a click when the short texture loops.
 const edge=Math.min(256,Math.floor(length/4));
 for(let i=0;i<edge;i++){const envelope=(1-Math.cos(Math.PI*i/edge))/2;data[i]=data[i]!*envelope;data[length-1-i]=data[length-1-i]!*envelope;}
 return data;
}
function contextFactory():AudioContext {
 const Audio=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!Audio)throw new Error('Web Audio unavailable');return new Audio();
}
type Graph={source:AudioBufferSourceNode;lfo:OscillatorNode;nodes:AudioNode[];out:GainNode};
export class GameAmbience {
 private context:AudioContext|null=null;
 private graph:Graph|null=null;
 private primers=new Set<AudioBufferSourceNode>();
 private retiring:Graph|null=null;
 private enabled=false;
 private visible=true;
 private disposed=false;
 private epoch=0;
 private resumeAt=-Infinity;
 private pending=false;
 constructor(private create:()=>AudioContext=contextFactory,private now:()=>number=()=>performance.now()){}
 setEnabled(value:boolean){if(this.enabled===value)return;this.enabled=value;if(!value){this.epoch++;this.pending=false;this.stop(false);}}
 setVisible(value:boolean){this.visible=value;if(!value){this.epoch++;this.pending=false;this.stop(true);try{void this.context?.suspend().catch(()=>{});}catch{}}}
 /** Must be called from a real user gesture, including the explicit setting toggle. */
 unlock(){
  if(!this.enabled||!this.visible||this.disposed||this.graph)return;
  try{
   if(!this.context||this.context.state==='closed'){
    const context=this.create();this.context=context;this.pending=false;
    context.onstatechange=()=>{if(this.context===context&&context.state!=='running'){this.epoch++;this.pending=false;this.stop(true);}};
   }
   const context=this.context;
   if(context.state==='running'){this.start();return;}
   if(this.pending&&this.now()-this.resumeAt<500)return;
   this.pending=true;this.resumeAt=this.now();const epoch=++this.epoch;
   this.clearPrimers();const prime=context.createBufferSource();this.primers.add(prime);prime.buffer=context.createBuffer(1,1,22050);prime.connect(context.destination);prime.onended=()=>{prime.disconnect();this.primers.delete(prime);};prime.start();
   void context.resume().then(()=>{if(epoch===this.epoch&&this.context===context){this.pending=false;this.start();}},()=>{if(epoch===this.epoch)this.pending=false;});
  }catch{/* Optional audio cannot block navigation, drawing or saves. */}
 }
 private clearPrimers(){for(const prime of this.primers){prime.onended=null;try{prime.stop();}catch{}try{prime.disconnect();}catch{}}this.primers.clear();}
 private start(){
  const c=this.context;if(!c||c.state!=='running'||!this.enabled||!this.visible||this.disposed||this.graph)return;
  this.clearPrimers();this.cleanup(this.retiring);this.retiring=null;
  try{
   const source=c.createBufferSource(),buffer=c.createBuffer(1,65536,22050);buffer.getChannelData(0).set(ambienceNoise());source.buffer=buffer;source.loop=true;
   const low=c.createBiquadFilter(),high=c.createBiquadFilter(),breathe=c.createGain(),out=c.createGain(),lfo=c.createOscillator(),depth=c.createGain();
   const graph:Graph={source,lfo,out,nodes:[source,low,high,breathe,out,lfo,depth]};this.graph=graph;
   low.type='lowpass';low.frequency.value=950;low.Q.value=.5;high.type='highpass';high.frequency.value=90;high.Q.value=.5;
   breathe.gain.value=.14;lfo.type='sine';lfo.frequency.value=.085;depth.gain.value=.045;
   source.connect(low);low.connect(high);high.connect(breathe);breathe.connect(out);out.connect(c.destination);lfo.connect(depth);depth.connect(breathe.gain);
   out.gain.setValueAtTime(0,c.currentTime);out.gain.linearRampToValueAtTime(1,c.currentTime+.8);
   source.start();lfo.start();
  }catch{this.stop(true);}
 }
 private cleanup(graph:Graph|null){if(!graph)return;graph.source.onended=null;try{graph.source.stop();graph.lfo.stop();}catch{}for(const node of graph.nodes){try{node.disconnect();}catch{}}}
 private stop(immediate:boolean){
  this.clearPrimers();this.cleanup(this.retiring);this.retiring=null;
  const graph=this.graph,c=this.context;this.graph=null;if(!graph||!c)return;
  if(immediate){this.cleanup(graph);return;}
  this.retiring=graph;const now=c.currentTime;
  graph.out.gain.cancelScheduledValues(now);graph.out.gain.setTargetAtTime(0,now,.035);
  graph.source.onended=()=>{this.cleanup(graph);if(this.retiring===graph)this.retiring=null;if(!this.graph&&!this.enabled){try{void c.suspend().catch(()=>{});}catch{}}};
  try{graph.source.stop(now+.2);graph.lfo.stop(now+.2);}catch{this.cleanup(graph);this.retiring=null;}
 }
 dispose(){this.disposed=true;this.epoch++;this.pending=false;this.stop(true);const c=this.context;this.context=null;if(c){c.onstatechange=null;try{void c.close().catch(()=>{});}catch{}}}
}
