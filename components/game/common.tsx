'use client';
import {PlayComfortSettings} from './PlayPreferences';
import {publicGameOrigin} from '@/lib/platform/runtime';
import '@/lib/game/browser-compat';
import {wordCardCopy,wordListProgress,focusedWordGroup,compactWordRack,veiledText,type WordVeil} from '@/lib/game/word-card';
import {useEffect,useRef,useId,useState,type ReactNode,type CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,Check,HelpCircle,Lightbulb,ListChecks,LoaderCircle,Pause,Play,Volume2,VolumeX,X,ZoomIn,RotateCw,Settings2} from 'lucide-react';
import {Board,strokeColor} from './Board';
import {stopHapticSelection} from '@/lib/game/haptics';
import {WordFeedback} from './WordFeedback';
import {Celebration} from './Celebration';
import {GameScene} from './SceneArt';
import {sceneImage} from '@/lib/game/scene';
import type {SceneKind} from '@/lib/game/scene';
import {boardView,viewCell,viewStrokes} from '@/lib/game/board-view';
import {openGameDialog} from '@/lib/game/legacy-ui';
import {attachPlayFit} from '@/lib/game/viewport';
import {memberFetch} from '@/lib/auth/firebase-client';
import type {Cell,Puzzle,Stroke} from '@/lib/game/engine';
const errorText=(v:unknown)=>v&&typeof v==='object'&&'error' in v&&typeof v.error==='string'?v.error:'Bağlantı kurulamadı.';
export async function api<T>(action:string,data:Record<string,unknown>={},signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data}),signal});const value=await res.json();if(!res.ok)throw new Error(errorText(value));return value as T;}
export async function getApi<T>(query='',signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/game'+query,{cache:'no-store',signal});const data=await res.json();if(!res.ok)throw new Error(errorText(data));return data as T;}
export async function socialApi<T>(action:string,data:Record<string,unknown>={},signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/social',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data}),signal});const value=await res.json();if(!res.ok)throw new Error(errorText(value));return value as T;}
export async function getSocial<T>(query='',signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/social'+query,{signal});const data=await res.json();if(!res.ok)throw new Error(errorText(data));return data as T;}
export {useChime} from './useGameSound';
export function Modal({title,onClose,children,className='',footer,scene}:{scene?:SceneKind;title:string;onClose:()=>void;children:ReactNode;className?:string;footer?:ReactNode}){const ref=useRef<HTMLDialogElement>(null),id=useId();useEffect(()=>{const d=ref.current;if(d)return openGameDialog(d,onClose,window);},[]);return <dialog className={'modal game-dialog'+(!footer?' dialog-scrolls':'')+(className?' '+className:'')+(scene?' scenic-outcome':'')} style={scene?{'--outcome-scene':`url("${sceneImage(scene)}")`} as CSSProperties:undefined} ref={ref} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current){const bounds=e.currentTarget.getBoundingClientRect();if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)onClose();}}} role="dialog" aria-modal="true" aria-labelledby={id}>{className.includes('celebration-outcome')&&<Celebration/>}<div className="modal-head"><h2 id={id}>{title}</h2><button className="icon-button" aria-label="Kapat" onClick={onClose}><X/></button></div>{footer?<><div className="modal-content">{children}</div><footer className="modal-actions" aria-label="Sonuç eylemleri">{footer}</footer></>:children}</dialog>;}
export interface WordListData {veils?:Record<number,WordVeil>;board:Pick<Puzzle,'targets'>;strokes:Stroke[];golden?:string|null;clues?:Record<string,string>;focusedGroup?:number|null;onFocusGroup?:(group:number)=>void;activeOnly?:number|null}
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
export function MobileTargets({words,unavailable=false}:{words:WordListData;unavailable?:boolean}){
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
 const choose=(group:number)=>{setPreferred(group);words.onFocusGroup?.(group);};
 if(!target||!copy)return null;
 return <div className="mobile-targets clue-targets" aria-label={ordered?'Hikâye adımları':'Bilmece hedefleri'}>
  <div className="clue-slots" role="list" style={{'--clue-count':Math.min(groups.length,9)} as CSSProperties}>{groups.map((group,index)=>{
   const entries=words.board.targets.filter(t=>t.group===group),first=entries[0]!,complete=entries.every(t=>found.has(t.id)),golden=entries.some(t=>t.id===words.golden);
   const locked=ordered&&group!==words.activeOnly,selected=group===active,length=first.label.replace(/\s/g,'').length;
   return <div key={group} className={'word-tag clue-slot'+(complete?' found':'')+(selected?' is-focus-target':'')+(golden?' golden':'')} data-word-group={group} role="listitem" aria-label={complete?`${first.label} bulundu`:`${index+1}. hedef · ${length} harf`}>
    <button type="button" disabled={unavailable||locked||complete} aria-pressed={selected} aria-label={complete?`${first.label} bulundu`:`${index+1}. ${ordered?'adım':'bilmece'} · ${length} harf${golden?' · çift puan':''}`} onClick={()=>choose(group)}>
     <b>{index+1}</b><span>{complete?<Check size={14}/>:<>{length}<small>harf</small></>}</span>{golden&&<em>×2</em>}
    </button>
   </div>;
  })}</div>
  <button type="button" className="active-clue" ref={opener} disabled={unavailable} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}>
   <strong>{copy.text}</strong><ListChecks size={19} aria-hidden="true"/><span className="sr-only">{ordered?'Etkin ipucunu aç':'Tanımların tamamını aç'}</span>
  </button>
  {open&&!unavailable&&<Modal title={ordered?'Şimdiki ipucu':'Tanımlar'} onClose={close}><div className="board-words-sheet">{ordered?<p className="full-clue">{copy.text}</p>:<WordList {...words} focusedGroup={active} onFocusGroup={group=>{choose(group);close();}}/>}<button type="button" className="button primary full" onClick={close}>Tahtaya dön</button></div></Modal>}
 </div>;
}

