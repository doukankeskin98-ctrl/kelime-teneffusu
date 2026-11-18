// Render the four reference states using the production client and an isolated synthetic save.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync,statSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {launch,sleep} from './chrome.mjs';

const out=path.resolve(process.env.EVIDENCE_DIR??'../world-review.nosync/release-0570/screens');
const root=path.resolve('dist-mobile'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
mkdirSync(out,{recursive:true});
const fixture=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/berrak-fixture.ts'],{encoding:'utf8'}));
const server=createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/chapters'&&url.searchParams.get('collection')==='releases'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(fixture.catalogue));return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({authenticated:false,available:false,entries:[],rankings:[]}));return;}
 let f=path.resolve(root,'.'+url.pathname);
 if(!f.startsWith(root+path.sep)||!existsSync(f)||statSync(f).isDirectory())f=path.join(root,'index.html');
 res.writeHead(200,{'Content-Type':types[path.extname(f)]??'application/octet-stream'});createReadStream(f).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const page=await launch({port:9457}),url='http://127.0.0.1:'+server.address().port,records=[];
async function click(selector){assert(await page.evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(selector)});if(!b)return false;b.click();return true;})()`),selector);await sleep(180);}
async function textButton(label){
 assert(await page.evaluate(`(()=>{const b=[...document.querySelectorAll('dialog[open] button,main button')].find(b=>b.getClientRects().length&&b.textContent.trim().startsWith(${JSON.stringify(label)}));if(!b)return false;b.click();return true;})()`),label);await sleep(190);
}
async function waitFor(expression){
 for(let i=0;i<75;i++){if(await page.evaluate(expression))return;await sleep(80);}
 throw new Error(expression+' '+await page.evaluate('document.body.innerText.slice(0,180)'));
}
async function home(progress=fixture.progress){await page.goto(url,300);await page.evaluate(`localStorage.setItem('kelime-teneffusu-v2',${JSON.stringify(JSON.stringify(progress))})`);await page.goto(url,350);await waitFor("!!document.querySelector('.berrak-landing')&&!document.getElementById('native-boot')");}
async function shot(width,name){
 if(name==='support')await waitFor("!!document.querySelector('.support-kinds')");
 assert.equal(await page.evaluate("!!document.querySelector('#native-boot')"),false,name+' game boot overlay');
 if(name==='album')assert(await page.evaluate("!!document.querySelector('dialog[open] .release-album-card')"),'album archive rendered');
 await page.screenshot(path.join(out,width+'-'+name+'.png'));
 const info=await page.evaluate(`(()=>{const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {overflow:document.documentElement.scrollWidth>innerWidth+1,heading:(document.querySelector('dialog[open] h2')??document.querySelector('h1'))?.textContent,board:rect(document.querySelector('.letter-board')),button:rect(document.querySelector('dialog[open] .primary,.berrak-enter .stage-play')),dialog:rect(document.querySelector('dialog[open]'))}})()`);
 const measurements=await page.evaluate(`(()=>{
  const dialog=document.querySelector('dialog[open]');
  const scope=dialog??document.querySelector('.viewport-play,.native-shell')??document;
  const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
  const buttons=[...scope.querySelectorAll('button,summary,input:not([type=hidden])')].filter(visible);
  const rects=buttons.map(e=>{const r=e.getBoundingClientRect();return {name:e.getAttribute('aria-label')||e.textContent.trim().slice(0,60),w:r.width,h:r.height}});
  const style=sel=>{const e=scope.querySelector(sel);if(!e)return null;const s=getComputedStyle(e);return {fg:s.color,bg:s.backgroundColor,fill:s.backgroundImage,font:s.fontSize}};
  return {small:rects.filter(r=>r.w<43.9||r.h<43.9),letters:style('[data-cell]'),topic:style('.target-topic'),primary:style('.stage-play,.result-continue'),panel:style('.discovery-album-card,.profile-header,.support-report>label')};
 })()`);
 assert.equal(info.overflow,false,name+' overflow');records.push({width,name,...info,...measurements});
}
async function draw(word,hold,shape=fixture.shape){
 const box=await page.evaluate("document.querySelector('.letter-board').getBoundingClientRect().toJSON()");
 const xy=([row,col])=>[box.x+(col+.5)*box.width/shape.columns,box.y+(row+.5)*box.height/shape.rows];
 const a=xy(word.a),b=xy(word.b);
 await page.touch(Array.from({length:12},(_,i)=>[a[0]+(b[0]-a[0])*i/11,a[1]+(b[1]-a[1])*i/11]),hold);
}
try{
 const sizes=process.env.MENUS_ONLY?[[393,852]]:[[320,568],[375,667],[393,852],[430,932]];
 for(const [w,h] of sizes){
  await page.viewport(w,h,1);await home();await shot(w,'home');
  if(w===393){
   for(const [selector,name] of [['.berrak-orbit','map'],['[aria-label="Albümlerim"]','album'],['[aria-label="Günlük bulmaca"]','daily'],['[aria-label="Arena"]','arena'],['[aria-label="Diğer oyunlar"]','other'],['[aria-label="Oyuncu profilini aç"]','profile'],['[aria-label="Ayarları aç"]','settings']]){
    await click(selector);await shot(w,name);
    if(name==='map'){await click('.journey-map-world.is-current');await shot(w,'map-chapters');}
    if(name==='profile'){await click('#collection-tab-achievements');await shot(w,'achievements');await click('#collection-tab-profile');await textButton('Profil oluştur');await shot(w,'identity');}
    if(name==='settings'){await textButton('Gizlilik ve hesap');await shot(w,'privacy');await textButton('Ayarlara dön');await textButton('Diğer ayarlar');await shot(w,'settings-more');await textButton('Ayarlara dön');await textButton('Destek');await shot(w,'support');}
    if(name==='arena'){await textButton('Arkadaşlarınla oyna');await shot(w,'arena-room-entry');await click('dialog[open] .modal-head button');await textButton('Meydan oku');await shot(w,'challenge');}
    if(name==='other'){await textButton('Kısa oyunlar');await shot(w,'short-games');await textButton('Bonus turları');await shot(w,'bonus-library');await click('dialog[open] .modal-head button');await textButton('Hızlı Tur');await shot(w,'sprint-intro');}
    await home();
   }
  }
  if(process.env.MENUS_ONLY)continue;
  await click('.stage-play');
  await waitFor("document.querySelector('.letter-board')&&document.querySelector('[data-word-group=\"0\"]')?.getAttribute('aria-label')?.includes('bulundu')");
  await sleep(600);
  for(let i=1;i<fixture.words.length;i++){
   await draw(fixture.words[i],i===3?async step=>{if(step===6){assert(await page.evaluate("document.querySelector('.selection-bubble').innerText.trim().length>0"));await shot(w,'drawing');}}:undefined);
   await waitFor(`document.querySelector('[data-word-group="${i}"]')?.getAttribute('aria-label')?.includes('bulundu')||!!document.querySelector('dialog[open] .result-continue')`);
   if(i===2){await waitFor("!!document.querySelector('.play-praise:not([hidden]) strong')?.textContent");await sleep(140);await shot(w,'praise');await sleep(450);}
  }
  await waitFor("!!document.querySelector('dialog[open] .result-continue')");
  await sleep(850);await shot(w,'world-unlocked');
  await home(fixture.ordinaryFinale.progress);await click('.stage-play');
  await waitFor("!!document.querySelector('.letter-board')");await sleep(360);
  await draw(fixture.ordinaryFinale.word,undefined,fixture.ordinaryFinale.shape);
  await waitFor("!!document.querySelector('dialog[open] .result-continue')");
  await sleep(850);await shot(w,'result');
  assert(await page.evaluate("!!document.querySelector('dialog[open] .primary')"),'result primary');
 }
 assert.deepEqual(page.errors,[]);console.log('Verified',records.length,'Berrak screen states');
}finally{writeFileSync(path.join(out,'report.json'),JSON.stringify({records,errors:page.errors},null,2));await page.close();server.close();}
