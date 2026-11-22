// Chapter 10 has a published 8×11 display and the horizontal/diagonal identity of
// any given target belongs to the game. Find its displayed cells, then use real touch.
import assert from 'node:assert/strict';
import path from 'node:path';

function troyaPath() {
  const cells = new Map([...document.querySelectorAll('[data-cell]')].map(e => [e.dataset.cell,e]));
  for (const cell of cells.values()) {
    if (cell.textContent !== 'T') continue;
    const [r,c] = cell.dataset.cell.split(',').map(Number);
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const line = [...'TROYA'].map((_,i)=>cells.get([r+i*dr,c+i*dc].join(',')));
      if (line.map(e=>e?.textContent).join('') !== 'TROYA') continue;
      return line.map(e=>{const b=e.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2];});
    }
  }
  return [];
}

// The published catalogue does not yet include a 12-target short-word rack.
// Exercise the real styles at the rendered width without touching the game's list.
function measureDenseRack() {
  const live = document.querySelector('.viewport-targets.has-word-rack');
  const copy = live.cloneNode(true);
  const rack = copy.querySelector('.target-rack');
  const label = rack.querySelector('.word-tag');
  const count = 12;
  copy.setAttribute('aria-hidden', 'true');
  copy.dataset.many = 'true';
  rack.dataset.targetCount = String(count);
  rack.replaceChildren(...Array.from({length: count}, () => label.cloneNode(true)));
  Object.assign(copy.style, {position: 'absolute', visibility: 'hidden', width: live.clientWidth + 'px'});
  live.after(copy);
  try {
    const cells = Array.from(rack.children, el => el.getBoundingClientRect());
    return {
      columns: new Set(cells.map(box => Math.round(box.x))).size,
      rows: new Set(cells.map(box => Math.round(box.y))).size,
      font: parseFloat(getComputedStyle(rack.firstElementChild).fontSize),
    };
  } finally { copy.remove(); }
}

export async function checkTallBoard(page, sample, evidenceDir) {
  let denseRack;
  if (sample.width === 320) {
    denseRack = await page.evaluate('(' + measureDenseRack.toString() + ')()');
    assert.equal(denseRack.columns, 4, 'four short targets across on a narrow screen');
    assert.equal(denseRack.rows, 3, 'twelve short targets occupy three rows');
    assert(denseRack.font >= 14, 'short targets remain legible at 320px');
  }
  const points = await page.evaluate('('+troyaPath.toString()+')()');
  assert.equal(points.length,5,'TROYA path on displayed board');
  const box = "document.querySelector('.letter-board').getBoundingClientRect().toJSON()";
  const font = await page.evaluate("parseFloat(getComputedStyle(document.querySelector('[data-cell]')).fontSize)");
  assert(sample.board.width >= .85*sample.width && font >= 21,'tall board and actual letter size');
  const stationary = measured => {
    for (const key of ['left','top','width','height']) assert(Math.abs(measured[key]-sample.board[key])<=1,'board '+key);
  };
  const shot = async name => {
    if(evidenceDir) await page.screenshot(path.join(evidenceDir,'tall-'+name+'-'+sample.width+'.png'));
  };
  await page.touch(points,async step=>{
    if(step===0){
      assert.equal(await page.evaluate("document.querySelector('.selection-bubble').innerText"),'T');
      const ink=await page.evaluate(`(() => {
        const cell=document.querySelector('.letter-selected');
        if(!cell) return null;
        const style=getComputedStyle(cell);
        const fading=cell.getAnimations().some(animation=>animation.transitionProperty==='color');
        return {color:style.color,fading};
      })()`);
      assert.deepEqual(ink,{color:'rgb(255, 255, 255)',fading:false},'First selected letter must be legible as soon as the stroke starts');
    }
    if(step===2){stationary(await page.evaluate(box));await shot('drawing');}
  });
  assert(await page.evaluate("[...document.querySelectorAll('.target-rack .found')].some(e=>e.textContent.includes('TROYA'))"),'TROYA accepted');
  const tip = await page.evaluate(`(async()=>{
    const button=document.querySelector('.hint-button'),b=button.getBoundingClientRect();
    if(!button.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2))) throw Error('hint is obstructed');
    button.click();
    await new Promise(requestAnimationFrame);
    const choices=document.querySelectorAll('.hint-choices button');
    if(!choices.length)throw Error('hint chooser did not open');
    choices[0].click();await new Promise(requestAnimationFrame);
    const note=document.querySelector('.board-action-notice');
    return {text:note?.innerText,rect:note?.getBoundingClientRect().toJSON()};
  })()`);
  assert(tip.text && tip.rect.width>0 && tip.rect.top>=0 && tip.rect.bottom<=sample.height,'visible requested hint');
  stationary(await page.evaluate(box));await shot('hint');
  return {letterPx:font,hint:tip.text,boardWidth:sample.board.width,denseRack};
}
