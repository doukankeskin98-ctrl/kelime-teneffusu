const FILES=['letter','select','word','miss','hint','complete','finish','ready','pause'] as const;
type Sample=typeof FILES[number];
/** Decoding never runs on pointermove. Missing samples retain the existing cue. */
export class SoundSamples {
 private started=false;
 private disposed=false;
 private buffers=new Map<Sample,AudioBuffer>();
 private controller=new AbortController();
 async load(context:Pick<AudioContext,'decodeAudioData'>,request:typeof fetch){
  if(this.started||this.disposed)return;this.started=true;
  await Promise.allSettled(FILES.map(async name=>{
   const response=await request('/audio/interface-v1/'+name+'.wav',{signal:this.controller.signal});
   if(!response.ok)throw Error('Sample unavailable');
   const data=await response.arrayBuffer();if(data.byteLength>100000)throw Error('Unexpected sample size');
   const buffer=await context.decodeAudioData(data);
   if(!this.disposed&&buffer.duration<=1)this.buffers.set(name,buffer);
  }));
 }
 get(cue:string){return this.buffers.get((cue==='start'?'hint':cue==='reveal'?'complete':cue) as Sample);}
 dispose(){this.disposed=true;this.controller.abort();this.buffers.clear();}
}
