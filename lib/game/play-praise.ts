import {exactLine,type Cell,type Stroke} from './engine.ts';

export const PRAISE_WINDOW_MS=8000,PRAISE_COOLDOWN_MS=4000,PRAISE_VISIBLE_MS=1240;
const key=(a:Cell,b:Cell)=>[a.join(','),b.join(',')].sort().join(':');
const words=['Çok iyi!','Harika!','Müthiş!'] as const;

/** Session-only decoration. A local gesture AND a confirmed word are required.
 * ACK/snapshot order does not matter; restored and optimistic words earn nothing. */
export function playPraiseLedger(initial:readonly Stroke[]=[]){
 const seen=new Set(initial.map(s=>s.id)),pending=new Map<string,number>(),assisted=new Set<string>();
 let previous:number|undefined,lastPraise=-Infinity,count=0,shown=0;
 const interrupt=()=>{pending.clear();previous=undefined;count=0;};
 return {
  interrupt,
  assist(cell:Cell){assisted.add(cell.join(','));interrupt();},
  attempt(a:Cell,b:Cell,at:number,valid:boolean){
   if(!valid){interrupt();return;}
   // Bound memory even if a server never confirms an attempt.
   for(const [id,time] of pending)if(at-time>PRAISE_WINDOW_MS)pending.delete(id);
   pending.set(key(a,b),at);
  },
  confirm(strokes:readonly Stroke[],at:number,size:number,visible=true,terminal=false):string|null{
   let praise:string|null=null;
   if(!visible||terminal)interrupt();
   for(const stroke of strokes){
    if(seen.has(stroke.id))continue;
    seen.add(stroke.id);
    const id=key(stroke.a,stroke.b),selectedAt=pending.get(id);pending.delete(id);
    const helped=exactLine(stroke.a,stroke.b,size)?.some(c=>assisted.has(c.join(',')));
    if(selectedAt===undefined||!visible||terminal||helped||at-selectedAt>PRAISE_WINDOW_MS){previous=undefined;count=0;continue;}
    count=previous!==undefined&&selectedAt>=previous&&selectedAt-previous<=PRAISE_WINDOW_MS?count+1:1;
    previous=selectedAt;
    if(count>=2&&selectedAt-lastPraise>=PRAISE_COOLDOWN_MS&&shown<words.length){
     praise=words[shown++]!;lastPraise=selectedAt;count=0;
    }
   }
   return praise;
  },
 };
}
