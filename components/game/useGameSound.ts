'use client';
import {useEffect,useRef} from 'react';
import {GameSound,type SoundCue} from '@/lib/game/sound';
export type SoundAction=SoundCue|boolean|'enable'|'mute';
// The document keeps one audio context across Solo/Arena/settings transitions.
// Closing it on every component unmount loses iOS activation and races the next screen.
let sharedEngine:GameSound|null=null;
/** Booleans preserve the existing success/completion callers and haptic preference. */
export function useChime(enabled:boolean,haptics=false){
 const engine=useRef<GameSound|null>(null),alive=useRef(true),pageActive=useRef(true),settings=useRef({enabled,haptics});
 settings.current={enabled,haptics};
 const get=()=>{const sound=engine.current??=(sharedEngine??=new GameSound());sound.setEnabled(settings.current.enabled);sound.setVisible(!document.hidden&&pageActive.current);return sound;};
 useEffect(()=>{
  alive.current=true;
  const unlock=(event:Event)=>{if(event.isTrusted&&settings.current.enabled)get().unlock();};
  const hide=()=>engine.current?.setVisible(!document.hidden);
  const pageHide=()=>{pageActive.current=false;engine.current?.setVisible(false);};
  const pageShow=()=>{pageActive.current=true;engine.current?.setVisible(!document.hidden);};
  const gestures=['pointerdown','pointerup','touchstart','touchend','mousedown','keydown','click'];
  for(const type of gestures)document.addEventListener(type,unlock,{capture:true,passive:true});
  document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',pageHide);window.addEventListener('pageshow',pageShow);
  return ()=>{alive.current=false;for(const type of gestures)document.removeEventListener(type,unlock,true);document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',pageHide);window.removeEventListener('pageshow',pageShow);engine.current?.stop();engine.current=null;};
 },[]);
 useEffect(()=>{engine.current?.setEnabled(enabled);},[enabled]);
 return (action:SoundAction=false)=>{
  if(!alive.current)return;
  if(action==='mute'){settings.current.enabled=false;engine.current?.setEnabled(false);return;}
  if(action==='enable')settings.current.enabled=true; // Only explicit sound-toggle/preview handlers use this.
  const cue:SoundCue=action==='enable'?'start':typeof action==='boolean'?(action?'complete':'word'):action;
  if(document.hidden||!pageActive.current)return;
  if(settings.current.haptics&&(cue==='word'||cue==='complete'||cue==='reveal')){
   try{if(typeof navigator.vibrate==='function')navigator.vibrate(cue==='word'?9:[12,45,18]);}catch{}
  }
  if(settings.current.enabled){const sound=get();if(action==='enable')sound.unlock();sound.play(cue);}
 };
}
