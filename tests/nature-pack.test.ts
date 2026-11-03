import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {createHash} from 'node:crypto';
import baseline from './fixtures/journey-0290.json' with {type:'json'};
import {NATURE_ROUTES,NATURE_CHAPTERS} from '../lib/game/nature-content.ts';
import {journeyById,journeyBoard} from '../lib/game/content.ts';
import {MAIN_JOURNEY_IDS,mainJourneyState} from '../lib/game/main-journey.ts';
import {emptyProgress,cleanSave,loadProgress,mergeProgress} from '../lib/game/progress.ts';
import {chapterVeils} from '../lib/game/world-presentation.ts';
import {match} from '../lib/game/engine.ts';
import {discoveryRewards,discoveryState} from '../lib/game/discovery.ts';

describe('Doğa Günlüğü preserves the full published campaign',()=>{
 it('keeps every previous number, ID and full board hash and appends24 curated chapters',()=>{assert.equal(baseline.ids.length,120);assert.deepEqual(MAIN_JOURNEY_IDS.slice(0,120),baseline.ids);for(const [id,hash] of Object.entries(baseline.boards))assert.equal(createHash('sha256').update(JSON.stringify(journeyBoard(journeyById(id)!))).digest('hex'),hash,id);assert.deepEqual(MAIN_JOURNEY_IDS.slice(120,144),NATURE_CHAPTERS.map(c=>c.id));});
 it('continues a veteran at121 and round-trips a new partial without resetting earned rewards',()=>{const p=emptyProgress();for(const id of baseline.ids){const b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:b.placements,hints:0,elapsed:30,complete:false,stars:0},b);}const before=loadProgress(JSON.stringify(p));assert.equal(mainJourneyState(p).current?.number,121);const c=NATURE_CHAPTERS[0]!,b=journeyBoard(c);p.saves['route:'+c.id]=cleanSave({strokes:[b.placements[0]!],hints:1,elapsed:10,complete:false,stars:0},b);p.last={themeId:c.themeId,level:0,journey:c.id};const restored=mergeProgress(loadProgress(JSON.stringify(p)),emptyProgress());assert.deepEqual(restored.saves['route:'+c.id],p.saves['route:'+c.id]);assert.equal(mainJourneyState(restored).completed,120);assert.equal(mainJourneyState(restored).current?.chapter.id,c.id);assert.deepEqual(discoveryRewards(before,restored),[]);assert.equal(discoveryState(restored).find(s=>s.expedition.id===NATURE_ROUTES[0]!.id)?.unlocked,true);});
 it('keeps all targets solvable, four clue rounds, breathing levels and only one hidden target in24 levels',()=>{assert.equal(NATURE_CHAPTERS.length,24);assert.equal(NATURE_CHAPTERS.filter(c=>c.clues).length,4);let hidden=0;for(const c of NATURE_CHAPTERS){const b=journeyBoard(c);assert(b.size>=6&&b.size<=8);assert(b.targets.length>=4&&b.targets.length<=5);for(const place of b.placements){assert.equal(match(b,place.a,place.b)?.id,place.id);assert.equal(match(b,place.b,place.a)?.id,place.id);}if(c.clues)assert.equal(Object.keys(c.clues).length,b.targets.length);hidden+=Object.values(chapterVeils(c.id,b.targets)).filter(v=>v==='hidden').length;}assert.equal(hidden,1);for(const r of NATURE_ROUTES)assert.equal(r.chapters[3]!.difficulty,'Rahat');});
});
