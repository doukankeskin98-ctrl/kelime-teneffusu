import {env} from 'cloudflare:workers';
import {authJson,boundedJson,gameMember,requireSameOrigin} from '@/lib/auth/server';
import {IdentityError} from '@/lib/auth/verify';
import {GameError} from '@/lib/game/server';
import {SocialService} from '@/lib/game/social';
import {rateLimit} from '@/lib/game/security';
export const dynamic='force-dynamic';
function service(){if(!env.DB)throw new GameError('Oyun bağlantısı kurulamadı.',503);return new SocialService(env.DB);}
export async function GET(request:Request){try{
 const url=new URL(request.url),game=service(),code=url.searchParams.get('code')?.toUpperCase()??'',action=url.searchParams.get('action');
 if(action==='preview')return authJson(await game.preview(code));
 if(action==='invitation'){const {nickname}=await game.invitation(code);return authJson({nickname});}
 const member=await gameMember(request);if(!member)throw new GameError('Bir oyuncu profiliyle devam et.',401);
 if(action==='challenge')return authJson(await game.state(member.userId,code));
 return authJson(await game.overview(member.userId));
 }catch(e){return failure(e);}}
export async function POST(request:Request){try{
 requireSameOrigin(request);const game=service(),member=await gameMember(request);if(!member)throw new GameError('Bir oyuncu profiliyle devam et.',401);
 await rateLimit(env.DB!,'social:'+member.userId,100);
 const data=await boundedJson(request,4096),code=typeof data['code']==='string'?data['code'].toUpperCase():'';
 switch(data['action']){
  case 'create':return authJson(await game.create(member.userId,data['themeId']));
  case 'start':return authJson(await game.start(member.userId,code));
  case 'claim':return authJson(await game.claim(member.userId,code,data['a'],data['b']));
  case 'invite':return authJson(await game.invite(member.userId));
  case 'accept':return authJson(await game.accept(member.userId,code));
  case 'remove':return authJson(await game.remove(member.userId,typeof data['friendId']==='string'?data['friendId']:''));
  default:throw new GameError('Bu işlem bulunamadı.');
 }
 }catch(e){return failure(e);}}
function failure(e:unknown){return authJson({error:e instanceof GameError||e instanceof IdentityError?e.message:'Bağlantı kurulamadı. Tekrar dene.'},e instanceof GameError||e instanceof IdentityError?e.status:503);}
