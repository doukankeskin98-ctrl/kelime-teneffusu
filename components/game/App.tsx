'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,BookOpen,CalendarDays,Check,ChevronRight,Compass,Flame,HelpCircle,LoaderCircle,Sparkles,Star,Swords,User} from 'lucide-react';
import {EntryPanel} from '@/components/auth/EntryPanel';
import type {AuthMode} from '@/components/auth/AuthPanel';
import {useMembership} from '@/components/auth/useMembership';
import {safeReturnTo} from '@/lib/auth/shared';
import {signOutMember} from '@/lib/auth/firebase-client';
import {THEMES,LEVEL_NAMES,type Theme} from '@/lib/game/catalog';
import {JOURNEYS} from '@/lib/game/content';
import {dailySpec,istanbulDay} from '@/lib/game/engine';
import {emptyProgress,loadProgress,mergeProgress,PROGRESS_KEY,streak,collectionStats} from '@/lib/game/progress';
import {SAVE_KEY,validateSave} from '@/lib/game/legacy';
import type {DailyView} from '@/lib/game/server';
import {Sprint} from './Sprint';
import {Arena} from './Arena';
import {Challenges} from './Challenges';
import {Friends} from './Friends';
import {Mystery} from './Mystery';
import {Platform} from './Platform';
import {useCloudProgress} from './useCloudProgress';
import {ProgressAccountNotice} from './ProgressAccountNotice';
import {WorldArt} from './WorldArt';
import {PublishedPlay,PublishedChapters} from './PublishedChapters';
import type {PublishedChapter} from '@/lib/studio/content';
import type {ReleaseSummary} from '@/lib/studio/releases';
import type {ReleasePair} from '@/lib/studio/release-stamps';
import type {ChapterBrowseReturn} from '@/lib/studio/chapter-browse';
import {api,getApi,Help,Modal} from './common';
import {Solo,type SoloConfig} from './Solo';
import {Explore,DailyPage,ProfilePage,type Account} from './Pages';
type Nav='kesfet'|'arena'|'gunluk'|'profil';
type ArenaTab='live'|'challenge'|'friends';
const TABS=[{id:'kesfet' as Nav,label:'Keşfet',icon:Compass},{id:'arena' as Nav,label:'Arena',icon:Swords},{id:'gunluk' as Nav,label:'Günlük',icon:CalendarDays},{id:'profil' as Nav,label:'Albüm',icon:BookOpen}];
export function GameApp({releases=[],releaseCounts={}}:{releases?:ReleaseSummary[];releaseCounts?:Record<string,number>}){
 const membership=useMembership(),bootOwner=useRef('');
 const [authMode,setAuthMode]=useState<AuthMode|null>(null),[authReturn,setAuthReturn]=useState('/');
 const [progress,setProgress]=useState(emptyProgress),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false),[nav,setNav]=useState<Nav>('kesfet');
 const [arenaTab,setArenaTab]=useState<ArenaTab>('live'),[playing,setPlaying]=useState(false),[invites,setInvites]=useState({challenge:'',friend:''});
 const [theme,setTheme]=useState<Theme|null>(null),[solo,setSolo]=useState<SoloConfig|null>(null),[mystery,setMystery]=useState<string|null>(null),[daily,setDaily]=useState<DailyView|null>(null),[help,setHelp]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[account,setAccount]=useState<Account>({authenticated:false});
 const [extra,setExtra]=useState<PublishedChapter|null>(null),[extraPractice,setExtraPractice]=useState(false),[extraPair,setExtraPair]=useState<ReleasePair|undefined>(undefined);
 const themeReturn=useRef<string|null>(null),extraOrigin=useRef<ChapterBrowseReturn|undefined>(undefined);
 const [browseReturn,setBrowseReturn]=useState<ChapterBrowseReturn|undefined>(undefined);
 const [sprint,setSprint]=useState(false);
 const [mapReturn,setMapReturn]=useState(false),[albumReturn,setAlbumReturn]=useState(false);
 const authenticated=account.authenticated,syncStatus=useCloudProgress(account.profile?.id,progress,setProgress,ready);
 const openAuth=(mode:AuthMode='signin')=>{if(account.kind==='guest'){try{sessionStorage.setItem('kt-upgrade-progress',JSON.stringify(progress));}catch{}}const url=new URL(location.href);url.searchParams.set('sekme',nav);if(nav==='arena'&&arenaTab!=='live')url.searchParams.set('mod',arenaTab==='challenge'?'meydan':'arkadaslar');setAuthReturn(safeReturnTo(url.pathname+url.search));setAuthMode(mode);};
 useEffect(()=>{
  let loaded=emptyProgress();try{bootOwner.current=localStorage.getItem(PROGRESS_KEY+':last-user')??'';loaded=loadProgress(localStorage.getItem(bootOwner.current?PROGRESS_KEY+':'+bootOwner.current:PROGRESS_KEY));setProgress(loaded);}catch{setStorageError(true);}
  const query=new URLSearchParams(location.search),tab=query.get('sekme'),challenge=query.get('meydan')?.toUpperCase()??'',friend=query.get('arkadas')?.toUpperCase()??'';
  if(query.has('oda')||tab==='arena'||challenge||friend){setNav('arena');if(challenge||query.get('mod')==='meydan')setArenaTab('challenge');if(friend||query.get('mod')==='arkadaslar')setArenaTab('friends');setInvites({challenge:/^[A-HJ-NP-Z2-9]{10}$/.test(challenge)?challenge:'',friend:/^[A-HJ-NP-Z2-9]{10}$/.test(friend)?friend:''});}
  else if(tab==='gunluk')setNav('gunluk');else if(tab==='profil')setNav('profil');
  else if(!loaded.tutorialDone&&Object.keys(loaded.saves).length===0)setSolo({themeId:'uzay',level:0,tutorial:true,run:Date.now()});
  setReady(true);
 },[]);
 useEffect(()=>{if(!ready||authenticated)return;try{localStorage.setItem(bootOwner.current?PROGRESS_KEY+':'+bootOwner.current:PROGRESS_KEY,JSON.stringify(progress));}catch{setStorageError(true);}},[progress,ready,authenticated]);
 useEffect(()=>{
  if(!membership.ready)return;
  const c=new AbortController();getApi<Account>('',c.signal).then(next=>{
   if(bootOwner.current&&next.profile?.id&&bootOwner.current!==next.profile.id){try{setProgress(loadProgress(localStorage.getItem(PROGRESS_KEY+':'+next.profile.id)));}catch{setProgress(emptyProgress());}}if(next.profile?.id)bootOwner.current=next.profile.id;if(next.authenticated&&next.kind!=='guest'){try{const upgrade=sessionStorage.getItem('kt-upgrade-progress');if(upgrade){setProgress(p=>mergeProgress(p,loadProgress(upgrade)));sessionStorage.removeItem('kt-upgrade-progress');}}catch{}}setAccount(next);
   if(next.needsUsername){setAuthReturn(safeReturnTo(location.pathname+location.search));setAuthMode('username');}
  }).catch(e=>{if(e.name!=='AbortError'&&navigator.onLine)setError('Oyuncu profiline ulaşılamadı. Yeniden deneyebilirsin.');});
  return ()=>c.abort();
 },[membership.revision,nav]);
 const {stars}=collectionStats(progress),dailyStreak=streak(progress.days,istanbulDay());
 const selectNav=(next:Nav)=>{setBrowseReturn(undefined);setNav(next);setError('');setPlaying(false);const url=new URL(location.href);url.searchParams.set('sekme',next);if(next!=='arena'){for(const key of ['oda','meydan','arkadas','mod'])url.searchParams.delete(key);setInvites({challenge:'',friend:''});}history.replaceState(null,'',url.pathname+url.search);window.scrollTo({top:0});window.dispatchEvent(new Event('kt-sync-now'));};
 const openSolo=(config:SoloConfig)=>{setBrowseReturn(undefined);setTheme(null);setMystery(null);setSolo({...config,run:Date.now()});setDaily(null);window.scrollTo({top:0});};
 const back=()=>{if(themeReturn.current){setTheme(THEMES.find(t=>t.id===themeReturn.current)??null);themeReturn.current=null;}if(extra){setBrowseReturn(extraOrigin.current);if(nav==='profil'&&extraOrigin.current?.source!=='album')setAlbumReturn(true);}if(solo?.tutorial)setProgress(p=>({...p,tutorialDone:true}));setExtra(null);setSolo(null);setDaily(null);setMystery(null);window.scrollTo({top:0});window.dispatchEvent(new Event('kt-sync-now'));};
 const startDaily=async()=>{if(!authenticated){openAuth();return;}setBusy(true);setError('');try{const d=await api<DailyView>('daily');setDaily(d);const s=dailySpec(d.day);setSolo({themeId:s.themeId,level:s.level,run:Date.now()});window.scrollTo({top:0});}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 const classic=()=>{let level=0;try{level=validateSave(JSON.parse(localStorage.getItem(SAVE_KEY)??'null'))?.round??0;}catch{}openSolo({themeId:'hababam',level,classic:true});};
 const openChallenge=()=>{selectNav('arena');setArenaTab('challenge');};
 const openMystery=(id:string)=>{setBrowseReturn(undefined);setMystery(id);setTheme(null);window.scrollTo({top:0});};
 const returnToMap=()=>{setBrowseReturn(undefined);back();setNav('kesfet');setMapReturn(true);};
 useEffect(()=>{if(mapReturn&&!solo&&!mystery&&nav==='kesfet'){document.getElementById('kesif-haritasi')?.scrollIntoView({block:'start'});setMapReturn(false);}},[mapReturn,solo,mystery,nav]);
 useEffect(()=>{if(albumReturn&&!extra&&nav==='profil'){document.getElementById('kesif-damgalari')?.scrollIntoView({block:'start'});setAlbumReturn(false);}},[albumReturn,extra,nav]);
 const openExtra=(chapter:PublishedChapter,practice=false,pair?:ReleasePair,origin?:ChapterBrowseReturn)=>{if(!extra){extraOrigin.current=origin;setBrowseReturn(undefined);}if(theme)themeReturn.current=theme.id;else if(!extra)themeReturn.current=null;setExtraPractice(practice);setExtraPair(pair);setExtra(chapter);setTheme(null);window.scrollTo({top:0});};
 const accountNotice=<ProgressAccountNotice inGame={!!(sprint||extra||solo||mystery||playing)} status={syncStatus} onRefresh={()=>location.reload()} onRetry={()=>window.dispatchEvent(new Event('kt-sync-now'))}/>;
 const saveWarning=<>{accountNotice}{(storageError||syncStatus==='storage-error')?<p className="save-warning" role="status">Bu cihazda kayıt yapılamıyor. İlerlemeni korumak için bağlantını ve hesap kaydını kontrol et.</p>:null}</>;
 const wrap=' '+(progress.contrast?'contrast-mode':'');
 if(sprint&&ready)return <div className={'game-app sprint-app'+wrap} data-palette={progress.palette}><Platform consent={progress.analytics} playing/>{saveWarning}<Sprint key={account.profile?.id??'device'} owner={account.profile?.id} progress={progress} onProgress={setProgress} onBack={()=>setSprint(false)}/></div>;
 if(extra&&ready)return <div className={'game-app'+wrap} data-palette={progress.palette}><Platform consent={progress.analytics} playing/>{saveWarning}<PublishedPlay key={extra.id} initialPractice={extraPractice} pair={extraPair} onRelated={(chapter,pair)=>openExtra(chapter,false,pair)} chapter={extra} userId={account.profile?.id} progress={progress} onProgress={setProgress} onBack={back}/></div>;
 if(solo&&ready)return <div className={'game-app'+wrap} data-palette={progress.palette}><Platform consent={progress.analytics} playing/>{saveWarning}<Solo key={`${solo.run}.${solo.themeId}.${solo.level}.${daily?.id??''}`} config={solo} progress={progress} onProgress={setProgress} onBack={solo.journey?returnToMap:back} onMap={returnToMap} onNext={openSolo} daily={daily??undefined}/></div>;
 if(mystery&&ready)return <div className={'game-app'+wrap} data-palette={progress.palette}><Platform consent={progress.analytics} playing/>{saveWarning}<Mystery key={mystery} id={mystery} progress={progress} onProgress={setProgress} onBack={back} onNext={openMystery}/></div>;
 return <div className={'app-shell'+wrap} data-palette={progress.palette}>
  <Platform consent={progress.analytics} playing={playing}/>
  <aside className="sidebar"><button className="brand" onClick={()=>selectNav('kesfet')} aria-label="Kelime Teneffüsü ana sayfa"><span className="brand-mark">Kt<span>.</span></span><span>kelime<br/><b>teneffüsü</b></span></button><span className="sidebar-label">MERAKINA İYİ GELİR.</span><nav aria-label="Ana gezinme">{TABS.map(t=><button key={t.id} className={nav===t.id?'active':''} onClick={()=>selectNav(t.id)} aria-current={nav===t.id?'page':undefined}><t.icon size={21}/><span>{t.label}</span>{t.id==='gunluk'&&!progress.days.includes(istanbulDay())&&<i className="new-discovery-dot"/>}</button>)}</nav><div className="sidebar-bottom"><div className="small-chalk"><Sparkles size={26}/><p>Bir kelime bul.<br/><em>Kafanı dağıt.</em></p><span>Her gün küçük bir keşif.</span></div><button className="sidebar-help" onClick={()=>setHelp(true)}><HelpCircle size={18}/>Nasıl oynanır?</button><small>Merakla yapıldı. Keyifle oynanır.</small></div></aside>
  <div className="main-area">{!playing&&<header className="topbar"><button className="mobile-brand" onClick={()=>selectNav('kesfet')}><span className="brand-mark">Kt<span>.</span></span><b>kelime teneffüsü</b></button><div className="breadcrumb"><span>Küçük bir mola</span><ChevronRight size={14}/><b>{TABS.find(t=>t.id===nav)?.label}</b></div><div className="topbar-right"><span className="streak-badge" title="Günlük oyun serisi"><Flame size={17}/>{dailyStreak}</span><span className="star-badge" title="Kazanılan yıldızlar"><Star size={17}/>{stars}</span>{authenticated?<button className={'profile-avatar frame-'+progress.palette} onClick={()=>selectNav('profil')} aria-label="Oyuncu profilini aç">{account.profile?.nickname.slice(0,1)??'K'}</button>:<button className="auth-nav-button register" onClick={()=>openAuth('signin')}><User size={16}/>Giriş yap</button>}</div></header>}
  <main className={'main-content'+(playing?' arena-is-playing':'')} id="game-main">{accountNotice}{(storageError||syncStatus==='storage-error')&&<div className="error-box" role="status">Bu tarayıcıda kayıt alanı kullanılamıyor. İlerlemeni korumak için hesabınla giriş yapabilirsin.</div>}{error&&nav!=='gunluk'&&<p className="error-box" role="alert">{error}</p>}{membership.user&&!membership.user.emailVerified&&<div className="auth-banner"><span>Kalıcı hesabın için e-posta adresini doğrula.</span><button className="text-button" onClick={()=>openAuth('verify')}>Doğrulamaya devam et</button></div>}
   {nav==='kesfet'&&<Explore userId={account.profile?.id} releases={releases} releaseCounts={releaseCounts} onSprint={()=>{setBrowseReturn(undefined);setSprint(true);}} progress={progress} setTheme={setTheme} openSolo={openSolo} setNav={selectNav} classic={classic} onMystery={openMystery} onChallenge={openChallenge} onExtra={openExtra} browseReturn={browseReturn}/>}
   {nav==='arena'&&<>{!playing&&<div className="arena-tabs" aria-label="Birlikte oynama seçenekleri">{[{id:'live' as const,label:'Canlı düello',Icon:Swords},{id:'challenge' as const,label:'Meydan okuma',Icon:Compass},{id:'friends' as const,label:'Arkadaşlar',Icon:User}].map(tab=><button key={tab.id} className={arenaTab===tab.id?'selected':''} aria-pressed={arenaTab===tab.id} onClick={()=>setArenaTab(tab.id)}><tab.Icon size={17}/>{tab.label}</button>)}</div>}{arenaTab==='live'&&<Arena authenticated={authenticated} onLogin={()=>openAuth()} progress={progress} onProgress={setProgress} practice={()=>openSolo({themeId:'uzay',level:0,journey:'uzay-1',practice:true})} onPlaying={setPlaying}/>} {arenaTab==='challenge'&&<Challenges authenticated={authenticated} onLogin={()=>openAuth()} progress={progress} onProgress={setProgress} inviteCode={invites.challenge} onPlaying={setPlaying}/>} {arenaTab==='friends'&&<Friends key={account.profile?.id??'device'} authenticated={authenticated} onLogin={()=>openAuth()} invitation={invites.friend} onDuel={()=>setArenaTab('live')} onChallenge={()=>setArenaTab('challenge')}/>}</>}
   {nav==='gunluk'&&<DailyPage authenticated={authenticated} onLogin={()=>openAuth()} progress={progress} busy={busy} error={error} start={()=>void startDaily()}/>}
   {nav==='profil'&&<ProfilePage account={account} releases={releases} onExtra={openExtra} setAccount={setAccount} onLogin={()=>openAuth('register')} onLogout={async()=>{try{localStorage.removeItem(PROGRESS_KEY+':last-user');}catch{}bootOwner.current='';await signOutMember();if(account.kind==='native'||account.nativeSession){location.assign('/signout-with-chatgpt?return_to=%2F');return;}setAccount({authenticated:false});setProgress(emptyProgress());selectNav('kesfet');}} progress={progress} onProgress={setProgress} syncStatus={syncStatus} onMap={returnToMap} browseReturn={browseReturn}/>}
  </main></div>
  {!playing&&<nav className="mobile-nav" aria-label="Mobil gezinme">{TABS.map(t=><button className={nav===t.id?'active':''} onClick={()=>selectNav(t.id)} key={t.id} aria-current={nav===t.id?'page':undefined}><t.icon size={21}/><span>{t.label}</span></button>)}</nav>}
  {theme&&<Modal title={theme.title} onClose={()=>setTheme(null)}><div className="theme-modal-hero"><WorldArt themeId={theme.id}/><p>{theme.subtitle}</p></div>{JOURNEYS.some(j=>j.themeId===theme.id)&&<><div className="section-title route-section-title"><div><span className="eyebrow">BEŞ DURAKLIK ÖZEL BİR YOLCULUK</span><h3>Keşif rotası</h3></div><Compass size={23}/></div><div className="journey-list">{JOURNEYS.filter(j=>j.themeId===theme.id).map((j,i)=>{const saved=progress.saves['route:'+j.id];return <button className={saved?.complete?'done':''} key={j.id} onClick={()=>openSolo({themeId:theme.id,level:0,journey:j.id,practice:saved?.complete})}><span className="journey-number">{saved?.complete?<Check size={20}/>:String(i+1).padStart(2,'0')}</span><span><b>{j.title}</b><small>{j.words.length} kelime · {j.difficulty}</small></span><span className="journey-stars">{saved?.complete?[0,1,2].map(s=><Star size={12} key={s} fill={saved.stars>s?'currentColor':'none'}/>):<ArrowRight size={19}/>}</span></button>;})}</div></>}
  <details className="classic-levels" open={!JOURNEYS.some(j=>j.themeId===theme.id)}><summary>{JOURNEYS.some(j=>j.themeId===theme.id)?'Altı bölüm daha keşfet':'Bölümünü seç'}<ChevronRight size={18}/></summary><div className="level-grid">{LEVEL_NAMES.map((name,l)=>{const saved=progress.saves[`${theme.id}.${l}`];return <button key={l} className={'level-card'+(saved?.complete?' complete':'')} onClick={()=>openSolo({themeId:theme.id,level:l,practice:saved?.complete})}><span>{String(l+1).padStart(2,'0')}</span><b>{name}</b><small>{5+l} kelime · {l<2?'Rahat':l<4?'Dengeli':'Ustalık'}</small><div>{[0,1,2].map(s=><Star key={s} size={13} fill={(saved?.stars??0)>s?'currentColor':'none'}/>)}</div>{saved?.strokes.length&&!saved.complete?<em>Kaldığın yerden</em>:null}</button>;})}</div></details>{(releaseCounts[theme.id]??0)>0&&<PublishedChapters key={theme.id} userId={account.profile?.id} collection="releases" themeId={theme.id} browseReturn={browseReturn} initialCompanions={releases.filter(c=>c.spec.themeId!==theme.id)} initial={releases.filter(c=>c.spec.themeId===theme.id)} onPlay={openExtra}/>}</Modal>}
  {authMode&&<Modal title={authMode==='register'?'Oyuncu profilin':'Hoş geldin'} onClose={()=>setAuthMode(null)}><EntryPanel initial={authMode} returnTo={authReturn} user={membership.user} available={membership.available} onDone={()=>location.assign(safeReturnTo(authReturn))}/></Modal>}
  {help&&<Help onClose={()=>setHelp(false)}/>} {busy&&<span className="global-busy" role="status"><LoaderCircle size={18} className="spin"/>Günün keşfi hazırlanıyor…</span>}
 </div>;
}
