/** Presentation only: authoritative claim timing is read afresh at the gesture. */
export type ArenaClockHost={
 localNow:()=>number;serverNow:()=>number;visible:()=>boolean;publish:(now:number)=>void;
 schedule:(callback:()=>void,delay:number)=>unknown;cancel:(timer:unknown)=>void;
};
export function startArenaClock(host:ArenaClockHost,options:{starts?:number|null;waitingUntil?:number}){
 let stopped=false,timer:unknown;
 const clear=()=>{if(timer!==undefined)host.cancel(timer);timer=undefined;};
 const refresh=()=>{
  clear();if(stopped||!host.visible())return;
  if(options.starts!=null){
   const now=host.serverNow();host.publish(now);
   // Countdown, clock text and golden-word windows share the match's second boundary.
   const remainder=((now-options.starts)%1000+1000)%1000;
   timer=host.schedule(refresh,Math.max(1,1000-remainder));
  }else if(options.waitingUntil!==undefined){
   host.publish(host.serverNow());const delay=options.waitingUntil-host.localNow();
   if(delay>0)timer=host.schedule(refresh,delay);
  }
 };
 refresh();return {refresh,stop:()=>{stopped=true;clear();}};
}
