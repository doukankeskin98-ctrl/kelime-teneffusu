import {memberFetch} from '@/lib/auth/firebase-client';
import {DailyRequestError,type DailyIntent,type DailyReply} from '@/lib/game/daily-action';
/** Check reads an existing attempt by id, including after the calendar day changes. */
export async function requestDaily(id:string,owner:string,intent:DailyIntent|null,signal:AbortSignal):Promise<DailyReply>{
 const response=intent?await memberFetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify({action:intent.kind==='claim'?'dailyClaim':'dailyHint',id,expectedOwnerId:owner,...(intent.kind==='claim'?{a:intent.stroke.a,b:intent.stroke.b}:{requestId:intent.requestId})})}):await memberFetch('/api/game?action=dailyState&id='+encodeURIComponent(id)+'&expectedOwnerId='+encodeURIComponent(owner),{signal,cache:'no-store'});
 const body:unknown=await response.json();
 const error=body&&typeof body==='object'?body as Record<string,unknown>:{};
 if(!response.ok)throw new DailyRequestError(typeof error['error']==='string'?error['error']:'Günlük kaydına ulaşılamadı.',response.status,typeof error['code']==='string'?error['code']:undefined);
 return body as DailyReply;
}
