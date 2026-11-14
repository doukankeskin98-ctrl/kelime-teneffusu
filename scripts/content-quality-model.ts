import {journeyRevision,journeyPresentationKey,JOURNEY_REVISION_TWO} from '../lib/game/journey-revisions.ts';
import {createHash} from 'node:crypto';
import {MAIN_JOURNEY} from '../lib/game/main-journey.ts';
import {journeyBoard,PLAYABLE_JOURNEYS,MYSTERIES} from '../lib/game/content.ts';
import {presentationBoard} from '../lib/game/journey-presentation.ts';
import {projectBoard} from '../lib/game/board-projection.ts';
import {chapterVeils} from '../lib/game/world-presentation.ts';
import {reviewNovelty,difficultyIssues,type ChapterLoad} from '../lib/game/editorial-quality.ts';
import {emptyProgress,progressBoard,cleanSave} from '../lib/game/progress.ts';
import {ALL_THEMES} from '../lib/game/catalog.ts';
import {PROGRESS_MAX_BYTES} from '../lib/game/progress-limits.ts';
import {EXPEDITIONS,expeditionBonusId} from '../lib/game/discovery.ts';
import {bonusBoard,cleanBonusSave} from '../lib/game/journey-bonus.ts';

export const sha=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function catalogueQuality(){
 const rows=MAIN_JOURNEY.map(({chapter,number},index)=>{
  const canonical=journeyBoard(chapter),display=presentationBoard(canonical,'route:'+chapter.id),projection=projectBoard(display);
  const veils=Object.values(chapterVeils(chapter.id,canonical.targets));
  const load:ChapterLoad={words:chapter.words.length,cells:projection.shape.rows*projection.shape.columns,
   diagonal:display.placements.filter(p=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1]).length,
   reverse:display.placements.filter(p=>p.b[0]<p.a[0]||p.b[0]===p.a[0]&&p.b[1]<p.a[1]).length,
   initial:veils.filter(v=>v==='initial').length,hidden:veils.filter(v=>v==='hidden').length,riddle:!!chapter.clues};
  return {id:chapter.id,number,title:chapter.title,contentHash:sha(chapter),boardHash:sha(canonical),displayHash:sha(display),load,
   novelty:reviewNovelty(chapter.words,MAIN_JOURNEY.slice(0,index).map(c=>c.chapter))};
 });
 const routes=EXPEDITIONS.map(world=>{
  const members=[...world.chapterIds,expeditionBonusId(world)].map(id=>rows.find(row=>row.id===id)!);
  return {id:world.id,chapters:members.map(r=>r.id),issues:difficultyIssues(members.map(r=>r.load),rows.slice(0,6).map(r=>r.load))};
 });
 return {rows,routes};
}

/** Saturated synthetic catalogue, NOT an observed player or a theoretical maximum.
 * Includes old aliases, bonus runs, daily history and all possible weekly keepsakes. */
export function capacityProbe(){
 const p=emptyProgress();
 const keys=[...ALL_THEMES.flatMap(t=>Array.from({length:6},(_,i)=>t.id+'.'+i)),...PLAYABLE_JOURNEYS.map(j=>'route:'+j.id),...MYSTERIES.map(m=>'mystery:'+m.id)];
 for(const key of keys){const board=progressBoard(key);if(board)p.saves[key]=cleanSave({strokes:board.placements,elapsed:604800,hints:3,complete:false,stars:0},board);}
 p.days=Array.from({length:3660},(_,i)=>new Date(Date.UTC(2016,0,i+1)).toISOString().slice(0,10));
 p.weekly={weeks:{},earned:[]};
 for(let d=Date.parse('2026-11-09T12:00:00Z');d<Date.parse('2100-01-01T00:00:00Z');d+=7*86400000)p.weekly.earned.push(new Date(d).toISOString().slice(0,10));
 const legacyBytes=Buffer.byteLength(JSON.stringify(p));
 p.bonuses=Object.fromEntries(EXPEDITIONS.map(w=>[w.id,cleanBonusSave(w.id,{attempt:1000000,found:bonusBoard(w.id).targets.map(t=>t.id),elapsed:60000})!]));
 p.welcomedWorlds=EXPEDITIONS.map(w=>w.id);p.mechanicGuides=['daily','mystery','concealed','riddle'];p.trailBadge='crown';
 const bytes=Buffer.byteLength(JSON.stringify(p));
 return {progress:p,savedBoards:Object.keys(p.saves).length,legacyBytes,bytes,limit:PROGRESS_MAX_BYTES,headroom:PROGRESS_MAX_BYTES-bytes};
}

/** Separate, inactive route evidence. Never substitutes released catalogue hashes. */
export function revisionCatalogueQuality(){
 return Object.keys(JOURNEY_REVISION_TWO).map(id=>{
  const chapter=journeyRevision(id,2)!,board=presentationBoard(journeyBoard(chapter),journeyPresentationKey(chapter)),projection=projectBoard(board);
  const veils=Object.values(chapterVeils(id,board.targets,2));
  const load:ChapterLoad={words:chapter.words.length,cells:projection.shape.rows*projection.shape.columns,
   diagonal:board.placements.filter(p=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1]).length,
   reverse:board.placements.filter(p=>p.b[0]<p.a[0]||p.b[0]===p.a[0]&&p.b[1]<p.a[1]).length,
   initial:veils.filter(v=>v==='initial').length,hidden:veils.filter(v=>v==='hidden').length,riddle:!!chapter.clues};
  return {id,chapter,board,load};
 });
}
