import {DISCOVERIES_ROUTES} from './discoveries-content.ts';
import {ORIGINAL_ROUTES,chapterCredit,replacementChapterId} from './original-content.ts';
import {EVERYDAY_ROUTES} from './everyday-content.ts';
import {NATURE_ROUTES} from './nature-content.ts';
import {COAST_ROUTES} from './coast-content.ts';
import {ATLAS_REGIONS} from './atlas-content.ts';
import {ALBUMS,JOURNEYS,JOURNEY_BONUSES,journeyById,type Journey} from './content.ts';
import type {Progress,SavedLevel} from './progress.ts';

export const DISCOVERY_GATE=3;
export interface Expedition {
 id:string;title:string;subtitle:string;place:string;pieces:readonly string[];accent:string;chapterIds:readonly string[];themeId?:string;bonusId?:string;album?:{themeId:string;title:string;description:string;stamp:string};
}
const launchChapters=(theme:string)=>[1,2,3,4,5].map(n=>`${theme}-${n}`);
const LEGACY_EXPEDITIONS:readonly Expedition[]=[
 {id:'uzay',title:'Yıldız İskelesi',subtitle:'Pencerenden başlayan kocaman bir yolculuk.',place:'01',pieces:['İlk yıldız','Gezegen halkası','Keşif roketi','Galaksi izi','Uzak ufuk','Gözlemevinin ışığı'],accent:'#9aa8cb',chapterIds:launchChapters('uzay')},
 {id:'turkiye',title:'Anadolu Patikası',subtitle:'Bir sokak, bir manzara, bir yeni hikâye.',place:'02',pieces:['Yol bileti','Şehir ışığı','Dağ esintisi','Tarihin izi','Yol defteri','Son kartpostal'],accent:'#ccaa79',chapterIds:launchChapters('turkiye')},
 {id:'hababam',title:'Teneffüs Bahçesi',subtitle:'Tanıdık bir sınıfta yeni hatıralar.',place:'03',pieces:['İlk zil','Arka sıranın notu','Sınıfın neşesi','Yoklama defteri','Son ders','Yıllık fotoğrafı'],accent:'#8eaf91',chapterIds:launchChapters('hababam')},
 ...ATLAS_REGIONS.map((r,i)=>({id:r.id,title:r.title,subtitle:r.subtitle,place:String(i+4).padStart(2,'0'),pieces:r.pieces,accent:r.accent,chapterIds:[1,2,3,4,5].map(n=>`${r.id}-atlas-${n}`)})),
 ...COAST_ROUTES.map((r,i)=>({id:r.id,themeId:r.chapters[0]!.themeId,title:r.title,subtitle:r.subtitle,place:String(i+17).padStart(2,'0'),pieces:r.pieces,accent:'#87bdc1',chapterIds:r.chapters.slice(0,5).map(c=>c.id),bonusId:r.chapters[5]!.id,album:{themeId:r.id,title:r.album,description:r.subtitle,stamp:'KIYI GÜNLÜĞÜ'}})),
 ...NATURE_ROUTES.map((r,i)=>({id:r.id,themeId:r.chapters[0]!.themeId,title:r.title,subtitle:r.subtitle,place:String(i+21).padStart(2,'0'),pieces:r.pieces,accent:'#8fbd93',chapterIds:r.chapters.slice(0,5).map(c=>c.id),bonusId:r.chapters[5]!.id,album:{themeId:r.id,title:r.album,description:r.subtitle,stamp:'DOĞA GÜNLÜĞÜ'}})),
 ...EVERYDAY_ROUTES.map((r,i)=>({id:r.id,themeId:r.chapters[0]!.themeId,title:r.title,subtitle:r.subtitle,place:String(i+25).padStart(2,'0'),pieces:r.pieces,accent:'#d9b97a',chapterIds:r.chapters.slice(0,5).map(c=>c.id),bonusId:r.chapters[5]!.id,album:{themeId:r.id,title:r.album,description:r.subtitle,stamp:'GÜNÜN RENKLERİ'}})),
 ...DISCOVERIES_ROUTES.map((r,i)=>({id:r.id,themeId:r.chapters[0]!.themeId,title:r.title,subtitle:r.subtitle,place:String(i+29).padStart(2,'0'),pieces:r.pieces,accent:'#d9b97a',chapterIds:r.chapters.slice(0,5).map(c=>c.id),bonusId:r.chapters[5]!.id,album:{themeId:r.id,title:r.album,description:r.subtitle,stamp:'KÜÇÜK KEŞİFLER'}})),
];
export const EXPEDITIONS:readonly Expedition[]=LEGACY_EXPEDITIONS.map(world=>{const route=ORIGINAL_ROUTES.find(r=>r.legacyThemeId===world.id);return route?{...world,title:route.title,subtitle:'Altı bölüm, altı yeni konu.',themeId:route.themeId,chapterIds:route.chapters.slice(0,5).map(c=>c.id),bonusId:route.chapters[5]!.id,album:{themeId:world.id,title:route.title+' Albümü',description:'Altı bölümden hatıralar.',stamp:'YOLCULUK HATIRASI'}}:world;});
export const expeditionTheme=(world:Expedition)=>world.themeId??world.id;
export const expeditionBonusId=(world:Expedition)=>world.bonusId??JOURNEY_BONUSES.find(j=>j.themeId===world.id)!.id;
export const expeditionForChapter=(id?:string)=>EXPEDITIONS.find(w=>w.chapterIds.includes(replacementChapterId(id??''))||expeditionBonusId(w)===replacementChapterId(id??''));
export interface ExpeditionState {
 expedition:Expedition;chapters:Journey[];bonus:Journey;done:number;pieces:number;earned:boolean[];
 unlocked:boolean;bonusUnlocked:boolean;complete:boolean;remaining:number;previousTitle:string|null;
 next:Journey|null;nextPiece:string|null;album:typeof ALBUMS[number];
}
/** Rewards are derived from validated, permanent solo saves, never from repeatable claims or a clock. */
export function discoveryState(progress:Pick<Progress,'saves'>):ExpeditionState[]{
 const states:ExpeditionState[]=[];
 for(const expedition of EXPEDITIONS){
  const chapters=expedition.chapterIds.map(id=>journeyById(id)!),bonus=journeyById(expeditionBonusId(expedition))!;
  const earned=chapters.map(j=>chapterCredit(progress,j.id)?.complete===true);
  const done=earned.filter(Boolean).length,previous=states.at(-1);
  // Returning players retain access to any route they already started in the old open catalogue.
  const started=[...chapters,bonus].some(j=>{const save=chapterCredit(progress,j.id);return save?.complete||!!save?.strokes.length||(save?.elapsed??0)>0||(save?.hints??0)>0;});
  const unlocked=!previous||(previous.unlocked&&previous.done>=DISCOVERY_GATE)||started;
  const bonusUnlocked=unlocked&&done===chapters.length,bonusDone=chapterCredit(progress,bonus.id)?.complete===true;
  earned.push(bonusDone);
  const next=unlocked?(chapters.find((_,i)=>!earned[i])??(bonusUnlocked&&!bonusDone?bonus:null)):null;
  states.push({expedition,chapters,bonus,done,pieces:earned.filter(Boolean).length,earned,unlocked,bonusUnlocked,complete:earned.every(Boolean),remaining:previous?Math.max(0,DISCOVERY_GATE-previous.done):0,previousTitle:previous?.expedition.title??null,next,nextPiece:next?expedition.pieces[[...chapters,bonus].findIndex(j=>j.id===next.id)]!:null,album:expedition.album??ALBUMS.find(a=>a.themeId===expedition.id)!});
 }
 return states;
}
export function recommendedExpedition(progress:Pick<Progress,'saves'>):ExpeditionState{
 const states=discoveryState(progress);
 return states.find(s=>s.unlocked&&s.next)??states[0]!;
}
export interface DiscoveryReward {id:string;kind:'piece'|'world'|'bonus'|'album';title:string;description:string;themeId:string}
export function discoveryRewards(before:Pick<Progress,'saves'>,after:Pick<Progress,'saves'>):DiscoveryReward[]{
 const previous=discoveryState(before),current=discoveryState(after),rewards:DiscoveryReward[]=[];
 for(let i=0;i<current.length;i++){
  const old=previous[i]!,now=current[i]!;
  now.earned.forEach((earned,k)=>{if(earned&&!old.earned[k])rewards.push({id:`piece:${now.expedition.id}:${k}`,kind:'piece',title:now.expedition.pieces[k]!,description:`${now.album.title} · ${now.pieces}/6 parça`,themeId:expeditionTheme(now.expedition)});});
  if(now.unlocked&&!old.unlocked)rewards.push({id:'world:'+now.expedition.id,kind:'world',title:now.expedition.title,description:'Keşif haritanda yeni bir durak açıldı.',themeId:expeditionTheme(now.expedition)});
  if(now.bonusUnlocked&&!old.bonusUnlocked)rewards.push({id:'bonus:'+now.bonus.id,kind:'bonus',title:now.bonus.title,description:'Beş durağı tamamladın. Bonus bölüm açıldı.',themeId:expeditionTheme(now.expedition)});
  if(now.complete&&!old.complete)rewards.push({id:'album:'+now.expedition.id,kind:'album',title:now.album.title,description:'Altı parçalık sahnen tamamlandı. Hatıran hep senin.',themeId:expeditionTheme(now.expedition)});
 }
 return rewards;
}
/** A replay may improve a result, but never replaces an already better discovery. */
export function keepBestSave(current:SavedLevel|undefined,incoming:SavedLevel):SavedLevel{
 return current?.complete&&(!incoming.complete||current.stars>incoming.stars||(current.stars===incoming.stars&&current.elapsed<incoming.elapsed))?current:incoming;
}

/** Continue in the current world first, then the first unlocked unfinished one. */
export function nextJourneyAfter(progress:Pick<Progress,'saves'>,journeyId:string):Journey|null{
 const states=discoveryState(progress),current=states.find(s=>s.chapters.some(j=>j.id===journeyId)||s.bonus.id===journeyId);
 if(current?.next)return current.next;
 return states.find(s=>s.unlocked&&s.next)?.next??null;
}
