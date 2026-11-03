'use client';
import {useEffect,useState} from 'react';
import {Hand,Move,ShieldCheck} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import {SoundSettings} from './SoundSettings';
import {BoardColorSettings} from './BoardColorSettings';
import {COMFORT_KEY as KEY,DEFAULT_COMFORT as DEFAULT,parseComfort,type Comfort} from '@/lib/game/comfort';
export function useComfort(){
 const [comfort,setComfort]=useState<Comfort>(DEFAULT);
 useEffect(()=>{try{setComfort(parseComfort(localStorage.getItem(KEY)));}catch{}},[]);
 useEffect(()=>{const root=document.documentElement;root.dataset['leftHanded']=String(comfort.leftHanded);root.dataset['reduceMotion']=String(comfort.reduceMotion);return ()=>{delete root.dataset['leftHanded'];delete root.dataset['reduceMotion'];};},[comfort]);
 const change=(next:Comfort)=>{setComfort(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}};
 return {comfort,change};
}
export function GameSettings({progress,onProgress,comfort,onComfort}:{progress:Progress;onProgress:(p:Progress)=>void;comfort:Comfort;onComfort:(c:Comfort)=>void}){
 return <div className="game-settings"><SoundSettings enabled={progress.sound} onChange={sound=>onProgress({...progress,sound})}/>
 <button className="comfort-setting" role="switch" aria-checked={progress.contrast} onClick={()=>onProgress({...progress,contrast:!progress.contrast})}><ShieldCheck/><span><b>Belirgin harfler</b><small>Daha yüksek kontrast</small></span><i>{progress.contrast?'Açık':'Kapalı'}</i></button>
 <button className="comfort-setting" role="switch" aria-checked={comfort.leftHanded} onClick={()=>onComfort({...comfort,leftHanded:!comfort.leftHanded})}><Hand/><span><b>Sol elle oynuyorum</b><small>İpucu düğmesi sağda, elinin dışında kalır</small></span><i>{comfort.leftHanded?'Açık':'Kapalı'}</i></button>
 <button className="comfort-setting" role="switch" aria-checked={comfort.reduceMotion} onClick={()=>onComfort({...comfort,reduceMotion:!comfort.reduceMotion})}><Move/><span><b>Hareketi azalt</b><small>Kısa ve sakin geçişler</small></span><i>{comfort.reduceMotion?'Açık':'Kapalı'}</i></button>
 <BoardColorSettings value={progress.boardColor} onChange={boardColor=>onProgress({...progress,boardColor})}/>
 </div>;
}
