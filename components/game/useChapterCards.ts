'use client';
import {useEffect,useRef,useState} from 'react';
import {memberFetch} from '@/lib/auth/firebase-client';
import type {PublishedChapter} from '@/lib/studio/content';
import {BOARD_KEY,saveKey,readChapterSave} from '@/lib/studio/chapter-cache';
import {cardProgress,parseCardProgress,mergeCardProgress,type ChapterCardProgress,type ChapterCardState} from '@/lib/studio/card-progress';

type Values=Record<string,ChapterCardProgress>;
interface Entry {contentHash:string;progress:ChapterCardProgress}
export function useChapterCards(owner:string|undefined,chapters:PublishedChapter[]){
 const ownerKey=owner??'device',key=chapters.map(c=>c.id+':'+c.contentHash).join('|');
 const [attempt,setAttempt]=useState(0),[state,setState]=useState<{owner:string;catalogue:string;status:ChapterCardState;values:Values;available:Record<string,boolean>}>({owner:ownerKey,catalogue:key,status:'loading',values:{},available:{}});
 const remote=useRef<{owner:string;values:Record<string,Entry>}>({owner:ownerKey,values:{}}),lastRead=useRef(0);
 useEffect(()=>{
  let stopped=false;const controller=new AbortController();if(remote.current.owner!==ownerKey)remote.current={owner:ownerKey,values:{}};
  const local=()=>{const values:Values={},available:Record<string,boolean>={};for(const chapter of chapters){available[chapter.id]=false;const known=remote.current.owner===ownerKey?remote.current.values[chapter.id]:undefined;let value=known?.contentHash===chapter.contentHash?known.progress:undefined;try{const cached=readChapterSave(localStorage,owner,chapter);if(cached){available[chapter.id]=true;value=mergeCardProgress(value,cardProgress(cached.save,chapter.spec),chapter.spec);}}catch{}if(value)values[chapter.id]=value;}return {values,available};};
  const update=(status:ChapterCardState)=>{if(!stopped)setState({owner:ownerKey,catalogue:key,status:navigator.onLine?status:'offline',...local()});};
  const online=navigator.onLine;update(!online?'offline':owner&&chapters.length?'loading':'ready');
  const missing=chapters.filter(c=>remote.current.values[c.id]?.contentHash!==c.contentHash);
  if(owner&&online&&missing.length){
   lastRead.current=Date.now();const chunks=Array.from({length:Math.ceil(missing.length/24)},(_,i)=>missing.slice(i*24,i*24+24));
   void Promise.allSettled(chunks.map(async chunk=>{const response=await memberFetch('/api/chapters?action=card-progress&ids='+encodeURIComponent(chunk.map(c=>c.id).join(',')),{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('Progress unavailable');const data=await response.json() as {chapters:{id:string;contentHash:string;progress:unknown}[]};if(!Array.isArray(data.chapters))throw new Error('Invalid progress');return {chunk,data};})).then(results=>{
    if(stopped||controller.signal.aborted||remote.current.owner!==ownerKey)return;let failed=false;
    for(const result of results){if(result.status==='rejected'){failed=true;continue;}for(const chapter of result.value.chunk){const row=result.value.data.chapters.find(r=>r?.id===chapter.id&&r.contentHash===chapter.contentHash),progress=row?parseCardProgress(row.progress,chapter.spec):null;if(progress)remote.current.values[chapter.id]={contentHash:chapter.contentHash,progress};else failed=true;}}
    update(failed?'error':'ready');
   });
  }else if(online)update('ready');
  const refresh=()=>{remote.current={owner:ownerKey,values:{}};setAttempt(value=>value+1);};
  const visible=()=>{if(!document.hidden&&Date.now()-lastRead.current>30000)refresh();};
  const storage=(event:StorageEvent)=>{if(event.key===null||event.key===saveKey(owner)||event.key===BOARD_KEY)setState(previous=>previous.owner===ownerKey&&previous.catalogue===key?{...previous,...local()}:previous);};
  const offline=()=>update('offline');window.addEventListener('online',refresh);window.addEventListener('offline',offline);window.addEventListener('storage',storage);document.addEventListener('visibilitychange',visible);
  return ()=>{stopped=true;controller.abort();window.removeEventListener('online',refresh);window.removeEventListener('offline',offline);window.removeEventListener('storage',storage);document.removeEventListener('visibilitychange',visible);};
 },[ownerKey,key,attempt]);
 const current=state.owner===ownerKey&&state.catalogue===key;
 return {values:current?state.values:{},available:current?state.available:{},status:current?state.status:'loading' as ChapterCardState,retry:()=>{remote.current={owner:ownerKey,values:{}};setAttempt(value=>value+1);}};
}
