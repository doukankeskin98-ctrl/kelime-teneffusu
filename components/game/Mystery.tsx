'use client';
import {useEffect,useMemo,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowRight,Check,Clock,Lightbulb,LockKeyhole,Sparkles,Star,Trophy} from 'lucide-react';
import {MYSTERIES,mysteryBoard} from '@/lib/game/content';
import {match,timeLabel,type Cell,type Stroke} from '@/lib/game/engine';
import {cleanSave,type Progress} from '@/lib/game/progress';
import {keepBestSave} from '@/lib/game/discovery';
import {track} from '@/lib/game/telemetry';
import {Help,Modal,PlayControls,PlayLayout,useChime,WordList} from './common';

export function Mystery({id,progress,onProgress,onBack,onNext}:{id:string;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;onBack:()=>void;onNext:(id:string)=>void}){
 const spec=MYSTERIES.find(m=>m.id===id)??MYSTERIES[0]!,board=useMemo(()=>mysteryBoard(spec),[spec.id]),key='mystery:'+spec.id;
 const [save,setSave]=useState(()=>cleanSave(progress.saves[key],board)),[solved,setSolved]=useState(progress.mysteries.includes(spec.id)),[preview,setPreview]=useState(''),[paused,setPaused]=useState(false),[hint,setHint]=useState<Cell|null>(null),[choose,setChoose]=useState(false),[message,setMessage]=useState(''),[help,setHelp]=useState(false),[review,setReview]=useState(false);
 const chime=useChime(progress.sound,progress.haptics),foundRef=useRef(save.strokes);foundRef.current=save.strokes;
 const baseFound=save.strokes.filter(s=>Number(s.id.split('.')[0])<spec.words.length).length,canGuess=baseFound>=3;
 useEffect(()=>{track('level_start');},[]);
 useEffect(()=>{
  if(paused||save.complete||choose||help)return;const at=performance.now(),base=save.elapsed,t=setInterval(()=>setSave(s=>({...s,elapsed:base+Math.floor((performance.now()-at)/1000)})),1000),hide=()=>{if(document.hidden)setPaused(true);};document.addEventListener('visibilitychange',hide);return ()=>{clearInterval(t);document.removeEventListener('visibilitychange',hide);};
 },[paused,save.complete,choose,help]);
 useEffect(()=>{onProgress(p=>({...p,saves:{...p.saves,[key]:keepBestSave(p.saves[key],save)},mysteries:solved?[...new Set([...p.mysteries,spec.id])]:p.mysteries}));},[save,solved]);
 useEffect(()=>{if(!hint)return;const timer=setTimeout(()=>setHint(null),3500);return ()=>clearTimeout(timer);},[hint]);
 const commit=(a:Cell,b:Cell)=>{
  if(paused||save.complete||choose||help)return;const target=match(board,a,b);if(!target){setMessage('Bağlantı başka bir yerde olabilir.');track('selection_miss');return;}
  if(target.group===spec.words.length&&!solved){setMessage('Önce kelimelerin ortak bağlantısını keşfet.');return;}
  if(foundRef.current.some(s=>s.id===target.id))return;
  const strokes=[...foundRef.current,{id:target.id,a,b}],complete=strokes.length===board.targets.length;foundRef.current=strokes;
  setSave(s=>({...s,strokes,complete,stars:complete?3-Math.min(2,s.hints):0}));setHint(null);chime(complete);
  setMessage(complete?'Bağlantı kuruldu. Keşif tamam!':baseFound===2&&!solved?'Üç kelime buldun. Sence ortak bağlantı ne?':'Bir ipucu daha ortaya çıktı.');
  if(complete){track('level_complete');window.dispatchEvent(new Event('kt-sync-now'));}
 };
 const hintClick=()=>{if(paused||save.complete||save.hints>=3)return;const target=board.placements.find(p=>(solved||p.group<spec.words.length)&&!save.strokes.some(s=>s.id===p.id));if(target){setHint(target.a);setSave(s=>({...s,hints:s.hints+1}));}};
 const guess=(option:string)=>{if(option===spec.answer){setSolved(true);setChoose(false);setMessage('Bağlantıyı buldun! Son kelime açıldı.');chime();}else setMessage('Bu kelimeler başka bir hikâyede buluşuyor. Bir daha düşün.');};
 const visibleBoard={...board,targets:board.targets.filter(t=>solved||save.complete||t.group<spec.words.length)};
 const next=MYSTERIES[(MYSTERIES.findIndex(m=>m.id===spec.id)+1)%MYSTERIES.length]!;
 return <><PlayLayout title={spec.title} kicker="GİZLİ TEMA • KELİMELERİ BİRLEŞTİR" onBack={onBack} board={board} strokes={save.strokes} paused={(!save.complete&&paused)||choose||help} readOnly={save.complete} zoom={progress.zoom} hint={hint} onCommit={commit} preview={preview} onPreview={setPreview} footer={<PlayControls paused={paused} completed={save.complete} onPause={()=>setPaused(p=>!p)} zoom={progress.zoom} onZoom={()=>onProgress(p=>({...p,zoom:!p.zoom}))} sound={progress.sound} onSound={()=>onProgress(p=>({...p,sound:!p.sound}))} hints={3-save.hints} onHint={hintClick} onHelp={()=>setHelp(true)}/>} aside={<><div className="panel-heading"><span className="eyebrow">BAĞLANTIYI KEŞFET</span><Sparkles size={20}/></div><WordList board={visibleBoard} strokes={save.strokes}/><div className={'connection-card'+(solved||save.complete?' unlocked':'')}><span className="connection-icon">{solved||save.complete?<Check/>:<LockKeyhole/>}</span><b>{solved||save.complete?spec.answer:'Ortak bağlantı ne?'}</b><p>{save.complete?'Bağlantıyı tamamladın. Tahtanı inceleyebilir veya sonucuna dönebilirsin.':solved?'Son kelime açıldı. Tahtada onu da bul.':canGuess?'Kelimeleri birlikte düşün. Bağlantıyı tahmin etmeye hazırsın.':'En az üç kelime bul, ortak bağlantıyı keşfet.'}</p>{!solved&&!save.complete&&<button className="button primary full" disabled={!canGuess} onClick={()=>{setMessage('');setChoose(true);}}>Bağlantıyı bul <Lightbulb size={17}/></button>}</div>{save.complete&&<button className="button primary full" onClick={()=>setReview(false)}>Sonucu göster <Trophy size={18}/></button>}</>}>
 <div className="game-status"><span><Clock size={17}/><b>{timeLabel(save.elapsed)}</b></span><div className="progress-track"><i style={{width:`${save.strokes.length/board.targets.length*100}%`}}/></div><span><Star size={17}/>{3-Math.min(2,save.hints)}</span></div><p className="game-message" role="status">{message||(save.complete?'Keşif tamamlandı. Bulduğun bağlantıya yeniden bakabilirsin.':'Kelimeleri bul. Aralarındaki hikâyeyi keşfet.')}</p>
 </PlayLayout>{help&&<Help onClose={()=>setHelp(false)}/>}
 {choose&&<Modal title="Sence bağlantı ne?" onClose={()=>setChoose(false)}><p className="center muted">{spec.words.filter((_,i)=>save.strokes.some(s=>s.id.startsWith(i+'.'))).join(' · ')}</p><div className="guess-options">{spec.options.map(option=><button className="button secondary full" key={option} onClick={()=>guess(option)}>{option}<ArrowRight size={17}/></button>)}</div>{message&&<p className="center" role="status">{message}</p>}</Modal>}
 {save.complete&&!review&&!help&&!choose&&<Modal title="Bağlantıyı kurdun!" onClose={()=>setReview(true)}><div className="result-icon"><Trophy size={46}/></div><div className="stars">{[0,1,2].map(i=><Star key={i} fill={i<save.stars?'currentColor':'none'}/>)}</div><h3 className="center">{spec.answer}</h3><p className="center muted">{spec.note}</p><button className="button primary full" onClick={()=>onNext(next.id)}>Yeni bağlantı <ArrowRight size={18}/></button><button className="button secondary full" onClick={()=>{setSave(cleanSave(undefined,board));setSolved(false);setReview(false);setPaused(false);setHint(null);setMessage('Aynı kelimelere yeni bir bakış.');}}>Bir daha keşfet</button><button className="text-button full" onClick={onBack}>Keşfe dön</button></Modal>}
 </>;
}
