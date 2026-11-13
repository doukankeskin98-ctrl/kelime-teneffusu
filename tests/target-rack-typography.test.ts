import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

const css=readFileSync(new URL('../app/focused-journey.css',import.meta.url),'utf8');
const rule=(selector:string)=>{
  const at=css.indexOf(selector+'{');
  assert.notEqual(at,-1,selector);
  return css.slice(at+selector.length+1,css.indexOf('}',at));
};

test('open target letters use the typeface widths; only masked placeholders keep a fixed slot',()=>{
  const open=rule('.target-letters>[data-target-letter]');
  assert.match(open,/width:auto/);
  assert.doesNotMatch(open,/width:\.\d+em/);
  assert.match(rule('.target-letters>.masked-letter'),/width:\.64em/);
});

test('a veiled rack word reserves its revealed width, while open words size to their text',()=>{
  const tag=rule('.scenic-play .target-rack .word-tag,.game-app .scenic-play .target-rack .word-tag');
  assert.match(tag,/width:auto/);
  assert.match(tag,/min-width:44px/);
  assert.match(rule('.scenic-play .target-rack .word-tag.veiled-target,.game-app .scenic-play .target-rack .word-tag.veiled-target'),/min-width:max\(44px,calc\(var\(--word-chars\)\*\.64em \+ 4px\)\)/);
});

test('no rack rule gives an open word a per-character slot width',()=>{
  // Every per-character width or basis must be scoped to veiled targets.
  for(const match of css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*var\(--word-chars\)[^{}]*)\}/g)) {
    const selectors=match[1]!.split(',').map(selector=>selector.trim());
    assert(selectors.every(selector=>selector.includes('.veiled-target')),selectors.join(', '));
  }
  assert.match(rule('.scenic-play .target-rack .word-tag:not(.veiled-target),.game-app .scenic-play .target-rack .word-tag:not(.veiled-target)'),/flex-basis:auto!important;width:auto/);
});

test('an unrevealed veiled word keeps one slot grid and a rack word never breaks',()=>{
  assert.match(rule('.word-tag.veiled-target:not(.found) .target-letters>[data-target-letter]'),/width:\.64em;padding:0/);
  assert.match(rule('.target-rack .target-letters'),/flex-wrap:nowrap/);
  // A revealed wide word may grow past its slot instead of wrapping.
  assert.match(rule('.scenic-play[data-dense-board] .target-rack .word-tag.veiled-target,.game-app .scenic-play[data-dense-board] .target-rack .word-tag.veiled-target'),/width:auto;min-width:calc/);
});

test('short phones keep dense target rows as tall as their touch buttons',()=>{
  const at=css.indexOf('@media(max-height:600px) and (orientation:portrait){');
  assert.notEqual(at,-1);
  const block=css.slice(at,css.indexOf('\n}',at));
  assert.match(block,/\[data-dense-board\] \.target-rack \.word-tag[^{]*\{min-height:44px!important;font-size:15px!important/);
});
