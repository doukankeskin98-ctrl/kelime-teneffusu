'use client';
import {isNativeGame} from '@/lib/platform/runtime';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowDownToLine,RefreshCw,WifiOff} from 'lucide-react';
import {metricsConsent,recordVisit,track} from '@/lib/game/telemetry';
interface InstallPrompt extends Event {prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>}
export function Platform({consent,playing=false,installTarget=null}:{consent:boolean;playing?:boolean;installTarget?:HTMLElement|null}){
 const [offline,setOffline]=useState(false),[install,setInstall]=useState<InstallPrompt|null>(null),[ios,setIos]=useState(false),[help,setHelp]=useState(false),[update,setUpdate]=useState<ServiceWorker|null>(null),[hidden,setHidden]=useState(true);
 useEffect(()=>{metricsConsent(consent);if(consent)recordVisit();},[consent]);
 useEffect(()=>{if(!consent||!playing)return;let id=0,started=0,previous=0,worst=0;const sample=(time:number)=>{if(document.hidden)return;if(!started)started=time;if(previous)worst=Math.max(worst,time-previous);previous=time;if(time-started<1500)id=requestAnimationFrame(sample);else track('frame_sample',worst);};id=requestAnimationFrame(sample);return ()=>cancelAnimationFrame(id);},[consent,playing]);
 useEffect(()=>{
  const error=()=>track('client_error');window.addEventListener('error',error);window.addEventListener('unhandledrejection',error);
  return ()=>{window.removeEventListener('error',error);window.removeEventListener('unhandledrejection',error);};
 },[]);
 useEffect(()=>{
  const change=()=>setOffline(!navigator.onLine);change();window.addEventListener('online',change);window.addEventListener('offline',change);
  if(isNativeGame())return ()=>{window.removeEventListener('online',change);window.removeEventListener('offline',change);};
  const standalone=window.matchMedia('(display-mode: standalone)').matches||('standalone' in navigator&&navigator.standalone===true);
  setIos(/iPhone|iPad|iPod/.test(navigator.userAgent)&&!standalone);
  setHidden(standalone);
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
 if(playing)return offline?<div className="offline-status compact" role="status"><WifiOff size={15}/>Çevrimdışı · Tek kişilik oyunların cihazında kaydedilir.</div>:null;
 return <>{offline&&<div className="offline-status" role="status"><WifiOff size={17}/>Çevrimdışısın. İndirdiğin bölümleri oynamaya devam edebilirsin.</div>}{update&&<div className="update-notice"><span>Yeni bir teneffüs hazır.</span><button className="text-button" onClick={()=>{window.dispatchEvent(new Event('kt-update-now'));update.postMessage({type:'ACTIVATE'});}}><RefreshCw size={15}/>Yenile</button></div>}{
  installTarget&&!hidden&&(install||ios)&&createPortal(
   <div className="install-setting">
    <button type="button" className="button secondary full" aria-expanded={install?undefined:help} onClick={async()=>{
     if(!install){setHelp(value=>!value);return;}
     try{
      await install.prompt();
      const result=await install.userChoice;
      if(result.outcome==='accepted')setHidden(true);
     }catch{/* The browser can withdraw its one-use installation prompt. */}
     finally{setInstall(null);}
    }}><ArrowDownToLine size={18} aria-hidden="true"/>Ana ekrana ekle</button>
    {!install&&help&&<p>Safari’de Paylaş menüsünü açıp “Ana Ekrana Ekle”yi seç.</p>}
   </div>,installTarget
  )
 }</>;
}
