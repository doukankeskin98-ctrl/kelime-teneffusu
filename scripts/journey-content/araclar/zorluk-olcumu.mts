/**
 * Zorluk ölçümü (Claude, 21 Kasım 2026). 0.58.0 kabul kapısı: oyunun yeni-tablo yolu, onaylı tablonun
 * 312 bölümünü birebir mi oynatıyor? Oyun kodu değil; yalnız okur.
 * Kullanım (depo kökünden): node_modules/.bin/tsx <bu dosya> <yerlesim.json> [--rapor out.json]
 * Her bölüm için oyunun kendi fonksiyonlarıyla, yeni tablo açıkken (playableJourney(id,{saves:{}},true)):
 *   tahta harfleri, kelime listesi, gizli kelime (chapterVeils) ve bilmece tanımları tabloyla karşılaştırılır.
 * Bir fark ya da eksik bölüm varsa çıkış 1. Sonda bölüm aralıklarına göre zorluk eğrisi basılır.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import type {Layout} from './layout-types.mts';
import {MAIN_JOURNEY} from '../../../lib/game/main-journey.ts';
import {playableJourney} from '../../../lib/game/journey-revisions.ts';
import {journeyBoard} from '../../../lib/game/content.ts';
import {chapterVeils} from '../../../lib/game/world-presentation.ts';
interface Row{n:number;id:string;kelime:number;gizli:number;bilmece:boolean;tahta:string}
const args=process.argv.slice(2);const ri=args.indexOf('--rapor');const rapor=ri>=0?args.splice(ri,2)[1]:null;
if(args.length!==1){console.error('Kullanım: tsx zorluk-olcumu.mts <yerlesim.json> [--rapor out.json]');process.exit(2);}
let tablo:{levels:Layout[]};try{tablo=JSON.parse(readFileSync(args[0]!,'utf8'));}catch(e){console.error('Tablo okunamadı: '+(e as Error).message);process.exit(1);}
const L=tablo?.levels;if(!Array.isArray(L)||L.length!==312){console.error(`Tablo 312 bölüm olmalı, bulunan ${Array.isArray(L)?L.length:'yok'}`);process.exit(1);}
const sira=new Map<string,number>(MAIN_JOURNEY.map(m=>[m.chapter.id,m.number]));
const hatalar:string[]=[],satir:Row[]=[];
const hata=(id:string,s:string)=>{hatalar.push(`${id}: ${s}`);};
for(const [i,lv] of L.entries()){
 const id=lv.id;if(sira.get(id)!==i+1){hata(id,`oyundaki sıra ${sira.get(id)??'yok'}, tablodaki ${i+1}`);continue;}
 let j,b;try{j=playableJourney(id,{saves:{}},true);if(j)b=journeyBoard(j);}catch(e){hata(id,'tahta açılamadı: '+(e as Error).message);continue;}
 if(!j||!b){hata(id,'tahta yok');continue;}
 const g=lv.grid,bg=b.grid.map(r=>r.join(''));
 if(JSON.stringify(g)!==JSON.stringify(bg))hata(id,`tahta farklı (oyun ${bg[0]?.length}×${bg.length}, tablo ${g[0]?.length}×${g.length}); yeni tablo bu bölümde açılmıyor`);
 const tw=lv.placements.map(p=>p[0]).sort(),bw=[...new Set((b.targets??[]).map(t=>t.text))].sort();
 if(JSON.stringify(tw)!==JSON.stringify(bw))hata(id,`kelimeler farklı: oyun ${bw.length}, tablo ${tw.length}`);
 const veils=chapterVeils(id,b.targets??[],j.revision??1);const gizli=Object.values(veils).filter(v=>v!=='open').length;
 const tg=(lv.hiddenIds??[]).length;if(!lv.clues&&gizli!==tg)hata(id,`gizli kelime oyunda ${gizli}, tabloda ${tg}`);
 if(lv.clues){const c=j.clues??{};for(const [k,v] of Object.entries(lv.clues))if(c[k]!==v)hata(id,`bilmece tanımı eksik/farklı: ${k}`);}
 satir.push({n:i+1,id,kelime:bw.length,gizli:lv.clues?0:gizli,bilmece:!!lv.clues,tahta:`${bg[0]?.length}x${bg.length}`});
}
const ort=(xs:Row[],k:'kelime'|'gizli')=>xs.length?(xs.reduce((s,x)=>s+x[k],0)/xs.length).toFixed(1):'-';
console.log('Bölüm      kelime  gizli  ≤4 kelime');
for(const [a,z] of [[1,18],[19,60],[61,100],[101,150],[151,200],[201,250],[251,312]] as const){const xs=satir.filter(r=>r.n>=a&&r.n<=z);console.log(`${String(a).padStart(3)}–${String(z).padEnd(3)}    ${ort(xs,'kelime').padStart(5)}  ${ort(xs,'gizli').padStart(5)}  ${xs.filter(r=>r.kelime<=4).length}/${xs.length}`);}
if(rapor)writeFileSync(rapor,JSON.stringify({hatalar,satir},null,1));
for(const h of hatalar.slice(0,25))console.log('HATA',h);if(hatalar.length>25)console.log(`… ${hatalar.length-25} hata daha`);
console.log(`SONUÇ: ${L.length} bölüm, ${hatalar.length} hata`);process.exit(hatalar.length?1:0);
