import {HORIZON_BONUS_WORDS} from './horizons-content.ts';
import {DIRECTIONS,exactLine,hash,random,type Cell,type Puzzle,type Placement} from './engine.ts';

export const BONUS_DURATION=60_000;
/** Authored one-word interludes. Separate from every published chapter and board. */
export const BONUS_WORDS:Record<string,string>={...HORIZON_BONUS_WORDS,uzay:'UZAY',turkiye:'KÖPRÜ',hababam:'KALEM',hayvanlar:'PANDA',lezzetler:'EKMEK',muzik:'NOTA',dunya:'ROTA',bilim:'DENEY',teknoloji:'EKRAN',doksanlar:'BİLYE',futbol:'KALE',basketbol:'POTA',sinema:'SAHNE',yesilcam:'SAHNE',diziler:'KALEM',mitoloji:'MASAL','kiyi-liman':'VAPUR','kiyi-carsi':'PAZAR','kiyi-patika':'PATİKA','kiyi-fener':'FENER','doga-bahce':'BAHÇE','doga-dere':'DERE','doga-kamp':'ÇADIR','doga-gozlem':'YILDIZ','renkler-bahce':'ELMA','renkler-mutfak':'TABAK','renkler-atolye':'İPLİK','renkler-muzik':'NOTA','kesif-zanaat':'SERAMİK','kesif-kitap':'KİTAP','kesif-yolculuk':'YOLCU','kesif-zaman':'ZAMAN'};
const cache=new Map<string,Puzzle>();
const endpointKey=(a:Cell,b:Cell)=>[a.join(','),b.join(',')].sort().join(':');
export function scanBonus(grid:string[][],word:string):Placement[]{
 const size=grid.length,found=new Map<string,Placement>();
 for(let r=0;r<size;r++)for(let c=0;c<size;c++)for(const [dr,dc] of DIRECTIONS){
  const a:Cell=[r,c],b:Cell=[r+dr*(word.length-1),c+dc*(word.length-1)];
  const cells=exactLine(a,b,size);if(!cells||cells.map(([y,x])=>grid[y]![x]).join('')!==word)continue;
  const id=endpointKey(a,b);found.set(id,{id,label:word,text:word,group:0,a,b});
 }
 return [...found.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
export function bonusBoard(worldId:string):Puzzle{
 const cached=cache.get(worldId);if(cached)return cached;
 const word=Object.prototype.hasOwnProperty.call(BONUS_WORDS,worldId)?BONUS_WORDS[worldId]:undefined;if(!word)throw new Error('Bilinmeyen bonus rotası');
 const size=8,rand=random(hash('word-break-v1:'+worldId)),alphabet=[...'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'];
 for(let attempt=0;attempt<100;attempt++){
  const grid=Array.from({length:size},()=>Array<string>(size).fill('')),used=new Set<string>();
  for(let count=0;count<10;count++){
   const choices:{a:Cell;b:Cell;dr:number;dc:number}[]=[];
   for(const [dr,dc] of DIRECTIONS)for(let r=0;r<size;r++)for(let c=0;c<size;c++){
    const a:Cell=[r,c],b:Cell=[r+dr*(word.length-1),c+dc*(word.length-1)],cells=exactLine(a,b,size);
    if(!cells||used.has(endpointKey(a,b))||!cells.some(([y,x])=>!grid[y]![x])||!cells.every(([y,x],i)=>!grid[y]![x]||grid[y]![x]===word[i]))continue;
    choices.push({a,b,dr,dc});
   }
   if(!choices.length)break;
   const p=choices[Math.floor(rand()*choices.length)]!;used.add(endpointKey(p.a,p.b));
   [...word].forEach((ch,i)=>grid[p.a[0]+p.dr*i]![p.a[1]+p.dc*i]=ch);
  }
  for(const row of grid)for(let c=0;c<size;c++)if(!row[c])row[c]=alphabet[Math.floor(rand()*alphabet.length)]!;
  const placements=scanBonus(grid,word);
  if(placements.length<8||placements.length>24)continue;
  const board:Puzzle={version:2,size,grid,targets:placements.map(({a,b,...target})=>target),placements};cache.set(worldId,board);return board;
 }
 throw new Error('Bonus tahtası hazırlanamadı');
}
export interface BonusSave {attempt:number;found:string[];elapsed:number;finished:boolean;best:number}
export const freshBonus=(attempt=1,best=0):BonusSave=>({attempt,found:[],elapsed:0,finished:false,best});
export function cleanBonusSave(worldId:string,raw:unknown):BonusSave|null{
 if(!Object.prototype.hasOwnProperty.call(BONUS_WORDS,worldId)||!raw||typeof raw!=='object')return null;
 const r=raw as Partial<BonusSave>,board=bonusBoard(worldId),valid=new Set(board.targets.map(t=>t.id));
 const found=Array.isArray(r.found)?[...new Set(r.found.filter((id):id is string=>typeof id==='string'&&valid.has(id)))].sort():[];
 const elapsed=typeof r.elapsed==='number'&&Number.isFinite(r.elapsed)?Math.max(0,Math.min(BONUS_DURATION,Math.floor(r.elapsed))):0;
 const finished=elapsed===BONUS_DURATION||found.length===board.targets.length;
 const best=Math.max(finished?found.length:0,Number.isInteger(r.best)?Math.max(0,Math.min(board.targets.length,r.best!)):0);
 return {attempt:Number.isSafeInteger(r.attempt)&&r.attempt!>0?Math.min(1_000_000,r.attempt!):1,found,elapsed,finished,best};
}
/** Whole attempts win; concurrent runs never pool discoveries into a fake timed result. */
export function mergeBonusSave(a:BonusSave,b:BonusSave):BonusSave{
 const compare=(x:BonusSave,y:BonusSave)=>x.attempt-y.attempt||Number(x.finished)-Number(y.finished)||x.elapsed-y.elapsed||x.found.length-y.found.length||x.found.join('|').localeCompare(y.found.join('|'));
 return {...(compare(a,b)>=0?a:b),best:Math.max(a.best,b.best)};
}
export function advanceBonus(save:BonusSave,delta:number):BonusSave{
 if(save.finished)return save;
 const elapsed=Math.min(BONUS_DURATION,save.elapsed+Math.max(0,Number.isFinite(delta)?delta:0)),finished=elapsed>=BONUS_DURATION;
 return {...save,elapsed,finished,best:finished?Math.max(save.best,save.found.length):save.best};
}
export function selectBonus(board:Puzzle,save:BonusSave,a:Cell,b:Cell):{save:BonusSave;accepted:boolean}{
 if(save.finished||save.elapsed>=BONUS_DURATION||!exactLine(a,b,board.size))return {save,accepted:false};
 const id=endpointKey(a,b),target=board.placements.find(t=>t.id===id);
 if(!target||save.found.includes(id))return {save,accepted:false};
 const found=[...save.found,id].sort(),finished=found.length===board.targets.length;
 return {save:{...save,found,finished,best:finished?Math.max(save.best,found.length):save.best},accepted:true};
}
