'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {Move,Smartphone,Music2} from 'lucide-react';
import type {Comfort} from '@/lib/game/comfort';
import {hapticsAvailable} from '@/lib/game/haptics';

type Preferences={ambience?:boolean;onAmbience?:()=>void;haptics:boolean;onHaptics:()=>void;comfort:Comfort;onComfort:(next:Comfort)=>void};
const Context=createContext<Preferences|null>(null);
export const PlayPreferencesProvider=Context.Provider;
export const usePlayHapticsEnabled=()=>useContext(Context)?.haptics??false;
/** Shares the app's existing preferences; never owns a save or a game clock. */
export function PlayComfortSettings({section='all'}:{section?:'all'|'haptics'|'motion'}){
 const value=useContext(Context),[vibration,setVibration]=useState(false);
 useEffect(()=>setVibration(hapticsAvailable()),[]);
 if(!value||(section==='haptics'&&!vibration))return null;
 return <div className="play-comfort-settings game-settings" aria-label="Oyun hissi">
  {section!=='motion'&&vibration&&<button className="comfort-setting" role="switch" aria-checked={value.haptics} onClick={value.onHaptics}><Smartphone/><span><b>Titreşim</b></span><i className="switch" aria-hidden="true"/></button>}
  {section!=='haptics'&&<button className="comfort-setting" role="switch" aria-checked={value.comfort.reduceMotion} onClick={()=>value.onComfort({...value.comfort,reduceMotion:!value.comfort.reduceMotion})}><Move/><span><b>Hareketi azalt</b><small>Kısa ve sakin geçişler</small></span><i>{value.comfort.reduceMotion?'Açık':'Kapalı'}</i></button>}
 </div>;
}

/** The same switch is used in home and in-game settings. */
export function AmbienceSetting(){const value=useContext(Context);if(!value?.onAmbience)return null;return <button className="comfort-setting" role="switch" aria-checked={value.ambience===true} onClick={value.onAmbience}><Music2 aria-hidden="true"/><span><b>Ambiyans</b></span><i className="switch" aria-hidden="true"/></button>;}
