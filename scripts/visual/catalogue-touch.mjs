// Chrome dispatches synthetic touch events through the real board handlers.
import {build, preview} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync} from 'node:fs';
import {launch} from './integrity/cdp.mjs';

async function solve(level,reverse){
  window.showChapter(level.n,false);
  await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
  const board=document.querySelector('.letter-board');
  const cell=(r,c)=>{
    const box=board.querySelector('[data-cell="'+r+','+c+'"]').getBoundingClientRect();
    return [box.x+box.width/2,box.y+box.height/2];
  };
  function send(type,point){
    const touch=new Touch({identifier:1,target:board,clientX:point[0],clientY:point[1]});
    board.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'?[]:[touch],changedTouches:[touch]}));
  }
  for(const [,r,c,y,x] of level.placements){
    const start=cell(r,c),end=cell(y,x);
    send('touchstart',reverse?end:start);send('touchmove',reverse?start:end);send('touchend',reverse?start:end);
    await Promise.resolve();
  }
  const result=()=>window.qaProgress?.saves?.['route:'+level.id];
  for(let frame=0;frame<12;frame++){
    await new Promise(requestAnimationFrame);
    const save=result();
    if(save?.complete){
      const unique=new Set(save.strokes.map(stroke=>stroke.id)).size;
      return {n:level.n,reverse,words:save.strokes.length,correct:unique===level.placements.length&&save.strokes.length===unique&&save.stars===3};
    }
  }
  return {n:level.n,reverse,words:result()?.strokes?.length??0,correct:false};
}

const root=process.cwd(),dir=mkdtempSync(path.join(tmpdir(),'kt0580-input-'));
const out=path.resolve(process.env.EVIDENCE_DIR??'../world-review.nosync/release-0580-local');
mkdirSync(out,{recursive:true});
const config={root:path.join(root,'scripts/visual/catalogue-fixture'),configFile:false,publicDir:path.join(root,'public'),
  resolve:{alias:{'@':root}},define:{__KT_LOCAL_JOURNEY_PILOT__:'true'},plugins:[react()],build:{outDir:dir,emptyOutDir:true},logLevel:'error'};
const levels=JSON.parse(readFileSync('scripts/journey-content/veri/yerlesim.json','utf8')).levels;
let server,browser,failed=0;
const rows=[];
try{
  await build(config);
  server=await preview({...config,preview:{host:'127.0.0.1',port:0}});
  browser=await launch({port:19655});
  await browser.goto('http://127.0.0.1:'+server.httpServer.address().port);
  await browser.viewport(393,852,1);
  await browser.eval('window.solveChapter='+solve.toString()+';true');
  for(const reverse of [false,true])for(const {n,id,placements} of levels){
    const row=await browser.eval('window.solveChapter('+JSON.stringify({n,id,placements})+','+reverse+')');
    rows.push(row);
    if(!row.correct){console.error(row);if(++failed>=4)throw Error('Stopped after four failed chapters');}
  }
}finally{
  writeFileSync(path.join(out,'touch-both.json'),JSON.stringify(rows));
  await browser?.close();await server?.close();rmSync(dir,{recursive:true,force:true});
}
console.log(rows.length,'runs',rows.reduce((sum,row)=>sum+row.words,0),'words',failed,'failures');
if(failed||rows.length!==levels.length*2)process.exitCode=1;
