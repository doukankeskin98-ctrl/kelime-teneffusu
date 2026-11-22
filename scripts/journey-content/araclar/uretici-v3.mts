/**
 * Yolculuk v2 üreticisi, sürüm 3 (Claude, 19 Kasım 2026). Referans uygulama; oyun kodu değil.
 * Kelime bankasından hazır yerleşim tablosu üretir: her bölüm için ızgara, yerleşimler ve gizli kelimeler.
 * Oyun çalışırken üretim YOK: Codex bu tabloyu içerik olarak gömer (tahta sürümü 2), tohumdan üretmez.
 * Kurallar zorluk-tablosu.mjs'ten okunur. Oyunun kendi güvenlik denetimi (boardIssues + PRESENTATION_RULES) kullanılır.
 * Kullanım: node --experimental-strip-types uretici-v3.mts <oyun-kök> <banka.txt> <çıktı-klasörü> [önceki-çıktılar.json ...]
 */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import type {Layout,WordPath} from './layout-types.mts';
import type {Puzzle} from '../../../lib/game/engine.ts';
type Failed={n:number;id:string;band:string;fail:string;words?:string[]};
type Positioned={text:string;a:Cell;b:Cell;dg:boolean;rv:boolean;key:string};
type Candidate={r:number;c:number;d:Cell;dg:boolean;rv:boolean;key:string;s:number};
const [root,bankPath,outDir,...prevPaths]=process.argv.slice(2);
const {hash,random}=await import(root+'/lib/game/engine.ts');
const {boardIssues,PRESENTATION_RULES}=await import(root+'/lib/game/board-quality.ts');
const {hedef,puan,SINIR}=await import(new URL('zorluk-tablosu.mjs',import.meta.url).href);
const {uygunsuzDiziler}=await import(new URL('uygunsuz-tarama.mjs',import.meta.url).href);
const LV=JSON.parse(readFileSync(new URL('mevcut-bantlar.json',import.meta.url),'utf8'));
const RANK=new Map<string,number>();
{const f=new URL('../kaynaklar/tr_50k.txt',import.meta.url);if(existsSync(f))readFileSync(f,'utf8').split('\n').forEach((l,i)=>{const w=l.split(' ')[0]!;if(w&&!RANK.has(w))RANK.set(w,i+1);});}
type Cell=[number,number];
const FILLER=[...'AAAAAAEEEEEEİİİİIIIIIINNNNRRRRLLLLKKKKDDTTSSMMUUYYBBÇÇOOÖÖÜÜŞŞGGCCPHVZFĞJ'];
const FWD:Cell[]=[[0,1],[1,0],[1,1],[-1,1]],REV:Cell[]=[[0,-1],[-1,0],[-1,-1],[1,-1]];
const DIRSET:Record<string,Cell[]>={duz:[[0,1],[1,0]],ileri:FWD,hepsi:[...FWD,...REV]};
const low=(w:string)=>w.toLocaleLowerCase('tr-TR');
// --- banka
type Cat={world:number;n:number;lv:number;band:string;words:string[];clues:Record<string,string>};
const cats:Cat[]=[];let wno=0;
for(const raw of readFileSync(bankPath!,'utf8').split('\n')){const ln=raw.trim();if(!ln||ln.startsWith('#'))continue;
 const m=ln.match(/^@dunya (\d+) (\S+) \| (.+)$/);if(m){wno=+m[1]!;continue;}
 const [n,band,...rest]=ln.split('|').map(s=>s.trim());const ws=rest.join('|');
 // Bilmece satırı: "KELİME=tanım; KELİME=tanım" (tanım oyunda kelimenin yerine görünür)
 const clues:Record<string,string>={};const words=ws.includes('=')?ws.split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const [w,c]=x.split('=').map(y=>y.trim());clues[w!]=c!;return w!;}):ws.split(/\s+/).filter(Boolean);
 cats.push({world:wno,n:+n!,lv:(wno-1)*6+(+n!),band:band!.replace(/\s*\[özel\]/,''),words,clues});}
