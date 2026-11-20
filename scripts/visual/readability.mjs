// Exercise every menu through the mobile entry point with a generated local player's save.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {preview} from 'vite';
import {launch,sleep} from './chrome.mjs';
import {screens} from './readability-screens.mjs';
import {menuMetrics} from './readability-metrics.mjs';

const width=Number(process.argv[2]),height=width===320?568:852;
assert([320,393].includes(width),'Use 320 or 393 CSS pixels');
const out=path.resolve(process.env.EVIDENCE_DIR??'outputs/readability'),dir=path.join(out,String(width));
mkdirSync(dir,{recursive:true});
const fx=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/veteran-save.ts'],{encoding:'utf8'}));
const save=JSON.parse(fx.value);
for(const c of fx.chapters.slice(120))delete save.saves['route:'+c.id];
const server=await preview({configFile:false,build:{outDir:'dist-mobile'},preview:{host:'127.0.0.1',port:0},logLevel:'error'});
const url='http://127.0.0.1:'+server.httpServer.address().port;
const metrics={};
let page;
async function until(label,fn) {
  const deadline=Date.now()+10000;
  do {if(await fn())return;await sleep(90);}while(Date.now()<deadline);
  throw Error('Ekran açılamadı: '+label);
}
function clickText(label) {
  return page.evaluate(`(()=>{
    const re=new RegExp(${JSON.stringify(label)},'i');
    const root=[...document.querySelectorAll('dialog[open]')].at(-1)??document;
    const el=[...root.querySelectorAll('button,a,[role=button],summary')].find(e=>e.checkVisibility()&&
      (re.test(e.getAttribute('aria-label')||'')||re.test(e.innerText.trim())));
    if(!el)return false;
    el.scrollIntoView({block:'nearest'});el.click();return true;
  })()`);
}
try {
  page=await launch({port:Number(process.env.CHROME_PORT??(9400+width))});
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs',{urls:['https://*','wss://*']});
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`if(!sessionStorage.getItem('seed')){localStorage.setItem(${JSON.stringify(fx.key)},${JSON.stringify(JSON.stringify(save))});sessionStorage.setItem('seed','1');}`});
  await page.viewport(width,height,2,{top:width===320?20:59,bottom:width===320?0:34,left:0,right:0});
  for(const [name,steps,heading] of screens){
    await page.goto(url,100);
    await until(name,()=>page.evaluate("!!document.querySelector('button.berrak-orbit')"));
    await clickText('Ana ekrana ekleme önerisini kapat');
    for(const step of steps){
      if(step==='__HINT__'||step==='__MENU__'){
        await until(name,()=>page.evaluate("!!document.querySelector('[data-cell]')"));
        await sleep(400);await clickText('^Anladım');
        await until(step,()=>clickText(step==='__HINT__'?'İpucu':'^Ayarlar$|Oyun menüsü|Oyun ayarları'));
      }else await until(step,()=>clickText(step));
      await sleep(120);
    }
    const expected=JSON.stringify(heading.toLocaleLowerCase('tr'));
    await until(name,()=>page.evaluate(`document.body.innerText.toLocaleLowerCase('tr').includes(${expected})`));
    await page.evaluate('document.fonts.ready.then(()=>true)');
    await sleep(500);
    const m=await page.evaluate('('+menuMetrics.toString()+')()');
    assert(m?.texts.length>0, name);
    assert(m.sw<=width+1, name+' yatay taşıyor');
    metrics[name]=m;
    await page.screenshot(path.join(dir,name+'.png'));
    // Read the pixels directly behind the glyphs, including gradients and artwork.
    // Text fill is suppressed independently of color to preserve backgrounds using currentColor.
    await page.evaluate(`(()=>{const s=document.createElement('style');
      s.id='readability-mask';s.textContent='*{-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}';
      document.head.append(s);return new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(()=>ok(true))));})()`);
    await page.screenshot(path.join(dir,name+'-background.png'));
    await page.evaluate("document.getElementById('readability-mask').remove()");
  }
  assert.equal(Object.keys(metrics).length,34);
  const hint=metrics['28-oyun-121'].texts.find(t=>t.t==='3'&&t.ah&&t.badge&&t.hint&&!t.cell);
  assert(hint,'Görünür ipucu sayacı ölçüme girmeli');
  writeFileSync(path.join(dir,'metrics.json'),JSON.stringify(metrics));
  execFileSync(process.env.PYTHON??'python3',['scripts/visual/readability-contrast.py',out,String(width)],{stdio:'inherit'});
}finally{
  try{await page?.close();}finally{await server.close();}
}
