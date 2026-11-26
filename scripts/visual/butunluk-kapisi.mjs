// Bütünlük kapısı (Claude, 25 Kasım 2026; Codex incelemesindeki dört eksik kapatıldı).
// - Ekran listesi sabittir (butunluk-ekranlar.json). Açılamayan ekran İHLALDİR, atlanmaz.
// - Ekranlar gerçek dokunmayla açılır; sonra klavye (Tab) ile odak ayrıca sınanır.
// - Her anahtar açık ve kapalı durumda ölçülür, sonra eski durumuna döndürülür.
// - Üst üste açılan pencerelerde en üstteki ölçülür.
// - İhlal varsa çıkış kodu 1. Örnek kayıt depodaki tahta-fixture.ts ile üretilir (118. bölüm, 117 bölüm bitmiş).
// Kullanım (depo kökünde, geliştirme sunucusu açıkken):
//   URL=http://127.0.0.1:5191/ OUT=../kanit/butunluk node scripts/visual/butunluk-kapisi.mjs
//   VIEWS=430-safari ONLY="Ayarlar" ... (yalnız adı eşleşen ekranlar)
import {execFileSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launch,sleep} from './chrome.mjs';
import {releaseAcceptance} from './butunluk-kapsami.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const base=process.env.URL??'http://127.0.0.1:5191/';
const out=path.resolve(process.env.OUT??'butunluk-kapisi');mkdirSync(out,{recursive:true});
const manifesto=JSON.parse(readFileSync(path.join(here,'butunluk-ekranlar.json'),'utf8'));
const SCREENS=manifesto.filter(s=>(!process.env.ONLY||s.ad.includes(process.env.ONLY))&&(!process.env.SURFACES_ONLY||s.surface));
const VIEWS=[
 {name:'430-safari',w:430,h:775,insets:{top:0,bottom:0,left:0,right:0}},
 {name:'393-uygulama',w:393,h:852,insets:{top:59,bottom:34,left:0,right:0}},
 {name:'320',w:320,h:568,insets:{top:20,bottom:0,left:0,right:0}},
].filter(v=>!process.env.VIEWS||process.env.VIEWS.split(',').includes(v.name));
const LIMIT={toggleKinds:1,headKinds:1,buttonKinds:8,fontSizesPerScreen:7};
if (!VIEWS.length || !SCREENS.length) throw new Error('Ölçülecek ekran veya görünüm bulunamadı.');
const fx=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-transform-types','--no-warnings',path.join(here,'tahta-fixture.ts'),'118'],{encoding:'utf8',maxBuffer:1e8}));
fx.progress.sound=true; // anahtarlar açık durumda başlar; kapı her birini kapatıp yeniden açar

const LABEL=`(b=>(b.getAttribute('aria-label')||b.textContent).replace(/\\s+/g,' ').trim())`;
const findJS=re=>`(()=>{const root=[...document.querySelectorAll('dialog[open]')].pop()||document;const re=new RegExp(${JSON.stringify(re)},'u');
 const b=[...root.querySelectorAll('button,a,[role=button],[role=tab],[role=switch]')].find(b=>b.getClientRects().length&&!b.disabled&&re.test(${LABEL}(b)));
 if(!b)return null;b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()`;
