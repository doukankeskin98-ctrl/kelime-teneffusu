import assert from 'node:assert/strict';
import {it} from 'node:test';
import {attachMenuFeedback} from '../lib/game/menu-feedback.ts';
import {setHapticsAdapter} from '../lib/game/haptics.ts';
import {setGameActive} from '../lib/platform/runtime.ts';
it('one semantic click handles nested icons, keyboard activation, opt-out and cleanup without scrolling pulses',()=>{
 const calls:string[]=[],doc=Object.assign(new EventTarget(),{hidden:false});let enabled=true,disabled=false,off=false,scope=true;
 const control={closest:(selector:string)=>selector.includes('letter-board')?(off?{}:null):(scope?{}:null),matches:()=>disabled};
 const icon={closest:()=>control};const click=()=>doc.dispatchEvent(Object.defineProperty(new Event('click'),'target',{value:icon}));
 setHapticsAdapter(cue=>{calls.push(cue);});const stop=attachMenuFeedback(doc as unknown as Document,()=>enabled);
 try{doc.dispatchEvent(new Event('pointerdown'));doc.dispatchEvent(new Event('pointermove'));assert.equal(calls.length,0);click();assert.deepEqual(calls,['menu']);
  disabled=true;click();disabled=false;off=true;click();off=false;scope=false;click();scope=true;enabled=false;click();enabled=true;doc.hidden=true;click();doc.hidden=false;setGameActive(false);click();setGameActive(true);assert.equal(calls.length,1);
  click();assert.equal(calls.length,2);stop();click();assert.equal(calls.length,2);
 }finally{stop();setGameActive(true);setHapticsAdapter(null);}
});
