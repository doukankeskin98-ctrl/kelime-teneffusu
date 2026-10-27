import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {ALL_JOURNEYS,MYSTERIES,journeyById} from '../lib/game/content.ts';
import {keepBestSave} from '../lib/game/discovery.ts';
import {emptyProgress,loadProgress,mergeProgress,cleanSave,progressBoard,PROGRESS_KEY,type Progress} from '../lib/game/progress.ts';
import {ProgressSync,ProgressOwnerChangedError,PROGRESS_SYNC_TIMEOUT,type ProgressSaveStatus} from '../lib/game/progress-sync.ts';
import {nextDiscovery} from '../lib/game/next-discovery.ts';
import {THEMES} from '../lib/game/catalog.ts';

function deferred<T>(){let resolve!:(value:T)=>void;let reject!:(reason:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function discover(p:Progress,key='uzay.0',count=1,elapsed=12,hints=0){
 const board=progressBoard(key)!;
 return {...p,saves:{...p.saves,[key]:cleanSave({strokes:board.placements.slice(0,count),elapsed,hints,complete:false,stars:0},board)}};
}
function harness(options:{isCurrent?:()=>boolean;owner?:string;online?:boolean;initial?:Progress;cache?:Map<string,string>;load?:(signal:AbortSignal)=>Promise<Progress>;save?:(p:Progress,signal:AbortSignal,keepalive:boolean)=>Promise<Progress>;storageFails?:boolean}={}){
 let current=options.initial??emptyProgress(),online=options.online??true,storageFails=options.storageFails??false;
 const owner=options.owner??'alice',cache=options.cache??new Map<string,string>(),statuses:ProgressSaveStatus[]=[],saved:Progress[]=[],writes:Progress[]=[];
 let loads=0,reads=0,remote=emptyProgress();
 const sync=new ProgressSync({owner,isCurrent:options.isCurrent,storage:{getItem:key=>cache.get(key)??null,setItem:(key,value)=>{if(storageFails)throw new Error('Quota exceeded');cache.set(key,value);}},online:()=>online,read:()=>{reads++;return current;},write:p=>{current=p;writes.push(p);},status:value=>statuses.push(value),load:async signal=>{loads++;return options.load?options.load(signal):remote;},save:async(p,signal,keepalive)=>{saved.push(p);remote=options.save?await options.save(p,signal,keepalive):mergeProgress(remote,p);return remote;}});
 return {sync,cache,statuses,saved,writes,get current(){return current;},get loads(){return loads;},get reads(){return reads;},change(p:Progress){current=p;sync.changed(p);},online(value:boolean){online=value;},storageFails(value:boolean){storageFails=value;},get local(){return loadProgress(cache.get(PROGRESS_KEY+':'+owner)??null);}};
}

describe('immediate local saves and account-scoped cloud synchronization',()=>{
 it('saves a discovered word before the first network response, with no timer required',async()=>{
  const waiting=deferred<Progress>(),h=harness({load:()=>waiting.promise});const connecting=h.sync.connect();
  h.change(discover(h.current));assert.equal(h.local.saves['uzay.0']!.strokes.length,1);assert.equal(h.saved.length,0);
  h.sync.dispose();waiting.resolve(emptyProgress());await connecting;assert.equal(h.local.saves['uzay.0']!.strokes.length,1);
 });
 it('restores offline discoveries after reopening, then merges both devices on reconnect',async()=>{
  const cache=new Map<string,string>(),first=harness({online:false,cache});await first.sync.connect();first.change(discover(first.current));await first.sync.flush();assert.equal(first.loads,0);assert.equal(first.saved.length,0);first.sync.dispose();
  const remote=discover(emptyProgress(),'turkiye.1'),reopened=harness({online:false,cache,load:async()=>remote});await reopened.sync.connect();assert.equal(reopened.current.saves['uzay.0']!.strokes.length,1);assert.equal(reopened.statuses.at(-1),'offline');
  reopened.online(true);await reopened.sync.connect();await reopened.sync.flush();assert.equal(reopened.local.saves['uzay.0']!.strokes.length,1);assert.equal(reopened.local.saves['turkiye.1']!.strokes.length,1);assert.equal(reopened.statuses.at(-1),'saved');
 });
 it('keeps discoveries made while PUT is pending and waits for their own acknowledgement',async()=>{
  const response=deferred<Progress>();let request=0;
  const h=harness({save:async p=>++request===1?response.promise:p});await h.sync.connect();h.change(discover(h.current));
  const sending=h.sync.flush();assert.equal(h.saved.length,1);h.change(discover(h.current,'uzay.0',2));await h.sync.flush();assert.equal(h.saved.length,1);
  response.resolve(h.saved[0]!);await sending;assert.equal(h.current.saves['uzay.0']!.strokes.length,2);assert.equal(h.local.saves['uzay.0']!.strokes.length,2);assert.equal(h.statuses.at(-1),'local');
  await h.sync.flush();assert.equal(h.saved.length,2);assert.equal(h.statuses.at(-1),'saved');
 });
 it('aborts an old account and ignores its late GET without changing another account',async()=>{
  const response=deferred<Progress>(),cache=new Map<string,string>();let signal:AbortSignal|undefined;
  const alice=harness({owner:'alice',cache,load:async s=>{signal=s;return response.promise;}});const pending=alice.sync.connect();alice.change(discover(alice.current));const writes=alice.writes.length;alice.sync.dispose();assert.equal(signal!.aborted,true);
  const bob=harness({owner:'bob',cache});await bob.sync.connect();bob.change(discover(bob.current,'turkiye.0'));response.resolve(discover(emptyProgress(),'uzay.3',100));await pending;
  assert.equal(alice.writes.length,writes);assert.equal(alice.local.saves['uzay.3'],undefined);assert.equal(bob.local.saves['uzay.0'],undefined);assert.equal(bob.local.saves['turkiye.0']!.strokes.length,1);
 });
 it('ignores a late PUT after disposal and leaves the latest local snapshot intact',async()=>{
  const response=deferred<Progress>(),h=harness({save:()=>response.promise});await h.sync.connect();h.change(discover(h.current));const sending=h.sync.flush();h.change(discover(h.current,'uzay.0',2));const writes=h.writes.length;h.sync.dispose();response.resolve(h.saved[0]!);await sending;
  assert.equal(h.writes.length,writes);assert.equal(h.local.saves['uzay.0']!.strokes.length,2);
 });
 it('reports storage failure, still uploads a cloud backup and can recover device storage',async()=>{
  const h=harness({storageFails:true});await h.sync.connect();h.change(discover(h.current));assert.equal(h.statuses.at(-1),'storage-error');await h.sync.flush();assert.equal(h.saved[0]!.saves['uzay.0']!.strokes.length,1);assert.equal(h.statuses.at(-1),'saved');
  h.storageFails(false);h.change(discover(h.current,'uzay.0',2));assert.equal(h.local.saves['uzay.0']!.strokes.length,2);
 });
 it('retains discoveries after network failure and retries successfully',async()=>{
  let failed=true;const h=harness({save:async p=>{if(failed)throw new Error('Network unavailable');return p;}});await h.sync.connect();h.change(discover(h.current));await h.sync.flush();assert.equal(h.statuses.at(-1),'offline');assert.equal(h.local.saves['uzay.0']!.strokes.length,1);
  failed=false;await h.sync.flush();assert.equal(h.statuses.at(-1),'saved');assert.equal(h.saved.length,2);
 });
 it('stops mismatched-account GET retries while retaining new local discoveries',async()=>{
  const h=harness({load:async()=>{throw new ProgressOwnerChangedError();}});await h.sync.connect();h.change(discover(h.current));
  await h.sync.connect();await h.sync.flush();assert.equal(h.loads,1);assert.equal(h.saved.length,0);assert.equal(h.local.saves['uzay.0']!.strokes.length,1);assert.equal(h.statuses.at(-1),'account-changed');
 });
 it('retains a final local snapshot after mismatched PUT and never uploads that channel again',async()=>{
  const response=deferred<Progress>(),h=harness({save:()=>response.promise});await h.sync.connect();h.change(discover(h.current));const pending=h.sync.flush();h.change(discover(h.current,'uzay.0',2));response.reject(new ProgressOwnerChangedError());await pending;
  await h.sync.flush(true);await h.sync.connect();assert.equal(h.saved.length,1);assert.equal(h.local.saves['uzay.0']!.strokes.length,2);assert.equal(h.statuses.at(-1),'account-changed');
 });
 it('does not promise device persistence on owner mismatch until a local-only retry succeeds',async()=>{
  const h=harness({storageFails:true,load:async()=>{throw new ProgressOwnerChangedError();}});await h.sync.connect();h.change(discover(h.current));assert.equal(h.statuses.at(-1),'account-changed-storage-error');
  h.storageFails(false);await h.sync.flush();assert.equal(h.statuses.at(-1),'account-changed');assert.equal(h.local.saves['uzay.0']!.strokes.length,1);assert.equal(h.loads,1);assert.equal(h.saved.length,0);
 });
 for(const mode of ['GET','PUT'])it('ignores inactive '+mode+' and scheduled work before dispose',async()=>{
  let active=true;const response=deferred<Progress>(),h=harness({isCurrent:()=>active,...(mode==='GET'?{load:()=>response.promise}:{save:()=>response.promise})});
  const pending=mode==='GET'?h.sync.connect():(await h.sync.connect(),h.change(discover(h.current)),h.sync.flush());
  const local=JSON.stringify(h.local),writes=h.writes.length,statuses=h.statuses.length,reads=h.reads;active=false;h.change(discover(emptyProgress(),'turkiye.0'));await h.sync.flush();await h.sync.connect();response.resolve(discover(emptyProgress(),'uzay.3',100));await pending;
  assert.equal(h.reads,reads);assert.equal(JSON.stringify(h.local),local);assert.equal(h.writes.length,writes);assert.equal(h.statuses.length,statuses);
 });
 it('restores cloud preferences on a fresh device without overwriting choices made during load',async()=>{
  const response=deferred<Progress>(),h=harness({load:()=>response.promise});const pending=h.sync.connect();h.change({...h.current,palette:'orchid'});response.resolve({...emptyProgress(),palette:'ocean',zoom:true,sound:true});await pending;
  assert.equal(h.current.palette,'orchid');assert.equal(h.current.zoom,true);assert.equal(h.current.sound,true);
 });
 it('does not replace an existing device preference or a better completed result',async()=>{
  const local={...discover(emptyProgress(),'uzay.0',100,30),palette:'orchid' as const},remote={...discover(emptyProgress(),'uzay.0',100,60),palette:'ocean' as const};
  const cache=new Map([[PROGRESS_KEY+':alice',JSON.stringify(local)]]),h=harness({cache,load:async()=>remote});await h.sync.connect();assert.equal(h.current.palette,'orchid');assert.equal(h.current.saves['uzay.0']!.elapsed,30);assert.equal(h.current.saves['uzay.0']!.complete,true);
 });
 it('uses the bounded keepalive upload on page exit',async()=>{
  let keepalive=false;const h=harness({save:async(p,_signal,value)=>{keepalive=value;return p;}});await h.sync.connect();h.change(discover(h.current));await h.sync.flush(true);assert.equal(keepalive,true);assert.equal(h.statuses.at(-1),'saved');
 });
 it('releases a hung GET at its deadline, retries with a new signal and ignores the old result',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const old=deferred<Progress>(),signals:AbortSignal[]=[];
  const h=harness({load:async signal=>{signals.push(signal);return signals.length===1?old.promise:discover(emptyProgress(),'turkiye.1');}});
  const first=h.sync.connect();h.change(discover(h.current));await h.sync.connect();assert.equal(h.loads,1);
  t.mock.timers.tick(PROGRESS_SYNC_TIMEOUT-1);assert.equal(signals[0]!.aborted,false);assert.equal(h.statuses.at(-1),'local');
  t.mock.timers.tick(1);await first;assert.equal(signals[0]!.aborted,true);assert.equal(h.statuses.at(-1),'offline');assert.equal(h.local.saves['uzay.0']!.strokes.length,1);
  await h.sync.connect();await h.sync.flush();assert.equal(h.loads,2);assert.notEqual(signals[0],signals[1]);assert.equal(signals[1]!.aborted,false);assert.equal(h.statuses.at(-1),'saved');
  const state=JSON.stringify(h.current),writes=h.writes.length,statuses=h.statuses.length;
  old.resolve(discover(emptyProgress(),'uzay.3',100));for(let i=0;i<12;i++)await Promise.resolve();
  assert.equal(JSON.stringify(h.current),state);assert.equal(h.local.saves['uzay.3'],undefined);assert.equal(h.writes.length,writes);assert.equal(h.statuses.length,statuses);
  t.mock.timers.tick(PROGRESS_SYNC_TIMEOUT);assert.equal(signals[1]!.aborted,false);h.sync.dispose();assert.equal(signals[1]!.aborted,false);
 });
 it('retries a timed-out PUT with the latest discovery and does not acknowledge a late old save',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const old=deferred<Progress>(),signals:AbortSignal[]=[];
  const h=harness({save:async(p,signal)=>{signals.push(signal);return signals.length===1?old.promise:p;}});await h.sync.connect();h.change(discover(h.current));
  const first=h.sync.flush();h.change(discover(h.current,'uzay.0',2));await h.sync.flush();assert.equal(h.saved.length,1);
  t.mock.timers.tick(PROGRESS_SYNC_TIMEOUT);await first;assert.equal(signals[0]!.aborted,true);assert.equal(h.statuses.at(-1),'offline');assert.equal(h.local.saves['uzay.0']!.strokes.length,2);
  await h.sync.flush();assert.equal(h.saved[1]!.saves['uzay.0']!.strokes.length,2);assert.notEqual(signals[0],signals[1]);assert.equal(h.statuses.at(-1),'saved');
  const writes=h.writes.length,statuses=h.statuses.length;old.resolve(h.saved[0]!);for(let i=0;i<12;i++)await Promise.resolve();
  assert.equal(h.writes.length,writes);assert.equal(h.statuses.length,statuses);await h.sync.flush();assert.equal(h.saved.length,2);assert.equal(h.current.saves['uzay.0']!.strokes.length,2);h.sync.dispose();
 });
 for(const mode of ['GET','PUT'])it('ignores a late owner rejection from timed-out '+mode+' without blocking a newer attempt',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const old=deferred<Progress>();let calls=0;
  const operation=async(p=emptyProgress())=>++calls===1?old.promise:p;
  const h=harness(mode==='GET'?{load:()=>operation()}:{save:p=>operation(p)});
  const first=mode==='GET'?h.sync.connect():(await h.sync.connect(),h.change(discover(h.current)),h.sync.flush());
  t.mock.timers.tick(PROGRESS_SYNC_TIMEOUT);await first;
  if(mode==='GET')await h.sync.connect();else await h.sync.flush();
  old.reject(new ProgressOwnerChangedError());for(let i=0;i<12;i++)await Promise.resolve();
  h.change(discover(h.current,'uzay.0',2));await h.sync.flush();assert.equal(h.statuses.at(-1),'saved');assert.equal(h.local.saves['uzay.0']!.strokes.length,2);h.sync.dispose();
 });
 for(const mode of ['GET','PUT'])it('settles signal-insensitive '+mode+' immediately on dispose without reporting a save',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});let signal:AbortSignal|undefined,settled=false;
  const operation=(s:AbortSignal)=>{signal=s;return new Promise<Progress>(()=>{});};
  const h=harness(mode==='GET'?{load:operation}:{save:(_p,s)=>operation(s)});
  const pending=(mode==='GET'?h.sync.connect():(await h.sync.connect(),h.change(discover(h.current)),h.sync.flush())).then(()=>{settled=true;});
  const writes=h.writes.length,statuses=h.statuses.length;h.sync.dispose();await pending;assert.equal(settled,true);assert.equal(signal!.aborted,true);
  t.mock.timers.tick(PROGRESS_SYNC_TIMEOUT);assert.equal(h.writes.length,writes);assert.equal(h.statuses.length,statuses);
 });
 it('keeps a device-write error visible after a timeout and recovers both stores on retry',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});let calls=0;
  const h=harness({storageFails:true,load:async()=>++calls===1?new Promise<Progress>(()=>{}):emptyProgress()});
  const pending=h.sync.connect();h.change(discover(h.current));t.mock.timers.tick(PROGRESS_SYNC_TIMEOUT);await pending;assert.equal(h.statuses.at(-1),'storage-error');assert.equal(h.cache.has(PROGRESS_KEY+':alice'),false);
  h.storageFails(false);await h.sync.connect();await h.sync.flush();assert.equal(h.statuses.at(-1),'saved');assert.equal(h.local.saves['uzay.0']!.strokes.length,1);h.sync.dispose();
 });
});

