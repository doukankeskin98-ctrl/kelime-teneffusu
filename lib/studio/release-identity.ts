import type {PublishedChapter} from './content.ts';

export interface ReleaseSummary extends PublishedChapter {releaseDate:string;slot:number}
/** Shared with the client without importing any frozen board payloads. */
export function releaseChapterId(date:string,slot:number){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||(slot!==1&&slot!==2))throw new Error('Invalid daily release identity');
 return `${date.replaceAll('-','')}-${String(slot).padStart(4,'0')}-4000-8000-000000000001`;
}
