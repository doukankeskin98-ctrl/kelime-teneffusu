/**
 * Yolculuk v2 zorluk tablosu (tek kaynak). Üretici, kelime denetimi, tahta denetimi ve CI bu dosyayı okur.
 * Claude, 19 Kasım 2026 (Codex incelemesi sonrası: yön kuralları yüzde değil, kelime sayısına göre TAM SAYI).
 * Ürün sahibi kararları:
 *  - Tahta hiçbir yönde 9'u geçmez (WoW sınırı). Öğretme 7×8, normal 8×9, ZOR/final 9×9 (1. dünyada 8×9).
 *  - En çok 12 kelime (liste 3 satırda iri yazıyla okunmalı).
 *  - Zorluk: kelime sayısı + çapraz/ters + kesişme + gizli kelime (yalnız ilk harf görünür).
 * Eski dünyalar 6 bölüm: 1–2 kolay, 3–4 orta, 5 ZOR, 6 final; ardından mevcut bonus turu (dokunulmaz).
 */
export const SINIR={maxSutun:9,maxSatir:9,maxKelime:12,minHarf:3,maxHarf:9,maxUzun:2,ucHarfOran:0.25};
// Yönler: 4 ileri (→ ↓ ↘ ↗) + 4 ters (← ↑ ↖ ↙). Çapraz = ↘ ↗ ↖ ↙.
export const YONLER={duz:['0,1','1,0'],ileri:['0,1','1,0','1,1','-1,1'],hepsi:['0,1','1,0','1,1','-1,1','0,-1','-1,0','-1,-1','1,-1']};
export const TERS=new Set(['0,-1','-1,0','-1,-1','1,-1']);export const CAPRAZ=new Set(['1,1','-1,1','-1,-1','1,-1']);
/** 2. dünyadan sonraki yön kuralı, kelime sayısına göre (çapraz [en az,en çok], ters [en az,en çok], bir yönde en çok, en az farklı yön). */
const YON_TABLO={ // dünya 3+
 7:{caprazAz:2,caprazCok:3,tersAz:2,tersCok:3,yonCok:2,yonAz:5},
 8:{caprazAz:3,caprazCok:4,tersAz:2,tersCok:3,yonCok:2,yonAz:5},
 9:{caprazAz:3,caprazCok:4,tersAz:2,tersCok:4,yonCok:2,yonAz:6},
 10:{caprazAz:3,caprazCok:5,tersAz:2,tersCok:4,yonCok:2,yonAz:6},
 11:{caprazAz:4,caprazCok:5,tersAz:3,tersCok:4,yonCok:2,yonAz:6},
 12:{caprazAz:4,caprazCok:6,tersAz:3,tersCok:5,yonCok:2,yonAz:7}};
const YON_TABLO_D2={ // dünya 2: biraz daha hafif
 7:{caprazAz:2,caprazCok:3,tersAz:1,tersCok:2,yonCok:2,yonAz:4},
 8:{caprazAz:2,caprazCok:4,tersAz:1,tersCok:3,yonCok:2,yonAz:4},
 9:{caprazAz:2,caprazCok:4,tersAz:2,tersCok:3,yonCok:2,yonAz:5},
 10:{caprazAz:3,caprazCok:5,tersAz:2,tersCok:4,yonCok:2,yonAz:5},
 11:{caprazAz:3,caprazCok:5,tersAz:2,tersCok:4,yonCok:2,yonAz:6},
 12:{caprazAz:4,caprazCok:6,tersAz:3,tersCok:5,yonCok:2,yonAz:6}};
