// Başsız Chrome'u CDP ile süren küçük yardımcı (Claude, 21 Kasım 2026; Codex incelemesi sonrası sağlamlaştırıldı).
// Kurallar: profil verilmezse her çalıştırma YENİ boş bir geçici profil açar (önceki çalışmanın kaydı sızmaz).
// Chrome açılamazsa ya da sayfa bağlantısı kurulamazsa hata fırlatır (sessizce devam etmez).
import {spawn} from 'node:child_process';import {writeFileSync,mkdtempSync,existsSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const CH=process.env.KT_CHROME||process.env.CHROME_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'/usr/bin/google-chrome');
export const freshProfile=tag=>mkdtempSync(join(tmpdir(),'kt-'+(tag||'olcum')+'-'));
export async function launch({port=9333,profile,reuse=false}={}){
 if(!existsSync(CH))throw new Error('Chrome bulunamadı: '+CH+' (KT_CHROME ile ver)');
 if(!profile)profile=freshProfile();
 else if(!reuse&&existsSync(profile))throw new Error('Profil klasörü zaten var: '+profile+' — temiz başlangıç için yeni klasör ver ya da reuse:true kullan');
 const p=spawn(CH,['--headless=new',...(process.platform==='linux'?['--no-sandbox','--disable-dev-shm-usage']:[]),'--remote-debugging-port='+port,'--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--hide-scrollbars','--mute-audio','about:blank'],{stdio:'ignore'});
 let ws;for(let i=0;i<80&&!ws;i++){try{const l=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();const t=l.find(x=>x.type==='page');if(t)ws=t.webSocketDebuggerUrl;}catch{}if(!ws)await sleep(250);}
 if(!ws){p.kill('SIGKILL');throw new Error('Chrome hata ayıklama bağlantısı kurulamadı (port '+port+')');}
 const sock=new WebSocket(ws);await new Promise((r,j)=>{sock.onopen=r;sock.onerror=()=>j(new Error('WebSocket açılamadı'));});let id=0;const pend=new Map();
 sock.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){const {res,rej}=pend.get(m.id);pend.delete(m.id);if(m.error)rej(new Error(m.error.message));else res(m.result);}};
 const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;const t=setTimeout(()=>{pend.delete(i);rej(new Error('CDP timeout: '+method));},15000);pend.set(i,{res:value=>{clearTimeout(t);res(value);},rej:error=>{clearTimeout(t);rej(error);}});sock.send(JSON.stringify({id:i,method,params}));});
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setBlockedURLs',{urls:['https://*','wss://*']});
 const page={send,profile,proc:p,
  async viewport(w,h,s=2){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:s,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});},
  async goto(u,wait=1000){const r=await send('Page.navigate',{url:u});if(r.errorText)throw new Error('Sayfa açılamadı: '+u+' ('+r.errorText+')');await sleep(wait);},
  async eval(expr){const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error('Sayfa betiği hata verdi: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text));return r.result?.value;},
  async clickText(pat){return page.eval(`(()=>{const re=new RegExp(${JSON.stringify(pat)},'i');const els=[...document.querySelectorAll('button,a,[role=button],summary')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.disabled&&(re.test((e.innerText||'').trim())||re.test(e.getAttribute('aria-label')||''))});const e=els[0];if(!e)return false;e.scrollIntoView({block:'center'});e.click();return true})()`);},
  async shot(f){const {data}=await send('Page.captureScreenshot',{format:'png'});writeFileSync(f,Buffer.from(data,'base64'));},
  // Kapanış türleri: 'duzgun' = Browser.close (Chrome kaydı diske yazar), 'SIGTERM' / 'SIGKILL' = süreç sonlandırma
  async close(kind='SIGKILL'){
   if(p.exitCode!==null||p.signalCode!==null)return;
   if(kind==='duzgun')await send('Browser.close');else p.kill(kind);
   try{sock.close();}catch{}
   for(let i=0;i<80&&p.exitCode===null&&p.signalCode===null;i++)await sleep(50);
   if(p.exitCode===null&&p.signalCode===null){p.kill('SIGKILL');throw new Error('Requested shutdown did not complete: '+kind);}
  }};
 return page;}
