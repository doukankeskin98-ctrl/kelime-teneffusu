import assert from 'node:assert/strict';
import {launch, sleep} from './chrome.mjs';

// Run against the built web app, where installation can be offered by the browser.
const page = await launch({port: 9469});
const origin = process.argv[2] ?? 'http://127.0.0.1:8787';
async function waitFor(expression) {
  for (let attempt = 0; attempt < 200; attempt++) {
    if (await page.evaluate('Boolean(' + expression + ')')) return;
    await sleep(150);
  }
  throw Error('Timed out waiting for ' + expression);
}
try {
  await page.viewport(320, 568, 1);
  await page.goto(origin);
  await waitFor("document.querySelector('.app-shell[data-ready=true] .stage-play')");
  await page.evaluate(`(() => {
    const event = new Event('beforeinstallprompt', {cancelable: true});
    event.prompt = () => Promise.resolve();
    event.userChoice = Promise.resolve({outcome: 'dismissed'});
    window.dispatchEvent(event);
  })()`);
  await page.evaluate("document.querySelector('[aria-label=\"Ayarları aç\"]').click()");
  await waitFor("document.querySelector('dialog[open] .settings-links')");
  await page.evaluate("[...document.querySelectorAll('dialog button')].find(b => b.textContent.trim()==='Diğer ayarlar').click()");
  await waitFor("document.querySelector('dialog[open] .install-setting button')");
  assert.equal(await page.evaluate("document.querySelector('.install-setting button').textContent"), 'Ana ekrana ekle');
  await page.evaluate("document.querySelector('dialog[open] .modal-head button').click()");
  await waitFor("!document.querySelector('dialog[open]')");
  const point = await page.evaluate(`(() => {
    const button = document.querySelector('.stage-play');
    const r = button.getBoundingClientRect();
    const x = r.left + r.width / 2;
    for (const y of [r.top + 4, r.top + r.height / 2, r.bottom - 4]) {
      if (!button.contains(document.elementFromPoint(x, y))) return null;
    }
    return [x, r.top + r.height / 2];
  })()`);
  assert.ok(point, 'The browser installation offer covers the first chapter');
  await page.touch([point]);
  await waitFor("document.querySelector('.letter-board [data-cell]')");
  assert.deepEqual(page.errors, []);
  console.log('320×568 web: install action reachable in settings; first chapter opens on one touch.');
} finally {
  await page.close();
}
