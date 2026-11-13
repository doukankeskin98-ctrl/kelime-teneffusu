import {Capacitor,registerPlugin} from '@capacitor/core';
import {setGameCenterAdapter,type GameCenterAdapter} from '@/lib/platform/game-center';
export async function installNativeGameCenter(){
 if(Capacitor.getPlatform()!=='ios'||!Capacitor.isPluginAvailable('GameCenter'))return;
 const native=registerPlugin<GameCenterAdapter>('GameCenter');setGameCenterAdapter(native);
 try{const state=await native.status();if(state.configured&&!state.authenticated)await native.authenticate();}catch{/* Optional Apple service never blocks offline play. */}
}
