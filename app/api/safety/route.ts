import {env} from 'cloudflare:workers';
import {authJson,authFailure,boundedJson,gameMember,requireSameOrigin} from '@/lib/auth/server';
import {GameError} from '@/lib/game/server';
import {SafetyService} from '@/lib/game/safety-service';
import {rateLimit} from '@/lib/game/security';
import {safetyFailure} from '@/lib/game/player-safety';
export const dynamic='force-dynamic';
async function context(request:Request){if(!env.DB)throw new GameError('Sunucuya ulaşılamıyor.',503);const member=await gameMember(request);if(!member)throw new GameError('Önce oyuncu profilini aç.',401);return {member,service:new SafetyService(env.DB)};}
function failure(e:unknown){const message=safetyFailure(e);return message?authJson({error:message},409):e instanceof GameError?authJson({error:e.message},e.status):authFailure(e);}
export async function GET(request:Request){try{const {member,service}=await context(request);return authJson(await service.blocks(member.userId));}catch(e){return failure(e);}}
export async function POST(request:Request){try{requireSameOrigin(request);const {member,service}=await context(request),data=await boundedJson(request);await rateLimit(env.DB!,'safety:'+member.userId,30,Date.now(),3600000);
 switch(data['action']){case 'report':return authJson(await service.report(member.userId,data['target'],data['reason']));case 'block':return authJson(await service.block(member.userId,data['target']));case 'unblock':return authJson(await service.unblock(member.userId,data['target']));default:throw new GameError('İşlem bulunamadı.');}
 }catch(e){return failure(e);}}
