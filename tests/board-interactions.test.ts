import * as viewport from '../lib/game/viewport.ts';
import * as legacyUI from '../lib/game/legacy-ui.ts';
import * as gestures from '../lib/game/input-gesture.ts';
// Actual Board TSX with controlled hooks, pointer coordinates, global events and RAF.
// This is not a DOM/native event ordering, screen-reader, phone or FPS test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {snapLine,type Cell,type Stroke} from '../lib/game/engine.ts';
import {TUTORIAL} from '../lib/game/content.ts';

type Node={type:unknown;props:Record<string,any>};
type Slot={value?:any;ref?:{current:any};deps?:unknown[];cleanup?:()=>void;setup?:()=>void|(()=>void)};
function nodes(value:unknown):Node[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return [];const n=value as Node;return [n,...nodes(n.props?.['children'])];}
function text(value:unknown):string{if(typeof value==='string')return value;if(Array.isArray(value))return value.map(text).join('');return value&&typeof value==='object'?text((value as Node).props?.['children']):'';}
const compiled=ts.transpileModule(readFileSync('components/game/Board.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function harness(options:{legacy?:boolean;zoom?:boolean;pan?:boolean;paused?:boolean;readOnly?:boolean;blocked?:boolean;busy?:boolean;strokes?:Stroke[]}={}){
 const slots:Slot[]=[],effects:(()=>void)[]=[],frames=new Map<number,()=>void>(),exports:Record<string,any>={};
 const windowTarget=new EventTarget(),documentTarget=Object.assign(new EventTarget(),{hidden:false});
 let selections=0,renders=0;
 const dom=new Map<string,any>();
 const mount=(node:Node)=>{const r=node.props?.['ref'];if(!r)return;if(node.props['role']==='application'){r.current=element;return;}const key=node.props['data-cell']??node.props['className']??'selection-line';let el=dom.get(key);if(!el){const names=new Set<string>();el={attributes:new Map(),classList:{add:(v:string)=>names.add(v),remove:(v:string)=>names.delete(v),contains:(v:string)=>names.has(v)},setAttribute(k:string,v:string){this.attributes.set(k,v);}};dom.set(key,el);}if(typeof r==='function')r(el);else r.current=el;};
 const letters:number[]=[],commits:{a:Cell;b:Cell}[]=[],previews:string[]=[],accepted=options.strokes??[];
 let cursor=0,dirty=true,mounted=true,afterUnmount=0,frameId=0,tree:unknown,resize=()=>{},width=600,height=600,left=10,top=20;
 const element=Object.assign(new EventTarget(),{style:{values:new Map<string,string>(),getPropertyValue(name:string){return this.values.get(name)??'';},setProperty(name:string,value:string){this.values.set(name,value);}},get clientWidth(){return width;},get clientHeight(){return height;},getBoundingClientRect:()=>({left,top,width,height}),setPointerCapture(_id:number){}});
 const hooks={
  useState(initial:any){const slot=slots[cursor++]??={value:typeof initial==='function'?initial():initial};return [slot.value,(next:any)=>{if(!mounted)afterUnmount++;const value=typeof next==='function'?next(slot.value):next;if(!Object.is(value,slot.value)){slot.value=value;dirty=true;}}];},
  useRef(initial:any){return (slots[cursor++]??={}).ref??={current:initial};},
  useEffect(fn:()=>void|(()=>void),deps:unknown[]){const slot=slots[cursor++]??={};if(!slot.deps||deps.length!==slot.deps.length||deps.some((d,i)=>!Object.is(d,slot.deps![i]))){slot.deps=deps;slot.setup=fn;effects.push(()=>{slot.cleanup?.();const cleanup=fn();slot.cleanup=typeof cleanup==='function'?cleanup:undefined;});}},
  useMemo:(fn:()=>any)=>fn()
 };
 const jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
 const props={board:TUTORIAL,strokes:accepted,paused:options.paused??false,readOnly:options.readOnly??false,blocked:options.blocked??false,busy:options.busy??false,statusText:'Kelimen doğrulanıyor. Süre devam ediyor.',zoom:options.zoom??false,pan:options.pan??false,onCommit:(a:Cell,b:Cell)=>commits.push({a:[...a],b:[...b]}),onPreview:(word:string)=>previews.push(word),onSelectLetter:(depth:number)=>letters.push(depth),onSelectStart:()=>{selections++;}};
 if(options.legacy)delete (element as any).setPointerCapture;
 Object.assign(windowTarget,{...(options.legacy?{}:{PointerEvent:class{}}),innerWidth:900,innerHeight:900,Event,ResizeObserver:class{constructor(fn:()=>void){resize=fn;}observe(){}disconnect(){}},requestAnimationFrame:(fn:()=>void)=>{const id=++frameId;frames.set(id,fn);return id;},cancelAnimationFrame:(id:number)=>frames.delete(id)});
 vm.runInNewContext(compiled,{exports,require:(name:string)=>{
  if(name==='@/lib/game/input-gesture')return gestures;if(name==='@/lib/game/browser-compat')return {};if(name==='@/lib/game/viewport')return viewport;if(name==='@/lib/game/legacy-ui')return legacyUI;
  if(name==='react')return hooks;if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'Fragment'};
  if(name==='@/lib/game/engine')return {snapLine};if(name==='@/lib/game/telemetry')return {track(){}};
  throw new Error('Unexpected module: '+name);
 },window:windowTarget,document:documentTarget,performance:{now:()=>100},requestAnimationFrame:(fn:()=>void)=>{const id=++frameId;frames.set(id,fn);return id;},cancelAnimationFrame:(id:number)=>frames.delete(id),ResizeObserver:class{constructor(fn:()=>void){resize=fn;}observe(){}disconnect(){}}});
 const boardNode=()=>{const n=nodes(tree).find(n=>n.props?.['role']==='application');assert.ok(n);return n;};
 const paint=(commit=true)=>{for(let i=0;(dirty||(commit&&effects.length))&&i<25;i++){if(dirty){dirty=false;cursor=0;tree=exports['Board'](props);renders++;for(const node of nodes(tree))mount(node);}if(commit)while(effects.length)effects.shift()!();}return tree;};
 const send=(name:string,cell:Cell,extra:Record<string,unknown>={})=>{const e={pointerId:1,isPrimary:true,pointerType:'touch',button:0,clientX:left+(cell[1]+.5)*width/TUTORIAL.size,clientY:top+(cell[0]+.5)*height/TUTORIAL.size,preventDefault(){},...extra};boardNode().props[name](e);paint();};
 paint();
 return {letters,commits,previews,accepted,props,paint,boardNode,send,
  native(type:string,cells:Cell[],changed=cells){const touch=(cell:Cell)=>({identifier:1,clientX:left+(cell[1]+.5)*width/TUTORIAL.size,clientY:top+(cell[0]+.5)*height/TUTORIAL.size});element.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{touches:cells.map(touch),changedTouches:changed.map(touch)}));paint();},
  reflow(dx=2,dy=2,dw=0){left+=dx;top+=dy;width+=dw;height+=dw;windowTarget.dispatchEvent(new Event('kt-board-layout'));paint();},
  toolbar(){(windowTarget as any).innerHeight-=44;top+=8;windowTarget.dispatchEvent(new Event('resize'));paint();},
  rotate(){windowTarget.dispatchEvent(new Event('orientationchange'));paint();},
  rejectCapture(){element.setPointerCapture=()=>{throw new Error('No active pointer');};},
  get selections(){return selections;},
  flush(){const callbacks=[...frames.values()];frames.clear();for(const fn of callbacks)fn();paint();},
  globalBlur(){windowTarget.dispatchEvent(new Event('blur'));paint();},
  visibility(hidden:boolean){documentTarget.hidden=hidden;documentTarget.dispatchEvent(new Event('visibilitychange'));paint();},
  focus(){boardNode().props['onFocus']();paint();},
  blur(){boardNode().props['onBlur']();paint();},
  key(key:string){boardNode().props['onKeyDown']({key,preventDefault(){}});paint();},
  tap(cell:Cell,extra:Record<string,unknown>={}){send('onPointerDown',cell,extra);send('onPointerUp',cell,extra);},
  selected(){return [...dom].filter(([key,el])=>/^\d+,\d+$/.test(key)&&el.classList.contains('letter-selected')).map(([key])=>key);},get renders(){return renders;},ink(){return dom.get('selection-line')?.attributes;},
  setProps(next:Partial<typeof props>,commit=true){Object.assign(props,next);dirty=true;paint(commit);},
  resize(changed=true){if(changed){width+=10;height+=10;(windowTarget as any).innerWidth+=10;}windowTarget.dispatchEvent(new Event('resize'));paint();},
  unmount(){mounted=false;for(const slot of slots)slot.cleanup?.();},
  strictReplay(){for(const slot of slots)slot.cleanup?.();for(const slot of slots)if(slot.setup){const cleanup=slot.setup();slot.cleanup=typeof cleanup==='function'?cleanup:undefined;}paint();},get afterUnmount(){return afterUnmount;},get tree(){return tree;}
 };
}
const cells=(a:Cell,b:Cell)=>snapLine(a,b,TUTORIAL.size).map(([r,c])=>`${r},${c}`).sort();
const a:Cell=[0,0],b:Cell=[2,2];
function drag(h:ReturnType<typeof harness>,start=a,end=b){h.send('onPointerDown',start);h.send('onPointerMove',end);}

