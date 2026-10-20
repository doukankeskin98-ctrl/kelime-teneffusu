'use client';
import {useEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent} from 'react';
import {snapLine,type Cell,type Puzzle,type Stroke} from '@/lib/game/engine';
const COLORS=['#e7bc59','#83b7a2','#c797bc','#8bafce','#dca18b','#aaad76','#91bfc1','#c8a6ce'];
export const strokeColor=(id:string)=>COLORS[(Number(id.split('.')[0])||0)%COLORS.length]!;
type Drag={id:number;start:Cell;current:Cell;moved:boolean;tapOnly:boolean;x:number;y:number;pan:boolean};
export function Board({board,strokes,paused=false,zoom=false,hint,onCommit,onPreview}:{board:Pick<Puzzle,'grid'|'size'>;strokes:Stroke[];paused?:boolean;zoom?:boolean;hint?:Cell|null;onCommit:(a:Cell,b:Cell)=>void;onPreview?:(text:string)=>void}){
 const ref=useRef<HTMLDivElement>(null),drag=useRef<Drag|null>(null),[anchor,setAnchor]=useState<Cell|null>(null),[preview,setPreview]=useState<Cell[]>([]),[cursor,setCursor]=useState<Cell>([0,0]),[focused,setFocused]=useState(false);
 const n=board.size,disabled=useRef(paused);disabled.current=paused;
 const signature=board.grid.map(row=>row.join('')).join('|');
 const clear=()=>{drag.current=null;setAnchor(null);setPreview([]);onPreview?.('');};
 useEffect(()=>{if(paused)clear();},[paused]);
 useEffect(()=>{clear();},[signature,zoom]);
 const same=(a:Cell,b:Cell)=>a[0]===b[0]&&a[1]===b[1];
 const cellAt=(x:number,y:number):Cell=>{const rect=ref.current!.getBoundingClientRect();return [Math.max(0,Math.min(n-1,Math.floor((y-rect.top)/rect.height*n))),Math.max(0,Math.min(n-1,Math.floor((x-rect.left)/rect.width*n)))];};
 const show=(cells:Cell[])=>{setPreview(cells);onPreview?.(cells.map(([r,c])=>board.grid[r]![c]).join(''));};
 const commit=(a:Cell,b:Cell)=>{clear();if(!disabled.current&&!same(a,b))onCommit(a,b);};
 const tap=(cell:Cell)=>{if(anchor){if(same(anchor,cell))clear();else{const cells=snapLine(anchor,cell,n);commit(anchor,cells.at(-1)!);}}else{setAnchor(cell);show([cell]);}};
 const down=(e:PointerEvent)=>{
   if(paused||drag.current||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
   const start=cellAt(e.clientX,e.clientY),tapOnly=zoom&&e.pointerType!=='mouse';
   drag.current={id:e.pointerId,start,current:start,moved:false,tapOnly,x:e.clientX,y:e.clientY,pan:false};
   if(!tapOnly){e.preventDefault();ref.current?.setPointerCapture(e.pointerId);}
 };
 const move=(e:PointerEvent)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;if(d.tapOnly){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)d.pan=true;return;}const cell=cellAt(e.clientX,e.clientY);if(same(d.current,cell))return;d.current=cell;if(!same(d.start,cell))d.moved=true;if(d.moved)show(snapLine(d.start,cell,n));};
 const up=(e:PointerEvent)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(paused)return clear();if(d.tapOnly){if(!d.pan&&same(cellAt(e.clientX,e.clientY),d.start))tap(d.start);}else if(d.moved){const cells=snapLine(d.start,cellAt(e.clientX,e.clientY),n);commit(d.start,cells.at(-1)!);}else tap(d.start);};
 const cancel=(e:PointerEvent)=>{if(drag.current?.id===e.pointerId)clear();};
 const key=(e:KeyboardEvent)=>{if(paused)return;const dirs:Record<string,Cell>={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};const dir=dirs[e.key];if(dir){e.preventDefault();const next:Cell=[Math.max(0,Math.min(n-1,cursor[0]+dir[0])),Math.max(0,Math.min(n-1,cursor[1]+dir[1]))];setCursor(next);if(anchor)show(snapLine(anchor,next,n));}else if(e.key==='Enter'||e.key===' '){e.preventDefault();tap(cursor);}else if(e.key==='Escape')clear();};
 const line=(a:Cell,b:Cell)=>({x1:a[1]+.5,y1:a[0]+.5,x2:b[1]+.5,y2:b[0]+.5});
 return <div className={'board-scroll'+(zoom?' zoomed':'')}><div ref={ref} className="letter-board" role="application" aria-label="Kelime tahtası. Kaydır veya ilk ve son harfe dokun. Klavyede oklar ve Enter ile seç." tabIndex={paused?-1:0} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);clear();}} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={cancel} onContextMenu={e=>e.preventDefault()} style={{'--n':n,width:zoom?`${n*44}px`:'100%',touchAction:zoom?'pan-x pan-y':'none'} as CSSProperties}>
  <svg viewBox={`0 0 ${n} ${n}`} className="board-ink" aria-hidden="true">{!paused&&strokes.map(s=><line key={s.id} {...line(s.a,s.b)} stroke={strokeColor(s.id)} strokeWidth=".79" strokeLinecap="round"/>)}{!paused&&preview.length>0&&<line {...line(preview[0]!,preview.at(-1)!)} stroke="#e5be5f" strokeWidth=".82" strokeLinecap="round"/>}{hint&&!paused&&<circle className="hint-ring" cx={hint[1]+.5} cy={hint[0]+.5} r=".42" fill="none" stroke="#be5b35" strokeWidth=".065"/>}{focused&&!paused&&<rect x={cursor[1]+.08} y={cursor[0]+.08} width=".84" height=".84" rx=".2" fill="none" stroke="#21574b" strokeWidth=".06"/>}</svg>
  <div className="letter-grid" aria-hidden="true">{board.grid.flatMap((row,r)=>row.map((ch,c)=><span data-cell={`${r},${c}`} key={`${r},${c}`}>{paused?'·':ch}</span>))}</div>
  {paused&&<div className="board-paused"><span>Bir nefes.</span><small>Hazır olduğunda devam et.</small></div>}
 </div></div>;
}
