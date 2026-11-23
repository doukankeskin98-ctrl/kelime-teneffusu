'use client';
import {RULES_COPY} from '@/lib/game/rules-copy';
import {DailyRankingJoin} from './DailyRankingJoin';
import {DailyReminder} from './DailyReminder';
import {requestGameReview} from '@/lib/platform/engagement';
import {playableJourney,journeyPresentationKey,revisionSave} from '@/lib/game/journey-revisions';
import {canonicalStroke,presentationStrokes} from '@/lib/game/board-quality';
import {presentationBoard} from '@/lib/game/journey-presentation';
import {firstPlayStep,needsFirstPlayGuide} from '@/lib/game/first-play';
import {istanbulDay} from '@/lib/game/engine';
import {recordWeeklyCompletion} from '@/lib/game/weekly-reward';
import {bonusOffer,chapterPace,type MechanicGuideId} from '@/lib/game/journey-flow';
import {MechanicGuide} from './MechanicGuide';
import {TrailResult} from './WordTrail';
import {FirstPlayGuide} from './FirstPlayGuide';
import {useResultPresentation} from './useResultPresentation';
import {gameIsActive} from '@/lib/platform/runtime';
import {observeGameActivity} from '@/lib/platform/activity';
import {LIVING_STORIES,livingStory,storyStage} from '@/lib/game/story-content';
import {StoryHud,StoryResult} from './StoryExperience';
import {RIDDLE_CHAPTERS,isRiddleChapter} from '@/lib/game/riddle-content';
import {useEffect,useMemo,useRef,useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {Clock,Compass,Flag,Grid3X3,RefreshCw,Star,Trophy} from 'lucide-react';
import {findTheme,LEVEL_NAMES} from '@/lib/game/catalog';
import {authoredLesson,isAuthoredRevision} from '@/lib/game/authored-journey';
import {JOURNEYS,journeyBoard,TUTORIAL} from '@/lib/game/content';
import {hash,makePuzzle,match,timeLabel,type Cell,type Puzzle,type Stroke} from '@/lib/game/engine';
import {collectionStats,mergeProgress,cleanSave,type Progress,type SavedLevel} from '@/lib/game/progress';
import {mergeChapterSave} from '@/lib/studio/chapter-progress';
import {track,pilotMetric} from '@/lib/game/telemetry';
import {discoveryRewards,nextJourneyAfter} from '@/lib/game/discovery';
import {chapterCredit} from '@/lib/game/original-content';
import {mainChapter,nextMainChapter,FIRST_TEN_LESSONS,nextChapterLabel} from '@/lib/game/main-journey';
import {newerDefinitionNote,readDefinitionNote,writeDefinitionNote,type DefinitionNote} from '@/lib/game/definition-notes';
import {sceneForJourney} from '@/lib/game/scene';
import {worldChapter,chapterVeils,veilInstruction} from '@/lib/game/world-presentation';
import {SceneArt} from './SceneArt';
import {JourneyResult} from './JourneyResult';
import {journeyGoal} from '@/lib/game/achievement-view';
import {nearMissMessage,soloHintGuide,hintTarget,wordCardCopy,focusedWordGroup,wordListProgress} from '@/lib/game/word-card';
import {JourneyObjective,VictorySummary,NextJourneyPreview} from './AchievementLoop';
import * as legacy from '@/lib/game/legacy';
import type {DailyView} from '@/lib/game/server';
import {DailyActionSession,type DailyActionState,type DailyIntent,type DailyReply} from '@/lib/game/daily-action';
import {dailyIntentStore} from '@/lib/game/daily-pending';
import {requestDaily} from './daily-transport';
import {DailyActionNotice} from './DailyActionNotice';
import {Help,Modal,PlayControls,PlayLayout,useChime,WordList} from './common';
export interface SoloExternal {board:Puzzle;presentationKey?:string;save?:SavedLevel;resume?:SavedLevel;personalBestKnown?:boolean;title:string;note:string;onSave:(save:SavedLevel)=>void;result?:(save:SavedLevel)=>ReactNode}
export interface SoloConfig {themeId:string;level:number;classic?:boolean;journey?:string;tutorial?:boolean;practice?:boolean;campaign?:boolean;bonusWorld?:string;arrivalWorld?:string;run?:number}
function classicBoard(round:number,seed:number):Puzzle {
 const b=legacy.generateBoard(round,seed),def=legacy.ROUNDS[round]!;
 const targets=def.words.flatMap((w,g)=>w.parts.map((text,i)=>({id:`${g}.${i}`,label:w.label,text,group:g})));
 return {version:2,size:b.size,grid:b.grid,targets,placements:b.placements.map(p=>({...targets.find(t=>t.id===p.id)!,a:[p.r,p.c],b:[p.r+p.dr*(p.len-1),p.c+p.dc*(p.len-1)]}))};
}
export function Solo({dailyNamed=true,onDailyNamed,config,progress,onProgress,onBack,onHome,onMap,onNext,onBonus,external,daily:initialDaily,ownerId,definitionOwnerId=ownerId}:{definitionOwnerId?:string;ownerId?:string;config:SoloConfig;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;onBack:()=>void;onHome?:()=>void;onMap:()=>void;onNext:(config:SoloConfig)=>void;onBonus?:(worldId:string,next:SoloConfig|null)=>void;dailyNamed?:boolean;onDailyNamed?:(nickname:string,ownerId:string)=>void;daily?:DailyView;external?:SoloExternal}){
 const [starCount]=useState(()=>collectionStats(progress).stars);
 const [journey]=useState(()=>playableJourney(config.journey??'',progress));
 const [creditedBefore]=useState(()=>config.campaign&&config.journey?chapterCredit(progress,config.journey):undefined);
 const pilotChapter=journey&&isAuthoredRevision(journey.id,journey.revision)&&!config.practice?journey.id:undefined;
 const story=livingStory(config.journey),main=config.campaign?mainChapter(config.journey):null,progressAtStart=useRef(progress),weeklyFinish=useRef<string|null>(null);
 const legacyState=useMemo(()=>{if(!config.classic)return null;try{return legacy.validateSave(JSON.parse(localStorage.getItem(legacy.SAVE_KEY)??'null'))??legacy.freshState(hash('classic-first-game'));}catch{return legacy.freshState(hash('classic-first-game'));}},[config.classic]);
 const [daily,setDaily]=useState(initialDaily),[dailyNow,setDailyNow]=useState(Date.now),dailyOffset=useRef(initialDaily?initialDaily.serverNow-dailyNow:0);
 const canonicalBoard=useMemo(()=>external?.board??daily?.board??(config.tutorial?TUTORIAL:journey?journeyBoard(journey):config.classic?classicBoard(config.level,legacyState!.seed):makePuzzle(config.themeId,config.level,hash(`campaign-v2:${config.themeId}:${config.level}`))),[config.themeId,config.level,config.classic,config.tutorial,journey?.id,legacyState,daily?.id,external?.board]);
 const presentationKey=external?.presentationKey??(config.tutorial?'tutorial':journey?journeyPresentationKey(journey):`${config.themeId}.${config.level}`);
 const keepCanonical=!!daily||!!(external&&!external.presentationKey)||!!config.classic;
 const board=useMemo(()=>keepCanonical?canonicalBoard:presentationBoard(canonicalBoard as Puzzle,presentationKey),[canonicalBoard,presentationKey,keepCanonical]);
 const world=worldChapter(journey?.id,journey?.revision),veils=chapterVeils(journey?.id,board.targets,journey?.revision),veilNote=veilInstruction(veils);
 const key=journey?'route:'+journey.id:`${config.themeId}.${config.level}`;
 const previousBest=useRef(external?.save??progress.saves[key]);
 const [save,setSave]=useState<SavedLevel>(()=>{const initial=external?cleanSave(config.practice?undefined:external.save,canonicalBoard):daily?{strokes:daily.strokes,elapsed:0,hints:daily.hints,complete:daily.finished!==null,stars:3-Math.min(2,daily.hints)}:config.tutorial||config.practice?cleanSave(undefined,canonicalBoard):config.classic?cleanSave({strokes:legacyState!.strokes[config.level]!,elapsed:legacyState!.elapsed[config.level]!,hints:legacyState!.hints[config.level]!,complete:false,stars:0},canonicalBoard):cleanSave(revisionSave(progress,key,journey?.revision??1),canonicalBoard);return journey?.revision?{...initial,revision:journey.revision}:initial;});
 const [guideAtStart]=useState(()=>!!config.tutorial||(config.campaign===true&&config.journey==='uzay-1'&&needsFirstPlayGuide(progress)));
 const [guideSkipped,setGuideSkipped]=useState(false);
 const [arrival,setArrival]=useState(config.arrivalWorld??'');
 useEffect(()=>{if(!arrival)return;const timer=setTimeout(()=>setArrival(''),1800);return()=>clearTimeout(timer);},[arrival]);
 const [mechanic,setMechanic]=useState<MechanicGuideId|null>(()=>{if(config.tutorial||daily||external||story||save.complete||save.strokes.length>0||save.elapsed>0||save.hints>0)return null;const kind=journey?.clues?'riddle':veilNote?'concealed':null;return kind&&!progress.mechanicGuides?.includes(kind)?kind:null;});
 const closeMechanic=()=>{const kind=mechanic;setMechanic(null);if(kind)onProgress(p=>({...p,mechanicGuides:[...new Set([...(p.mechanicGuides??[]),kind])]}));};
 const guideStep=guideAtStart&&!guideSkipped&&!save.complete&&(config.tutorial||(!progress.guideDone&&!progress.tutorialDone))?firstPlayStep(board as Puzzle,save.strokes):null;
 const guide=guideStep?.target?guideStep:null;
 useEffect(()=>{if(guideStep?.step===3&&!config.tutorial)onProgress(p=>p.guideDone?p:{...p,guideDone:true});},[guideStep?.step,config.tutorial,onProgress]);
 const skipGuide=()=>{setGuideSkipped(true);if(!config.tutorial)onProgress(p=>({...p,guideDone:true}));};
 const [hintEnd,setHintEnd]=useState<Cell|null>(null);
 const hintCount=useRef(save.hints);hintCount.current=save.hints;
 const [turned,setTurned]=useState(false);
 const [hintPicker,setHintPicker]=useState(false);
 const choosingHint=useRef(false);
 const noteKey=journey?.clues&&!config.practice&&!external&&!daily?key+':r'+(journey.revision??1):null;
 const [localNote,setLocalNote]=useState<DefinitionNote|undefined>(()=>noteKey&&!save.complete&&typeof localStorage!=='undefined'?readDefinitionNote(localStorage,definitionOwnerId,noteKey,save.hints):undefined);
 const note=noteKey?newerDefinitionNote(localNote,progress.definitionNotes?.[noteKey]):undefined;
 const syncedRun=noteKey?revisionSave(progress,key,journey?.revision??1):undefined;
 useEffect(()=>{
  if(!syncedRun||save.complete)return;
  const hasNewWord=syncedRun.strokes.some(remote=>!save.strokes.some(local=>local.id===remote.id));
  if(!hasNewWord&&syncedRun.hints<=save.hints)return;
  // Apply an arriving server snapshot between paints without interrupting the
  // current input handler. A chapter switch cancels the pending update.
  const frame=requestAnimationFrame(()=>setSave(current=>({...mergeChapterSave(current,syncedRun,canonicalBoard as Puzzle),...(journey?.revision?{revision:journey.revision}:{})})));
  return ()=>cancelAnimationFrame(frame);
 },[syncedRun,canonicalBoard,journey?.revision,save]);
 const [practiceReveals,setPracticeReveals]=useState<Record<number,number>>({});
 const reveals=note?.reveals??practiceReveals;
 const [ordinaryGroup,setOrdinaryGroup]=useState<number|null>(()=>guide?.target?.group??null);
 const preferredGroup=note?.selected??ordinaryGroup;
 const updateNote=(group:number|null,letters= reveals,hints=save.hints)=>{
  if(!noteKey){setOrdinaryGroup(group);setPracticeReveals(letters);return;}
  setLocalNote(previous=>({selected:group,reveals:letters,hints,updated:Math.max(Date.now(),(previous?.updated??0)+1,(note?.updated??0)+1)}));
 };
 const setPreferredGroup=(group:number|null)=>updateNote(group);
 const [clueSuccess,setClueSuccess]=useState<number|null>(null);
 const [clueMiss,setClueMiss]=useState(0);
 const clueTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>()=>clearTimeout(clueTimer.current),[]);

 useEffect(()=>{if(noteKey&&typeof localStorage!=='undefined')writeDefinitionNote(localStorage,definitionOwnerId,noteKey,save.complete?null:note??null);},[definitionOwnerId,noteKey,note,save.complete]);
 useEffect(()=>{if(guide?.target)setPreferredGroup(guide.target.group);},[guide?.target?.id]);
 const [toolsPaused,setPaused]=useState(false),[foreground,setForeground]=useState(true),[hint,setHint]=useState<Cell|null>(null),[preview,setPreview]=useState(''),[message,setMessage]=useState(''),[help,setHelp]=useState(false),[review,setReview]=useState(false),[exit,setExit]=useState(false);
 const guideFeedback=message&&!/ bulundu|tamamlandı|^Tekrar dene\.$/.test(message)?message:undefined;
 const paused=toolsPaused||!foreground;
 const clock=useRef({at:0,tick:0,active:true});
 useEffect(()=>observeGameActivity(document,window,gameIsActive,active=>{clock.current={at:performance.now(),tick:0,active};setForeground(active);if(!active){choosingHint.current=false;setHintPicker(false);}}),[]);
 const chime=useChime(progress.sound,progress.haptics),foundRef=useRef(save.strokes),started=useRef(0),completionTracked=useRef(false);foundRef.current=save.strokes;
 useEffect(()=>{started.current=performance.now();},[]);
 const [dailyAction,setDailyAction]=useState<DailyActionState>({phase:'idle',intent:null}),dailySession=useRef<DailyActionSession|null>(null),dailyOwner=useRef(ownerId),liveOwner=useRef(ownerId),dailyRetired=useRef(false);liveOwner.current=ownerId;if(daily&&ownerId!==dailyOwner.current)dailyRetired.current=true;
 const ownerChanged=!!daily&&(!dailyOwner.current||dailyRetired.current),displayAction:DailyActionState=ownerChanged?{phase:'account-changed',intent:null}:dailyAction;
 const busy=displayAction.phase==='sending'||displayAction.phase==='checking',dailyLocked=!!daily&&(ownerChanged||!dailySession.current||displayAction.phase!=='idle');
 const pending=displayAction.phase==='sending'&&displayAction.intent?.kind==='claim'?displayAction.intent.stroke:null;
 const inputStatus=displayAction.phase==='sending'?(displayAction.intent?.kind==='hint'?'İpucun hazırlanıyor. Süre devam ediyor.':'Kelimen doğrulanıyor. Süre devam ediyor.'):displayAction.phase==='checking'?'Günlük kaydın kontrol ediliyor.':displayAction.phase==='storage-error'?'Önce bu sekmedeki işlem kaydını yeniden dene.':displayAction.phase==='expired'?'Günlük sayfasına dönerek güncel bulmacayı aç.':ownerChanged?'Güncel profilinle günlük sayfasından yeniden aç.':dailySession.current?'Önce bekleyen işlemi kontrol ederek devam et.':'Günlük oyun hazırlanıyor.';
 const completed=daily?daily.finished!==null:save.complete,theme=findTheme(config.themeId),title=external?.title??(world?world.topic:config.tutorial?'İlk bölüm':daily?'Günlük bulmaca':journey?.title??(config.classic?legacy.ROUNDS[config.level]!.title:LEVEL_NAMES[config.level]!));
 useEffect(()=>{
  const resume=external?.resume;
  if(!resume||config.practice||!external)return;
  setSave(current=>{const merged=mergeChapterSave(current,resume,external.board);return JSON.stringify(merged)===JSON.stringify(current)?current:merged;});
  if(resume.strokes.some(stroke=>!save.strokes.some(found=>found.id===stroke.id)))
   setMessage('Hesabındaki kelimeler bu tahtaya eklendi.');
 },[external?.resume,config.practice,board]);
 const result=useResultPresentation(completed,key+':'+(config.run??0),!!main),resultReady=result.ready;
 useEffect(()=>{if(completed&&guideAtStart&&!config.tutorial)onProgress(p=>({...p,guideDone:true}));},[completed]);
 useEffect(()=>{if(pilotChapter&&!save.complete)pilotMetric(pilotChapter,'starts');track('level_start');if(story&&!save.complete)track('story_start');},[]);
 useEffect(()=>{if(!hint&&!message)return;const timeout=setTimeout(()=>{setHint(null);setHintEnd(null);setMessage('');},3000);return ()=>clearTimeout(timeout);},[hint,message]);
 useEffect(()=>{
  if(daily){const timer=setInterval(()=>setDailyNow(Date.now()),250);return ()=>clearInterval(timer);}
  if(paused||completed||help||exit||mechanic)return;
  clock.current={at:performance.now(),tick:0,active:foreground};
  const timer=setInterval(()=>{const c=clock.current;if(!c.active||document.hidden||!gameIsActive())return;const tick=Math.floor((performance.now()-c.at)/1000),delta=tick-c.tick;c.tick=tick;
   if(delta>0)setSave(s=>s.complete?s:{...s,elapsed:s.elapsed+delta});},1000);
  return ()=>clearInterval(timer);
 },[paused,completed,help,exit,mechanic,!!daily]);
 useEffect(()=>{
  if(external){external.onSave(save);return;}
  if(daily){if(daily.finished!==null&&dailyOwner.current&&!dailyRetired.current&&liveOwner.current===dailyOwner.current)onProgress(p=>p.days.includes(daily.day)?p:{...p,days:[...p.days,daily.day]});return;}
  if(config.tutorial){if(save.complete)onProgress(p=>({...p,tutorialDone:true}));return;}
  if(config.classic&&legacyState){if(config.practice)return;legacyState.round=config.level;legacyState.strokes[config.level]=save.strokes;legacyState.found[config.level]=save.strokes.map(s=>s.id);legacyState.hints[config.level]=save.hints;legacyState.elapsed[config.level]=save.elapsed;legacyState.sound=progress.sound;legacyState.zoom=progress.zoom;try{localStorage.setItem(legacy.SAVE_KEY,JSON.stringify(legacyState));}catch{}}
  else if(!config.practice||save.complete)onProgress(p=>{
   const merged=mergeProgress(p,{...p,...(noteKey&&localNote?{definitionNotes:{[noteKey]:localNote}}:{}),...(p.revisionSaves?{revisionSaves:{}}:{}),saves:{[key]:{...save,...(journey?.revision?{revision:journey.revision}:{})}}});
   const weekly=main&&save.complete&&weeklyFinish.current?recordWeeklyCompletion(p.weekly,journey!.id,weeklyFinish.current):p.weekly;
   return {...merged,...(weekly?{weekly}:{}),last:story?p.last:{themeId:config.themeId,level:config.level,...(journey?{journey:journey.id}:{})}};
  });
 },[save,daily?.finished,localNote]);
 useEffect(()=>{if(completed&&!completionTracked.current){completionTracked.current=true;if(pilotChapter&&!creditedBefore?.complete)pilotMetric(pilotChapter,'finishes',save.elapsed);track('level_complete',save.elapsed*1000);window.dispatchEvent(new Event('kt-sync-now'));}},[completed]);
 const acceptDaily=(result:DailyView)=>{foundRef.current=result.strokes;setDaily(result);dailyOffset.current=result.serverNow-Date.now();setSave(s=>({...s,strokes:result.strokes,hints:result.hints,complete:result.finished!==null,stars:result.finished!==null?3-Math.min(2,result.hints):0}));};
 const dailyCallbacks=useRef({receive:acceptDaily,confirmed:(_intent:DailyIntent,_reply:DailyReply)=>{}});
 dailyCallbacks.current={receive:acceptDaily,confirmed:(intent,reply)=>{
  if(intent.kind==='claim'){if(reply.finished!==null)result.prepare();chime(reply.finished!==null);if(reply.strokes.length===1)track('first_word',performance.now()-started.current);setMessage(intent.label+' bulundu!');}
  else if(reply.hintCell){chime('hint');setHint(reply.hintCell);setMessage('İlk harfe bak. Sürene +15 saniye.');}
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
  if(paused||completed||help||exit||mechanic||dailyLocked)return;
  const target=match(board,a,b);
  if(!target){
   const visible=story||journey?.clues||daily||external?[]:board.targets.filter(t=>
    (veils[t.group]??'open')==='open'&&!foundRef.current.some(s=>s.id===t.id));
   if(journey?.clues)setClueMiss(n=>n+1);
   chime('miss');
   setMessage(nearMissMessage(board,a,b,visible));
   track('selection_miss');if(pilotChapter)pilotMetric(pilotChapter,'misses');
   return;
  }
  if(foundRef.current.some(s=>s.id===target.id)){setMessage('Bu kelimeyi zaten buldun.');return;}
  if(story&&storyStage(story,board,foundRef.current).target?.id!==target.id){setMessage('Bu kelime birazdan. Şimdiki ipucunu çöz.');return;}
  const stroke=canonicalStroke(canonicalBoard as Puzzle,board as Puzzle,a,b);if(!stroke)return;
  const finish=foundRef.current.length+1===board.targets.length;
  const groupDone=board.targets.filter(t=>t.group===target.group).every(t=>t.id===target.id||foundRef.current.some(s=>s.id===t.id)),foundLabel=groupDone?target.label:target.text;
  if(journey?.clues&&groupDone){
   clearTimeout(clueTimer.current);
   const selected=preferredGroup??focusedWordGroup(board,foundRef.current,null);
   const groups=[...new Set(board.targets.map(t=>t.group))],index=groups.indexOf(target.group);
   const found=new Set([...foundRef.current,stroke].map(s=>s.id));
   const ordered=[...groups.slice(index+1),...groups.slice(0,index)];
   const next=selected===target.group?ordered.find(group=>board.targets.some(t=>t.group===group&&!found.has(t.id)))??null:selected;
   setPreferredGroup(next);
   if(!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches&&document.documentElement.dataset['reduceMotion']!=='true'){
    setClueSuccess(target.group);
    clueTimer.current=setTimeout(()=>setClueSuccess(null),700);
   }else setClueSuccess(null);
  }
  if(finish&&!daily){result.prepare();if(main&&!external)weeklyFinish.current=istanbulDay();}
  if(!daily)chime(finish);if(!daily&&!foundRef.current.length)track('first_word',performance.now()-started.current);
  if(daily){setHint(null);setHintEnd(null);void dailySession.current?.act({kind:'claim',stroke,label:target.label});}
  else{if(story){track('story_step');if(finish)track('story_complete');}const strokes=[...foundRef.current,stroke];foundRef.current=strokes;setSave(s=>{const latest=[...s.strokes,...(s.strokes.some(found=>found.id===stroke.id)?[]:[stroke])],complete=latest.length===board.targets.length;return {...s,strokes:latest,complete,stars:complete?3-Math.min(2,s.hints):0};});setMessage(story?story.steps.find(step=>step.word===target.text)!.reveal:finish?(main?'Bölüm tamamlandı!':'Bölüm tamamlandı!'):config.tutorial?'Kelime bulundu. Sıradakini bul.':foundLabel+' bulundu · '+wordListProgress(board,strokes).remaining+' kelime kaldı');}
  setHint(null);setHintEnd(null);
 };
 const requestHint=async(group=preferredGroup)=>{
  if(paused||completed||help||exit||mechanic||hintCount.current>=3||dailyLocked)return;
  if(firstStoryHint){setHint(firstStoryHint);setMessage('İlk harf işaretli. Başlangıç ipucun ücretsiz.');return;}
  const target=story?storyStage(story,board,foundRef.current).target:hintTarget(board,foundRef.current,group);if(!target)return;
  if(daily){setHint(null);setHintEnd(null);void dailySession.current?.act({kind:'hint',requestId:crypto.randomUUID(),targetId:target.id});return;}
  if(journey?.clues&&(reveals[target.group]??0)>=target.text.length){setMessage('Bu cevabın bütün harfleri açık.');return;}
  const remaining=(board as Puzzle).placements.find(p=>p.id===target.id);if(remaining){if(pilotChapter)pilotMetric(pilotChapter,'hints');hintCount.current++;chime('hint');const guide=soloHintGuide(remaining,hintCount.current);
   if(journey?.clues){
    const index=Math.min(reveals[target.group]??0,target.text.length-1);
    const step=(axis:0|1)=>remaining.a[axis]+index*Math.sign(remaining.b[axis]-remaining.a[axis]);
    updateNote(target.group,{...reveals,[target.group]:index+1},Math.min(3,save.hints+1));
    setHint([step(0),step(1)]);setHintEnd(null);
   }else{setHint(guide.start);setHintEnd(guide.end);}setSave(s=>({...s,hints:Math.min(3,s.hints+1)}));setMessage(guide.message);}
 };
 const remainingHints=new Map<number,(typeof board.targets)[number]>();
 if(main&&hintPicker){
  const found=new Set(save.strokes.map(stroke=>stroke.id));
  for(const target of board.targets)if(!found.has(target.id)&&!remainingHints.has(target.group))remainingHints.set(target.group,target);
 }
 const openHint=()=>{
  if(!main||guide||wordListProgress(board,foundRef.current).remaining<=1){void requestHint();return;}
  choosingHint.current=true;setHintPicker(true);
 };
 const closeHint=()=>{choosingHint.current=false;setHintPicker(false);};
 const chooseHint=(group:number)=>{
  if(!choosingHint.current||!remainingHints.has(group))return;
  closeHint();setPreferredGroup(group);void requestHint(group);
 };
 const seconds=daily?(daily.finished!==null?daily.duration/1000:Math.max(0,(dailyNow+dailyOffset.current-daily.starts)/1000)):save.elapsed;
 const resume=()=>{if(!daily&&paused&&!completed&&!help&&!exit&&!mechanic&&!dailyLocked&&!document.hidden&&gameIsActive()){chime('start');setHint(null);setHintEnd(null);setPreview('');setPaused(false);}};
 const controls=(settingsOnly=false)=><PlayControls settingsOnly={settingsOnly} hideSettings={!settingsOnly} onHome={()=>daily&&!completed?setExit(true):onBack()}
  turned={turned} onTurn={!daily&&!guide?()=>{setTurned(v=>!v);setPreview('');setMessage('Tahta döndürüldü.');}:undefined}
  paused={paused} completed={completed} blocked={dailyLocked} busy={busy}
  onPause={()=>{chime(paused?'start':'pause');setHint(null);setHintEnd(null);setPreview('');setPaused(p=>!p);}}
  onSkipResult={completed&&!resultReady?result.skip:undefined}
  zoom={progress.zoom} onZoom={()=>onProgress(p=>({...p,zoom:!p.zoom}))}
  sound={progress.sound} onSound={()=>{chime(progress.sound?'mute':'enable');onProgress(p=>({...p,sound:!p.sound}));}}
  hints={Math.max(0,3-save.hints)} onHint={openHint} onHelp={()=>setHelp(true)} canPause={!daily}/>;
 const tutorialHint=config.tutorial&&!guideSkipped&&!save.strokes.some(s=>s.id===TUTORIAL.targets[0]!.id)?(board as Puzzle).placements.find(p=>p.id===TUTORIAL.targets[0]!.id)!.a:null;
 const improved=(!external||external.personalBestKnown===true)&&completed&&!daily&&!config.classic&&!config.tutorial&&previousBest.current?.complete&&(save.stars>previousBest.current.stars||(save.stars===previousBest.current.stars&&save.elapsed<previousBest.current.elapsed));
 const resultProgress=useMemo(()=>journey&&completed?mergeProgress(progress,{...progress,...(progress.revisionSaves?{revisionSaves:{}}:{}),saves:{[key]:{...save,...(journey.revision?{revision:journey.revision}:{})}}}):progress,[completed,progress,key,save,journey]);
 const starsEarned=Math.max(0,save.stars-(creditedBefore?.complete?creditedBefore.stars:0));
 const rewards=journey&&completed?discoveryRewards(progressAtStart.current,resultProgress):[];
 const riddle=isRiddleChapter(journey?.id);
 const nextJourney=journey?(story?LIVING_STORIES.find(c=>!resultProgress.saves['route:'+c.id]?.complete)??null:riddle?RIDDLE_CHAPTERS.find(c=>!resultProgress.saves['route:'+c.id]?.complete)??null:nextJourneyAfter(resultProgress,journey.id)):null;
 const next=()=>{if(external){onBack();return;}if(config.tutorial){if(progress.saves['route:uzay-1']?.complete)onBack();else onNext({themeId:'uzay',level:0,journey:'uzay-1',campaign:true});return;}if(journey){if(nextJourney)onNext({themeId:nextJourney.themeId,level:0,journey:nextJourney.id,...(main?{campaign:true}:{})});else onMap();return;}if(config.level<(config.classic?3:5))onNext({...config,practice:false,level:config.level+1});else onBack();};
 const focusGroup=focusedWordGroup(board,save.strokes,preferredGroup);
 const stage=story?storyStage(story,board,save.strokes):null;
 const firstStoryHint=story?.id===LIVING_STORIES[0]!.id&&!previousBest.current?.complete&&stage?.index===0?(board as Puzzle).placements.find(p=>p.id===stage.target?.id)?.a:null;
 const canFocus=!story&&!completed&&!paused&&!help&&!exit&&!mechanic&&!dailyLocked;
 const displayStrokes=useMemo(()=>presentationStrokes(canonicalBoard as Puzzle,board as Puzzle,save.strokes),[canonicalBoard,board,save.strokes]);
 const selectDefinition=(group:number)=>{clearTimeout(clueTimer.current);setClueSuccess(null);setPreferredGroup(group);};
 const wordList={veils,board,strokes:displayStrokes,clues:journey?.clues,
  ...(journey?.clues?{definition:{selected:preferredGroup??focusGroup,select:selectDefinition,reveals,success:clueSuccess,miss:clueMiss}}:{}),...(story?{activeOnly:stage?.target?.group??null}:{}),...(canFocus?{focusedGroup:focusGroup,onFocusGroup:setPreferredGroup}:{})};
 const targets=wordListProgress(board,save.strokes),inlineTargets=!daily&&!config.classic&&targets.total<=8;
 const bonusWorld=main&&!config.practice&&onBonus&&completed?bonusOffer(progressAtStart.current,resultProgress,journey!.id):null;
 const startBonus=()=>{if(bonusWorld&&onBonus)onBonus(bonusWorld.id,nextJourney?{themeId:nextJourney.themeId,level:0,journey:nextJourney.id,campaign:true}:null);};
 const reviewMilestone=rewards.some(r=>r.kind==='album');
 useEffect(()=>{if(!main||!completed||!resultReady||review||help||exit||config.practice||!reviewMilestone)return;const timer=setTimeout(()=>{if(!document.hidden)void requestGameReview();},1800);return ()=>clearTimeout(timer);},[main,completed,resultReady,review,help,exit,config.practice,reviewMilestone]);
 const resultTitle=daily?'Günlük tamamlandı':story?'Hikâye tamamlandı':reviewMilestone?'Dünya tamam!':config.practice?'Yine başardın!':'Tebrikler!';
 const nextNumber=main&&nextJourney?mainChapter(nextJourney.id)?.number:null;
 const continueLabel=bonusWorld?'Bonus turu':main?(nextNumber?`Bölüm ${nextNumber}`:'Yolculuğa dön'):config.tutorial?(progress.saves['route:uzay-1']?.complete?'Yolculuğa dön':'Yolculuğa başla'):daily?'Günlük sayfasına dön':external?'Bölümlere dön':journey?(nextJourney?'Sonraki bölüm':story?'Hikâyelere dön':riddle?'İpucu Avı rafına dön':'Yolculuğum’a dön'):'Sonraki bölüm';
 const goal=journeyGoal(progressAtStart.current,journey?.id),resultGoal=journeyGoal(resultProgress,journey?.id),nextGoal=journeyGoal(resultProgress,nextJourney?.id);
 const quietNotice=/ bulundu|tamamlandı|^Tekrar dene\.$/.test(message);
 const visibleGuide=guide&&!paused&&!help&&!exit?guide:null;
 return <>{arrival&&<div className="world-arrival" role="status"><span>Yeni dünya!</span><strong>{arrival}</strong></div>}<PlayLayout finishStars={3-Math.min(2,save.hints)} worldStrip={main&&goal&&!progress.zoom?<div className="kt-world-progress" aria-label={goal.state.expedition.title+' · '+goal.state.pieces+'/6'}><SceneArt worldId={goal.state.expedition.id}/><span className="kt-world-name">{goal.state.expedition.title}</span><b>{goal.state.pieces}/6</b><span aria-hidden="true">{goal.state.earned.map((earned,i)=><i key={i} data-earned={earned}/>)}</span></div>:undefined} finishing={!!main&&completed&&!resultReady&&!review} boardNotice={main&&!guide&&!quietNotice?(message||(!save.strokes.length && !!journey?.revision?authoredLesson[journey.id]:undefined)):undefined} starCount={starCount} quietHeader={!daily} headerAction={controls(true)} chapterNumber={mainChapter(journey?.id)?.number} departing={result.departing&&!review&&!help&&!exit} earlyTargets={story?(stage?.target?[stage.target]:[]):undefined} onResume={!daily&&paused&&!completed&&!help&&!exit&&!mechanic&&!dailyLocked?resume:undefined} celebrating={completed&&resultReady&&!review&&!help&&!exit} scene={story?.scene??sceneForJourney(journey?.id,config.themeId)} nextScene={nextJourney?sceneForJourney(nextJourney.id,nextJourney.themeId):undefined} sceneStage={story&&stage ? .76+.24*stage.index/story.steps.length : 1} turned={turned} onSelectLetter={depth=>{if(arrival)setArrival('');chime('letter',depth);}} focused={!daily} inlineTargets={inlineTargets} wordList={wordList} wordListUnavailable={help||exit||!!mechanic||hintPicker} kicker={story?`HİKÂYELER · ${String(LIVING_STORIES.indexOf(story)+1).padStart(2,'0')} / 05`:external?'Yeni bölümler':daily?'Günlük bulmaca · '+daily.day.split('-').reverse().join('.'):config.tutorial?'ALIŞTIRMA':world?world.world.title:config.classic?'Hababam • Fotoğraftaki 20 isim':`${theme.title} • ${journey?'Yolculuk':'Bölüm '+(config.level+1)}`} title={title} onBack={()=>daily&&!completed?setExit(true):onBack()} board={board} strokes={pending&&!save.strokes.some(s=>s.id===pending.id)?[...displayStrokes,pending]:displayStrokes} paused={(!completed&&paused)||(!daily&&(help||exit||!!mechanic))} readOnly={completed} inputBlocked={dailyLocked} inputStatus={inputStatus} busy={busy} zoom={progress.zoom} demonstration={!hint?guide?.target:null} hint={hint??(guide?.target?null:tutorialHint??firstStoryHint)} hintEnd={hint?hintEnd:null} onCommit={(a,b)=>void commit(a,b)} preview={preview} onPreview={setPreview} footer={<div className={visibleGuide?'solo-control-dock has-first-play-guide':'solo-control-dock'}>{controls()}{visibleGuide&&<FirstPlayGuide guide={visibleGuide} feedback={guideFeedback} onSkip={skipGuide}/>}{!story&&<p className={guide?'sr-only':'play-notice'} role="status" aria-live={guide&&guideFeedback?'off':'polite'} aria-atomic="true"><span className={quietNotice?'sr-only':undefined}>{message||(!guide&&!completed&&!save.strokes.length&&!previousBest.current&&main?FIRST_TEN_LESSONS[journey!.id]:'')}</span></p>}</div>} aside={<><div className="game-note"><Flag size={18}/><p>{completed?'Bölüm tamamlandı. Tahtayı inceleyebilirsin.':config.tutorial?'KELİME’nin ilk harfini işaretledik. Son harfine kaydır veya iki ucuna dokun. Sonra MERAK ve KEŞİF’i bul.':daily?'Süre ara verdiğinde de devam eder. İpuçları sürene 15 saniye ekler.':external?.note??journey?.note??'Acele yok. Yanlış seçim ceza getirmez. Çaprazlara da bak.'}</p></div>{completed&&resultReady&&<button className="button primary full" onClick={()=>setReview(false)}>Sonucu göster <Trophy size={18}/></button>}</>}>
  {story&&stage?<StoryHud story={story} stage={stage.index} hints={save.hints} notice={message}/>:daily?<div className="game-status"><span><Clock size={17}/><b>{timeLabel(seconds)}</b>{save.hints>0&&<small>+{save.hints*15} sn</small>}</span><div className="progress-track" role="progressbar" aria-label="Bulunan kelimeler" aria-valuenow={targets.complete} aria-valuemin={0} aria-valuemax={targets.total}><i style={{width:`${targets.total?targets.complete/targets.total*100:0}%`}}/></div><span><Star size={17}/>{3-Math.min(2,save.hints)}</span></div>:<>

   <span className="sr-only" role="status">{targets.complete}/{targets.total} kelime bulundu</span>
  </>}
 {daily&&<DailyActionNotice state={displayAction} onRetry={()=>void dailySession.current?.retry()} onBack={onBack}/>}
 </PlayLayout>
 {hintPicker&&main&&!completed&&!paused&&<Modal className="game-library-sheet hint-picker" title="Hangi kelime?" onClose={closeHint}>
  {Object.values(veils).some(mode=>mode!=='open')&&<p className="hint-rule">{RULES_COPY.masked}</p>}<div className="hint-choices">{Array.from(remainingHints).sort(([a],[b])=>journey?.clues?Number(b===focusGroup)-Number(a===focusGroup):0).map(([group,target])=>{
   const copy=wordCardCopy(target,false,journey?.clues,veils[group]);
   return <button key={group} type="button" aria-current={journey?.clues&&group===focusGroup?true:undefined} aria-label={copy.spoken??copy.text} onClick={()=>chooseHint(group)}>{copy.text}</button>;
  })}</div>
 </Modal>}
 {mechanic&&<MechanicGuide kind={mechanic} onClose={closeMechanic}/>}
 {help&&(story?<Modal className="game-library-sheet game-tools-modal help-sheet" title="Kelimelerle bir hikâye" onClose={()=>setHelp(false)}><p>Her adımda tek bir kelime arıyorsun. İpucunu çöz, cevabın ilk harfinden son harfine kaydır veya iki ucuna dokun. Yatay, dikey, çapraz ve ters yönleri dene.</p><p>Bulduğun kelime sahneyi değiştirir ve sıradaki ipucunu açar. Yanlış seçim ceza getirmez. İpucu ilk harfi gösterir; en fazla üç kez kullanabilirsin. İlerlemen kaydedilir, dilediğinde ara verebilirsin.</p><p>İpuçsuz 3, bir ipucuyla 2, iki veya üç ipucuyla 1 yıldız kazanırsın. Süre yıldızları etkilemez.</p><button className="button primary full" onClick={()=>setHelp(false)}>Hikâyeye dön</button></Modal>:journey?.clues?<Modal className="game-library-sheet game-tools-modal help-sheet" title="İpucu avı" onClose={()=>setHelp(false)}><p>Her kısa tanım bir kelimeyi anlatır. Yanındaki sayı harf sayısını gösterir. Cevabı tahtada yatay, dikey, çapraz veya tersten bul.</p><p>Bulduğunda tanımın yerinde kelimen görünür. Zorlanırsan İpucu düğmesi ilk harfi gösterir. Süre baskısı yok.</p><button className="button primary full" onClick={()=>setHelp(false)}>Oyuna dön</button></Modal>:<><Help daily={!!daily} onClose={()=>setHelp(false)}/></>)}
 {exit&&<Modal className="game-library-sheet game-tools-modal help-sheet" title="Oyundan çıkılsın mı?" onClose={()=>setExit(false)}><p>Günlük yarış süren ara verdiğinde de devam eder. Bu sekmede bekleyen bir işlemin varsa yeniden açılışta önce kontrol edilir.</p><div className="button-row"><button className="button secondary" onClick={()=>setExit(false)}>Oyuna dön</button><button className="button primary" onClick={onBack}>Ana sayfaya dön</button></div></Modal>}
 {completed&&resultReady&&!review&&!help&&!exit&&<Modal
  scene={story?.scene??sceneForJourney(journey?.id,config.themeId)}
  className={'achievement-modal celebration-outcome scene-result berrak-result'+(reviewMilestone&&result.animateReward?' milestone-outcome':' ordinary-outcome')+(main?' journey-outcome':story?' story-outcome':'')+(bonusWorld?' has-bonus-choice':'')}
  title={resultTitle}
  resultStars={(main||onHome)?collectionStats(resultProgress).stars:undefined}
  resultStarGain={main&&result.animateReward?starsEarned:0}
  onClose={onHome??(main?onBack:()=>setReview(true))}
  footer={<>
   <button className="button primary full result-continue" aria-label={!bonusWorld&&nextNumber&&nextJourney?`${continueLabel} · ${worldChapter(nextJourney.id,nextJourney.revision)?.topic??nextJourney.title}`:undefined} onClick={bonusWorld?startBonus:daily?onBack:next}>{continueLabel}</button>
   {bonusWorld&&<button className="text-button result-bonus" onClick={next}>Bonusu geç, {nextJourney?'yolculuğa devam et':'yolculuğa dön'}</button>}
   <div className="result-shortcuts">
    {!daily&&!config.tutorial&&<button type="button" aria-label="Bir daha oyna" onClick={()=>onNext({...config,arrivalWorld:undefined,practice:true})}><RefreshCw aria-hidden="true"/><small>Tekrar</small></button>}
    <button type="button" aria-label="Tahtayı incele" onClick={()=>setReview(true)}><Grid3X3 aria-hidden="true"/><small>Tahta</small></button>
   </div>
  </>}>
  {story?<StoryResult story={story} save={save} best={previousBest.current}/>:main?<JourneyResult animateReward={!!result.animateReward} reward={<TrailResult before={progressAtStart.current} after={resultProgress}/>} before={goal} after={resultGoal} rewards={rewards} save={save} best={creditedBefore?.complete?creditedBefore:previousBest.current}/>:<VictorySummary goal={resultGoal} rewards={rewards} stars={3-Math.min(2,save.hints)} hints={save.hints} seconds={seconds} total={targets.total} improved={!!improved} best={!config.classic&&(!external||external.personalBestKnown===true)?previousBest.current:undefined} tutorial={!!config.tutorial} daily={!!daily}/>}
  {external?.result?.(save)}
  {daily&&<>{dailyNamed?<p className="center muted">Sonucun günlük sıralamaya kaydedildi.</p>:onDailyNamed?<DailyRankingJoin ownerId={ownerId!} onNamed={onDailyNamed}/>:<p className="center muted">Günlük sonucun kaydedildi.</p>}<DailyReminder offer/></>}

  {story?null:main?(nextJourney?null:<p className="journey-next-note">Mevcut bütün bölümler tamam. Yeni bölüm eklenene kadar Günlük, Arena ve arşiv açık.</p>):<NextJourneyPreview goal={nextGoal}/>}
  {journey&&!story&&!main&&!riddle&&nextJourney&&<button className="text-button full" onClick={onMap}>Haritayı ve ödülleri gör <Compass size={15}/></button>}</Modal>}
 </>;
}
