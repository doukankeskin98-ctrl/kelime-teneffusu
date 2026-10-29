// Actual Solo/GameApp/notice bodies with controlled hooks, auth, IO and timers.
// This is not DOM, concurrent React, native dialog or provider/device timing evidence.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {fixture} from './fixtures.ts';
import * as catalog from '../lib/game/catalog.ts';
import * as content from '../lib/game/content.ts';
import * as engine from '../lib/game/engine.ts';
import * as progress from '../lib/game/progress.ts';
import * as discovery from '../lib/game/discovery.ts';
import * as action from '../lib/game/daily-action.ts';
import * as pending from '../lib/game/daily-pending.ts';
type Node={type:unknown;props:Record<string,any>};
type Slot={value?:any;ref?:{current:any};deps?:unknown[];cleanup?:()=>void};
function nodes(v:any):Node[]{return Array.isArray(v)?v.flatMap(nodes):v&&typeof v==='object'?[v,...['children','aside','footer','effect'].flatMap(k=>nodes(v.props?.[k]))]:[];}
function text(v:any):string{return typeof v==='string'||typeof v==='number'?String(v):Array.isArray(v)?v.map(text).join(''):v&&typeof v==='object'?text(v.props?.['children']):'';}
function deferred<T>(){let resolve!:(r:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
function tabStorage(){const values=new Map<string,string>();return{values,failRead:false,failWrite:false,failClear:false,getItem(key:string){if(this.failRead)throw new Error('Storage read');return values.get(key)??null;},setItem(key:string,value:string){if(this.failWrite)throw new Error('Storage write');values.set(key,value);},removeItem(key:string){if(this.failClear)throw new Error('Storage clear');values.delete(key);}};}
const icons=new Proxy({},{get:(_t,key)=>String(key)}),jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
const compiled=(file:string)=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function view(file:string,modules:Record<string,unknown>,globals:Record<string,unknown>={}){
 const slots:Slot[]=[],effects:(()=>void)[]=[],intervals=new Map<number,()=>void>(),exports:Record<string,any>={};let cursor=0,dirty=true,id=0,tree:any,render:()=>any,afterUnmount=0,mounted=true;
 const hooks={useState(initial:any){const slot=slots[cursor++]??={value:typeof initial==='function'?initial():initial};return[slot.value,(next:any)=>{if(!mounted)afterUnmount++;const value=typeof next==='function'?next(slot.value):next;if(!Object.is(value,slot.value)){slot.value=value;dirty=true;}}];},useRef(initial:any){return(slots[cursor++]??={}).ref??={current:initial};},useMemo(fn:()=>any,deps:unknown[]){const slot=slots[cursor++]??={};if(!slot.deps||deps.some((v,i)=>!Object.is(v,slot.deps![i]))){slot.deps=deps;slot.value=fn();}return slot.value;},useEffect(fn:()=>void|(()=>void),deps:unknown[]){const slot=slots[cursor++]??={};if(!slot.deps||deps.some((v,i)=>!Object.is(v,slot.deps![i]))){slot.deps=deps;effects.push(()=>{slot.cleanup?.();const clean=fn();slot.cleanup=typeof clean==='function'?clean:undefined;});}}};
 vm.runInNewContext(compiled(file),{exports,require:(name:string)=>name==='react'?hooks:name==='react/jsx-runtime'?{jsx,jsxs:jsx,Fragment:'Fragment'}:name==='lucide-react'?icons:name==='@/lib/game/daily-pending'?pending:modules[name]??new Proxy({},{get:(_t,key)=>String(key)}),window:Object.assign(new EventTarget(),{matchMedia:()=>({matches:true}),scrollTo(){}}),document:Object.assign(new EventTarget(),{hidden:false,getElementById:()=>null}),navigator:{onLine:true},sessionStorage:tabStorage(),localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},Date,URL,URLSearchParams,Event,Error,AbortController,crypto,setTimeout,clearTimeout,setInterval:(fn:()=>void)=>{intervals.set(++id,fn);return id;},clearInterval:(id:number)=>intervals.delete(id),...globals});
 const paint=(commit=true)=>{for(let i=0;(dirty||(commit&&effects.length))&&i<40;i++){if(dirty){dirty=false;cursor=0;tree=render();}if(commit)while(effects.length)effects.shift()!();}return tree;};
 const find=(type:string)=>{const n=nodes(tree).find(n=>n.type===type);assert.ok(n,type);return n;};
 return{exports,find,paint,start(fn:()=>any){render=fn;return paint();},change(commit=true){dirty=true;paint(commit);},state(predicate:(value:any)=>boolean,next:any,commit=true){const slot=slots.find(s=>predicate(s.value));assert.ok(slot);slot.value=next;dirty=true;paint(commit);},async settle(commit=true){for(let i=0;i<30;i++){await Promise.resolve();paint(commit);}return tree;},tick(){for(const fn of [...intervals.values()])fn();paint();},get tree(){return tree;},get afterUnmount(){return afterUnmount;},close(){mounted=false;for(const slot of slots)slot.cleanup?.();intervals.clear();}};
}
async function solo(options:{storage?:ReturnType<typeof tabStorage>;f?:ReturnType<typeof fixture>;initial?:action.DailyReply}={}){
 const storage=options.storage??tabStorage();
 const f=options.f??fixture(Date.parse('2026-10-28T08:00Z')),initial=options.initial??await f.game.daily('alice'),spec=engine.dailySpec(initial.day),board=engine.makePuzzle(spec.themeId,spec.level,spec.seed),gate=deferred<action.DailyReply>(),gates=[gate],calls:any[]=[],sounds:boolean[]=[],writes:progress.Progress[]=[];let owner='alice',now=initial.serverNow,value=progress.emptyProgress();
 class Clock extends Date{static override now(){return now;}}
 const h=view('components/game/Solo.tsx',{'@/lib/game/catalog':catalog,'@/lib/game/content':content,'@/lib/game/engine':engine,'@/lib/game/progress':progress,'@/lib/game/discovery':discovery,'@/lib/game/daily-action':action,'@/lib/game/telemetry':{track(){}},'./daily-transport':{requestDaily:async(id:string,who:string,intent:action.DailyIntent|null,signal:AbortSignal)=>{const current=calls.length?deferred<action.DailyReply>():gate;if(calls.length)gates.push(current);calls.push({id,who,intent,signal});return current.promise;}},'./DailyActionNotice':{DailyActionNotice:'DailyActionNotice'},'./Discovery':{DiscoveryResult:'DiscoveryResult'},'./common':{PlayLayout:'PlayLayout',PlayControls:'PlayControls',Modal:'Modal',Help:'Help',WordList:'WordList',useChime:()=>((finished:boolean)=>sounds.push(finished))}},{Date:Clock,sessionStorage:storage});
 const update=(fn:(p:progress.Progress)=>progress.Progress)=>{value=fn(value);writes.push(value);h.change();};
 h.start(()=>h.exports['Solo']({ownerId:owner,config:{themeId:spec.themeId,level:spec.level},daily:initial,progress:value,onProgress:update,onBack(){},onMap(){},onNext(){}}));
 return{...h,get tree(){return h.tree;},get afterUnmount(){return h.afterUnmount;},storage,gates,f,initial,board,gate,calls,sounds,writes,get value(){return value;},layout:()=>h.find('PlayLayout'),controls:()=>h.find('PlayControls'),notice:()=>h.find('DailyActionNotice'),hint(){h.find('PlayControls').props['onHint']();},commit(index=0){const p=board.placements[index]!;h.find('PlayLayout').props['onCommit'](p.a,p.b);},switchOwner(next:string,commit=true){owner=next;h.change(commit);},advance(ms:number){now+=ms;h.tick();}};
}

describe('actual daily Solo pending and lifetime UI',()=>{
 it('blocks new input without hiding the board, keeps the clock running and only updates hints after confirmation',async()=>{
  const h=await solo();try{
   h.hint();h.hint();h.commit();await h.settle();assert.equal(h.calls.length,1);assert.equal(h.controls().props['blocked'],true);assert.equal(h.controls().props['busy'],true);assert.equal(h.layout().props['paused'],false);assert.equal(h.layout().props['readOnly'],false);assert.equal(h.layout().props['inputBlocked'],true);assert.equal(h.controls().props['hints'],3);assert.equal(h.notice().props['state'].phase,'sending');assert.equal(h.sounds.length,0);
   const before=text(h.tree);h.advance(2000);await h.settle();assert.notEqual(text(h.tree),before);
   const result=await h.f.game.dailyClaim('alice',h.initial.id,null,null,true,h.calls[0].intent.requestId) as action.DailyReply;h.gate.resolve(result);await h.settle();assert.equal(h.controls().props['hints'],2);assert.equal(h.controls().props['blocked'],false);assert.match(text(h.tree),/\+15 saniye/);
  }finally{h.close();}
 });
 it('shows explicit recovery after a timeout and retains the same hint operation on retry',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const h=await solo();try{
   h.hint();await h.settle();t.mock.timers.tick(action.DAILY_REQUEST_TIMEOUT);await h.settle();assert.equal(h.notice().props['state'].phase,'uncertain');assert.equal(h.layout().props['inputBlocked'],true);assert.equal(h.controls().props['busy'],false);assert.equal(h.controls().props['hints'],3);h.notice().props['onRetry']();await h.settle();assert.equal(h.calls[1].intent,null);assert.equal(h.notice().props['state'].phase,'checking');
  }finally{h.close();}
 });
 it('never applies a late completed day or chime after account switch before cleanup, including A→B→A',async()=>{
  const h=await solo();try{
   h.commit();await h.settle();h.switchOwner('bob',false);h.switchOwner('alice',false);
   for(const p of h.board.placements)await h.f.game.dailyClaim('alice',h.initial.id,p.a,p.b);
   h.gate.resolve(await h.f.game.dailyState('alice',h.initial.id));await h.settle(false);
   assert.equal(h.layout().props['inputBlocked'],true);assert.equal(h.notice().props['state'].phase,'account-changed');assert.equal(h.layout().props['readOnly'],false);assert.equal(h.sounds.length,0);assert.equal(h.writes.length,0);assert.equal(h.value.days.length,0);
  }finally{h.close();}
 });
 it('keeps pending daily ink out of the word list and hides its popup during help',async()=>{
  const h=await solo();try{h.commit();await h.settle();assert.equal(h.layout().props['strokes'].length,1);assert.equal(h.layout().props['wordList'].strokes.length,0);const p=h.board.placements[0]!;h.gate.resolve(await h.f.game.dailyClaim('alice',h.initial.id,p.a,p.b));await h.settle();assert.equal(h.layout().props['wordList'].strokes.length,1);h.controls().props['onHelp']();await h.settle();assert.equal(h.layout().props['wordListUnavailable'],true);assert.equal(h.layout().props['paused'],false);}finally{h.close();}
 });
 it('aborts on unmount and ignores a later response without writing a day or changing UI',async()=>{
  const h=await solo();h.hint();await h.settle();h.close();assert.equal(h.calls[0].signal.aborted,true);h.gate.resolve({...h.initial,hints:1,hintCell:[0,0]});await h.settle(false);assert.equal(h.afterUnmount,0);assert.equal(h.writes.length,0);assert.equal(h.sounds.length,0);
 });
 it('restores the same hint after a Solo remount, checks first and reuses it after a late commit',async()=>{
  const first=await solo();first.hint();await first.settle();const original=first.calls[0].intent;first.close();
  const next=await solo({storage:first.storage,f:first.f,initial:await first.f.game.dailyState('alice',first.initial.id)});try{
   assert.equal(next.calls[0].intent,null);assert.equal(next.layout().props['inputBlocked'],true);next.gates[0]!.resolve(await next.f.game.dailyState('alice',next.initial.id));await next.settle();assert.equal(next.notice().props['state'].phase,'uncertain');assert.equal(next.controls().props['hints'],3);assert.equal(next.calls.length,1);
   next.notice().props['onRetry']();await next.settle();assert.equal(next.calls[1].intent,null);next.gates[1]!.resolve(await next.f.game.dailyState('alice',next.initial.id));await next.settle();assert.equal(JSON.stringify(next.calls[2].intent),JSON.stringify(original));
   const accepted=await next.f.game.dailyClaim('alice',next.initial.id,null,null,true,original.requestId);first.gate.resolve(accepted);await next.settle();assert.ok(pending.readDailyPending(()=>next.storage,'alice'));assert.equal(next.layout().props['inputBlocked'],true);next.gates[2]!.resolve(await next.f.game.dailyClaim('alice',next.initial.id,null,null,true,original.requestId));await next.settle();assert.equal(next.controls().props['hints'],2);assert.equal(next.layout().props['inputBlocked'],false);assert.equal(pending.readDailyPending(()=>next.storage,'alice'),null);assert.equal((await next.f.game.dailyState('alice',next.initial.id)).hints,1);assert.equal(first.afterUnmount,0);
  }finally{next.close();}
 });
 it('shows a working storage retry without sending an unrecorded hint',async()=>{
  const h=await solo();try{h.storage.failWrite=true;h.hint();await h.settle();assert.equal(h.calls.length,0);assert.equal(h.notice().props['state'].phase,'storage-error');assert.equal(h.layout().props['inputBlocked'],true);assert.equal(h.controls().props['hints'],3);
   h.storage.failWrite=false;h.notice().props['onRetry']();await h.settle();assert.equal(h.calls[0].intent,null);h.gates[0]!.resolve(await h.f.game.dailyState('alice',h.initial.id));await h.settle();const intent=h.calls[1].intent;h.gates[1]!.resolve(await h.f.game.dailyClaim('alice',h.initial.id,null,null,true,intent.requestId));await h.settle();assert.equal(h.controls().props['hints'],2);assert.equal(h.layout().props['inputBlocked'],false);
  }finally{h.close();}
 });
});
async function app(storage=tabStorage()){
 let revision=0,serverOwner='alice',profileReads=0;const browser=Object.assign(new EventTarget(),{matchMedia:()=>({matches:true}),scrollTo(){}});
 const f=fixture(Date.parse('2026-10-28T08:00Z')),daily=await f.game.daily('alice'),gates:ReturnType<typeof deferred<any>>[]=[],calls:any[]=[],account=(id:string)=>({authenticated:true,kind:'guest',profile:{id,nickname:id}}),p={...progress.emptyProgress(),tutorialDone:true};
 const h=view('components/game/App.tsx',{'@/lib/game/catalog':catalog,'@/lib/game/content':content,'@/lib/game/engine':engine,'@/lib/game/progress':progress,'@/lib/game/daily-action':action,'@/lib/game/legacy':{SAVE_KEY:'legacy'},'@/components/auth/useMembership':{useMembership:()=>({ready:true,revision,user:null,available:false})},'./useCloudProgress':{useCloudProgress:()=> 'local'},'./Pages':{DailyPage:'DailyPage',Explore:'Explore',ProfilePage:'ProfilePage'},'./Solo':{Solo:'Solo'},'./daily-transport':{requestDaily:async(id:string,owner:string,intent:unknown,signal:AbortSignal)=>{const gate=deferred<any>();gates.push(gate);calls.push({name:'dailyState',id,owner,intent,signal});return gate.promise;}},'./common':{Help:'Help',Modal:'Modal',getApi:async()=>{profileReads++;return account(serverOwner);},api:async(name:string,data:unknown,signal:AbortSignal)=>{const gate=deferred<any>();gates.push(gate);calls.push({name,data,signal});return gate.promise;}}},{window:browser,sessionStorage:storage,location:{href:'https://test/?sekme=gunluk',pathname:'/',search:'?sekme=gunluk'},history:{replaceState(){}},localStorage:{getItem:(key:string)=>key===progress.PROGRESS_KEY+':last-user'?'alice':JSON.stringify(p),setItem(){}}});
 browser.addEventListener('kt-auth-updated',()=>{revision++;h.change();});
 h.start(()=>h.exports['GameApp']({}));await h.settle();return{...h,storage,get revision(){return revision;},get profileReads(){return profileReads;},setServerOwner(id:string){serverOwner=id;},get tree(){return h.tree;},get afterUnmount(){return h.afterUnmount;},f,daily,gates,calls,account,start(){h.find('DailyPage').props['start']();},switchOwner(id:string,commit=true){h.state(v=>v?.authenticated===true&&v?.profile?.id,account(id),commit);}};
}
describe('daily startup binds its initial attempt to the intended profile',()=>{
 it('bounds startup, recovers on a fresh click and sends the captured owner guard',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const h=await app();try{h.start();await h.settle();assert.equal(h.calls[0].data.expectedOwnerId,'alice');assert.equal(h.find('DailyPage').props['busy'],true);t.mock.timers.tick(action.DAILY_REQUEST_TIMEOUT);await h.settle();assert.equal(h.find('DailyPage').props['busy'],false);assert.match(h.find('DailyPage').props['error'],/zamanında/);h.start();h.gates[1]!.resolve(h.daily);await h.settle();assert.equal(h.find('Solo').props['ownerId'],'alice');assert.equal(h.find('Solo').props['daily'].id,h.daily.id);}finally{h.close();}
 });
 it('discards an old launch through account bounce before cleanup and leaves no old daily mounted',async()=>{
  const h=await app();try{h.start();await h.settle();h.switchOwner('bob',false);h.switchOwner('alice',false);h.gates[0]!.resolve(h.daily);await h.settle(false);assert.equal(nodes(h.tree).some(n=>n.type==='Solo'),false);assert.equal(h.find('DailyPage').props['busy'],false);}finally{h.close();}
 });
 it('cancels startup when navigating away and ignores a later result',async()=>{
  const h=await app();try{h.start();await h.settle();const button=nodes(h.tree).find(n=>n.type==='button'&&text(n)==='Keşfet')!;assert.ok(button);button.props['onClick']();await h.settle();assert.equal(h.calls[0].signal.aborted,true);h.gates[0]!.resolve(h.daily);await h.settle();assert.equal(nodes(h.tree).some(n=>n.type==='Solo'),false);assert.ok(h.find('Explore'));}finally{h.close();}
 });
 it('refreshes the profile on daily back before a new launch uses the updated owner',async()=>{
  const h=await app();try{h.start();h.gates[0]!.resolve(h.daily);await h.settle();const reads=h.profileReads;h.setServerOwner('bob');h.find('Solo').props['onBack']();await h.settle();assert.equal(h.revision,1);assert.equal(h.profileReads,reads+1);assert.ok(h.find('DailyPage'));h.start();await h.settle();assert.equal(h.calls[1].data.expectedOwnerId,'bob');}finally{h.close();}
 });
 it('uses a stored same-attempt read across a fresh App mount and a changed calendar day',async()=>{
  const first=await app();pending.dailyIntentStore(()=>first.storage,'alice',first.daily).save({kind:'hint',requestId:'00000000-0000-4000-8000-000000000001'});const original=first.daily;first.close();
  const h=await app(first.storage);try{h.start();await h.settle();assert.equal(h.calls.length,1);assert.equal(h.calls[0].name,'dailyState');assert.equal(h.calls[0].id,original.id);assert.equal(h.calls[0].owner,'alice');h.gates[0]!.resolve({...original,serverNow:original.serverNow+86400000});await h.settle();assert.equal(h.find('Solo').props['daily'].id,original.id);assert.equal(h.find('Solo').props['daily'].day,original.day);assert.ok(pending.readDailyPending(()=>h.storage,'alice'));}finally{h.close();}
 });
 it('does not create a new daily on unreadable pending data or a mismatched recovery response',async()=>{
  const h=await app();try{h.storage.failRead=true;h.start();await h.settle();assert.equal(h.calls.length,0);assert.equal(h.find('DailyPage').props['busy'],false);assert.match(h.find('DailyPage').props['error'],/sekmedeki/);h.storage.failRead=false;
   pending.dailyIntentStore(()=>h.storage,'alice',h.daily).save({kind:'hint',requestId:'00000000-0000-4000-8000-000000000001'});h.start();await h.settle();assert.equal(h.calls[0].name,'dailyState');h.gates[0]!.resolve({...h.daily,id:crypto.randomUUID()});await h.settle();assert.equal(nodes(h.tree).some(n=>n.type==='Solo'),false);assert.match(h.find('DailyPage').props['error'],/eşleşmedi/);assert.ok(pending.readDailyPending(()=>h.storage,'alice'));}finally{h.close();}
 });
});

