// Opens every main chapter in a real headless Chrome at phone sizes and measures the
// play screen: nothing may scroll, overflow sideways, wrap mid-word or leave the
// controls off screen. Usage: pnpm mobile:build && node scripts/visual/layout-audit.mjs
// Optional arguments: "320x568,375x667" and a comma-separated chapter list.
// Browser emulation is not a physical-device or touch-comfort check.
import {execFileSync} from 'node:child_process';
import {createReadStream, existsSync, statSync} from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launch} from './chrome.mjs';

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
  const picker = [...document.querySelectorAll('button,a')].find(b => /Bölümler ve albümler/.test(b.getAttribute('aria-label') || ''));
  if (!picker) return 'bölüm seçici yok';
  picker.click(); await wait(350);
  const worlds = document.querySelector('select[aria-label="Dünya seç"]');
  if (!worlds) return 'dünya seçimi yok';
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(worlds, worlds.options[${chapter.world}].value);
  worlds.dispatchEvent(new Event('change', {bubbles: true})); await wait(250);
  const button = [...document.querySelectorAll('.chapter-picker-grid button')][${chapter.position}];
  if (!button || button.disabled) return 'bölüm açılamadı';
  button.click(); await wait(1500);
  return 'ok';
})()`;
const measure = `(() => {
  const box = element => element.getBoundingClientRect();
  const board = document.querySelector('.letter-board');
  if (!board) return {error: 'tahta yok'};
  const cells = [...board.querySelectorAll('span[data-cell]')], rack = document.querySelector('.target-rack');
  const tags = [...document.querySelectorAll('.target-rack .word-tag')];
  const wrapped = tags.filter(tag => [...tag.querySelectorAll('.target-letters')].some(word => {
    let top = null;
    for (const letter of word.children) {
      if (letter.classList.contains('target-space')) { top = null; continue; }
      const y = Math.round(box(letter).top);
      if (top !== null && Math.abs(y - top) > 4) return true;
      top = y;
    }
    return false;
  })).map(tag => tag.textContent.slice(0, 20));
  const clipped = rack ? tags.filter(tag => box(tag).right > box(rack).right + 1 || box(tag).left < box(rack).left - 1).map(tag => tag.textContent.slice(0, 20)) : [];
  const controls = [...document.querySelectorAll('.play-controls button, .solo-control-dock button')].filter(button => box(button).width > 0);
  return {size: Math.round(Math.sqrt(cells.length)), cell: Math.round(box(cells[0]).width * 10) / 10,
    boardBottom: Math.round(box(board).bottom), controlsBottom: controls.length ? Math.max(...controls.map(button => Math.round(box(button).bottom))) : 0,
    height: innerHeight, scrolls: document.scrollingElement.scrollHeight > innerHeight, sideways: document.documentElement.scrollWidth > innerWidth, wrapped, clipped};
})()`;

let failures = 0;
const page = await launch();
try {
  for (const [width, height] of sizes) {
    await page.viewport(width, height);
    await page.goto(url);
    await page.evaluate(`localStorage.clear(); localStorage.setItem(${JSON.stringify(fixture.key)}, ${JSON.stringify(fixture.value)}); 'ok'`);
    const rows = [];
    for (const chapter of only ? fixture.chapters.filter(item => only.includes(item.number)) : fixture.chapters) {
      await page.goto(url, 700);
      const opened = await page.evaluate(open(chapter));
      rows.push({number: chapter.number, id: chapter.id, ...(opened === 'ok' ? await page.evaluate(measure) : {error: opened})});
    }
    const bad = rows.filter(row => row.error || row.scrolls || row.sideways || row.wrapped.length || row.clipped.length || row.boardBottom > row.height || row.controlsBottom > row.height);
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
