'use client';
import {horizonRouteForChapter} from '@/lib/game/horizons-content';
import {discoveriesRouteForChapter} from '@/lib/game/discoveries-content';
import {LIVING_STORIES} from '@/lib/game/story-content';
import {everydayRouteForChapter} from '@/lib/game/everyday-content';
import {natureRouteForChapter} from '@/lib/game/nature-content';
import {ArrowRight,Gamepad2,Map,Play,Star} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import {mainJourneyChapters,mainJourneyState} from '@/lib/game/main-journey';
import {worldChapter} from '@/lib/game/world-presentation';
import {journeyGoal} from '@/lib/game/achievement-view';
import {EXPEDITIONS,expeditionTheme,expeditionForChapter} from '@/lib/game/discovery';
import {coastRouteForChapter} from '@/lib/game/coast-content';
import type {SoloConfig} from './Solo';
import {SceneArt} from './SceneArt';

export function JourneyHome({progress,onPlay,onExplore,onDetails,onDaily,initialView='journey',onViewChange,lastStoryId}:{progress:Progress;onPlay:(config:SoloConfig)=>void;onExplore:()=>void;onDetails:()=>void;onDaily?:()=>void;initialView?:'stories'|'journey';onViewChange?:(view:'stories'|'journey')=>void;lastStoryId?:string}){

 const state=mainJourneyState(progress),current=state.current,goal=journeyGoal(progress,current?.chapter.id),chapters=mainJourneyChapters(progress);
 const unfinished=(id:string)=>!progress.saves['route:'+id]?.complete;
 const preferred=LIVING_STORIES.find(s=>s.id===lastStoryId&&unfinished(s.id))??LIVING_STORIES.find(s=>s.id===progress.last?.journey&&unfinished(s.id))??LIVING_STORIES.find(s=>progress.saves['route:'+s.id]&&unfinished(s.id));
 const story=initialView==='stories'?(preferred??LIVING_STORIES.find(s=>unfinished(s.id))):undefined;
 const storySave=story?progress.saves['route:'+story.id]:undefined;
 const playStory=()=>{if(story)onPlay({themeId:story.themeId,level:0,journey:story.id});};
 const world=goal?.state.expedition??EXPEDITIONS[0]!;
 const play=(item:typeof chapters[number])=>{if(!item.unlocked)return;onPlay({themeId:item.chapter.themeId,level:0,journey:item.chapter.id,campaign:true,...(item.complete?{practice:true}:{})});};
 return <section className="journey-stage" aria-labelledby="journey-home-title" data-light={(horizonRouteForChapter(current?.chapter.id)??discoveriesRouteForChapter(current?.chapter.id)??coastRouteForChapter(current?.chapter.id)??natureRouteForChapter(current?.chapter.id)??everydayRouteForChapter(current?.chapter.id))?.light??'default'}>
  <div className="journey-stage-art" aria-hidden="true"><SceneArt theme={expeditionTheme(world)} scene={story?.scene} worldId={world.id} eager/><div className="journey-stage-shade"/></div>
  <div className="journey-stage-top"><button className="stage-map-button" onClick={onDetails} aria-label="Bölümler ve albümler"><Map size={19}/><span>Bölümler</span></button></div>
  <div className="journey-stage-title"><span>{story?'HİKÂYELER':world.subtitle==='Doğa Günlüğü'?'DOĞA GÜNLÜĞÜ':world.subtitle.startsWith('Kıyı Günlüğü')?'KIYI GÜNLÜĞÜ':`DÜNYA ${world.place}`}</span><h1 id="journey-home-title">{story?.title??world.title}</h1></div>
  <div className="journey-stage-space" aria-hidden="true"><i/><i/><i/></div>
  <div className="journey-stage-dock">
   {story?<><div className="stage-chapter-copy"><span>Hikâye {LIVING_STORIES.indexOf(story)+1}/{LIVING_STORIES.length}</span><h2>{storySave&&!storySave.complete&&storySave.strokes.length?'Kaldığın yerden':'Yeni bir hikâye'}</h2><p>{storySave?.strokes.length??0}/{story.words.length} kelime</p></div><button className="stage-play" onClick={playStory}><Play size={22} fill="currentColor"/><span>{storySave?'Devam et':'Oyna'}</span><ArrowRight size={22}/></button><button className="stage-milestone" onClick={()=>onViewChange?.('journey')}>Bölüm yolculuğuna dön<ArrowRight size={16}/></button></>:current&&goal?<><div className="stage-chapter-copy"><h2>{worldChapter(current.chapter.id)?.topic??current.chapter.title}</h2><p>{current.chapter.words.length} kelime{current.chapter.clues?' · Bilmeceli':''}</p></div>
    <button className="stage-play" onClick={()=>play(chapters.find(c=>c.chapter.id===current.chapter.id)!)}><Play size={22} fill="currentColor"/><span>Bölüm {current.number}<small>{state.continuing?'Devam et':'Oyna'}</small></span><ArrowRight size={22}/></button>

   </>:<div className="stage-finale"><Star size={35}/><h2>Yolculuk tamam!</h2><p>{state.total} bölüm tamamlandı.</p><button className="stage-play" onClick={onDetails}>Bölümleri aç<ArrowRight/></button></div>}
   <div className="stage-shortcuts"><button onClick={onExplore}><Gamepad2 size={19}/><span>Diğer oyunlar</span><ArrowRight size={16}/></button></div>
  </div>
 </section>;
}
