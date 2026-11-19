import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const source=readFileSync(new URL('./veri/yerlesim.json',import.meta.url),'utf8');
const {levels}=JSON.parse(source);
const bank=readFileSync(new URL('./kelime-bankasi/yolculuk-v3-dunya-01-03.txt',import.meta.url),'utf8');
const constellation=bank.split('\n').find(line=>line.includes('| Takımyıldızlar '));
assert(constellation&&!constellation.split('|').at(-1).trim().split(/\s+/).includes('ÜLKER'),'Takımyıldızlar: onaylı editör düzeltmesi geri alındı.');
const reviewed=new Map(bank.split('\n').filter(line=>/^\d+\s*\|/.test(line)).map(line=>{
 const [,title,words]=line.split('|').map(s=>s.trim());
 return [title.replace(/\s*\[özel\]$/,''),new Set(words.split(/\s+/))];
}));
assert.equal(levels.length,18);
const records=levels.map(({n,id,band,grid,placements,words,hiddenIds,tier},index)=>{
 assert.equal(n,index+1);
 assert(typeof band==='string' && band.trim().length>0,'Boş bölüm başlığı: '+n);
 assert.deepEqual(placements.map(p=>p[0]),words);
 assert(words.every(word=>reviewed.get(band)?.has(word)),'Bant veya kelime editör bankasıyla eşleşmiyor: '+id);
 return ' '+JSON.stringify(id)+':'+JSON.stringify({band,grid,placements,hiddenIds,tier})+',';
});
const text=[
 '// Generated from reviewed yerlesim.json. SHA-256 '+createHash('sha256').update(source).digest('hex'),
 'interface AuthoredLevel {band:string;grid:string[];placements:[string,number,number,number,number][];hiddenIds:string[];tier:string}',
 'export const AUTHORED_JOURNEY:Readonly<Record<string,AuthoredLevel>>={',
 ...records,'};',''
].join('\n');
const dest=new URL('../../lib/game/authored-journey-data.ts',import.meta.url);
if(process.argv.includes('--write'))writeFileSync(dest,text);
else assert.equal(readFileSync(dest,'utf8'),text,'Tablo değişmiş. Denetleyip generate.mjs --write çalıştır.');
