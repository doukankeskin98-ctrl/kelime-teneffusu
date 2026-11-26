// Generate one offline HTML page from the before/after measurements.
// node scripts/visual/butunluk-katalog.mjs <before> <after> <output.html>
// Each run directory contains one subdirectory per viewport with the gate's JSON and PNGs.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {releaseAcceptance} from './butunluk-kapsami.mjs';

const args = process.argv.slice(2);
if (args.length !== 3) throw new Error('Önce klasörü, sonra klasörü ve çıktı sayfası belirtilmeli.');
const [beforeDir, afterDir, output] = args.map(arg => resolve(arg));
const screens = JSON.parse(readFileSync(fileURLToPath(new URL('./butunluk-ekranlar.json', import.meta.url)), 'utf8'));
const views = [['430-safari','430 × 775'],['393-uygulama','393 × 852'],['320','320 × 568']];
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const missing = [];

function readRun(directory, view) {
  const file = join(directory, view, 'butunluk-kapisi.json');
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const captures = new Map();
  for (const row of data.rows.filter(row => row.view === view)) {
    if (captures.has(row.ad)) throw new Error('Yinelenen ekran: ' + view + ' · ' + row.ad);
    captures.set(row.ad, row);
  }
  return {captures, errors:data.errors, directory:join(directory,view)};
}

const groups = views.map(([view,label]) => ({
  view,label,before:readRun(beforeDir,view),after:readRun(afterDir,view),
}));
const summaries = groups.map(({view,before,after}) => {
  const result = releaseAcceptance(screens,[view],[...after.captures.values()],after.errors);
  return {view, expected:screens.length, beforeCaptures:before.captures.size,
    afterCaptures:after.captures.size, beforeErrors:before.errors.length,
    afterErrors:after.errors.length, release:result};
});

function picture(run, name, label) {
  const row = run.captures.get(name);
  if (!row || !existsSync(join(run.directory,row.file))) {
    missing.push(run.directory + ' · ' + name);
    return '<figure><figcaption>'+label+'</figcaption><p>Görüntü alınamadı</p></figure>';
  }
  const file = relative(dirname(output), join(run.directory,row.file));
  const url = file.split('/').map(encodeURIComponent).join('/');
  const [width,height] = views.find(([id])=>id===row.view)[1].split(' × ');
  return '<figure><figcaption>'+label+'</figcaption><a href="'+url+'"><img loading="lazy" decoding="async" width="'+width+'" height="'+height+'" src="'+url+'" alt="'+escape(name)+' · '+label+'"></a></figure>';
}

const sections = groups.map(({view,label,before,after}) => {
  const cards = screens.map(({ad}) =>
    '<article><h3>'+escape(ad)+'</h3><div class="pair">'+picture(before,ad,'0.58.2')+picture(after,ad,'0.58.3')+'</div></article>').join('');
  return '<section id="v'+view+'"><h2>'+label+'</h2><div class="cards">'+cards+'</div></section>';
}).join('');
const summaryTable = summaries.map(s => '<tr><td>'+escape(s.view)+'</td><td>'+s.beforeCaptures+' / '+s.afterCaptures+'</td><td>'+s.beforeErrors+' / '+s.afterErrors+'</td><td>'+s.release.errors.length+'</td></tr>').join('');
const links = groups.map(g => '<a href="#v'+g.view+'">'+g.label+'</a>').join(' ');
const html = `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>0.58.3 pencere karşılaştırması</title>
<style>*{box-sizing:border-box}body{margin:auto;padding:24px;max-width:1600px;font:16px/1.4 system-ui,sans-serif;color:#201634;background:#f7f5fb}h1,h2,h3{line-height:1.15}h3{margin:3px 0 12px;font-size:16px}nav{display:flex;gap:14px;flex-wrap:wrap}a{color:#493b83}section{margin-top:40px}table{border-collapse:collapse}th,td{padding:8px;text-align:left;border-bottom:1px solid #cbc1db}article{background:white;border:1px solid #ddd6e6;border-radius:12px;padding:12px;break-inside:avoid}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:14px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:5px}figure{margin:0;min-width:0}figcaption{color:#4a425a;font-size:13px;margin-bottom:5px}img{display:block;width:100%;height:auto;background:#f1edf5}details{margin-top:18px}summary{cursor:pointer}tbody tr:hover{background:#f0ebf5}</style>
<main><h1>0.58.2 ve 0.58.3</h1><p>Her çiftte aynı görünüm alanı, aynı ekran yolu ve aynı yerel misafir verisi kullanıldı. Görüntüye dokunarak özgün boyutunu açabilirsin.</p>
<table><thead><tr><th>Görünüm</th><th>Ekran · önce / sonra</th><th>Tüm ihlaller · önce / sonra</th><th>0.58.3 kapsamındaki ihlal</th></tr></thead><tbody>${summaryTable}</tbody></table>
<h2>Ekran boyları</h2><nav>${links}</nav>${sections}</main></html>`;
writeFileSync(output, html);
writeFileSync(output.replace(/\.html$/,'.json'), JSON.stringify({summaries,missing},null,2)+'\n');
if (missing.length) {
  console.error(missing.join('\n'));
  process.exitCode=1;
}
