import {emptyProgress,mergeProgress,readProgress,PROGRESS_KEY,type Progress} from './progress.ts';
import {encodeProgress,sameProgress} from './progress-codec.ts';
import {progressStorageKeys,writeStoredProgress,type ProgressStorage} from './progress-storage.ts';

/** Compare-and-swap is one durable transaction, including the active-owner pointer.
 * The native adapter uses an atomic file; the browser adapter uses IndexedDB. */
export interface DurableStore {
 read(keys:string[]):Promise<Record<string,string|null>>;
 change(expected:Record<string,string|null>,values:Record<string,string|null>):Promise<boolean>;
}
export class ProgressTransitionCanceled extends Error {constructor(){super('Progress transition canceled');this.name='AbortError';}}
export const ACTIVE_PROGRESS_OWNER='active-owner';
export const durableProgressKey=(owner:string)=>'progress:'+encodeURIComponent(owner);
interface Copy {schema:1;owner:string;revision:number;payload?:string;deleted?:true}
function decode(raw:string,owner:string):Copy {
 const value=JSON.parse(raw) as Copy;
 if(value.schema!==1||value.owner!==owner||!Number.isSafeInteger(value.revision)||value.revision<1||(!value.deleted&&typeof value.payload!=='string'))throw new Error('Invalid durable progress');
 if(value.deleted!==undefined&&value.deleted!==true)throw new Error('Invalid deletion marker');
 if(value.deleted&&value.payload!==undefined)throw new Error('Deleted copy has payload');
 if(!value.deleted){if(!value.payload)throw new Error('Empty durable payload');readProgress(value.payload);}
 return value;
}
function localCopies(storage:ProgressStorage,owner:string){
 const keys=progressStorageKeys(owner),bad:{key:string;raw:string}[]=[],good:Progress[]=[];let failed=false;
 for(const key of [keys.legacy,keys.compact]){
  let raw:string|null;try{raw=storage.getItem(key);}catch{failed=true;continue;}if(!raw)continue;
  try{good.push(readProgress(raw));}catch{bad.push({key,raw});}
 }
 return {good,bad,failed};
}

