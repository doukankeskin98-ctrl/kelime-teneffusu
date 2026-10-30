import test from 'node:test';
import assert from 'node:assert/strict';
import {fittedBoardSize,fitGameFrame} from '../lib/game/viewport.ts';
test('normal phone board uses available height without exceeding its panel',()=>{
 assert.equal(fittedBoardSize(345,320,10),320);
 assert.equal(fittedBoardSize(345,480,10),345);
 assert.equal(fittedBoardSize(390,600,13),390);
});
test('short viewport and enlarged text preserve legible cells with natural overflow',()=>{
 assert.equal(fittedBoardSize(345,150,13),286);
 assert.equal(fittedBoardSize(240,100,13),240);
 assert.equal(fittedBoardSize(345,-10,6),132);
});
test('desktop board remains comfortably bounded; fractional sizes cannot overflow',()=>{
 assert.equal(fittedBoardSize(900,900,13),520);
 assert.equal(fittedBoardSize(344.8,301.7,10),301);
 assert.equal(fittedBoardSize(0,500,10),0);
});

test('measured frames fit small and large phone, tablet and desktop budgets; constrained text grows the frame instead of overlapping',()=>{
 // These are layout arithmetic checks, not browser pixel measurements.
 for(const [w,h,overhead,cells] of [[296,552,230,8],[336,624,240,8],[366,828,250,8],[406,916,250,8],[720,1000,180,13],[900,740,180,13]]){
  const result=fitGameFrame(w!,h!,overhead!,cells!);assert(result.minHeight<=h!);assert(result.boardSize+overhead!<=h!);assert(result.boardSize<=w!);assert(result.boardSize>=cells!*22);
 }
 for(const available of [0,100,176]){const result=fitGameFrame(345,500,500-available,13);assert.equal(result.boardSize,286);assert.equal(result.minHeight,500-available+286);assert(result.boardSize<=result.minHeight-(500-available));}
 const enlarged=fitGameFrame(296,552,410,13,660);assert.equal(enlarged.minHeight,696);assert.equal(enlarged.boardSize,286);
});

test('a stretched target panel does not pin an old screen height during rotate or browser chrome changes',()=>{for(const height of [900,600,900,420,900]){const result=fitGameFrame(450,height,150,8,150+240);assert.equal(result.minHeight,390);assert(result.boardSize+150<=height);}});
