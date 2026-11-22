// Isolated local preview, fresh browser profiles and strict child exit codes.
import {preview} from 'vite';
import {spawn} from 'node:child_process';
import {mkdirSync,createWriteStream,mkdtempSync,cpSync,rmSync} from 'node:fs';
import path from 'node:path';import {tmpdir} from 'node:os';
const only=process.argv[3]??'all';if(!['all','controls','persistence'].includes(only))throw Error('Invalid gate mode');
const width=Number(process.argv[2]??393),height=width===320?568:852;
if(![320,393].includes(width))throw Error('Use 320 or 393');
const out=path.resolve(process.env.EVIDENCE_DIR??'outputs/integrity',String(width));mkdirSync(out,{recursive:true});
const build=mkdtempSync(path.join(tmpdir(),'kt-integrity-build-'));cpSync('dist-mobile',build,{recursive:true});
const server=await preview({configFile:false,build:{outDir:build},preview:{host:'127.0.0.1',port:0},logLevel:'error'});
const url='http://127.0.0.1:'+server.httpServer.address().port;
const run=(name,args)=>new Promise((resolve,reject)=>{const log=createWriteStream(path.join(out,name+'.log'));const child=spawn(process.execPath,[`scripts/visual/integrity/${name}.mjs`,...args],{env:{...process.env,KT_URL:url,KT_CDP_PORT:String(18000+width)},stdio:['ignore','pipe','pipe']});child.stdout.pipe(log);child.stderr.pipe(log);child.on('error',reject);child.on('exit',code=>{log.end();if(code===0)resolve();else reject(Error(`${name} failed (${code}); ${out}/${name}.log`));});});
try{
 if(only==='all')await run('yeni-oyuncu',[path.join(out,'journey'),`${width}x${height}`]);
 if(only!=='persistence')await run('aliskanlik-olcumu',['olc',path.join(out,'controls.json'),String(width),String(height)]);
 if(only!=='persistence')await run('aliskanlik-olcumu',['karsilastir',`scripts/visual/integrity/aliskanlik-0.57.6-${width}.json`,path.join(out,'controls.json')]);
 if(width===393&&only!=='controls')await run('kayit-kaliciligi',[path.join(out,'persistence.json'),'2','1000','duzgun','--kapi','duzgun']);
 console.log(`Integrity ${width}: passed`);
}finally{await new Promise(resolve=>server.httpServer.close(resolve));rmSync(build,{recursive:true,force:true});}
