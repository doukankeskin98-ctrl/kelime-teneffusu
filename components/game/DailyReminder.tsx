'use client';
import {useEffect,useState,useRef} from 'react';
import {Bell} from 'lucide-react';
import {reminderStatus,setDailyReminder,dismissReminderOffer,type ReminderState} from '@/lib/platform/engagement';
export function DailyReminder({offer=false}:{offer?:boolean}){
 const mounted=useRef(true),generation=useRef(0),lock=useRef(false);
 const [state,setState]=useState<ReminderState|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{mounted.current=true;const refresh=()=>{if(lock.current)return;const ticket=++generation.current;void reminderStatus().then(value=>{if(mounted.current&&ticket===generation.current)setState(value);});};refresh();window.addEventListener('kt-app-resume',refresh);return ()=>{mounted.current=false;window.removeEventListener('kt-app-resume',refresh);};},[]);
 if(!state?.available||(offer&&(state.offered||state.enabled)))return null;
 const change=async()=>{if(lock.current)return;lock.current=true;generation.current++;setBusy(true);setError('');try{const value=await setDailyReminder(!state.enabled);if(mounted.current)setState(value);}catch{if(mounted.current)setError('Hatırlatma ayarlanamadı. Yeniden deneyebilirsin.');}finally{lock.current=false;if(mounted.current)setBusy(false);}};
 return <div className="daily-reminder"><button type="button" className="comfort-setting" role={offer?undefined:'switch'} aria-checked={offer?undefined:state.enabled} disabled={busy||state.permission==='denied'} onClick={()=>void change()}><Bell/><span><b>{offer?'Yeni bulmacayı hatırlat':'Günlük hatırlatma'}</b><small>{state.permission==='denied'?'iPhone Ayarları → Bildirimler’den açabilirsin.':'Her gün 19.00 · Sessiz bildirim'}</small></span>{!offer&&<i>{state.enabled?'Açık':'Kapalı'}</i>}</button>{offer&&<button className="text-button" onClick={()=>{setState({...state,offered:true});void dismissReminderOffer();}}>Şimdi değil</button>}{error&&<p role="status">{error}</p>}</div>;
}
