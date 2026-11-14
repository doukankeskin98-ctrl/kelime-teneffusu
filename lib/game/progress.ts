import {parseProgressEnvelope,sameProgress,ProgressFormatError} from './progress-codec.ts';
import {journeyRevision,savedRevision} from './journey-revisions.ts';
import {cleanWeekly,mergeWeekly,type WeeklyProgress} from './weekly-reward.ts';
import {CHAPTER_REPLACEMENTS,originalThemeId} from './original-content.ts';
import {boardColor,type BoardColor} from './board-color.ts';
import {hash,makePuzzle,match,type Puzzle,type Stroke} from './engine.ts';
import {ALL_THEMES as THEMES} from './catalog.ts';
import {PLAYABLE_JOURNEYS,MYSTERIES,journeyBoard,mysteryBoard} from './content.ts';
import {BONUS_WORDS,cleanBonusSave,mergeBonusSave,type BonusSave} from './journey-bonus.ts';
import {MECHANIC_GUIDES,WORD_TRAIL,type MechanicGuideId} from './journey-flow.ts';
export interface SavedLevel {revision?:2;strokes:Stroke[];elapsed:number;hints:number;complete:boolean;stars:number}
export interface Progress {
 revisionSaves?:Record<string,Record<string,SavedLevel>>;
 ambience?:boolean;weekly?:WeeklyProgress;
 bonuses?:Record<string,BonusSave>;welcomedWorlds?:string[];mechanicGuides?:MechanicGuideId[];trailBadge?:string;
 guideDone?:true;boardColor?:BoardColor;v:2;saves:Record<string,SavedLevel>;sound:boolean;zoom:boolean;days:string[];
 last:{themeId:string;level:number;journey?:string}|null;
 haptics:boolean;contrast:boolean;palette:'classic'|'ocean'|'orchid';tutorialDone:boolean;analytics:boolean;mysteries:string[];
}
export const PROGRESS_KEY='kelime-teneffusu-v2';
export const emptyProgress=():Progress=>({v:2,saves:{},sound:true,zoom:false,days:[],last:null,haptics:true,contrast:false,palette:'classic',tutorialDone:false,analytics:false,mysteries:[]});
const knownKeys=new Set([...THEMES.flatMap(t=>Array.from({length:6},(_,l)=>`${t.id}.${l}`)),...PLAYABLE_JOURNEYS.map(j=>'route:'+j.id),...MYSTERIES.map(m=>'mystery:'+m.id)]);
const boardCache=new Map<string,Puzzle>();
export function progressBoard(key:string,revision=1):Puzzle|null {
 if(!knownKeys.has(key))return null;
 const cacheKey=key+':rev:'+revision,cached=boardCache.get(cacheKey);if(cached)return cached;
 const board=resolveProgressBoard(key,revision);if(board)boardCache.set(cacheKey,board);return board;
}
function resolveProgressBoard(key:string,revision:number):Puzzle|null {
 if(key.startsWith('route:')){const j=journeyRevision(key.slice(6),revision);return j?journeyBoard(j):null;}
 if(revision!==1)return null;
 if(key.startsWith('mystery:')){const m=MYSTERIES.find(m=>'mystery:'+m.id===key);return m?mysteryBoard(m):null;}
 const [themeId,raw]=key.split('.'),level=Number(raw);
 return themeId&&THEMES.some(t=>t.id===themeId)&&Number.isInteger(level)&&level>=0&&level<6?makePuzzle(themeId,level,hash(`campaign-v2:${themeId}:${level}`)):null;
}
export function loadProgress(raw:string|null):Progress {
 try{return raw?readProgress(raw):emptyProgress();}catch{return emptyProgress();}
}
export function readProgress(raw:string):Progress {const decoded=parseProgressEnvelope(raw);return normalizeProgress(decoded,JSON.parse(raw).v===3);}
/** Called only with a bounded envelope or an already validated in-memory value. */
export function normalizeProgress(value:unknown,strict=false):Progress {
  const r=value as Partial<Progress>|null;if(!r||r.v!==2)throw new ProgressFormatError('Unsupported progress');
  const saves:Record<string,SavedLevel>={};
  if(r.saves&&typeof r.saves==='object')for(const [key,saved] of Object.entries(r.saves)){
   if(!knownKeys.has(key)){if(strict)throw new ProgressFormatError('Unknown saved chapter');continue;}
   if(!saved||typeof saved!=='object')throw new ProgressFormatError('Invalid saved chapter');
   if(saved.revision!==undefined&&saved.revision!==2)throw new ProgressFormatError('Unknown content revision');
   const board=progressBoard(key,savedRevision(saved));if(!board)throw new ProgressFormatError('Unavailable content revision');const clean=cleanSave(saved,board);if(strict&&!sameProgress(clean,saved))throw new ProgressFormatError('Invalid saved path or result');saves[key]=clean;
  }
  const revisionSaves:NonNullable<Progress['revisionSaves']>={};
  if(r.revisionSaves){for(const [key,versions] of Object.entries(r.revisionSaves)){
   if(!knownKeys.has(key)||!versions||typeof versions!=='object')throw new ProgressFormatError('Invalid revision history');
   const clean:Record<string,SavedLevel>={};for(const [version,save] of Object.entries(versions)){
    const revision=Number(version),board=progressBoard(key,revision);
    if(!board||![1,2].includes(revision)||savedRevision(save)!==revision)throw new ProgressFormatError('Invalid revision history');
    clean[version]=cleanSave(save,board);if(strict&&!sameProgress(clean[version],save))throw new ProgressFormatError('Invalid historical path or result');
   }if(Object.keys(clean).length)revisionSaves[key]=clean;
  }}
  let last:Progress['last']=null;
  if(r.last&&THEMES.some(t=>t.id===r.last?.themeId)&&Number.isInteger(r.last.level)&&r.last.level>=0&&r.last.level<6){
   const j=PLAYABLE_JOURNEYS.find(j=>j.id===r.last?.journey&&j.themeId===r.last.themeId);
   last={themeId:r.last.themeId,level:r.last.level,...(j?{journey:j.id}:{})};
  }
  const days=Array.isArray(r.days)?[...new Set(r.days.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'))))].sort().slice(-3660):[];
  const bonuses:Record<string,BonusSave>={};
  if(r.bonuses&&typeof r.bonuses==='object')for(const id of Object.keys(BONUS_WORDS)){const value=cleanBonusSave(id,r.bonuses[id]);if(value)bonuses[id]=value;}
  const welcomedWorlds=Array.isArray(r.welcomedWorlds)?[...new Set(r.welcomedWorlds.filter(x=>typeof x==='string'&&Object.prototype.hasOwnProperty.call(BONUS_WORDS,x)))].sort():[];
  const mechanicGuides=Array.isArray(r.mechanicGuides)?MECHANIC_GUIDES.filter(x=>r.mechanicGuides!.includes(x)):[];
  const weekly=cleanWeekly(r.weekly);
  return {...(Object.keys(revisionSaves).length?{revisionSaves}:{}),...(weekly?{weekly}:{}),...(typeof r.ambience==='boolean'?{ambience:r.ambience}:{}),...(Object.keys(bonuses).length?{bonuses}:{}),...(welcomedWorlds.length?{welcomedWorlds}:{}),...(mechanicGuides.length?{mechanicGuides}:{}),...(WORD_TRAIL.some(t=>t.id===r.trailBadge)?{trailBadge:r.trailBadge}:{}),...(r.guideDone===true?{guideDone:true as const}:{}),...(boardColor(r.boardColor)?{boardColor:boardColor(r.boardColor)}:{}),v:2,saves,sound:r.sound===true,zoom:r.zoom===true,days,last,haptics:r.haptics===true,contrast:r.contrast===true,palette:r.palette==='ocean'||r.palette==='orchid'?r.palette:'classic',tutorialDone:r.tutorialDone===true,analytics:r.analytics===true,mysteries:Array.isArray(r.mysteries)?[...new Set(r.mysteries.filter(x=>MYSTERIES.some(m=>m.id===x)))]:[]};
}
export function cleanSave(raw:SavedLevel|undefined,board:Pick<Puzzle,'size'|'grid'|'targets'>):SavedLevel {
 const strokes:Stroke[]=[];
 if(Array.isArray(raw?.strokes))for(const s of raw.strokes.slice(0,30)){if(!s)continue;const t=match(board,s.a,s.b);if(t?.id===s.id&&!strokes.some(x=>x.id===s.id))strokes.push({id:s.id,a:s.a,b:s.b});}
 const hints=Number.isInteger(raw?.hints)?Math.max(0,Math.min(3,raw!.hints)):0;
 const elapsed=typeof raw?.elapsed==='number'&&Number.isFinite(raw.elapsed)?Math.max(0,Math.min(604800,Math.floor(raw.elapsed))):0;
 return {...(raw?.revision===2?{revision:2 as const}:{}),strokes,hints,elapsed,complete:strokes.length===board.targets.length,stars:strokes.length===board.targets.length?3-Math.min(2,hints):0};
}
/** Solo progress is never used to award competitive points. Concurrent device saves only add discoveries. */
export function mergeProgress(server:Progress,local:Progress):Progress {
 const saves={...server.saves},revisionSaves:NonNullable<Progress['revisionSaves']>={...server.revisionSaves};
 const keys=new Set([...Object.keys(local.saves),...Object.keys(local.revisionSaves??{})]);
 for(const key of keys){
  const versions:Record<string,SavedLevel>={};
  for(const candidate of [...Object.values(server.revisionSaves?.[key]??{}),server.saves[key],...Object.values(local.revisionSaves?.[key]??{}),local.saves[key]]){
   if(!candidate)continue;const revision=savedRevision(candidate),current=versions[revision];
   if(!current){versions[revision]=candidate;continue;}
   if(current.complete||candidate.complete){versions[revision]=[current,candidate].filter(s=>s.complete).sort((a,b)=>b.stars-a.stars||a.elapsed-b.elapsed)[0]!;continue;}
   const board=progressBoard(key,revision);if(!board)throw new ProgressFormatError('Unavailable content revision');
   versions[revision]=cleanSave({...current,strokes:[...current.strokes,...candidate.strokes.filter(s=>!current.strokes.some(c=>c.id===s.id))],elapsed:Math.max(current.elapsed,candidate.elapsed),hints:Math.max(current.hints,candidate.hints)},board);
  }
  const all=Object.values(versions),completed=all.filter(s=>s.complete).sort((a,b)=>b.stars-a.stars||a.elapsed-b.elapsed||savedRevision(a)-savedRevision(b));
  const pinned=server.saves[key]??local.saves[key];
  saves[key]=completed[0]??versions[savedRevision(pinned)]??all[0]!;
  if(all.length>1)revisionSaves[key]=versions;
 }
 const bonuses={...server.bonuses};for(const [id,save] of Object.entries(local.bonuses??{}))bonuses[id]=bonuses[id]?mergeBonusSave(bonuses[id]!,save):save;
 const welcomedWorlds=[...new Set([...(server.welcomedWorlds??[]),...(local.welcomedWorlds??[])])].sort(),mechanicGuides=MECHANIC_GUIDES.filter(x=>server.mechanicGuides?.includes(x)||local.mechanicGuides?.includes(x));
 const weekly=mergeWeekly(server.weekly,local.weekly);
 return {...(server.ambience!==undefined?{ambience:server.ambience}:{}),...(server.guideDone||local.guideDone?{guideDone:true as const}:{}),...(server.boardColor?{boardColor:server.boardColor}:{}),...local,...(weekly?{weekly}:{}),...(Object.keys(bonuses).length?{bonuses}:{}),...(welcomedWorlds.length?{welcomedWorlds}:{}),...(mechanicGuides.length?{mechanicGuides}:{}),last:local.last??server.last,saves,...(Object.keys(revisionSaves).length?{revisionSaves}:{}),days:[...new Set([...server.days,...local.days])].sort().slice(-3660),tutorialDone:server.tutorialDone||local.tutorialDone,mysteries:[...new Set([...server.mysteries,...local.mysteries])]};
}
export function streak(days:string[],today:string):number {const unique=new Set(days);const date=new Date(today+'T12:00:00Z');if(!unique.has(today))date.setUTCDate(date.getUTCDate()-1);let count=0;while(unique.has(date.toISOString().slice(0,10))){count++;date.setUTCDate(date.getUTCDate()-1);}return count;}
export function collectionStats(p:Progress){
 const credits=new Map<string,SavedLevel>(),worlds=new Set<string>();
 for(const [key,save] of Object.entries(p.saves)){
  if(!save.complete)continue;
  const id=key.startsWith('route:')?key.slice(6):'',alias=CHAPTER_REPLACEMENTS[id],canonical=alias?'route:'+alias:key,prior=credits.get(canonical);
  if(!prior||save.stars>prior.stars)credits.set(canonical,save);
  const chapter=PLAYABLE_JOURNEYS.find(j=>j.id===id),theme=chapter?.themeId??key.split('.')[0];
  if(theme&&THEMES.some(t=>t.id===theme))worlds.add(originalThemeId(theme));
 }
 return {completed:credits.size,stars:[...credits.values()].reduce((n,s)=>n+s.stars,0),worlds:worlds.size};
}
