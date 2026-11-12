'use client';
import {MechanicGuide} from './MechanicGuide';
import {gameIsActive} from '@/lib/platform/runtime';
import {observeGameActivity} from '@/lib/platform/activity';
import {useResultPresentation} from './useResultPresentation';
import {useEffect,useMemo,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowRight,Check,Clock,Lightbulb,LockKeyhole,Sparkles,Star,Trophy} from 'lucide-react';
import {MYSTERIES,mysteryBoard} from '@/lib/game/content';
import {canonicalStroke,presentationStrokes} from '@/lib/game/board-quality';
import {presentationBoard} from '@/lib/game/journey-presentation';
import {match,timeLabel,type Cell,type Stroke} from '@/lib/game/engine';
import {cleanSave,type Progress} from '@/lib/game/progress';
import {keepBestSave} from '@/lib/game/discovery';
import {hintTarget,focusedWordGroup} from '@/lib/game/word-card';
import {track} from '@/lib/game/telemetry';
import {Help,Modal,PlayControls,PlayLayout,useChime,WordList} from './common';

export function Mystery({id,progress,onProgress,onBack,onNext}:{id:string;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;onBack:()=>void;onNext:(id:string)=>void}){
 const spec=MYSTERIES.find(m=>m.id===id)??MYSTERIES[0]!,canonicalBoard=useMemo(()=>mysteryBoard(spec),[spec.id]),key='mystery:'+spec.id;
 const board=useMemo(()=>presentationBoard(canonicalBoard,key),[canonicalBoard,key]);
 const [intro,setIntro]=useState(()=>!progress.mechanicGuides?.includes('mystery')&&!MYSTERIES.some(m=>((s)=>!!s&&(s.strokes.length>0||s.elapsed>0||s.complete))(progress.saves['mystery:'+m.id])));
 const closeIntro=()=>{setIntro(false);onProgress(p=>({...p,mechanicGuides:[...new Set([...(p.mechanicGuides??[]),'mystery' as const])]}));};
 const [feedbackRun,setFeedbackRun]=useState(0);
 const [save,setSave]=useState(()=>cleanSave(progress.saves[key],canonicalBoard)),[solved,setSolved]=useState(progress.mysteries.includes(spec.id)),[preview,setPreview]=useState(''),[toolsPaused,setPaused]=useState(false),[foreground,setForeground]=useState(true),[hint,setHint]=useState<Cell|null>(null),[choose,setChoose]=useState(false),[message,setMessage]=useState(''),[help,setHelp]=useState(false),[review,setReview]=useState(false);
 const paused=toolsPaused||!foreground;
 const clock=useRef({at:0,tick:0,active:true});
 useEffect(()=>observeGameActivity(document,window,gameIsActive,active=>{clock.current={at:performance.now(),tick:0,active};setForeground(active);}),[]);
 const result=useResultPresentation(save.complete,spec.id+':'+feedbackRun);
 const [preferredGroup,setPreferredGroup]=useState<number|null>(null),hintCount=useRef(save.hints);hintCount.current=save.hints;
 const chime=useChime(progress.sound,progress.haptics),foundRef=useRef(save.strokes);foundRef.current=save.strokes;
 const baseFound=save.strokes.filter(s=>Number(s.id.split('.')[0])<spec.words.length).length,canGuess=baseFound>=3;
 useEffect(()=>{track('level_start');},[]);
 useEffect(()=>{
  if(paused||save.complete||choose||help||intro)return;clock.current={at:performance.now(),tick:0,active:foreground};
  const t=setInterval(()=>{const c=clock.current;if(!c.active||document.hidden||!gameIsActive())return;const tick=Math.floor((performance.now()-c.at)/1000),delta=tick-c.tick;c.tick=tick;if(delta>0)setSave(s=>s.complete?s:{...s,elapsed:s.elapsed+delta});},1000);return ()=>clearInterval(t);
 },[paused,save.complete,choose,help,intro]);
 useEffect(()=>{onProgress(p=>({...p,saves:{...p.saves,[key]:keepBestSave(p.saves[key],save)},mysteries:solved?[...new Set([...p.mysteries,spec.id])]:p.mysteries}));},[save,solved]);
 useEffect(()=>{if(!hint)return;const timer=setTimeout(()=>setHint(null),3500);return ()=>clearTimeout(timer);},[hint]);
 const commit=(a:Cell,b:Cell)=>{
  if(paused||save.complete||choose||help||intro)return;const target=match(board,a,b);if(!target){chime('miss');setMessage('Tekrar dene.');track('selection_miss');return;}
  if(target.group===spec.words.length&&!solved){setMessage('Önce kelimelerin ortak bağlantısını keşfet.');return;}
  if(foundRef.current.some(s=>s.id===target.id))return;
  const stroke=canonicalStroke(canonicalBoard,board,a,b);if(!stroke)return;
  const strokes=[...foundRef.current,stroke],complete=strokes.length===board.targets.length;foundRef.current=strokes;
  if(complete)result.prepare();
  setSave(s=>({...s,strokes,complete,stars:complete?3-Math.min(2,s.hints):0}));setHint(null);chime(complete);
  setMessage(complete?'Bağlantı kuruldu. Keşif tamam!':baseFound===2&&!solved?'Üç kelime buldun. Sence ortak bağlantı ne?':'Bir ipucu daha ortaya çıktı.');
  if(complete){track('level_complete');window.dispatchEvent(new Event('kt-sync-now'));}
 };
 const hintClick=()=>{if(paused||save.complete||choose||help||intro||hintCount.current>=3)return;const selected=hintTarget(visibleBoard,foundRef.current,preferredGroup),target=board.placements.find(p=>p.id===selected?.id);if(target){hintCount.current++;chime('hint');setHint(target.a);setSave(s=>({...s,hints:Math.min(3,s.hints+1)}));}};
 const guess=(option:string)=>{if(option===spec.answer){setSolved(true);setChoose(false);setMessage('Bağlantıyı buldun! Son kelime açıldı.');chime('reveal');}else setMessage('Bu cevap doğru değil. Tekrar dene.');};
 const visibleBoard={...board,targets:board.targets.filter(t=>solved||save.complete||t.group<spec.words.length)};
 const next=MYSTERIES[(MYSTERIES.findIndex(m=>m.id===spec.id)+1)%MYSTERIES.length]!;
 const displayStrokes=useMemo(()=>presentationStrokes(canonicalBoard,board,save.strokes),[canonicalBoard,board,save.strokes]);
 const wordList={board:visibleBoard,strokes:displayStrokes,focusedGroup:focusedWordGroup(visibleBoard,save.strokes,preferredGroup),onFocusGroup:setPreferredGroup};
 return <><PlayLayout departing={result.departing&&!review&&!help&&!choose} onResume={()=>{if(paused&&!save.complete&&!choose&&!help&&!intro&&!document.hidden&&gameIsActive()){chime('start');setPaused(false);}}} celebrating={save.complete&&result.ready&&!review&&!help&&!choose} wordListKey={spec.id+':'+feedbackRun} onSelectLetter={depth=>chime('letter',depth)} wordList={wordList} wordListUnavailable={help||choose||intro} title={spec.title} kicker="GİZLİ TEMA • KELİMELERİ BİRLEŞTİR" onBack={onBack} board={board} strokes={displayStrokes} paused={(!save.complete&&paused)||choose||help||intro} readOnly={save.complete} zoom={progress.zoom} hint={hint} onCommit={commit} preview={preview} onPreview={setPreview} footer={<PlayControls onSkipResult={save.complete&&!result.ready?result.skip:undefined} paused={paused} completed={save.complete} onPause={()=>{chime(paused?'start':'pause');setPaused(p=>!p);}} zoom={progress.zoom} onZoom={()=>onProgress(p=>({...p,zoom:!p.zoom}))} sound={progress.sound} onSound={()=>{chime(progress.sound?'mute':'enable');onProgress(p=>({...p,sound:!p.sound}));}} hints={3-save.hints} onHint={hintClick} onHelp={()=>setHelp(true)}/>} aside={<><div className={'connection-card'+(solved||save.complete?' unlocked':'')}><span className="connection-icon">{solved||save.complete?<Check/>:<LockKeyhole/>}</span><b>{solved||save.complete?spec.answer:'Ortak bağlantı ne?'}</b><p>{save.complete?'Bağlantıyı tamamladın. Tahtanı inceleyebilir veya sonucuna dönebilirsin.':solved?'Son kelime açıldı. Tahtada onu da bul.':canGuess?'Kelimeleri birlikte düşün. Bağlantıyı tahmin etmeye hazırsın.':'En az üç kelime bul, ortak bağlantıyı keşfet.'}</p>{!solved&&!save.complete&&<button className="button primary full" disabled={!canGuess} onClick={()=>{setMessage('');setChoose(true);}}>Bağlantıyı bul <Lightbulb size={17}/></button>}</div>{save.complete&&<button className="button primary full" onClick={()=>{result.skip();setReview(false);}}>Sonucu göster <Trophy size={18}/></button>}</>}>
 <div className="game-status"><span><Clock size={17}/><b>{timeLabel(save.elapsed)}</b></span><div className="progress-track"><i style={{width:`${save.strokes.length/board.targets.length*100}%`}}/></div><span><Star size={17}/>{3-Math.min(2,save.hints)}</span></div><p className="game-message" role="status">{message||(save.complete?'Keşif tamamlandı. Bulduğun bağlantıya yeniden bakabilirsin.':'Kelimeleri bul. Aralarındaki hikâyeyi keşfet.')}</p>
 </PlayLayout>{intro&&<MechanicGuide kind="mystery" onClose={closeIntro}/>} {help&&<MechanicGuide kind="mystery" onClose={()=>setHelp(false)}/>}
 {choose&&<Modal title="Sence bağlantı ne?" onClose={()=>setChoose(false)}><p className="center muted">{spec.words.filter((_,i)=>save.strokes.some(s=>s.id.startsWith(i+'.'))).join(' · ')}</p><div className="guess-options">{spec.options.map(option=><button className="button secondary full" key={option} onClick={()=>guess(option)}>{option}<ArrowRight size={17}/></button>)}</div>{message&&<p className="center" role="status">{message}</p>}</Modal>}
 {save.complete&&result.ready&&!review&&!help&&!choose&&<Modal scene="courtyard" className="scene-result celebration-outcome" title="Bağlantıyı kurdun!" onClose={()=>setReview(true)}><div className="result-icon"><Trophy size={46}/></div><div className="stars">{[0,1,2].map(i=><Star key={i} fill={i<save.stars?'currentColor':'none'}/>)}</div><h3 className="center">{spec.answer}</h3><p className="center muted">{spec.note}</p><button className="button primary full" onClick={()=>onNext(next.id)}>Yeni bağlantı <ArrowRight size={18}/></button><button className="button secondary full" onClick={()=>{setFeedbackRun(n=>n+1);setSave(cleanSave(undefined,canonicalBoard));setSolved(false);setReview(false);setPaused(false);setHint(null);setMessage('Bölüm yeniden başladı.');}}>Tekrar oyna</button><button className="text-button full" onClick={onBack}>Keşfe dön</button></Modal>}
 </>;
}
