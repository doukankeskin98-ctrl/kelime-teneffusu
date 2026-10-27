'use client';
import {useEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent} from 'react';
import {snapLine,type Cell,type Puzzle,type Stroke} from '@/lib/game/engine';
import {track} from '@/lib/game/telemetry';
export const strokeColor=(id:string)=>`var(--word-${(Number(id.split('.')[0])||0)%8})`;
type Drag={id:number;start:Cell;current:Cell;moved:boolean;tapOnly:boolean;x:number;y:number;pan:boolean;rect:DOMRect};
export function Board({board,strokes,paused=false,readOnly=false,zoom=false,hint,onCommit,onPreview}:{board:Pick<Puzzle,'grid'|'size'>;strokes:Stroke[];paused?:boolean;readOnly?:boolean;zoom?:boolean;hint?:Cell|null;onCommit:(a:Cell,b:Cell)=>void;onPreview?:(text:string)=>void}){
 const initialFound=useRef(new Set(strokes.map(s=>s.id)));
 const ref=useRef<HTMLDivElement>(null),drag=useRef<Drag|null>(null),frame=useRef(0),pending=useRef<Cell[]|null>(null);
 const [anchor,setAnchor]=useState<Cell|null>(null),[preview,setPreview]=useState<Cell[]>([]),[cursor,setCursor]=useState<Cell>([0,0]),[focused,setFocused]=useState(false);
 const n=board.size,disabled=useRef(paused||readOnly);disabled.current=paused||readOnly;
 const signature=board.grid.map(row=>row.join('')).join('|');
 const same=(a:Cell,b:Cell)=>a[0]===b[0]&&a[1]===b[1];
 const clear=()=>{drag.current=null;pending.current=null;cancelAnimationFrame(frame.current);frame.current=0;setAnchor(null);setPreview([]);onPreview?.('');};
 const clearRef=useRef(clear);clearRef.current=clear;
 useEffect(()=>{
  const blur=()=>clearRef.current(),visibility=()=>{if(document.hidden)clearRef.current();};
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  return ()=>{window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{if(paused||readOnly)clear();},[paused,readOnly]);
 useEffect(()=>{clear();},[signature,zoom]);
 useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
 useEffect(()=>{const element=ref.current;if(!element)return;let width=element.clientWidth,height=element.clientHeight;const observer=new ResizeObserver(()=>{const nextWidth=element.clientWidth,nextHeight=element.clientHeight;if(width!==nextWidth||height!==nextHeight){width=nextWidth;height=nextHeight;clear();}});observer.observe(element);return ()=>observer.disconnect();},[]);
 const cellAt=(x:number,y:number,rect=drag.current?.rect??ref.current!.getBoundingClientRect()):Cell=>[Math.max(0,Math.min(n-1,Math.floor((y-rect.top)/rect.height*n))),Math.max(0,Math.min(n-1,Math.floor((x-rect.left)/rect.width*n)))];
 const show=(cells:Cell[])=>{setPreview(cells);onPreview?.(cells.map(([r,c])=>board.grid[r]![c]).join(''));};
 const schedule=(cells:Cell[])=>{pending.current=cells;if(frame.current)return;frame.current=requestAnimationFrame(()=>{frame.current=0;if(pending.current&&!disabled.current)show(pending.current);pending.current=null;});};
 const commit=(a:Cell,b:Cell)=>{clear();if(!disabled.current&&!same(a,b))onCommit(a,b);};
 const tap=(cell:Cell)=>{if(disabled.current)return;if(anchor){if(same(anchor,cell))clear();else{const cells=snapLine(anchor,cell,n);commit(anchor,cells.at(-1)!);}}else{setAnchor(cell);show([cell]);}};
 const down=(e:PointerEvent)=>{
  if(disabled.current||drag.current||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  const rect=ref.current!.getBoundingClientRect(),start=cellAt(e.clientX,e.clientY,rect),tapOnly=zoom&&e.pointerType!=='mouse';
  drag.current={id:e.pointerId,start,current:start,moved:false,tapOnly,x:e.clientX,y:e.clientY,pan:false,rect};
  if(!tapOnly){e.preventDefault();ref.current?.setPointerCapture(e.pointerId);if(!anchor)show([start]);}
  const at=performance.now();requestAnimationFrame(()=>track('input_feedback',performance.now()-at));
 };
 const move=(e:PointerEvent)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;if(disabled.current)return clear();if(d.tapOnly){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)d.pan=true;return;}const cell=cellAt(e.clientX,e.clientY);if(same(d.current,cell))return;d.current=cell;if(!same(d.start,cell))d.moved=true;if(d.moved){setAnchor(null);schedule(snapLine(d.start,cell,n));}};
 const up=(e:PointerEvent)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const cell=cellAt(e.clientX,e.clientY);drag.current=null;if(disabled.current)return clear();if(d.tapOnly){if(!d.pan&&same(cell,d.start))tap(d.start);}else if(d.moved){const cells=snapLine(d.start,cell,n);commit(d.start,cells.at(-1)!);}else tap(d.start);};
 const cancel=(e:PointerEvent)=>{if(drag.current?.id===e.pointerId)clear();};
 const key=(e:KeyboardEvent)=>{if(paused)return;const dirs:Record<string,Cell>={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};const dir=dirs[e.key];if(dir){e.preventDefault();const next:Cell=[Math.max(0,Math.min(n-1,cursor[0]+dir[0])),Math.max(0,Math.min(n-1,cursor[1]+dir[1]))];setCursor(next);if(anchor&&!disabled.current)show(snapLine(anchor,next,n));}else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!disabled.current)tap(cursor);}else if(e.key==='Escape')clear();};
 const line=(a:Cell,b:Cell)=>({x1:a[1]+.5,y1:a[0]+.5,x2:b[1]+.5,y2:b[0]+.5});
 const selectedCells=new Set(preview.map(([r,c])=>`${r},${c}`));
 const grid=useMemo(()=>board.grid.flatMap((row,r)=>row.map((ch,c)=><span data-cell={`${r},${c}`} className={selectedCells.has(`${r},${c}`)?'letter-selected':undefined} key={`${r},${c}`}>{paused?'·':ch}</span>)),[signature,paused,preview]);
 return <div className={'board-scroll'+(zoom?' zoomed':'')}><div ref={ref} className={"letter-board"+(strokes.length?" has-found":"")} role="application" aria-label={paused?'Kelime tahtası duraklatıldı. Hazır olduğunda devam et.':`${readOnly?'Keşif tamamlandı. İnceleme tahtası. Klavyede oklarla harfleri incele.':'Kelime tahtası. Kaydır veya ilk ve son harfe dokun. Klavyede oklar ve Enter ile seç.'} ${focused?`${cursor[0]+1}. satır, ${cursor[1]+1}. sütun: ${board.grid[cursor[0]]?.[cursor[1]]??''}.`:''}`} tabIndex={paused?-1:0} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);clear();}} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={cancel} onContextMenu={e=>e.preventDefault()} style={{'--n':n,width:zoom?`${n*46}px`:'100%',touchAction:zoom||readOnly?'pan-x pan-y':'none'} as CSSProperties}>
  <svg viewBox={`0 0 ${n} ${n}`} className="board-ink" aria-hidden="true">{!paused&&strokes.map(s=><line key={s.id} className={'found-stroke'+(!initialFound.current.has(s.id)?' is-new':'')} {...line(s.a,s.b)} stroke={strokeColor(s.id)} strokeWidth=".76" strokeLinecap="round"/>)}{!paused&&preview.length>0&&<line {...line(preview[0]!,preview.at(-1)!)} stroke="var(--selection)" strokeWidth=".83" strokeLinecap="round"/>}{!paused&&preview.length>0&&<g className="selection-ends" fill="none" stroke="#244b36" strokeWidth=".055"><circle cx={preview[0]![1]+.5} cy={preview[0]![0]+.5} r=".37"/>{preview.length>1&&<circle cx={preview.at(-1)![1]+.5} cy={preview.at(-1)![0]+.5} r=".37"/>}</g>}{hint&&!paused&&!readOnly&&<circle className="hint-ring" cx={hint[1]+.5} cy={hint[0]+.5} r=".42" fill="none" stroke="#a94d2e" strokeWidth=".075"/>}{focused&&!paused&&<rect x={cursor[1]+.07} y={cursor[0]+.07} width=".86" height=".86" rx=".2" fill="none" stroke="#21574b" strokeWidth=".065"/>}</svg>
  <div className="letter-grid" aria-hidden="true">{grid}</div>{paused&&<div className="board-paused"><span>Bir nefes.</span><small>Hazır olduğunda devam et.</small></div>}
 </div></div>;
}
