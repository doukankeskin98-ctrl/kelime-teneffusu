import {journeyById} from './content.ts';
import {discoveryState,EXPEDITIONS} from './discovery.ts';
import type {Progress} from './progress.ts';

/** Presentation order v1. IDs, boards, saves and the existing 3/5/6 gates stay unchanged.
 * Append future content; never reuse a number or infer completion from its position. */
export const MAIN_JOURNEY_IDS:readonly string[]=[
 'uzay-1','uzay-2','uzay-3','turkiye-1','uzay-4','turkiye-2','turkiye-3','hababam-1','uzay-5','uzay-gozlemevi',
 'hababam-2','hababam-3','turkiye-4','turkiye-5','turkiye-kartpostal','hababam-4','hababam-5','hababam-yillik',
 ...EXPEDITIONS.slice(3).flatMap(e=>[...e.chapterIds,`${e.id}-atlas-6`]),
];
export const MAIN_JOURNEY=MAIN_JOURNEY_IDS.map((id,i)=>({number:i+1,chapter:journeyById(id)!}));
export const mainChapter=(id?:string)=>MAIN_JOURNEY.find(item=>item.chapter.id===id)??null;
const done=(p:Pick<Progress,'saves'>,id:string)=>p.saves['route:'+id]?.complete===true;
const started=(save:Progress['saves'][string]|undefined)=>!!save&&(save.complete||save.strokes.length>0||save.elapsed>0||save.hints>0);

/** Picker access follows real world gates, never the presentation number. */
export function mainJourneyChapters(progress:Pick<Progress,'saves'>){
 const states=discoveryState(progress);
 return MAIN_JOURNEY.map(item=>{
  const world=states.find(s=>s.expedition.id===item.chapter.themeId)!;
  const save=progress.saves['route:'+item.chapter.id];
  const unlocked=world.unlocked&&(world.bonus.id!==item.chapter.id||world.bonusUnlocked||started(save));
  return {...item,world,unlocked,complete:save?.complete===true,stars:save?.stars??0,
   continuing:!!save&&!save.complete&&(save.strokes.length>0||save.elapsed>0||save.hints>0)};
 });
}

export function mainJourneyState(progress:Pick<Progress,'saves'|'last'>){
 const available=new Set(mainJourneyChapters(progress).filter(item=>item.unlocked).map(item=>item.chapter.id));
 // A real unfinished last journey wins; a standard/archive game cannot replace the main path.
 const last=mainChapter(progress.last?.journey),saved=last?progress.saves['route:'+last.chapter.id]:undefined;
 const resume=last&&saved&&!saved.complete&&started(saved)&&available.has(last.chapter.id)?last:null;
 const current=resume??MAIN_JOURNEY.find(item=>!done(progress,item.chapter.id)&&available.has(item.chapter.id))??null;
 const currentSave=current?progress.saves['route:'+current.chapter.id]:undefined;
 return {current,continuing:!!(currentSave&&!currentSave.complete&&(currentSave.strokes.length||currentSave.elapsed||currentSave.hints)),completed:MAIN_JOURNEY.filter(item=>done(progress,item.chapter.id)).length,total:MAIN_JOURNEY.length};
}

/** The next new chapter is the earliest actual gap, not current number + 1. */
export function nextMainChapter(progress:Pick<Progress,'saves'>){return mainJourneyState({...progress,last:null}).current;}

/** Count real remaining chapters until the next world or completed album.
 * This simulates gates for copy only; it never writes or grants a hypothetical reward. */
export function nextMainMilestone(progress:Pick<Progress,'saves'>){
 const initial=discoveryState(progress),saves={...progress.saves};let remaining=0;
 for(const item of MAIN_JOURNEY){
  if(done({saves},item.chapter.id))continue;
  const state=discoveryState({saves}).find(s=>s.expedition.id===item.chapter.themeId)!;
  if(!state.unlocked||(state.bonus.id===item.chapter.id&&!state.bonusUnlocked))continue;
  saves['route:'+item.chapter.id]={strokes:[],elapsed:0,hints:0,complete:true,stars:0};remaining++;
  const after=discoveryState({saves});
  for(let i=0;i<after.length;i++){
   const before=initial[i]!,now=after[i]!;
   if(now.unlocked&&!before.unlocked)return {kind:'world' as const,title:now.expedition.title,remaining};
   if(now.complete&&!before.complete)return {kind:'album' as const,title:now.album.title,remaining};
  }
 }
 return null;
}

/** The first ten alternate a small breather with a new skill; existing puzzles are immutable. */
export const FIRST_TEN_LESSONS:Record<string,string>={
 'uzay-1':'İlk kelime: bir ucundan diğerine kaydır. İki ucuna dokunmak da olur.',
 'uzay-2':'Şimdi çaprazlara bak. Bir harf birden fazla kelimede kullanılabilir.',
 'uzay-3':'Uzun kelimelerde ilk ve son harfi ara. Bu bölüm yeni dünyayı açar.',
 'turkiye-1':'Yeni dünyada kısa bir mola: dört kısa kelime, küçük bir tahta.',
 'uzay-4':'Bakış açını değiştir: kelimeler tersten de seçilebilir.',
 'turkiye-2':'Tanıdık şehirlerle ritmini bul. Yanlış seçim ceza getirmez.',
 'turkiye-3':'Birden fazla parçalı adlar tek hedef. Bu bölüm yeni dünyayı açar.',
 'hababam-1':'Yeni bir dünya, yeniden küçük bir tahta. Dört kelimeyle başla.',
 'uzay-5':'İlk ustalık bölümü: uzun adları parça parça bul. Büyük harf moduyla yakından bakabilirsin.',
 'uzay-gozlemevi':'Altıncı parça: bu bölüm ilk albümünü tamamlar.',
};

export function nextChapterLabel(number:number){
 const sound=number%10||number%100||100;
 const suffix=[6,9].includes(sound)?'ya':[2,7,8,20,50].includes(sound)?'ye':[10,30].includes(sound)?'a':'e';
 return `Bölüm ${number}’${suffix} geç`;
}
