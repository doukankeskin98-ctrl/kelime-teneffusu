import {journeyById,type Journey} from './content.ts';
import {CONTENT_REVISION_TWO} from './progress-rollout.ts';
import type {Progress,SavedLevel} from './progress.ts';

/** Pilot catalogue, never substituted for released revision 1. These are not live
 * until the full route/editorial and physical-device acceptance is recorded. */
export const JOURNEY_REVISION_TWO:Record<string,Pick<Journey,'title'|'words'|'size'>>={
 'ufuk-gok-1':{title:'Yıldızın yapısı',words:['HİDROJEN','HELYUM','ÇEKİRDEK','KATMAN','IŞIN'],size:8},
 'ufuk-gok-2':{title:'Yıldız ışığı',words:['TAYF','FOTON','DALGA','RENK','PARLAK'],size:8},
 'ufuk-gok-3':{title:'Uzaklık ölçümü',words:['PARALAKS','AÇI','ÖLÇÜM','MESAFE','KONUM','HESAP'],size:9},
 'ufuk-gok-4':{title:'Yıldızın ömrü',words:['BULUT','ÇÖKÜŞ','FÜZYON','DEV','CÜCE','KALINTI'],size:9},
};
export function journeyRevision(id:string,revision:number=1):Journey|undefined{
 const legacy=journeyById(id);if(revision===1)return legacy;
 const next=JOURNEY_REVISION_TWO[id];return legacy&&revision===2&&next?{...legacy,...next,subtitle:'Gökyüzü Defteri',difficulty:'Dengeli',note:'',clues:undefined,revision:2}:undefined;
}
export const savedRevision=(save:SavedLevel|undefined)=>save?.revision??1;
export function revisionSave(progress:Pick<Progress,'saves'|'revisionSaves'>,key:string,revision:number){
 const primary=progress.saves[key];return primary&&savedRevision(primary)===revision?primary:progress.revisionSaves?.[key]?.[revision];
}
/** A run captures this once. A later cloud response cannot replace its board. */
export function playableJourney(id:string,progress:Pick<Progress,'saves'>,enableRevisionTwo=CONTENT_REVISION_TWO){
 const saved=progress.saves['route:'+id];
 return journeyRevision(id,saved?savedRevision(saved):enableRevisionTwo&&JOURNEY_REVISION_TWO[id]?2:1);
}
export const journeyPresentationKey=(journey:Journey)=>'route:'+journey.id+(journey.revision===2?'@2':'');
