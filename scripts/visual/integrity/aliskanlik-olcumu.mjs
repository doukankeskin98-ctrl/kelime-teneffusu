// Alışkanlık koruması: oyuncunun elinin alıştığı kontrollerin yerini ölçer ve iki sürümü karşılaştırır (Claude, 21 Kasım 2026)
// Ölç:        KT_URL=http://127.0.0.1:5191/ node aliskanlik-olcumu.mjs olc <çıktı.json> 393 852
// Karşılaştır: node aliskanlik-olcumu.mjs karsilastir <eski.json> <yeni.json>   (fark > 4 px ya da kaybolan kontrol → çıkış 1)
// Codex incelemesi sonrası (21 Kasım): her ölçüm YENİ boş profille başlar; ölçümde zorunlu kontrol bulunamazsa çıkış 1;
// karşılaştırmada boş/eksik taban, bozuk koordinat (sayı değil, sıfır boy) girdi hatasıdır → çıkış 1.
import {launch,sleep} from './cdp.mjs';import {readFileSync,writeFileSync} from 'node:fs';
const [mode,a,b,c]=process.argv.slice(2);
const KONTROL={
 ana:{avatar:'Oyuncu profilini aç',yildiz:'yıldız. Başarı bilgisi',ayarlar:'Ayarları aç',ilerleme:'Yolculuğum',gunluk:'Günlük bulmaca',album:'Albümlerim',arena:'^Arena$',oyunlar:'Diğer oyunlar|^Oyunlar$',oyna:'^Bölüm \\d+ ·'},
 oyun:{ayarlar:'^Ayarlar$',ipucu:'^İpucu',dondur:'Tahtayı döndür',tahta:'__BOARD__',liste:'__LIST__'},
 sonuc:{anasayfa:'Ana sayfa',sonraki:'^Bölüm \\d+ ·',tekrar:'Bir daha oyna|^Tekrar',tahta:'Tahtayı incele|^Tahta$'},
};
const okRect=r=>Array.isArray(r)&&r.length===4&&r.every(Number.isFinite)&&r[2]>0&&r[3]>0;
function dogrula(J,ad){const e=[];if(!J||typeof J!=='object'||!Object.keys(J).length){e.push(ad+': boş ölçüm');return e;}
 for(const [ekran,ctl] of Object.entries(KONTROL))for(const k of Object.keys(ctl)){const r=J[ekran]?.[k];if(r===undefined)e.push(`${ad}: ${ekran}.${k} ölçülmemiş`);else if(!okRect(r))e.push(`${ad}: ${ekran}.${k} bozuk koordinat ${JSON.stringify(r)}`);}return e;}
if(mode==='karsilastir'){
 // Kontrolün ORTA NOKTASI karşılaştırılır (etiket eklemek boyu değiştirebilir, yeri değiştirmemeli).
 // --izin ekran.kontrol,... : planlı ve sahibin onayladığı taşımalar (ör. oyun.ipucu: araçlar tahtanın 16 px altına, WOW-FARKI #6).
 const ii=process.argv.indexOf('--izin');const IZIN=new Set(ii>0?process.argv[ii+1].split(','):[]);
 let A,B;try{A=JSON.parse(readFileSync(a,'utf8'));B=JSON.parse(readFileSync(b,'utf8'));}catch(e){console.log('GİRDİ HATASI: '+e.message);process.exit(1);}
 const ge=dogrula(A,'taban');if(ge.length){console.log('GİRDİ HATASI (taban geçersiz, karşılaştırma yapılmadı):\n '+ge.join('\n '));process.exit(1);}
 let bad=0;for(const x of dogrula(B,'yeni').filter(x=>/bozuk/.test(x))){console.log('BOZUK '+x);bad++;}
 const mid=r=>[r[0]+r[2]/2,r[1]+r[3]/2];
 for(const [ekran,ctl] of Object.entries(A))for(const [ad,r] of Object.entries(ctl)){const q=B[ekran]?.[ad];const k=ekran+'.'+ad;
  if(!q){console.log(`YOK   ${k}`);bad++;continue;}
  const [x1,y1]=mid(r),[x2,y2]=mid(q);const d=Math.hypot(x1-x2,y1-y2);
  if(d>4){if(IZIN.has(k)){console.log(`izinli ${k}: ${d.toFixed(0)} px`);continue;}console.log(`KAYDI ${k}: ${d.toFixed(0)} px (orta ${x1},${y1} → ${x2},${y2})`);bad++;}}
 console.log(`SONUÇ: ${bad} alışkanlık ihlali`);process.exit(bad?1:0);}
const URL=process.env.KT_URL||'http://127.0.0.1:5191/';const W=+b||393,H=+c||852;
// Kontroller erişilebilir adlarıyla bulunur; ad değişirse eşleme listesi güncellenir (ad değişikliği alışkanlığı bozmaz, yer değişikliği bozar)
const page=await launch({port:Number(process.env.KT_CDP_PORT??9831)});const out={}; // launch() her seferinde yeni boş profil açar
const rects=async map=>page.eval(`(()=>{const M=${JSON.stringify(map)};const R=e=>{const b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height].map(v=>Math.round(v))};const o={};
 for(const [k,p] of Object.entries(M)){let e=null;if(p==='__BOARD__'){const c=document.querySelector('[data-cell]');e=c&&c.parentElement;}else if(p==='__LIST__')e=document.querySelector('.word-list');else{const re=new RegExp(p,'i');e=[...document.querySelectorAll('button,a,[role=button]')].find(x=>{const b=x.getBoundingClientRect();return b.width>0&&(re.test(x.getAttribute('aria-label')||'')||re.test((x.innerText||'').trim()))});}
  if(e)o[k]=R(e);}return o})()`);
try{
 await page.send('Network.enable');await page.send('Network.setBlockedURLs',{urls:['*chatgpt.site*','*google*']});
 await page.viewport(W,H,2);await page.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:H>700?59:20,bottom:H>700?34:0,left:0,right:0}});
 await page.goto(URL,2800);out.ana=await rects(KONTROL.ana);
 await page.clickText('^BÖLÜM 1');await sleep(2400);await page.clickText('^Atla$');await sleep(500);out.oyun=await rects(KONTROL.oyun);
 const {solve}=await import('./oyna.mjs');await solve(page,{delay:450});await sleep(2800);out.sonuc=await rects(KONTROL.sonuc);
}finally{await page.close();}
writeFileSync(a,JSON.stringify(out,null,1));console.log(JSON.stringify(out));
const eksik=dogrula(out,'ölçüm');if(eksik.length){console.log('ÖLÇÜM EKSİK:\n '+eksik.join('\n '));process.exit(1);}console.log('ölçüm tam: '+Object.values(KONTROL).reduce((n,c)=>n+Object.keys(c).length,0)+' kontrol');
