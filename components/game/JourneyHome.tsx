'use client';
import {ArrowRight,BookOpen,Check,Compass,Gift} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import {MAIN_JOURNEY,mainJourneyState,nextMainMilestone} from '@/lib/game/main-journey';
import {journeyGoal} from '@/lib/game/achievement-view';
import type {SoloConfig} from './Solo';
import {PieceTrail} from './AchievementLoop';
import {WorldArt} from './WorldArt';

export function JourneyHome({progress,onPlay,onExplore}:{progress:Progress;onPlay:(config:SoloConfig)=>void;onExplore:()=>void}){
 const state=mainJourneyState(progress),current=state.current,goal=journeyGoal(progress,current?.chapter.id),milestone=nextMainMilestone(progress);
 const index=current?current.number-1:MAIN_JOURNEY.length-1,start=Math.max(0,Math.min(index-2,MAIN_JOURNEY.length-5)),nearby=MAIN_JOURNEY.slice(start,start+5);
 return <section className="journey-home page-enter" aria-labelledby="journey-home-title">
  <header className="journey-home-intro"><span>YOLCULUĞUN</span><p><b>{state.completed}</b> / {state.total} bölüm tamam</p></header>
  {current&&goal?<div className="journey-home-card">
   <div className="journey-world"><span><small>DÜNYA {goal.state.expedition.place}</small><b>{goal.state.expedition.title}</b></span><div aria-hidden="true"><WorldArt themeId={current.chapter.themeId}/></div></div>
   <h1 id="journey-home-title">Bölüm {current.number}</h1><p className="journey-chapter-name">{current.chapter.title}</p>
   <p className="journey-home-note">{state.continuing?'Kaydın hazır. Kaldığın kelimeden sürdür.':`${current.chapter.words.length} kelime · ${current.chapter.difficulty} · Kendi temponda`}</p>
   <button className="button primary full journey-play" onClick={()=>onPlay({themeId:current.chapter.themeId,level:0,journey:current.chapter.id,campaign:true})}>{state.continuing?'Devam et':`Bölüm ${current.number} — Oyna`}<ArrowRight size={20}/></button>
   <ol className="journey-mini-path" aria-label="Yolculuktaki yakın bölümler">{nearby.map(item=>{const complete=progress.saves['route:'+item.chapter.id]?.complete===true,active=item.number===current.number;return <li key={item.chapter.id} className={complete?'complete':active?'current':''} aria-current={active?'step':undefined}><span>{complete?<Check size={18}/>:item.number}</span><small>{complete?'Tamam':active?'Şimdi':`Bölüm ${item.number}`}</small></li>;})}</ol>
   <div className="journey-near-reward"><Gift size={21}/><div><small>BU BÖLÜMÜ TAMAMLA</small><b>{goal.piece}</b><p>Albüm parçası · {goal.state.album.title}</p></div></div>
   {milestone&&<p className="journey-milestone"><span aria-hidden="true">{milestone.kind==='world'?<Compass size={18}/>:<BookOpen size={18}/>}</span><span><b>{milestone.remaining} bölüm sonra</b> · {milestone.title}{milestone.kind==='world'?' dünyası açılır.':' albümü tamamlanır.'}</span></p>}
  </div>:<div className="journey-home-card journey-end"><Check size={38}/><h1 id="journey-home-title">Yolculuğu tamamladın.</h1><p>Mevcut {state.total} bölüm ve bütün albüm parçaları senin. Yeni bölüm varmış gibi aynı bulmacayı yeniden sunmuyoruz.</p><button className="button primary full" onClick={onExplore}>Bölümleri incele<ArrowRight size={19}/></button><p>Günlük ve Arena alt menüde seni bekliyor.</p></div>}
  {goal&&<div className="journey-home-album"><div><BookOpen size={18}/><b>{goal.state.album.title}</b><span>{goal.state.pieces}/6 parça</span></div><PieceTrail earned={goal.state.earned} current={goal.position}/></div>}
  <button className="text-button journey-library-link" onClick={onExplore}><Compass size={18}/>Dünyalar, hikâyeler ve bölüm arşivi<ArrowRight size={17}/></button>
 </section>;
}
