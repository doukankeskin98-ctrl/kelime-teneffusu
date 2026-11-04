'use client';
import {useEffect,useLayoutEffect,useRef,type RefObject} from 'react';
import type {Puzzle,Stroke} from '@/lib/game/engine';
import {wordFeedbackLedger,wordFlightPlan,wordFlightFrames,wordLetterDelay,WORD_FLIGHT_MS,WORD_LANDING_MS,WORD_RESULT_DELAY_MS,type FlightRect} from '@/lib/game/word-feedback';
import {gameIsActive} from '@/lib/platform/runtime';

/** Decoration observes confirmed state; input and save callbacks never enter here. */
export function WordFeedback({root,scope,board,confirmed,turned,paused}:{root:RefObject<HTMLElement|null>;scope:string;board:Pick<Puzzle,'size'|'targets'|'grid'>;confirmed:Stroke[];turned:boolean;paused:boolean}){
 const ledger=useRef(wordFeedbackLedger(scope,confirmed.map(s=>s.id)));
 const work=useRef(new Set<()=>void>()),previousTurn=useRef(turned);
 const arrivals=useRef(new Map<HTMLElement,number>());
 const clear=()=>{for(const stop of [...work.current])stop();};
 useEffect(()=>{
  const hide=()=>{if(document.hidden||!gameIsActive())clear();},blur=()=>clear();
  document.addEventListener('visibilitychange',hide);window.addEventListener('blur',blur);window.addEventListener('pagehide',blur);window.addEventListener('orientationchange',blur);window.addEventListener('resize',blur);
  return ()=>{clear();document.removeEventListener('visibilitychange',hide);window.removeEventListener('blur',blur);window.removeEventListener('pagehide',blur);window.removeEventListener('orientationchange',blur);window.removeEventListener('resize',blur);};
 },[]);
 useLayoutEffect(()=>{
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
  const cells=Array.from(letterBoard.querySelectorAll<HTMLElement>('.letter-grid>span'));
  const measured=new Map<HTMLElement,DOMRect>();
  const measure=(element:HTMLElement)=>{let rect=measured.get(element);if(!rect){rect=element.getBoundingClientRect();measured.set(element,rect);}return rect;};
  const flights=[];
  for(const id of fresh.slice(-4)){
   const stroke=confirmed.find(s=>s.id===id),target=board.targets.find(t=>t.id===id);if(!stroke||!target)continue;
   const destination=candidates.find(el=>el.dataset['wordGroup']===String(target.group)&&measure(el).width>0)
    ??screen.querySelector<HTMLElement>('.solo-found,.game-status,.duel-scorebar,.play-hud');
   if(!destination)continue;
   const dest=measure(destination);
   let plan=wordFlightPlan(board,stroke,target,turned,rect,bounds,dest);if(!plan)continue;
   const source=cells[plan.letters[0]!.viewIndex],style=source?getComputedStyle(source):null;
   const label=Array.from(destination.querySelectorAll<HTMLElement>('[data-word-part]')).find(el=>el.dataset['wordPart']===id)
    ??Array.from(destination.querySelectorAll<HTMLElement>('[data-word-label]')).find(el=>el.textContent===target.text);
   const destinations:FlightRect[]=[];
   // Range geometry uses actual font kerning and inline positions, including Turkish letters.
   if(label?.firstChild?.nodeType===3&&label.textContent===target.text&&typeof document.createRange==='function'){
    const range=document.createRange();let offset=0;
    for(const char of target.text){range.setStart(label.firstChild,offset);offset+=char.length;range.setEnd(label.firstChild,offset);destinations.push(range.getBoundingClientRect());}
   }
   const fontSize=parseFloat(style?.fontSize??'');
   if(Number.isFinite(fontSize)&&fontSize>0){
    const targetFontSize=label?parseFloat(getComputedStyle(label).fontSize):fontSize*.65;
    plan=wordFlightPlan(board,stroke,target,turned,rect,bounds,dest,{fontSize,targetFontSize:Number.isFinite(targetFontSize)?targetFontSize:fontSize*.65,sources:plan.letters.map(l=>cells[l.viewIndex]?measure(cells[l.viewIndex]!):rect),destinations:destinations.every(r=>r.width>0&&r.height>0)?destinations:[]})!;
   }
   flights.push({...plan,destination,style:style?{fontFamily:style.fontFamily,fontWeight:style.fontWeight,color:style.color}:undefined});
  }
  for(const {fontSize,scale,letters,destination,style} of flights){
   while(work.current.size>=4)work.current.values().next().value?.();
   arrivals.current.set(destination,(arrivals.current.get(destination)??0)+1);destination.dataset['wordArriving']='true';
   let arrived=false;
   const arrive=()=>{if(arrived)return;arrived=true;const left=(arrivals.current.get(destination)??1)-1;if(left>0)arrivals.current.set(destination,left);else{arrivals.current.delete(destination);delete destination.dataset['wordArriving'];}};
   const spark=document.createElement('span');spark.className='word-flight word-flight-letters';spark.setAttribute('aria-hidden','true');screen.appendChild(spark);
   const animations:Animation[]=[];let timer:ReturnType<typeof setTimeout>|undefined,stopped=false;
   const stop=()=>{if(stopped)return;stopped=true;clearTimeout(timer);arrive();for(const animation of animations)animation.cancel();spark.remove();work.current.delete(stop);};
   work.current.add(stop);
   try{
    for(const [i,letter] of letters.entries()){
     const glyph=document.createElement('span');glyph.className='word-flight-glyph';glyph.textContent=letter.text;Object.assign(glyph.style,style,{fontSize:fontSize+'px'});spark.appendChild(glyph);
     const animation=glyph.animate(wordFlightFrames(letter,scale),{duration:WORD_FLIGHT_MS,delay:wordLetterDelay(i),easing:'linear',fill:'both'});
     if(i===letters.length-1)animation.onfinish=arrive;
     animations.push(animation);
    }
    if(destination.hasAttribute('data-word-group'))animations.push(destination.animate([{transform:'scale(1)'},{transform:'scale(1.07)',offset:.35},{transform:'scale(1)'}],{delay:WORD_FLIGHT_MS+wordLetterDelay(letters.length-1),duration:WORD_LANDING_MS,easing:'ease-out'}));
    timer=setTimeout(stop,WORD_RESULT_DELAY_MS+60);
   }catch{stop();}
  }
 },[scope,confirmed,turned,paused,board]);
 return null;
}
