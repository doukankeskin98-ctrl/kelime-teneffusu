// Kayıt kalıcılığı denemesi (Claude, 21 Kasım 2026; Codex incelemesi sonrası).
// Her deneme: YENİ profil → 1. bölümü bitir → kaydın tamamlandığını doğrula → bekle → tarayıcıyı kapat (tür seçilir)
//             → aynı profili yeniden aç → kayıt birebir aynı mı (ayrıştırılmış JSON, anahtar sırası önemsiz).
// Kullanım: KT_URL=http://127.0.0.1:5191/ node kayit-kaliciligi.mjs <çıktı.json> [deneme=3] [bekleme ms=1000] [türler=duzgun,SIGTERM,SIGKILL] [--kapi duzgun]
// Çıkış: --kapi ile verilen türlerde (varsayılan: duzgun) tek kayıp ya da doğrulanamayan deneme → 1.
// NOT: Masaüstü Chrome'u öldürmek iPhone'da uygulamayı kaydırıp kapatmakla aynı değildir. M9 kabulü gerçek iPhone'da 20/20'dir;
//      bu araç yalnız web katmanını ölçer. --kapi tüm üç kapanışı zorunlu kılabilir.
import {readProgress,mergeProgress,emptyProgress} from '../../../lib/game/progress.ts';
import {launch,sleep,freshProfile} from './cdp.mjs';import {solve} from './oyna.mjs';import {writeFileSync,rmSync} from 'node:fs';
const args=process.argv.slice(2);const ki=args.indexOf('--kapi');if(ki>=0&&(!args[ki+1]||args[ki+1].startsWith('--'))){console.error('Geçersiz --kapi');process.exit(1);}const KAPI=new Set(ki>=0?args.splice(ki,2)[1].split(','):['duzgun']);
const [OUT,N='3',WAIT='1000',TYPES='duzgun,SIGTERM,SIGKILL']=args;if(!OUT){console.error('çıktı dosyası ver');process.exit(2);}
const validTypes=['duzgun','SIGTERM','SIGKILL'];if(args.length>4||!Number.isInteger(+N)||+N<1||!Number.isFinite(+WAIT)||+WAIT<0||!TYPES.split(',').every(t=>validTypes.includes(t))||![...KAPI].every(t=>validTypes.includes(t)&&TYPES.split(',').includes(t))){console.error('Geçersiz deneme sayısı, süre veya kapanış türü.');process.exit(1);}
const URL=process.env.KT_URL||'http://127.0.0.1:5191/';
const READ=`(async()=>{const raw=[localStorage.getItem('kelime-teneffusu-v2'),localStorage.getItem('kelime-teneffusu-v3')].filter(Boolean);const backup=await new Promise((resolve,reject)=>{const r=indexedDB.open('kelime-teneffusu-progress',1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('copies')){db.close();resolve(null);return;}const tx=db.transaction('copies','readonly'),q=tx.objectStore('copies').get('progress:');q.onsuccess=()=>resolve(q.result?JSON.parse(q.result):null);tx.oncomplete=()=>db.close();};});return {raw,backup,stars:document.querySelector('[data-star-total]')?.getAttribute('data-star-total'),next:document.querySelector('.berrak-play')?.textContent}})()`;
const semantic=raw=>raw.map(readProgress).reduce((a,b)=>mergeProgress(a,b),emptyProgress());
const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
const same=(a,b)=>JSON.stringify(canon(a))===JSON.stringify(canon(b));
const rows=[];let port=9850;
for(const kind of TYPES.split(','))for(let i=1;i<=+N;i++){
 const profile=freshProfile('kayit');const row={kind,deneme:i};let p;
 try{
  p=await launch({profile,reuse:true,port:port++});await p.viewport(393,852,2);await p.send('Network.enable');await p.send('Network.setBlockedURLs',{urls:['https://*','wss://*']});
  await p.goto(URL,2600);if(!(await p.clickText('^BÖLÜM 1')))throw new Error('BÖLÜM 1 düğmesi yok');await sleep(2300);await p.clickText('^Atla$');
  const r=await solve(p,{delay:0});if(r.err||(r.done||[]).some(d=>d.bulunamadi))throw new Error('bölüm çözülemedi');
  let completedAt=0;for(let poll=0;poll<100&&!completedAt;poll++){
   const done=await p.eval("(()=>{const p=JSON.parse(localStorage.getItem('kelime-teneffusu-v2')||'null');return p?.saves?.['route:uzay-1']?.complete===true})()");
   if(done)completedAt=Date.now();else await sleep(10);
  }
  if(!completedAt)throw new Error('First chapter did not commit');
  const before=await p.eval(READ),value=semantic(before.raw);row.onceYildiz=value.saves['route:uzay-1']?.stars;
  if(row.onceYildiz!==3||!before.backup?.payload||!same(readProgress(before.backup.payload),value))throw new Error('Primary and independent copy did not confirm completion');
  await sleep(Math.max(0,completedAt+(+WAIT)-Date.now()));row.killDelayMs=Date.now()-completedAt;
  if(row.killDelayMs>+WAIT+250)throw new Error('Shutdown missed its measured deadline');
  await p.close(kind);
  p=await launch({profile,reuse:true,port:port++});await p.viewport(393,852,2);await p.goto(URL,1000);
  for(let poll=0;poll<100&&await p.eval("!!document.querySelector('.game-boot')");poll++)await sleep(25);
  const after=await p.eval(READ);await p.close('SIGKILL');
  row.sonraYildiz=after.stars;row.kayitAyni=same(value,semantic(after.raw));row.backupSame=!!after.backup?.payload&&same(value,readProgress(after.backup.payload));row.backupRevision=[before.backup.revision,after.backup?.revision];
  row.sonuc=row.kayitAyni&&row.backupSame&&after.stars==='3'&&after.backup.revision>=before.backup.revision?'korundu':'KAYBOLDU';
 }catch(e){row.sonuc='DOĞRULANAMADI';row.hata=e.message;}finally{try{await p?.close('SIGKILL');}finally{if(!p||p.proc.exitCode!==null||p.proc.signalCode!==null)rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});}}
 rows.push(row);console.log(JSON.stringify(row));
}
const kapi=rows.filter(r=>KAPI.has(r.kind)&&r.sonuc!=='korundu');
writeFileSync(OUT,JSON.stringify({url:URL,bekleme:+WAIT,kapi:[...KAPI],rows},null,1));
console.log(`SONUÇ: ${rows.filter(r=>r.sonuc==='korundu').length}/${rows.length} korundu; kapı (${[...KAPI]}) ihlali ${kapi.length}`);process.exit(kapi.length?1:0);
