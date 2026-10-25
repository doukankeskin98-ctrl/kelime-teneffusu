'use client';
import {useEffect,useRef,useState} from 'react';
import {parseChapterSpec,validChapterId,type PublishedChapter} from '@/lib/studio/content';
import type {ChapterBrowseReturn} from '@/lib/studio/chapter-browse';

const CATALOGUE_KEY='kt-published-catalogue-v1';
type Page={chapters:PublishedChapter[];companions?:PublishedChapter[];nextOffset:number|null};
function merge(first:PublishedChapter[],second:PublishedChapter[],releases:boolean){
 const all=[...first,...second.filter(c=>!first.some(f=>f.id===c.id))];
 return releases?all.sort((a,b)=>b.publishedAt-a.publishedAt||a.id.localeCompare(b.id)):all;
}
function refreshedOffset(previous:PublishedChapter[],next:number|null,page:Page){
 const shift=page.chapters.findIndex(c=>c.id===previous[0]?.id);
 // New releases shift numeric offsets. With no overlap, fill the new gap first.
 return shift>=0?(next===null?null:next+shift):page.nextOffset;
}
function cached(key:string){
 const raw:unknown=JSON.parse(localStorage.getItem(key)??'null');
 return Array.isArray(raw)?raw.slice(0,24).filter((c:PublishedChapter)=>validChapterId(c?.id)).map((c:PublishedChapter)=>({...c,spec:parseChapterSpec(c.spec)})):undefined;
}

export function useChapterCatalogue({initial,initialCompanions,collection,themeId,restore}:{initial:PublishedChapter[];initialCompanions:PublishedChapter[];collection:'studio'|'releases';themeId?:string;restore?:ChapterBrowseReturn}){
 const catalogueKey=CATALOGUE_KEY+(collection==='releases'?':releases'+(themeId?':'+themeId:''):'');
 const [state,setState]=useState(()=>({chapters:restore?.chapters??initial,companions:restore?.companions??initialCompanions,next:restore?.nextOffset??null,hasPage:restore?.hasPage??false,loading:!restore?.hasPage,offline:false,error:''}));
 const request=useRef<{id:number;controller?:AbortController;failedOffset?:number}>({id:0});
 const load=async(offset=0)=>{
  request.current.controller?.abort();
  const controller=new AbortController(),id=++request.current.id;request.current.controller=controller;
  setState(s=>({...s,loading:true,error:''}));
  const current=()=>!controller.signal.aborted&&request.current.id===id;
  try{
   const query=new URLSearchParams({offset:String(offset)});
   if(collection==='releases'){query.set('collection','releases');if(themeId)query.set('theme',themeId);}
   const response=await fetch('/api/chapters?'+query,{cache:'no-store',signal:controller.signal});
   if(!response.ok)throw new Error('Catalogue unavailable');
   const data=await response.json() as Page;if(!current())return;
   request.current.failedOffset=undefined;
   setState(s=>({...s,chapters:offset?merge(s.chapters,data.chapters,collection==='releases'):s.hasPage?merge(data.chapters,s.chapters,collection==='releases'):data.chapters,
    companions:offset?merge(s.companions,data.companions??[],collection==='releases'):s.hasPage?merge(data.companions??[],s.companions,collection==='releases'):data.companions??[],
    next:offset||!s.hasPage?data.nextOffset:refreshedOffset(s.chapters,s.next,data),hasPage:true,loading:false,offline:false,error:''}));
   if(!offset)try{localStorage.setItem(catalogueKey,JSON.stringify(data.chapters));localStorage.setItem(catalogueKey+':companions',JSON.stringify(data.companions??[]));}catch{}
  }catch{
   if(!current())return;
   request.current.failedOffset=offset;
   setState(s=>({...s,loading:false,offline:!navigator.onLine,error:navigator.onLine?'Yeni keşifler şu an yüklenemedi.':''}));
  }
 };
 useEffect(()=>{
  request.current.failedOffset=undefined;
  setState({chapters:restore?.chapters??initial,companions:restore?.companions??initialCompanions,next:restore?.nextOffset??null,hasPage:restore?.hasPage??false,loading:!restore?.hasPage,offline:!navigator.onLine,error:''});
  if(!restore?.hasPage){
   if(!restore)try{const chapters=cached(catalogueKey),companions=cached(catalogueKey+':companions');setState(s=>({...s,chapters:chapters??s.chapters,companions:companions??s.companions}));}catch{}
   void load();
  }
  const online=()=>void load(request.current.failedOffset??0);
  window.addEventListener('online',online);
  return ()=>{request.current.id++;request.current.controller?.abort();window.removeEventListener('online',online);};
 },[catalogueKey]);
 return {...state,retry:()=>void load(request.current.failedOffset??0),more:()=>{if(state.next!==null)void load(state.next);}};
}
