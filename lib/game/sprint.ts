import {makeCustomPuzzle,match,type Cell,type Puzzle,type Stroke} from './engine.ts';
export const SPRINT_DURATION=60000,CHAIN_WINDOW=7000;
const WORDS=['BULUT','GÜNEŞ','YILDIZ','ROKET','UZAY','AY','ORMAN','YAPRAK','ÇİÇEK','DAL','KUŞ','DENİZ','KUM','DALGA','YELKEN','ADA','NOTA','RİTİM','GİTAR','PLAK','KİTAP','KALEM','RENK','MASAL'];
export function sprintBoard(seed:number,round:number):Puzzle{
 let n=(seed+round*104729)>>>0;const pool=[...WORDS];
 for(let i=pool.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[pool[i],pool[j]]=[pool[j]!,pool[i]!];}
 return makeCustomPuzzle(pool.slice(0,4),seed+round*8191,6);
}
export interface SprintState{phase:'ready'|'countdown'|'active'|'finished';seed:number;board:Puzzle;round:number;strokes:Stroke[];score:number;words:number;chain:number;bestChain:number;lastAt:number;starts:number;ends:number;nextAt:number;award:number;label:string;now:number}
export const freshSprint=(seed:number):SprintState=>({phase:'ready',seed,board:sprintBoard(seed,0),round:0,strokes:[],score:0,words:0,chain:0,bestChain:0,lastAt:0,starts:0,ends:0,nextAt:0,award:0,label:'',now:0});
export type SprintAction={type:'start';now:number}|{type:'tick';now:number}|{type:'select';now:number;a:Cell;b:Cell};
export function sprintReducer(s:SprintState,a:SprintAction):SprintState{
 if(a.type==='start')return s.phase==='ready'?{...s,phase:'countdown',starts:a.now+3000,ends:a.now+3000+SPRINT_DURATION,now:a.now}:s;
 if(s.phase==='ready'||s.phase==='finished')return s;
 if(a.now>=s.ends)return {...s,now:a.now,phase:'finished'};
 if(a.type==='tick'){
  if(s.phase==='countdown'&&a.now>=s.starts)return {...s,phase:'active',now:a.now};
  if(s.nextAt&&a.now>=s.nextAt)return {...s,board:sprintBoard(s.seed,s.round),strokes:[],nextAt:0,now:a.now};
  return {...s,now:a.now};
 }
 if(s.phase!=='active'||a.now<s.starts||s.nextAt)return s;
 const target=match(s.board,a.a,a.b);
 if(!target)return {...s,chain:0,label:'Başka bir yönden dene',award:0,now:a.now};
 if(s.strokes.some(p=>p.id===target.id))return s;
 const chain=s.chain&&a.now-s.lastAt<=CHAIN_WINDOW?s.chain+1:1,multiplier=Math.min(3,1+Math.floor((chain-1)/3));
 const complete=s.strokes.length+1===s.board.targets.length,award=target.text.length*10*multiplier+(complete?100:0);
 return {...s,strokes:[...s.strokes,{id:target.id,a:a.a,b:a.b}],words:s.words+1,score:s.score+award,chain,bestChain:Math.max(chain,s.bestChain),lastAt:a.now,award,label:complete?'Tahta tamam! +100':target.label,round:s.round+(complete?1:0),nextAt:complete?a.now+650:0,now:a.now};
}
export function parseSprintBest(value:string|null){try{const n=JSON.parse(value??'0');return typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<1000000?n:0;}catch{return 0;}}
