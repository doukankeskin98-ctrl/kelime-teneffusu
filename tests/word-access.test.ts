import * as activity from '../lib/platform/activity.ts';
import * as journeyFlow from '../lib/game/journey-flow.ts';
import * as challengeState from '../lib/game/challenge-state.ts';
import * as firstPlay from '../lib/game/first-play.ts';
import * as navigation from '../lib/game/navigation.ts';
import * as wordFeedback from '../lib/game/word-feedback.ts';
import * as everydayContent from '../lib/game/everyday-content.ts';
import * as nature from '../lib/game/nature-content.ts';
import * as coast from '../lib/game/coast-content.ts';
import * as worldPresentation from '../lib/game/world-presentation.ts';
import * as scenePresentation from '../lib/game/scene.ts';
import * as boardPresentation from '../lib/game/board-view.ts';
import * as stories from '../lib/game/story-content.ts';
import * as riddles from '../lib/game/riddle-content.ts';
import * as legacyUI from '../lib/game/legacy-ui.ts';
import * as mainJourney from '../lib/game/main-journey.ts';
import * as achievementView from '../lib/game/achievement-view.ts';
import * as goalWordCard from '../lib/game/word-card.ts';
// Actual shared/caller component bodies with controlled hooks and clocks.
// Not DOM, native focus/scroll, physical phone, concurrent React or FPS evidence.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as legacy from '../lib/game/legacy.ts';
import * as content from '../lib/game/content.ts';
import * as engine from '../lib/game/engine.ts';
import * as progress from '../lib/game/progress.ts';
import * as discovery from '../lib/game/discovery.ts';
import * as wordCard from '../lib/game/word-card.ts';
import * as sprint from '../lib/game/sprint.ts';
import {fittedBoardSize,fitGameFrame} from '../lib/game/viewport.ts';
type Node={type:any;props:Record<string,any>;key?:unknown};
type Slot={value?:any;ref?:{current:any};deps?:unknown[];cleanup?:()=>void};
const walk=(v:any):Node[]=>Array.isArray(v)?v.flatMap(walk):v&&typeof v==='object'?[v,...['children','aside','footer','headerAction'].flatMap(k=>walk(v.props?.[k]))]:[];
const text=(v:any):string=>typeof v==='string'||typeof v==='number'?String(v):Array.isArray(v)?v.map(text).join(''):v&&typeof v==='object'?text(v.props?.['children']):'';
const visible=(v:any):string=>typeof v==='string'||typeof v==='number'?String(v):Array.isArray(v)?v.map(visible).join(''):v&&typeof v==='object'&&v.props?.['aria-hidden']!==true&&v.props?.['style']?.visibility!=='hidden'?visible(v.props?.['children']):'';
const jsx=(type:any,props:Record<string,unknown>,key?:unknown):any=>typeof type==='function'&&type.name==='GameToolsSheet'?type(props):({type,props,key}),icons=new Proxy({},{get:(_t,k)=>String(k)});
function deferred<T>(){let resolve!:(r:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
function view(file:string,modules:Record<string,unknown>={},seedFirst?:unknown,storageValues?:Map<string,string>){
 const exports:Record<string,any>={},slots:Slot[]=[],effects:(()=>void)[]=[],intervals=new Map<number,()=>void>(),timeouts=new Map<number,()=>void>(),frames=new Map<number,()=>void>(),document=Object.assign(new EventTarget(),{hidden:false,documentElement:{dataset:{}},body:{style:{overflow:''}}});
 let cursor=0,id=0,dirty=true,tree:any,render:()=>any,now=10000;
 const changed=(s:Slot,d:unknown[])=>!s.deps||s.deps.length!==d.length||d.some((v,i)=>!Object.is(v,s.deps![i]));
 const hooks={useState(initial:any){const i=cursor++,s=slots[i]??={value:i===0&&seedFirst!==undefined?seedFirst:typeof initial==='function'?initial():initial};return[s.value,(n:any)=>{const v=typeof n==='function'?n(s.value):n;if(!Object.is(v,s.value)){s.value=v;dirty=true;}}];},useRef(initial:any){return(slots[cursor++]??={}).ref??={current:initial};},useId(){return(slots[cursor++]??={value:'id-'+(++id)}).value;},useMemo(fn:()=>any,deps:unknown[]){const s=slots[cursor++]??={};if(changed(s,deps)){s.deps=deps;s.value=fn();}return s.value;},useEffect(fn:()=>void|(()=>void),deps:unknown[]){const s=slots[cursor++]??={};if(changed(s,deps)){s.deps=deps;effects.push(()=>{s.cleanup?.();const clean=fn();s.cleanup=typeof clean==='function'?clean:undefined;});}},useReducer(reducer:any,arg:any,init:any){const [v,set]=hooks.useState(()=>init(arg));return[v,(event:any)=>set((s:any)=>reducer(s,event))];}};
 class Clock extends Date{static override now(){return now;}}
 const source=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText+(file.endsWith('Sprint.tsx')?'\nexports.__SprintRun=SprintRun;':'');
 const context:vm.Context={exports,require:(name:string)=>name==='@/lib/game/journey-flow'?journeyFlow:name==='@/lib/game/first-play'?firstPlay:name==='@/lib/game/navigation'?navigation:name==='./FirstPlayGuide'?{FirstPlayGuide:'FirstPlayGuide'}:name==='@/lib/game/nature-content'?nature:name==='@/lib/game/coast-content'?coast:name==='@/lib/game/world-presentation'?worldPresentation:name==='@/lib/game/scene'?scenePresentation:name==='@/lib/game/board-view'?boardPresentation:name==='@/lib/game/story-content'?stories:name==='@/lib/game/riddle-content'?riddles:name==='@/lib/game/everyday-content'?everydayContent:name==='react'?hooks:name==='react/jsx-runtime'?{jsx,jsxs:jsx,Fragment:'Fragment'}:name==='lucide-react'?icons:name==='@/lib/game/legacy-ui'?legacyUI:name==='@/lib/game/word-card'?wordCard:name==='@/lib/game/viewport'?{fittedBoardSize,fitGameFrame}:name==='./Board'?{Board:'Board',strokeColor:()=> '#9ab37d'}:modules[name]??new Proxy({},{get:(_t,k)=>String(k)}),window:Object.assign(new EventTarget(),{innerHeight:640,getComputedStyle:()=>({getPropertyValue:()=>"0px"}),matchMedia:()=>({matches:false}),scrollTo(){}}),document,navigator:{onLine:true},localStorage:{getItem:(key:string)=>storageValues?.get(key)??null,setItem:(key:string,value:string)=>storageValues?.set(key,value)},location:{search:'',href:'https://test/',origin:'https://test'},history:{replaceState(){}},Date:Clock,Error,Event,URL,URLSearchParams,AbortController,crypto,performance:{now:()=>now},setTimeout:(fn:()=>void)=>{timeouts.set(++id,fn);return id;},clearTimeout:(i:number)=>timeouts.delete(i),setInterval:(fn:()=>void)=>{intervals.set(++id,fn);return id;},clearInterval:(i:number)=>intervals.delete(i),requestAnimationFrame:(fn:()=>void)=>{frames.set(++id,fn);return id;},cancelAnimationFrame:(i:number)=>frames.delete(i)};
 const resultHook:Record<string,unknown>={};vm.runInNewContext(ts.transpileModule(readFileSync('components/game/useResultPresentation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{...context,exports:resultHook,require:(n:string)=>n==='react'?hooks:n==='@/lib/platform/runtime'?{gameIsActive:()=>true}:wordFeedback});modules['./useResultPresentation']=resultHook;vm.runInNewContext(source,context);
 const paint=(commit=true)=>{for(let i=0;(dirty||(commit&&effects.length))&&i<50;i++){if(dirty){dirty=false;cursor=0;tree=render();}if(commit)while(effects.length)effects.shift()!();}return tree;};
 return{exports,document,slots,frames,start(name:string,props:any,commit=true){render=()=>exports[name](props);return paint(commit);},paint,update(name:string,props:any){render=()=>exports[name](props);dirty=true;return paint();},find(type:string){const n=walk(tree).find(n=>n.type===type||typeof n.type==='function'&&n.type.name===type);assert.ok(n,type);return n;},async settle(){for(let i=0;i<30;i++){await Promise.resolve();paint();}},time(value:number,repaint=true){now=value;for(const fn of [...intervals.values()])fn();if(repaint)paint();},expire(){const f=[...timeouts.values()];timeouts.clear();for(const fn of f)fn();paint();},frame(){const f=[...frames.values()];frames.clear();for(const fn of f)fn();paint();},get tree(){return tree;},close(){for(const s of slots)s.cleanup?.();frames.clear();intervals.clear();timeouts.clear();}};
}
function familiarProgress():progress.Progress{return {...progress.emptyProgress(),mechanicGuides:['riddle','concealed']};}
const base={title:'Keşif',kicker:'KELİMELER',onBack(){},board:content.TUTORIAL,strokes:[],paused:false,zoom:false,onCommit(){},preview:'',onPreview(){},children:null,aside:null,footer:null};
function shared(props:any){const h=view('components/game/common.tsx');h.start('PlayLayout',{...base,...props});return h;}

describe('rotated live layout keeps the original puzzle authoritative',()=>{
 it('maps displayed ink, hint and selection back to the original board without changing targets',()=>{
  const puzzle=content.TUTORIAL,stroke=puzzle.placements[0]!,commits:engine.Cell[][]=[],words={board:puzzle,strokes:[stroke]};
  const props={...base,turned:true,wordList:words,strokes:[stroke],hint:stroke.a,hintEnd:stroke.b,demonstration:{a:stroke.a,b:stroke.b},onCommit:(a:engine.Cell,b:engine.Cell)=>commits.push([a,b])},h=shared(props);
  try{
   const display=h.find('Board'),map=(c:engine.Cell)=>boardPresentation.viewCell(c,puzzle.size,true);
   assert.deepEqual(display.props['board'].grid,boardPresentation.boardView(puzzle,true).grid);
   assert.deepEqual(display.props['hint'],map(stroke.a));assert.deepEqual(display.props['hintEnd'],map(stroke.b));assert.deepEqual(display.props['strokes'][0].a,map(stroke.a));
   assert.deepEqual(display.props['demonstration'].a,map(stroke.a));assert.deepEqual(display.props['demonstration'].b,map(stroke.b));
   assert.equal(h.find('WordList').props['board'],puzzle);
   display.props['onCommit'](map(stroke.a),map(stroke.b));assert.deepEqual(commits,[[stroke.a,stroke.b]]);
   const rotatedKey=display.key;h.update('PlayLayout',{...props,turned:false});assert.notEqual(h.find('Board').key,rotatedKey);assert.equal(h.find('Board').props['board'],puzzle);
  }finally{h.close();}
 });
 it('remounts a symmetric board when direction changes so pending gestures cannot survive',()=>{
  const puzzle={...content.TUTORIAL,grid:Array.from({length:6},()=>Array(6).fill('A'))},h=shared({board:puzzle});
  try{const key=h.find('Board').key;h.update('PlayLayout',{...base,board:puzzle,turned:true});assert.notEqual(h.find('Board').key,key);}finally{h.close();}
 });
});
function openWords(words:any){const h=view('components/game/common.tsx');h.start('BoardWords',{words});h.find('button').props['onClick']();h.paint();return h;}
const commonStubs={PlayLayout:'PlayLayout',PlayControls:'PlayControls',MatchTools:'MatchTools',WordList:'WordList',Modal:'Modal',Help:'Help',useChime:()=>()=>{}};
const modules={'@/lib/game/challenge-state':challengeState,'@/lib/platform/activity':activity,'@/lib/platform/runtime':{gameIsActive:()=>true},'@/lib/game/catalog':await import('../lib/game/catalog.ts'),'@/lib/game/content':content,'@/lib/game/engine':engine,'@/lib/game/progress':progress,'@/lib/game/achievement-view':achievementView,'@/lib/game/word-feedback':wordFeedback,'@/lib/game/word-card':goalWordCard,'@/lib/game/discovery':discovery,'@/lib/game/sprint':sprint,'@/lib/game/main-journey':mainJourney,'@/lib/game/telemetry':{track(){}}};

describe('near-board word access uses confirmed, visible list data',()=>{
 it('defaults an enlarged board to drawing and offers explicit reversible panning outside the board',()=>{
  const h=shared({zoom:true,wordList:{board:content.TUTORIAL,strokes:[]}});try{
   assert.equal(h.find('Board').props['pan'],false);const move=walk(h.tree).find(n=>n.type==='button'&&text(n)==='Tahtayı kaydır')!;assert(move);move.props['onClick']();h.paint();assert.equal(h.find('Board').props['pan'],true);
   const select=walk(h.tree).find(n=>n.type==='button'&&text(n)==='Kelime seç')!;select.props['onClick']();h.paint();assert.equal(h.find('Board').props['pan'],false);
   move.props['onClick']();h.paint();const next=engine.makePuzzle('uzay',0,123);h.update('PlayLayout',{...base,zoom:true,board:next});assert.equal(h.find('Board').props['pan'],false);
  }finally{h.close();}
 });
 it('keeps one complete confirmed target surface directly visible in normal play',()=>{const words={board:content.TUTORIAL,strokes:[]},h=shared({wordList:words});try{assert.equal(walk(h.tree).filter(n=>typeof n.type==='function'&&n.type.name==='WordList').length,1);assert.equal(h.find('WordList').props['board'],words.board);assert.equal(walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='BoardWords'),false);}finally{h.close();}});
 it('does not offer an empty word dialog',()=>{
  const h=view('components/game/common.tsx');try{h.start('BoardWords',{words:{board:{targets:[]},strokes:[]}});assert.equal(h.tree,null);}finally{h.close();}
 });
 it('counts groups only after every split part is found and ignores unrelated/duplicate strokes',()=>{
  const targets=[{id:'a',text:'AKİL',label:'AKİL HOCA',group:0},{id:'b',text:'HOCA',label:'AKİL HOCA',group:0},{id:'c',text:'SOBA',label:'SOBA',group:1}],stroke=(id:string):engine.Stroke=>({id,a:[0,0],b:[0,3]});
  assert.deepEqual(wordCard.wordListProgress({targets},[stroke('a'),stroke('a'),stroke('unknown')]),{total:2,complete:0,remaining:2});assert.deepEqual(wordCard.wordListProgress({targets},[stroke('a'),stroke('b')]),{total:2,complete:1,remaining:1});
 });
 it('keeps the original Board props and puts one access control outside the board stage',()=>{
  const confirmed:engine.Stroke[]=[],pending=[content.TUTORIAL.placements[0]!],words={board:content.TUTORIAL,strokes:confirmed},h=shared({wordList:words,strokes:pending,zoom:true});try{
   const access=h.find('BoardWords'),board=h.find('Board'),stage=walk(h.tree).find(n=>n.props['className']==='board-stage')!;assert.equal(access.props['words'],words);assert.equal(board.props['strokes'],pending);assert.equal(board.props['zoom'],true);assert.equal(walk(stage).some(n=>typeof n.type==='function'&&n.type.name==='BoardWords'),false);assert.equal(wordCard.wordListProgress(words.board,words.strokes).complete,0);
   const oldKey=access.key;h.update('PlayLayout',{...base,wordList:words,strokes:pending,zoom:true});assert.equal(h.find('BoardWords').key,oldKey);h.update('PlayLayout',{...base,zoom:true,wordList:words,wordListKey:'another-room'});assert.equal(h.find('BoardWords').key,'another-room');const next=engine.makePuzzle('uzay',0,123);h.update('PlayLayout',{...base,zoom:true,board:next,wordList:{board:next,strokes:[]}});assert.notEqual(h.find('BoardWords').key,oldKey);assert.equal(h.find('Board').props['board'],next);
  }finally{h.close();}
 });
 it('removes word access during paused, completed, input-blocked and overlay states',()=>{
  for(const flag of ['paused','readOnly','inputBlocked','wordListUnavailable']){const h=shared({zoom:true,wordList:{board:content.TUTORIAL,strokes:[]},[flag]:true});try{assert.equal(walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='BoardWords'),false);}finally{h.close();}}
 });
 it('opens read-only words, updates live data and requests focus return with preventScroll',()=>{
  const h=view('components/game/common.tsx'),board=content.TUTORIAL,words={board,strokes:[] as engine.Stroke[]};try{
   h.start('BoardWords',{words});const opener=h.find('button'),focus:any[]=[],button={isConnected:true,focus:(opts:unknown)=>focus.push(opts)};opener.props['ref'].current=button;assert.equal(opener.props['type'],'button');assert.equal(opener.props['aria-haspopup'],'dialog');assert.equal(opener.props['aria-expanded'],false);
   opener.props['onClick']();h.paint();assert.equal(h.find('button').props['aria-expanded'],true);const dialog=h.find('Modal');assert.equal(dialog.props['title'],'Kelime listen');assert.equal(h.find('WordList').props['strokes'],words.strokes);assert.match(text(dialog),/Buldukların işaretli/);
   const updated={board,strokes:[board.placements[0]!],golden:board.targets[1]!.id};h.update('BoardWords',{words:updated});assert.equal(h.find('WordList').props['golden'],updated.golden);assert.equal(h.find('WordList').props['strokes'],updated.strokes);assert.equal(h.find('button').props['aria-expanded'],true);
   h.find('Modal').props['onClose']();h.paint();assert.equal(walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='Modal'),false);h.frame();assert.equal(focus.length,1);assert.equal(focus[0].preventScroll,true);
  }finally{h.close();}
 });
 it('cancels delayed focus on unmount and never focuses a detached opener',()=>{
  const h=view('components/game/common.tsx');h.start('BoardWords',{words:{board:content.TUTORIAL,strokes:[]}});const opener=h.find('button');let focus=0;opener.props['ref'].current={isConnected:false,focus:()=>focus++};opener.props['onClick']();h.paint();h.find('Modal').props['onClose']();h.paint();h.frame();assert.equal(focus,0);opener.props['onClick']();h.paint();h.find('Modal').props['onClose']();assert.ok(h.frames.size);h.close();assert.equal(h.frames.size,0);
 });
 it('keeps clue answers hidden in the actual list used by the dialog until confirmed',()=>{
  const route=content.ALL_JOURNEYS.find(j=>j.clues)!,board=content.journeyBoard(route),words={board,strokes:[] as engine.Stroke[],clues:route.clues},h=view('components/game/common.tsx');try{
   h.start('BoardWords',{words});h.find('button').props['onClick']();h.paint();assert.equal(h.find('Modal').props['title'],'Tanım listen');const props=h.find('WordList').props;const before=h.exports['WordList'](props);assert.equal(walk(before).find(n=>n.props['role']==='listitem')!.props['aria-label'],route.clues![board.targets[0]!.text]+' · '+board.targets[0]!.text.length+' harf aranıyor');assert.equal(walk(before).some(n=>n.props['className']==='clue-face clue-answer'&&visible(n)!==''),false);
   h.update('BoardWords',{words:{...words,strokes:board.placements}});const after=h.exports['WordList'](h.find('WordList').props);assert.ok(walk(after).some(n=>n.props['className']==='clue-face clue-answer'&&visible(n)===board.targets[0]!.label));
  }finally{h.close();}
 });
 it('routes X, Escape and backdrop to the same native Modal close callback',()=>{
  const h=view('components/game/common.tsx');let closed=0;const dialog=Object.assign(new EventTarget(),{ownerDocument:h.document,style:{maxHeight:''},removeAttribute(){},open:false,showModal(){this.open=true;},close(){this.open=false;},getBoundingClientRect:()=>({left:20,right:200,top:20,bottom:200})});h.start('Modal',{title:'Kelime listen',onClose:()=>closed++,children:null},false);h.find('dialog').props['ref'].current=dialog;h.paint();assert.equal(dialog.open,true);assert.equal(h.document.body.style.overflow,'hidden');
  const node=h.find('dialog');let prevented=false;node.props['onCancel']({preventDefault:()=>prevented=true});assert.equal(prevented,true);h.find('button').props['onClick']();node.props['onClick']({target:dialog,currentTarget:dialog,clientX:0,clientY:0});node.props['onClick']({target:dialog,currentTarget:dialog,clientX:100,clientY:100});assert.equal(closed,3);h.close();assert.equal(dialog.open,false);assert.equal(h.document.body.style.overflow,'');
 });
});

it('shows real room-series wins, honest empty state and paginated departed participants',()=>{
 const h=view('components/game/Arena.tsx'),players=Array.from({length:26},(_,i)=>({id:'p'+i,name:'Oyuncu '+i,played:3,wins:26-i,draws:0,score:100,rank:i+1,active:i!==25}));
 try{
  h.start('ArenaSeriesBoard',{series:{rounds:3,players},you:'p25',expanded:true});assert.match(text(h.tree),/3 kayıtlı maç · Sen 1 galibiyet/);
  const next=()=>walk(h.tree).find(n=>n.type==='button'&&text(n)==='Sonraki')!;next().props['onClick']();h.paint();next().props['onClick']();h.paint();assert.match(text(h.tree),/Oyuncu 25/);assert.match(text(h.tree),/Odadan ayrıldı/);assert.equal(next().props['disabled'],true);
  h.update('ArenaSeriesBoard',{series:{rounds:0,players:[]},you:'new'});assert.match(text(h.tree),/İlk tamamlanan maçtan sonra/);
 }finally{h.close();}
});

describe('caller wiring keeps timers, hidden targets and pending claims separate',()=>{
 it('uses only confirmed Arena strokes and the live golden marker while the clock continues',async()=>{
  const board=content.TUTORIAL,claim=deferred<any>(),room={id:'room-1',round:1,revision:1,phase:'active',themeId:'uzay',serverNow:10000,starts:9000,ends:129000,you:{id:'alice',name:'Alice',score:0,strokes:[],rematch:false},opponent:{name:'Bob',score:0,count:0,online:true},board};
  const h=view('components/game/Arena.tsx',{...modules,'./common':{...commonStubs,getApi:async()=>room,api:async()=>claim.promise},'./useLiveRoom':{useLiveRoom:()=> 'connected'}});try{
   h.start('Arena',{authenticated:true,progress:familiarProgress(),onProgress(){},onLogin(){},practice(){}});await h.settle();const layout=h.find('PlayLayout');assert.equal(layout.props['wordList'].strokes,room.you.strokes);assert.equal(layout.props['wordList'].golden,engine.goldenId(board.targets,9000,10000));const p=board.placements[0]!;layout.props['onCommit'](p.a,p.b);await h.settle();assert.equal(h.find('PlayLayout').props['strokes'].length,1);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,0);
   const sheet=openWords(h.find('PlayLayout').props['wordList']);const before=h.find('CompetitionHud').props['seconds'];h.time(12000);assert.notEqual(h.find('CompetitionHud').props['seconds'],before);assert.equal(sheet.find('WordList').props['strokes'].length,0);sheet.find('Modal').props['onClose']();sheet.paint();sheet.close();const controls=h.find('PlayLayout').props['headerAction'];walk(controls).find(n=>n.type==='MatchTools')!.props['onHelp']();h.paint();assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);
  }finally{h.close();}
 });
 it('uses confirmed Challenge strokes and blocks the word popup for exit and result',async()=>{
  const board=content.TUTORIAL,viewState={id:'challenge-1',code:'ABCDEFGHJK',themeId:'uzay',board,strokes:[],starts:9000,serverNow:10000,finished:null,duration:0,ghost:null,results:[]},claim=deferred<any>();
  const h=view('components/game/Challenges.tsx',{...modules,'./common':{...commonStubs,getSocial:async()=>({challenges:[],friends:[]}),socialApi:async()=>claim.promise}},viewState);try{
   h.start('Challenges',{authenticated:true,progress:familiarProgress(),onProgress(){},onLogin(){},inviteCode:''});await h.settle();const p=board.placements[0]!;h.find('PlayLayout').props['onCommit'](p.a,p.b);await h.settle();assert.equal(h.find('PlayLayout').props['strokes'].length,1);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,0);assert.equal(h.find('PlayLayout').props['wordListKey'],'challenge-1');const sheet=openWords(h.find('PlayLayout').props['wordList']),before=h.find('CompetitionHud').props['seconds'];h.time(12000);assert.notEqual(h.find('CompetitionHud').props['seconds'],before);sheet.find('Modal').props['onClose']();sheet.paint();sheet.close();h.find('PlayLayout').props['onBack']();h.paint();assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);walk(h.find('Modal').props['children']).find(n=>n.type==='button'&&text(n)==='Oyuna dön')!.props['onClick']();h.paint();assert.equal(h.find('PlayLayout').props['wordListUnavailable'],false);claim.resolve({...viewState,strokes:board.placements,finished:12000,duration:3000});await h.settle();assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);
  }finally{h.close();}
 });
 it('preserves Solo clue data and existing time/hints while the separate word view is open',()=>{
  const route=content.ALL_JOURNEYS.find(j=>j.clues)!,writes:progress.Progress[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{
   h.start('Solo',{config:{themeId:route.themeId,level:0,journey:route.id},progress:familiarProgress(),onProgress:(fn:any)=>writes.push(fn(familiarProgress())),onBack(){},onMap(){},onNext(){}});const layout=h.find('PlayLayout'),words=layout.props['wordList'];assert.equal(words.clues,route.clues);assert.equal(words.strokes.length,0);const before=writes.length,sheet=openWords(words);assert.equal(writes.length,before);h.time(12000);assert.equal(h.find('PlayLayout').props['paused'],false);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,0);assert.equal(h.find('PlayControls').props['hints'],3);assert.ok(writes.some(p=>p.saves['route:'+route.id]?.elapsed===2));sheet.find('Modal').props['onClose']();sheet.paint();sheet.close();
  }finally{h.close();}
 });
 it('keeps Sprint time running and removes access at round transition and timed completion',()=>{
  const h=view('components/game/Sprint.tsx',{...modules,'./common':commonStubs});try{
   h.start('__SprintRun',{seed:914,progress:familiarProgress(),onProgress(){},onBack(){},onReplay(){}});const start=walk(h.tree).find(n=>n.type==='button'&&text(n).includes('Hızlı Turu başlat'))!;start.props['onClick']();h.paint();h.time(14000);let layout=h.find('PlayLayout');assert.equal(layout.props['wordListUnavailable'],false);assert.equal(layout.props['wordList'].board,layout.props['board']);const sheet=openWords(layout.props['wordList']),before=text(h.tree);h.time(16000);assert.notEqual(text(h.tree),before);sheet.find('Modal').props['onClose']();sheet.paint();sheet.close();
   const board=layout.props['board'];for(let i=0;i<board.placements.length;i++){const p=board.placements[i];h.time(16100+i*100);h.find('PlayLayout').props['onCommit'](p.a,p.b);h.paint();}assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);h.time(20000);layout=h.find('PlayLayout');assert.equal(layout.props['wordListUnavailable'],false);assert.notEqual(layout.props['board'],board);h.time(90000);assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);assert.equal(h.find('Modal').props['title'],'Güzel bir turdu!');
  }finally{h.close();}
 });
});