export function WordList({board,strokes,golden,clues,veils,focusedGroup,onFocusGroup,rack=false,unavailable=false}:WordListData&{rack?:boolean;unavailable?:boolean}){
 const groups=[...new Set(board.targets.map(t=>t.group))],seen=useRef(new Set(groups.filter(group=>board.targets.filter(t=>t.group===group).every(t=>strokes.some(s=>s.id===t.id)))));
 return <div className={'word-list'+(clues?' clue-list':'')+(rack?' target-rack':'')} role="list" aria-label={clues?'Tanımlardan bulunacak kelimeler':'Bulunacak kelimeler'}>{groups.map(group=>{
  const parts=board.targets.filter(t=>t.group===group),target=parts[0]!,done=parts.every(t=>strokes.some(s=>s.id===t.id));
  const split=parts.length>1,clue=clues?.[target.text],copy=wordCardCopy(target,done,clues,veils?.[group]);
  return <div className={'word-tag'+(done?' found'+(!seen.current.has(group)?' word-confirmed':''):'')+(clue?' clue-tag':'')+(veils?.[group]&&veils[group]!=='open'?' veiled-target':'')+(parts.some(t=>t.id===golden)?' golden':'')+(onFocusGroup&&!done?' focusable-target':'')+(onFocusGroup&&!done&&focusedGroup===group?' is-focus-target':'')}
   key={group} data-word-group={group} onAnimationEnd={()=>seen.current.add(group)} role="listitem" aria-label={(copy.spoken??copy.text)+(copy.detail&&!copy.spoken?' · '+copy.detail:'')+(done?' bulundu':' aranıyor')}
   style={{'--word-chars':target.label.length,'--word-rows':target.label.length>12?2:1,...(done?{background:`color-mix(in srgb, ${strokeColor(target.id)} 35%, transparent)`}:{})} as CSSProperties}>
   <span className="word-state" aria-hidden="true">{done?<Check size={15}/>:<i/>}</span>
   <div className={clue?'clue-copy':undefined}>{clue?<>
    <span className="clue-face clue-question" style={{visibility:done?'hidden':'visible'}} aria-hidden={done}>
     {clue}<small>{target.text.length} harf</small>
    </span>
    <span data-word-label className="clue-face clue-answer" style={{visibility:done?'visible':'hidden'}} aria-hidden={!done}>{target.label}</span>
   </>:<><span data-word-label>{rack&&split?parts.map((part,i)=><span key={part.id}><span data-word-part={part.id} className={strokes.some(s=>s.id===part.id)?'part-found':''}>{veiledText(part.text,strokes.some(s=>s.id===part.id)?'open':veils?.[group]==='initial'&&i>0?'hidden':veils?.[group])}</span>{i<parts.length-1?' ':''}</span>):copy.text}</span>{(copy.detail||veils?.[group]&&veils[group]!=='open')&&<small>{copy.detail??`${target.label.replace(/\s/g,'').length} harf`}</small>}{split&&!rack&&<small>{parts.map(t=><span data-word-part={t.id} className={strokes.some(s=>s.id===t.id)?'part-found':''} key={t.id}>{veiledText(t.text,strokes.some(s=>s.id===t.id)?'open':veils?.[group])}</span>)}</small>}</>}</div>
   {parts.some(t=>t.id===golden)&&<b>×2</b>}
   {onFocusGroup&&!done&&<button type="button" className="target-focus-button" disabled={unavailable} aria-pressed={focusedGroup===group} aria-label={`${copy.spoken??copy.text}${copy.detail&&!copy.spoken?' · '+copy.detail:''} · Hedef seç`} onClick={()=>onFocusGroup(group)}/>}
  </div>;
 })}</div>;
}

