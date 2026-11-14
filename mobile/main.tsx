import {setEngagementAdapter,type EngagementAdapter} from '@/lib/platform/engagement';
import {attachIncomingLinks} from '@/lib/platform/incoming-links';
import {createRoot} from 'react-dom/client';
import {Capacitor,CapacitorHttp,registerPlugin} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Haptics,ImpactStyle,NotificationType} from '@capacitor/haptics';
import {GameApp} from '@/components/game/App';
import {releaseCatalogue} from '@/lib/studio/releases';
import {setNativeTransport,setGameActive,gameIsActive} from '@/lib/platform/runtime';
import {nativeApiTransport} from '@/lib/platform/native-transport';
import {nativeHaptics,type NativeHapticDriver} from '@/lib/platform/native-haptics';
import {setHapticsAdapter,stopHapticSelection} from '@/lib/game/haptics';
import {installNativeGameCenter} from './game-center';
import {installNativeSharing} from './sharing';
import '@/app/game-styles.css';
import './native.css';
if(Capacitor.isNativePlatform()){
 setNativeTransport(nativeApiTransport(options=>CapacitorHttp.request(options)));
 installNativeSharing();
 if(Capacitor.getPlatform()==='ios'&&Capacitor.isPluginAvailable('GameEngagement'))setEngagementAdapter(registerPlugin<EngagementAdapter>('GameEngagement'));
 const driver=Capacitor.getPlatform()==='ios'&&Capacitor.isPluginAvailable('GameHaptics')
  ?registerPlugin<NativeHapticDriver>('GameHaptics')
  :{landing:()=>Haptics.impact({style:ImpactStyle.Light}),menu:()=>Haptics.impact({style:ImpactStyle.Light}),selectionStart:()=>Haptics.selectionStart(),selectionChanged:()=>Haptics.selectionChanged(),selectionEnd:()=>Haptics.selectionEnd(),word:()=>Haptics.impact({style:ImpactStyle.Medium}),complete:()=>Haptics.notification({type:NotificationType.Success})};
 setHapticsAdapter(nativeHaptics(driver,()=>gameIsActive()&&!document.hidden));
 void App.addListener('appStateChange',({isActive})=>{
  setGameActive(isActive);
  if(!isActive){stopHapticSelection();window.dispatchEvent(new Event('blur'));}
  document.dispatchEvent(new Event('visibilitychange'));
  if(isActive){window.dispatchEvent(new Event('kt-sync-now'));window.dispatchEvent(new Event('kt-app-resume'));}
 });
 window.addEventListener('kt-game-ready',()=>{void attachIncomingLinks({listen:receive=>App.addListener('appUrlOpen',event=>receive(event.url)),launch:()=>App.getLaunchUrl().then(value=>value??{})},route=>{history.replaceState(null,'',route);window.dispatchEvent(new PopStateEvent('popstate'));}).catch(()=>{/* The game remains playable without invitation metadata. */});},{once:true});
 document.documentElement.dataset['nativeApp']='true';
}
const catalogue=releaseCatalogue();
createRoot(document.getElementById('root')!,{onUncaughtError:()=>{(window as Window&{kelimeBootFailed?:()=>void}).kelimeBootFailed?.();}}).render(<GameApp releases={catalogue.chapters} releaseCounts={catalogue.themeCounts}/>);

if(Capacitor.isNativePlatform())requestAnimationFrame(()=>{void installNativeGameCenter();});
