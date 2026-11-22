'use client';
import type {RefObject} from 'react';
import {ChevronRight,House,SlidersHorizontal,BookOpen,LifeBuoy,ShieldCheck} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import type {Comfort} from '@/lib/game/comfort';
import {version} from '../../package.json';
import {GameSettings} from './GameSettings';
export function SettingsHome({progress,onProgress,comfort,onComfort,onHome,onSupport,onMore,onHelp,onPrivacy,supportRef}:{progress:Progress;onProgress:(p:Progress)=>void;comfort:Comfort;onComfort:(c:Comfort)=>void;onHome:()=>void;onSupport:()=>void;onMore:()=>void;onHelp:()=>void;onPrivacy:()=>void;supportRef:RefObject<HTMLButtonElement|null>}){
 return <div className="settings-home-content">
  <GameSettings compact progress={progress} onProgress={onProgress} comfort={comfort} onComfort={onComfort}/>
  <div className="settings-links">{[
   {label:'Diğer ayarlar',Icon:SlidersHorizontal,action:onMore},
   {label:'Nasıl oynanır?',Icon:BookOpen,action:onHelp},
   {label:'Destek',Icon:LifeBuoy,action:onSupport},
   {label:'Gizlilik ve hesap',Icon:ShieldCheck,action:onPrivacy},
  ].map(({label,Icon,action})=><button key={label} ref={action===onSupport?supportRef:undefined} onClick={action}>
   <Icon size={18} aria-hidden="true"/><span>{label}</span><ChevronRight size={18} aria-hidden="true"/>
  </button>)}</div>
  <div className="settings-main-actions"><button className="button primary" onClick={onHome}><House aria-hidden="true"/>Yolculuğa dön</button></div>
  <small className="settings-version">Kelime Teneffüsü · {version}</small>
 </div>;
}
