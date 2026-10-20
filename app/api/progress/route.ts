import {env} from 'cloudflare:workers';
import {gameMember,authJson,boundedJson,requireSameOrigin} from '@/lib/auth/server';
import {CloudProgress} from '@/lib/game/cloud';
import {GameError} from '@/lib/game/server';
import {IdentityError} from '@/lib/auth/verify';
import {rateLimit} from '@/lib/game/security';
export const dynamic='force-dynamic';
async function context(request:Request){if(!env.DB)throw new GameError('İlerleme bağlantısı kurulamadı.',503);const member=await gameMember(request);if(!member)throw new GameError('Önce giriş yap.',401);return {store:new CloudProgress(env.DB),userId:member.userId};}
export async function GET(request:Request){try{const {store,userId}=await context(request);return authJson(await store.read(userId));}catch(e){return failure(e);}}
export async function PUT(request:Request){try{requireSameOrigin(request);const {store,userId}=await context(request);await rateLimit(env.DB!,'progress:'+userId,30);const data=await boundedJson(request,150000);return authJson(await store.save(userId,data['progress']));}catch(e){return failure(e);}}
function failure(e:unknown){return authJson({error:e instanceof GameError||e instanceof IdentityError?e.message:'İlerlemen şu an eşitlenemedi.'},e instanceof GameError||e instanceof IdentityError?e.status:503);}
