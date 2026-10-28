// Actual route/transport bodies, real service/SQLite, controlled authentication boundary.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {fixture} from './fixtures.ts';
import {GameService,GameError} from '../lib/game/server.ts';
import {IdentityError} from '../lib/auth/verify.ts';
import * as action from '../lib/game/daily-action.ts';
const compile=(file:string)=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const key='00000000-0000-4000-8000-000000000001';
async function route(){
 const f=fixture(Date.parse('2026-10-28T08:00Z')),exports:Record<string,any>={};
 class Service extends GameService{constructor(db:any){super(db,f.clock);}}
 const modules:Record<string,unknown>={'cloudflare:workers':{env:{DB:f.db}},'@/lib/auth/server':{gameMember:async(r:Request)=>r.headers.has('x-owner')?{userId:r.headers.get('x-owner'),kind:'guest'}:null,currentPrincipal:async()=>null,accountStore:()=>({}),boundedJson:(r:Request)=>r.json()},'@/lib/game/security':{rateLimit:async()=>{}},'@/lib/auth/verify':{IdentityError},'@/lib/game/server':{GameService:Service,GameError},'@/lib/studio/health':{recordOperationalFault:async()=>{}}};
 vm.runInNewContext(compile('app/api/game/route.ts'),{exports,URL,Response,Object,require:(n:string)=>{assert.ok(n in modules,n);return modules[n];}});
 const initial=await f.game.daily('alice');
 return{...f,initial,request:(method:string,path:string,owner?:string,body?:unknown,origin='https://test')=>exports[method](new Request('https://test/api/game'+path,{method,headers:{Origin:origin,...(owner?{'x-owner':owner}:{})},...(body?{body:JSON.stringify(body)}:{})})) as Promise<Response>};
}

describe('daily endpoint guards existing-attempt recovery and mutation intent',()=>{
 it('requires the same authenticated owner for read-only recovery and never starts another day',async()=>{
  const h=await route();h.setTime(Date.parse('2026-10-29T08:00Z'));const path='?action=dailyState&id='+h.initial.id;
  assert.equal((await h.request('GET',path,undefined)).status,401);
  for(const expected of ['', 'bob']){const response=await h.request('GET',path+'&expectedOwnerId='+expected,'alice');assert.equal(response.status,409);assert.equal((await response.json() as any).code,'DAILY_OWNER_CHANGED');}
  const valid=await h.request('GET',path+'&expectedOwnerId=alice','alice');assert.equal(valid.status,200);const body=await valid.json() as any;assert.equal(body.id,h.initial.id);assert.equal(body.day,'2026-10-28');assert.equal(valid.headers.get('Cache-Control'),'no-store');assert.equal('placements' in body.board,false);assert.equal('hintReceipts' in body,false);
  assert.equal((await h.request('GET',path+'&expectedOwnerId=bob','bob')).status,404);assert.equal((h.sqlite.prepare('SELECT COUNT(*) AS n FROM dailies').get() as any).n,1);
 });
 it('rejects stale owner/start/claim/hint bodies before writes, preserves legacy calls and deduplicates guarded hints',async()=>{
  const h=await route();
  for(const name of ['daily','dailyClaim','dailyHint'])for(const expected of ['bob','',null]){const response=await h.request('POST','','alice',{action:name,id:h.initial.id,expectedOwnerId:expected,requestId:key});assert.equal(response.status,409);assert.equal((await response.json() as any).code,'DAILY_OWNER_CHANGED');}
  assert.equal((await h.game.dailyState('alice',h.initial.id)).hints,0);
  const payload={action:'dailyHint',id:h.initial.id,expectedOwnerId:'alice',requestId:key};for(let i=0;i<2;i++){const r=await h.request('POST','','alice',payload);assert.equal(r.status,200);assert.equal((await r.json() as any).hints,1);}
  assert.equal((await h.request('POST','','alice',{action:'dailyHint',id:h.initial.id})).status,200);assert.equal((await h.game.dailyState('alice',h.initial.id)).hints,2);
  assert.equal((await h.request('POST','','alice',{...payload,requestId:'bad'})).status,400);assert.equal((await h.request('POST','','alice',payload,'https://foreign')).status,403);assert.equal((await h.request('POST','',undefined,payload)).status,401);assert.equal((await h.request('POST','','alice',{action:'daily'})).status,200);
 });
 it('returns explicit terminal codes while preserving accepted receipts and private HTTP responses',async()=>{
  const h=await route(),payload={action:'dailyHint',id:h.initial.id,expectedOwnerId:'alice',requestId:key};await h.request('POST','','alice',payload);
  for(let i=0;i<2;i++)await h.request('POST','','alice',{action:'dailyHint',id:h.initial.id});
  const limit=await h.request('POST','','alice',{...payload,requestId:crypto.randomUUID()});assert.equal(limit.status,400);assert.equal((await limit.json() as any).code,'DAILY_HINT_LIMIT');
  h.advance(86400001);const expired=await h.request('POST','','alice',{...payload,requestId:crypto.randomUUID()});assert.equal(expired.status,409);assert.equal((await expired.json() as any).code,'DAILY_EXPIRED');assert.equal(expired.headers.get('Cache-Control'),'no-store');
  const receipt=await h.request('POST','','alice',payload);assert.equal(receipt.status,200);const body=await receipt.json() as any;assert.equal(body.hints,3);assert.equal('hintReceipts' in body,false);assert.equal('placements' in body.board,false);
 });
});

describe('actual daily transport preserves id and owner through its auth boundary',()=>{
 it('uses same-id GET and same hint key, propagating explicit owner errors',async()=>{
  const exports:Record<string,any>={},calls:{url:string;init:RequestInit}[]=[];let fail=false;
  vm.runInNewContext(compile('components/game/daily-transport.ts'),{exports,require:(n:string)=>n==='@/lib/game/daily-action'?action:{memberFetch:async(url:string,init:RequestInit)=>{calls.push({url,init});return{ok:!fail,status:fail?409:200,json:async()=>fail?{error:'Changed',code:'DAILY_OWNER_CHANGED'}:{id:'attempt'}};}}});
  const signal=new AbortController().signal,send=exports['requestDaily'];await send('attempt','alice',null,signal);assert.equal(new URL(calls[0]!.url,'https://test').searchParams.get('action'),'dailyState');assert.equal(new URL(calls[0]!.url,'https://test').searchParams.get('id'),'attempt');assert.equal(new URL(calls[0]!.url,'https://test').searchParams.get('expectedOwnerId'),'alice');assert.equal(calls[0]!.init.signal,signal);
  await send('attempt','alice',{kind:'hint',requestId:key},signal);const body=JSON.parse(String(calls[1]!.init.body));assert.equal(body.action,'dailyHint');assert.equal(body.requestId,key);assert.equal(body.expectedOwnerId,'alice');fail=true;await assert.rejects(()=>send('attempt','alice',null,signal),(e:any)=>e instanceof action.DailyRequestError&&e.code==='DAILY_OWNER_CHANGED');
 });
});
