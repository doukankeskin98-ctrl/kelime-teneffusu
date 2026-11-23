// Tahta yerleşim kapısı (Claude, 23 Kasım 2026).
// Her bölümü ayrı geçici oyuncuyla gerçek uygulamada açar. Safari boyları Chrome taklididir.
// İhlal varsa çıkış kodu 1. Kullanım:
//   URL=http://127.0.0.1:5191/ OUT=kanit LEVELS=1,5,118 node scripts/visual/tahta-yerlesim-olcumu.mjs
//   LEVELS=hepsi ...   (312 bölüm × 6 boy; varsayılan görüntüler 60 ve 118)
//   VIEWS=430-safari CHROME_PORT=9472 ...   (her paralel işte farklı port ve OUT dizini)
import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,renameSync,writeFileSync} from 'node:fs';
import {createServer as createSocket} from 'node:net';
import {preview} from 'vite';
import path from 'node:path';
import {launch} from './chrome.mjs';

const out=path.resolve(process.env.OUT??'tahta-olcum');
const all=process.env.LEVELS==='hepsi';
const levels=all?Array.from({length:312},(_,i)=>i+1):(process.env.LEVELS??'1,4,5,28,69,70,118,12,60,93').split(',').map(Number);

// Safari boyları: iPhone 14/15/16 Pro Max ve 6,1" Safari'de alt sekme çubuğu açıkken görünen alan.
export const VIEWS=[
 {name:'430-safari',w:430,h:775,insets:{top:0,bottom:0,left:0,right:0},minFont:28,side:16},
 {name:'430-uygulama',w:430,h:932,insets:{top:59,bottom:34,left:0,right:0},minFont:28,side:16},
 {name:'393-safari',w:393,h:700,insets:{top:0,bottom:0,left:0,right:0},minFont:25,side:16},
 {name:'393-uygulama',w:393,h:852,insets:{top:59,bottom:34,left:0,right:0},minFont:25,side:16},
 {name:'375-se',w:375,h:667,insets:{top:20,bottom:0,left:0,right:0},minFont:24,side:16},
 {name:'320',w:320,h:568,insets:{top:20,bottom:0,left:0,right:0},minFont:21,side:22},
];
const measure=`(()=>{const f=document.querySelector('[data-journey-frame]');if(!f)return {error:'oyun ekranı yok'};
 const R=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:+b.x.toFixed(1),y:+b.y.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)}};
 const px=v=>parseFloat(v)||0;
 const stage=f.querySelector('.board-stage'),board=f.querySelector('.letter-board'),grid=f.querySelector('.letter-grid')||board;
 const s=R(stage),pc=getComputedStyle(stage,'::before');
 const paperShown=pc.content!=='none'&&pc.display!=='none'&&px(pc.height)>0;
 const sl=px(pc.left),sw=px(pc.width),pt=px(pc.top),phh=px(pc.height);
 const tf=new DOMMatrix(pc.transform==='none'?undefined:pc.transform);
 const paper=paperShown?{x:+(s.x+sl+tf.m41).toFixed(1),y:+(s.y+pt+tf.m42).toFixed(1),w:sw,h:phh}:null;
 const bc=getComputedStyle(board);
 const boardSurface=!(bc.backgroundColor==='rgba(0, 0, 0, 0)'&&bc.backgroundImage==='none')||bc.boxShadow!=='none';
 const cells=[...f.querySelectorAll('[data-cell]')];const c0=R(cells[0]);
 const shape=cells.reduce((m,e)=>{const [r,c]=e.dataset.cell.split(',').map(Number);return [Math.max(m[0],r+1),Math.max(m[1],c+1)]},[0,0]);
 const gx=R(board);
 const list=R(f.querySelector('.viewport-targets'));
 const heading=f.querySelector('.play-chapter-number');const hb=heading&&getComputedStyle(heading,'::before');
 const badge=R(heading);const badgeTop=badge?badge.y+(hb?px(hb.top):0):null;
 const tags=[...f.querySelectorAll('.target-rack .word-tag')];
 const dots=f.querySelector('.kt-header-progress'),strip=f.querySelector('.kt-world-progress');
 const pieces=node=>[...(node?.querySelectorAll('i')??[])].map(p=>p.dataset.earned);
 const clues=f.querySelector('.definition-text');
 const range=document.createRange();if(clues)range.selectNodeContents(clues);
 const clueLines=clues?[...range.getClientRects()].filter(r=>r.width>0).map(r=>Math.round(r.y)):[];
 return {chapter:Number(heading?.textContent.match(/\\d+/)?.[0]),authored:f.hasAttribute('data-authored-board'),riddle:!!f.querySelector('.definition-strip'),shape,cell:c0?.w,font:px(getComputedStyle(cells[0]).fontSize),board:gx,paper,boardSurface,list,
  badgeTop,stars:R(f.querySelector('.board-stars')),gear:R(f.querySelector('.game-settings-trigger')),
  controls:R(f.querySelector('.play-controls')),progress:R(document.querySelector('.kt-world-progress')),
  dots:R(dots),dotSize:R(dots?.querySelector('i')),dotPieces:pieces(dots),stripPieces:pieces(strip),
  clueFont:clues?px(getComputedStyle(clues).fontSize):null,clueLines:new Set(clueLines).size,
  listRows:new Set(tags.map(t=>Math.round(t.getBoundingClientRect().y))).size,listFont:tags[0]?px(getComputedStyle(tags[0]).fontSize):null,
  vw:innerWidth,vh:innerHeight}})()`;