describe('honest next-step guidance and personal results',()=>{
 it('offers the first journey to a new player',()=>{const next=nextDiscovery(emptyProgress());assert.equal(next.mode,'start');assert.equal(next.config.journey,'uzay-1');assert.equal(next.title,journeyById('uzay-1')!.title);});
 it('continues a partial journey but advances from an already finished one',()=>{
  let p=discover({...emptyProgress(),last:{themeId:'uzay',level:0,journey:'uzay-1'}},'route:uzay-1');let next=nextDiscovery(p);assert.equal(next.mode,'continue');assert.equal(next.found,1);
  p=discover(p,'route:uzay-1',100);next=nextDiscovery(p);assert.equal(next.config.journey,'uzay-2');assert.equal(next.mode,'next');assert.equal(next.found,0);
 });
 it('skips completed standard chapters and wraps to earlier unfinished ones',()=>{
  let p:Progress={...emptyProgress(),last:{themeId:'uzay',level:3}};p=discover(discover(discover(p,'uzay.3',100),'uzay.4',100),'uzay.5',100);const next=nextDiscovery(p);assert.deepEqual(next.config,{themeId:'uzay',level:0});assert.equal(next.mode,'next');
 });
 it('does not call an untouched board a resumed game',()=>{const p=discover({...emptyProgress(),last:{themeId:'uzay',level:0}},'uzay.0',0);assert.equal(nextDiscovery(p).mode,'next');});
 it('offers an unfinished standard board when the discovery map is complete, then a true replay',()=>{
  let p=emptyProgress();for(const j of ALL_JOURNEYS)p=discover(p,'route:'+j.id,100);const next=nextDiscovery(p);assert.equal(next.mode,'next');assert.equal(next.config.journey,undefined);assert.equal(next.config.practice,undefined);
  for(const theme of THEMES)for(let level=0;level<6;level++)p=discover(p,`${theme.id}.${level}`,100);
  assert.equal(nextDiscovery(p).mode,'replay');assert.equal(nextDiscovery(p).config.practice,true);
 });
 it('preserves a mystery best time on a slower replay and accepts a faster equal-star result',()=>{
  const key='mystery:'+MYSTERIES[0]!.id,best=discover(emptyProgress(),key,100,30).saves[key]!;
  assert.equal(keepBestSave(best,{...best,elapsed:60}).elapsed,30);assert.equal(keepBestSave(best,{...best,elapsed:20}).elapsed,20);
 });
});
