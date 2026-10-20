'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowLeft,ArrowRight,Check,Eye,EyeOff,LoaderCircle,Mail,ShieldCheck,UserRound} from 'lucide-react';
import {authMessage,normalizeUsername,safeReturnTo,USERNAME_HELP,validPassword} from '@/lib/auth/shared';
import {getAuthClient,memberFetch,register,reloadMember,resetEmail,sendVerification,signIn,signOutMember} from '@/lib/auth/firebase-client';
import type {MemberSnapshot} from './useMembership';
export type AuthMode='signin'|'register'|'forgot'|'verify'|'username';
interface Me {authenticated:boolean;needsUsername?:boolean;needsVerification?:boolean}
async function me():Promise<Me>{const res=await memberFetch('/api/game');const data=await res.json() as Me&{error?:string};if(!res.ok)throw new Error(data.error??'Hesabın alınamadı.');return data;}
export function AuthPanel({initial='signin',returnTo='/',user,onDone}:{initial?:AuthMode;returnTo?:string;user:MemberSnapshot|null;onDone:()=>void}){
 const [mode,setMode]=useState<AuthMode>(initial),[email,setEmail]=useState(''),[username,setUsername]=useState(user?.displayName??''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[remember,setRemember]=useState(true),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[sentUntil,setSentUntil]=useState(0),[now,setNow]=useState(Date.now());
 const errorRef=useRef<HTMLDivElement>(null),nameRef=useRef<HTMLInputElement>(null);
 const remaining=Math.max(0,Math.ceil((sentUntil-now)/1000));
 const finish=async()=>{const account=await me();if(account.needsUsername){setUsername(s=>s||user?.displayName||'');setMode('username');}else if(account.needsVerification)setMode('verify');else if(account.authenticated)onDone();else throw new Error('Oturum doğrulanamadı. Yeniden giriş yap.');};
 useEffect(()=>{if(!user)return;if(!user.emailVerified){setMode('verify');setEmail(user.email);}else{setBusy(true);void finish().catch(e=>setError(authMessage(e))).finally(()=>setBusy(false));}},[user?.uid,user?.emailVerified]);
 useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
 useEffect(()=>{if(!sentUntil)return;const id=setInterval(()=>setNow(Date.now()),1000);return ()=>clearInterval(id);},[sentUntil]);
 const choose=(next:AuthMode)=>{setMode(next);setError('');setNotice('');setPassword('');setConfirm('');};
 const submit=async(event:FormEvent)=>{
  event.preventDefault();if(busy)return;setError('');setNotice('');
  if(mode==='register'&&!normalizeUsername(username)){setError(USERNAME_HELP+' İlk karakter harf olmalı.');nameRef.current?.focus();return;}
  if(mode==='register'&&!validPassword(password)){setError('Şifren 10–128 karakter olmalı.');return;}
  if(mode==='register'&&password!==confirm){setError('Şifreler eşleşmiyor.');return;}
  setBusy(true);
  try{
   if(mode==='signin'){const result=await signIn(email,password,remember);setPassword('');if(result.user.emailVerified)await finish();else{setEmail(result.user.email??email);setMode('verify');}}
   if(mode==='register'){await register(email,password,normalizeUsername(username),safeReturnTo(returnTo));setPassword('');setConfirm('');setMode('verify');setSentUntil(Date.now()+60000);setNotice('Doğrulama bağlantısı e-postana gönderildi.');}
   if(mode==='forgot'){await resetEmail(email,safeReturnTo(returnTo));setNotice('Bu adresle bir hesap varsa şifre yenileme bağlantısı gönderildi. Gelen kutunu ve spam klasörünü kontrol et.');}
   if(mode==='username'){
    const name=normalizeUsername(username);if(!name)throw new Error(USERNAME_HELP+' İlk karakter harf olmalı.');
    const response=await memberFetch('/api/account',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:name})});
    const data=await response.json() as {error?:string};if(!response.ok)throw new Error(data.error??'Kullanıcı adın kaydedilemedi.');
    onDone();
   }
  }catch(e){setError(authMessage(e));}finally{setBusy(false);}
 };
 const resend=async()=>{if(busy||remaining)return;setBusy(true);setError('');try{await sendVerification(safeReturnTo(returnTo));setSentUntil(Date.now()+60000);setNotice('Yeni doğrulama bağlantısı gönderildi.');}catch(e){setError(authMessage(e));}finally{setBusy(false);}};
 const check=async()=>{if(busy)return;setBusy(true);setError('');try{const current=await reloadMember();if(!current?.emailVerified)throw new Error('E-postandaki bağlantıya tıklayıp tekrar dene.');await finish();}catch(e){setError(authMessage(e));}finally{setBusy(false);}};
 return <div className="auth-panel">
  <div className="auth-welcome"><span className="brand-mark">Kt<span>.</span></span><span className="eyebrow">KELİME TENEFFÜSÜ</span></div>
  {mode==='signin'||mode==='register'?<div className="auth-tabs" aria-label="Üyelik işlemi"><button className={mode==='signin'?'selected':''} onClick={()=>choose('signin')}>Giriş yap</button><button className={mode==='register'?'selected':''} onClick={()=>choose('register')}>Kayıt ol</button></div>:null}
  <h3>{mode==='signin'?'Hoş geldin, kelime avcısı.':mode==='register'?'Sana bir yer ayırdık.':mode==='forgot'?'Şifreni birlikte yenileyelim.':mode==='username'?'Oyunda seni nasıl tanıyalım?':'Gelen kutunda bir keşif var.'}</h3>
  <p className="auth-description">{mode==='register'?'Hesabını oluştur, bir kullanıcı adı seç ve arkadaşlarınla kapış.':mode==='signin'?'Hesabına giriş yap, kaldığın rekabete dön.':mode==='forgot'?'E-posta adresini yaz. Şifre yenileme bağlantısını gönderelim.':mode==='username'?'Bu ad sana özel olacak. Diğer oyuncular seni bu adla tanıyacak.':'E-postandaki doğrulama bağlantısına tıkla. Ardından oyuna dönüp aşağıdaki düğmeye bas.'}</p>
  {error&&<div className="auth-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</div>}
  {notice&&<div className="auth-notice" role="status"><Check size={17}/><span>{notice}</span></div>}
  {mode==='verify'?<div className="auth-verify">
   <span className="auth-mail-icon"><Mail size={35}/></span><b>{user?.email||email}</b>
   <button className="button primary full" disabled={busy} onClick={()=>void check()}>{busy?<LoaderCircle size={18} className="spin"/>:<ShieldCheck size={18}/>}Doğruladım, devam et</button>
   <button className="text-button full" disabled={busy||remaining>0} onClick={()=>void resend()}>{remaining?'Yeniden gönder ('+remaining+' sn)':'Doğrulama e-postasını yeniden gönder'}</button>
   <button className="text-button full" disabled={busy} onClick={async()=>{await signOutMember();choose('signin');}}>Farklı bir e-posta kullan</button>
  </div>:<form onSubmit={e=>void submit(e)} aria-busy={busy}>
   {(mode==='register'||mode==='username')&&<div className="auth-field"><label htmlFor="member-name"><UserRound size={15}/>Kullanıcı adı</label><input ref={nameRef} id="member-name" name="username" autoComplete="username" minLength={3} maxLength={20} pattern="[a-zA-Z][a-zA-Z0-9_]{2,19}" value={username} onChange={e=>setUsername(e.target.value)} placeholder="kelime_avcisi" aria-describedby="username-help" required/><small id="username-help">{USERNAME_HELP}</small></div>}
   {mode!=='username'&&<div className="auth-field"><label htmlFor="member-email"><Mail size={15}/>E-posta adresi</label><input id="member-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} placeholder="sen@ornek.com" required/></div>}
   {(mode==='signin'||mode==='register')&&<div className="auth-field"><label htmlFor="member-password">Şifre</label><div className="auth-password"><input id="member-password" name="password" type={visible?'text':'password'} autoComplete={mode==='register'?'new-password':'current-password'} minLength={mode==='register'?10:undefined} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='register'?'En az 10 karakter':'Şifren'} required/><button type="button" aria-label={visible?'Şifreyi gizle':'Şifreyi göster'} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{mode==='register'&&<small>Uzun ve yalnızca bu hesapta kullandığın bir şifre seç.</small>}</div>}
   {mode==='register'&&<div className="auth-field"><label htmlFor="member-confirm">Şifre tekrar</label><input id="member-confirm" name="confirm-password" type={visible?'text':'password'} autoComplete="new-password" minLength={10} maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)} required/></div>}
   {mode==='signin'&&<div className="auth-options"><label><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>Beni hatırla</label><button className="text-button" type="button" onClick={()=>choose('forgot')}>Şifremi unuttum</button></div>}
   <button className="button primary full auth-submit" disabled={busy} type="submit">{busy?<LoaderCircle className="spin" size={18}/>:<ArrowRight size={18}/>} {busy?'Bir saniye…':mode==='signin'?'Giriş yap':mode==='register'?'Hesabımı oluştur':mode==='forgot'?'Yenileme bağlantısı gönder':'Kullanıcı adımı kaydet'}</button>
  </form>}
  {mode==='forgot'&&<button className="text-button full" onClick={()=>choose('signin')}><ArrowLeft size={15}/>Girişe dön</button>}
  <p className="auth-privacy"><ShieldCheck size={14}/>E-posta adresin diğer oyunculara gösterilmez.</p>
 </div>;
}
