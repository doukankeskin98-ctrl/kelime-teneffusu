'use client';
import {natureRouteForChapter} from '@/lib/game/nature-content';
import {useEffect,useState} from 'react';
import {ArrowRight,BookOpen,CalendarDays,Check,Compass,Lock,Map,Play,Star} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import {mainJourneyChapters,mainJourneyState,nextMainMilestone} from '@/lib/game/main-journey';
import {worldChapter} from '@/lib/game/world-presentation';
import {journeyGoal} from '@/lib/game/achievement-view';
import {EXPEDITIONS,expeditionTheme,expeditionForChapter} from '@/lib/game/discovery';
import {coastRouteForChapter} from '@/lib/game/coast-content';
import type {SoloConfig} from './Solo';
import {SceneArt} from './SceneArt';
import {StoryCollection} from './StoryExperience';
import {Modal} from './common';

export function JourneyHome({progress,onPlay,onExplore,onDaily,initialView='journey',onViewChange}:{progress:Progress;onPlay:(config:SoloConfig)=>void;onExplore:()=>void;onDaily?:()=>void;initialView?:'stories'|'journey';onViewChange?:(view:'stories'|'journey')=>void}){
 const [panel,setPanel]=useState<'map'|'stories'|'events'|null>(initialView==='stories'?'stories':null);
 useEffect(()=>{if(initialView==='stories')setPanel('stories');},[initialView]);
 const state=mainJourneyState(progress),current=state.current,goal=journeyGoal(progress,current?.chapter.id),milestone=nextMainMilestone(progress,current?.chapter.id),chapters=mainJourneyChapters(progress);
 const world=goal?.state.expedition??EXPEDITIONS[0]!,nearby=chapters.filter(item=>expeditionForChapter(item.chapter.id)?.id===world.id).sort((a,b)=>(worldChapter(a.chapter.id)?.position??0)-(worldChapter(b.chapter.id)?.position??0));
 const close=()=>{setPanel(null);onViewChange?.('journey');};
 const play=(item:typeof chapters[number])=>{if(!item.unlocked)return;close();onPlay({themeId:item.chapter.themeId,level:0,journey:item.chapter.id,campaign:true,...(item.complete?{practice:true}:{})});};
 return <section className="journey-stage" aria-labelledby="journey-home-title" data-light={(coastRouteForChapter(current?.chapter.id)??natureRouteForChapter(current?.chapter.id))?.light??'default'}>
  <div className="journey-stage-art" aria-hidden="true"><SceneArt theme={expeditionTheme(world)} eager/><div className="journey-stage-shade"/></div>
  <div className="journey-stage-top"><span className="stage-wordmark">Kelime Teneffüsü</span><button className="stage-map-button" onClick={()=>setPanel('map')} aria-label="Bütün yolculuk bölümlerini aç"><Map size={19}/><span>{state.completed}/{state.total}</span></button></div>
  <div className="journey-stage-title"><span>{world.subtitle==='Doğa Günlüğü'?'DOĞA GÜNLÜĞÜ':world.subtitle.startsWith('Kıyı Günlüğü')?'KIYI GÜNLÜĞÜ':`DÜNYA ${world.place}`}</span><h1 id="journey-home-title">{world.title}</h1></div>
  <div className="journey-stage-space" aria-hidden="true"><i/><i/><i/></div>
  <div className="journey-stage-dock">
   {current&&goal?<><div className="stage-chapter-copy"><span>{state.continuing?'Kaldığın yerden':`Bölüm ${current.number}`}</span><h2>{worldChapter(current.chapter.id)?.topic??current.chapter.title}</h2><p>{current.chapter.words.length} kelime{current.chapter.clues?' · Bilmeceli':''}</p></div>
    <button className="stage-play" onClick={()=>play(chapters.find(c=>c.chapter.id===current.chapter.id)!)}><Play size={22} fill="currentColor"/><span>{state.continuing?'Devam et':'Oyna'}<small>Bölüm {current.number}</small></span><ArrowRight size={22}/></button>
    <ol className="stage-trail" aria-label="Bu rotanın altı bölümü">{nearby.map((item,i)=><li key={item.chapter.id} className={item.complete?'complete':item.number===current.number?'current':!item.unlocked?'locked':''}><button disabled={!item.unlocked} onClick={()=>play(item)} aria-current={item.number===current.number?'step':undefined} aria-label={`Bölüm ${item.number}: ${item.chapter.title} · ${item.complete?'Tekrar oyna':!item.unlocked?'Kilitli':item.continuing?'Devam et':'Oyna'}`}>{item.complete?<Check size={17}/>:!item.unlocked?<Lock size={14}/>:i+1}</button></li>)}</ol>
    <button className="stage-milestone" onClick={()=>setPanel('map')}>{milestone?<><span>{milestone.remaining} bölüm sonra</span><b>{milestone.title}</b><ArrowRight size={14}/></>:<><BookOpen size={15}/><span>{goal.state.pieces}/6 parça</span><b>{goal.state.album.title}</b></>}</button>
   </>:<div className="stage-finale"><Star size={35}/><h2>Yolculuk tamam!</h2><p>{state.total} bölüm tamamlandı.</p><button className="stage-play" onClick={()=>setPanel('map')}>Bölümleri aç<ArrowRight/></button></div>}
   <div className="stage-shortcuts"><button onClick={()=>setPanel('events')} aria-haspopup="dialog"><CalendarDays size={19}/><span>Etkinlikler</span><ArrowRight size={16}/></button></div>
  </div>
  {panel==='events'&&<Modal className="game-library-sheet" title="Etkinlikler" onClose={close}><div className="event-menu">{onDaily&&<button onClick={()=>{close();onDaily();}}><CalendarDays/><span><b>Günlük bulmaca</b><small>Bugünün ortak tahtası</small></span><ArrowRight/></button>}<button onClick={()=>{setPanel('stories');onViewChange?.('stories');}}><BookOpen/><span><b>Hikâyeler</b><small>Kelimelerle ilerleyen beş hikâye</small></span><ArrowRight/></button><button onClick={()=>{close();onExplore();}}><Compass/><span><b>Oyun arşivi</b><small>Hızlı Tur, İpucu Avı ve diğer oyunlar</small></span><ArrowRight/></button></div></Modal>}
  {panel==='stories'&&<Modal className="game-library-sheet" title="Hikâyeler" onClose={close}><StoryCollection progress={progress} onPlay={config=>{setPanel(null);onPlay(config);}}/></Modal>}
  {panel==='map'&&<Modal className="chapter-picker game-library-sheet" title="Bölümler" onClose={close}><p className="chapter-picker-intro">{state.completed}/{state.total} tamamlandı · Kaldığın bölüm: {current?.number??'Tamamlandı'}</p>{EXPEDITIONS.map(w=>{const items=chapters.filter(c=>c.world.expedition.id===w.id),status=items[0]!.world;return <section className={'chapter-picker-world'+(!status.unlocked?' is-locked':'')} key={w.id}><header><span className="picker-world-art"><SceneArt theme={expeditionTheme(w)}/><b>{w.place}</b></span><div><h3>{w.title}</h3><p>{status.unlocked?`${status.pieces}/6 parça`:`${status.previousTitle}: ${status.remaining} bölüm daha`}</p></div>{status.complete?<Check size={19}/>:!status.unlocked?<Lock size={18}/>:<Compass size={20}/>}</header><div className="chapter-picker-grid">{items.map(item=><button key={item.chapter.id} disabled={!item.unlocked} onClick={()=>play(item)} className={(item.complete?'is-complete ':'')+(item.number===current?.number?'is-current':'')} aria-label={`Bölüm ${item.number}: ${item.chapter.title} · ${item.complete?'Tekrar oyna':item.unlocked?'Oyna':'Kilitli'}`}><span>{item.complete?<Check size={15}/>:!item.unlocked?<Lock size={15}/>:<Play size={14}/>}<b>{item.number}</b></span><em>{worldChapter(item.chapter.id)?.topic??item.chapter.title}</em><small>{item.complete?<span aria-label={`${item.stars} yıldız`}>{[0,1,2].map(i=><Star key={i} size={10} fill={i<item.stars?'currentColor':'none'}/>)}</span>:item.continuing?'Devam et':item.chapter.clues?'Bilmece':item.chapter.difficulty}</small></button>)}</div></section>;})}</Modal>}
 </section>;
}
