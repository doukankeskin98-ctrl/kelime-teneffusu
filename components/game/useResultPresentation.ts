'use client';
import {useEffect,useState} from 'react';
import {gameIsActive} from '@/lib/platform/runtime';
import {WORD_RESULT_DELAY_MS} from '@/lib/game/word-feedback';

/** Only a locally accepted final word earns a flight; restored results are immediate. */
export function useResultPresentation(done:boolean,scope:string){
 const [presentation,setPresentation]=useState({scope,waiting:false});
 const waiting=presentation.scope===scope&&presentation.waiting;
 // Reset with the render's scope so an old timer cannot hold a different result open.
 if(presentation.scope!==scope)setPresentation({scope,waiting:false});
 useEffect(()=>{
  if(!done||!waiting)return;
  const finish=()=>setPresentation({scope,waiting:false});
  const hide=()=>{if(document.hidden||!gameIsActive())finish();};
  const timer=setTimeout(finish,WORD_RESULT_DELAY_MS);
  document.addEventListener('visibilitychange',hide);
  return ()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',hide);};
 },[done,waiting,scope]);
 const prepare=()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset['reduceMotion']==='true';
  setPresentation({scope,waiting:!reduce&&!document.hidden&&gameIsActive()});
 };
 const skip=()=>setPresentation({scope,waiting:false});
 return {ready:done&&!waiting,prepare,skip};
}
