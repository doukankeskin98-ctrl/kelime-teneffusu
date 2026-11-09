import {worldChapter} from '../lib/game/world-presentation.ts';
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {ACTIVE_THEMES} from '../lib/game/catalog.ts';
import {ACTIVE_JOURNEYS,journeyById,journeyBoard} from '../lib/game/content.ts';
import {ORIGINAL_CHAPTERS,CHAPTER_REPLACEMENTS,RETIRED_THEMES,RETIRED_SPRINT_WORDS} from '../lib/game/original-content.ts';
import {cleanSave,collectionStats,emptyProgress,loadProgress} from '../lib/game/progress.ts';
import {MAIN_JOURNEY,mainJourneyState} from '../lib/game/main-journey.ts';
import {discoveryState,discoveryRewards} from '../lib/game/discovery.ts';
import {ARENA_LIBRARY} from '../lib/game/arena-library.ts';
import {ACTIVE_SPRINT_WORDS} from '../lib/game/sprint-vocabulary.ts';
import {dailySpec,makePuzzle} from '../lib/game/engine.ts';
import {fixture} from './fixtures.ts';
import {challengeCatalogue} from '../lib/game/challenge-content.ts';
import {SocialService,type ChallengeView} from '../lib/game/social.ts';
import {newerChallenge} from '../lib/game/challenge-state.ts';

