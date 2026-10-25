import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {createHash} from 'node:crypto';
import legacyHashes from './atlas-legacy-boards.json' with {type:'json'};
import {ATLAS_JOURNEYS,ATLAS_REGIONS} from '../lib/game/atlas-content.ts';
import {ALL_JOURNEYS,MYSTERIES,journeyBoard,journeyById} from '../lib/game/content.ts';
import {THEMES,normalize} from '../lib/game/catalog.ts';
import {discoveryState,discoveryRewards,nextJourneyAfter,recommendedExpedition} from '../lib/game/discovery.ts';
import {nextDiscovery} from '../lib/game/next-discovery.ts';
import {emptyProgress,loadProgress,cleanSave,progressBoard,mergeProgress,type Progress} from '../lib/game/progress.ts';
import {wordCardCopy} from '../lib/game/word-card.ts';
import {CloudProgress} from '../lib/game/cloud.ts';
import {fixture} from './fixtures.ts';
const complete=(p:Progress,id:string)=>{const b=progressBoard('route:'+id)!;p.saves['route:'+id]=cleanSave({strokes:b.placements,elapsed:45,hints:0,complete:false,stars:0},b);return p;};
const veteran=()=>{const p=emptyProgress();Object.keys(legacyHashes).forEach(id=>complete(p,id));p.last={themeId:'hababam',level:0,journey:'hababam-yillik'};return p;};
describe('atlas continuation and clue hunts',()=>{
 it('keeps every existing journey board exactly unchanged',()=>{
  assert.equal(Object.keys(legacyHashes).length,18);
  for(const [id,sha] of Object.entries(legacyHashes))assert.equal(createHash('sha256').update(JSON.stringify(journeyBoard(journeyById(id)!))).digest('hex'),sha,id);
 });
 it('gives a completed old atlas a new unlocked recommended map and real next chapter',()=>{
  const p=veteran(),states=discoveryState(p);assert.equal(states.length,16);assert(states.slice(0,3).every(s=>s.complete));assert.equal(states[3]!.unlocked,true);assert.equal(states[4]!.unlocked,false);
  assert.equal(recommendedExpedition(p).expedition.id,'hayvanlar');assert.equal(nextDiscovery(p).config.journey,'hayvanlar-atlas-1');assert.equal(nextJourneyAfter(p,'hababam-yillik')?.id,'hayvanlar-atlas-1');
 });
 it('registers 78 immutable chapters with distinct IDs, playable clues and bounded boards',()=>{
  assert.equal(ATLAS_REGIONS.length,13);assert.equal(ATLAS_JOURNEYS.length,78);assert.equal(new Set(ALL_JOURNEYS.map(j=>j.id)).size,ALL_JOURNEYS.length);
  for(const j of ATLAS_JOURNEYS){const b=journeyBoard(j);assert(b.size<=9);assert(b.targets.length>=4&&b.targets.length<=6);assert.equal(journeyById(j.id),j);assert.equal(new Set(j.words).size,j.words.length);
   if(j.clues){assert.equal(Object.keys(j.clues).length,b.targets.length);for(const t of b.targets){const copy=wordCardCopy(t,false,j.clues);assert(copy.isClue);assert(copy.text);assert(!normalize(copy.text).includes(t.text),j.id+': '+t.text);assert.equal(copy.detail,t.text.length+' harf');assert.equal(wordCardCopy(t,true,j.clues).text,t.label);}}
  }
  assert.equal(ATLAS_JOURNEYS.filter(j=>j.clues).length,26);
 });
 it('advances through the final stamp and into the next map without repeating earned rewards',()=>{
  const p=veteran();for(let i=1;i<=5;i++)complete(p,'hayvanlar-atlas-'+i);
  assert.equal(nextJourneyAfter(p,'hayvanlar-atlas-5')?.id,'hayvanlar-atlas-6');const before=loadProgress(JSON.stringify(p));complete(p,'hayvanlar-atlas-6');
  assert.equal(nextJourneyAfter(p,'hayvanlar-atlas-6')?.id,'lezzetler-atlas-1');assert.equal(discoveryRewards(before,p).filter(r=>r.kind==='album').length,1);assert.equal(discoveryState(p)[3]!.pieces,6);assert.deepEqual(discoveryRewards(p,loadProgress(JSON.stringify(p))),[]);
 });
 it('retains every new save and destination through device merge and cloud owner isolation',async()=>{
  const p=veteran();for(const j of ATLAS_JOURNEYS)complete(p,j.id);p.last={themeId:'mitoloji',level:0,journey:'mitoloji-atlas-6'};
  const loaded=loadProgress(JSON.stringify(p));assert.equal(Object.keys(loaded.saves).length,96);assert.equal(loaded.last?.journey,p.last.journey);assert.equal(discoveryState(loaded).filter(s=>s.complete).length,16);assert.equal(nextJourneyAfter(loaded,'mitoloji-atlas-6'),null);
  assert.equal(Object.keys(mergeProgress(loaded,emptyProgress()).saves).length,96);
  const f=fixture(),cloud=new CloudProgress(f.db,f.clock);await cloud.save('atlas-owner',loaded);assert.equal(Object.keys((await cloud.read('atlas-owner')).progress.saves).length,96);assert.equal(Object.keys((await cloud.read('other-owner')).progress.saves).length,0);f.sqlite.close();
 });
 it('fits all known completed boards and the maximum retained daily history under the existing API limit',()=>{
  const p=emptyProgress(),keys=[...THEMES.flatMap(t=>Array.from({length:6},(_,i)=>t.id+'.'+i)),...ALL_JOURNEYS.map(j=>'route:'+j.id),...MYSTERIES.map(m=>'mystery:'+m.id)];
  for(const key of keys){const b=progressBoard(key)!;p.saves[key]=cleanSave({strokes:b.placements,hints:3,elapsed:604800,complete:false,stars:0},b);}
  p.days=Array.from({length:3660},(_,i)=>new Date(Date.UTC(2030,0,i+1)).toISOString().slice(0,10));
  const raw=JSON.stringify(p);assert(Buffer.byteLength(JSON.stringify({progress:p}))<150000);assert.equal(Object.keys(loadProgress(raw).saves).length,keys.length);assert.equal(loadProgress(raw).days.length,3660);
 });
});