function check(m,v){const e=[];if(m.error)return [m.error];
 const near=(a,b,t=1.5)=>Math.abs(a-b)<=t;
 if (!m.list || !m.stars || !m.gear || !m.controls || !m.board || !m.shape?.every(n=>n>0) || !(m.font>0) || m.badgeTop==null) e.push('zorunlu öğe eksik');
 if (m.vw!==v.w || m.vh!==v.h) e.push('yanlış ekran boyu');
 if(!m.paper)e.push('tahta kartı yok');
 if(m.boardSurface)e.push('ikinci beyaz yüzey: .letter-board kendi zemini/gölgesiyle çiziliyor');
 if(m.paper&&m.list&&(!near(m.paper.x,m.list.x)||!near(m.paper.x+m.paper.w,m.list.x+m.list.w)))e.push(`kart ve liste kenarı hizasız (kart ${m.paper.x}–${(m.paper.x+m.paper.w).toFixed(1)}, liste ${m.list.x}–${(m.list.x+m.list.w).toFixed(1)})`);
 if(m.paper&&m.board){const inL=m.board.x-m.paper.x,inR=m.paper.x+m.paper.w-(m.board.x+m.board.w),inT=m.board.y-m.paper.y,inB=m.paper.y+m.paper.h-(m.board.y+m.board.h);
  if(inL<6||inR<6||inT<6||inB<6)e.push(`tahta kartın kenarına değiyor/taşıyor (iç boşluk ${[inL,inR,inT,inB].map(n=>n.toFixed(0)).join('/')})`);
  if(Math.abs(inL-inR)>1.5)e.push('tahta kartta ortalı değil');
  if(m.shape[1]>=8&&inL>v.side)e.push(`8–9 sütunlu tahtada yan boşluk ${inL.toFixed(0)} px (en çok ${v.side})`);}
 // 9 sütunda tahta genişlikle sınırlıdır; alt sınır 2 px düşer.
 const need=m.shape[1]>=9?v.minFont-2:v.minFont;
 if(m.font<need)e.push(`harf ${m.font} px < ${need}`);
 if(m.badgeTop!=null&&m.badgeTop<v.insets.top+4)e.push(`BÖLÜM rozeti üstten kırpılıyor (üst ${m.badgeTop.toFixed(1)})`);
 if(m.paper&&m.controls&&m.paper.y+m.paper.h>m.controls.y-4)e.push('kart araç düğmelerine değiyor');
 const strip=m.progress&&m.progress.w>0;
 if ('dotPieces' in m) {
  const compact=v.h<800, dotsVisible=m.dots?.w>0;
  if(compact===!!strip || compact!==dotsVisible)e.push('ilerleme yeri ekran yüksekliğine uymuyor');
  if(m.dotPieces.length!==6 || m.dotPieces.join()!==m.stripPieces.join())e.push('başlık ilerlemesi altı doğru parçayı göstermiyor');
  if(compact && (!near(m.dotSize?.w,6,.1)||!near(m.dots?.w,56,.1)))e.push('ilerleme noktası ölçüsü veya aralığı hatalı');
  if(compact && dotsVisible && m.list && m.dots.y+m.dots.h>m.list.y)e.push('ilerleme noktaları hedef paneline biniyor');
  if(v.w===320 && m.riddle && (m.clueFont<15 || !m.clueLines || m.clueLines>2))e.push('320 bilmece tanımı okunaklı iki satıra sığmıyor');
 }
 if(m.controls&&strip&&m.controls.y+m.controls.h>m.progress.y)e.push('araçlar dünya şeridiyle çakışıyor');
 if(strip&&m.progress.y+m.progress.h>m.vh-v.insets.bottom)e.push('dünya şeridi ekran dışında');
 if(m.list&&m.badgeTop!=null&&m.stars&&m.stars.y+m.stars.h>m.list.y)e.push('yıldız sayacı listeye biniyor');
 return e;}
