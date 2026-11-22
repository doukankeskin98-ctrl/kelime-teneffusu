/**
 * Yerleşim tablosu denetimi (CI kapısı). Claude, 19 Kasım 2026.
 * Üreticinin ya da elle düzeltilmiş tablonun her bölümünü kurallara karşı yeniden doğrular. Hata varsa çıkış kodu 1.
 * Kullanım: node --experimental-strip-types tahta-denetimi.mts <oyun-kök> <yerlesim.json> [daha-fazla.json ...] --banka a.txt,b.txt [--dilim]
 *   Varsayılan: tablo TAM olmalı (mevcut-bantlar.json'daki bütün bölümler, dosyada 1..N sırasıyla, her biri bir kez).
 *   --dilim: yalnız verilen bölümleri denetle (üretim sırasındaki ara dilimler için). CI'da kullanılmaz.
 *   --banka zorunludur (--dilim yoksa): başlık, kelime ve tanım onaylı bankayla birebir karşılaştırılır.
 * 20 Kasım 2026: Codex'in bulgusu üzerine sıkılaştırıldı (311 bölüm, boş liste, yanlış başlık ve ilgisiz tanım geçiyordu).
 */
import {readFileSync} from 'node:fs';
import type {Layout} from './layout-types.mts';
const argv=process.argv.slice(2);const bi=argv.indexOf('--banka');const bankFiles=bi>=0?argv.splice(bi,2)[1]!.split(','):[];
const di=argv.indexOf('--dilim');const DILIM=di>=0;if(DILIM)argv.splice(di,1);
const [root,...paths]=argv;
// --banka a.txt,b.txt: her hedefin kendi bölümünün kategorisinde olduğunu doğrula (Codex önerisi, 19 Kasım 2026)
let BANK:Map<number,Set<string>>|null=null;const BTITLE=new Map<number,string>(),BCLUE=new Map<number,Map<string,string>>();
if(bankFiles.length){BANK=new Map();for(const f of bankFiles){let wn=0;for(const raw of readFileSync(f,'utf8').split('\n')){const ln=raw.trim();if(!ln||ln.startsWith('#'))continue;const m=ln.match(/^@dunya (\d+) /);if(m){wn=+m[1]!;continue;}
 const [n,title,...rest]=ln.split('|').map(x=>x.trim());const ws=rest.join('|');const key=(wn-1)*6+(+n!);if(BANK.has(key))throw new Error('bankada aynı bölüm iki kez: '+key);
 const words=ws.includes('=')?ws.split(';').map(x=>x.split('=')[0]!.trim()).filter(Boolean):ws.split(/\s+/).filter(Boolean);BANK.set(key,new Set(words));BTITLE.set(key,title!.replace(/\s*\[[^\]]*\]\s*$/,''));/* [özel] gibi banka işaretleri başlığın parçası değil */
 if(ws.includes('=')){const m=new Map<string,string>();for(const part of ws.split(';')){const i=part.indexOf('=');if(i<0)continue;m.set(part.slice(0,i).trim(),part.slice(i+1).trim());}BCLUE.set(key,m);}}}}
