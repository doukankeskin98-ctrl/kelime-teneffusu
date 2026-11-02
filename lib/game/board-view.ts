import type {Cell,Puzzle,Stroke} from './engine.ts';

/** A half turn is its own inverse. Stored and server coordinates stay original. */
export function viewCell(cell:Cell,size:number,turned:boolean):Cell {
 return turned?[size-1-cell[0],size-1-cell[1]]:[cell[0],cell[1]];
}
export function boardView<T extends Pick<Puzzle,'size'|'grid'|'targets'>>(board:T,turned:boolean):T {
 return turned?{...board,grid:board.grid.map(row=>[...row].reverse()).reverse()}:board;
}
export function viewStrokes(strokes:Stroke[],size:number,turned:boolean):Stroke[] {
 return turned?strokes.map(s=>({...s,a:viewCell(s.a,size,true),b:viewCell(s.b,size,true)})):strokes;
}
