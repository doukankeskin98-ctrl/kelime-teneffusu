/** Pick contiguous rows once per puzzle. A concealed label keeps its slot when revealed. */
export function rackRows(labels:readonly string[]):number[][] {
 const n=labels.length;
 if(!n)return [];
 const rows=n<=6?2:3;
 const widths=labels.map(word=>Array.from(word).reduce((total,c)=>total+('IİJ'.includes(c)?0.48:'MW'.includes(c)?1.1:0.81),0));
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
 return best;
}

const cached=new WeakMap<readonly {label:string}[],number[][]>();
export function rowsForTargets(targets:readonly {label:string}[]){
 const previous=cached.get(targets);
 if(previous)return previous;
 const rows=rackRows(targets.map(t=>t.label));cached.set(targets,rows);return rows;
}
