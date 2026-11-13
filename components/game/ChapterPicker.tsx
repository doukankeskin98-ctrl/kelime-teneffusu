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
 const initial=worldId??chapters.find(c=>c.chapter.id===state.current?.chapter.id)?.world.expedition.id;
 const [selected,setSelected]=useState(initial??EXPEDITIONS[0]!.id);
 const index=Math.max(0,EXPEDITIONS.findIndex(w=>w.id===selected)),world=EXPEDITIONS[index]!;
 const items=chapters.filter(c=>c.world.expedition.id===world.id),status=items[0]!.world;
 const play=(item:typeof chapters[number])=>{if(!item.unlocked)return;onClose();onPlay({themeId:item.chapter.themeId,level:0,journey:item.chapter.id,campaign:true,...(item.complete?{practice:true}:{})});};
 return <Modal title="Bölümler" className="chapter-picker game-library-sheet game-tools-modal" onClose={onClose}>
  {onAlbums&&<button className="button secondary full journey-albums-link" onClick={onAlbums}>Albümlerim</button>}
  <div className="chapter-world-nav"><button className="icon-button" aria-label="Önceki dünya" disabled={index===0} onClick={()=>setSelected(EXPEDITIONS[index-1]!.id)}><ChevronLeft/></button><label><span>Dünya</span><select aria-label="Dünya seç" value={world.id} onChange={e=>setSelected(e.target.value)}>{EXPEDITIONS.map(w=><option key={w.id} value={w.id}>{w.place} · {w.title}</option>)}</select></label><button className="icon-button" aria-label="Sonraki dünya" disabled={index===EXPEDITIONS.length-1} onClick={()=>setSelected(EXPEDITIONS[index+1]!.id)}><ChevronRight/></button></div>
  <section className={'chapter-picker-world'+(!status.unlocked?' is-locked':'')}>
   <div className="chapter-world-cover"><SceneArt theme={expeditionTheme(world)} worldId={world.id}/><div><span>{status.pieces}/6 tamamlandı</span><h3>{world.title}</h3></div></div>
   {!status.unlocked&&<p className="chapter-lock-note"><Lock size={15}/>{status.previousTitle}: {status.remaining} bölüm daha tamamla.</p>}
   <div className="chapter-picker-grid">{items.map(item=><button key={item.chapter.id} disabled={!item.unlocked} onClick={()=>play(item)} className={(item.complete?'is-complete ':'')+(item.number===state.current?.number?'is-current':'')} aria-label={`Bölüm ${item.number}: ${worldChapter(item.chapter.id,item.chapter.revision)?.topic??item.chapter.title} · ${item.complete?'Tekrar oyna':item.continuing?'Devam et':item.unlocked?'Oyna':'Kilitli'}`}>
    <span>{item.complete?<Check size={15}/>:!item.unlocked?<Lock size={15}/>:<Play size={15}/>}<b>{item.number}</b></span><em>{worldChapter(item.chapter.id,item.chapter.revision)?.topic??item.chapter.title}</em><small>{item.complete?<span aria-label={`${item.stars} yıldız`}>{[0,1,2].map(i=><Star key={i} size={11} fill={i<item.stars?'currentColor':'none'}/>)}</span>:item.continuing?'Devam et':chapterPace(item.chapter.id,item.chapter.revision)?.kind==='challenge'?'Ustalık':item.chapter.clues?'Bilmece':`${item.chapter.words.length} kelime`}</small>
   </button>)}</div>
  </section>
 </Modal>;
}