const AUDIT=`(()=>{const root=[...document.querySelectorAll('dialog[open]')].pop()||document.querySelector('.native-shell')||document.body;
 const px=v=>parseFloat(v)||0;const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.opacity!=='0'};
 const ring=e=>{const c=getComputedStyle(e);return (c.outlineStyle!=='none'&&px(c.outlineWidth)>0)||/0px 0px 0px [1-9]/.test(c.boxShadow)};
 const track=el=>{const r=el.getBoundingClientRect();if(r.width<=90&&r.height<=48&&r.width>=r.height*1.3)return el;
  return [...el.querySelectorAll('*')].find(k=>{const kr=k.getBoundingClientRect();return kr.width>=24&&kr.width<=80&&kr.height>=14&&kr.height<=44&&kr.width>=kr.height*1.3&&px(getComputedStyle(k).borderRadius)>=8})||null};
 const toggles=[...new Set([...root.querySelectorAll('[role=switch],.switch,.kt-toggle,input[type=checkbox]')].filter(vis).map(e=>e.closest('[role=switch],[aria-checked],[aria-pressed]')||e))].map(ctrl=>{const el=track(ctrl);if(!el)return null;
  const rr=el.getBoundingClientRect(),c=getComputedStyle(el),a=getComputedStyle(el,'::after');let over=false;
  if(a.content!=='none'){const tx=a.transform&&a.transform!=='none'?new DOMMatrix(a.transform).m41:0;const L=px(a.left)+tx,W=px(a.width);if(L+W>rr.width+0.5||L<-0.5)over=true}
  for(const k of el.children){const kr=k.getBoundingClientRect();if(kr.width&&(kr.right>rr.right+0.5||kr.left<rr.left-0.5))over=true}
  const st=ctrl.getAttribute('aria-checked')??ctrl.getAttribute('aria-pressed')??String(ctrl.checked);
  return {id:${LABEL}(ctrl).slice(0,40),on:st==='true',w:Math.round(rr.width),h:Math.round(rr.height),bg:c.backgroundColor,border:c.borderTopWidth+' '+c.borderTopColor,knobOverflow:over}}).filter(Boolean);
 const heads=[...root.querySelectorAll('h1,h2')].filter(vis).map(h=>{const c=getComputedStyle(h);return {t:h.textContent.trim().slice(0,30),s:[c.fontWeight,c.textAlign,c.textTransform,c.color,c.fontFamily.split(',')[0]].join(' / '),size:c.fontSize}});
 // Odak halkası: yalnız odaktaki öğe sayılır (tasarım gereği çerçeveli öğeler halka değildir).
 const rings=[...root.querySelectorAll(':focus')].filter(e=>vis(e)&&ring(e)).map(e=>e.tagName+' '+${LABEL}(e).slice(0,24));
 const buttonControls=[...root.querySelectorAll('button,a.button,[role=button]')].filter(vis);
 const buttons=buttonControls.map(b=>{const c=getComputedStyle(b);return [c.backgroundImage!=='none'?c.backgroundImage.slice(0,40):c.backgroundColor,c.borderTopWidth+' '+c.borderTopColor,c.borderRadius].join('|')});
 const buttonSamples=Object.fromEntries([...new Set(buttons)].map(signature=>{
  const index=buttons.indexOf(signature),b=buttonControls[index];return [signature,{label:${LABEL}(b).slice(0,45),classes:b.className,role:b.getAttribute('role')||b.tagName.toLowerCase()}];
 }));
 const gaps=[...root.querySelectorAll('.kt-group,[data-kt-group]')].flatMap(g=>{const k=[...g.querySelectorAll(':scope > *, :scope > * > section, :scope > * > .kt-row')].filter(vis).map(x=>x.getBoundingClientRect()).sort((a,b)=>a.top-b.top);const o=[];for(let i=1;i<k.length;i++){const d=k[i].top-k[i-1].bottom;if(d>8)o.push(Math.round(d))}return o});
 const empties=[...root.querySelectorAll('div,li,section')].filter(e=>{if(!vis(e))return false;const r=e.getBoundingClientRect();if(r.height<10||r.width<120)return false;const c=getComputedStyle(e);return (c.borderTopWidth!=='0px'||c.backgroundColor!=='rgba(0, 0, 0, 0)')&&!e.textContent.trim()&&!e.querySelector('svg,img,canvas,input,button,picture')}).length;
 const texts=[...root.querySelectorAll('*')].filter(e=>vis(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));
 const sizes=[...new Set(texts.map(e=>getComputedStyle(e).fontSize))];
 const typeSamples=Object.fromEntries(sizes.map(size=>[size,texts.filter(e=>getComputedStyle(e).fontSize===size).slice(0,4).map(e=>e.textContent.trim().slice(0,30))]));
 const overflowX=[...root.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return vis(e)&&r.width>0&&(r.right>innerWidth+1||r.left<-1)}).map(e=>e.tagName+'.'+e.className.toString().slice(0,20)).slice(0,5);
 const settings=root.dataset.ktSurface==='settings'?{
  sections:[...root.querySelectorAll('.kt-section')].map(section=>({
   title:section.querySelector('h3')?.textContent,
   rows:[...section.querySelectorAll('.kt-group > .kt-row,.kt-group > .game-disclosure > button')].filter(vis).map(row=>row.querySelector('b')?.textContent.trim()||'' )
  })),
  expanded:[...root.querySelectorAll('[aria-expanded=true]')].filter(vis).map(e=>e.querySelector('b')?.textContent.trim()||e.textContent.trim()),
  footer:[...root.querySelectorAll('footer button')].filter(vis).map(e=>e.getAttribute('aria-label')||e.textContent.trim()),
  notice:root.querySelector('.kt-notice')?.textContent.trim()||'',
  footerBottom:Math.round(root.querySelector('footer')?.getBoundingClientRect().bottom||0),
  viewportHeight:innerHeight,
 }:null;
 return {settings,typeSamples,buttonSamples,surface:root.dataset.ktSurface??null,context:root.dataset.ktContext??null,dialog:!![...document.querySelectorAll('dialog[open]')].pop(),toggles,heads,rings,buttons,gaps,empties,sizes:sizes.length,overflowX}})()`;

