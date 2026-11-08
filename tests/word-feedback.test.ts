import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import * as feedback from '../lib/game/word-feedback.ts';
const {wordFeedbackLedger,wordFlightPlan,WORD_FLIGHT_MS,WORD_RESULT_DELAY_MS}=feedback;
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {viewCell} from '../lib/game/board-view.ts';

describe('confirmed word feedback ledger',()=>{
 it('starts a local match immediately, silently reconciles ACK and allows retry after withdrawal',()=>{
  const l=wordFeedbackLedger('A',[]);
  assert.deepEqual(l.consume('A',[],true,'0'),['0']);
  assert.deepEqual(l.consume('A',[],true,'0'),[]);
  assert.deepEqual(l.consume('A',[]),[]);
  assert.deepEqual(l.consume('A',[],true,'0'),['0']);
  assert.deepEqual(l.consume('A',['0'],true,'0'),[]);
  assert.deepEqual(l.consume('A',['0']),[]);
 });
 it('does not replay late recovery, hidden previews or a stale round',()=>{
  const l=wordFeedbackLedger('A',[]);
  assert.deepEqual(l.consume('A',[],true,'0'),['0']);
  l.consume('A',[]);
  assert.deepEqual(l.consume('A',['0']),[]);
  assert.deepEqual(l.consume('A',['0'],false,'1'),[]);
  assert.deepEqual(l.consume('A',['0','1']),[]);
  assert.deepEqual(l.consume('B',[]),[]);
  assert.deepEqual(l.consume('B',[],true,'0'),['0']);
 });
 it('silently restores old words, consumes each new ID once and survives cancellation',()=>{const l=wordFeedbackLedger('A',['old']);assert.deepEqual(l.consume('A',['old']),[]);assert.deepEqual(l.consume('A',['old','new','new']),['new']);assert.deepEqual(l.consume('A',['old','new']),[]);assert.deepEqual(l.consume('A',['old','new','hidden'],false),[]);assert.deepEqual(l.consume('A',['old','new','hidden']),[]);});
 it('never invents success from a pending/rejected input and scopes explicit replays',()=>{const l=wordFeedbackLedger('A',[]);assert.deepEqual(l.consume('A',[]),[]);assert.deepEqual(l.consume('A',['0']),['0']);assert.deepEqual(l.consume('B',['0']),[]);assert.deepEqual(l.consume('replay',[]),[]);assert.deepEqual(l.consume('replay',['0']),['0']);});
});
function harness(initial:string[]=[],measured=false,labelText='KALE'){
 const slots:any[]=[],effects:(()=>void)[]=[],timers=new Map<number,()=>void>(),sparks=new Set<any>(),animations:any[]=[];
 const haptics:string[]=[];let hapticsEnabled=true;
 let cursor=0,time=0,reduced=false,active=true,reads=0,wrote=false,readsAfterWrite=0;
 const measure=(value:unknown)=>{reads++;if(wrote)readsAfterWrite++;return value;};
 const rect={left:0,top:150,width:300,height:300},dest={left:10,top:70,width:80,height:40};
 const animate=(frames:unknown,options:unknown)=>{const animation={frames,options,cancelled:false,cancel(){this.cancelled=true;}};animations.push(animation);return animation;};
 const label={textContent:labelText,firstChild:{nodeType:3}};
 const cells=Array.from({length:36},(_,i)=>({getBoundingClientRect:()=>measure({left:i%6*50,top:150+Math.floor(i/6)*50,width:50,height:50})}));
 const destination={dataset:{wordGroup:'0'} as Record<string,string>,querySelectorAll:(s:string)=>measured&&s==='[data-word-label]'?[label]:[],hasAttribute:(name:string)=>name==='data-word-group',getBoundingClientRect:()=>measure(dest),animate};
 const screen={getBoundingClientRect:()=>measure({left:0,top:0}),querySelector:(selector:string)=>selector==='.letter-board'?{getBoundingClientRect:()=>measure(rect),animate,querySelectorAll:()=>measured?cells:[]}:destination,querySelectorAll:()=>[destination],appendChild:(node:any)=>{wrote=true;sparks.add(node);}};
 const element=()=>{let label='';const children:any[]=[];return {className:'',style:{fontSize:''},children,setAttribute(){},appendChild(child:any){children.push(child);},get textContent():string{return label+children.map(c=>c.textContent).join('');},set textContent(v:string){label=v;},animate,remove(){sparks.delete(this);}};};
 const doc=Object.assign(new EventTarget(),{hidden:false,documentElement:{dataset:{} as Record<string,string>},createElement:element,createRange:()=>{let index=0;return{setStart(_node:unknown,start:number){index=start;},setEnd(){},getBoundingClientRect(){const xs=[20,32,39,50,62],widths=[12,7,11,8,9];return measure({left:xs[index],top:80,width:widths[index],height:14});}};}});
 const win=Object.assign(new EventTarget(),{matchMedia:()=>({matches:reduced})});
 const hooks={useLayoutEffect:(fn:()=>any,deps:any[])=>hooks.useEffect(fn,deps),useRef(value:any){return slots[cursor++]??={current:value};},useEffect(fn:()=>any,deps:any[]){const i=cursor++,slot=slots[i];if(!slot||deps.some((d,j)=>!Object.is(d,slot.deps[j]))){slots[i]={deps,cleanup:slot?.cleanup};effects.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}}};
 const exports:any={};
 vm.runInNewContext(ts.transpileModule(readFileSync('components/game/WordFeedback.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:(name:string)=>name==='react'?hooks:name==='@/lib/game/word-feedback'?feedback:name==='@/lib/game/board-view'?{viewCell}:name==='@/lib/platform/runtime'?{gameIsActive:()=>active}:name==='@/lib/game/haptics'?{playHaptic:(cue:string,enabled:boolean)=>{if(enabled)haptics.push(cue);}}:name==='./PlayPreferences'?{usePlayHapticsEnabled:()=>hapticsEnabled}:{},window:win,document:doc,getComputedStyle:(el:any)=>({fontSize:el===label?'14px':'38px',fontFamily:'Nunito Sans',fontWeight:'800',color:'#173e36'}),setTimeout:(fn:()=>void)=>{timers.set(++time,fn);return time;},clearTimeout:(id:number)=>timers.delete(id)});
 const stroke=(id:string)=>({id,a:[0,0],b:[0,3]});
 const props:any={root:{current:screen},scope:'A',board:{size:6,grid:Array.from({length:6},()=>[...'KALEXX']),targets:Array.from({length:8},(_,i)=>({id:String(i),group:0,text:'KALE',label:'KALE'}))},confirmed:initial.map(stroke),turned:false,paused:false};
 const render=(changes:any={})=>{Object.assign(props,changes);cursor=0;wrote=false;exports.WordFeedback(props);while(effects.length)effects.shift()!();};render();
 return {render,destination,haptics,setHaptics(enabled:boolean){hapticsEnabled=enabled;render();},get glyphs(){return [...sparks].flatMap(s=>s.children);},get reads(){return reads;},get readsAfterWrite(){return readsAfterWrite;},confirm:(ids:string[])=>render({confirmed:ids.map(stroke)}),get sparks(){return sparks.size;},get labels(){return [...sparks].map(s=>s.textContent);},get timers(){return timers.size;},animations,props,reduced(value:boolean){reduced=value;},hide(){doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));},show(){doc.hidden=false;},blur(){win.dispatchEvent(new Event('blur'));},pause(){active=false;render({paused:true});},expire(){for(const fn of [...timers.values()])fn();},close(){for(const slot of slots)slot.cleanup?.();}};
}
describe('actual decorative effect lifecycle',()=>{
 it('flies a local match while authoritative state is empty and keeps the same flight on ACK',()=>{
  const h=harness(),preview={id:'0',a:[0,0],b:[0,3]};
  try{h.render({preview});assert.equal(h.sparks,1);assert.equal(h.props.confirmed.length,0);const count=h.animations.length;h.render({confirmed:[preview],preview:null});assert.equal(h.sparks,1);assert.equal(h.animations.length,count);assert(h.animations.every(a=>!a.cancelled));}finally{h.close();}
 });
 it('withdraws rejected feedback and its landing marker, and animates the same valid retry',()=>{
  const h=harness(),preview={id:'0',a:[0,0],b:[0,3]};
  try{h.render({preview});assert.equal(h.sparks,1);h.render({preview:null});assert.equal(h.sparks,0);assert.equal(h.timers,0);assert.equal(h.destination.dataset['wordArriving'],undefined);assert(h.animations.every(a=>a.cancelled));h.render({preview});assert.equal(h.sparks,1);assert.equal(h.props.confirmed.length,0);}finally{h.close();}
 });
 it('keeps resumed ink silent; final confirmed words animate without waiting for input or awarding state',()=>{const h=harness(['0']);try{assert.equal(h.sparks,0);h.confirm(['0','1']);assert.equal(h.sparks,1);h.render();assert.equal(h.sparks,1);h.expire();assert.equal(h.sparks,0);assert.equal(h.timers,0);h.confirm(['0','1']);assert.equal(h.sparks,0);}finally{h.close();}});
 it('bounds rapid confirmations to four sparks and cleans all timers/animations on unmount',()=>{const h=harness();for(let i=1;i<=8;i++)h.confirm(Array.from({length:i},(_,j)=>String(j)));assert.equal(h.sparks,4);assert.equal(h.timers,4);h.close();assert.equal(h.sparks,0);assert.equal(h.timers,0);assert(h.animations.every(a=>a.cancelled));});
 it('cancels on rotation, background and pause without replaying consumed words',()=>{for(const action of ['turn','hide','pause'] as const){const h=harness();try{h.confirm(['0']);assert.equal(h.sparks,1);if(action==='turn')h.render({turned:true});else if(action==='hide')h.hide();else h.pause();assert.equal(h.sparks,0);assert.equal(h.timers,0);h.show();h.render({paused:false});assert.equal(h.sparks,0);}finally{h.close();}}});
 it('reduced motion consumes confirmation without movement or delayed celebration',()=>{const h=harness();try{h.reduced(true);h.confirm(['0']);assert.equal(h.sparks,0);h.reduced(false);h.confirm(['0']);assert.equal(h.sparks,0);h.confirm(['0','1']);assert.equal(h.sparks,1);}finally{h.close();}});
 it('an explicit replay is mounted fresh, cancelling previous work and accepting the same word once',()=>{const h=harness();h.confirm(['0']);h.close();assert.equal(h.timers,0);const replay=harness();try{replay.confirm(['0']);assert.equal(replay.sparks,1);replay.confirm(['0']);assert.equal(replay.sparks,1);}finally{replay.close();}});
});

it('flies only the letters actually found without exposing an unfinished hidden answer',()=>{const h=harness();try{
 const first={id:'0',a:[0,0],b:[0,7]},second={id:'1',a:[1,0],b:[1,5]};
 h.render({board:{size:9,grid:[[...'KUYRUKLUX'],[...'YILDIZXXX'],...Array.from({length:7},()=>[...'XXXXXXXXX'])],targets:[{id:'0',group:0,text:'KUYRUKLU',label:'KUYRUKLU YILDIZ'},{id:'1',group:0,text:'YILDIZ',label:'KUYRUKLU YILDIZ'}]}});
 h.render({confirmed:[first]});assert.deepEqual(h.labels,['KUYRUKLU']);h.render({confirmed:[first,second]});assert.deepEqual(h.labels,['KUYRUKLU','YILDIZ']);
}finally{h.close();}});


it('does no geometry work for repeated confirmed state and batches all fresh geometry before writes',()=>{
 const h=harness(['0']);try{assert.equal(h.reads,0);h.confirm(['0']);assert.equal(h.reads,0);h.confirm(['0','1','2','3']);assert.equal(h.sparks,3);assert.equal(h.reads,3);assert.equal(h.readsAfterWrite,0);const reads=h.reads;for(let i=0;i<50;i++)h.confirm(['0','1','2','3']);assert.equal(h.reads,reads);}finally{h.close();}
});

describe('letter flight geometry',()=>{
 const rect={left:20,top:200,width:300,height:300},root={left:10,top:20},dest={left:80,top:80,width:100,height:32};
 const target={id:'0',group:0,text:'KALE',label:'KALE'};
 it('starts each glyph at its own cell, including reverse and turned selections',()=>{
  const board={size:6,grid:[[...'KALEXX'],...Array.from({length:5},()=>[...'XXXXXX'])]};
  for(const turned of [false,true])for(const reverse of [false,true]){
   const a:[number,number]=reverse?[0,3]:[0,0],b:[number,number]=reverse?[0,0]:[0,3];
   const plan=wordFlightPlan(board,{id:'0',a,b},target,turned,rect,root,dest)!;
   assert.equal(plan.letters.map(l=>l.text).join(''),'KALE');
   assert.deepEqual(plan.letters.map(l=>[l.x,l.y]),turned?[[285,455],[235,455],[185,455],[135,455]]:[[35,205],[85,205],[135,205],[185,205]]);
   assert(plan.letters.every(l=>l.ty===76));assert(plan.letters.every(l=>l.tx>=70&&l.tx<=170));
  }
 });
 it('keeps diagonal sources diagonal and never invents letters for a mismatching path',()=>{
  const grid=Array.from({length:6},()=>[...'XXXXXX']);[...'KALE'].forEach((c,i)=>grid[i]![i]=c);
  const plan=wordFlightPlan({size:6,grid},{id:'0',a:[0,0],b:[3,3]},target,false,rect,root,dest)!;
  assert.deepEqual(plan.letters.map(l=>[l.x,l.y]),[[35,205],[85,255],[135,305],[185,355]]);
  assert.equal(wordFlightPlan({size:6,grid},{id:'0',a:[0,0],b:[0,3]},target,false,rect,root,dest),null);
 });
 it('animates glyphs together and reaches the target before cleanup',()=>{
  const h=harness();try{h.confirm(['0']);assert.equal(h.animations.length,5);
   const letters=h.animations.slice(0,4);assert.deepEqual(letters.map(a=>a.options.delay),[0,12,24,36]);
   for(const a of letters){assert.equal(a.options.duration,WORD_FLIGHT_MS);assert.equal(a.frames.at(-2).opacity,1);assert.equal(a.frames.at(-1).opacity,0);assert(a.options.duration+a.options.delay<WORD_RESULT_DELAY_MS);}
   assert.equal(h.readsAfterWrite,0);h.expire();assert(h.animations.every(a=>a.cancelled));assert.equal(h.sparks,0);
  }finally{h.close();}
 });
});

it('holds target decoration until arrival and releases every overlapping owner on interruption',()=>{
 const h=harness();try{h.confirm(['0']);assert.equal(h.destination.dataset['wordArriving'],'true');h.confirm(['0','1']);h.animations[3].onfinish();assert.equal(h.destination.dataset['wordArriving'],'true');h.animations[8].onfinish();assert.equal(h.destination.dataset['wordArriving'],undefined);h.confirm(['0','1','2']);assert.equal(h.destination.dataset['wordArriving'],'true');h.hide();assert.equal(h.destination.dataset['wordArriving'],undefined);h.animations[13].onfinish();assert.equal(h.destination.dataset['wordArriving'],undefined);}finally{h.close();}
});
it('uses actual source font and measured unequal target glyph widths rather than a guessed midpoint',()=>{
 const h=harness([],true);try{h.confirm(['0']);assert.equal(h.glyphs[0].style.fontSize,'38px');assert.equal(h.glyphs[0].style.fontFamily,'Nunito Sans');assert.match(h.animations[0].frames.at(-1).transform,/translate\(26px,87px\)/);assert.match(h.animations[1].frames.at(-1).transform,/translate\(35.5px,87px\)/);assert.match(h.animations[0].frames[1].transform,/translate\(25px,161px\).*scale\(1.12\)/);assert.equal(h.animations[0].options.easing,'linear');assert.equal(h.readsAfterWrite,0);}finally{h.close();}
});

it('lands each glyph on a spaced display label while ignoring the non-grid space',()=>{
 const h=harness([],true,'KA LE');try{h.confirm(['0']);assert.equal(h.glyphs.length,4);assert.match(h.animations[2].frames.at(-1).transform,/translate\(54px,87px\)/);assert.match(h.animations[3].frames.at(-1).transform,/translate\(66.5px,87px\)/);assert.equal(h.readsAfterWrite,0);}finally{h.close();}
});

it('emits one landing haptic only when the final glyph arrives, not on cleanup or ACK',()=>{
 const h=harness();try{const p={id:'0',a:[0,0],b:[0,3]};h.render({preview:p});assert.deepEqual(h.haptics,[]);h.animations[3].onfinish();h.animations[3].onfinish();assert.deepEqual(h.haptics,['landing']);h.render({confirmed:[p],preview:null});h.expire();assert.deepEqual(h.haptics,['landing']);}finally{h.close();}
});
it('late or cancelled landings stay silent after settings, background, rotation, reduced motion or unmount',()=>{
 for(const cancel of ['disabled','hide','turn','reduced','expire','close'] as const){const h=harness();try{h.confirm(['0']);const finish=h.animations[3].onfinish;if(cancel==='disabled')h.setHaptics(false);if(cancel==='hide')h.hide();if(cancel==='turn')h.render({turned:true});if(cancel==='reduced')h.reduced(true);if(cancel==='expire')h.expire();if(cancel==='close')h.close();finish();assert.deepEqual(h.haptics,[],cancel);}finally{h.close();}}
});
