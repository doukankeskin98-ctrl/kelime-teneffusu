/** Preserve legibility when a short screen or enlarged text cannot fit everything. */
export function fittedBoardSize(width:number,availableHeight:number,cells:number){
 const safeWidth=Math.max(0,Math.floor(width));
 const readableMinimum=Math.min(safeWidth,cells*22);
 return Math.max(readableMinimum,Math.min(safeWidth,520,Math.floor(availableHeight)));
}
