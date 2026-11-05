/** The web build has no native dependencies. Mobile registers these before React mounts. */
export const GAME_ORIGIN='https://kelime-teneffusu.healica.chatgpt.site';
export type ApiTransport=(path:string,init:RequestInit)=>Promise<Response>;
let transport:ApiTransport|null=null;
let active=true;
export const isNativeGame=()=>transport!==null;
export const gameIsActive=()=>active;
export function setNativeTransport(next:ApiTransport|null){transport=next;}
export function setGameActive(next:boolean){active=next;}
export function appFetch(path:string,init:RequestInit={}):Promise<Response>{
 if(!/^\/api\/[a-z][a-z0-9/-]*(?:\?[^#]*)?$/.test(path)||path.includes('..')||path.includes('\\'))return Promise.reject(new Error('Geçersiz istek adresi.'));
 return transport?transport(path,init):fetch(path,init);
}
export const publicGameOrigin=()=>isNativeGame()||typeof location==='undefined'?GAME_ORIGIN:location.origin;
