'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {Move,Smartphone} from 'lucide-react';
import type {Comfort} from '@/lib/game/comfort';
import {hapticsAvailable} from '@/lib/game/haptics';

type Preferences={haptics:boolean;onHaptics:()=>void;comfort:Comfort;onComfort:(next:Comfort)=>void};
const Context=createContext<Preferences|null>(null);
export const PlayPreferencesProvider=Context.Provider;
/** Shares the app's existing preferences; never owns a save or a game clock. */
export function PlayComfortSettings(){
 const value=useContext(Context),[vibration,setVibration]=useState(false);
 useEffect(()=>setVibration(hapticsAvailable()),[]);
 if(!value)return null;
 return <div className="play-comfort-settings game-settings" aria-label="Oyun hissi">
  {vibration&&<button className="comfort-setting" role="switch" aria-checked={value.haptics} onClick={value.onHaptics}><Smartphone/><span><b>Dokunma titreşimi</b><small>Menüler, harfler ve başarılar</small></span><i>{value.haptics?'Açık':'Kapalı'}</i></button>}
  <button className="comfort-setting" role="switch" aria-checked={value.comfort.reduceMotion} onClick={()=>value.onComfort({...value.comfort,reduceMotion:!value.comfort.reduceMotion})}><Move/><span><b>Hareketi azalt</b><small>Kısa ve sakin geçişler</small></span><i>{value.comfort.reduceMotion?'Açık':'Kapalı'}</i></button>
 </div>;
}
