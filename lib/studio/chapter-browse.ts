import type {PublishedChapter} from './content.ts';
import type {ReleasePair} from './release-stamps.ts';

export type ChapterBrowseSource='archive'|'album'|'world'|'studio';
/** In-memory navigation only. Never stores player progress or a playable board. */
export interface ChapterBrowseReturn {
 source:ChapterBrowseSource;
 ownerId?:string;
 collection:'studio'|'releases';
 themeId?:string;
 chapters:PublishedChapter[];
 companions:PublishedChapter[];
 nextOffset:number|null;
 hasPage:boolean;
 selectedId:string;
 selectedDate?:string;
}
export type ChapterSelection=(chapter:PublishedChapter,practice?:boolean,pair?:ReleasePair,origin?:ChapterBrowseReturn)=>void;
export function matchingChapterBrowse(value:ChapterBrowseReturn|undefined,source:ChapterBrowseSource,ownerId:string|undefined,collection:'studio'|'releases',themeId?:string){
 return value?.source===source&&value.ownerId===ownerId&&value.collection===collection&&value.themeId===themeId&&value.chapters.some(c=>c.id===value.selectedId)?value:undefined;
}
