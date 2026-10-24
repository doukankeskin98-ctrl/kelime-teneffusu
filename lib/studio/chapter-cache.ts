import {splitWord} from '../game/catalog.ts';
import {exactLine} from '../game/engine.ts';
import {cleanSave,type SavedLevel} from '../game/progress.ts';
import {parseChapterSpec,validChapterId,type PlayableChapter,type PublishedChapter} from './content.ts';

export const BOARD_KEY='kt-published-boards-v1';
export const saveKey=(owner?:string)=>'kt-published-progress-v1:'+(owner??'device');
export function dictionary<T>(key:string,storage:Pick<Storage,'getItem'>=localStorage):Record<string,T>{try{const data=JSON.parse(storage.getItem(key)??'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch{return {};}}
export function cachedChapter(raw:unknown):PlayableChapter|null{try{
 if(!raw||typeof raw!=='object')return null;const c=raw as PlayableChapter;if(!validChapterId(c.id)||!/^[a-f0-9]{64}$/.test(c.contentHash)||!Number.isFinite(c.publishedAt)||c.publishedAt<=0)return null;const spec=parseChapterSpec(c.spec),b=c.board;
 if(!b||b.version!==2||b.size!==spec.size||!Array.isArray(b.grid)||b.grid.length!==b.size||b.grid.some(row=>!Array.isArray(row)||row.length!==b.size||row.some(ch=>typeof ch!=='string'||!/^[A-ZÇĞİÖŞÜ0-9]$/u.test(ch))))return null;
 const expected=spec.words.flatMap((label,group)=>splitWord(label).map((text,i)=>({id:`${group}.${i}`,label,text,group})));if(JSON.stringify(b.targets)!==JSON.stringify(expected)||!Array.isArray(b.placements)||b.placements.length!==expected.length)return null;
 const ids=new Set<string>();for(const p of b.placements){const target=expected.find(t=>t.id===p.id),cells=exactLine(p.a,p.b,b.size);if(!target||ids.has(p.id)||!cells||cells.map(([r,col])=>b.grid[r]![col]).join('')!==target.text)return null;ids.add(p.id);}
 return {...c,spec};
 }catch{return null;}}
export function rememberChapter(chapter:PlayableChapter,storage:Pick<Storage,'getItem'|'setItem'>=localStorage){try{const cached=dictionary<PlayableChapter>(BOARD_KEY,storage);cached[chapter.id]=chapter;const entries=Object.values(cached).filter(c=>validChapterId(c.id)).sort((a,b)=>b.publishedAt-a.publishedAt).slice(0,100);storage.setItem(BOARD_KEY,JSON.stringify(Object.fromEntries(entries.map(c=>[c.id,c]))));}catch{}}

/** A cloud result or a catalogue card alone is not proof of an offline board. */
export function matchingCachedChapter(raw:unknown,chapter:PublishedChapter):PlayableChapter|null{
 const cached=cachedChapter(raw);if(!cached||cached.id!==chapter.id||cached.contentHash!==chapter.contentHash)return null;
 try{if(JSON.stringify(cached.spec)!==JSON.stringify(parseChapterSpec(chapter.spec)))return null;}catch{return null;}
 return cached;
}
export function readChapterSave(storage:Pick<Storage,'getItem'>,owner:string|undefined,chapter:PublishedChapter){const cached=matchingCachedChapter(dictionary<PlayableChapter>(BOARD_KEY,storage)[chapter.id],chapter);if(!cached)return null;const raw=dictionary<SavedLevel>(saveKey(owner),storage)[chapter.id];return {save:cleanSave(raw,cached.board),board:cached.board};}
