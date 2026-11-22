'use client';
import {GAME_TERMS} from '@/lib/game/glossary';
import {LIVING_STORIES} from '@/lib/game/story-content';
import {BookOpen,CalendarDays,Gamepad2,Swords} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import {mainJourneyChapters,mainJourneyState} from '@/lib/game/main-journey';
import {istanbulDay} from '@/lib/game/engine';
import {worldChapter} from '@/lib/game/world-presentation';
import {journeyGoal} from '@/lib/game/achievement-view';
import {EXPEDITIONS,expeditionTheme} from '@/lib/game/discovery';
import type {SoloConfig} from './Solo';
import {SceneArt} from './SceneArt';

export function JourneyHome({progress,onPlay,onExplore,onDetails,onDaily,onArena,onAlbums,initialView='journey',onViewChange,lastStoryId}:{progress:Progress;onPlay:(config:SoloConfig)=>void;onExplore:()=>void;onDetails:()=>void;onDaily?:()=>void;onArena:()=>void;onAlbums:()=>void;initialView?:'stories'|'journey';onViewChange?:(view:'stories'|'journey')=>void;lastStoryId?:string}){

 const state=mainJourneyState(progress),current=state.current,goal=journeyGoal(progress,current?.chapter.id),chapters=mainJourneyChapters(progress);
 const unfinished=(id:string)=>!progress.saves['route:'+id]?.complete;
 const preferred=LIVING_STORIES.find(s=>s.id===lastStoryId&&unfinished(s.id))??LIVING_STORIES.find(s=>s.id===progress.last?.journey&&unfinished(s.id))??LIVING_STORIES.find(s=>progress.saves['route:'+s.id]&&unfinished(s.id));
 const story=initialView==='stories'?(preferred??LIVING_STORIES.find(s=>unfinished(s.id))):undefined;
 const storySave=story?progress.saves['route:'+story.id]:undefined;
 const playStory=()=>{if(story)onPlay({themeId:story.themeId,level:0,journey:story.id});};
 const world=goal?.state.expedition??EXPEDITIONS[current?0:EXPEDITIONS.length-1]!;
 const play=(item:typeof chapters[number])=>{if(!item.unlocked)return;onPlay({themeId:item.chapter.themeId,level:0,journey:item.chapter.id,campaign:true,...(item.complete?{practice:true}:{})});};
 const earned=goal?.state.earned??Array.from({length:6},()=>!current);
 const pieces=earned.filter(Boolean).length;
 const shortcuts=[
  {label:'Günlük',name:'Günlük bulmaca',icon:CalendarDays,action:onDaily,fresh:!progress.days.includes(istanbulDay())},
  {label:'Albüm',name:'Albümlerim',icon:BookOpen,action:onAlbums},
  {label:'Arena',name:'Arena',icon:Swords,action:onArena},
  {label:GAME_TERMS.games,name:'Oyunlar',icon:Gamepad2,action:onExplore},
 ];
 return <section className="berrak-landing" aria-labelledby="journey-home-title">
  <div className="berrak-landscape" aria-hidden="true"><SceneArt theme={expeditionTheme(world)} scene={story?.scene} worldId={world.id} eager/></div>
  <div className="berrak-world"><span>{story?'Hikâyeler':`Dünya ${world.place}`}</span><h1 id="journey-home-title">{story?.title??world.title}</h1></div>
  <div className="berrak-places">
   <button type="button" className="berrak-orbit" onClick={onDetails} aria-label="Yolculuğum: bölümler ve albümler" aria-haspopup="dialog">
    <svg viewBox="0 0 156 156" aria-hidden="true">{earned.map((filled,i)=><circle key={i} cx="78" cy="78" r="71" pathLength="360" strokeDasharray="47 313" transform={`rotate(${i*60-84} 78 78)`} className={filled?'earned':''}/>)}</svg>
    <b>{pieces}/6</b><small>Bölüm</small>
   </button>
   {shortcuts.map(({label,name,icon:Icon,action,fresh})=><button type="button" key={label} className="berrak-shortcut" onClick={action} aria-label={name}>
    <span><Icon aria-hidden="true"/>{fresh&&<i aria-hidden="true"/>}</span><b>{label}</b>
   </button>)}
  </div>
  <div className="berrak-enter">
   {story?<><button className="stage-play" onClick={playStory}>{storySave?'Devam et':'Oyna'}</button><button className="berrak-story-return" onClick={()=>onViewChange?.('journey')}>Bölüm yolculuğuna dön</button></>
    :current&&goal?<button className="stage-play" aria-label={`Bölüm ${current.number} · ${worldChapter(current.chapter.id,current.chapter.revision)?.topic??current.chapter.title} · ${state.continuing?'Devam et':'Oyna'}`} onClick={()=>play(chapters.find(c=>c.chapter.id===current.chapter.id)!)}>
      {(current.chapter.revision??1)>1&&current.chapter.difficulty==='Ustalık'&&<small className="berrak-tag">Zor</small>}{current.chapter.clues&&<small className="berrak-tag">Bilmece</small>}Bölüm {current.number}
     </button>
    :<><p>{state.total} bölüm tamamlandı</p><button className="stage-play" onClick={onDetails}>Bölümleri aç</button></>}
  </div>
 </section>;
}
