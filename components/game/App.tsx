'use client';
import {encodeProgress} from '@/lib/game/progress-codec';
import {readStoredProgress,writeStoredProgress} from '@/lib/game/progress-storage';
import {GameCenterAccess} from './GameCenterAccess';
import {deferredGameScreen} from './DeferredScreen';
import {SettingsHome} from './SettingsHome';
import {BlockedPlayers} from './PlayerSafety';
import {gameRoute,gameRouteUrl} from '@/lib/game/navigation';
import {SceneArt} from './SceneArt';
import {PlayPreferencesProvider} from './PlayPreferences';
import type {ReactNode} from 'react';
import {ChapterPicker} from './ChapterPicker';
import type {LibraryPanel} from './Pages';
import {attachMenuFeedback} from '@/lib/game/menu-feedback';
import {EXPEDITIONS,discoveryState,expeditionForChapter,expeditionBonusId,expeditionTheme,nextJourneyAfter} from '@/lib/game/discovery';
import {worldNeedsWelcome,wordTrail} from '@/lib/game/journey-flow';
import {TrailBadge} from './WordTrail';
import {livingStory} from '@/lib/game/story-content';
import {isRiddleChapter} from '@/lib/game/riddle-content';
import '@/lib/game/browser-compat';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Settings,ArrowRight,BookOpen,CalendarDays,Check,ChevronRight,Compass,Flame,HelpCircle,House,LoaderCircle,Sparkles,Star,Swords,User} from 'lucide-react';
import {EntryPanel} from '@/components/auth/EntryPanel';
import type {AuthMode} from '@/components/auth/AuthPanel';
import {useMembership} from '@/components/auth/useMembership';
import {safeReturnTo} from '@/lib/auth/shared';
import {signOutMember} from '@/lib/auth/firebase-client';
import {ACTIVE_THEMES as THEMES,LEVEL_NAMES,type Theme} from '@/lib/game/catalog';
import {JOURNEYS} from '@/lib/game/content';
import {dailySpec,istanbulDay} from '@/lib/game/engine';
import {DAILY_REQUEST_TIMEOUT} from '@/lib/game/daily-action';
import {dailyBoardSignature,readDailyPending} from '@/lib/game/daily-pending';
import {requestDaily} from './daily-transport';
import {emptyProgress,loadProgress,mergeProgress,PROGRESS_KEY,streak,collectionStats} from '@/lib/game/progress';
import {SAVE_KEY,validateSave} from '@/lib/game/legacy';
import type {DailyView} from '@/lib/game/server';
import {Arena} from './Arena';
import {Challenges} from './Challenges';
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
import {GameSettings,useComfort} from './GameSettings';
import {Solo,type SoloConfig} from './Solo';
import {Explore,DailyPage,ProfilePage,JourneyAlbums,type Account} from './Pages';
type Nav='kesfet'|'arsiv'|'arena'|'gunluk'|'profil';
type ArenaTab='live'|'challenge'|'friends';
const TABS=[{id:'kesfet' as Nav,label:'Yolculuk',icon:House},{id:'arena' as Nav,label:'Arena',icon:Swords}];
const Sprint=deferredGameScreen('Sprint',async()=>({default:(await import('./Sprint')).Sprint}));
const Friends=deferredGameScreen('Friends',async()=>({default:(await import('./Friends')).Friends}));
const Mystery=deferredGameScreen('Mystery',async()=>({default:(await import('./Mystery')).Mystery}));
const BonusRound=deferredGameScreen('BonusRound',async()=>({default:(await import('./BonusRound')).BonusRound}));
const SupportReport=deferredGameScreen('SupportReport',async()=>({default:(await import('./SupportReport')).SupportReport}));
const DeleteAccount=deferredGameScreen('DeleteAccount',async()=>({default:(await import('./DeleteAccount')).DeleteAccount}));
const PrivacyInfo=deferredGameScreen('PrivacyInfo',async()=>({default:(await import('./PrivacyInfo')).PrivacyInfo}));

