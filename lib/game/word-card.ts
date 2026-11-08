import {exactLine,match,type Puzzle,type Target,type Stroke,type Cell} from './engine.ts';
export type WordVeil='open'|'initial'|'hidden';
export function veiledText(text:string,veil:WordVeil='open'){
 if(veil==='open')return text;
 let first=true;return [...text].map(char=>{if(/\s/.test(char))return char;const visible=first&&veil==='initial';first=false;return visible?char:'✱';}).join('');
}
/** Word length/parts never change normal play into a single-target carousel. */
export function compactWordRack(board:{targets:Target[]},clues?:Record<string,string>){
 return !clues&&board.targets.length>0;
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

/** Follow the visible focus and original list order, never placement length order. */
export function hintTarget(board:{targets:Target[]},strokes:Stroke[],preferred:number|null=null){
 const group=focusedWordGroup(board,strokes,preferred),found=new Set(strokes.map(s=>s.id));
 return board.targets.find(t=>t.group===group&&!found.has(t.id))??null;
}

/** Each charged solo hint adds help. Stored hint count survives reload; competitive hints stay server-owned. */
export function soloHintGuide(placement:Pick<Stroke,'a'|'b'>,used:number):{start:Cell;end:Cell|null;message:string}{
 const {a,b}=placement;
 return used<=1?{start:a,end:null,message:'Kelimenin ilk harfi burada.'}:used===2?{start:a,end:[a[0]+Math.sign(b[0]-a[0]),a[1]+Math.sign(b[1]-a[1])],message:'İlk harften işaretli yönde ilerle.'}:{start:a,end:b,message:'İşaretli yolu çizerek kelimeyi tamamla.'};
}


/** Explain a near miss only when it extends to one already visible answer on
 * this exact line. This is feedback on release and never awards a word. */
export function nearMissMessage(board:Pick<Puzzle,'grid'|'size'|'targets'>,start:Cell,end:Cell,visible:Target[]):string{
 const cells=exactLine(start,end,board.size);
 if(!cells||cells.length<4||!visible.length)return 'Tekrar dene.';
 const dr=Math.sign(end[0]-start[0]),dc=Math.sign(end[1]-start[1]);
 const answers=new Set<string>();
 const puzzle={...board,targets:visible};
 for(const gap of [1,2]){
  const first:Cell=[start[0]-dr*gap,start[1]-dc*gap];
  const last:Cell=[end[0]+dr*gap,end[1]+dc*gap];
  if(match(puzzle,first,end))answers.add(board.grid[first[0]]![first[1]]+' harfinden başla.');
  if(match(puzzle,start,last))answers.add(board.grid[last[0]]![last[1]]+' harfine kadar kaydır.');
 }
 return answers.size===1?[...answers][0]!:'Tekrar dene.';
}
