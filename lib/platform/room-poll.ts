/** Native JSON bridge does not buffer an SSE stream. Poll one authoritative view
 * at a time, retire stale responses, and pause all work while the app is hidden. */
export function startRoomPolling<T>(options:{read:(signal:AbortSignal)=>Promise<T>;accept:(view:T)=>void;status:(connected:boolean)=>void;active:()=>boolean;interval?:number}){
 let stopped=false,generation=0,timer:ReturnType<typeof setTimeout>|undefined,controller:AbortController|undefined;
 const refresh=async()=>{
  clearTimeout(timer);if(stopped||!options.active())return;
  const own=++generation;controller?.abort();controller=new AbortController();const current=controller;
  try{const view=await options.read(current.signal);if(stopped||own!==generation||!options.active())return;options.accept(view);options.status(true);}
  catch{if(!stopped&&own===generation&&options.active())options.status(false);}
  finally{if(!stopped&&own===generation&&options.active())timer=setTimeout(()=>void refresh(),options.interval??1000);}
 };
 const visibility=()=>{generation++;controller?.abort();clearTimeout(timer);if(options.active())void refresh();};
 void refresh();
 return {visibility,stop:()=>{stopped=true;generation++;controller?.abort();clearTimeout(timer);}};
}
