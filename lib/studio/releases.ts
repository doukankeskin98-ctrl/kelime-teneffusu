import firstRelease from '../../content/releases/2026-10-21.json' with {type:'json'};
import secondRelease from '../../content/releases/2026-10-22.json' with {type:'json'};
import thirdRelease from '../../content/releases/2026-10-23.json' with {type:'json'};
import fourthRelease from '../../content/releases/2026-10-24.json' with {type:'json'};
import type {PlayableChapter} from './content.ts';
import type {ReleaseSummary} from './release-identity.ts';
export {releaseChapterId,type ReleaseSummary} from './release-identity.ts';

export interface ReleaseBatch {date:string;chapters:{slot:number;chapter:PlayableChapter}[]}
/** Append one immutable snapshot per UTC date. Never regenerate a published file. */
export const RELEASE_BATCHES:readonly ReleaseBatch[]=[firstRelease as ReleaseBatch,secondRelease as ReleaseBatch,thirdRelease as ReleaseBatch,fourthRelease as ReleaseBatch];
export const reservedReleaseId=(id:unknown)=>RELEASE_BATCHES.some(batch=>batch.chapters.some(item=>item.chapter.id===id));
function available(now:number){return RELEASE_BATCHES.filter(batch=>batch.date<=new Date(now).toISOString().slice(0,10)).flatMap(batch=>batch.chapters.filter(item=>item.chapter.publishedAt<=now).map(item=>({...item,releaseDate:batch.date}))).sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate)||a.slot-b.slot);}
export function releaseCatalogue(offset=0,now=Date.now()){
 const start=Number.isInteger(offset)&&offset>=0&&offset<=20000?offset:0,entries=available(now),limit=24;
 const chapters:ReleaseSummary[]=entries.slice(start,start+limit).map(({chapter:{board:_board,archived:_archived,...chapter},releaseDate,slot})=>({...chapter,releaseDate,slot}));
 return {chapters,nextOffset:start+limit<entries.length?start+limit:null,total:entries.length};
}
export function releasedChapter(id:unknown,now=Date.now()):PlayableChapter|undefined{
 const entry=available(now).find(item=>item.chapter.id===id);return entry?structuredClone(entry.chapter):undefined;
}
