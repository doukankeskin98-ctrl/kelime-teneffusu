import {safeSnapshot,PRESENTATION_RULES,SHARED_RULES} from './board-quality.ts';
import {hash,makeCustomPuzzle,type Puzzle} from './engine.ts';
import {SPRINT_WORDS,ACTIVE_SPRINT_WORDS} from './sprint-vocabulary.ts';

export interface SprintHistory {v:1;sequence:number;words:Record<string,{uses:number;last:number}>;sets:string[]}
export const emptySprintHistory=():SprintHistory=>({v:1,sequence:0,words:{},sets:[]});
export const sprintHistoryKey=(owner?:string)=>'kt-sprint-history-v1:'+(owner??'device');
const vocabulary=new Set<string>(SPRINT_WORDS),validCount=(n:unknown):n is number=>Number.isSafeInteger(n)&&Number(n)>=0&&Number(n)<1e9;
const setKey=(words:readonly string[])=>[...words].sort().join('|');

/** Recover usable receipts without accepting arbitrary keys or changing main progress. */
export function parseSprintHistory(raw:string|null):SprintHistory{
 const result=emptySprintHistory();
 try{
  if(!raw||raw.length>800000)return result;
  const value=JSON.parse(raw);if(value?.v!==1||!validCount(value.sequence))return result;
  result.sequence=value.sequence;
  if(value.words&&typeof value.words==='object')for(const word of SPRINT_WORDS){
   const item=value.words[word];if(item&&validCount(item.uses)&&item.uses>0&&validCount(item.last)&&item.last<=result.sequence)result.words[word]={uses:item.uses,last:item.last};
  }
  if(Array.isArray(value.sets))result.sets=[...new Set<string>(value.sets.filter((key:unknown)=>typeof key==='string'&&key.length<=27&&key.split('|').length===4&&key.split('|').every(w=>vocabulary.has(w))))].slice(-4096);
 }catch{/* Damaged optional history never resets a player's saves or record. */}
 return result;
}

/** Monotone union: a stale tab must not erase words seen in another tab. */
export function mergeSprintHistory(a:SprintHistory,b:SprintHistory):SprintHistory{
 const words={...a.words};
 for(const word of SPRINT_WORDS){const x=a.words[word],y=b.words[word];if(y)words[word]={uses:Math.max(x?.uses??0,y.uses),last:Math.max(x?.last??0,y.last)};}
 return {v:1,sequence:Math.max(a.sequence,b.sequence),words,sets:[...new Set([...a.sets,...b.sets])].slice(-4096)};
}

/** Select fresh vocabulary first; after exhaustion spread reuse across the whole library. */
export function variedSprintBoard(seed:number,round:number,history:SprintHistory,safety?:'wide-v1'):Puzzle{
 const ranked=[...ACTIVE_SPRINT_WORDS].sort((a,b)=>{
  const x=history.words[a],y=history.words[b];
  return (x?.uses??0)-(y?.uses??0)||(x?.last??0)-(y?.last??0)||hash(`${seed}:${round}:${a}`)-hash(`${seed}:${round}:${b}`)||a.localeCompare(b,'tr');
 });
 const unseen=ranked.filter(w=>!history.words[w]),fixed=unseen.length<4?unseen:[];
 const frontier=(unseen.length>=4?unseen:ranked.filter(w=>!!history.words[w])).slice(0,48);
 const prior=new Set(history.sets);
 for(let attempt=0;attempt<128;attempt++){
  const candidates=attempt===0?ranked.slice(0,4):[...fixed,...[...frontier].sort((a,b)=>hash(`${seed}:${round}:${attempt}:${a}`)-hash(`${seed}:${round}:${attempt}:${b}`)).slice(0,4-fixed.length)];
  if(prior.has(setKey(candidates)))continue;
  try{
   // Four full-width words may not fit two forced opposite diagonals. Keep all
   // eight directions available in Sprint; authored/legacy boards retain their policy.
   const layoutSeed=hash(`sprint-v2:${seed}:${round}:${attempt}:${candidates.join('|')}`);
   const board=safeSnapshot(makeCustomPuzzle(candidates,layoutSeed,6,'any'),layoutSeed,{size:6},safety==='wide-v1'?PRESENTATION_RULES:SHARED_RULES);
   if(board.size===6&&board.targets.length===4)return board;
  }catch{/* A different valid set is preferable to silently dropping a word. */}
 }
 throw new Error('Yeni tur hazırlanamadı. Yeniden deneyebilirsin.');
}

/** Record every visible board, including abandoned ones; never only completed rounds. */
export function rememberSprintBoard(history:SprintHistory,board:Puzzle):SprintHistory{
 const words={...history.words},sequence=history.sequence+1,targets=[...new Set(board.targets.map(t=>t.text))];
 for(const word of targets)if(vocabulary.has(word))words[word]={uses:(words[word]?.uses??0)+1,last:sequence};
 const key=setKey(targets);
 return {v:1,sequence,words,sets:[...history.sets.filter(s=>s!==key),key].slice(-4096)};
}
