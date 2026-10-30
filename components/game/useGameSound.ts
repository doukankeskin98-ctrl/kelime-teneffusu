'use client';
import {useEffect,useRef} from 'react';
import {GameSound,type SoundCue} from '@/lib/game/sound';
export type SoundAction=SoundCue|boolean|'enable'|'mute';
/** Booleans preserve the existing success/completion callers and haptic preference. */
export function useChime(enabled:boolean,haptics=false){
 const engine=useRef<GameSound|null>(null),alive=useRef(true),settings=useRef({enabled,haptics});
 settings.current={enabled,haptics};
 const get=()=>{const sound=engine.current??=new GameSound();sound.setEnabled(settings.current.enabled);sound.setVisible(!document.hidden);return sound;};
 useEffect(()=>{
  alive.current=true;
  const unlock=(event:Event)=>{if(event.isTrusted&&settings.current.enabled)get().unlock();};
  const hide=()=>engine.current?.setVisible(!document.hidden);
  document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,true);document.addEventListener('click',unlock,true);document.addEventListener('visibilitychange',hide);
  return ()=>{alive.current=false;document.removeEventListener('pointerdown',unlock,true);document.removeEventListener('keydown',unlock,true);document.removeEventListener('click',unlock,true);document.removeEventListener('visibilitychange',hide);engine.current?.dispose();engine.current=null;};
 },[]);
 useEffect(()=>{engine.current?.setEnabled(enabled);},[enabled]);
 return (action:SoundAction=false)=>{
  if(!alive.current)return;
  if(action==='mute'){settings.current.enabled=false;engine.current?.setEnabled(false);return;}
  if(action==='enable')settings.current.enabled=true; // Only explicit sound-toggle/preview handlers use this.
  const cue:SoundCue=action==='enable'?'start':typeof action==='boolean'?(action?'complete':'word'):action;
  if(document.hidden)return;
  if(settings.current.haptics&&(cue==='word'||cue==='complete'||cue==='reveal')){
   try{if(typeof navigator.vibrate==='function')navigator.vibrate(cue==='word'?9:[12,45,18]);}catch{}
  }
  if(settings.current.enabled){const sound=get();if(action==='enable')sound.unlock();sound.play(cue);}
 };
}
