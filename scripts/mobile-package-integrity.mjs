import {readdir,readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

async function files(root,dir=root){
 const entries=await readdir(dir,{withFileTypes:true});
 return (await Promise.all(entries.map(e=>e.isDirectory()?files(root,join(dir,e.name)):e.isFile()?[relative(root,join(dir,e.name))]:[]))).flat();
}
export async function verifyNativeCopy(web,native){
 const expected=await files(web),actual=await files(native);
 assert(expected.includes('index.html'),'Mobile entry missing');
 const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
 for(const file of expected){
  assert(actual.includes(file),`Native file missing: ${file}; run pnpm mobile:sync`);
  assert.equal(await hash(join(native,file)),await hash(join(web,file)),`Stale native file: ${file}; run pnpm mobile:sync`);
 }
 // Capacitor supplies a few root bridge files; old hashed application chunks must not survive.
 for(const file of actual.filter(f=>f.startsWith('assets/')))assert(expected.includes(file),`Obsolete native asset: ${file}`);
 return expected.length;
}
export function verifyNativeVersion(version,project){
 const marketing=[...project.matchAll(/MARKETING_VERSION\s*=\s*([^;]+);/g)].map(m=>m[1].trim().replaceAll('"',''));
 const builds=[...project.matchAll(/CURRENT_PROJECT_VERSION\s*=\s*([^;]+);/g)].map(m=>m[1].trim());
 assert(marketing.length>=2&&marketing.every(v=>v===version),'Package and iOS versions must match in every configuration');
 assert(builds.length===marketing.length&&builds.every(v=>/^[1-9]\d*$/.test(v)&&v===builds[0]),'iOS build numbers must be positive and consistent');
 return builds[0];
}
