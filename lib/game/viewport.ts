/** Preserve legibility when a short screen or enlarged text cannot fit everything. */
export function fittedBoardSize(width:number,availableHeight:number,cells:number,insets=0){
 const safeWidth=Math.max(0,Math.floor(width));
 const readableMinimum=Math.min(safeWidth,cells*22+insets);
 return Math.max(readableMinimum,Math.min(safeWidth,520,Math.floor(availableHeight)));
}

/** Height reserved by HUD, targets and controls is measured, not a device guess. */
export function fitGameFrame(width:number,height:number,overhead:number,cells:number,targetsMinimum=0,insets=0){
 const floor=Math.min(Math.max(0,Math.floor(width)),cells*22+insets);
 return {minHeight:Math.ceil(Math.max(overhead+floor,targetsMinimum)),boardSize:fittedBoardSize(width,Math.max(0,height-overhead),cells,insets)};
}

type View=Window&typeof globalThis;
const pixels=(value:string)=>Number.parseFloat(value)||0;
const set=(element:HTMLElement,name:string,value:string)=>{if(element.style.getPropertyValue(name)===value)return false;element.style.setProperty(name,value);return true;};
function box(element:HTMLElement,view:View){
 const css=view.getComputedStyle(element);
 return {css,margin:pixels(css.marginTop)+pixels(css.marginBottom),chrome:pixels(css.paddingTop)+pixels(css.paddingBottom)+pixels(css.borderTopWidth)+pixels(css.borderBottomWidth)};
}
function visibleHeight(element:HTMLElement|null,view:View){
 if(!element)return 0;const b=box(element,view);return b.css.display==='none'?0:element.getBoundingClientRect().height+b.margin;
}
function intrinsicHeight(element:HTMLElement|null,view:View){
 if(!element)return 0;const b=box(element,view);if(b.css.display==='none')return 0;
 const top=element.getBoundingClientRect().top;
 return Math.max(pixels(b.css.paddingTop)+pixels(b.css.borderTopWidth),...Array.from(element.children).map(child=>{
  const node=child as HTMLElement,css=view.getComputedStyle(node);return css.display==='none'?0:node.getBoundingClientRect().bottom-top+pixels(css.marginBottom);
 }))+pixels(b.css.paddingBottom)+pixels(b.css.borderBottomWidth)+b.margin;
}

/** Independent of flex/grid's allocated stage height: Safari may stretch that track.
 * Use real header/target/control boxes, including borders, margins and wrapper padding. */
export function measurePlayFrame(screen:HTMLElement,stage:HTMLElement,cells:number,zoom:boolean,view:View){
 const columns=screen.querySelector<HTMLElement>('.play-columns')!,panel=screen.querySelector<HTMLElement>('.board-panel')!,targets=screen.querySelector<HTMLElement>('.targets-panel');
 const heading=screen.querySelector<HTMLElement>('.play-heading'),hud=screen.querySelector<HTMLElement>('.play-hud');
 const viewport=view.visualViewport,visible=viewport?.height||view.innerHeight,top=Math.max(0,screen.getBoundingClientRect().top-(viewport?.offsetTop||0));
 const container=screen.closest<HTMLElement>('.game-app,.main-content'),bottom=container?pixels(view.getComputedStyle(container).paddingBottom):8;
 const height=Math.max(100,Math.floor(visible-top-bottom-2));
 const columnsBox=box(columns,view),panelBox=box(panel,view),screenBox=box(screen,view),children=Array.from(panel.children) as HTMLElement[];
 const shown=children.filter(child=>view.getComputedStyle(child).display!=='none');
 const frameChildren=[heading,hud,columns].filter((child):child is HTMLElement=>!!child&&view.getComputedStyle(child).display!=='none');
 const frameChrome=screenBox.chrome+visibleHeight(heading,view)+visibleHeight(hud,view)+columnsBox.margin+pixels(screenBox.css.rowGap)*Math.max(0,frameChildren.length-1);
 const panelChrome=panelBox.chrome+panelBox.margin+shown.filter(child=>child!==stage).reduce((sum,child)=>sum+visibleHeight(child,view),0)+box(stage,view).margin+pixels(panelBox.css.rowGap)*Math.max(0,shown.length-1);
 const stacked=columnsBox.css.display==='flex'&&columnsBox.css.flexDirection==='column',targetHeight=intrinsicHeight(targets,view);
 const overhead=frameChrome+panelChrome+(stacked?targetHeight+pixels(columnsBox.css.rowGap):0);
 const scroll=stage.querySelector<HTMLElement>('.board-scroll'),scrollCSS=scroll?view.getComputedStyle(scroll):null;
 const board=stage.querySelector<HTMLElement>('.letter-board'),boardCSS=board?view.getComputedStyle(board):null;
 const insets=(scrollCSS?pixels(scrollCSS.paddingLeft)+pixels(scrollCSS.paddingRight)+pixels(scrollCSS.borderLeftWidth)+pixels(scrollCSS.borderRightWidth):0)+(boardCSS?pixels(boardCSS.borderLeftWidth)+pixels(boardCSS.borderRightWidth):0);
 const fitted=fitGameFrame(stage.clientWidth,height,overhead,zoom?0:cells,stacked?0:frameChrome+targetHeight,zoom?96:insets);
 return {...fitted,height,overhead,stageHeight:Math.max(0,Math.floor(Math.max(height,fitted.minHeight)-overhead)),overflow:fitted.minHeight>height};
}