describe('achievement loop uses real Solo results and compact target access',()=>{
 it('keeps result actions outside the scrolling content and preserves native close callbacks',()=>{
  let continued=0,closed=0;const h=view('components/game/common.tsx');try{
   h.start('Modal',{title:'Keşif tamamlandı',className:'achievement-modal',children:jsx('p',{children:'Gerçek kazanım'}),footer:jsx('button',{children:'Sıradaki keşif',onClick:()=>continued++}),onClose:()=>closed++});
   const body=walk(h.tree).find(n=>n.props['className']==='modal-content')!,footer=walk(h.tree).find(n=>n.type==='footer')!;assert.match(text(body),/Gerçek kazanım/);assert.doesNotMatch(text(body),/Sıradaki keşif/);assert.equal(footer.props['aria-label'],'İşlemler');walk(footer).find(n=>n.type==='button')!.props['onClick']();assert.equal(continued,1);assert.equal(closed,0);h.find('dialog').props['onCancel']({preventDefault(){}});assert.equal(closed,1);
  }finally{h.close();}
 });
 it('shows one confirmed inline list outside the board, with no duplicate popup',()=>{
  const pending=[content.TUTORIAL.placements[0]!],words={board:content.TUTORIAL,strokes:[]},h=shared({wordList:words,strokes:pending,inlineTargets:true,focused:true});try{
   assert.match(walk(h.tree).find(n=>n.type==='section')!.props['className'],/focused-play inline-target-play/);assert.equal(walk(h.tree).filter(n=>typeof n.type==='function'&&n.type.name==='WordList').length,1);assert.equal(walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='BoardWords'),false);assert.equal(h.find('WordList').props['strokes'],words.strokes);assert.equal(h.find('Board').props['strokes'],pending);assert.equal(walk(walk(h.tree).find(n=>n.props['className']==='board-stage')).some(n=>typeof n.type==='function'&&n.type.name==='WordList'),false);
  }finally{h.close();}
 });
 it('carries one real route goal through confirmed completion and the existing next/replay callbacks',async()=>{
  const p=familiarProgress();for(const id of ['uzay-1','uzay-2']){const b=content.journeyBoard(content.journeyById(id)!);p.saves['route:'+id]=progress.cleanSave({strokes:b.placements,hints:0,elapsed:30,complete:false,stars:0},b);}
  const before=JSON.stringify(p),calls:any[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{
   h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-3'},progress:p,onProgress(){},onBack(){},onMap(){},onNext:(c:any)=>calls.push(c)});assert.equal(h.find('PlayLayout').props['chapterNumber'],3);const layout=h.find('PlayLayout');assert.equal(layout.props['inlineTargets'],true);assert.equal(walk(layout.props['aside']).some(n=>n.type==='WordList'),false);
   for(const stroke of layout.props['board'].placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();const result=h.find('VictorySummary').props;assert.equal(result['goal'].chapter.id,'uzay-3');assert.equal(result['goal'].state.pieces,3);assert.equal(result['rewards'].filter((r:any)=>r.kind==='piece').length,1);assert.equal(result['rewards'].filter((r:any)=>r.kind==='world').length,1);
   const next=h.find('NextJourneyPreview').props['goal'];walk(h.find('Modal')).find(n=>n.type==='button'&&text(n)==='Sonraki bölüm')!.props['onClick']();assert.equal(calls[0].journey,next.chapter.id);walk(h.find('Modal')).find(n=>n.type==='button'&&text(n).includes('Bir daha oyna'))!.props['onClick']();assert.equal(calls[1].journey,'uzay-3');assert.equal(calls[1].practice,true);assert.equal(JSON.stringify(p),before);
  }finally{h.close();}
 });
 it('never shows a standard Hababam best on a completed classic board',async()=>{
  const p=familiarProgress(),b=engine.makePuzzle('hababam',0,engine.hash('campaign-v2:hababam:0'));p.saves['hababam.0']=progress.cleanSave({strokes:b.placements,hints:0,elapsed:1,complete:false,stars:0},b);const before=JSON.stringify(p);
  const h=view('components/game/Solo.tsx',{...modules,'@/lib/game/legacy':legacy,'./common':commonStubs});try{
   h.start('Solo',{config:{themeId:'hababam',level:0,classic:true},progress:p,onProgress(){},onBack(){},onMap(){},onNext(){}});assert.equal(h.find('PlayLayout').props['inlineTargets'],false);for(const stroke of h.find('PlayLayout').props['board'].placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();assert.equal(h.find('VictorySummary').props['best'],undefined);assert.equal(h.find('VictorySummary').props['improved'],false);assert.equal(h.find('VictorySummary').props['goal'],null);assert.equal(JSON.stringify(p),before);
  }finally{h.close();}
 });
});

describe('confirmed Challenge and phase-based Sprint sound',()=>{
 it('acknowledges a Challenge match immediately and leaves progress to the server',async()=>{
  for(const accepted of [true,false]){const sounds:unknown[]=[],gate=deferred<any>(),initial={id:'challenge-1',code:'ABCDEFGH23',themeId:'uzay',creator:true,serverNow:10000,starts:0,finished:null,duration:0,strokes:[],board:content.TUTORIAL,expires:100000,ghost:null,results:[]};
   const h=view('components/game/Challenges.tsx',{...modules,'./common':{...commonStubs,useChime:()=>((v:unknown=false)=>sounds.push(v)),getSocial:async()=>({challenges:[]}),socialApi:async()=>{const next=await gate.promise;if(!accepted)throw new Error('Claim rejected');return next;}}},initial);
   try{h.start('Challenges',{authenticated:true,onLogin(){},progress:familiarProgress(),onProgress(){}});await h.settle();const target=content.TUTORIAL.placements[0]!;h.find('PlayLayout').props['onCommit'](target.a,target.b);await h.settle();assert.deepEqual(sounds,[false]);assert.equal(h.find('PlayLayout').props['localFeedback'].id,target.id);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,0);gate.resolve({...initial,strokes:[target]});await h.settle();assert.deepEqual(sounds,[false]);assert.equal(h.find('PlayLayout').props['localFeedback'],null);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,accepted?1:0);if(accepted){h.find('PlayLayout').props['onCommit'](target.a,target.b);await h.settle();assert.deepEqual(sounds,[false]);}}finally{h.close();}
  }
 });
 it('does not replay a Challenge completion after a newer finished view or unmount',async()=>{
  for(const leave of [false,true]){const sounds:unknown[]=[],gate=deferred<any>(),initial={id:'challenge-1',code:'ABCDEFGH23',themeId:'uzay',creator:true,serverNow:10000,starts:0,finished:null,duration:0,strokes:[],board:content.TUTORIAL,expires:100000,ghost:null,results:[]};
   const h=view('components/game/Challenges.tsx',{...modules,'./common':{...commonStubs,useChime:()=>((v:unknown=false)=>sounds.push(v)),getSocial:async()=>({challenges:[]}),socialApi:async()=>gate.promise}},initial);
   try{h.start('Challenges',{authenticated:true,onLogin(){},progress:familiarProgress(),onProgress(){}});await h.settle();const target=content.TUTORIAL.placements[0]!;h.find('PlayLayout').props['onCommit'](target.a,target.b);await h.settle();if(leave)h.close();else{h.slots[0]!.value={...initial,finished:10000,strokes:content.TUTORIAL.placements};h.update('Challenges',{authenticated:true,onLogin(){},progress:familiarProgress(),onProgress(){}});}gate.resolve({...initial,finished:10000,strokes:content.TUTORIAL.placements});await h.settle();assert.deepEqual(sounds,[false]);}finally{h.close();}
  }
 });
 it('Sprint has one start and neutral time-up cue without per-second alarm or repeated result',()=>{
  const sounds:unknown[]=[],h=view('components/game/Sprint.tsx',{...modules,'./common':{...commonStubs,useChime:()=>((v:unknown=false)=>sounds.push(v))}});
  try{h.start('__SprintRun',{seed:42,owner:'test',progress:familiarProgress(),onProgress(){},onBack(){},onReplay(){}});const start=walk(h.tree).find(n=>n.type==='button'&&text(n).includes('Hızlı Turu başlat'));assert.ok(start);start.props['onClick']();h.paint();assert.deepEqual(sounds,[]);h.time(14000);assert.deepEqual(sounds,['start']);h.time(30000);assert.deepEqual(sounds,['start']);h.time(80000);assert.deepEqual(sounds,['start','finish']);h.paint();assert.deepEqual(sounds,['start','finish']);}finally{h.close();}
 });
});

