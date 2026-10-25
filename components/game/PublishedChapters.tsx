'use client';
import {useEffect,useId,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowRight,Check,Cloud,CloudOff,LoaderCircle,RefreshCw,Sparkles,TriangleAlert,WifiOff} from 'lucide-react';
import {findTheme} from '@/lib/game/catalog';
import {cleanSave,type Progress,type SavedLevel} from '@/lib/game/progress';
import {mergeChapterSave,chapterSyncResult} from '@/lib/studio/chapter-progress';
import {ChapterSaveQueue,type ChapterSaveStatus} from '@/lib/studio/chapter-save-queue';
import {parseChapterSpec,validChapterId,type PlayableChapter,type PublishedChapter} from '@/lib/studio/content';
import {memberFetch} from '@/lib/auth/firebase-client';
import {BOARD_KEY,saveKey,dictionary,cachedChapter,matchingCachedChapter,rememberChapter} from '@/lib/studio/chapter-cache';
import {WorldArt} from './WorldArt';
import {Solo} from './Solo';
import {ReleaseAlbum} from './ReleaseAlbum';
import {useChapterCards} from './useChapterCards';
import {ChapterProgressBadge} from './ChapterProgressBadge';
import {ChapterAvailability} from './ChapterAvailability';
import {chapterCardCopy} from '@/lib/studio/card-progress';
import {releasePairs,releaseDateLabel,playableReleasePair,releaseRunResult,type ReleasePair} from '@/lib/studio/release-stamps';
import {ReleaseStamp,ReleaseStampResult} from './ReleaseStamp';
import {matchingChapterBrowse,type ChapterBrowseReturn,type ChapterSelection} from '@/lib/studio/chapter-browse';
import {useChapterCatalogue} from './useChapterCatalogue';

