// Tek sözlük denetimi — KABUL KAPISI (Claude, 21 Kasım 2026; Codex incelemesi sonrası).
// İki kaynak birlikte taranır:
//   1) Ekran: menu-denetimi.mjs'nin metrics.json çıktısı. ZORUNLU ekran envanteri (34 ekran) eksiksiz olmalı.
//   2) Yolculuk (--yolculuk <yeni-oyuncu log.json>): sonuç, bonus ve rehber pencerelerinin tam metni.
//   3) Kaynak (--kaynak <repo kökü>): components/ ve app/ altındaki oyuncuya görünen dizgeler (admin hariç). KAPIDIR.
//      lib/ altındaki içerik dizgeleri (dünya, parça, açıklama metni) KAPI DEĞİL: --icerik-raporu <dosya> ile listelenir;
//      içerik metnini Claude düzeltir (Codex Türkçe içerik yazmaz). Tahta kelime listeleri (BÜYÜK|HARF) atlanır.
// İstisna: terim-istisnalari.json (tam metin + gerekçe). Gerekçesiz istisna girdi hatasıdır.
// Kullanım: node terim-denetimi.mjs <olcum klasörü> 393 [--yolculuk log.json] [--kaynak <repo>] [--icerik-raporu out.txt]
// Çıkış 1: ihlal var, metrics yok/boş/bozuk, zorunlu ekran eksik ya da ekran metinsiz, verilen dosya okunamadı.
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';import {join,relative} from 'node:path';
import {writeFileSync} from 'node:fs';import {dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const errs=[];const out=[];let n=0;const icerik=[];
const args=process.argv.slice(2);const opt=k=>{const i=args.indexOf(k);if(i<0)return null;if(!args[i+1]||args[i+1].startsWith('--'))throw new Error(k+' için değer gerekli');return args.splice(i,2)[1];};
const KAYNAK=opt('--kaynak'),YOL=opt('--yolculuk'),RAPOR=opt('--icerik-raporu');
if(args.length!==2||args.some(a=>a.startsWith('--'))||!['320','393'].includes(args[1]))throw new Error('Ölçüm klasörü, 320/393 ve geçerli seçenekler gerekli');
const [dir,W]=args;
const ZORUNLU=['01-ana','02-yolculugum','03-52-dunya','04-albumlerim','05-album-parca','06-profil','07-basarimlar','08-yildiz-bilgi','09-ayarlar','10-ses-duzeyi','11-diger-ayarlar','11b-erisilebilirlik','11c-tahta-renkleri','11d-kullanim-verileri','12-nasil-oynanir','13-destek','14-gizlilik','15-gunluk','16-arena','17-arena-kurallar','18-arena-siralama','19-arena-arkadas','20-arena-hizli','21-arena-meydan','22-arkadaslarim','23-diger-oyunlar','24-kisa-oyunlar','25-hikayeler','26-diger-bulmacalar','27-cizerek','28-oyun-121','29-oyun-menu','30-ipucu','31-profil-olustur'];
// [desen, gerekçe, yalnız şu ekranlarda (isteğe bağlı)]
const KURAL=[
 [/(?<!\p{L})ke(?:şif(?:ler\p{L}*)?|şf(?:i(?:ni?n?|ne|nde|n)?|e))(?!\p{L})/iu,'"keşif" bölüm anlamında kullanılmaz; "bölüm" / "ek bölüm" de'],
 [/\brota(da|nın|lar|ya|sı)?\b/iu,'"rota" kullanılmaz; "dünya" de'],
 [/\bdurak\b/iu,'"durak" kullanılmaz; "bölüm" de'],
 [/hatıra/iu,'"hatıra" bütün oyundan çıkar: albümde "parça", haftalıkta "kartpostal", rozette "rozet"'],
 [/Defteri\b/u,'dünya albümü için "Defter" adı kullanılmaz (tek ad: dünyanın adı + albüm)'],
 [/Günlüğü\b/u,'dünya albümü için "Günlük" adı kullanılmaz; "Günlük bulmaca" ile karışır'],
 [/yıldız saklı bir harf/iu,'yıldız (★) harf göstermez; gizli harf işareti ✱ (M3)'],
 [/Uğradığın dünya/u,'yanlış ölçü; "Tamamlanan dünya" (M1)'],
 [/henüz açık değil/iu,'çalışmayan özellik oyuncuya söylenmez (M10)'],
 [/^Arkadaşların burada\.?$/u,'profilsiz durumda "Arkadaşların burada" denmez (M11)'],
 [/^Diğer$|^Diğer oyunlar$/u,'4. düğme ve sayfası "Oyunlar"'],
 [/Hızlı Tur\b/u,'cümle düzeni: "Hızlı tur"'],
 [/Kelime avı/iu,'yolculuk sonundaki tur "Bonus turu"'],
 [/kaşif/iu,'profil unvanı: Yeni / Meraklı / Usta gezgin (M2)'],
 [/^KELİME USTASI$/u,'profil unvanı "Usta gezgin"; "Kelime ustası" yalnız Sözcük Yolu (M2)'],
 [/Kelime ustası/iu,'Arena ligi en üst adı "Arena ustası" (M2)',/^(06|1[6-9]|2[01])-/],
];
// İstisna: albüm parçalarının özel adları (sözlük anlamıyla kullanılan kelime)
const IF=join(dirname(fileURLToPath(import.meta.url)),'terim-istisnalari.json');let ISTISNA=[];
if(existsSync(IF)){try{const L=JSON.parse(readFileSync(IF,'utf8'));for(const x of L){if(!x.metin||!x.gerekce||String(x.gerekce).trim().length<8)errs.push('gerekçesiz istisna: '+JSON.stringify(x));else ISTISNA.push(x);}}catch(e){errs.push('terim-istisnalari.json okunamadı: '+e.message);}}
const test=(s,ekran,yer,kapi=true)=>{if(ISTISNA.some(x=>x.metin===s&&(!x.ekran||x.ekran===ekran)))return;for(const [re,why,only] of KURAL){if(only&&!(ekran&&only.test(ekran)))continue;if(re.test(s)){if(kapi){n++;out.push(`${yer}: "${s.slice(0,56)}" → ${why}`);}else icerik.push(`${yer}: "${s.slice(0,80)}" → ${why}`);}}};
// 1) Ekran
const f=`${dir}/${W}/metrics.json`;let M=null;
if(!dir||!W)errs.push('kullanım: node terim-denetimi.mjs <olcum klasörü> <genişlik> [--kaynak <repo>]');
else if(!existsSync(f))errs.push('metrics.json yok: '+f);
else{try{M=JSON.parse(readFileSync(f,'utf8'));}catch(e){errs.push('metrics.json okunamadı: '+e.message);}}
if(!M||typeof M!=='object'||Array.isArray(M))errs.push('metrics.json nesne olmalı');
if(M&&typeof M==='object'&&!Array.isArray(M)){if(!Object.keys(M).length)errs.push('metrics.json boş');
 for(const e of ZORUNLU){const m=M[e];const texts=(m?.texts||[]).filter(t=>!t.cell&&String(t.t||'').trim());if(!m)errs.push('zorunlu ekran ölçülmemiş: '+e);else if(texts.length<3)errs.push(`ekran metinsiz ya da boş (${texts.length} metin): ${e}`);}
 for(const [ekran,m] of Object.entries(M)){const seen=new Set();for(const t of m.texts||[]){if(t.cell)continue;const s=String(t.t||'').trim();if(!s||seen.has(s))continue;seen.add(s);test(s,ekran,ekran);}}}
// 2) Yolculuk
if(YOL){try{const J=JSON.parse(readFileSync(YOL,'utf8'));const L=J.log||J;if(!Array.isArray(L)||!L.length)errs.push('yolculuk kaydı boş: '+YOL);
 for(const x of L){const seen=new Set();for(const part of String(x.t||'').split(' / ')){const s=part.trim();if(s.length<3||seen.has(s)||/^[A-ZÇĞİÖŞÜ]$/.test(s))continue;seen.add(s);test(s,null,'yolculuk '+x.f);}}}catch(e){errs.push('yolculuk kaydı okunamadı: '+e.message);}}
// 3) Kaynak
if(KAYNAK){const files=[];const walk=d=>{for(const x of readdirSync(d)){if(/^(node_modules|tests?|__tests__|dist.*|admin|\.)/.test(x))continue;/* admin: oyuncuya görünmez */const p=join(d,x);const st=statSync(p);if(st.isDirectory())walk(p);else if(/\.(tsx|ts)$/.test(x)&&!/\.(test|spec)\./.test(x))files.push(p);}};
 for(const sub of ['components','app','lib'])if(existsSync(join(KAYNAK,sub)))walk(join(KAYNAK,sub));
 if(!files.length)errs.push('--kaynak altında taranacak dosya yok: '+KAYNAK);
 const STR=/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`|>([^<>{}\n]*[A-Za-zÇĞİÖŞÜçğıöşü][^<>{}\n]*)</g;
 for(const p of files){const lines=readFileSync(p,'utf8').split('\n');lines.forEach((line,i)=>{if(/^\s*(\/\/|\*|\/\*)/.test(line))return;for(const m of line.matchAll(STR)){const s=(m[1]??m[2]??m[3]??m[4]??'').trim();
  // Oyuncuya görünen metin sayılır: boşluk ya da Türkçe harf içerir, büyük harfle başlar ya da cümledir. Kimlik/sınıf adları atlanır.
  if(!s||!/[\sçğıöşüÇĞİÖŞÜ]/.test(s)||/^[a-z0-9:_\-.\/]+$/.test(s)||/^[A-ZÇĞİÖŞÜ| ]+$/.test(s))continue;const rel=relative(KAYNAK,p);test(s,null,rel+':'+(i+1),!rel.startsWith('lib'));}});}}
if(RAPOR){writeFileSync(RAPOR,icerik.join('\n')+'\n');console.log(`içerik raporu: ${icerik.length} satır → ${RAPOR} (kapı değil; Claude'un içerik turu)`);}
if(errs.length)console.log('GİRDİ HATASI:\n '+errs.join('\n '));
console.log(out.join('\n'));console.log(`SONUÇ ${W}: terim ihlali ${n}${KAYNAK?' (ekran + kaynak)':''}; girdi hatası ${errs.length}`);process.exit(n||errs.length?1:0);
