import type {Target,Stroke} from './engine.ts';
/** Clue mode must not leak the answer through its accessible label. */
export function wordCardCopy(target:Pick<Target,'text'|'label'>,done:boolean,clues?:Record<string,string>){
 const clue=clues?.[target.text];
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
