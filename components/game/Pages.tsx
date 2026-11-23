'use client';
import {Row,RowGroup,Window,Tile,Segmented} from '../ui/GameUI';
import {NetworkState} from './NetworkState';
import {arenaTitle,GAME_TERMS} from '@/lib/game/glossary';
import {completedWorldCount} from '@/lib/game/discovery';
import {SectionHeading} from './SectionHeading';
import {BonusLibrary} from './BonusLibrary';
import {WeeklyKeepsakes} from './WeeklyKeepsakes';
import {WordTrail,TrailBadge} from './WordTrail';
import {wordTrail} from '@/lib/game/journey-flow';
import {MechanicGuide} from './MechanicGuide';
import {useEffect,useMemo,useState} from 'react';
import {Hand,ArrowRight,BookOpen,CalendarDays,Check,Clock,Compass,Flame,Lightbulb,LoaderCircle,Search,Settings,Sparkles,Star,Swords,Trophy,User} from 'lucide-react';
import {ACTIVE_THEMES as THEMES,findTheme,LEVEL_NAMES,type Theme} from '@/lib/game/catalog';
import {JOURNEYS,MYSTERIES} from '@/lib/game/content';
import {dailySpec,istanbulDay} from '@/lib/game/engine';
import {collectionStats,foundWordCount,streak,type Progress} from '@/lib/game/progress';
import {Rankings} from './Arena';
import {ProgressCloudStatus} from './ProgressCloudStatus';
import {api,Modal} from './common';
import {WorldArt} from './WorldArt';
import {SceneArt} from './SceneArt';
import {JourneyHome} from './JourneyHome';
import {StoryCollection} from './StoryExperience';
import {RiddleShelf} from './RiddleShelf';
import {DiscoveryMap,DiscoveryAlbums} from './Discovery';
import type {SoloConfig} from './Solo';
import {PublishedChapters} from './PublishedChapters';
import type {ReleaseSummary} from '@/lib/studio/releases';
import {DailyDiscoveries} from './DailyDiscoveries';
import type {ProgressSaveStatus} from '@/lib/game/progress-sync';
import type {ChapterBrowseReturn,ChapterSelection} from '@/lib/studio/chapter-browse';
export type Account={authenticated:boolean;kind?:'guest'|'native'|'email';nativeSession?:boolean;needsUsername?:boolean;needsVerification?:boolean;username?:string;email?:string;profile?:{id:string;nickname:string};stats?:{played:number;wins:number;score:number};rating?:{value:number;played:number}};
export type LibraryPanel='riddles'|'themes'|'chapters'|'bonus'|'stories'|'other'|null;
export function Explore({onDetails,onAlbums,journeyView,onJourneyView,lastStoryId,libraryPanel=null,onLibraryPanel,library=false,releases,releaseCounts={},onSprint,userId,progress,setTheme,openSolo,setNav,classic,onMystery,onChallenge,onExtra,browseReturn}:{onAlbums:()=>void;onDetails:()=>void;lastStoryId?:string;libraryPanel?:LibraryPanel;onLibraryPanel?:(panel:LibraryPanel)=>void;journeyView?:'stories'|'journey';onJourneyView?:(view:'stories'|'journey')=>void;library?:boolean;releases:ReleaseSummary[];releaseCounts?:Record<string,number>;onSprint:()=>void;userId?:string;progress:Progress;setTheme:(t:Theme)=>void;openSolo:(c:SoloConfig)=>void;setNav:(n:'kesfet'|'arsiv'|'arena'|'gunluk'|'profil')=>void;classic:()=>void;onMystery:(id:string)=>void;onChallenge:()=>void;onExtra:ChapterSelection;browseReturn?:ChapterBrowseReturn}){
 const [chapterCollection,setChapterCollection]=useState<'studio'|'releases'>(browseReturn?.collection??'releases');
 const [localPanel,setLocalPanel]=useState<LibraryPanel>(null),panel=onLibraryPanel?libraryPanel:localPanel,setPanel=onLibraryPanel??setLocalPanel;
 const [search,setSearch]=useState('');
 const visible=useMemo(()=>THEMES.filter(t=>(t.title+' '+t.subtitle).toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR'))),[search]);
 const nextMystery=MYSTERIES.find(m=>!progress.saves['mystery:'+m.id]?.complete)??MYSTERIES[0]!;
 if(!library)return <JourneyHome onArena={()=>setNav('arena')} onAlbums={onAlbums} onDetails={onDetails} lastStoryId={lastStoryId} initialView={journeyView} onViewChange={onJourneyView} progress={progress} onPlay={openSolo} onExplore={()=>setNav('arsiv')} onDaily={()=>setNav('gunluk')}/>;
 return <Window title="Oyunlar" className="games-window" onClose={()=>setNav('kesfet')}>
 <div className="kt-tiles">
  <Tile icon={<CalendarDays/>} tone="purple" badge={progress.days.includes(istanbulDay())?undefined:'BUGÜN'} title="Günlük bulmaca" note={progress.days.includes(istanbulDay())?'Bugün tamamlandı':'Herkese aynı tahta'} onClick={()=>setNav('gunluk')}/>
  <Tile icon={<Flame/>} tone="gold" title="Hızlı tur" note="60 saniyede en çok" onClick={onSprint}/>
  <Tile icon={<BookOpen/>} tone="teal" title="Hikâyeler" note="Beş kısa hikâye" onClick={()=>setPanel('stories')}/>
  <Tile icon={<Lightbulb/>} tone="rose" title="Gizli tema" note="Ortak konuyu bul" onClick={()=>onMystery(nextMystery.id)}/>
  <Tile icon={<Search/>} tone="blue" title="İpucu avı" note="Tanımdan kelimeye" onClick={()=>setPanel('riddles')}/>
  <Tile icon={<Compass/>} tone="green" title="Serbest oyun" note="Konu ve zorluk seç" onClick={()=>setPanel('themes')}/>
 </div>
 <RowGroup>
  <Row icon={<CalendarDays/>} title="Ek bölümler" note="Tarih ve konuya göre bütün ek bölümler" onClick={()=>setPanel('chapters')}/>
  <Row icon={<Hand/>} title="Alıştırma" note="Çizmeyi baştan dene" onClick={()=>openSolo({themeId:'uzay',level:0,tutorial:true})}/>
  <Row icon={<Flame/>} title="Bonus turları" onClick={()=>setPanel('bonus')}/>
 </RowGroup>

 {panel==='bonus'&&<Modal title="Bonus turları" className="game-library-sheet game-tools-modal" onClose={()=>setPanel(null)}><BonusLibrary progress={progress} onPlay={openSolo}/></Modal>}
 {panel==='stories'&&<Modal title="Hikâyeler" className="game-library-sheet game-tools-modal" onClose={()=>setPanel(null)}><StoryCollection progress={progress} onPlay={openSolo}/></Modal>}
 {panel==='riddles' &&<Modal title="İpucu avı" className="game-library-sheet game-tools-modal" onClose={()=>setPanel(null)}><RiddleShelf progress={progress} onPlay={openSolo}/></Modal>}
 {panel==='themes'&&<Modal title="Serbest oyun" className="game-library-sheet game-tools-modal" onClose={()=>setPanel(null)}><label className="search-box"><Search size={18}/><input aria-label="Tema ara" placeholder="Konu ara" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="free-theme-list">{visible.map(t=><button key={t.id} onClick={()=>setTheme(t)}><span className="free-theme-art"><WorldArt themeId={t.id}/></span><b>{t.title}</b><ArrowRight size={18}/></button>)}</div>{visible.length===0&&<p className="muted">Bu isimde bir konu bulunamadı.</p>}</Modal>}
 {panel==='chapters'&&<Modal title="Ek bölümler" className="game-library-sheet game-tools-modal" onClose={()=>setPanel(null)}><div className="chapter-source-switch" role="group" aria-label="Bölüm arşivi"><button aria-pressed={chapterCollection==='releases'} onClick={()=>setChapterCollection('releases')}>Tarihli bölümler</button><button aria-pressed={chapterCollection==='studio'} onClick={()=>setChapterCollection('studio')}>Ek bölümler</button></div><PublishedChapters key={chapterCollection} userId={userId} collection={chapterCollection} initial={chapterCollection==='releases'?releases:[]} onPlay={onExtra} browseReturn={browseReturn}/></Modal>}
 </Window>;
}

export function DailyPage({progress,onProgress,busy,error,start}:{authenticated:boolean;onLogin:()=>void;progress:Progress;onProgress?:(p:Progress)=>void;busy:boolean;error:string;start:()=>void}){
 const [intro,setIntro]=useState(false);
 const begin=()=>{if(!progress.days.length&&!progress.mechanicGuides?.includes('daily'))setIntro(true);else start();};
 const today=istanbulDay(),theme=findTheme(dailySpec(today).themeId);
 const days=Array.from({length:7},(_,i)=>{const date=new Date(today+'T12:00:00Z');date.setUTCDate(date.getUTCDate()-6+i);return date.toISOString().slice(0,10);});
 return <section className="daily-page page-enter"><SectionHeading title="Günlük bulmaca" detail="Herkes için aynı tahta. Her gün yeni kelimeler."/><div className="daily-studio-card"><SceneArt theme={theme.id}/><div className="daily-studio-copy"><span className="pill"><CalendarDays size={15}/>{new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',timeZone:'Europe/Istanbul'}).format(new Date())}</span><h2>{theme.title}</h2><p>Sekiz kelimeyi bul, süreni diğer oyuncularla karşılaştır.</p><div className="daily-rules"><span><Check size={16}/>Günde bir sıralama hakkı</span><span><Lightbulb size={16}/>İpucu +15 saniye</span></div><button className="button primary" data-start-play={!progress.days.includes(today)||undefined} disabled={busy} onClick={begin}>{busy?<LoaderCircle size={18} className="spin"/>:<ArrowRight size={18}/>} {progress.days.includes(today)?'Bugünkü sonucum':'Başla'}</button><small className="block-note">Başlattığında süre çalışır. Ekranı kapatsan da devam eder.</small>{error&&<p className="error-box" role="alert">{error}</p>}</div></div>
 <div className="daily-week"><div><Flame size={24}/><span><b>{streak(progress.days,today)} günlük seri</b><small>Oynadığın günler burada işaretlenir.</small></span></div><div className="week-dots">{days.map(day=><span className={progress.days.includes(day)?'done':day===today?'today':''} key={day} title={day}>{progress.days.includes(day)?<Check size={17}/>:new Intl.DateTimeFormat('tr-TR',{weekday:'narrow'}).format(new Date(day+'T12:00:00Z'))}</span>)}</div></div><Rankings daily/>{intro&&<MechanicGuide kind="daily" onClose={()=>setIntro(false)} onStart={()=>{setIntro(false);onProgress?.({...progress,mechanicGuides:[...new Set([...(progress.mechanicGuides??[]),'daily' as const])]});start();}}/>}</section>;
}
export function ProfilePage({onHome,onArena,serviceError='',onServiceRetry,openProfile=false,onPlay,account,releases,onExtra,setAccount,onLogin,onLogout,progress,onProgress,syncStatus='local',onMap,onSettings,browseReturn}:{serviceError?:string;onServiceRetry?:()=>void;openProfile?:boolean;onPlay?:(config:SoloConfig)=>void;account:Account;releases:ReleaseSummary[];onExtra:ChapterSelection;browseReturn?:ChapterBrowseReturn;onLogin:()=>void;onLogout:()=>Promise<void>;setAccount:(a:Account)=>void;progress:Progress;onProgress:(p:Progress)=>void;syncStatus?:ProgressSaveStatus;onMap:(worldId?:string)=>void;onSettings?:()=>void;onHome?:()=>void;onArena?:()=>void}){
 const [tab,setTab]=useState<'profile'|'journey'|'achievements'>('profile');
 useEffect(()=>{setTab('profile');},[openProfile]);
 const stats=collectionStats(progress),[logoutError,setLogoutError]=useState('');
 const words=useMemo(()=>foundWordCount(progress.saves),[progress.saves]);
 const nickname=account.profile?.nickname||'Kelime avcısı';
 return <Window className="profile-window" title="Profil" onClose={()=>onHome?.()} footer={<ProgressCloudStatus status={syncStatus} onRetry={()=>window.dispatchEvent(new Event('kt-sync-now'))}/>}>
 <header className="kt-profile-card"><span className="kt-profile-avatar">{progress.trailBadge&&wordTrail(progress).earned.some(t=>t.id===progress.trailBadge)?<TrailBadge id={progress.trailBadge} size={34}/>:nickname.charAt(0)}</span><div><h3>{nickname}</h3>{account.username&&<small>@{account.username}</small>}</div></header>
 <Segmented label="Profil bölümleri" items={[{id:'profile',label:'Profil'},{id:'journey',label:'Yolculuk'},{id:'achievements',label:'Başarımlar'}] as const} value={tab} onChange={setTab}/>
 {tab==='journey'&&<section role="tabpanel" id="collection-panel-journey" aria-labelledby="collection-tab-journey"><RowGroup title="Yolculuk"><Row icon={<Compass/>} title="Dünyalarım" note={completedWorldCount(progress)+' dünya tamamlandı'} onClick={()=>onMap()}/></RowGroup></section>}
 {tab==='profile'&&<section role="tabpanel" id="collection-panel-profile" aria-labelledby="collection-tab-profile">
 <h3 className="kt-caption">İstatistikler</h3><div className="kt-stats">{[
  {Icon:BookOpen,value:stats.completed,label:'Tamamlanan bölüm'},{Icon:Star,value:stats.stars,label:'Kazanılan yıldız'},
  {Icon:Compass,value:words,label:'Bulunan kelime'},{Icon:Flame,value:streak(progress.days,istanbulDay())+' gün',label:'Günlük seri'}
 ].map(({Icon,value,label})=><div key={label}><span className="kt-icon"><Icon/></span><strong>{value}</strong><small>{label}</small></div>)}</div>
 <RowGroup title="Arena">{serviceError?<NetworkState compact onRetry={onServiceRetry??(()=>{})}/>:<Row icon={<Trophy/>} title={account.rating?arenaTitle(account.rating.value)+' · '+account.rating.value+' puan':'Arena'} note={account.stats?account.stats.wins+' galibiyet · '+account.stats.played+' maç':'Kelime yarışına katıl'} onClick={onArena}/>}</RowGroup>
 <section className="settings-card account-settings"><h2><User size={22}/>Oyuncu profilin</h2>{account.profile?<Nickname current={account.profile.nickname} onChange={nickname=>setAccount({...account,profile:{...account.profile!,nickname}})}/>:<><p>Bir ad seçip arkadaşlarınla yarışabilirsin.</p><button className="button primary" onClick={onLogin}>Profil oluştur</button></>}{account.authenticated&&<div className="auth-account">{account.kind==='guest'?<><small>MİSAFİR PROFİLİ</small><p>Bu profil bu tarayıcıda hatırlanır. Çıkış yaptığında tekrar açamazsın.</p><button className="button secondary" onClick={onLogin}>Kalıcı hesabımla devam et</button></>:<><small>{account.kind==='email'?'E-POSTA ADRESİN':'CHATGPT İLE BAĞLI'}</small><p>{account.email}</p></>}<button className="text-button" onClick={async()=>{try{await onLogout();}catch{setLogoutError('Çıkış yapılamadı. Tekrar dene.');}}}>Bu profilden çıkış yap</button>{logoutError&&<p role="alert">{logoutError}</p>}</div>}</section>
</section>}{tab==='achievements'&&<section role="tabpanel" id="collection-panel-achievements" aria-labelledby="collection-tab-achievements"><WeeklyKeepsakes progress={progress}/><WordTrail progress={progress} onSelect={id=>onProgress({...progress,trailBadge:id})}/>
 <section className="badge-section"><div className="section-title"><h2>Küçük başarıların</h2><Sparkles size={23}/></div><div className="achievement-row">{[{name:'İlk bölüm',note:'İlk bölümünü tamamla.',earned:stats.completed>0,Icon:Star},{name:'Gezgin Ruh',note:'Üç farklı konuda bölüm tamamla.',earned:stats.worlds>=3,Icon:Compass},{name:'Bağlantı Ustası',note:'İki Gizli tema tamamla.',earned:MYSTERIES.filter(m=>progress.saves['mystery:'+m.id]?.complete).length>=2,Icon:Lightbulb},{name:'İlk Düello',note:'Bir Arena galibiyeti kazan.',earned:(account.stats?.wins??0)>0,Icon:Swords}].map(b=><div key={b.name} className={b.earned?'earned':''}><b.Icon/><b>{b.name}</b><small>{b.note}</small>{b.earned&&<Check size={14}/>}</div>)}</div></section></section>}
 <button className="collection-settings-link" onClick={onSettings}><Settings size={21}/><span>Ayarlar</span><ArrowRight size={19}/></button>

 </Window>;
}
function Nickname({current,onChange}:{current:string;onChange:(name:string)=>void}){const [name,setName]=useState(current),[busy,setBusy]=useState(false),[message,setMessage]=useState('');return <form className="nickname-form" onSubmit={async e=>{e.preventDefault();setBusy(true);try{const p=await api<{nickname:string}>('rename',{name});onChange(p.nickname);setMessage('Yeni adın kaydedildi.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}><label htmlFor="nickname">Oyunda görünen adın</label><div className="nickname-input"><input id="nickname" maxLength={20} minLength={2} value={name} onChange={e=>setName(e.target.value)} autoComplete="nickname" required/><button className="button primary" type="submit" disabled={busy||name.trim().length<2}>{busy?'Kaydediliyor…':'Kaydet'}</button></div><p className="muted" role="status">{message||'Diğer oyuncular yalnızca oyuncu adını görür.'}</p></form>;}

export function JourneyAlbums({progress,onMap,onPlay,account,releases,onExtra,browseReturn}:Pick<Parameters<typeof ProfilePage>[0],'progress'|'onMap'|'onPlay'|'account'|'releases'|'onExtra'|'browseReturn'>){return <div className="journey-albums"><div className="section-title"><div><h2>Dünya albümleri</h2><p>Her dünyada altı bölüm, bir albüm.</p></div><BookOpen size={24}/></div><DiscoveryAlbums progress={progress} onMap={onMap}/>{onPlay&&<StoryCollection progress={progress} onPlay={onPlay} album/>}<section id="kesif-damgalari" className="profile-release-album" aria-label="Ek bölüm damgaların"><PublishedChapters userId={account.profile?.id} collection="releases" presentation="album" initial={releases} onPlay={onExtra} browseReturn={browseReturn}/></section></div>;}
