// Runs only on a booted simulator, under identifiers reserved for these tests.
import {execFileSync} from 'node:child_process';
import {mkdtemp,cp,copyFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {build} from 'vite';

const run=(tool,args)=>execFileSync(tool,args,{stdio:'inherit'});
const booted=JSON.parse(execFileSync('xcrun',['simctl','list','devices','booted','--json'],{encoding:'utf8'}));
const phones=Object.values(booted.devices).flat().filter(d=>d.state==='Booted'&&d.name.includes('iPhone'));
const requested=process.argv[2];
const device=requested?phones.find(d=>d.udid===requested):phones.length===1?phones[0]:null;
if(!device)throw Error('Bir iPhone simülatörü açın ve npm run mobile:edge-test -- SIMULATOR_UDID çalıştırın.');

const work=await mkdtemp(join(tmpdir(),'kt-edge-'));
const bundle='com.kelimeteneffusu.edgeqa';
const destination='id='+device.udid;
const web=join(work,'web');
const app=join(work,'app','Build','Products','Debug-iphonesimulator','App.app');
console.log('Test çıktıları:',work);
await build({configFile:'mobile/vite.config.ts',build:{
 outDir:web,rollupOptions:{input:resolve('mobile/qa/edge.html')}
}});
run('xcodebuild',['-project','ios/App/App.xcodeproj','-scheme','App','-configuration','Debug','-destination',destination,
 '-derivedDataPath',join(work,'app'),'PRODUCT_BUNDLE_IDENTIFIER='+bundle,'CODE_SIGNING_ALLOWED=NO','build']);
const identifier=execFileSync('/usr/libexec/PlistBuddy',['-c','Print CFBundleIdentifier',join(app,'Info.plist')],{encoding:'utf8'}).trim();
if(identifier!==bundle)throw Error('Beklenmeyen test uygulaması kimliği.');
await cp(web,join(app,'public'),{recursive:true});
await copyFile(join(web,'qa','edge.html'),join(app,'public','index.html'));
const entry=await readFile(join(app,'public','index.html'),'utf8');
if(!entry.includes('iOS test'))throw Error('Test girişi paketlenmedi.');
run('codesign',['--force','--sign','-',app]);
run('xcrun',['simctl','install',device.udid,app]);
try{
 run('xcodebuild',['test','-project','tests/ios-edge/EdgeQA.xcodeproj','-scheme','EdgeQA','-destination',destination,
  '-derivedDataPath',join(work,'tests'),'-parallel-testing-enabled','NO','-resultBundlePath',join(work,'edge.xcresult')]);
}finally{
 run('xcrun',['simctl','uninstall',device.udid,bundle]);
}