describe('actual numbered Solo completes, advances and replays without new awards',()=>{
 it('persists real completion and opens the correct numbered next chapter',async()=>{
  let p=familiarProgress();const calls:any[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});
  try{
   h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1',campaign:true},progress:p,onProgress(fn:any){p=fn(p);},onBack(){},onMap(){},onNext:(c:any)=>calls.push(c)});
   assert.equal(h.find('PlayLayout').props['title'],'Gökyüzüne bak');assert.equal(h.find('FirstPlayGuide').props['guide'].step,1);
   for(const stroke of h.find('PlayLayout').props['board'].placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}
   h.expire();await h.settle();assert.equal(p.saves['route:uzay-1']?.complete,true);assert.equal(p.saves['route:uzay-2'],undefined);
   assert.equal(h.find('JourneyResult').props['before'].state.pieces,0);assert.equal(h.find('JourneyResult').props['after'].state.pieces,1);
   const next=walk(h.find('Modal')).find(n=>n.type==='button'&&text(n).startsWith('Sonraki bölüm'))!;assert.ok(next);assert.match(text(next),/Gezegen komşuları/);next.props['onClick']();assert.equal(calls[0].journey,'uzay-2');assert.equal(calls[0].campaign,true);
   const replay=walk(h.find('Modal')).find(n=>n.type==='button'&&text(n).includes('Bir daha oyna'))!;replay.props['onClick']();assert.equal(calls[1].journey,'uzay-1');assert.equal(calls[1].practice,true);
  }finally{h.close();}
 });
 it('uses saved cells on resume and does not award an existing piece on replay',async()=>{
  const b=content.journeyBoard(content.journeyById('uzay-1')!),p=familiarProgress();p.saves['route:uzay-1']=progress.cleanSave({strokes:b.placements,hints:0,elapsed:10,complete:false,stars:0},b);
  const h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{
   h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1',campaign:true,practice:true},progress:p,onProgress(){},onBack(){},onMap(){},onNext(){}});assert.equal(h.find('PlayLayout').props['strokes'].length,0);
   for(const stroke of b.placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();assert.deepEqual(h.find('JourneyResult').props['rewards'],[]);assert.equal(h.find('JourneyResult').props['before'].state.pieces,1);assert.equal(h.find('JourneyResult').props['after'].state.pieces,1);
  }finally{h.close();}
  const resumed={...p,saves:{'route:uzay-1':progress.cleanSave({strokes:[b.placements[0]!],hints:1,elapsed:12,complete:false,stars:0},b)}};
  const r=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{r.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1',campaign:true},progress:resumed,onProgress(){},onBack(){},onMap(){},onNext(){}});assert.equal(r.find('PlayLayout').props['strokes'].length,1);assert.equal(r.find('PlayControls').props['hints'],2);}finally{r.close();}
 });
});

describe('imperative selection label owns its mode transitions',()=>{
 it('does not mutate unchanged preview text or visibility during repeated pointer samples',()=>{
  const h=view('components/game/common.tsx');h.start('PlayLayout',{...base,board:{...content.TUTORIAL,size:10}});
  let writes=0;const slots=new Map<string,any>();
  for(const key of ['message','word','count','loupe']){let value='',hidden=true;slots.set('[data-selection-'+key+']',{get textContent(){return value;},set textContent(next:string){writes++;value=next;},get hidden(){return hidden;},set hidden(next:boolean){writes++;hidden=next;}});}
  const preview=walk(h.tree).find(n=>String(n.props['className']??'').startsWith('selection-preview'))!;
  preview.props['ref'].current={classList:{toggle(){}},querySelector:(s:string)=>slots.get(s)};
  h.find('Board').props['onPreview']('KALE');const first=writes;assert(first>0);
  for(let i=0;i<60;i++)h.find('Board').props['onPreview']('KALE');assert.equal(writes,first);
  h.find('Board').props['onPreview']('KAL');assert.equal(slots.get('[data-selection-word]')!.textContent,'KAL');assert(writes>first);h.close();
 });
 it('updates the word and loupe without parent callbacks, then restores blocked/review/pause messages',()=>{
  const upstream:string[]=[],props={...base,board:{...content.TUTORIAL,size:10},onPreview:(s:string)=>upstream.push(s)},h=view('components/game/common.tsx');h.start('PlayLayout',props);
  const slots=new Map<string,{textContent:string;hidden:boolean}>();for(const key of ['message','word','count','loupe'])slots.set('[data-selection-'+key+']',{textContent:'',hidden:true});
  const root={classList:{toggle(){}},querySelector:(s:string)=>slots.get(s)};const preview=walk(h.tree).find(n=>String(n.props['className']??'').startsWith('selection-preview'))!;preview.props['ref'].current=root;
  const before=upstream.length;h.find('Board').props['onPreview']('KELİME');assert.equal(upstream.length,before);assert.equal(slots.get('[data-selection-word]')!.textContent,'KELİME');assert.equal(slots.get('[data-selection-loupe]')!.textContent,'E');assert.equal(slots.get('[data-selection-message]')!.hidden,true);
  for(const [mode,message] of [['inputBlocked','Sunucu onayı bekleniyor.'],['readOnly','Bölüm tamamlandı'],['paused','Oyun duraklatıldı.']]){h.update('PlayLayout',{...props,[mode!]:true});assert.equal(slots.get('[data-selection-message]')!.hidden,false);assert.ok(slots.get('[data-selection-message]')!.textContent.startsWith(message!));for(const key of ['word','count','loupe'])assert.equal(slots.get('[data-selection-'+key+']')!.hidden,true);h.update('PlayLayout',props);h.find('Board').props['onPreview']('YENİ');}
  h.close();
 });
});


describe('optional riddle shelf and actual Solo continuation',()=>{
 it('opens a new clue chapter, preserves replay intent and keeps the shelf secondary',()=>{
  const p=familiarProgress(),first=riddles.RIDDLE_CHAPTERS[0]!,calls:any[]=[],h=view('components/game/RiddleShelf.tsx');
  try{h.start('RiddleShelf',{progress:p,onPlay:(c:any)=>calls.push(c)});h.find('button').props['onClick']();assert.equal(calls[0].journey,first.id);assert.equal(calls[0].campaign,undefined);assert.equal(calls[0].practice,false);
   const b=content.journeyBoard(first);p.saves['route:'+first.id]=progress.cleanSave({strokes:b.placements,elapsed:30,hints:0,complete:false,stars:0},b);h.update('RiddleShelf',{progress:p,onPlay:(c:any)=>calls.push(c)});
   assert(text(h.tree).includes('1/32'));const list=walk(h.tree).find(n=>n.props['className']==='riddle-chapter-list')!;const buttons=walk(list).filter(n=>n.type==='button');assert.equal(buttons.length,32);buttons[0]!.props['onClick']();assert.equal(calls[1].journey,first.id);assert.equal(calls[1].practice,true);
  }finally{h.close();}
 });
 it('saves a real four-answer clue completion and advances to a different optional chapter without an album award',async()=>{
  let p=familiarProgress();const first=riddles.RIDDLE_CHAPTERS[0]!,calls:any[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});
  try{h.start('Solo',{config:{themeId:first.themeId,level:0,journey:first.id},progress:p,onProgress(fn:any){p=fn(p);},onBack(){},onMap(){},onNext:(c:any)=>calls.push(c)});
   assert.equal(h.find('PlayLayout').props['wordList'].clues,first.clues);for(const stroke of h.find('PlayLayout').props['board'].placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();
   assert.equal(p.saves['route:'+first.id]?.complete,true);assert.deepEqual(h.find('VictorySummary').props['rewards'],[]);assert.equal(h.find('VictorySummary').props['goal'],null);
   const next=walk(h.find('Modal')).find(n=>n.type==='button'&&text(n)==='Sonraki bölüm')!;assert(next);next.props['onClick']();assert.equal(calls[0].journey,riddles.RIDDLE_CHAPTERS[1]!.id);assert.equal(calls[0].campaign,undefined);
  }finally{h.close();}
 });
});


describe('player-selected focus is guidance without extra rewards or hidden answers',()=>{
 it('keeps split groups focused until every part is confirmed and advances to a remaining group',()=>{
  const targets=[{id:'a',text:'AKİL',label:'AKİL HOCA',group:0},{id:'b',text:'HOCA',label:'AKİL HOCA',group:0},{id:'c',text:'SOBA',label:'SOBA',group:1}],stroke=(id:string):engine.Stroke=>({id,a:[0,0],b:[0,3]});
  assert.equal(wordCard.focusedWordGroup({targets},[],1),1);assert.equal(wordCard.focusedWordGroup({targets},[stroke('a')],0),0);assert.equal(wordCard.focusedWordGroup({targets},[stroke('a'),stroke('b')],0),1);assert.equal(wordCard.focusedWordGroup({targets},[stroke('a'),stroke('b'),stroke('c')],1),null);
 });
 it('selects clue groups through accessible controls without revealing the answer or confirming a word',()=>{
  const chapter=riddles.RIDDLE_CHAPTERS[0]!,board=content.journeyBoard(chapter),selected:number[]=[],h=view('components/game/common.tsx');
  try{h.start('WordList',{board,strokes:[],clues:chapter.clues,focusedGroup:board.targets[0]!.group,onFocusGroup:(g:number)=>selected.push(g)});
   const buttons=walk(h.tree).filter(n=>n.type==='button');assert.equal(buttons.length,4);
   for(const [i,button] of buttons.entries()){assert.ok(button.props['aria-label'].includes(chapter.clues![board.targets[i]!.text]));assert.ok(!button.props['aria-label'].includes(board.targets[i]!.text));button.props['onClick']();}
   assert.deepEqual(selected,board.targets.map(t=>t.group));assert.equal(walk(h.tree).filter(n=>n.props['aria-pressed']===true).length,1);
  }finally{h.close();}
 });
 it('actual Solo switches focus without a hint, stroke, save, sound or clock change',async()=>{
  let writes=0;const sounds:any[]=[],p=familiarProgress(),h=view('components/game/Solo.tsx',{...modules,'./common':{...commonStubs,useChime:()=>((sound:any)=>sounds.push(sound))}});
  try{h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1',campaign:true},progress:p,onProgress(){writes++;},onBack(){},onMap(){},onNext(){}});await h.settle();
   const beforeWrites=writes,beforeSounds=sounds.length,layout=h.find('PlayLayout').props,controls=h.find('PlayControls').props,strokes=JSON.stringify(layout['strokes']),group=layout['board'].targets[2].group;
   layout['wordList'].onFocusGroup(group);await h.settle();const after=h.find('PlayLayout').props;
   assert.equal(after['wordList'].focusedGroup,group);assert(!text(h.find('PlayLayout')).includes('Hedefin:'));assert.equal(after['wordList'].board.targets.find((t:any)=>t.group===group).text,'MARS');assert.equal(JSON.stringify(after['strokes']),strokes);assert.equal(h.find('PlayControls').props['hints'],controls['hints']);assert.equal(writes,beforeWrites);assert.equal(sounds.length,beforeSounds);
   const target=after['board'].placements.find((x:any)=>x.id===after['board'].targets[2].id);after['onCommit'](target.a,target.b);await h.settle();assert.notEqual(h.find('PlayLayout').props['wordList'].focusedGroup,group);
  }finally{h.close();}
 });
 it('shared picker resumes, replays and blocks a locked world with six global chapter numbers',()=>{
  const p=familiarProgress(),b=content.journeyBoard(content.journeyById('uzay-1')!);p.saves['route:uzay-1']=progress.cleanSave({strokes:b.placements,elapsed:10,hints:0,complete:false,stars:0},b);
  const calls:any[]=[],h=view('components/game/ChapterPicker.tsx',modules);let closed=0;
  try{h.start('ChapterPicker',{progress:p,onPlay:(c:any)=>calls.push(c),onClose:()=>closed++});
   const cards=()=>walk(h.tree).filter(n=>n.type==='button'&&String(n.props['aria-label']).startsWith('Bölüm '));assert.equal(cards().length,6);
   assert.deepEqual(cards().map(n=>Number(String(n.props['aria-label']).split(':')[0]!.split(' ')[1])),[1,2,3,4,5,6]);
   cards()[0]!.props['onClick']();assert.equal(calls[0].practice,true);assert.equal(calls[0].campaign,true);assert.equal(closed,1);
   walk(h.tree).find(n=>n.type==='select')!.props['onChange']({target:{value:'turkiye'}});h.paint();const locked=cards()[0]!;assert.equal(locked.props['disabled'],true);locked.props['onClick']();assert.equal(calls.length,1);assert.equal(closed,1);
  }finally{h.close();}
 });
});

// Story flow executes real Solo with its complete deterministic board.
function storyPage(index=0,initial=familiarProgress(),practice=false){
 const story=stories.LIVING_STORIES[index]!,board=content.journeyBoard(story),events:string[]=[],next:any[]=[];let saved=initial,backs=0;
 const h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs,'@/lib/game/telemetry':{track:(event:string)=>events.push(event)}});
 h.start('Solo',{config:{themeId:story.themeId,level:0,journey:story.id,practice},progress:initial,onProgress:(fn:any)=>{saved=fn(saved);},onBack:()=>backs++,onMap:()=>backs++,onNext:(config:any)=>next.push(config)});
 const commit=(index:number)=>{const target=board.placements.find(p=>p.text===story.steps[index]!.word)!;h.find('PlayLayout').props['onCommit'](target.a,target.b);};
 return {...h,get tree(){return h.tree;},story,board,events,next,commit,get saved(){return saved;},get backs(){return backs;}};
}
describe('living story sequential interaction, hints, replay and navigation',()=>{
 it('keeps the full input board, exposes one clue and rejects a later answer without progress or penalty',()=>{
  const h=storyPage();try{const l=h.find('PlayLayout');assert.equal(l.props['board'].targets.length,4);assert.equal(l.props['wordList'].board.targets.length,4);assert.equal(l.props['earlyTargets'].length,1);assert.equal(l.props['earlyTargets'][0].text,'KIYI');assert.equal(l.props['wordList'].activeOnly,l.props['earlyTargets'][0].group);assert.equal(l.props['wordList'].onFocusGroup,undefined);
   h.commit(2);h.paint();assert.equal(h.find('PlayLayout').props['strokes'].length,0);assert.equal(h.find('PlayControls').props['hints'],3);assert.match(h.find('StoryHud').props['notice'],/Bu kelime birazdan/);assert.equal(h.events.includes('story_step'),false);
   h.commit(0);h.paint();assert.equal(h.find('PlayLayout').props['earlyTargets'][0].text,'FENER');assert.equal(h.find('PlayLayout').props['board'].targets.length,4);assert.equal(h.find('StoryHud').props['stage'],1);assert.equal(h.saved.saves['route:'+h.story.id]!.complete,false);
  }finally{h.close();}
 });
 it('does not charge for the already visible first letter, then hints only the current step and caps rapid requests',()=>{
  const h=storyPage();try{const firstHint=h.find('PlayLayout').props['hint'];assert(firstHint);h.find('PlayControls').props['onHint']();h.paint();assert.equal(h.find('PlayControls').props['hints'],3);assert.match(h.find('StoryHud').props['notice'],/Başlangıç ipucun ücretsiz/);
   h.commit(0);h.paint();const hint=h.find('PlayControls').props['onHint'];for(let i=0;i<6;i++)hint();h.paint();assert.equal(h.saved.saves['route:'+h.story.id]!.hints,3);assert.equal(h.find('PlayControls').props['hints'],0);assert.equal(JSON.stringify(h.find('PlayLayout').props['hint']),JSON.stringify(h.board.placements.find(p=>p.text==='FENER')!.a));
  }finally{h.close();}
 });
 it('accepts consecutive stage-correct moves before another render and completes once from the full board',()=>{
  const h=storyPage();try{for(let i=0;i<4;i++)h.commit(i);h.paint();h.expire();assert.equal(h.saved.saves['route:'+h.story.id]!.complete,true);assert.equal(h.find('StoryResult').props['save'].strokes.length,4);assert.equal(h.events.filter(x=>x==='story_complete').length,1);assert.equal(h.events.filter(x=>x==='story_step').length,4);
   h.commit(3);h.paint();assert.equal(h.events.filter(x=>x==='story_complete').length,1);h.find('Modal').props['footer'].props.children[0].props.onClick();assert.equal(h.next[0].journey,stories.LIVING_STORIES[1]!.id);
  }finally{h.close();}
 });
 it('resumes the actual clue, retains campaign continuation and never treats a completed review as a new story completion',()=>{
  const initial=familiarProgress(),story=stories.LIVING_STORIES[1]!,b=content.journeyBoard(story);initial.last={themeId:'uzay',level:0,journey:'uzay-2'};initial.saves['route:'+story.id]=progress.cleanSave({strokes:b.placements.filter(p=>story.steps.slice(0,2).some(s=>s.word===p.text)),elapsed:41,hints:1,complete:false,stars:0},b);
  const h=storyPage(1,initial);try{assert.equal(h.find('StoryHud').props['stage'],2);assert.equal(h.find('PlayLayout').props['earlyTargets'][0].text,'FİLİZ');assert.equal(h.saved.last?.journey,'uzay-2');for(let i=2;i<5;i++){h.commit(i);h.paint();}h.expire();assert.equal(h.saved.last?.journey,'uzay-2');
   const review=storyPage(1,progress.loadProgress(JSON.stringify(h.saved)));try{assert.equal(review.find('PlayLayout').props['readOnly'],true);assert.equal(review.events.includes('story_complete'),false);assert.equal(review.events.includes('story_start'),false);}finally{review.close();}
  }finally{h.close();}
 });
 it('replay starts empty, keeps the completed keepsake and preserves a better previous score',()=>{
  const initial=familiarProgress(),story=stories.LIVING_STORIES[0]!,b=content.journeyBoard(story),key='route:'+story.id;initial.saves[key]=progress.cleanSave({strokes:b.placements,elapsed:20,hints:0,complete:false,stars:0},b);
  const h=storyPage(0,initial,true);try{assert.equal(h.find('PlayLayout').props['strokes'].length,0);assert.equal(h.find('PlayLayout').props['hint'],null);h.find('PlayControls').props['onHint']();h.paint();for(let i=0;i<4;i++){h.commit(i);h.paint();}h.expire();assert.equal(h.find('StoryResult').props['save'].stars,2);assert.equal(h.saved.saves[key]!.stars,3);assert.equal(h.saved.saves[key]!.elapsed,20);}finally{h.close();}
 });
 it('resumes a saved story directly and cancelling a picker preserves the chosen home',()=>{
  let selected:'stories'|'journey'='stories';const p=familiarProgress(),story=stories.LIVING_STORIES[2]!,b=content.journeyBoard(story);p.saves['route:'+story.id]=progress.cleanSave({strokes:[b.placements[0]!],elapsed:10,hints:0,complete:false,stars:0},b);
  let details=0;const calls:any[]=[],props={progress:p,onPlay:(c:any)=>calls.push(c),onDetails(){details++;},onExplore(){},onViewChange:(value:'stories'|'journey')=>selected=value},h=view('components/game/JourneyHome.tsx',modules);
  try{h.start('JourneyHome',{...props,initialView:'stories'});assert.equal(walk(h.tree).some(n=>n.type==='Modal'),false);walk(h.tree).find(n=>n.props?.['className']==='stage-play')!.props['onClick']();assert.equal(calls[0].journey,story.id);
   walk(h.tree).find(n=>n.props?.['aria-label']==='Bölümler ve albümler')!.props['onClick']();assert.equal(details,1);h.paint();assert.equal(selected,'stories');
   walk(h.tree).find(n=>n.props?.['className']==='stage-milestone')!.props['onClick']();assert.equal(selected,'journey');
  }finally{h.close();}
 });
});

