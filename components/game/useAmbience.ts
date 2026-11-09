'use client';
import {useEffect,useRef} from 'react';
import {GameAmbience} from '@/lib/game/ambience';
import {observeGameActivity} from '@/lib/platform/activity';
import {gameIsActive} from '@/lib/platform/runtime';

/** One optional ambience engine across the app, independent of effect/haptic settings. */
export function useAmbience(enabled:boolean,owner:string|undefined){
 const engine=useRef<GameAmbience|null>(null),value=useRef(enabled),active=useRef(true),alive=useRef(false),liveOwner=useRef(owner);value.current=enabled;liveOwner.current=owner;
 useEffect(()=>{
  alive.current=true;const sound=new GameAmbience();engine.current=sound;sound.setEnabled(value.current);
  const unobserve=observeGameActivity(document,window,gameIsActive,v=>{active.current=v;sound.setVisible(v);});
  const unlock=(event:Event)=>{if(event.isTrusted&&value.current&&active.current){sound.setEnabled(true);sound.unlock();}};
  const events=['pointerdown','touchend','keydown','click'];for(const name of events)document.addEventListener(name,unlock,{capture:true,passive:true});
  return ()=>{alive.current=false;unobserve();for(const name of events)document.removeEventListener(name,unlock,true);sound.dispose();if(engine.current===sound)engine.current=null;};
 },[owner]);
 useEffect(()=>{engine.current?.setEnabled(enabled);},[enabled]);
 return (next:boolean)=>{if(liveOwner.current!==owner)return;value.current=next;if(!alive.current)return;engine.current?.setEnabled(next);if(next&&active.current&&!document.hidden&&gameIsActive())engine.current?.unlock();};
}
