import {ARENA_CLUES,ARENA_LIBRARY,type ArenaEntry} from './arena-library.ts';
import {arenaWordKey,arenaGridKey} from './arena-content.ts';
import {hash,makeCustomPuzzle,match} from './engine.ts';

// Independent monotonic cursors: no old pool, board seed or snapshot is reinterpreted.
export const FRESH_GROUP_POOL='arena-variety-group-v3',FRESH_CLUE_POOL='arena-variety-clue-v3',FRESH_DUEL_POOL='arena-variety-duel-v2';
export const FRESH_POOL_LIMIT=2**31;
export interface WordHistory {word:string;uses:number;lastSeen:number;recent:number}
export interface FreshOptions {group:boolean;clue?:boolean;history?:readonly WordHistory[];usedRiddleIds?:readonly string[];variation?:number}
const usedAnswers=(ids:readonly string[])=>new Set(ids.map(id=>id.slice(id.lastIndexOf(':')+1)));
export const hasFreshRiddles=(used:readonly string[])=>{const excluded=usedAnswers(used);return ARENA_CLUES.filter(e=>!excluded.has(e.word)).length>=7;};

/** Rank actual vocabulary, not just random filler: unseen first, then least-used/oldest. */
export function freshEntries(ordinal:number,{group,clue=false,history=[],usedRiddleIds=[],variation=0}:FreshOptions):ArenaEntry[]{
 const count=group?7:6,excluded=clue?usedAnswers(usedRiddleIds):new Set<string>(),seen=new Map(history.map(h=>[h.word,h]));
 let available=(clue?ARENA_CLUES:ARENA_LIBRARY).filter(e=>!excluded.has(e.word));
 const cooled=available.filter(e=>!seen.get(e.word)?.recent);
 // A large mixed-history group may cover the whole library. Keep the room usable,
 // preferring the oldest/least-used words; exact board/grid repeats remain forbidden.
 if(cooled.length>=count)available=cooled;
 const key=`${group?'group':'duel'}:${clue?'clue':'words'}:${ordinal}`;
 const ranked=available.sort((a,b)=>{
  const x=seen.get(a.word),y=seen.get(b.word);
  return (x?.uses??0)-(y?.uses??0)||(x?.lastSeen??0)-(y?.lastSeen??0)||hash(key+':'+a.word)-hash(key+':'+b.word)||a.word.localeCompare(b.word,'tr');
 });
 if(!variation)return ranked.slice(0,count);
 // Exact-set collisions (or unplaceable sets) must change the words as well as
 // the seed. Explore a small low-frequency frontier while keeping unseen words
 // ahead of every seen word. The ordinal also changes after a bounded retry.
 const unseen=ranked.filter(e=>!seen.get(e.word)?.uses),fixed=unseen.length<count?unseen:[];
 const frontier=(unseen.length>=count?unseen:ranked.filter(e=>!!seen.get(e.word)?.uses)).slice(0,count-fixed.length+32);
 frontier.sort((a,b)=>hash(key+':retry:'+variation+':'+a.word)-hash(key+':retry:'+variation+':'+b.word)||a.word.localeCompare(b.word,'tr'));
 return [...fixed,...frontier.slice(0,count-fixed.length)];
}
export function freshArenaPuzzle(ordinal:number,options:FreshOptions){
 if(!Number.isSafeInteger(ordinal)||ordinal<0||ordinal>=FRESH_POOL_LIMIT)return null;
 const entries=freshEntries(ordinal,options),count=options.group?7:6,size=options.group?9:8;
 if(entries.length!==count)return null;
 const words=entries.map(e=>e.word),pool=options.group?(options.clue?FRESH_CLUE_POOL:FRESH_GROUP_POOL):FRESH_DUEL_POOL;
 for(let attempt=0;attempt<8;attempt++){
  const seed=hash(pool+':'+ordinal+':'+words.join('|')+':'+attempt);
  try{
   const board=makeCustomPuzzle(words,seed,size);
   if(board.size!==size||board.targets.length!==count||board.placements.some(p=>match(board,p.a,p.b)?.id!==p.id))continue;
   const slopes=new Set(board.placements.filter(p=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1]).map(p=>Math.sign((p.b[0]-p.a[0])*(p.b[1]-p.a[1]))));
   if(!slopes.has(1)||!slopes.has(-1))continue;
   return {themeId:entries[0]!.themeId,words,seed,board,wordsKey:arenaWordKey(board),gridKey:arenaGridKey(board),
    clues:options.clue?Object.fromEntries(entries.map(e=>[e.word,e.clue!])):undefined,
    riddleIds:options.clue?entries.map(e=>e.riddleId!):[]};
  }catch{/* Try a different deterministic layout, never silently omit an answer. */}
 }
 return null;
}
