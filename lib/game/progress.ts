import {hash,makePuzzle,match,type Puzzle,type Stroke} from './engine.ts';
import {THEMES} from './catalog.ts';
import {PLAYABLE_JOURNEYS,MYSTERIES,journeyBoard,mysteryBoard} from './content.ts';
export interface SavedLevel {strokes:Stroke[];elapsed:number;hints:number;complete:boolean;stars:number}
export interface Progress {
 v:2;saves:Record<string,SavedLevel>;sound:boolean;zoom:boolean;days:string[];
 last:{themeId:string;level:number;journey?:string}|null;
 haptics:boolean;contrast:boolean;palette:'classic'|'ocean'|'orchid';tutorialDone:boolean;analytics:boolean;mysteries:string[];
}
export const PROGRESS_KEY='kelime-teneffusu-v2';
export const emptyProgress=():Progress=>({v:2,saves:{},sound:false,zoom:false,days:[],last:null,haptics:false,contrast:false,palette:'classic',tutorialDone:false,analytics:false,mysteries:[]});
const knownKeys=new Set([...THEMES.flatMap(t=>Array.from({length:6},(_,l)=>`${t.id}.${l}`)),...PLAYABLE_JOURNEYS.map(j=>'route:'+j.id),...MYSTERIES.map(m=>'mystery:'+m.id)]);
const boardCache=new Map<string,Puzzle>();
export function progressBoard(key:string):Puzzle|null {
 if(!knownKeys.has(key))return null;
 const cached=boardCache.get(key);if(cached)return cached;
 const board=resolveProgressBoard(key);if(board)boardCache.set(key,board);return board;
}
function resolveProgressBoard(key:string):Puzzle|null {
 if(key.startsWith('route:')){const j=PLAYABLE_JOURNEYS.find(j=>'route:'+j.id===key);return j?journeyBoard(j):null;}
 if(key.startsWith('mystery:')){const m=MYSTERIES.find(m=>'mystery:'+m.id===key);return m?mysteryBoard(m):null;}
 const [themeId,raw]=key.split('.'),level=Number(raw);
 return themeId&&THEMES.some(t=>t.id===themeId)&&Number.isInteger(level)&&level>=0&&level<6?makePuzzle(themeId,level,hash(`campaign-v2:${themeId}:${level}`)):null;
}
export function loadProgress(raw:string|null):Progress {
 try{
  if(raw&&raw.length>150000)return emptyProgress();
  const r=JSON.parse(raw??'null') as Partial<Progress>|null;if(!r||r.v!==2)return emptyProgress();
  const saves:Record<string,SavedLevel>={};
  if(r.saves&&typeof r.saves==='object')for(const [key,saved] of Object.entries(r.saves)){
   if(!knownKeys.has(key)||!saved||typeof saved!=='object')continue;
   const board=progressBoard(key);if(board)saves[key]=cleanSave(saved,board);
  }
  let last:Progress['last']=null;
  if(r.last&&THEMES.some(t=>t.id===r.last?.themeId)&&Number.isInteger(r.last.level)&&r.last.level>=0&&r.last.level<6){
   const j=PLAYABLE_JOURNEYS.find(j=>j.id===r.last?.journey&&j.themeId===r.last.themeId);
   last={themeId:r.last.themeId,level:r.last.level,...(j?{journey:j.id}:{})};
  }
  const days=Array.isArray(r.days)?[...new Set(r.days.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'))))].sort().slice(-3660):[];
  return {v:2,saves,sound:r.sound===true,zoom:r.zoom===true,days,last,haptics:r.haptics===true,contrast:r.contrast===true,palette:r.palette==='ocean'||r.palette==='orchid'?r.palette:'classic',tutorialDone:r.tutorialDone===true,analytics:r.analytics===true,mysteries:Array.isArray(r.mysteries)?[...new Set(r.mysteries.filter(x=>MYSTERIES.some(m=>m.id===x)))]:[]};
 }catch{return emptyProgress();}
}
export function cleanSave(raw:SavedLevel|undefined,board:Pick<Puzzle,'size'|'grid'|'targets'>):SavedLevel {
 const strokes:Stroke[]=[];
 if(Array.isArray(raw?.strokes))for(const s of raw.strokes.slice(0,30)){if(!s)continue;const t=match(board,s.a,s.b);if(t?.id===s.id&&!strokes.some(x=>x.id===s.id))strokes.push({id:s.id,a:s.a,b:s.b});}
 const hints=Number.isInteger(raw?.hints)?Math.max(0,Math.min(3,raw!.hints)):0;
 const elapsed=typeof raw?.elapsed==='number'&&Number.isFinite(raw.elapsed)?Math.max(0,Math.min(604800,Math.floor(raw.elapsed))):0;
 return {strokes,hints,elapsed,complete:strokes.length===board.targets.length,stars:strokes.length===board.targets.length?3-Math.min(2,hints):0};
}
/** Solo progress is never used to award competitive points. Concurrent device saves only add discoveries. */
export function mergeProgress(server:Progress,local:Progress):Progress {
 const saves={...server.saves};
 for(const [key,incoming] of Object.entries(local.saves)){
  const current=saves[key];if(!current){saves[key]=incoming;continue;}
  if(current.complete||incoming.complete){saves[key]=[current,incoming].filter(s=>s.complete).sort((a,b)=>b.stars-a.stars||a.elapsed-b.elapsed)[0]!;continue;}
  const board=progressBoard(key);if(!board)continue;
  const strokes=[...current.strokes,...incoming.strokes.filter(s=>!current.strokes.some(c=>c.id===s.id))];
  saves[key]=cleanSave({strokes,elapsed:Math.max(current.elapsed,incoming.elapsed),hints:Math.max(current.hints,incoming.hints),complete:false,stars:0},board);
 }
 return {...local,last:local.last??server.last,saves,days:[...new Set([...server.days,...local.days])].sort().slice(-3660),tutorialDone:server.tutorialDone||local.tutorialDone,mysteries:[...new Set([...server.mysteries,...local.mysteries])]};
}
export function streak(days:string[],today:string):number {const unique=new Set(days);const date=new Date(today+'T12:00:00Z');if(!unique.has(today))date.setUTCDate(date.getUTCDate()-1);let count=0;while(unique.has(date.toISOString().slice(0,10))){count++;date.setUTCDate(date.getUTCDate()-1);}return count;}
export function collectionStats(p:Progress){const completed=Object.values(p.saves).filter(s=>s.complete).length;return {completed,stars:Object.values(p.saves).reduce((n,s)=>n+(s.complete?s.stars:0),0),worlds:THEMES.filter(t=>Object.entries(p.saves).some(([key,s])=>s.complete&&(key.startsWith(t.id+'.')||key.startsWith('route:'+t.id+'-')))).length};}
