'use client';
import {LIVING_STORIES} from '@/lib/game/story-content';
import {ChapterPicker} from './ChapterPicker';
import {everydayRouteForChapter} from '@/lib/game/everyday-content';
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

export function JourneyHome({progress,onPlay,onExplore,onDaily,initialView='journey',onViewChange,lastStoryId}:{progress:Progress;onPlay:(config:SoloConfig)=>void;onExplore:()=>void;onDaily?:()=>void;initialView?:'stories'|'journey';onViewChange?:(view:'stories'|'journey')=>void;lastStoryId?:string}){
 const [panel,setPanel]=useState<'map'|'stories'|'events'|null>(null);

 const state=mainJourneyState(progress),current=state.current,goal=journeyGoal(progress,current?.chapter.id),milestone=nextMainMilestone(progress,current?.chapter.id),chapters=mainJourneyChapters(progress);
 const unfinished=(id:string)=>!progress.saves['route:'+id]?.complete;
 const preferred=LIVING_STORIES.find(s=>s.id===lastStoryId&&unfinished(s.id))??LIVING_STORIES.find(s=>s.id===progress.last?.journey&&unfinished(s.id))??LIVING_STORIES.find(s=>progress.saves['route:'+s.id]&&unfinished(s.id));
 const story=initialView==='stories'?(preferred??LIVING_STORIES.find(s=>unfinished(s.id))):undefined;
 const storySave=story?progress.saves['route:'+story.id]:undefined;
 const playStory=()=>{if(story)onPlay({themeId:story.themeId,level:0,journey:story.id});};
 const world=goal?.state.expedition??EXPEDITIONS[0]!,nearby=chapters.filter(item=>expeditionForChapter(item.chapter.id)?.id===world.id).sort((a,b)=>(worldChapter(a.chapter.id)?.position??0)-(worldChapter(b.chapter.id)?.position??0));
 const close=()=>setPanel(null);
 const play=(item:typeof chapters[number])=>{if(!item.unlocked)return;close();onPlay({themeId:item.chapter.themeId,level:0,journey:item.chapter.id,campaign:true,...(item.complete?{practice:true}:{})});};
 return <section className="journey-stage" aria-labelledby="journey-home-title" data-light={(coastRouteForChapter(current?.chapter.id)??natureRouteForChapter(current?.chapter.id)??everydayRouteForChapter(current?.chapter.id))?.light??'default'}>
  <div className="journey-stage-art" aria-hidden="true"><SceneArt theme={expeditionTheme(world)} scene={story?.scene} eager/><div className="journey-stage-shade"/></div>
  <div className="journey-stage-top"><span className="stage-wordmark">Kelime Teneffüsü</span><button className="stage-map-button" onClick={()=>setPanel('map')} aria-label="Bütün yolculuk bölümlerini aç"><Map size={19}/><span>{state.completed}/{state.total}</span></button></div>
  <div className="journey-stage-title"><span>{story?'HİKÂYELER':world.subtitle==='Doğa Günlüğü'?'DOĞA GÜNLÜĞÜ':world.subtitle.startsWith('Kıyı Günlüğü')?'KIYI GÜNLÜĞÜ':`DÜNYA ${world.place}`}</span><h1 id="journey-home-title">{story?.title??world.title}</h1></div>
  <div className="journey-stage-space" aria-hidden="true"><i/><i/><i/></div>
  <div className="journey-stage-dock">
   {story?<><div className="stage-chapter-copy"><span>Hikâye {LIVING_STORIES.indexOf(story)+1}/{LIVING_STORIES.length}</span><h2>{storySave&&!storySave.complete&&storySave.strokes.length?'Kaldığın yerden':'Yeni bir hikâye'}</h2><p>{storySave?.strokes.length??0}/{story.words.length} kelime</p></div><button className="stage-play" onClick={playStory}><Play size={22} fill="currentColor"/><span>{storySave?'Devam et':'Oyna'}</span><ArrowRight size={22}/></button><button className="stage-milestone" onClick={()=>onViewChange?.('journey')}>Bölüm yolculuğuna dön<ArrowRight size={16}/></button></>:current&&goal?<><div className="stage-chapter-copy"><span>{state.continuing?'Kaldığın yerden':`Bölüm ${current.number}`}</span><h2>{worldChapter(current.chapter.id)?.topic??current.chapter.title}</h2><p>{current.chapter.words.length} kelime{current.chapter.clues?' · Bilmeceli':''}</p></div>
    <button className="stage-play" onClick={()=>play(chapters.find(c=>c.chapter.id===current.chapter.id)!)}><Play size={22} fill="currentColor"/><span>{state.continuing?'Devam et':'Oyna'}<small>Bölüm {current.number}</small></span><ArrowRight size={22}/></button>
    <span className="stage-trail-caption">Bu dünyada · Durak {(worldChapter(current.chapter.id)?.position??0)+1}/{nearby.length}</span><ol className="stage-trail" aria-label="Bu dünyanın durakları">{nearby.map((item,i)=><li key={item.chapter.id} className={item.complete?'complete':item.number===current.number?'current':!item.unlocked?'locked':''}><button disabled={!item.unlocked} onClick={()=>play(item)} aria-current={item.number===current.number?'step':undefined} aria-label={`Durak ${i+1}/${nearby.length} · Bölüm ${item.number}: ${worldChapter(item.chapter.id)?.topic??item.chapter.title} · ${item.complete?'Tekrar oyna':!item.unlocked?'Kilitli':item.continuing?'Devam et':'Oyna'}`}>{item.complete?<Check size={17}/>:!item.unlocked?<Lock size={14}/>:i+1}</button></li>)}</ol>
    <button className="stage-milestone" onClick={()=>setPanel('map')}>{milestone?<><span>{milestone.remaining} bölüm sonra</span><b>{milestone.title}</b><ArrowRight size={14}/></>:<><BookOpen size={15}/><span>{goal.state.pieces}/6 parça</span><b>{goal.state.album.title}</b></>}</button>
   </>:<div className="stage-finale"><Star size={35}/><h2>Yolculuk tamam!</h2><p>{state.total} bölüm tamamlandı.</p><button className="stage-play" onClick={()=>setPanel('map')}>Bölümleri aç<ArrowRight/></button></div>}
   <div className="stage-shortcuts"><button onClick={()=>setPanel('events')} aria-haspopup="dialog"><CalendarDays size={19}/><span>Etkinlikler</span><ArrowRight size={16}/></button></div>
  </div>
  {panel==='events'&&<Modal className="game-library-sheet" title="Etkinlikler" onClose={close}><div className="event-menu">{onDaily&&<button onClick={()=>{close();onDaily();}}><CalendarDays/><span><b>Günlük bulmaca</b><small>Bugünün ortak tahtası</small></span><ArrowRight/></button>}<button onClick={()=>{setPanel('stories');onViewChange?.('stories');}}><BookOpen/><span><b>Hikâyeler</b><small>Kelimelerle ilerleyen beş hikâye</small></span><ArrowRight/></button><button onClick={()=>{close();onExplore();}}><Compass/><span><b>Oyun arşivi</b><small>Hızlı Tur, İpucu Avı ve diğer oyunlar</small></span><ArrowRight/></button></div></Modal>}
  {panel==='stories'&&<Modal className="game-library-sheet" title="Hikâyeler" onClose={close}><StoryCollection progress={progress} onPlay={config=>{setPanel(null);onPlay(config);}}/></Modal>}
  {panel==='map'&&<ChapterPicker progress={progress} onPlay={onPlay} onClose={close}/>}
 </section>;
}
