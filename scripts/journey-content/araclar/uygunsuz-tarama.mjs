/** Son ızgarayı 8 yönde LDNOOBW Türkçe listesiyle (3+ harf) tarar. Tamamen tek bir hedefin yolu içinde kalan eşleşme serbesttir
 * (kelimenin kendisi kelime denetiminden geçti); hedefler arasına ya da dolguya taşan her eşleşme hatadır. */
import {readFileSync} from 'node:fs';
const up=w=>w.toLocaleUpperCase('tr-TR');
export const ENGEL=readFileSync(new URL('../kaynaklar/ldnoobw-tr.txt',import.meta.url),'utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')&&[...s].length>=3).map(up);
const D=[[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
export function uygunsuzDiziler(grid,placements){
 const g=grid.map(r=>[...r]);const R=g.length,C=g[0].length;
 const paths=placements.map(([t,r1,c1,r2,c2])=>{const dr=Math.sign(r2-r1),dc=Math.sign(c2-c1),n=[...t].length;return new Set(Array.from({length:n},(_,k)=>(r1+dr*k)+','+(c1+dc*k)));});
 const out=[];
 for(const b of ENGEL){const w=[...b];for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(const [dr,dc] of D){
  if(!w.every((x,i)=>g[r+dr*i]?.[c+dc*i]===x))continue;
  const cells=w.map((_,i)=>(r+dr*i)+','+(c+dc*i));
  if(paths.some(p=>cells.every(x=>p.has(x))))continue;
  out.push({dizi:b,a:[r,c],yon:[dr,dc]});}}
 return out;
}
