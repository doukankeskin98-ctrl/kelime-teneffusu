'use client';
import {useEffect,useState} from 'react';
import {AuthPanel,type AuthMode} from '@/components/auth/AuthPanel';
import {useMembership} from '@/components/auth/useMembership';
import {safeReturnTo} from '@/lib/auth/shared';
import {signOutMember} from '@/lib/auth/firebase-client';
import {ArrowRight,CalendarDays,Compass,Flame,HelpCircle,LoaderCircle,Star,Swords,User,ChevronRight} from 'lucide-react';
import {THEMES,LEVEL_NAMES,type Theme} from '@/lib/game/catalog';
import {dailySpec} from '@/lib/game/engine';
import {emptyProgress,loadProgress,PROGRESS_KEY,streak,type Progress} from '@/lib/game/progress';
import {SAVE_KEY,validateSave} from '@/lib/game/legacy';
import {istanbulDay} from '@/lib/game/engine';
import type {DailyView} from '@/lib/game/server';
import {ThemeArt} from './Art';
import {Arena} from './Arena';
import {api,getApi,Help,Modal} from './common';
import {Solo,type SoloConfig} from './Solo';
import {Explore,DailyPage,ProfilePage,type Account} from './Pages';
type Nav='kesfet'|'arena'|'gunluk'|'profil';
const TABS=[{id:'kesfet' as Nav,label:'Keşfet',icon:Compass},{id:'arena' as Nav,label:'Arena',icon:Swords},{id:'gunluk' as Nav,label:'Günlük',icon:CalendarDays},{id:'profil' as Nav,label:'Profil',icon:User}];
export function GameApp(){
 const membership=useMembership();
 const [authMode,setAuthMode]=useState<AuthMode|null>(null),[authReturn,setAuthReturn]=useState('/');
 const openAuth=(mode:AuthMode='signin')=>{const url=new URL(location.href);url.searchParams.set('sekme',nav);setAuthReturn(safeReturnTo(url.pathname+url.search));setAuthMode(mode);};
 const [progress,setProgress]=useState(emptyProgress),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false),[nav,setNav]=useState<Nav>('kesfet');
 const [theme,setTheme]=useState<Theme|null>(null),[solo,setSolo]=useState<SoloConfig|null>(null),[daily,setDaily]=useState<DailyView|null>(null),[help,setHelp]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[account,setAccount]=useState<Account>({authenticated:false});
 const authenticated=account.authenticated;
 useEffect(()=>{try{setProgress(loadProgress(localStorage.getItem(PROGRESS_KEY)));}catch{setStorageError(true);}const query=new URLSearchParams(location.search);const tab=query.get('sekme');if(query.has('oda')||tab==='arena')setNav('arena');else if(tab==='gunluk')setNav('gunluk');setReady(true);},[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));}catch{setStorageError(true);}},[progress,ready]);
 useEffect(()=>{if(!membership.ready)return;if(!membership.user?.emailVerified){setAccount({authenticated:false});return;}const c=new AbortController();getApi<Account>('',c.signal).then(next=>{setAccount(next);if(next.needsUsername){setAuthReturn(previous=>previous==='/'?safeReturnTo(location.pathname+location.search):previous);setAuthMode('username');}}).catch(()=>{setAccount({authenticated:false});setError('Hesabın alınamadı. Tekrar giriş yapmayı dene.');});return ()=>c.abort();},[membership.revision,nav]);
 const stars=Object.values(progress.saves).reduce((sum,s)=>sum+(s.complete?s.stars:0),0),dailyStreak=streak(progress.days,istanbulDay());
 const openSolo=(config:SoloConfig)=>{setTheme(null);setSolo(config);setDaily(null);window.scrollTo({top:0});};
 const back=()=>{setSolo(null);setDaily(null);window.scrollTo({top:0});};
 const startDaily=async()=>{setBusy(true);setError('');try{const d=await api<DailyView>('daily');setDaily(d);const s=dailySpec(d.day);setSolo({themeId:s.themeId,level:s.level});window.scrollTo({top:0});}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 const classic=()=>{let level=0;try{level=validateSave(JSON.parse(localStorage.getItem(SAVE_KEY)??'null'))?.round??0;}catch{}openSolo({themeId:'hababam',level,classic:true});};
 if(solo&&ready)return <div className="game-app"><Solo key={`${solo.classic?'classic':daily?'daily':'solo'}.${solo.themeId}.${solo.level}.${daily?.id??''}`} config={solo} progress={progress} onProgress={setProgress} onBack={back} onNext={openSolo} daily={daily??undefined}/></div>;
 return <div className="app-shell">
  <aside className="sidebar"><button className="brand" onClick={()=>setNav('kesfet')} aria-label="Kelime Teneffüsü ana sayfa"><span className="brand-mark">Kt<span>.</span></span><span>kelime<br/><b>teneffüsü</b></span></button><span className="sidebar-label">KENDİNE BİR TENEFFÜS VER</span>
   <nav aria-label="Ana gezinme">{TABS.map(t=><button key={t.id} className={nav===t.id?'active':''} onClick={()=>{setNav(t.id);setError('');window.scrollTo({top:0});}}><t.icon size={21}/><span>{t.label}</span>{t.id==='arena'&&<i className="live-dot"/>}{t.id==='gunluk'&&<small>1</small>}</button>)}</nav>
   <div className="sidebar-bottom"><div className="small-chalk"><HelpCircle size={25}/><p>Bir kelime bul.<br/><em>Kafanı dağıt.</em></p><span>Her gün küçük bir keşif.</span></div><button className="sidebar-help" onClick={()=>setHelp(true)}><HelpCircle size={18}/> Nasıl oynanır?</button><small>Merakla yapıldı. Türkçe oynanır.</small></div>
  </aside>
  <div className="main-area"><header className="topbar"><div className="mobile-brand"><span className="brand-mark">Kt<span>.</span></span><b>kelime teneffüsü</b></div><div className="breadcrumb"><span>Senin oyun alanın</span><ChevronRight size={14}/><b>{TABS.find(t=>t.id===nav)?.label}</b></div><div className="topbar-right"><span className="streak-badge" hidden={!authenticated} title="Günlük oyun serisi"><Flame size={17}/>{dailyStreak}<small>gün</small></span><span className="star-badge"><Star size={17}/>{stars}</span>{authenticated?<button className="profile-avatar" onClick={()=>setNav('profil')} aria-label="Profilini aç">{account.profile?.nickname.slice(0,1)??'K'}</button>:<><button className="auth-nav-button" onClick={()=>openAuth('signin')}>Giriş yap</button><button className="auth-nav-button register" onClick={()=>openAuth('register')}>Kayıt ol</button></>}</div></header>
   <main className="main-content">{membership.user&&!membership.user.emailVerified&&<div className="auth-banner"><span>Arena için e-posta adresini doğrula.</span><button className="text-button" onClick={()=>openAuth('verify')}>Doğrulamaya devam et</button></div>}{membership.error&&<p className="error-box" role="status">{membership.error}</p>}{storageError&&<div className="error-box" role="status">Tarayıcı kayıt alanına erişilemiyor. Bu oturumdaki ilerlemen sayfayı kapatınca kaybolabilir.</div>}
    {nav==='kesfet'&&<Explore progress={progress} setTheme={setTheme} openSolo={openSolo} setNav={setNav} classic={classic}/>}
    {nav==='arena'&&<Arena authenticated={authenticated} onLogin={()=>openAuth()} progress={progress} onProgress={setProgress} practice={()=>openSolo({themeId:'hababam',level:0})}/>}
    {nav==='gunluk'&&<DailyPage authenticated={authenticated} onLogin={()=>openAuth()} progress={progress} busy={busy} error={error} start={()=>void startDaily()}/>}
    {nav==='profil'&&<ProfilePage account={account} setAccount={setAccount} onLogin={()=>openAuth()} onLogout={async()=>{await signOutMember();setAccount({authenticated:false});}} progress={progress} onProgress={setProgress}/>}
   </main>
  </div>
  <nav className="mobile-nav" aria-label="Mobil gezinme">{TABS.map(t=><button className={nav===t.id?'active':''} onClick={()=>{setNav(t.id);window.scrollTo({top:0});}} key={t.id}><t.icon size={21}/><span>{t.label}</span></button>)}</nav>
  {theme&&<Modal title={theme.title} onClose={()=>setTheme(null)}><div className="theme-modal-intro"><ThemeArt icon={theme.icon} color={theme.color}/><p>{theme.subtitle}<br/><small>Her bölüm açık. Merak ettiğinden başlayabilirsin.</small></p></div><div className="level-grid">{LEVEL_NAMES.map((name,l)=>{const saved=progress.saves[`${theme.id}.${l}`];return <button key={l} className={'level-card'+(saved?.complete?' complete':'')} onClick={()=>openSolo({themeId:theme.id,level:l})}><span>{String(l+1).padStart(2,'0')}</span><b>{name}</b><small>{5+l} kelime · {l<2?'Rahat':l<4?'Dengeli':'Ustalık'}</small><div>{[0,1,2].map(s=><Star key={s} size={13} fill={(saved?.stars??0)>s?'currentColor':'none'}/>)}</div>{saved?.strokes.length&&!saved.complete?<em>Kaldığın yerden</em>:null}</button>;})}</div></Modal>}
  {authMode&&<Modal title={authMode==='register'?'Kayıt ol':authMode==='username'?'Kullanıcı adını seç':'Hesabın'} onClose={()=>setAuthMode(null)}><AuthPanel initial={authMode} returnTo={authReturn} user={membership.user} onDone={()=>location.assign(safeReturnTo(authReturn))}/></Modal>}
  {help&&<Help onClose={()=>setHelp(false)}/>} {busy&&<span className="global-busy" role="status"><LoaderCircle size={18} className="spin"/>Günün keşfi hazırlanıyor…</span>}
 </div>;
}
