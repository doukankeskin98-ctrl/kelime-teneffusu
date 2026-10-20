import {accountStore,currentPrincipal,requireSameOrigin,authJson,authFailure} from '@/lib/auth/server';
import {IdentityError} from '@/lib/auth/verify';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 try{
  requireSameOrigin(request);const principal=await currentPrincipal(request);
  if(!principal)throw new IdentityError('Önce giriş yap.');
  const body=await request.text();if(body.length>2048)throw new IdentityError('İstek çok büyük.',413);
  let data:Record<string,unknown>;try{data=JSON.parse(body);}catch{throw new IdentityError('İstek okunamadı.',400);}
  if(!data||typeof data!=='object'||Array.isArray(data))throw new IdentityError('İstek okunamadı.',400);
  const legacy=await getChatGPTUser();
  return authJson(await accountStore().claim(principal,data['username'],legacy));
 }catch(error){return authFailure(error);}
}