describe('Board window lifecycle cancels only unfinished input',()=>{
 for(const event of ['window blur','hidden visibility'] as const)it('drops a pending drag and stale release on '+event,()=>{
  const h=harness({strokes:[TUTORIAL.placements[0]!]});drag(h);if(event==='window blur')h.globalBlur();else h.visibility(true);h.flush();
  assert.equal(h.previews.at(-1),'');assert.equal(h.selected().length,0);h.send('onPointerUp',b);assert.equal(h.commits.length,0);
  assert.equal(nodes(h.tree).filter(n=>String(n.props?.['className']??'').startsWith('found-stroke')).length,1);
  if(event==='hidden visibility')h.visibility(false);
  h.tap(a);h.tap(b);assert.equal(h.commits.length,1);assert.deepEqual(h.commits[0],{a,b});h.unmount();
 });
 it('clears a two-tap anchor when hidden without committing the return tap',()=>{
  const h=harness({zoom:true});h.tap(a);assert.equal(h.selected().length,1);h.visibility(true);h.visibility(false);h.tap(b);
  assert.equal(h.commits.length,0);assert.deepEqual(h.selected(),[b.join(',')]);h.unmount();
 });
 it('clears a keyboard anchor on window blur and starts a new selection afterwards',()=>{
  const h=harness();h.focus();h.key('Enter');h.key('ArrowDown');h.key('ArrowRight');h.globalBlur();h.key('Enter');
  assert.equal(h.commits.length,0);assert.equal(h.selected().length,1);h.key('ArrowDown');h.key('Enter');assert.equal(h.commits.length,1);h.unmount();
 });
 it('does not cancel a visible selection or modify accepted paths on a visible event',()=>{
  const h=harness({strokes:[TUTORIAL.placements[0]!]});drag(h);h.flush();const selected=h.selected().sort();h.visibility(false);
  assert.deepEqual(h.selected().sort(),selected);h.send('onPointerUp',b);assert.equal(h.commits.length,1);assert.equal(h.props.strokes.length,1);h.unmount();
 });
 it('uses the latest preview callback and removes listeners plus queued preview work on unmount',()=>{
  const h=harness(),latest:string[]=[];drag(h);h.setProps({onPreview:word=>latest.push(word)});h.globalBlur();assert.equal(latest.at(-1),'');
  drag(h);const before=latest.length;h.unmount();h.globalBlur();h.visibility(true);h.flush();assert.equal(h.afterUnmount,0);assert.equal(latest.length,before);
 });
});

