import type {CapacitorConfig} from '@capacitor/cli';
const config:CapacitorConfig={
 appId:'com.kelimeteneffusu.game',appName:'Kelime Teneffüsü',webDir:'dist-mobile',
 ios:{contentInset:'never',scrollEnabled:false,preferredContentMode:'mobile',loggingBehavior:'none'},
 plugins:{CapacitorHttp:{enabled:false},CapacitorCookies:{enabled:false}},
};
export default config;
