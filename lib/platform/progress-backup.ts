import {DurableProgress,type DurableStore} from '../game/progress-durable.ts';
import {setProgressBackupWriter} from '../game/progress-storage.ts';
let native:DurableStore|undefined,instance:DurableProgress|undefined;
export const setNativeProgressStore=(store:DurableStore)=>{native=store;};
export function browserProgressStore():DurableStore {
 let connection:Promise<IDBDatabase>|undefined;
 const db=()=>connection??=new Promise((resolve,reject)=>{
  const request=indexedDB.open('kelime-teneffusu-progress',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('copies');
  request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();connection=undefined;};resolve(request.result);};
  request.onerror=()=>{connection=undefined;reject(request.error);};request.onblocked=()=>{connection=undefined;reject(new Error('Progress database blocked'));};
 });
 return {
  async read(keys){const database=await db();return new Promise((resolve,reject)=>{
   const tx=database.transaction('copies','readonly'),store=tx.objectStore('copies'),result:Record<string,string|null>={};
   for(const key of keys){const request=store.get(key);request.onsuccess=()=>{result[key]=request.result??null;};}
   tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(tx.error??new Error('Progress read failed'));
  });},
  async change(expected,values){const database=await db();return new Promise((resolve,reject)=>{
   let tx:IDBTransaction;try{tx=database.transaction('copies','readwrite',{durability:'strict'});}catch{tx=database.transaction('copies','readwrite');}
   const store=tx.objectStore('copies');let remaining=Object.keys(expected).length,matches=true;
   const write=()=>{if(matches)for(const [key,value] of Object.entries(values)){if(value===null)store.delete(key);else store.put(value,key);}};
   if(!remaining)write();
   for(const [key,value] of Object.entries(expected)){const request=store.get(key);request.onsuccess=()=>{if((request.result??null)!==value)matches=false;if(!--remaining)write();};}
   tx.oncomplete=()=>resolve(matches);tx.onerror=tx.onabort=()=>reject(tx.error??new Error('Progress write failed'));
  });}
 };
}
export function progressBackup(){
 if(!instance){
  instance=new DurableProgress(localStorage,native??browserProgressStore(),()=>window.dispatchEvent(new Event('kt-progress-storage-error')));
  const backup=instance;
  setProgressBackupWriter((owner,progress)=>{void backup.save(owner,progress).catch(()=>{});});
 }
 return instance;
}
