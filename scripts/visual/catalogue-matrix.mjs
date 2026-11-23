import {build, preview} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {launch} from './integrity/cdp.mjs';
import {capturePlayLayout, journeyFrameProblems, layoutProblems} from './layout-measure.mjs';

const subset = process.argv[2]?.split(',').map(Number);
const numbers = subset ?? Array.from({length:312}, (_, i) => i+1);
const sizes=(process.env.KT_LAYOUT_SIZES??'320x568,375x667,393x852,430x932').split(',').map(size=>size.split('x').map(Number));
const out = path.resolve(process.env.EVIDENCE_DIR??'../world-review.nosync/release-0580-local', subset?'matrix-sample':'matrix');
const dir = mkdtempSync(path.join(tmpdir(), 'kt0580-matrix-'));
mkdirSync(out, {recursive:true});
const root = process.cwd();
const conf = {configFile:false, root:path.join(root,'scripts/visual/catalogue-fixture'), publicDir:path.join(root,'public'),
  resolve:{alias:{'@':root}},define:{__KT_LOCAL_JOURNEY_PILOT__:'true'},plugins:[react()],build:{outDir:dir,emptyOutDir:true},logLevel:'error'};

async function inspect(number, published) {
  window.showChapter(number, published);
  await document.fonts.ready;
  await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  const layout = window.measure();
  if(layout.error) return layout;
  const rack = document.querySelector('.target-rack[data-authored-rack]');
  const gaps = [],edges=[];
  if(rack){
    const bounds=rack.getBoundingClientRect();
    for(const row of rack.querySelectorAll('.word-rack-row')){
      const words=[...row.querySelectorAll('.target-letters')].map(word=>word.getBoundingClientRect());
      edges.push(words[0].left-bounds.left,bounds.right-words.at(-1).right);
      for(let i=1;i<words.length;i++)gaps.push(words[i].left-words[i-1].right);
    }
  }
  const definitions=[];
  const clue=document.querySelector('.active-clue');
  let selectionWorks=true;
  const strip=document.querySelector('.definition-strip');
  if(strip){
    const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const total=Number(strip.dataset.targets),ordered=!!strip.dataset.ordered;
    // A warm device may remember the last definition from an earlier sample.
    for(let step=0;!ordered&&step<total&&!strip.querySelector('[aria-label="Önceki tanım"]').disabled;step++){strip.querySelector('[aria-label="Önceki tanım"]').click();await frame();}
    for(let index=0;index<(ordered?1:total);index++){
      const text=strip.querySelector('.definition-text'),range=document.createRange();range.selectNodeContents(text);
      const rects=[...range.getClientRects()],row=strip.querySelector('.definition-question').getBoundingClientRect(),answer=strip.querySelector('.definition-answer'),tiles=[...answer.querySelectorAll('.definition-letter')];
      const group=Number(answer.dataset.wordGroup),spoken=strip.querySelector('[role=status]').textContent.includes(tiles.length+' harf');
      const clip=rects.some(r=>r.right>row.right+1||r.left<row.left-1||r.top<strip.getBoundingClientRect().top||r.bottom>tiles[0].getBoundingClientRect().top+1);
      definitions.push({text:text.textContent,group,spoken,clipped:!rects.length||!tiles.length||clip,lines:rects.length,font:parseFloat(getComputedStyle(text).fontSize)});
      if(!ordered&&index<total-1){strip.querySelector('[aria-label="Sonraki tanım"]').click();await frame();}
    }
    selectionWorks=definitions.length>0&&(ordered||new Set(definitions.map(d=>d.group)).size===total);
    if(!ordered&&total>1){strip.querySelector('.definition-list').click();await frame();const options=[...document.querySelectorAll('dialog[open] .definition-option')];options[1]?.click();await frame();selectionWorks=selectionWorks&&options.length===total&&strip.querySelector('.definition-copy>span').textContent==='2'&&!document.querySelector('dialog.definition-dialog[open]');}
  }else if(clue){
    const slots=[...document.querySelectorAll('.clue-slot')], ordered=clue.closest('[aria-label="Hikâye adımları"]');
    const frame=()=>new Promise(requestAnimationFrame);
    for(let i=0;i<(ordered?1:slots.length);i++){
      const visible=clue.querySelector('.clue-definition'), range=document.createRange();range.selectNodeContents(visible);
      const box=clue.getBoundingClientRect(),rects=[...range.getClientRects()];
      const selected=slots.findIndex(s=>s.classList.contains('is-focus-target'));
      const expectedLength=slots[selected]?.querySelectorAll('[data-target-letter]').length;
      definitions.push({text:visible.textContent,group:selected,lines:rects.length, width:box.width, height:box.height, overTop:Math.max(0,box.top-Math.min(...rects.map(r=>r.top))), overBottom:Math.max(0,Math.max(...rects.map(r=>r.bottom))-box.bottom),
        clipped:!rects.length||rects.some(r=>r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1),
        spoken:clue.querySelector('strong')?.textContent.endsWith(expectedLength+' harf')});
      if(!ordered){
        const from=new Touch({identifier:1,target:clue,clientX:120}),to=new Touch({identifier:1,target:clue,clientX:65});
        for(const [name,point] of [['touchstart',from],['touchend',to]]){
          clue.dispatchEvent(new TouchEvent(name,{bubbles:true,cancelable:true,touches:name==='touchend'?[]:[point],changedTouches:[point]}));
        }
        await frame();
      }
    }
    if(!ordered){
      selectionWorks=new Set(definitions.map(x=>x.group)).size===slots.length;
      // A new tap, following the previous swipe, opens all clues.
      clue.dispatchEvent(new TouchEvent('touchstart',{bubbles:true}));clue.click();await frame();
      const pick=document.querySelector('dialog[open] [data-word-group="1"] button');
      if(pick){pick.click();await frame();}
      selectionWorks=selectionWorks&&!!pick&&slots[1].classList.contains('is-focus-target')&&!document.querySelector('dialog[open]');
    }
  }
  return {...layout,frameKind:document.querySelector('.scenic-play')?.dataset.designLayout??(strip?'definition':'classic'),gap:gaps.length?Math.min(...gaps):null,edge:edges.length?Math.min(...edges):null,
    definitions,selectionWorks,authored:!!document.querySelector('[data-authored-board]')};
}
let browser,server;
const all=[],failures=[];
try{
  await build(conf);
  server=await preview({...conf,preview:{host:'127.0.0.1',port:0}});
  browser=await launch({port:subset?19656:19652});
  await browser.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await browser.goto('http://127.0.0.1:'+server.httpServer.address().port);
  await browser.eval('window.measure='+capturePlayLayout.toString()+';window.inspectChapter='+inspect.toString()+';true');
  for(const [w,h] of sizes){
    await browser.viewport(w,h,1);
    await browser.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:w<=375?20:59,bottom:w<=375?0:34,left:0,right:0}});
    let frameReference;
    for(const published of [true,false]){
      for(const n of numbers){
        const v=await browser.eval('window.inspectChapter('+n+','+published+')');
        const issues=layoutProblems(v);
        if(!v.error){
          if(v.authored===published)issues.push('Wrong catalogue');
          if(published&&n===10&&w===320&&(v.board.width<272||v.letterPx<21))issues.push('long board too small');
          if(v.gap!==null&&v.gap<13.9)issues.push('word gap '+v.gap.toFixed(1));
          if(v.edge!==null&&v.edge<9.9)issues.push('card margin '+v.edge.toFixed(1));
          for(const d of v.definitions){
            if(d.clipped)issues.push('clue clipped: '+d.text);
            if(!d.spoken)issues.push('missing spoken length: '+d.text);
            if(w===320&&d.font!==undefined&&(d.font<15||(!published&&d.lines>2)))issues.push('narrow definition typography: '+d.text);
          }
          if(!v.selectionWorks)issues.push('clue selection');
          const {errors,anchors}=journeyFrameProblems(v,w<=375?20:59,frameReference);
          frameReference??=anchors;
          issues.push(...errors);
        }
        all.push({w,n,published,board:v.board,stageTop:v.stage?.top,topic:v.topic,rack:v.rack,clueRect:v.targets?.at(-1),tools:v.controls,...(subset?{words:v.words}:{}),clues:v.definitions,gap:v.gap,edge:v.edge,issues});
        if(issues.length){
          if(failures.filter(x=>x.w===w&&x.published===published).length<3)console.log(JSON.stringify({w,n,published,issues}));
          failures.push({w,n,published,issues});
        }
        if(subset&&published&&w<=375){
          const {data}=await browser.send('Page.captureScreenshot',{format:'jpeg',quality:70});
          writeFileSync(path.join(out,'original-'+w+'-'+n+'.jpg'),Buffer.from(data,'base64'));
        }
        if(!published&&(((w===320||w===393)&&(n%6===1||n%6===0))||n===297)){
          const {data}=await browser.send('Page.captureScreenshot',{format:'jpeg',quality:54});
          writeFileSync(path.join(out,w+'-'+n+'.jpg'),Buffer.from(data,'base64'));
        }
      }
      console.log(w,published?'published':'pilot',all.length,failures.length);
    }
  }
}finally{
  await browser?.close();await server?.close();rmSync(dir,{recursive:true,force:true});
  writeFileSync(path.join(out,'measurements.json'),JSON.stringify(all));
  writeFileSync(path.join(out,'issues.json'),JSON.stringify(failures));
}
if(failures.length||all.length!==numbers.length*sizes.length*2)process.exitCode=1;

// The CI catalogue shard also exercises actual chapter entry. The two taller
// device profiles have separate Safari viewports with browser chrome visible.
if(!subset && process.env.GITHUB_ACTIONS==='true'){
  const profiles=new Map([[320,'320'],[375,'375-se'],[393,'393-safari,393-uygulama'],[430,'430-safari,430-uygulama']]);
  const requested=sizes.map(([width])=>{
    const profile=profiles.get(width);
    if(!profile)throw new Error('Unknown board-card width: '+width);
    return profile;
  });
  execFileSync(process.execPath,['scripts/visual/tahta-yerlesim-olcumu.mjs'],{
    stdio:'inherit',
    env:{...process.env,LEVELS:'hepsi',VIEWS:requested.join(','),OUT:path.join(out,'board-card')},
  });
}
