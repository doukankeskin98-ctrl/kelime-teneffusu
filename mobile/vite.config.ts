import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export default defineConfig({root:root+'mobile',publicDir:root+'public',resolve:{alias:{'@':root}},plugins:[react()],build:{outDir:root+'dist-mobile',emptyOutDir:true,target:'safari15',cssTarget:'safari15',sourcemap:false},server:{host:'127.0.0.1',port:5174}});
