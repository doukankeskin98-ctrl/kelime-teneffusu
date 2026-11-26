// The budget covers checked-in, uncompressed application styles, including admin.
import {readdirSync,readFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../app/',import.meta.url));
function styles(directory){
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const file=join(directory,entry.name);
    if(entry.isDirectory())return styles(file);
    return entry.name.endsWith('.css')?[file]:[];
  }).sort();
}
const files=styles(root).map(file=>{
  const source=readFileSync(file);
  const css=source.toString().replace(/\/\*[\s\S]*?\*\//g,'');
  return {file:relative(root,file),bytes:source.length,important:(css.match(/!\s*important\b/gi)??[]).length};
});
const bytes=files.reduce((n,file)=>n+file.bytes,0);
const important=files.reduce((n,file)=>n+file.important,0);
console.log(JSON.stringify({files,bytes,important,maximumBytes:150000,maximumImportant:20},null,2));
if(bytes>150000||important>20)process.exitCode=1;
