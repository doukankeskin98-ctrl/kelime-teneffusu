import {PROGRESS_KEY} from '../game/progress.ts';
import {saveKey} from '../studio/chapter-cache.ts';
import {dailyIntentKey} from '../game/daily-pending.ts';
export const ERASURE_KEY='kt-account-erasure-v1';
export interface PendingErasure {owner:string;receipt:string;erased:boolean}
export function readErasure(storage:Pick<Storage,'getItem'>):PendingErasure|null{try{const v=JSON.parse(storage.getItem(ERASURE_KEY)??'null');return v&&typeof v.owner==='string'&&v.owner.length<=256&&/^[a-f0-9]{64}$/.test(v.receipt)&&typeof v.erased==='boolean'?v:null;}catch{return null;}}
export function clearErasedProgress(owner:string,local:Pick<Storage,'getItem'|'removeItem'>,session:Pick<Storage,'getItem'|'removeItem'>){
 local.removeItem(PROGRESS_KEY+':'+owner);local.removeItem(saveKey(owner));
 if(local.getItem(PROGRESS_KEY+':last-user')===owner)local.removeItem(PROGRESS_KEY+':last-user');
 session.removeItem(dailyIntentKey(owner));
 if(session.getItem('kt-upgrade-owner')===owner){session.removeItem('kt-upgrade-owner');session.removeItem('kt-upgrade-progress');}
}
