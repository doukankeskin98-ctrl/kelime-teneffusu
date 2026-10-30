'use client';
import '@/lib/game/browser-compat';
import {wordCardCopy,wordListProgress} from '@/lib/game/word-card';
import {useEffect,useRef,useId,useState,type ReactNode} from 'react';
import {ArrowLeft,Check,HelpCircle,Lightbulb,ListChecks,LoaderCircle,Pause,Play,Volume2,VolumeX,X,ZoomIn} from 'lucide-react';
import {Board,strokeColor} from './Board';
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
export function Modal({title,onClose,children,className='',footer}:{title:string;onClose:()=>void;children:ReactNode;className?:string;footer?:ReactNode}){const ref=useRef<HTMLDialogElement>(null),id=useId();useEffect(()=>{const d=ref.current;if(d)return openGameDialog(d,onClose,window);},[]);return <dialog className={'modal'+(className?' '+className:'')} ref={ref} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current){const bounds=e.currentTarget.getBoundingClientRect();if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)onClose();}}} role="dialog" aria-modal="true" aria-labelledby={id}><div className="modal-head"><h2 id={id}>{title}</h2><button className="icon-button" aria-label="Kapat" onClick={onClose}><X/></button></div>{footer?<><div className="modal-content">{children}</div><footer className="modal-actions" aria-label="Sonuç eylemleri">{footer}</footer></>:children}</dialog>;}
export interface WordListData {board:Pick<Puzzle,'targets'>;strokes:Stroke[];golden?:string|null;clues?:Record<string,string>}
/** A read-only view. Opening it never pauses, selects or changes the board. */
export function BoardWords({words}:{words:WordListData}){
 const [open,setOpen]=useState(false),opener=useRef<HTMLButtonElement>(null),focusFrame=useRef(0);
 const {total,complete,remaining}=wordListProgress(words.board,words.strokes);
 useEffect(()=>()=>cancelAnimationFrame(focusFrame.current),[]);
 const close=()=>{setOpen(false);cancelAnimationFrame(focusFrame.current);focusFrame.current=requestAnimationFrame(()=>{focusFrame.current=0;if(opener.current?.isConnected)opener.current.focus({preventScroll:true});});};
 if(total===0)return null;
 return <div className="board-word-access"><button type="button" className="board-words-trigger" ref={opener} aria-haspopup="dialog" aria-expanded={open} aria-label={`Kelime listesini aç · ${remaining} hedef kaldı`} onClick={()=>setOpen(true)}><ListChecks size={19} aria-hidden="true"/><span>Kelimeler</span><small>{remaining} kaldı</small></button>
  {open&&<Modal title={words.clues?'Tanım listen':'Kelime listen'} onClose={close}><div className="board-words-sheet"><p className="board-words-summary">Listede <b>{complete} / {total}</b> hedef tamamlandı. Buldukların işaretli; süre işlemeye devam eder.</p><WordList {...words}/><button type="button" className="button primary full" onClick={close}>Tahtaya dön</button></div></Modal>}
 </div>;
}
export function WordList({board,strokes,golden,clues}:WordListData){
 const groups=[...new Set(board.targets.map(t=>t.group))];
 return <div className={'word-list'+(clues?' clue-list':'')} role="list" aria-label={clues?'Tanımlardan bulunacak kelimeler':'Bulunacak kelimeler'}>{groups.map(group=>{
  const parts=board.targets.filter(t=>t.group===group),target=parts[0]!,done=parts.every(t=>strokes.some(s=>s.id===t.id));
  const split=parts.length>1,clue=clues?.[target.text],copy=wordCardCopy(target,done,clues);
  return <div className={'word-tag'+(done?' found':'')+(clue?' clue-tag':'')+(parts.some(t=>t.id===golden)?' golden':'')}
   key={group} role="listitem" aria-label={copy.text+(copy.detail?' · '+copy.detail:'')+(done?' bulundu':' aranıyor')}
   style={done?{background:`color-mix(in srgb, ${strokeColor(target.id)} 35%, transparent)`}:{}}>
   <span>{done?<Check size={15}/>:<i/>}</span>
   <div className={clue?'clue-copy':undefined}>{clue?<>
    <span className="clue-face clue-question" style={{visibility:done?'hidden':'visible'}} aria-hidden={done}>
     {clue}<small>{target.text.length} harf</small>
    </span>
    <span className="clue-face clue-answer" style={{visibility:done?'visible':'hidden'}} aria-hidden={!done}>{target.label}</span>
   </>:<>{copy.text}{copy.detail&&<small>{copy.detail}</small>}{split&&<small>{parts.map(t=><span className={strokes.some(s=>s.id===t.id)?'part-found':''} key={t.id}>{t.text}</span>)}</small>}</>}</div>
   {parts.some(t=>t.id===golden)&&<b>×2</b>}
  </div>;
 })}</div>;
}

