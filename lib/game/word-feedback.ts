import {snapLine,type Puzzle,type Stroke,type Target} from './engine.ts';
import {viewCell} from './board-view.ts';

type FlightRect={left:number;top:number;width:number;height:number};
/** Pure presentation geometry: all source letters stay tied to their real cells. */
export function wordFlightPlan(board:Pick<Puzzle,'size'|'grid'>,stroke:Stroke,target:Target,turned:boolean,rect:FlightRect,root:Pick<FlightRect,'left'|'top'>,dest:FlightRect){
 let cells=snapLine(stroke.a,stroke.b,board.size);
 const text=cells.map(([r,c])=>board.grid[r]?.[c]??'').join('');
 if(text!==target.text){if([...text].reverse().join('')!==target.text)return null;cells=[...cells].reverse();}
 if(cells.length<2||cells.length>16)return null;
 const fontSize=Math.min(32,Math.max(16,rect.width/board.size*.56));
 const spread=Math.min(fontSize*.48,Math.max(3,(dest.width-12)/cells.length));
 return {fontSize,letters:cells.map((cell,i)=>{
  const [r,c]=viewCell(cell,board.size,turned);
  return {text:board.grid[cell[0]]![cell[1]]!,x:rect.left-root.left+(c+.5)*rect.width/board.size,y:rect.top-root.top+(r+.5)*rect.height/board.size,
   tx:dest.left-root.left+dest.width/2+(i-(cells.length-1)/2)*spread,ty:dest.top-root.top+dest.height/2};
 })};
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
