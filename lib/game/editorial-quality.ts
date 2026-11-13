import {normalize} from './catalog.ts';

export interface WordEntry {id:string;title:string;words:readonly string[]}
export interface NoveltyReview {
 repeated:string[];
 repeatRatio:number;
 nearestRepeat:number|null;
 nearCopies:{id:string;title:string;shared:string[];ratio:number}[];
}
/** Whole answer labels, never filler letters. Shared by the editor and release gate. */
export function reviewNovelty(words:readonly string[],history:readonly WordEntry[]):NoveltyReview {
 const targets=[...new Set(words.map(normalize))],seen=new Map<string,number>();
 const nearCopies:NoveltyReview['nearCopies']=[];
 history.forEach((entry,index)=>{
  const prior=new Set(entry.words.map(normalize)),shared=targets.filter(word=>prior.has(word));
  const ratio=shared.length/Math.max(1,Math.min(targets.length,prior.size));
  // Also catches a three-word subset of a longer published list.
  if(shared.length>=3&&ratio>=.75)nearCopies.push({id:entry.id,title:entry.title,shared,ratio});
  for(const word of prior)seen.set(word,index);
 });
 const repeated=targets.filter(word=>seen.has(word));
 return {repeated,repeatRatio:repeated.length/Math.max(1,targets.length),
  nearestRepeat:repeated.length?Math.min(...repeated.map(word=>history.length-seen.get(word)!)):null,
  nearCopies};
}

export interface ChapterLoad {words:number;cells:number;diagonal:number;reverse:number;initial:number;hidden:number;riddle:boolean}
const mean=(rows:readonly ChapterLoad[],key:'words'|'cells')=>rows.reduce((sum,row)=>sum+row[key],0)/Math.max(1,rows.length);
/** Admission rules for NEW six-chapter routes, not a claim of playtested difficulty.
 * Readability remains a separate hard check. Larger grids alone do not earn a pass. */
export function difficultyIssues(route:readonly ChapterLoad[],opening:readonly ChapterLoad[]):string[] {
 if(route.length!==6)return ['route-length'];
 const issues:string[]=[];
 if(mean(route.slice(-2),'words')<mean(route.slice(0,2),'words')+1)issues.push('flat-route');
 if(mean(route,'words')<mean(opening,'words')||mean(route,'cells')<mean(opening,'cells'))issues.push('late-route-below-opening');
 if(route.slice(-2).every(row=>!row.riddle&&!row.initial&&!row.hidden&&row.reverse===0))issues.push('no-late-mechanic');
 if(route.some(row=>row.hidden>1||row.initial>2))issues.push('excessive-concealment');
 return issues;
}
