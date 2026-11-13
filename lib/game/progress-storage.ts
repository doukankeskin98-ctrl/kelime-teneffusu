import {emptyProgress,mergeProgress,readProgress,normalizeProgress,type Progress,PROGRESS_KEY} from './progress.ts';
import {encodeProgress,sameProgress,ProgressFormatError} from './progress-codec.ts';
import {COMPACT_PROGRESS_WRITES} from './progress-rollout.ts';
const validated=new WeakMap<object,Map<string,string>>();
function validateStored(storage:object,key:string,raw:string|null){if(!raw)return;let known=validated.get(storage);if(!known){known=new Map();validated.set(storage,known);}if(known.get(key)!==raw){readProgress(raw);known.set(key,raw);}}
export interface ProgressStorage {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem?(key:string):void}
export function progressStorageKeys(owner=''){
 const suffix=owner?':'+owner:'',compact='kelime-teneffusu-v3'+suffix;
 return {legacy:PROGRESS_KEY+suffix,compact,pending:compact+':pending',shadow:compact+':shadow',backup:compact+':pre-v3'};
}
export function readStoredProgress(storage:Pick<ProgressStorage,'getItem'>,owner=''):Progress{
 const keys=progressStorageKeys(owner),old=storage.getItem(keys.legacy),compact=storage.getItem(keys.compact);
 // A partial staging write is never authoritative. A corrupt authoritative key
 // throws instead of turning into empty progress that a later effect overwrites.
 const legacy=old?readProgress(old):emptyProgress();
 return compact?mergeProgress(legacy,readProgress(compact)):legacy;
}
function verified(raw:string,expected:Progress){if(!sameProgress(readProgress(raw),normalizeProgress(expected)))throw new ProgressFormatError('Kayıt dönüşümü doğrulanamadı.');}
export function shadowProgress(storage:ProgressStorage,owner:string,progress:Progress){
 const key=progressStorageKeys(owner).shadow,raw=encodeProgress(progress);verified(raw,progress);
 if(storage.getItem(key)===raw)return raw;
 storage.setItem(key,raw);verified(storage.getItem(key)??'',progress);return raw;
}
export function writeStoredProgress(storage:ProgressStorage,owner:string,progress:Progress,activate=COMPACT_PROGRESS_WRITES){
 const keys=progressStorageKeys(owner),compact=storage.getItem(keys.compact),legacy=storage.getItem(keys.legacy);
 // Never overwrite an unreadable original, even after a failed app boot.
 validateStored(storage,keys.legacy,legacy);validateStored(storage,keys.compact,compact);
 if(!activate&&!compact){const raw=encodeProgress(progress,2);storage.setItem(keys.legacy,raw);validated.get(storage)?.set(keys.legacy,raw);return;}
 const raw=encodeProgress(progress);verified(raw,progress);
 storage.setItem(keys.pending,raw);verified(storage.getItem(keys.pending)??'',progress);
 if(!storage.getItem(keys.backup)&&legacy){storage.setItem(keys.backup,legacy);if(storage.getItem(keys.backup)!==legacy)throw new ProgressFormatError('Kayıt yedeği doğrulanamadı.');}
 // Atomic authoritative replacement is last; v2 and its exact backup stay intact.
 try{storage.setItem(keys.compact,raw);verified(storage.getItem(keys.compact)??'',progress);}catch(error){if(compact)storage.setItem(keys.compact,compact);else storage.removeItem?.(keys.compact);throw error;}
 validated.get(storage)?.set(keys.compact,raw);storage.removeItem?.(keys.pending);
}
