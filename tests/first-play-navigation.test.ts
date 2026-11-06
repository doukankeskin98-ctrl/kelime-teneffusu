import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {needsFirstPlayGuide,firstPlayStep} from '../lib/game/first-play.ts';
import {emptyProgress,loadProgress,mergeProgress} from '../lib/game/progress.ts';
import {journeyById,journeyBoard} from '../lib/game/content.ts';
import {gameRoute,gameRouteUrl} from '../lib/game/navigation.ts';
describe('first play presentation preserves authored puzzle and progress',()=>{
 const board=journeyBoard(journeyById('uzay-1')!);
 it('teaches a straight word then a diagonal without constraining other valid choices',()=>{const original=JSON.stringify(board),one=firstPlayStep(board,[]);assert.equal(one.step,1);assert(one.target);assert(one.target.a[0]===one.target.b[0]||one.target.a[1]===one.target.b[1]);const two=firstPlayStep(board,[one.target]);assert.equal(two.step,2);assert(two.target);assert(two.target.a[0]!==two.target.b[0]&&two.target.a[1]!==two.target.b[1]);assert.equal(firstPlayStep(board,[two.target,one.target]).step,3);assert.equal(JSON.stringify(board),original);});
 it('does not reintroduce guidance to existing players or invent tutorial completion on skip',()=>{const fresh=emptyProgress();assert(needsFirstPlayGuide(fresh));const skipped=loadProgress(JSON.stringify({...fresh,guideDone:true}));assert.equal(skipped.tutorialDone,false);assert(!needsFirstPlayGuide(skipped));assert.deepEqual(skipped.saves,{});assert(mergeProgress(skipped,fresh).guideDone);for(const saved of [{strokes:[],elapsed:11,hints:0,complete:false,stars:0},{strokes:[board.placements[0]!],elapsed:0,hints:0,complete:false,stars:0}])assert(!needsFirstPlayGuide({...fresh,saves:{'route:uzay-1':saved}}));});
});
describe('arena route continuity',()=>{
 it('restores every section and its compatible invitation after refresh',()=>{for(const [section,param] of [['live','oda'],['friends','arkadas'],['challenge','meydan']] as const){const code=section==='live'?'ABCDEFGH':'ABCDEFGHJK',url=gameRouteUrl('https://example.test/?'+param+'='+code+'&keep=1#here','arena',section),parsed=gameRoute(new URL(url,'https://example.test').search);assert.equal(parsed.nav,'arena');assert.equal(parsed.section,section);assert(url.includes('keep=1'));assert(url.endsWith('#here'));}});
 it('drops stale invitations only when moving to another context',()=>{const url=gameRouteUrl('https://example.test/?sekme=arena&mod=meydan&meydan=ABCDEFGHJK&keep=1','profil');assert.equal(url,'/?sekme=profil&keep=1');const url2=gameRouteUrl('https://example.test/?oda=ABCDEFGH&arkadas=ABCDEFGHJK','arena','friends');assert(!url2.includes('oda='));assert.equal(gameRoute(new URL(url2,'https://example.test').search).invites.friend,'ABCDEFGHJK');});
});
