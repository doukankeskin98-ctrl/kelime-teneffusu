// Real progress route/store/SQLite, hook and notice with controlled auth and hook/IO boundaries.
// Not a live-account, DOM, concurrent React, phone or identity-provider test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {CloudProgress} from '../lib/game/cloud.ts';
import * as sync from '../lib/game/progress-sync.ts';
import {emptyProgress,PROGRESS_KEY,progressBoard,cleanSave,type Progress} from '../lib/game/progress.ts';
import {GameError} from '../lib/game/server.ts';
import {IdentityError} from '../lib/auth/verify.ts';
import {fixture} from './fixtures.ts';
const compile=(file:string)=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const changed=()=>{const b=progressBoard('uzay.0')!;return {...emptyProgress(),saves:{'uzay.0':cleanSave({strokes:b.placements.slice(0,1),elapsed:12,hints:0,complete:false,stars:0},b)}};};
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return {promise,resolve};}
async function route(){
 const f=fixture(),exports:Record<string,any>={};let reads=0,writes=0;
 class Store extends CloudProgress {override async read(id:string){reads++;return super.read(id);}override async save(id:string,value:unknown){writes++;return super.save(id,value);}}
 const modules:Record<string,unknown>={'cloudflare:workers':{env:{DB:f.db}},'@/lib/auth/server':{gameMember:async(r:Request)=>r.headers.has('x-test-owner')?{userId:r.headers.get('x-test-owner')}:null,authJson:(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}}),boundedJson:(r:Request)=>r.json(),requireSameOrigin:(r:Request)=>{if(r.headers.get('Origin')!=='https://test')throw new IdentityError('origin',403);}},'@/lib/game/cloud':{CloudProgress:Store},'@/lib/game/server':{GameError},'@/lib/auth/verify':{IdentityError},'@/lib/game/security':{rateLimit:async()=>{}},'@/lib/studio/health':{recordOperationalFault:async()=>{}}};
 vm.runInNewContext(compile('app/api/progress/route.ts'),{exports,URL,require:(n:string)=>{assert.ok(n in modules,n);return modules[n];}});
 const store=new CloudProgress(f.db);await store.save('alice',{...emptyProgress(),sound:true});await store.save('bob',emptyProgress());
 return {store,get reads(){return reads;},get writes(){return writes;},request:(method:'GET'|'PUT',owner:string|undefined,expected?:unknown,guard=true)=>{const url=new URL('https://test/api/progress');if(method==='GET'&&guard)url.searchParams.set('expectedOwnerId',String(expected??''));const headers:Record<string,string>={Origin:'https://test'};if(owner)headers['x-test-owner']=owner;return exports[method](new Request(url,{method,headers,...(method==='PUT'?{body:JSON.stringify({progress:{...emptyProgress(),sound:true,contrast:true},...(guard?{expectedOwnerId:expected}:{})})}:{})})) as Promise<Response>;}};
}
describe('progress route verifies the intended owner before store access',()=>{
 it('rejects mismatched and empty GET without returning or reading another account',async()=>{
  const h=await route();for(const expected of ['alice','']){const response=await h.request('GET','bob',expected);assert.equal(response.status,409);const body=await response.json() as Record<string,unknown>;assert.equal(body['code'],'PROGRESS_OWNER_CHANGED');assert.equal('progress' in body,false);}assert.equal(h.reads,0);
 });
 it('rejects mismatched, empty, null and non-string PUT without changing either account',async()=>{
  const h=await route(),beforeA=await h.store.read('alice'),beforeB=await h.store.read('bob');for(const expected of ['alice','',null,10]){const response=await h.request('PUT','bob',expected);assert.equal(response.status,409);assert.equal((await response.json() as {code:string}).code,'PROGRESS_OWNER_CHANGED');}
  assert.equal(h.writes,0);assert.deepEqual(await h.store.read('alice'),beforeA);assert.deepEqual(await h.store.read('bob'),beforeB);
 });
 it('keeps same-owner and legacy request formats compatible and unauthenticated reads blocked',async()=>{
  const h=await route();assert.equal((await h.request('GET',undefined,'alice')).status,401);
  for(const guard of [true,false]){const get=await h.request('GET','alice','alice',guard);assert.equal(get.status,200);assert.equal((await get.json() as {progress:Progress}).progress.sound,true);assert.equal((await h.request('PUT','alice','alice',guard)).status,200);}
 });
});

