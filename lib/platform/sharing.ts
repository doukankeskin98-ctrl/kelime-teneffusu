import {publicGameOrigin} from './runtime.ts';

export type InviteKind='oda'|'arkadas'|'meydan';
export type ShareResult='shared'|'copied'|'cancelled'|'failed'|'busy';
export interface NativeSharing {share(data:{title:string;url:string}):Promise<{status:Exclude<ShareResult,'busy'>}>}
let native:NativeSharing|null=null;
let sharing=false;
export function setNativeSharing(driver:NativeSharing|null){native=driver;}

/** Build only the invitation itself. Never copy auth or other current-page parameters. */
export function inviteLink(kind:InviteKind,code:string):string {
 const normalized=code.toUpperCase();
 if(!(kind==='oda'?/^[A-HJ-NP-Z2-9]{8}$/:/^[A-HJ-NP-Z2-9]{10}$/).test(normalized))return '';
 const url=new URL('/',publicGameOrigin());
 url.searchParams.set(kind,normalized);
 return url.href;
}

/** One share sheet at a time; cancelling never falls through to a clipboard write. */
export async function shareLink(title:string,url:string):Promise<ShareResult>{
 if(sharing)return 'busy';
 if(!url)return 'failed';
 sharing=true;
 try{
  if(native){const result=await native.share({title,url});return result.status;}
  if(typeof navigator==='undefined')return 'failed';
  if(navigator.share){
   try{await navigator.share({title,text:title,url});return 'shared';}
   catch(error){if(error&&typeof error==='object'&&'name' in error&&error.name==='AbortError')return 'cancelled';}
  }
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);return 'copied';}
  return 'failed';
 }catch{return 'failed';}
 finally{sharing=false;}
}

export function shareMessage(result:ShareResult):string {
 return result==='shared'?'Davet paylaşıldı.':result==='copied'?'Davet bağlantısı kopyalandı.':result==='failed'?'Paylaşım açılamadı. Davet kodunu kullanabilirsin.':'';
}
export const shareSucceeded=(result:ShareResult)=>result==='shared'||result==='copied';
