import {splitWord} from '../game/catalog.ts';
import {timeLabel} from '../game/engine.ts';
import type {SavedLevel} from '../game/progress.ts';
import type {ChapterSpec} from './content.ts';

export interface ChapterCardProgress {foundIds:string[];elapsed:number;hints:number;complete:boolean;stars:number}
export type ChapterCardState='loading'|'ready'|'offline'|'error';
export const chapterTargetIds=(spec:ChapterSpec)=>spec.words.flatMap((word,group)=>splitWord(word).map((_,part)=>`${group}.${part}`));
export function cardProgress(save:SavedLevel,spec:ChapterSpec):ChapterCardProgress{
 return parseCardProgress({foundIds:save.strokes.map(s=>s.id),elapsed:save.elapsed,hints:save.hints},spec)!;
}
export function parseCardProgress(raw:unknown,spec:ChapterSpec):ChapterCardProgress|null{
 if(!raw||typeof raw!=='object')return null;const r=raw as Record<string,unknown>,ids=chapterTargetIds(spec);
 if(!Array.isArray(r['foundIds'])||r['foundIds'].length>30||r['foundIds'].some(id=>typeof id!=='string'||!ids.includes(id))||typeof r['elapsed']!=='number'||!Number.isFinite(r['elapsed'])||typeof r['hints']!=='number'||!Number.isInteger(r['hints']))return null;
 const foundIds=[...new Set(r['foundIds'] as string[])],elapsed=Math.max(0,Math.min(604800,Math.floor(r['elapsed']))),hints=Math.max(0,Math.min(3,r['hints'])),complete=foundIds.length===ids.length;
 return {foundIds,elapsed,hints,complete,stars:complete?3-Math.min(2,hints):0};
}
export function mergeCardProgress(a:ChapterCardProgress|undefined,b:ChapterCardProgress,spec:ChapterSpec):ChapterCardProgress{
 if(!a)return b;
 if(a.complete||b.complete)return [a,b].filter(s=>s.complete).sort((x,y)=>y.stars-x.stars||x.elapsed-y.elapsed)[0]!;
 return parseCardProgress({foundIds:[...new Set([...a.foundIds,...b.foundIds])],elapsed:Math.max(a.elapsed,b.elapsed),hints:Math.max(a.hints,b.hints)},spec)!;
}
export function chapterCardCopy(value:ChapterCardProgress|undefined,state:ChapterCardState,spec:ChapterSpec){
 if(value?.complete)return {kind:'complete' as const,action:'Bir daha keşfet',detail:`${value.stars} yıldız · En iyi ${timeLabel(value.elapsed)}`};
 if(value?.foundIds.length){const total=chapterTargetIds(spec).length;return {kind:'continue' as const,action:'Kaldığın yerden',detail:`${value.foundIds.length}/${total} ${total>spec.words.length?'kelime parçası':'kelime'} bulundu`};}
 if(value&&state==='ready')return {kind:'new' as const,action:'Keşfe başla',detail:'Seni bekleyen bir keşif'};
 return {kind:'unknown' as const,action:'Keşfi aç',detail:state==='loading'?'İlerlemene bakılıyor…':state==='offline'?'Çevrimdışı · Bulut bilgisi alınamıyor':state==='error'?'İlerleme durumu alınamadı':'Yeni bir keşif'};
}
