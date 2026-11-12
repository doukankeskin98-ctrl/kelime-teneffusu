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
