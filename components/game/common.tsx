'use client';
import {DefinitionStrip,type DefinitionState} from './DefinitionStrip';
import {rowsForTargets,targetAdvance} from '@/lib/game/rack-rows';
import {Disclosure} from './Disclosure';

import {StarTotal} from './StarTotal';
import {SettingsWindow} from './SettingsHome';
import {usePlaySettings} from './PlayPreferences';
import '@/lib/game/browser-compat';
import {wordCardCopy,wordListProgress,focusedWordGroup,compactWordRack,veiledText,type WordVeil} from '@/lib/game/word-card';
import {useEffect,useLayoutEffect,useRef,useState,useMemo,type ReactNode,type CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,Check,Lightbulb,ListChecks,LoaderCircle,Settings,Star} from 'lucide-react';
import {Board,strokeColor} from './Board';
import {stopHapticSelection} from '@/lib/game/haptics';
import {WordFeedback} from './WordFeedback';
import {usePlayPraise} from './usePlayPraise';
import {RESULT_EXIT_MS} from '@/lib/game/word-feedback';
import {Celebration} from './Celebration';
import {GameScene} from './SceneArt';
import {sceneImage} from '@/lib/game/scene';
import type {SceneKind} from '@/lib/game/scene';
import {projectBoard,projectStrokes} from '@/lib/game/board-projection';
import {boardView,viewCell,viewStrokes} from '@/lib/game/board-view';
import {Window} from '../ui/GameUI';
import {attachPlayFit} from '@/lib/game/viewport';
import {memberFetch} from '@/lib/auth/firebase-client';
import type {Cell,Puzzle,Stroke} from '@/lib/game/engine';
const errorText=(v:unknown)=>v&&typeof v==='object'&&'error' in v&&typeof v.error==='string'?v.error:'Bağlantı kurulamadı.';
export async function api<T>(action:string,data:Record<string,unknown>={},signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data}),signal});const value=await res.json();if(!res.ok)throw new Error(errorText(value));return value as T;}
export async function getApi<T>(query='',signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/game'+query,{cache:'no-store',signal});const data=await res.json();if(!res.ok)throw new Error(errorText(data));return data as T;}
export async function socialApi<T>(action:string,data:Record<string,unknown>={},signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/social',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data}),signal});const value=await res.json();if(!res.ok)throw new Error(errorText(value));return value as T;}
export async function getSocial<T>(query='',signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/social'+query,{signal});const data=await res.json();if(!res.ok)throw new Error(errorText(data));return data as T;}
export {useChime} from './useGameSound';
export function Modal({title,onClose,children,className='',footer,scene,resultStars,resultStarGain=0}:{
 title:string; onClose:()=>void; children:ReactNode; className?:string; footer?:ReactNode;
 resultStarGain?:number; resultStars?:number; scene?:SceneKind;
}){
 const celebrate=className.includes('celebration-outcome')&&(!className.includes('journey-outcome')||className.includes('milestone-outcome'));
 const scoreboard=scene&&className.includes('arena-scoreboard')&&!className.includes('scene-result');
 return <Window title={title} onClose={onClose} className={className} footer={footer}
  panelArt={scoreboard?sceneImage(scene):undefined}
  scene={scene&&!scoreboard?{background:`url("${sceneImage(scene)}")`,home:resultStars!==undefined,
   leading:resultStars!==undefined?<StarTotal total={resultStars} gain={resultStarGain}/>:undefined,
   decoration:celebrate?<Celebration grand={className.includes('milestone-outcome')}/>:undefined}:undefined}>
  {children}
 </Window>;
}
export interface WordListData {definition?:DefinitionState;veils?:Record<number,WordVeil>;board:Pick<Puzzle,'targets'>;strokes:Stroke[];golden?:string|null;clues?:Record<string,string>;focusedGroup?:number|null;onFocusGroup?:(group:number)=>void;activeOnly?:number|null}
/** A read-only view. Opening it never pauses, selects or changes the board. */
export function BoardWords({words}:{words:WordListData}){
 const [open,setOpen]=useState(false),opener=useRef<HTMLButtonElement>(null),focusFrame=useRef(0);
 const {total,complete,remaining}=wordListProgress(words.board,words.strokes);
 const sheetWords=words.activeOnly===undefined?words:{...words,board:{targets:words.board.targets.filter(t=>t.group===words.activeOnly||words.strokes.some(s=>s.id===t.id))}};
 useEffect(()=>()=>cancelAnimationFrame(focusFrame.current),[]);
 const close=()=>{setOpen(false);cancelAnimationFrame(focusFrame.current);focusFrame.current=requestAnimationFrame(()=>{focusFrame.current=0;if(opener.current?.isConnected)opener.current.focus({preventScroll:true});});};
 if(total===0)return null;
 return <div className="board-word-access"><button type="button" className="board-words-trigger" ref={opener} aria-haspopup="dialog" aria-expanded={open} aria-label={`Kelime listesini aç · ${remaining} hedef kaldı`} onClick={()=>setOpen(true)}><ListChecks size={19} aria-hidden="true"/><span>Kelimeler</span><small>{remaining} kaldı</small></button>
  {open&&<Modal title={words.clues?'Tanım listen':'Kelime listen'} onClose={close}><div className="board-words-sheet"><p className="board-words-summary">Listede <b>{complete} / {total}</b> hedef tamamlandı. Buldukların işaretli.</p><WordList {...sheetWords}/><button type="button" className="button primary full" onClick={close}>Tahtaya dön</button></div></Modal>}
 </div>;
}
/** Every clue has a persistent slot; choosing one changes focus, never a claim. */
export function MobileTargets({words,unavailable=false,passive=false}:{words:WordListData;unavailable?:boolean;passive?:boolean}){
 const [preferred,setPreferred]=useState<number|null>(null),[open,setOpen]=useState(false),opener=useRef<HTMLButtonElement>(null),focusFrame=useRef(0);
 const groups=[...new Set(words.board.targets.map(t=>t.group))],found=new Set(words.strokes.map(s=>s.id));
 const ordered=words.activeOnly!==undefined;
 const lastFound=words.board.targets.find(t=>t.id===words.strokes.at(-1)?.id)?.group;
 const active=(ordered?words.activeOnly:focusedWordGroup(words.board,words.strokes,words.onFocusGroup?words.focusedGroup??null:preferred))??lastFound??groups[0];
 const parts=words.board.targets.filter(t=>t.group===active),target=parts[0];
 const done=parts.every(t=>found.has(t.id)),copy=target?wordCardCopy(target,done,words.clues,words.veils?.[target.group]):null;
 useEffect(()=>()=>cancelAnimationFrame(focusFrame.current),[]);
 useEffect(()=>{if(unavailable)setOpen(false);},[unavailable]);
 const close=()=>{setOpen(false);cancelAnimationFrame(focusFrame.current);focusFrame.current=requestAnimationFrame(()=>{if(opener.current?.isConnected)opener.current.focus({preventScroll:true});});};
 const swipeStart=useRef<number|null>(null),swiped=useRef(false);
 const choose=(group:number)=>{setPreferred(group);words.onFocusGroup?.(group);};
 if(!target||!copy)return null;
 return <div className="mobile-targets clue-targets" aria-label={ordered?'Hikâye adımları':'Bilmece hedefleri'}>
  <div className="clue-slots" role="list" style={{'--clue-count':groups.length<=4?groups.length:3} as CSSProperties}>{groups.map((group,index)=>{
   const entries=words.board.targets.filter(t=>t.group===group),first=entries[0]!,complete=entries.every(t=>found.has(t.id)),golden=entries.some(t=>t.id===words.golden);
   const locked=ordered&&group!==words.activeOnly,selected=group===active,length=entries.reduce((n,t)=>n+t.text.length,0);
   const Label=passive?'span':'button';
   return <div key={group} className={'word-tag clue-slot'+(complete?' found':'')+(selected?' is-focus-target':'')+(golden?' golden':'')} style={{'--clue-chars':Math.max(length,first.label.length)} as CSSProperties} data-word-group={group} role="listitem" aria-label={complete?`${first.label} bulundu`:`${index+1}. hedef · ${length} harf`}>
    <Label {...(passive?{}:{type:"button" as const,disabled:unavailable||locked||complete,"aria-pressed":selected,onClick:()=>choose(group)})} aria-label={complete?`${first.label} bulundu`:`${index+1}. ${ordered?'adım':'bilmece'} · ${length} harf${golden?' · çift puan':''}`}>
     <span className="clue-word" data-word-label>{targetLetters(complete?first.label:'✱'.repeat(length))}</span>{golden&&<em>×2</em>}
    </Label>
   </div>;
  })}</div>
  <button type="button" className="active-clue" ref={opener} disabled={unavailable} aria-haspopup="dialog" aria-expanded={open} onTouchStart={event=>{swiped.current=false;swipeStart.current=event.touches[0]?.clientX??null;}} onTouchEnd={event=>{const x=event.changedTouches[0]?.clientX;if(unavailable||ordered||x===undefined||swipeStart.current===null)return;const delta=x-swipeStart.current;swipeStart.current=null;if(Math.abs(delta)<30)return;const available=groups.filter(g=>words.board.targets.some(t=>t.group===g&&!found.has(t.id)));if(available.length<2)return;swiped.current=true;choose(available[(available.indexOf(active!)+(delta<0?1:-1)+available.length)%available.length]!);}} onClick={()=>{if(swiped.current){swiped.current=false;return;}setOpen(true);}}>
   <strong aria-live="polite"><span className="clue-definition">{copy.text}</span><span className="sr-only"> · {target.text.length} harf</span></strong><ListChecks size={19} aria-hidden="true"/><span className="sr-only">{ordered?'Etkin ipucunu aç':'Tanımların tamamını aç'}</span>
  </button>
  {open&&!unavailable&&<Modal title={ordered?'Şimdiki ipucu':'Tanımlar'} onClose={close}><div className="board-words-sheet">{ordered?<p className="full-clue">{copy.text}</p>:<WordList {...words} focusedGroup={active} onFocusGroup={group=>{choose(group);close();}}/>}<button type="button" className="button primary full" onClick={close}>Tahtaya dön</button></div></Modal>}
 </div>;
}

/** Equal letter cells keep hidden and revealed labels in exactly the same footprint. */
function targetLetters(text:string,veil:WordVeil='open',stable=false,concealed=false){return <span className="target-letters">{[...veiledText(text,veil)].map((char,index)=><span data-target-letter key={index} style={stable?{width:targetAdvance([...text][index]??char,concealed&&index>0)+'em',padding:0}:undefined} className={char==='✱'?'masked-letter':/\s/.test(char)?'target-space':undefined}>{char==='✱'?<><span className="mask-text">✱</span><svg aria-hidden="true" viewBox="0 0 12 16"><path d="M6 2v12M1 5l10 6M1 11l10-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></>:char}</span>)}</span>;}

export function WordList({board,strokes,golden,clues,veils,focusedGroup,onFocusGroup,rack=false,authored=false,unavailable=false}:WordListData&{rack?:boolean;authored?:boolean;unavailable?:boolean}){
 const groups=[...new Set(board.targets.map(t=>t.group))],[seen,setSeen]=useState(()=>new Set(groups.filter(group=>board.targets.filter(t=>t.group===group).every(t=>strokes.some(s=>s.id===t.id)))));
 const rows=rack&&authored?rowsForTargets(board.targets,veils):[];
 const entries=groups.map(group=>{
  const parts=board.targets.filter(t=>t.group===group),target=parts[0]!,done=parts.every(t=>strokes.some(s=>s.id===t.id));
  const split=parts.length>1,clue=clues?.[target.text],copy=wordCardCopy(target,done,clues,veils?.[group]);
  return <div className={'word-tag'+(done?' found'+(!seen.has(group)?' word-confirmed':''):'')+(clue?' clue-tag':'')+(veils?.[group]&&veils[group]!=='open'?' veiled-target':'')+(parts.some(t=>t.id===golden)?' golden':'')+(onFocusGroup&&!done?' focusable-target':'')+(onFocusGroup&&!done&&focusedGroup===group?' is-focus-target':'')}
   key={group} data-word-group={group} onAnimationEnd={()=>{if(done&&!seen.has(group))setSeen(old=>new Set(old).add(group));}} role="listitem" aria-label={(copy.spoken??copy.text)+(copy.detail&&!copy.spoken?' · '+copy.detail:'')+(done?' bulundu':' aranıyor')}
   style={{'--word-chars':target.label.length,'--word-rows':target.label.length>12?2:1,...(done?{background:`color-mix(in srgb, ${strokeColor(target.id)} 35%, transparent)`}:{})} as CSSProperties}>
   <span className="word-state" aria-hidden="true">{done?<Check size={15}/>:<i/>}</span>
   <div className={clue?'clue-copy':undefined}>{clue?<>
    <span className="clue-face clue-question" style={{visibility:done?'hidden':'visible'}} aria-hidden={done}>
     {clue}<small>{target.text.length} harf</small>
    </span>
    <span data-word-label className="clue-face clue-answer" style={{visibility:done?'visible':'hidden'}} aria-hidden={!done}>{target.label}</span>
   </>:<><span data-word-label>{rack&&split?parts.map((part,i)=><span key={part.id}><span data-word-part={part.id} className={strokes.some(s=>s.id===part.id)?'part-found':''}>{targetLetters(part.text,strokes.some(s=>s.id===part.id)?'open':veils?.[group]==='initial'&&i>0?'hidden':veils?.[group],authored,!!veils?.[group]&&veils[group]!=='open')}</span>{i<parts.length-1?' ':''}</span>): targetLetters(target.label,done?'open':veils?.[group],authored,!!veils?.[group]&&veils[group]!=='open')}</span>{(copy.detail||veils?.[group]&&veils[group]!=='open')&&<small>{copy.detail??`${target.label.replace(/\s/g,'').length} harf`}</small>}{split&&!rack&&<small>{parts.map(t=><span data-word-part={t.id} className={strokes.some(s=>s.id===t.id)?'part-found':''} key={t.id}>{veiledText(t.text,strokes.some(s=>s.id===t.id)?'open':veils?.[group])}</span>)}</small>}</>}</div>
   {parts.some(t=>t.id===golden)&&<b>×2</b>}
   {onFocusGroup&&!done&&<button type="button" className="target-focus-button" disabled={unavailable} aria-pressed={focusedGroup===group} aria-label={`${copy.spoken??copy.text}${copy.detail&&!copy.spoken?' · '+copy.detail:''} · Hedef seç`} onClick={()=>onFocusGroup(group)}/>}
  </div>;
 });
 return <div className={'word-list'+(clues?' clue-list':'')+(rack?' target-rack':'')} data-authored-rack={rows.length?true:undefined} data-target-count={rack?groups.length:undefined} role="list" aria-label={clues?'Tanımlardan bulunacak kelimeler':'Bulunacak kelimeler'}>{rows.length?rows.map((row,i)=><div key={i} role="presentation" className="word-rack-row">{row.map(index=>entries[index])}</div>):entries}</div>;
}

export function PlayLayout({quietHeader=false,finishing=false,finishStars=0,worldStrip,worldPieces,boardNotice,headerAction,chapterNumber,starCount,earlyTargets,onResume,title,kicker,onBack,board,strokes,paused,readOnly=false,reviewStatus='Bölüm tamamlandı · Tahtayı inceleyebilirsin.',inputBlocked=false,inputStatus,busy=false,wordList,wordListKey,wordListUnavailable=false,feedbackPaused,localFeedback,inlineTargets=false,focused=false,celebrating=false,departing=false,scene,nextScene,sceneStage,turned=false,zoom,hint,hintEnd,demonstration,onCommit,onSelectStart,onSelectLetter,preview,onPreview,children,aside,footer,effect}:{quietHeader?:boolean;finishing?:boolean;finishStars?:number;worldStrip?:ReactNode;worldPieces?:readonly boolean[];boardNotice?:string;headerAction?:ReactNode;chapterNumber?:number;starCount?:number;earlyTargets?:Puzzle['targets'];title:string;kicker:string;onBack:()=>void;onResume?:()=>void;board:Pick<Puzzle,'size'|'grid'|'targets'|'authored'>;strokes:Stroke[];paused:boolean;readOnly?:boolean;reviewStatus?:string;inputBlocked?:boolean;inputStatus?:string;busy?:boolean;wordList?:WordListData;wordListKey?:string;wordListUnavailable?:boolean;feedbackPaused?:boolean;localFeedback?:Stroke|null;inlineTargets?:boolean;focused?:boolean;celebrating?:boolean;departing?:boolean;scene?:SceneKind;sceneStage?:number;nextScene?:SceneKind;turned?:boolean;zoom:boolean;hint?:Cell|null;hintEnd?:Cell|null;demonstration?:{a:Cell;b:Cell}|null;onCommit:(a:Cell,b:Cell)=>void;onSelectStart?:()=>void;onSelectLetter?:(depth:number)=>void;preview:string;onPreview:(s:string)=>void;children:ReactNode;aside:ReactNode;footer:ReactNode;effect?:ReactNode}){
 const journeyFrame=!!chapterNumber&&quietHeader&&!!wordList&&!zoom;
 const projection=useMemo(()=>projectBoard(board,journeyFrame),[board,journeyFrame]),surface=projection.board,shape=projection.shape;
 const projectedStrokes=useMemo(()=>projection.compacted?projectStrokes(strokes,projection.toView):strokes,[strokes,projection]);
 const feedbackStrokes=useMemo(()=>projection.compacted?projectStrokes(wordList?.strokes??strokes,projection.toView):wordList?.strokes??strokes,[wordList?.strokes,strokes,projection]);
 const projectedPreview=useMemo(()=>localFeedback?projectStrokes([localFeedback],projection.toView)[0]:undefined,[localFeedback,projection]);
 const visibleBoard=useMemo(()=>boardView(surface,turned),[surface,turned]),visibleStrokes=viewStrokes(projectedStrokes,shape,turned);
 const visibleCell=(p:Cell)=>viewCell(projection.toView(p),shape,turned);
 const praise=usePlayPraise({scope:wordListKey??board.grid.map(row=>row.join('')).join('|'),board,confirmed:wordList?.strokes??strokes,unavailable:paused||celebrating||departing||!!(feedbackPaused??wordListUnavailable),terminal:readOnly,hint,demonstration});
 const commitView=(a:Cell,b:Cell)=>{const start=projection.fromView(viewCell(a,shape,turned)),end=projection.fromView(viewCell(b,shape,turned));praise.attempt(start,end);onCommit(start,end);};
 const screenRef=useRef<HTMLElement>(null),stageRef=useRef<HTMLDivElement>(null),selectionRef=useRef<HTMLDivElement>(null);
 // Mark the final word once. Letter effects never move the hit grid.
 const lastStroke=finishing?visibleStrokes.at(-1):undefined;
 const endPath=lastStroke?[...lastStroke.a,...lastStroke.b].join(','):'';
 useLayoutEffect(()=>{
  const root=stageRef.current;
  if(!root||!endPath)return;
  const [a=0,b=0,y=0,x=0]=endPath.split(',').map(Number);
  const length=Math.max(Math.abs(y-a),Math.abs(x-b))+1;
  const letters:HTMLElement[]=[];
  for(let i=0;i<length;i++){
   const cell=root.querySelector<HTMLElement>(`[data-cell="${a+i*Math.sign(y-a)},${b+i*Math.sign(x-b)}"]`);
   if(cell){cell.style.setProperty('--wave-delay',i*18+'ms');cell.classList.add('finish-letter');letters.push(cell);}
  }
  return ()=>{for(const cell of letters){cell.style.removeProperty('--wave-delay');cell.classList.remove('finish-letter');}};
 },[endPath]);
 const previousTurn=useRef(turned);
 useLayoutEffect(()=>{
  const changed=previousTurn.current!==turned;previousTurn.current=turned;
  const root=stageRef.current?.querySelector<HTMLElement>('.letter-board');if(!changed||!root)return;
  root.classList.remove('board-entering');root.classList.add('board-turning');
  const stop=()=>root.classList.remove('board-turning');
  root.addEventListener('pointerdown',stop,{capture:true,once:true});root.addEventListener('touchstart',stop,{capture:true,once:true,passive:true});
  const timer=setTimeout(stop,280);return()=>{clearTimeout(timer);stop();root.removeEventListener('pointerdown',stop,true);root.removeEventListener('touchstart',stop,true);};
 },[turned]);
 const [pan,setPan]=useState(false),boardIdentity=board.grid.map(row=>row.join('')).join('|');
 useEffect(()=>setPan(false),[zoom,wordListKey,boardIdentity,turned]);
 useEffect(()=>{
  const screen=screenRef.current,stage=stageRef.current;if(!screen||!stage)return;
  return attachPlayFit(screen,stage,shape,zoom,window);
 },[zoom,shape]);
 const showWorldStrip=!!worldStrip;
 useLayoutEffect(()=>{
  const screen=screenRef.current,strip=screen?.querySelector<HTMLElement>('.kt-world-progress');
  const grid=screen?.querySelector<HTMLElement>('.letter-board'),tools=screen?.querySelector<HTMLElement>('.play-controls');
  if(!screen||!strip||!grid||!tools)return;
  const place=()=>{
   const frame=screen.getBoundingClientRect(),boardBox=grid.getBoundingClientRect(),controls=tools.getBoundingClientRect();
   const buttons=[...tools.querySelectorAll('button')].map(button=>button.getBoundingClientRect()).filter(box=>box.width>0);
   const first=buttons.sort((a,b)=>a.left-b.left)[0];
   const space=controls.top-boardBox.bottom;
   const side=space<30&&!!first;
   strip.dataset['placed']=side?'side':'center';
   strip.style.setProperty('--world-strip-y',(side?controls.top+(controls.height-36)/2:(controls.top+boardBox.bottom-26)/2)-frame.top+'px');
   strip.style.setProperty('--world-side-width',Math.max(0,(first?.left??controls.left)-frame.left-10)+'px');
  };
  place();
  const watcher=typeof ResizeObserver!=='undefined'?new ResizeObserver(place):null;
  for(const el of [screen,grid,tools])watcher?.observe(el);
  window.addEventListener('resize',place);return()=>{watcher?.disconnect();window.removeEventListener('resize',place);};
 },[showWorldStrip,boardIdentity,readOnly,turned]);
 const rack=wordList&&compactWordRack(wordList.board,wordList.clues);
 const longRack=!!wordList&&wordList.board.targets.some(t=>t.label.length>12);
 const targetsUnavailable=celebrating||departing||paused||inputBlocked||(!readOnly&&wordListUnavailable);
 const instruction=readOnly?reviewStatus:inputBlocked?(inputStatus??'Sunucu onayı bekleniyor.'):paused?'Oyun duraklatıldı.':zoom&&pan?'Tahtayı kaydır. Kelime çizmek için Kelime seç’e geç.':'Kaydır veya ilk ve son harfe dokun.';
 const paintPreview=(text:string)=>{
  const locked=readOnly||inputBlocked||paused,root=selectionRef.current;if(!root){if(!locked)onPreview(text);return;}if(locked)text='';
  const valid=/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(text),characters=[...text];
  const update=(selector:string,value:string,shown:boolean)=>{const nodes=screenRef.current?Array.from(screenRef.current.querySelectorAll<HTMLElement>(selector)):[root.querySelector<HTMLElement>(selector)];for(const node of nodes)if(node){if(node.textContent!==value)node.textContent=value;if(node.hidden===shown)node.hidden=!shown;}};
  screenRef.current?.classList.toggle('has-selection',!!text);
  root.classList.toggle('selecting',!!text);
  update('[data-selection-message]',instruction,!text);update('[data-selection-word]',text,!!text);
  update('[data-selection-count]',characters.length+' harf',valid);
  update('[data-selection-loupe]',characters.at(-1)??'',valid&&board.size>=10&&!zoom);
 };
 useEffect(()=>{paintPreview(preview);},[preview,readOnly,inputBlocked,inputStatus,reviewStatus,paused,boardIdentity,zoom,pan,turned]);
 const usesTopicFeedback=journeyFrame||(!!chapterNumber&&quietHeader&&!!wordList&&!zoom&&shape.rows>shape.columns);
 const feedbackRail=<div className="play-feedback-rail">
  {!finishing&&boardNotice&&<span className="board-action-notice" aria-hidden="true">{boardNotice}</span>}
  {praise.element}
  <div className="selection-bubble" aria-hidden="true"><b data-selection-word hidden={!preview}>{preview}</b></div>
 </div>;
 return <><GameScene scene={scene??'courtyard'} stage={sceneStage} nextScene={nextScene}/><section ref={screenRef} onClickCapture={event=>{if((event.target as Element).closest('.game-settings-trigger,.hint-button'))praise.interrupt();}} data-design-layout={journeyFrame?'journey':undefined} data-authored-board={board.authored} data-finishing={finishing||undefined} data-journey-frame={journeyFrame||undefined} data-tall-targets={usesTopicFeedback&&shape.rows>shape.columns||undefined} data-result-phase={departing?'exit':undefined} style={{'--result-exit-ms':`${RESULT_EXIT_MS}ms`} as CSSProperties} data-dense-board={board.size>=10||undefined} data-scene={scene??'courtyard'} aria-hidden={celebrating||undefined} className={'play-screen viewport-play scenic-play'+(celebrating?' is-celebrating':'')+(zoom?' is-zoomed':'')+(chapterNumber?' chapter-play':'')+(focused?' focused-play':'')+(inlineTargets?' inline-target-play':'')+(quietHeader?' quiet-play':'')}><header className="play-heading">{quietHeader&&starCount!==undefined&&<span className="board-stars" data-star-total={starCount} aria-label={`${starCount} yıldız`}><Star aria-hidden="true"/>{starCount}</span>}{!quietHeader&&<button className="icon-button" onClick={onBack} aria-label="Geri"><ArrowLeft/></button>}<div className="play-title">{quietHeader?<span className="play-chapter-number">{chapterNumber?<><small>Bölüm</small>{' '}{chapterNumber}</>:kicker}</span>:<><h1>{title}</h1><span className="play-context">{kicker}</span></>}{worldPieces&&<span className="kt-header-progress" role="img" aria-label={worldPieces.filter(Boolean).length+" / "+worldPieces.length+" bölüm tamamlandı"}>{worldPieces.map((earned,i)=><i key={i} data-earned={earned}/>)}</span>}</div>{headerAction??<span className="mini-mark">Kt.</span>}</header><div className="play-hud">{children}</div><WordFeedback key={"feedback:"+(wordListKey??boardIdentity)} root={screenRef} scope={wordListKey??boardIdentity} board={surface} confirmed={feedbackStrokes} preview={projectedPreview} turned={turned} paused={paused||celebrating||!!(feedbackPaused??wordListUnavailable)}/><div className="play-columns"><aside className="targets-panel">{wordList&&<div className={'viewport-targets'+(rack?' has-word-rack':wordList.definition?' has-definition-rack':' has-clue-rack')+(longRack?' long-word-rack':'')} data-many={new Set(wordList.board.targets.map(t=>t.group)).size>9||undefined}>{quietHeader&&<div className="target-topic"><h1>{wordList.definition&&<span className="definition-band-tag">BİLMECE</span>}{title}</h1>{usesTopicFeedback&&feedbackRail}</div>}{rack?<WordList key={"words:"+(wordListKey??boardIdentity)} {...wordList} onFocusGroup={chapterNumber?undefined:wordList.onFocusGroup} rack authored={board.authored} unavailable={targetsUnavailable}/>:wordList.definition?<DefinitionStrip words={wordList} state={wordList.definition} unavailable={targetsUnavailable}/>:<MobileTargets key={"clues:"+(wordListKey??boardIdentity)} words={wordList} unavailable={targetsUnavailable} passive={!!chapterNumber&&!zoom}/>}</div>}{aside}</aside><div className="board-panel"><div ref={selectionRef} className={'selection-preview'+(board.size>=10&&!zoom?' loupe-available':'')+(readOnly?' is-review':inputBlocked?' is-blocked':preview?' selecting':'')} aria-live="off"><span data-selection-message hidden={!readOnly&&!inputBlocked&&!!preview}>{!readOnly&&!inputBlocked&&preview?'':instruction}</span><b data-selection-word hidden={readOnly||inputBlocked||!preview}>{readOnly||inputBlocked?'':preview}</b><span data-selection-count hidden={readOnly||inputBlocked||!/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(preview)}>{!readOnly&&!inputBlocked&&/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(preview)?[...preview].length+' harf':''}</span><span data-selection-loupe className="selection-loupe" aria-hidden="true" hidden={readOnly||inputBlocked||board.size<10||zoom||!preview}>{!readOnly&&!inputBlocked&&board.size>=10&&!zoom?[...preview].at(-1):''}</span></div>{zoom&&!paused&&!readOnly&&!inputBlocked&&!wordListUnavailable&&<div className="board-input-tools">{wordList&&<BoardWords key={wordListKey??JSON.stringify([board.size,board.grid,wordList.board.targets])} words={wordList}/>}<div className="board-input-mode" role="group" aria-label="Büyük tahta kontrolü"><button type="button" aria-pressed={!pan} onClick={()=>setPan(false)}>Kelime seç</button><button type="button" aria-pressed={pan} onClick={()=>setPan(true)}>Tahtayı kaydır</button></div></div>}{!usesTopicFeedback&&feedbackRail}<div className="board-stage" ref={stageRef}><Board overlay={finishing&&<div className="kt-board-finish" aria-label={'Harika! '+finishStars+' yıldız'} role="status"><div className="kt-finish-medals" aria-hidden="true"><b>HARİKA!</b><span>{[1,2,3].map(n=><i key={n} data-earned={n<=finishStars}><Star/></i>)}</span></div></div>} key={boardIdentity+":"+turned} board={visibleBoard} earlyTargets={earlyTargets??wordList?.board.targets??board.targets} strokes={visibleStrokes} onResume={onResume} paused={paused} readOnly={readOnly} blocked={inputBlocked} busy={busy} statusText={inputStatus} zoom={zoom} pan={pan} hint={hint?visibleCell(hint):hint} hintEnd={hintEnd?visibleCell(hintEnd):hintEnd} demonstration={demonstration&&!targetsUnavailable?{a:visibleCell(demonstration.a),b:visibleCell(demonstration.b)}:null} onCommit={commitView} onSelectStart={()=>{praise.beginSelection();onSelectStart?.();}} onSelectLetter={onSelectLetter} onSelectEnd={stopHapticSelection} onPreview={paintPreview}/>{effect}</div>{footer}<small className="board-access-note">Yatay · Dikey · Çapraz · Tersten</small></div></div>{worldStrip}</section></>;
}
/** Same contextual controls; solo owns pause, competitions keep their server clock. */
export function GameToolsSheet({onHome,onClose,onHelp,finished=false,timed=false}:{onHome?:()=>void;onClose:(resume?:boolean)=>void;sound:boolean;onSound:()=>void;zoom?:boolean;onZoom?:()=>void;onHelp?:()=>void;finished?:boolean;timed?:boolean}){
 const preferences=usePlaySettings();
 if(!preferences)return null;
 return <SettingsWindow {...preferences.settings} mode={finished?'finished':timed?'race':'solo'}
  onClose={onClose} onHome={onHome??preferences.onHome} onHelp={onHelp}/>;

}
/** Timed modes keep their clock running while these presentation controls are open. */
export function MatchTools({sound,onSound,zoom,onZoom,onHome,onHelp,finished=false,review=false}:{onHome?:()=>void;sound:boolean;onSound:()=>void;zoom?:boolean;onZoom?:()=>void;onHelp?:()=>void;finished?:boolean;review?:boolean}){
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(finished)setOpen(false);},[finished]);
 return <><button className="icon-button game-settings-trigger" disabled={finished&&!review} aria-label="Ayarlar" aria-haspopup="dialog" onClick={()=>setOpen(true)}><Settings aria-hidden="true"/></button>
 {open&&(!finished||review)&&<GameToolsSheet onHome={onHome} onClose={()=>setOpen(false)} sound={sound} onSound={onSound} zoom={zoom} onZoom={onZoom} onHelp={onHelp} finished={finished} timed/>}</>;
}
export function PlayControls({settingsOnly=false,hideSettings=false,onHome,paused,onPause,zoom,onZoom,sound,onSound,hints,onHint,onHelp,canPause=true,completed=false,blocked=false,busy=false,onTurn,turned=false,onSkipResult}:{settingsOnly?:boolean;hideSettings?:boolean;onHome?:()=>void;onTurn?:()=>void;turned?:boolean;paused:boolean;onPause:()=>void;zoom:boolean;onZoom:()=>void;sound:boolean;onSound:()=>void;hints:number;onHint:()=>void;onHelp:()=>void;canPause?:boolean;completed?:boolean;blocked?:boolean;busy?:boolean;onSkipResult?:()=>void}){
 const [menu,setMenu]=useState(false),resume=useRef(false);
 const open=()=>{resume.current=canPause&&!paused&&!completed;if(resume.current)onPause();setMenu(true);};
 const close=(shouldResume=true)=>{setMenu(false);const owned=resume.current;resume.current=false;if(owned&&shouldResume)onPause();};
 return <>{!settingsOnly&&<div className={'play-controls'+(completed?' is-review':'')}>
 {!completed&&<button className="button primary hint-button" aria-label={`İpucu · ${hints} kaldı`} disabled={paused||blocked||hints===0} aria-busy={busy||undefined} onClick={onHint}>{busy?<LoaderCircle size={19} className="spin"/>:<Lightbulb aria-hidden="true"/>}<span aria-hidden="true">{hints}</span></button>}
 {completed&&(onSkipResult
  ? <button type="button" className="button journey-skip-reward" onClick={onSkipResult}>Sonuca geç<ArrowRight size={16} aria-hidden="true"/></button>
  : <span className="review-controls-label"><Check size={17}/>İnceleme</span>)}
 {onTurn&&<button className="turn-board" onClick={event=>{onTurn();event.currentTarget.closest('.viewport-play')?.querySelector<HTMLElement>('.letter-board')?.focus({preventScroll:true});}} disabled={paused||blocked} aria-label="Tahtayı döndür" aria-pressed={turned}><svg className="turn-board-icon" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M12 8v12M16 8v12M8 12h12M8 16h12M4 12a10 10 0 0 1 17-5M21 3v4h-4M24 16a10 10 0 0 1-17 5M7 25v-4h4"/></svg></button>}
 {!hideSettings&&<button className="icon-button game-settings-trigger" onClick={open} aria-label="Ayarlar" aria-haspopup="dialog"><Settings aria-hidden="true"/></button>}</div>}{settingsOnly&&<button className="icon-button game-settings-trigger" onClick={open} aria-label="Ayarlar" aria-haspopup="dialog"><Settings aria-hidden="true"/></button>}
 {menu&&<GameToolsSheet onHome={onHome} onClose={close} sound={sound} onSound={onSound} zoom={zoom} onZoom={onZoom} onHelp={onHelp} finished={completed} timed={!canPause}/>}
 </>;
}
export {GuideBook as Help} from './GuideBook';
export {shareLink} from '@/lib/platform/sharing';
