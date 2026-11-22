import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const source=readFileSync(new URL('./veri/yerlesim.json',import.meta.url),'utf8');
const {levels}=JSON.parse(source);
const bankDir=new URL('./kelime-bankasi/',import.meta.url);
const bank=readdirSync(bankDir).filter(f=>/^yolculuk-v3-dunya-.*\.txt$/.test(f)).sort().map(f=>readFileSync(new URL(f,bankDir),'utf8')).join('\n');
const constellation=bank.split('\n').find(line=>line.includes('| Takımyıldızlar '));
assert(constellation&&!constellation.split('|').at(-1).trim().split(/\s+/).includes('ÜLKER'),'Takımyıldızlar: onaylı editör düzeltmesi geri alındı.');
const reviewed=new Map();let world=0;
for(const line of bank.split('\n')){
 const header=line.match(/^@dunya (\d+) /);if(header){world=Number(header[1]);continue;}
 if(!/^\d+\s*\|/.test(line))continue;
 const [pos,title,...rest]=line.split('|').map(s=>s.trim()),raw=rest.join('|');
 const clues=raw.includes('=')?Object.fromEntries(raw.split(';').filter(s=>s.trim()).map(s=>s.split('=').map(v=>v.trim()))):undefined;
 const key=(world-1)*6+Number(pos);assert(!reviewed.has(key),'Tekrarlanan banka bölümü: '+key);
 reviewed.set(key,{title:title.replace(/\s*\[[^\]]*\]\s*$/,''),words:new Set(clues?Object.keys(clues):raw.split(/\s+/)),clues});
}
assert.equal(levels.length,312);assert.equal(reviewed.size,312);
const records=levels.map(({n,id,band,grid,placements,words,hiddenIds,tier,clues},index)=>{
 assert.equal(n,index+1);
 assert(typeof band==='string' && band.trim().length>0,'Boş bölüm başlığı: '+n);
 assert.deepEqual(placements.map(p=>p[0]),words);
 const approved=reviewed.get(n);assert.equal(band,approved?.title,'Bölüm başlığı: '+id);
 assert(words.every(word=>approved.words.has(word)),'Kelime editör bankasıyla eşleşmiyor: '+id);
 const expected=approved.clues?Object.fromEntries(words.map(w=>[w,approved.clues[w]])):undefined;
 assert.deepEqual(clues,expected,'Tanımlar editör bankasıyla eşleşmiyor: '+id);
 return ' '+JSON.stringify(id)+':'+JSON.stringify({band,grid,placements,hiddenIds,tier,...(clues?{clues}:{})})+',';
});
const text=[
 '// Generated from reviewed yerlesim.json. SHA-256 '+createHash('sha256').update(source).digest('hex'),
 'interface AuthoredLevel {band:string;grid:string[];placements:[string,number,number,number,number][];hiddenIds:string[];tier:string;clues?:Record<string,string>}',
 'export const AUTHORED_JOURNEY:Readonly<Record<string,AuthoredLevel>>={',
 ...records,'};',''
].join('\n');
const dest=new URL('../../lib/game/authored-journey-data.ts',import.meta.url);
if(process.argv.includes('--write'))writeFileSync(dest,text);
else assert.equal(readFileSync(dest,'utf8'),text,'Tablo değişmiş. Denetleyip generate.mjs --write çalıştır.');