// --- tekrar kuralı: önceki dilimlerin çıktıları + bu dilim
const lastUse=new Map<string,number>();
for(const p of prevPaths)for(const o of JSON.parse(readFileSync(p,'utf8')).levels??[])for(const w of o.words)lastUse.set(w,o.n);
const out:(Layout|Failed)[]=[];const prevScore=new Map<number,number>();let fails=0;
for(const cat of cats){
 const band=LV[cat.lv-1];const clue=!!band?.w?.chapter?.clues;const H=hedef(cat.world,cat.n,{clue});
 const near=new Set(LV.slice(Math.max(0,cat.lv-7),cat.lv-1).flatMap((b:{words:string[]})=>b.words));
 const fits=(w:string)=>{const n=[...w].length;return n>=SINIR.minHarf&&n<=SINIR.maxHarf&&(n<=H.C||n<=H.R);};
 const tersi=(w:string)=>[...w].reverse().join('');
 const pick=(gap:number,ex:Set<string>=new Set())=>{const ch:string[]=[];let three=0,long=0,dar=0;
  for(const w of cat.words){if(ch.length>=H.words)break;
   if(ex.has(w)||near.has(w)||!fits(w))continue;if(cat.lv-(lastUse.get(w)??-1e9)<=gap)continue;
   // iç içe ya da TERSİ iç içe (YAT ↔ TAYFA) olan iki hedef tahtada ikinci kez okunur; birlikte seçilmez
   if(ch.some(c=>c.includes(w)||w.includes(c)||c.includes(tersi(w))||w.includes(tersi(c))))continue;
   if([...w].length===3){if(three>=Math.max(1,Math.floor(H.words*0.25)))continue;three++;}
   if([...w].length>=8){if(long>=2)continue;long++;}
   // tahtanın dar kenarından uzun kelime (8×9'da 9 harf) yalnız tek yönde durabilir; en çok bir tane
   if([...w].length>Math.min(H.R,H.C)){if(dar>=1)continue;dar++;}
   ch.push(w);}return ch;};
 if(clue&&cat.words.some(w=>!cat.clues[w])){fails++;out.push({n:cat.lv,id:band.id,band:cat.band,fail:'bilmece bölümünde tanımı olmayan kelime'});continue;}
 let chosen=pick(120);if(chosen.length<H.words)chosen=pick(40);
 if(chosen.length<H.words){fails++;out.push({n:cat.lv,id:band.id,band:cat.band,fail:'kelime yetmedi '+chosen.length+'/'+H.words});continue;}
 const build=(chosen:string[])=>{
 const dirs=DIRSET[H.dirs]!;const order=[...chosen].sort((a,b)=>[...b].length-[...a].length);
 const N=chosen.length,Y=H.yon,need={diag:Y.caprazAz,rev:Y.tersAz},cap={diag:Y.caprazCok,rev:Y.tersCok,dir:Y.yonCok};
 const valid:Layout[]=[];const why={place:0,diag:0,rev:0,cross:0,dirs:0,clean:0};
 for(let attempt=0;attempt<600&&valid.length<40;attempt++){
  const rand=random(hash(`yolculuk-v3:${band.id}:${attempt}`));
  const grid:string[][]=Array.from({length:H.R},()=>Array(H.C).fill(''));const placed:Positioned[]=[];let nodes=0;
  const dc=new Map<string,number>(),st={diag:0,rev:0};
  const place=(i:number):boolean=>{if(i===order.length)return true;if(++nodes>8000)return false;
   const w=[...order[i]!];const cands:Candidate[]=[];const left=order.length-i;
   if(need.diag-st.diag>left||need.rev-st.rev>left)return false;
   const mustDiag=need.diag-st.diag>=left,mustRev=need.rev-st.rev>=left;
   for(const d of dirs){const key=d.join(),dg=d[0]!==0&&d[1]!==0,rv=REV.some(x=>x.join()===key);
    if(dg&&st.diag>=cap.diag)continue;if(rv&&st.rev>=cap.rev)continue;if((dc.get(key)??0)>=cap.dir)continue;if(mustDiag&&!dg)continue;if(mustRev&&!rv)continue;
    for(let r=0;r<H.R;r++)for(let c=0;c<H.C;c++){const er=r+d[0]!*(w.length-1),ec=c+d[1]!*(w.length-1);if(er<0||ec<0||er>=H.R||ec>=H.C)continue;
     let cross=0,fit=true;for(let k=0;k<w.length;k++){const g=grid[r+d[0]!*k]![c+d[1]!*k];if(g){if(g!==w[k]){fit=false;break;}cross++;}}
     if(!fit||cross===w.length||(H.maxCross===0&&cross>0))continue;
     let s=cross*2.2+rand()*2.5;if(dg&&st.diag<need.diag)s+=3+6*(need.diag-st.diag)/left;if(rv&&st.rev<need.rev)s+=2.5+5*(need.rev-st.rev)/left;
     cands.push({r,c,d,key,dg,rv,s});}}
   cands.sort((a,b)=>b.s-a.s);
   for(const cd of cands.slice(0,5)){const prev:string[]=[];
    for(let k=0;k<w.length;k++){prev.push(grid[cd.r+cd.d[0]*k]![cd.c+cd.d[1]*k]!);grid[cd.r+cd.d[0]*k]![cd.c+cd.d[1]*k]=w[k]!;}
    placed.push({text:order[i]!,a:[cd.r,cd.c],b:[cd.r+cd.d[0]*(w.length-1),cd.c+cd.d[1]*(w.length-1)],dg:cd.dg,rv:cd.rv,key:cd.key});
    dc.set(cd.key,(dc.get(cd.key)??0)+1);if(cd.dg)st.diag++;if(cd.rv)st.rev++;
    if(place(i+1))return true;
    placed.pop();dc.set(cd.key,dc.get(cd.key)!-1);if(cd.dg)st.diag--;if(cd.rv)st.rev--;
    for(let k=0;k<w.length;k++)grid[cd.r+cd.d[0]*k]![cd.c+cd.d[1]*k]=prev[k]!;}
   return false;};
  if(!place(0)){why.place++;continue;}
  const use=new Map<string,number>();for(const p of placed){const n=[...p.text].length,dr=Math.sign(p.b[0]-p.a[0]),dcc=Math.sign(p.b[1]-p.a[1]);for(let k=0;k<n;k++){const key=(p.a[0]+dr*k)+','+(p.a[1]+dcc*k);use.set(key,(use.get(key)??0)+1);}}
  const crossings=[...use.values()].filter(v=>v>1).length;const ndirs=new Set(placed.map(p=>p.key)).size;
  if(st.diag<need.diag){why.diag++;continue;}if(st.rev<need.rev){why.rev++;continue;}if(crossings<H.crossMin||(H.maxCross===0&&crossings>0)){why.cross++;continue;}if(ndirs<Y.yonAz){why.dirs++;continue;}
  // Not: v2 tahtaları oyunda SIKIŞTIRILMAZ (projectBoard v2'de kimlik döner); ölçü her zaman tablodaki ölçüdür.
  const targets=chosen.map((label,g)=>({id:`${g}.0`,label,text:label,group:g}));
  const placements=chosen.map((label,g)=>{const p=placed.find(x=>x.text===label)!;return {id:`${g}.0`,label,text:label,group:g,a:p.a,b:p.b};});
  let clean=false,board:Puzzle|undefined;
  for(let f=0;f<80&&!clean;f++){for(let r=0;r<H.R;r++)for(let c=0;c<H.C;c++)if(!use.has(r+','+c))grid[r]![c]=FILLER[Math.floor(rand()*FILLER.length)]!;
   board={version:2,size:Math.max(H.R,H.C),grid:grid.map(r=>[...r]),targets,placements};
   clean=boardIssues(board,PRESENTATION_RULES).length===0&&uygunsuzDiziler(board.grid.map((r:string[])=>r.join('')),placements.map(p=>[p.text,...p.a,...p.b])).length===0;}
  if(!clean||!board){why.clean++;continue;}
  // gizli kelimeler: en tanıdık (sıklığı en yüksek), 3 harften uzun olanlar
  const hid=[...chosen].filter(w=>[...w].length>3).sort((a,b)=>(RANK.get(low(a))??9e9)-(RANK.get(low(b))??9e9)).slice(0,H.hidden);
  const m={words:N,letters:chosen.reduce((s,w)=>s+[...w].length,0),diag:st.diag,rev:st.rev,crossings,R:H.R,C:H.C,long:chosen.filter(w=>[...w].length>=8).length,hidden:hid.length};
  valid.push({n:cat.lv,id:band.id,world:cat.world,pos:cat.n,tier:H.tier,band:cat.band,clue,...m,dirs:ndirs,filled:+(use.size/(H.R*H.C)).toFixed(2),score:+puan(m).toFixed(1),attempt,
   words:chosen,...(clue?{clues:Object.fromEntries(chosen.map(w=>[w,cat.clues[w]!]))}:{}),hiddenIds:hid.map(w=>`${chosen.indexOf(w)}.0`),hiddenWords:hid,grid:board.grid.map((r:string[])=>r.join('')),placements:placements.map((p):WordPath=>[p.text,...p.a,...p.b])});}
  return {valid,why};};
 let {valid,why}=build(chosen);
 { // 4. dünyadan sonra: tahta kurulamazsa ya da bir önceki bölümden zor olamazsa, kelimeleri tek tek yedekle değiştirip yeniden dene
  const prevS=clue?undefined:prevScore.get(cat.world);
  const ok=(v:Layout[])=>v.length>0&&(prevS===undefined||v.some(x=>x.score>=prevS+2));
  if(cat.world>3&&!ok(valid)){
   const order2=[...chosen].sort((a,b)=>[...a].length-[...b].length); // önce en kısa kelimeyi değiştir (zorluk payı artar)
   for(const w of order2){const ex=new Set([w]);let alt=pick(120,ex);if(alt.length<H.words)alt=pick(40,ex);if(alt.length<H.words)continue;
    const r=build(alt);if(ok(r.valid)){valid=r.valid;why=r.why;chosen=alt;break;}if(!valid.length&&r.valid.length){valid=r.valid;why=r.why;chosen=alt;}}}}
 if(!valid.length){fails++;out.push({n:cat.lv,id:band.id,band:cat.band,fail:'yerleşmedi '+JSON.stringify(why),words:chosen});continue;}
 valid.sort((a,b)=>(b.crossings+b.diag*0.5)-(a.crossings+a.diag*0.5));
 const prev=clue?undefined:prevScore.get(cat.world);let best=valid[0]!; // bilmece zincir dışı
 // Seçim: kesişmesi en zengin tahtalar arasından, zorluk payı bırakan. 1. sıra (dünyanın nefes bölümü) en düşük puanlı iyi tahtayı alır;
 // sonraki sıralar önceki bölümün +2..+10 puan aralığında kalmaya çalışır ki zincir dünyanın sonuna kadar yükselebilsin.
 if(cat.world<=3){ // onaylı pilot (1–18): ilk seçim kuralı birebir korunur
  if(prev!==undefined){const up=valid.filter(v=>v.score>=prev+2);if(up.length)best=up[0]!;else best={...best,uyari:'bir önceki bölümden zor değil'};}}
 else if(!clue){const rich=valid.filter(v=>v.crossings>=valid[0]!.crossings-2);
  if(prev===undefined)best=[...rich].sort((a,b)=>a.score-b.score)[0]!;
  else{const up=valid.filter(v=>v.score>=prev+2);const band=up.filter(v=>v.score<=prev+10);
   if(band.length)best=band[0]!;else if(up.length)best=[...up].sort((a,b)=>a.score-b.score)[0]!;else best={...[...valid].sort((a,b)=>b.score-a.score)[0]!,uyari:'bir önceki bölümden zor değil'};}}
 if(!clue)prevScore.set(cat.world,best.score);for(const w of best.words)lastUse.set(w,cat.lv);
 out.push({...best,adaylar:valid.length});
}
mkdirSync(outDir!,{recursive:true});
const ok=out.filter((o):o is Layout=>!('fail' in o));
const ozet={uretim:'yolculuk-v3',tarih:'2026-11-19',bolum:out.length,hata:fails,ortKelime:+(ok.reduce((s,o)=>s+o.words.length,0)/Math.max(1,ok.length)).toFixed(2),
 caprazOran:+(ok.reduce((s,o)=>s+o.diag,0)/Math.max(1,ok.reduce((s,o)=>s+o.words.length,0))).toFixed(2),
 tersOran:+(ok.reduce((s,o)=>s+o.rev,0)/Math.max(1,ok.reduce((s,o)=>s+o.words.length,0))).toFixed(2),
 kesismesiz:ok.filter(o=>o.crossings===0).length,uyarili:ok.filter(o=>o.uyari).length};
