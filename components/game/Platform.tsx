'use client';
import {useEffect,useState} from 'react';
import {ArrowDownToLine,Check,RefreshCw,Share,Smartphone,WifiOff,X} from 'lucide-react';
import {metricsConsent,recordVisit,track} from '@/lib/game/telemetry';
interface InstallPrompt extends Event {prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>}
export function Platform({consent,playing=false}:{consent:boolean;playing?:boolean}){
 const [offline,setOffline]=useState(false),[install,setInstall]=useState<InstallPrompt|null>(null),[ios,setIos]=useState(false),[help,setHelp]=useState(false),[update,setUpdate]=useState<ServiceWorker|null>(null),[hidden,setHidden]=useState(true);
 useEffect(()=>{metricsConsent(consent);if(consent)recordVisit();},[consent]);
 useEffect(()=>{if(!consent||!playing)return;let id=0,started=0,previous=0,worst=0;const sample=(time:number)=>{if(document.hidden)return;if(!started)started=time;if(previous)worst=Math.max(worst,time-previous);previous=time;if(time-started<1500)id=requestAnimationFrame(sample);else track('frame_sample',worst);};id=requestAnimationFrame(sample);return ()=>cancelAnimationFrame(id);},[consent,playing]);
 useEffect(()=>{
  const error=()=>track('client_error');window.addEventListener('error',error);window.addEventListener('unhandledrejection',error);
  return ()=>{window.removeEventListener('error',error);window.removeEventListener('unhandledrejection',error);};
 },[]);
 useEffect(()=>{
  const change=()=>setOffline(!navigator.onLine);change();window.addEventListener('online',change);window.addEventListener('offline',change);
  const standalone=window.matchMedia('(display-mode: standalone)').matches||('standalone' in navigator&&navigator.standalone===true);
  setIos(/iPhone|iPad|iPod/.test(navigator.userAgent)&&!standalone);
  try{setHidden(standalone||sessionStorage.getItem('kt-install-hidden')==='1');}catch{setHidden(standalone);}
  const before=(event:Event)=>{event.preventDefault();setInstall(event as InstallPrompt);};window.addEventListener('beforeinstallprompt',before);
  const installed=()=>{setInstall(null);setHidden(true);};window.addEventListener('appinstalled',installed);
  let stopped=false,reloading=false;
  const controller=()=>{if(reloading)location.reload();};navigator.serviceWorker?.addEventListener('controllerchange',controller);
  if('serviceWorker' in navigator){void navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).then(reg=>{
   if(stopped)return;if(reg.waiting)setUpdate(reg.waiting);
   reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(!stopped&&worker.state==='installed'&&navigator.serviceWorker.controller)setUpdate(worker);});});
  }).catch(()=>{});}
  const reload=()=>{reloading=true;};window.addEventListener('kt-update-now',reload);
  return ()=>{stopped=true;window.removeEventListener('online',change);window.removeEventListener('offline',change);window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',installed);window.removeEventListener('kt-update-now',reload);navigator.serviceWorker?.removeEventListener('controllerchange',controller);};
 },[]);
 if(playing)return offline?<div className="offline-status compact" role="status"><WifiOff size={15}/>Çevrimdışı · Solo keşiflerin cihazında kaydedilir.</div>:null;
 return <>{offline&&<div className="offline-status" role="status"><WifiOff size={17}/>Çevrimdışısın. İndirilmiş solo keşiflerini oynamaya devam edebilirsin.</div>}{update&&<div className="update-notice"><span>Yeni bir teneffüs hazır.</span><button className="text-button" onClick={()=>{window.dispatchEvent(new Event('kt-update-now'));update.postMessage({type:'ACTIVATE'});}}><RefreshCw size={15}/>Yenile</button></div>}{!hidden&&(install||ios)&&<div className="install-nudge"><span className="install-nudge-icon"><Smartphone size={22}/></span><span><b>Teneffüsün bir dokunuş uzakta.</b><small>Ana ekranına ekle, tam ekran oyna.</small></span><button className="text-button" onClick={async()=>{if(install){await install.prompt();const result=await install.userChoice;if(result.outcome==='accepted')setHidden(true);}else setHelp(h=>!h);}}><ArrowDownToLine size={17}/>{install?'Ekle':'Nasıl?'}</button><button className="icon-button subtle" aria-label="Ana ekrana ekleme önerisini kapat" onClick={()=>{setHidden(true);try{sessionStorage.setItem('kt-install-hidden','1');}catch{}}}><X size={15}/></button>{help&&<p className="install-help">Safari’de <Share size={15}/> Paylaş menüsünü aç, “Ana Ekrana Ekle”yi seç.</p>}</div>}</>;
}
