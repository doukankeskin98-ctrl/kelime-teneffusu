import {AUTHORED_JOURNEY} from './authored-journey-data.ts';
import type {Puzzle,Target,Placement} from './engine.ts';

export {AUTHORED_JOURNEY};
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
 'uzay-5':'Yıldızlar saklı harfleri gösterir.'
};
