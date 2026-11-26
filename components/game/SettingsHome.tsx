'use client';
import {useEffect,useRef,useState,useSyncExternalStore,type ReactNode} from 'react';
import {BookOpen,House,Play,ShieldCheck,Smartphone} from 'lucide-react';
import {version} from '../../package.json';
import type {Progress} from '@/lib/game/progress';
import type {Comfort} from '@/lib/game/comfort';
import {hapticsAvailable} from '@/lib/game/haptics';
import {Window,Button,Group,Section,Notice,Toggle,Row} from '../ui/GameUI';
import {AppearanceSettings,type PreferencePatch} from './GameSettings';
import {SoundSettings} from './SoundSettings';
import {DailyReminder} from './DailyReminder';
import {GameCenterAccess} from './GameCenterAccess';
import {GuideBook} from './GuideBook';
import type {SettingsEntry} from './PlayPreferences';

export type SettingsServices={
 progress:Progress;onChange:(patch:PreferencePatch)=>void;comfort:Comfort;onComfort:(value:Comfort)=>void;
 privacy:ReactNode;support:ReactNode;initialPrivacy?:boolean;installRef?:(node:HTMLDivElement|null)=>void;
};
const subscribeCapabilities=()=>()=>{};
const noHaptics=()=>false;
export function SettingsWindow({mode,onClose,onHome,onHelp,progress,onChange,comfort,onComfort,privacy,support,initialPrivacy,installRef}:SettingsServices&SettingsEntry){
 const [page,setPage]=useState<'settings'|'privacy'|'support'|'help'>(initialPrivacy?'privacy':'settings');
 const vibration=useSyncExternalStore(subscribeCapabilities,hapticsAvailable,noHaptics);
 const privacyRow=useRef<HTMLButtonElement>(null),privacyLink=useRef<HTMLButtonElement>(null);
 const supportLink=useRef<HTMLButtonElement>(null),helpRow=useRef<HTMLButtonElement>(null);
 const opener=useRef<typeof privacyRow|null>(null);
 const restoreFocus=useRef(false);
 useEffect(()=>{
  if(page==='settings'&&restoreFocus.current){restoreFocus.current=false;opener.current?.current?.focus({preventScroll:true});}
 },[page]);
 const openDetail=(next:typeof page,trigger:typeof privacyRow)=>{
  opener.current=trigger;
  setPage(next);
 };
 const back=()=>{restoreFocus.current=true;setPage('settings');};
 const home=()=>{onClose(false);onHome?.();};
 const finished=mode==='finished',race=mode==='race',inGame=mode!=='home';
 if(page==='help')return <GuideBook onClose={back}/>;
 const detail=page!=='settings';
 const footer=detail?<Button kind="secondary" onClick={back}>Ayarlara dön</Button>
  :finished?<Button kind="secondary" onClick={()=>onClose()}>Geri dön</Button>
  :inGame?<div className="kt-return-actions">
   <Button kind="play" onClick={()=>onClose()}><Play aria-hidden="true"/>{race?'Yarışa dön':'Oyuna dön'}</Button>
   <Button className="game-home-action" kind="secondary" aria-label="Ana ekran" onClick={home}><House aria-hidden="true"/><span>Ana ekran</span></Button>
  </div>:<>
   <Button kind="secondary" onClick={home}>Yolculuğa dön</Button>
   <div className="kt-foot-links"><button ref={privacyLink} type="button" aria-label="Gizlilik bilgileri" onClick={()=>openDetail('privacy',privacyLink)}>Gizlilik</button><button ref={supportLink} type="button" onClick={()=>openDetail('support',supportLink)}>Destek</button></div>
   <small className="kt-version">Kelime Teneffüsü · {version}</small>
  </>;
 return <Window title={page==='privacy'?'Gizlilik ve hesap':page==='support'?'Destek':'Ayarlar'}
  surface={detail?undefined:'settings'} context={mode} className={detail?'preferences-detail':'settings-window'}
  onClose={detail?back:()=>onClose()} footer={footer}>
  {page==='privacy'?privacy:page==='support'?support:<>
   {inGame&&<Notice running={race}>{finished?'Tamamladığın tahta':race?'Yarış süresi devam ediyor.':'Oyun duraklatıldı. İlerlemen kaydedildi.'}</Notice>}
   <Section title="Oyun"><Group>
    <SoundSettings compact showLevel enabled={progress.sound} onChange={sound=>onChange({sound})}/>
    {vibration&&<Toggle icon={<Smartphone/>} title="Titreşim" checked={progress.haptics} onChange={haptics=>onChange({haptics})}/>}
    <DailyReminder/>
   </Group></Section>
   <Section title="Görünüm"><Group><AppearanceSettings {...{progress,onChange,comfort,onComfort}}/></Group></Section>
   <Section title="Yardım"><Group>
    <Row buttonRef={helpRow} icon={<BookOpen/>} title="Nasıl oynanır?" onClick={()=>{if(onHelp){onClose();onHelp();}else openDetail('help',helpRow);}}/>
    <Row buttonRef={privacyRow} icon={<ShieldCheck/>} title="Gizlilik ve veriler" note="Kullanım verileri dahil" onClick={()=>openDetail('privacy',privacyRow)}/>
   </Group></Section>
   <GameCenterAccess/>{installRef&&<div ref={installRef}/>}
  </>}
 </Window>;
}
