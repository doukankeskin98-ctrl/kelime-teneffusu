import type {PublishedChapter} from './content.ts';
import {releaseChapterId,type ReleaseSummary} from './release-identity.ts';
import {parseCardProgress,type ChapterCardProgress,type ChapterCardState} from './card-progress.ts';

export interface ReleasePair {date:string;chapters:[ReleaseSummary,ReleaseSummary]}
/** Only the original two IDs define a stamp. More content never expands its goal. */
export function releasePairs(chapters:readonly PublishedChapter[]):ReleasePair[]{
 const dates=new Map<string,Map<number,ReleaseSummary>>();
 for(const raw of chapters){
  const c=raw as Partial<ReleaseSummary>;
  if(typeof c.releaseDate!=='string'||(c.slot!==1&&c.slot!==2))continue;
  try{if(c.id!==releaseChapterId(c.releaseDate,c.slot))continue;}catch{continue;}
  const slots=dates.get(c.releaseDate)??new Map<number,ReleaseSummary>();
  if(!slots.has(c.slot))slots.set(c.slot,raw as ReleaseSummary);dates.set(c.releaseDate,slots);
 }
 return [...dates].sort(([a],[b])=>b.localeCompare(a)).flatMap(([date,slots])=>{
  const first=slots.get(1),second=slots.get(2);return first&&second?[{date,chapters:[first,second] as [ReleaseSummary,ReleaseSummary]}]:[];
 });
}
export const releaseDateLabel=(date:string)=>new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
export function releaseStamp(pair:ReleasePair,values:Record<string,ChapterCardProgress>,status:ChapterCardState){
 const steps=pair.chapters.map(chapter=>({chapter,progress:parseCardProgress(values[chapter.id],chapter.spec)}));
 const completed=steps.filter(s=>s.progress?.complete).length,known=steps.every(s=>s.progress!==null),earned=completed===2;
 const waiting=status==='loading'?'Kayıtlarına bakılıyor…':status==='offline'?'Çevrimdışı · Eksik kayıt bağlantıda kontrol edilecek.':'Eksik kayıt henüz doğrulanamadı.';
 return {id:'pair:'+pair.date,date:pair.date,steps,completed,known,earned,detail:earned?'İki keşif tamam. Damgan arşivinde.':known?`${completed}/2 keşif tamamlandı. İkisini de bitir, damganı aç.`:completed?`Bir keşif tamam. ${waiting}`:waiting};
}
