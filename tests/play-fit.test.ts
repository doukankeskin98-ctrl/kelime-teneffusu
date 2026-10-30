// Controlled layout boxes exercise real fitting/observation code, not a browser engine.
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import {measurePlayFrame,attachPlayFit,attachBoardSize} from '../lib/game/viewport.ts';
import {attachLegacyTouch,openGameDialog} from '../lib/game/legacy-ui.ts';
import {installBrowserCompat} from '../lib/game/browser-compat.ts';

function element(width=380,height=40){
 const values=new Map<string,string>(),attributes=new Map<string,string>(),node:any=new EventTarget();
 Object.assign(node,{rect:{width,height,top:0,left:0},css:{display:'block',marginTop:'0',marginBottom:'0',paddingTop:'0',paddingBottom:'0',paddingLeft:'0',paddingRight:'0',borderTopWidth:'0',borderBottomWidth:'0',borderLeftWidth:'0',borderRightWidth:'0',rowGap:'0',flexDirection:'row'},children:[],style:{getPropertyValue:(name:string)=>values.get(name)??'',setProperty:(name:string,value:string)=>{values.set(name,value);},removeProperty:(name:string)=>values.delete(name)},classList:{add(){},remove(){}},getBoundingClientRect(){const r=this.rect;return {...r,height:Number.parseFloat(values.get('height')??'')||r.height,bottom:r.top+(Number.parseFloat(values.get('height')??'')||r.height)};},getClientRects:()=>[{}],setAttribute:(name:string,value:string)=>attributes.set(name,value),removeAttribute:(name:string)=>attributes.delete(name),getAttribute:(name:string)=>attributes.get(name),querySelector:()=>null,querySelectorAll:()=>[],isConnected:true});
 Object.defineProperties(node,{clientWidth:{get:()=>node.rect.width},clientHeight:{get:()=>node.getBoundingClientRect().height}});return node;
}
function browser(height=628){
 const frames=new Map<number,()=>void>(),view:any=new EventTarget();let id=0;
 Object.assign(view,{innerHeight:height,Event,getComputedStyle:(node:any)=>node.css,requestAnimationFrame:(fn:()=>void)=>{frames.set(++id,fn);return id;},cancelAnimationFrame:(id:number)=>frames.delete(id)});
 return {view,frames,flush(){const f=[...frames.values()];frames.clear();f.forEach(fn=>fn());}};
}
function fixture(width=384,height=628,stacked=true){
 const b=browser(height),screen=element(width,9000),stage=element(width,8000),panel=element(),columns=element(),targets=element(),heading=element(width,44),hud=element(width,50),preview=element(width,22),controls=element(width,44),words=element(width,80),scroll=element(),board=element(),container=element();
 screen.rect.top=12;screen.ownerDocument={};screen.parentElement=container;stage.contains=(node:unknown)=>node===stage;container.css.paddingBottom='8';screen.closest=()=>container;
 hud.css.marginTop='6';columns.css.marginTop='6';columns.css.display=stacked?'flex':'grid';columns.css.flexDirection=stacked?'column':'row';
 panel.css.paddingTop=panel.css.paddingBottom='8';panel.css.borderTopWidth=panel.css.borderBottomWidth='1';stage.css.marginTop=controls.css.marginTop='5';
 scroll.css.paddingLeft=scroll.css.paddingRight='2';board.css.borderLeftWidth=board.css.borderRightWidth='1';targets.css.marginBottom=stacked?'6':'0';
 targets.children=[words];panel.children=[preview,stage,controls];
 const selectors:Record<string,any>={'.play-columns':columns,'.board-panel':panel,'.targets-panel':targets,'.play-heading':heading,'.play-hud':hud};
 screen.querySelector=(selector:string)=>selectors[selector]??null;screen.querySelectorAll=()=>[heading,hud,targets,preview,controls];stage.querySelector=(selector:string)=>selector==='.board-scroll'?scroll:board;
 return {...b,screen,stage,columns,targets,heading,hud,preview,controls,words,panel};
}
describe('complete board fits measured browser space',()=>{
 it('does not derive the new budget from an already stretched Safari stage',()=>{
  const f=fixture(),a=measurePlayFrame(f.screen,f.stage,12,false,f.view);assert(a.boardSize+a.overhead<=a.height);assert.equal(a.overflow,false);
  f.screen.rect.height=20000;f.stage.rect.height=19000;const b=measurePlayFrame(f.screen,f.stage,12,false,f.view);assert.deepEqual(b,a);
  assert(12+a.overhead+a.boardSize+8<=628); // Last row plus controls ends above browser UI.
 });
 it('covers narrow/large phones, landscape, tablets, desktops and changing Safari bars',()=>{
  for(const [width,height,stacked,cells] of [[296,568,true,8],[384,628,true,12],[384,700,true,12],[366,724,true,9],[406,820,true,12],[700,300,false,8],[720,1000,false,13],[900,740,false,13]] as const){
   const f=fixture(width,height,stacked),r=measurePlayFrame(f.screen,f.stage,cells,false,f.view);assert(r.boardSize<=width);assert(r.boardSize+r.overhead<=Math.max(r.height,r.minHeight));assert(r.boardSize>=Math.min(width,cells*22+6));
  }
 });
 it('accounts for safe area, visual viewport offset and actual enlarged targets, preserving natural overflow',()=>{
  const f=fixture();f.view.visualViewport=Object.assign(new EventTarget(),{height:520,offsetTop:8,scale:1});
  let r=measurePlayFrame(f.screen,f.stage,12,false,f.view);assert.equal(r.height,506);
  f.hud.rect.height=140;f.words.rect.height=260;f.controls.rect.height=88;r=measurePlayFrame(f.screen,f.stage,12,false,f.view);assert(r.overflow);assert(r.minHeight>=r.overhead+270);assert(r.stageHeight>=270);
  const g=fixture(700,500,false);g.words.rect.height=900;assert(measurePlayFrame(g.screen,g.stage,8,false,g.view).minHeight>=900);
 });
 it('fits initially without ResizeObserver or VisualViewport and refits on resize, orientation and restoration',()=>{
  const f=fixture(),stop=attachPlayFit(f.screen,f.stage,12,false,f.view);f.flush();assert.equal(f.screen.getAttribute('data-fit'),'contained');
  const initial=f.stage.style.getPropertyValue('height');f.view.innerHeight=500;f.view.dispatchEvent(new Event('resize'));f.flush();assert.notEqual(f.stage.style.getPropertyValue('height'),initial);
  f.view.innerHeight=700;f.view.dispatchEvent(new Event('orientationchange'));f.flush();assert.equal(f.screen.style.getPropertyValue('--play-height'),'678px');
  f.view.innerHeight=628;f.view.dispatchEvent(new Event('pageshow'));f.flush();assert.equal(f.stage.style.getPropertyValue('height'),initial);stop();f.view.dispatchEvent(new Event('resize'));assert.equal(f.frames.size,0);
 });
 it('refits a new account/offline notice above the game but ignores letter-selection mutations',()=>{
  const f=fixture();let notify!:(records:any[])=>void;
  f.view.MutationObserver=class{constructor(callback:(records:any[])=>void){notify=callback;}observe(){}disconnect(){}};
  const stop=attachPlayFit(f.screen,f.stage,12,false,f.view);f.flush();const before=f.screen.style.getPropertyValue('--play-height');
  notify([{target:f.stage}]);assert.equal(f.frames.size,0);f.screen.rect.top=60;notify([{target:f.screen.parentElement}]);f.flush();assert.notEqual(f.screen.style.getPropertyValue('--play-height'),before);assert.equal(f.screen.style.getPropertyValue('--play-height'),'558px');stop();
 });
 it('preserves pinch zoom and sizes a square/font without aspect-ratio or container units',()=>{
  const f=fixture();f.view.visualViewport={height:300,offsetTop:0,scale:2,addEventListener(){},removeEventListener(){}};const stop=attachPlayFit(f.screen,f.stage,12,false,f.view);f.flush();assert.equal(f.screen.style.getPropertyValue('--fitted-board'),'');stop();
  const b=browser(),board=element(300,0);let cancelled=0;const clean=attachBoardSize(board,10,false,()=>cancelled++,b.view);assert.equal(board.style.getPropertyValue('height'),'300px');assert.equal(board.style.getPropertyValue('--board-letter-size'),'16px');
  board.rect.width=340;b.view.dispatchEvent(new Event('resize'));assert.equal(board.style.getPropertyValue('height'),'340px');assert.equal(cancelled,1);
  board.rect.top=90;b.view.dispatchEvent(new Event('kt-board-layout'));assert.equal(cancelled,2);clean();board.rect.width=400;b.view.dispatchEvent(new Event('resize'));assert.equal(cancelled,2);
 });
});

