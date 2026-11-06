'use client';
import {useEffect,useRef,useState} from 'react';
import {Flag,ShieldBan} from 'lucide-react';
import {memberFetch} from '@/lib/auth/firebase-client';
import {Modal} from './common';
async function safety(action:string,target:string,reason?:string){const r=await memberFetch('/api/safety',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,target,reason})}),data=await r.json() as {error?:string};if(!r.ok)throw new Error(data.error??'İşlem tamamlanamadı.');}
export function PlayerSafety({id,name,onChanged}:{id:string;name:string;onChanged?:()=>void}){
 const [open,setOpen]=useState(false),[reason,setReason]=useState('name'),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),lock=useRef(false);
 const act=async(action:'report'|'block')=>{if(lock.current)return;lock.current=true;setBusy(true);setNotice('');try{await safety(action,id,reason);if(action==='block'){window.dispatchEvent(new Event('kt-player-blocked'));onChanged?.();setOpen(false);}else setNotice('Bildirimin inceleme listesine alındı.');}catch(e){setNotice((e as Error).message);}finally{lock.current=false;setBusy(false);}};
 if(id.startsWith('deleted:'))return null;
 return <><button className="icon-button subtle safety-trigger" aria-label={name+' için bildir veya engelle'} onClick={()=>setOpen(true)}><Flag size={17}/></button>{open&&<Modal title="Oyuncu seçenekleri" onClose={()=>{if(!busy)setOpen(false);}}><p><b>{name}</b></p><label htmlFor={'report-reason-'+id}>Bildirim nedeni</label><select id={'report-reason-'+id} value={reason} onChange={e=>setReason(e.target.value)}><option value="name">Uygunsuz oyuncu adı</option><option value="behavior">Rahatsız edici davranış</option><option value="cheating">Hile şüphesi</option></select><button className="button secondary full" disabled={busy||notice==='Bildirimin inceleme listesine alındı.'} onClick={()=>void act('report')}>Bildir</button><p>Engellersen arkadaş bağlantınız kaldırılır ve aynı odaya katılamazsınız. Birlikte oynadığınız maçtan ayrılırsın; tamamlanmış sonuçlar korunur.</p><button className="button secondary full" disabled={busy} onClick={()=>void act('block')}><ShieldBan size={18}/>Oyuncuyu engelle</button>{notice&&<p role="status">{notice}</p>}</Modal>}</>;
}
async function loadBlocked(){
 const response=await memberFetch('/api/safety');
 const data=await response.json() as {players?:{id:string;nickname:string}[];error?:string};
 if(!response.ok)throw new Error(data.error??'Liste alınamadı.');
 return data.players??[];
}
export function BlockedPlayers(){
 const [data,setData]=useState<{id:string;nickname:string}[]|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState('');
 const mounted=useRef(true);
 const refresh=async()=>{try{const players=await loadBlocked();if(mounted.current){setData(players);setError('');}}catch(e){if(mounted.current)setError((e as Error).message);}};
 useEffect(()=>{
  mounted.current=true;let cancelled=false;
  loadBlocked().then(players=>{if(!cancelled)setData(players);}).catch(e=>{if(!cancelled)setError((e as Error).message);});
  return()=>{cancelled=true;mounted.current=false;};
 },[]);
 return <section className="blocked-players"><h3>Engellenen oyuncular</h3>{error?<p role="alert">{error}<button className="text-button" onClick={()=>void refresh()}>Yeniden dene</button></p>:data===null?<p role="status">Yükleniyor…</p>:data.length===0?<p>Engellediğin bir oyuncu yok.</p>:<ul>{data.map(p=><li key={p.id}><span>{p.nickname}</span><button className="text-button" disabled={!!busy} onClick={async()=>{setBusy(p.id);try{await safety('unblock',p.id);await refresh();}catch(e){if(mounted.current)setError((e as Error).message);}finally{if(mounted.current)setBusy('');}}}>Engeli kaldır</button></li>)}</ul>}</section>;
}