type Slot={value?:any;ref?:{current:any};deps?:unknown[];cleanup?:()=>void};
function hook(mode:'owner-load'|'owner-save'|'conflict'|'load-failure'|'body-delay'|'ok'='ok',delay=false){
 const slots:Slot[]=[],effects:(()=>void)[]=[],exports:Record<string,any>={},requests:{url:string;init:RequestInit}[]=[],cache=new Map<string,string>(),gate=deferred<any>(),events=new EventTarget(),doc=Object.assign(new EventTarget(),{hidden:false}),timers=new Map<number,()=>void>();
 let cursor=0,dirty=true,id=0,owner='alice',value=emptyProgress(),status:sync.ProgressSaveStatus='local';
 const update=(next:Progress)=>{value=next;dirty=true;};
 const hooks={useState(initial:any){const slot=slots[cursor++]??={value:typeof initial==='function'?initial():initial};return [slot.value,(next:any)=>{const v=typeof next==='function'?next(slot.value):next;if(!Object.is(v,slot.value)){slot.value=v;dirty=true;}}];},useRef(initial:any){return (slots[cursor++]??={}).ref??={current:initial};},useEffect(fn:()=>void|(()=>void),deps:unknown[]){const slot=slots[cursor++]??={};if(!slot.deps||deps.some((d,i)=>!Object.is(d,slot.deps![i]))){slot.deps=deps;effects.push(()=>{slot.cleanup?.();const clean=fn();slot.cleanup=typeof clean==='function'?clean:undefined;});}}};
 const response=(code?:string)=>code?{ok:false,status:409,json:async()=>({code})}:{ok:true,status:200,json:async()=>({progress:emptyProgress()})};
 const request=async(url:string,init:RequestInit)=>{requests.push({url,init});if(delay&&requests.length===1)return gate.promise;if(mode==='load-failure'&&requests.length===1)throw new Error('Controlled GET failure');if(mode==='body-delay'&&requests.length===1)return {ok:true,status:200,json:()=>gate.promise};if((mode==='owner-load'&&!init.method)||(mode==='owner-save'&&init.method==='PUT'))return response('PROGRESS_OWNER_CHANGED');if(mode==='conflict'&&init.method==='PUT')return response('CONCURRENT_UPDATE');if(init.method==='PUT')return {ok:true,status:200,json:async()=>({progress:JSON.parse(String(init.body)).progress})};return response();};
 const modules={'react':hooks,'@/lib/auth/firebase-client':{memberFetch:request},'@/lib/game/progress-sync':sync};
 vm.runInNewContext(compile('components/game/useCloudProgress.ts'),{exports,require:(n:string)=>modules[n as keyof typeof modules],window:events,document:doc,navigator:{onLine:true},localStorage:{getItem:(k:string)=>cache.get(k)??null,setItem:(k:string,v:string)=>cache.set(k,v)},setInterval:(fn:()=>void)=>{timers.set(++id,fn);return id;},clearInterval:(n:number)=>timers.delete(n)});
 const paint=(commit=true)=>{for(let i=0;dirty&&i<30;i++){dirty=false;cursor=0;status=exports['useCloudProgress'](owner,value,update,true);if(commit)while(effects.length)effects.shift()!();}return status;};
 paint();
 return {requests,cache,gate,response,async settle(commit=true){for(let i=0;i<24;i++){await Promise.resolve();paint(commit);}return status;},change(p:Progress){value=p;dirty=true;paint();},switchBeforeEffects(next:string,p:Progress){owner=next;value=p;dirty=true;paint(false);},retry(){events.dispatchEvent(new Event('kt-sync-now'));},get value(){return value;},get status(){return status;},unmount(){for(const slot of slots)slot.cleanup?.();}};
}
describe('actual cloud hook guards requests and preserves retry semantics',()=>{
 it('sends its owner in GET and PUT, then blocks that channel only on explicit owner mismatch',async()=>{
  const h=hook('owner-save');await h.settle();h.change(changed());h.retry();await h.settle();assert.equal(new URL(h.requests[0]!.url,'https://test').searchParams.get('expectedOwnerId'),'alice');
  const sent=h.requests.find(r=>r.init.method==='PUT')!;assert.equal(JSON.parse(String(sent.init.body)).expectedOwnerId,'alice');assert.equal(h.status,'account-changed');const count=h.requests.length;h.retry();await h.settle();assert.equal(h.requests.length,count);h.unmount();
 });
 it('handles owner mismatch on initial GET without attempting an upload',async()=>{const h=hook('owner-load');await h.settle();h.change(changed());h.retry();await h.settle();assert.equal(h.status,'account-changed');assert.equal(h.requests.length,1);assert.ok(h.cache.get(PROGRESS_KEY+':alice')?.includes('uzay.0'));h.unmount();});
 it('does not misclassify a normal concurrency409 and continues retrying',async()=>{const h=hook('conflict');await h.settle();h.change(changed());h.retry();await h.settle();assert.equal(h.status,'offline');const count=h.requests.length;h.retry();await h.settle();assert.equal(h.requests.length,count+1);assert.equal(sync.progressOwnerChanged(h.status),false);h.unmount();});
 it('retries the initial failed GET immediately on the manual sync event',async()=>{
  const h=hook('load-failure');await h.settle();assert.equal(h.status,'offline');assert.equal(h.requests.length,1);
  h.change(changed());h.retry();await h.settle();assert.equal(h.requests.filter(r=>!r.init.method).length,2);assert.equal(h.requests.filter(r=>r.init.method==='PUT').length,1);assert.equal(h.status,'saved');assert.equal(h.value.saves['uzay.0']!.strokes.length,1);h.unmount();
 });
 it('retries a body timeout through the same hook and ignores its late response',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const h=hook('body-delay');await h.settle();assert.equal(h.requests.length,1);assert.notEqual(h.status,'saved');
  t.mock.timers.tick(sync.PROGRESS_SYNC_TIMEOUT);await h.settle();assert.equal(h.status,'offline');assert.equal(h.requests[0]!.init.signal!.aborted,true);
  h.change(changed());h.retry();await h.settle();assert.equal(h.status,'saved');const state=JSON.stringify(h.value),count=h.requests.length;
  h.gate.resolve({progress:{...emptyProgress(),sound:true}});await h.settle();assert.equal(JSON.stringify(h.value),state);assert.equal(h.status,'saved');assert.equal(h.requests.length,count);h.unmount();
 });
 it('rejects a late old-owner response before passive cleanup and leaves the new render unchanged',async()=>{
  const h=hook('ok',true),bob={...emptyProgress(),contrast:true};const before=h.cache.get(PROGRESS_KEY+':alice');h.switchBeforeEffects('bob',bob);h.gate.resolve({ok:true,status:200,json:async()=>({progress:{...changed(),sound:true}})});await h.settle(false);
  assert.equal(h.value,bob);assert.equal(h.cache.get(PROGRESS_KEY+':alice'),before);assert.equal(h.cache.has(PROGRESS_KEY+':bob'),false);h.unmount();
 });
});

