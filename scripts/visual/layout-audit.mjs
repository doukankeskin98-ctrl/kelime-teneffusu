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
import {capturePlayLayout,layoutProblems} from './layout-measure.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const site = path.join(root, 'dist-mobile');
if (!existsSync(path.join(site, 'index.html'))) throw new Error('Önce mobil paketi derle: pnpm mobile:build');
const sizes = (process.argv[2] ?? '320x568,375x667').split(',').map(size => size.split('x').map(Number));
const only = process.argv[3]?.split(',').map(Number);
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
  const picker = document.querySelector('.stage-map-button');
  if (!picker) return 'bölüm seçici yok';
  picker.click(); await wait(120);
  document.querySelector('.journey-map-all')?.click(); await wait(120);
  const world = [...document.querySelectorAll('.journey-map-world')][${chapter.world}];
  if(!world) return 'dünya seçimi yok';
  world.click(); await wait(120);
  const button = [...document.querySelectorAll('.chapter-picker-grid button')][${chapter.position}];
  if (!button || button.disabled) return 'bölüm açılamadı';
  button.click(); await wait(450);
  await document.fonts.ready;
  let last='',stable=0;for(let i=0;i<20&&stable<3;i++){const b=document.querySelector('.letter-board')?.getBoundingClientRect(),now=JSON.stringify(b?[b.x,b.y,b.width,b.height]:null);stable=now===last?stable+1:0;last=now;await wait(40);}
  return 'ok';
})()`;
const measure = '('+capturePlayLayout.toString()+')()';

let failures = 0;
const page = await launch();
try {
  for (const [width, height] of sizes) {
    await page.viewport(width, height);
    await page.goto(url);
    await page.evaluate(`localStorage.clear(); localStorage.setItem(${JSON.stringify(fixture.key)}, ${JSON.stringify(fixture.value)}); 'ok'`);
    const rows = [];
    for (const chapter of only ? fixture.chapters.filter(item => only.includes(item.number)) : fixture.chapters) {
      await page.goto(url, 300);
      const opened = await page.evaluate(open(chapter));
      if(process.env.EVIDENCE_DIR&&only)await page.screenshot(path.join(process.env.EVIDENCE_DIR,`layout-${width}-${chapter.number}.png`));
      rows.push({number: chapter.number, id: chapter.id, ...(opened === 'ok' ? await page.evaluate(measure) : {error: opened})});
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
