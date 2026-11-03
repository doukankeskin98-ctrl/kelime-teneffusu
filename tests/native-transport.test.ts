import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nativeApiTransport,type NativeRequest,type NativeResponse} from '../lib/platform/native-transport.ts';
import {GAME_ORIGIN,appFetch,setNativeTransport,isNativeGame,gameIsActive,setGameActive} from '../lib/platform/runtime.ts';
import {startRoomPolling} from '../lib/platform/room-poll.ts';
const reply=(data:unknown={}):NativeResponse=>({status:200,data,headers:{'set-cookie':'private-session','x-private':'hidden'},url:GAME_ORIGIN+'/api/game'});
const tick=()=>new Promise(resolve=>setTimeout(resolve,2));
test('native API pins host, preserves JSON and auth, strips caller origin/cookies and response secrets',async()=>{
 let sent:NativeRequest|undefined;
 const transport=nativeApiTransport(async options=>{sent=options;return reply({ok:true});});
 const r=await transport('/api/game',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer test',Origin:'https://other.example',Cookie:'bad'},body:JSON.stringify({action:'ready'})});
 assert.equal(sent?.url,GAME_ORIGIN+'/api/game');assert.equal(sent?.headers['Origin'],GAME_ORIGIN);assert.equal(sent?.headers['Cookie'],undefined);assert.equal(sent?.headers['authorization'],'Bearer test');assert.deepEqual(sent?.data,{action:'ready'});assert.equal(sent?.disableRedirects,true);assert.equal(r.headers.get('set-cookie'),null);assert.deepEqual(await r.json(),{ok:true});
});
test('native API rejects external, traversal, streaming and malformed requests before network',async()=>{
 let calls=0;const transport=nativeApiTransport(async()=>{calls++;return reply();});
 for(const path of ['https://other.example/api/game','//other.example/api/game','/api/../secret','/api/live?id=x','/api/game#x'])await assert.rejects(transport(path,{}));
 await assert.rejects(transport('/api/game',{method:'POST',body:'invalid'}));assert.equal(calls,0);
});
test('native API rejects redirected origin and does not replay a mutation',async()=>{
 let calls=0;const transport=nativeApiTransport(async()=>{calls++;return {...reply(),url:'https://other.example/api/game'};});
 await assert.rejects(transport('/api/game',{method:'POST',body:'{}'}));assert.equal(calls,1);
});
test('empty and malformed native responses settle without an orphaned promise',async()=>{
 for(const status of [204,205]){
  const transport=nativeApiTransport(async()=>({...reply({ignored:true}),status}));
  const response=await transport('/api/game',{});assert.equal(response.status,status);assert.equal(await response.text(),'');
 }
 const cyclic:any={};cyclic.self=cyclic;
 for(const value of [{...reply(),status:200.5},reply(cyclic),{...reply(),url:'invalid'}]){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),50);
  try{await assert.rejects(nativeApiTransport(async()=>value)('/api/game',{signal:controller.signal}),error=>error instanceof Error&&error.name!=='AbortError');}
  finally{clearTimeout(timer);}
 }
});
test('abort before dispatch makes no request; abort after dispatch retires late result',async()=>{
 let calls=0,release:(r:NativeResponse)=>void=()=>{};const transport=nativeApiTransport(()=>{calls++;return new Promise(resolve=>{release=resolve;});});
 const first=new AbortController();first.abort();await assert.rejects(transport('/api/game',{signal:first.signal}),{name:'AbortError'});assert.equal(calls,0);
 const second=new AbortController(),pending=transport('/api/game',{signal:second.signal});await tick();second.abort();await assert.rejects(pending,{name:'AbortError'});release(reply());assert.equal(calls,1);
});
test('runtime adapter is opt-in and lifecycle state is explicit',async()=>{
 assert.equal(isNativeGame(),false);setNativeTransport(async()=>new Response('{}'));assert.equal(isNativeGame(),true);await appFetch('/api/game');await assert.rejects(appFetch('https://other.example'));setNativeTransport(null);setGameActive(false);assert.equal(gameIsActive(),false);setGameActive(true);
});
test('room polling pauses, ignores retired responses and never overlaps ordinary polls',async()=>{
 let active=true,calls=0;const pending:Array<(v:number)=>void>=[],accepted:number[]=[];
 const poll=startRoomPolling({read:async()=>{calls++;return new Promise<number>(resolve=>pending.push(resolve));},accept:v=>accepted.push(v),status:()=>{},active:()=>active,interval:5});
 await tick();assert.equal(calls,1);active=false;poll.visibility();pending[0]!(1);await tick();assert.deepEqual(accepted,[]);assert.equal(calls,1);
 active=true;poll.visibility();await tick();assert.equal(calls,2);pending[1]!(2);await tick();assert.deepEqual(accepted,[2]);poll.stop();await new Promise(resolve=>setTimeout(resolve,8));assert.equal(calls,2);
});