describe('legacy iOS input and results keep the same game',()=>{
 const touch=(id:number,x=10,y=20)=>({identifier:id,clientX:x,clientY:y});
 function send(node:any,type:string,touches:unknown[],changedTouches=touches){const e=Object.assign(new Event(type,{cancelable:true}),{touches,changedTouches});node.dispatchEvent(e);return e;}
 it('uses touch events exactly once when Pointer Events are absent, while retaining zoom panning and multi-touch cancellation',()=>{
  const {view}=browser(),node=element(),calls:string[]=[];let pan=false;
  const stop=attachLegacyTouch(node,()=>({down:()=>calls.push('down'),move:()=>calls.push('move'),up:()=>calls.push('up'),cancel:()=>calls.push('cancel'),pan:()=>pan}),view);
  send(node,'touchstart',[touch(1)]);const moved=send(node,'touchmove',[touch(1,40,50)]);send(node,'touchend',[],[touch(1,40,50)]);assert.deepEqual(calls,['down','move','up']);assert(moved.defaultPrevented);
  pan=true;send(node,'touchstart',[touch(2)]);assert.equal(send(node,'touchmove',[touch(2,50,60)]).defaultPrevented,false);send(node,'touchstart',[touch(2),touch(3)]);assert.equal(calls[calls.length-1],'cancel');
  stop();const before=calls.length;send(node,'touchstart',[touch(4)]);assert.equal(calls.length,before);
  view.PointerEvent=class{};const modern=attachLegacyTouch(node,()=>({down:()=>calls.push('duplicate'),move(){},up(){},cancel(){},pan:()=>false}),view);send(node,'touchstart',[touch(5)]);assert.equal(calls.length,before);modern();
 });
 it('opens and bounds the same result content without native dialog, traps focus and restores it on close',()=>{
  const {view}=browser(520),dialog=element(360,400),old=element(),first=element(),last=element();let closed=0,restored=0;
  const doc:any={activeElement:old,body:{style:{overflow:'auto'},appendChild(){}},createElement:()=>Object.assign(element(),{remove(){}})};
  dialog.ownerDocument=doc;old.focus=()=>restored++;first.focus=()=>{doc.activeElement=first;};last.focus=()=>{doc.activeElement=last;};dialog.focus=()=>{doc.activeElement=dialog;};dialog.querySelectorAll=()=>[first,last];
  const stop=openGameDialog(dialog,()=>closed++,view);assert.equal(dialog.getAttribute('open'),'');assert.equal(dialog.style.maxHeight,'496px');assert.equal(doc.body.style.overflow,'hidden');
  doc.activeElement=last;dialog.dispatchEvent(Object.assign(new Event('keydown',{cancelable:true}),{key:'Tab',shiftKey:false}));assert.equal(doc.activeElement,first);
  dialog.dispatchEvent(Object.assign(new Event('keydown',{cancelable:true}),{key:'Escape'}));assert.equal(closed,1);
  view.innerHeight=400;view.dispatchEvent(new Event('resize'));assert.equal(dialog.style.maxHeight,'376px');stop();assert.equal(doc.body.style.overflow,'auto');assert.equal(restored,1);
 });
 it('fills only missing client APIs, including cryptographic UUIDs, without overwriting existing ones',async()=>{
  let entropy=0;const root:any=vm.runInNewContext('delete Array.prototype.at; delete Promise.allSettled; ({Array,Promise,crypto})',{crypto:{getRandomValues:(buffer:Uint8Array)=>{buffer.forEach((_,i)=>{buffer[i]=i+(++entropy);});return buffer;}}});
  installBrowserCompat(root);assert.equal(root.Array.prototype.at.call(['a','b'],-1),'b');assert.equal(root.Array.prototype.at.call(['a'],2),undefined);
  const result=await root.Promise.allSettled([root.Promise.resolve(3),root.Promise.reject('x')]);assert.equal(result[0].value,3);assert.equal(result[1].status,'rejected');
  const uuid=root.crypto.randomUUID;assert.match(uuid(),/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);assert(entropy>0);installBrowserCompat(root);assert.equal(root.crypto.randomUUID,uuid);
 });
});
