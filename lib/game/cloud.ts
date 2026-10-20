import {emptyProgress,loadProgress,mergeProgress,type Progress} from './progress.ts';
import {GameError,type Database} from './server.ts';
export class CloudProgress {
 constructor(private db:Database,private clock:()=>number=Date.now){}
 async read(userId:string){const row=await this.db.prepare('SELECT data,revision FROM campaign_saves WHERE user_id=?').bind(userId).first<{data:string;revision:number}>();return {progress:row?loadProgress(row.data):emptyProgress(),revision:row?.revision??0};}
 async save(userId:string,raw:unknown){
  const incoming=loadProgress(JSON.stringify(raw));
  for(let attempt=0;attempt<6;attempt++){
   const row=await this.db.prepare('SELECT data,revision FROM campaign_saves WHERE user_id=?').bind(userId).first<{data:string;revision:number}>();
   const progress=mergeProgress(row?loadProgress(row.data):emptyProgress(),incoming),data=JSON.stringify(progress);
   const result=row?await this.db.prepare('UPDATE campaign_saves SET data=?,revision=revision+1,updated=? WHERE user_id=? AND revision=?').bind(data,this.clock(),userId,row.revision).run():await this.db.prepare('INSERT OR IGNORE INTO campaign_saves(user_id,data,revision,updated) VALUES(?,?,1,?)').bind(userId,data,this.clock()).run();
   if(result.meta.changes)return {progress,revision:(row?.revision??0)+1};
  }
  throw new GameError('İlerlemen başka bir cihazda güncelleniyor. Birazdan yeniden deneyeceğiz.',409);
 }
}
