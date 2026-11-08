/** Visibility and native state jointly gate local play; competitive clocks stay authoritative. */
export function observeGameActivity(doc:EventTarget&{hidden:boolean},win:EventTarget,isActive:()=>boolean,change:(active:boolean)=>void){
 let last:boolean|undefined;
 const emit=(active:boolean)=>{if(active!==last){last=active;change(active);}};
 const refresh=()=>emit(!doc.hidden&&isActive()),hide=()=>emit(false);
 doc.addEventListener('visibilitychange',refresh);
 win.addEventListener('pagehide',hide);win.addEventListener('pageshow',refresh);win.addEventListener('kt-app-resume',refresh);
 refresh();
 return ()=>{doc.removeEventListener('visibilitychange',refresh);win.removeEventListener('pagehide',hide);win.removeEventListener('pageshow',refresh);win.removeEventListener('kt-app-resume',refresh);};
}
