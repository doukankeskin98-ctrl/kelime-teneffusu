import {hash, type Puzzle} from './engine.ts';
import {mainChapter} from './main-journey.ts';
import {worldChapter} from './world-presentation.ts';
import {qualityPuzzle, type BoardPolicy} from './board-quality.ts';
import {SAFE_LAYOUTS} from './safe-layouts.ts';

export function journeyPolicy(id:string,source:Puzzle):BoardPolicy {
  const chapter=mainChapter(id), world=worldChapter(id);
  const longest=Math.max(...source.targets.map(t=>t.text.length));
  if(chapter&&chapter.number<=2) return {size:Math.max(6,longest),directions:'straight',reverseLimit:0};
  if(chapter&&chapter.number<=6) return {size:Math.max(6,longest),directions:'forward',reverseLimit:0,diagonalRequired:chapter.number===3};
  if(chapter&&chapter.number<=12) return {size:Math.max(6,longest),directions:'all',reverseLimit:world?.position===4?2:1};
  // Each world opens gently, builds to a challenge, then ends with a lighter board.
  const step=world?.position??2;
  return {size:Math.max(step===4?8:step===2||step===3?7:6,longest),directions:step===0?'forward':'all',reverseLimit:step===4?3:step===5?1:2};
}

export function preparePresentation(source:Puzzle,key:string):Puzzle {
  return qualityPuzzle(source,hash('presentation:'+key),key.startsWith('route:')?journeyPolicy(key.slice(6),source):{});
}

/** Precomputed layouts avoid generator work on the input/render path. */
export function presentationBoard(source:Puzzle,key:string):Puzzle {
  const layout=SAFE_LAYOUTS[key];
  if(!layout) return source;
  if(layout.paths.length!==source.targets.length) throw new Error('Tahta hedefleri eşleşmiyor.');
  return {version:2,size:layout.rows.length,grid:layout.rows.map(row=>[...row]),targets:source.targets,
    placements:source.targets.map((target,i)=>{const [r,c,y,x]=layout.paths[i]!;return {...target,a:[r,c],b:[y,x]};})};
}