describe('mobile target navigation keeps the puzzle authoritative',()=>{
 it('shows one unanswered definition, changes target without a claim and opens the full confirmed list',()=>{
  const board=engine.makeCustomPuzzle(['ASLAN','KAPLAN','PANDA'],73,9),clues={ASLAN:'Erkeğinin yelesi olan büyük kedi.',KAPLAN:'Turuncu kürkünde siyah çizgiler olan büyük kedi.',PANDA:'Bambu yiyen siyah beyaz ayı.'},words={board,strokes:[],clues,golden:board.targets[1]!.id};
  const h=view('components/game/common.tsx');try{
   h.start('MobileTargets',{words});assert.match(text(h.tree),/Erkeğinin yelesi/);assert(!text(h.tree).includes('ASLAN'));assert(!text(h.tree).includes('Turuncu'));
   walk(h.tree).filter(n=>n.type==='button'&&typeof n.props['aria-pressed']==='boolean')[1]!.props['onClick']();h.paint();assert.match(text(h.tree),/Turuncu/);assert.match(text(h.tree),/×2/);assert.equal(words.strokes.length,0);
   const opener=walk(h.tree).find(n=>n.props['aria-haspopup']==='dialog')!;opener.props['onClick']();h.paint();assert.equal(h.find('WordList').props['board'],board);assert.equal(h.find('WordList').props['strokes'],words.strokes);
   h.find('WordList').props['onFocusGroup'](board.targets[2]!.group);h.paint();assert.match(text(h.tree),/Bambu/);assert(!walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='Modal'));
   h.update('MobileTargets',{words:{...words,strokes:[board.placements.find(p=>p.id===board.targets[2]!.id)!]}});assert.match(text(h.tree),/Erkeğinin yelesi/);
  }finally{h.close();}
 });
 it('shares Solo focus for the hint target, closes unavailable dialogs and keeps long split names together',()=>{
  const board=engine.makeCustomPuzzle(['AKİL HOCA','SOBA'],91,8),calls:number[]=[],words={board,strokes:[] as engine.Stroke[],focusedGroup:board.targets[0]!.group,onFocusGroup:(g:number)=>calls.push(g)};
  const h=view('components/game/common.tsx');try{
   h.start('MobileTargets',{words});assert.match(text(h.tree),/AKİL/);const second=board.targets.find(t=>t.group!==words.focusedGroup)!.group;
   walk(h.tree).filter(n=>n.type==='button'&&typeof n.props['aria-pressed']==='boolean')[1]!.props['onClick']();assert.deepEqual(calls,[second]);
   h.update('MobileTargets',{words:{...words,focusedGroup:second}});assert.match(text(h.tree),/SOBA/);
   walk(h.tree).find(n=>n.props['aria-haspopup']==='dialog')!.props['onClick']();h.paint();assert(h.find('Modal'));
   h.update('MobileTargets',{words,unavailable:true});assert(!walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='Modal'));assert(walk(h.tree).filter(n=>n.type==='button').every(n=>n.props['disabled']));
  }finally{h.close();}
 });
});


