'use client';
import {hapticsAvailable} from '@/lib/game/haptics';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {ArrowRight,BookOpen,CalendarDays,Check,ChevronDown,Compass,Flame,Lightbulb,LoaderCircle,LockKeyhole,Palette,Search,Settings,ShieldCheck,Smartphone,Sparkles,Star,Swords,Trophy,User,Volume2,VolumeX,WandSparkles,WifiOff,ZoomIn} from 'lucide-react';
import {THEMES,findTheme,LEVEL_NAMES,type Theme} from '@/lib/game/catalog';
import {JOURNEYS,MYSTERIES} from '@/lib/game/content';
import {dailySpec,istanbulDay} from '@/lib/game/engine';
import {collectionStats,streak,type Progress} from '@/lib/game/progress';
import {Rankings} from './Arena';
import {ProgressCloudStatus} from './ProgressCloudStatus';
import {api,Modal} from './common';
import {BoardColorSettings} from './BoardColorSettings';
import {SoundSettings} from './SoundSettings';
import {WorldArt} from './WorldArt';
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
export type LibraryPanel='riddles'|'themes'|'chapters'|null;
export function Explore({journeyView,onJourneyView,lastStoryId,libraryPanel=null,onLibraryPanel,library=false,releases,releaseCounts={},onSprint,userId,progress,setTheme,openSolo,setNav,classic,onMystery,onChallenge,onExtra,browseReturn}:{lastStoryId?:string;libraryPanel?:LibraryPanel;onLibraryPanel?:(panel:LibraryPanel)=>void;journeyView?:'stories'|'journey';onJourneyView?:(view:'stories'|'journey')=>void;library?:boolean;releases:ReleaseSummary[];releaseCounts?:Record<string,number>;onSprint:()=>void;userId?:string;progress:Progress;setTheme:(t:Theme)=>void;openSolo:(c:SoloConfig)=>void;setNav:(n:'kesfet'|'arsiv'|'arena'|'gunluk'|'profil')=>void;classic:()=>void;onMystery:(id:string)=>void;onChallenge:()=>void;onExtra:ChapterSelection;browseReturn?:ChapterBrowseReturn}){
 const [chapterCollection,setChapterCollection]=useState<'studio'|'releases'>(browseReturn?.collection??'releases');
 const [localPanel,setLocalPanel]=useState<LibraryPanel>(null),panel=onLibraryPanel?libraryPanel:localPanel,setPanel=onLibraryPanel??setLocalPanel;
 const [search,setSearch]=useState('');
 const visible=useMemo(()=>THEMES.filter(t=>(t.title+' '+t.subtitle).toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR'))),[search]);
 const nextMystery=MYSTERIES.find(m=>!progress.saves['mystery:'+m.id]?.complete)??MYSTERIES[0]!;
 if(!library)return <JourneyHome lastStoryId={lastStoryId} initialView={journeyView} onViewChange={onJourneyView} progress={progress} onPlay={openSolo} onExplore={()=>setNav('arsiv')} onDaily={()=>setNav('gunluk')}/>;
 return <section className="extra-games page-enter" aria-label="Diğer oyunlar">
 <div className="extra-games-heading"><span>Kısa bir mola</span><h1>Nasıl oynamak istersin?</h1></div>
 <div className="event-menu extra-games-menu">
  <button onClick={onSprint}><Flame/><span><b>Hızlı Tur</b><small>60 saniyelik kelime yarışı</small></span><ArrowRight/></button>
  <button onClick={()=>onMystery(nextMystery.id)}><Lightbulb/><span><b>Gizli Tema</b><small>Kelimelerin ortak konusunu bul</small></span><ArrowRight/></button>
  <button onClick={()=>setPanel('riddles')}><BookOpen/><span><b>İpucu Avı</b><small>Tanımlardan kelimelere</small></span><ArrowRight/></button>
  <button onClick={()=>setPanel('themes')}><Compass/><span><b>Serbest oyun</b><small>Konunu ve zorluğunu seç</small></span><ArrowRight/></button>
  <button onClick={()=>setPanel('chapters')}><CalendarDays/><span><b>Ek bölümler</b><small>Tarih ve konuya göre bütün keşifler</small></span><ArrowRight/></button>
  <button onClick={classic}><Star/><span><b>Klasik bulmaca</b><small>Hababam'ın 20 ismi</small></span><ArrowRight/></button>
 </div>
 <button className="text-button full" onClick={()=>openSolo({themeId:'uzay',level:0,tutorial:true})}>Nasıl oynanır?</button>
 {panel==='riddles'&&<Modal title="İpucu Avı" className="game-library-sheet" onClose={()=>setPanel(null)}><RiddleShelf progress={progress} onPlay={openSolo}/></Modal>}
 {panel==='themes'&&<Modal title="Serbest oyun" className="game-library-sheet" onClose={()=>setPanel(null)}><label className="search-box"><Search size={18}/><input aria-label="Tema ara" placeholder="Konu ara" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="free-theme-list">{visible.map(t=><button key={t.id} onClick={()=>setTheme(t)}><span className="free-theme-art"><WorldArt themeId={t.id}/></span><b>{t.title}</b><ArrowRight size={18}/></button>)}</div>{visible.length===0&&<p className="muted">Bu isimde bir konu bulunamadı.</p>}</Modal>}
 {panel==='chapters'&&<Modal title="Ek bölümler" className="game-library-sheet" onClose={()=>setPanel(null)}><div className="chapter-source-switch" role="group" aria-label="Bölüm arşivi"><button aria-pressed={chapterCollection==='releases'} onClick={()=>setChapterCollection('releases')}>Tarihli keşifler</button><button aria-pressed={chapterCollection==='studio'} onClick={()=>setChapterCollection('studio')}>Ek keşifler</button></div><PublishedChapters key={chapterCollection} userId={userId} collection={chapterCollection} initial={chapterCollection==='releases'?releases:[]} onPlay={onExtra} browseReturn={browseReturn}/></Modal>}
 </section>;
}

export function DailyPage({authenticated,onLogin,progress,busy,error,start}:{authenticated:boolean;onLogin:()=>void;progress:Progress;busy:boolean;error:string;start:()=>void}){
 const today=istanbulDay(),theme=findTheme(dailySpec(today).themeId);
 const days=Array.from({length:7},(_,i)=>{const date=new Date(today+'T12:00:00Z');date.setUTCDate(date.getUTCDate()-6+i);return date.toISOString().slice(0,10);});
 return <section className="daily-page page-enter"><div className="section-intro"><span className="eyebrow">GÜNLÜK BULMACA</span><h1>Bugünün bulmacası</h1><p>Herkes için aynı tahta. Yalnızca bugüne özel.</p></div><div className="daily-studio-card"><WorldArt themeId={theme.id}/><div className="daily-studio-copy"><span className="pill"><CalendarDays size={15}/>{new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',timeZone:'Europe/Istanbul'}).format(new Date())}</span><h2>{theme.title}</h2><p>Sekiz kelimeyi bul, süreni diğer oyuncularla karşılaştır.</p><div className="daily-rules"><span><Check size={16}/>Günde bir sıralama hakkı</span><span><Lightbulb size={16}/>İpucu +15 saniye</span></div><button className="button primary" disabled={busy} onClick={authenticated?start:onLogin}>{busy?<LoaderCircle size={18} className="spin"/>:<ArrowRight size={18}/>} {authenticated?(progress.days.includes(today)?'Bugünkü sonucum':'Günün keşfine başla'):'Oyuncu adını seç'}</button><small className="block-note">Başlattığında süre çalışır. Ekranı kapatsan da devam eder.</small>{error&&<p className="error-box" role="alert">{error}</p>}</div></div>
 <div className="daily-week"><div><Flame size={24}/><span><b>{streak(progress.days,today)} günlük merak</b><small>Her yeni gün, yeni bir başlangıç.</small></span></div><div className="week-dots">{days.map(day=><span className={progress.days.includes(day)?'done':day===today?'today':''} key={day} title={day}>{progress.days.includes(day)?<Check size={17}/>:new Intl.DateTimeFormat('tr-TR',{weekday:'narrow'}).format(new Date(day+'T12:00:00Z'))}</span>)}</div></div><Rankings daily/></section>;
}
export function ProfilePage({openProfile=false,onPlay,account,releases,onExtra,setAccount,onLogin,onLogout,progress,onProgress,syncStatus='local',onMap,onSettings,browseReturn}:{openProfile?:boolean;onPlay?:(config:SoloConfig)=>void;account:Account;releases:ReleaseSummary[];onExtra:ChapterSelection;browseReturn?:ChapterBrowseReturn;onLogin:()=>void;onLogout:()=>Promise<void>;setAccount:(a:Account)=>void;progress:Progress;onProgress:(p:Progress)=>void;syncStatus?:ProgressSaveStatus;onMap:(worldId?:string)=>void;onSettings?:()=>void}){
 const profilePanel=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{if(!openProfile||!profilePanel.current)return;profilePanel.current.open=true;const frame=requestAnimationFrame(()=>{profilePanel.current?.scrollIntoView({block:'start'});profilePanel.current?.querySelector('summary')?.focus({preventScroll:true});});return ()=>cancelAnimationFrame(frame);},[openProfile]);
 const stats=collectionStats(progress),[logoutError,setLogoutError]=useState('');
 return <section className="profile-page page-enter"><header className="collection-heading"><span>Yolculuğundan hatıralar</span><h1>Koleksiyon</h1><p>{stats.stars} yıldız · {stats.completed} bölüm</p></header><div className="section-title"><div><h2>Dünya albümleri</h2><p>Her rotada altı bölüm, bir albüm.</p></div><BookOpen size={24}/></div><DiscoveryAlbums progress={progress} onMap={onMap}/><details ref={profilePanel} className="collection-player"><summary>Oyuncu profili ve istatistikler <ChevronDown size={16}/></summary><div className="profile-header"><span className={'avatar large frame-'+progress.palette}>{account.profile?.nickname.slice(0,1)??'K'}</span><div><span className="eyebrow">{stats.completed>=48?'KELİME USTASI':stats.completed>=12?'MERAKLI GEZGİN':'YENİ BİR KAŞİF'}</span><h2>{account.profile?.nickname??'Kelime avcısı'}</h2>{account.username&&<div className="auth-profile-handle">@{account.username}</div>}<ProgressCloudStatus status={syncStatus} onRetry={()=>window.dispatchEvent(new Event('kt-sync-now'))}/></div>{!account.authenticated&&<button className="button secondary" onClick={onLogin}>Profil oluştur <ArrowRight size={17}/></button>}</div>
 <details className="collection-stats"><summary>İstatistikler <ChevronDown size={16}/></summary> <div className="stat-cards"><div><BookOpen/><b>{stats.completed}</b><span>Tamamlanan keşif</span></div><div><Star/><b>{stats.stars}</b><span>Kazanılan yıldız</span></div><div><Compass/><b>{stats.worlds}</b><span>Uğradığın dünya</span></div><div><Trophy/><b>{account.stats?.wins??0}</b><span>Arena galibiyeti</span></div></div>
 <div className="league-card"><ShieldCheck/><div><b>{(account.rating?.played??0)<5?'Arena’da yerini bul':(account.rating?.value??1000)>=1500?'Kelime ustası':(account.rating?.value??1000)>=1200?'Keskin bakış':'Meraklı yarışmacı'}</b><small>{(account.rating?.played??0)<5?`${account.rating?.played??0}/5 başlangıç düellosu`:'Dereceli düellolarda seviyene yakın rakiplerle eşleşirsin.'}</small></div><strong>{account.rating?.value??1000}<small>Arena puanı</small></strong></div>
</details>
 <section className="settings-card account-settings"><h2><User size={22}/>Oyuncu profilin</h2>{account.profile?<Nickname current={account.profile.nickname} onChange={nickname=>setAccount({...account,profile:{...account.profile!,nickname}})}/>:<><p>Bir ad seçip arkadaşlarınla yarışabilirsin.</p><button className="button primary" onClick={onLogin}>Profil oluştur</button></>}{account.authenticated&&<div className="auth-account">{account.kind==='guest'?<><small>MİSAFİR PROFİLİ</small><p>Bu profil bu tarayıcıda hatırlanır. Çıkış yaptığında tekrar açamazsın.</p><button className="button secondary" onClick={onLogin}>Kalıcı hesabımla devam et</button></>:<><small>{account.kind==='email'?'E-POSTA ADRESİN':'CHATGPT İLE BAĞLI'}</small><p>{account.email}</p></>}<button className="text-button" onClick={async()=>{try{await onLogout();}catch{setLogoutError('Çıkış yapılamadı. Tekrar dene.');}}}>Bu profilden çıkış yap</button>{logoutError&&<p role="alert">{logoutError}</p>}</div>}</section>
</details>
 {onPlay&&<StoryCollection progress={progress} onPlay={onPlay} album/>}
 <section id="kesif-damgalari" className="profile-release-album" aria-label="Tarihli keşif damgaların"><PublishedChapters userId={account.profile?.id} collection="releases" presentation="album" initial={releases} onPlay={onExtra} browseReturn={browseReturn}/></section>
 <section className="badge-section"><div className="section-title"><h2>Küçük başarıların</h2><Sparkles size={23}/></div><div className="achievement-row">{[{name:'İlk Keşif',note:'İlk bölümünü tamamla.',earned:stats.completed>0,Icon:Star},{name:'Gezgin Ruh',note:'Üç farklı dünyaya uğra.',earned:stats.worlds>=3,Icon:Compass},{name:'Bağlantı Ustası',note:'İki Gizli Tema tamamla.',earned:MYSTERIES.filter(m=>progress.saves['mystery:'+m.id]?.complete).length>=2,Icon:Lightbulb},{name:'İlk Düello',note:'Bir Arena galibiyeti kazan.',earned:(account.stats?.wins??0)>0,Icon:Swords}].map(b=><div key={b.name} className={b.earned?'earned':''}><b.Icon/><b>{b.name}</b><small>{b.note}</small>{b.earned&&<Check size={14}/>}</div>)}</div></section>
 <button className="collection-settings-link" onClick={onSettings}><Settings size={21}/><span>Ayarlar</span><ArrowRight size={19}/></button>

 </section>;
}
function Setting({icon,title,note,checked,onClick,disabled=false}:{icon:React.ReactNode;title:string;note:string;checked:boolean;onClick:()=>void;disabled?:boolean}){return <button className="setting-row" role="switch" aria-checked={checked} onClick={onClick} disabled={disabled}>{icon}<span><b>{title}</b><small>{note}</small></span><i className={'switch'+(checked?' on':'')}/></button>;}
function Nickname({current,onChange}:{current:string;onChange:(name:string)=>void}){const [name,setName]=useState(current),[busy,setBusy]=useState(false),[message,setMessage]=useState('');return <form className="nickname-form" onSubmit={async e=>{e.preventDefault();setBusy(true);try{const p=await api<{nickname:string}>('rename',{name});onChange(p.nickname);setMessage('Yeni adın kaydedildi.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}><label htmlFor="nickname">Oyunda görünen adın</label><div className="nickname-input"><input id="nickname" maxLength={20} minLength={2} value={name} onChange={e=>setName(e.target.value)} autoComplete="nickname" required/><button className="button primary" type="submit" disabled={busy||name.trim().length<2}>{busy?'Kaydediliyor…':'Kaydet'}</button></div><p className="muted" role="status">{message||'Diğer oyuncular yalnızca oyuncu adını görür.'}</p></form>;}
