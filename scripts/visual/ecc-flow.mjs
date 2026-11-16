// Isolated menus and deferred-screen recovery. No live API or player storage.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {launch,sleep} from './chrome.mjs';
const before=process.argv.includes('--before'),out=path.resolve('../world-review.nosync/ecc-057'),root=path.resolve('dist-mobile');
mkdirSync(out,{recursive:true});
const fixture=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/release-fixture.ts'],{encoding:'utf8'}));
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png'};
let failSupport=false,failedRequests=0;
const server=createServer((req,res)=>{
 if(req.url.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({authenticated:false,available:false}));return;}
 if(failSupport&&/SupportReport-.*\.js/.test(req.url)){failedRequests++;res.writeHead(503);res.end('isolated network failure');return;}
 let file=path.join(root,new URL(req.url,'http://x').pathname);if(!existsSync(file)||statSync(file).isDirectory())file=path.join(root,'index.html');
 res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'});createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}/`,page=await launch({port:9357}),report=[];
const click=async text=>{await page.evaluate(`(()=>{const b=Array.from(document.querySelectorAll('dialog[open] button, .native-topbar button')).find(b=>b.textContent.trim()===${JSON.stringify(text)}||b.getAttribute('aria-label')===${JSON.stringify(text)});if(!b)throw Error('Button missing: '+${JSON.stringify(text)});b.click();})()`);await sleep(250);};
const capture=async(name,width)=>{await page.screenshot(path.join(out,`${before?'before':'after'}-${width}-${name}.png`));return page.evaluate(`(()=>{const d=document.querySelector('dialog[open]'),r=d?.getBoundingClientRect();return {text:d?.innerText,dialog:r?{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}:null,overflow:document.documentElement.scrollWidth>innerWidth,focus:document.activeElement?.textContent,buttons:d?Array.from(d.querySelectorAll('button')).filter(b=>b.getClientRects().length).map(b=>({text:b.textContent,h:b.getBoundingClientRect().height})):[]};})()`);};
try{
 for(const [width,height] of [[320,568],[375,667],[430,932]]){
  await page.viewport(width,height,1);await page.goto(url);await page.evaluate(`localStorage.clear();localStorage.setItem('kelime-teneffusu-v2',${JSON.stringify(JSON.stringify(fixture.progress))})`);await page.goto(url);
  await click('Ayarları aç');const settings=await capture('settings',width);
  await click('Diğer ayarlar');await click('Erişilebilirlik');const more=await capture('more',width);
  await click('Ayarlara dön');await click('Kapat');
  const dismissed=await page.evaluate(`document.querySelectorAll('dialog[open]').length`);
  assert.equal(dismissed,0);assert.equal(settings.overflow,false);assert.equal(more.overflow,false);
  report.push({width,height,settings,more});
 }
 // A late module download must recover without restarting the app or losing its context.
 failSupport=true;await click('Ayarları aç');await click('Destek');await sleep(300);
 const failure=await capture('support-failed',430);assert(failedRequests>0);
 const beforeRecovery=await page.evaluate(`({time:performance.timeOrigin,save:localStorage.getItem('kelime-teneffusu-v2')})`);
 failSupport=false;
 if(!before){await click('Yeniden dene');await sleep(700);}
 const recovered=await capture('support-recovered',430),afterRecovery=await page.evaluate(`({time:performance.timeOrigin,save:localStorage.getItem('kelime-teneffusu-v2')})`);
 const contrast=before?[]:await page.evaluate(`(()=>{
  const rgba=s=>{const v=s.match(/[\\d.]+/g)?.map(Number)??[0,0,0,0];return [...v.slice(0,3),v[3]??1];};
  const over=(fg,bg)=>fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3]));
  const background=el=>{if(!el)return [255,255,255];return over(rgba(getComputedStyle(el).backgroundColor),background(el.parentElement));};
  const light=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  return Array.from(document.querySelectorAll('.support-kinds legend,.support-kinds button')).map(el=>{const bg=background(el),fg=over(rgba(getComputedStyle(el).color),bg),a=light(fg),b=light(bg);return {text:el.textContent,foreground:fg,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),height:el.getBoundingClientRect().height};});
 })()`);
 if(!before){assert.match(recovered.text,/Sorun türü/);assert.equal(await page.evaluate(`!!document.querySelector('#support-detail')`),true);assert.deepEqual(afterRecovery,beforeRecovery);}
 writeFileSync(path.join(out,`${before?'before':'after'}-menus.json`),JSON.stringify({report,failure,recovered,contrast,failedRequests,errors:page.errors},null,2));
 if(!before)for(const row of contrast)assert(row.ratio>=4.5,`${row.text}: contrast ${row.ratio}`);
 console.log(JSON.stringify({menus:report.map(r=>({width:r.width,settings:r.settings.dialog,more:r.more.dialog})),failure:failure.text,recovered:recovered.text}));
}finally{await page.close();server.close();}
