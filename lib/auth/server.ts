import {env} from 'cloudflare:workers';
import {verifyMemberToken,IdentityError,type Principal} from './verify.ts';
import {Accounts} from './accounts.ts';
export function authConfig(){
 if(!env.FIREBASE_PROJECT_ID||!env.FIREBASE_WEB_API_KEY||!env.FIREBASE_APP_ID||!env.FIREBASE_AUTH_DOMAIN)throw new IdentityError('Üyelik servisi henüz hazır değil.',503);
 return {projectId:env.FIREBASE_PROJECT_ID,apiKey:env.FIREBASE_WEB_API_KEY,authDomain:env.FIREBASE_AUTH_DOMAIN,appId:env.FIREBASE_APP_ID};
}
export async function currentPrincipal(request:Request):Promise<Principal|null>{
 const header=request.headers.get('authorization');if(!header)return null;
 const token=/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(header)?.[1];
 if(!token||token.length>16384)throw new IdentityError('Oturumun doğrulanamadı.');
 return verifyMemberToken(token,authConfig());
}
export function accountStore(){if(!env.DB)throw new IdentityError('Oyun sunucusuna ulaşılamıyor.',503);return new Accounts(env.DB);}
export async function gameMember(request:Request){
 const principal=await currentPrincipal(request);if(!principal)return null;
 const account=await accountStore().find(principal);
 if(!account)throw new IdentityError('Önce kullanıcı adını seç.',409);
 return {userId:account.game_user_id,email:principal.email,username:account.username};
}
export const authJson=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function authFailure(error:unknown){return error instanceof IdentityError?authJson({error:error.message},error.status):authJson({error:'İşlem tamamlanamadı. Tekrar dene.'},503);}
export function requireSameOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)throw new IdentityError('İstek kaynağı doğrulanamadı.',403);}
