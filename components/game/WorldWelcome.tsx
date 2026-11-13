'use client';
import {ArrowRight,Compass} from 'lucide-react';
import {expeditionForChapter,expeditionTheme} from '@/lib/game/discovery';
import {mainChapter} from '@/lib/game/main-journey';
import {chapterPace} from '@/lib/game/journey-flow';
import {worldChapter} from '@/lib/game/world-presentation';
import {SceneArt} from './SceneArt';
import type {SoloConfig} from './Solo';
export function WorldWelcome({config,onPlay,onBack}:{config:SoloConfig;onPlay:()=>void;onBack:()=>void}){
 const world=expeditionForChapter(config.journey)!;return <section className="world-welcome" aria-labelledby="welcome-title"><div className="world-welcome-art"><SceneArt theme={expeditionTheme(world)} worldId={world.id} eager/><div/></div><div className="world-welcome-copy"><Compass size={36} aria-hidden="true"/><h1 id="welcome-title">{world.title}</h1><p>Yeni bir dünya seni bekliyor.</p></div><div className="world-welcome-dock"><h2>{worldChapter(config.journey)?.topic}</h2><p>{chapterPace(config.journey!)?.detail}</p><button autoFocus className="stage-play" onClick={onPlay}><span>Oyna<small>Bölüm {mainChapter(config.journey)?.number}</small></span><ArrowRight/></button><button className="text-button" onClick={onBack}>Yolculuğa dön</button></div></section>;
}
