/** Manrope 800 advances measured from the bundled font. The .64em floor reserves
 * the same width for a mask and its future letter; revealing a word never reflows. */
const advances:Readonly<Record<string,number>>={A:.683,B:.637,C:.746,Ç:.746,D:.71,E:.59,F:.53,G:.741,Ğ:.741,H:.734,I:.296,İ:.296,J:.513,K:.665,L:.541,M:.86,N:.729,O:.758,Ö:.758,P:.65,R:.67,S:.671,Ş:.671,T:.61,U:.726,Ü:.726,V:.653,Y:.63,Z:.68};
export const targetAdvance=(c:string,concealed=false)=>/\s/.test(c) ? .35 : Math.max(concealed ? .64 : 0,advances[c]??.86);
/** Pick contiguous rows once per puzzle. A concealed label keeps its slot when revealed. */
export function rackRows(labels:readonly string[],concealed:readonly boolean[]=[]):number[][] {
 const n=labels.length;
 if(!n)return [];
 const rows=Math.min(n,n<=6?2:3);
 const widths=labels.map((word,i)=>Array.from(word).reduce((total,c,j)=>total+targetAdvance(c,concealed[i]&&j>0),0));
 let best:number[][]=[],cost=Infinity;
 function visit(start:number,parts:number[][],widthsSoFar:number[]){
  if(parts.length===rows){
   if(start!==n)return;
   const max=Math.max(...widthsSoFar),score=max*100+Math.max(...widthsSoFar)-Math.min(...widthsSoFar);
   if(score<cost){cost=score;best=parts;}
   return;
  }
  for(let take=1;take<=4&&start+take<=n;take++){
   const rest=n-start-take,remainingRows=rows-parts.length-1;
   if(rest<remainingRows||rest>remainingRows*4)continue;
   const indices=Array.from({length:take},(_,i)=>start+i);
   const width=indices.reduce((sum,i)=>sum+widths[i]!,0)+take-1;
   visit(start+take,[...parts,indices],[...widthsSoFar,width]);
  }
 }
 visit(0,[],[]);
 // Preserve the familiar contiguous order when it fits. Dense later chapters
 // use stable balanced rows instead of shrinking text or moving the board.
 const maxWidth=(parts:number[][])=>Math.max(...parts.map(row=>row.reduce((sum,i)=>sum+widths[i]!,0)+row.length-1));
 if(maxWidth(best)>20.2){
  let minimum=maxWidth(best);const full=(1<<n)-1;
  function pack(mask:number,parts:number[][]){
   if(parts.length===rows){if(mask===full){const max=maxWidth(parts);if(max<minimum){minimum=max;best=parts;}}return;}
   const remaining=Array.from({length:n},(_,i)=>i).filter(i=>!(mask&(1<<i))),first=remaining[0];if(first===undefined)return;
   function choose(row:number[],start:number){
    const left=remaining.length-row.length,slots=rows-parts.length-1,width=row.reduce((sum,i)=>sum+widths[i]!,0)+row.length-1;
    if(width>=minimum)return;
    if(left>=slots&&left<=slots*4)pack(mask|row.reduce((m,i)=>m|(1<<i),0),[...parts,row]);
    if(row.length===4)return;
    for(let j=start;j<remaining.length;j++)choose([...row,remaining[j]!],j+1);
   }
   choose([first],1);
  }
  pack(0,[]);
 }
 return best;
}

const cached=new WeakMap<readonly {label:string}[],Map<string,number[][]>>();
export function rowsForTargets(targets:readonly {label:string;group:number}[],veils?:Record<number,string>){
 const concealed=targets.map(t=>!!veils?.[t.group]&&veils[t.group]!=='open'),key=concealed.map(Boolean).join(',');
 let entries=cached.get(targets);if(!entries){entries=new Map();cached.set(targets,entries);}
 const previous=entries.get(key);if(previous)return previous;
 const rows=rackRows(targets.map(t=>t.label),concealed);entries.set(key,rows);return rows;
}