describe('clear phone targets and persisted fast play',()=>{
 it('records one visible transition when interval and visibility ticks arrive before repaint',()=>{
  const values=new Map<string,string>(),h=view('components/game/Sprint.tsx',{'./common':commonStubs,...modules},undefined,values);
  try{h.start('__SprintRun',{seed:914,owner:'alice',progress:familiarProgress(),onProgress(){},onBack(){},onReplay(){}});walk(h.tree).find(n=>n.type==='button'&&text(n).includes('Hızlı Turu başlat'))!.props['onClick']();h.paint();h.time(14000);const seen=new Set<string>();
   for(let round=0;round<2;round++){const board=h.find('PlayLayout').props['board'];board.targets.forEach((t:any)=>seen.add(t.text));for(const p of board.placements){h.find('PlayLayout').props['onCommit'](p.a,p.b);h.paint();}const before=sprint.parseSprintHistory(values.get(sprint.sprintHistoryKey('alice'))!).sequence;h.time(15000+round*1000,false);h.document.dispatchEvent(new Event('visibilitychange'));h.paint();const next=h.find('PlayLayout').props['board'];next.targets.forEach((t:any)=>seen.add(t.text));const saved=sprint.parseSprintHistory(values.get(sprint.sprintHistoryKey('alice'))!);assert.equal(saved.sequence,before+1);assert.equal(saved.sets.length,round+2);assert.deepEqual(Object.keys(saved.words).sort(),[...seen].sort());}
  }finally{h.close();}
 });

 it('records only the displayed board when the same start callback is invoked rapidly before repaint',()=>{
  const values=new Map<string,string>(),h=view('components/game/Sprint.tsx',{'./common':commonStubs,...modules},undefined,values);
  try{h.start('__SprintRun',{seed:914,owner:'alice',progress:familiarProgress(),onProgress(){},onBack(){},onReplay(){}});const click=walk(h.tree).find(n=>n.type==='button'&&text(n).includes('Hızlı Turu başlat'))!.props['onClick'];click();click();click();h.paint();const board=h.find('PlayLayout').props['board'],history=sprint.parseSprintHistory(values.get(sprint.sprintHistoryKey('alice'))!);assert.equal(history.sequence,1);assert.equal(history.sets.length,1);assert.deepEqual(Object.keys(history.words).sort(),board.targets.map((t:any)=>t.text).sort());assert.equal(Object.keys(history.words).length,4);assert.equal(h.find('PlayLayout').props['paused'],true);}finally{h.close();}
 });

 it('keeps long and split normal words together without changing the authoritative board',()=>{
  const board=engine.makeCustomPuzzle(['BULUT','ORMAN','KİTAP','DENİZ'],81,6);
  for(const clues of [undefined,{BULUT:'Gökyüzündeki su damlacıkları.'}]){const h=shared({board,wordList:{board,strokes:[],clues}});try{const wrapper=walk(h.tree).find(n=>String(n.props['className']).startsWith('viewport-targets'))!;assert.equal(wrapper.props['className'].includes('has-word-rack'),!clues);assert.equal(h.find('Board').props['board'],board);}finally{h.close();}}
  assert.equal(wordCard.compactWordRack(engine.makeCustomPuzzle(['AKİL HOCA','SOBA'],91,8)),true);
 });
 it('persists an abandoned actual Sprint before another mount chooses targets, keeping the old record',()=>{
  const values=new Map([['kt-sprint-best-v1:alice','987']]),runs:string[][]=[];
  for(let i=0;i<3;i++){const h=view('components/game/Sprint.tsx',{'./common':commonStubs,...modules},undefined,values);try{h.start('__SprintRun',{seed:914,owner:'alice',progress:familiarProgress(),onProgress(){},onBack(){},onReplay(){}});walk(h.tree).find(n=>n.type==='button'&&text(n).includes('Hızlı Turu başlat'))!.props['onClick']();h.paint();runs.push(h.find('PlayLayout').props['board'].targets.map((t:any)=>t.text));assert.equal(sprint.parseSprintHistory(values.get(sprint.sprintHistoryKey('alice'))!).sequence,i+1);assert.equal(values.get('kt-sprint-best-v1:alice'),'987');}finally{h.close();}}
  assert.equal(new Set(runs.flat()).size,12);assert.equal(values.has(sprint.sprintHistoryKey('bob')),false);
 });
 it('merges another open tab before choosing a transition board instead of erasing its targets',()=>{
  const values=new Map<string,string>(),a=view('components/game/Sprint.tsx',{'./common':commonStubs,...modules},undefined,values),b=view('components/game/Sprint.tsx',{'./common':commonStubs,...modules},undefined,values);
  const start=(h:ReturnType<typeof view>,seed:number)=>{h.start('__SprintRun',{seed,owner:'alice',progress:familiarProgress(),onProgress(){},onBack(){},onReplay(){}});walk(h.tree).find(n=>n.type==='button'&&text(n).includes('Hızlı Turu başlat'))!.props['onClick']();h.paint();h.time(14000);return h.find('PlayLayout').props['board'];};
  try{const first=start(a,11),other=start(b,22);for(const p of first.placements){a.find('PlayLayout').props['onCommit'](p.a,p.b);a.paint();}a.time(15000);const next=a.find('PlayLayout').props['board'];assert.equal(new Set([...first.targets,...other.targets,...next.targets].map((t:any)=>t.text)).size,12);const history=sprint.parseSprintHistory(values.get(sprint.sprintHistoryKey('alice'))!);assert.equal(history.sequence,3);assert.equal(Object.keys(history.words).length,12);}finally{a.close();b.close();}
 });
 it('applies an asynchronously restored home preference without losing progress or opening a game',()=>{
  const p=familiarProgress(),h=view('components/game/JourneyHome.tsx',modules);let plays=0;const props={progress:p,onPlay(){plays++;},onExplore(){},initialView:'journey'};
  try{h.start('JourneyHome',props);h.update('JourneyHome',{...props,initialView:'stories'});assert.equal(walk(h.tree).some(n=>n.type==='Modal'),false);assert.match(text(h.tree),/HİKÂYELER/);assert.equal(plays,0);assert.equal(p.tutorialDone,false);}finally{h.close();}
 });
});

