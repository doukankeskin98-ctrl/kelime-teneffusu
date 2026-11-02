import type {Target,Stroke} from './engine.ts';
export type WordVeil='open'|'initial'|'hidden';
export function veiledText(text:string,veil:WordVeil='open'){
 if(veil==='open')return text;
 let first=true;return [...text].map(char=>{if(/\s/.test(char))return char;const visible=first&&veil==='initial';first=false;return visible?char:'·';}).join('');
}
/** Only short, single-part normal targets fit the two/three-row phone rack. */
export function compactWordRack(board:{targets:Target[]},clues?:Record<string,string>){
 return !clues&&board.targets.length>1&&board.targets.length<=9&&new Set(board.targets.map(t=>t.group)).size===board.targets.length&&board.targets.every(t=>t.label.length<=9&&!/\s/.test(t.label));
}
/** Clue mode must not leak the answer through its accessible label. */
export function wordCardCopy(target:Pick<Target,'text'|'label'>,done:boolean,clues?:Record<string,string>,veil:WordVeil='open'){
 const clue=clues?.[target.text];
 if(!clue&&!done&&veil!=='open'){
  const length=[...target.label.replace(/\s/g,'')].length;
  return {text:veiledText(target.label,veil),detail:`${length} harf`,isClue:false,spoken:veil==='initial'?`İlk harf ${[...target.label][0]}, ${length} harf`:`Saklı kelime, ${length} harf`,masked:true};
 }
 return {text:clue&&!done?clue:target.label,detail:clue&&!done?`${target.text.length} harf`:undefined,isClue:!!clue&&!done};
}

/** Count visible list groups; split names complete only when every part is confirmed. */
export function wordListProgress(board:{targets:Target[]},strokes:Stroke[]){
 const found=new Set(strokes.map(s=>s.id)),groups=new Map<number,boolean>();
 for(const target of board.targets)groups.set(target.group,(groups.get(target.group)??true)&&found.has(target.id));
 const total=groups.size,complete=[...groups.values()].filter(Boolean).length;
 return {total,complete,remaining:total-complete};
}

/** A focus target is presentation only. Split words remain selected until all parts are found. */
export function focusedWordGroup(board:{targets:Target[]},strokes:Stroke[],preferred:number|null){
 const found=new Set(strokes.map(s=>s.id));
 const remaining=[...new Set(board.targets.filter(t=>!found.has(t.id)).map(t=>t.group))];
 return preferred!==null&&remaining.includes(preferred)?preferred:remaining[0]??null;
}
