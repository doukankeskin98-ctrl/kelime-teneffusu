import type {Cell} from './engine';
/** A .47-cell ellipse covers 69.4% of a cell, independent of pixel aspect ratio. */
export const CELL_HIT_RADIUS=.47;
export type GestureStep={cell:Cell;axis:Cell|null};
export function advanceGesture(start:Cell,current:Cell,axis:Cell|null,point:Cell,size:number,release=false):GestureStep{
 const unchanged={cell:current,axis};
 if(!point.every(Number.isFinite)||!Number.isInteger(size)||size<1)return unchanged;
 const dy=point[0]-start[0]-.5,dx=point[1]-start[1]-.5;
 if(Math.hypot(dy,dx)<.5&&!axis)return unchanged;
 let direction=axis;
 if(!direction){const angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4;direction=[Math.round(Math.sin(angle))||0,Math.round(Math.cos(angle))||0];}
 const [dr,dc]=direction,step=Math.round((dy*dr+dx*dc)/(dr*dr+dc*dc));
 let low=-Infinity,high=Infinity;
 // Constant-time bounds, even if a captured pointer reports far outside the board.
 for(let i=0;i<2;i++){const d=direction[i]!,origin=start[i]!;if(d){const a=-origin/d,b=(size-1-origin)/d;low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));}}
 const length=Math.max(low,Math.min(high,step));
 const cell:Cell=[start[0]+dr*length,start[1]+dc*length];
 const distance=Math.hypot(point[0]-cell[0]-.5,point[1]-cell[1]-.5);
 // A slightly wider release boundary preserves fast final samples, never a new axis.
 if(distance>(release?.65:CELL_HIT_RADIUS))return unchanged;
 return {cell,axis:direction};
}
