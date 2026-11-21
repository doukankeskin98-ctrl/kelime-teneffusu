// Kayıt kalıcılığı denemesi (Claude, 21 Kasım 2026; Codex incelemesi sonrası).
// Her deneme: YENİ profil → 1. bölümü bitir → kaydın tamamlandığını doğrula → bekle → tarayıcıyı kapat (tür seçilir)
//             → aynı profili yeniden aç → kayıt birebir aynı mı (ayrıştırılmış JSON, anahtar sırası önemsiz).
// Kullanım: KT_URL=http://127.0.0.1:5191/ node kayit-kaliciligi.mjs <çıktı.json> [deneme=3] [bekleme ms=1000] [türler=duzgun,SIGTERM,SIGKILL] [--kapi duzgun]
// Çıkış: --kapi ile verilen türlerde (varsayılan: duzgun) tek kayıp ya da doğrulanamayan deneme → 1.
// NOT: Masaüstü Chrome'u öldürmek iPhone'da uygulamayı kaydırıp kapatmakla aynı değildir. M9 kabulü gerçek iPhone'da 20/20'dir;
//      bu araç yalnız web katmanını ölçer. Sert kapanış sonuçları rapora yazılır, kapı değildir.
import {launch,sleep,freshProfile} from './cdp.mjs';import {solve} from './oyna.mjs';import {writeFileSync} from 'node:fs';
const args=process.argv.slice(2);const ki=args.indexOf('--kapi');if(ki>=0&&(!args[ki+1]||args[ki+1].startsWith('--'))){console.error('Geçersiz --kapi');process.exit(1);}const KAPI=new Set(ki>=0?args.splice(ki,2)[1].split(','):['duzgun']);
const [OUT,N='3',WAIT='1000',TYPES='duzgun,SIGTERM,SIGKILL']=args;if(!OUT){console.error('çıktı dosyası ver');process.exit(2);}
const validTypes=['duzgun','SIGTERM','SIGKILL'];if(args.length>4||!Number.isInteger(+N)||+N<1||!Number.isFinite(+WAIT)||+WAIT<0||!TYPES.split(',').every(t=>validTypes.includes(t))||![...KAPI].every(t=>validTypes.includes(t)&&TYPES.split(',').includes(t))){console.error('Geçersiz deneme sayısı, süre veya kapanış türü.');process.exit(1);}
const URL=process.env.KT_URL||'http://127.0.0.1:5191/';
const READ=`(()=>{const o={};for(const k of Object.keys(localStorage))if(/^kelime-teneffusu/.test(k)){try{o[k]=JSON.parse(localStorage.getItem(k));}catch{o[k]='BOZUK:'+localStorage.getItem(k).length;}}const s=document.querySelector('[aria-label$="yıldız. Başarı bilgisi"]');return {store:o,stars:s?s.textContent.trim():null}})()`;
const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
const same=(a,b)=>JSON.stringify(canon(a))===JSON.stringify(canon(b));
const rows=[];let port=9850;
for(const kind of TYPES.split(','))for(let i=1;i<=+N;i++){
 const profile=freshProfile('kayit');const row={kind,deneme:i};let p;
 try{
  p=await launch({profile,reuse:true,port:port++});await p.viewport(393,852,2);await p.send('Network.enable');await p.send('Network.setBlockedURLs',{urls:['https://*','wss://*']});
  await p.goto(URL,2600);if(!(await p.clickText('^BÖLÜM 1')))throw new Error('BÖLÜM 1 düğmesi yok');await sleep(2300);await p.clickText('^Atla$');
  const r=await solve(p,{delay:420});if(r.err||(r.done||[]).some(d=>d.bulunamadi))throw new Error('bölüm çözülemedi');
  await sleep(2800);await p.goto(URL,2600);const before=await p.eval(READ);row.onceYildiz=before.stars;
  if(before.stars!=='3'||!Object.keys(before.store).length)throw new Error('bölüm bitti ama kayıt/ana ekran 3 yıldız göstermiyor ('+before.stars+')');
  await sleep(+WAIT);await p.close(kind);
  p=await launch({profile,reuse:true,port:port++});await p.viewport(393,852,2);await p.send('Network.enable');await p.send('Network.setBlockedURLs',{urls:['https://*','wss://*']});await p.goto(URL,2600);const after=await p.eval(READ);await p.close('SIGKILL');
  row.sonraYildiz=after.stars;row.kayitAyni=same(before.store,after.store);row.sonuc=row.kayitAyni?'korundu':'KAYBOLDU';
 }catch(e){row.sonuc='DOĞRULANAMADI';row.hata=e.message;}finally{try{await p?.close('SIGKILL');}catch{}}
 rows.push(row);console.log(JSON.stringify(row));
}
const kapi=rows.filter(r=>KAPI.has(r.kind)&&r.sonuc!=='korundu');
writeFileSync(OUT,JSON.stringify({url:URL,bekleme:+WAIT,kapi:[...KAPI],rows},null,1));
console.log(`SONUÇ: ${rows.filter(r=>r.sonuc==='korundu').length}/${rows.length} korundu; kapı (${[...KAPI]}) ihlali ${kapi.length}`);process.exit(kapi.length?1:0);
