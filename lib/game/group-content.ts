import {hash,makeCustomPuzzle,match,type Puzzle} from './engine.ts';
import {ARENA_BANKS,combinations,arenaWordKey,arenaGridKey} from './arena-content.ts';
import {RIDDLE_BANKS,riddleId} from './riddle-content.ts';

/** Versioned group9x7-v2 contract. Existing room puzzle snapshots and legacy duel pools stay unchanged. */
export const GROUP_WORD_POOL='arena-group-9x7-v2',GROUP_CLUE_POOL='arena-group-clue-9x7-v2';
export const GROUP_SIZE=9,GROUP_WORDS=7;
export const GROUP_BANKS=ARENA_BANKS.filter(b=>b.words.length>=GROUP_WORDS);
const counts=GROUP_BANKS.map(b=>combinations(b.words.length,GROUP_WORDS));
export const GROUP_POOL_SIZE=counts.reduce((a,b)=>a+b,0);
export const GROUP_CLUE_POOL_SIZE=RIDDLE_BANKS.reduce((n,b)=>n+combinations(b.items.length,GROUP_WORDS),0);
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
function permute(rank:number,count:number,key:string){let step=7919;while(gcd(step,count)!==1)step+=2;return (rank*step+hash(key))%count;}
function subset(words:string[],rank:number){const result:string[]=[];let start=0;for(let left=GROUP_WORDS;left>0;left--)for(let i=start;i<=words.length-left;i++){const count=combinations(words.length-i-1,left-1);if(rank<count){result.push(words[i]!);start=i+1;break;}rank-=count;}return result;}
function puzzle(words:string[],key:string){
 for(let attempt=0;attempt<4;attempt++){
  const seed=hash(key+':'+attempt);let board:Puzzle;try{board=makeCustomPuzzle(words,seed,GROUP_SIZE);}catch{continue;}
  if(board.size!==GROUP_SIZE||board.targets.length!==GROUP_WORDS||new Set(board.targets.map(t=>t.text)).size!==GROUP_WORDS||board.placements.some(p=>match(board,p.a,p.b)?.id!==p.id))continue;
  const slopes=new Set(board.placements.filter(p=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1]).map(p=>Math.sign((p.b[0]-p.a[0])*(p.b[1]-p.a[1]))));
  if(slopes.has(1)&&slopes.has(-1))return {seed,board,wordsKey:arenaWordKey(board),gridKey:arenaGridKey(board)};
 }
 return null;
}
export function groupSpec(ordinal:number){
 if(!Number.isSafeInteger(ordinal)||ordinal<0||ordinal>=GROUP_POOL_SIZE)return null;
 let lane=0,index=ordinal;
 while(true){const active=counts.map((count,i)=>({count,i})).filter(x=>x.count>lane),span=Math.min(...active.map(x=>x.count))-lane,block=span*active.length;if(index<block){const entry=active[index%active.length]!,bank=GROUP_BANKS[entry.i]!,rank=lane+Math.floor(index/active.length);return {themeId:bank.themeId,words:subset(bank.words,permute(rank,entry.count,GROUP_WORD_POOL+':'+bank.themeId))};}index-=block;lane+=span;}
}
export function groupPuzzle(ordinal:number){const spec=groupSpec(ordinal);if(!spec)return null;const result=puzzle(spec.words,GROUP_WORD_POOL+':'+ordinal);return result?{...spec,...result}:null;}
function remaining(used:readonly string[]){const excluded=new Set(used);return RIDDLE_BANKS.map(b=>({...b,items:b.items.filter(([word])=>!excluded.has(riddleId(b.themeId,word)))})).filter(b=>b.items.length>=GROUP_WORDS);}
export const hasGroupRiddles=(used:readonly string[])=>remaining(used).length>0;
export function groupRiddlePuzzle(ordinal:number,used:readonly string[]=[]){
 if(!Number.isSafeInteger(ordinal)||ordinal<0||ordinal>=GROUP_CLUE_POOL_SIZE)return null;
 const banks=remaining(used);if(!banks.length)return null;
 const bank=banks[ordinal%banks.length]!,available=bank.items.map(([word])=>word).sort(),count=combinations(available.length,GROUP_WORDS),rank=permute(Math.floor(ordinal/banks.length),count,GROUP_CLUE_POOL+':'+bank.themeId),words=subset(available,rank);
 const result=puzzle(words,GROUP_CLUE_POOL+':'+ordinal+':'+words.join('|'));if(!result)return null;
 return {themeId:bank.themeId,words,...result,clues:Object.fromEntries(bank.items.filter(([word])=>words.includes(word))),riddleIds:words.map(w=>riddleId(bank.themeId,w))};
}
