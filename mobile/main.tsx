import {createRoot} from 'react-dom/client';
import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Haptics,ImpactStyle,NotificationType} from '@capacitor/haptics';
import {GameApp} from '@/components/game/App';
import {releaseCatalogue} from '@/lib/studio/releases';
import {setNativeTransport,setGameActive} from '@/lib/platform/runtime';
import {nativeApiTransport} from '@/lib/platform/native-transport';
import {setHapticsAdapter} from '@/lib/game/haptics';
import '@/app/game-styles.css';
import './native.css';
if(Capacitor.isNativePlatform()){
 setNativeTransport(nativeApiTransport(options=>CapacitorHttp.request(options)));
 setHapticsAdapter(cue=>cue==='complete'?Haptics.notification({type:NotificationType.Success}):cue==='word'?Haptics.impact({style:ImpactStyle.Light}):Haptics.selectionChanged());
 void App.addListener('appStateChange',({isActive})=>{
  setGameActive(isActive);
  if(!isActive)window.dispatchEvent(new Event('blur'));
  document.dispatchEvent(new Event('visibilitychange'));
  if(isActive){window.dispatchEvent(new Event('kt-sync-now'));window.dispatchEvent(new Event('kt-app-resume'));}
 });
 document.documentElement.dataset['nativeApp']='true';
}
const catalogue=releaseCatalogue();
createRoot(document.getElementById('root')!).render(<GameApp releases={catalogue.chapters} releaseCounts={catalogue.themeCounts}/>);
