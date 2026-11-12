import {DISCOVERIES_CHAPTERS} from './discoveries-content.ts';
import {chapterCredit,replacementChapterId} from './original-content.ts';
import {EVERYDAY_CHAPTERS} from './everyday-content.ts';
import {NATURE_CHAPTERS} from './nature-content.ts';
import {COAST_CHAPTERS} from './coast-content.ts';
import {journeyById} from './content.ts';
import {discoveryState,EXPEDITIONS,nextJourneyAfter,expeditionForChapter,expeditionBonusId} from './discovery.ts';
import type {Progress} from './progress.ts';

/** Legacy catalog membership. Persisted IDs, boards and gates remain unchanged. */
export const MAIN_JOURNEY_IDS:readonly string[]=[
 'uzay-1','uzay-2','uzay-3','turkiye-1','uzay-4','turkiye-2','turkiye-3','hababam-1','uzay-5','uzay-gozlemevi',
 'hababam-2','hababam-3','turkiye-4','turkiye-5','turkiye-kartpostal','hababam-4','hababam-5','hababam-yillik',
 ...EXPEDITIONS.slice(3,16).flatMap(e=>[...e.chapterIds,expeditionBonusId(e)]),
 ...COAST_CHAPTERS.map(c=>c.id),
 ...NATURE_CHAPTERS.map(c=>c.id),
 ...EVERYDAY_CHAPTERS.map(c=>c.id),
 ...DISCOVERIES_CHAPTERS.map(c=>c.id),
].map(replacementChapterId);
/** Display order follows the authored worlds, never the historical release order. */
export const MAIN_JOURNEY_ORDER=EXPEDITIONS.flatMap(world=>[...world.chapterIds,expeditionBonusId(world)]).map(replacementChapterId).filter(id=>MAIN_JOURNEY_IDS.includes(id));
export const MAIN_JOURNEY=MAIN_JOURNEY_ORDER.map((id,i)=>({number:i+1,chapter:journeyById(id)!}));
export const mainChapter=(id?:string)=>MAIN_JOURNEY.find(item=>item.chapter.id===replacementChapterId(id??''))??null;
const done=(p:Pick<Progress,'saves'>,id:string)=>chapterCredit(p,id)?.complete===true;
const started=(save:Progress['saves'][string]|undefined)=>!!save&&(save.complete||save.strokes.length>0||save.elapsed>0||save.hints>0);

/** Picker access follows real world gates, never the presentation number. */
export function mainJourneyChapters(progress:Pick<Progress,'saves'>){
 const states=discoveryState(progress);
 return MAIN_JOURNEY.map(item=>{
  const world=states.find(s=>s.expedition.id===expeditionForChapter(item.chapter.id)?.id)!;
  const save=chapterCredit(progress,item.chapter.id);
  const unlocked=world.unlocked&&(world.bonus.id!==item.chapter.id||world.bonusUnlocked||started(save));
  return {...item,world,unlocked,complete:save?.complete===true,stars:save?.stars??0,
   continuing:!!save&&!save.complete&&(save.strokes.length>0||save.elapsed>0||save.hints>0)};
 });
}

export function mainJourneyState(progress:Pick<Progress,'saves'|'last'>){
 const available=new Set(mainJourneyChapters(progress).filter(item=>item.unlocked).map(item=>item.chapter.id));
 // A real unfinished last journey wins; a standard/archive game cannot replace the main path.
 const last=mainChapter(progress.last?.journey),saved=last?chapterCredit(progress,last.chapter.id):undefined;
 const resume=last&&saved&&!saved.complete&&started(saved)&&available.has(last.chapter.id)?last:null;
 const following=last?nextJourneyAfter(progress,last.chapter.id):null;
 const worldOrder=EXPEDITIONS.flatMap(world=>MAIN_JOURNEY.filter(item=>expeditionForChapter(item.chapter.id)?.id===world.id));
 const current=resume??(following?mainChapter(following.id):null)??worldOrder.find(item=>!done(progress,item.chapter.id)&&available.has(item.chapter.id))??null;
 const currentSave=current?chapterCredit(progress,current.chapter.id):undefined;
 return {current,continuing:!!(currentSave&&!currentSave.complete&&(currentSave.strokes.length||currentSave.elapsed||currentSave.hints)),completed:MAIN_JOURNEY.filter(item=>done(progress,item.chapter.id)).length,total:MAIN_JOURNEY.length};
}

/** The next new chapter is the earliest actual gap, not current number + 1. */
export function nextMainChapter(progress:Pick<Progress,'saves'>){return mainJourneyState({...progress,last:null}).current;}

/** Count real remaining chapters until the next world or completed album.
 * This simulates gates for copy only; it never writes or grants a hypothetical reward. */
export function nextMainMilestone(progress:Pick<Progress,'saves'>,fromId?:string){
 const initial=discoveryState(progress),saves={...progress.saves};let remaining=0;
 let cursor=fromId??nextMainChapter(progress)?.chapter.id;
 for(let step=0;step<MAIN_JOURNEY.length&&cursor;step++){
  const item=mainChapter(cursor)!;
  if(done({saves},item.chapter.id)){cursor=nextJourneyAfter({saves},cursor)?.id;continue;}
  const state=discoveryState({saves}).find(s=>s.expedition.id===expeditionForChapter(item.chapter.id)?.id)!;
  if(!state.unlocked||(state.bonus.id===item.chapter.id&&!state.bonusUnlocked))break;
  saves['route:'+item.chapter.id]={strokes:[],elapsed:0,hints:0,complete:true,stars:0};remaining++;
  const after=discoveryState({saves});
  for(let i=0;i<after.length;i++){
   const before=initial[i]!,now=after[i]!;
   if(now.unlocked&&!before.unlocked)return {kind:'world' as const,title:now.expedition.title,remaining};
   if(now.complete&&!before.complete)return {kind:'album' as const,title:now.album.title,remaining};
  }
  cursor=nextJourneyAfter({saves},item.chapter.id)?.id;
 }
 return null;
}

/** Short, optional coaching for the actual first ten. Never promise an unearned unlock. */
export const FIRST_TEN_LESSONS:Record<string,string>={
 'uzay-1':'Kaydırmak yerine kelimenin iki ucuna da dokunabilirsin.',
 'uzay-2':'Kelimeleri soldan sağa ve yukarıdan aşağıya ara.',
 'uzay-3':'Şimdi çaprazlara da bak. Bir harf birkaç kelimede kullanılabilir.',
 'uzay-4':'Uzun kelimelerde önce ilk ve son harfi ara.',
 'uzay-5':'Aynı addaki parçaları ayrı ayrı bul.',
 'uzay-gozlemevi':'Takılırsan listedeki bir kelimeyi seç, sonra ipucu al.',
 'turkiye-1':'Yeni bir manzara, tanıdık kelimeler. Acele yok.',
 'turkiye-2':'Bazı kelimeler ters yönde. İki uçtan da başlayabilirsin.',
 'turkiye-3':'İpucu, seçtiğin kelimenin ilk harfini gösterir.',
 'turkiye-4':'Bulamazsan tahtayı döndürerek yeniden bak.',
};

export function nextChapterLabel(number:number){
 const sound=number%10||number%100||100;
 const suffix=[6,9].includes(sound)?'ya':[2,7,8,20,50].includes(sound)?'ye':[10,30].includes(sound)?'a':'e';
 return `Bölüm ${number}’${suffix} geç`;
}
