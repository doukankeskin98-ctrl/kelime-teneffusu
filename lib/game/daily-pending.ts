import {match} from './engine.ts';
import {DailyPersistenceError,type DailyIntent,type DailyPersistence} from './daily-action.ts';
import type {DailyView} from './server.ts';
type StorageLike=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
type StorageSource=()=>StorageLike;
interface PendingDaily {v:1;owner:string;id:string;day:string;signature:string;intent:DailyIntent}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const failure=()=>new DailyPersistenceError('Bu sekmedeki bekleyen işlem kaydı güvenle okunamadı veya yazılamadı. Yeni bir hamle göndermeden yeniden dene.');
export const dailyIntentKey=(owner:string)=>'kt-daily-pending-v1:'+encodeURIComponent(owner);
export const dailyBoardSignature=(board:DailyView['board'])=>JSON.stringify([board.size,board.grid,board.targets]);
function access<T>(fn:()=>T):T{try{return fn();}catch(e){throw e instanceof DailyPersistenceError?e:failure();}}
/** Per owner, in this browser tab only. A missing/corrupt store is never a new intent. */
export function readDailyPending(source:StorageSource,owner:string):PendingDaily|null{return access(()=>{
 if(!owner||owner.length>256)throw failure();
 const raw=source().getItem(dailyIntentKey(owner));if(raw===null)return null;if(raw.length>12000)throw failure();
 const p=JSON.parse(raw),i=p?.intent,cell=(c:unknown)=>Array.isArray(c)&&c.length===2&&c.every(n=>Number.isInteger(n)&&n>=0&&n<16);
 if(!p||p.v!==1||p.owner!==owner||typeof p.id!=='string'||!uuid.test(p.id)||typeof p.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.day)||!Number.isFinite(Date.parse(p.day))||new Date(p.day).toISOString().slice(0,10)!==p.day||typeof p.signature!=='string'||p.signature.length>10000||!i||!(i.kind==='hint'&&typeof i.requestId==='string'&&uuid.test(i.requestId)||i.kind==='claim'&&i.stroke&&typeof i.stroke.id==='string'&&i.stroke.id.length>0&&i.stroke.id.length<=100&&cell(i.stroke.a)&&cell(i.stroke.b)&&typeof i.label==='string'&&i.label.length>0&&i.label.length<=100))throw failure();
 return {v:1,owner,id:p.id,day:p.day,signature:p.signature,intent:i.kind==='hint'?{kind:'hint',requestId:i.requestId}:{kind:'claim',stroke:{id:i.stroke.id,a:i.stroke.a,b:i.stroke.b},label:i.label}};
});}
export function dailyIntentStore(source:StorageSource,owner:string,daily:Pick<DailyView,'id'|'day'|'board'>):DailyPersistence{
 const signature=dailyBoardSignature(daily.board),key=dailyIntentKey(owner),same=(a:DailyIntent,b:DailyIntent)=>JSON.stringify(a)===JSON.stringify(b);
 const read=()=>{const p=readDailyPending(source,owner);if(!p)return null;if(p.id!==daily.id||p.day!==daily.day||p.signature!==signature)throw failure();if(p.intent.kind==='claim'){const target=match(daily.board,p.intent.stroke.a,p.intent.stroke.b);if(!target||target.id!==p.intent.stroke.id||target.label!==p.intent.label)throw failure();}return p.intent;};
 return {
  read:()=>access(read),
  save:intent=>access(()=>{const existing=read();if(existing){if(!same(existing,intent))throw failure();return;}const raw=JSON.stringify({v:1,owner,id:daily.id,day:daily.day,signature,intent});const storage=source();storage.setItem(key,raw);if(storage.getItem(key)!==raw)throw failure();}),
  clear:intent=>access(()=>{const current=read();if(!current)return;if(!same(current,intent))throw failure();const storage=source();storage.removeItem(key);if(storage.getItem(key)!==null)throw failure();})
 };
}
