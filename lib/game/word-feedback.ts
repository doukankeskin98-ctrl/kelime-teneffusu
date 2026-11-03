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
