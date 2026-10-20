import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { GameService, GameError } from '@/lib/game/server';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function service(){if(!env.DB)throw new GameError('Oyun sunucusu hazırlanıyor. Birazdan yeniden dene.',503);return new GameService(env.DB);}
export async function GET(request:Request){try{
 const user=await getChatGPTUser(),url=new URL(request.url),action=url.searchParams.get('action');
 const game=await service();if(action==='rankings')return json(await game.rankings());
 if(!user)return json({authenticated:false});
 if(action==='room')return json(await game.state(user.userId,url.searchParams.get('id')??undefined));
 return json({authenticated:true,profile:await game.profile(user.userId),stats:await game.stats(user.userId)});
}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const origin=request.headers.get('origin');if(origin!==new URL(request.url).origin)throw new GameError('İstek kaynağı doğrulanamadı.',403);
 const user=await getChatGPTUser();if(!user)throw new GameError('Canlı oyun için ChatGPT ile giriş yap.',401);
 const raw=await request.text();if(raw.length>4096)throw new GameError('İstek çok büyük.',413);
 const data=JSON.parse(raw) as Record<string,unknown>,game=await service(),id=typeof data['id']==='string'?data['id']:'';
 switch(data['action']){
  case 'rename':return json(await game.rename(user.userId,data['name']));
  case 'enter':return json(await game.enter(user.userId,data['kind']==='friend'?'friend':'quick',typeof data['code']==='string'?data['code']:undefined));
  case 'ready':return json(await game.ready(user.userId,id));
  case 'claim':return json(await game.claim(user.userId,id,data['a'],data['b']));
  case 'leave':return json(await game.leave(user.userId,id));
  case 'rematch':return json(await game.rematch(user.userId,id));
  case 'daily':return json(await game.daily(user.userId));
  case 'dailyClaim':return json(await game.dailyClaim(user.userId,id,data['a'],data['b']));
  case 'dailyHint':return json(await game.dailyClaim(user.userId,id,null,null,true));
  default:throw new GameError('Bilinmeyen işlem.');
 }
}catch(e){return failure(e);}}
function failure(e:unknown){if(e instanceof GameError)return json({error:e.message},e.status);if(e instanceof SyntaxError)return json({error:'İstek okunamadı.'},400);console.error('Game API operation failed',e instanceof Error?e.message:'unknown');return json({error:'Bağlantı kurulamadı. Tekrar dene.'},503);}
