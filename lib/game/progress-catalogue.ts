import type {Progress,SavedLevel} from './progress.ts';
import {MAIN_JOURNEY_ORDER} from './main-journey.ts';
import {LEGACY_REVISION_TWO_IDS} from './authored-journey.ts';
const firstPilotIds=new Set([...MAIN_JOURNEY_ORDER.slice(0,18),...LEGACY_REVISION_TWO_IDS]);
export function needsFullCatalogue(progress:Progress){
 const unsupported=(key:string,save:SavedLevel)=>save.revision===3||save.revision===2&&!firstPilotIds.has(key.slice(6));
 return Object.entries(progress.saves).some(([key,save])=>unsupported(key,save))||Object.entries(progress.revisionSaves??{}).some(([key,versions])=>Object.values(versions).some(save=>unsupported(key,save)));
}
