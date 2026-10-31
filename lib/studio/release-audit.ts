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

/** Build-time only: reject archive identity damage before any publication. */
export async function assertReleaseManifest(batches:readonly import('./releases.ts').ReleaseBatch[]){
 const {releaseChapterId}=await import('./release-identity.ts');
 const {digest}=await import('../game/security.ts');
 const dates=new Set<string>(),ids=new Set<string>();
 for(const batch of batches){
  const day=Date.parse(batch.date+'T00:00:00Z');
  releaseChapterId(batch.date,1);
  if(dates.has(batch.date))throw new Error('Repeated release date: '+batch.date);
  dates.add(batch.date);
  if(batch.chapters.length!==2||batch.chapters[0]?.slot!==1||batch.chapters[1]?.slot!==2)throw new Error('Invalid release slots: '+batch.date);
  for(const {slot,chapter} of batch.chapters){
   if(ids.has(chapter.id)||chapter.id!==releaseChapterId(batch.date,slot))throw new Error('Invalid release identity: '+chapter.id);
   ids.add(chapter.id);
   if(!Number.isFinite(chapter.publishedAt)||chapter.publishedAt<day||chapter.publishedAt>=day+86400000||chapter.archived)throw new Error('Invalid release publication: '+chapter.id);
   if(chapter.spec.difficulty!==(slot===1?'Rahat':'Dengeli'))throw new Error('Invalid release difficulty: '+chapter.id);
   if(chapter.contentHash!==await digest(JSON.stringify(chapter.spec)))throw new Error('Invalid release hash: '+chapter.id);
  }
 }
}
