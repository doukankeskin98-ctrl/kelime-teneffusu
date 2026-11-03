/** Web stays silent; the native shell registers optional, non-blocking feedback. */
export type HapticCue='selection'|'menu'|'word'|'complete';
export type HapticsAdapter=((cue:HapticCue)=>void|Promise<void>)&{stopSelection?:()=>void};
let adapter:HapticsAdapter|null=null;
export function stopHapticSelection(){try{adapter?.stopSelection?.();}catch{/* Optional cleanup never blocks play. */}}
export function setHapticsAdapter(next:HapticsAdapter|null){stopHapticSelection();adapter=next;}
export function hapticsAvailable(){return adapter!==null;}
export function playHaptic(cue:HapticCue,enabled:boolean){
 if(!enabled||!adapter)return;
 try{void Promise.resolve(adapter(cue)).catch(()=>{});}catch{/* Optional feedback never blocks play. */}
}
