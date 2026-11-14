import {GAME_ORIGIN} from './lib/platform/runtime';
import type {CapacitorConfig} from '@capacitor/cli';
const config:CapacitorConfig={
 appId:'com.kelimeteneffusu.game',appName:'Kelime Teneffüsü',webDir:'dist-mobile',
 backgroundColor:'#123b45',
 ios:{contentInset:'never',scrollEnabled:true,preferredContentMode:'mobile',loggingBehavior:'none'},
 plugins:{GameSharing:{publicOrigin:GAME_ORIGIN},CapacitorHttp:{enabled:false},CapacitorCookies:{enabled:false}},
};
export default config;
