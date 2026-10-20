import {env} from 'cloudflare:workers';
import {authFailure,authJson,boundedJson,requireSameOrigin} from '@/lib/auth/server';
import {createGuest,deleteGuest,guestMember,sessionCookie} from '@/lib/auth/guest';
import {digest,rateLimit} from '@/lib/game/security';
import {GameError} from '@/lib/game/server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 requireSameOrigin(request);if(!env.DB)throw new GameError('Bağlantı kurulamadı.',503);
 const current=await guestMember(env.DB,request);if(current)return authJson({ok:true});
 const ip=request.headers.get('cf-connecting-ip')??request.headers.get('x-real-ip');
 await rateLimit(env.DB,'guest:'+(ip?await digest(ip):'shared'),ip?30:300,Date.now(),600000);
 const data=await boundedJson(request),created=await createGuest(env.DB,data['name']);
 const response=authJson({ok:true});response.headers.set('Set-Cookie',sessionCookie(created.token));return response;
 }catch(e){if(e instanceof GameError)return authJson({error:e.message},e.status);return authFailure(e);}}
export async function DELETE(request:Request){try{requireSameOrigin(request);if(env.DB)await deleteGuest(env.DB,request);const response=authJson({ok:true});response.headers.set('Set-Cookie',sessionCookie('',0));return response;}catch(e){return authFailure(e);}}