describe('Board input compatibility and paused accessibility',()=>{
 it('keeps exact preview cells and endpoints for all eight drag directions, including reverse diagonals',()=>{
  for(const [dr,dc] of [[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]]){
   const start:Cell=[2,2],end:Cell=[2+dr!*2,2+dc!*2],h=harness();drag(h,start,end);h.flush();assert.deepEqual(h.selected().sort(),cells(start,end));
   h.send('onPointerUp',end);assert.deepEqual(h.commits,[{a:start,b:end}]);assert.equal(h.selected().length,0);h.unmount();
  }
 });
 it('keeps mouse and touch two-end selection without a drag',()=>{
  for(const pointerType of ['touch','mouse']){const h=harness();h.tap(a,{pointerType});assert.equal(h.selected().length,1);h.tap(b,{pointerType});assert.deepEqual(h.commits,[{a,b}]);h.unmount();}
 });
 it('lets enlarged-touch panning move without selecting a word and keeps subsequent two taps usable',()=>{
  const h=harness({zoom:true,pan:true});drag(h);h.send('onPointerUp',b);assert.equal(h.commits.length,0);h.tap(a);h.tap(b);assert.deepEqual(h.commits,[{a,b}]);h.unmount();
 });
 it('keeps keyboard diagonal selection and Escape cancellation',()=>{
  const h=harness();h.focus();h.key('Enter');h.key('ArrowDown');h.key('ArrowRight');assert.deepEqual(h.selected().sort(),cells(a,[1,1]));h.key('Escape');h.key('Enter');assert.equal(h.commits.length,0);h.key('ArrowDown');h.key('ArrowRight');h.key('Enter');assert.deepEqual(h.commits,[{a:[1,1],b:[2,2]}]);h.unmount();
 });
 it('cancels on native pointer cancel, lost capture, element blur, resize, zoom and board change',()=>{
  for(const reason of ['cancel','lost','blur','resize','zoom','board']){
   const h=harness();drag(h);if(reason==='cancel')h.send('onPointerCancel',b);else if(reason==='lost')h.send('onLostPointerCapture',b);else if(reason==='blur')h.blur();else if(reason==='resize'){h.flush();h.resize(false);assert.ok(h.selected().length>0);h.resize();}else if(reason==='zoom')h.setProps({zoom:true});else h.setProps({board:{...TUTORIAL,grid:TUTORIAL.grid.map((row,i)=>i===0?row.map((ch,j)=>j===0?'Z':ch):row)}});
   h.flush();h.send('onPointerUp',b);assert.equal(h.commits.length,0,reason);assert.equal(h.selected().length,0,reason);h.unmount();
  }
 });
 it('hides cursor letters from the paused accessible label, blocks input and restores normal instructions',()=>{
  const h=harness();h.focus();assert.match(h.boardNode().props['aria-label'],/1\. satır, 1\. sütun:/);drag(h);h.setProps({paused:true});h.flush();
  const paused=h.boardNode().props;assert.match(paused['aria-label'],/duraklatıldı/);assert.doesNotMatch(paused['aria-label'],/satır|sütun/);assert.equal(paused['tabIndex'],-1);
  const grid=nodes(h.tree).find(n=>n.props?.['className']==='letter-grid');assert.ok(grid);assert.match(text(grid),/^·+$/);h.send('onPointerUp',b);h.tap(a);h.tap(b);h.key('Enter');assert.equal(h.commits.length,0);
  h.setProps({paused:false});assert.match(h.boardNode().props['aria-label'],/oklar ve Enter/);h.tap(a);h.tap(b);assert.equal(h.commits.length,1);h.unmount();
 });
});

