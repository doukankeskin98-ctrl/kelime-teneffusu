import {GAME_ORIGIN} from './runtime.ts';

/** Invitations only. Never navigate the WebView to a supplied remote page. */
export function invitationRoute(raw:string):string|null {
 try {
  const url=new URL(raw);
  if(url.origin!==GAME_ORIGIN||url.username||url.password||url.pathname!=='/')return null;
  const kinds=['oda','meydan','arkadas'] as const;
  const present=kinds.filter(key=>url.searchParams.has(key));
  if(present.length!==1)return null;
  const key=present[0]!,values=url.searchParams.getAll(key),code=values[0]?.toUpperCase()??'';
  if(values.length!==1||!(key==='oda'?/^[A-HJ-NP-Z2-9]{8}$/:/^[A-HJ-NP-Z2-9]{10}$/).test(code))return null;
  return '/?sekme=arena&'+key+'='+code;
 }catch{return null;}
}

/** Attach the retained warm-event listener before querying the cold URL. A later
 * event wins over a stale getLaunchUrl response; repeated future invites work. */
export async function attachIncomingLinks(port:{listen:(receive:(url:string)=>void)=>Promise<{remove:()=>Promise<void>}>;launch:()=>Promise<{url?:string}>},navigate:(route:string)=>void){
 let generation=0,closed=false;
 const receive=(url:string)=>{if(closed)return;generation++;const route=invitationRoute(url);if(route)navigate(route);};
 const listener=await port.listen(receive);
 try{const launch=await port.launch();if(!closed&&generation===0&&launch.url)receive(launch.url);}catch{/* Warm invitations still work when launch metadata is unavailable. */}
 return ()=>{closed=true;void listener.remove();};
}
