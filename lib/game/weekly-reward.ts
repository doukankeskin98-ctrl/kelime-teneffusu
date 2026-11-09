import {istanbulDay} from './engine.ts';
import {MAIN_JOURNEY_IDS} from './main-journey.ts';
import {replacementChapterId} from './original-content.ts';

export const WEEKLY_TARGET=5;
export interface WeeklyProgress {weeks:Record<string,string[]>;earned:string[]}
const FIRST_WEEK='2026-11-09';
function calendarDay(value:unknown):value is string {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const n=Date.parse(value+'T12:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value;
}
/** Fixed Istanbul day, Monday week: travelling cannot change the calendar. */
export function weeklyKey(day=istanbulDay()):string|null {
 if(!calendarDay(day))return null;
 const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
 const key=date.toISOString().slice(0,10);return key>=FIRST_WEEK&&key<'2100-01-01'?key:null;
}
const validWeek=(key:unknown):key is string=>typeof key==='string'&&weeklyKey(key)===key;
/** Bounded unfinished detail; dated keepsakes are never consumed. Cosmetic only. */
export function cleanWeekly(raw:unknown):WeeklyProgress|undefined {
 if(!raw||typeof raw!=='object')return;
 const data=raw as Partial<WeeklyProgress>,earned=new Set(Array.isArray(data.earned)?data.earned.filter(validWeek):[]),weeks:Record<string,string[]>={};
 if(data.weeks&&typeof data.weeks==='object'&&!Array.isArray(data.weeks))for(const [key,values] of Object.entries(data.weeks)){
  if(!validWeek(key)||!Array.isArray(values))continue;
  const ids=[...new Set(values.filter((v):v is string=>typeof v==='string').map(replacementChapterId).filter(id=>MAIN_JOURNEY_IDS.includes(id)))].sort().slice(0,WEEKLY_TARGET);
  if(ids.length>=WEEKLY_TARGET)earned.add(key);else if(ids.length)weeks[key]=ids;
 }
 const pending=Object.fromEntries(Object.keys(weeks).filter(key=>!earned.has(key)).sort().slice(-8).map(key=>[key,weeks[key]!]));
 if(!earned.size&&!Object.keys(pending).length)return;
 return {weeks:pending,earned:[...earned].sort()};
}
export function mergeWeekly(a:WeeklyProgress|undefined,b:WeeklyProgress|undefined):WeeklyProgress|undefined {
 const weeks:Record<string,string[]>={};
 for(const data of [a,b])for(const [week,ids] of Object.entries(data?.weeks??{}))weeks[week]=[...(weeks[week]??[]),...ids];
 return cleanWeekly({weeks,earned:[...(a?.earned??[]),...(b?.earned??[])]});
}
/** Only the actual final-word acceptance calls this, never restored saves. */
export function recordWeeklyCompletion(current:WeeklyProgress|undefined,chapterId:string,day=istanbulDay()):WeeklyProgress|undefined {
 const id=replacementChapterId(chapterId),week=weeklyKey(day);
 if(!week||!MAIN_JOURNEY_IDS.includes(id)||current?.earned.includes(week))return current;
 const latest=[...Object.keys(current?.weeks??{}),...(current?.earned??[])].sort().at(-1);
 if((latest&&week<latest)||current?.weeks[week]?.includes(id))return current;
 return mergeWeekly(current,{weeks:{[week]:[id]},earned:[]});
}
export function weeklyStatus(data:WeeklyProgress|undefined,day=istanbulDay()){
 const week=weeklyKey(day),earned=!!week&&!!data?.earned.includes(week);
 return {week,earned,count:earned?WEEKLY_TARGET:week?data?.weeks[week]?.length??0:0,total:data?.earned.length??0};
}
export function weeklyDateLabel(week:string){
 return new Date(week+'T12:00:00Z').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Istanbul'});
}
