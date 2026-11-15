'use client';
import {useEffect,useLayoutEffect,useRef,useCallback} from 'react';
import {match,type Cell,type Puzzle,type Stroke} from '@/lib/game/engine';
import {playPraiseLedger,PRAISE_VISIBLE_MS} from '@/lib/game/play-praise';
import {observeGameActivity} from '@/lib/platform/activity';
import {gameIsActive} from '@/lib/platform/runtime';

/** Deliberately independent of pointer movement, flights, audio and scoring. */
export function usePlayPraise({scope,board,confirmed,unavailable,terminal,hint,demonstration}:{scope:string;board:Pick<Puzzle,'size'|'grid'|'targets'>;confirmed:Stroke[];unavailable:boolean;terminal:boolean;hint?:Cell|null;demonstration?:{a:Cell;b:Cell}|null}){
 const ledger=useRef(playPraiseLedger(confirmed)),currentScope=useRef(scope);
 const node=useRef<HTMLSpanElement>(null),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const active=useRef(true);
 const dismiss=useCallback(()=>{clearTimeout(timer.current);timer.current=undefined;if(node.current)node.current.hidden=true;},[]);
 const interrupt=useCallback(()=>{ledger.current.interrupt();dismiss();},[dismiss]);
 useEffect(()=>{
  const stop=observeGameActivity(document,window,gameIsActive,value=>{active.current=value;if(!value)interrupt();});
  window.addEventListener('blur',interrupt);
  return()=>{stop();window.removeEventListener('blur',interrupt);clearTimeout(timer.current);};
 },[interrupt]);
 useLayoutEffect(()=>{
  if(currentScope.current!==scope){currentScope.current=scope;ledger.current=playPraiseLedger(confirmed);dismiss();}
  if(unavailable||terminal)interrupt();
 },[scope,confirmed,unavailable,terminal,dismiss,interrupt]);
 const help=hint??demonstration?.a,helpRow=help?.[0],helpColumn=help?.[1];
 useLayoutEffect(()=>{if(helpRow!==undefined&&helpColumn!==undefined){ledger.current.assist([helpRow,helpColumn]);dismiss();}},[scope,helpRow,helpColumn,dismiss]);
 useLayoutEffect(()=>{
  const text=ledger.current.confirm(confirmed,performance.now(),board.size,active.current&&!document.hidden&&gameIsActive()&&!unavailable,terminal);
  if(!text||!node.current?.firstElementChild)return;
  dismiss();node.current.firstElementChild.textContent=text;node.current.hidden=false;timer.current=setTimeout(dismiss,PRAISE_VISIBLE_MS);
 },[confirmed,scope,unavailable,terminal,board.size,dismiss]);
 return {
  attempt(a:Cell,b:Cell){
   dismiss();
   if(!unavailable&&!terminal&&active.current&&!document.hidden&&gameIsActive())ledger.current.attempt(a,b,performance.now(),!!match(board,a,b));
  },
  dismiss,interrupt,
  element:<span ref={node} className="play-praise" aria-hidden="true" hidden><strong/></span>,
 };
}
