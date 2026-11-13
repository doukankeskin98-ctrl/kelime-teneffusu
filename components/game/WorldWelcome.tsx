'use client';
import {playableJourney} from '@/lib/game/journey-revisions';
import type {Progress} from '@/lib/game/progress';
import {ArrowRight,Compass} from 'lucide-react';
import {expeditionForChapter,expeditionTheme} from '@/lib/game/discovery';
import {mainChapter} from '@/lib/game/main-journey';
import {chapterPace} from '@/lib/game/journey-flow';
import {worldChapter} from '@/lib/game/world-presentation';
import {SceneArt} from './SceneArt';
import type {SoloConfig} from './Solo';
export function WorldWelcome({config,progress={saves:{}},onPlay,onBack}:{config:SoloConfig;progress?:Pick<Progress,'saves'>;onPlay:()=>void;onBack:()=>void}){
 const chapter=playableJourney(config.journey??'',progress),world=expeditionForChapter(config.journey)!;return <section className="world-welcome" aria-labelledby="welcome-title"><div className="world-welcome-art"><SceneArt theme={expeditionTheme(world)} worldId={world.id} eager/><div/></div><div className="world-welcome-copy"><Compass size={36} aria-hidden="true"/><h1 id="welcome-title">{world.title}</h1><p>Yeni bir dünya seni bekliyor.</p></div><div className="world-welcome-dock"><h2>{worldChapter(config.journey,chapter?.revision)?.topic}</h2><p>{chapterPace(config.journey!,chapter?.revision)?.detail}</p><button autoFocus className="stage-play" onClick={onPlay}><span>Oyna<small>Bölüm {mainChapter(config.journey)?.number}</small></span><ArrowRight/></button><button className="text-button" onClick={onBack}>Yolculuğa dön</button></div></section>;
}
