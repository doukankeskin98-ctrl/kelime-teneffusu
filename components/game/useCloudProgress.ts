'use client';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {memberFetch} from '@/lib/auth/firebase-client';
import type {Progress} from '@/lib/game/progress';
import {ProgressSync,type ProgressSaveStatus} from '@/lib/game/progress-sync';

export function useCloudProgress(userId:string|undefined,progress:Progress,setProgress:Dispatch<SetStateAction<Progress>>,ready:boolean){
 const [status,setStatus]=useState<ProgressSaveStatus>('local'),current=useRef(progress),session=useRef<ProgressSync|null>(null);current.current=progress;
 useEffect(()=>{
  if(!ready||!userId){session.current=null;setStatus('local');return;}
  const sync=new ProgressSync({owner:userId,storage:{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)},online:()=>navigator.onLine,read:()=>current.current,write:value=>{current.current=value;setProgress(value);},status:setStatus,
   load:async signal=>{const response=await memberFetch('/api/progress',{cache:'no-store',signal});if(!response.ok)throw new Error('load');return (await response.json() as {progress:Progress}).progress;},
   save:async(value,signal,keepalive)=>{const response=await memberFetch('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({progress:value}),signal,keepalive});if(!response.ok)throw new Error('save');return (await response.json() as {progress:Progress}).progress;},
  });session.current=sync;
  const cycle=async()=>{await sync.connect();await sync.flush();};void cycle();
  const interval=setInterval(()=>void cycle(),8000),online=()=>void cycle(),flush=()=>{void sync.flush();},hide=()=>{if(document.hidden)void sync.flush(true);},pagehide=()=>{void sync.flush(true);};
  window.addEventListener('online',online);window.addEventListener('kt-sync-now',flush);window.addEventListener('pagehide',pagehide);document.addEventListener('visibilitychange',hide);
  return ()=>{sync.dispose();session.current=null;clearInterval(interval);window.removeEventListener('online',online);window.removeEventListener('kt-sync-now',flush);window.removeEventListener('pagehide',pagehide);document.removeEventListener('visibilitychange',hide);};
 },[userId,ready,setProgress]);
 useEffect(()=>{if(ready&&userId)session.current?.changed(current.current);},[progress,userId,ready]);
 return status;
}
