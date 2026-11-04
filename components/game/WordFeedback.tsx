'use client';
import {useEffect,useRef,type RefObject} from 'react';
import type {Puzzle,Stroke} from '@/lib/game/engine';
import {wordFeedbackLedger} from '@/lib/game/word-feedback';
import {viewCell} from '@/lib/game/board-view';
import {gameIsActive} from '@/lib/platform/runtime';

/** Decoration observes confirmed state; input and save callbacks never enter here. */
export function WordFeedback({root,scope,board,confirmed,turned,paused}:{root:RefObject<HTMLElement|null>;scope:string;board:Pick<Puzzle,'size'|'targets'>;confirmed:Stroke[];turned:boolean;paused:boolean}){
 const ledger=useRef(wordFeedbackLedger(scope,confirmed.map(s=>s.id)));
 const work=useRef(new Set<()=>void>()),previousTurn=useRef(turned);
 const clear=()=>{for(const stop of [...work.current])stop();};
 useEffect(()=>{
  const hide=()=>{if(document.hidden||!gameIsActive())clear();},blur=()=>clear();
  document.addEventListener('visibilitychange',hide);window.addEventListener('blur',blur);window.addEventListener('pagehide',blur);window.addEventListener('orientationchange',blur);
  return ()=>{clear();document.removeEventListener('visibilitychange',hide);window.removeEventListener('blur',blur);window.removeEventListener('pagehide',blur);window.removeEventListener('orientationchange',blur);};
 },[]);
 useEffect(()=>{
  const changedTurn=previousTurn.current!==turned;previousTurn.current=turned;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset['reduceMotion']==='true';
  const visible=!paused&&!changedTurn&&!document.hidden&&gameIsActive();
  const fresh=ledger.current.consume(scope,confirmed.map(s=>s.id),visible);
  if(!visible||reduced){clear();return;}
  if(!fresh.length)return;
  const screen=root.current,letterBoard=screen?.querySelector<HTMLElement>('.letter-board');
  if(!screen||!letterBoard||typeof letterBoard.animate!=='function')return;
  const bounds=screen.getBoundingClientRect(),rect=letterBoard.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  // Read all destinations before appending effects; rapid confirmations share a layout.
  const candidates=Array.from(screen.querySelectorAll<HTMLElement>('[data-word-group]'));
  const measured=new Map<HTMLElement,DOMRect>();
  const measure=(element:HTMLElement)=>{let rect=measured.get(element);if(!rect){rect=element.getBoundingClientRect();measured.set(element,rect);}return rect;};
  const flights=[];
  for(const id of fresh.slice(-4)){
   const stroke=confirmed.find(s=>s.id===id),target=board.targets.find(t=>t.id===id);if(!stroke||!target)continue;
   const end=viewCell(stroke.b,board.size,turned);
   const destination=candidates.find(el=>el.dataset['wordGroup']===String(target.group)&&measure(el).width>0)
    ??screen.querySelector<HTMLElement>('.solo-found,.game-status,.duel-scorebar,.play-hud');
   if(!destination)continue;
   const dest=measure(destination);
   const x=rect.left-bounds.left+(end[1]+.5)*rect.width/board.size,y=rect.top-bounds.top+(end[0]+.5)*rect.height/board.size;
   const tx=dest.left-bounds.left+dest.width/2,ty=dest.top-bounds.top+dest.height/2;
   const label=board.targets.filter(t=>t.group===target.group).every(t=>confirmed.some(s=>s.id===t.id))?target.label:target.text;
   flights.push({x,y,tx,ty,label,destination});
  }
  for(const {x,y,tx,ty,label,destination} of flights){
   while(work.current.size>=4)work.current.values().next().value?.();
   const spark=document.createElement('span');spark.className='word-flight word-flight-label';spark.textContent=label;spark.setAttribute('aria-hidden','true');screen.appendChild(spark);
   const animations:Animation[]=[];let timer:ReturnType<typeof setTimeout>|undefined,stopped=false;
   const stop=()=>{if(stopped)return;stopped=true;clearTimeout(timer);for(const animation of animations)animation.cancel();spark.remove();work.current.delete(stop);};
   work.current.add(stop);
   try{
    animations.push(spark.animate([
     {transform:`translate(${x}px,${y}px) translate(-50%,-50%) scale(.8)`,opacity:0,offset:0},
     {transform:`translate(${x}px,${y}px) translate(-50%,-50%) scale(1.06)`,opacity:1,offset:.12},
     {transform:`translate(${x+(tx-x)*.35}px,${Math.min(y,ty)-20}px) translate(-50%,-50%) scale(1)`,opacity:1,offset:.55},
     {transform:`translate(${tx}px,${ty}px) translate(-50%,-50%) scale(.55)`,opacity:0,offset:1},
    ],{duration:360,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}));
    if(destination.hasAttribute('data-word-group'))animations.push(destination.animate([{transform:'scale(1)'},{transform:'scale(1.045)'},{transform:'scale(1)'}],{delay:180,duration:220}));
    timer=setTimeout(stop,600);
   }catch{stop();}
  }
 },[scope,confirmed,turned,paused,board]);
 return null;
}
