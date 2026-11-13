'use client';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {memberFetch} from '@/lib/auth/firebase-client';
import {COMPACT_PROGRESS_WRITES} from '@/lib/game/progress-rollout';
import {readProgress} from '@/lib/game/progress';
import {encodeProgress} from '@/lib/game/progress-codec';
import type {Progress} from '@/lib/game/progress';
import {ProgressSync,ProgressOwnerChangedError,type ProgressSaveStatus} from '@/lib/game/progress-sync';

export function useCloudProgress(userId:string|undefined,progress:Progress,setProgress:Dispatch<SetStateAction<Progress>>,ready:boolean){
 const [status,setStatus]=useState<ProgressSaveStatus>('local'),current=useRef(progress),session=useRef<ProgressSync|null>(null),liveOwner=useRef(userId);current.current=progress;liveOwner.current=userId;
 useEffect(()=>{
  if(!ready||!userId){session.current=null;setStatus('local');return;}
  let supportsCompact=false;
  const sync:ProgressSync=new ProgressSync({owner:userId,isCurrent:()=>liveOwner.current===userId&&session.current===sync,storage:{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),removeItem:key=>localStorage.removeItem(key)},online:()=>navigator.onLine,read:()=>current.current,write:value=>{current.current=value;setProgress(value);},status:setStatus,
   load:async signal=>{const response=await memberFetch('/api/progress?format=3&expectedOwnerId='+encodeURIComponent(userId),{cache:'no-store',signal});await checkProgressResponse(response);const body=await response.json() as {progress:unknown;capabilities?:{progress:number}};supportsCompact=body.capabilities?.progress===3;return readProgress(JSON.stringify(body.progress));},
   save:async(value,signal,keepalive)=>{const modern=!!value.revisionSaves||Object.values(value.saves).some(s=>s.revision===2);if(modern&&!supportsCompact)throw new Error('Progress server update required');const format=supportsCompact&&(COMPACT_PROGRESS_WRITES||modern)?3:2;const response=await memberFetch('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({progress:JSON.parse(encodeProgress(value,format)),format,expectedOwnerId:userId}),signal,keepalive});await checkProgressResponse(response);return readProgress(JSON.stringify((await response.json() as {progress:unknown}).progress));},
  });session.current=sync;
  const cycle=async()=>{await sync.connect();await sync.flush();};void cycle();
  const interval=setInterval(()=>void cycle(),8000),online=()=>void cycle(),flush=()=>{void cycle();},hide=()=>{if(document.hidden)void sync.flush(true);},pagehide=()=>{void sync.flush(true);};
  window.addEventListener('online',online);window.addEventListener('kt-sync-now',flush);window.addEventListener('pagehide',pagehide);document.addEventListener('visibilitychange',hide);
  return ()=>{sync.dispose();session.current=null;clearInterval(interval);window.removeEventListener('online',online);window.removeEventListener('kt-sync-now',flush);window.removeEventListener('pagehide',pagehide);document.removeEventListener('visibilitychange',hide);};
 },[userId,ready,setProgress]);
 useEffect(()=>{if(ready&&userId)session.current?.changed(current.current);},[progress,userId,ready]);
 return status;
}

async function checkProgressResponse(response:Response){
 if(response.ok)return;
 if(response.status===409){try{const body=await response.json() as {code?:string};if(body.code==='PROGRESS_OWNER_CHANGED')throw new ProgressOwnerChangedError();}catch(e){if(e instanceof ProgressOwnerChangedError)throw e;}}
 throw new Error('Progress request failed');
}
