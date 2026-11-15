import assert from 'node:assert/strict';
import {it} from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as achievement from '../lib/game/achievement-view.ts';
import * as main from '../lib/game/main-journey.ts';
import * as worlds from '../lib/game/world-presentation.ts';
import * as engine from '../lib/game/engine.ts';
import {journeyBoard} from '../lib/game/content.ts';
import {emptyProgress,cleanSave} from '../lib/game/progress.ts';
import * as activity from '../lib/platform/activity.ts';

function harness({reduced=false,hidden=false,fresh=true}={}){
 const doc=Object.assign(new EventTarget(),{hidden,documentElement:{dataset:{reduceMotion:'false'}}});
 const media=Object.assign(new EventTarget(),{matches:reduced});
 const win=Object.assign(new EventTarget(),{matchMedia:()=>media});
 let active=true,cancels=0,disconnects=0,preference=()=>{};
 const sequences:unknown[][]=[];
 const elements={star:{name:'star'},portrait:{name:'portrait'},piece:{name:'piece'},stamp:{name:'stamp'},caption:{name:'caption'}};
 const root={querySelectorAll:()=>[elements.star],querySelector:(s:string)=>s.includes('art')?elements.portrait:s.includes('just-earned')?fresh?elements.piece:null:s.includes('count')?elements.stamp:elements.caption};
 const exports:Record<string,(root:unknown)=>()=>void>={};
 const source=ts.transpileModule(readFileSync('lib/game/result-motion.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports,document:doc,window:win,MutationObserver:class{constructor(fn:()=>void){preference=fn;}observe(){}disconnect(){disconnects++;}},require:(n:string)=>n==='motion'?{animate:(sequence:unknown[])=>{sequences.push(sequence);return{cancel(){cancels++;}};}}:n.includes('activity')?activity:{gameIsActive:()=>active}});
 const cleanup=exports['playResultSequence']!(root);
 return{doc,win,media,sequences,elements,cleanup,get cancels(){return cancels;},get disconnects(){return disconnects;},reduce(){doc.documentElement.dataset.reduceMotion='true';preference();},background(){active=false;win.dispatchEvent(new Event('kt-app-resume'));}};
}

it('result presentation has one timeline, earned segment follows the real world and replay creates no new piece',()=>{
 for(const fresh of [true,false]){
  const h=harness({fresh});assert.equal(h.sequences.length,1);
  const sequence=h.sequences[0] as [unknown,unknown,{at:number;duration:number}][];
  const portrait=sequence.find(s=>s[0]===h.elements.portrait)!;
  const piece=sequence.find(s=>s[0]===h.elements.piece);
  assert.equal(!!piece,fresh);if(piece)assert(piece[2].at>portrait[2].at);
  assert(Math.max(...sequence.map(s=>s[2].at+s[2].duration))<1);
  h.cleanup();assert.equal(h.cancels,1);assert.equal(h.disconnects,1);
 }
});
it('reduced motion or a background mount never starts an animation',()=>{
 for(const options of [{reduced:true},{hidden:true}]){const h=harness(options);assert.equal(h.sequences.length,0);h.cleanup();assert.equal(h.cancels,0);}
});
it('background, native inactivity, blur, and changed motion preference cancel without replay on return',()=>{
 for(const event of ['hidden','native','blur','system','preference']){
  const h=harness();
  if(event==='hidden'){h.doc.hidden=true;h.doc.dispatchEvent(new Event('visibilitychange'));}
  if(event==='native')h.background();
  if(event==='blur')h.win.dispatchEvent(new Event('blur'));
  if(event==='system'){h.media.matches=true;h.media.dispatchEvent(new Event('change'));}
  if(event==='preference')h.reduce();
  assert.equal(h.cancels,1,event);h.doc.hidden=false;h.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(h.sequences.length,1);
  h.cleanup();const count=h.cancels;h.win.dispatchEvent(new Event('blur'));h.media.dispatchEvent(new Event('change'));h.doc.hidden=true;h.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(h.cancels,count);
 }
});

it('actual result view shows saved stars and six earned segments; replay never claims a new piece',()=>{
 const value=emptyProgress();const chapter=main.MAIN_JOURNEY[0]!.chapter,board=journeyBoard(chapter);
 const before=achievement.journeyGoal(value,chapter.id)!;
 value.saves['route:'+chapter.id]=cleanSave({strokes:board.placements,hints:1,elapsed:90,stars:0,complete:false},board);
 const save=value.saves['route:'+chapter.id]!,after=achievement.journeyGoal(value,chapter.id)!;
 type Node={type:unknown;props:Record<string,unknown>};const nodes=(n:unknown):Node[]=>{if(Array.isArray(n))return n.flatMap(nodes);if(!n||typeof n!=='object'||!('props' in n))return [];const node=n as Node;return [node,...nodes(node.props?.['children'])];};
 const exports:Record<string,(props:unknown)=>Node>={};const jsx=(type:unknown,props:Node['props'])=>({type,props});
 const modules:Record<string,unknown>={'react':{useRef:()=>({current:null}),useLayoutEffect:()=>{}},'react/jsx-runtime':{jsx,jsxs:jsx},'lucide-react':{Star:'Star',Check:'Check'},'@/lib/game/achievement-view':achievement,'@/lib/game/main-journey':main,'@/lib/game/world-presentation':worlds,'@/lib/game/engine':engine,'./SceneArt':{SceneArt:'SceneArt'},'@/lib/game/result-motion':{playResultSequence(){throw Error('SSR must not animate');}}};
 vm.runInNewContext(ts.transpileModule(readFileSync('components/game/JourneyResult.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:(n:string)=>modules[n]});
 for(const fresh of [true,false]){
  const tree=exports['JourneyResult']!({before,after,save,rewards:fresh?[{id:`piece:${after.state.expedition.id}:${after.position}`,kind:'piece'}]:[]}),all=nodes(tree);
  assert.equal(all.filter(n=>n.props?.['className']==='result-star earned').length,save.stars);
  assert.equal(all.filter(n=>String(n.props?.['className']).startsWith('world-piece')).length,6);
  assert.equal(all.filter(n=>String(n.props?.['className']).includes('just-earned')).length,fresh?1:0);
  assert(all.some(n=>n.props?.['aria-label']===`${after.state.album.title}: 1 / 6 albüm parçası`));
  assert.equal(nodes(all.find(n=>n.type==='details')).filter(n=>n.type==='summary').length,1);
  const opened=nodes(exports['JourneyResult']!({before,after,save,rewards:[{kind:'world',id:'world:anadolu',title:'Anadolu Patikası'}]}));
  assert(opened.some(n=>n.props?.['className']==='result-unlock-notice'));
  assert(!all.some(n=>n.props?.['className']==='result-unlock-notice'));
 }
});
