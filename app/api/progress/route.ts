import {env} from 'cloudflare:workers';
import {gameMember,authJson,boundedJson,requireSameOrigin} from '@/lib/auth/server';
import {CloudProgress} from '@/lib/game/cloud';
import {GameError} from '@/lib/game/server';
import {IdentityError} from '@/lib/auth/verify';
import {rateLimit} from '@/lib/game/security';
import {recordOperationalFault} from '@/lib/studio/health';
export const dynamic='force-dynamic';
async function context(request:Request){if(!env.DB)throw new GameError('İlerleme bağlantısı kurulamadı.',503);const member=await gameMember(request);if(!member)throw new GameError('Önce giriş yap.',401);return {store:new CloudProgress(env.DB),userId:member.userId};}
export async function GET(request:Request){try{const {store,userId}=await context(request),query=new URL(request.url).searchParams;if(query.has('expectedOwnerId')&&query.get('expectedOwnerId')!==userId)return ownerChanged();return authJson(await store.read(userId));}catch(e){return failure(e);}}
export async function PUT(request:Request){try{requireSameOrigin(request);const {store,userId}=await context(request);await rateLimit(env.DB!,'progress:'+userId,30);const data=await boundedJson(request,150000);if('expectedOwnerId' in data&&data['expectedOwnerId']!==userId)return ownerChanged();return authJson(await store.save(userId,data['progress']));}catch(e){return failure(e);}}
async function failure(e:unknown){const known=e instanceof GameError||e instanceof IdentityError,status=known?e.status:503;if(status>=500)await recordOperationalFault(env.DB,'progress');return authJson({error:known?e.message:'İlerlemen şu an eşitlenemedi.'},status);}

function ownerChanged(){return authJson({error:'Hesap değişti. Bu oturumun bulut eşitlemesi durduruldu.',code:'PROGRESS_OWNER_CHANGED'},409);}
