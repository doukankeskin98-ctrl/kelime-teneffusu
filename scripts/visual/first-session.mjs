import {seedProgress} from './seed-progress.mjs';
// Isolated first-session acceptance. No real accounts, progress or live backend.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {launch,sleep} from './chrome.mjs';
const before=process.argv.includes('--before'),out=path.resolve(process.env.EVIDENCE_DIR??'../world-review.nosync/release-053'),root=path.resolve(process.env.BUILD_DIR??'dist-mobile');mkdirSync(out,{recursive:true});
const fixture=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/release-fixture.ts'],{encoding:'utf8'}));
const progress={...fixture.progress,guideDone:false,tutorialDone:false,mechanicGuides:[]};
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png'};
const server=createServer((req,res)=>{if(req.url.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({authenticated:false,available:false}));return;}let file=path.join(root,new URL(req.url,'http://x').pathname);if(!existsSync(file)||statSync(file).isDirectory())file=path.join(root,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'});createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/`,page=await launch({port:Number(process.env.CHROME_PORT??9353)}),report=[];
function readFirstSession(){
 const board=document.querySelector('.letter-board'),guide=document.querySelector('.first-play-guide');
 const dock=document.querySelector('.solo-control-dock'),heading=document.querySelector('dialog[open] .modal-head h2');
 const rect=element=>{
  if(!element)return null;
  const {x,y,width,height,bottom}=element.getBoundingClientRect();
  return {x,y,width,height,bottom};
 };
 const stage=board?.closest('.board-stage');
 const cardTop=stage?rect(stage).y+parseFloat(getComputedStyle(stage,'::before').top):null;
 const cells=board?.querySelectorAll('[data-cell]')??[];
 const controls=Array.from(dock?.querySelectorAll('button')??[],button=>{
  const bounds=rect(button),center=[bounds.x+bounds.width/2,bounds.y+bounds.height/2];
  return {label:button.getAttribute('aria-label')||button.textContent.trim(),...bounds,center,
   reachable:button.contains(document.elementFromPoint(...center))};
 });
 return {text:document.body.innerText,guide:guide?.innerText??null,guideTarget:guide?.querySelector('b')?.textContent,
  guidance:rect(guide?.querySelector('[role=status]')),badge:rect(dock?.querySelector('.hint-button>span')),
  board:rect(board),stage:rect(stage),cardTop,cornerCells:[rect(cells[0]),rect(cells[cells.length-1])],
  panel:rect(document.querySelector('.viewport-targets')),dock:rect(dock),
  controls,overflow:document.documentElement.scrollWidth>innerWidth,dockBottom:rect(dock)?.bottom,
  headingOutline:heading?getComputedStyle(heading).outlineStyle:null,viewport:innerHeight};
}
const read=()=>page.evaluate('('+readFirstSession.toString()+')()');
const capture=async(name,width)=>{
 await page.screenshot(path.join(out,`${before?'before':'after'}-${width}-${name}.png`));
 return read();
};
function assertPlayArea(start,current){
 assert.deepEqual(current.board,start.board,'Learning changed the board bounds');
 assert.deepEqual(current.stage,start.stage,'Learning changed the stage bounds');
 assert.deepEqual(current.cornerCells,start.cornerCells,'Learning moved a corner letter');
 assert.equal(current.overflow,false);
 assert.ok(current.board.bottom<=current.viewport);
 assert.ok(current.dockBottom<=current.viewport+1);
 for(const button of current.controls){
  assert.ok(button.reachable&&button.height>=44,'Unreachable touch target: '+button.label);
  assert.ok(button.width>=44,'Control is too narrow: '+button.label);
 }
 if(current.guidance&&current.viewport<=740){
  const gap=(a,b)=>Math.max(a.x-b.x-b.width,b.x-a.x-a.width);
  for(const box of [...current.controls,current.badge]){
   assert(box,'The visible hint counter has measurable bounds');
   assert(gap(current.guidance,box)>=8,'Guide too close to a control or its counter');
  }
 }

}
try{
 for(const [width,height] of (before?[[320,568],[393,852]]:[[320,568],[375,667],[393,852],[430,932]])){
  await page.viewport(width,height,2,{top:width<=375?20:59,bottom:width<=375?0:34,left:0,right:0});
  await seedProgress(page,url,progress,1000);
  const home=await capture('home',width);await page.evaluate(`document.querySelector('.stage-play').click()`);await sleep(500);const start=await capture('start',width);
  if(!before&&width===320){
   await page.evaluate("document.documentElement.dataset.leftHanded='true'");
   const mirrored=await capture('left-handed',width);assertPlayArea(start,mirrored);
   await page.evaluate("document.documentElement.dataset.leftHanded='false'");
  }
  const chapter=fixture.chapters[0],first=chapter.placements.find(p=>p.label===start.guideTarget)??chapter.placements[0];
  const draw=async(p)=>{const r=await page.evaluate(`(()=>{const b=document.querySelector('.letter-board').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}})()`);const point=c=>[r.x+(c[1]+.5)*r.w/chapter.shape.columns,r.y+(c[0]+.5)*r.h/chapter.shape.rows],a=point(p.a),b=point(p.b);await page.touch(Array.from({length:14},(_,i)=>[a[0]+(b[0]-a[0])*i/13,a[1]+(b[1]-a[1])*i/13]));};
  let hint=null,miss=null;
  if(width===320){
   const hintButton=start.controls.find(b=>b.label.includes('İpucu'));
   await page.touch([hintButton.center]);await sleep(120);
   hint=await capture('hint',width);assert.match(hint.guide,/ilk harf/i);if(!before)assertPlayArea(start,hint);
   const short={...first,b:first.b.map((n,i)=>n-Math.sign(n-first.a[i]))};await draw(short);await sleep(120);
   miss=await capture('near-miss',width);assert.match(miss.guide,/harfine kadar kaydır/);if(!before)assertPlayArea(start,miss);
  }
  await draw(first);const accepted=await read();await sleep(1600);const firstWord=await capture('first-word',width);
  for(const p of chapter.placements.filter(p=>p.id!==first.id)){await draw(p);await sleep(200);}
  await sleep(1600);const finish=await capture('result',width);
  if(!before){
   assert.equal(firstWord.guide,null,'First success must retire the guide without a second confirmation');
   assert.ok(start.controls.some(b=>b.label==='İlk oyun rehberini kapat'));
   assert.ok(firstWord.controls.some(b=>b.label==='Tahtayı döndür'));
   for(const screen of [start,accepted,firstWord])assertPlayArea(start,screen);
   // The panel and board now share one column. Check visible geometry
   // independently of the sizing function and of the old percentage-based gutter.
   const side=start.board.width;
   const sideRoom=(start.panel.width-side)/2;
   const bottomRoom=start.dock.y-start.board.bottom;
   const sideLimit=width===320?22:16;
   assert.ok(sideRoom>=6&&bottomRoom>=10,'First chapter keeps its inside margin and tool clearance');
   assert.ok(sideRoom<=sideLimit||bottomRoom<=2*sideLimit,'First chapter fills its limiting axis');
   assert.ok(Math.abs(start.board.height-side)<=1,'First chapter keeps square cells');
   assert.ok(Math.abs(start.board.x-(start.panel.x+sideRoom))<=1,'First chapter is horizontally centred');
   assert.equal(finish.headingOutline,'none','Programmatic heading focus must not draw a frame');
   await page.key('Tab');
   const focus=await page.evaluate(`({tag:document.activeElement.tagName,label:document.activeElement.getAttribute('aria-label'),outline:getComputedStyle(document.activeElement).outlineStyle})`);
   assert.equal(focus.tag,'BUTTON');assert.notEqual(focus.outline,'none','Keyboard controls keep their visible focus');
  }
  await page.evaluate(`document.querySelector('dialog[open] .modal-actions .primary').click()`);await sleep(500);const next=await capture('next',width);
  if(!before){
   assert.equal(next.guide,null);assert.match(next.text,/Bölüm\s+2\b/iu);
   for(const [element,first,second] of [['target panel',firstWord.panel.y,next.panel.y],['board card',firstWord.cardTop,next.cardTop],['tools',firstWord.dock.y,next.dock.y]]){
    assert.ok(Math.abs(first-second)<=1,`Continuing from chapter 1 to 2 moved the ${element}: ${first} → ${second}`);
   }
  }
  report.push({width,height,home,start,hint,miss,accepted,firstWord,finish,next});
 }
 writeFileSync(path.join(out,`${before?'before':'after'}-first-session.json`),JSON.stringify({report,errors:page.errors},null,2));console.log(JSON.stringify(report.map(r=>({width:r.width,startGuide:r.start.guide,afterFirst:r.firstWord.guide,board:r.firstWord.board,nextGuide:r.next.guide,overflow:r.start.overflow}))));
}finally{await page.close();server.close();}
