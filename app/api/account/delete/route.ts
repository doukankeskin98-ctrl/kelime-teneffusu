import {env} from 'cloudflare:workers';
import {authConfig,authFailure,authJson,boundedJson,gameMember,requireSameOrigin} from '@/lib/auth/server';
import {deleteProviderAccount,IdentityError,verifyRecentMemberToken} from '@/lib/auth/verify';
import {ErasureService} from '@/lib/auth/erasure';
import {sessionCookie} from '@/lib/auth/guest';
import {GameError} from '@/lib/game/server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 requireSameOrigin(request);if(!env.DB)throw new IdentityError('Sunucuya ulaşılamıyor.',503);
 const data=await boundedJson(request),secret=typeof data['receipt']==='string'?data['receipt']:'',service=new ErasureService(env.DB);
 let receipt=await service.receipt(secret);
 const token=request.headers.get('authorization')?.replace(/^Bearer /i,'')??'';
 if(!receipt){
  const member=await gameMember(request);if(!member)throw new IdentityError('Önce silmek istediğin profile giriş yap.');
  if(data['expectedOwner']!==member.userId||data['confirm']!=='DELETE')throw new IdentityError('Profil değişti. Silme onayını yeniden kontrol et.',409);
  const linked=await env.DB.prepare('SELECT provider_id FROM accounts WHERE game_user_id=?').bind(member.userId).first<{provider_id:string}>();
  if(linked&&!token)return authJson({error:'Bu profile bağlı e-posta hesabını doğrulayarak silme işlemine devam et.',requiresEmail:true},401);
  const principal=linked?await verifyRecentMemberToken(token,authConfig()):null;
  if(linked&&principal?.providerId!==linked.provider_id)throw new IdentityError('Bağlı olan e-posta hesabını doğrula.',403);
  receipt=await service.erase(member.userId,linked?.provider_id??null,secret);
 }
 if(receipt.provider_id&&!receipt.provider_done){
  try{await deleteProviderAccount(token,authConfig(),receipt.provider_id);await service.finish(secret);}catch(e){return authJson({erased:true,complete:false,error:e instanceof IdentityError?e.message:'Oyun verilerin silindi. Hesap kapanışını tekrar dene.'},202);}
 }
 const response=authJson({erased:true,complete:true});response.headers.set('Set-Cookie',sessionCookie('',0));return response;
 }catch(e){return e instanceof GameError?authJson({error:e.message},e.status):authFailure(e);}}
