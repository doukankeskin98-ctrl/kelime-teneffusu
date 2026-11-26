// Dependency-free driver for a local, headless Google Chrome (DevTools protocol).
// Used by local visuals and the CI mobile contrast check.
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.KT_CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/opt/google/chrome/chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function launch({port = 0} = {}) {
  const chrome = CANDIDATES.find(candidate => existsSync(candidate));
  if (!chrome) throw new Error('Chrome bulunamadı. CHROME_PATH ile yolunu ver.');
  const profile = mkdtempSync(path.join(tmpdir(), 'kt-visual-'));
  // Match the working integrity runner on hosted Linux. Chrome advertises its
  // own loopback socket even when a distribution launcher does not pass CDP fds.
  const hostedLinux = process.platform === 'linux' && process.env.GITHUB_ACTIONS === 'true';
  const pipe = !hostedLinux && port === 0 && process.env.KT_CHROME_PIPE === '1';
  const transport = pipe ? ['--remote-debugging-pipe'] : ['--remote-debugging-address=127.0.0.1', `--remote-debugging-port=${port}`];
  const args = ['--headless=new', ...transport,
    `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-background-networking', '--disable-component-update', '--hide-scrollbars', '--mute-audio',
    ...(process.platform==='linux'?['--disable-dev-shm-usage']:[]), ...(hostedLinux?['--no-sandbox']:[]), 'about:blank'];
  const child = spawn(chrome, args, {stdio:pipe?['ignore','ignore','pipe','pipe','pipe']:['ignore','ignore','pipe']});
  let startupLog='', socket;
  try {
    // Only connect to the endpoint announced by this browser. Parallel runs can
    // use port zero, and a port occupied by someone else cannot pass readiness.
    if (pipe) {
      const input=child.stdio[3], output=child.stdio[4];
      let buffer='';
      output.setEncoding('utf8');
      socket={send:message=>input.write(message+'\0')};
      output.on('data',chunk=>{
        buffer+=chunk;
        let end;
        while((end=buffer.indexOf('\0'))>=0){
          const data=buffer.slice(0,end);
          buffer=buffer.slice(end+1);
          if(data)socket.onmessage?.({data});
        }
      });
      child.stderr.on('data',chunk=>{startupLog=(startupLog+chunk).slice(-4000);});
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>finish(new Error('Chrome pipe did not answer')),15000);
        const exited=(code,signal)=>finish(new Error('Chrome exited during startup: '+(signal??code)));
        function finish(error){
          clearTimeout(timer);child.off('exit',exited);child.off('error',finish);
          input.off('error',finish);socket.onmessage=undefined;
          if(error)reject(error);else resolve();
        }
        child.once('exit',exited);child.once('error',finish);input.once('error',finish);
        socket.onmessage=event=>{if(JSON.parse(event.data).id===0)finish();};
        socket.send(JSON.stringify({id:0,method:'Browser.getVersion'}));
      });
      input.on('error',()=>{}); // A normal Browser.close can close the pipe first.
    } else {
      const endpoint=await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>finish(new Error('no DevTools endpoint')),15000);
        // With port zero Chrome also publishes its endpoint in the fresh profile.
        // Some runners omit or buffer the corresponding stderr announcement.
        const portFile=path.join(profile,'DevToolsActivePort');
        const poll=port===0?setInterval(()=>{
          try{
            const match=/^(\d+)\r?\n(\/devtools\/browser\/[a-z\d-]{36})\s*$/i.exec(readFileSync(portFile,'utf8'));
            if(match && Number(match[1])>0 && Number(match[1])<=65535)
              finish(null,'ws://127.0.0.1:'+match[1]+match[2]);
          }catch(error){
            if(error.code!=='ENOENT')finish(error);
          }
        },80):undefined;
        const fail=error=>finish(error);
        const exited=(code,signal)=>finish(new Error('Chrome exited: '+(signal??code)));
        function log(chunk){
          startupLog=(startupLog+chunk).slice(-4000);
          const match=startupLog.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[a-z0-9-]+)/i);
          if(match)finish(null,match[1]);
        }
        function finish(error,url){
          clearTimeout(timer);clearInterval(poll);child.off('error',fail);child.off('exit',exited);child.stderr.off('data',log);
          child.stderr.resume();
          if(error)reject(error);else resolve(url);
        }
        child.once('error',fail);child.once('exit',exited);child.stderr.on('data',log);
      });
      socket=new WebSocket(endpoint);
      await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
    }
  } catch(error) {
    if(child.pid && child.exitCode===null && child.signalCode===null){
      const exited=new Promise(resolve=>child.once('exit',resolve));
      child.kill('SIGKILL');
      await exited;
    }
    rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
    throw new Error('Chrome başlatılamadı: '+error.message+' '+startupLog.slice(-1400));
  }
  let nextId = 0;
  const pending = new Map(), errors = [];
  child.once('exit',()=>{
    for(const command of pending.values())command.reject(new Error('Chrome closed'));
    pending.clear();
  });
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
  let {targetId} = await send('Target.createTarget', {url: 'about:blank'});
  let browserContextId;
  const sessionOptions = new Map();
  session = (await send('Target.attachToTarget', {targetId, flatten: true})).sessionId;
  const call = (method, params) => {
    if (method.startsWith('Emulation.set') || method === 'Network.enable' || method === 'Network.setBlockedURLs') {
      sessionOptions.set(method, params);
    }
    return send(method, params, session);
  };
  await call('Page.enable');
  await call('Runtime.enable');
  return {
    errors,
    send: call,
    async freshContext() {
      if (recording) throw new Error('Finish the recording before starting a new player');
      if (browserContextId) await send('Target.disposeBrowserContext', {browserContextId});
      else await send('Target.closeTarget', {targetId});
      ({browserContextId} = await send('Target.createBrowserContext', {disposeOnDetach:true}));
      ({targetId} = await send('Target.createTarget', {url:'about:blank', browserContextId}));
      session = (await send('Target.attachToTarget', {targetId, flatten:true})).sessionId;
      await call('Page.enable');
      await call('Runtime.enable');
      for (const [method, params] of sessionOptions) await send(method, params, session);
    },
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
      if (file) writeFileSync(file, Buffer.from(data, 'base64'));
      else return data;
    },
    async close() {
      try { await send('Browser.close'); } catch { /* already closed */ }
      if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await Promise.race([exited,sleep(2000)]);}
      // Chrome may finish writing preferences just after its main process exits.
      for(let attempt=0;attempt<4;attempt++){try{rmSync(profile,{recursive:true,force:true});break;}catch(error){if(attempt===3)throw error;await sleep(150);}}
    },
  };
}
