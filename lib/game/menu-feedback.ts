import {playHaptic} from './haptics.ts';
import {gameIsActive} from '../platform/runtime.ts';
/** One semantic activation, including keyboard, never a scroll/pointer-down pulse. */
export function attachMenuFeedback(doc:Document,enabled:()=>boolean){
 const click=(event:Event)=>{
  if(doc.hidden||!gameIsActive()||!enabled())return;
  const target=event.target as Element|null;
  const control=target?.closest?.('button,a[href],summary,[role="switch"]');
  if(!control||!control.closest('.app-shell,.game-app,dialog')||control.closest('.letter-board,[data-haptic="off"]'))return;
  if(control.matches(':disabled,[aria-disabled="true"]'))return;
  playHaptic('menu',true);
 };
 doc.addEventListener('click',click,{capture:true});
 return ()=>doc.removeEventListener('click',click,{capture:true});
}
