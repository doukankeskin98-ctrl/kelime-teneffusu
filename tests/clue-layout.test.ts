// Verifies the real WordList markup contract. This is not a browser/CSS pixel-layout test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {ALL_JOURNEYS,journeyBoard} from '../lib/game/content.ts';
import {wordCardCopy} from '../lib/game/word-card.ts';
import type {Target,Stroke} from '../lib/game/engine.ts';

type Node={type:unknown;props:Record<string,unknown>};
const compiled=ts.transpileModule(readFileSync('components/game/common.tsx','utf8'),
 {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const exports:Record<string,unknown>={};
const jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
vm.runInNewContext(compiled,{exports,require:(name:string)=>{
 if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'Fragment'};
 if(name==='@/lib/game/word-card')return {wordCardCopy};
 if(name==='./Board')return {strokeColor:()=> '#9ab37d'};
 return {};
}});
const render=exports['WordList'] as (props:{board:{targets:Target[]};strokes:Stroke[];golden?:string;clues?:Record<string,string>})=>Node;
function nodes(value:unknown):Node[]{
 if(Array.isArray(value))return value.flatMap(nodes);
 if(!value||typeof value!=='object')return [];
 const node=value as Node;return [node,...nodes(node.props?.['children'])];
}
function text(value:unknown):string{
 if(typeof value==='string'||typeof value==='number')return String(value);
 if(Array.isArray(value))return value.map(text).join('');
 return value&&typeof value==='object'?text((value as Node).props?.['children']):'';
}
const cards=(tree:Node)=>nodes(tree).filter(n=>n.props['role']==='listitem');
const face=(card:Node,name:string)=>{const n=nodes(card).find(n=>n.props['className']==='clue-face '+name);assert.ok(n,name);return n;};
function visibleText(value:unknown):string{
 if(typeof value==='string'||typeof value==='number')return String(value);
 if(Array.isArray(value))return value.map(visibleText).join('');
 if(!value||typeof value!=='object')return '';
 const n=value as Node,style=n.props['style'] as {visibility?:string}|undefined;
 if(n.props['aria-hidden']===true||style?.visibility==='hidden')return '';
 return visibleText(n.props['children']);
}

describe('clue reveal keeps the same intrinsic content footprint',()=>{
 it('retains both text faces and the clue card type before and after every authored clue answer',()=>{
  for(const journey of ALL_JOURNEYS.filter(j=>j.clues)){
   const board=journeyBoard(journey),before=cards(render({board,strokes:[],clues:journey.clues}));
   for(let i=0;i<board.targets.length;i++){
    const strokes=board.placements.slice(0,i+1),after=cards(render({board,strokes,clues:journey.clues}));
    assert.equal(before.length,after.length);
    for(let k=0;k<before.length;k++){
     const initial=before[k]!,current=after[k]!;
     assert(String(initial.props['className']).includes('clue-tag'));
     assert(String(current.props['className']).includes('clue-tag'),'found cards keep the same sizing rules');
     for(const name of ['clue-question','clue-answer'])
      assert.equal(text(face(initial,name)),text(face(current,name)),'both intrinsic text sizes remain in flow');
     const copy=nodes(current).find(n=>n.props['className']==='clue-copy');assert.ok(copy);
     assert.equal(nodes(copy).filter(n=>String(n.props['className']??'').startsWith('clue-face ')).length,2);
    }
   }
  }
 });
 it('exposes only the clue before discovery and only the answer after discovery',()=>{
  for(const journey of ALL_JOURNEYS.filter(j=>j.clues)){
   const board=journeyBoard(journey),before=cards(render({board,strokes:[],clues:journey.clues}));
   const after=cards(render({board,strokes:board.placements,clues:journey.clues}));
   for(let i=0;i<board.targets.length;i++){
    const target=board.targets[i]!,clue=journey.clues![target.text]!;
    assert.equal(before[i]!.props['aria-label'],clue+' · '+target.text.length+' harf aranıyor');
    assert.equal(visibleText(face(before[i]!,'clue-answer')),'');
    assert.equal(face(before[i]!,'clue-answer').props['aria-hidden'],true);
    assert.match(visibleText(before[i]!),new RegExp(clue.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.equal(after[i]!.props['aria-label'],target.label+' bulundu');
    assert.equal(visibleText(face(after[i]!,'clue-question')),'');
    assert.equal(face(after[i]!,'clue-question').props['aria-hidden'],true);
    assert.equal(visibleText(face(after[i]!,'clue-answer')),target.label);
   }
  }
 });
 it('reserves long question and answer text without removing either sizing face',()=>{
  const target:Target={id:'0.0',group:0,text:'KARTPOSTAL',label:'Çok uzun bir cevap adı'},clue='Uzak bir yere yapılan yolculuktan gönderilen resimli ve yazılı küçük hatıra';
  const board={targets:[target]},clues={[target.text]:clue};
  const before=cards(render({board,strokes:[],clues}))[0]!,after=cards(render({board,strokes:[{id:target.id,a:[0,0],b:[0,9]}],clues}))[0]!;
  for(const name of ['clue-question','clue-answer'])assert.equal(text(face(before,name)),text(face(after,name)));
  assert.equal(text(face(before,'clue-question')),clue+'10 harf');
  assert.equal(text(face(before,'clue-answer')),target.label);
 });
 it('preserves ordinary split words, partial completion and golden bonus presentation',()=>{
  const board={targets:[{id:'0.0',group:0,text:'AKİL',label:'AKİL HOCA'},{id:'0.1',group:0,text:'HOCA',label:'AKİL HOCA'}]},strokes:Stroke[]=[{id:'0.0',a:[0,0],b:[0,3]}];
  const card=cards(render({board,strokes,golden:'0.1'}))[0]!;
  assert.equal(card.props['aria-label'],'AKİL HOCA aranıyor');
  assert(!String(card.props['className']).includes('clue-tag'));
  assert(String(card.props['className']).includes('golden'));
  assert.equal(nodes(card).filter(n=>n.props['className']==='clue-copy').length,0);
  assert(nodes(card).some(n=>n.props['className']==='part-found'&&text(n)==='AKİL'));
  assert(text(card).includes('HOCA'));assert(text(card).includes('×2'));
 });
});
