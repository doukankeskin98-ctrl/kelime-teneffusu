import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startArenaClock} from '../lib/game/arena-clock.ts';

function fixture(){
 let now=10_125,offset=400,visible=true,id=0;
 const tasks=new Map<number,{at:number;fn:()=>void}>(),ticks:number[]=[];
 const host={localNow:()=>now,serverNow:()=>now+offset,visible:()=>visible,publish:(time:number)=>ticks.push(time),schedule:(fn:()=>void,delay:number)=>{tasks.set(++id,{at:now+delay,fn});return id;},cancel:(key:unknown)=>{tasks.delete(key as number);}};
 const advance=(ms:number)=>{const end=now+ms;while(true){const next=[...tasks].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;now=next[1].at;tasks.delete(next[0]);next[1].fn();}now=end;};
 return {host,tasks,ticks,advance,setVisible:(v:boolean)=>{visible=v;},setOffset:(v:number)=>{offset=v;}};
}

test('hub, ready lobby and results have no presentation timer',()=>{
 const f=fixture(),clock=startArenaClock(f.host,{});f.advance(30_000);clock.refresh();assert.equal(f.tasks.size,0);assert.deepEqual(f.ticks,[]);clock.stop();
});
test('active match ticks on server second boundaries, including countdown and golden windows',()=>{
 const f=fixture(),starts=13_000,clock=startArenaClock(f.host,{starts});
 assert.deepEqual(f.ticks,[10_525]);f.advance(29_500);
 assert.equal(f.ticks.length,31);assert.equal(f.ticks[1],11_000);assert.equal(f.ticks.at(-1),40_000);
 assert.ok(f.ticks.slice(1).every(t=>(t-starts)%1000===0));assert.equal(f.tasks.size,1);
 clock.stop();assert.equal(f.tasks.size,0);
});
test('background cancels work; return catches up without adding game time',()=>{
 const f=fixture(),clock=startArenaClock(f.host,{starts:9_000});
 f.setVisible(false);clock.refresh();f.advance(80_000);assert.equal(f.ticks.length,1);assert.equal(f.tasks.size,0);
 f.setOffset(700);f.setVisible(true);clock.refresh();assert.equal(f.ticks.at(-1),90_825);assert.equal(f.tasks.size,1);
 clock.refresh();assert.equal(f.tasks.size,1);clock.stop();clock.refresh();assert.equal(f.tasks.size,0);
});
test('quick-match alternative wakes once at the local 15-second deadline, independent of server skew',()=>{
 const f=fixture(),clock=startArenaClock(f.host,{waitingUntil:f.host.localNow()+15_000});
 f.advance(14_999);assert.equal(f.ticks.length,1);f.setOffset(10_000);f.advance(1);assert.equal(f.ticks.length,2);assert.equal(f.tasks.size,0);
 f.advance(60_000);assert.equal(f.ticks.length,2);clock.stop();
});
test('waiting deadline passed while hidden is immediately available on return',()=>{
 const f=fixture();f.setVisible(false);const clock=startArenaClock(f.host,{waitingUntil:f.host.localNow()+15_000});
 f.advance(20_000);assert.equal(f.ticks.length,0);f.setVisible(true);clock.refresh();assert.equal(f.ticks.length,1);assert.equal(f.tasks.size,0);clock.stop();
});
