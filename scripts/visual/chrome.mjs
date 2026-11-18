// Dependency-free driver for a local, headless Google Chrome (DevTools protocol).
// Optional developer tooling: it is not part of CI and installs nothing.
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function launch({port = 9333} = {}) {
  const chrome = CANDIDATES.find(candidate => existsSync(candidate));
  if (!chrome) throw new Error('Chrome bulunamadı. CHROME_PATH ile yolunu ver.');
  const profile = mkdtempSync(path.join(tmpdir(), 'kt-visual-'));
  const child = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', '--mute-audio', 'about:blank'], {stdio: 'ignore'});
  let info;
  for (let attempt = 0; attempt < 60 && !info; attempt++) {
    try { info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(250); }
  }
  if (!info) { child.kill(); throw new Error('Chrome başlatılamadı.'); }
  const socket = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map(), errors = [];
  let session = '', recording=null;
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const {resolve, reject} = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    } else if(message.sessionId===session&&message.method==='Page.screencastFrame'){
      if(recording){const {data,metadata}=message.params,index=recording.frames.length;writeFileSync(path.join(recording.directory,`${String(index).padStart(4,'0')}.jpg`),Buffer.from(data,'base64'));recording.frames.push({index,timestamp:metadata.timestamp});}
      void send('Page.screencastFrameAck',{sessionId:message.params.sessionId},session).catch(()=>{});
    } else if (message.sessionId === session && message.method === 'Runtime.exceptionThrown') {
      errors.push(String(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text).slice(0, 300));
    }
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, {resolve, reject});
    socket.send(JSON.stringify({id, method, params, ...(sessionId ? {sessionId} : {})}));
  });
  const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
  session = (await send('Target.attachToTarget', {targetId, flatten: true})).sessionId;
  const call = (method, params) => send(method, params, session);
  await call('Page.enable');
  await call('Runtime.enable');
  return {
    errors,
    async startRecording(directory){mkdirSync(directory,{recursive:true});recording={directory,frames:[]};await call('Page.startScreencast',{format:'jpeg',quality:85,everyNthFrame:1,maxWidth:430,maxHeight:932});},
    async stopRecording(){await call('Page.stopScreencast');const result=recording;recording=null;if(result)writeFileSync(path.join(result.directory,'frames.json'),JSON.stringify(result.frames));return result?.frames??[];},
    async key(key,code=key) {
      await call('Input.dispatchKeyEvent',{type:'keyDown',key,code,...(key==='Tab'?{windowsVirtualKeyCode:9,nativeVirtualKeyCode:9}:{})});
      await call('Input.dispatchKeyEvent',{type:'keyUp',key,code});
    },
    async touch(points, afterPoint) {
      for(let i=0;i<points.length;i++) {
        await call('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[{x:points[i][0],y:points[i][1],id:1,radiusX:4,radiusY:4,force:.7}]});
        if(afterPoint)await afterPoint(i);
        await sleep(24);
      }
      await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    },
    async reducedMotion(enabled) {
      await call('Emulation.setEmulatedMedia', {features: enabled ? [{name: 'prefers-reduced-motion', value: 'reduce'}] : []});
    },
    async viewport(width, height, scale = 2, insets) {
      await call('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: scale, mobile: true});
      if (insets) await call('Emulation.setSafeAreaInsetsOverride', {insets});
      await call('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
    },
    async goto(url, wait = 1000) { await call('Page.navigate', {url}); await sleep(wait); },
    async evaluate(expression) {
      const result = await call('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      return result.result.value;
    },
    async screenshot(file) {
      const {data} = await call('Page.captureScreenshot', {format: 'png'});
      writeFileSync(file, Buffer.from(data, 'base64'));
    },
    async close() {
      try { await send('Browser.close'); } catch { /* already closed */ }
      if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await Promise.race([exited,sleep(2000)]);}
      // Chrome may finish writing preferences just after its main process exits.
      for(let attempt=0;attempt<4;attempt++){try{rmSync(profile,{recursive:true,force:true});break;}catch(error){if(attempt===3)throw error;await sleep(150);}}
    },
  };
}