const lerp=(a,b,t)=>Math.round(a+(b-a)*t);
export function hedef(world,pos,{clue=false}={}){
 const t=Math.min(1,Math.max(0,(world-1)/51));
 const tier=pos<=2?'kolay':pos<=4?'orta':pos===5?'zor':'final';
 let h={tier,C:pos>=5?9:8,R:9,
  words:[0,lerp(7,10,t),lerp(8,10,t),lerp(9,11,t),lerp(9,11,t),lerp(10,12,t),lerp(11,12,t)][pos],
  hidden:[0,lerp(0,2,t),lerp(1,2,t),lerp(1,3,t),lerp(2,3,t),lerp(3,4,t),lerp(3,4,t)][pos],
  dirs:'hepsi',crossMin:null,maxCross:null};
 if(world===1){ // her bölüm tek yenilik öğretir; yön kuralı burada elle
  const W1={1:{words:6,C:7,R:8,hidden:0,dirs:'duz',maxCross:0,yon:{caprazAz:0,caprazCok:0,tersAz:0,tersCok:0,yonCok:3,yonAz:2}},
   2:{words:6,C:7,R:8,hidden:0,dirs:'ileri',maxCross:0,yon:{caprazAz:1,caprazCok:2,tersAz:0,tersCok:0,yonCok:2,yonAz:3}},
   3:{words:7,C:7,R:8,hidden:0,dirs:'ileri',crossMin:1,yon:{caprazAz:1,caprazCok:3,tersAz:0,tersCok:0,yonCok:2,yonAz:4}},
   4:{words:8,C:7,R:8,hidden:0,dirs:'hepsi',crossMin:1,yon:{caprazAz:2,caprazCok:3,tersAz:1,tersCok:2,yonCok:2,yonAz:5}},
   5:{words:9,C:8,R:9,hidden:1,dirs:'hepsi',yon:{caprazAz:2,caprazCok:4,tersAz:2,tersCok:3,yonCok:2,yonAz:5}},
   6:{words:9,C:8,R:9,hidden:1,dirs:'hepsi',yon:{caprazAz:2,caprazCok:4,tersAz:2,tersCok:3,yonCok:2,yonAz:5}}};
  h={...h,...W1[pos]};}
 if(clue)h={...h,words:lerp(6,8,t),hidden:0,C:8,R:9};
 h.words=Math.min(SINIR.maxKelime,h.words);
 if(!h.yon)h.yon=(world===2?YON_TABLO_D2:YON_TABLO)[Math.max(7,h.words)]; // 6 kelimelik tanım bölümü 7'nin kuralını alır
 if(h.words<7&&!['duz','ileri'].includes(h.dirs))h.yon={...h.yon,caprazAz:2,caprazCok:3,tersAz:1,tersCok:2,yonAz:4};
 if(h.crossMin===null)h.crossMin=h.maxCross===0?0:Math.max(1,Math.floor(h.words/3));
 return h;
}
/** Kuralın sağlanabilir olduğunu kanıtla: her yön ≤ yonCok, toplam N, çapraz/ters aralıkta, farklı yön ≥ yonAz. */
export function uygulanabilir(N,dirsMode,y){
 const dirs=YONLER[dirsMode],k=dirs.length;let ok=false;
 const rec=(i,left,cnt)=>{if(ok)return;if(i===k){if(left)return;const used=cnt.filter(x=>x>0).length;let c=0,t=0;cnt.forEach((x,j)=>{if(CAPRAZ.has(dirs[j]))c+=x;if(TERS.has(dirs[j]))t+=x;});
   if(used>=y.yonAz&&c>=y.caprazAz&&c<=y.caprazCok&&t>=y.tersAz&&t<=y.tersCok)ok=true;return;}
  for(let x=0;x<=Math.min(y.yonCok,left);x++){cnt[i]=x;rec(i+1,left-x,cnt);}cnt[i]=0;};
 rec(0,N,Array(k).fill(0));return ok;
}
/** Zorluk puanı (tahmin; telemetriyle düzeltilecek). */
export const puan=b=>4*b.words+0.5*b.letters+2*b.diag+3*b.rev+b.crossings+b.R*b.C/10+1.5*b.long+4*b.hidden;
