'use client';
import {useEffect,useMemo,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowRight,Check,Clock,Flag,RefreshCw,Star,Trophy} from 'lucide-react';
import {findTheme,LEVEL_NAMES} from '@/lib/game/catalog';
import {JOURNEYS,journeyById,journeyBoard,TUTORIAL} from '@/lib/game/content';
import {hash,makePuzzle,match,timeLabel,type Cell,type Puzzle,type Stroke} from '@/lib/game/engine';
import {cleanSave,type Progress,type SavedLevel} from '@/lib/game/progress';
import {track} from '@/lib/game/telemetry';
import * as legacy from '@/lib/game/legacy';
import type {DailyView} from '@/lib/game/server';
import {api,Help,Modal,PlayControls,PlayLayout,useChime,WordList} from './common';
export interface SoloConfig {themeId:string;level:number;classic?:boolean;journey?:string;tutorial?:boolean;practice?:boolean;run?:number}
function classicBoard(round:number,seed:number):Puzzle {
 const b=legacy.generateBoard(round,seed),def=legacy.ROUNDS[round]!;
 const targets=def.words.flatMap((w,g)=>w.parts.map((text,i)=>({id:`${g}.${i}`,label:w.label,text,group:g})));
 return {version:2,size:b.size,grid:b.grid,targets,placements:b.placements.map(p=>({...targets.find(t=>t.id===p.id)!,a:[p.r,p.c],b:[p.r+p.dr*(p.len-1),p.c+p.dc*(p.len-1)]}))};
}
export function Solo({config,progress,onProgress,onBack,onNext,daily:initialDaily}:{config:SoloConfig;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;onBack:()=>void;onNext:(config:SoloConfig)=>void;daily?:DailyView}){
 const journey=journeyById(config.journey??'');
 const legacyState=useMemo(()=>{if(!config.classic)return null;try{return legacy.validateSave(JSON.parse(localStorage.getItem(legacy.SAVE_KEY)??'null'))??legacy.freshState(hash('classic-first-game'));}catch{return legacy.freshState(hash('classic-first-game'));}},[config.classic]);
 const [daily,setDaily]=useState(initialDaily),[dailyNow,setDailyNow]=useState(Date.now()),dailyOffset=useRef(initialDaily?initialDaily.serverNow-Date.now():0);
 const board=useMemo(()=>daily?.board??(config.tutorial?TUTORIAL:journey?journeyBoard(journey):config.classic?classicBoard(config.level,legacyState!.seed):makePuzzle(config.themeId,config.level,hash(`campaign-v2:${config.themeId}:${config.level}`))),[config.themeId,config.level,config.classic,config.tutorial,journey?.id,legacyState,daily?.id]);
 const key=journey?'route:'+journey.id:`${config.themeId}.${config.level}`;
 const [save,setSave]=useState<SavedLevel>(()=>daily?{strokes:daily.strokes,elapsed:0,hints:daily.hints,complete:daily.finished!==null,stars:3-Math.min(2,daily.hints)}:config.tutorial||config.practice?cleanSave(undefined,board):config.classic?cleanSave({strokes:legacyState!.strokes[config.level]!,elapsed:legacyState!.elapsed[config.level]!,hints:legacyState!.hints[config.level]!,complete:false,stars:0},board):cleanSave(progress.saves[key],board));
 const [paused,setPaused]=useState(false),[hint,setHint]=useState<Cell|null>(null),[preview,setPreview]=useState(''),[message,setMessage]=useState(''),[help,setHelp]=useState(false),[review,setReview]=useState(false),[exit,setExit]=useState(false),[busy,setBusy]=useState(false),[pending,setPending]=useState<Stroke|null>(null);
 const chime=useChime(progress.sound,progress.haptics),foundRef=useRef(save.strokes),started=useRef(performance.now()),completionTracked=useRef(false);foundRef.current=save.strokes;
 const completed=daily?daily.finished!==null:save.complete,theme=findTheme(config.themeId),title=config.tutorial?'İlk küçük keşfin':daily?'Bugünün keşfi':journey?.title??(config.classic?legacy.ROUNDS[config.level]!.title:LEVEL_NAMES[config.level]!);
 useEffect(()=>{track('level_start');},[]);
 useEffect(()=>{if(!hint&&!message)return;const timeout=setTimeout(()=>{setHint(null);setMessage('');},3000);return ()=>clearTimeout(timeout);},[hint,message]);
 useEffect(()=>{
  if(daily){const timer=setInterval(()=>setDailyNow(Date.now()),250);return ()=>clearInterval(timer);}
  if(paused||completed||help||exit)return;
  const at=performance.now(),base=save.elapsed,timer=setInterval(()=>setSave(s=>({...s,elapsed:base+Math.floor((performance.now()-at)/1000)})),1000);
  const hide=()=>{if(document.hidden)setPaused(true);};document.addEventListener('visibilitychange',hide);
  return ()=>{clearInterval(timer);document.removeEventListener('visibilitychange',hide);};
 },[paused,completed,help,exit,!!daily]);
 useEffect(()=>{
  if(daily){if(daily.finished!==null)onProgress(p=>p.days.includes(daily.day)?p:{...p,days:[...p.days,daily.day]});return;}
  if(config.tutorial){if(save.complete)onProgress(p=>({...p,tutorialDone:true}));return;}
  if(config.classic&&legacyState){if(config.practice)return;legacyState.round=config.level;legacyState.strokes[config.level]=save.strokes;legacyState.found[config.level]=save.strokes.map(s=>s.id);legacyState.hints[config.level]=save.hints;legacyState.elapsed[config.level]=save.elapsed;legacyState.sound=progress.sound;legacyState.zoom=progress.zoom;try{localStorage.setItem(legacy.SAVE_KEY,JSON.stringify(legacyState));}catch{}}
  else if(!config.practice||save.complete)onProgress(p=>{
   const old=p.saves[key],best=old?.complete&&(!save.complete||old.stars>save.stars||(old.stars===save.stars&&old.elapsed<save.elapsed))?old:save;
   return {...p,saves:{...p.saves,[key]:best},last:{themeId:config.themeId,level:config.level,...(journey?{journey:journey.id}:{})}};
  });
 },[save,daily?.finished]);
 useEffect(()=>{if(completed&&!completionTracked.current){completionTracked.current=true;track('level_complete',save.elapsed*1000);window.dispatchEvent(new Event('kt-sync-now'));}},[completed]);
 const acceptDaily=(result:DailyView)=>{setDaily(result);dailyOffset.current=result.serverNow-Date.now();setSave(s=>({...s,strokes:result.strokes,hints:result.hints,complete:result.finished!==null,stars:result.finished!==null?3-Math.min(2,result.hints):0}));};
 const commit=async(a:Cell,b:Cell)=>{
  if(paused||completed||busy)return;
  const target=match(board,a,b);if(!target){setMessage('Bir başka yönden bakmayı dene.');track('selection_miss');return;}
  if(foundRef.current.some(s=>s.id===target.id)){setMessage('Bu kelimeyi zaten buldun.');return;}
  const stroke={id:target.id,a,b},finish=save.strokes.length+1===board.targets.length;
  chime(finish);if(!foundRef.current.length)track('first_word',performance.now()-started.current);
  if(daily){setBusy(true);setPending(stroke);try{acceptDaily(await api<DailyView>('dailyClaim',{id:daily.id,a,b}));setMessage('Bir kelime daha, çok iyi!');}catch(e){setMessage((e as Error).message);}finally{setPending(null);setBusy(false);}}
  else{const strokes=[...foundRef.current,stroke];foundRef.current=strokes;setSave(s=>({...s,strokes,complete:finish,stars:finish?3-Math.min(2,s.hints):0}));setMessage(finish?'Keşif tamamlandı!':config.tutorial?'Tam da böyle! Diğer kelimelere de bak.':'Bir kelime daha, çok iyi!');}
  setHint(null);
 };
 const useHint=async()=>{
  if(paused||completed||save.hints>=3||busy)return;
  if(daily){setBusy(true);try{const result=await api<DailyView&{hintCell:Cell|null}>('dailyHint',{id:daily.id});acceptDaily(result);setHint(result.hintCell);setMessage('İlk harfe bak. Sürene +15 saniye.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}return;}
  const remaining=(board as Puzzle).placements.find(p=>!save.strokes.some(s=>s.id===p.id));if(remaining){setHint(remaining.a);setSave(s=>({...s,hints:s.hints+1}));setMessage('Kelimenin ilk harfi burada.');}
 };
 const seconds=daily?(daily.finished!==null?daily.duration/1000:Math.max(0,(dailyNow+dailyOffset.current-daily.starts)/1000)):save.elapsed;
 const controls=<PlayControls paused={paused||completed} onPause={()=>{setHint(null);setPreview('');setPaused(p=>!p);}} zoom={progress.zoom} onZoom={()=>onProgress(p=>({...p,zoom:!p.zoom}))} sound={progress.sound} onSound={()=>onProgress(p=>({...p,sound:!p.sound}))} hints={Math.max(0,3-save.hints)} onHint={()=>void useHint()} onHelp={()=>setHelp(true)} canPause={!daily}/>;
 const tutorialHint=config.tutorial&&!save.strokes.some(s=>s.id===TUTORIAL.targets[0]!.id)?TUTORIAL.placements.find(p=>p.id===TUTORIAL.targets[0]!.id)!.a:null;
 const nextJourney=journey?JOURNEYS[JOURNEYS.findIndex(j=>j.id===journey.id)+1]:undefined;
 const next=()=>{if(config.tutorial){onBack();return;}if(journey){if(nextJourney?.themeId===journey.themeId)onNext({themeId:journey.themeId,level:0,journey:nextJourney.id});else onBack();return;}if(config.level<(config.classic?3:5))onNext({...config,practice:false,level:config.level+1});else onBack();};
 return <><PlayLayout kicker={daily?'Günün bulmacası':config.tutorial?'KÜÇÜK BİR BAŞLANGIÇ':config.classic?'Hababam • Fotoğraftaki 20 isim':`${theme.title} • ${journey?'Keşif rotası':'Bölüm '+(config.level+1)}`} title={title} onBack={()=>daily&&!completed?setExit(true):onBack()} board={board} strokes={pending&&!save.strokes.some(s=>s.id===pending.id)?[...save.strokes,pending]:save.strokes} paused={paused||(!daily&&(help||exit))} zoom={progress.zoom} hint={hint??tutorialHint} onCommit={(a,b)=>void commit(a,b)} preview={preview} onPreview={setPreview} footer={controls} aside={<><div className="panel-heading"><span className="eyebrow">KELİMELERİN İZİNDE</span><b>{save.strokes.length}<small> / {board.targets.length}</small></b></div><WordList board={board} strokes={save.strokes}/><div className="game-note"><Flag size={18}/><p>{config.tutorial?'KELİME’nin ilk harfini işaretledik. Son harfine kaydır veya iki ucuna dokun. Sonra MERAK ve KEŞİF’i bul.':daily?'Süre ara verdiğinde de devam eder. İpuçları sürene 15 saniye ekler.':journey?.note??'Acele yok. Yanlış seçim ceza getirmez. Çaprazlara da bak.'}</p></div>{completed&&<button className="button primary full" onClick={()=>setReview(false)}>Sonucu göster <Trophy size={18}/></button>}</>}>
  <div className="game-status"><span><Clock size={17}/><b>{config.tutorial?'Acele yok':timeLabel(seconds)}</b>{daily&&save.hints>0&&<small>+{save.hints*15} sn</small>}</span><div className="progress-track" role="progressbar" aria-label="Bulunan kelimeler" aria-valuenow={save.strokes.length} aria-valuemin={0} aria-valuemax={board.targets.length}><i style={{width:`${save.strokes.length/board.targets.length*100}%`}}/></div><span><Star size={17}/>{3-Math.min(2,save.hints)}</span></div>
  <p className="game-message" role="status">{message||journey?.subtitle||(config.tutorial?'KELİME’yi bul. İşaretli ilk harften son harfe kaydır.':'Her kelime küçük bir keşif.')}{busy&&<span className="sync-indicator"> Eşitleniyor…</span>}</p>
 </PlayLayout>
 {help&&<Help daily={!!daily} onClose={()=>setHelp(false)}/>}
 {exit&&<Modal title="Kısa bir ara mı?" onClose={()=>setExit(false)}><p>Günlük yarış süren sen dönene kadar devam eder. Aynı gün içinde kaldığın yerden açabilirsin.</p><div className="button-row"><button className="button secondary" onClick={()=>setExit(false)}>Oyuna dön</button><button className="button primary" onClick={onBack}>Keşfe dön</button></div></Modal>}
 {completed&&!review&&<Modal title={config.tutorial?'İşte ilk keşfin!':daily?'Günün keşfi tamam!':'Merakına sağlık!'} onClose={()=>setReview(true)}><div className="result-celebration"><span className="result-leaf leaf-one"/><span className="result-leaf leaf-two"/><div className="result-icon"><Trophy size={46}/></div></div><div className="stars">{[0,1,2].map(i=><Star key={i} fill={i<3-Math.min(2,save.hints)?'currentColor':'none'}/>)}</div><p className="center">{config.tutorial?'Kelimelerle aranız iyi olacak.':<>Bütün kelimeleri buldun. <b>{timeLabel(seconds)}</b></>}</p><p className="center muted">{config.tutorial?'Şimdi kendi dünyanı seç.':daily?'Sonucun günlük sıralamaya kaydedildi.':journey?'Keşif albümüne bir sayfa daha ekledin.':'Bir sonraki keşfe hazırsın.'}</p><button className="button primary full" onClick={daily?onBack:next}>{config.tutorial?'Dünyaları keşfet':daily?'Günlük sayfasına dön':journey&&nextJourney?.themeId!==journey.themeId?'Rota tamam, keşfe dön':'Sonraki keşif'}<ArrowRight size={18}/></button>{!daily&&!config.tutorial&&<button className="button secondary full" onClick={()=>onNext({...config,practice:true})}><RefreshCw size={17}/>Bir daha oyna</button>}<button className="text-button full" onClick={()=>setReview(true)}>Tahtaya bir daha bak</button></Modal>}
 </>;
}
