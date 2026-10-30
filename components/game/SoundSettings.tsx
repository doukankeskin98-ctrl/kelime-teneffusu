'use client';
import {useEffect,useState,useId} from 'react';
import {Play,Volume2,VolumeX} from 'lucide-react';
import {readSoundLevel,setSoundLevel,SOUND_LEVEL_EVENT,DEFAULT_SOUND_LEVEL} from '@/lib/game/sound';
import {useChime} from './useGameSound';
export function SoundSettings({enabled,onChange}:{enabled:boolean;onChange:(value:boolean)=>void}){
 const [level,setLevel]=useState(DEFAULT_SOUND_LEVEL),[saveError,setSaveError]=useState(false),chime=useChime(enabled),id=useId();
 useEffect(()=>{const refresh=()=>setLevel(readSoundLevel());refresh();window.addEventListener(SOUND_LEVEL_EVENT,refresh);return ()=>window.removeEventListener(SOUND_LEVEL_EVENT,refresh);},[]);
 const change=(value:number)=>{setLevel(value);setSaveError(!setSoundLevel(value));if(value===0){chime('mute');onChange(false);}else if(!enabled){chime('enable');onChange(true);}};
 return <div className="sound-settings">
  <button type="button" className="setting-row" role="switch" aria-checked={enabled} onClick={()=>{chime(enabled?'mute':'enable');onChange(!enabled);}}>{enabled?<Volume2/>:<VolumeX/>}<span><b>Oyun sesleri</b><small>Kısa harf tınıları ve keşif melodileri.</small></span><i className={'switch'+(enabled?' on':'')} aria-hidden="true"/></button>
  <div className="sound-options"><div className="sound-slider-row"><label htmlFor={id}>Oyun sesi</label><output htmlFor={id}>{enabled?Math.round(level*100):0}%</output></div><input id={id} className="sound-slider" type="range" min="0" max="100" step="1" value={enabled?Math.round(level*100):0} aria-valuetext={enabled&&level>0?`Yüzde ${Math.round(level*100)}`:'Kapalı'} onChange={e=>change(Number(e.currentTarget.value)/100)}/><button type="button" className="text-button sound-preview" disabled={!enabled||level===0} onClick={()=>chime('complete')}><Play size={16} aria-hidden="true"/>Sesi dene</button><small>Bütün oyun efektlerini ayarlar. %0 sessizdir; tercihin bu cihazda saklanır. Oyundaki hoparlörden de kapatabilirsin. Cihazın medya sesi ayrıca etkilidir.</small>{saveError&&<p role="status" className="muted">Ayar bu oturumda uygulandı, ancak cihaza kaydedilemedi.<button className="text-button" onClick={()=>setSaveError(!setSoundLevel(level))}>Kaydetmeyi yeniden dene</button></p>}</div>
 </div>;
}