/** ResizeObserver is an enhancement, never a requirement for the first fit. */
export function attachPlayFit(screen:HTMLElement,stage:HTMLElement,cells:number,zoom:boolean,view:View){
 let frame=0,disposed=false;
 const fit=()=>{if(disposed)return;view.cancelAnimationFrame(frame);frame=view.requestAnimationFrame(()=>{
  if(disposed)return;const result=measurePlayFrame(screen,stage,cells,zoom,view);
  let changed=set(screen,'--play-height',result.height+'px');
  // Pinch zoom is a reader preference. Leave natural overflow available.
  if(view.visualViewport&&view.visualViewport.scale!==1){screen.style.removeProperty('min-height');stage.style.removeProperty('height');screen.style.removeProperty('--fitted-board');return;}
  changed=set(screen,'min-height',result.minHeight+'px')||changed;changed=set(stage,'height',result.stageHeight+'px')||changed;
  set(stage,'flex','0 0 auto');changed=set(screen,'--fitted-board',result.boardSize+'px')||changed;
  screen.setAttribute('data-fit',result.overflow?'scroll':'contained');if(changed)view.dispatchEvent(new view.Event('kt-board-layout'));
 });};
 const watch=[screen,...Array.from(screen.querySelectorAll<HTMLElement>('.play-heading,.play-hud,.targets-panel,.selection-preview,.play-controls,.duel-controls,.sprint-footer,.board-word-access'))];
 const observer=typeof view.ResizeObserver==='function'?new view.ResizeObserver(fit):null;
 watch.forEach(element=>observer?.observe(element));if(screen.parentElement)observer?.observe(screen.parentElement);
 const mutation=typeof view.MutationObserver==='function'?new view.MutationObserver(records=>{if(records.some(record=>!stage.contains(record.target)))fit();}):null;
 mutation?.observe(screen.parentElement??screen,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
 for(const event of ['resize','orientationchange','pageshow'])view.addEventListener(event,fit);if(!view.visualViewport)view.addEventListener('scroll',fit,{passive:true});
 view.visualViewport?.addEventListener('resize',fit);view.visualViewport?.addEventListener('scroll',fit);
 screen.ownerDocument.fonts?.ready.then(()=>{if(!disposed)fit();});fit();
 return ()=>{disposed=true;view.cancelAnimationFrame(frame);observer?.disconnect();mutation?.disconnect();for(const event of ['resize','orientationchange','pageshow'])view.removeEventListener(event,fit);view.removeEventListener('scroll',fit);view.visualViewport?.removeEventListener('resize',fit);view.visualViewport?.removeEventListener('scroll',fit);};
}

/** A real pixel square also works without aspect-ratio, container units or ResizeObserver. */
export function attachBoardSize(element:HTMLElement,cells:number,zoom:boolean,onResize:(rect:DOMRect,reason:'viewport'|'layout')=>void,view:View){
 let previous:DOMRect|null=null,disposed=false,viewportWidth=view.innerWidth,viewportHeight=view.innerHeight;
 const update=(reason:'viewport'|'layout'='layout',force=false)=>{if(disposed)return;const width=Math.floor(element.getBoundingClientRect().width);if(width<=0)return;
  set(element,'height',width+'px');set(element,'--board-letter-size',(zoom?24:Math.max(13,Math.min(30,Math.floor((width-2)/cells*.57))))+'px');
  const rect=element.getBoundingClientRect();if(previous&&(force||rect.width!==previous.width||rect.height!==previous.height||rect.top!==previous.top||rect.left!==previous.left))onResize(rect,reason);previous=rect;
 };
 const layout=()=>update('layout'),viewport=(event:Event)=>{
  const changed=event.type==='orientationchange'||viewportWidth!==view.innerWidth||viewportHeight!==view.innerHeight;
  viewportWidth=view.innerWidth;viewportHeight=view.innerHeight;update('viewport',changed);
 };
 const observer=typeof view.ResizeObserver==='function'?new view.ResizeObserver(layout):null;observer?.observe(element);
 view.addEventListener('resize',viewport);view.addEventListener('orientationchange',viewport);view.addEventListener('kt-board-layout',layout);update();
 return ()=>{disposed=true;observer?.disconnect();view.removeEventListener('resize',viewport);view.removeEventListener('orientationchange',viewport);view.removeEventListener('kt-board-layout',layout);};
}
