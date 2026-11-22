import {sleep} from './chrome.mjs';

// Each synthetic player gets separate local storage and IndexedDB. Install the
// save before the first game script runs, then let subsequent navigation persist normally.
export async function seedProgress(page, url, progress, settleMs = 350) {
  await page.freshContext();
  const origin = new URL(url).origin;
  const source = `if (window === top && location.origin === ${JSON.stringify(origin)}) {
    localStorage.setItem('kelime-teneffusu-v2', ${JSON.stringify(JSON.stringify(progress))});
    window.__ktFixtureLoaded = true;
  }`;
  const {identifier} = await page.send('Page.addScriptToEvaluateOnNewDocument', {source});
  try {
    await page.goto(url, settleMs);
    for (let attempt = 0; attempt < 100; attempt++) {
      const ready = await page.evaluate(`window.__ktFixtureLoaded === true &&
        !!document.querySelector('.native-shell[data-ready="true"] .main-area:not([inert]) .berrak-orbit') &&
        !document.getElementById('native-boot')`);
      if (ready) return;
      await sleep(50);
    }
    throw new Error('The seeded player did not reach the interactive home screen');
  } finally {
    await page.send('Page.removeScriptToEvaluateOnNewDocument', {identifier});
  }
}
