import assert from 'node:assert/strict';
import {it} from 'node:test';
import {gameCenterStatus,openGameCenter,setGameCenterAdapter} from '../lib/platform/game-center.ts';
it('keeps web and unconfigured native builds silent, with no authentication or dashboard requests',async()=>{
 setGameCenterAdapter(null);assert.equal((await gameCenterStatus()).configured,false);
 let calls=0;setGameCenterAdapter({status:async()=>({configured:false,authenticated:false,status:'notConfigured'}),authenticate:async()=>{calls++;throw Error();},openDashboard:async()=>{calls++;throw Error();}});
 assert.equal((await openGameCenter()).status,'notConfigured');assert.equal(calls,0);setGameCenterAdapter(null);
});
it('distinguishes explicit sign-in from opening an authenticated dashboard and safely handles platform failure',async()=>{
 let signed=false;const calls:string[]=[];
 setGameCenterAdapter({status:async()=>({configured:true,authenticated:signed,status:signed?'authenticated':'signedOut'}),authenticate:async options=>{assert.equal(options?.interactive,true);calls.push('auth');signed=true;return {configured:true,authenticated:true,status:'authenticated'};},openDashboard:async()=>{calls.push('dashboard');return {configured:true,authenticated:true,status:'opened'};}});
 assert.equal((await openGameCenter()).status,'authenticated');assert.equal((await openGameCenter()).status,'opened');assert.deepEqual(calls,['auth','dashboard']);
 setGameCenterAdapter({status:async()=>{throw Error('offline');},authenticate:async()=>{throw Error();},openDashboard:async()=>{throw Error();}});
 assert.equal((await openGameCenter()).status,'unavailable');setGameCenterAdapter(null);
});
