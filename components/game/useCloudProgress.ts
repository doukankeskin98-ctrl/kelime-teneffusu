'use client';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {memberFetch} from '@/lib/auth/firebase-client';
import {loadProgress,mergeProgress,PROGRESS_KEY,type Progress} from '@/lib/game/progress';
export function useCloudProgress(userId:string|undefined,progress:Progress,setProgress:Dispatch<SetStateAction<Progress>>,ready:boolean){
 const [status,setStatus]=useState<'local'|'syncing'|'saved'|'offline'>('local');
 const ref=useRef(progress),loaded=useRef(''),dirty=useRef(false),busy=useRef(false),last=useRef('');ref.current=progress;
 useEffect(()=>{dirty.current=true;},[progress]);
 useEffect(()=>{
  if(!ready||!userId){loaded.current='';setStatus('local');return;}
  let stopped=false;const controller=new AbortController();loaded.current='';setStatus('syncing');
  let cached:Progress|null=null;
  try{const value=localStorage.getItem(PROGRESS_KEY+':'+userId);if(value)cached=loadProgress(value);}catch{}
  if(cached)setProgress(p=>mergeProgress(p,cached!));
  try{localStorage.setItem(PROGRESS_KEY+':last-user',userId);}catch{}
  const load=async()=>{
   try{const r=await memberFetch('/api/progress',{signal:controller.signal});if(!r.ok)throw new Error();const data=await r.json() as {progress:Progress};if(stopped)return;setProgress(p=>{const remote=loadProgress(JSON.stringify(data.progress)),merged=mergeProgress(remote,p);if(!cached&&Object.keys(p.saves).length===0){merged.palette=remote.palette;merged.sound=remote.sound;merged.zoom=remote.zoom;merged.contrast=remote.contrast;merged.haptics=remote.haptics;merged.analytics=remote.analytics;}return merged;});loaded.current=userId;dirty.current=true;setStatus('saved');}
   catch{if(!stopped){setStatus('offline');retry=setTimeout(()=>void load(),15000);}}
  };let retry:ReturnType<typeof setTimeout>;void load();
  return ()=>{stopped=true;controller.abort();clearTimeout(retry);loaded.current='';};
 },[userId,ready]);
 useEffect(()=>{
  if(!userId||!ready)return;
  let stopped=false;const controller=new AbortController();
  const sync=async()=>{
   try{localStorage.setItem(PROGRESS_KEY+':'+userId,JSON.stringify(ref.current));}catch{}
   if(loaded.current!==userId||!dirty.current||busy.current)return;
   const snapshot=JSON.stringify(ref.current);if(snapshot===last.current){dirty.current=false;return;}
   busy.current=true;setStatus('syncing');
   try{const r=await memberFetch('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({progress:ref.current}),signal:controller.signal});if(!r.ok)throw new Error();const data=await r.json() as {progress:Progress};if(stopped)return;last.current=snapshot;dirty.current=JSON.stringify(ref.current)!==snapshot;setProgress(p=>mergeProgress(loadProgress(JSON.stringify(data.progress)),p));setStatus('saved');}
   catch{if(!stopped)setStatus('offline');}finally{busy.current=false;}
  };
  const interval=setInterval(()=>void sync(),8000),online=()=>void sync();window.addEventListener('online',online);window.addEventListener('kt-sync-now',online);
  return ()=>{stopped=true;controller.abort();clearInterval(interval);window.removeEventListener('online',online);window.removeEventListener('kt-sync-now',online);};
 },[userId,ready]);
 return status;
}
