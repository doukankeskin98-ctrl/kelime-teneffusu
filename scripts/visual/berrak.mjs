// Render the four reference states using the production client and an isolated synthetic save.
import {measureDialogText} from './dialog-contrast.mjs';
import {verifyResultLayout} from './result-layout.mjs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync,statSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {launch,sleep} from './chrome.mjs';

const out=path.resolve(process.env.EVIDENCE_DIR??'../world-review.nosync/release-0570/screens');
const moments=process.argv.includes('--moments');
const polish=process.argv.includes('--polish');
const surfaceCheck=process.argv.includes('--surfaces');
const readabilityOnly=process.argv.includes('--readability-only');
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
async function verifyReadableDialogs(width){
 async function inspect(name,title){
  await waitFor("document.querySelector('dialog[open] h2')?.textContent==="+JSON.stringify(title));
  if(name.startsWith('privacy'))await waitFor("!!document.querySelector('dialog[open] .privacy-copy p')");
  if(name.startsWith('support'))await waitFor("!!document.querySelector('dialog[open] #support-detail')");
  await waitFor("!document.querySelector('dialog[open] .screen-load-state')");
  await page.evaluate('document.fonts.ready');await sleep(240);
  const guideCTA=await page.evaluate(`(()=>{
   const dialog=document.querySelector('dialog.mechanic-guide[open]');if(!dialog)return null;
   const button=dialog.querySelector('footer button'),b=button.getBoundingClientRect(),d=dialog.getBoundingClientRect();
   const visible=b.top>=d.top && b.bottom<=d.bottom+1 && b.left>=d.left && b.right<=d.right+1 &&
    [b.top+5,b.bottom-5].every(y=>button.contains(document.elementFromPoint(b.x+b.width/2,y)));
   return {title:dialog.querySelector('h2').innerText,top:b.top,bottom:b.bottom,visible};
  })()`);
  if(guideCTA){records.push({width,guideCTA});if(!baseline)assert(guideCTA.visible,JSON.stringify(guideCTA));}
  await shot(width,name);
  if(guideCTA&&polish){
   await page.touch([[width/2, (guideCTA.top+guideCTA.bottom)/2]]);
   if(!baseline)await waitFor("!document.querySelector('dialog.mechanic-guide[open]')");
   return [];
  }
  const rows=await measureDialogText(page);
  assert(rows.length>=4,name+' missing dialog text');
  writeFileSync(path.join(out,width+'-'+name+'-contrast.json'),JSON.stringify(rows,null,2));
  return rows.filter(row=>!row.pass).map(row=>name+': '+row.text+' ('+row.ratio+')');
 }
 const failures=[];
 for(const [name,title] of polish?[]:[['privacy','Gizlilik ve hesap'],['support','Destek']]){
  await home();await click('[aria-label="Ayarları aç"]');await textButton(title);
  failures.push(...await inspect(name,title));
  if(name==='support'){
   await page.evaluate(`(()=>{const field=document.querySelector('#support-detail');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(field,'Deneme sırasında ipucu düğmesine dokundum.');field.dispatchEvent(new Event('input',{bubbles:true}));})()`);
   await click('.support-preview-toggle');
   await waitFor("!document.querySelector('.support-report .primary').disabled");
   failures.push(...await inspect('support-preview',title));
  }
 }
 for(const [name,button,title] of [['riddle','İpucu Avı','Tanımı çöz, kelimeyi bul'],['mystery','Gizli Tema','Ortak bağlantıyı bul']]){
  await home();await click('[aria-label="Diğer oyunlar"]');await click('.extra-games-details summary');await textButton(button);
  if(name==='riddle')await click('.riddle-shelf .button');
  failures.push(...await inspect(name,title));
 }
 await home(fixture.concealedProgress);await click('.stage-play');
 failures.push(...await inspect('concealed','Saklı kelimeyi keşfet'));
 await home();signedInFixture=true;
 try{await click('[aria-label="Günlük bulmaca"]');
  await waitFor("document.querySelector('.daily-studio-copy button')?.textContent.includes('Günün keşfine başla')");
  await textButton('Günün keşfine başla');
  failures.push(...await inspect('daily-guide','Bugünün ortak tahtası'));
  if(polish)return;
  await home();await click('[aria-label="Ayarları aç"]');await textButton('Gizlilik ve hesap');
  await waitFor("!!document.querySelector('.account-danger button[aria-expanded]')");
  await click('.account-danger button[aria-expanded]');
  failures.push(...await inspect('privacy-account','Gizlilik ve hesap'));
 }finally{signedInFixture=false;}
 if(!baseline)assert.deepEqual(failures,[],'Dialog text contrast');
}
async function recordPlayMoments(width){
 const record=async(name,action)=>{
  const dir=path.join(out,width+'-'+name);await page.startRecording(dir);
  try{await action();}finally{await page.stopRecording();}
 };
 await home(fixture.concealedProgress);await click('.stage-play');await waitFor("!!document.querySelector('dialog.mechanic-guide[open]')");
 await record('01-rehber',async()=>{
  await sleep(300);const center=await page.evaluate("(()=>{const b=document.querySelector('.mechanic-guide footer button').getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()");
  await page.touch([center]);await sleep(350);
 });
 await home();await click('.stage-play');await waitFor("!!document.querySelector('.letter-board')");await sleep(350);
 await record('02-iki-kelime',async()=>{
  for(let i=1;i<=2;i++){
   await draw(fixture.words[i],async step=>{
    if(step===0&&i===2&&!baseline)assert(await page.evaluate("!!document.querySelector('.word-flight-glyph')"),'previous flight still visible');
    if(step===5){
     const colors=await page.evaluate(`(()=>{
      const cell=document.querySelector('.letter-selected'),line=document.querySelector('.active-selection line:last-child');
      const css=getComputedStyle(line),rgb=s=>s.match(/[0-9.]+/g).slice(0,3).map(Number);
      const lum=values=>values.map(c=>c/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((a,v,k)=>a+v*[.2126,.7152,.0722][k],0);
      const foreground=lum(rgb(getComputedStyle(cell).color)),ink=rgb(css.stroke);
      let alpha=Number(css.strokeOpacity);
      for(let layer=line;layer&&!layer.classList.contains('letter-board');layer=layer.parentElement)alpha*=Number(getComputedStyle(layer).opacity);
      const paper=rgb(getComputedStyle(document.querySelector('.letter-board')).backgroundColor);
      const bg=lum(ink.map((c,j)=>alpha*c+(1-alpha)*paper[j]));
      return {text:cell.textContent,alpha,ratio:(Math.max(foreground,bg)+.05)/(Math.min(foreground,bg)+.05)};
     })()`);records.push({width,selection:colors});if(!baseline)assert(colors.ratio>=4.5,JSON.stringify(colors));
    }
   });
  }
  await sleep(1150);
 });
 for(const [number,reduced] of [[3,false],[6,false],[3,true]]){
  const f=fixture.finishes.find(item=>item.number===number);await page.reducedMotion(reduced);
  await home(f.seed);await click('.stage-play');await waitFor("!!document.querySelector('.letter-board')");await sleep(350);
  await record((number===3?'03-sonraki-bolum':'04-dunya-finali')+(reduced?'-az-hareket':''),async()=>{
   await page.evaluate(`(()=>{
    window.__lightCount=0;
    const times=window.__finishTimes={},initial=document.querySelectorAll('.board-ink .found-stroke').length;
    const watch=new MutationObserver(()=>{
     window.__lightCount=Math.max(window.__lightCount,document.querySelectorAll('.reward-light').length);
     if(!times.word&&document.querySelectorAll('.board-ink .found-stroke').length>initial)times.word=performance.now();
     if(!times.dialog&&document.querySelector('dialog[open] .result-continue'))times.dialog=performance.now();
    });
    watch.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});setTimeout(()=>watch.disconnect(),2900);
   })()`);
   await draw(f.word,undefined,f.shape);await waitFor("!!document.querySelector('dialog[open] .result-continue')");await sleep(820);
   const result=await page.evaluate("({dialogMs:Math.round(window.__finishTimes.dialog-window.__finishTimes.word),lights:window.__lightCount,confetti:!!document.querySelector('dialog .celebration-particles'),stars:document.querySelector('.result-stars-total')?.innerText})");
   records.push({width,number,reduced,...result});
   if(!baseline){
    assert.equal(result.lights>0,!reduced,'light reaches a newly earned piece');
    assert.equal(result.confetti,number===6&&!reduced,'special celebration for world finale');
    assert.equal(result.stars,'+3');
    assert(result.dialogMs>=0&&result.dialogMs<=2600,JSON.stringify(result));
   }
   if(number===3){
    const center=await page.evaluate("(()=>{const b=document.querySelector('.result-continue').getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()");
    await page.touch([center]);await waitFor("document.querySelector('.play-chapter-number')?.innerText.includes('4')");
    await sleep(300);
   }
  });
 }
 await page.reducedMotion(false);
 if(!baseline){
  const last=fixture.finishes.find(item=>item.number===3);
  await home(last.seed);await click('.stage-play');await waitFor("!!document.querySelector('.letter-board')");
  await draw(last.word,undefined,last.shape);
  await waitFor("!!document.querySelector('.journey-skip-reward')");
  await sleep(320);
  const point=await page.evaluate("(()=>{const r=document.querySelector('.letter-board').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()");
  await page.touch([point]);
  assert(await page.evaluate("!!document.querySelector('dialog[open] .result-continue')&&!document.querySelector('.reward-light')"),'tap settles the final result immediately');
 }
}
async function settingsContrast(width){
 await home();await click('[aria-label="Ayarları aç"]');await textButton('Diğer ayarlar');
 await waitFor("!!document.querySelector('.settings-sheet .game-disclosure-trigger')");
 for(const title of ['Ses düzeyi','Erişilebilirlik','Tahta ve çizgi renkleri','Kullanım verileri'])await textButton(title);
 await shot(width,'more-settings-open');
 const settings=await measureDialogText(page);
 await home();await click('[aria-label="Oyuncu profilini aç"]');await click('#collection-tab-achievements');
 await shot(width,'achievements');const achievements=await measureDialogText(page,'#collection-panel-achievements');
 const rows=[...settings,...achievements];writeFileSync(path.join(out,width+'-settings-achievements.json'),JSON.stringify(rows,null,2));
 if(!baseline)assert.deepEqual(rows.filter(r=>!r.pass).map(r=>[r.text,r.ratio]),[],'Settings and achievements');
}
async function verifyChapterTransitions(width){
 for(const {number,seed,shape,word} of fixture.finishes){
  await home(seed);await click('.stage-play');
  await waitFor("!!document.querySelector('.letter-board')");await sleep(400);
  await draw(word,undefined,shape);
  await waitFor("!!document.querySelector('dialog[open] .result-continue')");await sleep(950);
  await shot(width,'chapter-'+number+'-result');
  if(number===6){
   assert.match(await page.evaluate("document.querySelector('.result-continue').textContent"),/Bonus turu/i);
   assert.equal(await page.evaluate("document.querySelector('dialog[open] h2').textContent"),'Dünya tamam!');
   await click('.result-bonus');await waitFor("!!document.querySelector('.world-arrival')");
   const welcome=await page.evaluate("document.querySelector('.world-arrival').innerText");
   assert.match(welcome,/Anadolu Patikası/i);if(!baseline)assert.match(welcome,/Yeni dünya!/iu);
   await shot(width,'chapter-7-arrival');
  }else{
   if(!baseline)assert.equal(await page.evaluate("document.querySelector('dialog[open] h2').textContent"),'Tebrikler!');
   assert.match(await page.evaluate("document.querySelector('.result-unlock-notice').textContent"),/açıldı/);
   assert.equal(await page.evaluate("document.querySelector('.result-continue').textContent"),'Bölüm '+(number+1));
  }
 }
}
async function verifySideScreens(width){
 const bonus=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/rhythm-fixture.ts'],{encoding:'utf8'})).bonus;
 const css=selector=>page.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error(${JSON.stringify(selector)});const s=getComputedStyle(e);return {text:s.color,background:s.backgroundColor,stroke:s.stroke,fill:s.backgroundImage}})()`);
 await home();await shot(width,'home');
 for(const [selector,name] of [['.berrak-orbit','map'],['[aria-label="Albümlerim"]','album'],['[aria-label="Ayarları aç"]','settings']]){
  await click(selector);await shot(width,name);
  if(!baseline&&name==='settings'){
   assert.equal(await page.evaluate("document.querySelectorAll('.settings-main-actions button').length"),1);
   assert(await page.evaluate("[...document.querySelectorAll('.settings-links button')].some(b=>b.textContent==='Destek')"));
   await textButton('Destek');await waitFor("!!document.querySelector('.support-kinds')");
  }
  if(name==='album'||name==='map'){
   const style=await css(name==='album'?'.journey-albums .section-title p':'.journey-map-heading>span');
   const rgb=style.text.match(/\d+/g).slice(0,3).map(n=>Number(n)/255);
   const [r,g,b]=rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
   const ratio=1.05/(.2126*r+.7152*g+.0722*b+.05);
   records.at(-1).textContrastOnWhite=ratio;
   if(!baseline)assert(ratio>=4.5,name+' text contrast on white: '+ratio);
  }
  await home();
 }
 await click('[aria-label="Diğer oyunlar"]');await textButton('Kısa oyunlar');await textButton('Bonus turları');await click('.bonus-library .event-menu button');
 await waitFor("!!document.querySelector('.bonus-ready')");await sleep(650);await shot(width,'bonus-ready');
 if(!baseline){
  assert.equal((await css('.bonus-target')).background,'rgb(116, 69, 238)');
  assert.equal((await css('.bonus-ready>div')).background,'rgb(255, 255, 255)');
  assert.match((await css('.bonus-ready .stage-play')).fill,/linear-gradient/);
  assert.equal((await css('.bonus-time-remaining')).stroke,(await css('.bonus-target')).background);
  assert.equal((await css('.bonus-discoveries i')).background,'rgb(255, 200, 61)');
  assert(await page.evaluate("!!document.querySelector('.bonus-session .board-stars')"));
 }
 await click('.bonus-ready .stage-play');await shot(width,'bonus-playing');
 for(const placement of bonus.placements)await draw(placement,undefined,bonus.shape);
 await waitFor("!!document.querySelector('.bonus-outcome .result-continue')");await sleep(450);await shot(width,'bonus-result');
 if(!baseline){
  assert.equal(await page.evaluate("document.querySelector('.result-continue').innerText.trim().toLocaleLowerCase('tr')"),'devam et');
  if(width>=393){
   const single=await page.evaluate("(()=>{const e=document.querySelector('.bonus-outcome h2');const r=new Range();r.selectNodeContents(e);return r.getClientRects().length===1})()");
   assert(single,'bonus heading should fit on one line');
  }
 }

 await home(fixture.ordinaryFinale.progress);await click('.stage-play');
 await waitFor("!!document.querySelector('.letter-board')");await sleep(360);
 await draw(fixture.ordinaryFinale.word,undefined,fixture.ordinaryFinale.shape);
 await waitFor("!!document.querySelector('.journey-skip-reward')");
 if(!baseline)assert.equal((await css('.journey-skip-reward')).background,'rgb(116, 69, 238)');
 await shot(width,'continue-to-result');
 await waitFor("!!document.querySelector('dialog[open] .result-continue')");
 await sleep(1000);await shot(width,'earned-piece');
}
try{
 const sizes=moments?[[320,568],[393,852]]:polish?[[320,568],[375,667],[393,852],[430,932]]:surfaceCheck?[[320,568],[393,852]]:process.env.MENUS_ONLY?[[393,852]]:[[320,568],[375,667],[393,852],[430,932]];
 for(const [w,h] of sizes.filter(([w])=>!process.env.VIEWPORT||w===Number(process.env.VIEWPORT))){
  if(moments){await page.viewport(w,h,1,{top:w===320?20:59,bottom:w===320?0:34,left:0,right:0});await recordPlayMoments(w);continue;}
  if(polish){
   await page.viewport(w,h,1,{top:w<=375?20:59,bottom:w<=375?0:34,left:0,right:0});
   await verifyReadableDialogs(w);if(w===320||w===393)await settingsContrast(w);continue;
  }
  if(surfaceCheck){
   await page.viewport(w,h,2,{top:w===320?20:59,bottom:w===320?0:34,left:0,right:0});
   await verifyReadableDialogs(w);
   if(!readabilityOnly){await verifyChapterTransitions(w);await verifySideScreens(w);}
   continue;
  }
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
  if(w===393)await verifyResultLayout(page,'world-unlocked',out);
  await home(fixture.ordinaryFinale.progress);await click('.stage-play');
  await waitFor("!!document.querySelector('.letter-board')");await sleep(360);
  await draw(fixture.ordinaryFinale.word,undefined,fixture.ordinaryFinale.shape);
  await waitFor("!!document.querySelector('dialog[open] .result-continue')");
  await sleep(850);await shot(w,'result');
  if(w===393)await verifyResultLayout(page,'ordinary',out);
  assert(await page.evaluate("!!document.querySelector('dialog[open] .primary')"),'result primary');
 }
 assert.deepEqual(page.errors,[]);console.log('Verified',records.length,'Berrak screen states');
}finally{writeFileSync(path.join(out,'report.json'),JSON.stringify({records,errors:page.errors},null,2));await page.close();server.close();}
