import {normalize} from '../game/catalog.ts';
import type {PlayableChapter} from './content.ts';

/** Offline publishing gate. Identity and seed changes cannot make old content new. */
export function assertOriginalReleases(chapters:readonly PlayableChapter[]){
 const words=new Map<string,string>(),grids=new Map<string,string>();
 for(const chapter of chapters){
  const wordKey=JSON.stringify([...new Set(chapter.spec.words.map(normalize))].sort());
  const gridKey=JSON.stringify(chapter.board.grid);
  const sameWords=words.get(wordKey),sameGrid=grids.get(gridKey);
  if(sameWords)throw new Error(`Repeated release words: ${chapter.id} repeats ${sameWords}`);
  if(sameGrid)throw new Error(`Repeated release grid: ${chapter.id} repeats ${sameGrid}`);
  words.set(wordKey,chapter.id);grids.set(gridKey,chapter.id);
 }
}