export function PublishedChapters({onPlay,userId,collection='studio',presentation='chapters',initial=[],themeId,initialCompanions=[],browseReturn}:{onPlay:ChapterSelection;userId?:string;collection?:'studio'|'releases';presentation?:'chapters'|'album';initial?:PublishedChapter[];themeId?:string;initialCompanions?:PublishedChapter[];browseReturn?:ChapterBrowseReturn}){
 const isAlbum=collection==='releases'&&presentation==='album',source=themeId?'world':isAlbum?'album':collection==='releases'?'archive':'studio';
 const restore=matchingChapterBrowse(browseReturn,source,userId,collection,themeId),titleId=useId(),listRef=useRef<HTMLElement>(null);
 const {chapters,companions,next,hasPage,loading,offline,error,retry,more}=useChapterCatalogue({initial,initialCompanions,collection,themeId,restore});
 const cards=useChapterCards(userId,chapters);
 useEffect(()=>{
  if(!restore)return;
  const frame=requestAnimationFrame(()=>{const card=Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[data-browse-chapter]')??[]).find(el=>el.dataset['browseChapter']===restore.selectedId);if(card){card.focus({preventScroll:true});card.scrollIntoView({block:'nearest',behavior:'instant'});}});
  return ()=>cancelAnimationFrame(frame);
 },[]);
 const pairs=collection==='releases'?releasePairs([...chapters,...companions]):[],groupedIds=new Set(themeId?[]:pairs.flatMap(pair=>pair.chapters.map(c=>c.id)));
 const renderCard=(c:PublishedChapter,afterSelect?:()=>void)=>{const progress=cards.values[c.id],copy=chapterCardCopy(progress,cards.status,c.spec);return <button className="published-chapter-card" data-browse-chapter={c.id} disabled={cards.status==='offline'&&cards.available[c.id]===false} key={c.id} onClick={()=>{const pair=pairs.find(pair=>pair.chapters.some(chapter=>chapter.id===c.id));afterSelect?.();onPlay(c,progress?.complete===true,pair,{source,ownerId:userId,collection,themeId,chapters,companions,nextOffset:next,hasPage,selectedId:c.id,selectedDate:isAlbum?pair?.date:undefined});}}><WorldArt themeId={c.spec.themeId} className="theme-art" crop/><div><span>{findTheme(c.spec.themeId).title}<i>{collection==='releases'?new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'short',timeZone:'UTC'}).format(c.publishedAt):'YENİ KEŞİF'}</i></span><h3>{c.spec.title}</h3><p>{c.spec.words.length} kelime · {c.spec.difficulty} · {c.spec.size} × {c.spec.size}</p><ChapterProgressBadge progress={progress} status={cards.status} spec={c.spec}/><ChapterAvailability ready={cards.available[c.id]} offline={cards.status==='offline'}/><b>{cards.status==='offline'&&cards.available[c.id]===false?'Bağlantı bekleniyor':copy.action}<ArrowRight size={16}/></b></div></button>;};
 if(!chapters.length&&!loading&&!error){if(offline)return <p className="published-catalogue-note"><WifiOff size={15}/>Arşiv bu cihaza henüz indirilmemiş. Bağlantı geldiğinde yeniden yüklenecek.</p>;return collection==='studio'?null:<p className="published-catalogue-note">Arşivin ilk bölümleri hazırlanıyor. Ana sayfadaki dünyaları keşfedebilirsin.</p>;}
 if(!chapters.length&&loading)return <p className="published-catalogue-loading" role="status"><LoaderCircle className="spin" size={15}/>Yeni keşiflere bakılıyor…</p>;
 return <section className="published-chapters" ref={listRef} aria-labelledby={titleId}><div className="section-title"><div><span className="eyebrow">YOLCULUĞUNA YENİ BİR SAYFA</span><h2 id={titleId}>{themeId?'Bu dünyaya eklenen bölümler':isAlbum?'Keşif damgaların':collection==='releases'?'Bütün yeni keşifler':'Yeni keşifler.'}</h2><p>{themeId?'Yeni bölümler dünyana eklenir. Eski keşiflerin burada kalır.':isAlbum?'İki keşif, bir hatıra. Geçmiş tarihleri de istediğin zaman tamamla.':collection==='releases'?'Her tarihin iki keşfi ve kalıcı damgan burada.':'Yeni kelimeler, başka küçük hikâyeler.'}</p></div><Sparkles size={24}/></div>{offline&&<p className="published-catalogue-note"><WifiOff size={15}/>Çevrimdışı · Daha önce açtığın bölümler cihazında bulunabilir.</p>}{error&&<div className="error-box" role="status">{error}<button className="text-button" onClick={retry}>Yeniden dene</button></div>}{isAlbum?<ReleaseAlbum pairs={pairs} values={cards.values} status={cards.status} renderCard={renderCard} initialSelectedDate={restore?.selectedDate}/>:<>{(themeId?[]:pairs).map(pair=><section className="release-archive-group" key={pair.date} aria-label={releaseDateLabel(pair.date)}><h3>{releaseDateLabel(pair.date)}</h3><div className="published-chapter-grid">{pair.chapters.map(c=>renderCard(c))}</div><ReleaseStamp pair={pair} values={cards.values} status={cards.status} compact/></section>)}{chapters.some(c=>!groupedIds.has(c.id))&&<div className="published-chapter-grid">{chapters.filter(c=>!groupedIds.has(c.id)).map(c=>renderCard(c))}</div>}</>}{cards.status==='error'&&<p className="chapter-progress-notice" role="status">İlerleme durumu yenilenemedi.<button className="text-button" onClick={cards.retry}>Yeniden kontrol et</button></p>}{next!==null&&<button className="button secondary" disabled={loading||offline} onClick={more}>{loading?<LoaderCircle className="spin" size={17}/>:<ArrowRight size={17}/>}{isAlbum?'Önceki hatıraları yükle':'Daha fazla keşif'}</button>}</section>;
}

