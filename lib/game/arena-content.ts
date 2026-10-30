import {THEMES,normalize} from './catalog.ts';
import {hash,makeCustomPuzzle,match,type Puzzle} from './engine.ts';
import {RIDDLE_BANKS,riddleId} from './riddle-content.ts';
export type ArenaRoundKind='clue'|'words';
export const nextArenaKind=(kind:ArenaRoundKind):ArenaRoundKind=>kind==='clue'?'words':'clue';

// The source vocabulary is reviewed. Only short, whole words enter new Arena boards.
export const ARENA_BANKS=THEMES.map(theme=>({themeId:theme.id,words:[...new Set(theme.words.filter(w=>/^[A-ZÇĞİÖŞÜ]+$/u.test(w)&&normalize(w).length>=3&&normalize(w).length<=8).map(normalize))].sort()})).filter(b=>b.words.length>=6);
export const combinations=(n:number,k:number):number=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r);};
const counts=ARENA_BANKS.map(b=>combinations(b.words.length,6));
export const ARENA_POOL_SIZE=counts.reduce((a,b)=>a+b,0);
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
function combination(words:string[],rank:number){const result:string[]=[];let start=0;for(let remaining=6;remaining>0;remaining--){for(let i=start;i<=words.length-remaining;i++){const count=combinations(words.length-i-1,remaining-1);if(rank<count){result.push(words[i]!);start=i+1;break;}rank-=count;}}return result;}
/** An ordinal names a genuinely different word set, never just a new ID or filler seed. */
export function arenaSpec(ordinal:number){
 if(!Number.isSafeInteger(ordinal)||ordinal<0||ordinal>=ARENA_POOL_SIZE)return null;
 let lane=0,index=ordinal;
 // Interleave themes for variety, skipping exhausted banks without recycling any set.
 while(true){const active=counts.map((count,i)=>({count,i})).filter(x=>x.count>lane),span=Math.min(...active.map(x=>x.count))-lane,block=span*active.length;if(index<block){const entry=active[index%active.length]!,bank=ARENA_BANKS[entry.i]!,rank=lane+Math.floor(index/active.length);let step=7919;while(gcd(step,entry.count)!==1)step+=2;const permuted=(rank*step+hash('arena-v1:'+bank.themeId))%entry.count;return {themeId:bank.themeId,words:combination(bank.words,permuted),seed:hash('arena-v1:'+ordinal)};}index-=block;lane+=span;}
}
export const arenaWordKey=(board:Pick<Puzzle,'targets'>)=>JSON.stringify(board.targets.map(t=>normalize(t.text)).sort());
export const arenaGridKey=(board:Pick<Puzzle,'grid'>)=>JSON.stringify(board.grid);
export function arenaPuzzle(ordinal:number){
 const spec=arenaSpec(ordinal);if(!spec)return null;
 // Some word sets do not fit at their first seed. Search a small deterministic set;
 // an unfit candidate is skipped by the allocator, never published or recycled.
 for(let attempt=0;attempt<4;attempt++){
  const seed=attempt?hash('arena-v1:'+ordinal+':'+attempt):spec.seed,board=makeCustomPuzzle(spec.words,seed,8);
  if(board.size>8||board.placements.some(p=>match(board,p.a,p.b)?.id!==p.id))continue;
  const diagonals=board.placements.filter(p=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1]);
  if(!diagonals.some(p=>(p.b[0]-p.a[0])*(p.b[1]-p.a[1])>0)||!diagonals.some(p=>(p.b[0]-p.a[0])*(p.b[1]-p.a[1])<0))continue;
  return {...spec,seed,board,wordsKey:arenaWordKey(board),gridKey:arenaGridKey(board)};
 }
 return null;
}

export const ARENA_RIDDLE_POOL_SIZE=RIDDLE_BANKS.reduce((n,bank)=>n+combinations(bank.items.length,6),0);
function remainingRiddleBanks(used:readonly string[]){const excluded=new Set(used);return RIDDLE_BANKS.map(bank=>({...bank,items:bank.items.filter(([word])=>!excluded.has(riddleId(bank.themeId,word)))})).filter(bank=>bank.items.length>=6);}
export const hasArenaRiddles=(used:readonly string[])=>remainingRiddleBanks(used).length>0;
/** The room excludes individual definitions as well as lifetime whole-board receipts. */
export function arenaRiddlePuzzle(ordinal:number,used:readonly string[]=[]){
 if(!Number.isSafeInteger(ordinal)||ordinal<0||ordinal>=ARENA_RIDDLE_POOL_SIZE)return null;
 const banks=remainingRiddleBanks(used);if(!banks.length)return null;
 const bank=banks[ordinal%banks.length]!,available=bank.items.map(([word])=>word).sort(),count=combinations(available.length,6);
 let step=7919;while(gcd(step,count)!==1)step+=2;
 const rank=(Math.floor(ordinal/banks.length)*step+hash('arena-riddle-v1:'+bank.themeId))%count,words=combination(available,rank);
 const clues=Object.fromEntries(bank.items.filter(([word])=>words.includes(word))),riddleIds=words.map(word=>riddleId(bank.themeId,word));
 for(let attempt=0;attempt<4;attempt++){
  const seed=hash('arena-riddle-v1:'+ordinal+':'+words.join('|')+':'+attempt),board=makeCustomPuzzle(words,seed,8);
  if(board.size>8||board.placements.some(p=>match(board,p.a,p.b)?.id!==p.id))continue;
  const slopes=new Set(board.placements.filter(p=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1]).map(p=>Math.sign((p.b[0]-p.a[0])*(p.b[1]-p.a[1]))));
  if(slopes.has(1)&&slopes.has(-1))return {themeId:bank.themeId,words,seed,board,clues,riddleIds,wordsKey:arenaWordKey(board),gridKey:arenaGridKey(board)};
 }
 return null;
}
