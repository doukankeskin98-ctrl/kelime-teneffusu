import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {THEMES,normalize,splitWord} from '../lib/game/catalog.ts';
import {makePuzzle,exactLine,match,goldenId,pointsFor,istanbulDay,dailySpec} from '../lib/game/engine.ts';
import * as legacy from '../lib/game/legacy.ts';
import {cleanSave,emptyProgress,loadProgress,streak} from '../lib/game/progress.ts';
describe('curated content and all 96 levels',()=>{
 it('contains 16 themes with meaningful, unique Turkish terms',()=>{assert.equal(THEMES.length,16);for(const t of THEMES){assert(t.words.length>=24);assert.equal(new Set(t.words).size,t.words.length);for(const word of t.words){assert.match(word,/^[A-Za-zÇĞİÖŞÜçğıöşü0-9 ’'-]+$/u);assert(splitWord(word).every(w=>w.length>=2&&w.length<=13));}}});
 it('places every word, guarantees both diagonal slopes, supports all eight directions across 4800 boards',()=>{
   const directions=new Set<string>();
   for(const theme of THEMES)for(let level=0;level<6;level++)for(let seed=1;seed<=50;seed++){
     const b=makePuzzle(theme.id,level,seed);assert(b.size>=9&&b.size<=13);assert.equal(b.targets.length,b.placements.length);
     assert.equal(new Set(b.targets.map(t=>t.group)).size,5+level);
     assert(b.grid.flat().every(ch=>ch.length===1));const slopes=new Set<number>();
     for(const p of b.placements){const cells=exactLine(p.a,p.b,b.size);assert(cells);assert.equal(cells.map(([r,c])=>b.grid[r]![c]).join(''),p.text);assert.equal(match(b,p.a,p.b)?.id,p.id);assert.equal(match(b,p.b,p.a)?.id,p.id);const dy=Math.sign(p.b[0]-p.a[0]),dx=Math.sign(p.b[1]-p.a[1]);directions.add(`${dy},${dx}`);if(dx&&dy)slopes.add(dx*dy);}
     assert(slopes.has(1)&&slopes.has(-1),`${theme.id}.${level}.${seed} missing diagonal`);
   }assert.equal(directions.size,8);
 });
 it('has six different target lists per theme and stable deterministic boards',()=>{for(const t of THEMES){assert.equal(new Set(Array.from({length:6},(_,l)=>JSON.stringify(makePuzzle(t.id,l,42).targets))).size,6);assert.deepEqual(makePuzzle(t.id,5,42),makePuzzle(t.id,5,42));}});
});
describe('selection, calendar and scoring boundaries',()=>{
 it('rejects invalid or crooked paths and preserves Turkish letters',()=>{for(const [a,b] of [[[0,0],[1,2]],[[0,0],[0,0]],[[-1,0],[2,2]],[[0.5,0],[2,2]],[[0,0],[99,99]],[[NaN,0],[1,1]]])assert.equal(exactLine(a,b,10),null);assert.equal(normalize('İnek Şaban'),'İNEKŞABAN');assert.equal(normalize('ışık'),'IŞIK');assert.equal(exactLine([1,1],[4,4],10)?.length,4);});
 it('synchronizes golden windows exactly at 20 and 40 second boundaries',()=>{const b=makePuzzle('uzay',2,7),starts=100000;assert.equal(goldenId(b.targets,starts,starts-1),null);assert.equal(goldenId(b.targets,starts,starts),b.targets[0]!.id);assert.equal(goldenId(b.targets,starts,starts+19999),b.targets[0]!.id);assert.equal(goldenId(b.targets,starts,starts+20000),null);assert.equal(goldenId(b.targets,starts,starts+40000),b.targets[3]!.id);assert.equal(goldenId(b.targets,starts,starts+120000),null);assert.equal(pointsFor(b.targets[0]!,true),pointsFor(b.targets[0]!,false)*2);});
 it('rolls days at midnight in Istanbul, independently of browser timezone',()=>{assert.equal(istanbulDay(Date.parse('2026-10-20T20:59:59Z')),'2026-10-20');assert.equal(istanbulDay(Date.parse('2026-10-20T21:00:00Z')),'2026-10-21');assert.deepEqual(dailySpec('2026-10-20'),dailySpec('2026-10-20'));});
 it('sanitizes corrupted progress and computes actual streaks',()=>{assert.deepEqual(loadProgress('{'),emptyProgress());const b=makePuzzle('muzik',1,42),p=b.placements[0]!;const s=cleanSave({strokes:[{id:p.id,a:p.a,b:p.b},{id:p.id,a:p.a,b:p.b},{id:'fake',a:[99,0],b:[0,0]}],elapsed:Infinity,hints:99,stars:999,complete:true},b);assert.equal(s.strokes.length,1);assert.equal(s.hints,3);assert.equal(s.elapsed,0);assert.equal(s.complete,false);assert.equal(streak(['2026-10-18','2026-10-19'],'2026-10-20'),2);assert.equal(streak(['2026-10-18'],'2026-10-20'),0);assert.equal(streak(['2026-10-20','2026-10-19','2026-10-19'],'2026-10-20'),2);});
});
describe('original Hababam compatibility',()=>{
 it('retains the 20 original labels and byte-identical seeded board output',()=>{assert.equal(legacy.TOTAL_WORDS,20);assert.deepEqual(legacy.ROUNDS.map(r=>r.size),[10,11,10,13]);for(const [round,seed,expected] of [[0,42,'b8168cd187c5bfa0b10f632ca67ac2765e3c26aed175c2c491a3c5737d3fc373'],[1,99,'53a0d05d4ad514d3a76c5c813331868472d19bb3cff54e027f2548dae254a4b4'],[3,42,'effbebc23202c16522b217d6bec204170de26ac01aebbcde47c996d64a871dbe']] as const)assert.equal(createHash('sha256').update(JSON.stringify(legacy.generateBoard(round,seed))).digest('hex'),expected);});
 it('keeps every part valid across 1200 classic boards',()=>{for(let seed=1;seed<=300;seed++)for(let r=0;r<4;r++){const b=legacy.generateBoard(r,seed);assert.equal(b.placements.length,legacy.ROUNDS[r]!.words.flatMap(w=>w.parts).length);for(const p of b.placements){const cells=Array.from({length:p.len},(_,i)=>[p.r+p.dr*i,p.c+p.dc*i] as legacy.Cell);assert.equal(legacy.cellsText(b,cells),p.text);}}});
 it('round-trips v1 saves and both halves of split names',()=>{const s=legacy.freshState(99);s.round=2;s.found[2]=['0.0'];s.strokes[2]=[{id:'0.0',a:[0,0],b:[0,4]}];s.hints[2]=2;s.elapsed[2]=61;assert.deepEqual(legacy.validateSave(JSON.parse(JSON.stringify(s))),s);assert.equal(legacy.wordComplete(3,2,['2.0']),false);assert.equal(legacy.wordComplete(3,2,['2.0','2.1']),true);assert.equal(legacy.SAVE_KEY,'hababam-kelime-v1');});
});
