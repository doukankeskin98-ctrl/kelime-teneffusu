import { findTheme, normalize, splitWord } from './catalog.ts';
export type Cell = [number, number];
export interface Target { id: string; label: string; text: string; group: number }
export interface Placement extends Target { a: Cell; b: Cell }
export interface Puzzle { version: 2; size: number; grid: string[][]; targets: Target[]; placements: Placement[] }
export interface Stroke { id: string; a: Cell; b: Cell }
export const DIRECTIONS: Cell[] = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
const ALPHABET = [...'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'];
export function hash(s: string): number { let h=2166136261; for(const c of s) h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0; }
export function random(seed: number) { let s=seed>>>0; return ()=>{ s=(s+0x6d2b79f5)>>>0;let t=Math.imul(s^(s>>>15),s|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296; }; }
export function levelTargets(themeId: string, level: number): Target[] {
  const bank=findTheme(themeId).words;
  const count=5+Math.min(5,Math.max(0,level));
  const labels:string[]=[],used=new Set<string>();
  for(let i=0;i<bank.length&&labels.length<count;i++){
    const label=bank[(level*5+i)%bank.length]!,parts=splitWord(label);
    if(parts.some(text=>used.has(text)||used.has([...text].reverse().join(''))))continue;
    labels.push(label);for(const text of parts)used.add(text);
  }
  if(labels.length!==count)throw new Error('Kelime havuzunda yeterli farklı hedef yok');
  return labels.flatMap((label,group)=>splitWord(label).map((text,p)=>({id:`${group}.${p}`,label,text,group})));
}
export function makePuzzle(themeId: string, level: number, seed: number): Puzzle {
  const targets=levelTargets(themeId,level);
  const minSize=Math.max(9+Math.floor(level/2),...targets.map(t=>t.text.length));
  if(minSize>13 || targets.some(t=>t.text.length<2)) throw new Error('Geçersiz kelime bankası');
  const order=[...targets].sort((a,b)=>b.text.length-a.text.length);
  const forced=[...targets].sort((a,b)=>a.text.length-b.text.length).slice(0,2);
  for(let size=minSize;size<=13;size++)
  for(let attempt=0;attempt<200;attempt++) {
    const rand=random(seed+hash(themeId)+level*7919+attempt*104729);
    const grid:string[][]=Array.from({length:size},()=>Array<string>(size).fill(''));
    const placements:Placement[]=[];
    for(let idx=0;idx<order.length;idx++) {
      const target=order[idx]!; const len=target.text.length;
      // Shorter diagonal targets avoid impossible crossings of full-width words.
      const dirs=target.id===forced[0]!.id?[[1,1],[-1,-1]]:target.id===forced[1]!.id?[[1,-1],[-1,1]]:DIRECTIONS;
      const choices: {a:Cell;b:Cell;dr:number;dc:number}[]=[];
      for(const dir of dirs){const dr=dir[0]!,dc=dir[1]!;
        for(let r=0;r<size;r++)for(let c=0;c<size;c++){
          const er=r+dr*(len-1),ec=c+dc*(len-1);
          if(er<0||er>=size||ec<0||ec>=size)continue;
          if([...target.text].every((ch,i)=>!grid[r+dr*i]![c+dc*i]||grid[r+dr*i]![c+dc*i]===ch)) choices.push({a:[r,c],b:[er,ec],dr,dc});
        }
      }
      if(!choices.length)break;
      const pick=choices[Math.floor(rand()*choices.length)]!;
      [...target.text].forEach((ch,i)=>{grid[pick.a[0]+pick.dr*i]![pick.a[1]+pick.dc*i]=ch;});
      placements.push({...target,a:pick.a,b:pick.b});
    }
    if(placements.length!==targets.length)continue;
    for(const row of grid)for(let c=0;c<size;c++)if(!row[c])row[c]=ALPHABET[Math.floor(rand()*ALPHABET.length)]!;
    return {version:2,size,grid,targets,placements};
  }
  throw new Error('Tahta hazırlanamadı. Yeniden deneyin.');
}
export function isCell(v: unknown,size: number): v is Cell {return Array.isArray(v)&&v.length===2&&v.every(x=>Number.isInteger(x)&&x>=0&&x<size);}
export function exactLine(a: unknown,b: unknown,size: number): Cell[] | null {
  if(!isCell(a,size)||!isCell(b,size))return null;
  const dy=b[0]-a[0],dx=b[1]-a[1];
  if((dy===0&&dx===0)||(dx!==0&&dy!==0&&Math.abs(dx)!==Math.abs(dy)))return null;
  return Array.from({length:Math.max(Math.abs(dy),Math.abs(dx))+1},(_,i)=>[a[0]+Math.sign(dy)*i,a[1]+Math.sign(dx)*i]);
}
export function snapLine(a:Cell,b:Cell,size:number):Cell[] {
  const y=b[0]-a[0],x=b[1]-a[1],theta=Math.round(Math.atan2(y,x)/(Math.PI/4))*Math.PI/4;
  const dy=Math.round(Math.sin(theta)),dx=Math.round(Math.cos(theta));
  const cells:Cell[]=[];
  for(let i=0;i<=Math.max(Math.abs(y),Math.abs(x));i++){const r=a[0]+dy*i,c=a[1]+dx*i;if(r<0||c<0||r>=size||c>=size)break;cells.push([r,c]);}
  return cells;
}
export function match(puzzle: Pick<Puzzle,'grid'|'size'|'targets'>, a:unknown,b:unknown):Target|null {
  const cells=exactLine(a,b,puzzle.size);if(!cells)return null;
  const text=cells.map(([r,c])=>puzzle.grid[r]![c]).join('');
  const reversed=[...text].reverse().join('');
  return puzzle.targets.find(t=>t.text===text||t.text===reversed)??null;
}
export function istanbulDay(now=Date.now()):string {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
  const get=(type:string)=>parts.find(p=>p.type===type)?.value??'';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function dailySpec(day:string){const n=hash(day);return {themeId:['turkiye','uzay','yesilcam','lezzetler','bilim','hayvanlar','muzik'][n%7]!,level:3,seed:n};}
export function goldenId(targets:Target[],starts:number,now:number):string|null {
  const elapsed=now-starts;if(elapsed<0||elapsed>=120000||Math.floor(elapsed/20000)%2!==0)return null;
  return targets[(Math.floor(elapsed/40000)*3)%targets.length]?.id??null;
}
export const pointsFor=(target:Target,golden:boolean)=>(100+normalize(target.text).length*10)*(golden?2:1);
export const timeLabel=(seconds:number)=>`${Math.floor(Math.max(0,seconds)/60)}:${String(Math.floor(Math.max(0,seconds))%60).padStart(2,'0')}`;
