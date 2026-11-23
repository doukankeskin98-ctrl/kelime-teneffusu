// Private per-device fallback for an offline session. The same sparse note can travel
// alongside a progress envelope; the saved board and spent hints remain authoritative.
type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export const definitionNotesKey=(owner?:string)=>'kt-definition-notes-v1:'+encodeURIComponent(owner||'');
export interface DefinitionNote {updated?:number;selected:number|null;reveals:Record<number,number>;hints:number}
function notes(storage:Store,key:string):Record<string,DefinitionNote>{
 const value:unknown=JSON.parse(storage.getItem(key)??'{}');
 return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,DefinitionNote>:{};
}
export function readDefinitionNote(storage:Store,owner:string|undefined,board:string,hints:number):DefinitionNote|undefined{
 try{
  const note=notes(storage,definitionNotesKey(owner))[board];
  if(!note||!Number.isInteger(note.hints)||note.hints<0||note.hints>hints)return;
  const entries=Object.entries(note.reveals??{});
  if(entries.some(([k,n])=>!/^\d+$/.test(k)||!Number.isInteger(n)||n<1||n>3)||entries.reduce((sum,[,n])=>sum+n,0)>note.hints)return;
  return {...(Number.isSafeInteger(note.updated)?{updated:note.updated}:{}),selected:Number.isInteger(note.selected)?note.selected:null,reveals:Object.fromEntries(entries),hints:note.hints};
 }catch{return;}
}
export function writeDefinitionNote(storage:Store,owner:string|undefined,board:string,note:DefinitionNote|null){
 try{const key=definitionNotesKey(owner),current=notes(storage,key);if(note)current[board]=note;else delete current[board];
  if(Object.keys(current).length)storage.setItem(key,JSON.stringify(current));else storage.removeItem(key);
 }catch{/* Drawing must continue when optional device storage is full. */}
}

export function newerDefinitionNote(a:DefinitionNote|undefined,b:DefinitionNote|undefined){
 if(!a||!b)return a??b;
 // Two offline branches may have spent the same last hint on different letters.
 // Keep a coherent set of reveals without granting extra hints on merge.
 if(a.hints!==b.hints)return a.hints>b.hints?a:b;
 if((a.updated??0)!==(b.updated??0))return (a.updated??0)>(b.updated??0)?a:b;
 return JSON.stringify(a)>JSON.stringify(b)?a:b;
}
