'use client';
import {setDailyReminder} from '@/lib/platform/engagement';
import {useRef,useState} from 'react';
import {getAuthClient,bearerHeaders,signOutProvider} from '@/lib/auth/firebase-client';
import {appFetch} from '@/lib/platform/runtime';
import {clearErasedProgress,ERASURE_KEY,readErasure,type PendingErasure} from '@/lib/auth/erasure-client';
export function DeleteAccount({owner,kind,onBusy,onErased}:{owner?:string;kind?:string;onBusy:(busy:boolean)=>void;onErased:()=>void}){
 const [open,setOpen]=useState(()=>typeof window!=='undefined'&&!!readErasure(localStorage)),[confirmed,setConfirmed]=useState(false),[password,setPassword]=useState(''),[email,setEmail]=useState(''),[needsEmail,setNeedsEmail]=useState(kind==='email'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[pending,setPending]=useState<PendingErasure|null>(()=>typeof window==='undefined'?null:readErasure(localStorage)),lock=useRef(false);
 const erase=async()=>{if(lock.current||!pending&&!confirmed)return;const target=pending?.owner??owner;if(!target)return;lock.current=true;setBusy(true);setError('');onBusy(true);
  let job=pending;
  try{
   if(needsEmail&&(!job||password)){const {auth,sdk}=await getAuthClient();if(!auth.currentUser?.email){if(!email)throw new Error('Bağlı e-posta hesabını yaz.');await sdk.signInWithEmailAndPassword(auth,email.trim(),password);}else await sdk.reauthenticateWithCredential(auth.currentUser,sdk.EmailAuthProvider.credential(auth.currentUser.email,password));setPassword('');}
   job??={owner:target,receipt:[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join(''),erased:false};
   localStorage.setItem(ERASURE_KEY,JSON.stringify(job));if(localStorage.getItem(ERASURE_KEY)!==JSON.stringify(job))throw new Error('Silme işleminin devam bilgisi saklanamadı. Hiçbir istek gönderilmedi.');setPending(job);
   const headers=await bearerHeaders().catch(()=>({}));const r=await appFetch('/api/account/delete',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({receipt:job.receipt,expectedOwner:job.owner,confirm:'DELETE'})}),v=await r.json() as {erased?:boolean;complete?:boolean;requiresEmail?:boolean;error?:string};
   if(v.requiresEmail)setNeedsEmail(true);if(!r.ok)throw new Error(v.error??'Hesap silinemedi. Kayıtların korunuyor.');
   if(v.erased){job={...job,erased:true};localStorage.setItem(ERASURE_KEY,JSON.stringify(job));setPending(job);clearErasedProgress(job.owner,localStorage,sessionStorage);try{const reminder=await setDailyReminder(false);if(reminder.enabled)throw new Error();}catch{throw new Error('Hesabın silindi, ancak bu cihazdaki hatırlatma kapatılamadı. Silme işlemini kontrol ederek yeniden dene.');}onErased();}
   if(!v.complete)throw new Error(v.error??'Hesap kapanışı bekliyor. Tekrar dene.');
   await signOutProvider();localStorage.removeItem(ERASURE_KEY);
   if(kind==='native')location.assign('/signout-with-chatgpt?return_to=%2F');else location.assign('/');
  }catch(e){setError((e as Error).message);if(!job?.erased)onBusy(false);}finally{lock.current=false;setBusy(false);}
 };
 if(!owner&&!pending)return null;
 return <section className="account-danger"><button className="button secondary full danger" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>Hesabı ve oyun verilerini sil</button>{open&&<><p>Bu profildeki bölümler, yıldızlar, albümler, Arena puanı ve arkadaş bağlantıları kalıcı olarak silinir. Diğer oyuncuların maç sonuçlarında adın kaldırılır. Bu işlem geri alınamaz.</p>{kind==='native'&&<p>Yalnız Kelime Teneffüsü profili silinir. ChatGPT hesabın silinmez.</p>}{pending?.erased?<p role="status">Oyun verilerin silindi. Üyelik hesabının kapanışını tamamla.</p>:<><label><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/><span>Bu profilin kayıtlarının kalıcı olarak silineceğini anladım.</span></label></>}{needsEmail&&<>{kind!=='email'&&<label>Bağlı e-posta<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></label>}<label>Şifrenle doğrula<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/></label></>}{error&&<p role="alert">{error}</p>}<button className="button secondary full danger" disabled={busy||!pending&&(!confirmed||needsEmail&&!password)} onClick={()=>void erase()}>{busy?'İşlem sürüyor…':pending?'Silme işlemini kontrol et':'Kalıcı olarak sil'}</button></>}</section>;
}
