import {loadProgress,mergeProgress,PROGRESS_KEY,type Progress} from './progress.ts';

export type ProgressSaveStatus='local'|'syncing'|'saved'|'offline'|'storage-error'|'account-changed'|'account-changed-storage-error';
export class ProgressOwnerChangedError extends Error {}
export const progressOwnerChanged=(status:ProgressSaveStatus)=>status==='account-changed'||status==='account-changed-storage-error';
export const PROGRESS_SYNC_TIMEOUT=8000;
interface LocalStorage {getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void}
interface Options {
 owner:string;isCurrent?:()=>boolean;storage:LocalStorage;online:()=>boolean;read:()=>Progress;write:(value:Progress)=>void;
 status:(value:ProgressSaveStatus)=>void;
 load:(signal:AbortSignal)=>Promise<Progress>;
 save:(value:Progress,signal:AbortSignal,keepalive:boolean)=>Promise<Progress>;
}
/** One instance belongs to exactly one account. Late responses never cross that boundary. */
export class ProgressSync {
 private controller=new AbortController();
 private stopped=false;private accountChanged=false;private loading=false;private sending=false;private loaded=false;
 private initialized=false;private hadCache=false;private localOK=true;private acknowledged='';
 private localSnapshot='';
 constructor(private options:Options){}
 private active(){return !this.stopped&&(this.options.isCurrent?.()??true);}
 private async request(operation:(signal:AbortSignal)=>Promise<Progress>){
  const controller=new AbortController(),abort=()=>controller.abort();
  let timeout:ReturnType<typeof setTimeout>|undefined,onAbort=()=>{};
  const deadline=new Promise<never>((_resolve,reject)=>{
   onAbort=()=>reject(new Error('Progress sync cancelled or timed out'));
   controller.signal.addEventListener('abort',onAbort,{once:true});
   timeout=setTimeout(abort,PROGRESS_SYNC_TIMEOUT);
  });
  this.controller.signal.addEventListener('abort',abort,{once:true});
  try{
   if(this.controller.signal.aborted)controller.abort();
   // Race the whole callback: token acquisition, HTTP and response parsing.
   const remote=await Promise.race([controller.signal.aborted?deadline:operation(controller.signal),deadline]);
   if(controller.signal.aborted)throw new Error('Progress sync cancelled or timed out');
   return remote;
  }finally{
   clearTimeout(timeout);controller.signal.removeEventListener('abort',onAbort);
   this.controller.signal.removeEventListener('abort',abort);
  }
 }
 private persist(value:Progress){
  if(!this.active())return;
  const serialized=JSON.stringify(value);
  if(this.localOK&&serialized===this.localSnapshot)return;
  try{this.options.storage.setItem(PROGRESS_KEY+':'+this.options.owner,serialized);this.localSnapshot=serialized;this.localOK=true;}catch{this.localOK=false;}
 }
 private report(value:ProgressSaveStatus){if(this.active())this.options.status(value);}
 private pendingStatus():ProgressSaveStatus{return this.accountChanged?(this.localOK?'account-changed':'account-changed-storage-error'):!this.localOK?'storage-error':this.options.online()?'local':'offline';}
 changed(value:Progress){if(!this.active())return;this.persist(value);if(this.accountChanged||JSON.stringify(value)!==this.acknowledged)this.report(this.pendingStatus());}
 async connect(){
  if(!this.active()||this.accountChanged||this.loading||this.loaded)return;
  if(!this.initialized){
   this.initialized=true;
   try{const raw=this.options.storage.getItem(PROGRESS_KEY+':'+this.options.owner);this.hadCache=!!raw;if(raw)this.options.write(mergeProgress(this.options.read(),loadProgress(raw)));this.options.storage.setItem(PROGRESS_KEY+':last-user',this.options.owner);}catch{this.localOK=false;}
   this.persist(this.options.read());
  }
  if(!this.options.online()){this.report(this.pendingStatus());return;}
  const initial=this.options.read();
  this.loading=true;this.report('syncing');
  try{
   const remote=loadProgress(JSON.stringify(await this.request(signal=>this.options.load(signal))));if(!this.active())return;
   const current=this.options.read(),merged=mergeProgress(remote,current);
   if(!this.hadCache&&Object.keys(initial.saves).length===0){for(const setting of ['palette','sound','zoom','contrast','haptics','analytics'] as const)if(current[setting]===initial[setting])Object.assign(merged,{[setting]:remote[setting]});}
   this.acknowledged=JSON.stringify(remote);this.loaded=true;this.persist(merged);this.options.write(merged);
   this.report(JSON.stringify(merged)===this.acknowledged&&this.localOK?'saved':this.pendingStatus());
  }catch(e){if(!this.active())return;if(e instanceof ProgressOwnerChangedError){this.accountChanged=true;this.report(this.pendingStatus());}else this.report(this.localOK?'offline':'storage-error');}finally{this.loading=false;}
 }
 async flush(keepalive=false){
  if(!this.active())return;
  const snapshot=this.options.read();this.persist(snapshot);
  if(this.accountChanged){this.report(this.pendingStatus());return;}
  if(!this.options.online()){this.report(this.pendingStatus());return;}
  if(!this.loaded||this.sending)return;
  const serialized=JSON.stringify(snapshot);if(serialized===this.acknowledged){this.report(this.localOK?'saved':this.pendingStatus());return;}
  this.sending=true;this.report('syncing');
  try{
   const remote=loadProgress(JSON.stringify(await this.request(signal=>this.options.save(snapshot,signal,keepalive&&new TextEncoder().encode(serialized).byteLength<60000))));if(!this.active())return;
   const merged=mergeProgress(remote,this.options.read());this.acknowledged=JSON.stringify(remote);this.persist(merged);this.options.write(merged);
   this.report(JSON.stringify(merged)===this.acknowledged&&this.localOK?'saved':this.pendingStatus());
  }catch(e){if(!this.active())return;if(e instanceof ProgressOwnerChangedError){this.accountChanged=true;this.report(this.pendingStatus());}else this.report(this.localOK?'offline':'storage-error');}finally{this.sending=false;}
 }
 dispose(){this.stopped=true;this.controller.abort();}
}