// Actual visible + accessible surfaces, using the same immutable authored boards.
describe('world word veils survive every target surface and resume',()=>{
 it('never exposes a hidden answer in list, focus label or a partially completed split target',()=>{
  const j=content.journeyById('uzay-5')!,board=content.journeyBoard(j),veils=worldPresentation.chapterVeils(j.id,board.targets),h=view('components/game/common.tsx');
  try{
   const split=board.targets.find(t=>board.targets.filter(x=>x.group===t.group).length>1)!;veils[split.group]='hidden';
   const parts=board.targets.filter(t=>t.group===split.group),strokes=[board.placements.find(p=>p.id===parts[0]!.id)!];
   const tree=h.exports['WordList']({board,strokes,veils,onFocusGroup(){}}),card=walk(tree).find(n=>n.props?.['role']==='listitem'&&String(n.props['aria-label']).startsWith('Saklı kelime'));
   assert(card);assert(!visible(tree).includes(parts[1]!.text));assert(!JSON.stringify(tree).includes(split.label));
   const complete=h.exports['WordList']({board,strokes:board.placements,veils});assert(visible(complete).includes(split.label));
   h.start('MobileTargets',{words:{board:{targets:parts},strokes,veils}});assert(!visible(h.tree).includes(parts[1]!.text));assert(!JSON.stringify(h.tree).includes(split.label));
  }finally{h.close();}
 });
 it('resumes the same concealed profile and reveals only confirmed words after a reload',async()=>{
  const j=content.journeyById('uzay-5')!,board=content.journeyBoard(j),p=familiarProgress(),profile=worldPresentation.chapterVeils(j.id,board.targets),stroke=board.placements.find(t=>profile[t.group]==='open')!;
  p.saves['route:'+j.id]=progress.cleanSave({strokes:[stroke],elapsed:19,hints:1,complete:false,stars:0},board);
  const loaded=progress.loadProgress(JSON.stringify(p)),h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});
  try{h.start('Solo',{config:{themeId:j.themeId,level:0,journey:j.id,campaign:true},progress:loaded,onProgress(){},onBack(){},onMap(){},onNext(){}});await h.settle();
   const layout=h.find('PlayLayout').props;assert.deepEqual(layout['wordList'].veils,worldPresentation.chapterVeils(j.id,board.targets));assert.deepEqual(layout['strokes'],loaded.saves['route:'+j.id]!.strokes);assert.equal(layout['board'].grid.flat().join(''),board.grid.flat().join(''));
   const remaining=board.targets.find(t=>t.id!==stroke.id&&layout['wordList'].veils[t.group]==='hidden')!;layout['wordList'].onFocusGroup(remaining.group);await h.settle();assert(!visible(h.find('PlayLayout')).includes(remaining.label));const actual=h.find('PlayLayout').props['wordList'];assert.equal(actual.focusedGroup,remaining.group);assert.equal(actual.veils[remaining.group],'hidden');
  }finally{h.close();}
 });
 it('announces only the found part of a multi-part name until its final part is confirmed',async()=>{
  const j=content.journeyById('uzay-5')!,board=content.journeyBoard(j),p=familiarProgress(),h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});
  try{h.start('Solo',{config:{themeId:j.themeId,level:0,journey:j.id,campaign:true},progress:p,onProgress(){},onBack(){},onMap(){},onNext(){}});await h.settle();
   const parts=board.placements.filter(t=>t.label==='KUYRUKLU YILDIZ');assert.equal(parts.length,2);
   h.find('PlayLayout').props['onCommit'](parts[0]!.a,parts[0]!.b);await h.settle();assert(!visible(h.find('PlayLayout')).includes('YILDIZ'));assert(!visible(h.find('PlayLayout').props['effect']).includes('YILDIZ'));
   h.find('PlayLayout').props['onCommit'](parts[1]!.a,parts[1]!.b);await h.settle();assert(visible(h.find('PlayLayout')).includes('KUYRUKLU YILDIZ'));
  }finally{h.close();}
 });
 it('tool menu pauses solo once, preserves an existing pause and never pauses a daily race',()=>{
  for(const initial of [false,true])for(const canPause of [false,true]){
   let paused=initial,toggles=0,zoom=0,sound=0,help=0;
   const h=view('components/game/common.tsx'),props=()=>({paused,canPause,zoom:false,sound:false,hints:3,onPause(){paused=!paused;toggles++;},onZoom(){zoom++;},onSound(){sound++;},onHelp(){help++;},onHint(){}});
   try{h.start('PlayControls',props());walk(h.tree).find(n=>n.props?.['aria-label']==='Ayarlar')!.props['onClick']();h.update('PlayControls',props());assert.equal(paused,canPause?true:initial);
    walk(h.find('Modal')).find(n=>n.type==='button'&&text(n)==='Ses kapalı')!.props['onClick']();assert.equal(sound,1);
    walk(h.find('Modal')).find(n=>n.type==='button'&&text(n)==='Büyük harf modu')!.props['onClick']();h.update('PlayControls',props());assert.equal(zoom,1);assert.equal(paused,initial);assert.equal(toggles,canPause&&!initial?2:0);
    walk(h.tree).find(n=>n.props?.['aria-label']==='Ayarlar')!.props['onClick']();h.update('PlayControls',props());walk(h.find('Modal')).find(n=>n.type==='button'&&text(n)==='Kurallar')!.props['onClick']();h.update('PlayControls',props());assert.equal(help,1);assert.equal(paused,initial);
   }finally{h.close();}
  }
 });
});