const {boardIssues,PRESENTATION_RULES}=await import(root+'/lib/game/board-quality.ts');
const {hedef,puan,SINIR,YONLER}=await import(new URL('zorluk-tablosu.mjs',import.meta.url).href);
const {uygunsuzDiziler}=await import(new URL('uygunsuz-tarama.mjs',import.meta.url).href);
const LV=JSON.parse(readFileSync(new URL('mevcut-bantlar.json',import.meta.url),'utf8'));
const REV=['0,-1','-1,0','-1,-1','1,-1'];
const raw:(Layout&{fail?:string})[]=paths.flatMap(p=>{const j=JSON.parse(readFileSync(p,'utf8'));return Array.isArray(j.levels)?j.levels:[];});
const errs:string[]=[],warns:string[]=[];const E=(n:number,m:string)=>errs.push(`HATA  ${String(n).padStart(3)} ${m}`),W=(n:number,m:string)=>warns.push(`UYARI ${String(n).padStart(3)} ${m}`);
// Bütünlük: dosyadaki sıra oyunun sırasıdır; sıralamadan ÖNCE denetlenir
if(!paths.length)E(0,'tablo dosyası verilmedi');
if(!DILIM&&!bankFiles.length)E(0,'--banka verilmedi: başlık, kelime ve tanımlar onaylı içerikle karşılaştırılamaz');
raw.forEach((o,i)=>{if(!Number.isInteger(o?.n))E(0,`${i+1}. kayıtta bölüm numarası yok`);else if(!DILIM&&o.n!==i+1)E(o.n,`dosya sırası bozuk: ${i+1}. kayıt ${o.n}. bölüm`);});
{const seen=new Set<number>();for(const o of raw){if(seen.has(o.n))E(o.n,'bölüm iki kez var');seen.add(o.n);}
 if(!DILIM){if(raw.length!==LV.length)E(0,`tabloda ${raw.length} bölüm var, ${LV.length} olmalı`);for(let n=1;n<=LV.length;n++)if(!seen.has(n))E(n,'bölüm tabloda yok');}
 if(!raw.length)E(0,'tablo boş');}