export function PlayLayout({title,kicker,onBack,board,strokes,paused,readOnly=false,reviewStatus='Keşif tamamlandı · Tahtanı inceleyebilirsin.',inputBlocked=false,inputStatus,busy=false,wordList,wordListKey,wordListUnavailable=false,inlineTargets=false,focused=false,zoom,hint,onCommit,onSelectStart,onSelectLetter,preview,onPreview,children,aside,footer,effect}:{title:string;kicker:string;onBack:()=>void;board:Pick<Puzzle,'size'|'grid'|'targets'>;strokes:Stroke[];paused:boolean;readOnly?:boolean;reviewStatus?:string;inputBlocked?:boolean;inputStatus?:string;busy?:boolean;wordList?:WordListData;wordListKey?:string;wordListUnavailable?:boolean;inlineTargets?:boolean;focused?:boolean;zoom:boolean;hint?:Cell|null;onCommit:(a:Cell,b:Cell)=>void;onSelectStart?:()=>void;onSelectLetter?:(depth:number)=>void;preview:string;onPreview:(s:string)=>void;children:ReactNode;aside:ReactNode;footer:ReactNode;effect?:ReactNode}){
 const screenRef=useRef<HTMLElement>(null),stageRef=useRef<HTMLDivElement>(null),selectionRef=useRef<HTMLDivElement>(null);
 const [pan,setPan]=useState(false),boardIdentity=board.grid.map(row=>row.join('')).join('|');
 useEffect(()=>setPan(false),[zoom,wordListKey,boardIdentity]);
 useEffect(()=>{
  const screen=screenRef.current,stage=stageRef.current;if(!screen||!stage)return;
  return attachPlayFit(screen,stage,board.size,zoom,window);
 },[zoom,board.size]);
 const instruction=readOnly?reviewStatus:inputBlocked?(inputStatus??'Sunucu onayı bekleniyor.'):paused?'Oyun duraklatıldı.':zoom&&pan?'Tahtayı kaydır. Kelime çizmek için Kelime seç’e geç.':'Kaydır veya ilk ve son harfe dokun.';
 const paintPreview=(text:string)=>{
  const locked=readOnly||inputBlocked||paused,root=selectionRef.current;if(!root){if(!locked)onPreview(text);return;}if(locked)text='';
  const valid=/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(text),characters=[...text];
  const update=(selector:string,value:string,shown:boolean)=>{const node=root.querySelector<HTMLElement>(selector);if(node){node.textContent=value;node.hidden=!shown;}};
  root.classList.toggle('selecting',!!text);
  update('[data-selection-message]',instruction,!text);update('[data-selection-word]',text,!!text);
  update('[data-selection-count]',characters.length+' harf',valid);
  update('[data-selection-loupe]',characters.at(-1)??'',valid&&board.size>=10&&!zoom);
 };
 useEffect(()=>{paintPreview(preview);},[preview,readOnly,inputBlocked,inputStatus,reviewStatus,paused,boardIdentity,zoom,pan]);
 return <section ref={screenRef} className={'play-screen viewport-play'+(zoom?' is-zoomed':'')+(focused?' focused-play':'')+(inlineTargets?' inline-target-play':'')}><header className="play-heading"><button className="icon-button" onClick={onBack} aria-label="Geri"><ArrowLeft/></button><div><span className="eyebrow">{kicker}</span><h1>{title}</h1></div><span className="mini-mark">Kt.</span></header><div className="play-hud">{children}</div><div className="play-columns"><div className="board-panel"><div ref={selectionRef} className={'selection-preview'+(board.size>=10&&!zoom?' loupe-available':'')+(readOnly?' is-review':inputBlocked?' is-blocked':preview?' selecting':'')} aria-live="off"><span data-selection-message hidden={!readOnly&&!inputBlocked&&!!preview}>{!readOnly&&!inputBlocked&&preview?'':instruction}</span><b data-selection-word hidden={readOnly||inputBlocked||!preview}>{readOnly||inputBlocked?'':preview}</b><span data-selection-count hidden={readOnly||inputBlocked||!/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(preview)}>{!readOnly&&!inputBlocked&&/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(preview)?[...preview].length+' harf':''}</span><span data-selection-loupe className="selection-loupe" aria-hidden="true" hidden={readOnly||inputBlocked||board.size<10||zoom||!preview}>{!readOnly&&!inputBlocked&&board.size>=10&&!zoom?[...preview].at(-1):''}</span></div>{zoom&&!paused&&!readOnly&&!inputBlocked&&!wordListUnavailable&&<div className="board-input-tools">{wordList&&<BoardWords key={wordListKey??JSON.stringify([board.size,board.grid,wordList.board.targets])} words={wordList}/>}<div className="board-input-mode" role="group" aria-label="Büyük tahta kontrolü"><button type="button" aria-pressed={!pan} onClick={()=>setPan(false)}>Kelime seç</button><button type="button" aria-pressed={pan} onClick={()=>setPan(true)}>Tahtayı kaydır</button></div></div>}<div className="board-stage" ref={stageRef}><Board key={boardIdentity} board={board} strokes={strokes} paused={paused} readOnly={readOnly} blocked={inputBlocked} busy={busy} statusText={inputStatus} zoom={zoom} pan={pan} hint={hint} onCommit={onCommit} onSelectStart={onSelectStart} onSelectLetter={onSelectLetter} onPreview={paintPreview}/>{effect}</div>{footer}<small className="board-access-note">Yatay · Dikey · Çapraz · Tersten</small></div><aside className="targets-panel">{wordList&&<div className="viewport-targets" data-many={wordList.board.targets.length>9||undefined}><WordList {...wordList}/></div>}{aside}</aside></div></section>;
}
export function PlayControls({paused,onPause,zoom,onZoom,sound,onSound,hints,onHint,onHelp,canPause=true,completed=false,blocked=false,busy=false}:{paused:boolean;onPause:()=>void;zoom:boolean;onZoom:()=>void;sound:boolean;onSound:()=>void;hints:number;onHint:()=>void;onHelp:()=>void;canPause?:boolean;completed?:boolean;blocked?:boolean;busy?:boolean}){return <div className={'play-controls'+(completed?' is-review':'')}>{completed?<span className="review-controls-label"><Check size={17} aria-hidden="true"/>İnceleme</span>:<button className="button primary hint-button" disabled={paused||blocked||hints===0} aria-busy={busy||undefined} onClick={onHint}>{busy?<LoaderCircle size={19} className="spin" aria-hidden="true"/>:<Lightbulb size={19}/>}İpucu <span>{hints}</span></button>}{canPause&&!completed&&<button className="icon-button" onClick={onPause} aria-label={paused?'Devam et':'Duraklat'}>{paused?<Play/>:<Pause/>}</button>}<button className={'icon-button'+(zoom?' selected':'')} onClick={onZoom} aria-label={zoom?'Normal tahta boyutuna dön':completed?'İncelemek için tahtayı büyüt':'Tahtayı büyüt'} aria-pressed={zoom}><ZoomIn/></button><button className="icon-button" onClick={onSound} aria-label={sound?'Sesi kapat':'Sesi aç'} aria-pressed={sound}>{sound?<Volume2/>:<VolumeX/>}</button><button className="icon-button" onClick={onHelp} aria-label="Nasıl oynanır"><HelpCircle/></button></div>;}
export function Help({onClose,daily=false}:{onClose:()=>void;daily?:boolean}){return <Modal title="Bir bakış, bir kelime." onClose={onClose}><p>Kelimeleri yatay, dikey ve çapraz bul. Tersten de yazılmış olabilirler. Parmağını ilk harften son harfe kaydır veya iki uca sırayla dokun.</p><p>Uzun isimler parçalara ayrılır. İsmin altındaki bütün parçaları bulunca tamamlanır. Yanlış seçim puan götürmez.</p><p>Büyük harf modunda da kelimeyi kaydırarak çiz. Tahtanın başka bir yerine geçmek için Tahtayı kaydır’ı, yeniden çizmek için Kelime seç’i kullan. İki uca dokunma ve klavyede oklar ile Enter da çalışır.</p>{daily?<p>Günlük yarışta süre devam eder. Her ipucu bitiş sürene 15 saniye ekler. Her gün bir sıralama hakkın var.</p>:<p>Keşif bölümlerinde süre baskısı yok. İpuçsuz bitir: 3 yıldız. Bir ipucuyla: 2 yıldız. İki veya üç ipucuyla: 1 yıldız. Süre yıldızını etkilemez; koleksiyon parçası için yıldız şartı yok.</p>}<button className="button primary full" onClick={onClose}>Hadi bulalım</button></Modal>;}
export async function shareLink(title:string,url:string){if(navigator.share){try{await navigator.share({title,text:title,url});return 'paylaşıldı';}catch(e){if(e instanceof Error&&e.name==='AbortError')return '';}}try{await navigator.clipboard.writeText(url);return 'kopyalandı';}catch{return '';}}
