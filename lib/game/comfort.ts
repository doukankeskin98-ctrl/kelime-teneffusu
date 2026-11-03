export const COMFORT_KEY='kt-comfort-v1';
export interface Comfort {leftHanded:boolean;reduceMotion:boolean}
export const DEFAULT_COMFORT:Comfort={leftHanded:false,reduceMotion:false};
export function parseComfort(raw:string|null):Comfort{
 try{const value=JSON.parse(raw??'null');return {leftHanded:value?.leftHanded===true,reduceMotion:value?.reduceMotion===true};}
 catch{return {...DEFAULT_COMFORT};}
}
