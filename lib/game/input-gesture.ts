import type {Cell,Puzzle,Stroke,Target} from './engine';
/** Extra center tolerance between cells; on-ray cell interiors are also valid. */
export const CELL_HIT_RADIUS=.47;
export type GestureStep={cell:Cell;axis:Cell|null};
function isInsideCell(point:Cell,cell:Cell){
 return point[0]>=cell[0]&&point[0]<cell[0]+1&&point[1]>=cell[1]&&point[1]<cell[1]+1;
}
// A captured finger can drift just over the frame while following its outer
// row or column. Only the perpendicular coordinate in this small outside band
// is projected back onto the ray. Interior neighbours and diagonals stay exact.
function edgeContact(start:Cell,direction:Cell,point:Cell,size:number):Cell{
 const fixed=direction[0]===0?0:direction[1]===0?1:null;
 if(fixed===null)return point;
 const value=point[fixed],index=start[fixed];
 const outsideFirst=index===0&&value>=-.45&&value<0;
 const outsideLast=index===size-1&&value>=size&&value<=size+.45;
 if(!outsideFirst&&!outsideLast)return point;
 return fixed===0?[index+.5,point[1]]:[point[0],index+.5];
}
/** Search the sampled ray, including endpoints skipped by a fast swipe.
 * Ambiguous prefixes wait for release so the longer target stays selectable.
 * Only caller-supplied unlocked targets are eligible; no placements are needed.
 */
export function earlyWordEnd(board:Pick<Puzzle,'grid'|'size'>,targets:Target[],strokes:Stroke[],start:Cell,end:Cell):Cell|null{
 const dy=end[0]-start[0],dx=end[1]-start[1],length=Math.max(Math.abs(dy),Math.abs(dx))+1;
 if(length<2||dy&&dx&&Math.abs(dy)!==Math.abs(dx))return null;
 const dr=Math.sign(dy),dc=Math.sign(dx),found=new Set(strokes.map(s=>s.id));
 const words=targets.filter(t=>!found.has(t.id)).flatMap(t=>[t.text,[...t.text].reverse().join('')]);
 let ray='';
 for(let r=start[0],c=start[1];r>=0&&c>=0&&r<board.size&&c<board.size;r+=dr,c+=dc)ray+=board.grid[r]![c];
 const candidates=words.filter(word=>ray.startsWith(word));
 const word=candidates.filter(word=>word.length>=2&&word.length<=length&&!candidates.some(long=>long.length>word.length&&long.startsWith(word))).sort((a,b)=>a.length-b.length)[0];
 return word?[start[0]+dr*(word.length-1),start[1]+dc*(word.length-1)]:null;
}
export function advanceGesture(start:Cell,current:Cell,axis:Cell|null,point:Cell,size:number,release=false):GestureStep{
 const unchanged={cell:current,axis};
 if(!point.every(Number.isFinite)||!Number.isInteger(size)||size<1)return unchanged;
 // Pointer capture may carry a fast swipe beyond the board. Limit that grace to
 // two cells: ordinary finger overshoot is accepted, remote/corrupt samples are not.
 if(point.some(value=>value< -2||value>size+2))return unchanged;
 const dy=point[0]-start[0]-.5,dx=point[1]-start[1]-.5;
 if(Math.hypot(dy,dx)<.5&&!axis)return unchanged;
 // The first letter is the anchor, not the first direction. Re-evaluate the ray
 // from the current contact so a player can pivot without lifting or backtracking.
 // Entering an on-ray cell selects it. Between rays the last selection is retained.
 const angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4;
 const direction:Cell=[Math.round(Math.sin(angle))||0,Math.round(Math.cos(angle))||0];
 const [dr,dc]=direction,projection=(dy*dr+dx*dc)/(dr*dr+dc*dc),step=Math.round(projection);
 let low=-Infinity,high=Infinity;
 // Constant-time bounds, even if a captured pointer reports far outside the board.
 for(let i=0;i<2;i++){const d=direction[i]!,origin=start[i]!;if(d){const a=-origin/d,b=(size-1-origin)/d;low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));}}
 const length=Math.max(low,Math.min(high,step));
 const cell:Cell=[start[0]+dr*length,start[1]+dc*length];
 const outside=point.some(value=>value<=0||value>=size);
 const excess=outside?projection-Math.max(low,Math.min(high,projection)):0;
 const contact=edgeContact(start,direction,point,size);
 const distance=Math.hypot(contact[0]-dr*excess-cell[0]-.5,contact[1]-dc*excess-cell[1]-.5);
 // A finger inside this on-ray letter must select it, including its corners.
 // The old circular gate rejected diagonal corners while the ink already covered
 // the final glyph. Do not clamp here: outside capture keeps its bounded drift test.
 // Center tolerance still absorbs small gaps and a last-sample direction change.
 if(!isInsideCell(contact,cell)&&distance>(release?.65:CELL_HIT_RADIUS))return unchanged;
 return {cell,axis:direction};
}

/** Continuous ink in board coordinates; never used to accept a letter or a word. */
export function gestureTip(start:Cell,current:Cell,axis:Cell|null,point:Cell,size:number):Cell{
 const origin:Cell=[start[0]+.5,start[1]+.5];
 if(!point.every(Number.isFinite)||size<1)return origin;
 const dy=point[0]-origin[0],dx=point[1]-origin[1];
 const angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4;
 const direction=axis??[Math.round(Math.sin(angle))||0,Math.round(Math.cos(angle))||0];
 const [dr,dc]=direction;
 const projection=(dy*dr+dx*dc)/(dr*dr+dc*dc);
 // Follow the finger freely within the selected letter. A sample in an adjacent
 // cell can project onto the next letter even though the word still ends here.
 const selectedLength=Math.max(Math.abs(current[0]-start[0]),Math.abs(current[1]-start[1]));
 const contact=edgeContact(start,direction,point,size);
 let limit=isInsideCell(contact,current)?Infinity:selectedLength;
 for(let i=0;i<2;i++){
  const delta=direction[i]!;
  if(delta>0)limit=Math.min(limit,size-1-start[i]!);
  else if(delta<0)limit=Math.min(limit,start[i]!);
 }
 const step=Math.max(0,Math.min(limit,projection));
 return [origin[0]+dr*step,origin[1]+dc*step];
}
