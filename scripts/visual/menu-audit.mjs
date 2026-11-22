// Record the release menus against a local mobile build and deterministic API fixtures.
// Run from the repository root. BUILD_DIR and EVIDENCE_DIR select inputs and output.
import {measureDialogText} from './dialog-contrast.mjs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync,statSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {launch,sleep} from './chrome.mjs';

const out=path.resolve(process.env.EVIDENCE_DIR??'../world-review.nosync/release-0575/menus/sonra');
let signedInFixture=false;
const baseline=process.argv.includes('--baseline');
const root=path.resolve(process.env.BUILD_DIR??'dist-mobile'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
mkdirSync(out,{recursive:true});
const fixture=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/berrak-fixture.ts'],{encoding:'utf8'}));
const server=createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/__test_seed'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><title>Test save</title><main id="seed"></main>');return;}
 if(url.pathname==='/api/chapters'&&url.searchParams.get('collection')==='releases'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(fixture.catalogue));return;}
 if(signedInFixture&&url.pathname==='/api/game'&&!url.searchParams.has('action')){
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(fixture.guestAccount));return;
 }
 if(url.pathname==='/api/game'&&url.searchParams.get('action')==='rankings'){
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({day:'2026-11-19',daily:[{nickname:'Deneme A',duration:81000}],arena:[{nickname:'Deneme A',played:6,wins:4,score:100,rating:1032},{nickname:'Deneme B',played:4,wins:2,score:68,rating:1005}]}));return;
 }
 if(url.pathname==='/api/social'&&url.searchParams.get('action')==='catalogue'){
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({chapters:[{id:'uzay-1',title:'Gökyüzüne bak',themeId:'uzay',world:'Yıldız İskelesi',words:4,kind:'journey',number:1}]}));return;
 }
 if(url.pathname.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({authenticated:false,available:false,entries:[],rankings:[]}));return;}
 let f=path.resolve(root,'.'+url.pathname);
 if(!f.startsWith(root+path.sep)||!existsSync(f)||statSync(f).isDirectory())f=path.join(root,'index.html');
 res.writeHead(200,{'Content-Type':types[path.extname(f)]??'application/octet-stream'});createReadStream(f).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const page=await launch({port:Number(process.env.CHROME_PORT??9457)}),url='http://127.0.0.1:'+server.address().port,records=[];
