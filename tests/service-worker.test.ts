import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe,it} from 'node:test';

const origin='https://game.test',source=readFileSync('public/sw.js','utf8');
type Operation='open'|'match'|'put'|'keys'|'delete'|'cache-list'|'cache-delete'|'claim';
function harness(options:{fail?:Operation;offline?:boolean;cached?:boolean;full?:boolean;status?:number}={}){
 let claims=0;const deleted:string[]=[];const current='kelime-studio-v3-20261021';
 const handlers:Record<string,(event:any)=>void>={},stored=new Map<string,Response>(),requests:string[]=[],writes:string[]=[];
 if(options.cached)stored.set('/',new Response('cached shell',{headers:{'Content-Type':'text/html'}}));
 const broken=(operation:Operation)=>{if(options.fail===operation)throw new Error('Cache unavailable: '+operation);};
 const cache={async match(key:any){broken('match');return stored.get(typeof key==='string'?key:new URL(key.url).pathname)?.clone();},async put(key:any,response:Response){broken('put');const path=typeof key==='string'?key:new URL(key.url).pathname;writes.push(path);stored.set(path,response.clone());},async keys(){broken('keys');return options.full?Array.from({length:181},(_,i)=>({url:origin+'/assets/old'+i+'.js'})):[];},async delete(){broken('delete');return true;},async addAll(){if(options.fail)throw new Error('Installation cache failed');}};
 runInNewContext(source,{URL,Response,self:{location:{origin},addEventListener(type:string,handler:any){handlers[type]=handler;},clients:{async claim(){claims++;broken('claim');}},skipWaiting(){}},caches:{async open(){broken('open');return cache;},async keys(){broken('cache-list');return [current,'another-app','kelime-studio-old-a','kelime-studio-old-b'];},async delete(key:string){deleted.push(key);if(key.endsWith('-a'))broken('cache-delete');return true;}},async fetch(request:any){requests.push(request.url);if(options.offline)throw new Error('Offline');return new Response('network response',{status:options.status??200,headers:{'Content-Type':request.mode==='navigate'?'text/html':'text/javascript','X-Network':'yes'}});}});
 return {requests,writes,stored,deleted,get claims(){return claims;},async activate(){let promise:Promise<void>|undefined;handlers['activate']!({waitUntil(value:Promise<void>){promise=value;}});return promise;},async get(path='/',mode='navigate',method='GET') {let promise:Promise<Response>|undefined;handlers['fetch']!({request:{url:path.startsWith('https:')?path:origin+path,mode,method},respondWith(value:Promise<Response>){promise=value;}});return promise;},async install(){let promise:Promise<void>|undefined;handlers['install']!({waitUntil(value:Promise<void>){promise=value;}});return promise;}};
}

describe('service worker cache failures do not discard network responses',()=>{
 for(const fail of ['open','put'] as const)it('returns fresh navigation with '+fail+' failure, even when an old shell exists',async()=>{const h=harness({fail,cached:true}),response=await h.get();assert.equal(response?.status,200);assert.equal(response.headers.get('X-Network'),'yes');assert.equal(await response.text(),'network response');});
 for(const fail of ['open','match','put','keys','delete'] as const)it('returns the actual asset with '+fail+' failure',async()=>{const h=harness({fail,full:true}),response=await h.get('/assets/client.js','cors');assert.equal(response?.status,200);assert.equal(await response.text(),'network response');assert.equal(h.requests.length,1);});
 it('still caches healthy HTML and uses the shell for offline query navigation',async()=>{const online=harness();assert.equal(await (await online.get('/?sekme=arsiv'))!.text(),'network response');assert(online.stored.has('/'));const offline=harness({offline:true,cached:true});assert.equal(await (await offline.get('/?sekme=arsiv'))!.text(),'cached shell');});
 for(const fail of [undefined,'open','match'] as const)it('returns an honest503 if neither network nor shell is available: '+fail,async()=>{const response=await harness({offline:true,fail}).get();assert.equal(response?.status,503);assert.match(await response.text(),/önce bir kez internete bağlan/);});
 it('retains network HTTP failures without replacing them with an old shell',async()=>{const h=harness({cached:true,status:503}),response=await h.get();assert.equal(response?.headers.get('X-Network'),'yes');assert.equal(h.writes.length,0);});
 it('leaves private, mutation, foreign-origin and unknown routes to the network',async()=>{const h=harness();for(const [path,mode,method] of [['/api/progress','cors','GET'],['/api/game','cors','POST'],['/uye','navigate','GET'],['/yonetim','navigate','GET'],['/auth/callback','navigate','GET'],['/signin','navigate','GET'],['/signout','navigate','GET'],['https://other.test/assets/a.js','cors','GET'],['/other','navigate','GET']])assert.equal(await h.get(path,mode,method),undefined);assert.equal(h.requests.length,0);assert.equal(h.writes.length,0);});
 it('does not mark a failed installation as offline-ready',async()=>{await assert.rejects(harness({fail:'put'}).install(),/Installation cache failed/);});
});


describe('service worker activation survives optional cleanup failures',()=>{
 for(const fail of ['cache-list','cache-delete'] as const)it('claims clients despite '+fail+' failure',async()=>{const h=harness({fail});await h.activate();assert.equal(h.claims,1);if(fail==='cache-delete')assert.deepEqual(h.deleted,['kelime-studio-old-a','kelime-studio-old-b']);});
 it('removes only old game caches and preserves the current cache and other apps',async()=>{const h=harness();await h.activate();assert.equal(h.claims,1);assert.deepEqual(h.deleted,['kelime-studio-old-a','kelime-studio-old-b']);});
 it('does not hide a failure of clients.claim itself',async()=>{const h=harness({fail:'claim'});await assert.rejects(h.activate(),/Cache unavailable: claim/);assert.equal(h.claims,1);});
});
