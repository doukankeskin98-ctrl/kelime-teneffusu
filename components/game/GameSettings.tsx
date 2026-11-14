'use client';
import {DailyReminder} from './DailyReminder';
import {Disclosure} from './Disclosure';
import {collectionStats} from '@/lib/game/progress';
import {ZoomIn,Settings,LockKeyhole} from 'lucide-react';
import {useEffect,useState} from 'react';
import {Hand,Move,ShieldCheck,Smartphone} from 'lucide-react';
import type {Progress} from '@/lib/game/progress';
import {hapticsAvailable} from '@/lib/game/haptics';
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
export function GameSettings({progress,onProgress,comfort,onComfort,compact=false}:{compact?:boolean;progress:Progress;onProgress:(p:Progress)=>void;comfort:Comfort;onComfort:(c:Comfort)=>void}){
 const [vibration,setVibration]=useState(false),stats=collectionStats(progress);
 useEffect(()=>setVibration(hapticsAvailable()),[]);
 return <div className="game-settings"><SoundSettings enabled={progress.sound} onChange={sound=>onProgress({...progress,sound})} compact={compact}/>
 {vibration&&<button className="comfort-setting" role="switch" aria-checked={progress.haptics} onClick={()=>onProgress({...progress,haptics:!progress.haptics})}><Smartphone/><span><b>{compact?'Titreşim':'Dokunma titreşimi'}</b>{!compact&&<small>Menüler, harfler ve başarılar</small>}</span><i className={compact?'switch'+(progress.haptics?' on':''):undefined} aria-hidden={compact||undefined}>{!compact&&(progress.haptics?'Açık':'Kapalı')}</i></button>}
 {!compact&&<><Disclosure className="settings-group" title="Erişilebilirlik"><button className="comfort-setting" role="switch" aria-checked={progress.contrast} onClick={()=>onProgress({...progress,contrast:!progress.contrast})}><ShieldCheck/><span><b>Belirgin harfler</b><small>Daha yüksek kontrast</small></span><i>{progress.contrast?'Açık':'Kapalı'}</i></button>
 <button className="comfort-setting" role="switch" aria-checked={comfort.leftHanded} onClick={()=>onComfort({...comfort,leftHanded:!comfort.leftHanded})}><Hand/><span><b>Sol elle oynuyorum</b><small>İpucu düğmesi sağda, elinin dışında kalır</small></span><i>{comfort.leftHanded?'Açık':'Kapalı'}</i></button>
 <button className="comfort-setting" role="switch" aria-checked={comfort.reduceMotion} onClick={()=>onComfort({...comfort,reduceMotion:!comfort.reduceMotion})}><Move/><span><b>Hareketi azalt</b><small>Kısa ve sakin geçişler</small></span><i>{comfort.reduceMotion?'Açık':'Kapalı'}</i></button>
 <button className="comfort-setting" role="switch" aria-checked={progress.zoom} onClick={()=>onProgress({...progress,zoom:!progress.zoom})}><ZoomIn/><span><b>Büyük harf modu</b><small>İsteğe bağlı büyük tahta</small></span><i>{progress.zoom?'Açık':'Kapalı'}</i></button>
 </Disclosure><Disclosure className="settings-appearance settings-group" title="Tahta ve çizgi renkleri"><BoardColorSettings value={progress.boardColor} onChange={boardColor=>onProgress({...progress,boardColor})}/>
 <div className="palette-options">{[{id:'classic' as const,name:'Defter',colors:['#e7bc59','#83b7a2','#c797bc'],unlocked:true,note:''},{id:'ocean' as const,name:'Kıyı',colors:['#94cacc','#a6bbd2','#d6c58b'],unlocked:stats.completed>=3,note:'3 bölüm tamamla'},{id:'orchid' as const,name:'Orkide',colors:['#d5b4cb','#bba5d2','#92c1b4'],unlocked:progress.mysteries.length>=2,note:'2 Gizli Tema tamamla'}].map(p=><button key={p.id} disabled={!p.unlocked} className={progress.palette===p.id?'selected':''} aria-pressed={progress.palette===p.id} onClick={()=>onProgress({...progress,palette:p.id})}><span className="palette-swatches">{p.colors.map(c=><i key={c} style={{background:c}}/>)}</span><b>{p.name}</b><small>{p.unlocked?(progress.palette===p.id?'Seçili':'Seç'):<><LockKeyhole size={12}/>{p.note}</>}</small></button>)}</div></Disclosure>
 <DailyReminder/><Disclosure className="settings-group" title="Kullanım verileri"><button className="comfort-setting" role="switch" aria-checked={progress.analytics} onClick={()=>onProgress({...progress,analytics:!progress.analytics})}><Settings/><span><b>İyileştirmeye yardım et</b><small>İsteğe bağlı, adsız kullanım ve performans sayımları</small></span><i>{progress.analytics?'Açık':'Kapalı'}</i></button></Disclosure></>}
 </div>;
}