export class DurableProgress {
 private lifecycle=0;private writable=new Set<string>();
 private epoch=0;private owner:string|null=null;private hydrated=false;
 private queue:Promise<void>=Promise.resolve();
 constructor(private local:ProgressStorage,private store:DurableStore,private report:()=>void=()=>{}){}
 async bootOwner(){
  const value=(await this.store.read([ACTIVE_PROGRESS_OWNER]))[ACTIVE_PROGRESS_OWNER];
  if(value!==null){const parsed=JSON.parse(value!);if(parsed?.schema!==1||typeof parsed.owner!=='string'||parsed.owner.length>256)throw new Error('Invalid progress owner');return parsed.owner as string;}
  return this.local.getItem(PROGRESS_KEY+':last-user')??'';
 }
 private current(owner:string,epoch:number){return this.owner===owner&&this.epoch===epoch;}
 private enqueue<T>(task:()=>Promise<T>){const result=this.queue.then(task);this.queue=result.then(()=>{},error=>{if(!(error instanceof ProgressTransitionCanceled))this.report();});return result;}
 /** Serialize transitions behind all accepted saves. A canceled fetch may stop
  * activation; after activation the caller must commit the returned owner in UI. */
 open(owner:string,allowed:()=>boolean=()=>true){
  const requestedEpoch=this.epoch;
  return this.enqueue(async()=>{
   if(owner.length>256)throw new Error('Invalid progress owner');
   if(requestedEpoch!==this.epoch||!allowed())throw new ProgressTransitionCanceled();
   const local=localCopies(this.local,owner),key=durableProgressKey(owner);
   const snapshot=await this.store.read([key]);let copy:Copy|undefined,corrupt=false;
   if(snapshot[key]){try{copy=decode(snapshot[key]!,owner);}catch{corrupt=true;}}
   let preferBackup=false;
   try{const meta=JSON.parse(this.local.getItem(progressStorageKeys(owner).legacy+':durable-meta')??'null');const last=local.good.reduce((a,b)=>mergeProgress(a,b),emptyProgress());preferBackup=!!copy?.payload&&meta?.revision<=copy.revision&&meta?.payload===encodeProgress(last);}catch{}
   const saved=copy?.payload?[readProgress(copy.payload)]:[];
   const candidates=copy?.deleted?[]:preferBackup?[...local.good,...saved]:[...saved,...local.good];
   if(!copy?.deleted&&!candidates.length&&(local.bad.length||local.failed||corrupt))throw new Error('No readable progress copy');
   const progress=candidates.reduce((a,b)=>mergeProgress(a,b),emptyProgress());
   if(requestedEpoch!==this.epoch||!allowed())throw new ProgressTransitionCanceled();
   // Keep deletion authoritative until stale primary bytes are completely gone.
   if(copy?.deleted)this.clearLocal(owner);
   const previous={owner:this.owner,hydrated:this.hydrated};
   const epoch=++this.epoch;this.owner=owner;this.hydrated=false;
   try{await this.persist(owner,progress,epoch,true,allowed);}
   catch(error){if(this.current(owner,epoch)){this.owner=previous.owner;this.hydrated=previous.hydrated;}throw error;}
   if(!this.current(owner,epoch))throw new ProgressTransitionCanceled();
   this.hydrated=true;this.writable.add(owner);
   // A healthy durable snapshot remains usable even if the primary is full or
   // unavailable. Repair only after the independent transaction has committed.
   try{
    for(const bad of copy?.deleted?[]:local.bad){
     const quarantine=bad.key+':unreadable';this.local.setItem(quarantine,bad.raw);
     if(this.local.getItem(quarantine)!==bad.raw)throw new Error('Progress recovery copy failed');
     this.local.removeItem?.(bad.key);
    }
    writeStoredProgress(this.local,owner,progress);
    if(owner)this.local.setItem(PROGRESS_KEY+':last-user',owner);else this.local.removeItem?.(PROGRESS_KEY+':last-user');
   }catch{this.report();}
   if(local.bad.length||local.failed||corrupt)this.report();
   return progress;
  });
 }
 private clearLocal(owner:string){
  const keys=Object.values(progressStorageKeys(owner));
  const all=[...keys,...keys.map(k=>k+':unreadable'),progressStorageKeys(owner).legacy+':durable-meta'];
  for(const k of all){this.local.removeItem?.(k);if(this.local.getItem(k)!==null)throw new Error('Progress cleanup failed');}
  if(this.local.getItem(PROGRESS_KEY+':last-user')===owner)this.local.removeItem?.(PROGRESS_KEY+':last-user');
 }
 save(owner:string,value:Progress){
  if(!this.writable.has(owner))return Promise.resolve();
  const lifecycle=this.lifecycle;
  // Accepted old-owner snapshots still reach their own row after a profile
  // switch. They never reactivate that owner; erasure tombstones remain final.
  return this.enqueue(()=>this.persist(owner,value,this.epoch,false,()=>this.lifecycle===lifecycle&&this.writable.has(owner)));
 }
 private async persist(owner:string,value:Progress,epoch:number,activate=false,allowed:()=>boolean=()=>true){
  const key=durableProgressKey(owner);
  for(let attempt=0;attempt<8;attempt++){
   if(activate?!this.current(owner,epoch):!allowed())return;
   const snapshot=await this.store.read([key,ACTIVE_PROGRESS_OWNER]);
   let copy:Copy|undefined;try{if(snapshot[key])copy=decode(snapshot[key]!,owner);}catch{/* A valid local record repairs a corrupt second copy. */}
   if(copy?.deleted&&!activate)return;
   const merged=copy?.payload?mergeProgress(readProgress(copy.payload),value):value;
   const payload=encodeProgress(merged);
   if(!sameProgress(readProgress(payload),merged))throw new Error('Durable progress conversion failed');
   if(!activate&&copy?.payload===payload)return;
   const raw=JSON.stringify({schema:1,owner,revision:(copy?.revision??0)+1,payload} satisfies Copy);
   if(activate?!this.current(owner,epoch):!allowed())return;
   if(!allowed())throw new ProgressTransitionCanceled();
   if(await this.store.change(snapshot,{[key]:raw,...(activate?{[ACTIVE_PROGRESS_OWNER]:JSON.stringify({schema:1,owner})}:{})})){
    if(activate?this.current(owner,epoch):allowed())try{this.local.setItem(progressStorageKeys(owner).legacy+':durable-meta',JSON.stringify({revision:(copy?.revision??0)+1,payload:encodeProgress(value)}));}catch{this.report();}
    return;
   }
  }
  throw new Error('Durable progress changed repeatedly');
 }
 /** Retire in-flight callbacks synchronously; the tombstone is queued after prior writes. */
 forget(owner:string,signOut=false){
  this.writable.delete(owner);
  if(this.owner===owner){this.epoch++;this.owner=null;this.hydrated=false;}
  return this.enqueue(async()=>{
   const key=durableProgressKey(owner);
   for(let attempt=0;attempt<8;attempt++){
    const snapshot=await this.store.read([key,ACTIVE_PROGRESS_OWNER]);let revision=0;
    try{if(snapshot[key])revision=decode(snapshot[key]!,owner).revision;}catch{}
    const changes:Record<string,string>={[key]:JSON.stringify({schema:1,owner,revision:revision+1,deleted:true} satisfies Copy)};
    if(signOut||snapshot[ACTIVE_PROGRESS_OWNER]===JSON.stringify({schema:1,owner}))changes[ACTIVE_PROGRESS_OWNER]=JSON.stringify({schema:1,owner:''});
    if(!await this.store.change(snapshot,changes))continue;
    this.clearLocal(owner);
    return;
   }
   throw new Error('Progress removal could not be confirmed');
  });
 }
 flush(){return this.queue;}
 retire(){this.lifecycle++;this.writable.clear();this.epoch++;this.owner=null;this.hydrated=false;}
}
