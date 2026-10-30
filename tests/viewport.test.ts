import test from 'node:test';
import assert from 'node:assert/strict';
import {fittedBoardSize,fitGameFrame} from '../lib/game/viewport.ts';
test('normal phone board uses available height without exceeding its panel',()=>{
 assert.equal(fittedBoardSize(345,320,10),320);
 assert.equal(fittedBoardSize(345,480,10),345);
 assert.equal(fittedBoardSize(390,600,13),390);
});
test('short viewport and enlarged text preserve legible cells with natural overflow',()=>{
 assert.equal(fittedBoardSize(345,150,13),338);
 assert.equal(fittedBoardSize(240,100,13),240);
 assert.equal(fittedBoardSize(345,-10,6),156);
});
test('desktop board remains comfortably bounded; fractional sizes cannot overflow',()=>{
 assert.equal(fittedBoardSize(900,900,13),720);
 assert.equal(fittedBoardSize(344.8,301.7,10),301);
 assert.equal(fittedBoardSize(0,500,10),0);
});

test('measured frames fit small and large phone, tablet and desktop budgets; constrained text grows the frame instead of overlapping',()=>{
 // These are layout arithmetic checks, not browser pixel measurements.
 for(const [w,h,overhead,cells] of [[296,552,230,8],[336,624,240,8],[366,828,250,8],[406,916,250,8],[720,1000,180,13],[900,740,180,13]]){
  const result=fitGameFrame(w!,h!,overhead!,cells!);assert(result.minHeight<=h!);assert(result.boardSize+overhead!<=h!);assert(result.boardSize<=w!);assert(result.boardSize>=cells!*26);
 }
 for(const available of [0,100,176]){const result=fitGameFrame(345,500,500-available,13);assert.equal(result.boardSize,338);assert.equal(result.minHeight,500-available+338);assert(result.boardSize<=result.minHeight-(500-available));}
 const enlarged=fitGameFrame(296,552,410,13,660);assert.equal(enlarged.minHeight,706);assert.equal(enlarged.boardSize,296);
});

test('a stretched target panel does not pin an old screen height during rotate or browser chrome changes',()=>{for(const height of [900,600,900,420,900]){const result=fitGameFrame(450,height,150,8,150+240);assert.equal(result.minHeight,390);assert(result.boardSize+150<=height);}});


test('six viewport budgets keep long-text controls outside the board at normal,130% and200% text overhead',()=>{
 // Controlled geometry budgets, not screenshots or measurements of a real text renderer.
 for(const [width,height] of [[360,640],[375,667],[390,844],[430,932],[768,1024],[1024,1366]])for(const scale of [1,1.3,2]){
  const panel=width!-32,overhead=Math.ceil(270*scale),safeHeight=height!-48,fit=fitGameFrame(panel,safeHeight,overhead,8);
  assert(fit.boardSize<=panel);assert(fit.boardSize>=Math.min(panel,8*26));assert(fit.minHeight>=overhead+Math.min(panel,8*26));assert(fit.boardSize+overhead<=Math.max(fit.minHeight,safeHeight));
 }
});
