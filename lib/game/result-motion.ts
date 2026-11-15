import {observeGameActivity} from '../platform/activity.ts';
import {gameIsActive} from '../platform/runtime';
import {animate, type AnimationSequence} from 'motion';

/** A disposable presentation. Nothing here writes progress or delays navigation. */
export function playResultSequence(root:HTMLElement){
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
 const cancel=()=>playback.cancel();
 const stopActivity=observeGameActivity(document,window,gameIsActive,active=>{if(!active)cancel();});
 const preference=()=>{if(reduced())cancel();};
 const observer=new MutationObserver(preference);
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
 window.addEventListener('blur',cancel);
 motion.addEventListener('change',preference);
 return()=>{cancel();observer.disconnect();stopActivity();window.removeEventListener('blur',cancel);motion.removeEventListener('change',preference);};
}