describe('completed review is visible, scrollable and cannot select again',()=>{
 it('retains letters and accepted ink in both sizes while allowing keyboard inspection and page panning',()=>{
  for(const zoom of [false,true]){
   const h=harness({readOnly:true,zoom,strokes:TUTORIAL.placements});h.focus();
   const grid=nodes(h.tree).find(n=>n.props?.['className']==='letter-grid')!;
   assert.equal(text(grid),TUTORIAL.grid.map(row=>row.join('')).join(''));
   assert.equal(nodes(h.tree).filter(n=>String(n.props?.['className']??'').startsWith('found-stroke')).length,TUTORIAL.targets.length);
   assert.equal(nodes(h.tree).some(n=>n.props?.['className']==='board-paused'),false);assert.equal(h.boardNode().props['tabIndex'],0);
   assert.equal(h.boardNode().props['style'].touchAction,'pan-x pan-y');assert.match(h.boardNode().props['aria-label'],/İnceleme tahtası/);assert.doesNotMatch(h.boardNode().props['aria-label'],/Enter ile seç/);
   drag(h);h.flush();h.send('onPointerUp',b);h.tap(a);h.tap(b);h.key('Enter');h.key(' ');h.key('ArrowRight');h.key('ArrowDown');
   assert.match(h.boardNode().props['aria-label'],/2\. satır, 2\. sütun:/);assert.equal(h.commits.length,0);assert.equal(h.selected().length,0);assert.equal(h.props.strokes.length,TUTORIAL.targets.length);h.unmount();
  }
 });
 it('cancels each active input on entering review and permits only a fresh selection after a new game',()=>{
  for(const kind of ['drag','tap','keyboard']){
   const h=harness({strokes:[TUTORIAL.placements[0]!]});
   if(kind==='drag')drag(h);else if(kind==='tap')h.tap(a);else{h.key('Enter');h.key('ArrowDown');}
   h.setProps({readOnly:true});h.flush();h.send('onPointerUp',b);h.tap(b);h.key('Enter');assert.equal(h.selected().length,0,kind);assert.equal(h.commits.length,0,kind);
   h.setProps({readOnly:false});assert.equal(h.boardNode().props['style'].touchAction,'none');h.tap(a);h.tap(b);assert.deepEqual(h.commits,[{a,b}],kind);h.unmount();
  }
 });
 it('blocks an old handler and queued preview even before the read-only effect runs',()=>{
  const h=harness();drag(h);const staleUp=h.boardNode().props['onPointerUp'],before=h.previews.length;h.setProps({readOnly:true},false);
  staleUp({pointerId:1,clientX:260,clientY:270});h.flush();assert.equal(h.commits.length,0);assert.equal(h.selected().length,0);assert.ok(h.previews.slice(before).every(word=>word===''));h.unmount();
 });
});


