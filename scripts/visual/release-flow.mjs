// Real browser input against isolated fixture storage, never a real account.
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {launch,sleep} from './chrome.mjs';
const out=path.resolve('../world-review.nosync/release-052'),root=path.resolve('dist-mobile');mkdirSync(out,{recursive:true});
const fixture=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/release-fixture.ts'],{encoding:'utf8'}));
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png'};
const server=createServer((req,res)=>{if(req.url.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({authenticated:false,available:false}));return;}let file=path.join(root,new URL(req.url,'http://x').pathname);if(!existsSync(file)||statSync(file).isDirectory())file=path.join(root,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'});createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/`;
const page=await launch({port:9346}),report=[];
try{
 for(const [width,height] of (process.argv.includes('--store-only')?[[430,932]]:[[320,568],[375,667],[414,622],[430,932]])){
  await page.viewport(width,height,width===430?3:1);await page.goto(url);await page.evaluate(`localStorage.clear();localStorage.setItem('kelime-teneffusu-v2',${JSON.stringify(JSON.stringify(fixture.progress))})`);await page.goto(url);
  if(width===430){
   await page.screenshot(path.join(out,'store-01-home.png'));
   await page.evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Yolculuğum')).click()`);await sleep(350);
   await page.screenshot(path.join(out,'store-02-map.png'));
   const worlds=await page.evaluate(`document.querySelectorAll('.journey-map-world').length`);if(worlds!==2)throw Error('Fresh map must show current and next world');
   await page.evaluate(`document.querySelector('.journey-map-all').click()`);await sleep(100);
   if(await page.evaluate(`document.querySelectorAll('.journey-map-world').length`)!==52)throw Error('Map must retain every world');
   await page.evaluate(`document.querySelector('.journey-map-world').click()`);await sleep(150);
   await page.screenshot(path.join(out,'map-chapters.png'));
   await page.evaluate(`document.querySelector('dialog[open] button[aria-label="Kapat"]').click()`);
  }
  const click=await page.evaluate(`(()=>{const b=document.querySelector('.stage-play');if(!b)return document.body.innerText;b.click();return 'ok';})()`);if(click!=='ok')throw Error(click);
  await sleep(700);
  await page.screenshot(path.join(out,`${width}-board.png`));if(width===430)await page.screenshot(path.join(out,'store-03-board.png'));
  for(const p of fixture.chapters[0].placements){
   const bounds=await page.evaluate(`(()=>{const b=document.querySelector('.letter-board').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};})()`);
   const {rows,columns}=fixture.chapters[0].shape,xy=cell=>[bounds.x+(cell[1]+.5)*bounds.w/columns,bounds.y+(cell[0]+.5)*bounds.h/rows];
   const a=xy(p.a),b=xy(p.b),points=Array.from({length:12},(_,i)=>[a[0]+(b[0]-a[0])*i/11,a[1]+(b[1]-a[1])*i/11]);
   await page.touch(points);await sleep(250);
   if(width===430&&p===fixture.chapters[0].placements[0]){await sleep(600);await page.screenshot(path.join(out,'store-04-word.png'));}
  }
  await sleep(1800);await page.screenshot(path.join(out,`${width}-result.png`));
  const result=await page.evaluate(`(()=>{const d=document.querySelector('dialog.scene-result[open]');if(!d)return {error:document.body.innerText};const content=d.querySelector('.modal-content'),footer=d.querySelector('.modal-actions'),head=d.querySelector('.modal-head');content.scrollTop=content.scrollHeight;const c=content.getBoundingClientRect(),f=footer.getBoundingClientRect(),h=head.getBoundingClientRect();return {contentBottom:c.bottom,footerTop:f.top,footerBottom:f.bottom,titleTop:h.top,scrollHeight:content.scrollHeight,clientHeight:content.clientHeight,thumbnailVisible:!!d.querySelector('.result-keepsake-art')?.getClientRects().length,overflow:document.documentElement.scrollWidth>innerWidth};})()`);
  if(width===430){
   await page.screenshot(path.join(out,'store-05-result.png'));
   await page.goto(url);await page.evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Arena').click()`);await sleep(300);
   await page.screenshot(path.join(out,'store-06-arena.png'));
  }
  report.push({width,height,...result});if(result.error||result.overflow||result.footerBottom>height||result.contentBottom>result.footerTop+1||!result.thumbnailVisible)throw Error(JSON.stringify(report));
 }
 writeFileSync(path.join(out,process.argv.includes('--store-only')?'browser-flow-store.json':'browser-flow.json'),JSON.stringify({report,exceptions:page.errors},null,2));console.log(JSON.stringify(report));
}finally{await page.close();server.close();}