describe('hint target follows visible selection, not placement ordering',()=>{
 it('keeps split parts in list order and falls back after the selected group is completed',()=>{
  const j=content.journeyById('uzay-5')!,board=content.journeyBoard(j),parts=board.targets.filter(t=>t.label==='KUYRUKLU YILDIZ');
  assert.equal(parts.length,2);assert.equal(wordCard.hintTarget(board,[],parts[0]!.group)?.id,parts[0]!.id);
  const first=board.placements.find(p=>p.id===parts[0]!.id)!;assert.equal(wordCard.hintTarget(board,[first],first.group)?.id,parts[1]!.id);
  const both=board.placements.filter(p=>p.group===first.group);assert.equal(wordCard.hintTarget(board,both,first.group)?.id,board.targets.find(t=>t.group!==first.group)!.id);
 });
 it('Solo hint marks the selected target, including a concealed target, and preserves the board',async()=>{
  const j=content.journeyById('uzay-5')!,p=familiarProgress(),h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});
  try{h.start('Solo',{config:{themeId:j.themeId,level:0,journey:j.id,campaign:true},progress:p,onProgress(){},onBack(){},onMap(){},onNext(){}});await h.settle();
   const layout=h.find('PlayLayout').props,board=layout['board'],last=board.targets.at(-1),target=board.placements.find((t:any)=>t.id===last.id);
   layout['wordList'].onFocusGroup(last.group);await h.settle();h.find('PlayControls').props['onHint']();await h.settle();assert.deepEqual(h.find('PlayLayout').props['hint'],target.a);assert.equal(h.find('PlayControls').props['hints'],2);assert.equal(h.find('PlayLayout').props['board'],board);
  }finally{h.close();}
 });
 it('PlayLayout exposes only the caller unlocked targets for automatic acceptance',()=>{
  const wordList={board:{targets:[content.TUTORIAL.targets[0]!]},strokes:[]},h=shared({wordList});
  try{assert.deepEqual(h.find('Board').props['earlyTargets'],wordList.board.targets);}finally{h.close();}
 });
});


it('renders one persistent normal rack instead of a competing carousel on every board',()=>{
 for(const wordListKey of [undefined,'room:2']){const h=shared({wordListKey,wordList:{board:content.TUTORIAL,strokes:[]}});try{assert(!walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='MobileTargets'));const list=h.find('WordList');assert.equal(list.props['rack'],true);assert.equal(list.key,'words:'+(wordListKey??content.TUTORIAL.grid.map(row=>row.join('')).join('|')));}finally{h.close();}}
});

it('continues ten actual Solo chapters directly, keeping each completed save through reload',()=>{
 let p=familiarProgress(),config:any={themeId:'uzay',level:0,journey:'uzay-1',campaign:true};
 const expected=['uzay-1','uzay-2','uzay-3','uzay-4','uzay-5','uzay-gozlemevi','turkiye-1','turkiye-2','turkiye-3','turkiye-4'];
 for(const id of expected){assert.equal(config.journey,id);const h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});let next:any;
  try{h.start('Solo',{config,progress:p,onProgress:(fn:any)=>{p=fn(p);},onBack(){},onMap(){},onNext:(c:any)=>next=c});const b=h.find('PlayLayout').props['board'];for(const stroke of b.placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);h.paint();}h.expire();assert.equal(p.saves['route:'+id]?.complete,true);const result=h.find('Modal');walk(result.props['footer']).find(n=>n.type==='button'&&String(n.props['className']).includes('primary'))!.props['onClick']();assert(next);config=next;p=progress.loadProgress(JSON.stringify(p));}finally{h.close();}
 }
 assert(expected.every(id=>p.saves['route:'+id]?.complete));assert.equal(Object.keys(p.saves).length,10);
});


describe('result and play preference surfaces',()=>{
 for(const mode of ['main','tutorial','story','riddle','classic','ordinary','external'])it(`lets ${mode} Solo skip its final flight without saving or rewarding twice`,()=>{
  let p=familiarProgress(),writes=0;const storage=new Map<string,string>();
  const journey=mode==='main'?mainJourney.MAIN_JOURNEY[0]?.chapter:mode==='story'?stories.LIVING_STORIES[0]:mode==='riddle'?riddles.RIDDLE_CHAPTERS[0]:null;
  const config={themeId:journey?.themeId??'uzay',level:0,...(journey?{journey:journey.id}:{}),...(mode==='main'?{campaign:true}:mode==='tutorial'?{tutorial:true}:mode==='classic'?{classic:true}:{})};
  const h=view('components/game/Solo.tsx',{...modules,'@/lib/game/legacy':legacy,'./common':commonStubs},undefined,storage);
  try{
   h.start('Solo',{config,progress:p,onProgress:(fn:any)=>{p=fn(p);writes++;},onBack(){},onMap(){},onNext(){},...(mode==='external'?{external:{board:content.TUTORIAL,title:'Tarihli bölüm',note:'',onSave(){writes++;}}}:{})});
   const board=h.find('PlayLayout').props['board'];assert.equal(h.find('PlayControls').props['onSkipResult'],undefined);
   for(const target of board.targets){const stroke=board.placements.find((s:any)=>s.id===target.id)!;h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);h.paint();}
   assert.equal(h.find('PlayLayout').props['readOnly'],true);assert(!walk(h.tree).some(n=>n.type==='Modal'));
   const layout=h.find('PlayLayout'),controls=h.find('PlayControls');assert.equal(layout.props['footer'],controls);
   assert(!text(layout.props['children']).includes('Sonuca geç'));const skip=controls.props['onSkipResult'];assert.equal(typeof skip,'function');
   const before=JSON.stringify(p),count=writes,legacySave=storage.get(legacy.SAVE_KEY);
   skip();skip();h.paint();assert(h.find('Modal'));assert.equal(h.find('PlayControls').props['onSkipResult'],undefined);assert.equal(h.find('PlayLayout').props['board'],board);
   h.expire();assert.equal(writes,count);assert.equal(JSON.stringify(p),before);assert.equal(storage.get(legacy.SAVE_KEY),legacySave);
  }finally{h.close();}
 });
 it('blocks an open target sheet on celebration even when the board becomes read-only; review restores access',()=>{
  const words={board:content.TUTORIAL,strokes:[],clues:{KELİME:'Harflerden oluşur.'}},h=shared({readOnly:true,wordList:words,wordListUnavailable:true,celebrating:true});
  try{assert.equal(h.find('MobileTargets').props['unavailable'],true);h.update('PlayLayout',{...base,readOnly:true,wordList:words,wordListUnavailable:true,celebrating:false});assert.equal(h.find('MobileTargets').props['unavailable'],false);}finally{h.close();}
 });
 it('timed tools expose comfort controls without pausing and disappear when the match ends',()=>{
  const h=view('components/game/common.tsx');let sound=0;const props={sound:true,onSound:()=>sound++};
  try{h.start('MatchTools',props);h.find('button').props['onClick']();h.paint();assert.ok(h.find('PlayComfortSettings'));assert.match(text(h.tree),/Yarış süresi devam ediyor/);walk(h.tree).find(n=>n.type==='button'&&text(n)==='Ses açık')!.props['onClick']();assert.equal(sound,1);h.update('MatchTools',{...props,finished:true});assert(!walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='Modal'));h.update('MatchTools',{...props,finished:true,review:true});h.find('button').props['onClick']();h.paint();assert.ok(h.find('Modal'));assert.match(text(h.tree),/Tamamladığın tahta/);h.find('Modal').props['onClose']();h.paint();h.update('MatchTools',{...props,finished:false});assert(!walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='Modal'));}finally{h.close();}
 });
});

