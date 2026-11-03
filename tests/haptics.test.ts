import {afterEach,it} from 'node:test';
import assert from 'node:assert/strict';
import {hapticsAvailable,playHaptic,setHapticsAdapter,stopHapticSelection} from '../lib/game/haptics.ts';
afterEach(()=>setHapticsAdapter(null));
it('web is a no-op and an explicit adapter still requires opt-in',()=>{
 assert.equal(hapticsAvailable(),false);assert.doesNotThrow(()=>playHaptic('word',true));
 const seen:string[]=[];setHapticsAdapter(cue=>{seen.push(cue);});assert.equal(hapticsAvailable(),true);playHaptic('word',false);assert.deepEqual(seen,[]);
 for(const cue of ['selection','word','complete'] as const)playHaptic(cue,true);assert.deepEqual(seen,['selection','word','complete']);
});
it('throwing or rejected optional native feedback never blocks gameplay',async()=>{
 setHapticsAdapter(()=>{throw Error('Unavailable');});assert.doesNotThrow(()=>playHaptic('word',true));
 setHapticsAdapter(()=>Promise.reject(Error('Background')));playHaptic('complete',true);await Promise.resolve();
});

it('selection cleanup remains safe with no adapter, on replacement, and when native cleanup throws',()=>{
 let stopped=0;const first=Object.assign(()=>{},{stopSelection:()=>{stopped++;}});setHapticsAdapter(first);stopHapticSelection();assert.equal(stopped,1);setHapticsAdapter(null);assert.equal(stopped,2);assert.doesNotThrow(stopHapticSelection);
 setHapticsAdapter(Object.assign(()=>{},{stopSelection:()=>{throw Error('Unavailable');}}));assert.doesNotThrow(stopHapticSelection);assert.doesNotThrow(()=>setHapticsAdapter(null));
});
