import type {HapticsAdapter,HapticCue} from '../game/haptics.ts';

export interface NativeHapticDriver {
 selectionStart:()=>Promise<void>;
 selectionChanged:()=>Promise<void>;
 selectionEnd:()=>Promise<void>;
 word:()=>Promise<void>;
 complete:()=>Promise<void>;
}
type Selection={busy:boolean;closed:boolean;ending:boolean;last:number};

/** One live native selection, no pulse queue. Late preparation cannot replay input. */
export function nativeHaptics(driver:NativeHapticDriver,active:()=>boolean,now:()=>number=()=>performance.now()):HapticsAdapter {
 let selection:Selection|null=null;
 const end=async(s:Selection)=>{
  if(s.ending)return;s.ending=true;
  try{await driver.selectionEnd();}catch{/* Haptics may be unavailable. */}
  finally{if(selection===s)selection=null;}
 };
 const stop=()=>{const s=selection;if(!s)return;s.closed=true;if(!s.busy)void end(s);};
 const tick=async(s:Selection,start:boolean)=>{
  s.busy=true;
  try{
   if(start)await driver.selectionStart();
   if(s.closed||!active()){s.closed=true;return;}
   s.last=now();
   await driver.selectionChanged();
  }catch{s.closed=true;}
  finally{s.busy=false;if(s.closed)void end(s);}
 };
 const play=(cue:HapticCue)=>{
  if(!active()){stop();return;}
  if(cue!=='selection'){
   stop();
   try{void (cue==='word'?driver.word():driver.complete()).catch(()=>{});}catch{/* Feedback never owns game state. */}
   return;
  }
  const at=now();
  if(selection&&(selection.closed||selection.busy||at-selection.last<50))return;
  const start=!selection;
  const s=selection??={busy:false,closed:false,ending:false,last:at};s.last=at;
  void tick(s,start);
 };
 return Object.assign(play,{stopSelection:stop});
}
