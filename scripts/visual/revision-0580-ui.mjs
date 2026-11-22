import {preview} from 'vite';import {mkdirSync,writeFileSync} from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {launch,sleep} from './integrity/cdp.mjs';
const mode=process.argv[2]??'after',root=path.resolve(process.argv[3]??'dist-mobile'),out=path.resolve('../world-review.nosync/release-0580-local/ui',mode);mkdirSync(out,{recursive:true});
const server=await preview({configFile:false,build:{outDir:root},preview:{host:'127.0.0.1',port:0},logLevel:'error'}),url='http://127.0.0.1:'+server.httpServer.address().port;
let p;const rows=[];
async function wait(expr){for(let i=0;i<150;i++){if(await p.eval(expr))return;await sleep(30);}throw Error(expr);}
async function go(query=''){await p.goto(url+'/'+query,300);await wait("!document.querySelector('.game-boot')&&!!document.querySelector('.settings-trigger')");await p.eval('document.fonts.ready');await sleep(700);}
async function click(pattern){assert(await p.clickText(pattern),'Missing '+pattern);await sleep(250);}
try{for(const w of [320,393]){
 p=await launch({port:19400+w+(mode==='before'?1:0)});await p.viewport(w,w===320?568:852,2);
 await go();await click('Ayarları aç');await wait("!!document.querySelector('.settings-home')");await p.shot(path.join(out,`${w}-settings.png`));
 const settings=await p.eval(`(()=>{const elements=[...document.querySelectorAll('.setting-row b,.settings-links button')];return elements.map(e=>{const c=getComputedStyle(e);return {text:e.textContent,font:c.fontSize,weight:c.fontWeight,inset:c.paddingLeft}})})()`);
 await click('Diğer ayarlar');await click('Tahta ve çizgi renkleri');await p.eval("document.querySelector('.palette-options').scrollIntoView({block:'center'})");await p.shot(path.join(out,`${w}-palette.png`));
 const palette=await p.eval(`(()=>{const e=document.querySelector('.palette-options button[aria-pressed=true]'),c=getComputedStyle(e);return {background:c.backgroundColor,color:c.color,border:c.borderColor,check:!!e.querySelector('svg')}})()`);
 await go('?sekme=arena');await wait("!!document.querySelector('.arena-stage')");await p.shot(path.join(out,`${w}-arena.png`));
 const arena=await p.eval(`(()=>{const play=document.querySelector('.stage-play').getBoundingClientRect(),toggle=document.querySelector('.arena-round-preference,.arena-riddle-option,[role=switch]');return {playBottom:play.bottom,toggleTop:toggle?.getBoundingClientRect().top}})()`);
 await go('?sekme=arena&mod=arkadaslar');await wait("!!document.querySelector('.friends-page')");await p.shot(path.join(out,`${w}-friends.png`));
 const friends=await p.eval(`({form:!!document.querySelector('.friend-code-form'),label:document.querySelector('.friends-page header button')?.textContent})`);
 await go('?sekme=arena');await p.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await sleep(200);await p.shot(path.join(out,`${w}-offline.png`));
 const offline=await p.eval(`({art:!!document.querySelector('.arena-stage-art'),title:document.querySelector('#arena-title')?.textContent,card:!!document.querySelector('.network-state')})`);
 await p.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await go('?sekme=arena');await click('Hızlı eşleş');await wait("!!document.querySelector('.network-state')");await p.shot(path.join(out,`${w}-unavailable.png`));
 const unreachable=await p.eval(`({art:!!document.querySelector('.arena-stage-art'),title:document.querySelector('#arena-title')?.textContent,card:!!document.querySelector('.network-state')})`);
 rows.push({w,settings,palette,arena,friends,offline,unreachable});
 if(mode==='after'){assert(settings.every(s=>s.font==='17px'&&s.weight==='600'));assert(palette.check&&palette.background!=='rgb(85, 42, 196)');assert(arena.toggleTop>=arena.playBottom);assert(!friends.form);assert(friends.label.includes('profil'));assert(offline.art&&offline.card&&unreachable.art&&unreachable.card);}
 await p.close('duzgun');p=null;
 }}finally{if(p)await p.close();await server.close();writeFileSync(path.join(out,'measurements.json'),JSON.stringify(rows,null,2));}
console.log(mode+' UI states verified');