export function PublishedPlay({chapter:summary,userId,initialPractice=false,pair,onRelated,progress,onProgress,onBack}:{chapter:PublishedChapter;userId?:string;initialPractice?:boolean;pair?:ReleasePair;onRelated?:(chapter:PublishedChapter,pair:ReleasePair)=>void;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;onBack:()=>void}){
 const runPair=playableReleasePair(summary,pair),related=runPair?.chapters.filter(c=>c.id!==summary.id)??[],cards=useChapterCards(userId,related);
 const [loaded,setLoaded]=useState<{chapter:PlayableChapter;save:SavedLevel;queue:ChapterSaveQueue;owner?:string;resume?:SavedLevel;personalBestKnown:boolean}|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[sync,setSync]=useState<ChapterSaveStatus>('local');
 const [run,setRun]=useState(0),[practice,setPractice]=useState(initialPractice),[retry,setRetry]=useState(0);
 const channel=useRef<ChapterSaveQueue|null>(null),generation=useRef(0),flushRef=useRef<()=>void>(()=>{});
 useEffect(()=>{
  const currentGeneration=++generation.current;
  channel.current?.cancel();channel.current=null;
  setLoaded(null);setLoading(true);setError('');setSync('local');setPractice(initialPractice);
  const c=new AbortController(),timeout=setTimeout(()=>c.abort(),8000);
  let queue:ChapterSaveQueue|null=null;
  const current=()=>generation.current===currentGeneration;
  const open=(chapter:PlayableChapter,save:SavedLevel,pending:boolean,status:ChapterSaveStatus,personalBestKnown=false)=>{
   if(!current())return;
   const owner=userId,key=saveKey(owner);
   queue=new ChapterSaveQueue({board:chapter.board,save,pending,
    canSend:()=>!!owner&&navigator.onLine,
    send:async(snapshot,signal)=>{
     const response=await memberFetch('/api/chapters',{method:'PUT',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:chapter.id,save:snapshot,expectedOwnerId:owner}),signal,keepalive:true});
     if(!response.ok)throw new Error('Kayıt eşitlenemedi.');
     return (await response.json() as {save:SavedLevel}).save;
    },
    persist:incoming=>{
     // A detached request must not overwrite a newer run or another tab's best save.
     let merged=incoming;
     try{const values=dictionary<SavedLevel>(key);merged=mergeChapterSave(values[chapter.id],incoming,chapter.board);
      values[chapter.id]=merged;localStorage.setItem(key,JSON.stringify(values));return {save:merged,ok:true};}
     catch{return {save:merged,ok:false};}
    },
    onStatus:value=>{if(current())setSync(value);},
    onConfirmed:resume=>{if(current())setLoaded(existing=>existing?.queue===queue?{...existing,resume}:existing);}
   });
   channel.current=queue;setSync(status);setLoaded({chapter,save,queue,owner,personalBestKnown});setLoading(false);
  };
  const start=async()=>{
   let chapter:PlayableChapter|null=null;
   const deviceSave=(value:PlayableChapter)=>{try{return cleanSave(dictionary<SavedLevel>(saveKey(userId))[value.id],value.board);}
    catch{return cleanSave(undefined,value.board);}};
   try{
    try{chapter=matchingCachedChapter(dictionary<PlayableChapter>(BOARD_KEY)[summary.id],summary);}catch{}
    if(chapter){
     open(chapter,deviceSave(chapter),true,navigator.onLine?'local':'offline');
     void queue?.flush();
     return;
    }
    if(navigator.onLine){
     const response=await fetch('/api/chapters?id='+encodeURIComponent(summary.id),{cache:'no-store',signal:c.signal});
     if(!response.ok)throw new Error('Bu keşfe şu an ulaşılamıyor.');
     const candidate=cachedChapter(await response.json());
     if(!candidate||candidate.id!==summary.id)throw new Error('Bölüm kaydı doğrulanamadı.');
     chapter=candidate;rememberChapter(chapter);
    }
    if(!chapter)throw new Error('Bu bölüm henüz bu cihaza indirilmemiş. Bir kez internete bağlanarak açabilirsin.');
    let save=deviceSave(chapter),pending=true,personalBestKnown=false;
    let status:ChapterSaveStatus=navigator.onLine?'local':'offline';
    if(userId&&navigator.onLine){
     try{
      const response=await memberFetch('/api/chapters?action=progress&id='+encodeURIComponent(chapter.id)+'&expectedOwnerId='+encodeURIComponent(userId),{cache:'no-store',signal:c.signal});
      if(response.ok){const cloud=await response.json() as {save:SavedLevel},result=chapterSyncResult(save,cloud.save,chapter.board);
       save=result.save;pending=result.pending;personalBestKnown=true;status=pending?'local':'saved';}
     }catch{status='offline';}
    }
    open(chapter,save,pending,status,personalBestKnown);
   }catch(e){
    if(chapter)open(chapter,deviceSave(chapter),true,'offline');
    else if(current()){setError((e as Error).name==='AbortError'?'Bölüm zamanında yüklenemedi. Bağlantını kontrol edip yeniden dene.':(e as Error).message||'Bölüm açılamadı.');setLoading(false);}
   }finally{clearTimeout(timeout);}
  };
  void start();
  return ()=>{generation.current++;clearTimeout(timeout);c.abort();queue?.detach();};
 },[summary.id,userId,retry,initialPractice]);
 flushRef.current=()=>{void channel.current?.flush();};
 useEffect(()=>{
  const online=()=>flushRef.current(),timer=setInterval(()=>flushRef.current(),5000);
  const hide=()=>{if(document.hidden)flushRef.current();};
  window.addEventListener('online',online);document.addEventListener('visibilitychange',hide);
  return ()=>{clearInterval(timer);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',hide);};
 },[]);
 const saveMessage=sync==='syncing'?'İlerlemen eşitleniyor…':sync==='saved'?'Hesabında kayıtlı':sync==='storage-error'?'Cihaz kaydı kullanılamıyor. Çıkmadan önce bağlantını kontrol et.':sync==='offline'?'Cihazında kayıtlı, bağlantıda yeniden denenecek':'Bu cihazda kayıtlı';
 const back=()=>{flushRef.current();onBack();};
 const opening=loading||!!loaded&&(loaded.owner!==userId||loaded.chapter.id!==summary.id);
 if(opening||!loaded)return <section className="published-play-loading"><button className="text-button" onClick={onBack}>Keşiflere dön</button>{opening?<p role="status"><LoaderCircle className="spin" size={24}/>Bölümün ve kayıtların hazırlanıyor…</p>:<><p className="error-box" role="alert">{error}</p><button className="button primary" onClick={()=>setRetry(n=>n+1)}><RefreshCw size={17}/>Yeniden dene</button></>}</section>;
 return <><div className={'published-save-status'+(sync==='storage-error'?' failed':'')} role="status">{sync==='storage-error'?<TriangleAlert size={14}/>:sync==='saved'?<Cloud size={14}/>:sync==='offline'?<CloudOff size={14}/>:sync==='syncing'?<LoaderCircle size={14} className="spin"/>:<Check size={14}/>} {saveMessage}{loaded.chapter.archived&&<span>Arşiv bölümü</span>}</div><Solo key={summary.id+':'+run} config={{themeId:loaded.chapter.spec.themeId,level:0,practice}} progress={progress} onProgress={onProgress} onBack={back} onMap={back} onNext={()=>{setLoaded(current=>current?{...current,save:current.queue.save,resume:undefined,personalBestKnown:current.queue.acknowledged}:current);setPractice(true);setRun(n=>n+1);}} external={{board:loaded.chapter.board,save:loaded.save,resume:loaded.resume,personalBestKnown:loaded.personalBestKnown,title:loaded.chapter.spec.title,note:loaded.chapter.spec.note,result:save=>{const result=releaseRunResult(runPair,loaded.chapter,save,cards.values,cards.status);return result?<ReleaseStampResult result={result} status={cards.status} saveMessage={saveMessage} saveError={sync==='storage-error'} onRetry={cards.retry} onNext={result.next&&onRelated&&runPair?()=>{flushRef.current();onRelated(result.next!,runPair);}:undefined}/>:null;},onSave:save=>{if(channel.current!==loaded.queue)return;loaded.queue.update(save);if(save.complete)queueMicrotask(()=>void loaded.queue.flush());}}}/></>;
}
