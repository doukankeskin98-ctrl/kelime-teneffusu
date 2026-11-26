import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const pilotVersion='0.58.4-pilot.1';

export default defineConfig(({mode})=>{
 const pilot=mode==='journey-pilot';
 return {
  root:root+'mobile',publicDir:root+'public',resolve:{alias:{'@':root}},
  define:{__KT_LOCAL_JOURNEY_PILOT__:JSON.stringify(pilot)},
  plugins:[react(),...(pilot?[{
   name:'journey-pilot-version',
   transformIndexHtml:(html:string)=>html.replace(/<title>.*?<\/title>/,'<title>Kelime Teneffüsü · Yerel pilot</title>'),
   generateBundle(){this.emitFile({type:'asset',fileName:'pilot.json',source:JSON.stringify({version:pilotVersion,chapters:312})});}
  } satisfies import('vite').Plugin]:[])],
  build:{outDir:root+(pilot?'dist-pilot':'dist-mobile'),emptyOutDir:true,target:'safari15',cssTarget:'safari15',sourcemap:false},
  server:{host:'127.0.0.1',port:5174}
 };
});
