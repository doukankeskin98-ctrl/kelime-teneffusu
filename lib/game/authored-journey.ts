import {AUTHORED_JOURNEY} from './authored-journey-data.ts';
import type {Puzzle,Target,Placement} from './engine.ts';
import {RULES_COPY} from './rules-copy.ts';

export {AUTHORED_JOURNEY};
// These six revision-2 boards were already saved by the earlier pilot. A revision
// identifies one immutable board; the full catalogue must never replace them.
export const LEGACY_REVISION_TWO_IDS=new Set(['ufuk-gok-1','ufuk-gok-2','ufuk-gok-3','ufuk-gok-4','ufuk-gok-5','ufuk-gok-6']);
export const authoredRevision=(id:string):2|3=>LEGACY_REVISION_TWO_IDS.has(id)?3:2;
export const isAuthoredRevision=(id:string,revision=1)=>!!AUTHORED_JOURNEY[id]&&revision===authoredRevision(id);
export function authoredBoard(id:string):Puzzle|undefined {
 const level=AUTHORED_JOURNEY[id];
 if(!level)return;
 const grid=level.grid.map(row=>[...row]);
 const targets:Target[]=level.placements.map(([text],group)=>({id:group+'.0',text,label:text,group}));
 const placements:Placement[]=level.placements.map(([,r,c,y,x],index)=>({...targets[index]!,a:[r,c],b:[y,x]}));
 return {version:2,authored:true,size:Math.max(grid.length,grid[0]!.length),grid,targets,placements};
}

export const authoredLesson:Readonly<Record<string,string>>={
 'uzay-2':'Kelimeleri çapraz da çizebilirsin.',
 'uzay-3':'Bir harf iki kelimede birden kullanılabilir.',
 'uzay-4':'Kelimeler ters yönde de saklanır.',
 'uzay-5':RULES_COPY.initial
};
