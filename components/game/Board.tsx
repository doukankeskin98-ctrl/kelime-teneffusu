'use client';
import {gameIsActive} from '@/lib/platform/runtime';
import '@/lib/game/browser-compat';
import {useEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent} from 'react';
import {attachBoardSize,setBoardDrawing} from '@/lib/game/viewport';
import {attachLegacyTouch,type BoardPointer} from '@/lib/game/legacy-ui';
import {snapLine,type Cell,type Puzzle,type Stroke,type Target} from '@/lib/game/engine';
import {advanceGesture,earlyWordEnd,gestureTip} from '@/lib/game/input-gesture';
import {track} from '@/lib/game/telemetry';
export const strokeColor=(id:string)=>`var(--word-${(Number(id.split('.')[0])||0)%8})`;
type Drag={cells:Cell[];id:number;source:'pointer'|'touch';type:string;start:Cell;current:Cell;axis:Cell|null;moved:boolean;tapOnly:boolean;x:number;y:number;pan:boolean;rect:DOMRect};
export function Board({board,strokes,earlyTargets,paused=false,readOnly=false,blocked=false,busy=false,pan=false,statusText='Sunucu onayı bekleniyor.',zoom=false,hint,hintEnd,onCommit,onPreview,onSelectStart,onSelectLetter,onSelectEnd,onResume}:{board:Pick<Puzzle,'grid'|'size'>;strokes:Stroke[];earlyTargets?:Target[];paused?:boolean;readOnly?:boolean;blocked?:boolean;busy?:boolean;pan?:boolean;statusText?:string;zoom?:boolean;hint?:Cell|null;hintEnd?:Cell|null;onCommit:(a:Cell,b:Cell)=>void;onPreview?:(text:string)=>void;onSelectStart?:()=>void;onSelectLetter?:(depth:number)=>void;onSelectEnd?:()=>void;onResume?:()=>void}){
 const selectionSound=useRef(false);
 const soundedCells=useRef(new Set<string>());
 const initialFound=useRef(new Set(strokes.map(s=>s.id)));
 const confirmedFound=useRef(new Set(strokes.map(s=>s.id)));
 const ref=useRef<HTMLDivElement>(null),drag=useRef<Drag|null>(null),frame=useRef(0),pending=useRef<{cells:Cell[];tip?:Cell}|null>(null),contact=useRef(false),previewText=useRef('');
 const inkRef=useRef<SVGGElement>(null),lineRef=useRef<SVGLineElement>(null),outlineRef=useRef<SVGLineElement>(null),letters=useRef<(HTMLSpanElement|null)[]>([]),selected=useRef<Cell[]>([]);
 const [anchor,setAnchor]=useState<Cell|null>(null),[cursor,setCursor]=useState<Cell>([0,0]),[focused,setFocused]=useState(false);
 const n=board.size,disabled=useRef(paused||readOnly||blocked);disabled.current=paused||readOnly||blocked;
 const signature=board.grid.map(row=>row.join('')).join('|');
 const same=(a:Cell,b:Cell)=>a[0]===b[0]&&a[1]===b[1];
 const paint=(cells:Cell[],tip?:Cell)=>{
  if(cells!==selected.current){
  for(const [r,c] of selected.current)if(!cells.some(cell=>cell[0]===r&&cell[1]===c))letters.current[r*n+c]?.classList.remove('letter-selected');
  for(const [r,c] of cells)if(!selected.current.some(cell=>cell[0]===r&&cell[1]===c))letters.current[r*n+c]?.classList.add('letter-selected');
  selected.current=cells;
  }
  const a=cells[0],b=cells.at(-1);
  if(a&&b)for(const line of [lineRef.current,outlineRef.current])if(line){line.setAttribute('x1',String(a[1]+.5));line.setAttribute('y1',String(a[0]+.5));line.setAttribute('x2',String(tip?.[1]??b[1]+.5));line.setAttribute('y2',String(tip?.[0]??b[0]+.5));}
  inkRef.current?.setAttribute('data-active',cells.length?'true':'false');
 };
 const endSelection=()=>{if(!selectionSound.current)return;selectionSound.current=false;onSelectEnd?.();};
 const endSelectionRef=useRef(endSelection);endSelectionRef.current=endSelection;
 const releaseContact=()=>{if(!contact.current)return;contact.current=false;if(ref.current)setBoardDrawing(ref.current,false,window);};
 const clear=()=>{releaseContact();endSelection();soundedCells.current.clear();drag.current=null;pending.current=null;cancelAnimationFrame(frame.current);frame.current=0;setAnchor(null);paint([]);previewText.current='';onPreview?.('');};
 const clearRef=useRef(clear);clearRef.current=clear;
 useEffect(()=>{
  const blur=()=>clearRef.current(),visibility=()=>{if(document.hidden||!gameIsActive())clearRef.current();};
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  return ()=>{window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{if(paused||readOnly||blocked)clear();},[paused,readOnly,blocked]);
 useEffect(()=>{if(!busy)for(const stroke of strokes)confirmedFound.current.add(stroke.id);if(paused)for(const stroke of strokes)initialFound.current.add(stroke.id);},[strokes,busy,paused]);
 useEffect(()=>{clear();},[signature,zoom,pan]);
 useEffect(()=>{disabled.current=paused||readOnly||blocked;return ()=>{releaseContact();endSelectionRef.current();disabled.current=true;drag.current=null;pending.current=null;cancelAnimationFrame(frame.current);};},[]);
 useEffect(()=>{const element=ref.current;if(!element)return;return attachBoardSize(element,n,zoom,(rect,reason)=>{
  // The live preview can reflow the frame. Keep the starting cell and rebase hit
  // testing instead of cancelling the gesture that caused that measurement.
  if(reason==='viewport')clearRef.current();else if(drag.current)drag.current.rect=rect;
 },window);},[n,zoom]);
 const cellAt=(x:number,y:number,rect=drag.current?.rect??ref.current!.getBoundingClientRect()):Cell=>[Math.max(0,Math.min(n-1,Math.floor((y-rect.top)/rect.height*n))),Math.max(0,Math.min(n-1,Math.floor((x-rect.left)/rect.width*n)))];
 const notifyLetters=(cells:Cell[])=>{if(disabled.current)return;let added=false;for(const cell of cells){const key=cell.join(',');if(!soundedCells.current.has(key)){soundedCells.current.add(key);added=true;}}if(added)onSelectLetter?.(cells.length);};
 const show=(cells:Cell[],tip?:Cell)=>{if(!selectionSound.current&&cells.length){selectionSound.current=true;onSelectStart?.();}const changed=cells!==selected.current;if(changed){notifyLetters(cells);const text=cells.map(([r,c])=>board.grid[r]![c]).join('');if(text!==previewText.current){previewText.current=text;onPreview?.(text);}}paint(cells,tip);};
 const showRef=useRef(show);showRef.current=show;
 const schedule=(cells:Cell[],tip:Cell,changed:boolean)=>{if(changed)notifyLetters(cells);pending.current={cells,tip};if(frame.current)return;frame.current=requestAnimationFrame(()=>{frame.current=0;if(pending.current&&!disabled.current)showRef.current(pending.current.cells,pending.current.tip);pending.current=null;});};
 const commit=(a:Cell,b:Cell)=>{if(!disabled.current&&!same(a,b))notifyLetters(snapLine(a,b,n));clear();if(!disabled.current&&!same(a,b))onCommit(a,b);};
 const tap=(cell:Cell)=>{if(disabled.current)return;if(anchor){if(same(anchor,cell))clear();else{const cells=snapLine(anchor,cell,n);commit(anchor,cells.at(-1)!);}}else{setAnchor(cell);show([cell]);}};
 const down=(e:BoardPointer)=>{
  if(disabled.current||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  if(drag.current){const current=drag.current;if(e.input==='touch'&&current.source==='pointer'&&current.type==='touch'){current.id=e.pointerId;current.source='touch';current.rect=ref.current!.getBoundingClientRect();if(!current.tapOnly)e.preventDefault();}return;}
  const rect=ref.current!.getBoundingClientRect(),start=cellAt(e.clientX,e.clientY,rect),tapOnly=zoom&&pan&&e.pointerType!=='mouse';
  drag.current={cells:[start],id:e.pointerId,source:e.input??'pointer',type:e.pointerType,start,current:start,axis:null,moved:false,tapOnly,x:e.clientX,y:e.clientY,pan:false,rect};
  if(!tapOnly){contact.current=true;setBoardDrawing(ref.current!,true,window);e.preventDefault();try{if(e.input!=='touch'&&typeof window.PointerEvent==='function')ref.current?.setPointerCapture?.(e.pointerId);}catch{/* Capture is optional; an active in-board swipe still works. */}if(!anchor)show(drag.current.cells);}
  const at=performance.now();requestAnimationFrame(()=>track('input_feedback',performance.now()-at));
 };
 const advance=(d:Drag,x:number,y:number,release=false)=>{
  const rect=d.rect,point:Cell=[(y-rect.top)/rect.height*n,(x-rect.left)/rect.width*n],step=advanceGesture(d.start,d.current,d.axis,point,n,release);
  d.axis=step.axis;if(same(d.current,step.cell))return false;d.current=step.cell;d.cells=snapLine(d.start,d.current,n);if(!same(d.start,step.cell))d.moved=true;return true;
 };
 const move=(e:BoardPointer)=>{const d=drag.current;if(!d||d.id!==e.pointerId||d.source!==(e.input??'pointer'))return;if(disabled.current)return clear();if(d.tapOnly){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)d.pan=true;return;}const changed=advance(d,e.clientX,e.clientY);if(changed&&d.moved){setAnchor(null);const end=earlyTargets&&earlyWordEnd(board,earlyTargets,strokes,d.start,d.current);if(end){commit(d.start,end);return;}}const point:Cell=[(e.clientY-d.rect.top)/d.rect.height*n,(e.clientX-d.rect.left)/d.rect.width*n];schedule(d.cells,gestureTip(d.start,d.axis,point,n),changed);};
 const up=(e:BoardPointer)=>{const d=drag.current;if(!d||d.id!==e.pointerId||d.source!==(e.input??'pointer'))return;d.rect=ref.current!.getBoundingClientRect();const cell=cellAt(e.clientX,e.clientY,d.rect);drag.current=null;pending.current=null;cancelAnimationFrame(frame.current);frame.current=0;releaseContact();if(disabled.current)return clear();if(d.tapOnly){if(!d.pan&&same(cell,d.start))tap(d.start);}else{advance(d,e.clientX,e.clientY,true);if(d.moved)commit(d.start,earlyTargets&&earlyWordEnd(board,earlyTargets,strokes,d.start,d.current)||d.current);else if(same(cell,d.start))tap(d.start);else clear();}};
 const cancel=(e:BoardPointer)=>{if(drag.current?.id===e.pointerId&&drag.current.source===(e.input??'pointer'))clear();};
 const key=(e:KeyboardEvent)=>{if(paused)return;const dirs:Record<string,Cell>={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};const dir=dirs[e.key];if(dir){e.preventDefault();const next:Cell=[Math.max(0,Math.min(n-1,cursor[0]+dir[0])),Math.max(0,Math.min(n-1,cursor[1]+dir[1]))];setCursor(next);if(anchor&&!disabled.current)show(snapLine(anchor,next,n));}else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!disabled.current)tap(cursor);}else if(e.key==='Escape')clear();};
 const legacyHandlers=useRef({down,move,up,cancel:clear,pan:()=>zoom&&pan||readOnly||blocked});legacyHandlers.current={down,move,up,cancel:clear,pan:()=>zoom&&pan||readOnly||blocked};
 useEffect(()=>{const element=ref.current;if(!element)return;return attachLegacyTouch(element,()=>legacyHandlers.current,window);},[]);
 const line=(a:Cell,b:Cell)=>({x1:a[1]+.5,y1:a[0]+.5,x2:b[1]+.5,y2:b[0]+.5});
 const canResume=paused&&!readOnly&&!blocked&&!!onResume;
 const resume=()=>{if(canResume&&!document.hidden&&gameIsActive()){clear();onResume?.();}};
 const grid=useMemo(()=>board.grid.flatMap((row,r)=>row.map((ch,c)=><span data-cell={`${r},${c}`} ref={element=>{letters.current[r*n+c]=element;}} key={`${r},${c}`}>{paused?'·':ch}</span>)),[signature,paused]);
 return <div className={'board-scroll'+(zoom?' zoomed':'')}><div ref={ref} className={"letter-board"+(strokes.length?" has-found":"")} role="application" aria-busy={busy||undefined} aria-label={paused?'Kelime tahtası duraklatıldı. Hazır olduğunda devam et.':`${readOnly?'Bölüm tamamlandı. İnceleme tahtası. Klavyede oklarla harfleri incele.':blocked?'Kelime tahtası. '+statusText:'Kelime tahtası. Kaydır veya ilk ve son harfe dokun. Klavyede oklar ve Enter ile seç.'} ${focused?`${cursor[0]+1}. satır, ${cursor[1]+1}. sütun: ${board.grid[cursor[0]]?.[cursor[1]]??''}.`:''}`} tabIndex={paused?-1:0} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);clear();}} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={cancel} onContextMenu={e=>e.preventDefault()} style={{'--n':n,width:'100%',background:'var(--board-paper,#fffdf4)',touchAction:zoom&&pan||readOnly||blocked?'pan-x pan-y':'none'} as CSSProperties}>
  <svg viewBox={`0 0 ${n} ${n}`} className="board-ink" aria-hidden="true">{!paused&&strokes.map(s=><g key={s.id}><line className={'stroke-outline'+(busy&&!confirmedFound.current.has(s.id)?' is-pending':'')} {...line(s.a,s.b)} strokeWidth=".94" strokeLinecap="round"/><line className={'found-stroke'+(busy&&!confirmedFound.current.has(s.id)?' is-pending':!initialFound.current.has(s.id)?' is-new':'')} onAnimationEnd={()=>initialFound.current.add(s.id)} {...line(s.a,s.b)} stroke={strokeColor(s.id)} strokeWidth=".76" strokeLinecap="round"/>{!busy&&!initialFound.current.has(s.id)&&<circle className="word-end-flash" cx={s.b[1]+.5} cy={s.b[0]+.5} r=".38" fill="none" stroke={strokeColor(s.id)} strokeWidth=".09"/>}</g>)}<g ref={inkRef} className="active-selection" data-active="false"><line ref={outlineRef} className="active-stroke-outline" x1=".5" y1=".5" x2=".5" y2=".5" strokeWidth="1" strokeLinecap="round"/><line ref={lineRef} x1=".5" y1=".5" x2=".5" y2=".5" stroke="var(--selection)" strokeWidth=".83" strokeLinecap="round"/></g>{hint&&hintEnd&&!paused&&!readOnly&&!blocked&&<line className="hint-guide" {...line(hint,hintEnd)} fill="none" stroke="#a94d2e" strokeWidth=".16" strokeDasharray=".15 .14" strokeLinecap="round"/>}{hint&&!paused&&!readOnly&&!blocked&&<circle className="hint-ring" cx={hint[1]+.5} cy={hint[0]+.5} r=".42" fill="none" stroke="#a94d2e" strokeWidth=".075"/>}{focused&&!paused&&<rect x={cursor[1]+.07} y={cursor[0]+.07} width=".86" height=".86" rx=".2" fill="none" stroke="#21574b" strokeWidth=".065"/>}</svg>
  <div className="letter-grid" aria-hidden="true">{grid}</div>{paused&&!canResume&&<div className="board-paused"><span>Duraklatıldı</span><small>Hazır olduğunda devam et.</small></div>}
 </div>{canResume&&<button type="button" className="board-paused board-resume" onClick={resume} aria-label="Oyuna devam et"><span>Duraklatıldı</span><small>Devam etmek için tahtaya dokun</small></button>}</div>;
}
