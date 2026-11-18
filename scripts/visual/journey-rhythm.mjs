// Real local UI + touch input; synthetic progress, no live account or server.
import {verifyResultLayout} from './result-layout.mjs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {launch,sleep} from './chrome.mjs';
const before=process.argv.includes('--before'),out=path.resolve(process.env.EVIDENCE_DIR??'../world-review.nosync/release-0530'),root=path.resolve('dist-mobile');mkdirSync(out,{recursive:true});
const f=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/rhythm-fixture.ts'],{encoding:'utf8'}));
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png'};
const server=createServer((req,res)=>{if(req.url.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({authenticated:false,available:false}));return;}let file=path.join(root,new URL(req.url,'http://x').pathname);if(!existsSync(file)||statSync(file).isDirectory())file=path.join(root,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'});createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/`,page=await launch({port:9354}),report=[];
const click=async(label)=>page.evaluate(`(()=>{const b=Array.from(document.querySelectorAll('button')).find(b=>(b.getAttribute('aria-label')??'').startsWith(${JSON.stringify(label)})||b.textContent.trim().toLocaleLowerCase('tr').startsWith(${JSON.stringify(label)}.toLocaleLowerCase('tr')));if(!b)throw Error('Missing '+${JSON.stringify(label)});b.click()})()`);
async function seed(progress){await page.goto(url);await page.evaluate(`localStorage.clear();localStorage.setItem('kelime-teneffusu-v2',${JSON.stringify(JSON.stringify(progress))})`);await page.goto(url);await click('Bölüm');await sleep(450);}
async function draw(chapter,p,afterPoint){const r=await page.evaluate(`(()=>{const b=document.querySelector('.letter-board').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}})()`);const point=c=>[r.x+(c[1]+.5)*r.w/chapter.shape.columns,r.y+(c[0]+.5)*r.h/chapter.shape.rows],a=point(p.a),b=point(p.b);await page.touch(Array.from({length:12},(_,i)=>[a[0]+(b[0]-a[0])*i/11,a[1]+(b[1]-a[1])*i/11]),afterPoint);}
async function capture(name,width){await page.screenshot(path.join(out,`${before?'before':'after'}-${width}-${name}.png`));return page.evaluate(`(()=>{const b=document.querySelector('.letter-board')?.getBoundingClientRect(),p=document.querySelector('.play-praise'),primary=document.querySelector('dialog[open] .modal-actions .primary');return {ancestors:(()=>{const a=[];for(let e=document.querySelector('.bonus-ready');e;e=e.parentElement){const s=getComputedStyle(e);a.push({cls:e.className,opacity:s.opacity,background:s.background,transform:s.transform,animation:s.animation})}return a})(),geometry:Array.from(document.querySelectorAll('.result-star-stage,.result-world,.result-world-medallion,.result-world-caption,.journey-result-details,.bonus-ready,.modal-content,.modal-actions')).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {cls:e.className,x:r.x,y:r.y,w:r.width,h:r.height,margin:s.margin,padding:s.padding,opacity:s.opacity,order:s.order}}),wide:Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({cls:e.className,w:e.getBoundingClientRect().width})),text:document.body.innerText,praise:p&&!p.hidden?p.textContent:null,praiseAnimation:p&&!p.hidden?getComputedStyle(p).animationName:null,praisePointer:p&&!p.hidden?getComputedStyle(p).pointerEvents:null,primary:primary?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,board:b?{top:b.top,bottom:b.bottom,width:b.width,height:b.height}:null};})()`);}
try{
 for(const [width,height] of before?[[375,667]]:[[320,568],[375,667],[393,852],[430,932]].filter(([w])=>!process.env.VIEWPORT||w===Number(process.env.VIEWPORT))){
  await page.viewport(width,height,1);await seed(f.progress);const start=await capture('start',width);assert(start.board);
  if(!before&&width===430)await page.evaluate(`document.documentElement.dataset.reduceMotion='true'`);
  await draw(f.chapters[0],f.chapters[0].placements[0]);await sleep(150);
  if(!before&&width!==430){const arrival=await page.evaluate(`(()=>{const e=document.querySelector('[data-word-arriving=true]'),l=e?.querySelector('[data-target-letter]');return {arriving:!!e,line:l?getComputedStyle(l,'::after').opacity:null};})()`);assert.equal(arrival.arriving,true);assert.equal(arrival.line,'0','completion line waits for letter arrival');}
  await draw(f.chapters[0],f.chapters[0].placements[1]);const praise=await capture('praise',width);
  if(!before){assert.equal(praise.praise,'Çok iyi!');assert.equal(praise.praisePointer,'none');assert.deepEqual(praise.board,start.board);if(width===430)assert.equal(praise.praiseAnimation,'none');}
  const nextWord=f.chapters[0].placements[2],heldSelection=[];
  await draw(f.chapters[0],nextWord,before?undefined:async step=>{
   if(step!==0&&step!==5)return;
   const sample=await page.evaluate(`(async()=>{
    ${step===0?'':'await new Promise(requestAnimationFrame);'}
    const bubble=document.querySelector('.selection-bubble'),praise=document.querySelector('.play-praise');
    const visible=el=>!!el.getClientRects().length&&getComputedStyle(el).visibility==='visible'&&getComputedStyle(el).opacity!=='0';
    return {letters:bubble.innerText.trim(),bubble:visible(bubble),praise:visible(praise)};
   })()`);
   const length=1+Math.round((nextWord.text.length-1)*step/11);
   assert.deepEqual(sample,{letters:nextWord.text.slice(0,length),bubble:true,praise:false},`next selection at touch sample ${step}`);
   heldSelection.push(sample);
  });
  const continued=await capture('continued',width);
  if(!before){
   assert.equal(continued.praise,null,'previous praise does not reappear on release');
   assert.equal(await page.evaluate(`document.querySelector('.selection-bubble').getClientRects().length`),0,'completed word clears the preview');
  }
  if(!before&&width===375){
   await seed(f.newWorld);for(const p of f.chapters[2].placements)await draw(f.chapters[2],p);await sleep(2300);const opened=await capture('new-world-result',width);assert.match(await page.evaluate(`document.querySelector('.result-unlock-notice')?.textContent`),/Anadolu Patikası açıldı/);assert.equal(opened.overflow,false);
   await click('Bir daha oyna');await sleep(500);for(const p of f.chapters[2].placements)await draw(f.chapters[2],p);await sleep(2300);const replay=await capture('replayed-result',width);assert(!await page.evaluate(`!!document.querySelector('.result-unlock-notice')`));assert.match(replay.text,/Yeniden keşfettin/);assert.equal(await page.evaluate(`document.querySelectorAll('.world-piece.just-earned').length`),0);
  }
  await seed(f.worlds);const sixth=await capture('sixth',width);assert.match(sixth.text,/Bölüm\s+6\b/iu);
  if(!before&&(width===375||width===430)){
   if(width===430)await page.evaluate("document.documentElement.dataset.reduceMotion='true'");
   await page.evaluate(`(() => {
    const play = document.querySelector('.quiet-play'), board = play.querySelector('.letter-board');
    const ink = board.querySelector('.board-ink'), letters = board.querySelector('.letter-grid'), rack = play.querySelector('.viewport-targets');
    window.exitInkFrames = [];
    const observer = new MutationObserver(() => {
     if (play.dataset.resultPhase !== 'exit') return;
     observer.disconnect();
     function sample() {
      if (play.dataset.resultPhase !== 'exit') return;
      const rect = board.getBoundingClientRect();
      window.exitInkFrames.push({
       x: rect.x, y: rect.y, width: rect.width, height: rect.height,
       paper: Number(getComputedStyle(board, '::after').opacity), letters: Number(getComputedStyle(letters).opacity),
       ink: Number(getComputedStyle(ink).opacity), rack: Number(getComputedStyle(rack).opacity),
       stage: Number(getComputedStyle(board.closest('.board-stage')).opacity),
       base: getComputedStyle(board).backgroundColor, paths: ink.querySelectorAll('.found-stroke:not(.is-pending)').length,
      });
      requestAnimationFrame(sample);
     }
     sample();
    });
    observer.observe(play, {attributes: true, attributeFilter: ['data-result-phase']});
   })()`);
  }
  if(!before&&width===375)await page.startRecording(path.join(out,'result-recording'));
  for(const p of f.chapters[5].placements)await draw(f.chapters[5],p);
  await sleep(2300);if(!before&&width===375)await page.stopRecording();
  const result=await capture('world-result',width);
  if(!before&&width===393)await verifyResultLayout(page,'world-complete',out);
  if(before){report.push({width,start,praise,result});continue;}
  if(width===375||width===430){
   const frames=await page.evaluate('window.exitInkFrames');
   writeFileSync(path.join(out,`exit-ink-${width}.json`),JSON.stringify(frames));
   if(width===430)assert.equal(frames.length,0,'Reduced motion opens the result directly');
   else{
    const lingering=frames.find(frame=>frame.paper<.05&&frame.letters<.05&&frame.rack<.05&&frame.ink>.95&&frame.stage===1);
    assert(lingering,'The completed paths remain visible on the scene after the paper and letters fade');
    assert.equal(lingering.base,'rgba(0, 0, 0, 0)');
    assert.equal(lingering.paths,f.chapters[5].placements.length);
    for(const key of ['x','y','width','height'])assert(Math.abs(lingering[key]-frames[0][key])<=1,'Stationary ink: '+key);
   }
  }
  assert.match(result.primary,/Bonus turu/i);for(const g of result.geometry.filter(g=>['result-star-stage','result-world','journey-result-details'].includes(g.cls))){const panel=result.geometry.find(g=>g.cls==='modal-content');assert(g.y+g.h<=panel.y+panel.h+1,'result primary content clipped: '+g.cls);}await click('Bonus turu');await sleep(1000);const intro=await capture('bonus-intro',width);assert.match(intro.text,/Bonusu başlat/);await sleep(400);
  const notStarted=await page.evaluate(`JSON.parse(localStorage.getItem('kelime-teneffusu-v2')).bonuses??null`);assert.equal(notStarted,null);
  await click('Bonusu başlat');await sleep(350);const bonus=await capture('bonus',width);assert(bonus.board.bottom<=height);
  for(const p of f.bonus.placements.slice(0,3))await draw(f.bonus,p);await sleep(600);await capture('bonus-colors',width);
  const bonusColors=await page.evaluate(`Array.from(document.querySelectorAll('.board-ink .found-stroke')).map(e=>getComputedStyle(e).stroke)`);assert.equal(new Set(bonusColors).size,3,'bonus discoveries keep distinct colors');
  for(const p of f.bonus.placements.slice(3))await draw(f.bonus,p);await sleep(1500);const bonusResult=await capture('bonus-result',width);
  if(width===393)await verifyResultLayout(page,'bonus',out);
  assert.match(bonusResult.text.toLocaleLowerCase('tr'),/hepsini buldun/);
  await click('Devam et');await sleep(400);const next=await capture('next',width);assert.match(next.text,/Bölüm\s+7\b/iu);
  writeFileSync(path.join(out,'latest-check.json'),JSON.stringify({width,start,praise,sixth,result,intro,bonus,bonusResult,next},null,2));for(const [name,state] of Object.entries({start,praise,sixth,result,intro,bonus,bonusResult,next}))assert.equal(state.overflow,false,name+' overflow');
  const saved=await page.evaluate(`JSON.parse(localStorage.getItem('kelime-teneffusu-v2'))`);assert(saved.saves['route:uzay-gozlemevi'].complete);assert(saved.bonuses.uzay.finished);
  report.push({width,height,start,praise,heldSelection,continued,sixth,result,intro,bonus,bonusResult,next});
 }
 assert.deepEqual(page.errors,[]);writeFileSync(path.join(out,`${before?'before':'after'}-rhythm.json`),JSON.stringify({report,errors:page.errors},null,2));console.log(JSON.stringify(report.map(r=>({width:r.width,praise:r.praise.praise,result:r.result.primary}))));
}finally{await page.close();server.close();}