const page=await launch({port:Number(process.env.CHROME_PORT??0)});
const rows=[],errors=[];
async function fresh(v){await page.viewport(v.w,v.h,2,v.insets);await page.freshContext();
 const {identifier}=await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`if(window===top)localStorage.setItem(${JSON.stringify(fx.key)},${JSON.stringify(JSON.stringify(fx.progress))});`});
 await page.goto(base,1800);await page.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
 for(let i=0;i<40;i++){if(await page.evaluate(`!!document.querySelector('.native-shell[data-ready="true"]')`))break;await sleep(100);}}
async function tap(re){
 let p=await page.evaluate(findJS(re));
 for(let attempt=0;!p&&attempt<12;attempt++){await sleep(125);p=await page.evaluate(findJS(re));}
 if(!p)return false;await page.touch([p]);await sleep(450);
 for(let i=0;i<6;i++){const d=await page.evaluate(`(()=>{const b=[...document.querySelectorAll('dialog[open] button')].find(b=>/^Anladım/.test(b.textContent.trim()));const t=[...document.querySelectorAll('dialog[open]')].pop()?.textContent||'';if(b&&/Saklı kelime|nasıl çizilir|ipucu/i.test(t)){b.click();return 1}return 0})()`);if(!d)break;await sleep(300);}
 return true;}
