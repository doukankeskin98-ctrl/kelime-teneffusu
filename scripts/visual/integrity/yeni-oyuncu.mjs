// Yeni oyuncu yolculuğu — KABUL KAPISI (Claude, 21 Kasım 2026; Codex incelemesi sonrası).
// Temiz profille açar, 1. dünyanın 6 bölümünü ipucusuz oynar, bonus turunu çözer, 2. dünyaya geçişi doğrular.
// Her adım bir kurala bağlı; tek kural bozulsa çıkış 1. Kural kimlikleri BUTUNLUK.md'deki maddelerdir.
// Kullanım: KT_URL=http://127.0.0.1:5191/ node yeni-oyuncu.mjs <çıktı klasörü> [393x852]
import {launch,sleep} from './cdp.mjs';import {solve,solveBonus,STATE} from './oyna.mjs';import {mkdirSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
const O=process.argv[2];if(!O){console.error('çıktı klasörü ver');process.exit(2);}
if(existsSync(O)&&readdirSync(O).length){console.error('çıktı klasörü boş değil: '+O);process.exit(2);}mkdirSync(O,{recursive:true});
const [W,H]=(process.argv[3]||'393x852').split('x').map(Number);const URL=process.env.KT_URL||'http://127.0.0.1:5191/';
const DUNYA=6,YILDIZ=3; // ipucusuz her bölüm 3 yıldız
const fails=[],log=[];const fail=(kural,msg)=>{fails.push(kural+': '+msg);console.log('  ✗',kural,msg);};
const page=await launch({port:Number(process.env.KT_CDP_PORT??9815)});
const txt=()=>page.eval(`document.body.innerText.replace(/\\n+/g,' / ')`);
// Yıldız sayacı: önce [data-star-total] (0.57.7'de Codex ekler: görünen sayaç toplamı taşır), yoksa 0.57.6 sınıfları.
const counter=()=>page.eval(`(()=>{const vis=e=>{if(!e)return false;const b=e.getBoundingClientRect();return b.width>0&&b.height>0};const pick=[...document.querySelectorAll('[data-star-total]')].filter(vis).at(-1)||[...document.querySelectorAll('.result-stars-total')].filter(vis)[0]||[...document.querySelectorAll('.board-stars')].filter(vis)[0]||document.querySelector('[aria-label$="yıldız. Başarı bilgisi"]');if(!pick)return null;const value=(pick.querySelector('[data-star-value]')||pick).textContent.trim();return pick.hasAttribute('data-star-total')&&value!==pick.getAttribute('data-star-total')?'SAYAÇ UYUŞMAZLIĞI':value})()`);
let k=0;const snap=async tag=>{k++;const f=`${String(k).padStart(2,'0')}-${tag}.png`;await page.shot(O+'/'+f);const t=await txt();log.push({f,t});return t;};
try{
 await page.send('Network.enable');await page.send('Network.setBlockedURLs',{urls:['*chatgpt.site*','*google*']});
 await page.viewport(W,H,2);await page.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:H>700?59:20,bottom:H>700?34:0,left:0,right:0}});
 await page.goto(URL,3000);const ana=await snap('ana');
 if(!/DÜNYA 01/i.test(ana))fail('Y0','ilk açılış 1. dünyayı göstermiyor');
 if(await counter()!=='0')fail('Y0','yeni oyuncunun yıldızı 0 değil: '+(await counter()));
 if(!(await page.clickText('^BÖLÜM 1')))throw new Error('Y0: ana ekranda BÖLÜM 1 düğmesi yok');
 await sleep(2400);
 for(let lv=1;lv<=DUNYA;lv++){
  await page.clickText('^Anladım');await page.clickText('^Atla$');await sleep(400);
  const st=await page.eval(STATE);await snap('bolum'+lv+'-acilis');
  if(!st){fail('Y1',`bölüm ${lv}: tahta açılmadı`);break;}
  const acilisSayac=await counter();
  if(acilisSayac!==String((lv-1)*YILDIZ))fail('M4',`bölüm ${lv} açılışında sayaç ${acilisSayac}, beklenen ${(lv-1)*YILDIZ}`);
  const r=await solve(page,{delay:600});const miss=(r.done||[]).filter(d=>d.bulunamadi).map(d=>d.w);
  if(r.err||miss.length)fail('Y2',`bölüm ${lv}: çözülemeyen kelime ${r.err||miss.join(',')}`);
  await sleep(2700);const sonuc=await snap('bolum'+lv+'-sonuc');
  if(!/TEBRİKLER|DÜNYA TAMAM/i.test(sonuc)){fail('Y3',`bölüm ${lv}: sonuç ekranı gelmedi`);break;}
  const sayac=await counter();if(sayac!==String(lv*YILDIZ))fail('M4',`bölüm ${lv} sonucunda sayaç "${sayac}", beklenen toplam ${lv*YILDIZ}`);
  if(!new RegExp(`(^| / )${lv}/${DUNYA}( / |$)`).test(sonuc))fail('Y4',`bölüm ${lv}: parça sayacı ${lv}/${DUNYA} değil`);
  if(/açıldı\./i.test(sonuc.split(' / ').slice(0,4).join(' / ')))fail('M14',`bölüm ${lv}: alt başlık "… açıldı." albüm ilerlemesinin yerini alıyor`);
  if(lv<DUNYA){if(!(await page.clickText('^BÖLÜM \\d+$'))){fail('Y5',`bölüm ${lv}: sonuçta sonraki bölüm düğmesi yok (çıkmaz)`);break;}await sleep(2400);}
 }
 if(!fails.some(f=>/^Y[135]/.test(f))){
  if(!(await page.clickText('^BONUS TURU')))fail('Y6','dünya sonunda BONUS TURU düğmesi yok');
  else{await sleep(2000);await page.clickText('Bonusu başlat');await sleep(1500);await snap('bonus-basladi');
   const b=await solveBonus(page);console.log('  bonus',JSON.stringify(b));
   if(b.err)fail('Y6','bonus: '+b.err);else if(!(b.total>0)||b.hits<b.total||b.found!==b.total)fail('Y6',`bonus: tahtada ${b.hits} geçiş bulundu, hedef ${b.total}`);
   await sleep(3500);await snap('bonus-son');const result=await page.eval(`(()=>{const d=document.querySelector('dialog.bonus-outcome[open]'),b=d?.querySelector('.result-continue');if(!d||!b||!d.getBoundingClientRect().height||!b.getBoundingClientRect().height||b.disabled)return false;b.click();return true})()`);if(!result)fail('Y6','bonus bitiş penceresi ve devam düğmesi yok');else{await sleep(2500);if(!(await page.eval(STATE)))fail('Y6','bonus devamından sonra yeni tahta açılmadı');}}
 }
 await page.goto(URL,3000);const son=await snap('ana-son');
 if(!/DÜNYA 02/i.test(son))fail('Y7','1. dünya ve bonus bittikten sonra ana ekran 2. dünyayı göstermiyor');
 const top=await counter();if(top!==String(DUNYA*YILDIZ))fail('M4',`ana ekran sayacı ${top}, beklenen ${DUNYA*YILDIZ} (6 bölüm × 3)`);
}catch(e){fail('Y!',e.message);}
finally{await page.close();writeFileSync(O+'/log.json',JSON.stringify({fails,log},null,1));}
console.log(fails.length?`SONUÇ: ${fails.length} kural bozuldu\n`+fails.join('\n'):'SONUÇ: yeni oyuncu yolculuğu 0 hata');process.exit(fails.length?1:0);
