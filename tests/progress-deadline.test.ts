// Real ProgressSync and memberFetch bodies, controlled token/HTTP/JSON and clock.
// No live Firebase configuration, network, DOM or physical-device claim.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {ProgressSync,PROGRESS_SYNC_TIMEOUT,type ProgressSaveStatus} from '../lib/game/progress-sync.ts';
import {emptyProgress,PROGRESS_KEY,progressBoard,cleanSave,type Progress} from '../lib/game/progress.ts';
const compiled=ts.transpileModule(readFileSync('lib/auth/firebase-client.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return {promise,resolve};}
const settle=async()=>{for(let i=0;i<24;i++)await Promise.resolve();};
const discovery=()=>{const board=progressBoard('uzay.0')!;return {...emptyProgress(),saves:{'uzay.0':cleanSave({strokes:board.placements.slice(0,2),elapsed:14,hints:0,complete:false,stars:0},board)}};};

describe('main sync deadline covers the actual auth and response pipeline',()=>{
 for(const method of ['GET','PUT'])for(const stage of ['token','refresh-token','json'])it(method+' can recover from a stalled '+stage+' without applying its late result',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const gate=deferred<any>(),cache=new Map<string,string>(),statuses:ProgressSaveStatus[]=[],exports:Record<string,any>={};
  let armed=method==='GET',requests=0,writes=0,value=emptyProgress(),signal:AbortSignal|undefined,tokenCalls=0;
  const user={getIdToken:async(force=false)=>{tokenCalls++;if(armed&&(stage==='token'&&!force||stage==='refresh-token'&&force))return gate.promise;return 'controlled-test-token';}};
  const fetch=async(_path:string,init:RequestInit)=>{
   if(init.signal?.aborted)throw new Error('Already aborted before HTTP');
   requests++;
   if(armed&&stage==='refresh-token')return {status:401,ok:false,json:async()=>({})};
   return {status:200,ok:true,json:()=>armed&&stage==='json'?gate.promise:Promise.resolve({progress:value})};
  };
  vm.runInNewContext(compiled+'\nexports.__testUser=user=>{active={auth:{currentUser:user},sdk:{}};};',{
   exports,Headers,fetch,require:(name:string)=>{assert.equal(name,'./shared.ts');return {safeReturnTo:()=>'/'};},
  });exports['__testUser'](user);
  const readRemote=async(s:AbortSignal,p?:Progress)=>{
   signal=s;
   const response=await exports['memberFetch']('/api/progress',p?{method:'PUT',body:JSON.stringify({progress:p,expectedOwnerId:'alice'}),signal:s}:{signal:s});
   if(!response.ok)throw new Error('Request rejected');return (await response.json()).progress;
  };
  const sync=new ProgressSync({owner:'alice',storage:{getItem:k=>cache.get(k)??null,setItem:(k,v)=>{cache.set(k,v);}},online:()=>true,read:()=>value,write:p=>{value=p;writes++;},status:s=>statuses.push(s),load:s=>readRemote(s),save:(p,s)=>readRemote(s,p)});
  if(method==='PUT'){await sync.connect();value=discovery();sync.changed(value);armed=true;}
  const pending=method==='GET'?sync.connect():sync.flush();await settle();assert.ok(tokenCalls>0);
  const original=signal!;assert.equal(original.aborted,false);
  if(stage==='token')assert.equal(requests,method==='GET'?0:1);
  if(stage==='refresh-token')assert.equal(requests,method==='GET'?1:2);
  t.mock.timers.tick(PROGRESS_SYNC_TIMEOUT);await pending;assert.equal(original.aborted,true);assert.equal(statuses.at(-1),'offline');
  armed=false;
  if(method==='GET'){value=discovery();sync.changed(value);await sync.connect();}
  await sync.flush();assert.equal(statuses.at(-1),'saved');assert.equal(signal!.aborted,false);assert.notEqual(signal,original);
  const count=requests,applied=writes,reported=statuses.length,state=JSON.stringify(value);
  gate.resolve(stage==='json'?{progress:{...emptyProgress(),sound:true}}:'late-controlled-token');await settle();
  assert.equal(requests,count);assert.equal(writes,applied);assert.equal(statuses.length,reported);assert.equal(JSON.stringify(value),state);assert.ok(cache.get(PROGRESS_KEY+':alice')?.includes('uzay.0'));
  sync.dispose();
 });
});
