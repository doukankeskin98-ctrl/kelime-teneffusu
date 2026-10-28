import { env } from 'cloudflare:workers';
import {accountStore,boundedJson,currentPrincipal,gameMember} from '@/lib/auth/server';
import {rateLimit} from '@/lib/game/security';
import {IdentityError} from '@/lib/auth/verify';
import { GameService, GameError } from '@/lib/game/server';
import {recordOperationalFault} from '@/lib/studio/health';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function service(){if(!env.DB)throw new GameError('Oyun sunucusu hazırlanıyor. Birazdan yeniden dene.',503);return new GameService(env.DB);}
export async function GET(request:Request){try{
 const url=new URL(request.url),action=url.searchParams.get('action');
 const game=await service();if(action==='rankings')return json(await game.rankings());
 if(action==='dailyState'){
  const member=await gameMember(request);if(!member)throw new GameError('Devam etmek için giriş yap.',401);
  if(url.searchParams.get('expectedOwnerId')!==member.userId)return json({error:'Günlük oyunun hesabı değişti.',code:'DAILY_OWNER_CHANGED'},409);
  await rateLimit(env.DB!,'game:'+member.userId,180);
  return json(await game.dailyState(member.userId,url.searchParams.get('id')??''));
 }
 const principal=await currentPrincipal(request);
 if(principal&&!principal.verified)return json({authenticated:false,needsVerification:true});
 if(principal&&!await accountStore().find(principal))return json({authenticated:false,needsUsername:true});
 const member=await gameMember(request);if(!member)return json({authenticated:false});
 if(action==='room')return json(await game.state(member.userId,url.searchParams.get('id')??undefined));
 return json({authenticated:true,nativeSession:!!request.headers.get('oai-authenticated-user-id'),kind:member.kind,username:member.username,email:member.email,profile:await game.profile(member.userId),stats:await game.stats(member.userId),rating:await game.rating(member.userId)});
}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const origin=request.headers.get('origin');if(origin!==new URL(request.url).origin)throw new GameError('İstek kaynağı doğrulanamadı.',403);
 const user=await gameMember(request);if(!user)throw new GameError('Devam etmek için giriş yap.',401);
 const data=await boundedJson(request,4096),game=await service(),id=typeof data['id']==='string'?data['id']:'';
 if((data['action']==='daily'||data['action']==='dailyClaim'||data['action']==='dailyHint')&&Object.hasOwn(data,'expectedOwnerId')&&data['expectedOwnerId']!==user.userId)return json({error:'Günlük oyunun hesabı değişti.',code:'DAILY_OWNER_CHANGED'},409);
 await rateLimit(env.DB!,'game:'+user.userId,180);
 switch(data['action']){
  case 'rename':return json(await game.rename(user.userId,data['name']));
  case 'enter':return json(await game.enter(user.userId,data['kind']==='friend'?'friend':'quick',typeof data['code']==='string'?data['code']:undefined));
  case 'ready':return json(await game.ready(user.userId,id));
  case 'claim':return json(await game.claim(user.userId,id,data['a'],data['b']));
  case 'leave':return json(await game.leave(user.userId,id));
  case 'rematch':return json(await game.rematch(user.userId,id));
  case 'daily':return json(await game.daily(user.userId));
  case 'dailyClaim':return json(await game.dailyClaim(user.userId,id,data['a'],data['b']));
  case 'dailyHint':return json(await game.dailyClaim(user.userId,id,null,null,true,data['requestId']));
  default:throw new GameError('Bilinmeyen işlem.');
 }
}catch(e){return failure(e);}}
async function failure(e:unknown){if(e instanceof GameError||e instanceof IdentityError){if(e.status>=500)await recordOperationalFault(env.DB,'game');return json({error:e.message},e.status);}if(e instanceof SyntaxError)return json({error:'İstek okunamadı.'},400);await recordOperationalFault(env.DB,'game');return json({error:'Bağlantı kurulamadı. Tekrar dene.'},503);}
