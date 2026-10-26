'use client';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {memberFetch} from '@/lib/auth/firebase-client';
import type {Progress} from '@/lib/game/progress';
import {ProgressSync,ProgressOwnerChangedError,type ProgressSaveStatus} from '@/lib/game/progress-sync';

export function useCloudProgress(userId:string|undefined,progress:Progress,setProgress:Dispatch<SetStateAction<Progress>>,ready:boolean){
 const [status,setStatus]=useState<ProgressSaveStatus>('local'),current=useRef(progress),session=useRef<ProgressSync|null>(null),liveOwner=useRef(userId);current.current=progress;liveOwner.current=userId;
 useEffect(()=>{
  if(!ready||!userId){session.current=null;setStatus('local');return;}
  const sync:ProgressSync=new ProgressSync({owner:userId,isCurrent:()=>liveOwner.current===userId&&session.current===sync,storage:{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)},online:()=>navigator.onLine,read:()=>current.current,write:value=>{current.current=value;setProgress(value);},status:setStatus,
   load:async signal=>{const response=await memberFetch('/api/progress?expectedOwnerId='+encodeURIComponent(userId),{cache:'no-store',signal});await checkProgressResponse(response);return (await response.json() as {progress:Progress}).progress;},
   save:async(value,signal,keepalive)=>{const response=await memberFetch('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({progress:value,expectedOwnerId:userId}),signal,keepalive});await checkProgressResponse(response);return (await response.json() as {progress:Progress}).progress;},
  });session.current=sync;
  const cycle=async()=>{await sync.connect();await sync.flush();};void cycle();
  const interval=setInterval(()=>void cycle(),8000),online=()=>void cycle(),flush=()=>{void sync.flush();},hide=()=>{if(document.hidden)void sync.flush(true);},pagehide=()=>{void sync.flush(true);};
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
