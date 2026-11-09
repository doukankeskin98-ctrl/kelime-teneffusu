import {PROGRESS_REQUEST_MAX_BYTES} from '../game/progress-limits.ts';
import {GAME_ORIGIN,type ApiTransport} from './runtime.ts';
export interface NativeRequest {url:string;method:string;headers:Record<string,string>;data?:unknown;connectTimeout:number;readTimeout:number;responseType:'json';disableRedirects:boolean}
export interface NativeResponse {status:number;data:unknown;headers:Record<string,string>;url:string}
/** Native requests have no browser Origin. Bind them to our existing same-origin contract.
 * Cookies stay in the OS HTTP cookie store, never in JS/localStorage/exported backups.
 * Cancellation retires the result; a dispatched mutation may already have committed. */
export function nativeApiTransport(request:(options:NativeRequest)=>Promise<NativeResponse>):ApiTransport {
 return (path,init)=>new Promise((resolve,reject)=>{
  if(!/^\/api\/[a-z][a-z0-9/-]*(?:\?[^#]*)?$/.test(path)||path.includes('..')||path.includes('\\')||path.startsWith('/api/live')){reject(new Error('Desteklenmeyen istek.'));return;}
  const signal=init.signal;
  if(signal?.aborted){reject(new DOMException('İstek iptal edildi.','AbortError'));return;}
  const headers:Record<string,string>={Accept:'application/json',Origin:GAME_ORIGIN};
  new Headers(init.headers).forEach((value,key)=>{if(['authorization','content-type'].includes(key.toLowerCase()))headers[key]=value;});
  let data:unknown;
  try{if(init.body!=null){if(typeof init.body!=='string'||new TextEncoder().encode(init.body).length>(path==='/api/progress'?PROGRESS_REQUEST_MAX_BYTES:160000))throw new Error();data=JSON.parse(init.body);}}catch{reject(new Error('İstek okunamadı.'));return;}
  const method=(init.method??'GET').toUpperCase();
  if(!['GET','POST','PUT','DELETE'].includes(method)){reject(new Error('Desteklenmeyen işlem.'));return;}
  let settled=false;
  const finish=(fn:()=>void)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);fn();};
  const cancel=()=>finish(()=>reject(new DOMException('İstek iptal edildi.','AbortError')));
  const timer=setTimeout(()=>finish(()=>reject(new Error('Bağlantı zaman aşımına uğradı. Yeniden deneyebilirsin.'))),10000);
  signal?.addEventListener('abort',cancel,{once:true});
  if(signal?.aborted){cancel();return;}
  void Promise.resolve().then(()=>{
   if(settled)return null;
   return request({url:GAME_ORIGIN+path,method,headers,...(data===undefined?{}:{data}),connectTimeout:8000,readTimeout:8000,responseType:'json',disableRedirects:true});
  }).then(value=>{
   if(!value||settled)return;
   if(new URL(value.url).origin!==GAME_ORIGIN||!Number.isInteger(value.status)||value.status<200||value.status>599||value.status>=300&&value.status<400)throw new Error('Sunucu yanıtı doğrulanamadı.');
   // Do not expose native cookie or infrastructure headers to the game document.
   // Construct before settling: malformed payloads must still reach reject.
   const response=new Response(value.status===204||value.status===205?null:JSON.stringify(value.data),{status:value.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
   finish(()=>resolve(response));
  }).catch(error=>finish(()=>reject(error)));
 });
}
