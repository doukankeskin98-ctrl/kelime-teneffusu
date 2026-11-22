import assert from 'node:assert/strict';
import {it} from 'node:test';
import {DurableProgress,ACTIVE_PROGRESS_OWNER,durableProgressKey,type DurableStore} from '../lib/game/progress-durable.ts';
import {emptyProgress,PROGRESS_KEY,readProgress} from '../lib/game/progress.ts';
import {encodeProgress} from '../lib/game/progress-codec.ts';
import {progressStorageKeys,readStoredProgress,writeStoredProgress} from '../lib/game/progress-storage.ts';
function setup(){
 const primary=new Map<string,string>(),rows=new Map<string,string>();let warnings=0;
 const local={getItem:(key:string)=>primary.get(key)??null,setItem:(key:string,value:string)=>{primary.set(key,value);},removeItem:(key:string)=>{primary.delete(key);}};
 const store:DurableStore={async read(keys){return Object.fromEntries(keys.map(k=>[k,rows.get(k)??null]));},async change(expected,values){if(Object.entries(expected).some(([k,v])=>(rows.get(k)??null)!==v))return false;for(const [k,v] of Object.entries(values)){if(v===null)rows.delete(k);else rows.set(k,v);}return true;}};
 const create=()=>new DurableProgress(local,store,()=>warnings++);
 const snapshot=(owner:string)=>JSON.parse(rows.get(durableProgressKey(owner))!);
 const saved=(owner:string)=>readProgress(snapshot(owner).payload);
 return {primary,rows,local,store,create,snapshot,saved,warnings:()=>warnings};
}
function progress(day='2026-11-20'){const p=emptyProgress();p.days=[day];p.haptics=true;p.sound=true;return p;}
it('migrates the old owner into an independent copy and recovers without localStorage',async()=>{
 const f=setup(),p=progress();writeStoredProgress(f.local,'alice',p);f.local.setItem(PROGRESS_KEY+':last-user','alice');const first=f.create();assert.equal(await first.bootOwner(),'alice');assert.deepEqual(await first.open('alice'),p);
 f.primary.clear();const boot=f.create();assert.equal(await boot.bootOwner(),'alice');assert.deepEqual(await boot.open('alice'),p);assert.deepEqual(readStoredProgress(f.local,'alice'),p);assert(f.snapshot('alice').revision>=2);
});
it('keeps healthy backup usable when primary reads or repairs fail',async()=>{
 for(const failing of ['read','write'] as const){const f=setup(),p=progress();const a=f.create();await a.open('alice');await a.save('alice',p);if(failing==='read')f.local.getItem=()=>{throw new Error('disabled');};else f.local.setItem=()=>{throw new Error('quota');};
 const boot=f.create();assert.deepEqual(await boot.open('alice'),p);const next=progress('2026-11-21');await boot.save('alice',next);assert.deepEqual(f.saved('alice').days,['2026-11-20','2026-11-21']);assert(f.warnings()>0);}
});
it('repairs one corrupt copy, quarantines primary bytes, and never overwrites two unreadable copies',async()=>{
 for(const corruptPrimary of [true,false]){const f=setup(),p=progress(),a=f.create();await a.open('alice');writeStoredProgress(f.local,'alice',p);await a.save('alice',p);const key=corruptPrimary?progressStorageKeys('alice').legacy:durableProgressKey('alice');(corruptPrimary?f.primary:f.rows).set(key,'{broken');const boot=f.create();assert.deepEqual(await boot.open('alice'),p);if(corruptPrimary)assert.equal(f.local.getItem(key+':unreadable'),'{broken');assert(f.warnings()>0);}
 const f=setup(),key=progressStorageKeys('alice').legacy;f.primary.set(key,'{broken');f.rows.set(durableProgressKey('alice'),'{bad');await assert.rejects(f.create().open('alice'));assert.equal(f.primary.get(key),'{broken');assert.equal(f.rows.get(durableProgressKey('alice')),'{bad');
});
it('drains an accepted save before an owner switch and isolates each account',async()=>{
 const f=setup(),a=f.create();await a.open('alice');const save=a.save('alice',progress()),switching=a.open('bob');await Promise.all([save,switching]);assert.deepEqual(f.saved('alice').days,['2026-11-20']);assert.deepEqual(f.saved('bob').days,[]);await a.save('alice',progress('2026-11-21'));assert.deepEqual(f.saved('alice').days,['2026-11-20','2026-11-21']);assert.deepEqual(f.saved('bob').days,[]);assert.equal(await a.bootOwner(),'bob');
});
it('cancels owner activation before its CAS without changing the active owner',async()=>{
 const f=setup(),a=f.create();await a.open('alice');let allowed=true;const read=f.store.read;f.store.read=async keys=>{const result=await read(keys);allowed=false;return result;};await assert.rejects(a.open('bob',()=>allowed));assert.equal(JSON.parse(f.rows.get(ACTIVE_PROGRESS_OWNER)!).owner,'alice');assert(!f.rows.has(durableProgressKey('bob')));
});
it('retains deletion barrier through failed cleanup and cannot resurrect from queued writes',async()=>{
 const f=setup(),a=f.create();await a.open('alice');writeStoredProgress(f.local,'alice',progress());const late=a.save('alice',progress());await a.forget('alice',true);await late;assert.equal(f.snapshot('alice').deleted,true);assert.equal(await a.bootOwner(),'');
 // Simulate a stale mirror restored by the OS / another tab while tombstone survives.
 writeStoredProgress(f.local,'alice',progress());const remove=f.local.removeItem;f.local.removeItem=()=>{throw new Error('locked');};await assert.rejects(f.create().open('alice'));assert.equal(f.snapshot('alice').deleted,true);f.local.removeItem=remove;assert.deepEqual((await f.create().open('alice')).days,[]);assert.deepEqual(f.saved('alice').days,[]);
});
it('logout erases only that owner and restores preexisting anonymous progress',async()=>{
 const f=setup(),a=f.create();await a.open('');await a.save('',progress('2026-11-19'));await a.open('alice');await a.save('alice',progress());await a.forget('alice',true);const anonymous=await a.open('');assert.deepEqual(anonymous.days,['2026-11-19']);assert.equal(f.snapshot('alice').deleted,true);
});
it('merges racing snapshots with monotonic counters and retains current explicit preferences',async()=>{
 const f=setup(),a=f.create();await a.open('alice');await a.save('alice',progress());const rev=f.snapshot('alice').revision,other=f.create();await other.open('alice');const off=progress('2026-11-21');off.haptics=false;off.sound=false;await other.save('alice',off);
 assert(f.snapshot('alice').revision>rev);f.primary.clear();const recovered=await f.create().open('alice');assert.equal(recovered.sound,false);assert.equal(recovered.haptics,false);assert.deepEqual(recovered.days,['2026-11-20','2026-11-21']);
});
it('does not leak owner records through mismatched payload owners',async()=>{
 const f=setup();f.rows.set(durableProgressKey('alice'),JSON.stringify({schema:1,owner:'bob',revision:8,payload:encodeProgress(progress())}));await assert.rejects(f.create().open('alice'));assert.equal(f.rows.size,1);
});
it('retains late accepted old-owner writes without switching active owner back',async()=>{
 const f=setup(),a=f.create();await a.open('alice');const switching=a.open('bob'),late=a.save('alice',progress());await Promise.all([switching,late]);assert.deepEqual(f.saved('alice').days,['2026-11-20']);assert.equal(await a.bootOwner(),'bob');
});
it('a malformed deletion marker cannot clear the healthy primary',async()=>{
 for(const deleted of ['bad',1,{},false]){const f=setup(),p=progress();writeStoredProgress(f.local,'alice',p);f.rows.set(durableProgressKey('alice'),JSON.stringify({schema:1,owner:'alice',revision:1,deleted}));assert.deepEqual(await f.create().open('alice'),p);assert.deepEqual(readStoredProgress(f.local,'alice'),p);}
});