const levels=[...raw].sort((a,b)=>a.n-b.n);
const TITLES=new Map<string,number>();const lastUse=new Map<string,number>();const prev=new Map<number,number>();
for(const o of levels){
 if(o.fail){E(o.n,'üretilemedi: '+o.fail);continue;}
 const band=LV[o.n-1];if(!band||band.id!==o.id){E(o.n,'bölüm kimliği mevcut sırayla eşleşmiyor: '+o.id);continue;}
 if(o.world!==Math.ceil(o.n/6)||o.pos!==((o.n-1)%6)+1)E(o.n,`dünya/sıra yanlış: dünya ${o.world} sıra ${o.pos}, olması gereken ${Math.ceil(o.n/6)}/${((o.n-1)%6)+1}`);
 if(!Array.isArray(o.words)||!Array.isArray(o.placements)||!Array.isArray(o.grid)||!o.grid.length){E(o.n,'kelime, yerleşim ya da ızgara eksik');continue;}
 if(JSON.stringify(o.words)!==JSON.stringify(o.placements.map(p=>p[0])))E(o.n,'kelime listesi yerleşimlerle aynı sırada değil');
 if(BANK){const t=BTITLE.get(o.n);if(t!==undefined&&o.band!==t)E(o.n,`bant başlığı "${o.band}", onaylı bankada "${t}"`);}
 {const UP=(x:string)=>x.toLocaleUpperCase('tr-TR').replace(/Â/g,'A').replace(/Î/g,'İ').replace(/Û/g,'U');const bt=UP(String(o.band??''));const hidW=new Set((o.hiddenIds??[]).map((id:string)=>o.words[+id.split('.')[0]!]));
  for(const w of o.words)if([...w].length>=3&&bt.includes(UP(w))&&(hidW.has(w)||band.w?.chapter?.clues))E(o.n,`bant başlığı "${o.band}" ${hidW.has(w)?'gizli kelimeyi':'bilmece cevabını'} ele veriyor: ${w}`);
  if(TITLES.has(o.band))E(o.n,`bant başlığı "${o.band}" ${TITLES.get(o.band)}. bölümde de var`);else TITLES.set(o.band,o.n);}
 const isClue=!!band.w?.chapter?.clues;const H=hedef(o.world,o.pos,{clue:isClue});
 if(o.tier!==H.tier)E(o.n,`zorluk etiketi "${o.tier}", tabloya göre "${H.tier}" olmalı (oyuncuya yanlış etiket gösterilir)`); // 20 Kasım 2026, Codex bulgusu
 if(isClue){if(o.clues&&Object.keys(o.clues).some(k=>!o.words.includes(k)))E(o.n,'tahtada olmayan kelimenin tanımı var');for(const w of o.words){const c=o.clues?.[w];if(!c)E(o.n,w+': bilmece bölümünde tanım yok');else{if(BANK){const bc=BCLUE.get(o.n)?.get(w);if(bc===undefined)E(o.n,w+': onaylı bankada bu kelimenin tanımı yok');else if(bc!==c)E(o.n,`${w}: tanım onaylı bankadakinden farklı ("${c}" / bankada "${bc}")`);}if([...c].length>34)E(o.n,`${w}: tanım ${[...c].length} karakter, en çok 34 (320'de iki satır)`);const kl=w.toLocaleLowerCase('tr-TR');if(c.toLocaleLowerCase('tr-TR').includes(kl.slice(0,Math.max(4,kl.length-2))))E(o.n,w+': tanım cevabı içeriyor');for(const x of o.words){if(x===w)continue;const xl=x.toLocaleLowerCase('tr-TR');if(c.toLocaleLowerCase('tr-TR').includes(xl.slice(0,Math.max(4,xl.length-2))))E(o.n,`${w}: tanım başka bir cevabı ele veriyor (${x})`);}}}}
 else if(o.clues)E(o.n,'bilmece olmayan bölümde tanım var');
 const R=o.grid.length,C=o.grid[0]!.length;
 if(R>SINIR.maxSatir||C>SINIR.maxSutun)E(o.n,`tahta ${C}×${R}, sınır 9×9`);
 if(R!==H.R||C!==H.C)E(o.n,`tahta ${C}×${R}, tablo ${H.C}×${H.R} istiyor`);
 if(o.grid.some((r:string)=>[...r].length!==C))E(o.n,'satır uzunlukları eşit değil');
 if(o.grid.some((r:string)=>!/^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]+$/.test(r)))E(o.n,'ızgarada Türkçe alfabe dışı harf var');
 if(o.words.length>SINIR.maxKelime)E(o.n,`${o.words.length} kelime, sınır ${SINIR.maxKelime}`);
 if(o.words.length!==H.words)E(o.n,`${o.words.length} kelime, tablo ${H.words} istiyor`);
 const g=o.grid.map((r:string)=>[...r]);let diag=0,rev=0;const use=new Map<string,number>(),yon=new Map<string,number>();
 for(const [t,r1,c1,r2,c2] of o.placements){const dr=Math.sign(r2-r1),dc=Math.sign(c2-c1),n=[...t].length;
  if(Math.max(Math.abs(r2-r1),Math.abs(c2-c1))!==n-1||(dr&&dc&&Math.abs(r2-r1)!==Math.abs(c2-c1)))E(o.n,t+': yol uzunluğu/yönü kelimeyle uyuşmuyor');
  for(let k=0;k<n;k++){const ch=g[r1+dr*k]?.[c1+dc*k];if(ch!==[...t][k]){E(o.n,t+': ızgaradaki harf uyuşmuyor');break;}const key=(r1+dr*k)+','+(c1+dc*k);use.set(key,(use.get(key)??0)+1);}
  if(dr&&dc)diag++;if(REV.includes(dr+','+dc))rev++;yon.set(dr+','+dc,(yon.get(dr+','+dc)??0)+1);if(!YONLER[H.dirs].includes(dr+','+dc))E(o.n,t+': bu bölümde izin verilmeyen yön '+dr+','+dc);
  if(n<SINIR.minHarf||n>SINIR.maxHarf)E(o.n,t+': '+n+' harf');}
 const N=o.words.length,cross=[...use.values()].filter(v=>v>1).length;
 const Y=H.yon;
 if(diag<Y.caprazAz||diag>Y.caprazCok)E(o.n,`çapraz ${diag}/${N}, izin ${Y.caprazAz}–${Y.caprazCok}`);
 if(rev<Y.tersAz||rev>Y.tersCok)E(o.n,`ters ${rev}/${N}, izin ${Y.tersAz}–${Y.tersCok}`);
 const yogun=Math.max(...yon.values());if(yogun>Y.yonCok)E(o.n,`bir yönde ${yogun} kelime, en çok ${Y.yonCok}`);
 if(yon.size<Y.yonAz)E(o.n,`${yon.size} farklı yön, en az ${Y.yonAz}`);
 if(cross<H.crossMin)E(o.n,`kesişme ${cross}, en az ${H.crossMin}`);if(H.maxCross===0&&cross>0)E(o.n,'öğretme bölümünde kesişme olmamalı');
 const hid=o.hiddenIds??[],ids=new Set(o.words.map((_:string,i:number)=>i+'.0'));
 if(hid.length!==H.hidden)E(o.n,`gizli kelime ${hid.length}, tablo ${H.hidden} istiyor`);
 if(new Set(hid).size!==hid.length)E(o.n,'gizli kelime kimliği iki kez');
 for(const id of hid){if(!ids.has(id))E(o.n,'gizli kelime kimliği tahtada yok: '+id);else if([...o.words[+id.split('.')[0]!]!].length<=3)E(o.n,'3 harfli kelime gizlenmez: '+o.words[+id.split('.')[0]!]);}
 if(o.hiddenWords&&JSON.stringify(o.hiddenWords)!==JSON.stringify(hid.filter((id:string)=>ids.has(id)).map((id:string)=>o.words[+id.split('.')[0]!])))E(o.n,'gizli kelime adları kimliklerle uyuşmuyor');
 for(const u of uygunsuzDiziler(o.grid,o.placements))E(o.n,`uygunsuz dizi tahtada okunuyor: ${u.dizi} (${u.a}, yön ${u.yon})`);
 const uc=o.words.filter((w:string)=>[...w].length===3).length,uzun=o.words.filter((w:string)=>[...w].length>=8).length;
 if(uc>Math.max(1,Math.floor(N*SINIR.ucHarfOran)))E(o.n,`3 harfli kelime ${uc}, en çok ${Math.max(1,Math.floor(N*SINIR.ucHarfOran))}`);
 if(uzun>SINIR.maxUzun)E(o.n,`8–9 harfli kelime ${uzun}, en çok ${SINIR.maxUzun}`);
 for(const w of o.words){const t=[...w].reverse().join('');if(o.words.some((x:string)=>x!==w&&(x.includes(w)||x.includes(t))))E(o.n,w+': başka bir hedefin içinde ya da tersi içinde');}
 const near=new Set(LV.slice(Math.max(0,o.n-7),o.n-1).flatMap((b:{words:string[]})=>b.words));for(const w of o.words)if(near.has(w))E(o.n,w+': eski tahtanın önceki 6 bölümünde var');
 for(const w of o.words){const ls=lastUse.get(w);if(ls!==undefined&&o.n-ls<40)E(o.n,`${w}: ${o.n-ls} bölüm önce de vardı`);else if(ls!==undefined&&o.n-ls<120)W(o.n,`${w}: ${o.n-ls} bölüm önce de vardı`);lastUse.set(w,o.n);}
 const targets=o.words.map((w:string,i:number)=>({id:i+'.0',label:w,text:w,group:i}));
 const placements=o.placements.map(([t,a,b,c,d])=>{const i=o.words.indexOf(t);return {id:i+'.0',label:t,text:t,group:i,a:[a,b],b:[c,d]};});
 const issues=boardIssues({version:2,size:Math.max(R,C),grid:g,targets,placements},PRESENTATION_RULES);
 for(const is of issues)E(o.n,`oyunun güvenlik denetimi: ${is.kind} ${is.text}`);
 const sc=puan({words:N,letters:o.words.reduce((s:number,w:string)=>s+[...w].length,0),diag,rev,crossings:cross,R,C,long:o.words.filter((w:string)=>[...w].length>=8).length,hidden:o.hiddenIds?.length??0});
 if(!isClue){const p=prev.get(o.world);if(p!==undefined&&o.pos>1&&sc<p+2)E(o.n,`zorluk ${sc.toFixed(1)}, bir önceki bölüm ${p.toFixed(1)}: dünyada her bölüm en az 2 puan zor olmalı`);prev.set(o.world,sc);} // bilmece zincir dışı
 if(BANK){const bw=BANK.get(o.n);if(!bw)E(o.n,'bankada bu bölümün kategorisi yok');else for(const w of o.words)if(!bw.has(w))E(o.n,w+': bu bölümün kategorisinde değil (her hedef kendi başlığının bankasından gelir)');}
}
console.log(`Tahta denetimi: ${levels.length} bölüm${DILIM?' (dilim)':''} · HATA ${errs.length} · UYARI ${warns.length}`);for(const l of [...errs,...warns])console.log(l);
process.exit(errs.length?1:0);