export {check};
const names=process.env.VIEWS?.split(',') ?? VIEWS.map(v=>v.name);
const views=names.map(name=>{
 const view=VIEWS.find(v=>v.name===name);
 if(!view)throw new Error('Bilinmeyen boy: '+name);
 return view;
});
if(new Set(names).size!==names.length || !levels.every(n=>Number.isInteger(n)&&n>=1&&n<=312) || new Set(levels).size!==levels.length) throw new Error('Geçersiz veya tekrarlı ölçüm seçimi.');
function validate(rows,expectedViews=views,expectedLevels=levels,archived=false){
 const seen=new Set(),anchors=new Map();
 for(const row of rows){
  const key=row.bolum+'-'+row.boy;
  if(seen.has(key))throw new Error('Çift ölçüm: '+key);
  seen.add(key);
  const view=expectedViews.find(v=>v.name===row.boy);
  if(!view || !expectedLevels.includes(row.bolum)) throw new Error('Beklenmeyen açılış: '+key);
  row.ihlal=check(row,view);
  if(!row.error && (!archived || row.chapter!=null) && (row.chapter!==row.bolum || !row.authored))row.ihlal.push('yanlış bölüm veya katalog');
  if(!row.error && row.paper && row.list && row.controls){
   const positions=[row.list.y,row.paper.y,row.controls.y];
   const anchor=anchors.get(row.boy);
   if(!anchor)anchors.set(row.boy,positions);
   else if(positions.some((y,i)=>Math.abs(y-anchor[i])>1))row.ihlal.push('bölümler arasında liste, kart veya araçların üst kenarı 1 px üzerinde kaydı');
  }
 }
 for(const view of expectedViews)for(const level of expectedLevels)if(!seen.has(level+'-'+view.name))throw new Error('Eksik açılış: '+level+'-'+view.name);
}
function report(rows,...options){
 validate(rows,...options);
 const failed=rows.filter(r=>r.ihlal.length);
 for(const row of failed.slice(0,12))console.error(row.bolum,row.boy,row.ihlal.join(' | '));
 console.log(rows.length+' açılış, '+failed.length+' ihlalli.');
 return failed.length;
}
if(process.env.YALNIZ_DEGERLENDIR){
 const rows=JSON.parse(readFileSync(process.env.YALNIZ_DEGERLENDIR,'utf8'));
 if(!rows.length)throw new Error('Boş ölçüm dosyası');
 const selectedViews=process.env.VIEWS ? views : VIEWS.filter(v=>rows.some(r=>r.boy===v.name));
 const selectedLevels=process.env.LEVELS ? levels : [...new Set(rows.map(r=>r.bolum))];
 process.exitCode=report(rows,selectedViews,selectedLevels,true)?1:0;
}else{
 mkdirSync(out,{recursive:true});
 const fx=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings','scripts/visual/tahta-fixture.ts','hepsi'],{encoding:'utf8',maxBuffer:8e6}));
 if(fx.ids.length!==312)throw new Error('Beklenen 312 bölüm bulunamadı.');
 const host=process.env.URL;
 if(host && !['localhost','127.0.0.1','[::1]'].includes(new URL(host).hostname))throw new Error('Bu denetim yalnız yerel deneme kopyasında çalışır.');
 const root=path.resolve(process.env.KT_LAYOUT_BUILD??'dist-pilot');
 if(!host && !existsSync(path.join(root,'index.html'))) throw new Error('Önce yazarlı oyun paketini derle.');
 const selectedShots=new Set((process.env.SHOT_LEVELS??'118,60').split(',').map(Number));
 const rows=[];
 let page,server;
 try{
  if(!host)server=await preview({configFile:false,root,build:{outDir:root},preview:{host:'127.0.0.1',port:0},logLevel:'error'});
  const url=host??('http://127.0.0.1:'+server.httpServer.address().port+'/');
  // Use an OS-assigned port by default. An occupied explicit port must fail
  // instead of attaching to an unrelated browser and closing it on exit.
  const probe=createSocket();
  await new Promise((ok,fail)=>{probe.once('error',fail);probe.listen(Number(process.env.CHROME_PORT??0),'127.0.0.1',ok);});
  const port=probe.address().port;
  await new Promise(ok=>probe.close(ok));
  page=await launch({port});
  await page.reducedMotion(true);
  const metadata=await page.send('Browser.getVersion');
  writeFileSync(path.join(out,'tarayici.json'),JSON.stringify({browser:metadata.product,views,levels,build:host??root},null,2));
  // Each chapter has its own anonymous player. Replay it from its Home button
  // after each viewport change so every size measures a newly mounted board.
  for(const n of levels){
   const saves={};
   for(const id of fx.ids.slice(0,n-1))saves['route:'+id]=fx.progress.saves['route:'+id];
   const value=JSON.stringify({...fx.progress,saves});
   await page.freshContext();
   for(const [viewIndex,v] of views.entries()){
    await page.viewport(v.w,v.h,2,v.insets);
    if(!viewIndex){
     const {identifier}=await page.send('Page.addScriptToEvaluateOnNewDocument',{source:'if(window===top)localStorage.setItem('+JSON.stringify(fx.key)+','+JSON.stringify(value)+');'});
     await page.goto(url,50);
     // Wait for the local document to commit before removing the startup seed.
     await page.evaluate('!!document.body');
     await page.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
    }else{
     const leave=async()=>{
      document.querySelector('.game-settings-trigger')?.click();
      const until=performance.now()+5000;
      while(!document.querySelector('.game-home-action') && performance.now()<until)await new Promise(r=>setTimeout(r,20));
      const home=document.querySelector('.game-home-action');
      if(!home)throw new Error('Ayarların ana sayfa düğmesi yok.');
      home.click();
      while(document.querySelector('[data-journey-frame]') && performance.now()<until)await new Promise(r=>setTimeout(r,20));
      if(document.querySelector('[data-journey-frame]'))throw new Error('Ana sayfaya dönüş gerçekleşmedi.');
     };
     await page.evaluate('('+leave.toString()+')()');
    }
    let result;
    try{
     const open=async(number)=>{
      const wait=()=>new Promise(resolve=>setTimeout(resolve,30));
      const deadline=performance.now()+6500;
      let clicked=false;
      do{
       const button=document.querySelector('.app-shell[data-ready=true] .main-area:not([inert]) .stage-play');
       if(!clicked && button?.getAttribute('aria-label')?.startsWith('Bölüm '+number+' ·')){button.click();clicked=true;}
       const dialog=document.querySelector('dialog[open]');
       const accept=dialog&&[...dialog.querySelectorAll('button')].find(b=>/Anladım|Başla|Tamam/.test(b.textContent));
       if(accept)accept.click();
       const frame=document.querySelector('[data-journey-frame]');
       if(!dialog && frame?.querySelector('.letter-board [data-cell]') && !frame.querySelector('.pause-shade')){
        await document.fonts.ready;
        let last='',stable=0;
        while(stable<3 && performance.now()<deadline){
         await new Promise(requestAnimationFrame);
         const b=frame.querySelector('.letter-board').getBoundingClientRect(), now=[b.x,b.y,b.width,b.height].join(',');
         stable=now===last?stable+1:0;last=now;
        }
        return stable>=3?'ok':'tahta kararlı konuma gelmedi';
       }
       await wait();
      }while(performance.now()<deadline);
      return 'Bölüm açılmadı: '+(document.querySelector('.stage-play')?.getAttribute('aria-label')??'')+' '+document.body.innerText.slice(0,160);
     };
     const opened=await page.evaluate('('+open.toString()+')('+n+')');
     result=opened==='ok'?await page.evaluate(measure):{error:opened};
    }catch(error){result={error:String(error).slice(0,300)};}
    const row={bolum:n,boy:v.name,...result,ihlal:check(result,v)};
    rows.push(row);
    if(process.env.SHOTS!=='0' && selectedShots.has(n))await page.screenshot(path.join(out,'b'+String(n).padStart(3,'0')+'-'+v.name+'.png'));
    if(levels.length<12 || n%30===0)console.log(n,v.name,row.shape,row.font,row.ihlal.join(' | ')||'✓');
    if(result.error)throw new Error(result.error);
   }
   if(n%12===0){
    const checkpoint=path.join(out,'olcum-kismi.json');
    writeFileSync(checkpoint+'.tmp',JSON.stringify(rows));
    renameSync(checkpoint+'.tmp',checkpoint);
   }
  }
  if(page.errors.length)throw new Error('Tarayıcı hatası: '+page.errors.slice(0,3).join(' | '));
  process.exitCode=report(rows)?1:0;
 }finally{
  writeFileSync(path.join(out,'olcum.json'),JSON.stringify(rows,null,1));
  await page?.close();
  await server?.close();
 }
}