for(const v of VIEWS)for(const s of SCREENS){
 const tag=`${v.name} · ${s.ad}`;await fresh(v);let ok=true;
 for(const re of s.yol){if(!await tap(re)){ok=false;break;}}
 if(!ok){errors.push(`${tag}: AÇILAMADI`);console.log('✗',tag,'açılamadı');continue;}
 await sleep(300);
 // Safari, dokunmayla açılan pencerede kodla odaklanan başlığın halkasını gösterir; Chrome göstermez.
 // Bu yüzden odaktaki başlığa :focus ve :focus-visible zorlanır ve halka çizilip çizilmediği ölçülür.
 const safariRing=await (async()=>{const marked=await page.evaluate(`(()=>{const a=document.activeElement;if(!a||a===document.body)return false;if(a.matches('button,a,input,select,textarea,[role=button],[role=tab],[role=switch]'))return false;a.setAttribute('data-kapi-odak','1');return true})()`);
  if(!marked)return null;try{await page.send('DOM.enable');await page.send('CSS.enable');const {root}=await page.send('DOM.getDocument',{depth:1});const {nodeId}=await page.send('DOM.querySelector',{nodeId:root.nodeId,selector:'[data-kapi-odak]'});
   await page.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['focus','focus-visible']});
   const r=await page.evaluate(`(()=>{const e=document.querySelector('[data-kapi-odak]');const c=getComputedStyle(e);const v=(c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>0)||/0px 0px 0px [1-9]/.test(c.boxShadow);return v?e.tagName+' '+e.textContent.trim().slice(0,20):''})()`);
   await page.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[]});await page.evaluate(`document.querySelector('[data-kapi-odak]')?.removeAttribute('data-kapi-odak')`);return r||null;}catch(err){return 'ölçülemedi: '+String(err).slice(0,60)}})();
 const a=await page.evaluate(AUDIT);const file=`${v.name}-${s.ad.replace(/[^\p{L}\p{N}]+/gu,'_').slice(0,60)}.png`;await page.screenshot(path.join(out,file));
 // Her anahtar: ters çevir, ölç, geri çevir.
 const flipped=[];
 // Anahtarın yazısı durumla değişebilir (ör. Arena); eşleştirme sıradan ve adın ilk 16 harfinden yapılır.
 for(const [i,t] of a.toggles.entries()){const re='^'+t.id.slice(0,16).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(!await tap(re)){errors.push(`${tag}: anahtar "${t.id}" dokunulamadı`);continue;}
  const b=await page.evaluate(AUDIT);const t2=b.toggles[i];
  if(!t2||t2.on===t.on)errors.push(`${tag}: anahtar "${t.id}" durum değiştirmedi`);else flipped.push(t2);
  if(!await tap(re)||!await page.evaluate(AUDIT).then(result=>result.toggles[i]?.on===t.on)){
   errors.push(`${tag}: anahtar "${t.id}" önceki durumuna dönmedi`);
  }}
 // Klavye: Tab ile gelen odak görünür olmalı.
 await page.key('Tab');await sleep(120);
 const kb=await page.evaluate(`(()=>{const a=document.activeElement;if(!a||a===document.body)return {none:true};const c=getComputedStyle(a);return {vis:a.matches(':focus-visible')&&(c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>0||c.boxShadow!=='none'),tag:a.tagName}})()`);
 const row={view:v.name,ad:s.ad,file,safariRing,...a,toggles:[...a.toggles,...flipped],keyboard:kb};rows.push(row);
 const e=[];
 if(a.rings.length)e.push(`dokunmayla açılışta görünen odak halkası: ${a.rings.join(', ')}`);
 if(safariRing)e.push(`Safari'de başlıkta odak halkası: ${safariRing}`);
 if(kb.none)e.push('Tab ile odaklanacak öğe yok');else if(!kb.vis)e.push(`Tab odağı görünmüyor (${kb.tag})`);
 if(row.toggles.some(t=>t.knobOverflow))e.push('anahtar topuzu izden taşıyor');
 if(a.gaps.length)e.push(`grup içi boşluk ${a.gaps.join(',')} px`);
 if(a.empties)e.push(`${a.empties} içi boş çerçeve`);
 if(a.overflowX.length)e.push(`ekrandan taşan öğe: ${a.overflowX.join(', ')}`);
 if(a.sizes>LIMIT.fontSizesPerScreen)e.push(`${a.sizes} yazı boyu (en çok ${LIMIT.fontSizesPerScreen})`);
 for(const x of e)errors.push(`${tag}: ${x}`);
 console.log(e.length?'✗':'✓',tag,e.join(' | '));
}
// Bütün oyunda tür sayıları (boy başına).
for(const v of VIEWS){const r=rows.filter(x=>x.view===v.name);
 const toggleKinds=new Set(r.flatMap(x=>x.toggles.map(t=>`${t.w}x${t.h}`))).size;
 const onColors=new Set(r.flatMap(x=>x.toggles.filter(t=>t.on).map(t=>t.bg))).size,offColors=new Set(r.flatMap(x=>x.toggles.filter(t=>!t.on).map(t=>t.bg))).size;
 const heads=new Set(r.filter(x=>x.dialog&&x.heads[0]).map(x=>x.heads[0].s)).size;
 const buttons=new Set(r.flatMap(x=>x.buttons)).size;
 const sum={view:v.name,ekran:r.length,anahtarBoyu:toggleKinds,anahtarAcikRenk:onColors,anahtarKapaliRenk:offColors,baslik:heads,dugme:buttons};
 console.log('ÖZET',JSON.stringify(sum));rows.push({ozet:sum});
 if(toggleKinds>LIMIT.toggleKinds||onColors>1||offColors>1)errors.push(`${v.name}: ${toggleKinds} anahtar boyu, ${onColors} açık rengi, ${offColors} kapalı rengi (her biri 1 olmalı)`);
 if(heads>LIMIT.headKinds)errors.push(`${v.name}: ${heads} pencere başlığı türü (1 olmalı)`);
 if(buttons>LIMIT.buttonKinds)errors.push(`${v.name}: ${buttons} düğme görünümü (en çok ${LIMIT.buttonKinds})`);
}
const release=releaseAcceptance(manifesto,VIEWS.map(v=>v.name),rows,errors);
writeFileSync(path.join(out,'butunluk-kapisi.json'),JSON.stringify({rows,errors,release},null,1));
await page.close();
console.log(`\n${rows.filter(r=>!r.ozet).length} ekran ölçüldü, ${errors.length} ihlal.`);
if(process.env.KAPSAM==='0.58.3'){
 console.log('0.58.3', JSON.stringify(release));
 process.exitCode=release.errors.length?1:0;
}else{
 process.exitCode=errors.length?1:0;
}
