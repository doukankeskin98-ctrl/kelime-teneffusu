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
  return authJson(await accountStore().claim(principal,data['username'],legacy));
 }catch(error){return authFailure(error);}
}
