import {emptyProgress,readProgress,mergeProgress,type Progress} from './progress.ts';
import {encodeProgress,progressBytes,sameProgress,ProgressFormatError} from './progress-codec.ts';
import {COMPACT_PROGRESS_WRITES} from './progress-rollout.ts';
import {GameError,type Database} from './server.ts';
import {PROGRESS_MAX_BYTES} from './progress-limits.ts';
export class ProgressUpgradeRequired extends GameError {constructor(){super('İlerlemen korunuyor. Devam etmek için oyunu güncelle.',409);}}
const needsModern=(p:Progress)=>Object.keys(p.revisionSaves??{}).length>0||Object.values(p.saves).some(s=>s.revision===2);
export class CloudProgress {
 constructor(private db:Database,private clock:()=>number=Date.now,private maximumBytes=PROGRESS_MAX_BYTES,private compactWrites=COMPACT_PROGRESS_WRITES){}
 private fits(data:string){return progressBytes(data)<=Math.min(this.maximumBytes,PROGRESS_MAX_BYTES);}
 private stored(data:string):Progress {
  if(!this.fits(data))throw new GameError('Bulut kaydın korunuyor ancak şu an açılamıyor. Lütfen destek bölümünden bildir.',503);
  try{return readProgress(data);}catch{throw new GameError('Bulut kaydın okunamadı. Kaydın değiştirilmedi; lütfen destek bölümünden bildir.',503);}
 }
 private legacyGuard(progress:Progress,format:2|3){if(format===2&&(needsModern(progress)||progressBytes(JSON.stringify(progress))>PROGRESS_MAX_BYTES))throw new ProgressUpgradeRequired();}
 async read(userId:string,format:2|3=2){
  const row=await this.db.prepare('SELECT data,revision FROM campaign_saves WHERE user_id=?').bind(userId).first<{data:string;revision:number}>();
  const progress=row?this.stored(row.data):emptyProgress();this.legacyGuard(progress,format);return {progress,revision:row?.revision??0};
 }
 async save(userId:string,raw:unknown,format:2|3=2){
  const serialized=JSON.stringify(raw)??'null';
  if(!this.fits(serialized))throw new GameError('Kayıt eşitleme sınırına ulaşıldı. Mevcut bulut kaydın değiştirilmedi.',413);
  let incoming:Progress;try{incoming=readProgress(serialized);}catch{throw new GameError('Kayıt biçimi doğrulanamadı. Mevcut kayıt değiştirilmedi.',400);}
  this.legacyGuard(incoming,format);
  for(let attempt=0;attempt<6;attempt++){
   const row=await this.db.prepare('SELECT data,revision FROM campaign_saves WHERE user_id=?').bind(userId).first<{data:string;revision:number}>();
   const previous=row?this.stored(row.data):emptyProgress();this.legacyGuard(previous,format);
   const progress=mergeProgress(previous,incoming),useCompact=this.compactWrites||!!row&&JSON.parse(row.data).v===3;
   let compact:string,data:string;
   try{compact=encodeProgress(progress);if(!sameProgress(readProgress(compact),progress))throw new ProgressFormatError('lossy');data=useCompact?compact:encodeProgress(progress,2);}catch{throw new GameError('Kayıt dönüşümü doğrulanamadı veya kapasite doldu. Mevcut kayıt korunuyor.',413);}
   if(!this.fits(data))throw new GameError('Kayıtlar birleştirilirken eşitleme sınırına ulaşıldı. Mevcut bulut kaydın değiştirilmedi.',413);
   const revision=(row?.revision??0)+1,now=this.clock();
   const main=row?this.db.prepare('UPDATE campaign_saves SET data=?,revision=revision+1,updated=? WHERE user_id=? AND revision=?').bind(data,now,userId,row.revision):this.db.prepare('INSERT OR IGNORE INTO campaign_saves(user_id,data,revision,updated) VALUES(?,?,1,?)').bind(userId,data,now);
   // Both writes are transactional; a lost CAS cannot publish a trusted shadow.
   const shadow=this.db.prepare('INSERT INTO campaign_save_migrations(user_id,source_revision,source_data,compact_data,backup_data,backup_revision,updated) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM campaign_saves WHERE user_id=? AND revision=? AND data=?) ON CONFLICT(user_id) DO UPDATE SET source_revision=excluded.source_revision,source_data=excluded.source_data,compact_data=excluded.compact_data,backup_data=COALESCE(campaign_save_migrations.backup_data,excluded.backup_data),backup_revision=COALESCE(campaign_save_migrations.backup_revision,excluded.backup_revision),updated=excluded.updated WHERE excluded.source_revision>=campaign_save_migrations.source_revision').bind(userId,revision,data,compact,useCompact&&row&&JSON.parse(row.data).v===2?row.data:null,useCompact&&row&&JSON.parse(row.data).v===2?row.revision:null,now,userId,revision,data);
   const result=await this.db.batch([main,shadow]);if(result[0]?.meta.changes)return {progress,revision};
  }
  throw new GameError('İlerlemen başka bir cihazda güncelleniyor. Birazdan yeniden deneyeceğiz.',409);
 }
}