const finish=(p:ReturnType<typeof emptyProgress>,id:string,hints=0)=>{const b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:b.placements,elapsed:42,hints,complete:false,stars:0},b);};
describe('original catalogue retains earned progress',()=>{
 it('replaces thirty active slots, keeps every legacy board resolvable and bounds new authored boards',()=>{
  assert.equal(ORIGINAL_CHAPTERS.length,30);assert.equal(MAIN_JOURNEY.length,192);
  for(const [old,next] of Object.entries(CHAPTER_REPLACEMENTS)){assert(journeyById(old));assert(ACTIVE_JOURNEYS.some(j=>j.id===next));assert(!ACTIVE_JOURNEYS.some(j=>j.id===old));assert(!MAIN_JOURNEY.some(j=>j.chapter.id===old));assert(journeyBoard(journeyById(next)!).size<=9,next);}
  assert(ACTIVE_THEMES.every(t=>!RETIRED_THEMES.has(t.id)));
  const forbidden=['AMELİE','MATRİX','ATARI','OSCAR','ROCKY','TAZO','AVATAR','BATMAN'];
  for(const w of forbidden)assert(!ARENA_LIBRARY.some(e=>e.word===w),w);
  assert(ACTIVE_SPRINT_WORDS.every(w=>!RETIRED_SPRINT_WORDS.has(w)));
 });
 it('keeps old albums and stars, does not duplicate credit, and never copies old strokes to replacements',()=>{
  const p=emptyProgress();for(const old of Object.keys(CHAPTER_REPLACEMENTS))finish(p,old);
  const restored=loadProgress(JSON.stringify(p)),before=collectionStats(restored),worlds=discoveryState(restored);
  assert.equal(mainJourneyState(restored).completed,30);assert.equal(worlds.filter(w=>RETIRED_THEMES.has(w.expedition.id)&&w.complete).length,5);
  for(const [old,next] of Object.entries(CHAPTER_REPLACEMENTS)){assert.deepEqual(restored.saves['route:'+old],p.saves['route:'+old]);assert.equal(restored.saves['route:'+next],undefined);finish(restored,next,1);}
  assert.deepEqual(collectionStats(restored),before);assert.deepEqual(discoveryRewards(p,restored),[]);
 });
 it('preserves an already started world while a replacement starts with its own clean board',()=>{
  const p=emptyProgress(),id='hababam-3',b=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:[b.placements[0]!],hints:1,elapsed:20,complete:false,stars:0},b);p.last={journey:id,themeId:'hababam',level:0};
  p.saves['route:'+CHAPTER_REPLACEMENTS[id]]=cleanSave(undefined,journeyBoard(journeyById(CHAPTER_REPLACEMENTS[id]!)!));
  const restored=loadProgress(JSON.stringify(p));assert(discoveryState(restored).find(w=>w.expedition.id==='hababam')!.unlocked);assert.equal(mainJourneyState(restored).current?.chapter.id,CHAPTER_REPLACEMENTS[id]);assert.equal(restored.saves['route:'+CHAPTER_REPLACEMENTS[id]]?.strokes.length,0);
 });
 it('keeps historical daily generation and uses original content from the explicit boundary',()=>{
  for(let day=1;day<=30;day++){const date=`2026-11-${String(day).padStart(2,'0')}`,spec=dailySpec(date);if(day>=7)assert(!RETIRED_THEMES.has(spec.themeId));else assert.equal(JSON.stringify(makePuzzle(spec.themeId,spec.level,spec.seed)),JSON.stringify(makePuzzle(['turkiye','uzay','yesilcam','lezzetler','bilim','hayvanlar','muzik'][spec.seed%7]!,3,spec.seed)));}
 });
});
describe('chapter challenges use shared immutable content',()=>{
 it('lists all active main and optional chapters and all eligible source releases, beyond the shelf page',async()=>{
  const f=fixture(Date.parse('2026-11-06T12:00:00Z'));try{const choices=await challengeCatalogue(f.db,f.clock());assert.equal(choices.length,266);assert.equal(new Set(choices.map(c=>c.id)).size,choices.length);for(const j of ACTIVE_JOURNEYS)assert(choices.some(c=>c.id===j.id),j.id);assert(!choices.some(c=>c.id==='20261027-0002-4000-8000-000000000001'));assert(choices.filter(c=>c.kind==='extra').length>24);}finally{f.sqlite.close();}
 });
 it('shares one canonical clue board, validates both directions and keeps every participant path private',async()=>{
  const f=fixture(),service=new SocialService(f.db,f.clock);try{
   const chapter=ACTIVE_JOURNEYS.find(c=>c.clues)!,first=await service.create('alice',chapter.id),peer=await service.start('bob',first.code),board=journeyBoard(chapter);
   assert.deepEqual(first.board,peer.board);assert.deepEqual(first.clues,chapter.clues);assert.equal(first.title,worldChapter(chapter.id)?.topic??chapter.title);assert.equal(first.chapterId,chapter.id);assert(!('placements' in first.board));
   const saved=JSON.parse(String(f.sqlite.prepare('SELECT content FROM challenges').get()!['content']));assert.deepEqual(saved.board,board);
   for(const p of board.placements){f.advance(100);await service.claim('alice',first.code,p.b,p.a);}const done=await service.state('alice',first.code);assert(done.finished);assert.equal(done.strokes.length,board.targets.length);const bob=await service.state('bob',first.code);assert.equal(bob.strokes.length,0);assert.equal(bob.ghost?.timeline.length,board.targets.length);assert(!JSON.stringify(bob.ghost).includes('placements'));
  }finally{f.sqlite.close();}
 });
 it('rejects retired/unknown creation and keeps an already-started legacy code valid',async()=>{
  const f=fixture(),service=new SocialService(f.db,f.clock);try{
   for(const id of ['hababam','hababam-3','not-a-chapter'])await assert.rejects(()=>service.create('alice',id));
   await f.game.profile('alice');const c=await service.create('alice','uzay');f.sqlite.prepare("UPDATE challenges SET content=NULL,theme_id='hababam' WHERE code=?").run(c.code);const row=f.sqlite.prepare('SELECT level,seed FROM challenges').get()!;const board=makePuzzle('hababam',Number(row['level']),Number(row['seed']));
   await assert.rejects(()=>service.start('new-player',c.code),/yeni katılımlara/);const p=board.placements[0]!;const updated=await service.claim('alice',c.code,p.a,p.b);assert.equal(updated.strokes.length,1);
  }finally{f.sqlite.close();}
 });
 it('rejects stale reconnects and completed-to-active regressions without blocking a new match',()=>{
  const b=journeyBoard(ACTIVE_JOURNEYS[0]!),base={id:'run',serverNow:100,strokes:[b.placements[0]!],finished:null,code:'ABCDEFGHJK',themeId:'uzay',creator:true,starts:0,duration:0,board:b,expires:100000,ghost:null,results:[]} satisfies ChallengeView;
  assert(!newerChallenge(base,{...base,serverNow:99}));assert(!newerChallenge(base,{...base,serverNow:101,strokes:[]}));assert(!newerChallenge({...base,finished:101},{...base,serverNow:102}));assert(!newerChallenge(base,{...base,id:'other'}));assert(newerChallenge(base,{...base,id:'other'},true));
 });
});