describe('Solo explicit pause resumes without changing progress',()=>{
 it('header tools retain the timed heading, HUD and exit control unless quiet mode is explicit',()=>{
  const h=shared({title:'Günlük bulmaca',kicker:'8 Kasım',headerAction:{type:'button',props:{'aria-label':'Ayarlar'}},children:{type:'span',props:{role:'timer',children:'01:00'}}});
  try{const screen=walk(h.tree).find(n=>n.type==='section')!;assert(!screen.props['className'].includes('quiet-play'));assert(walk(h.tree).some(n=>n.props['aria-label']==='Geri'));assert(walk(h.tree).some(n=>n.props['role']==='timer'));assert.match(text(h.tree),/Günlük bulmaca/);}finally{h.close();}
 });
 it('leaving from Solo settings closes without resuming a clock the menu paused',()=>{
  const h=view('components/game/common.tsx');let toggles=0,home=0;const props={settingsOnly:true,paused:false,onPause:()=>toggles++,zoom:false,onZoom(){},sound:false,onSound(){},hints:3,onHint(){},onHelp(){},onHome:()=>home++};
  try{h.start('PlayControls',props);h.find('button').props['onClick']();h.paint();assert.equal(toggles,1);const exit=walk(h.tree).find(n=>n.type==='button'&&text(n)==='Ana sayfaya dön')!;assert(exit.props['className'].includes('secondary'));exit.props['onClick']();h.paint();assert.equal(home,1);assert.equal(toggles,1);}finally{h.close();}
 });
 it('routes a pause resume through shared layout, stays running on duplicate callback, and protects help',()=>{
  const h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});const p=familiarProgress();
  try{h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1'},progress:p,onProgress(){},onBack(){},onMap(){},onNext(){}});
   assert.equal(h.find('PlayLayout').props['onResume'],undefined);h.find('PlayControls').props['onPause']();h.paint();
   const resume=h.find('PlayLayout').props['onResume'];assert.equal(typeof resume,'function');resume();resume();h.paint();
   assert.equal(h.find('PlayLayout').props['paused'],false);assert.equal(h.find('PlayLayout').props['strokes'].length,0);assert.equal(h.find('PlayControls').props['hints'],3);
   h.find('PlayControls').props['onPause']();h.paint();h.find('PlayControls').props['onHelp']();h.paint();
   assert.equal(h.find('PlayLayout').props['paused'],true);assert.equal(h.find('PlayLayout').props['onResume'],undefined);
  }finally{h.close();}
 });
 it('passes a resume callback only when supplied by the game owner',()=>{
  let called=0;const h=shared({paused:true,onResume:()=>called++});try{h.find('Board').props['onResume']();assert.equal(called,1);}finally{h.close();}
 });
});


describe('stable shared target shelf',()=>{
 it('retains every group and split-letter flight destination after each confirmation',()=>{
  const board=engine.makeCustomPuzzle(['KUYRUKLU YILDIZ','KERVAN','KÖPRÜ','ÇİNİ','HAN','KİLİM'],91,8),h=view('components/game/common.tsx');
  try{const props={board,strokes:[] as engine.Stroke[],rack:true,onFocusGroup(){}};h.start('WordList',props);
   const groups=()=>walk(h.tree).filter(n=>n.props['data-word-group']!==undefined);const before=groups().map(n=>[n.key,n.props['data-word-group'],n.props['style']['--word-rows']]);assert.equal(before.length,6);
   const split=board.targets.filter(t=>t.label==='KUYRUKLU YILDIZ');assert.equal(split.length,2);
   for(const target of split){props.strokes.push(board.placements.find(t=>t.id===target.id)!);h.update('WordList',{...props,strokes:[...props.strokes]});assert.deepEqual(groups().map(n=>[n.key,n.props['data-word-group'],n.props['style']['--word-rows']]),before);for(const part of split)assert.equal(walk(h.tree).filter(n=>n.props['data-word-part']===part.id).length,1);}
   assert(groups().find(n=>n.props['data-word-group']===split[0]!.group)!.props['className'].includes('found'));
  }finally{h.close();}
 });
 it('keeps story slots while future answers and early acceptance remain locked',()=>{
  const story=stories.LIVING_STORIES[0]!,board=content.journeyBoard(story),h=view('components/game/common.tsx');
  try{const words={board,strokes:[] as engine.Stroke[],clues:story.clues,activeOnly:board.targets[0]!.group};h.start('MobileTargets',{words});assert.equal(walk(h.tree).filter(n=>n.props['data-word-group']!==undefined).length,4);for(const target of board.targets.slice(1))assert(!JSON.stringify(h.tree).includes(target.text));assert.equal(walk(h.tree).filter(n=>n.type==='button'&&n.props['aria-pressed']!==undefined&&!n.props['disabled']).length,1);
   const layout=shared({wordList:words,board,earlyTargets:[board.targets[0]!]});try{assert.equal(layout.find('Board').props['earlyTargets'].length,1);assert.equal(layout.find('MobileTargets').props['words'].board.targets.length,4);}finally{layout.close();}
   words.strokes=[board.placements.find(p=>p.id===board.targets[0]!.id)!];words.activeOnly=board.targets[1]!.group;h.update('MobileTargets',{words});assert.equal(walk(h.tree).filter(n=>n.props['data-word-group']!==undefined).length,4);assert.match(JSON.stringify(h.tree),/KIYI bulundu/);for(const target of board.targets.slice(1))assert(!JSON.stringify(h.tree).includes(target.text));
  }finally{h.close();}
 });
 it('never reveals an extra initial for the second part of a concealed name',()=>{
  const board=engine.makeCustomPuzzle(['AKİL HOCA','SOBA'],91,8),group=board.targets[0]!.group,h=view('components/game/common.tsx');try{h.start('WordList',{board,strokes:[],rack:true,veils:{[group]:'initial'}});const label=walk(h.tree).find(n=>n.props['data-word-label']!==undefined)!;assert.equal(text(label),'A✱✱✱ ✱✱✱✱');assert(!JSON.stringify(h.tree).includes('AKİL HOCA'));}finally{h.close();}
 });
});

it('does not expose future story clues through the enlarged-board word sheet',()=>{
 const story=stories.LIVING_STORIES[0]!,board=content.journeyBoard(story),h=view('components/game/common.tsx');try{h.start('BoardWords',{words:{board,strokes:[],clues:story.clues,activeOnly:board.targets[0]!.group}});h.find('button').props['onClick']();h.paint();const sheet=h.find('WordList').props;assert.deepEqual(sheet['board'].targets,[board.targets[0]]);assert.equal(sheet['strokes'].length,0);}finally{h.close();}
});

it('counts the answer letters for each clue slot even when the server replaces the label with a definition',()=>{
 const board=engine.makeCustomPuzzle(['ARI','KANAPE','YÖRÜNGE'],721,8),clues={ARI:'Bal yapan kanatlı böcek.',KANAPE:'Birden çok kişinin yan yana oturabildiği döşemeli eşya.',YÖRÜNGE:'Bir gök cisminin izlediği yol.'};
 const redacted={...board,targets:board.targets.map(t=>({...t,label:clues[t.text as keyof typeof clues]}))},h=view('components/game/common.tsx');
 try{h.start('MobileTargets',{words:{board:redacted,strokes:[],clues}});const labels=walk(h.tree).filter(n=>n.type==='button'&&n.props['aria-pressed']!==undefined).map(n=>n.props['aria-label']);for(const [i,target] of board.targets.entries())assert.equal(labels[i],`${i+1}. bilmece · ${target.text.length} harf`);}finally{h.close();}
});

it('recovers an accepted final claim after a lost response without resending the mutation',async()=>{
 const board=content.TUTORIAL,initial={id:'recover-run',code:'ABCDEFGH23',themeId:'uzay',creator:true,serverNow:10000,starts:0,finished:null,duration:0,strokes:board.placements.slice(0,-1),board,expires:100000,ghost:null,results:[]};let mutations=0,reads=0;
 const h=view('components/game/Challenges.tsx',{...modules,'./common':{...commonStubs,getSocial:async(path:string)=>{if(path?.startsWith('?action=challenge')){reads++;return {...initial,serverNow:11000,finished:11000,duration:11000,strokes:board.placements};}return {chapters:[],challenges:[]};},socialApi:async()=>{mutations++;throw new Error('Response lost');}}},initial);
 try{h.start('Challenges',{authenticated:true,onLogin(){},progress:familiarProgress(),onProgress(){}});await h.settle();const target=board.placements.at(-1)!;h.find('PlayLayout').props['onCommit'](target.a,target.b);await h.settle();assert.equal(mutations,1);assert.equal(reads,1);assert.equal(h.find('PlayLayout').props['readOnly'],true);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,board.targets.length);}finally{h.close();}
});

it('finishing the sixth real chapter offers bonus or direct continuation without changing the saved board',async()=>{
 let p=familiarProgress();const world=discovery.EXPEDITIONS[0]!;for(const id of world.chapterIds){const b=progress.progressBoard('route:'+id)!;p.saves['route:'+id]=progress.cleanSave({strokes:b.placements,elapsed:12,hints:0,complete:false,stars:0},b);}
 const calls:any[]=[],offers:any[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{
  h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-gozlemevi',campaign:true},progress:p,onProgress:(fn:any)=>{p=fn(p);},onBack(){},onMap(){},onNext:(c:any)=>calls.push(c),onBonus:(...args:any[])=>offers.push(args)});
  const b=h.find('PlayLayout').props['board'];for(const stroke of b.placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();const modal=h.find('Modal');const start=walk(modal).find(n=>n.type==='button'&&text(n).startsWith('Bonus turu'));assert(start);start.props['onClick']();assert.equal(offers[0][0],'uzay');assert(offers[0][1].journey);const skip=walk(modal).find(n=>n.type==='button'&&text(n).startsWith('Yeni dünyaya geç'));assert(skip);assert(skip.props['className'].includes('primary'));skip.props['onClick']();assert.equal(calls[0].journey,offers[0][1].journey);assert(p.saves['route:uzay-gozlemevi']!.complete);assert.equal(p.bonuses,undefined);assert.equal(h.find('PlayLayout').props['board'],b);
 }finally{h.close();}
});
it('first riddle guide blocks time and selection until understood',async()=>{
 const chapter=riddles.RIDDLE_CHAPTERS[0]!,h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});let p=progress.emptyProgress();try{
 const props={config:{themeId:chapter.themeId,level:0,journey:chapter.id},progress:p,onProgress:(fn:any)=>{p=fn(p);},onBack(){},onMap(){},onNext(){}};h.start('Solo',props);assert.equal(h.find('MechanicGuide').props['kind'],'riddle');const target=h.find('PlayLayout').props['board'].placements[0]!;h.find('PlayLayout').props['onCommit'](target.a,target.b);h.time(30000);assert.equal(h.find('PlayLayout').props['strokes'].length,0);h.find('MechanicGuide').props['onClose']();h.paint();h.find('PlayLayout').props['onCommit'](target.a,target.b);await h.settle();assert.equal(h.find('PlayLayout').props['strokes'].length,1);assert(p.mechanicGuides?.includes('riddle'));
 }finally{h.close();}
});
