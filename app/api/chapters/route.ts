import {env} from 'cloudflare:workers';
import {authJson,boundedJson,gameMember,requireSameOrigin} from '@/lib/auth/server';
import {IdentityError} from '@/lib/auth/verify';
import {rateLimit} from '@/lib/game/security';
import {StudioError} from '@/lib/studio/content';
import {GameError} from '@/lib/game/server';
import {ChapterStore} from '@/lib/studio/store';
import {recordOperationalFault} from '@/lib/studio/health';
import {THEMES} from '@/lib/game/catalog';
import {releaseCatalogue} from '@/lib/studio/releases';
export const dynamic='force-dynamic';
function store(){if(!env.DB)throw new StudioError('Yeni keşiflere şu an ulaşılamıyor.',503);return new ChapterStore(env.DB);}
export async function GET(request:Request){try{
 const service=store(),url=new URL(request.url),id=url.searchParams.get('id');
 if(url.searchParams.get('collection')==='releases'&&!id&&!url.searchParams.has('action')){const theme=url.searchParams.get('theme')??undefined;if(theme&&!THEMES.some(t=>t.id===theme))throw new StudioError('Bu dünya bulunamadı.',400);return authJson(releaseCatalogue(Number(url.searchParams.get('offset')??0),Date.now(),theme));}
 if(url.searchParams.get('action')==='progress'){const member=await gameMember(request);if(!member)throw new StudioError('İlerlemeni eşitlemek için giriş yap.',401);return authJson(await service.progress(member.userId,id));}
 if(url.searchParams.get('action')==='card-progress'){const member=await gameMember(request);if(!member)throw new StudioError('İlerlemeni görmek için giriş yap.',401);await rateLimit(env.DB!,'chapter-cards:'+member.userId,60);return authJson(await service.cardProgress(member.userId,url.searchParams.get('ids')?.split(',')??[]));}
 return authJson(id?await service.playable(id):await service.catalogue(Number(url.searchParams.get('offset')??0)));
 }catch(e){return failure(e);}}
export async function PUT(request:Request){try{
 requireSameOrigin(request);const service=store(),member=await gameMember(request);if(!member)throw new StudioError('İlerlemeni eşitlemek için giriş yap.',401);
 await rateLimit(env.DB!,'chapter-save:'+member.userId,40);const data=await boundedJson(request,12000);
 if('expectedOwnerId' in data&&data['expectedOwnerId']!==member.userId)throw new StudioError('Hesap değişti. Kayıt bu cihazda korunuyor.',409);
 return authJson(await service.saveProgress(member.userId,data['id'],data['save']));
 }catch(e){return failure(e);}}
async function failure(e:unknown){const known=e instanceof StudioError||e instanceof IdentityError||e instanceof GameError,status=known?e.status:503;if(status>=500)await recordOperationalFault(env.DB,'chapters');return authJson({error:known?e.message:'Bu keşfe şu an ulaşılamıyor. Yeniden dene.'},status);}
