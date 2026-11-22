import {seedProgress} from '../seed-progress.mjs';
// Actual chapter-picker DOM: word-boundary wrapping and existing unlock rules.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,mkdtempSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import path from 'node:path';import {preview} from 'vite';
import {launch,sleep} from '../chrome.mjs';
const fixtures=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/integrity/chapter-fixtures.mts'],{encoding:'utf8'}));
const out=path.resolve(process.env.EVIDENCE_DIR??'outputs/integrity/chapters');mkdirSync(out,{recursive:true});
const build=mkdtempSync(path.join(tmpdir(),'kt-chapter-build-'));cpSync('dist-mobile',build,{recursive:true});
const server=await preview({configFile:false,build:{outDir:build},preview:{host:'127.0.0.1',port:0},logLevel:'error'});
let page;const report=[];const url='http://127.0.0.1:'+server.httpServer.address().port;
async function until(expr){for(let i=0;i<100;i++){if(await page.evaluate(expr))return;await sleep(40);}throw Error(expr);}
const click=selector=>page.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
try{
 page=await launch({port:19357});await page.send('Network.enable');await page.send('Network.setBlockedURLs',{urls:['https://*','wss://*']});
 for(const width of [320,393]){
  await page.viewport(width,width===320?568:852,2,{top:width===320?20:59,bottom:width===320?0:34,left:0,right:0});
  for(const f of fixtures){
   await seedProgress(page,url,f.progress,150);
   const mapButton=await page.evaluate(`(()=>{
    const button=document.querySelector('.berrak-orbit'),r=button.getBoundingClientRect();
    const point=[r.x+r.width/2,r.y+r.height/2];
    return button.contains(document.elementFromPoint(...point))?point:null;
   })()`);
   assert.ok(mapButton,'The journey map must be reachable by touch after restoring progress');
   await page.touch([mapButton]);
   await until("!!document.querySelector('.journey-map-all')");
   assert.equal(await page.evaluate("document.querySelector('.journey-map-heading>span').textContent"),f.count+'/312 bölüm');
   await click('.journey-map-all');
   const worlds=f.count===312?52:2;
   for(let world=1;world<=worlds;world++){
    const selector=`.journey-map-world[aria-label^="Dünya ${world}:"]`;await until(`!!document.querySelector(${JSON.stringify(selector)})`);await click(selector);await until("document.querySelectorAll('.chapter-picker-grid button').length===6");await page.evaluate('document.fonts.ready.then(()=>true)');
    const rows=await page.evaluate(`(()=>{return [...document.querySelectorAll('.chapter-picker-grid button')].map(b=>{
     const e=b.querySelector('em'),walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let node;const broken=[];
     while(node=walker.nextNode())for(const m of node.textContent.matchAll(/\\S+/gu)){const range=document.createRange();range.setStart(node,m.index);range.setEnd(node,m.index+m[0].length);const lines=new Set([...range.getClientRects()].filter(r=>r.width>0).map(r=>Math.round(r.top)));if(lines.size>1)broken.push(m[0]);}
     return {number:Number(b.querySelector('b').textContent),title:e.textContent,state:b.dataset.chapterState,disabled:b.disabled,broken};
    })})()`);
    for(const row of rows){const expected=f.chapters.find(c=>c.number===row.number);assert.equal(row.title,expected.title);assert.equal(row.state,expected.state,JSON.stringify({width,count:f.count,number:row.number}));assert.equal(row.disabled,expected.state==='locked');assert.deepEqual(row.broken,[],width+' title '+row.number);}
    report.push({width,completed:f.count,world,rows});
    if(world===1&&f.count!==312)await page.screenshot(path.join(out,`${width}-${f.count}-complete.png`));
    await click('.journey-map-back');await until("!!document.querySelector('.journey-map-all')");
   }
  }
 }
 assert.deepEqual(page.errors,[]);writeFileSync(path.join(out,'chapters.json'),JSON.stringify(report,null,2));console.log('312 titles × 2 widths; 0/1/3/5/6/120 saves × 2 worlds × 2 widths: passed');
}finally{await page?.close();await server.close();rmSync(build,{recursive:true,force:true});}