type Node={type:unknown;props:Record<string,any>};
function nodes(value:any):Node[]{if(Array.isArray(value))return value.flatMap(nodes);return value&&typeof value==='object'?[value,...nodes(value.props?.['children'])]:[];}
function text(value:any):string{return typeof value==='string'?value:Array.isArray(value)?value.map(text).join(''):value&&typeof value==='object'?text(value.props?.['children']):'';}
const noticeExports:Record<string,any>={},jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
vm.runInNewContext(compile('components/game/ProgressAccountNotice.tsx'),{exports:noticeExports,require:(n:string)=>n==='react/jsx-runtime'?{jsx,jsxs:jsx}:n==='@/lib/game/progress-sync'?sync:{}});
describe('account-change recovery notice',()=>{
 it('adds no extra UI in ordinary loading, saved, offline or storage states',()=>{for(const status of ['local','syncing','saved','offline','storage-error'])assert.equal(noticeExports['ProgressAccountNotice']({status,onRefresh(){},onRetry(){}}),null);});
 it('offers profile refresh only after a confirmed local write',()=>{let refresh=0,retry=0;const n=noticeExports['ProgressAccountNotice']({status:'account-changed',onRefresh:()=>refresh++,onRetry:()=>retry++});assert.match(text(n),/bu cihazda kayıtlı/);nodes(n).find(n=>n.type==='button')!.props['onClick']();assert.equal(refresh,1);assert.equal(retry,0);});
 it('does not invite a page reload during an active game with separate unsaved run state',()=>{
  const n=noticeExports['ProgressAccountNotice']({status:'account-changed',inGame:true,onRefresh(){throw new Error('must not refresh');},onRetry(){}});
  assert.equal(nodes(n).some(n=>n.type==='button'),false);assert.match(text(n),/Oyundan çıktıktan sonra/);
 });
 it('offers local retry instead of refresh when storage failed, without claiming the save is safe',()=>{let refresh=0,retry=0;const n=noticeExports['ProgressAccountNotice']({status:'account-changed-storage-error',onRefresh:()=>refresh++,onRetry:()=>retry++});assert.doesNotMatch(text(n),/bu cihazda kayıtlı/);assert.match(text(n),/kayıt yapılamıyor/);nodes(n).find(n=>n.type==='button')!.props['onClick']();assert.equal(refresh,0);assert.equal(retry,1);});
});