it('keeps pending server input visible and busy without claiming completion, then unlocks a fresh selection',()=>{
 const h=harness({strokes:[TUTORIAL.placements[0]!]});drag(h);h.setProps({blocked:true,busy:true},false);h.flush();h.send('onPointerUp',b);h.tap(a);h.tap(b);h.key('Enter');
 assert.equal(h.commits.length,0);assert.equal(h.selected().length,0);assert.equal(h.boardNode().props['aria-busy'],true);assert.match(h.boardNode().props['aria-label'],/Kelimen doğrulanıyor/);assert.doesNotMatch(h.boardNode().props['aria-label'],/tamamlandı|duraklatıldı/);assert.equal(h.boardNode().props['style'].touchAction,'pan-x pan-y');
 assert.equal(nodes(h.tree).some(n=>n.props?.['className']==='board-paused'),false);assert.equal(nodes(h.tree).filter(n=>String(n.props?.['className']??'').startsWith('found-stroke')).length,1);
 h.setProps({blocked:false,busy:false});h.tap(a);h.tap(b);assert.equal(h.commits.length,1);h.unmount();
});

describe('selection sound is a single intentional start',()=>{
 it('does not tick through dragged cells or on commit/cancel',()=>{const h=harness();drag(h);h.flush();h.send('onPointerMove',[3,3]);h.flush();assert.equal(h.selections,1);h.send('onPointerUp',[3,3]);assert.equal(h.selections,1);h.tap(a);assert.equal(h.selections,2);h.key('Escape');assert.equal(h.selections,2);h.unmount();});
 it('supports keyboard anchoring, stays silent during enlarged panning and all blocked states',()=>{
  const h=harness();h.key('ArrowRight');assert.equal(h.selections,0);h.key('Enter');h.key('ArrowDown');h.key('Enter');assert.equal(h.selections,1);h.unmount();const pan=harness({zoom:true,pan:true});drag(pan);pan.send('onPointerUp',b);assert.equal(pan.selections,0);pan.tap(a);pan.tap(b);assert.equal(pan.selections,1);pan.unmount();
  for(const blocked of [{paused:true},{readOnly:true},{blocked:true}]){const h=harness(blocked);drag(h);h.send('onPointerUp',b);h.key('Enter');assert.equal(h.selections,0);h.unmount();}
 });
});

describe('actual Board supports legacy Safari Touch Events and its last row',()=>{
 it('selects the last row by native touch without PointerEvent or setPointerCapture, then remains correct after resizing',()=>{
  const h=harness({legacy:true}),start:Cell=[5,0],end:Cell=[5,5];
  h.native('touchstart',[start]);h.native('touchmove',[end]);h.flush();h.native('touchend',[],[end]);assert.deepEqual(h.commits,[{a:start,b:end}]);
  h.resize();h.native('touchstart',[a]);h.native('touchend',[],[a]);h.native('touchstart',[b]);h.native('touchend',[],[b]);assert.deepEqual(h.commits[1],{a,b});h.unmount();
 });
 it('allows enlarged panning and cancels legacy input on backgrounding without a stale commit',()=>{
  const h=harness({legacy:true,zoom:true,pan:true});h.native('touchstart',[a]);h.native('touchmove',[b]);h.native('touchend',[],[b]);assert.equal(h.commits.length,0);
  h.native('touchstart',[a]);h.native('touchend',[],[a]);h.globalBlur();h.native('touchstart',[b]);h.native('touchend',[],[b]);assert.equal(h.commits.length,0);h.unmount();
 });
});

