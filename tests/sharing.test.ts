import assert from 'node:assert/strict';
import {afterEach,describe,it} from 'node:test';
import {GAME_ORIGIN,setNativeTransport} from '../lib/platform/runtime.ts';
import {inviteLink,setNativeSharing,shareLink,shareMessage,shareSucceeded,type InviteKind} from '../lib/platform/sharing.ts';
import {safeReturnTo} from '../lib/auth/shared.ts';

const originalLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
const originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
function location(origin:string){Object.defineProperty(globalThis,'location',{configurable:true,value:{origin,href:origin+'/?token=private&sekme=profil'}});}
function navigator(value:object){Object.defineProperty(globalThis,'navigator',{configurable:true,value});}
afterEach(()=>{setNativeTransport(null);setNativeSharing(null);for(const [key,descriptor] of [['location',originalLocation],['navigator',originalNavigator]] as const){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}});

describe('public invitations',()=>{
 for(const [kind,code] of [['oda','ABCDEFGH'],['arkadas','ABCDEFGH23'],['meydan','23456789AB']] as const){
  it(`keeps the ${kind} invitation and auth return intact across native and web origins`,()=>{
   for(const origin of ['capacitor://localhost','http://localhost','https://kelime-teneffusu.healica.chatgpt.site']){
    location(origin);setNativeTransport(async()=>new Response());
    const url=new URL(inviteLink(kind,code));assert.equal(url.origin,GAME_ORIGIN);assert.equal(url.pathname,'/');assert.equal(url.search,`?${kind}=${code}`);
    const returned=new URL(safeReturnTo(url.pathname+url.search),GAME_ORIGIN);assert.equal(returned.searchParams.get(kind),code);assert.equal(returned.searchParams.get('sekme'),'arena');assert.equal(returned.searchParams.has('token'),false);
   }
   setNativeTransport(null);location('https://game.example');assert.equal(inviteLink(kind,code),`https://game.example/?${kind}=${code}`);
  });
 }
 it('does not construct invites from malformed or credential-like codes',()=>{
  for(const kind of ['oda','arkadas','meydan'] as InviteKind[])for(const code of ['','ABCDEFGH&token=secret','ABCDEFGH23#fragment','https://evil.example','ABCDEFGH2300'])assert.equal(inviteLink(kind,code),'');
 });
 it('can construct a canonical link without a browser global',()=>{Reflect.deleteProperty(globalThis,'location');assert.equal(inviteLink('oda','abcdefgh'),GAME_ORIGIN+'/?oda=ABCDEFGH');});
});

describe('share result and lifecycle',()=>{
 const url=GAME_ORIGIN+'/?oda=ABCDEFGH';
 it('passes the public invitation to the native sheet and reports its actual result',async()=>{
  for(const status of ['shared','copied','cancelled','failed'] as const){
   const calls:unknown[]=[];setNativeSharing({share:async data=>{calls.push(data);return {status};}});
   assert.equal(await shareLink('Birlikte oynayalım',url),status);assert.deepEqual(calls,[{title:'Birlikte oynayalım',url}]);assert.equal(shareSucceeded(status),status==='shared'||status==='copied');
  }
 });
 it('cancellation never copies to the clipboard or displays success, including cross-realm abort errors',async()=>{
  let copies=0;navigator({share:async()=>{throw {name:'AbortError'};},clipboard:{writeText:async()=>{copies++;}}});
  const result=await shareLink('Davet',url);assert.equal(result,'cancelled');assert.equal(copies,0);assert.equal(shareMessage(result),'');assert.equal(shareSucceeded(result),false);
 });
 it('uses the browser share panel without copying when it succeeds',async()=>{
  const payloads:unknown[]=[];navigator({share:async(data:unknown)=>{payloads.push(data);},clipboard:{writeText:async()=>{assert.fail('Unexpected copy');}}});
  assert.equal(await shareLink('Davet',url),'shared');assert.deepEqual(payloads,[{title:'Davet',text:'Davet',url}]);
 });
 it('falls back to copying the exact public URL if browser sharing is unavailable or fails',async()=>{
  for(const share of [undefined,async()=>{throw new Error('Not allowed');}]){const copied:string[]=[];navigator({share,clipboard:{writeText:async(value:string)=>{copied.push(value);}}});assert.equal(await shareLink('Davet',url),'copied');assert.deepEqual(copied,[url]);}
 });
 it('reports an unavailable channel without success or an unhandled rejection',async()=>{
  for(const value of [{},{clipboard:{writeText:async()=>{throw Error('Denied');}}}]){navigator(value);assert.equal(await shareLink('Davet',url),'failed');}
  setNativeSharing({share:async()=>{throw Error('Closed');}});assert.equal(await shareLink('Davet',url),'failed');assert.match(shareMessage('failed'),/Davet kodunu/);
 });
 it('opens only one panel during repeated taps, then allows a new invitation after dismissal',async()=>{
  let resolve!:(value:{status:'cancelled'})=>void,calls=0;const pending=new Promise<{status:'cancelled'}>(r=>{resolve=r;});
  setNativeSharing({share:()=>{calls++;return pending;}});
  const first=shareLink('Davet',url);assert.equal(await shareLink('Davet',url),'busy');assert.equal(calls,1);
  resolve({status:'cancelled'});assert.equal(await first,'cancelled');setNativeSharing({share:async()=>({status:'copied'})});assert.equal(await shareLink('Yeni davet',url),'copied');
 });
 it('does not open a panel for an invalid invitation',async()=>{setNativeSharing({share:async()=>{assert.fail('Invalid invitation');}});assert.equal(await shareLink('Davet',''),'failed');});
});
