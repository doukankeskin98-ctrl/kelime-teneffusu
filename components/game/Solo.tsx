'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,Check,Clock,Flag,Star,Trophy} from 'lucide-react';
import {findTheme,LEVEL_NAMES} from '@/lib/game/catalog';
import {hash,makePuzzle,match,timeLabel,type Cell,type Puzzle} from '@/lib/game/engine';
import {cleanSave,type Progress,type SavedLevel} from '@/lib/game/progress';
import * as legacy from '@/lib/game/legacy';
import type {DailyView} from '@/lib/game/server';
import {api,Help,Modal,PlayControls,PlayLayout,useChime,WordList} from './common';
export interface SoloConfig {themeId:string;level:number;classic?:boolean}
function classicBoard(round:number,seed:number):Puzzle {
 const b=legacy.generateBoard(round,seed),def=legacy.ROUNDS[round]!;
 const targets=def.words.flatMap((w,g)=>w.parts.map((text,i)=>({id:`${g}.${i}`,label:w.label,text,group:g})));
 return {version:2,size:b.size,grid:b.grid,targets,placements:b.placements.map(p=>({...targets.find(t=>t.id===p.id)!,a:[p.r,p.c],b:[p.r+p.dr*(p.len-1),p.c+p.dc*(p.len-1)]}))};
}
export function Solo({config,progress,onProgress,onBack,onNext,daily:initialDaily}:{config:SoloConfig;progress:Progress;onProgress:(next:Progress)=>void;onBack:()=>void;onNext:(config:SoloConfig)=>void;daily?:DailyView}){
 const legacyState=useMemo(()=>{if(!config.classic)return null;try{return legacy.validateSave(JSON.parse(localStorage.getItem(legacy.SAVE_KEY)??'null'))??legacy.freshState(hash('classic-first-game'));}catch{return legacy.freshState(hash('classic-first-game'));}},[config.classic]);
 const [daily,setDaily]=useState(initialDaily),[dailyNow,setDailyNow]=useState(Date.now()),dailyOffset=useRef(initialDaily?initialDaily.serverNow-Date.now():0);
 const board=useMemo(()=>daily?.board??(config.classic?classicBoard(config.level,legacyState!.seed):makePuzzle(config.themeId,config.level,hash(`campaign-v2:${config.themeId}:${config.level}`))),[config.themeId,config.level,config.classic,legacyState,daily?.id]);
 const key=`${config.themeId}.${config.level}`;
 const [save,setSave]=useState<SavedLevel>(()=>daily?{strokes:daily.strokes,elapsed:0,hints:daily.hints,complete:daily.finished!==null,stars:3-Math.min(2,daily.hints)}:config.classic?cleanSave({strokes:legacyState!.strokes[config.level]!,elapsed:legacyState!.elapsed[config.level]!,hints:legacyState!.hints[config.level]!,complete:false,stars:0},board):cleanSave(progress.saves[key],board));
 const [paused,setPaused]=useState(false),[hint,setHint]=useState<Cell|null>(null),[preview,setPreview]=useState(''),[message,setMessage]=useState(''),[help,setHelp]=useState(false),[review,setReview]=useState(false),[exit,setExit]=useState(false),[busy,setBusy]=useState(false);
 const chime=useChime(progress.sound),foundRef=useRef(save.strokes);foundRef.current=save.strokes;
 const completed=daily?daily.finished!==null:save.complete;
 const theme=findTheme(config.themeId),title=config.classic?legacy.ROUNDS[config.level]!.title:LEVEL_NAMES[config.level]!;
 useEffect(()=>{if(!hint&&!message)return;const timeout=setTimeout(()=>{setHint(null);setMessage('');},3000);return ()=>clearTimeout(timeout);},[hint,message]);
 useEffect(()=>{if(daily){const timer=setInterval(()=>setDailyNow(Date.now()),250);return ()=>clearInterval(timer);}if(paused||completed||help||exit)return;const timer=setInterval(()=>setSave(s=>({...s,elapsed:s.elapsed+1})),1000);const hide=()=>{if(document.hidden)setPaused(true);};document.addEventListener('visibilitychange',hide);return ()=>{clearInterval(timer);document.removeEventListener('visibilitychange',hide);};},[paused,completed,help,exit,!!daily]);
 useEffect(()=>{
   if(daily){if(daily.finished!==null&&!progress.days.includes(daily.day))onProgress({...progress,days:[...progress.days,daily.day]});return;}
   if(config.classic&&legacyState){legacyState.round=config.level;legacyState.strokes[config.level]=save.strokes;legacyState.found[config.level]=save.strokes.map(s=>s.id);legacyState.hints[config.level]=save.hints;legacyState.elapsed[config.level]=save.elapsed;legacyState.sound=progress.sound;legacyState.zoom=progress.zoom;try{localStorage.setItem(legacy.SAVE_KEY,JSON.stringify(legacyState));}catch{}}
   else onProgress({...progress,saves:{...progress.saves,[key]:save},last:{themeId:config.themeId,level:config.level}});
 },[save,daily?.finished]);
 const acceptDaily=(result:DailyView)=>{setDaily(result);dailyOffset.current=result.serverNow-Date.now();setSave(s=>({...s,strokes:result.strokes,hints:result.hints,complete:result.finished!==null}));};
 const commit=async(a:Cell,b:Cell)=>{
   if(paused||completed||busy)return;
   const target=match(board,a,b);if(!target){setMessage('Biraz daha bak, kelime orada.');return;}if(foundRef.current.some(s=>s.id===target.id)){setMessage('Bu kelimeyi zaten buldun.');return;}
   if(daily){setBusy(true);try{acceptDaily(await api<DailyView>('dailyClaim',{id:daily.id,a,b}));chime();setMessage('Harika, bir kelime daha!');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
   else{const strokes=[...foundRef.current,{id:target.id,a,b}];foundRef.current=strokes;setSave(s=>({...s,strokes,complete:strokes.length===board.targets.length,stars:strokes.length===board.targets.length?3-Math.min(2,s.hints):0}));chime();setMessage('Harika, bir kelime daha!');}
   setHint(null);
 };
 const useHint=async()=>{if(paused||completed||save.hints>=3||busy)return;if(daily){setBusy(true);try{const result=await api<DailyView&{hintCell:Cell|null}>('dailyHint',{id:daily.id});acceptDaily(result);setHint(result.hintCell);setMessage('İlk harfe bak. Sürene +15 saniye.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}return;}const remaining=(board as Puzzle).placements.find(p=>!save.strokes.some(s=>s.id===p.id));if(remaining){setHint(remaining.a);setSave(s=>({...s,hints:s.hints+1}));setMessage('Kelimenin ilk harfi burada.');}};
 const seconds=daily?(daily.finished!==null?daily.duration/1000:(dailyNow+dailyOffset.current-daily.starts)/1000):save.elapsed;
 const controls=<PlayControls paused={paused||completed} onPause={()=>{setHint(null);setPreview('');setPaused(p=>!p);}} zoom={progress.zoom} onZoom={()=>onProgress({...progress,zoom:!progress.zoom})} sound={progress.sound} onSound={()=>onProgress({...progress,sound:!progress.sound})} hints={Math.max(0,3-save.hints)} onHint={()=>void useHint()} onHelp={()=>setHelp(true)} canPause={!daily}/>;
 return <><PlayLayout kicker={daily?'Günün bulmacası':config.classic?'Hababam • Fotoğraftaki 20 isim':`${theme.title} • Bölüm ${config.level+1}`} title={daily?'Bugünün keşfi':title} onBack={()=>daily&&!completed?setExit(true):onBack()} board={board} strokes={save.strokes} paused={paused||(!daily&&(help||exit))} zoom={progress.zoom} hint={hint} onCommit={(a,b)=>void commit(a,b)} preview={preview} onPreview={setPreview} footer={controls} aside={<><div className="panel-heading"><span className="eyebrow">BULUNACAK KELİMELER</span><b>{save.strokes.length}<small> / {board.targets.length}</small></b></div><WordList board={board} strokes={save.strokes}/><div className="game-note"><Flag size={18}/><p>{daily?'Her gün aynı tahta, herkes için tek sıralama hakkı. Süre ekran kapalıyken de devam eder.':config.classic?'Fotoğraftaki 20 isim, dört tanıdık tur. Eski kayıtların bu cihazda korunur.':'Acele yok. Yanlış seçim ceza getirmez. Her tahtada iki farklı yönde çapraz kelime var.'}</p></div>{completed&&<button className="button primary full" onClick={()=>setReview(false)}>Sonucu göster <Trophy size={18}/></button>}</>}>
 <div className="game-status"><span><Clock size={17}/><b>{timeLabel(seconds)}</b>{daily&&save.hints>0&&<small>+{save.hints*15} sn ipucu</small>}</span><div className="progress-track"><i style={{width:`${save.strokes.length/board.targets.length*100}%`}}/></div><span><Star size={17}/>{completed?save.stars:3-Math.min(2,save.hints)}</span></div>
 {message&&<p className="game-message" role="status">{message}</p>}{busy&&<span className="sync-indicator">Doğrulanıyor…</span>}
 </PlayLayout>
 {help&&<Help daily={!!daily} onClose={()=>setHelp(false)}/>}
 {exit&&<Modal title="Kısa bir ara mı?" onClose={()=>setExit(false)}><p>Günlük yarış süren sen dönene kadar devam eder. Aynı gün içinde kaldığın yerden açabilirsin.</p><div className="button-row"><button className="button secondary" onClick={()=>setExit(false)}>Oyuna dön</button><button className="button primary" onClick={onBack}>Keşfe dön</button></div></Modal>}
 {completed&&!review&&<Modal title={daily?'Günün keşfi tamam!':'İyi iş, kelime avcısı!'} onClose={()=>setReview(true)}><div className="result-icon"><Trophy size={46}/></div><div className="stars">{[0,1,2].map(i=><Star key={i} fill={i<3-Math.min(2,save.hints)?'currentColor':'none'}/>)}</div><p className="center">Bütün kelimeleri buldun. <b>{timeLabel(seconds)}</b>{daily&&save.hints>0?' (ipucu süresi dahil)':''}</p><p className="center muted">{daily?'Sonucun günlük sıralamaya kaydedildi. Yarın yeni bir keşif var.':config.classic?'Sınıfta bir tur daha var mı?':'Bir sonraki keşfe hazırsın.'}</p>{!daily&&config.level<(config.classic?3:5)?<button className="button primary full" onClick={()=>onNext({...config,level:config.level+1})}>Sonraki bölüm <ArrowRight size={18}/></button>:<button className="button primary full" onClick={onBack}>Keşfe dön <Check size={18}/></button>}<button className="text-button full" onClick={()=>setReview(true)}>Tahtaya bir daha bak</button></Modal>}
 </>;
}