describe('swipe survives its own preview layout',()=>{
 for(const legacy of [false,true])it('keeps the gesture and rebases coordinates after measured reflow: '+(legacy?'Touch Events':'Pointer Events'),()=>{
  const h=harness({legacy}),start:Cell=[5,0],end:Cell=[5,5];
  if(legacy)h.native('touchstart',[start]);else h.send('onPointerDown',start);
  // Preview/header layout moves and resizes the board after the initial press.
  h.reflow(30,45,-80);h.flush();assert.equal(h.selected().length,1);
  if(legacy)h.native('touchmove',[end]);else h.send('onPointerMove',end);
  h.flush();assert.deepEqual(h.selected().sort(),cells(start,end));
  h.reflow(-15,12,25);h.flush();
  if(legacy)h.native('touchend',[],[end]);else h.send('onPointerUp',end);
  assert.deepEqual(h.commits,[{a:start,b:end}]);assert.equal(h.selected().length,0);h.unmount();
 });
 for(const legacy of [false,true])it('uses release coordinates when a fast swipe has no delivered move event: '+(legacy?'Touch Events':'Pointer Events'),()=>{
  const h=harness({legacy});
  if(legacy){h.native('touchstart',[a]);h.native('touchend',[],[b]);}else{h.send('onPointerDown',a);h.send('onPointerUp',b);}
  assert.deepEqual(h.commits,[{a,b}]);h.unmount();
 });
 it('does not lose input if a browser refuses optional pointer capture',()=>{
  const h=harness();h.rejectCapture();drag(h);h.flush();h.send('onPointerUp',b);assert.deepEqual(h.commits,[{a,b}]);h.unmount();
 });
 it('still cancels a real rotation after the layout observer already rebased a gesture',()=>{
  const h=harness();drag(h);h.reflow(5,20,-50);h.rotate();h.send('onPointerUp',b);assert.equal(h.commits.length,0);assert.equal(h.selected().length,0);
  h.tap(a);h.tap(b);assert.deepEqual(h.commits,[{a,b}]);h.unmount();
 });
});

describe('touch drawing across devices and enlarged boards',()=>{
 it('draws in enlarged mode by default and pans only when explicitly selected',()=>{
  const h=harness({zoom:true});drag(h);h.send('onPointerUp',b);assert.deepEqual(h.commits,[{a,b}]);
  h.setProps({pan:true});assert.equal(h.boardNode().props['style'].touchAction,'pan-x pan-y');drag(h);h.send('onPointerUp',b);assert.equal(h.commits.length,1);
  h.setProps({pan:false});h.native('touchstart',[a]);h.native('touchmove',[b]);h.native('touchend',[],[b]);assert.equal(h.commits.length,2);h.unmount();
 });
 it('accepts real touch delivery on Pointer-capable browsers in all eight directions',()=>{
  for(const [dr,dc] of [[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]]){
   const start:Cell=[2,2],end:Cell=[2+dr!*2,2+dc!*2],h=harness({zoom:true});
   h.native('touchstart',[start]);h.native('touchmove',[end]);h.flush();assert.deepEqual(h.selected().sort(),cells(start,end));h.native('touchend',[],[end]);assert.deepEqual(h.commits,[{a:start,b:end}]);h.unmount();
  }
 });
 it('deduplicates mixed Pointer/Touch delivery and ignores a pointer cancellation after native takeover',()=>{
  const h=harness();h.send('onPointerDown',a);h.native('touchstart',[a]);h.send('onPointerCancel',a);h.send('onLostPointerCapture',a);h.native('touchmove',[b]);h.send('onPointerMove',b);h.native('touchend',[],[b]);h.send('onPointerUp',b);
  assert.deepEqual(h.commits,[{a,b}]);assert.equal(h.selections,1);h.unmount();
 });
 it('survives browser-toolbar height changes but still cancels on rotation or real native touch cancel',()=>{
  const h=harness();drag(h);h.toolbar();h.send('onPointerUp',b);assert.deepEqual(h.commits,[{a,b}]);
  h.native('touchstart',[a]);h.native('touchmove',[b]);h.native('touchcancel',[]);h.native('touchend',[],[b]);assert.equal(h.commits.length,1);h.unmount();
 });
});

