'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {ArrowRight,Check,Eye,EyeOff,LoaderCircle} from 'lucide-react';
import {authMessage,emailContinueUrl,validPassword} from '@/lib/auth/shared';
import {getAuthClient,reloadMember} from '@/lib/auth/firebase-client';
const pendingActions=new Map<string,Promise<{type:'reset'|'done';email?:string}>>();
function completeAction(mode:string|null,code:string){
 const key=String(mode)+':'+code,existing=pendingActions.get(key);if(existing)return existing;
 const task=(async():Promise<{type:'reset'|'done';email?:string}>=>{
  const {auth,sdk}=await getAuthClient();
  if(mode==='resetPassword')return {type:'reset',email:await sdk.verifyPasswordResetCode(auth,code)};
  if(mode==='verifyEmail'||mode==='recoverEmail'){await sdk.applyActionCode(auth,code);await reloadMember();return {type:'done'};}
  throw new Error('Bu üyelik bağlantısı tanınmadı.');
 })();
 if(pendingActions.size>=4)pendingActions.delete(pendingActions.keys().next().value!);
 pendingActions.set(key,task);return task;
}
export function EmailAction(){
 const [state,setState]=useState<'checking'|'reset'|'done'|'failed'>('checking'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[visible,setVisible]=useState(false),[code,setCode]=useState(''),[returnTo,setReturnTo]=useState('/'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{
  let stopped=false;const params=new URLSearchParams(location.search),action=params.get('mode'),actionCode=params.get('oobCode')??'',next=emailContinueUrl(params.get('continueUrl'),location.origin);
  setCode(actionCode);setReturnTo(next);
  const run=async()=>{
   try{
    if(!actionCode||actionCode.length>2048)throw new Error('Bağlantı geçersiz. Yeni bir bağlantı iste.');
    const result=await completeAction(action,actionCode);if(!stopped){if(result.email)setEmail(result.email);setState(result.type);}
   }catch(e){if(!stopped){setError(authMessage(e));setState('failed');}}
   finally{history.replaceState({},'','/uye');}
  };
  void run();return ()=>{stopped=true;};
 },[]);
 const reset=async(event:FormEvent)=>{event.preventDefault();if(busy)return;setError('');if(!validPassword(password)){setError('Şifren 10–128 karakter olmalı.');return;}if(password!==confirm){setError('Şifreler eşleşmiyor.');return;}setBusy(true);try{const {auth,sdk}=await getAuthClient();await sdk.confirmPasswordReset(auth,code,password);await sdk.signOut(auth);setPassword('');setConfirm('');setState('done');}catch(e){setError(authMessage(e));}finally{setBusy(false);}};
 return <main className="auth-action-page"><section className="auth-action-card"><a className="brand" href="/"><span className="brand-mark">Kt<span>.</span></span><b>kelime teneffüsü</b></a><h1>{state==='checking'?'Bağlantını kontrol ediyoruz.':state==='reset'?'Yeni bir şifre seç.':state==='done'?'Her şey tamam.':'Yeni bir bağlantı gerekiyor.'}</h1>{state==='checking'&&<LoaderCircle className="spin" size={30}/>}
 {error&&<div className="auth-error" role="alert">{error}</div>}
 {state==='reset'&&<form onSubmit={e=>void reset(e)} aria-busy={busy}><p className="auth-description">{email} hesabının şifresini yenile.</p><div className="auth-field"><label htmlFor="reset-password">Yeni şifre</label><div className="auth-password"><input id="reset-password" type={visible?'text':'password'} autoComplete="new-password" minLength={10} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" aria-label={visible?'Şifreyi gizle':'Şifreyi göster'} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div><div className="auth-field"><label htmlFor="reset-confirm">Şifre tekrar</label><input id="reset-confirm" type={visible?'text':'password'} autoComplete="new-password" minLength={10} maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)} required/></div><button className="button primary full" disabled={busy}>{busy?<LoaderCircle className="spin" size={18}/>:<Check size={18}/>}Şifremi yenile</button></form>}
 {state==='done'&&<p className="auth-description">İşlemin tamamlandı. Oyuna dönüp hesabınla devam edebilirsin.</p>}
 {(state==='done'||state==='failed')&&<a className="button primary full" href={returnTo}>Oyuna dön <ArrowRight size={18}/></a>}
 </section></main>;
}
