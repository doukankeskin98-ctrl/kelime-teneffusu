type View=Window&typeof globalThis;
export interface BoardPointer {pointerId:number;pointerType:string;isPrimary:boolean;button:number;clientX:number;clientY:number;preventDefault:()=>void}
interface Handlers {down:(e:BoardPointer)=>void;move:(e:BoardPointer)=>void;up:(e:BoardPointer)=>void;cancel:()=>void;pan:()=>boolean}
/** Older iOS has Touch Events but no Pointer Events. Modern browsers keep one input path. */
export function attachLegacyTouch(element:HTMLElement,handlers:()=>Handlers,view:View){
 if(typeof view.PointerEvent==='function')return ()=>{};
 let active:number|null=null;
 const event=(touch:Touch,native:TouchEvent):BoardPointer=>({pointerId:touch.identifier,pointerType:'touch',isPrimary:true,button:0,clientX:touch.clientX,clientY:touch.clientY,preventDefault:()=>{if(native.cancelable)native.preventDefault();}});
 const cancel=()=>{active=null;handlers().cancel();};
 const start=(e:TouchEvent)=>{if(e.touches.length!==1){cancel();return;}const touch=e.changedTouches[0];if(!touch)return;active=touch.identifier;handlers().down(event(touch,e));};
 const move=(e:TouchEvent)=>{if(e.touches.length!==1){cancel();return;}const touch=Array.from(e.touches).find(t=>t.identifier===active);if(!touch)return;if(!handlers().pan()&&e.cancelable)e.preventDefault();handlers().move(event(touch,e));};
 const end=(e:TouchEvent)=>{const touch=Array.from(e.changedTouches).find(t=>t.identifier===active);active=null;if(touch)handlers().up(event(touch,e));};
 element.addEventListener('touchstart',start,{passive:false});element.addEventListener('touchmove',move,{passive:false});element.addEventListener('touchend',end);element.addEventListener('touchcancel',cancel);
 return ()=>{element.removeEventListener('touchstart',start);element.removeEventListener('touchmove',move);element.removeEventListener('touchend',end);element.removeEventListener('touchcancel',cancel);};
}

/** Native dialog where supported; otherwise the same content, focus trap and close action. */
export function openGameDialog(dialog:HTMLDialogElement,onClose:()=>void,view:View){
 const doc=dialog.ownerDocument,previous=doc.activeElement as HTMLElement|null,overflow=doc.body.style.overflow;let disposed=false;
 const native=typeof dialog.showModal==='function';let overlay:HTMLDivElement|null=null;
 if(native){if(!dialog.open)dialog.showModal();}else{
  dialog.setAttribute('open','');dialog.classList.add('dialog-fallback');
  overlay=doc.createElement('div');overlay.className='dialog-fallback-backdrop';overlay.setAttribute('aria-hidden','true');overlay.addEventListener('click',onClose);doc.body.appendChild(overlay);
 }
 doc.body.style.overflow='hidden';
 const fit=()=>{if(disposed)return;const viewport=view.visualViewport,height=viewport?.height||view.innerHeight;dialog.style.maxHeight=Math.max(100,Math.floor(height-24))+'px';if(!native)dialog.style.top=Math.max(12,(viewport?.offsetTop||0)+(height-dialog.getBoundingClientRect().height)/2)+'px';};
 const focusable=()=>Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')).filter(node=>node.getClientRects().length>0);
 const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}else if(e.key==='Tab'){
  const items=focusable(),first=items[0],last=items[items.length-1];if(!first){e.preventDefault();dialog.focus();return;}
  if(e.shiftKey&&(doc.activeElement===first||doc.activeElement===dialog)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(doc.activeElement===last||doc.activeElement===dialog)){e.preventDefault();first.focus();}
 }};
 if(!native){dialog.addEventListener('keydown',key);dialog.tabIndex=-1;dialog.focus();}
 const observer=typeof view.ResizeObserver==='function'?new view.ResizeObserver(fit):null;observer?.observe(dialog);
 const mutation=typeof view.MutationObserver==='function'?new view.MutationObserver(fit):null;mutation?.observe(dialog,{subtree:true,childList:true,characterData:true});doc.fonts?.ready.then(fit);
 view.addEventListener('resize',fit);view.addEventListener('orientationchange',fit);view.visualViewport?.addEventListener('resize',fit);fit();
 return ()=>{disposed=true;observer?.disconnect();mutation?.disconnect();view.removeEventListener('resize',fit);view.removeEventListener('orientationchange',fit);view.visualViewport?.removeEventListener('resize',fit);dialog.removeEventListener('keydown',key);overlay?.remove();if(native&&dialog.open)dialog.close();dialog.removeAttribute('open');doc.body.style.overflow=overflow;if(previous?.isConnected){try{previous.focus({preventScroll:true});}catch{previous.focus();}}};
}
