// Run against a local development Worker with an isolated D1 database and built UI:
// URL=http://127.0.0.1:8787 node scripts/visual/arena-swipe.mjs
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {launch, sleep} from './chrome.mjs';

const origin = new URL(process.env.URL || 'http://127.0.0.1:8787').origin;
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname), 'Use an isolated local Worker.');
const output = process.env.OUT;
const diagnostics = {origin, viewport:[320, 568], samples:[]};

async function request(path, body, cookie) {
  const headers = {origin, 'content-type':'application/json'};
  if (cookie) headers.cookie = cookie;
  const response = await fetch(origin + '/api/' + path, {
    method:body ? 'POST' : 'GET', headers,
    ...(body ? {body:JSON.stringify(body)} : {}),
  });
  assert.ok(response.ok, path + ' returned ' + response.status);
  return response;
}
async function player(name) {
  const response = await request('session', {name});
  const cookie = response.headers.getSetCookie()[0]?.split(';')[0];
  assert.ok(cookie, 'Local guest session cookie missing');
  return cookie;
}

const host = await player('Tahta denetimi A');
const guest = await player('Tahta denetimi B');
const room = await (await request('game', {action:'enter', kind:'friend', mode:'group'}, host)).json();
const joined = await (await request('game', {action:'enter', kind:'friend', mode:'group', code:room.code}, guest)).json();
assert.equal(joined.id, room.id);

const page = await launch();
async function wait(expression) {
  for (let i=0; i<120; i++) {
    const value = await page.evaluate(expression);
    if (value) return value;
    await sleep(100);
  }
  const where=await page.evaluate(`(async()=>{
    const response=await fetch('/api/game'),user=await response.json(),active=await (await fetch('/api/game?action=room')).json();
    return {url:location.pathname+location.search,text:document.body.innerText.slice(0,350),
      accountStatus:response.status,authenticated:!!user.authenticated,localRoom:active?.phase||null};
  })()`);
  throw new Error('Arena check timed out: ' + expression.slice(0,100) + ' ' + JSON.stringify(where));
}
try {
  for (const cookie of [host, guest]) await request('game', {action:'ready', id:room.id, round:room.round}, cookie);
  const active = await (await request('game', {action:'start', id:room.id, round:room.round}, host)).json();
  assert.equal(active.phase,'active');
  await page.viewport(320,568,2,{top:0,bottom:0,left:0,right:0});
  const split = host.indexOf('=');
  await page.send('Network.setCookie', {name:host.slice(0,split), value:host.slice(split+1), url:origin, path:'/', secure:true, httpOnly:true, sameSite:'Lax'});
  await page.goto(origin+'/');
  // Enter from the journey hub exactly as a player would, once their session is hydrated.
  const entry=await wait(`(()=>{if(document.querySelector('.letter-board'))return 'active';
    const root=document.querySelector('.native-shell[data-ready=true]');if(!root)return null;
    const link=[...root.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||b.textContent).trim()==='Arena');
    if(!link)return null;const r=link.getBoundingClientRect();return r.width?[r.x+r.width/2,r.y+r.height/2]:null;
  })()`);
  if (Array.isArray(entry)) await page.touch([entry]);
  await wait("document.querySelector('.letter-board [data-cell]') && !document.querySelector('.countdown-overlay')");
  await sleep(Math.max(0,active.starts-Date.now()) + 180);

  // Read the actual displayed cells so the test also works with a projected board.
  const grid = await page.evaluate(`[...document.querySelectorAll('.letter-board [data-cell]')].map(cell=>{
    const box=cell.getBoundingClientRect();
    return {coords:cell.dataset.cell.split(',').map(Number),ch:cell.textContent.trim(),x:box.x+box.width/2,y:box.y+box.height/2};
  })`);
  const cells = new Map(grid.map(cell=>[cell.coords.join(','),cell]));
  const targets = active.board.targets.map(target=>target.label.replaceAll(' ','').toLocaleUpperCase('tr'));
  const word = targets.includes('DOMATES') ? 'DOMATES' : targets.find(target=>target.length>=4);
  assert.ok(word,'A long target is required');
  let line;
  for (const start of grid.filter(cell=>cell.ch===word[0])) {
    for (const [dy,dx] of [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const letters = [...word].map((_,i)=>cells.get([start.coords[0]+dy*i,start.coords[1]+dx*i].join(',')));
      if (letters.every((cell,i)=>cell?.ch===word[i])) {line=letters;break;}
    }
    if (line) break;
  }
  assert.ok(line,'Target missing from displayed board: '+word);
  diagnostics.word=word;
  const rect = `(()=>{const b=document.querySelector('.letter-board').getBoundingClientRect();return [b.x,b.y,b.width,b.height]})()`;
  const original=await page.evaluate(rect);
  const first=line[0],last=line.at(-1);
  const points=Array.from({length:12},(_,i)=>[first.x+(last.x-first.x)*i/11,first.y+(last.y-first.y)*i/11]);
  await page.touch(points,async i=>{
    if (![0,5,11].includes(i)) return;
    const board=await page.evaluate(rect);
    const bubble=await page.evaluate(`(()=>{const el=document.querySelector('.selection-bubble [data-selection-word]');
      return el?.checkVisibility({visibilityProperty:true,opacityProperty:true})?el.textContent.trim():''})()`);
    diagnostics.samples.push({point:i,board,bubble});
    if (i===0) assert.equal(bubble,word[0],'The first letter must be visible immediately.');
    assert.ok(board.every((value,index)=>Math.abs(value-original[index])<=1),'Board moved under the finger: '+JSON.stringify({original,board}));
  });
  const displayed=await wait("document.querySelector('.word-tag.found [data-word-label]')?.textContent.trim()");
  assert.equal(displayed.toLocaleUpperCase('tr'),word);
  const settled=await (await request('game?action=room',undefined,host)).json();
  assert.equal(settled.you.strokes.length,1);
  assert.ok(settled.you.score>active.you.score);
  const hud=await page.evaluate("document.querySelector('.competition-player strong')?.textContent");
  assert.equal(hud,settled.you.score+' puan','The visible score must match the Worker.');
  diagnostics.score=settled.you.score;
  const after=await page.evaluate(rect);
  assert.ok(after.every((value,index)=>Math.abs(value-original[index])<=1),'Board moved on release.');
  console.log(word,settled.you.score,'puan',JSON.stringify(original));
} finally {
  try {
    if (output) {
      await mkdir(output,{recursive:true});
      await page.screenshot(join(output,'arena-swipe.png'));
      await writeFile(join(output,'arena-swipe.json'),JSON.stringify(diagnostics,null,2)+'\n');
    }
  } finally {
    await page.close();
    await Promise.allSettled([host,guest].map(cookie=>request('game',{action:'leave',id:room.id},cookie)));
  }
}
