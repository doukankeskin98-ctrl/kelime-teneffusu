import {afterEach,it} from 'node:test';
import assert from 'node:assert/strict';
import {hapticsAvailable,playHaptic,setHapticsAdapter} from '../lib/game/haptics.ts';
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
