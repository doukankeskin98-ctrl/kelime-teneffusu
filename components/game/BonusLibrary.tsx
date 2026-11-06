'use client';
import {ArrowRight,Lock,Timer} from 'lucide-react';
import {discoveryState,expeditionTheme} from '@/lib/game/discovery';
import {BONUS_WORDS} from '@/lib/game/journey-bonus';
import type {Progress} from '@/lib/game/progress';
import type {SoloConfig} from './Solo';
export function BonusLibrary({progress,onPlay}:{progress:Progress;onPlay:(config:SoloConfig)=>void}){
 const states=discoveryState(progress),available=states.filter(s=>s.complete),next=states.find(s=>!s.complete);
 return <div className="bonus-library"><p>Bir kelimeyi farklı yerlerde bul. Her bonus 60 saniye; ara verdiğinde süre durur.</p><div className="event-menu">{available.map(({expedition:w})=>{const saved=progress.bonuses?.[w.id];return <button key={w.id} onClick={()=>onPlay({themeId:expeditionTheme(w),level:0,bonusWorld:w.id})}><Timer/><span><b>{BONUS_WORDS[w.id]}</b><small>{w.title}{saved?` · ${saved.finished?'En iyi: '+saved.best:saved.elapsed>0?'Kaldığın yerden':'Hazır'}`:''}</small></span><ArrowRight/></button>;})}</div>{next&&<div className="bonus-unlock-note"><Lock size={22}/><span><b>{next.expedition.title}</b><p>Bu dünyanın altı bölümünü tamamla, bonusu aç. {next.pieces}/6 tamamlandı.</p></span></div>}</div>;
}