const cloudExports:Record<string,any>={};
vm.runInNewContext(compile('components/game/ProgressCloudStatus.tsx'),{exports:cloudExports,require:(n:string)=>n==='react/jsx-runtime'?{jsx,jsxs:jsx}:n==='@/lib/game/progress-sync'?sync:{BookOpen:'book',Cloud:'cloud',CloudOff:'cloud-off',RotateCw:'retry'}});
describe('Album main progress recovery',()=>{
 it('offers a working manual retry only for an unconfirmed cloud save',()=>{
  let calls=0;const node=cloudExports['ProgressCloudStatus']({status:'offline',onRetry:()=>calls++}),button=nodes(node).find(n=>n.type==='button')!;
  assert.match(text(node),/Bulut eşitlemesi bekliyor/);assert.match(text(node),/Ana ilerlemen bu cihazda kayıtlı/);assert.equal(button.props['type'],'button');assert.match(text(button),/Yeniden eşitle/);button.props['onClick']();assert.equal(calls,1);assert.equal(nodes(node).find(n=>n.type==='p')!.props['role'],'status');
  for(const status of ['local','syncing','saved','storage-error','account-changed','account-changed-storage-error'])assert.equal(nodes(cloudExports['ProgressCloudStatus']({status,onRetry(){}})).some(n=>n.type==='button'),false);
 });
 it('does not claim device success in a storage error or cloud success while waiting',()=>{
  const storage=cloudExports['ProgressCloudStatus']({status:'storage-error',onRetry(){}});assert.match(text(storage),/kayıt yapılamıyor/);assert.doesNotMatch(text(storage),/cihazda kayıtlı|bağlantını/i);
  for(const status of ['local','syncing','offline','storage-error','account-changed','account-changed-storage-error'])assert.doesNotMatch(text(cloudExports['ProgressCloudStatus']({status,onRetry(){}})),/bulutla eşitlendi/);
  assert.match(text(cloudExports['ProgressCloudStatus']({status:'saved',onRetry(){}})),/bulutla eşitlendi/);
 });
});