export function GameApp({releases=[],releaseCounts={}}:{releases?:ReleaseSummary[];releaseCounts?:Record<string,number>}){
 const [online,setOnline]=useState(true);
 useEffect(()=>{const change=()=>setOnline(typeof navigator==='undefined'||navigator.onLine);change();window.addEventListener('online',change);window.addEventListener('offline',change);return ()=>{window.removeEventListener('online',change);window.removeEventListener('offline',change);};},[]);
 const [profileError,setProfileError]=useState(''),[profileRetry,setProfileRetry]=useState(0);
 const membership=useMembership(),bootOwner=useRef('');
 const [deleting,setDeleting]=useState(false),[blockedList,setBlockedList]=useState(false),[privacy,setPrivacy]=useState(false),[settingsMore,setSettingsMore]=useState(false),[rewardsInfo,setRewardsInfo]=useState(false);
 const {comfort,change:changeComfort}=useComfort(),[settings,setSettings]=useState(false),[support,setSupport]=useState(false);
 const supportOpener=useRef<HTMLButtonElement>(null),supportReturnFocus=useRef(false);
 useEffect(()=>{if(!support&&supportReturnFocus.current){supportReturnFocus.current=false;supportOpener.current?.focus({preventScroll:true});}},[support]);
 const [albumsOpen,setAlbumsOpen]=useState(false);
 const [profileOpen,setProfileOpen]=useState(false),[profileVisit,setProfileVisit]=useState(0);
 const [authMode,setAuthMode]=useState<AuthMode|null>(null),[authReturn,setAuthReturn]=useState('/');
 const [progress,setProgress]=useState(emptyProgress),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false),[nav,setNav]=useState<Nav>('kesfet');
 const feedbackEnabled=useRef(progress.haptics);feedbackEnabled.current=progress.haptics;
 useEffect(()=>attachMenuFeedback(document,()=>feedbackEnabled.current),[]);
 const [libraryPanel,setLibraryPanel]=useState<LibraryPanel>(null),[mapWorld,setMapWorld]=useState<string|null>(null),[lastStoryId,setLastStoryId]=useState<string|undefined>();
 const [journeyView,setJourneyView]=useState<'stories'|'journey'>('journey');
 const [arenaTab,setArenaTab]=useState<ArenaTab>('live'),[playing,setPlaying]=useState(false),[invites,setInvites]=useState({challenge:'',friend:''});
 const [theme,setTheme]=useState<Theme|null>(null),[solo,setSolo]=useState<SoloConfig|null>(null),[mystery,setMystery]=useState<string|null>(null),[daily,setDaily]=useState<DailyView|null>(null),[help,setHelp]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[account,setAccount]=useState<Account>({authenticated:false});
 const [extra,setExtra]=useState<PublishedChapter|null>(null),[extraPractice,setExtraPractice]=useState(false),[extraPair,setExtraPair]=useState<ReleasePair|undefined>(undefined);
 const themeReturn=useRef<string|null>(null),extraOrigin=useRef<ChapterBrowseReturn|undefined>(undefined);
 const [browseReturn,setBrowseReturn]=useState<ChapterBrowseReturn|undefined>(undefined);
 const [sprint,setSprint]=useState(false);
 const [bonus,setBonus]=useState<{worldId:string;next:SoloConfig|null;owner:string|undefined}|null>(null);
 const sceneOwner=useRef(account.profile?.id);useEffect(()=>{if(sceneOwner.current!==account.profile?.id){setBonus(null);sceneOwner.current=account.profile?.id;}},[account.profile?.id]);
 const [albumReturn,setAlbumReturn]=useState(false);
 const liveAccountOwner=useRef(account.profile?.id),dailyLaunch=useRef<{owner:string;controller:AbortController;retired:boolean}|null>(null);liveAccountOwner.current=account.profile?.id;if(dailyLaunch.current&&dailyLaunch.current.owner!==account.profile?.id)dailyLaunch.current.retired=true;
 const cancelDailyLaunch=()=>{const launch=dailyLaunch.current;dailyLaunch.current=null;launch?.controller.abort();setBusy(false);};
 useEffect(()=>{if(dailyLaunch.current?.retired)cancelDailyLaunch();},[account.profile?.id]);
 useEffect(()=>()=>{const launch=dailyLaunch.current;dailyLaunch.current=null;launch?.controller.abort();},[]);
 const authenticated=account.authenticated,syncStatus=useCloudProgress(deleting?undefined:account.profile?.id,progress,setProgress,ready);
 const openAuth=(mode:AuthMode='signin')=>{if(account.kind==='guest'){try{sessionStorage.setItem('kt-upgrade-progress',encodeProgress(progress));sessionStorage.setItem('kt-upgrade-owner',account.profile?.id??'');}catch{}}const url=new URL(location.href);url.searchParams.set('sekme',nav);if(nav==='arena'&&arenaTab!=='live')url.searchParams.set('mod',arenaTab==='challenge'?'meydan':'arkadaslar');setAuthReturn(safeReturnTo(url.pathname+url.search));setAuthMode(mode);};
 useEffect(()=>{
  let loaded=emptyProgress();try{bootOwner.current=localStorage.getItem(PROGRESS_KEY+':last-user')??'';loaded=readStoredProgress(localStorage,bootOwner.current);setProgress(loaded);}catch{setStorageError(true);}
  const route=gameRoute(location.search);setNav(route.nav);setArenaTab(route.section);setInvites(route.invites);
  setReady(true);
 },[]);
 useEffect(()=>{if(!ready||authenticated)return;try{writeStoredProgress(localStorage,bootOwner.current,progress);}catch{setStorageError(true);}},[progress,ready,authenticated]);
 useEffect(()=>{
  if(!membership.ready||!online||!navigator.onLine)return;
  const c=new AbortController();getApi<Account>('',c.signal).then(next=>{
   if(c.signal.aborted)return;
   if(bootOwner.current&&next.profile?.id&&bootOwner.current!==next.profile.id){cancelDailyLaunch();setSolo(null);setMystery(null);setDaily(null);setSprint(false);setExtra(null);setPlaying(false);try{setProgress(readStoredProgress(localStorage,next.profile.id));}catch{setProgress(emptyProgress());}}if(next.profile?.id)bootOwner.current=next.profile.id;if(next.authenticated&&next.kind!=='guest'){try{const upgrade=sessionStorage.getItem('kt-upgrade-progress');if(upgrade){setProgress(p=>mergeProgress(p,loadProgress(upgrade)));sessionStorage.removeItem('kt-upgrade-progress');sessionStorage.removeItem('kt-upgrade-owner');}}catch{}}setAccount(next);setProfileError('');
   if(next.needsUsername){setAuthReturn(safeReturnTo(location.pathname+location.search));setAuthMode('username');}
  }).catch(e=>{if(!c.signal.aborted&&e.name!=='AbortError'&&navigator.onLine)setProfileError('Oyuncu profiline ulaşılamadı. Solo bölümlere devam edebilirsin.');});
  return ()=>c.abort();
 },[membership.ready,membership.revision,nav,online,profileRetry]);
 const {stars}=collectionStats(progress),dailyStreak=streak(progress.days,istanbulDay());
 const selectArena=(next:ArenaTab)=>{setArenaTab(next);setError('');history.replaceState(null,'',gameRouteUrl(location.href,'arena',next));const route=gameRoute(location.search);setInvites(route.invites);window.scrollTo({top:0});};
 const selectNav=(next:Nav)=>{if(next==='profil')setProfileVisit(v=>v+1);setProfileOpen(false);cancelDailyLaunch();setBrowseReturn(undefined);setNav(next);setError('');setPlaying(false);if(next!=='arena')setInvites({challenge:'',friend:''});history.replaceState(null,'',gameRouteUrl(location.href,next,arenaTab));window.scrollTo({top:0});window.dispatchEvent(new Event('kt-sync-now'));};
 useEffect(()=>{const restore=()=>{const route=gameRoute(location.search);cancelDailyLaunch();setNav(route.nav);setArenaTab(route.section);setInvites(route.invites);setSolo(null);setBonus(null);setMystery(null);setDaily(null);setSprint(false);setExtra(null);setPlaying(false);};window.addEventListener('popstate',restore);return ()=>window.removeEventListener('popstate',restore);},[]);
 const rememberJourneyView=(view:'stories'|'journey')=>{setJourneyView(view);try{localStorage.setItem('kt-journey-view-v1:'+(account.profile?.id||bootOwner.current||'device'),view);}catch{/* Navigation remains usable without storage. */}};
 useEffect(()=>{if(!ready)return;let view:'stories'|'journey'='journey';try{const saved=localStorage.getItem('kt-journey-view-v1:'+(account.profile?.id||bootOwner.current||'device'));if(saved==='stories'||saved==='journey')view=saved;}catch{}setJourneyView(view);try{setLastStoryId(localStorage.getItem('kt-last-story-v1:'+(account.profile?.id||bootOwner.current||'device'))??undefined);}catch{}},[ready,account.profile?.id]);
 const playSolo=(config:SoloConfig)=>{if(livingStory(config.journey)){rememberJourneyView('stories');setLastStoryId(config.journey);try{localStorage.setItem('kt-last-story-v1:'+(account.profile?.id||bootOwner.current||'device'),config.journey!);}catch{}}else if(config.campaign)rememberJourneyView('journey');setBrowseReturn(undefined);if(theme&&!config.campaign)themeReturn.current=theme.id;setTheme(null);setMystery(null);setSolo({...config,run:Date.now()});setDaily(null);window.scrollTo({top:0});};
 const openBonus=(worldId:string,next:SoloConfig|null)=>{if(!discoveryState(progress).find(s=>s.expedition.id===worldId)?.complete)return;setSolo(null);setBonus({worldId,next,owner:account.profile?.id});window.scrollTo({top:0});};
 const openSolo=(config:SoloConfig)=>{if(liveAccountOwner.current!==account.profile?.id)return;if(config.bonusWorld){const world=EXPEDITIONS.find(w=>w.id===config.bonusWorld);if(!world)return;const next=nextJourneyAfter(progress,expeditionBonusId(world));openBonus(world.id,next?{themeId:next.themeId,level:0,journey:next.id,campaign:true}:null);return;}if(config.campaign&&config.journey&&worldNeedsWelcome(progress,config.journey)){const world=expeditionForChapter(config.journey);if(world)setProgress(p=>({...p,welcomedWorlds:[...new Set([...(p.welcomedWorlds??[]),world.id])]}));}playSolo(config);};
 const back=()=>{setBonus(null);if(themeReturn.current){setTheme(THEMES.find(t=>t.id===themeReturn.current)??null);themeReturn.current=null;}if(extra){setBrowseReturn(extraOrigin.current);if(albumsOpen&&extraOrigin.current?.source!=='album')setAlbumReturn(true);}setExtra(null);setSolo(null);setDaily(null);setMystery(null);window.scrollTo({top:0});window.dispatchEvent(new Event('kt-sync-now'));if(daily)window.dispatchEvent(new Event('kt-auth-updated'));};
 const startDaily=async()=>{
  const owner=account.profile?.id;if(!authenticated||!owner){openAuth();return;}
  cancelDailyLaunch();const launch={owner,controller:new AbortController(),retired:false};dailyLaunch.current=launch;
  const isCurrent=()=>dailyLaunch.current===launch&&!launch.retired&&liveAccountOwner.current===owner;
  setBusy(true);setError('');let timer:ReturnType<typeof setTimeout>|undefined,onAbort=()=>{};
  const deadline=new Promise<never>((_yes,no)=>{onAbort=()=>no(new Error('Günün keşfi zamanında hazırlanamadı. Yeniden deneyebilirsin.'));launch.controller.signal.addEventListener('abort',onAbort,{once:true});timer=setTimeout(()=>launch.controller.abort(),DAILY_REQUEST_TIMEOUT);});
  try{
   const pending=readDailyPending(()=>sessionStorage,owner);
   const d=await Promise.race([pending?requestDaily(pending.id,owner,null,launch.controller.signal):api<DailyView>('daily',{expectedOwnerId:owner},launch.controller.signal),deadline]);
   if(!isCurrent()||launch.controller.signal.aborted)return;
   if(!d||typeof d.id!=='string'||typeof d.day!=='string'||!d.board||!Array.isArray(d.strokes)||!Number.isFinite(d.serverNow)||!Number.isFinite(d.starts)||!Number.isFinite(d.duration)||!(d.finished===null||typeof d.finished==='number'&&Number.isFinite(d.finished)))throw new Error('Günlük kaydı doğrulanamadı. Yeniden deneyebilirsin.');
   if(pending&&(pending.id!==d.id||pending.day!==d.day||pending.signature!==dailyBoardSignature(d.board)))throw new Error('Bekleyen günlük işlemi bu kayıtla eşleşmedi. Yeni oyun başlatılmadı.');
   setDaily(d);const spec=dailySpec(d.day);setSolo({themeId:spec.themeId,level:spec.level,run:Date.now()});window.scrollTo({top:0});
  }catch(e){if(isCurrent())setError(e instanceof Error?e.message:'Günün keşfi hazırlanamadı.');}
  finally{clearTimeout(timer);launch.controller.signal.removeEventListener('abort',onAbort);if(dailyLaunch.current===launch){dailyLaunch.current=null;setBusy(false);}}
 };
 const classic=()=>{let level=0;try{level=validateSave(JSON.parse(localStorage.getItem(SAVE_KEY)??'null'))?.round??0;}catch{}openSolo({themeId:'hababam',level,classic:true});};
 const openChallenge=()=>{selectNav('arena');selectArena('challenge');};
 const openMystery=(id:string)=>{setBrowseReturn(undefined);setMystery(id);setTheme(null);window.scrollTo({top:0});};
 const returnToMap=(worldId?:string)=>{setBrowseReturn(undefined);back();setMapWorld(worldId??'');};
 useEffect(()=>{if(albumReturn&&!extra&&albumsOpen){document.getElementById('kesif-damgalari')?.scrollIntoView({block:'start'});setAlbumReturn(false);}},[albumReturn,extra,albumsOpen]);
 const openExtra=(chapter:PublishedChapter,practice=false,pair?:ReleasePair,origin?:ChapterBrowseReturn)=>{if(!extra){extraOrigin.current=origin;setBrowseReturn(undefined);}if(theme)themeReturn.current=theme.id;else if(!extra)themeReturn.current=null;setExtraPractice(practice);setExtraPair(pair);setExtra(chapter);setTheme(null);window.scrollTo({top:0});};
 const accountNotice=<ProgressAccountNotice inGame={!!(bonus||sprint||extra||solo||mystery||playing)} status={syncStatus} onRefresh={()=>location.reload()} onRetry={()=>window.dispatchEvent(new Event('kt-sync-now'))}/>;
 const saveWarning=<div className="game-notices">{accountNotice}{(storageError||syncStatus==='storage-error')?<p className="save-warning" role="status">Bu cihazda kayıt yapılamıyor. İlerlemeni korumak için bağlantını ve hesap kaydını kontrol et.</p>:null}</div>;
 const preferences=(children:ReactNode)=><PlayPreferencesProvider value={{haptics:progress.haptics,onHaptics:()=>setProgress(p=>({...p,haptics:!p.haptics})),comfort,onComfort:changeComfort}}>{children}</PlayPreferencesProvider>;
 const wrap=' '+(progress.contrast?'contrast-mode':'');

 if(bonus&&ready&&bonus.owner===account.profile?.id)return preferences(<div className={'game-app journey-session'+wrap} data-palette={progress.palette} data-board-color={progress.boardColor??'white'}><Platform consent={progress.analytics} playing/>{saveWarning}<BonusRound key={(bonus.owner??'device')+':'+bonus.worldId} worldId={bonus.worldId} progress={progress} onProgress={update=>{if(liveAccountOwner.current===bonus.owner)setProgress(update);}} onBack={back} onContinue={()=>{const next=bonus.next;setBonus(null);if(next)openSolo(next);else back();}}/></div>);
 if(sprint&&ready)return preferences(<div className={'game-app sprint-app'+wrap} data-palette={progress.palette} data-board-color={progress.boardColor??'white'}><Platform consent={progress.analytics} playing/>{saveWarning}<Sprint key={account.profile?.id??'device'} owner={account.profile?.id} progress={progress} onProgress={setProgress} onBack={()=>setSprint(false)}/></div>);
 if(extra&&ready)return preferences(<div className={'game-app'+wrap} data-palette={progress.palette} data-board-color={progress.boardColor??'white'}><Platform consent={progress.analytics} playing/>{saveWarning}<PublishedPlay key={extra.id} initialPractice={extraPractice} pair={extraPair} onRelated={(chapter,pair)=>openExtra(chapter,false,pair)} chapter={extra} userId={account.profile?.id} progress={progress} onProgress={setProgress} onBack={back}/></div>);
 if(solo&&ready)return preferences(<div className={'game-app'+(solo.campaign||livingStory(solo.journey)?' journey-session':'')+(livingStory(solo.journey)?' story-session':'')+wrap} data-palette={progress.palette} data-board-color={progress.boardColor??'white'}><Platform consent={progress.analytics} playing/>{saveWarning}<Solo key={`${account.profile?.id??'device'}.${solo.run}.${solo.themeId}.${solo.level}.${daily?.id??''}`} config={solo} ownerId={account.profile?.id} progress={progress} onProgress={update=>{if(liveAccountOwner.current===account.profile?.id)setProgress(update);}} onBack={solo.campaign||isRiddleChapter(solo.journey)||livingStory(solo.journey)?back:solo.journey?returnToMap:back} onMap={solo.campaign||isRiddleChapter(solo.journey)||livingStory(solo.journey)?back:returnToMap} onNext={openSolo} onBonus={openBonus} daily={daily??undefined}/></div>);
 if(mystery&&ready)return preferences(<div className={'game-app'+wrap} data-palette={progress.palette} data-board-color={progress.boardColor??'white'}><Platform consent={progress.analytics} playing/>{saveWarning}<Mystery key={(account.profile?.id??'device')+':'+mystery} id={mystery} progress={progress} onProgress={setProgress} onBack={back} onNext={openMystery}/></div>);
 return preferences(<div className={'app-shell native-shell native-'+nav+(!playing?' native-scene':'')+(!playing&&(nav==='arsiv'||nav==='gunluk'||nav==='arena'&&arenaTab!=='live')?' scene-subpage':'')+(playing?' arena-session':'')+(settings?' settings-open':'')+wrap} data-palette={progress.palette} data-board-color={progress.boardColor??'white'} data-ready={ready}>
  {!ready&&<div className="game-boot" role="status" aria-label="Oyun hazırlanıyor"><span>Kt.</span><b>kelime teneffüsü</b></div>}
  <Platform consent={progress.analytics} playing={playing}/>
  {!playing&&(nav==='arsiv'||nav==='gunluk'||nav==='arena'&&arenaTab!=='live')&&<div className="subpage-scenery" aria-hidden="true"><SceneArt theme={nav==='arena'?'futbol':progress.last?.themeId??'uzay'} journeyId={nav==='arena'?undefined:progress.last?.journey} eager/><div/></div>}
  <div className="main-area">{!playing&&<header className="native-topbar">
   {nav==='arsiv'||nav==='gunluk'||nav==='profil'?<button className="native-icon" onClick={()=>selectNav('kesfet')} aria-label="Yolculuğa dön"><ArrowLeft size={22}/></button>:<button className="native-avatar" onClick={()=>{selectNav('profil');setProfileOpen(true);}} aria-label="Oyuncu profilini aç">{progress.trailBadge&&wordTrail(progress).earned.some(t=>t.id===progress.trailBadge)?<TrailBadge id={progress.trailBadge}/>:account.profile?.nickname.slice(0,1)??'K'}</button>}
   <span className="native-brand">{nav==='arsiv'||nav==='profil'?null:nav==='gunluk'?'Günlük':nav==='arena'?'Arena':<><span>Kelime</span><span>Teneffüsü</span></>}</span>
   <div className="native-top-actions"><button className="native-stars" onClick={()=>setRewardsInfo(true)} aria-label={`${stars} yıldız. Başarı bilgisi`} aria-haspopup="dialog"><Star size={16} fill="currentColor"/>{stars}</button><button className="native-icon" onClick={()=>setSettings(true)} aria-label="Ayarları aç"><Settings size={22}/></button></div>
  </header>}
  <main className={'main-content'+(playing?' arena-is-playing':'')} id="game-main"><div className="game-notices">{accountNotice}{(storageError||syncStatus==='storage-error')&&<div className="error-box" role="status">Bu tarayıcıda kayıt alanı kullanılamıyor. İlerlemeni korumak için hesabınla giriş yapabilirsin.</div>}{profileError&&online&&<p className="error-box dismissible-notice" role="status"><span>{profileError}</span><button className="text-button" onClick={()=>{setProfileError('');setProfileRetry(n=>n+1);}}>Yeniden dene</button></p>}{error&&nav!=='gunluk'&&<p className="error-box dismissible-notice" role="alert"><span>{error}</span><button className="text-button" aria-label="Bildirimi kapat" onClick={()=>setError('')}>Kapat</button></p>}{membership.user&&!membership.user.emailVerified&&<div className="auth-banner"><span>Kalıcı hesabın için e-posta adresini doğrula.</span><button className="text-button" onClick={()=>openAuth('verify')}>Doğrulamaya devam et</button></div>}</div>
   {(nav==='kesfet'||nav==='arsiv')&&<Explore onDetails={()=>setMapWorld('')} libraryPanel={theme?null:libraryPanel} onLibraryPanel={setLibraryPanel} lastStoryId={lastStoryId} journeyView={journeyView} onJourneyView={rememberJourneyView} library={nav==='arsiv'} userId={account.profile?.id} releases={releases} releaseCounts={releaseCounts} onSprint={()=>{setBrowseReturn(undefined);setSprint(true);}} progress={progress} setTheme={setTheme} openSolo={openSolo} setNav={selectNav} classic={classic} onMystery={openMystery} onChallenge={openChallenge} onExtra={openExtra} browseReturn={browseReturn}/>}
   {nav==='arena'&&<>{!playing&&arenaTab!=='live'&&<button className="arena-back text-button" onClick={()=>selectArena('live')}><ArrowLeft size={18}/>Arena’ya dön</button>}{arenaTab==='live'&&<Arena key={account.profile?.id??'guest'} ownerId={account.profile?.id} authenticated={authenticated} onLogin={()=>openAuth()} progress={progress} onProgress={setProgress} practice={()=>openSolo({themeId:'uzay',level:0,journey:'uzay-1',practice:true})} onPlaying={setPlaying} onChallenge={()=>selectArena('challenge')} onFriends={()=>selectArena('friends')}/>} {arenaTab==='challenge'&&<Challenges key={account.profile?.id??'guest'} authenticated={authenticated} onLogin={()=>openAuth()} progress={progress} onProgress={setProgress} inviteCode={invites.challenge} onPlaying={setPlaying}/>} {arenaTab==='friends'&&<Friends key={account.profile?.id??'device'} authenticated={authenticated} onLogin={()=>openAuth()} invitation={invites.friend} onDuel={()=>selectArena('live')} onChallenge={()=>selectArena('challenge')}/>}</>}
   {nav==='gunluk'&&<DailyPage authenticated={authenticated} onLogin={()=>openAuth()} progress={progress} onProgress={setProgress} busy={busy} error={error} start={()=>void startDaily()}/>}
   {nav==='profil'&&<ProfilePage key={profileVisit} openProfile={profileOpen} onPlay={openSolo} account={account} releases={releases} onExtra={openExtra} setAccount={setAccount} onLogin={()=>openAuth('register')} onLogout={async()=>{try{localStorage.removeItem(PROGRESS_KEY+':last-user');}catch{}bootOwner.current='';await signOutMember();if(account.kind==='native'||account.nativeSession){location.assign('/signout-with-chatgpt?return_to=%2F');return;}setAccount({authenticated:false});setProgress(emptyProgress());selectNav('kesfet');}} progress={progress} onProgress={setProgress} syncStatus={syncStatus} onMap={returnToMap} onSettings={()=>setSettings(true)} browseReturn={browseReturn}/>}
  </main></div>
  {!playing&&<nav className="mobile-nav" aria-label="Mobil gezinme">{TABS.map(t=><button className={(nav===t.id||t.id==='kesfet'&&(nav==='arsiv'||nav==='gunluk'))?'active':''} onClick={()=>selectNav(t.id)} key={t.id} aria-current={nav===t.id?'page':undefined}><t.icon size={21}/><span>{t.label}</span></button>)}</nav>}
  {mapWorld!==null&&<ChapterPicker progress={progress} worldId={mapWorld||undefined} onAlbums={()=>{setMapWorld(null);setAlbumsOpen(true);}} onPlay={openSolo} onClose={()=>setMapWorld(null)}/>}
  {albumsOpen&&<Modal title="Albümlerim" className="game-library-sheet game-tools-modal" onClose={()=>setAlbumsOpen(false)}><JourneyAlbums progress={progress} account={account} releases={releases} onExtra={openExtra} onPlay={openSolo} browseReturn={browseReturn} onMap={id=>{setAlbumsOpen(false);returnToMap(id);}}/></Modal>}
  {rewardsInfo&&<Modal title="Yıldızların" className="game-tools-modal reward-info" onClose={()=>setRewardsInfo(false)} footer={<button className="button primary full" onClick={()=>setRewardsInfo(false)}>Anladım</button>}><div className="reward-total"><Star fill="currentColor"/><b>{stars}</b></div><p>Tamamladığın bölümlerdeki en iyi sonuçlarının toplamı. Yıldızlar harcanmaz; tekrar oynarken daha düşük bir sonuç alırsan azalmaz.</p><dl><div><dt>Bölüm yıldızları</dt><dd>İpuçsuz 3, bir ipucuyla 2, iki veya üç ipucuyla 1 yıldız. Süre yıldızları etkilemez.</dd></div><div><dt>Albüm parçaları</dt><dd>Bir dünyadaki bölümleri tamamladıkça resmin parçaları açılır.</dd></div><div><dt>Rozetler</dt><dd>Özel başarılarının hatırası. Kazandıklarını oyuncu profilinde görebilirsin.</dd></div></dl><button className="button secondary full" onClick={()=>{setRewardsInfo(false);setAlbumsOpen(true);}}>Albümlerime bak</button></Modal>}
  {settings&&<div className="settings-scenery" aria-hidden="true"><SceneArt theme={nav==='arena'?'futbol':progress.last?.themeId??'uzay'} journeyId={nav==='arena'?undefined:progress.last?.journey} eager/></div>}
  {settings&&<Modal focusTitleOnChange className={support||privacy||settingsMore?'game-tools-modal settings-sheet':'settings-home'} footer={support||privacy||settingsMore?<button className="button secondary full" onClick={()=>{if(support)supportReturnFocus.current=true;setSupport(false);setPrivacy(false);setSettingsMore(false);}}>Ayarlara dön</button>:undefined} title={support?'Destek':privacy?'Gizlilik ve hesap':settingsMore?'Diğer ayarlar':'Ayarlar'} onClose={()=>{setSettings(false);setSupport(false);setPrivacy(false);setSettingsMore(false);}}>
   {!support&&!privacy&&!settingsMore&&<GameCenterAccess/>}
   {support?<SupportReport/>:privacy?<><DeleteAccount owner={account.profile?.id} kind={account.kind} onBusy={setDeleting} onErased={()=>{bootOwner.current='';setProgress(emptyProgress());}}/>{authenticated&&<button className="button secondary full" onClick={()=>setBlockedList(v=>!v)} aria-expanded={blockedList}>Engellenen oyuncular</button>}{blockedList&&<BlockedPlayers/>}<PrivacyInfo/></>:settingsMore?<GameSettings progress={progress} onProgress={setProgress} comfort={comfort} onComfort={changeComfort}/>:<SettingsHome progress={progress} onProgress={setProgress} comfort={comfort} onComfort={changeComfort} supportRef={supportOpener} onHome={()=>{setSettings(false);selectNav('kesfet');}} onSupport={()=>setSupport(true)} onMore={()=>setSettingsMore(true)} onPrivacy={()=>setPrivacy(true)} onHelp={()=>{setSettings(false);setHelp(true);}}/>}
  </Modal>}
  {theme&&<Modal title={theme.title} className="game-library-sheet game-tools-modal" onClose={()=>setTheme(null)}><p className="muted">Serbest oyun · Zorluğunu seç</p><div className="free-level-list">{LEVEL_NAMES.map((name,l)=>{const saved=progress.saves[`${theme.id}.${l}`];return <button key={l} onClick={()=>openSolo({themeId:theme.id,level:l,practice:saved?.complete})}><span><b>{name}</b><small>{5+l} kelime · {l<2?'Rahat':l<4?'Dengeli':'Ustalık'}</small></span>{saved?.complete?<span aria-label={`${saved.stars} yıldız`}>{[0,1,2].map(i=><Star key={i} size={13} fill={saved.stars>i?'currentColor':'none'}/>)}</span>:<ArrowRight size={18}/>}</button>;})}</div></Modal>}
  {authMode&&<Modal className="game-tools-modal settings-sheet" title={authMode==='register'?'Oyuncu profilin':'Hoş geldin'} onClose={()=>setAuthMode(null)}><EntryPanel initial={authMode} returnTo={authReturn} user={membership.user} available={membership.available} onDone={()=>location.assign(safeReturnTo(authReturn))}/></Modal>}
  {help&&<Help onClose={()=>setHelp(false)} onPractice={()=>{setHelp(false);selectNav('kesfet');openSolo({themeId:'uzay',level:0,tutorial:true});}}/>} {busy&&<span className="global-busy" role="status"><LoaderCircle size={18} className="spin"/>Günün keşfi hazırlanıyor…</span>}
 </div>);
}
