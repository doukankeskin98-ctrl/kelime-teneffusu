'use client';
import {inviteLink,shareMessage,shareSucceeded} from '@/lib/platform/sharing';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowLeft,ArrowRight,Check,Clock,Copy,Flag,Link2,LoaderCircle,Play,Share2,Star,Trophy,Users,Volume2,VolumeX} from 'lucide-react';
import {ACTIVE_THEMES,findTheme} from '@/lib/game/catalog';
import {match,timeLabel,type Cell,type Stroke} from '@/lib/game/engine';
import type {Progress} from '@/lib/game/progress';
import type {ChallengeView,SocialOverview} from '@/lib/game/social';
import {track} from '@/lib/game/telemetry';
import {getSocial,MatchTools,Modal,PlayLayout,shareLink,socialApi,useChime,WordList} from './common';
import {SceneArt} from './SceneArt';
import {sceneForTheme} from '@/lib/game/scene';
import {useResultPresentation} from './useResultPresentation';
import {CompetitionHud} from './CompetitionHud';
import {newerChallenge} from '@/lib/game/challenge-state';
import type {ChallengeChoice} from '@/lib/game/challenge-content';

type Preview={title?:string;code:string;themeId:string;nickname:string;ready:boolean};
export function Challenges({authenticated,onLogin,progress,onProgress,inviteCode='',onPlaying}:{authenticated:boolean;onLogin:()=>void;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;inviteCode?:string;onPlaying?:(playing:boolean)=>void}){
 const [view,setView]=useState<ChallengeView|null>(null),[themeId,setThemeId]=useState('all'),[chapterId,setChapterId]=useState('uzay-1'),[catalogue,setCatalogue]=useState<ChallengeChoice[]>([]),[catalogueError,setCatalogueError]=useState(''),[catalogueAttempt,setCatalogueAttempt]=useState(0),[preview,setPreview]=useState<Preview|null>(null),[overview,setOverview]=useState<SocialOverview|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now()),[selection,setSelection]=useState(''),[pending,setPending]=useState<Stroke|null>(null),[share,setShare]=useState(''),[code,setCode]=useState(inviteCode),[review,setReview]=useState(false),[exit,setExit]=useState(false),[help,setHelp]=useState(false);
 const result=useResultPresentation(view?.finished!==null&&!!view,view?.id??'none');
 const claimLock=useRef(false),startLock=useRef(false);
 useEffect(()=>{const c=new AbortController();getSocial<{chapters:ChallengeChoice[]}>('?action=catalogue',c.signal).then(data=>{if(!c.signal.aborted){if(!Array.isArray(data.chapters))throw new Error('Invalid catalogue');setCatalogue(data.chapters);}}).catch(e=>{if(e.name!=='AbortError')setCatalogueError('Bölümler alınamadı. Bağlantını kontrol edip yeniden dene.');});return ()=>c.abort();},[catalogueAttempt]);
 const choices=catalogue.filter(c=>themeId==='all'||c.themeId===themeId),selected=choices.find(c=>c.id===chapterId)??choices[0];
 const offset=useRef(0),chime=useChime(progress.sound,progress.haptics),mounted=useRef(true);
 const currentView=useRef(view);currentView.current=view;
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
 const accept=(next:ChallengeView,allowSwitch=false)=>{if(!mounted.current||!newerChallenge(currentView.current,next,allowSwitch))return;offset.current=next.serverNow-Date.now();currentView.current=next;setView(next);setNow(Date.now()+offset.current);};
 useEffect(()=>{onPlaying?.(!!view);return ()=>onPlaying?.(false);},[!!view]);
 useEffect(()=>{if(!inviteCode)return;const c=new AbortController();setCode(inviteCode);getSocial<Preview>('?action=preview&code='+inviteCode,c.signal).then(setPreview).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return ()=>c.abort();},[inviteCode]);
 useEffect(()=>{if(!authenticated)return;const c=new AbortController();getSocial<SocialOverview>('',c.signal).then(setOverview).catch(()=>{});return ()=>c.abort();},[authenticated,view?.finished]);
 const recover=async()=>{
  const current=currentView.current;if(!current)return;
  try{const next=await challengeRequest(signal=>getSocial<ChallengeView>('?action=challenge&code='+current.code,signal));if(mounted.current&&currentView.current?.id===current.id){accept(next);setError('');}}catch{if(mounted.current&&currentView.current?.id===current.id)setError('Oyun durumu alınamadı. Bağlantını kontrol edip yeniden dene.');}
 };
 useEffect(()=>{
  if(!view||view.finished!==null)return;
  const t=setInterval(()=>setNow(Date.now()+offset.current),200),online=()=>void recover(),visible=()=>{if(!document.hidden)void recover();};
  window.addEventListener('online',online);window.addEventListener('kt-app-resume',online);document.addEventListener('visibilitychange',visible);
  return ()=>{clearInterval(t);window.removeEventListener('online',online);window.removeEventListener('kt-app-resume',online);document.removeEventListener('visibilitychange',visible);};
 },[view?.id,view?.finished]);
 const start=async(nextCode?:string)=>{
  if(!authenticated){onLogin();return;}if(startLock.current||claimLock.current||!nextCode&&!selected)return;
  startLock.current=true;setBusy(true);setError('');
  try{const next=await challengeRequest(signal=>socialApi<ChallengeView>(nextCode?'start':'create',nextCode?{code:nextCode}:{chapterId:selected!.id},signal));if(!mounted.current)return;accept(next,true);setReview(false);setSelection('');track('challenge_start');window.scrollTo({top:0});}
  catch(e){if(mounted.current)setError((e as Error).message);}finally{startLock.current=false;if(mounted.current)setBusy(false);}
 };
 const claim=async(a:Cell,b:Cell)=>{
  if(!view||claimLock.current||view.finished!==null)return;const target=match(view.board,a,b);if(!target){chime('miss');setSelection('Bir başka yönden bak.');track('selection_miss');return;}if(view.strokes.some(s=>s.id===target.id))return;
  if(view.strokes.length+1===view.board.targets.length)result.prepare();
  claimLock.current=true;setPending({id:target.id,a,b});setBusy(true);setError('');chime();
  try{const next=await challengeRequest(signal=>socialApi<ChallengeView>('claim',{code:view.code,a,b},signal));if(!mounted.current||currentView.current?.id!==view.id)return;const confirmed=currentView.current.finished===null&&!currentView.current.strokes.some(s=>s.id===target.id)&&next.id===view.id&&next.strokes.some(s=>s.id===target.id);accept(next);if(confirmed&&next.finished!==null)chime(true);if(next.finished!==null){setReview(false);track('challenge_complete',next.duration);}}
  catch(e){if(mounted.current&&currentView.current?.id===view.id){result.skip();setError((e as Error).message);void recover();}}finally{claimLock.current=false;if(mounted.current){setPending(null);setBusy(false);}}
 };
 const copy=async()=>{if(!view)return;const id=view.id;setShare('');const result=await shareLink('Aynı tahtada sürelerimizi kapıştıralım!',inviteLink('meydan',view.code));if(!mounted.current||currentView.current?.id!==id||result==='busy')return;setShare(shareMessage(result));if(shareSucceeded(result))track('invite_share');};
 if(view){
  const seconds=view.finished!==null?view.duration/1000:Math.max(0,(now-view.starts)/1000),ghostCount=view.ghost?.timeline.filter(t=>t<=seconds*1000).length??0,done=view.finished!==null;
  const displayed=!done&&pending&&!view.strokes.some(s=>s.id===pending.id)?[...view.strokes,pending]:view.strokes;
  const wordList={board:view.board,strokes:view.strokes,clues:view.clues};
  return <div className="challenge-play"><PlayLayout departing={result.departing&&!review&&!exit&&!help} onSelectLetter={depth=>chime('letter',depth)} wordList={wordList} wordListKey={view.id} wordListUnavailable={exit||help||done&&!review} feedbackPaused={exit||help} localFeedback={done?null:pending} scene={sceneForTheme(view.themeId)} celebrating={done&&result.ready&&!review&&!exit&&!help} readOnly={done} busy={busy} inputBlocked={busy} inputStatus="Kelimen doğrulanıyor. Süre devam ediyor." title={view.title??findTheme(view.themeId).title} kicker="Meydan okuma" onBack={()=>done?setView(null):setExit(true)} board={view.board} strokes={displayed} paused={false} zoom={progress.zoom} onCommit={(a,b)=>void claim(a,b)} preview={selection} onPreview={setSelection} footer={<div className="duel-controls"><span><Flag size={16}/>{view.ghost?'Kayıtlı rakip · İpucusuz':'Süreni oluştur · İpucusuz'}</span>{done&&!result.ready&&<button className="text-button" onClick={result.skip}>Sonuca geç</button>}<MatchTools sound={progress.sound} onSound={()=>{chime(progress.sound?'mute':'enable');onProgress(p=>({...p,sound:!p.sound}));}} zoom={progress.zoom} onZoom={()=>onProgress(p=>({...p,zoom:!p.zoom}))} onHelp={()=>setHelp(true)} finished={done} review={done&&result.ready}/></div>} aside={<><div className="game-note"><Users size={18}/><p>{view.ghost?'Rakibin daha önce oynadı. Burada onun gerçek oyun kaydıyla yarışıyorsun.':'Önce kendi süreni oluştur. Sonra arkadaşlarına gönder; aynı anda çevrimiçi olmanız gerekmez.'}</p></div>{done&&<button className="button primary full" onClick={()=>{result.skip();setReview(false);}}>Sonuç ve davet <Trophy size={18}/></button>}</>}>
   <CompetitionHud seconds={seconds} elapsed leftLabel={new Set(view.board.targets.map(t=>t.group)).size<view.board.targets.length?'Sen · parçalar':'Sen'} leftValue={`${view.strokes.length} / ${view.board.targets.length}`} rightLabel={view.ghost?.nickname??'Rakip yok'} rightValue={view.ghost?`${ghostCount} / ${view.board.targets.length}`:'—'}/>{error&&<p className="error-box" role="alert">{error}<button className="text-button" onClick={()=>void recover()}>Durumu kontrol et</button></p>}
  </PlayLayout>
  {help&&<Modal title="Meydan okuma kuralları" onClose={()=>setHelp(false)}><p>Aynı kodla oynayan herkes aynı tahtayı görür. Kelimeleri istediğin sırayla bulabilirsin; ipucu yoktur.</p><p>Süre tahtayı açınca başlar ve ara verdiğinde de devam eder. Her oyuncunun bir kodda tek süre hakkı vardır.</p><p>Rakip gösteriliyorsa gördüğün çizelge onun daha önce tamamladığı gerçek oyundur.</p><button className="button primary full" onClick={()=>setHelp(false)}>Oyuna dön</button></Modal>}
  {done&&result.ready&&!review&&!exit&&!help&&<Modal scene={sceneForTheme(view.themeId)} className="scene-result celebration-outcome" title={view.ghost&&view.duration<view.ghost.duration?'Bu turda daha hızlıydın!':'Meydan okuma tamam!'} onClose={()=>setReview(true)} footer={<><button className="button primary full" onClick={()=>void copy()}><Share2 size={18}/>Arkadaşıma meydan oku</button>{share&&<p className="center share-notice" role="status">{share}</p>}<button className="text-button full" onClick={()=>{setView(null);setPreview(null);}}>Meydan okumalara dön</button></>}><div className="result-icon"><Trophy size={46}/></div><p className="center">Senin süren <b>{timeLabel(view.duration/1000)}</b></p>{view.ghost&&<p className="center muted">{view.ghost.nickname}: {timeLabel(view.ghost.duration/1000)}</p>}<p className="center muted">Aynı tahtayı bir arkadaşına gönder. Kimin daha hızlı bulduğunu görün.</p><div className="challenge-code"><small>MEYDAN OKUMA KODU</small><b>{view.code}</b></div>{view.results.length>0&&<ol className="mini-ranking">{view.results.map((r,i)=><li key={i}><span>{i+1}. {r.nickname}</span><b>{timeLabel(r.duration/1000)}</b></li>)}</ol>}</Modal>}
  {exit&&<Modal title="Sonra devam edebilirsin" onClose={()=>setExit(false)}><p>Bu meydan okumada süre ara verdiğinde de devam eder. Döndüğünde aynı kodla tahtanı açabilirsin.</p><div className="button-row"><button className="button secondary" onClick={()=>setExit(false)}>Oyuna dön</button><button className="button primary" onClick={()=>{setExit(false);setView(null);}}>Meydan okumalara dön</button></div></Modal>}
  </div>;
 }
 return <section className="challenge-hub page-enter"><header className="subpage-heading"><h1>Meydan okuma</h1><p>Aynı tahtada kendi süreni oluştur. Arkadaşın daha sonra oynasın.</p></header>
 {preview&&<div className="invitation-card"><span className="invitation-symbol"><Users size={27}/></span><div><h3>{preview.nickname} seni bekliyor.</h3><p>{preview.title??findTheme(preview.themeId).title} bölümünde aynı kelimeleri bul.</p></div><button className="button primary" disabled={busy} onClick={()=>void start(preview.code)}>{authenticated?'Meydan okumayı aç':'Bir ad seç ve katıl'}<ArrowRight size={18}/></button></div>}
 <div className="challenge-create-grid"><div className="challenge-create-card"><SceneArt theme={selected?.themeId??'uzay'}/><div className="challenge-create-copy"><h2>Yeni meydan okuma</h2><label htmlFor="challenge-theme">Konu</label><select id="challenge-theme" value={themeId} onChange={e=>setThemeId(e.target.value)}><option value="all">Bütün konular</option>{ACTIVE_THEMES.filter(t=>catalogue.some(c=>c.themeId===t.id)).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select><label htmlFor="challenge-chapter">Bölüm <small>· {choices.length} seçenek</small></label><select id="challenge-chapter" value={selected?.id??''} disabled={!choices.length} onChange={e=>setChapterId(e.target.value)}>{choices.map(c=><option key={c.id} value={c.id}>{c.number?`${c.number}. `:''}{c.title} · {c.words} kelime</option>)}</select>{catalogueError?<p role="alert">{catalogueError}<button className="text-button" onClick={()=>{setCatalogueError('');setCatalogueAttempt(n=>n+1);}}>Yeniden dene</button></p>:!catalogue.length&&<p role="status">Bölümler hazırlanıyor…</p>}<button className="button primary full" disabled={busy||!selected} onClick={()=>void start()}>{busy?<LoaderCircle size={18} className="spin"/>:<Play size={18}/>}Oyna ve meydan oku</button></div></div><div className="friend-card"><Link2 size={30}/><h2>Bir davetin mi var?</h2><p>Arkadaşının 10 karakterli kodunu yaz. Aynı tahtayı açalım.</p><form onSubmit={e=>{e.preventDefault();void start(code);}}><label htmlFor="challenge-code">Meydan okuma kodu</label><input id="challenge-code" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g,'').slice(0,10))} maxLength={10} autoCapitalize="characters" autoComplete="off" placeholder="10 karakterli kod" required/><button className="button secondary full" disabled={busy||code.length!==10}>Katıl <ArrowRight size={18}/></button></form><div className="game-note"><Clock size={18}/><p>Tahtayı başlatınca süre çalışır. Her oyuncunun aynı kodda bir süre hakkı vardır.</p></div></div></div>
 {error&&<p className="error-box" role="alert">{error}</p>}
 {overview&&overview.challenges.length>0&&<section className="recent-challenges"><div className="section-title"><h2>Senin meydan okumaların</h2><Flag size={22}/></div>{overview.challenges.map(c=><button key={c.code} className="recent-challenge" onClick={()=>void start(c.code)}><span className={'small-status'+(c.finished?' done':'')}>{c.finished?<Check size={18}/>:<Play size={18}/>}</span><span><b>{c.title??findTheme(c.themeId).title}</b><small>{c.code} · {c.finished?'Tamamlandı':'Süre devam ediyor'}</small></span><strong>{c.finished?timeLabel(c.duration/1000):'Devam et'}</strong><ArrowRight size={18}/></button>)}</section>}
 </section>;
}

async function challengeRequest<T>(request:(signal:AbortSignal)=>Promise<T>):Promise<T>{
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>;
 try{return await Promise.race([request(controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(new Error('Sunucu yanıtı gecikti. Oyun durumunu kontrol edebilirsin.'));controller.abort();},12000);})]);}finally{clearTimeout(timer!);}
}
