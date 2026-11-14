'use client';
import {useState} from 'react';
import {chapterPace} from '@/lib/game/journey-flow';
import {Check,ChevronLeft,ChevronRight,Lock,Play,Star} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import {EXPEDITIONS,expeditionTheme} from '@/lib/game/discovery';
import {mainJourneyChapters,mainJourneyState} from '@/lib/game/main-journey';
import {worldChapter} from '@/lib/game/world-presentation';
import type {SoloConfig} from './Solo';
import {SceneArt} from './SceneArt';
import {Modal} from './common';

export function ChapterPicker({progress,onPlay,onClose,worldId,onAlbums}:{progress:Progress;onPlay:(config:SoloConfig)=>void;onClose:()=>void;worldId?:string;onAlbums?:()=>void}){
 const chapters=mainJourneyChapters(progress),state=mainJourneyState(progress);
 const currentWorld=chapters.find(c=>c.chapter.id===state.current?.chapter.id)?.world.expedition.id??EXPEDITIONS.at(-1)!.id;
 const currentIndex=EXPEDITIONS.findIndex(w=>w.id===currentWorld);
 const [selected,setSelected]=useState<string|null>(worldId??null),[showAll,setShowAll]=useState(false);
 const world=selected?EXPEDITIONS.find(w=>w.id===selected):undefined;
 const items=world?chapters.filter(c=>c.world.expedition.id===world.id):[];
 const status=items[0]?.world;
 const nearby=EXPEDITIONS.slice(Math.max(0,currentIndex-1),Math.min(EXPEDITIONS.length,currentIndex+2));
 const worlds=showAll?EXPEDITIONS:nearby;
 const play=(item:typeof chapters[number])=>{if(!item.unlocked)return;onClose();onPlay({themeId:item.chapter.themeId,level:0,journey:item.chapter.id,campaign:true,...(item.complete?{practice:true}:{})});};
 const next=items.find(item=>item.number===state.current?.number)??items.find(item=>item.unlocked&&!item.complete);
 return <Modal title={world?.title??'Yolculuğum'} className="chapter-picker game-library-sheet game-tools-modal journey-map" onClose={onClose} focusTitleOnChange><div className="journey-map-body">
  {world&&status?<>
   <button className="text-button journey-map-back" onClick={()=>setSelected(null)}><ChevronLeft size={18}/>Dünyalar</button>
   <section className={'chapter-picker-world'+(!status.unlocked?' is-locked':'')}>
    <div className="chapter-world-cover"><SceneArt theme={expeditionTheme(world)} worldId={world.id}/><div><span>Dünya {EXPEDITIONS.indexOf(world)+1} · {status.pieces}/6 tamamlandı</span></div></div>
    {!status.unlocked&&<p className="chapter-lock-note"><Lock size={15}/>{status.previousTitle}: {status.remaining} bölüm daha tamamla.</p>}
    <div className="chapter-picker-grid">{items.map(item=><button key={item.chapter.id} disabled={!item.unlocked} onClick={()=>play(item)} className={(item.complete?'is-complete ':'')+(item.number===state.current?.number?'is-current':'')} aria-label={`Bölüm ${item.number}: ${worldChapter(item.chapter.id,item.chapter.revision)?.topic??item.chapter.title} · ${item.complete?'Tekrar oyna':item.continuing?'Devam et':item.unlocked?'Oyna':'Kilitli'}`}>
     <span>{item.complete?<Check size={15}/>:!item.unlocked?<Lock size={15}/>:<Play size={15}/>}<b>{item.number}</b></span><em>{worldChapter(item.chapter.id,item.chapter.revision)?.topic??item.chapter.title}</em><small>{item.complete?<span aria-label={`${item.stars} yıldız`}>{[0,1,2].map(i=><Star key={i} size={11} fill={i<item.stars?'currentColor':'none'}/>)}</span>:item.continuing?'Devam et':chapterPace(item.chapter.id,item.chapter.revision)?.kind==='challenge'?'Saklı kelime':item.chapter.clues?'Bilmece':`${item.chapter.words.length} kelime`}</small>
    </button>)}</div>
    {next&&<button className="button primary full journey-map-play" onClick={()=>play(next)}><Play size={18}/>Bölüm {next.number} · {next.continuing?'Devam et':'Oyna'}<ChevronRight size={20}/></button>}
   </section>
  </>:<>
   <div className="journey-map-heading"><h3>{showAll?'Bütün dünyalar':'Yakın dünyalar'}</h3><span>{state.completed}/{state.total} bölüm</span></div>
   <div className="journey-map-worlds">{worlds.map(w=>{
    const group=chapters.filter(c=>c.world.expedition.id===w.id),s=group[0]!.world,current=w.id===currentWorld;
    return <button key={w.id} className={'journey-map-world'+(current?' is-current':'')+(!s.unlocked?' is-locked':'')} onClick={()=>setSelected(w.id)} aria-label={`Dünya ${EXPEDITIONS.indexOf(w)+1}: ${w.title} · ${s.complete?'Tamamlandı':s.unlocked?`${s.pieces}/6 bölüm`:'Kilitli'}`}>
     <SceneArt worldId={w.id} theme={expeditionTheme(w)}/><div className="journey-map-world-copy"><span>Dünya {EXPEDITIONS.indexOf(w)+1}{!s.unlocked&&<Lock size={15}/>}</span><strong>{w.title}</strong><small>{s.complete?'Tamamlandı · 6/6':current?`Kaldığın yer · ${s.pieces}/6 bölüm`:s.unlocked?`${s.pieces}/6 bölüm`:'Henüz açılmadı'}</small>
     {current&&<div className="journey-map-dots" aria-hidden="true">{group.map((c,i)=><span key={c.chapter.id} className={c.number===state.current?.number?'now':''}>{c.complete?<Check size={16}/>:!c.unlocked?<Lock size={13}/>:i+1}</span>)}</div>}
     </div><ChevronRight className="journey-map-chevron" size={22}/>
    </button>;
   })}</div>
   <button className="button secondary full journey-map-all" onClick={()=>setShowAll(!showAll)}>{showAll?'Yakın dünyalara dön':`${EXPEDITIONS.length} dünyayı gör`}<ChevronRight size={18}/></button>
   {onAlbums&&<button className="text-button full journey-albums-link" onClick={onAlbums}>Albümlerim</button>}
  </>}
 </div></Modal>;
}