writeFileSync(outDir+'/yerlesim.json',JSON.stringify({ozet,levels:out},null,0));
const head='bolum,kimlik,dunya,sira,kademe,bant,tahta,kelime,gizli,capraz,ters,kesisme,yon,doluluk,puan,kelimeler,gizli_kelimeler,uyari';
writeFileSync(outDir+'/yerlesim.csv',[head,...out.map(o=>'fail' in o?[o.n,o.id,'','','',`"${o.band}"`,'','','','','','','','','',`"HATA: ${o.fail}"`,'',''].join(','):[o.n,o.id,o.world,o.pos,o.tier,`"${o.band}"`,o.C+'x'+o.R,o.words.length,o.hidden,o.diag,o.rev,o.crossings,o.dirs,o.filled,o.score,`"${o.words.join(' ')}"`,`"${o.hiddenWords.join(' ')}"`,o.uyari??''].join(','))].join('\n'));
console.log(JSON.stringify(ozet));
for(const o of out)console.log('fail' in o?`${o.n} HATA ${o.fail} ${o.band}`:`${String(o.n).padStart(3)} ${o.tier.padEnd(6)} ${o.C}x${o.R} ${String(o.words.length).padStart(2)}k ${o.hidden}g çap${o.diag} ters${o.rev} kes${o.crossings} puan ${o.score}${o.uyari?' ⚠ '+o.uyari:''} | ${o.band}: ${o.words.join(' ')}`);
