import {snapLine,type Puzzle,type Stroke,type Target} from './engine.ts';
import {viewCell} from './board-view.ts';

export type FlightRect={left:number;top:number;width:number;height:number};
export const WORD_FLIGHT_MS=720,WORD_LANDING_MS=180,WORD_RESULT_DELAY_MS=1040;
export const wordLetterDelay=(index:number)=>Math.min(index*12,84);
type FlightMetrics={fontSize:number;targetFontSize:number;sources:FlightRect[];destinations:FlightRect[]};
/** Pure presentation geometry: all source letters stay tied to their real cells. */
export function wordFlightPlan(board:Pick<Puzzle,'size'|'grid'>,stroke:Stroke,target:Target,turned:boolean,rect:FlightRect,root:Pick<FlightRect,'left'|'top'>,dest:FlightRect,metrics?:FlightMetrics){
 let cells=snapLine(stroke.a,stroke.b,board.size);
 const text=cells.map(([r,c])=>board.grid[r]?.[c]??'').join('');
 if(text!==target.text){if([...text].reverse().join('')!==target.text)return null;cells=[...cells].reverse();}
 if(cells.length<2||cells.length>16)return null;
 const fontSize=metrics?.fontSize??Math.min(32,Math.max(16,rect.width/board.size*.56));
 const spread=Math.min(fontSize*.48,Math.max(3,(dest.width-12)/cells.length));
 return {fontSize,scale:metrics?metrics.targetFontSize/fontSize:.65,letters:cells.map((cell,i)=>{
  const [r,c]=viewCell(cell,board.size,turned);
  const source=metrics?.sources[i],destination=metrics?.destinations[i];
  return {text:board.grid[cell[0]]![cell[1]]!,viewIndex:r*board.size+c,x:source?source.left-root.left+source.width/2:rect.left-root.left+(c+.5)*rect.width/board.size,y:source?source.top-root.top+source.height/2:rect.top-root.top+(r+.5)*rect.height/board.size,
   tx:destination?destination.left-root.left+destination.width/2:dest.left-root.left+dest.width/2+(i-(cells.length-1)/2)*spread,ty:destination?destination.top-root.top+destination.height/2:dest.top-root.top+dest.height/2};
 })};
}

/** Separate lift, travel and landing; linear timeline keeps the lift from being rushed. */
export function wordFlightFrames(letter:{x:number;y:number;tx:number;ty:number},scale:number){
 const {x,y,tx,ty}=letter,pose=(px:number,py:number,s:number)=>`translate(${px}px,${py}px) translate(-50%,-50%) scale(${s})`;
 return [
  {transform:pose(x,y,1),opacity:1,offset:0,easing:'cubic-bezier(.2,.7,.3,1)'},
  {transform:pose(x,y-14,1.12),opacity:1,offset:.23,easing:'cubic-bezier(.42,0,.24,1)'},
  {transform:pose(tx,ty,scale*1.08),opacity:1,offset:.88,easing:'ease-out'},
  {transform:pose(tx,ty,scale),opacity:1,offset:.96},
  {transform:pose(tx,ty,scale),opacity:0,offset:1},
 ];
}

/** Presentation-only acknowledgement. Never grants a word, points or rewards. */
export function wordFeedbackLedger(scope:string,ids:readonly string[]){
 let current=scope,seen=new Set(ids);
 return {
  consume(nextScope:string,confirmed:readonly string[],visible=true):string[]{
   if(current!==nextScope){current=nextScope;seen=new Set(confirmed);return [];}
   const fresh=confirmed.filter(id=>!seen.has(id));
   // Consume before animation; cancelled/reduced/hidden effects must not replay.
   for(const id of confirmed)seen.add(id);
   return visible?[...new Set(fresh)]:[];
  },
 };
}
