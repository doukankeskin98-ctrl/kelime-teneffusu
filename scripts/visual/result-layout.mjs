// Applied to a real open result dialog, after its entrance motion has settled.
// Exercises both short phones and the safe area that reduces a modern iPhone's usable height.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import path from 'node:path';

const profiles = [
  [320, 568, 20, 0], [375, 667, 20, 0], [375, 667, 59, 34],
  [390, 844, 59, 34], [393, 852, 59, 34], [402, 874, 59, 34], [430, 932, 59, 34],
];

function readResult() {
  const dialog = document.querySelector('dialog[open].berrak-result');
  const select = selector => dialog.querySelector(selector);
  const box = e => e.getBoundingClientRect();
  const bounds = e => {
    const {top, bottom} = box(e);
    return {top, bottom};
  };
  const visibleAtCenter = e => {
    const {left, top, width, height} = box(e);
    return e.contains(document.elementFromPoint(left + width / 2, top + height / 2));
  };
  const textLines = e => {
    const range = document.createRange();
    range.selectNodeContents(e);
    return range.getClientRects().length;
  };
  const content = select('.modal-content');
  const button = select('.result-continue');
  const heading = select('.modal-head h2');
  const bonus = dialog.classList.contains('bonus-outcome');
  const pieces = [...dialog.querySelectorAll(bonus
    ? '.bonus-discovery-medal, .bonus-personal-best'
    : '.result-world-count, .result-world-caption b, .result-world-caption small')];
  return {
    bonus,
    headingLines: textLines(heading),
    buttonLines: textLines(button),
    button: bounds(button),
    panel: bounds(content),
    buttonAccessible: visibleAtCenter(button),
    medalDiameter: box(select(bonus ? '.bonus-discovery-medal' : '.result-world-medallion')).width,
    pieces: pieces.map(e => ({text: e.innerText, ...bounds(e), visible: visibleAtCenter(e)})),
  };
}

function inspectDetails() {
  const dialog = document.querySelector('dialog[open].berrak-result');
  const details = dialog.querySelector('.journey-result-details');
  if (!details) return null;
  const panel = dialog.querySelector('.modal-content');
  const summary = details.querySelector('summary');
  summary.click();
  panel.scrollTop = panel.scrollHeight;
  const last = details.querySelector('.result-record').lastElementChild;
  const lastEdge = last.getBoundingClientRect().bottom;
  const cta = dialog.querySelector('.result-continue').getBoundingClientRect().top;
  const accessible = lastEdge <= panel.getBoundingClientRect().bottom + 1 && lastEdge <= cta;
  const opened = details.open;
  summary.click();
  panel.scrollTop = 0;
  return opened && accessible && !details.open;
}

export async function verifyResultLayout(page, scene, out) {
  const restore = await page.evaluate('[innerWidth, innerHeight, devicePixelRatio]');
  const results = [];
  try {
    for (const [width, height, top, bottom] of profiles) {
      await page.viewport(width, height, 1, {top, bottom, left: 0, right: 0});
      await page.reducedMotion(width === 320);
      await page.evaluate('document.fonts.ready.then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))');
      const result = await page.evaluate('(' + readResult.toString() + ')()');
      const context = [scene, width, height, top, bottom].join('-');
      await page.screenshot(path.join(out, context + '.png'));
      assert.ok(result.buttonAccessible, context + ' continue action');
      assert.ok(result.button.bottom <= height - bottom + 1, context + ' action inside safe area');
      assert.ok(result.pieces.length >= 2, context + ' visible reward');
      for (const piece of result.pieces) {
        assert.ok(piece.visible && piece.top >= result.panel.top - 1 && piece.bottom <= result.panel.bottom + 1,
          context + ' reward clipped: ' + piece.text);
        assert.ok(result.button.top - piece.bottom >= 15.99, context + ' reward too close to action: ' + piece.text);
      }
      if (result.bonus) {
        assert.equal(result.buttonLines, 1, context + ' bonus action wraps');
        if (width >= 393) assert.equal(result.headingLines, 1, context + ' bonus heading wraps');
      }
      assert.notEqual(await page.evaluate('(' + inspectDetails.toString() + ')()'), false, context + ' result details unreachable');
      results.push({width, height, top, bottom, reducedMotion: width === 320, ...result});
    }
    writeFileSync(path.join(out, scene + '-safe-areas.json'), JSON.stringify(results, null, 2));
  } finally {
    await page.reducedMotion(false);
    await page.viewport(...restore, {top: 0, bottom: 0, left: 0, right: 0});
  }
}
