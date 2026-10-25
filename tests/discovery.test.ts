import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {JOURNEYS,JOURNEY_BONUSES,journeyBoard,journeyById} from '../lib/game/content.ts';
import {discoveryState,discoveryRewards,recommendedExpedition,keepBestSave} from '../lib/game/discovery.ts';
import {emptyProgress,cleanSave,loadProgress,mergeProgress,progressBoard,type Progress} from '../lib/game/progress.ts';
import {fixture} from './fixtures.ts';
import {CloudProgress} from '../lib/game/cloud.ts';

function complete(p:Progress,id:string,hints=0,elapsed=45){const board=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:board.placements,hints,elapsed,complete:false,stars:0},board);return p;}
function finish(p:Progress,theme:string,count:number,hints=0){for(const j of JOURNEYS.filter(j=>j.themeId===theme).slice(0,count))complete(p,j.id,hints);return p;}

describe('permanent discovery map and collection rewards',()=>{
 it('opens the first world and describes exactly what earns every piece without granting one on a partial board',()=>{
  const p=emptyProgress(),states=discoveryState(p);assert.deepEqual(states.slice(0,3).map(s=>s.unlocked),[true,false,false]);assert.equal(states[1]!.remaining,3);assert.equal(states[0]!.next!.id,'uzay-1');assert.equal(states[0]!.nextPiece,'İlk yıldız');assert.equal(recommendedExpedition(p).expedition.id,'uzay');
  const b=journeyBoard(JOURNEYS.find(j=>j.id==='uzay-1')!);p.saves['route:uzay-1']=cleanSave({strokes:[b.placements[0]!],elapsed:10,hints:0,complete:false,stars:0},b);assert.equal(discoveryState(p)[0]!.pieces,0);assert.deepEqual(discoveryRewards(emptyProgress(),p),[]);
 });
 it('unlocks the next world at three completions even with all hints and the bonus only at five',()=>{
  const p=finish(emptyProgress(),'uzay',2,3),before=loadProgress(JSON.stringify(p));assert.equal(discoveryState(p)[1]!.unlocked,false);assert.equal(discoveryState(p)[1]!.remaining,1);complete(p,'uzay-3',3);
  assert.equal(discoveryState(p)[1]!.unlocked,true);assert.equal(discoveryState(p)[0]!.bonusUnlocked,false);assert.equal(p.saves['route:uzay-3']!.stars,1);assert(discoveryRewards(before,p).some(r=>r.kind==='world'&&r.themeId==='turkiye'));
  finish(p,'uzay',5,3);const state=discoveryState(p)[0]!;assert.equal(state.bonusUnlocked,true);assert.equal(state.pieces,5);assert.equal(state.next!.id,state.bonus.id);assert.equal(state.complete,false);
 });
 it('keeps old started and completed routes accessible and counts their real pieces retroactively',()=>{
  const p=finish(emptyProgress(),'hababam',5),states=discoveryState(p);assert.equal(states[2]!.unlocked,true);assert.equal(states[2]!.pieces,5);assert.equal(states[2]!.bonusUnlocked,true);assert.equal(states[1]!.unlocked,false);
  const b=journeyBoard(JOURNEYS.find(j=>j.id==='turkiye-4')!);p.saves['route:turkiye-4']=cleanSave({strokes:[b.placements[0]!],elapsed:2,hints:0,complete:false,stars:0},b);assert.equal(discoveryState(loadProgress(JSON.stringify(p)))[1]!.unlocked,true);
 });
 it('awards exactly six named pieces and a complete scene, with no repeatable claim or day-based expiry',()=>{
  const p=finish(emptyProgress(),'uzay',5),before=loadProgress(JSON.stringify(p)),bonus=JOURNEY_BONUSES.find(j=>j.themeId==='uzay')!;complete(p,bonus.id);
  const state=discoveryState(p)[0]!,rewards=discoveryRewards(before,p);assert.equal(state.pieces,6);assert.equal(state.complete,true);assert.equal(state.next,null);assert.equal(rewards.filter(r=>r.kind==='piece').length,1);assert.equal(rewards.filter(r=>r.kind==='album').length,1);assert.deepEqual(discoveryRewards(p,loadProgress(JSON.stringify(p))),[]);assert.equal(discoveryState(loadProgress(JSON.stringify(p)))[0]!.complete,true);
 });
 it('only grants each opening once, even when several rewards arrive on the same completion',()=>{
  const p=finish(emptyProgress(),'uzay',4),before=loadProgress(JSON.stringify(p));complete(p,'uzay-5');const rewards=discoveryRewards(before,p);assert.equal(rewards.filter(r=>r.kind==='piece').length,1);assert.equal(rewards.filter(r=>r.kind==='bonus').length,1);assert.equal(new Set(rewards.map(r=>r.id)).size,rewards.length);assert.deepEqual(discoveryRewards(p,p),[]);
 });
 it('keeps earned worlds, bonus access and all six pieces when later content adds more chapters to a theme',()=>{
  const p=finish(emptyProgress(),'uzay',5);complete(p,JOURNEY_BONUSES.find(j=>j.themeId==='uzay')!.id);
  const before=discoveryState(p),extra={...JOURNEYS.find(j=>j.themeId==='uzay')!,id:'uzay-future-content'};JOURNEYS.push(extra);
  try{const after=discoveryState(p);assert.equal(after[0]!.chapters.length,5);assert.equal(after[0]!.pieces,6);assert.equal(after[0]!.complete,true);assert.equal(after[0]!.bonusUnlocked,true);assert.equal(after[1]!.unlocked,true);assert.deepEqual(after,before);}finally{JOURNEYS.splice(JOURNEYS.indexOf(extra),1);}
 });
 it('preserves a better completed result on a replay and can improve it without inventing another collection item',()=>{
  const p=complete(emptyProgress(),'uzay-1',0,40),best=p.saves['route:uzay-1']!,b=journeyBoard(journeyById('uzay-1')!);const partial=cleanSave(undefined,b),slower={...best,elapsed:80},worse={...best,stars:1,hints:2,elapsed:3};assert.equal(keepBestSave(best,partial),best);assert.equal(keepBestSave(best,slower),best);assert.equal(keepBestSave(best,worse),best);assert.equal(keepBestSave(best,{...best,elapsed:20}).elapsed,20);assert.equal(discoveryState(p)[0]!.pieces,1);
 });
 it('roundtrips all bonus boards through validated old-version saves, last destination and cross-device merges',()=>{
  for(const j of JOURNEY_BONUSES){const p=complete(emptyProgress(),j.id);p.last={themeId:j.themeId,level:0,journey:j.id};const loaded=loadProgress(JSON.stringify(p));assert.equal(loaded.saves['route:'+j.id]!.complete,true);assert.equal(loaded.last!.journey,j.id);assert.deepEqual(progressBoard('route:'+j.id),journeyBoard(j));assert.equal(mergeProgress(p,emptyProgress()).saves['route:'+j.id]!.complete,true);}
  assert.equal(loadProgress(JSON.stringify({v:2,saves:{},sound:true,zoom:false,days:[],last:null})).sound,true);
 });
 it('retains both devices’ pieces in cloud storage while keeping another player isolated',async()=>{
  const f=fixture(),cloud=new CloudProgress(f.db,f.clock),a=complete(emptyProgress(),'uzay-1'),b=complete(emptyProgress(),'uzay-2');await Promise.all([cloud.save('alice',a),cloud.save('alice',b)]);const combined=await cloud.read('alice');assert.equal(discoveryState(combined.progress)[0]!.pieces,2);assert.equal(discoveryState((await cloud.read('bob')).progress)[0]!.pieces,0);assert.equal((await f.game.rating('alice')).played,0);
 });
});
