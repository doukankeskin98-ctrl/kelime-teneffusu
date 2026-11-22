// Seed a synthetic player while the app is unloaded so its durable backup cannot
// merge a previous scenario into the requested starting state.
export async function seedProgress(page, url, progress) {
  const origin = new URL(url).origin;
  await page.goto(new URL('/__test_seed', origin).href, 100);
  if (!await page.evaluate("Boolean(document.getElementById('seed'))")) {
    throw new Error('Expected the isolated fixture document before resetting progress');
  }
  await page.send('Storage.clearDataForOrigin', {origin, storageTypes: 'indexeddb,local_storage'});
  await page.evaluate(`sessionStorage.clear(); localStorage.setItem('kelime-teneffusu-v2', ${JSON.stringify(JSON.stringify(progress))})`);
}
