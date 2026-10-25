'use client';
import {wordCardCopy} from '@/lib/game/word-card';
import {useEffect,useRef,useId,type ReactNode} from 'react';
import {ArrowLeft,Check,HelpCircle,Lightbulb,Pause,Play,Volume2,VolumeX,X,ZoomIn} from 'lucide-react';
import {Board,strokeColor} from './Board';
import {fittedBoardSize} from '@/lib/game/viewport';
import {memberFetch} from '@/lib/auth/firebase-client';
import type {Cell,Puzzle,Stroke} from '@/lib/game/engine';
const errorText=(v:unknown)=>v&&typeof v==='object'&&'error' in v&&typeof v.error==='string'?v.error:'Bağlantı kurulamadı.';
export async function api<T>(action:string,data:Record<string,unknown>={},signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data}),signal});const value=await res.json();if(!res.ok)throw new Error(errorText(value));return value as T;}
export async function getApi<T>(query='',signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/game'+query,{cache:'no-store',signal});const data=await res.json();if(!res.ok)throw new Error(errorText(data));return data as T;}
export async function socialApi<T>(action:string,data:Record<string,unknown>={},signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/social',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data}),signal});const value=await res.json();if(!res.ok)throw new Error(errorText(value));return value as T;}
export async function getSocial<T>(query='',signal?:AbortSignal):Promise<T>{const res=await memberFetch('/api/social'+query,{signal});const data=await res.json();if(!res.ok)throw new Error(errorText(data));return data as T;}
export function useChime(enabled:boolean,haptics=false){
 const ctx=useRef<AudioContext|null>(null);
 useEffect(()=>{if(!enabled)return;const unlock=()=>{try{ctx.current??=new AudioContext();void ctx.current.resume();}catch{}};document.addEventListener('pointerdown',unlock,{passive:true});return ()=>document.removeEventListener('pointerdown',unlock);},[enabled]);
 useEffect(()=>()=>{void ctx.current?.close();},[]);
 return (complete=false)=>{
  if(haptics&&typeof navigator.vibrate==='function')navigator.vibrate(complete?[12,45,18]:9);
  if(!enabled)return;
  try{const audio=ctx.current??new AudioContext();ctx.current=audio;void audio.resume();const now=audio.currentTime;
   (complete?[523.25,659.25,783.99,1046.5]:[659.25,880]).forEach((f,i)=>{const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=f;const at=now+i*.065;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.045,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+.22);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.24);});
  }catch{}
 };
}
export function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){const ref=useRef<HTMLDialogElement>(null),id=useId();useEffect(()=>{const d=ref.current;if(d&&!d.open)d.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return ()=>{d?.close();document.body.style.overflow=old;};},[]);return <dialog className="modal" ref={ref} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current){const bounds=e.currentTarget.getBoundingClientRect();if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)onClose();}}} aria-labelledby={id}><div className="modal-head"><h2 id={id}>{title}</h2><button className="icon-button" aria-label="Kapat" onClick={onClose}><X/></button></div>{children}</dialog>;}
export function WordList({board,strokes,golden,clues}:{board:Pick<Puzzle,'targets'>;strokes:Stroke[];golden?:string|null;clues?:Record<string,string>}){
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

export function PlayLayout({title,kicker,onBack,board,strokes,paused,zoom,hint,onCommit,preview,onPreview,children,aside,footer,effect}:{title:string;kicker:string;onBack:()=>void;board:Pick<Puzzle,'size'|'grid'|'targets'>;strokes:Stroke[];paused:boolean;zoom:boolean;hint?:Cell|null;onCommit:(a:Cell,b:Cell)=>void;preview:string;onPreview:(s:string)=>void;children:ReactNode;aside:ReactNode;footer:ReactNode;effect?:ReactNode}){
 const screenRef=useRef<HTMLElement>(null),stageRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const screen=screenRef.current,stage=stageRef.current;if(!screen||!stage)return;
  let frame=0;
  const fit=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   if(zoom||window.visualViewport&&window.visualViewport.scale!==1){screen.style.removeProperty('--fitted-board');return;}
   const viewport=window.visualViewport?.height??window.innerHeight;
   const rect=screen.getBoundingClientRect(),stageRect=stage.getBoundingClientRect();
   const mobile=window.matchMedia('(max-width: 780px)').matches&&!window.matchMedia('(orientation: landscape) and (max-height: 540px) and (min-width: 600px)').matches;
   const container=screen.closest('.game-app,.main-content');
   const bottomSpace=Math.max(16,container?parseFloat(getComputedStyle(container).paddingBottom)||0:0);
   const remaining=mobile?viewport-Math.max(0,rect.top)-(rect.height-stageRect.height)-bottomSpace:viewport-stageRect.top-110;
   const size=fittedBoardSize(stage.clientWidth,remaining,board.size);
   const value=size+'px';if(screen.style.getPropertyValue('--fitted-board')!==value)screen.style.setProperty('--fitted-board',value);
  });};
  const observer=new ResizeObserver(fit);observer.observe(screen);observer.observe(stage);
  window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);fit();
  return ()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);};
 },[zoom,board.size]);
 return <section ref={screenRef} className={'play-screen'+(zoom?' is-zoomed':'')}><header className="play-heading"><button className="icon-button" onClick={onBack} aria-label="Geri"><ArrowLeft/></button><div><span className="eyebrow">{kicker}</span><h1>{title}</h1></div><span className="mini-mark">Kt.</span></header>{children}<div className="play-columns"><div className="board-panel"><div className={'selection-preview'+(preview?' selecting':'')} aria-live="off">{preview?<><b>{preview}</b>{/^[A-ZÇĞİÖŞÜ0-9]+$/u.test(preview)&&<span>{[...preview].length} harf</span>}</>:<span>{zoom?'Seçmek için kelimenin iki ucuna dokun.':'Kaydır veya ilk ve son harfe dokun.'}</span>}</div><div className="board-stage" ref={stageRef}><Board board={board} strokes={strokes} paused={paused} zoom={zoom} hint={hint} onCommit={onCommit} onPreview={onPreview}/>{effect}</div>{footer}<small className="board-access-note">Yatay · Dikey · Çapraz · Tersten</small></div><aside className="targets-panel">{aside}</aside></div></section>;
}
export function PlayControls({paused,onPause,zoom,onZoom,sound,onSound,hints,onHint,onHelp,canPause=true}:{paused:boolean;onPause:()=>void;zoom:boolean;onZoom:()=>void;sound:boolean;onSound:()=>void;hints:number;onHint:()=>void;onHelp:()=>void;canPause?:boolean}){return <div className="play-controls"><button className="button primary hint-button" disabled={paused||hints===0} onClick={onHint}><Lightbulb size={19}/>İpucu <span>{hints}</span></button>{canPause&&<button className="icon-button" onClick={onPause} aria-label={paused?'Devam et':'Duraklat'}>{paused?<Play/>:<Pause/>}</button>}<button className={'icon-button'+(zoom?' selected':'')} onClick={onZoom} aria-label={zoom?'Normal tahta boyutuna dön':'Tahtayı büyüt, iki uca dokunarak seç'} aria-pressed={zoom}><ZoomIn/></button><button className="icon-button" onClick={onSound} aria-label={sound?'Sesi kapat':'Sesi aç'} aria-pressed={sound}>{sound?<Volume2/>:<VolumeX/>}</button><button className="icon-button" onClick={onHelp} aria-label="Nasıl oynanır"><HelpCircle/></button></div>;}
export function Help({onClose,daily=false}:{onClose:()=>void;daily?:boolean}){return <Modal title="Bir bakış, bir kelime." onClose={onClose}><p>Kelimeleri yatay, dikey ve çapraz bul. Tersten de yazılmış olabilirler. Parmağını ilk harften son harfe kaydır veya iki uca sırayla dokun.</p><p>Uzun isimler parçalara ayrılır. İsmin altındaki bütün parçaları bulunca tamamlanır. Yanlış seçim puan götürmez.</p><p>Büyük harf modunda tahtayı yana kaydırabilirsin. Seçim için ilk ve son harfe dokun. Klavyede oklar ve Enter kullan.</p>{daily?<p>Günlük yarışta süre devam eder. Her ipucu bitiş sürene 15 saniye ekler. Her gün bir sıralama hakkın var.</p>:<p>Keşif bölümlerinde süre baskısı yok. Üç ipucun var; ipuçlarını az kullanarak daha çok yıldız kazan.</p>}<button className="button primary full" onClick={onClose}>Hadi bulalım</button></Modal>;}
export async function shareLink(title:string,url:string){if(navigator.share){try{await navigator.share({title,text:title,url});return 'paylaşıldı';}catch(e){if(e instanceof Error&&e.name==='AbortError')return '';}}try{await navigator.clipboard.writeText(url);return 'kopyalandı';}catch{return '';}}
