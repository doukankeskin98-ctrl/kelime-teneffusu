'use client';
import {useEffect,useRef,type CSSProperties} from 'react';
import type {Cell} from '@/lib/game/engine';
import {gameIsActive} from '@/lib/platform/runtime';
/** Decorative only: no gesture callbacks, timers, haptics or progress writes. */
export function DrawGuide({size,a,b}:{size:number;a:Cell;b:Cell}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const visible=()=>{if(ref.current)ref.current.hidden=document.hidden||!gameIsActive();};
  const hide=()=>{if(ref.current)ref.current.hidden=true;};
  visible();document.addEventListener('visibilitychange',visible);window.addEventListener('pagehide',hide);window.addEventListener('blur',hide);window.addEventListener('focus',visible);window.addEventListener('pageshow',visible);
  return ()=>{document.removeEventListener('visibilitychange',visible);window.removeEventListener('pagehide',hide);window.removeEventListener('blur',hide);window.removeEventListener('focus',visible);window.removeEventListener('pageshow',visible);};
 },[]);
 const inward=(cell:Cell)=>Math.atan2(size/2-cell[0]-.5,size/2-cell[1]-.5)*180/Math.PI-45;
 const start=inward(a),delta=((inward(b)-start+540)%360)-180;
 const style={'--guide-turn-start':`${start}deg`,'--guide-turn-end':`${start+delta}deg`,'--guide-x':`${(a[1]+.5)/size*100}%`,'--guide-y':`${(a[0]+.5)/size*100}%`,'--guide-dx':`${(b[1]-a[1])/size*100}%`,'--guide-dy':`${(b[0]-a[0])/size*100}%`} as CSSProperties;
 return <div ref={ref} className="draw-guide" aria-hidden="true" style={style}>
  <svg className="draw-guide-path" viewBox={`0 0 ${size} ${size}`}><line x1={a[1]+.5} y1={a[0]+.5} x2={b[1]+.5} y2={b[0]+.5} pathLength="1" strokeWidth=".48" strokeLinecap="round"/><circle cx={a[1]+.5} cy={a[0]+.5} r=".38"/></svg>
  <div className="draw-guide-traveller"><svg className="draw-guide-hand" viewBox="-9 -5 42 48"><circle className="draw-guide-touch" cx="0" cy="3" r="8"/><path d="M-3 22V3a3 3 0 0 1 6 0v14-4a3 3 0 0 1 6 0v3-1a3 3 0 0 1 6 0v3a3 3 0 0 1 6 0v10c0 6-3 10-5 12H4c-3-3-5-6-7-9l-5-7a3 3 0 0 1 5-4l4 5"/></svg></div>
 </div>;
}
