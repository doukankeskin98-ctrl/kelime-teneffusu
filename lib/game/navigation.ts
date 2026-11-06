export type GameNav='kesfet'|'arsiv'|'arena'|'gunluk'|'profil';
export type ArenaSection='live'|'friends'|'challenge';
export function gameRoute(search:string){
 const q=new URLSearchParams(search),challenge=q.get('meydan')?.toUpperCase()??'',friend=q.get('arkadas')?.toUpperCase()??'';
 const arena=q.has('oda')||q.get('sekme')==='arena'||!!challenge||!!friend;
 const nav:GameNav=arena?'arena':(['arsiv','gunluk','profil'].includes(q.get('sekme')??'')?q.get('sekme'):'kesfet') as GameNav;
 const section:ArenaSection=friend||q.get('mod')==='arkadaslar'?'friends':challenge||q.get('mod')==='meydan'?'challenge':'live';
 return {nav,section,invites:{challenge:/^[A-HJ-NP-Z2-9]{10}$/.test(challenge)?challenge:'',friend:/^[A-HJ-NP-Z2-9]{10}$/.test(friend)?friend:''}};
}
export function gameRouteUrl(href:string,nav:GameNav,section:ArenaSection='live'){
 const url=new URL(href);url.searchParams.set('sekme',nav);
 if(nav!=='arena')for(const key of ['oda','meydan','arkadas','mod'])url.searchParams.delete(key);
 else{url.searchParams.delete('mod');if(section!=='live')url.searchParams.set('mod',section==='challenge'?'meydan':'arkadaslar');for(const key of ['oda','meydan','arkadas'])if(key!==(section==='live'?'oda':section==='challenge'?'meydan':'arkadas'))url.searchParams.delete(key);}
 return url.pathname+url.search+url.hash;
}
