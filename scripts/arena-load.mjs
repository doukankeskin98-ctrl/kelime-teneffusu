/** Local ONLY. No remote URL option, no production credentials, no persistence.
 * Open-loop scheduled reads: overload is counted, never hidden by a client queue.
 * This measures one Mac + local workerd/D1, NOT Cloudflare production capacity. */
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {makePuzzle} from '../lib/game/engine.ts';

const require=createRequire(import.meta.url);
const {Miniflare,Log,LogLevel}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler/package.json')]}));
const args=process.argv.slice(2),conditional=args.includes('--conditional');
const diagnostic=args.includes('--diagnostic');
const output=args.find(a=>a.startsWith('--out='))?.slice(6);
if(!output||args.some(a=>!a.startsWith('--out=')&&a!=='--conditional'&&a!=='--diagnostic'))throw Error('Usage: node scripts/arena-load.mjs [--conditional] [--diagnostic] --out=/absolute/report.json');
const root=path.resolve('dist/server');
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(p.endsWith('.js'))out.push(p);}return out;}
const modules=(await files(root)).sort((a,b)=>Number(b===path.join(root,'index.js'))-Number(a===path.join(root,'index.js'))).map(p=>({type:'ESModule',path:p}));
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'isolated-arena-load'},assets:{directory:path.resolve('dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},log:new Log(LogLevel.ERROR)});
const total=diagnostic?2000:10000,limit=64,seconds=diagnostic?30:20,board=makePuzzle('uzay',2,1234);
const uid=i=>'load-'+i,rid=i=>'00000000-0000-4000-8000-'+String(Math.floor(i/2)).padStart(12,'0');
const token=i=>createHash('sha256').update('local-only-arena-load:'+i).digest('hex');
const sessions=Array.from({length:total},(_,i)=>({id:rid(i),cookie:'__Host-kt-player='+token(i),revision:1,busy:false}));
const report={time:new Date().toISOString(),mode:conditional?'conditional':'legacy',environment:'ephemeral local Miniflare/workerd + D1 on same Mac as generator',syntheticSessions:total,maxInFlight:limit,stages:[],limitations:['Not a production capacity certification','Same synthetic board in distinct two-player rooms; generation/matchmaking tested separately','Active fixture has extended deadline to isolate steady reads','No actual user save or real account accessed']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const quantile=(a,p)=>a.length?a[Math.min(a.length-1,Math.floor(a.length*p))]:null;
try{
 const db=await mf.getD1Database('DB');
 for(const f of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile('drizzle/'+f,'utf8')).split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
 let pending=[];const flush=async()=>{if(pending.length){await db.batch(pending);pending=[];}};
 const now=Date.now();
 for(let i=0;i<total;i++){
  if(i%2===0){
   const players=[i,i+1].map(n=>({id:uid(n),name:'Test '+n,ready:true,strokes:[],score:0,seen:now,lastFind:0,rematch:false}));
   const room={id:rid(i),code:'TEST'+i,kind:'friend',phase:'active',themeId:board.themeId,level:2,seed:1234,starts:now-5000,ends:now+1800000,winner:null,reason:'',players,round:2,mode:'group',protocol:2,roundPolicy:'words',roundKind:'words',puzzle:board};
   pending.push(db.prepare('INSERT INTO rooms(id,code,kind,phase,data,revision,expires,updated) VALUES(?,?,?,?,?,1,?,?)').bind(room.id,room.code,room.kind,room.phase,JSON.stringify(room),now+3600000,now));
  }
  pending.push(db.prepare('INSERT INTO players(id,nickname,created) VALUES(?,?,?)').bind(uid(i),'Test '+i,now));
  pending.push(db.prepare('INSERT INTO members(room_id,user_id,active) VALUES(?,?,1)').bind(rid(i),uid(i)));
  pending.push(db.prepare('INSERT INTO game_sessions(token_hash,user_id,created,expires) VALUES(?,?,?,?)').bind(createHash('sha256').update(token(i)).digest('hex'),uid(i),now,now+3600000));
  pending.push(db.prepare('INSERT INTO results(room_id,user_id,nickname,score,win,created) VALUES(?,?,?,100,0,?)').bind(rid(i)+':1',uid(i),'Test '+i,now-120000));
  if(pending.length>=100)await flush();
 }
 await flush();console.log('Seeded '+total+' isolated sessions / '+total/2+' rooms.');
 // Real cookie authentication, no trusted identity bypass. Warm compilation only.
 const probe=await mf.dispatchFetch('https://arena-load.test/api/game?action=room&id='+sessions[0].id,{headers:{cookie:sessions[0].cookie}});
 if(probe.status!==200)throw Error('Probe failed '+probe.status+': '+await probe.text());
 const first=await probe.json();if(!first?.you?.id)throw Error('Guest authentication failed');
 let inFlight=0;const jobs=new Set();
 for(const users of (diagnostic?[2000]:[100,500,2000,10000])){
  const samples=[],stats={users,seconds,offered:0,started:0,completed:0,errors:0,unscheduled:0,unchanged:0,bytes:0,statuses:{},exceptions:{},maxInFlight:0};
  const begin=performance.now();let cursor=0;
  while(performance.now()-begin<seconds*1000){
   const elapsed=performance.now()-begin,due=Math.min(Math.floor(elapsed*users/1000),users*seconds);
   while(cursor<due){
    const s=sessions[cursor%users];cursor++;stats.offered++;
    if(inFlight>=limit||s.busy){stats.unscheduled++;continue;}
    stats.started++;inFlight++;s.busy=true;stats.maxInFlight=Math.max(stats.maxInFlight,inFlight);const start=performance.now();
    const job=(async()=>{
     try{
      const suffix=conditional?'&after='+s.revision:'';
      const response=await mf.dispatchFetch('https://arena-load.test/api/game?action=room&id='+s.id+suffix,{headers:{cookie:s.cookie},signal:AbortSignal.timeout(10000)});
      const body=await response.text();stats.bytes+=Buffer.byteLength(body);stats.statuses[response.status]=(stats.statuses[response.status]??0)+1;
      if(!response.ok){stats.errors++;return;}
      const value=JSON.parse(body);if(value.id!==s.id||(!value.unchanged&&value.you?.id!==uid(sessions.indexOf(s))))throw Error('Wrong owner/room');
      if(value.unchanged)stats.unchanged++;s.revision=value.revision;stats.completed++;samples.push(performance.now()-start);
     }catch(e){stats.errors++;const key=String(e).slice(0,300);stats.exceptions[key]=(stats.exceptions[key]??0)+1;}finally{inFlight--;s.busy=false;}
    })();jobs.add(job);void job.finally(()=>jobs.delete(job));
   }
   await sleep(10);
  }
  await Promise.allSettled([...jobs]);samples.sort((a,b)=>a-b);
  Object.assign(stats,{elapsedMs:Math.round(performance.now()-begin),completedPerSecond:Math.round(stats.completed/seconds*10)/10,wallCompletedPerSecond:stats.completed/((performance.now()-begin)/1000),expectedOffers:users*seconds,lastTickGap:users*seconds-stats.offered,p50Ms:quantile(samples,.5),p95Ms:quantile(samples,.95),p99Ms:quantile(samples,.99),allOfferedServed:stats.unscheduled===0&&stats.errors===0});report.stages.push(stats);console.log(JSON.stringify(stats));
 }
 // Independent valid claims + exact retry: verify score/strokes are never doubled.
 const placement=board.placements[0],claimTimes=[];let accepted=0;
 for(let offset=0;offset<100;offset+=10)await Promise.all(Array.from({length:10},async(_,n)=>{
  const i=(offset+n)*2,s=sessions[i],body=JSON.stringify({action:'claim',id:s.id,round:2,a:placement.a,b:placement.b});
  const start=performance.now();let score;
  for(let retry=0;retry<2;retry++){
   const response=await mf.dispatchFetch('https://arena-load.test/api/game',{method:'POST',headers:{cookie:s.cookie,Origin:'https://arena-load.test','Content-Type':'application/json'},body});
   const view=await response.json();if(response.status!==200||view.you.strokes.length!==1||retry&&view.you.score!==score)throw Error('Claim invariant failed');score=view.you.score;
  }
  claimTimes.push(performance.now()-start);accepted++;
 }));
 claimTimes.sort((a,b)=>a-b);report.claimRetry={users:accepted,requests:200,concurrency:10,p95PairMs:quantile(claimTimes,.95),noDoubleAward:true};
 report.tables={sessions:(await db.prepare('SELECT COUNT(*) n FROM game_sessions').first()).n,activeMembers:(await db.prepare('SELECT COUNT(*) n FROM members WHERE active=1').first()).n};
 await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log('Report: '+output);
}finally{await mf.dispose();}
