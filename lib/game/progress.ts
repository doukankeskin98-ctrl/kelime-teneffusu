import {hash,makePuzzle,match,type Puzzle,type Stroke} from './engine.ts';
import {THEMES} from './catalog.ts';
export interface SavedLevel {strokes:Stroke[];elapsed:number;hints:number;complete:boolean;stars:number}
export interface Progress {v:2;saves:Record<string,SavedLevel>;sound:boolean;zoom:boolean;days:string[];last:{themeId:string;level:number}|null}
export const PROGRESS_KEY='kelime-teneffusu-v2';
export const emptyProgress=():Progress=>({v:2,saves:{},sound:false,zoom:false,days:[],last:null});
export function loadProgress(raw:string|null):Progress {
 try{
  const r=JSON.parse(raw??'null') as Partial<Progress>|null;if(!r||r.v!==2)return emptyProgress();
  const saves:Record<string,SavedLevel>={};
  for(const theme of THEMES)for(let level=0;level<6;level++){
    const key=`${theme.id}.${level}`,saved=r.saves?.[key];
    if(saved&&typeof saved==='object')saves[key]=cleanSave(saved,makePuzzle(theme.id,level,hash(`campaign-v2:${theme.id}:${level}`)));
  }
  const last=r.last&&THEMES.some(t=>t.id===r.last?.themeId)&&Number.isInteger(r.last.level)&&r.last.level>=0&&r.last.level<6?r.last:null;
  return {v:2,saves,sound:r.sound===true,zoom:r.zoom===true,days:Array.isArray(r.days)?[...new Set(r.days.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-3660):[],last};
 }catch{return emptyProgress();}
}
export function cleanSave(raw:SavedLevel|undefined,board:Pick<Puzzle,'size'|'grid'|'targets'>):SavedLevel {
 const strokes:Stroke[]=[];
 if(Array.isArray(raw?.strokes))for(const s of raw.strokes){if(!s)continue;const t=match(board,s.a,s.b);if(t?.id===s.id&&!strokes.some(x=>x.id===s.id))strokes.push(s);}
 const hints=Number.isInteger(raw?.hints)?Math.max(0,Math.min(3,raw!.hints)):0;
 const elapsed=typeof raw?.elapsed==='number'&&Number.isFinite(raw.elapsed)?Math.max(0,Math.floor(raw.elapsed)):0;
 return {strokes,hints,elapsed,complete:strokes.length===board.targets.length,stars:strokes.length===board.targets.length?3-Math.min(2,hints):0};
}
export function streak(days:string[],today:string):number {const unique=new Set(days);const date=new Date(today+'T12:00:00Z');if(!unique.has(today))date.setUTCDate(date.getUTCDate()-1);let count=0;while(unique.has(date.toISOString().slice(0,10))){count++;date.setUTCDate(date.getUTCDate()-1);}return count;}
