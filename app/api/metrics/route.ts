import {env} from 'cloudflare:workers';
import {authJson,boundedJson,requireSameOrigin} from '@/lib/auth/server';
import {digest,rateLimit} from '@/lib/game/security';
import {istanbulDay} from '@/lib/game/engine';
const EVENTS=new Set(['story_start','story_step','story_complete','first_word','level_start','level_complete','selection_miss','challenge_start','challenge_complete','invite_share','arena_start','arena_complete','auth_complete','input_feedback','frame_sample','client_error','app_open','cohort_start','retention_day1','retention_day7']);
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 requireSameOrigin(request);if(!env.DB)return authJson({},503);
 const ip=request.headers.get('cf-connecting-ip')??'shared';await rateLimit(env.DB,'metrics:'+await digest(ip),60);
 const data=await boundedJson(request,300);if(typeof data['event']!=='string'||!EVENTS.has(data['event'])||typeof data['bucket']!=='string'||!['count','under17','under34','under50','under100','under250','under1000','over1000','under15s','under30s','under60s','over60s','under120s','over120s'].includes(data['bucket']))return authJson({},400);
 await env.DB.prepare('INSERT INTO metrics(day,event,bucket,count) VALUES(?,?,?,1) ON CONFLICT(day,event,bucket) DO UPDATE SET count=count+1').bind(istanbulDay(),data['event'],data['bucket']).run();return authJson({ok:true});
 }catch{return authJson({},400);}}
