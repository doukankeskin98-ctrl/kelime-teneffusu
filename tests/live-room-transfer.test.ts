import assert from 'node:assert/strict';
import {it} from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync('app/api/live/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
for(const via of ['heartbeat','watch'] as const)it('actual SSE route follows a queued room transfer via '+via+' without sending the retired room',async()=>{
 const oldId='00000000-0000-4000-8000-000000000001',newId='00000000-0000-4000-8000-000000000002';let now=100000,calls=0,moved=false;const watched:string[]=[],exports:any={};
 const view=(id:string)=>({id,revision:1,phase:id===oldId?'waiting':'ready',serverNow:now});
 class Service{async state(){calls++;if(calls>1&&via==='heartbeat')moved=true;return view(moved?newId:oldId);}async watch(_user:string,id:string){watched.push(id);if(via==='watch')moved=true;return {revision:1,view:view(moved?newId:oldId)};}}
 class Clock extends Date{static override now(){return now;}}
 const modules:Record<string,unknown>={'cloudflare:workers':{env:{DB:{}}},'@/lib/auth/server':{gameMember:async()=>({userId:'alice'}),authJson:Response.json},'@/lib/game/server':{GameService:Service,GameError:Error},'@/lib/auth/verify':{IdentityError:Error},'@/lib/game/security':{rateLimit:async()=>{}}};
 vm.runInNewContext(code,{exports,require:(name:string)=>modules[name],Date:Clock,URL,Response,TextEncoder,ReadableStream,setTimeout:(fn:()=>void,ms:number)=>{now+=ms;queueMicrotask(fn);return now;},clearTimeout:()=>{}});
 const response=await exports.GET(new Request('https://game.test/api/live?id='+oldId));assert.equal(response.status,200);const text=await response.text();const ids=[...text.matchAll(/event: room\ndata: (.+)/g)].map(m=>JSON.parse(m[1]!).id);assert.deepEqual(ids,[oldId,newId]);assert(watched.includes(newId));const first=watched.indexOf(newId);assert(watched.slice(first).every(id=>id===newId));
});
