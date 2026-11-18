// Opens every main chapter in a real headless Chrome at phone sizes and measures the
// play screen: nothing may scroll, overflow sideways, wrap mid-word or leave the
// controls off screen. Usage: pnpm mobile:build && node scripts/visual/layout-audit.mjs
// Optional arguments: "320x568,375x667" and a comma-separated chapter list.
// Browser emulation is not a physical-device or touch-comfort check.
import {execFileSync} from 'node:child_process';
import {createReadStream, existsSync, statSync, mkdirSync, writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launch} from './chrome.mjs';
import {checkTallBoard} from './tall-board-check.mjs';
import {capturePlayLayout,layoutProblems} from './layout-measure.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const site = process.env.KT_LAYOUT_BUILD ?? path.join(root, 'dist-mobile');
if (!existsSync(path.join(site, 'index.html'))) throw new Error('Önce mobil paketi derle: pnpm mobile:build');
const sizes = (process.argv[2] ?? '320x568,375x667').split(',').map(size => size.split('x').map(Number));
const only = process.argv[3]?.split(',').map(Number);
// Add --first-visit to exercise help, finger input and safe-area geometry on
// 320x568 and 393x852. The default run still checks all veteran replays.
const firstVisit = process.argv[4] === '--first-visit';
const insets = {'320x568':{top:20,bottom:0},'393x852':{top:59,bottom:34}};
if(firstVisit && sizes.some(([w,h])=>!insets[w+'x'+h])) throw new Error('First-visit profiles: 320x568,393x852');
if(process.env.EVIDENCE_DIR) mkdirSync(process.env.EVIDENCE_DIR,{recursive:true});
const fixture = JSON.parse(execFileSync(process.execPath, ['--experimental-strip-types', '--experimental-transform-types', '--no-warnings',
  fileURLToPath(new URL('./veteran-save.ts', import.meta.url))], {cwd: root, maxBuffer: 16 * 1024 * 1024}).toString());

const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json'};
const server = createServer((request, response) => {
  const name = decodeURIComponent(new URL(request.url, 'http://x').pathname);
  let file = path.join(site, path.normalize(name));
  if (!file.startsWith(site) || !existsSync(file) || statSync(file).isDirectory()) file = path.join(site, 'index.html');
  response.writeHead(200, {'Content-Type': types[path.extname(file)] ?? 'application/octet-stream'});
  createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;

const open = chapter => `(async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async find => { for(let i=0;i<100;i++){const value=find();if(value)return value;await wait(20);} };
  const picker = await until(()=>document.querySelector('button[aria-label="Yolculuğum: bölümler ve albümler"]'));
  if (!picker) return 'bölüm seçici yok';
  picker.click();
  const all=await until(()=>document.querySelector('.journey-map-all'));
  if(!all)return 'dünya listesi yok';
  all.click();
  const world=await until(()=>document.querySelectorAll('.journey-map-world').length===${fixture.chapters.length/6} && document.querySelectorAll('.journey-map-world')[${chapter.world}]);
  if(!world) return 'dünya seçimi yok';
  world.click();
  const button = await until(()=>document.querySelectorAll('.chapter-picker-grid button')[${chapter.position}]);
  if (!button || button.disabled) return 'bölüm açılamadı';
  button.click();
  if(!await until(()=>document.querySelector('.letter-board') && document.querySelector('.play-chapter-number')?.textContent.match(/\\d+/)?.[0]===String(${chapter.number})))return 'açılan bölüm doğrulanamadı';
  await document.fonts.ready;
  let last='',stable=0;for(let i=0;i<20&&stable<3;i++){const b=document.querySelector('.letter-board')?.getBoundingClientRect(),now=JSON.stringify(b?[b.x,b.y,b.width,b.height]:null);stable=now===last?stable+1:0;last=now;await wait(40);}
  return 'ok';
})()`;
const measure = '('+capturePlayLayout.toString()+')()';

let failures = 0;
const page = await launch({port:Number(process.env.KT_LAYOUT_PORT ?? 9333)});
try {
  for (const [width, height] of sizes) {
    const safe = firstVisit ? {...insets[width+'x'+height],left:0,right:0} : undefined;
    await page.viewport(width,height,2,safe);
    await page.goto(url);
    await page.evaluate(`localStorage.clear(); localStorage.setItem(${JSON.stringify(fixture.key)}, ${JSON.stringify(fixture.value)}); 'ok'`);
    const rows = [];
    for (const chapter of only ? fixture.chapters.filter(item => only.includes(item.number)) : fixture.chapters) {
      if(firstVisit){
        const progress=JSON.parse(fixture.value);
        for(const item of fixture.chapters.slice(chapter.number-1)) delete progress.saves['route:'+item.id];
        await page.evaluate('localStorage.setItem('+JSON.stringify(fixture.key)+','+JSON.stringify(JSON.stringify(progress))+')');
      }
      await page.goto(url, 120);
      const opened = await page.evaluate(open(chapter));
      if(process.env.EVIDENCE_DIR&&only)await page.screenshot(path.join(process.env.EVIDENCE_DIR,`layout-${width}-${chapter.number}.png`));
      const row={number:chapter.number,id:chapter.id,...(opened==='ok'?await page.evaluate(measure):{error:opened})};
      if(firstVisit && opened==='ok' && chapter.number===10){
        row.touch=await checkTallBoard(page,row,process.env.EVIDENCE_DIR);
      }
      rows.push(row);
    }
    if(process.env.EVIDENCE_DIR){mkdirSync(process.env.EVIDENCE_DIR,{recursive:true});writeFileSync(path.join(process.env.EVIDENCE_DIR,`layout-${width}.json`),JSON.stringify(rows,null,2));}
    const bad = rows.map(row => ({number:row.number,id:row.id,issues:layoutProblems(row)})).filter(row => row.issues.length);
    const measured = rows.filter(row => !row.error);
    console.log(`${width}x${height}: ${rows.length} bölüm, ${bad.length} sorun; en küçük hücre ${Math.min(...measured.map(row => row.cell))} px`);
    for (const row of bad) console.log(' ', JSON.stringify(row));
    failures += bad.length;
  }
  if (page.errors.length) { console.log('Sayfa hataları:', page.errors.slice(0, 5)); failures += page.errors.length; }
} finally {
  await page.close();
  server.close();
}
process.exitCode = failures ? 1 : 0;
