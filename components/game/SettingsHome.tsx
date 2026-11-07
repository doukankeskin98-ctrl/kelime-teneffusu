'use client';
import type {RefObject} from 'react';
import {ChevronRight,House,Mail} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import type {Comfort} from '@/lib/game/comfort';
import {version} from '../../package.json';
import {GameSettings} from './GameSettings';
export function SettingsHome({progress,onProgress,comfort,onComfort,onHome,onSupport,onMore,onHelp,onPrivacy,supportRef}:{progress:Progress;onProgress:(p:Progress)=>void;comfort:Comfort;onComfort:(c:Comfort)=>void;onHome:()=>void;onSupport:()=>void;onMore:()=>void;onHelp:()=>void;onPrivacy:()=>void;supportRef:RefObject<HTMLButtonElement|null>}){
 return <div className="settings-home-content">
  <GameSettings compact progress={progress} onProgress={onProgress} comfort={comfort} onComfort={onComfort}/>
  <div className="settings-main-actions"><button className="button primary" onClick={onHome}><House aria-hidden="true"/>Yolculuğa dön</button><button className="button secondary" ref={supportRef} onClick={onSupport}><Mail aria-hidden="true"/>Destek</button></div>
  <div className="settings-links"><button onClick={onMore}>Diğer ayarlar<ChevronRight size={18} aria-hidden="true"/></button><button onClick={onHelp}>Nasıl oynanır?<ChevronRight size={18} aria-hidden="true"/></button><button onClick={onPrivacy}>Gizlilik ve hesap<ChevronRight size={18} aria-hidden="true"/></button></div>
  <small className="settings-version">Kelime Teneffüsü · {version}</small>
 </div>;
}
