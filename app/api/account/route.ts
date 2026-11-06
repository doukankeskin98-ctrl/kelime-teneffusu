import {env} from 'cloudflare:workers';
import {guestMember,guestToken,sessionCookie} from '@/lib/auth/guest';
import {digest,rateLimit} from '@/lib/game/security';
import {accountStore,currentPrincipal,requireSameOrigin,authJson,authFailure,boundedJson} from '@/lib/auth/server';
import {IdentityError} from '@/lib/auth/verify';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 try{
  requireSameOrigin(request);const principal=await currentPrincipal(request);
  if(!principal)throw new IdentityError('Önce giriş yap.');
  const data=await boundedJson(request);
  const legacy=await getChatGPTUser();
  if(!env.DB)throw new IdentityError('Oyun sunucusuna ulaşılamıyor.',503);
  await rateLimit(env.DB,'account:'+principal.providerId,20);
  const token=guestToken(request),guest=data['attachGuest']===true?await guestMember(env.DB,request):null;
  if(data['attachGuest']===true&&!guest&&!await accountStore().find(principal))throw new IdentityError('Misafir oturumu bulunamadı. Kayıtlarını bağlamadan yeni profil açılmadı; misafir olarak oynadığın cihazdan tekrar dene.',409);
  const account=await accountStore().claim(principal,data['username'],legacy,guest&&token?{userId:guest.userId,tokenHash:await digest(token),now:Date.now()}:undefined);
  const response=authJson(account);if(guest)response.headers.set('Set-Cookie',sessionCookie('',0));return response;
 }catch(error){return authFailure(error);}
}
