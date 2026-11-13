import {emptyProgress,loadProgress,mergeProgress,type Progress} from './progress.ts';
import {GameError,type Database} from './server.ts';
import {PROGRESS_MAX_BYTES} from './progress-limits.ts';
export class CloudProgress {
 // A tighter budget supports boundary tests; callers can never raise the production ceiling.
 constructor(private db:Database,private clock:()=>number=Date.now,private maximumBytes=PROGRESS_MAX_BYTES){}
 private fits(data:string){return new TextEncoder().encode(data).length<=Math.min(this.maximumBytes,PROGRESS_MAX_BYTES);}
 private stored(data:string):Progress {
  if(!this.fits(data))throw new GameError('Bulut kaydın korunuyor ancak şu an açılamıyor. Lütfen destek bölümünden bildir.',503);
  try{const parsed=JSON.parse(data);if(!parsed||parsed.v!==2)throw new Error('invalid');}catch{throw new GameError('Bulut kaydın okunamadı. Kaydın değiştirilmedi; lütfen destek bölümünden bildir.',503);}
  return loadProgress(data);
 }
 async read(userId:string){const row=await this.db.prepare('SELECT data,revision FROM campaign_saves WHERE user_id=?').bind(userId).first<{data:string;revision:number}>();return {progress:row?this.stored(row.data):emptyProgress(),revision:row?.revision??0};}
 async save(userId:string,raw:unknown){
  const serialized=JSON.stringify(raw)??'null';
  if(!this.fits(serialized))throw new GameError('Kayıt eşitleme sınırına ulaşıldı. Mevcut bulut kaydın değiştirilmedi.',413);
  const incoming=loadProgress(serialized);
  for(let attempt=0;attempt<6;attempt++){
   const row=await this.db.prepare('SELECT data,revision FROM campaign_saves WHERE user_id=?').bind(userId).first<{data:string;revision:number}>();
   const progress=mergeProgress(row?this.stored(row.data):emptyProgress(),incoming),data=JSON.stringify(progress);
   if(!this.fits(data))throw new GameError('Kayıtlar birleştirilirken eşitleme sınırına ulaşıldı. Mevcut bulut kaydın değiştirilmedi.',413);
   const result=row?await this.db.prepare('UPDATE campaign_saves SET data=?,revision=revision+1,updated=? WHERE user_id=? AND revision=?').bind(data,this.clock(),userId,row.revision).run():await this.db.prepare('INSERT OR IGNORE INTO campaign_saves(user_id,data,revision,updated) VALUES(?,?,1,?)').bind(userId,data,this.clock()).run();
   if(result.meta.changes)return {progress,revision:(row?.revision??0)+1};
  }
  throw new GameError('İlerlemen başka bir cihazda güncelleniyor. Birazdan yeniden deneyeceğiz.',409);
 }
}
