import {it} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {verifyNativeCopy,verifyNativeVersion} from '../scripts/mobile-package-integrity.mjs';
it('native copy rejects stale, missing and leftover application files',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'kt-package-')),web=join(dir,'web'),native=join(dir,'native');
 try{
  for(const base of [web,native]){await mkdir(join(base,'assets'),{recursive:true});await writeFile(join(base,'index.html'),'entry');await writeFile(join(base,'assets/game.js'),'current');}
  await writeFile(join(native,'cordova.js'),'bridge');assert.equal(await verifyNativeCopy(web,native),2);
  await writeFile(join(native,'assets/game.js'),'old');await assert.rejects(verifyNativeCopy(web,native),/Stale native/);
  await rm(join(native,'assets/game.js'));await assert.rejects(verifyNativeCopy(web,native),/Native file missing/);
  await writeFile(join(native,'assets/game.js'),'current');await writeFile(join(native,'assets/old.js'),'old');await assert.rejects(verifyNativeCopy(web,native),/Obsolete native/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
it('native version gate checks every build configuration',()=>{
 const config=(v:string,b=26)=>`MARKETING_VERSION = ${v}; CURRENT_PROJECT_VERSION = ${b};`;
 assert.equal(verifyNativeVersion('0.41.0',config('0.41.0')+config('0.41.0')),'26');
 assert.throws(()=>verifyNativeVersion('0.41.0',config('0.41.0')+config('0.40.0')),/versions must match/);
 assert.throws(()=>verifyNativeVersion('0.41.0',config('0.41.0')+config('0.41.0',25)),/build numbers/);
});
