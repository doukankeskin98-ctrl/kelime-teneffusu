'use client';
import {useEffect,useRef} from 'react';
import {Star} from 'lucide-react';
/** Presentation-only counter; saved progress and the accessible total stay authoritative. */
export function StarTotal({total,gain=0}:{total:number;gain?:number}){
 const value=useRef<HTMLSpanElement>(null),reward=useRef<HTMLElement>(null);
 useEffect(()=>{
  const number=value.current,bonus=reward.current;if(!number)return;
  number.textContent=String(total);
  if(bonus)bonus.style.opacity='1';
  const timer=setTimeout(()=>{if(bonus)bonus.style.opacity='0';},900);
  let frame=0;
  if(gain>0&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&document.documentElement.dataset['reduceMotion']!=='true'){
   const start=performance.now(),from=Math.max(0,total-gain);number.textContent=String(from);
   const tick=(now:number)=>{const t=Math.min(1,(now-start)/440);number.textContent=String(Math.round(from+(total-from)*(1-(1-t)**3)));if(t<1)frame=requestAnimationFrame(tick);};
   frame=requestAnimationFrame(tick);
  }
  return()=>{clearTimeout(timer);cancelAnimationFrame(frame);};
 },[total,gain]);
 return <span className="berrak-stars result-stars-total" data-star-total={total} aria-label={`${total} yıldız`}><Star aria-hidden="true" fill="currentColor"/><span ref={value} data-star-value aria-hidden="true">{total}</span>{gain>0&&<small ref={reward} className="result-star-gain" aria-hidden="true">+{gain}</small>}</span>;
}
