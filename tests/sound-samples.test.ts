import {it} from 'node:test';
import assert from 'node:assert/strict';
import {SoundSamples} from '../lib/game/sound-samples.ts';
it('sample loads are bounded and memoized; missing files fall back without blocking other cues',async()=>{
 const samples=new SoundSamples();let requests=0;
 const fetcher=(async (path:string)=>{requests++;return new Response(path.includes('miss')?null:new Uint8Array(8),{status:path.includes('miss')?404:200});}) as typeof fetch;
 await samples.load({decodeAudioData:async()=>({duration:.2} as AudioBuffer)},fetcher);
 assert.equal(requests,9);assert(samples.get('word'));assert(samples.get('start'));assert(!samples.get('miss'));
 await samples.load({decodeAudioData:async()=>{throw Error('must not decode again');}},fetcher);assert.equal(requests,9);
 samples.dispose();assert(!samples.get('word'));
});
it('late decode after disposal cannot resurrect a buffer',async()=>{
 const samples=new SoundSamples();let finish=()=>{};
 const gate=new Promise<void>(resolve=>{finish=resolve;});
 const pending=samples.load({decodeAudioData:async()=>{await gate;return{duration:.2} as AudioBuffer;}},(async()=>new Response(new Uint8Array(8))) as typeof fetch);
 samples.dispose();finish();await pending;assert(!samples.get('word'));
});
