import type {Progress,SavedLevel} from './progress.ts';
import {PROGRESS_MAX_BYTES} from './progress-limits.ts';

/** In-memory rules stay v2. v3 is only a lossless storage/transport envelope. */
export class ProgressFormatError extends Error {}
export const progressBytes=(raw:string)=>new TextEncoder().encode(raw).length;
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const fail=():never=>{throw new ProgressFormatError('İlerleme biçimi desteklenmiyor veya kayıt bozuk.');};
const packSave=(s:SavedLevel)=>[s.strokes.map(t=>[t.id,...t.a,...t.b]),s.elapsed,s.hints,s.complete?1:0,s.stars,s.revision??1];
function unpackSave(value:unknown){
 if(!Array.isArray(value)||value.length!==6)return fail();
 const [paths,elapsed,hints,complete,stars,revision]=value;
 if(!Array.isArray(paths)||paths.length>30||!Number.isInteger(elapsed)||elapsed<0||elapsed>604800||!Number.isInteger(hints)||hints<0||hints>3||![0,1].includes(complete)||!Number.isInteger(stars)||stars<0||stars>3||![1,2].includes(revision))return fail();
 const strokes=paths.map(path=>{if(!Array.isArray(path)||path.length!==5||typeof path[0]!=='string'||path[0].length>64||path.slice(1).some(n=>!Number.isInteger(n)||n<0||n>31))return fail();return {id:path[0],a:[path[1],path[2]],b:[path[3],path[4]]};});
 return {strokes,elapsed,hints,complete:complete===1,stars,...(revision===2?{revision:2 as const}:{})};
}
export function parseProgressEnvelope(raw:string):Record<string,unknown>{
 if(progressBytes(raw)>PROGRESS_MAX_BYTES)return fail();
 let data:unknown;try{data=JSON.parse(raw);}catch{return fail();}
 if(!object(data)||![2,3].includes(data['v'] as number)||!object(data['saves']))return fail();
 if(Object.keys(data['saves']).length>1024)return fail();
 if(data['v']===2)return data;
 const saves=Object.fromEntries(Object.entries(data['saves']).map(([key,value])=>[key,unpackSave(value)]));
 let revisionSaves:Record<string,unknown>|undefined;
 if(data['revisionSaves']!==undefined){
  if(!object(data['revisionSaves'])||Object.keys(data['revisionSaves']).length>312)return fail();
  revisionSaves=Object.fromEntries(Object.entries(data['revisionSaves']).map(([key,versions])=>{
   if(!object(versions)||Object.keys(versions).some(v=>!['1','2'].includes(v)))return fail();
   return [key,Object.fromEntries(Object.entries(versions).map(([version,save])=>[version,unpackSave(save)]))];
  }));
 }
 return {...data,v:2,saves,...(revisionSaves?{revisionSaves}:{})};
}
export function encodeProgress(progress:Progress,format:2|3=3):string{
 const data=format===2?progress:{...progress,v:3,saves:Object.fromEntries(Object.entries(progress.saves).map(([key,save])=>[key,packSave(save)])),
  ...(progress.revisionSaves?{revisionSaves:Object.fromEntries(Object.entries(progress.revisionSaves).map(([key,versions])=>[key,Object.fromEntries(Object.entries(versions).map(([revision,save])=>[revision,packSave(save)]))]))}:{})};
 const raw=JSON.stringify(data);if(progressBytes(raw)>PROGRESS_MAX_BYTES)throw new ProgressFormatError('Kayıt kapasitesi aşıldı; mevcut kayıt korunuyor.');return raw;
}
/** Key order is irrelevant; every value, including alternate accepted paths, matters. */
export function sameProgress(a:unknown,b:unknown):boolean{
 if(a===b)return true;
 if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((value,i)=>sameProgress(value,b[i]));
 if(!object(a)||!object(b))return false;
 const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&sameProgress(a[key],b[key]));
}
