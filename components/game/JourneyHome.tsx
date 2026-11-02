'use client';
import {useEffect,useState} from 'react';
import {ArrowRight,BookOpen,Check,Compass,Gift,Lock,Map,Play,RotateCcw,Sparkles,Star} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import {MAIN_JOURNEY,mainJourneyChapters,mainJourneyState,nextMainMilestone} from '@/lib/game/main-journey';
import {worldChapter} from '@/lib/game/world-presentation';
import {journeyGoal} from '@/lib/game/achievement-view';
import type {SoloConfig} from './Solo';
import {PieceTrail} from './AchievementLoop';
import {SceneArt} from './SceneArt';
import {EXPEDITIONS} from '@/lib/game/discovery';
import {StoryShelf} from './StoryExperience';
import {RiddleShelf} from './RiddleShelf';
import {Modal} from './common';

export function JourneyHome({progress,onPlay,onExplore,initialView='journey',onViewChange}:{progress:Progress;onPlay:(config:SoloConfig)=>void;onExplore:()=>void;initialView?:'stories'|'journey';onViewChange?:(view:'stories'|'journey')=>void}){
 const [mapOpen,setMapOpen]=useState(false),[view,setLocalView]=useState<'stories'|'journey'>(initialView);
 useEffect(()=>setLocalView(initialView),[initialView]);
 const setView=(next:'stories'|'journey')=>{setLocalView(next);onViewChange?.(next);};
 const state=mainJourneyState(progress),current=state.current,goal=journeyGoal(progress,current?.chapter.id),milestone=nextMainMilestone(progress,current?.chapter.id),chapters=mainJourneyChapters(progress);
 const nearby=chapters.filter(item=>item.chapter.themeId===current?.chapter.themeId).sort((a,b)=>(worldChapter(a.chapter.id)?.position??0)-(worldChapter(b.chapter.id)?.position??0));
 const play=(item:typeof chapters[number])=>{if(!item.unlocked)return;setMapOpen(false);onPlay({themeId:item.chapter.themeId,level:0,journey:item.chapter.id,campaign:true,...(item.complete?{practice:true}:{})});};
 const worlds=[...new Set(chapters.map(c=>c.world.expedition.id))];
 return <section className="journey-home studio-journey scenic-home page-enter" aria-labelledby={view==='stories'?'story-home-title':'journey-home-title'}>
  <header className="journey-home-intro"><span><Sparkles size={14}/>KÜÇÜK BİR MOLA, BÜYÜK BİR KEŞİF</span><button className="journey-map-trigger" onClick={()=>setMapOpen(true)} aria-label="Bütün yolculuk bölümlerini aç"><Map size={17}/>{state.completed}/{state.total}</button></header>
  <div className="journey-view-switch" aria-label="Yolculuğunu seç"><button aria-pressed={view==='stories'} onClick={()=>setView('stories')}>Canlanan hikâyeler</button><button aria-pressed={view==='journey'} onClick={()=>setView('journey')}>Bölüm yolculuğu</button></div>

  <div hidden={view!=='stories'}><StoryShelf progress={progress} onPlay={onPlay} onJourney={()=>setView('journey')}/><button className="story-journey-link" onClick={()=>setView('journey')}><Compass size={21}/><span><b>96 bölümlük yolculuğun</b><small>{state.completed} bölüm tamam · Kaldığın yer burada</small></span><ArrowRight size={19}/></button></div>
  <div className="journey-classic-panel" hidden={view!=='journey'}>
  {current&&goal?<>
   <article className="voyage-hero">
    <SceneArt theme={current.chapter.themeId} eager/>
    <div className="voyage-veil"/>
    <div className="voyage-heading"><span className="voyage-kicker"><Compass size={14}/> DÜNYA {goal.state.expedition.place}</span><h1 id="journey-home-title">{goal.state.expedition.title}</h1><p>{goal.state.expedition.subtitle}</p></div>
    <div className="voyage-bottom"><div className="voyage-chapter"><span>{state.continuing?'KALDIĞIN YERDEN':'SIRADAKİ KEŞFİN'}</span><h2>{worldChapter(current.chapter.id)?.topic??current.chapter.title}</h2><p>{current.chapter.words.length} kelime · {current.chapter.difficulty} · Acele yok</p></div>
     <button className="button primary full voyage-play" onClick={()=>play(chapters[current.number-1]!)}><Play size={21} fill="currentColor"/><span>{state.continuing?'Devam et':'Oyna'} · {(worldChapter(current.chapter.id)?.position??0)+1}/6</span><ArrowRight size={21}/></button>
     <ol className="voyage-path" aria-label="Bu dünyanın altı durağı">{nearby.map((item,localIndex)=>{const active=item.number===current.number;return <li key={item.chapter.id} className={item.complete?'complete':active?'current':!item.unlocked?'locked':'available'} aria-current={active?'step':undefined}><button disabled={!item.unlocked} onClick={()=>play(item)} aria-label={`Bölüm ${item.number}: ${item.chapter.title} · ${item.complete?'Tekrar oyna':!item.unlocked?'Kilitli':item.continuing?'Devam et':'Oyna'}`}>{item.complete?<Check size={19}/>:!item.unlocked?<Lock size={15}/>:localIndex+1}</button><small>{active?'Buradasın':item.complete?'Tamam':localIndex===5?'Final':`${localIndex+1}. durak`}</small></li>;})}</ol>
    </div>
   </article>
   <div className="voyage-below"><button className="voyage-destination" onClick={()=>setMapOpen(true)}><div className="destination-art"><SceneArt theme={milestone?.kind==='world'?EXPEDITIONS.find(e=>e.title===milestone.title)?.id:current.chapter.themeId}/><span><Lock size={15}/></span></div><div><small>{milestone?`${milestone.remaining} KEŞİF SONRA`:'YOLCULUĞUN'}</small><b>{milestone?.title??'Yeni hatıralar'}</b><span>{milestone?.kind==='world'?'Yeni bir dünya seni bekliyor.':`${goal.state.pieces}/6 albüm parçası sende.`}</span></div><ArrowRight size={19}/></button>
   <div className="voyage-album"><div><BookOpen size={18}/><span>{goal.state.album.title}</span><b>{goal.state.pieces}/6</b></div><PieceTrail earned={goal.state.earned} current={goal.position}/><small className="voyage-next-piece">Sıradaki hatıran: {goal.piece}</small></div></div>
  </>:<article className="voyage-hero voyage-finale"><SceneArt theme="turkiye"/><div className="voyage-veil"/><div className="voyage-bottom"><h1 id="journey-home-title">Her dünyada<br/>bir izin var.</h1><p>{state.total} bölüm tamamlandı. Hatıraların burada.</p><button className="button primary full" onClick={()=>setMapOpen(true)}>Yolculuğumu aç<ArrowRight size={19}/></button></div></article>}
  <section className="world-gallery" aria-label="On altı keşif dünyası"><div><h2>Dünyaların</h2><button className="text-button" onClick={()=>setMapOpen(true)}>Tüm bölümler <ArrowRight size={16}/></button></div><div className="world-gallery-rail">{worlds.map(id=>{const items=chapters.filter(c=>c.chapter.themeId===id),w=items[0]!.world,target=items.find(i=>i.unlocked&&!i.complete)??items[0]!;return <button key={id} className={!w.unlocked?'is-locked':''} disabled={!w.unlocked} onClick={()=>play(target)} aria-label={`${w.expedition.title} · ${w.unlocked?w.pieces+'/6 parça':w.previousTitle+': '+w.remaining+' keşif sonra açılır'}`}><SceneArt theme={id}/><span>{w.complete?<Check size={16}/>:!w.unlocked?<Lock size={15}/>:<Compass size={16}/>} {w.pieces}/6</span><b>{w.expedition.title}</b></button>;})}</div></section>
  {!progress.tutorialDone&&<button className="journey-first-steps" onClick={()=>onPlay({themeId:'uzay',level:0,tutorial:true})}><span className="first-steps-icon"><Sparkles size={20}/></span><span><b>İlk keşfini birlikte yapalım</b><small>Üç kelimeyle çizerek seçmeyi öğren.</small></span><ArrowRight size={18}/></button>}
  <button className="journey-explore-card" onClick={onExplore}><span className="explore-card-icon"><Compass size={25}/></span><span><b>Canın başka bir keşif mi çekti?</b><small>Dünyalar, hızlı turlar ve günlük hikâyeler</small></span><ArrowRight size={20}/></button>
  <RiddleShelf progress={progress} onPlay={onPlay}/>
  </div>
  {mapOpen&&<Modal className="chapter-picker" title="Senin yolculuğun" onClose={()=>setMapOpen(false)}><p className="chapter-picker-intro">{state.completed} keşif tamamlandı. Bir bölüm seç, hikâyene devam et.</p>{worlds.map(worldId=>{const items=chapters.filter(c=>c.world.expedition.id===worldId),world=items[0]!.world;return <section className={'chapter-picker-world'+(!world.unlocked?' is-locked':'')} key={worldId}><header><span className="picker-world-art"><SceneArt theme={world.expedition.id}/><b>{world.expedition.place}</b></span><div><h3>{world.expedition.title}</h3><p>{world.unlocked?`${world.pieces}/6 albüm parçası`:`${world.previousTitle}: ${world.remaining} keşif sonra açılır`}</p></div>{world.complete?<Check size={19}/>:!world.unlocked?<Lock size={18}/>:<Compass size={20}/>}</header><div className="chapter-picker-grid">{items.map(item=><button key={item.chapter.id} disabled={!item.unlocked} onClick={()=>play(item)} className={(item.complete?'is-complete ':'')+(item.number===current?.number?'is-current':'')} aria-label={`Bölüm ${item.number}: ${item.chapter.title} · ${item.complete?'Tekrar oyna':item.unlocked?'Oyna':'Kilitli'}`}><span>{item.complete?<RotateCcw size={15}/>:!item.unlocked?<Lock size={15}/>:<Play size={14}/>}<b>{item.number}</b></span><em>{worldChapter(item.chapter.id)?.topic??item.chapter.title}</em><small>{item.complete?<span aria-label={`${item.stars} yıldız`}>{[0,1,2].map(i=><Star key={i} size={10} fill={i<item.stars?'currentColor':'none'}/>)}</span>:item.world.bonus.id===item.chapter.id?'Albüm finali':item.continuing?'Devam et':item.chapter.difficulty}</small></button>)}</div>{world.unlocked&&!world.bonusUnlocked&&<p className="chapter-bonus-note"><Gift size={14}/>Beş keşfi tamamla, albüm finalini aç.</p>}</section>})}</Modal>}
 </section>;
}
