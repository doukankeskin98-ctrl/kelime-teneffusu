import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {BONUS_DURATION,BONUS_WORDS,bonusBoard,scanBonus,cleanBonusSave,freshBonus,mergeBonusSave,selectBonus,advanceBonus} from '../lib/game/journey-bonus.ts';
import {bonusOffer,chapterPace,wordTrail,worldNeedsWelcome} from '../lib/game/journey-flow.ts';
import {emptyProgress,loadProgress,mergeProgress,progressBoard,cleanSave,type Progress} from '../lib/game/progress.ts';
import {EXPEDITIONS,expeditionBonusId,discoveryState} from '../lib/game/discovery.ts';
import {MAIN_JOURNEY} from '../lib/game/main-journey.ts';
import {CHAPTER_REPLACEMENTS} from '../lib/game/original-content.ts';
import {ALL_JOURNEYS,MYSTERIES,journeyById} from '../lib/game/content.ts';
import {ALL_THEMES} from '../lib/game/catalog.ts';
const finish=(p:Progress,id:string)=>{const b=progressBoard('route:'+id)!;p.saves['route:'+id]=cleanSave({strokes:b.placements,hints:0,elapsed:12,complete:false,stars:0},b);return p;};

describe('separate repeated-word bonus mechanics',()=>{
 it('covers all 28 worlds with deterministic 8x8 boards and every real occurrence',()=>{
  assert.deepEqual(Object.keys(BONUS_WORDS).sort(),EXPEDITIONS.map(w=>w.id).sort());
  for(const world of EXPEDITIONS){const b=bonusBoard(world.id);assert.equal(b.size,8);assert.equal(b.grid.length,8);assert(b.grid.every(r=>r.length===8));assert(b.targets.length>=8&&b.targets.length<=24,world.id);assert.deepEqual(b.placements,scanBonus(b.grid,BONUS_WORDS[world.id]!));assert.equal(b,bonusBoard(world.id));assert.equal(new Set(b.targets.map(t=>t.id)).size,b.targets.length);assert(b.targets.every(t=>t.text===BONUS_WORDS[world.id]));}
 });
 it('recognizes both directions by endpoints, counts separate placements and rejects redraws',()=>{
  const b=bonusBoard('uzay');let save=freshBonus();
  for(const [i,p] of b.placements.entries()){const result=selectBonus(b,save,i%2?p.b:p.a,i%2?p.a:p.b);assert(result.accepted);save=result.save;assert.equal(selectBonus(b,save,p.a,p.b).accepted,false);assert.equal(save.found.length,i+1);}
  assert(save.finished);assert.equal(save.best,b.targets.length);assert.equal(selectBonus(b,freshBonus(),[-1,0],[7,0]).accepted,false);assert.equal(selectBonus(b,freshBonus(),[0,0],[2,3]).accepted,false);
 });
 it('enforces the exact deadline independently of interval repaint and never charges paused time',()=>{
  const b=bonusBoard('uzay'),p=b.placements[0]!,start=freshBonus();assert(selectBonus(b,advanceBonus(start,59999),p.a,p.b).accepted);const end=advanceBonus(start,60000);assert(end.finished);assert(!selectBonus(b,end,p.a,p.b).accepted);assert.equal(advanceBonus(end,1000),end);assert.equal(advanceBonus(start,-10).elapsed,0);assert.equal(advanceBonus(start,NaN).elapsed,0);
 });
 it('validates endpoint IDs and derives completion rather than trusting a raw finished flag',()=>{
  const b=bonusBoard('uzay'),id=b.targets[0]!.id;
  const clean=cleanBonusSave('uzay',{attempt:-9,found:[id,id,'unknown',null],elapsed:Infinity,finished:true,best:999})!;
  assert.deepEqual(clean,{attempt:1,found:[id],elapsed:0,finished:false,best:b.targets.length});assert.equal(cleanBonusSave('__proto__',{}),null);assert.equal(cleanBonusSave('constructor',{}),null);assert.throws(()=>bonusBoard('__proto__'));assert.equal(cleanBonusSave('unknown',{}),null);
 });
 it('keeps terminal runs terminal, uses whole attempts and merges deterministically',()=>{
  const b=bonusBoard('uzay'),completed=cleanBonusSave('uzay',{attempt:1,found:b.targets.map(t=>t.id),elapsed:20000})!,partial={...freshBonus(),found:[b.targets[0]!.id],elapsed:30000};
  assert.deepEqual(mergeBonusSave(completed,partial),completed);assert.deepEqual(mergeBonusSave(partial,completed),completed);assert.deepEqual(mergeBonusSave(completed,completed),completed);
  const newer={...freshBonus(2),found:[b.targets[1]!.id],elapsed:1000},merged=mergeBonusSave(completed,newer);assert.equal(merged.attempt,2);assert.deepEqual(merged.found,newer.found);assert.equal(merged.best,b.targets.length);
  const a={...freshBonus(3),found:[b.targets[0]!.id],elapsed:500},c={...freshBonus(3),found:[b.targets[1]!.id],elapsed:500};assert.deepEqual(mergeBonusSave(a,c),mergeBonusSave(c,a));assert.equal(mergeBonusSave(a,c).found.length,1);
 });
});

