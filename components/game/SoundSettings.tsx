'use client';
import {useEffect,useState} from 'react';
import {Play,Volume2,VolumeX} from 'lucide-react';
import {readSoundLevel,SOUND_LEVEL_KEY,SOUND_LEVELS,DEFAULT_SOUND_LEVEL} from '@/lib/game/sound';
import {useChime} from './useGameSound';
export function SoundSettings({enabled,onChange}:{enabled:boolean;onChange:(value:boolean)=>void}){
 const [level,setLevel]=useState(DEFAULT_SOUND_LEVEL),[saveError,setSaveError]=useState(false),chime=useChime(enabled);
 useEffect(()=>setLevel(readSoundLevel()),[]);
 return <div className="sound-settings">
  <button type="button" className="setting-row" role="switch" aria-checked={enabled} onClick={()=>{chime(enabled?'mute':'enable');onChange(!enabled);}}>{enabled?<Volume2/>:<VolumeX/>}<span><b>Yumuşak oyun sesleri</b><small>Ahşap tınıları, küçük keşif melodileri.</small></span><i className={'switch'+(enabled?' on':'')} aria-hidden="true"/></button>
  <div className="sound-options"><div role="group" aria-label="Oyun ses düzeyi" className="sound-levels">{SOUND_LEVELS.map(option=><button type="button" key={option.label} aria-pressed={level===option.value} onClick={()=>{try{localStorage.setItem(SOUND_LEVEL_KEY,String(option.value));setLevel(option.value);setSaveError(false);if(enabled)chime('word');}catch{setSaveError(true);}}}>{option.label}</button>)}</div><button type="button" className="text-button sound-preview" disabled={!enabled} onClick={()=>chime('complete')}><Play size={16} aria-hidden="true"/>Sesi dene</button><small>Ses düzeyi bu cihazda saklanır. İstediğin an oyundaki hoparlörden kapatabilirsin.</small>{saveError&&<p role="status" className="muted">Ses düzeyi kaydedilemedi. Önceki düzey korunuyor; yeniden deneyebilirsin.</p>}</div>
 </div>;
}
