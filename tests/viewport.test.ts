import test from 'node:test';
import assert from 'node:assert/strict';
import {fittedBoardSize} from '../lib/game/viewport.ts';
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