describe('daily notice recovery controls',()=>{
 it('announces waiting honestly and offers working recovery/back without exposing actions as success',()=>{
  const h=view('components/game/DailyActionNotice.tsx',{});let retry=0,back=0;
  const render=(phase:string)=>h.exports['DailyActionNotice']({state:{phase,intent:{kind:'hint'},message:'Bekleme süresi doldu.'},onRetry:()=>retry++,onBack:()=>back++});
  assert.equal(render('idle'),null);for(const phase of ['sending','checking']){const tree=render(phase);assert.match(text(tree),/süre devam eder/);assert.equal(nodes(tree).some(n=>n.type==='button'),false);assert.equal(tree.props['role'],'status');}
  const error=render('uncertain');assert.match(text(error),/sunucuya ulaşmış olabilir/);const buttons=nodes(error).filter(n=>n.type==='button');assert.equal(buttons.length,2);buttons[0]!.props['onClick']();buttons[1]!.props['onClick']();assert.equal(retry,1);assert.equal(back,1);
  const storage=render('storage-error');assert.match(text(storage),/Kaydı yeniden dene/);nodes(storage).filter(n=>n.type==='button')[0]!.props['onClick']();assert.equal(retry,2);
  for(const phase of ['account-changed','unavailable','expired'])assert.equal(nodes(render(phase)).filter(n=>n.type==='button').length,1);
 });
});
