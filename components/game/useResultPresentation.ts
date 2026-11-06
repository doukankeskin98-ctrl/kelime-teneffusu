'use client';
import {useEffect,useRef,useState} from 'react';
import {gameIsActive} from '@/lib/platform/runtime';
import {WORD_RESULT_DELAY_MS,RESULT_EXIT_MS} from '@/lib/game/word-feedback';

/** Decorative only: official completion and progress never wait for this clock. */
export function useResultPresentation(done:boolean,scope:string){
 const [presentation,setPresentation]=useState({scope,startedAt:null as number|null,exiting:false});
 const latest=useRef(presentation),preparedScope=useRef<string|null>(null);latest.current=presentation;
 const waiting=presentation.scope===scope&&presentation.startedAt!==null;
 if(presentation.scope!==scope){preparedScope.current=null;setPresentation({scope,startedAt:null,exiting:false});}
 useEffect(()=>{
  if(!waiting)return;
  const finish=()=>{latest.current={scope,startedAt:null,exiting:false};setPresentation(latest.current);};
  const hide=()=>{if(document.hidden||!gameIsActive())finish();};
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced=()=>motion.matches||document.documentElement.dataset['reduceMotion']==='true';
  const changed=()=>{if(reduced())finish();};
  if(document.hidden||!gameIsActive()||reduced()){finish();return;}
  let exitTimer:ReturnType<typeof setTimeout>|undefined,timer:ReturnType<typeof setTimeout>|undefined;
  // Subscribe while the ACK is still pending too: hidden/cancelled flights never replay.
  document.addEventListener('visibilitychange',hide);
  window.addEventListener('pagehide',finish);
  motion.addEventListener?.('change',changed);
  if(done){
   // A slow server ACK must not restart an already running local flight.
   const remaining=Math.max(0,presentation.startedAt!+WORD_RESULT_DELAY_MS-performance.now());
   const withdraw=()=>setPresentation(p=>p.scope===scope&&p.startedAt!==null?{...p,exiting:true}:p);
   if(remaining===0)withdraw();else exitTimer=setTimeout(withdraw,remaining);
   timer=setTimeout(finish,remaining+RESULT_EXIT_MS);
  }
  return ()=>{clearTimeout(timer);clearTimeout(exitTimer);document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',finish);motion.removeEventListener?.('change',changed);};
 },[done,waiting,scope,presentation.startedAt]);
 const prepare=(flight=true)=>{
  preparedScope.current=scope;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset['reduceMotion']==='true';
  latest.current={scope,startedAt:!reduce&&!document.hidden&&gameIsActive()?performance.now()-(flight?0:WORD_RESULT_DELAY_MS):null,exiting:false};setPresentation(latest.current);
 };
 const skip=()=>{latest.current={scope,startedAt:null,exiting:false};setPresentation(latest.current);};
 const isPending=()=>latest.current.scope===scope&&latest.current.startedAt!==null;
 const wasPrepared=()=>preparedScope.current===scope;
 return {ready:done&&!waiting,isPending,wasPrepared,departing:done&&waiting&&presentation.exiting,prepare,skip};
}
