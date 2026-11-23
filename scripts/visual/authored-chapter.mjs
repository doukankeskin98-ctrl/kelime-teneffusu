import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const {levels}=JSON.parse(readFileSync(new URL('../journey-content/veri/yerlesim.json',import.meta.url),'utf8'));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function checkAuthoredChapter(page,number,width,out){
 const level=levels[number-1];
 await page.evaluate("document.querySelector('dialog.mechanic-guide[open] footer button')?.click()");
 const state=await page.evaluate(`(()=>{
  const cells=[...document.querySelectorAll('.letter-grid [data-cell]')];
  return {letters:cells.map(c=>c.textContent).join(''),title:[...document.querySelector('.target-topic h1').childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(''),
   authored:!!document.querySelector('[data-authored-board]'),
   centers:Object.fromEntries(cells.map(c=>{const b=c.getBoundingClientRect();return [c.dataset.cell,[b.x+b.width/2,b.y+b.height/2]]}))};
 })()`);
 assert.equal(state.authored,true,'pilot flag, chapter '+number);
 assert.equal(state.letters,level.grid.join(''),'chapter '+number+' grid');
 assert.equal(state.title,level.band);
 const checkRack=async()=>{
  if(level.clues){
   const observed=await page.evaluate(`(()=>{const rack=document.querySelector('.definition-strip'),clue=rack?.querySelector('.definition-text');if(!rack||!clue)return null;
    const box=rack.getBoundingClientRect(),tiles=[...rack.querySelectorAll('.definition-answer .definition-letter')];
    return {total:Number(rack.dataset.targets),letters:tiles.length,text:clue.textContent,inside:tiles.every(tile=>{const r=tile.getBoundingClientRect();return r.width>=19&&r.left>=box.left-1&&r.right<=box.right+1&&r.top>=box.top-1&&r.bottom<=box.bottom+1;})};})()`);
   const answer=Object.entries(level.clues).find(([,clue])=>clue===observed?.text)?.[0];
   assert(observed?.inside&&observed.total===level.placements.length&&answer&&observed.letters===Array.from(answer).length,'definition '+number);
   return;
  }
  const {values,leftEdge,rightEdge}=await page.evaluate(`(()=>{const rack=document.querySelector(".target-rack").getBoundingClientRect();return {leftEdge:rack.left,rightEdge:rack.right,values:[...document.querySelectorAll('.word-rack-row')].map(row=>[...row.querySelectorAll('.target-letters')].map(word=>{
   const glyphs=[...word.querySelectorAll('[data-target-letter]')].map(el=>el.getBoundingClientRect());
   return [Math.min(...glyphs.map(g=>g.left)),Math.max(...glyphs.map(g=>g.right))];
  }))};})()`);
  assert(values.length>0&&values.length<=3,'row count');
  for(const line of values){
   assert(line.length<=4);
   line.forEach(([left,right],i)=>{
    assert(left>=leftEdge+9.9&&right<=rightEdge-9.9,`word outside: ${number}/${width}`);
    if(i)assert(left-line[i-1][1]>=13.9,`word gap: ${number}/${width} ${left-line[i-1][1]}`);
   });
  }
 };
 await checkRack();
 if(out)await page.screenshot(path.join(out,`pilot-${width}-${number}-start.png`));
 if(width!==320&&width!==393)return;
 for(let index=0;index<level.placements.length;index++){
  if(index===level.placements.length-1&&out){
   await page.evaluate("Promise.allSettled(document.querySelector('.target-rack,.definition-strip').getAnimations({subtree:true}).filter(a=>Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a=>a.finished))");await checkRack();
   await page.screenshot(path.join(out,`pilot-${width}-${number}-last.png`));
  }
  const [word,r,c,y,x]=level.placements[index];
  const points=[...word].map((_,i)=>state.centers[[r+i*Math.sign(y-r),c+i*Math.sign(x-c)].join(',')]);
  await page.touch(points);
  if(index<level.placements.length-1){
   let done=false;
   for(let i=0;i<20&&!done;i++){
    done=await page.evaluate(`document.querySelector('[data-word-group="${index}"]')?.getAttribute('aria-label')?.includes('bulundu')`);
    if(!done)await sleep(45);
   }
   assert(done,`chapter ${number} word ${word}`);
  }else{
   let finished=false;
   for(let i=0;i<50&&!finished;i++){finished=await page.evaluate("!!document.querySelector('.result-continue')");if(!finished)await sleep(75);}
   assert(finished,'finish chapter '+number);
  }
 }
}
