import {playableJourney} from './journey-revisions.ts';
import {discoveryState,DISCOVERY_GATE} from './discovery.ts';
import type {Progress} from './progress.ts';

/** Presentation only: never writes progress or invents an award for a standard level. */
export function journeyGoal(progress:Pick<Progress,'saves'>,journeyId?:string){
 if(!journeyId)return null;
 const states=discoveryState(progress),index=states.findIndex(s=>s.chapters.some(j=>j.id===journeyId)||s.bonus.id===journeyId);
 if(index<0)return null;
 const state=states[index]!,chapters=[...state.chapters,state.bonus],position=chapters.findIndex(j=>j.id===journeyId),chapter=playableJourney(journeyId,progress)??chapters[position]!,nextWorld=states[index+1];
 const milestone=!state.unlocked?{label:`${state.previousTitle}: ${state.remaining} bölüm daha`,value:DISCOVERY_GATE-state.remaining,total:DISCOVERY_GATE}
  :nextWorld&&!nextWorld.unlocked?{label:`${nextWorld.expedition.title} için ${Math.max(0,DISCOVERY_GATE-state.done)} durak daha`,value:Math.min(DISCOVERY_GATE,state.done),total:DISCOVERY_GATE}
  :!state.bonusUnlocked?{label:`Albümün son bölümüne ${state.chapters.length-state.done} bölüm kaldı`,value:state.done,total:state.chapters.length}
  :!state.complete?{label:'Son bölüm açık · Albümünü tamamla',value:state.pieces,total:6}
  :{label:'Altı parça da albümünde',value:6,total:6};
 return {state,chapter,piece:state.expedition.pieces[position]!,position,earned:state.earned[position]!,milestone};
}

export function masteryCopy(hints:number){
 const stars=3-Math.min(2,Math.max(0,hints));
 return {stars,label:stars===3?'İpuçsuz keşif':stars===2?'Bir ipucuyla keşif':'Keşfi tamamladın',rule:'0 ipucu: 3 yıldız · 1 ipucu: 2 yıldız · 2–3 ipucu: 1 yıldız. Süre yıldızı etkilemez.'};
}
