import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {nativeHaptics} from '../lib/platform/native-haptics.ts';
import type {HapticsAdapter} from '../lib/game/haptics.ts';

const compiled=ts.transpileModule(readFileSync('mobile/main.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const flush=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};
function boot(native=true,available=true){
 let active=true,adapter:HapticsAdapter|null=null,listener:((state:{isActive:boolean})=>void)|undefined;
 const calls:string[]=[],registrations:string[]=[];
 const plugin=Object.fromEntries(['menu','selectionStart','selectionChanged','selectionEnd','word','complete'].map(name=>[name,async()=>{calls.push('game:'+name);}]));
 const fallback={impact:async({style}:{style:string})=>{calls.push('fallback:'+style);},notification:async()=>{calls.push('fallback:complete');},...Object.fromEntries(['selectionStart','selectionChanged','selectionEnd'].map(name=>[name,async()=>{calls.push('fallback:'+name);}]))};
 const modules:Record<string,unknown>={
  'react-dom/client':{createRoot:()=>({render(){}})},'react/jsx-runtime':{jsx:()=>null},
  '@capacitor/core':{Capacitor:{isNativePlatform:()=>native,getPlatform:()=>native?'ios':'web',isPluginAvailable:(name:string)=>name==='GameHaptics'&&available},CapacitorHttp:{request(){}},registerPlugin:(name:string)=>{registrations.push(name);return plugin;}},
  '@capacitor/app':{App:{addListener:async(_event:string,fn:typeof listener)=>{listener=fn;}}},
  '@capacitor/haptics':{Haptics:fallback,ImpactStyle:{Light:'light',Medium:'medium'},NotificationType:{Success:'success'}},
  '@/components/game/App':{GameApp:()=>null},'@/lib/studio/releases':{releaseCatalogue:()=>({chapters:[],themeCounts:{}})},
  '@/lib/platform/runtime':{setNativeTransport(){},setGameActive:(value:boolean)=>{active=value;},gameIsActive:()=>active},
  '@/lib/platform/native-transport':{nativeApiTransport:()=>{}},'@/lib/platform/native-haptics':{nativeHaptics},
  '@/lib/game/haptics':{setHapticsAdapter:(value:HapticsAdapter)=>{adapter=value;},stopHapticSelection:()=>adapter?.stopSelection?.()},
  '@/app/game-styles.css':{},'./native.css':{},'./sharing':{installNativeSharing(){}}
 };
 const document=Object.assign(new EventTarget(),{hidden:false,documentElement:{dataset:{}},getElementById:()=>({})});
 vm.runInNewContext(compiled,{exports:{},require:(name:string)=>{assert(name in modules,name);return modules[name];},window:new EventTarget(),document,Event});
 return {calls,registrations,get adapter(){return adapter;},state:(isActive:boolean)=>listener?.({isActive})};
}
it('actual mobile entry selects the local iOS plugin and sends one distinct success cue',async()=>{
 const h=boot();assert.deepEqual(h.registrations,['GameHaptics']);h.adapter!('selection');await flush();h.adapter!('word');await flush();
 assert.deepEqual(h.calls,['game:selectionStart','game:selectionChanged','game:selectionEnd','game:word']);
 h.adapter!('complete');await flush();assert.equal(h.calls.filter(c=>c==='game:complete').length,1);assert(!h.calls.some(c=>c.startsWith('fallback:')));
});
it('missing local plugin keeps the supported fallback; web installs no haptic adapter',async()=>{
 const h=boot(true,false);h.adapter!('selection');await flush();h.adapter!('word');await flush();
 assert.deepEqual(h.calls,['fallback:selectionStart','fallback:selectionChanged','fallback:selectionEnd','fallback:medium']);
 const web=boot(false);assert.equal(web.adapter,null);assert.deepEqual(web.registrations,[]);
});
it('native background lifecycle stops selection and suppresses subsequent feedback',async()=>{
 const h=boot();h.adapter!('selection');await flush();h.state(false);await flush();const count=h.calls.length;
 h.adapter!('selection');h.adapter!('word');h.adapter!('complete');await flush();assert.equal(h.calls.length,count);
 assert.equal(h.calls.at(-1),'game:selectionEnd');h.state(true);h.adapter!('selection');await flush();assert.deepEqual(h.calls.slice(-2),['game:selectionStart','game:selectionChanged']);h.adapter!.stopSelection!();await flush();
});
