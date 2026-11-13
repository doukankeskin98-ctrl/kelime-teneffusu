import {exactLine,snapLine,type Cell,type Puzzle,type Stroke} from './engine.ts';
import {boardIssues,PRESENTATION_RULES,wordSegments} from './board-quality.ts';

export type BoardShape=number|{rows:number;columns:number};
export const dimensions=(shape:BoardShape)=>typeof shape==='number'?{rows:shape,columns:shape}:shape;
export const gridShape=(grid:string[][])=>({rows:grid.length,columns:grid[0]?.length??0});
export function surfaceLine(a:Cell,b:Cell,shape:BoardShape){
 const {rows,columns}=dimensions(shape);
 return snapLine(a,b,Math.max(rows,columns)).filter(([r,c])=>r<rows&&c<columns);
}
type Surface=Pick<Puzzle,'grid'|'size'|'targets'>;

/** Remove only lines unused by EVERY accepted answer. Canonical puzzle, saves and
 * network coordinates never change. The choice depends on content, not viewport. */
export function projectBoard(source:Surface){
 const all=Array.from({length:source.size},(_,i)=>i);
 const identity={board:source,shape:gridShape(source.grid),toView:(p:Cell):Cell=>[...p],fromView:(p:Cell):Cell=>[...p],compacted:false};
 if(!source.targets.length)return identity;
 const paths=source.targets.flatMap(t=>wordSegments(source.grid,t.text).map(path=>({...t,...path})));
 if(source.targets.some(t=>!paths.some(p=>p.id===t.id)))return identity;
 const usedRows=new Set<number>(),usedCols=new Set<number>();
 for(const p of paths)for(const [r,c] of exactLine(p.a,p.b,source.size)??[]){usedRows.add(r);usedCols.add(c);}
 const rows=all.filter(r=>usedRows.has(r)),cols=all.filter(c=>usedCols.has(c));
 // Keep enough search space and avoid a thin, very tall strip.
 if(Math.min(rows.length,cols.length)<6||Math.max(rows.length,cols.length)/Math.min(rows.length,cols.length)>1.4||rows.length*cols.length===source.size**2)return identity;
 const transpose=rows.length<cols.length;
 const toView=(p:Cell):Cell=>transpose?[cols.indexOf(p[1]),rows.indexOf(p[0])]:[rows.indexOf(p[0]),cols.indexOf(p[1])];
 const fromView=(p:Cell):Cell=>transpose?[rows[p[1]]!,cols[p[0]]!]:[rows[p[0]]!,cols[p[1]]!];
 const grid=transpose?cols.map(c=>rows.map(r=>source.grid[r]![c]!)):rows.map(r=>cols.map(c=>source.grid[r]![c]!));
 const board:Puzzle={...source,version:2,size:Math.max(rows.length,cols.length),grid,placements:paths.map(p=>({...p,a:toView(p.a),b:toView(p.b)}))};
 // Removing filler can create new neighbours: reject new answers or unsafe text.
 if(board.placements.some(p=>exactLine(p.a,p.b,board.size)?.map(([r,c])=>grid[r]?.[c]??'').join('')!==p.text)||boardIssues(board,PRESENTATION_RULES).length)return identity;
 return {board,shape:gridShape(grid),toView,fromView,compacted:true};
}
export function projectStrokes(strokes:Stroke[],map:(p:Cell)=>Cell):Stroke[]{return strokes.map(s=>({...s,a:map(s.a),b:map(s.b)}));}
