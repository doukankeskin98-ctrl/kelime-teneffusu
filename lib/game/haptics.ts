/** Web is intentionally silent. A future native shell can register its own adapter. */
export type HapticCue='selection'|'word'|'complete';
export type HapticsAdapter=(cue:HapticCue)=>void|Promise<void>;
let adapter:HapticsAdapter|null=null;
export function setHapticsAdapter(next:HapticsAdapter|null){adapter=next;}
export function hapticsAvailable(){return adapter!==null;}
export function playHaptic(cue:HapticCue,enabled:boolean){
 if(!enabled||!adapter)return;
 try{void Promise.resolve(adapter(cue)).catch(()=>{});}catch{/* Optional feedback never blocks play. */}
}
