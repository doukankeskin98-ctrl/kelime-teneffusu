// Isolated first-session acceptance. No real accounts, progress or live backend.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {launch,sleep} from './chrome.mjs';
const before=process.argv.includes('--before'),out=path.resolve('../world-review.nosync/release-053'),root=path.resolve('dist-mobile');mkdirSync(out,{recursive:true});
const fixture=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/release-fixture.ts'],{encoding:'utf8'}));
const progress={...fixture.progress,guideDone:false,tutorialDone:false,mechanicGuides:[]};
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png'};
const server=createServer((req,res)=>{if(req.url.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({authenticated:false,available:false}));return;}let file=path.join(root,new URL(req.url,'http://x').pathname);if(!existsSync(file)||statSync(file).isDirectory())file=path.join(root,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'});createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/`,page=await launch({port:9353}),report=[];
const capture=async(name,width)=>{await page.screenshot(path.join(out,`${before?'before':'after'}-${width}-${name}.png`));return await page.evaluate(`(()=>{const b=document.querySelector('.letter-board'),g=document.querySelector('.first-play-guide'),r=b?.getBoundingClientRect();return {text:document.body.innerText,guide:g?.innerText??null,board:r?{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}:null,overflow:document.documentElement.scrollWidth>innerWidth,dockBottom:document.querySelector('.solo-control-dock')?.getBoundingClientRect().bottom,headingOutline:document.querySelector('dialog[open] .modal-head h2')?getComputedStyle(document.querySelector('dialog[open] .modal-head h2')).outlineStyle:null,viewport:innerHeight};})()`);};
try{
 for(const [width,height] of (before?[[375,667]]:[[320,568],[375,667],[414,622],[430,932]])){
  await page.viewport(width,height,1);await page.goto(url);await page.evaluate(`localStorage.clear();localStorage.setItem('kelime-teneffusu-v2',${JSON.stringify(JSON.stringify(progress))})`);await page.goto(url);
  const home=await capture('home',width);await page.evaluate(`document.querySelector('.stage-play').click()`);await sleep(500);const start=await capture('start',width);
  const chapter=fixture.chapters[0],first=chapter.placements.find(p=>p.label===start.guide?.split('\n')[0])??chapter.placements[0];
  const draw=async(p)=>{const r=await page.evaluate(`(()=>{const b=document.querySelector('.letter-board').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}})()`);const point=c=>[r.x+(c[1]+.5)*r.w/chapter.shape.columns,r.y+(c[0]+.5)*r.h/chapter.shape.rows],a=point(p.a),b=point(p.b);await page.touch(Array.from({length:14},(_,i)=>[a[0]+(b[0]-a[0])*i/13,a[1]+(b[1]-a[1])*i/13]));};
  if(!before&&width===320){
   await page.evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('İpucu')).click()`);await sleep(120);
   const hint=await capture('hint',width);assert.match(hint.guide,/ilk harf/i);assert.equal(hint.board.y,start.board.y);
   const short={...first,b:first.b.map((n,i)=>n-Math.sign(n-first.a[i]))};await draw(short);await sleep(120);
   const miss=await capture('near-miss',width);assert.match(miss.guide,/harfine kadar kaydır/);assert.equal(miss.board.y,start.board.y);
  }
  await draw(first);await sleep(1600);const firstWord=await capture('first-word',width);
  for(const p of chapter.placements.filter(p=>p.id!==first.id)){await draw(p);await sleep(200);}
  await sleep(1600);const finish=await capture('result',width);
  if(!before){
   assert.equal(firstWord.guide,null,'First success must retire the guide without a second confirmation');
   assert.ok(Math.abs(start.board.y-firstWord.board.y)<2,'Learning must not move the board top');
   for(const screen of [start,firstWord]){assert.equal(screen.overflow,false);assert.ok(screen.board.bottom<=height);assert.ok(screen.dockBottom<=height+1);}
   assert.equal(finish.headingOutline,'none','Programmatic heading focus must not draw a frame');
   await page.key('Tab');
   const focus=await page.evaluate(`({tag:document.activeElement.tagName,label:document.activeElement.getAttribute('aria-label'),outline:getComputedStyle(document.activeElement).outlineStyle})`);
   assert.equal(focus.tag,'BUTTON');assert.notEqual(focus.outline,'none','Keyboard controls keep their visible focus');
  }
  await page.evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Sonraki bölüm')).click()`);await sleep(500);const next=await capture('next',width);
  if(!before){assert.equal(next.guide,null);assert.match(next.text,/Bölüm 2/);}
  report.push({width,height,home,start,firstWord,finish,next});
 }
 writeFileSync(path.join(out,`${before?'before':'after'}-first-session.json`),JSON.stringify({report,errors:page.errors},null,2));console.log(JSON.stringify(report.map(r=>({width:r.width,startGuide:r.start.guide,afterFirst:r.firstWord.guide,board:r.firstWord.board,nextGuide:r.next.guide,overflow:r.start.overflow}))));
}finally{await page.close();server.close();}