async function click(selector){assert(await page.evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(selector)});if(!b)return false;b.click();return true;})()`),selector);await sleep(180);}
async function textButton(label){
 assert(await page.evaluate(`(()=>{const b=[...document.querySelectorAll('dialog[open] button,main button')].find(b=>b.getClientRects().length&&b.textContent.trim().startsWith(${JSON.stringify(label)}));if(!b)return false;b.click();return true;})()`),label);await sleep(190);
}
async function waitFor(expression){
 for(let i=0;i<75;i++){if(await page.evaluate(expression))return;await sleep(80);}
 throw new Error(expression+' '+await page.evaluate('document.body.innerText.slice(0,180)'));
}
async function home(progress=fixture.progress){await page.goto(url+'/__test_seed',100);await waitFor("!!document.getElementById('seed')");await page.evaluate(`localStorage.clear();sessionStorage.clear();localStorage.setItem('kelime-teneffusu-v2',${JSON.stringify(JSON.stringify(progress))})`);await page.goto(url,350);await waitFor("!!document.querySelector('.berrak-landing')&&!document.getElementById('native-boot')");}
const rawOutput=path.join(out,process.env.METRICS||'metrics.json');
const persist=()=>writeFileSync(rawOutput,JSON.stringify({surface:'Headless Chrome with mobile viewport and emulated safe area; synthetic save and local API fixture',records,errors:page.errors},null,2));
const dismiss=()=>click('dialog[open] .modal-head button');
const openLink=label=>click('[aria-label='+JSON.stringify(label)+']');
let wd;
async function shot(name,mandatory=''){
  await waitFor("!document.querySelector('dialog[open] .screen-load-state')");
  await page.evaluate('document.fonts.ready');await sleep(320);
  if(mandatory)await waitFor('!!document.querySelector('+JSON.stringify(mandatory)+')');
  await page.screenshot(path.join(out,wd+'-'+name+'.png'));
  const m=await page.evaluate(`(()=>{
   const scope=[...document.querySelectorAll('dialog[open]')].at(-1)||document.querySelector('main')||document;
   const rect=e=>{if(!e)return null;const {x,y,width,height,top,bottom}=e.getBoundingClientRect();return {x,y,width,height,top,bottom}};
   const visible=e=>e.checkVisibility({visibilityProperty:true,opacityProperty:true})&&e.getClientRects().length;
   const selectors=['.native-topbar','.native-topbar>button:first-child','.native-topbar .berrak-stars','.native-topbar>button:last-child','.section-heading h1','.section-heading p','.subpage-heading','.arena-stage-heading','.settings-links','.settings-main-actions','.modal-head','footer','.progress-cloud-status','.arena-round-preference'];
   const elements=Object.fromEntries(selectors.map(s=>{const e=document.querySelector(s);return [s,e?{box:rect(e),background:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color,font:getComputedStyle(e).fontSize}:null]}));
   return {headings:[...scope.querySelectorAll('h1,h2')].filter(visible).map(h=>({text:h.innerText,box:rect(h)})).slice(0,5),buttons:[...scope.querySelectorAll('button')].filter(visible).map(e=>({text:e.getAttribute('aria-label')||e.innerText,box:rect(e),bg:getComputedStyle(e).backgroundColor,image:getComputedStyle(e).backgroundImage,icon:!!e.querySelector('svg'),className:e.className})),text:scope.innerText?.slice(0,900),dialog:scope.tagName==='DIALOG'?{classes:scope.className,box:rect(scope)}:null,elements,pageOverflow:document.documentElement.scrollWidth>innerWidth};
  })()`);
  const row={width:wd,name,...m};records.push(row);
  const hasHeading=await page.evaluate(`(()=>{document.querySelector('[data-menu-contrast-heading]')?.removeAttribute('data-menu-contrast-heading');const scope=[...document.querySelectorAll('dialog[open]')].at(-1)||document.querySelector('main')||document;const el=[...scope.querySelectorAll('h1,h2')].find(e=>e.checkVisibility({visibilityProperty:true,opacityProperty:true})&&e.getClientRects().length);if(!el)return false;el.setAttribute('data-menu-contrast-heading','');return true;})()`);
  if(hasHeading)await contrast(row,{heading:'[data-menu-contrast-heading]'});
  else row.missingHeading=true;
  persist();
  console.log(wd,name,row.headings[0]?.text);
  return row;
}
async function contrast(row,targets){
  await page.evaluate("window.__menuPosition=[window.scrollX,window.scrollY,...[...document.querySelectorAll('*')].filter(e=>e.scrollTop||e.scrollLeft||e.scrollHeight>e.clientHeight+2).map(e=>[e,e.scrollLeft,e.scrollTop])];true");
  row.contrast??={};
  for (const [key,selector] of Object.entries(targets)){
    try{row.contrast[key]=await measureDialogText(page,selector);}
    catch(e){row.contrast[key]={error:String(e.message)};}
  }
  await page.evaluate("(()=>{const [x,y,...nodes]=window.__menuPosition;for(const [el,l,t] of nodes)el.scrollTo({left:l,top:t,behavior:'instant'});window.scrollTo({left:x,top:y,behavior:'instant'});delete window.__menuPosition;return true})()");
  await sleep(75);persist();
}
const jobs=[
 ['stars',async()=>{await click('.berrak-stars');await shot('stars','dialog[open]');}],
 ['game-settings',async()=>{await click('.stage-play');await waitFor("!!document.querySelector('.letter-board')");await click('.game-settings-trigger');await shot('game-settings','dialog[open]');}],
 ['more-settings',async()=>{await openLink('Ayarları aç');await textButton('Diğer ayarlar');await textButton('Erişilebilirlik');await shot('settings-accessibility','dialog[open]');}],
 ['arena-friends',async()=>{await openLink('Arena');await textButton('Arkadaşlarım');await shot('friends');}],
 ['stories',async()=>{await openLink('Diğer oyunlar');await textButton('Hikâyeler');await shot('stories','dialog[open]');}],
 ['extra',async()=>{await openLink('Diğer oyunlar');await click('.extra-games-details summary');await shot('other-puzzles','.extra-games-details[open]');await textButton('İpucu Avı');await shot('riddles','dialog[open]');await click('.riddle-shelf .button');await shot('riddle-guide','dialog[open]');}],
 ['themes',async()=>{await openLink('Diğer oyunlar');await click('.extra-games-details summary');await textButton('Serbest oyun');await shot('themes','dialog[open] .free-theme-list');}],
 ['releases',async()=>{await openLink('Diğer oyunlar');await click('.extra-games-details summary');await textButton('Ek bölümler');await shot('releases','dialog[open]');}],
 ['mystery',async()=>{await openLink('Diğer oyunlar');await click('.extra-games-details summary');await textButton('Gizli Tema');await shot('mystery-guide','dialog[open]');}],
 ['daily-guide',async()=>{signedInFixture=true;try{await home();await openLink('Günlük bulmaca');await textButton('Günlük bulmacane başla');await shot('daily-guide','dialog[open]');}finally{signedInFixture=false;}}],
 ['support-details',async()=>{await openLink('Ayarları aç');await textButton('Destek');await waitFor("!!document.querySelector('#support-detail')");await page.evaluate(`(()=>{const el=document.querySelector('#support-detail');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,'Görüntüleme denemesi için örnek metin.');el.dispatchEvent(new Event('input',{bubbles:true}));})()`);await click('.support-preview-toggle');await page.evaluate("document.getElementById('support-preview-panel').scrollIntoView({block:'center',behavior:'instant'})");await shot('support-preview','dialog[open]');}],
 ['privacy-account',async()=>{signedInFixture=true;try{await home();await openLink('Ayarları aç');await textButton('Gizlilik ve hesap');await waitFor("!!document.querySelector('.account-danger button[aria-haspopup=dialog]')");await click('.account-danger button[aria-haspopup=dialog]');await shot('privacy-account','dialog[open]');}finally{signedInFixture=false;}}],
 ['home',async()=>{await shot('home','.berrak-landing');}],
 ['profile',async()=>{await openLink('Oyuncu profilini aç');const pr=await shot('profile','.progress-cloud-status');await contrast(pr,{status:'.progress-cloud-status'});await click('#collection-tab-achievements');await shot('achievements','#collection-panel-achievements');await click('#collection-tab-profile');await textButton('Profil oluştur');await shot('identity','dialog[open]');}],
 ['arena',async()=>{await openLink('Arena');const ar=await shot('arena','.arena-stage');await contrast(ar,{preference:'.arena-stage-dock .arena-round-preference'});await textButton('Sıralama');await shot('arena-ranking','dialog[open] .rankings li');await dismiss();await textButton('Arkadaşlarınla oyna');const friend=await shot('arena-friend','dialog[open] .room-entry-sheet');await contrast(friend,{preference:'.room-entry-sheet .arena-round-preference'});await dismiss();await textButton('Kurallar');await shot('arena-rules','dialog[open]');await dismiss();await textButton('Meydan oku');await shot('challenge');}],
 ['settings',async()=>{await openLink('Ayarları aç');await shot('settings','dialog[open]');await textButton('Diğer ayarlar');await shot('settings-more','dialog[open]');await textButton('Ayarlara dön');await textButton('Nasıl oynanır?');await shot('settings-help','dialog[open]');}],
 ['support',async()=>{await openLink('Ayarları aç');await textButton('Destek');await shot('support','#support-detail');}],
 ['privacy',async()=>{await openLink('Ayarları aç');await textButton('Gizlilik ve hesap');await shot('privacy','dialog[open] .privacy-copy');}],
 ['map',async()=>{await click('.berrak-orbit');await shot('map','.journey-map-world.is-current');await click('.journey-map-world.is-current');await shot('map-chapters','dialog[open]');}],
 ['album',async()=>{await openLink('Albümlerim');await shot('album','dialog[open] .release-album-card');}],
 ['daily',async()=>{await openLink('Günlük bulmaca');await shot('daily');}],
 ['other',async()=>{await openLink('Diğer oyunlar');await shot('other','.extra-games');await textButton('Kısa oyunlar');await shot('short-games','dialog[open]');await textButton('Bonus turları');await shot('bonus-library','.bonus-library');await dismiss();await textButton('Hızlı Tur');await shot('sprint-intro');}],
];
try{
 for(const [w,h] of [[320,568],[393,852]]){
  wd=w;await page.viewport(w,h,2,{top:w===320?20:59,bottom:w===320?0:34,left:0,right:0});
  for(const [task,run] of jobs){
   if(process.env.ONLY&&!process.env.ONLY.split(',').includes(task))continue;
   await home();
   try{await run();}catch(e){console.log('FAIL',w,task,e.message);records.push({width:w,task,error:e.message});persist();}
  }
 }
}finally{persist();await page.close();server.closeAllConnections();await new Promise(res=>server.close(res));}
const failures=[];
for(const row of records){
 const tag=row.width+' '+(row.name||row.task);
 if(row.error||row.pageOverflow||row.missingHeading)failures.push(tag+' '+(row.error||'overflow or missing heading'));
 for(const [sample,values] of Object.entries(row.contrast??{})){
  if(!Array.isArray(values)||!values.length)failures.push(tag+' '+sample+' could not be sampled');
  else if(!baseline)for(const value of values){
   if(!value.pass)failures.push(tag+' '+value.text+' '+value.ratio+' < '+value.required);
  }
 }
 if(baseline||!row.buttons)continue;
 if(row.dialog){
  const filled=row.buttons.filter(button=>button.className.split(' ').includes('button')&&(['rgb(78, 44, 180)','rgb(116, 69, 238)'].includes(button.bg)||button.image.includes('rgb(38, 144, 74)')));
  if(filled.length>1)failures.push(tag+' multiple filled actions: '+filled.map(button=>button.text).join(', '));
 }
 if(row.name==='settings'){
  for(const label of ['Diğer ayarlar','Nasıl oynanır?','Destek','Gizlilik ve hesap']){
   const button=row.buttons.find(button=>button.text===label);
   if(!button?.icon||button.box.height<44)failures.push(tag+' settings row '+label);
  }
 }
}
if(!baseline){
 const names=['profile','achievements','arena','daily','other'];
 for(const width of [320,393]){
  const mainMenus=records.filter(r=>r.width===width&&names.includes(r.name));
  if(mainMenus.length<2)continue;
  for(const selector of ['.native-topbar>button:first-child','.native-topbar .berrak-stars','.native-topbar>button:last-child','.section-heading h1']){
   const rects=mainMenus.map(r=>r.elements[selector]?.box);
   if(rects.some(rect=>!rect||['x','y','width','height'].some(key=>Math.abs(rect[key]-rects[0][key])>.5)))failures.push(width+' inconsistent '+selector);
  }
 }
}
if(failures.length||page.errors.length){
 console.error(JSON.stringify({failures,runtime:page.errors},null,2));
 process.exitCode=1;
}
