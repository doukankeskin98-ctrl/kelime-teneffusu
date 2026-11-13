// Dependency-free driver for a local, headless Google Chrome (DevTools protocol).
// Optional developer tooling: it is not part of CI and installs nothing.
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
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
  let session = '';
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const {resolve, reject} = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
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
    async viewport(width, height, scale = 2) {
      await call('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: scale, mobile: true});
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
      child.kill();
      rmSync(profile, {recursive: true, force: true});
    },
  };
}
