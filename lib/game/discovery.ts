import {ALBUMS,JOURNEYS,JOURNEY_BONUSES,type Journey} from './content.ts';
import type {Progress,SavedLevel} from './progress.ts';

export const DISCOVERY_GATE=3;
export interface Expedition {
 id:string;title:string;subtitle:string;place:string;pieces:readonly string[];accent:string;
}
export const EXPEDITIONS:readonly Expedition[]=[
 {id:'uzay',title:'Yıldız İskelesi',subtitle:'Pencerenden başlayan kocaman bir yolculuk.',place:'01',pieces:['İlk yıldız','Gezegen halkası','Keşif roketi','Galaksi izi','Uzak ufuk','Gözlemevinin ışığı'],accent:'#9aa8cb'},
 {id:'turkiye',title:'Anadolu Patikası',subtitle:'Bir sokak, bir manzara, bir yeni hikâye.',place:'02',pieces:['Yol bileti','Şehir ışığı','Dağ esintisi','Tarihin izi','Yol defteri','Son kartpostal'],accent:'#ccaa79'},
 {id:'hababam',title:'Teneffüs Bahçesi',subtitle:'Tanıdık bir sınıfta yeni hatıralar.',place:'03',pieces:['İlk zil','Arka sıranın notu','Sınıfın neşesi','Yoklama defteri','Son ders','Yıllık fotoğrafı'],accent:'#8eaf91'},
];
export interface ExpeditionState {
 expedition:Expedition;chapters:Journey[];bonus:Journey;done:number;pieces:number;earned:boolean[];
 unlocked:boolean;bonusUnlocked:boolean;complete:boolean;remaining:number;previousTitle:string|null;
 next:Journey|null;nextPiece:string|null;album:typeof ALBUMS[number];
}
/** Rewards are derived from validated, permanent solo saves, never from repeatable claims or a clock. */
export function discoveryState(progress:Pick<Progress,'saves'>):ExpeditionState[]{
 const states:ExpeditionState[]=[];
 for(const expedition of EXPEDITIONS){
  const chapters=JOURNEYS.filter(j=>j.themeId===expedition.id),bonus=JOURNEY_BONUSES.find(j=>j.themeId===expedition.id)!;
  const earned=chapters.map(j=>progress.saves['route:'+j.id]?.complete===true);
  const done=earned.filter(Boolean).length,previous=states.at(-1);
  // Returning players retain access to any route they already started in the old open catalogue.
  const started=[...chapters,bonus].some(j=>{const save=progress.saves['route:'+j.id];return save?.complete||!!save?.strokes.length;});
  const unlocked=!previous||(previous.unlocked&&previous.done>=DISCOVERY_GATE)||started;
  const bonusUnlocked=unlocked&&done===chapters.length,bonusDone=progress.saves['route:'+bonus.id]?.complete===true;
  earned.push(bonusDone);
  const next=unlocked?(chapters.find((_,i)=>!earned[i])??(bonusUnlocked&&!bonusDone?bonus:null)):null;
  states.push({expedition,chapters,bonus,done,pieces:earned.filter(Boolean).length,earned,unlocked,bonusUnlocked,complete:earned.every(Boolean),remaining:previous?Math.max(0,DISCOVERY_GATE-previous.done):0,previousTitle:previous?.expedition.title??null,next,nextPiece:next?expedition.pieces[[...chapters,bonus].findIndex(j=>j.id===next.id)]!:null,album:ALBUMS.find(a=>a.themeId===expedition.id)!});
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
  now.earned.forEach((earned,k)=>{if(earned&&!old.earned[k])rewards.push({id:`piece:${now.expedition.id}:${k}`,kind:'piece',title:now.expedition.pieces[k]!,description:`${now.album.title} · ${now.pieces}/6 parça`,themeId:now.expedition.id});});
  if(now.unlocked&&!old.unlocked)rewards.push({id:'world:'+now.expedition.id,kind:'world',title:now.expedition.title,description:'Keşif haritanda yeni bir durak açıldı.',themeId:now.expedition.id});
  if(now.bonusUnlocked&&!old.bonusUnlocked)rewards.push({id:'bonus:'+now.bonus.id,kind:'bonus',title:now.bonus.title,description:'Beş durağı tamamladın. Bonus bölüm açıldı.',themeId:now.expedition.id});
  if(now.complete&&!old.complete)rewards.push({id:'album:'+now.expedition.id,kind:'album',title:now.album.title,description:'Altı parçalık sahnen tamamlandı. Hatıran hep senin.',themeId:now.expedition.id});
 }
 return rewards;
}
/** A replay may improve a result, but never replaces an already better discovery. */
export function keepBestSave(current:SavedLevel|undefined,incoming:SavedLevel):SavedLevel{
 return current?.complete&&(!incoming.complete||current.stars>incoming.stars||(current.stars===incoming.stars&&current.elapsed<incoming.elapsed))?current:incoming;
}
