import type {Progress} from './progress.ts';
import {MAIN_JOURNEY,mainChapter,mainJourneyChapters} from './main-journey.ts';
import {chapterCredit} from './original-content.ts';
import {discoveryState,expeditionForChapter,expeditionBonusId} from './discovery.ts';
import {chapterVeils,worldChapter} from './world-presentation.ts';
import {journeyBoard} from './content.ts';

export const MECHANIC_GUIDES=['riddle','concealed','mystery','daily'] as const;
export type MechanicGuideId=typeof MECHANIC_GUIDES[number];
export function worldNeedsWelcome(progress:Progress,chapterId:string){
 const item=mainJourneyChapters(progress).find(c=>c.chapter.id===chapterId);if(!item?.unlocked)return false;
 const world=item.world.expedition;
 if(world.place==='01'||progress.welcomedWorlds?.includes(world.id))return false;
 return ![...world.chapterIds,expeditionBonusId(world)].some(id=>{const s=chapterCredit(progress,id);return s&&(s.complete||s.strokes.length>0||s.elapsed>0||s.hints>0);});
}
export function bonusOffer(before:Progress,after:Progress,chapterId:string){
 if(!mainChapter(chapterId)||chapterCredit(before,chapterId)?.complete)return null;
 const world=expeditionForChapter(chapterId);if(!world)return null;
 return discoveryState(after).find(s=>s.expedition.id===world.id)?.complete?world:null;
}
/** Uses the real authored load. No new locks, targets, timer or save identity. */
export function chapterPace(id:string){
 const info=worldChapter(id);if(!info)return null;
 const board=journeyBoard(info.chapter),veils=chapterVeils(id,board.targets);
 if(info.position===0)return {kind:'easy',label:'Rahat başlangıç',detail:`${info.chapter.words.length} açık kelime`} as const;
 if(info.position>=4||Object.values(veils).includes('hidden'))return {kind:'challenge',label:'Ustalık',detail:info.chapter.clues?'Kısa tanımlardan kelimeleri bul':Object.values(veils).includes('hidden')?'Konuya bak, saklı kelimeyi keşfet':Object.values(veils).includes('initial')?'İlk harfiyle verilen kelimeyi keşfet':'Bütün kelimeler açık; farklı yönleri keşfet'} as const;
 return {kind:'normal',label:info.chapter.clues?'Bilmece':'Keşif',detail:`${info.chapter.words.length} kelime`} as const;
}
export const WORD_TRAIL=[
 {id:'seed',at:10,title:'İlk filiz',icon:'sprout'},
 {id:'leaf',at:30,title:'Yeşil yaprak',icon:'leaf'},
 {id:'bloom',at:60,title:'İlk çiçek',icon:'flower'},
 {id:'sun',at:110,title:'Güneşli gün',icon:'sun'},
 {id:'compass',at:180,title:'Yeni ufuk',icon:'compass'},
 {id:'moon',at:280,title:'Ay ışığı',icon:'moon'},
 {id:'spark',at:420,title:'Yıldız izi',icon:'sparkles'},
 {id:'crown',at:600,title:'Kelime ustası',icon:'crown'},
] as const;
export function wordTrail(progress:Pick<Progress,'saves'>){
 let words=0;
 for(const {chapter} of MAIN_JOURNEY){
  const save=chapterCredit(progress,chapter.id);if(!save)continue;
  if(save.complete){words+=chapter.words.length;continue;}
  // Partial target groups count once, including multi-part labels.
  const current=progress.saves['route:'+chapter.id];if(!current)continue;
  const board=journeyBoard(chapter),found=new Set(current.strokes.map(s=>s.id));
  words+=[...new Set(board.targets.map(t=>t.group))].filter(g=>board.targets.filter(t=>t.group===g).every(t=>found.has(t.id))).length;
 }
 const earned=WORD_TRAIL.filter(t=>words>=t.at),next=WORD_TRAIL.find(t=>words<t.at);
 return {words,earned,next,remaining:next?next.at-words:0};
}
