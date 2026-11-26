'use client';
import {useEffect,useMemo,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {Grid3X3,Play,RefreshCw,Settings,Sparkles} from 'lucide-react';
import {presentationBoard} from '@/lib/game/journey-presentation';
import {BONUS_DURATION,BONUS_WORDS,advanceBonus,bonusBoard,cleanBonusSave,freshBonus,mergeBonusSave,selectBonus,type BonusSave} from '@/lib/game/journey-bonus';
import {EXPEDITIONS,expeditionTheme} from '@/lib/game/discovery';
import {collectionStats,type Progress} from '@/lib/game/progress';
import type {Cell} from '@/lib/game/engine';
import {sceneForRoute} from '@/lib/game/scene';
import {gameIsActive} from '@/lib/platform/runtime';
import {observeGameActivity} from '@/lib/platform/activity';
import {GameToolsSheet,Modal,PlayLayout,useChime} from './common';
import {useResultPresentation} from './useResultPresentation';

export function BonusRound({worldId,progress,onProgress,onBack,onHome,onContinue}:{worldId:string;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;onBack:()=>void;onHome?:()=>void;onContinue:()=>void}){
 const world=EXPEDITIONS.find(w=>w.id===worldId)!,word=BONUS_WORDS[worldId]!,scene=sceneForRoute(worldId,expeditionTheme(world));
 const {canonicalBoard,board}=useMemo(()=>{const canonicalBoard=bonusBoard(worldId);return {canonicalBoard,board:presentationBoard(canonicalBoard,'bonus:'+worldId)};},[worldId]);
 const [save,setSave]=useState(()=>{const old=cleanBonusSave(worldId,progress.bonuses?.[worldId]);return old&&!old.finished?old:freshBonus((old?.attempt??0)+1,old?.best??0);});
 const background=useRef(false),current=useRef(save),running=useRef(false),at=useRef(0),[started,setStarted]=useState(false),[paused,setPaused]=useState(false),[help,setHelp]=useState(false),[tools,setTools]=useState(false),toolsOpen=useRef(false),resumeAfterTools=useRef(false),[preview,setPreview]=useState(''),[message,setMessage]=useState(''),[review,setReview]=useState(false);
 const result=useResultPresentation(save.finished,worldId+':'+save.attempt),chime=useChime(progress.sound,progress.haptics);
 const publish=(next:BonusSave)=>{
  const previous=current.current;
  current.current=next;
  setSave(next);
  // The live clock keeps its precision. Stored checkpoints use whole milliseconds.
  const checkpoint={...next,elapsed:Math.floor(next.elapsed)};
  onProgress(p=>({...p,bonuses:{...p.bonuses,[worldId]:p.bonuses?.[worldId]?mergeBonusSave(p.bonuses[worldId]!,checkpoint):checkpoint}}));
  if(next.finished&&!previous.finished){running.current=false;chime('finish');}
 };
 const tick=()=>{if(!running.current)return current.current;const now=performance.now(),next=advanceBonus(current.current,now-at.current);at.current=now;const previous=current.current;
  if(next.finished&&!previous.finished)result.prepare(false);
  if(next.finished||Math.floor(next.elapsed/1000)!==Math.floor(previous.elapsed/1000))publish(next);else current.current=next;
  return next;};
 const pause=()=>{tick();running.current=false;setPaused(true);setPreview('');if(!current.current.finished)publish(current.current);};
 const resume=()=>{if(current.current.finished||document.hidden||!gameIsActive())return;at.current=performance.now();running.current=true;setStarted(true);setPaused(false);setMessage('');};
 useEffect(()=>observeGameActivity(document,window,gameIsActive,active=>{
  if(!active){if(started&&!current.current.finished){background.current=true;pause();}}
  else if(background.current&&!help&&!toolsOpen.current){background.current=false;if(started&&!current.current.finished)resume();}
 }),[started,help]);
 useEffect(()=>{if(!started||paused||help||tools||save.finished)return;const interval=setInterval(()=>{if(document.hidden||!gameIsActive())return;tick();},250);return ()=>clearInterval(interval);},[started,paused,help,tools,save.finished]);
 useEffect(()=>{const remote=progress.bonuses?.[worldId];if(!remote)return;const merged=mergeBonusSave(current.current,remote);if(merged.attempt>current.current.attempt||(merged.attempt===current.current.attempt&&(merged.finished!==current.current.finished||merged.found.join('|')!==current.current.found.join('|')||merged.elapsed>current.current.elapsed+1000))){running.current=false;current.current=merged;setSave(merged);setPaused(true);background.current=true;setMessage('Diğer cihazındaki bonus kaydı yüklendi.');if(started&&!help&&!toolsOpen.current&&!document.hidden&&gameIsActive()){background.current=false;resume();}}else if(merged.best!==current.current.best){current.current={...current.current,best:merged.best};setSave(current.current);}},[progress.bonuses?.[worldId]]);
 const commit=(a:Cell,b:Cell)=>{if(!running.current||paused||help||toolsOpen.current)return;const latest=tick();if(latest.finished)return;const path=board.placements.find(p=>(p.a[0]===a[0]&&p.a[1]===a[1]&&p.b[0]===b[0]&&p.b[1]===b[1])||(p.b[0]===a[0]&&p.b[1]===a[1]&&p.a[0]===b[0]&&p.a[1]===b[1]));
  const original=canonicalBoard.placements.find(p=>p.id===path?.id);
  const selected=original?selectBonus(canonicalBoard,latest,original.a,original.b):{save:latest,accepted:false};if(!selected.accepted){setMessage('Aynı kelimenin başka bir yerini bul.');return;}if(selected.save.finished)result.prepare();publish(selected.save);if(!selected.save.finished)chime('word');setMessage('');};
 const back=()=>{if(started&&!current.current.finished)pause();onBack();};
 const replay=()=>{running.current=false;const next=freshBonus(current.current.attempt+1,current.current.best);current.current=next;setSave(next);setStarted(false);setPaused(false);setReview(false);setMessage('');result.skip();};
 const openTools=()=>{resumeAfterTools.current=running.current;toolsOpen.current=true;if(started&&!current.current.finished)pause();setTools(true);};
 const closeTools=(shouldResume=true)=>{toolsOpen.current=false;setTools(false);const owned=resumeAfterTools.current;resumeAfterTools.current=false;if(owned&&shouldResume)resume();else if(!started)setPaused(false);};
 const strokes=board.placements.filter(p=>save.found.includes(p.id)),seconds=Math.ceil((BONUS_DURATION-save.elapsed)/1000);
 const ready=!started&&!save.finished;
 const readiness=(
  <div className="bonus-ready" role="group" aria-label="Bonusa hazırlan">
   <div>
    <h2>{save.elapsed>0?'Kaldığın yerden':'Bonus turu'}</h2>
    <p>Tahtadaki bütün <b>{word}</b> kelimelerini bul.</p>
    <p className="bonus-ready-rule">
     {save.elapsed>0?`${save.found.length} bulundu · ${seconds} saniyen kaldı`:`${board.targets.length} kelime · ${seconds} saniye`}
    </p>
    <button className="button primary stage-play" onClick={resume}>
     <Play aria-hidden="true" size={20}/>{save.elapsed>0?'Bonusa devam et':'Bonusu başlat'}
    </button>
    <button className="text-button" onClick={onContinue}>Bonusu geç, yolculuğa devam et</button>
   </div>
  </div>
 );
 return <><div className={'bonus-session'+(ready?' is-ready':'')}>
  <PlayLayout
   quietHeader starCount={collectionStats(progress).stars} focused scene={scene}
   headerAction={<button className="icon-button game-settings-trigger" aria-label="Ayarlar" aria-haspopup="dialog" onClick={openTools}><Settings aria-hidden="true"/></button>}
   title={world.title} kicker="Bonus turu" onBack={back}
   board={board} strokes={strokes} wordListKey={'bonus:'+worldId+':'+save.attempt}
   effect={ready?readiness:undefined} inputBlocked={ready} inputStatus="Başlamaya hazır"
   paused={paused||help||tools} readOnly={save.finished} reviewStatus="Bonus tamamlandı" zoom={false}
   onCommit={commit} preview={preview} onPreview={setPreview} onSelectLetter={depth=>chime('letter',depth)}
   onResume={!help&&!tools?resume:undefined} departing={result.departing&&!review}
   celebrating={save.finished&&result.ready&&!review&&!help&&!tools} aside={<></>}
   footer={<div className="play-controls bonus-controls">{save.finished&&<button className="button primary" onClick={()=>{result.skip();setReview(false);}}>Sonucu göster</button>}</div>}
  >
   <div className="bonus-dashboard">
    <div className="bonus-target"><h1 aria-label={`Hedef kelime: ${word}`} data-word-label>{word}</h1></div>
    <span className="bonus-landing" data-bonus-sink aria-hidden="true"><Sparkles/></span>
    <div className={seconds<=10?'bonus-dial urgent':'bonus-dial'} role="timer" aria-label={`${seconds} saniye kaldı`}>
     <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="27"/>
      <circle className="bonus-time-remaining" cx="32" cy="32" r="27" pathLength="100" strokeDasharray={`${Math.max(0,Math.min(100,seconds/(BONUS_DURATION/1000)*100))} 100`}/>
     </svg>
     <b>{seconds}</b><small>sn</small>
    </div>
    <div className="bonus-discoveries" role="progressbar" aria-label="Bulunan kelimeler"
     aria-valuenow={save.found.length} aria-valuemin={0} aria-valuemax={board.targets.length}>
     <i style={{transform:`scaleX(${save.found.length/board.targets.length})`}}/>
     <span>{save.found.length} / {board.targets.length}</span>
    </div>
   </div>
   <p className="bonus-notice" role="status">{message}</p>
  </PlayLayout>
 </div>
 {tools&&<GameToolsSheet finished={save.finished} onClose={closeTools} onHome={back} sound={progress.sound} onSound={()=>{chime(progress.sound?'mute':'enable');onProgress(p=>({...p,sound:!p.sound}));}} onHelp={()=>{if(started)pause();setHelp(true);}}/>}
 {help&&<Modal className="mechanic-guide" title="Bonus turu" onClose={()=>{setHelp(false);if(started)resume();}} footer={<button className="button primary full" onClick={()=>{setHelp(false);if(started)resume();}}>Oyuna dön</button>}><p>Tahtadaki {word} kelimelerini yatay, dikey, çapraz veya tersten bul. Her farklı çizgi yalnız bir kez sayılır.</p><p>Süre dolunca buldukların kaydedilir. Ara verdiğinde süre durur. İpucu veya puan cezası yok.</p></Modal>}
 {save.finished&&result.ready&&!review&&!help&&!tools&&<Modal scene={scene}
  className="scene-result celebration-outcome bonus-outcome berrak-result"
  title={save.found.length===board.targets.length?'Hepsini buldun!':'Bonus tamamlandı'}
  resultStars={collectionStats(progress).stars} onClose={onHome??onBack}
  footer={<>
   <button className="button primary full result-continue" onClick={onContinue}>Devam et</button>
   <div className="result-shortcuts">
    <button type="button" aria-label="Tekrar dene" onClick={replay}><RefreshCw aria-hidden="true"/></button>
    <button type="button" aria-label="Tahtayı incele" onClick={()=>setReview(true)}><Grid3X3 aria-hidden="true"/></button>
   </div>
  </>}>
  <p className="result-subtitle">{save.found.length===0?'İlk ve son harfe dokunarak da deneyebilirsin.':word}</p>
  <div className="bonus-discovery-medal" aria-label={`${save.found.length} / ${board.targets.length} kelime`}>
   <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="89"/><circle className="bonus-medal-fill" cx="100" cy="100" r="89" pathLength="100" strokeDasharray={`${save.found.length/board.targets.length*100} 100`}/></svg>
   <b>{save.found.length}<small>/{board.targets.length}</small></b><span>kelime</span>
  </div>
  <p className="bonus-personal-best">En iyi turun · {save.best} kelime</p>
 </Modal>}
 </>;
}
