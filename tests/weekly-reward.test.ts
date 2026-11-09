import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {cleanWeekly,mergeWeekly,recordWeeklyCompletion,weeklyKey,weeklyStatus,type WeeklyProgress} from '../lib/game/weekly-reward.ts';
import {emptyProgress,loadProgress,mergeProgress} from '../lib/game/progress.ts';
import {istanbulDay} from '../lib/game/engine.ts';
const ids=['uzay-1','uzay-2','uzay-3','uzay-4','uzay-5'];
const week='2026-11-09';
function complete(list:string[],day=week){return list.reduce<WeeklyProgress|undefined>((s,id)=>recordWeeklyCompletion(s,id,day),undefined);}
describe('weekly cosmetic keepsake',()=>{
 it('requires five different main chapters and awards automatically exactly once',()=>{
  let state=complete(ids.slice(0,4));assert.equal(weeklyStatus(state,week).count,4);assert.equal(state?.earned.length,0);
  for(let i=0;i<10;i++)state=recordWeeklyCompletion(state,ids[0]!,week);
  assert.equal(weeklyStatus(state,week).count,4);state=recordWeeklyCompletion(state,ids[4]!,week);
  assert.deepEqual(state,{weeks:{},earned:[week]});assert.equal(recordWeeklyCompletion(state,ids[4]!,week),state);
  assert.equal(recordWeeklyCompletion(state,'not-a-chapter',week),state);
 });
 it('unions two offline devices and retains awards when an older client omits new fields',()=>{
  const a=complete(ids.slice(0,2)),b=complete(ids.slice(2)),earned=mergeWeekly(a,b);
  assert.deepEqual(earned,mergeWeekly(b,a));assert.deepEqual(mergeWeekly(earned,earned),earned);assert.deepEqual(earned?.earned,[week]);
  const saved={...emptyProgress(),weekly:earned,ambience:true};
  assert.deepEqual(loadProgress(JSON.stringify(saved)).weekly,earned);
  assert.deepEqual(mergeProgress(saved,emptyProgress()).weekly,earned);
  assert.equal(mergeProgress(saved,emptyProgress()).ambience,true);
  assert.equal(mergeProgress(saved,{...emptyProgress(),ambience:false}).ambience,false);
  assert.deepEqual(emptyProgress().saves,mergeProgress(saved,emptyProgress()).saves);
 });
 it('uses Istanbul Monday boundaries, not UTC midnight or local device timezone',()=>{
  assert.equal(weeklyKey(istanbulDay(Date.parse('2026-11-15T20:59:59Z'))),week);
  assert.equal(weeklyKey(istanbulDay(Date.parse('2026-11-15T21:00:00Z'))),'2026-11-16');
  assert.equal(weeklyKey('2026-11-15'),week);assert.equal(weeklyKey('2026-11-16'),'2026-11-16');
  assert.equal(weeklyKey('2027-01-01'),'2026-12-28');
  for(const day of ['2026-02-30','2026-13-01','2026-11-00','2026-11-8','not-a-date','2026-11-08'])assert.equal(weeklyKey(day),null);
 });
 it('resets only the next weekly goal and never removes prior earned keepsakes',()=>{
  const old=complete(ids)!,next=recordWeeklyCompletion(old,ids[0]!,'2026-11-16')!;
  assert.equal(weeklyStatus(next,'2026-11-16').count,1);assert.equal(weeklyStatus(next,'2026-11-16').total,1);
  assert.deepEqual(next.earned,[week]);assert.equal(recordWeeklyCompletion(next,ids[1]!,week),next);
  assert.equal(recordWeeklyCompletion(next,ids[1]!,'2026-11-02'),next);
 });
 it('rejects malformed dates, aliases duplicates and non-main content; bounds pending detail',()=>{
  assert.equal(cleanWeekly({earned:['2026-11-10','2026-02-30','bad'],weeks:{[week]:['tutorial','unknown',null,4]}}),undefined);
  const canonical=cleanWeekly({weeks:{[week]:['hababam-1','ozgun-okul-1','uzay-1','uzay-1']}});
  assert.equal(canonical?.weeks[week]?.length,2);
  const weeks:Record<string,string[]>={};for(let i=0;i<100;i++){const date=new Date('2026-11-09T12:00:00Z');date.setUTCDate(date.getUTCDate()+7*i);weeks[date.toISOString().slice(0,10)]=[ids[0]!];}
  const clean=cleanWeekly({weeks,earned:[week,week]})!;assert.equal(Object.keys(clean.weeks).length,8);assert.deepEqual(clean.earned,[week]);assert(JSON.stringify(clean).length<600);
 });
 it('merge is commutative and idempotent across every split of the five target IDs',()=>{
  for(let mask=0;mask<32;mask++){const a=complete(ids.filter((_,i)=>mask&(1<<i))),b=complete(ids.filter((_,i)=>!(mask&(1<<i))));const result=mergeWeekly(a,b);assert.deepEqual(result,mergeWeekly(b,a));assert.deepEqual(result?.earned,[week]);assert.deepEqual(mergeWeekly(result,a),result);}
 });
});
