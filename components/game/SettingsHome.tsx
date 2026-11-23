'use client';
import {BookOpen,LifeBuoy,ShieldCheck} from 'lucide-react';
import type {RefObject} from 'react';
import type {Progress} from '@/lib/game/progress';
import type {Comfort} from '@/lib/game/comfort';
import {Row,RowGroup} from '../ui/GameUI';
import {GameSettings} from './GameSettings';

export function SettingsHome({progress,onProgress,comfort,onComfort,onSupport,onHelp,onPrivacy,supportRef}:{progress:Progress;onProgress:(p:Progress)=>void;comfort:Comfort;onComfort:(c:Comfort)=>void;onSupport:()=>void;onHelp:()=>void;onPrivacy:()=>void;supportRef:RefObject<HTMLButtonElement|null>}){
 const settings={progress,onProgress,comfort,onComfort};
 return <>
  <RowGroup title="Oyun"><GameSettings {...settings} compact/><GameSettings {...settings} section="usage"/></RowGroup>
  <RowGroup title="Görünüm"><GameSettings {...settings} section="appearance"/></RowGroup>
  <RowGroup title="Yardım">
   <Row icon={<BookOpen/>} title="Nasıl oynanır?" onClick={onHelp}/>
   <Row buttonRef={supportRef} icon={<LifeBuoy/>} title="Destek" onClick={onSupport}/>
   <Row icon={<ShieldCheck/>} title="Gizlilik ve hesap" onClick={onPrivacy}/>
  </RowGroup>
 </>;
}
