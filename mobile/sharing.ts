import {Capacitor,registerPlugin} from '@capacitor/core';
import {setNativeSharing,type NativeSharing} from '@/lib/platform/sharing';

export function installNativeSharing(){
 if(Capacitor.getPlatform()==='ios'&&Capacitor.isPluginAvailable('GameSharing')){
  setNativeSharing(registerPlugin<NativeSharing>('GameSharing'));
 }
}