describe('locked imperative selection',()=>{
 it('does not render React during a drag or RAF paint, even with many move events',()=>{
  const h=harness(),before=h.renders;h.send('onPointerDown',a);for(let i=0;i<100;i++){h.send('onPointerMove',[i%5+1,i%5+1]);h.flush();}h.send('onPointerMove',b);h.flush();assert.equal(h.renders,before);assert.equal(h.selections,1);assert.deepEqual(h.selected().sort(),cells(a,b));assert.equal(h.ink().get('x2'),'2.5');h.unmount();
 });
 it('keeps a locked horizontal line through cross-axis drift and can shorten before RAF',()=>{
  const h=harness();h.send('onPointerDown',[2,0]);h.send('onPointerMove',[2,1]);h.send('onPointerMove',[3,3]);h.flush();assert.deepEqual(h.selected().sort(),cells([2,0],[2,1]));h.send('onPointerMove',[2,4]);h.send('onPointerUp',[2,2]);assert.deepEqual(h.commits,[{a:[2,0],b:[2,2]}]);h.flush();assert.equal(h.selected().length,0);h.unmount();
 });
 it('preserves imperative ink and selected letters across an unrelated parent render',()=>{
  const h=harness();drag(h);h.flush();h.setProps({busy:true});assert.deepEqual(h.selected().sort(),cells(a,b));assert.equal(h.ink().get('x2'),'2.5');h.send('onPointerUp',b);assert.deepEqual(h.commits,[{a,b}]);h.unmount();
 });
});

it('pulses only a confirmed new stroke and does not repeat it after pause',()=>{
 const h=harness(),stroke=TUTORIAL.placements[0]!;h.setProps({strokes:[stroke],busy:true,blocked:true});let line=nodes(h.tree).find(n=>String(n.props['className']??'').startsWith('found-stroke'))!;assert.match(line.props['className'],/is-pending/);assert.doesNotMatch(line.props['className'],/is-new/);h.setProps({busy:false,blocked:false});line=nodes(h.tree).find(n=>String(n.props['className']??'').startsWith('found-stroke'))!;assert.match(line.props['className'],/is-new/);h.setProps({paused:true});h.setProps({paused:false});line=nodes(h.tree).find(n=>String(n.props['className']??'').startsWith('found-stroke'))!;assert.equal(line.props['className'],'found-stroke');h.unmount();
});

it('allows a fresh swipe after Strict Mode cleanup/setup without reviving a cancelled gesture',()=>{const h=harness();drag(h);h.strictReplay();h.send('onPointerUp',b);assert.equal(h.commits.length,0);drag(h);h.flush();h.send('onPointerUp',b);assert.deepEqual(h.commits,[{a,b}]);h.unmount();});
describe('new-letter sound signals follow actual selection geometry',()=>{
 it('signals extension once, ignores cell jitter and backtracking, and keeps a quick release endpoint',()=>{
  const h=harness();h.send('onPointerDown',[0,0]);h.send('onPointerMove',[0,1]);h.send('onPointerMove',[0,1]);h.send('onPointerMove',[0,2]);h.send('onPointerMove',[0,1]);h.send('onPointerMove',[0,2]);h.send('onPointerUp',[0,4]);
  assert.deepEqual(h.letters,[1,2,3,5]);assert.equal(h.commits.length,1);h.unmount();
 });
 it('deduplicates native/pointer streams and is silent while paused or read-only',()=>{
  for(const options of [{paused:true},{readOnly:true},{blocked:true}]){const h=harness(options);h.send('onPointerDown',[0,0]);h.send('onPointerMove',[0,2]);h.send('onPointerUp',[0,2]);assert.equal(h.letters.length,0);h.unmount();}
  const h=harness();h.send('onPointerDown',[0,0]);h.native('touchstart',[[0,0]]);h.native('touchmove',[[0,1]]);h.send('onPointerMove',[0,1]);h.native('touchend',[],[[0,1]]);assert.deepEqual(h.letters,[1,2]);assert.equal(h.commits.length,1);h.unmount();
 });
});