describe('journey progression stays compatible',()=>{
 it('offers an optional bonus only on newly completing all six chapters',()=>{
  const p=emptyProgress(),world=EXPEDITIONS[0]!;world.chapterIds.forEach(id=>finish(p,id));assert.equal(discoveryState(p)[0]!.pieces,5);const after=finish(structuredClone(p),expeditionBonusId(world));assert.equal(bonusOffer(p,after,expeditionBonusId(world))?.id,world.id);assert.equal(bonusOffer(after,after,expeditionBonusId(world)),null);assert.equal(bonusOffer(p,p,world.chapterIds[4]!),null);assert(discoveryState(p)[1]!.unlocked);
 });
 it('shows first-visit welcome only for an unlocked unplayed world, not returning users',()=>{
  const p=emptyProgress();assert.equal(worldNeedsWelcome(p,'uzay-1'),false);assert.equal(worldNeedsWelcome(p,'turkiye-1'),false);EXPEDITIONS[0]!.chapterIds.slice(0,3).forEach(id=>finish(p,id));assert.equal(worldNeedsWelcome(p,'turkiye-1'),true);
  assert.equal(worldNeedsWelcome({...p,welcomedWorlds:['turkiye']},'turkiye-1'),false);p.saves['route:turkiye-1']=cleanSave({strokes:[],hints:0,elapsed:3,complete:false,stars:0},progressBoard('route:turkiye-1')!);assert.equal(worldNeedsWelcome(p,'turkiye-1'),false);
 });
 it('credits old aliases once, includes current partial words, and never rewards replay twice',()=>{
  const [old,id]=Object.entries(CHAPTER_REPLACEMENTS)[0]!,p=finish(emptyProgress(),old),count=journeyById(id)!.words.length;assert.equal(wordTrail(p).words,count);finish(p,id);assert.equal(wordTrail(p).words,count);assert.equal(wordTrail(mergeProgress(p,p)).words,count);
  const q=emptyProgress(),item=MAIN_JOURNEY[0]!,b=progressBoard('route:'+item.chapter.id)!;q.saves['route:'+item.chapter.id]=cleanSave({strokes:[b.placements[0]!],hints:0,elapsed:1,complete:false,stars:0},b);assert.equal(wordTrail(q).words,1);finish(q,item.chapter.id);assert.equal(wordTrail(q).words,item.chapter.words.length);
 });
 it('first steps remain open and short; honest pace labels reflect existing authored load',()=>{
  for(const w of EXPEDITIONS){const first=journeyById(w.chapterIds[0]!)!;assert.equal(chapterPace(first.id)?.kind,'easy');assert(first.words.length<=5);assert.equal(first.clues,undefined);}
  assert.doesNotMatch(chapterPace('renkler-bahce-6')?.detail??'',/saklı/);
 });
 it('round-trips the maximum existing catalogue plus all new state below the API limit',()=>{
  const p=emptyProgress(),keys=[...ALL_THEMES.flatMap(t=>Array.from({length:6},(_,i)=>t.id+'.'+i)),...ALL_JOURNEYS.map(j=>'route:'+j.id),...MYSTERIES.map(m=>'mystery:'+m.id)];
  for(const key of keys){const b=progressBoard(key);if(b)p.saves[key]=cleanSave({strokes:b.placements,hints:3,elapsed:604800,complete:false,stars:0},b);}
  p.days=Array.from({length:3660},(_,i)=>new Date(Date.UTC(2030,0,i+1)).toISOString().slice(0,10));p.bonuses=Object.fromEntries(EXPEDITIONS.map(w=>[w.id,cleanBonusSave(w.id,{attempt:1000000,found:bonusBoard(w.id).targets.map(t=>t.id),elapsed:60000})!]));p.welcomedWorlds=EXPEDITIONS.map(w=>w.id);p.mechanicGuides=['daily','mystery','concealed','riddle'];p.trailBadge='crown';
  assert(Buffer.byteLength(JSON.stringify({progress:p}))<150000);const restored=loadProgress(JSON.stringify(p));assert.equal(Object.keys(restored.saves).length,Object.keys(p.saves).length);assert.equal(Object.keys(restored.bonuses!).length,28);assert.equal(wordTrail(restored).earned.length,8);assert.equal(mergeProgress(restored,emptyProgress()).bonuses?.['uzay']?.best,p.bonuses['uzay']!.best);assert.deepEqual(loadProgress(JSON.stringify(emptyProgress())),emptyProgress());
 });
});
