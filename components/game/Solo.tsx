'use client';
import {useEffect,useMemo,useRef,useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {ArrowRight,Check,Clock,Compass,Flag,RefreshCw,Star,Trophy} from 'lucide-react';
import {findTheme,LEVEL_NAMES} from '@/lib/game/catalog';
import {JOURNEYS,journeyById,journeyBoard,TUTORIAL} from '@/lib/game/content';
import {hash,makePuzzle,match,timeLabel,type Cell,type Puzzle,type Stroke} from '@/lib/game/engine';
import {cleanSave,type Progress,type SavedLevel} from '@/lib/game/progress';
import {mergeChapterSave} from '@/lib/studio/chapter-progress';
import {track} from '@/lib/game/telemetry';
import {discoveryState,discoveryRewards,keepBestSave,nextJourneyAfter} from '@/lib/game/discovery';
import {DiscoveryResult} from './Discovery';
import * as legacy from '@/lib/game/legacy';
import type {DailyView} from '@/lib/game/server';
import {DailyActionSession,type DailyActionState,type DailyIntent,type DailyReply} from '@/lib/game/daily-action';
import {dailyIntentStore} from '@/lib/game/daily-pending';
import {requestDaily} from './daily-transport';
import {DailyActionNotice} from './DailyActionNotice';
import {Help,Modal,PlayControls,PlayLayout,useChime,WordList} from './common';
export interface SoloExternal {board:Puzzle;save?:SavedLevel;resume?:SavedLevel;personalBestKnown?:boolean;title:string;note:string;onSave:(save:SavedLevel)=>void;result?:(save:SavedLevel)=>ReactNode}
export interface SoloConfig {themeId:string;level:number;classic?:boolean;journey?:string;tutorial?:boolean;practice?:boolean;run?:number}
function classicBoard(round:number,seed:number):Puzzle {
 const b=legacy.generateBoard(round,seed),def=legacy.ROUNDS[round]!;
 const targets=def.words.flatMap((w,g)=>w.parts.map((text,i)=>({id:`${g}.${i}`,label:w.label,text,group:g})));
 return {version:2,size:b.size,grid:b.grid,targets,placements:b.placements.map(p=>({...targets.find(t=>t.id===p.id)!,a:[p.r,p.c],b:[p.r+p.dr*(p.len-1),p.c+p.dc*(p.len-1)]}))};
}
export function Solo({config,progress,onProgress,onBack,onMap,onNext,external,daily:initialDaily,ownerId}:{ownerId?:string;config:SoloConfig;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;onBack:()=>void;onMap:()=>void;onNext:(config:SoloConfig)=>void;daily?:DailyView;external?:SoloExternal}){
 const journey=journeyById(config.journey??''),progressAtStart=useRef(progress);
 const legacyState=useMemo(()=>{if(!config.classic)return null;try{return legacy.validateSave(JSON.parse(localStorage.getItem(legacy.SAVE_KEY)??'null'))??legacy.freshState(hash('classic-first-game'));}catch{return legacy.freshState(hash('classic-first-game'));}},[config.classic]);
 const [daily,setDaily]=useState(initialDaily),[dailyNow,setDailyNow]=useState(Date.now()),dailyOffset=useRef(initialDaily?initialDaily.serverNow-Date.now():0);
 const board=useMemo(()=>external?.board??daily?.board??(config.tutorial?TUTORIAL:journey?journeyBoard(journey):config.classic?classicBoard(config.level,legacyState!.seed):makePuzzle(config.themeId,config.level,hash(`campaign-v2:${config.themeId}:${config.level}`))),[config.themeId,config.level,config.classic,config.tutorial,journey?.id,legacyState,daily?.id,external?.board]);
 const key=journey?'route:'+journey.id:`${config.themeId}.${config.level}`;
 const previousBest=useRef(external?.save??progress.saves[key]);
 const [save,setSave]=useState<SavedLevel>(()=>external?cleanSave(config.practice?undefined:external.save,board):daily?{strokes:daily.strokes,elapsed:0,hints:daily.hints,complete:daily.finished!==null,stars:3-Math.min(2,daily.hints)}:config.tutorial||config.practice?cleanSave(undefined,board):config.classic?cleanSave({strokes:legacyState!.strokes[config.level]!,elapsed:legacyState!.elapsed[config.level]!,hints:legacyState!.hints[config.level]!,complete:false,stars:0},board):cleanSave(progress.saves[key],board));
 const [foundWord,setFoundWord]=useState<{label:string;count:number}|null>(null),[resultReady,setResultReady]=useState(save.complete);
 const [paused,setPaused]=useState(false),[hint,setHint]=useState<Cell|null>(null),[preview,setPreview]=useState(''),[message,setMessage]=useState(''),[help,setHelp]=useState(false),[review,setReview]=useState(false),[exit,setExit]=useState(false);
 const chime=useChime(progress.sound,progress.haptics),foundRef=useRef(save.strokes),started=useRef(performance.now()),completionTracked=useRef(false);foundRef.current=save.strokes;
 const [dailyAction,setDailyAction]=useState<DailyActionState>({phase:'idle',intent:null}),dailySession=useRef<DailyActionSession|null>(null),dailyOwner=useRef(ownerId),liveOwner=useRef(ownerId),dailyRetired=useRef(false);liveOwner.current=ownerId;if(daily&&ownerId!==dailyOwner.current)dailyRetired.current=true;
 const ownerChanged=!!daily&&(!dailyOwner.current||dailyRetired.current),displayAction:DailyActionState=ownerChanged?{phase:'account-changed',intent:null}:dailyAction;
 const busy=displayAction.phase==='sending'||displayAction.phase==='checking',dailyLocked=!!daily&&(ownerChanged||!dailySession.current||displayAction.phase!=='idle');
 const pending=displayAction.phase==='sending'&&displayAction.intent?.kind==='claim'?displayAction.intent.stroke:null;
 const inputStatus=displayAction.phase==='sending'?(displayAction.intent?.kind==='hint'?'İpucun hazırlanıyor. Süre devam ediyor.':'Kelimen doğrulanıyor. Süre devam ediyor.'):displayAction.phase==='checking'?'Günlük kaydın kontrol ediliyor.':displayAction.phase==='storage-error'?'Önce bu sekmedeki işlem kaydını yeniden dene.':displayAction.phase==='expired'?'Günlük sayfasına dönerek güncel keşfi aç.':ownerChanged?'Güncel profilinle günlük sayfasından yeniden aç.':dailySession.current?'Önce bekleyen işlemi kontrol ederek devam et.':'Günlük oyun hazırlanıyor.';
 const completed=daily?daily.finished!==null:save.complete,theme=findTheme(config.themeId),title=external?.title??(config.tutorial?'İlk küçük keşfin':daily?'Günlük keşfin':journey?.title??(config.classic?legacy.ROUNDS[config.level]!.title:LEVEL_NAMES[config.level]!));
 useEffect(()=>{
  const resume=external?.resume;
  if(!resume||config.practice||!external)return;
  setSave(current=>{const merged=mergeChapterSave(current,resume,external.board);return JSON.stringify(merged)===JSON.stringify(current)?current:merged;});
  if(resume.strokes.some(stroke=>!save.strokes.some(found=>found.id===stroke.id)))
   setMessage('Hesabındaki keşifler bu tahtaya eklendi.');
 },[external?.resume,config.practice,board]);
 useEffect(()=>{if(!completed)return;const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const timer=setTimeout(()=>setResultReady(true),reduce?0:650);return ()=>clearTimeout(timer);},[completed]);
 useEffect(()=>{if(!foundWord)return;const timer=setTimeout(()=>setFoundWord(null),1100);return ()=>clearTimeout(timer);},[foundWord]);
 useEffect(()=>{track('level_start');},[]);
 useEffect(()=>{if(!hint&&!message)return;const timeout=setTimeout(()=>{setHint(null);setMessage('');},3000);return ()=>clearTimeout(timeout);},[hint,message]);
 useEffect(()=>{
  if(daily){const timer=setInterval(()=>setDailyNow(Date.now()),250);return ()=>clearInterval(timer);}
  if(paused||completed||help||exit)return;
  const at=performance.now();let previousTick=0;
  const timer=setInterval(()=>{const tick=Math.floor((performance.now()-at)/1000),delta=tick-previousTick;previousTick=tick;
   if(delta>0)setSave(s=>s.complete?s:{...s,elapsed:s.elapsed+delta});},1000);
  const hide=()=>{if(document.hidden)setPaused(true);};document.addEventListener('visibilitychange',hide);
  return ()=>{clearInterval(timer);document.removeEventListener('visibilitychange',hide);};
 },[paused,completed,help,exit,!!daily]);
 useEffect(()=>{
  if(external){external.onSave(save);return;}
  if(daily){if(daily.finished!==null&&dailyOwner.current&&!dailyRetired.current&&liveOwner.current===dailyOwner.current)onProgress(p=>p.days.includes(daily.day)?p:{...p,days:[...p.days,daily.day]});return;}
  if(config.tutorial){if(save.complete)onProgress(p=>({...p,tutorialDone:true}));return;}
  if(config.classic&&legacyState){if(config.practice)return;legacyState.round=config.level;legacyState.strokes[config.level]=save.strokes;legacyState.found[config.level]=save.strokes.map(s=>s.id);legacyState.hints[config.level]=save.hints;legacyState.elapsed[config.level]=save.elapsed;legacyState.sound=progress.sound;legacyState.zoom=progress.zoom;try{localStorage.setItem(legacy.SAVE_KEY,JSON.stringify(legacyState));}catch{}}
  else if(!config.practice||save.complete)onProgress(p=>{
   const best=keepBestSave(p.saves[key],save);
   return {...p,saves:{...p.saves,[key]:best},last:{themeId:config.themeId,level:config.level,...(journey?{journey:journey.id}:{})}};
  });
 },[save,daily?.finished]);
 useEffect(()=>{if(completed&&!completionTracked.current){completionTracked.current=true;track('level_complete',save.elapsed*1000);window.dispatchEvent(new Event('kt-sync-now'));}},[completed]);
 const acceptDaily=(result:DailyView)=>{foundRef.current=result.strokes;setDaily(result);dailyOffset.current=result.serverNow-Date.now();setSave(s=>({...s,strokes:result.strokes,hints:result.hints,complete:result.finished!==null,stars:result.finished!==null?3-Math.min(2,result.hints):0}));};
 const dailyCallbacks=useRef({receive:acceptDaily,confirmed:(_intent:DailyIntent,_reply:DailyReply)=>{}});
 dailyCallbacks.current={receive:acceptDaily,confirmed:(intent,reply)=>{
  if(intent.kind==='claim'){chime(reply.finished!==null);if(reply.strokes.length===1)track('first_word',performance.now()-started.current);setMessage(intent.label+' bulundu!');setFoundWord({label:intent.label,count:reply.strokes.length});}
  else if(reply.hintCell){setHint(reply.hintCell);setMessage('İlk harfe bak. Sürene +15 saniye.');}
 }};
 useEffect(()=>{
  if(!initialDaily||!dailyOwner.current)return;
  const owner=dailyOwner.current;
  const session:DailyActionSession=new DailyActionSession({id:initialDaily.id,day:initialDaily.day,board:initialDaily.board,isCurrent:()=>!dailyRetired.current&&liveOwner.current===owner&&dailySession.current===session,
   persistence:dailyIntentStore(()=>sessionStorage,owner,initialDaily),request:(intent,signal)=>requestDaily(initialDaily.id,owner,intent,signal),receive:reply=>dailyCallbacks.current.receive(reply),state:setDailyAction,confirmed:(intent,reply)=>dailyCallbacks.current.confirmed(intent,reply)});
  dailySession.current=session;setDailyAction({phase:'idle',intent:null});void session.restore();
  return ()=>{session.dispose();if(dailySession.current===session)dailySession.current=null;};
 },[initialDaily?.id]);
 useEffect(()=>{if(dailyRetired.current)dailySession.current?.dispose();},[ownerId]);
 const commit=async(a:Cell,b:Cell)=>{
  if(paused||completed||dailyLocked)return;
  const target=match(board,a,b);if(!target){setMessage('Bir başka yönden bakmayı dene.');track('selection_miss');return;}
  if(foundRef.current.some(s=>s.id===target.id)){setMessage('Bu kelimeyi zaten buldun.');return;}
  const stroke={id:target.id,a,b},finish=save.strokes.length+1===board.targets.length;
  if(!daily)chime(finish);if(!daily&&!foundRef.current.length)track('first_word',performance.now()-started.current);
  if(daily){setHint(null);void dailySession.current?.act({kind:'claim',stroke,label:target.label});}
  else{const strokes=[...foundRef.current,stroke];foundRef.current=strokes;setSave(s=>{const latest=[...s.strokes,...(s.strokes.some(found=>found.id===stroke.id)?[]:[stroke])],complete=latest.length===board.targets.length;return {...s,strokes:latest,complete,stars:complete?3-Math.min(2,s.hints):0};});setFoundWord({label:target.label,count:strokes.length});setMessage(finish?'Keşif tamamlandı!':config.tutorial?'Tam da böyle! Diğer kelimelere de bak.':target.label+' bulundu · '+(board.targets.length-strokes.length)+' kelime kaldı');}
  setHint(null);
 };
 const useHint=async()=>{
  if(paused||completed||save.hints>=3||dailyLocked)return;
  if(daily){setHint(null);void dailySession.current?.act({kind:'hint',requestId:crypto.randomUUID()});return;}
  const remaining=(board as Puzzle).placements.find(p=>!save.strokes.some(s=>s.id===p.id));if(remaining){setHint(remaining.a);setSave(s=>({...s,hints:s.hints+1}));setMessage('Kelimenin ilk harfi burada.');}
 };
 const seconds=daily?(daily.finished!==null?daily.duration/1000:Math.max(0,(dailyNow+dailyOffset.current-daily.starts)/1000)):save.elapsed;
 const controls=<PlayControls paused={paused} completed={completed} blocked={dailyLocked} busy={busy} onPause={()=>{setHint(null);setPreview('');setPaused(p=>!p);}} zoom={progress.zoom} onZoom={()=>onProgress(p=>({...p,zoom:!p.zoom}))} sound={progress.sound} onSound={()=>onProgress(p=>({...p,sound:!p.sound}))} hints={Math.max(0,3-save.hints)} onHint={()=>void useHint()} onHelp={()=>setHelp(true)} canPause={!daily}/>;
 const tutorialHint=config.tutorial&&!save.strokes.some(s=>s.id===TUTORIAL.targets[0]!.id)?TUTORIAL.placements.find(p=>p.id===TUTORIAL.targets[0]!.id)!.a:null;
 const improved=(!external||external.personalBestKnown===true)&&completed&&!daily&&!config.classic&&!config.tutorial&&previousBest.current?.complete&&(save.stars>previousBest.current.stars||(save.stars===previousBest.current.stars&&save.elapsed<previousBest.current.elapsed));
 const resultProgress=journey?{...progress,saves:{...progress.saves,[key]:keepBestSave(progress.saves[key],save)}}:progress;
 const expedition=journey?discoveryState(resultProgress).find(s=>s.expedition.id===journey.themeId):undefined;
 const rewards=journey&&completed?discoveryRewards(progressAtStart.current,resultProgress):[];
 const nextJourney=journey?nextJourneyAfter(resultProgress,journey.id):null;
 const next=()=>{if(external){onBack();return;}if(config.tutorial){onBack();return;}if(journey){if(nextJourney)onNext({themeId:nextJourney.themeId,level:0,journey:nextJourney.id});else onMap();return;}if(config.level<(config.classic?3:5))onNext({...config,practice:false,level:config.level+1});else onBack();};
 return <><PlayLayout kicker={external?'Yeni keşifler':daily?'Günlük bulmaca · '+daily.day.split('-').reverse().join('.'):config.tutorial?'KÜÇÜK BİR BAŞLANGIÇ':config.classic?'Hababam • Fotoğraftaki 20 isim':`${theme.title} • ${journey?'Keşif rotası':'Bölüm '+(config.level+1)}`} title={title} onBack={()=>daily&&!completed?setExit(true):onBack()} board={board} strokes={pending&&!save.strokes.some(s=>s.id===pending.id)?[...save.strokes,pending]:save.strokes} paused={(!completed&&paused)||(!daily&&(help||exit))} readOnly={completed} inputBlocked={dailyLocked} inputStatus={inputStatus} busy={busy} zoom={progress.zoom} hint={hint??tutorialHint} onCommit={(a,b)=>void commit(a,b)} preview={preview} onPreview={setPreview} footer={controls} effect={foundWord&&<div className={"word-success-burst"+(foundWord.count===board.targets.length?" final-discovery":" word-toast")} key={foundWord.count} aria-hidden="true"><span>✦</span><b>{foundWord.label}</b><small>{foundWord.count===board.targets.length?'Bütün kelimeler tamam!':'Keşfedildi!'}</small><i/><i/><i/><i/></div>} aside={<><div className="panel-heading"><span className="eyebrow">{journey?.clues?'İPUCU AVI · TANIMI ÇÖZ':'KELİMELERİN İZİNDE'}</span><b>{save.strokes.length}<small> / {board.targets.length}</small></b></div><WordList board={board} strokes={save.strokes} clues={journey?.clues}/><div className="game-note"><Flag size={18}/><p>{completed?'Bu keşif tamamlandı. Kelimelerini inceleyebilir veya sonucunu yeniden açabilirsin.':config.tutorial?'KELİME’nin ilk harfini işaretledik. Son harfine kaydır veya iki ucuna dokun. Sonra MERAK ve KEŞİF’i bul.':daily?'Süre ara verdiğinde de devam eder. İpuçları sürene 15 saniye ekler.':external?.note??journey?.note??'Acele yok. Yanlış seçim ceza getirmez. Çaprazlara da bak.'}</p></div>{completed&&<button className="button primary full" onClick={()=>setReview(false)}>Sonucu göster <Trophy size={18}/></button>}</>}>
  <div className="game-status"><span><Clock size={17}/><b>{config.tutorial?'Acele yok':timeLabel(seconds)}</b>{daily&&save.hints>0&&<small>+{save.hints*15} sn</small>}</span><div className="progress-track" role="progressbar" aria-label="Bulunan kelimeler" aria-valuenow={save.strokes.length} aria-valuemin={0} aria-valuemax={board.targets.length}><i style={{width:`${save.strokes.length/board.targets.length*100}%`}}/></div><span><Star size={17}/>{3-Math.min(2,save.hints)}</span></div>
  <p className="game-message" role="status">{message||journey?.subtitle||(config.tutorial?'KELİME’yi bul. İşaretli ilk harften son harfe kaydır.':'Her kelime küçük bir keşif.')}</p>
 {daily&&<DailyActionNotice state={displayAction} onRetry={()=>void dailySession.current?.retry()} onBack={onBack}/>}
 </PlayLayout>
 {help&&(journey?.clues?<Modal title="İpucu Avı" onClose={()=>setHelp(false)}><p>Her kısa tanım bir kelimeyi anlatır. Yanındaki sayı harf sayısını gösterir. Cevabı tahtada yatay, dikey, çapraz veya tersten bul.</p><p>Bulduğunda tanımın yerinde kelimen görünür. Zorlanırsan İpucu düğmesi ilk harfi gösterir. Süre baskısı yok.</p><button className="button primary full" onClick={()=>setHelp(false)}>Avı sürdür</button></Modal>:<Help daily={!!daily} onClose={()=>setHelp(false)}/>)}
 {exit&&<Modal title="Kısa bir ara mı?" onClose={()=>setExit(false)}><p>Günlük yarış süren ara verdiğinde de devam eder. Bu sekmede bekleyen bir işlemin varsa yeniden açılışta önce kontrol edilir.</p><div className="button-row"><button className="button secondary" onClick={()=>setExit(false)}>Oyuna dön</button><button className="button primary" onClick={onBack}>Keşfe dön</button></div></Modal>}
 {completed&&resultReady&&!review&&!help&&!exit&&<Modal title={config.tutorial?'İşte ilk keşfin!':daily?'Günün keşfi tamam!':'Merakına sağlık!'} onClose={()=>setReview(true)}><div className="result-celebration"><div className="celebration-pieces" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{'--piece':i} as import('react').CSSProperties}/>)}</div><span className="result-leaf leaf-one"/><span className="result-leaf leaf-two"/><div className="result-icon"><Trophy size={46}/></div></div><div className="stars">{[0,1,2].map(i=><Star key={i} fill={i<3-Math.min(2,save.hints)?'currentColor':'none'}/>)}</div><p className="center">{config.tutorial?'Kelimelerle aranız iyi olacak.':'Bütün kelimeleri buldun.'}</p>{!config.tutorial&&<div className="result-details" aria-label="Bölüm özeti"><div><strong>{timeLabel(seconds)}</strong><small>{daily?'Toplam süre':'Keşif süresi'}</small></div><div><strong>{board.targets.length}</strong><small>Bulunan kelime</small></div><div><strong>{save.hints}</strong><small>Kullanılan ipucu</small></div></div>}{improved&&<div className="result-personal-best"><Trophy size={17}/>Bu bölümde yeni kişisel en iyin!</div>}<p className="center muted">{config.tutorial?'Şimdi kendi dünyanı seç.':daily?'Sonucun günlük sıralamaya kaydedildi.':journey?'Keşfin ve en iyi sonucun kaydedildi.':'Bir sonraki keşfe hazırsın.'}</p>{journey&&<DiscoveryResult progress={resultProgress} themeId={journey.themeId} rewards={rewards}/>}{external?.result?.(save)}<button className="button primary full" onClick={daily?onBack:next}>{config.tutorial?'Dünyaları keşfet':daily?'Günlük sayfasına dön':external?'Keşiflerine dön':journey?(nextJourney?'Sıradaki: '+nextJourney.title:'Keşif haritasına dön'):'Sonraki keşif'}<ArrowRight size={18}/></button>{journey&&nextJourney&&<button className="text-button full" onClick={onMap}>Haritayı ve ödülleri gör <Compass size={15}/></button>}{!daily&&!config.tutorial&&<button className="button secondary full" onClick={()=>onNext({...config,practice:true})}><RefreshCw size={17}/>Bir daha oyna</button>}<button className="text-button full" onClick={()=>setReview(true)}>Tahtaya bir daha bak</button></Modal>}
 </>;
}
