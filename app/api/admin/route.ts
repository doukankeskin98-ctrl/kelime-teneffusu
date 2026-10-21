import {env} from 'cloudflare:workers';
import {authJson,boundedJson,requireSameOrigin} from '@/lib/auth/server';
import {IdentityError} from '@/lib/auth/verify';
import {StudioError} from '@/lib/studio/content';
import {GameError} from '@/lib/game/server';
import {AdminStore,nativeAdminIdentity} from '@/lib/studio/store';
import {recordOperationalFault} from '@/lib/studio/health';
import {digest,rateLimit} from '@/lib/game/security';
import manifest from '@/package.json';
export const dynamic='force-dynamic';
function store(){if(!env.DB)throw new StudioError('Yönetim bağlantısı kurulamadı.',503);return new AdminStore(env.DB,{hash:env.ADMIN_SETUP_HASH,expiresAt:env.ADMIN_SETUP_EXPIRES_AT});}
export async function GET(request:Request){try{
 const service=store(),userId=nativeAdminIdentity(request),url=new URL(request.url),action=url.searchParams.get('action')??'overview';
 if(action==='session')return authJson(await service.session(userId,request.headers.get('oai-authenticated-user-email')??''));
 await service.authorize(userId);await rateLimit(env.DB!,'admin-read:'+userId,90);
 if(action==='overview')return authJson({...await service.overview(userId),system:{version:manifest.version,emailConfigured:!!(env.FIREBASE_PROJECT_ID&&env.FIREBASE_WEB_API_KEY&&env.FIREBASE_APP_ID&&env.FIREBASE_AUTH_DOMAIN)}});
 if(action==='chapters')return authJson(await service.chapters(userId,url.searchParams.get('status')??'all',url.searchParams.get('q')??'',Number(url.searchParams.get('offset')??0)));
 if(action==='chapter')return authJson(await service.chapter(userId,url.searchParams.get('id')));
 if(action==='metrics')return authJson(await service.metrics(userId,Number(url.searchParams.get('days')??7)));
 if(action==='faults')return authJson(await service.faults(userId));
 if(action==='audit')return authJson(await service.audit(userId));
 throw new StudioError('Bu yönetim işlemi bulunamadı.',404);
 }catch(e){return failure(e);}}
export async function POST(request:Request){try{
 requireSameOrigin(request);const service=store(),userId=nativeAdminIdentity(request),data=await boundedJson(request,8192);
 if(data['action']==='claim'){
  if(!userId)throw new StudioError('Önce ChatGPT hesabınla giriş yap.',401);
  await rateLimit(env.DB!,'admin-setup:'+userId,5,Date.now(),600000);await rateLimit(env.DB!,'admin-setup-ip:'+await digest(request.headers.get('cf-connecting-ip')??'shared'),20,Date.now(),600000);
  return authJson(await service.claim(userId,data['token']));
 }
 await service.authorize(userId);await rateLimit(env.DB!,'admin-write:'+userId,35);
 if(data['action']==='preview')return authJson(await service.preview(userId,data['spec']));
 if(data['action']==='save')return authJson(await service.saveDraft(userId,data['spec'],data['id'],data['revision'],data['creationId']));
 if(data['action']==='publish'||data['action']==='archive'||data['action']==='restore')return authJson(await service.transition(userId,data['id'],data['action'],data['revision'],data['confirmation']));
 if(data['action']==='reviewFault')return authJson(await service.reviewFault(userId,data['day'],data['area'],data['code']));
 throw new StudioError('Bu yönetim işlemi bulunamadı.');
 }catch(e){return failure(e);}}
async function failure(e:unknown){const known=e instanceof StudioError||e instanceof IdentityError||e instanceof GameError,status=known?e.status:503;if(status>=500)await recordOperationalFault(env.DB,'admin');return authJson({error:known?e.message:'Yönetim işlemi tamamlanamadı. Yeniden dene.'},status);}
