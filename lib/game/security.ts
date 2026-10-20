import {GameError,type Database} from './server.ts';
export async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return [...crypto.getRandomValues(new Uint8Array(10))].map(x=>chars[x%32]).join('');}
export async function rateLimit(db:Database,key:string,limit:number,now=Date.now(),interval=60000){
 const window=Math.floor(now/interval)*Math.ceil(interval/60000);
 const rows=await db.batch([
  db.prepare('INSERT INTO rate_limits(key,window,count) VALUES(?,?,1) ON CONFLICT(key,window) DO UPDATE SET count=count+1').bind(key,window),
 ]);
 if(!rows[0])throw new GameError('İşlem tamamlanamadı.',503);
 const value=await db.prepare('SELECT count FROM rate_limits WHERE key=? AND window=?').bind(key,window).first<{count:number}>();
 if((value?.count??limit+1)>limit)throw new GameError('Biraz hızlı gittik. Kısa bir mola verip tekrar dene.',429);
 // Bounded cleanup keeps anonymous rate-limit storage finite without a scheduled worker.
 if((now%31)===0)await db.prepare('DELETE FROM rate_limits WHERE rowid IN (SELECT rowid FROM rate_limits WHERE window<? LIMIT 100)').bind(Math.floor(now/60000)-1440).run();
}
