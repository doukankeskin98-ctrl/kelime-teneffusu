import assert from 'node:assert/strict';
import {test} from 'node:test';
import {layoutProblems} from '../scripts/visual/layout-measure.mjs';

const box=(left:number,top:number,width:number,height:number)=>({left,top,width,height,right:left+width,bottom:top+height,name:'hedef'});
const frame=()=>({width:320,height:568,scrollWidth:320,scrollHeight:568,board:box(10,200,300,300),rack:box(10,60,300,132),cell:30,words:[],targets:[box(10,60,80,44),box(10,104,90,44)],controls:[box(100,510,100,44)]});
test('accepts distinct 44px target rows and controls with a fully visible board',()=>assert.deepEqual(layoutProblems(frame()),[]));
test('rejects 44px buttons placed on 34px rows even when button-size checks pass',()=>{
 const sample=frame();sample.targets[1]=box(10,94,90,44);
 assert(layoutProblems(sample).some((s:string)=>s.startsWith('çakışan')));
});
test('rejects glyph clipping even if the word container remains inside its rack',()=>{
 const sample={...frame(),words:[{...box(270,60,40,24),letters:[box(270,60,20,24),box(300,60,20,24)]}]};
 assert(layoutProblems(sample).some((s:string)=>s.startsWith('kırpılan')));
});
test('rejects controls outside the viewport, missing controls and undersized touch areas',()=>{
 const sample=frame();sample.controls=[box(100,550,100,44)];
 assert(layoutProblems(sample).some((s:string)=>s.startsWith('düğme ekran dışında')));
 assert(layoutProblems({...frame(),controls:[]}).includes('oyun kontrolü bulunamadı'));
 sample.controls=[box(100,510,100,34)];
 assert(layoutProblems(sample).some((s:string)=>s.startsWith('küçük dokunma alanı')));
});

test('compact word selectors fit their 36px rows; primary controls still require 44px',()=>{
 const sample={...frame(),targets:[{...box(10,60,100,36),minTouchHeight:36},{...box(10,96,100,36),minTouchHeight:36}]};
 assert.deepEqual(layoutProblems(sample),[]);sample.controls=[box(10,510,100,36)];assert(layoutProblems(sample).some((s:string)=>s.startsWith('küçük dokunma')));
});
