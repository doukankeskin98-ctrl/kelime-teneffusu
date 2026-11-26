'use client';
import {Toggle} from '../ui/GameUI';
import {Disclosure} from './Disclosure';
import {collectionStats} from '@/lib/game/progress';
import {Check,ZoomIn,LockKeyhole} from 'lucide-react';
import {useEffect,useState} from 'react';
import {Hand,Move,Palette,ShieldCheck} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';

import {BoardColorSettings} from './BoardColorSettings';
import {COMFORT_KEY as KEY,DEFAULT_COMFORT as DEFAULT,parseComfort,type Comfort} from '@/lib/game/comfort';
export function useComfort(){
 const [comfort,setComfort]=useState<Comfort>(DEFAULT);
 useEffect(()=>{try{setComfort(parseComfort(localStorage.getItem(KEY)));}catch{}},[]);
 useEffect(()=>{const root=document.documentElement;root.dataset['leftHanded']=String(comfort.leftHanded);root.dataset['reduceMotion']=String(comfort.reduceMotion);return ()=>{delete root.dataset['leftHanded'];delete root.dataset['reduceMotion'];};},[comfort]);
 const change=(next:Comfort)=>{setComfort(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}};
 return {comfort,change};
}
type PreferenceKeys='contrast'|'zoom'|'palette'|'boardColor'|'haptics'|'sound';
export type PreferencePatch=Partial<Pick<Progress,PreferenceKeys>>;
type AppearanceProps={progress:Progress;onChange:(patch:PreferencePatch)=>void;comfort:Comfort;onComfort:(c:Comfort)=>void};
const palettes=[
 {id:'classic',name:'Defter',note:''},
 {id:'ocean',name:'Kıyı',note:'3 bölüm tamamla'},
 {id:'orchid',name:'Orkide',note:'2 Gizli Tema tamamla'}
] as const;

export function AppearanceSettings({progress,onChange,comfort,onComfort}:AppearanceProps){
 const completed=collectionStats(progress).completed;
 return <>
  <Disclosure title="Erişilebilirlik" icon={<Hand/>} note="Hareket, kontrast ve sol el">
   <Toggle icon={<ShieldCheck/>} title="Belirgin harfler" note="Daha yüksek kontrast" checked={progress.contrast} onChange={contrast=>onChange({contrast})}/>
   <Toggle icon={<Hand/>} title="Sol elle oynuyorum" note="İpucu düğmesi sağda, elinin dışında kalır" checked={comfort.leftHanded} onChange={leftHanded=>onComfort({...comfort,leftHanded})}/>
   <Toggle icon={<Move/>} title="Hareketi azalt" note="Kısa ve sakin geçişler" checked={comfort.reduceMotion} onChange={reduceMotion=>onComfort({...comfort,reduceMotion})}/>
   <Toggle icon={<ZoomIn/>} title="Büyük harf modu" note="İsteğe bağlı büyük tahta" checked={progress.zoom} onChange={zoom=>onChange({zoom})}/>
  </Disclosure>
  <Disclosure title="Tahta ve çizgi renkleri" icon={<Palette/>} note="Tahtanın görünümünü seç">
   <BoardColorSettings value={progress.boardColor} onChange={boardColor=>onChange({boardColor})}/>
   <div className="palette-options">{palettes.map(p=>{
    const unlocked=p.id==='classic'||(p.id==='ocean'?completed>=3:progress.mysteries.length>=2);
    return <button type="button" key={p.id} disabled={!unlocked} aria-pressed={progress.palette===p.id} onClick={()=>onChange({palette:p.id})}>
     <span className="palette-swatches" data-palette-choice={p.id} aria-hidden="true"><i/><i/><i/></span>
     <b>{p.name}</b><small>{unlocked?(progress.palette===p.id&&<Check size={18} aria-hidden="true"/>):<><LockKeyhole size={12}/>{p.note}</>}</small>
    </button>;
   })}</div>
  </Disclosure>
 </>;
}
