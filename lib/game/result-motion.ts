import {observeGameActivity} from '../platform/activity.ts';
import {gameIsActive} from '../platform/runtime';
import {animate, type AnimationSequence} from 'motion';

/** A disposable presentation. Nothing here writes progress or delays navigation. */
export function playResultSequence(root:HTMLElement,traceBoard=false){
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const reduced=()=>motion.matches||document.documentElement.dataset['reduceMotion']==='true';
 if(reduced()||document.hidden||!gameIsActive())return ()=>{};
 const sequence:AnimationSequence=[];
 root.querySelectorAll<HTMLElement>('.result-star.earned').forEach((star,index)=>{
  sequence.push([star,{transform:['scale(.62) rotate(-12deg)','scale(1.08) rotate(2deg)','scale(1) rotate(0deg)'],opacity:[0,1,1]},{at:index*.085,duration:.32,ease:[.16,1,.3,1]}]);
 });
 const portrait=root.querySelector<HTMLElement>('.result-world-art');
 if(portrait)sequence.push([portrait,{transform:['scale(.88)','scale(1)'],opacity:[.45,1]},{at:.18,duration:.38,ease:[.16,1,.3,1]}]);
 const piece=root.querySelector<SVGElement>('.world-piece.just-earned');
 if(piece)sequence.push([piece,{opacity:[0,1]},{at:.5,duration:.2}]);
 const stamp=root.querySelector<HTMLElement>('.result-world-count');
 if(stamp)sequence.push([stamp,{transform:['translateX(-50%) translateY(8px) scale(.85)','translateX(-50%) translateY(0) scale(1)'],opacity:[0,1]},{at:.52,duration:.26,ease:[.16,1,.3,1]}]);
 const caption=root.querySelector<HTMLElement>('.result-world-caption');
 if(caption)sequence.push([caption,{opacity:[0,1]},{at:.62,duration:.16}]);
 if(!sequence.length)return ()=>{};
 const playback=animate(sequence);
 // CSS is the final state: cancellation immediately restores it, even mid-flight.
 const traces:HTMLElement[]=[];
 let frame=0;
 if(traceBoard&&piece)frame=requestAnimationFrame(()=>{
  const dialog=root.closest('dialog'),medal=portrait?.closest('.result-world-medallion');
  const board=document.querySelector('.chapter-play.is-celebrating .board-ink');
  if(!dialog?.open||!board||!medal||reduced()||!gameIsActive())return;
  const box=dialog.getBoundingClientRect(),dest=medal.getBoundingClientRect();
  const x=dest.left+dest.width/2,y=dest.top+dest.height/2;
  const paths=Array.from(board.querySelectorAll<SVGLineElement>('.found-stroke')).slice(-6);
  for(const [i,line] of paths.entries()){
   const matrix=line.getScreenCTM();
   if(!matrix)continue;
   const start=new DOMPoint(line.x2.baseVal.value,line.y2.baseVal.value).matrixTransform(matrix);
   const trail=document.createElement('i');
   trail.className='reward-light';trail.setAttribute('aria-hidden','true');
   trail.style.left=start.x-box.left+'px';trail.style.top=start.y-box.top+'px';
   dialog.appendChild(trail);traces.push(trail);
   const flight=trail.animate([
    {transform:'translate(-50%,-50%) scale(.65)',opacity:0},
    {opacity:1,offset:.16},
    {transform:`translate(calc(-50% + ${x-start.x}px),calc(-50% + ${y-start.y}px)) scale(.35)`,opacity:0}
   ],{duration:410,delay:i*18,easing:'cubic-bezier(.35,.05,.65,1)',fill:'both'});
   flight.onfinish=()=>trail.remove();
  }
 });
 const cancel=()=>{if(frame)cancelAnimationFrame(frame);for(const trail of traces)trail.remove();playback.cancel();};
 const dialog=root.closest?.('dialog');
 const settle=(event:Event)=>{if(!(event.target as Element).closest('button,summary,a'))cancel();};
 dialog?.addEventListener('pointerdown',settle);
 const stopActivity=observeGameActivity(document,window,gameIsActive,active=>{if(!active)cancel();});
 const preference=()=>{if(reduced())cancel();};
 const observer=new MutationObserver(preference);
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
 window.addEventListener('blur',cancel);
 motion.addEventListener('change',preference);
 return()=>{cancel();dialog?.removeEventListener('pointerdown',settle);observer.disconnect();stopActivity();window.removeEventListener('blur',cancel);motion.removeEventListener('change',preference);};
}
