import {loadProgress,mergeProgress,PROGRESS_KEY,type Progress} from './progress.ts';

export type ProgressSaveStatus='local'|'syncing'|'saved'|'offline'|'storage-error';
interface LocalStorage {getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void}
interface Options {
 owner:string;storage:LocalStorage;online:()=>boolean;read:()=>Progress;write:(value:Progress)=>void;
 status:(value:ProgressSaveStatus)=>void;
 load:(signal:AbortSignal)=>Promise<Progress>;
 save:(value:Progress,signal:AbortSignal,keepalive:boolean)=>Promise<Progress>;
}
/** One instance belongs to exactly one account. Late responses never cross that boundary. */
export class ProgressSync {
 private controller=new AbortController();
 private stopped=false;private loading=false;private sending=false;private loaded=false;
 private initialized=false;private hadCache=false;private localOK=true;private acknowledged='';
 private localSnapshot='';
 constructor(private options:Options){}
 private persist(value:Progress){
  const serialized=JSON.stringify(value);
  if(this.localOK&&serialized===this.localSnapshot)return;
  try{this.options.storage.setItem(PROGRESS_KEY+':'+this.options.owner,serialized);this.localSnapshot=serialized;this.localOK=true;}catch{this.localOK=false;}
 }
 private report(value:ProgressSaveStatus){if(!this.stopped)this.options.status(value);}
 private pendingStatus():ProgressSaveStatus{return !this.localOK?'storage-error':this.options.online()?'local':'offline';}
 changed(value:Progress){if(this.stopped)return;this.persist(value);if(JSON.stringify(value)!==this.acknowledged)this.report(this.pendingStatus());}
 async connect(){
  if(this.stopped||this.loading||this.loaded)return;
  if(!this.initialized){
   this.initialized=true;
   try{const raw=this.options.storage.getItem(PROGRESS_KEY+':'+this.options.owner);this.hadCache=!!raw;if(raw)this.options.write(mergeProgress(this.options.read(),loadProgress(raw)));this.options.storage.setItem(PROGRESS_KEY+':last-user',this.options.owner);}catch{this.localOK=false;}
   this.persist(this.options.read());
  }
  if(!this.options.online()){this.report(this.pendingStatus());return;}
  const initial=this.options.read();
  this.loading=true;this.report('syncing');
  try{
   const remote=loadProgress(JSON.stringify(await this.options.load(this.controller.signal)));if(this.stopped)return;
   const current=this.options.read(),merged=mergeProgress(remote,current);
   if(!this.hadCache&&Object.keys(initial.saves).length===0){for(const setting of ['palette','sound','zoom','contrast','haptics','analytics'] as const)if(current[setting]===initial[setting])Object.assign(merged,{[setting]:remote[setting]});}
   this.acknowledged=JSON.stringify(remote);this.loaded=true;this.persist(merged);this.options.write(merged);
   this.report(JSON.stringify(merged)===this.acknowledged?'saved':this.pendingStatus());
  }catch{if(!this.stopped)this.report(this.localOK?'offline':'storage-error');}finally{this.loading=false;}
 }
 async flush(keepalive=false){
  if(this.stopped)return;
  const snapshot=this.options.read();this.persist(snapshot);
  if(!this.options.online()){this.report(this.pendingStatus());return;}
  if(!this.loaded||this.sending)return;
  const serialized=JSON.stringify(snapshot);if(serialized===this.acknowledged){this.report('saved');return;}
  this.sending=true;this.report('syncing');
  try{
   const remote=loadProgress(JSON.stringify(await this.options.save(snapshot,this.controller.signal,keepalive&&new TextEncoder().encode(serialized).byteLength<60000)));if(this.stopped)return;
   const merged=mergeProgress(remote,this.options.read());this.acknowledged=JSON.stringify(remote);this.persist(merged);this.options.write(merged);
   this.report(JSON.stringify(merged)===this.acknowledged?'saved':this.pendingStatus());
  }catch{if(!this.stopped)this.report(this.localOK?'offline':'storage-error');}finally{this.sending=false;}
 }
 dispose(){this.stopped=true;this.controller.abort();}
}
