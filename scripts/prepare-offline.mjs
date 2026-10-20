import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve('dist/client');
async function walk(directory){const result=[];for(const e of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,e.name);if(e.isDirectory())result.push(...await walk(file));else if(/\.(js|css|woff2)$/.test(e.name))result.push('/'+path.relative(root,file).split(path.sep).join('/'));}return result;}
const assets=(await walk(root)).sort();
if(!assets.length)throw new Error('Offline build needs client assets.');
const version=createHash('sha256').update(assets.join('\n')).digest('hex').slice(0,12);
const source=await readFile('public/sw.js','utf8');
if(!source.includes('const BUILD_ASSETS=[];'))throw new Error('Offline cache marker missing.');
await writeFile(path.join(root,'sw.js'),source.replace('const BUILD_ASSETS=[];','const BUILD_ASSETS='+JSON.stringify(assets)+';').replace('kelime-studio-v3-20261021','kelime-studio-'+version));
console.log(`[offline] ${assets.length} versioned client assets prepared.`);
