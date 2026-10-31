import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import * as icons from 'lucide-react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as paper from '../lib/game/board-color.ts';
import {emptyProgress,loadProgress,mergeProgress,cleanSave} from '../lib/game/progress.ts';
import {TUTORIAL,journeyBoard,JOURNEYS} from '../lib/game/content.ts';
import {fittedBoardSize,fitGameFrame} from '../lib/game/viewport.ts';
import {groupPuzzle,groupRiddlePuzzle} from '../lib/game/group-content.ts';
import * as wordCard from '../lib/game/word-card.ts';
const source=(file:string)=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const component:Record<string,any>={};vm.runInNewContext(source('components/game/BoardColorSettings.tsx'),{exports:component,require:(name:string)=>name==='react/jsx-runtime'?jsx:name==='lucide-react'?icons:paper});
const flatten=(v:any):any[]=>Array.isArray(v)?v.flatMap(flatten):v&&typeof v==='object'?[v,...flatten(v.props?.children)]:[];
const luminance=(hex:string)=>{const c=hex.slice(1).match(/../g)!.map(n=>parseInt(n,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return c[0]!*.2126+c[1]!*.7152+c[2]!*.0722;};
const ratio=(a:string,b:string)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
describe('personal board paper and compatible persistence',()=>{
 it('offers four labeled preview choices, marks the current one and persists every click without touching saves',()=>{
  let value=emptyProgress();const original=journeyBoard(JOURNEYS[0]!);value.saves['route:'+JOURNEYS[0]!.id]=cleanSave({strokes:original.placements,hints:0,elapsed:9,complete:false,stars:0},original);
  const before=JSON.stringify(value.saves),store=new Map<string,string>();
  for(const option of paper.BOARD_COLORS){const tree=component['BoardColorSettings']({value:value.boardColor,onChange:(boardColor:paper.BoardColor)=>{value={...value,boardColor};store.set('alice',JSON.stringify(value));}}),buttons=flatten(tree).filter(n=>n.type==='button');assert.equal(buttons.length,4);assert.equal(buttons.filter(n=>n.props['aria-pressed']).length,1);
   const button=buttons.find(n=>n.key===option.id)!;assert(button);button.props.onClick();assert.equal(value.boardColor,option.id);assert.equal(loadProgress(store.get('alice')!).boardColor,option.id);assert.equal(JSON.stringify(value.saves),before);
   const html=renderToStaticMarkup(React.createElement(component['BoardColorSettings'],{value:value.boardColor,onChange(){}}));assert(html.includes('Tahta rengi'));assert(html.includes('Kahverengi'));assert.equal((html.match(/aria-pressed="true"/g)??[]).length,1);assert.equal((html.match(/board-color-preview/g)??[]).length,4);
  }
  assert.equal(loadProgress(store.get('bob')??null).boardColor,undefined);assert.notEqual(loadProgress(store.get('alice')!).boardColor,loadProgress(store.get('bob')??null).boardColor);
 });
 it('retains old v2 records, sanitizes unknown colors, keeps a remote choice for legacy input and allows explicit white',()=>{
  const old=emptyProgress();assert.deepEqual(loadProgress(JSON.stringify(old)),old);assert.equal(loadProgress(JSON.stringify({...old,boardColor:'red'})).boardColor,undefined);
  const server={...old,boardColor:'walnut' as const};assert.equal(loadProgress(JSON.stringify(server)).boardColor,'walnut');assert.equal(mergeProgress(server,old).boardColor,'walnut');assert.equal(mergeProgress(server,{...old,boardColor:'white'}).boardColor,'white');
  assert.deepEqual(old.saves,mergeProgress(server,old).saves);assert.equal(paper.boardColor({id:'walnut'}),undefined);
 });
 it('meets numeric text contrast on every paper and collectible fill; custom-paper outlines stand out',()=>{
  const css=readFileSync('app/studio.css','utf8'),fills=[...css.matchAll(/--word-\d+:(#[a-f0-9]{6})/g)].map(m=>m[1]!);
  assert(fills.length>=24);for(const fill of fills)assert(ratio('#17382c',fill)>=4.5,fill);
  for(const c of paper.BOARD_COLORS){assert(ratio('#17382c',c.paper)>=4.5,c.id);if(c.id!=='white')assert(ratio('#244c3e',c.paper)>=3,c.id);}
 });
});
describe('nine targets beside a readable large board',()=>{
 it('renders all nine normal words or full clues, never split-word inflation or hidden answers',()=>{
  const common:Record<string,any>={};vm.runInNewContext(source('components/game/common.tsx'),{exports:common,require:(name:string)=>name==='react'?React:name==='react/jsx-runtime'?jsx:name==='lucide-react'?icons:name==='@/lib/game/word-card'?wordCard:name==='./Board'?{strokeColor:()=> '#94bfaa'}:{}});
  for(const clue of [false,true]){const riddle=clue?groupRiddlePuzzle(0)!:null,candidate=riddle??groupPuzzle(0)!;const html=renderToStaticMarkup(React.createElement(common['WordList'],{board:candidate.board,strokes:[],clues:riddle?.clues}));assert.equal((html.match(/role="listitem"/g)??[]).length,7);if(riddle){for(const clue of Object.values(riddle.clues))assert(html.includes(clue));}else for(const target of candidate.board.targets)assert(html.includes(target.text));}
 });
 it('keeps the twelve-row board legible in small/large phone and tablet budgets, expanding instead of clipping',()=>{
  for(const [width,height] of [[360,640],[375,667],[390,844],[430,932],[768,1024],[1024,1366]])for(const text of [1,1.3,2]){
   const available=width!-36,overhead=(240+160)*text,result=fitGameFrame(available,height!-28,overhead,12);
   assert(result.boardSize>=Math.min(available,312));assert(result.boardSize<=available);assert(result.minHeight>=overhead+Math.min(available,312));assert.equal(fittedBoardSize(available,20,12),Math.min(available,312));
  }
 });
});
