/** Preserve legibility when a short screen or enlarged text cannot fit everything. */
export function fittedBoardSize(width:number,availableHeight:number,cells:number){
 const safeWidth=Math.max(0,Math.floor(width));
 const readableMinimum=Math.min(safeWidth,cells*22);
 return Math.max(readableMinimum,Math.min(safeWidth,520,Math.floor(availableHeight)));
}

/** Height reserved by HUD, targets and controls is measured, not a device guess. */
export function fitGameFrame(width:number,height:number,overhead:number,cells:number,targetsMinimum=0){
 const floor=Math.min(Math.max(0,Math.floor(width)),cells*22);
 return {minHeight:Math.ceil(Math.max(overhead+floor,targetsMinimum)),boardSize:fittedBoardSize(width,Math.max(0,height-overhead),cells)};
}
