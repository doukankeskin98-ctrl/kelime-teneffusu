import assert from 'node:assert/strict';
import {it} from 'node:test';
import {playPraiseLedger,PRAISE_WINDOW_MS} from '../lib/game/play-praise.ts';
import type {Stroke} from '../lib/game/engine.ts';
const stroke=(i:number):Stroke=>({id:String(i),a:[i,0],b:[i,3]});
function round(){const l=playPraiseLedger(),strokes:Stroke[]=[];return {l,strokes,accept(i:number,time:number){const s=stroke(i);l.attempt(s.a,s.b,time,true);strokes.push(s);return l.confirm(strokes,time,12);}};}
it('requires two real local confirmations, ignores optimistic snapshots and consumes ACK exactly once',()=>{
 const r=round(),a=stroke(0),b=stroke(1);r.l.attempt(a.a,a.b,0,true);assert.equal(r.l.confirm([],0,12),null);
 assert.equal(r.l.confirm([a],100,12),null);r.l.attempt(b.b,b.a,2000,true);
 assert.equal(r.l.confirm([a,b],2200,12),'Çok iyi!');assert.equal(r.l.confirm([a,b],2300,12),null);
 r.l.attempt(b.a,b.b,2400,true);assert.equal(r.l.confirm([a,b],2500,12),null);
});
it('allows a rejected attempt to be retried but never praises the rejection',()=>{
 const r=round();r.accept(0,0);const b=stroke(1);r.l.attempt(b.a,b.b,1000,true);assert.equal(r.l.confirm(r.strokes,1200,12),null);
 assert.equal(r.accept(1,3000),'Çok iyi!');
});
it('does not praise restore, remote records, background ACK or delayed recovery',()=>{
 const a=stroke(0),b=stroke(1),l=playPraiseLedger([a]);l.attempt(b.a,b.b,100,true);l.interrupt();
 assert.equal(l.confirm([a,b],200,12),null);const c=stroke(2);l.attempt(c.a,c.b,300,true);
 assert.equal(l.confirm([a,b,c],PRAISE_WINDOW_MS+301,12),null);
 const r=round();r.accept(0,0);r.l.attempt(b.a,b.b,100,true);assert.equal(r.l.confirm([a,b],200,12,false),null);assert.equal(r.l.confirm([a,b],300,12),null);
});
it('bounds praise frequency and never queues more than three celebrations',()=>{
 const r=round(),messages=[];for(let i=0;i<12;i++){const message=r.accept(i,i*2500);if(message)messages.push(message);}
 assert.deepEqual(messages,['Çok iyi!','Harika!','Müthiş!']);
 const fast=round();assert.equal(fast.accept(0,0),null);assert.equal(fast.accept(1,100),'Çok iyi!');for(let i=2;i<10;i++)assert.equal(fast.accept(i,100+i*100),null);
});
it('uses selection time rather than ACK time, and honours the exact eight-second boundary',()=>{
 for(const gap of [8000,8001]){const r=round();r.accept(0,0);assert.equal(r.accept(1,gap),gap===8000?'Çok iyi!':null);}
 const r=round();r.accept(0,0);const b=stroke(1);r.l.attempt(b.a,b.b,7000,true);assert.equal(r.l.confirm([stroke(0),b],11000,12),'Çok iyi!');
});
it('hint, wrong selection and terminal acceptance leave score/progress untouched and reset the chain',()=>{
 const r=round();r.accept(0,0);r.l.assist([1,0]);assert.equal(r.accept(1,1000),null);assert.equal(r.accept(2,2000),null);assert.equal(r.accept(3,3000),'Çok iyi!');
 const wrong=round();wrong.accept(0,0);wrong.l.attempt([0,0],[1,2],1000,false);assert.equal(wrong.accept(1,2000),null);
 const end=round();end.accept(0,0);const b=stroke(1);end.l.attempt(b.a,b.b,100,true);const saved=[stroke(0),b],before=JSON.stringify(saved);assert.equal(end.l.confirm(saved,100,12,true,true),null);assert.equal(JSON.stringify(saved),before);
});
