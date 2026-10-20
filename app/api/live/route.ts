import {env} from 'cloudflare:workers';
import {gameMember,authJson} from '@/lib/auth/server';
import {GameService,GameError} from '@/lib/game/server';
import {IdentityError} from '@/lib/auth/verify';
import {rateLimit} from '@/lib/game/security';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 try{
  if(!env.DB)throw new GameError('Bağlantı kurulamadı.',503);
  const member=await gameMember(request);if(!member)throw new GameError('Önce giriş yap.',401);
  await rateLimit(env.DB,'live:'+member.userId,30);
  const id=new URL(request.url).searchParams.get('id')??'';if(!/^[a-f0-9-]{36}$/.test(id))throw new GameError('Oda bulunamadı.',404);
  const game=new GameService(env.DB),initial=await game.state(member.userId,id);if(!initial)throw new GameError('Oda bulunamadı.',404);
  const watchId=initial.id;
  let stopped=false,wake:(()=>void)|undefined;const encoder=new TextEncoder(),start=Date.now();
  const stream=new ReadableStream<Uint8Array>({
   async start(controller){
    const send=(event:string,data:unknown)=>{if(!stopped)controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));};
    const abort=()=>{stopped=true;wake?.();};request.signal.addEventListener('abort',abort,{once:true});
    let revision=-1,lastHeartbeat=Date.now(),lastClock=Date.now();send('room',initial);
    try{
     while(!stopped&&Date.now()-start<22000){
      await new Promise<void>(resolve=>{const timer=setTimeout(resolve,650);wake=()=>{clearTimeout(timer);resolve();};});
      if(stopped)break;
      if(Date.now()-lastHeartbeat>5000){await game.state(member.userId,watchId);lastHeartbeat=Date.now();}
      const next=await game.watch(member.userId,watchId);
      if(next.revision!==revision){revision=next.revision;send('room',next.view);lastClock=Date.now();}
      else if(Date.now()-lastClock>3000){send('clock',{serverNow:Date.now()});lastClock=Date.now();}
     }
    }catch{send('retry',{message:'Bağlantı yenileniyor.'});}
    finally{request.signal.removeEventListener('abort',abort);if(!stopped){stopped=true;controller.close();}}
   },cancel(){stopped=true;wake?.();},
  });
  return new Response(stream,{headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store, no-transform','X-Content-Type-Options':'nosniff','X-Accel-Buffering':'no'}});
 }catch(e){return authJson({error:e instanceof GameError||e instanceof IdentityError?e.message:'Bağlantı kurulamadı.'},e instanceof GameError||e instanceof IdentityError?e.status:503);}
}
