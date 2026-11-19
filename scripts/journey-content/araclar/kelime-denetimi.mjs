#!/usr/bin/env node
/**
 * Kelime Teneffüsü · kelime bankası kalite denetimi (Claude, 19 Kasım 2026).
 * Bankadaki her kelimeyi ve her bölümü ölçülebilir kurallardan geçirir. Hata varsa çıkış kodu 1.
 * Kaynaklar (kaynaklar/ klasörü, KAYNAKLAR.md'de lisanslarıyla):
 *   zemberek-*.dict  Zemberek NLP sözlükleri (Apache-2.0): sözlük, yer adı, özel ad
 *   tr_50k.txt       FrequencyWords, OpenSubtitles 2018 sıklık listesi (içerik CC-BY-SA-4.0; yalnız denetimde, oyuna girmez)
 *   ldnoobw-tr.txt   LDNOOBW Türkçe uygunsuz kelime listesi (CC-BY-4.0)
 * Kullanım: node kelime-denetimi.mjs <banka.txt> [--kaynak klasör] [--onay onayli-kelimeler.txt] [--eski mevcut-bantlar.json] [--json çıktı.json]
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {dirname,join} from 'node:path';import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2);const opt=(k,d)=>{const i=args.indexOf(k);return i>=0?args[i+1]:d;};
const HERE=dirname(fileURLToPath(import.meta.url));
const bankPath=args[0];const SRC=opt('--kaynak',join(HERE,'..','kaynaklar'));
const onayPath=opt('--onay',join(HERE,'..','kelime-bankasi','onayli-kelimeler.txt'));
const eskiPath=opt('--eski',join(HERE,'mevcut-bantlar.json'));const jsonOut=opt('--json',null);
const low=w=>w.toLocaleLowerCase('tr-TR'),up=w=>w.toLocaleUpperCase('tr-TR');
const lines=f=>readFileSync(join(SRC,f),'utf8').split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
const lemma=l=>low(l.split(/\s+/)[0]);
const DICT=new Set([...lines('zemberek-master-dictionary.dict'),...lines('zemberek-non-tdk.dict')].map(lemma));
const PLACE=new Set(lines('zemberek-locations-tr.dict').map(lemma)),PROPER=new Set(lines('zemberek-proper.dict').map(lemma));
const RANK=new Map();lines('tr_50k.txt').forEach((l,i)=>{const w=l.split(' ')[0];if(!RANK.has(w))RANK.set(w,i+1);});
const BAD=lines('ldnoobw-tr.txt').map(low);
const TOP10K=new Set(lines('zemberek-first-10K').map(low));
// Türetme: sözlük kök tutar (yarış, nöbet). Yaygın yapım ekini atıp kökü (ya da kök+mak) ara.
const EKLER=['ler','lar','malık','melik','lık','lik','luk','lük','sız','siz','suz','süz','cı','ci','cu','cü','çı','çi','çu','çü','lı','li','lu','lü','ma','me','ış','iş','uş','üş','ı','i','u','ü'];
const turetme=l=>{for(const e of EKLER){if(l.length-e.length<3||!l.endsWith(e))continue;const k=l.slice(0,-e.length);
 for(const c of [k,k+'mak',k+'mek',k.replace(/ğ$/,'k'),k.replace(/c$/,'ç'),k.replace(/b$/,'p'),k.replace(/d$/,'t')])if(DICT.has(c))return c;}return null;};
const ONAY=new Map(existsSync(onayPath)?readFileSync(onayPath,'utf8').split('\n').filter(l=>l.includes('|')&&!l.startsWith('#')).map(l=>{const [w,why]=l.split('|').map(s=>s.trim());return [up(w),why];}):[]);
const ESKI=existsSync(eskiPath)?JSON.parse(readFileSync(eskiPath,'utf8')):[];
// --- KURALLAR (ICERIK-ALTYAPISI.md §3 ile aynı) ---
const KURAL={harf:/^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]+$/,minBoy:3,maxBoy:9,tekrarHata:40,tekrarUyari:120,yedekOran:1.25,
 nadirSinir:30000,ucHarfOran:0.25};
// Bölüm sırası → istenen kelime sayısı (uretici-v3.mts ile aynı tablo)
import('./zorluk-tablosu.mjs').then(({hedef})=>run(hedef));
function run(hedef){
 const cats=[];let w=null;
 for(const raw of readFileSync(bankPath,'utf8').split('\n')){const ln=raw.trim();if(!ln||ln.startsWith('#'))continue;
  const m=ln.match(/^@dunya (\d+) (\S+) \| (.+)$/);if(m){w={no:+m[1],id:m[2],name:m[3]};continue;}
  const [n,bandRaw,ws]=ln.split('|').map(s=>s.trim());const ozel=/\[özel\]/.test(bandRaw);const band=bandRaw.replace(/\s*\[özel\]/,'');
  cats.push({world:w.no,n:+n,lv:(w.no-1)*6+(+n),band,ozel,words:ws.split(/\s+/).filter(Boolean)});}
 const rows=[],lastSeen=new Map();let hata=0,uyari=0;
 const add=(sev,lv,word,kod,msg)=>{rows.push({sev,lv,word,kod,msg});if(sev==='HATA')hata++;else uyari++;};
 for(const c of cats){
  const H=hedef(c.world,c.n);const need=Math.ceil(H.words*KURAL.yedekOran);
  if(c.words.length<need)add('HATA',c.lv,'',"yedek","bankada "+c.words.length+" kelime var, en az "+need+" gerekir ("+H.words+" × "+KURAL.yedekOran+")");
  const near=new Set(ESKI.slice(Math.max(0,c.lv-7),c.lv-1).flatMap(b=>b.words||[]));
  const seen=new Set();let uc=0;
  for(const word of c.words){
   const l=low(word),boy=[...word].length,onay=ONAY.get(word);
   if(seen.has(word))add('HATA',c.lv,word,'çift','aynı kategoride iki kez');seen.add(word);
   if(!KURAL.harf.test(word))add('HATA',c.lv,word,'harf','yalnız Türkçe büyük harf; boşluk, kesme, Q/W/X yok');
   if(boy<KURAL.minBoy||boy>KURAL.maxBoy)add('HATA',c.lv,word,'boy',boy+' harf; izin 3–9 (tahta en çok 9×9)');
   if(boy>H.C&&boy>H.R)add('HATA',c.lv,word,'sığma',boy+' harf, '+H.C+'×'+H.R+' tahtaya sığmaz');
   if(boy===3)uc++;
   const kok=DICT.has(l)?l:turetme(l),sozluk=!!kok,yer=PLACE.has(l),ozelAd=PROPER.has(l);
   if(!sozluk&&!yer&&!ozelAd&&!onay)add('HATA',c.lv,word,'sözlük','Zemberek sözlüğünde (kök dahil), yer adlarında ve özel adlarda yok; doğruysa kelime-bankasi/onayli-kelimeler.txt dosyasına gerekçesiyle ekle');
   if(!sozluk&&(yer||ozelAd)&&!c.ozel&&!onay)add('UYARI',c.lv,word,'özel ad','yalnız özel ad olarak bulundu, kategori [özel] değil');
   const rank=RANK.get(l),tanidik=(rank&&rank<=KURAL.nadirSinir)||TOP10K.has(l);
   if(!onay&&!tanidik&&!(c.ozel&&(yer||ozelAd)))add('UYARI',c.lv,word,'nadir','altyazı sıklığı '+(rank??'50.000 dışı')+', haber ilk 10.000 dışı; tanınırlığı elle doğrula');
   for(const b of BAD){if(b.length<3)continue;const hit=l===b||(b.length>=4&&(l.includes(b)||[...l].reverse().join('').includes(b)));
    if(hit)add('HATA',c.lv,word,'uygunsuz','uygunsuz kelime listesiyle eşleşiyor: '+b);
    else if(b.length===3&&l.startsWith(b))add('UYARI',c.lv,word,'uygunsuz?','uygunsuz kökle başlıyor ('+b+'); elle bak');}
   const other=c.words.filter(x=>x!==word&&(x.includes(word)));
   if(other.length)add('UYARI',c.lv,word,'iç içe','şu kelimenin içinde: '+other.join(', ')+' (üretici ikisini birlikte seçmez)');
   if(near.has(word))add('UYARI',c.lv,word,'sınır','eski tahtanın önceki 6 bölümünde var; üretici seçmez');
   const ls=lastSeen.get(word);if(ls!==undefined&&c.lv-ls<KURAL.tekrarUyari)add(c.lv-ls<KURAL.tekrarHata?'HATA':'UYARI',c.lv,word,'tekrar',(c.lv-ls)+' bölüm önce de vardı ('+ls+')');
  }
  if(uc/c.words.length>KURAL.ucHarfOran+0.15)add('UYARI',c.lv,'','kısa','3 harfli kelime oranı yüksek: '+uc+'/'+c.words.length);
  for(const word of c.words)lastSeen.set(word,c.lv);
 }
 const by=k=>rows.filter(r=>r.sev===k);
 console.log(`Kelime denetimi: ${cats.length} kategori, ${cats.reduce((s,c)=>s+c.words.length,0)} kelime · HATA ${hata} · UYARI ${uyari}`);
 for(const r of [...by('HATA'),...by('UYARI')])console.log(`${r.sev.padEnd(5)} ${String(r.lv).padStart(3)} ${r.word.padEnd(11)} [${r.kod}] ${r.msg}`);
 if(jsonOut)writeFileSync(jsonOut,JSON.stringify({hata,uyari,rows},null,1));
 process.exit(hata?1:0);
}