export function PlayLayout({earlyTargets,onResume,title,kicker,onBack,board,strokes,paused,readOnly=false,reviewStatus='Bölüm tamamlandı · Tahtayı inceleyebilirsin.',inputBlocked=false,inputStatus,busy=false,wordList,wordListKey,wordListUnavailable=false,feedbackPaused,inlineTargets=false,focused=false,celebrating=false,scene,nextScene,sceneStage,turned=false,zoom,hint,hintEnd,onCommit,onSelectStart,onSelectLetter,preview,onPreview,children,aside,footer,effect}:{earlyTargets?:Puzzle['targets'];title:string;kicker:string;onBack:()=>void;onResume?:()=>void;board:Pick<Puzzle,'size'|'grid'|'targets'>;strokes:Stroke[];paused:boolean;readOnly?:boolean;reviewStatus?:string;inputBlocked?:boolean;inputStatus?:string;busy?:boolean;wordList?:WordListData;wordListKey?:string;wordListUnavailable?:boolean;feedbackPaused?:boolean;inlineTargets?:boolean;focused?:boolean;celebrating?:boolean;scene?:SceneKind;sceneStage?:number;nextScene?:SceneKind;turned?:boolean;zoom:boolean;hint?:Cell|null;hintEnd?:Cell|null;onCommit:(a:Cell,b:Cell)=>void;onSelectStart?:()=>void;onSelectLetter?:(depth:number)=>void;preview:string;onPreview:(s:string)=>void;children:ReactNode;aside:ReactNode;footer:ReactNode;effect?:ReactNode}){
 const visibleBoard=boardView(board,turned),visibleStrokes=viewStrokes(strokes,board.size,turned);
 const screenRef=useRef<HTMLElement>(null),stageRef=useRef<HTMLDivElement>(null),selectionRef=useRef<HTMLDivElement>(null);
 const [pan,setPan]=useState(false),boardIdentity=board.grid.map(row=>row.join('')).join('|');
 useEffect(()=>setPan(false),[zoom,wordListKey,boardIdentity,turned]);
 useEffect(()=>{
  const screen=screenRef.current,stage=stageRef.current;if(!screen||!stage)return;
  return attachPlayFit(screen,stage,board.size,zoom,window);
 },[zoom,board.size]);
 const rack=wordList&&compactWordRack(wordList.board,wordList.clues);
 const longRack=!!wordList&&wordList.board.targets.some(t=>t.label.length>12);
 const targetsUnavailable=celebrating||paused||inputBlocked||(!readOnly&&wordListUnavailable);
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
 return <><GameScene scene={scene??'courtyard'} stage={sceneStage} nextScene={nextScene}/><section ref={screenRef} data-dense-board={board.size>=10||undefined} data-scene={scene??'courtyard'} aria-hidden={celebrating||undefined} className={'play-screen viewport-play scenic-play'+(celebrating?' is-celebrating':'')+(zoom?' is-zoomed':'')+(focused?' focused-play':'')+(inlineTargets?' inline-target-play':'')}><header className="play-heading"><button className="icon-button" onClick={onBack} aria-label="Geri"><ArrowLeft/></button><div className="play-title"><h1>{title}</h1><span className="play-context">{kicker}</span><div className="mobile-selection" aria-hidden="true"><b data-selection-word hidden={!preview}>{preview}</b><small data-selection-count hidden={!preview}>{[...preview].length} harf</small></div></div><span className="mini-mark">Kt.</span></header><div className="play-hud">{children}</div><WordFeedback key={"feedback:"+(wordListKey??boardIdentity)} root={screenRef} scope={wordListKey??boardIdentity} board={board} confirmed={wordList?.strokes??strokes} turned={turned} paused={paused||celebrating||!!(feedbackPaused??wordListUnavailable)}/><div className="play-columns"><aside className="targets-panel">{wordList&&<div className={'viewport-targets'+(rack?' has-word-rack':' has-clue-rack')+(longRack?' long-word-rack':'')} data-many={new Set(wordList.board.targets.map(t=>t.group)).size>9||undefined}>{rack?<WordList key={"words:"+(wordListKey??boardIdentity)} {...wordList} rack unavailable={targetsUnavailable}/>:<MobileTargets key={"clues:"+(wordListKey??boardIdentity)} words={wordList} unavailable={targetsUnavailable}/>}</div>}{aside}</aside><div className="board-panel"><div ref={selectionRef} className={'selection-preview'+(board.size>=10&&!zoom?' loupe-available':'')+(readOnly?' is-review':inputBlocked?' is-blocked':preview?' selecting':'')} aria-live="off"><span data-selection-message hidden={!readOnly&&!inputBlocked&&!!preview}>{!readOnly&&!inputBlocked&&preview?'':instruction}</span><b data-selection-word hidden={readOnly||inputBlocked||!preview}>{readOnly||inputBlocked?'':preview}</b><span data-selection-count hidden={readOnly||inputBlocked||!/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(preview)}>{!readOnly&&!inputBlocked&&/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(preview)?[...preview].length+' harf':''}</span><span data-selection-loupe className="selection-loupe" aria-hidden="true" hidden={readOnly||inputBlocked||board.size<10||zoom||!preview}>{!readOnly&&!inputBlocked&&board.size>=10&&!zoom?[...preview].at(-1):''}</span></div>{zoom&&!paused&&!readOnly&&!inputBlocked&&!wordListUnavailable&&<div className="board-input-tools">{wordList&&<BoardWords key={wordListKey??JSON.stringify([board.size,board.grid,wordList.board.targets])} words={wordList}/>}<div className="board-input-mode" role="group" aria-label="Büyük tahta kontrolü"><button type="button" aria-pressed={!pan} onClick={()=>setPan(false)}>Kelime seç</button><button type="button" aria-pressed={pan} onClick={()=>setPan(true)}>Tahtayı kaydır</button></div></div>}<div className="board-stage" ref={stageRef}><Board key={boardIdentity+":"+turned} board={visibleBoard} earlyTargets={earlyTargets??wordList?.board.targets??board.targets} strokes={visibleStrokes} onResume={onResume} paused={paused} readOnly={readOnly} blocked={inputBlocked} busy={busy} statusText={inputStatus} zoom={zoom} pan={pan} hint={hint?viewCell(hint,board.size,turned):hint} hintEnd={hintEnd?viewCell(hintEnd,board.size,turned):hintEnd} onCommit={turned?(a,b)=>onCommit(viewCell(a,board.size,true),viewCell(b,board.size,true)):onCommit} onSelectStart={onSelectStart} onSelectLetter={onSelectLetter} onSelectEnd={stopHapticSelection} onPreview={paintPreview}/>{effect}</div>{footer}<small className="board-access-note">Yatay · Dikey · Çapraz · Tersten</small></div></div></section></>;
}
/** Timed modes keep their clock running while these presentation controls are open. */
export function MatchTools({sound,onSound,zoom,onZoom,onHelp,finished=false,review=false}:{sound:boolean;onSound:()=>void;zoom?:boolean;onZoom?:()=>void;onHelp?:()=>void;finished?:boolean;review?:boolean}){
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(finished)setOpen(false);},[finished]);
 return <><button className="icon-button" disabled={finished&&!review} aria-label="Oyun araçları" aria-haspopup="dialog" onClick={()=>setOpen(true)}><Settings2/></button>
 {open&&(!finished||review)&&<Modal title="Oyun ayarları" onClose={()=>setOpen(false)}><div className="play-tools-sheet">
 {onZoom&&<button aria-pressed={zoom} onClick={()=>{onZoom();setOpen(false);}}><ZoomIn/>{zoom?'Normal tahta':'Büyük harf modu'}</button>}
 <button aria-pressed={sound} onClick={onSound}>{sound?<Volume2/>:<VolumeX/>}{sound?'Ses açık':'Ses kapalı'}</button>
 {onHelp&&<button onClick={()=>{setOpen(false);onHelp();}}><HelpCircle/>Kurallar</button>}
 <button onClick={()=>setOpen(false)}><Play/>Oyuna dön</button></div><PlayComfortSettings/><p>{finished?'Tamamladığın tahtayı inceleyebilirsin.':'Yarış süresi devam ediyor.'}</p></Modal>}</>;
}
export function PlayControls({paused,onPause,zoom,onZoom,sound,onSound,hints,onHint,onHelp,canPause=true,completed=false,blocked=false,busy=false,onTurn,turned=false,onSkipResult}:{onTurn?:()=>void;turned?:boolean;paused:boolean;onPause:()=>void;zoom:boolean;onZoom:()=>void;sound:boolean;onSound:()=>void;hints:number;onHint:()=>void;onHelp:()=>void;canPause?:boolean;completed?:boolean;blocked?:boolean;busy?:boolean;onSkipResult?:()=>void}){
 const [menu,setMenu]=useState(false),resume=useRef(false);
 const open=()=>{resume.current=canPause&&!paused&&!completed;if(resume.current)onPause();setMenu(true);};
 const close=()=>{setMenu(false);if(resume.current){resume.current=false;onPause();}};
 return <><div className={'play-controls'+(completed?' is-review':'')}>
 {!completed&&<button className="button primary hint-button" disabled={paused||blocked||hints===0} aria-busy={busy||undefined} onClick={onHint}>{busy?<LoaderCircle size={19} className="spin"/>:<Lightbulb size={19}/>}İpucu <span>{hints}</span></button>}
 {completed&&(onSkipResult
  ? <button type="button" className="button journey-skip-reward" onClick={onSkipResult}>Sonuca geç<ArrowRight size={16} aria-hidden="true"/></button>
  : <span className="review-controls-label"><Check size={17}/>İnceleme</span>)}
 {onTurn&&<button className="icon-button turn-board" onClick={onTurn} disabled={paused||blocked} aria-label="Tahtayı döndür" aria-pressed={turned}><RotateCw/></button>}
 {canPause&&!completed&&<button className="icon-button" onClick={onPause} aria-label={paused?'Devam et':'Duraklat'}>{paused?<Play/>:<Pause/>}</button>}
 <button className="icon-button" onClick={open} aria-label="Oyun araçları" aria-haspopup="dialog"><Settings2/></button></div>
 {menu&&<Modal title="Oyun ayarları" onClose={close}><div className="play-tools-sheet"><button onClick={()=>{onZoom();close();}} aria-pressed={zoom}><ZoomIn/>{zoom?'Normal tahta':'Büyük harf modu'}</button><button onClick={onSound} aria-pressed={sound}>{sound?<Volume2/>:<VolumeX/>}{sound?'Ses açık':'Ses kapalı'}</button><button onClick={()=>{close();onHelp();}}><HelpCircle/>Nasıl oynanır</button><button onClick={close}><Play/>Oyuna dön</button></div><PlayComfortSettings/><p>{canPause&&!completed?'Oyunun kaydedildi. Hazır olduğunda devam et.':completed?'Tamamladığın tahtayı inceleyebilirsin.':'Yarış süresi devam ediyor.'}</p></Modal>}
 </>;
}
export function Help({onClose,daily=false,onPractice}:{onClose:()=>void;daily?:boolean;onPractice?:()=>void}){return <Modal title="Nasıl oynanır" onClose={onClose}><p>Kelimeleri yatay, dikey ve çapraz bul. Tersten de yazılmış olabilirler. Parmağını ilk harften son harfe kaydır veya iki uca sırayla dokun.</p><p>Noktalar saklı harfleri gösterir. Konu başlığından ve varsa ilk harften yola çık. Bulduğun kelime tamamen açılır.</p><p>Uzun isimler parçalara ayrılır. Her parçayı ayrı seç; bütün parçaları bulunca isim tamamlanır. Yanlış seçim puan götürmez.</p><p>Büyük harf modunda da kelimeyi kaydırarak çiz. Tahtanın başka bir yerine geçmek için Tahtayı kaydır’ı, yeniden çizmek için Kelime seç’i kullan. İki uca dokunma ve klavyede oklar ile Enter da çalışır.</p>{daily?<p>Günlük yarışta süre devam eder. Her ipucu bitiş sürene 15 saniye ekler. Her gün bir sıralama hakkın var.</p>:<p>Keşif bölümlerinde süre baskısı yok. İpuçsuz bitir: 3 yıldız. Bir ipucuyla: 2 yıldız. İki veya üç ipucuyla: 1 yıldız. Süre yıldızını etkilemez; koleksiyon parçası için yıldız şartı yok.</p>}{onPractice&&<button className="button primary full" onClick={onPractice}>Çizerek dene</button>}<button className="button secondary full" onClick={onClose}>{onPractice?'Kapat':'Oyuna dön'}</button></Modal>;}
export {shareLink} from '@/lib/platform/sharing';
