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
const walk=(v:any):Node[]=>Array.isArray(v)?v.flatMap(walk):v&&typeof v==='object'?[v,...['children','aside','footer'].flatMap(k=>walk(v.props?.[k]))]:[];
const text=(v:any):string=>typeof v==='string'||typeof v==='number'?String(v):Array.isArray(v)?v.map(text).join(''):v&&typeof v==='object'?text(v.props?.['children']):'';
const visible=(v:any):string=>typeof v==='string'||typeof v==='number'?String(v):Array.isArray(v)?v.map(visible).join(''):v&&typeof v==='object'&&v.props?.['aria-hidden']!==true&&v.props?.['style']?.visibility!=='hidden'?visible(v.props?.['children']):'';
const jsx=(type:any,props:Record<string,unknown>,key?:unknown)=>({type,props,key}),icons=new Proxy({},{get:(_t,k)=>String(k)});
function deferred<T>(){let resolve!:(r:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
function view(file:string,modules:Record<string,unknown>={},seedFirst?:unknown){
 const exports:Record<string,any>={},slots:Slot[]=[],effects:(()=>void)[]=[],intervals=new Map<number,()=>void>(),timeouts=new Map<number,()=>void>(),frames=new Map<number,()=>void>(),document=Object.assign(new EventTarget(),{hidden:false,body:{style:{overflow:''}}});
 let cursor=0,id=0,dirty=true,tree:any,render:()=>any,now=10000;
 const changed=(s:Slot,d:unknown[])=>!s.deps||s.deps.length!==d.length||d.some((v,i)=>!Object.is(v,s.deps![i]));
 const hooks={useState(initial:any){const i=cursor++,s=slots[i]??={value:i===0&&seedFirst!==undefined?seedFirst:typeof initial==='function'?initial():initial};return[s.value,(n:any)=>{const v=typeof n==='function'?n(s.value):n;if(!Object.is(v,s.value)){s.value=v;dirty=true;}}];},useRef(initial:any){return(slots[cursor++]??={}).ref??={current:initial};},useId(){return(slots[cursor++]??={value:'id-'+(++id)}).value;},useMemo(fn:()=>any,deps:unknown[]){const s=slots[cursor++]??={};if(changed(s,deps)){s.deps=deps;s.value=fn();}return s.value;},useEffect(fn:()=>void|(()=>void),deps:unknown[]){const s=slots[cursor++]??={};if(changed(s,deps)){s.deps=deps;effects.push(()=>{s.cleanup?.();const clean=fn();s.cleanup=typeof clean==='function'?clean:undefined;});}},useReducer(reducer:any,arg:any,init:any){const [v,set]=hooks.useState(()=>init(arg));return[v,(event:any)=>set((s:any)=>reducer(s,event))];}};
 class Clock extends Date{static override now(){return now;}}
 const source=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText+(file.endsWith('Sprint.tsx')?'\nexports.__SprintRun=SprintRun;':'');
 vm.runInNewContext(source,{exports,require:(name:string)=>name==='@/lib/game/story-content'?stories:name==='@/lib/game/riddle-content'?riddles:name==='react'?hooks:name==='react/jsx-runtime'?{jsx,jsxs:jsx,Fragment:'Fragment'}:name==='lucide-react'?icons:name==='@/lib/game/legacy-ui'?legacyUI:name==='@/lib/game/word-card'?wordCard:name==='@/lib/game/viewport'?{fittedBoardSize,fitGameFrame}:name==='./Board'?{Board:'Board',strokeColor:()=> '#9ab37d'}:modules[name]??new Proxy({},{get:(_t,k)=>String(k)}),window:Object.assign(new EventTarget(),{innerHeight:640,matchMedia:()=>({matches:false}),scrollTo(){}}),document,navigator:{onLine:true},localStorage:{getItem:()=>null,setItem(){}},location:{search:'',href:'https://test/',origin:'https://test'},history:{replaceState(){}},Date:Clock,Error,Event,URL,URLSearchParams,AbortController,crypto,performance:{now:()=>now},setTimeout:(fn:()=>void)=>{timeouts.set(++id,fn);return id;},clearTimeout:(i:number)=>timeouts.delete(i),setInterval:(fn:()=>void)=>{intervals.set(++id,fn);return id;},clearInterval:(i:number)=>intervals.delete(i),requestAnimationFrame:(fn:()=>void)=>{frames.set(++id,fn);return id;},cancelAnimationFrame:(i:number)=>frames.delete(i)});
 const paint=(commit=true)=>{for(let i=0;(dirty||(commit&&effects.length))&&i<50;i++){if(dirty){dirty=false;cursor=0;tree=render();}if(commit)while(effects.length)effects.shift()!();}return tree;};
 return{exports,document,slots,frames,start(name:string,props:any,commit=true){render=()=>exports[name](props);return paint(commit);},paint,update(name:string,props:any){render=()=>exports[name](props);dirty=true;return paint();},find(type:string){const n=walk(tree).find(n=>n.type===type||typeof n.type==='function'&&n.type.name===type);assert.ok(n,type);return n;},async settle(){for(let i=0;i<30;i++){await Promise.resolve();paint();}},time(value:number){now=value;for(const fn of [...intervals.values()])fn();paint();},expire(){const f=[...timeouts.values()];timeouts.clear();for(const fn of f)fn();paint();},frame(){const f=[...frames.values()];frames.clear();for(const fn of f)fn();paint();},get tree(){return tree;},close(){for(const s of slots)s.cleanup?.();frames.clear();intervals.clear();timeouts.clear();}};
}
const base={title:'Keşif',kicker:'KELİMELER',onBack(){},board:content.TUTORIAL,strokes:[],paused:false,zoom:false,onCommit(){},preview:'',onPreview(){},children:null,aside:null,footer:null};
function shared(props:any){const h=view('components/game/common.tsx');h.start('PlayLayout',{...base,...props});return h;}
function openWords(words:any){const h=view('components/game/common.tsx');h.start('BoardWords',{words});h.find('button').props['onClick']();h.paint();return h;}
const commonStubs={PlayLayout:'PlayLayout',PlayControls:'PlayControls',WordList:'WordList',Modal:'Modal',Help:'Help',useChime:()=>()=>{}};
const modules={'@/lib/game/catalog':await import('../lib/game/catalog.ts'),'@/lib/game/content':content,'@/lib/game/engine':engine,'@/lib/game/progress':progress,'@/lib/game/achievement-view':achievementView,'@/lib/game/word-card':goalWordCard,'@/lib/game/discovery':discovery,'@/lib/game/sprint':sprint,'@/lib/game/main-journey':mainJourney,'@/lib/game/telemetry':{track(){}}};

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
   opener.props['onClick']();h.paint();assert.equal(h.find('button').props['aria-expanded'],true);const dialog=h.find('Modal');assert.equal(dialog.props['title'],'Kelime listen');assert.equal(h.find('WordList').props['strokes'],words.strokes);assert.match(text(dialog),/süre işlemeye devam eder/);
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
   h.start('Arena',{authenticated:true,progress:progress.emptyProgress(),onProgress(){},onLogin(){},practice(){}});await h.settle();const layout=h.find('PlayLayout');assert.equal(layout.props['wordList'].strokes,room.you.strokes);assert.equal(layout.props['wordList'].golden,engine.goldenId(board.targets,9000,10000));const p=board.placements[0]!;layout.props['onCommit'](p.a,p.b);await h.settle();assert.equal(h.find('PlayLayout').props['strokes'].length,1);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,0);
   const sheet=openWords(h.find('PlayLayout').props['wordList']);const before=text(h.tree);h.time(12000);assert.notEqual(text(h.tree),before);assert.equal(sheet.find('WordList').props['strokes'].length,0);sheet.find('Modal').props['onClose']();sheet.paint();sheet.close();const controls=h.find('PlayLayout').props['footer'];walk(controls).find(n=>n.type==='button'&&text(n)==='Kurallar')!.props['onClick']();h.paint();assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);
  }finally{h.close();}
 });
 it('uses confirmed Challenge strokes and blocks the word popup for exit and result',async()=>{
  const board=content.TUTORIAL,viewState={id:'challenge-1',code:'ABCDEFGHJK',themeId:'uzay',board,strokes:[],starts:9000,serverNow:10000,finished:null,duration:0,ghost:null,results:[]},claim=deferred<any>();
  const h=view('components/game/Challenges.tsx',{...modules,'./common':{...commonStubs,getSocial:async()=>({challenges:[],friends:[]}),socialApi:async()=>claim.promise}},viewState);try{
   h.start('Challenges',{authenticated:true,progress:progress.emptyProgress(),onProgress(){},onLogin(){},inviteCode:''});await h.settle();const p=board.placements[0]!;h.find('PlayLayout').props['onCommit'](p.a,p.b);await h.settle();assert.equal(h.find('PlayLayout').props['strokes'].length,1);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,0);assert.equal(h.find('PlayLayout').props['wordListKey'],'challenge-1');const sheet=openWords(h.find('PlayLayout').props['wordList']),before=text(h.tree);h.time(12000);assert.notEqual(text(h.tree),before);sheet.find('Modal').props['onClose']();sheet.paint();sheet.close();h.find('PlayLayout').props['onBack']();h.paint();assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);walk(h.find('Modal').props['children']).find(n=>n.type==='button'&&text(n)==='Oyuna dön')!.props['onClick']();h.paint();assert.equal(h.find('PlayLayout').props['wordListUnavailable'],false);claim.resolve({...viewState,strokes:board.placements,finished:12000,duration:3000});await h.settle();assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);
  }finally{h.close();}
 });
 it('preserves Solo clue data and existing time/hints while the separate word view is open',()=>{
  const route=content.ALL_JOURNEYS.find(j=>j.clues)!,writes:progress.Progress[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{
   h.start('Solo',{config:{themeId:route.themeId,level:0,journey:route.id},progress:progress.emptyProgress(),onProgress:(fn:any)=>writes.push(fn(progress.emptyProgress())),onBack(){},onMap(){},onNext(){}});const layout=h.find('PlayLayout'),words=layout.props['wordList'];assert.equal(words.clues,route.clues);assert.equal(words.strokes.length,0);const before=writes.length,sheet=openWords(words);assert.equal(writes.length,before);h.time(12000);assert.equal(h.find('PlayLayout').props['paused'],false);assert.equal(h.find('PlayLayout').props['wordList'].strokes.length,0);assert.equal(h.find('PlayControls').props['hints'],3);assert.ok(writes.some(p=>p.saves['route:'+route.id]?.elapsed===2));sheet.find('Modal').props['onClose']();sheet.paint();sheet.close();
  }finally{h.close();}
 });
 it('keeps Sprint time running and removes access at round transition and timed completion',()=>{
  const h=view('components/game/Sprint.tsx',{...modules,'./common':commonStubs});try{
   h.start('__SprintRun',{seed:914,progress:progress.emptyProgress(),onProgress(){},onBack(){},onReplay(){}});const start=walk(h.tree).find(n=>n.type==='button'&&text(n).includes('Hızlı Turu başlat'))!;start.props['onClick']();h.paint();h.time(14000);let layout=h.find('PlayLayout');assert.equal(layout.props['wordListUnavailable'],false);assert.equal(layout.props['wordList'].board,layout.props['board']);const sheet=openWords(layout.props['wordList']),before=text(h.tree);h.time(16000);assert.notEqual(text(h.tree),before);sheet.find('Modal').props['onClose']();sheet.paint();sheet.close();
   const board=layout.props['board'];for(let i=0;i<board.placements.length;i++){const p=board.placements[i];h.time(16100+i*100);h.find('PlayLayout').props['onCommit'](p.a,p.b);h.paint();}assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);h.time(20000);layout=h.find('PlayLayout');assert.equal(layout.props['wordListUnavailable'],false);assert.notEqual(layout.props['board'],board);h.time(90000);assert.equal(h.find('PlayLayout').props['wordListUnavailable'],true);assert.equal(h.find('Modal').props['title'],'Güzel bir turdu!');
  }finally{h.close();}
 });
});


describe('achievement loop uses real Solo results and compact target access',()=>{
 it('keeps result actions outside the scrolling content and preserves native close callbacks',()=>{
  let continued=0,closed=0;const h=view('components/game/common.tsx');try{
   h.start('Modal',{title:'Keşif tamamlandı',className:'achievement-modal',children:jsx('p',{children:'Gerçek kazanım'}),footer:jsx('button',{children:'Sıradaki keşif',onClick:()=>continued++}),onClose:()=>closed++});
   const body=walk(h.tree).find(n=>n.props['className']==='modal-content')!,footer=walk(h.tree).find(n=>n.type==='footer')!;assert.match(text(body),/Gerçek kazanım/);assert.doesNotMatch(text(body),/Sıradaki keşif/);assert.equal(footer.props['aria-label'],'Sonuç eylemleri');walk(footer).find(n=>n.type==='button')!.props['onClick']();assert.equal(continued,1);assert.equal(closed,0);h.find('dialog').props['onCancel']({preventDefault(){}});assert.equal(closed,1);
  }finally{h.close();}
 });
 it('shows one confirmed inline list outside the board, with no duplicate popup',()=>{
  const pending=[content.TUTORIAL.placements[0]!],words={board:content.TUTORIAL,strokes:[]},h=shared({wordList:words,strokes:pending,inlineTargets:true,focused:true});try{
   assert.match(h.tree.props['className'],/focused-play inline-target-play/);assert.equal(walk(h.tree).filter(n=>typeof n.type==='function'&&n.type.name==='WordList').length,1);assert.equal(walk(h.tree).some(n=>typeof n.type==='function'&&n.type.name==='BoardWords'),false);assert.equal(h.find('WordList').props['strokes'],words.strokes);assert.equal(h.find('Board').props['strokes'],pending);assert.equal(walk(walk(h.tree).find(n=>n.props['className']==='board-stage')).some(n=>typeof n.type==='function'&&n.type.name==='WordList'),false);
  }finally{h.close();}
 });
 it('carries one real route goal through confirmed completion and the existing next/replay callbacks',async()=>{
  const p=progress.emptyProgress();for(const id of ['uzay-1','uzay-2']){const b=content.journeyBoard(content.journeyById(id)!);p.saves['route:'+id]=progress.cleanSave({strokes:b.placements,hints:0,elapsed:30,complete:false,stars:0},b);}
  const before=JSON.stringify(p),calls:any[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{
   h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-3'},progress:p,onProgress(){},onBack(){},onMap(){},onNext:(c:any)=>calls.push(c)});assert.equal(h.find('JourneyObjective').props['goal'].chapter.id,'uzay-3');const layout=h.find('PlayLayout');assert.equal(layout.props['inlineTargets'],true);assert.equal(walk(layout.props['aside']).some(n=>n.type==='WordList'),false);
   for(const stroke of layout.props['board'].placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();const result=h.find('VictorySummary').props;assert.equal(result['goal'].chapter.id,'uzay-3');assert.equal(result['goal'].state.pieces,3);assert.equal(result['rewards'].filter((r:any)=>r.kind==='piece').length,1);assert.equal(result['rewards'].filter((r:any)=>r.kind==='world').length,1);
   const next=h.find('NextJourneyPreview').props['goal'];walk(h.find('Modal')).find(n=>n.type==='button'&&text(n).startsWith('Sıradaki:'))!.props['onClick']();assert.equal(calls[0].journey,next.chapter.id);walk(h.find('Modal')).find(n=>n.type==='button'&&text(n).includes('Bir daha oyna'))!.props['onClick']();assert.equal(calls[1].journey,'uzay-3');assert.equal(calls[1].practice,true);assert.equal(JSON.stringify(p),before);
  }finally{h.close();}
 });
 it('never shows a standard Hababam best on a completed classic board',async()=>{
  const p=progress.emptyProgress(),b=engine.makePuzzle('hababam',0,engine.hash('campaign-v2:hababam:0'));p.saves['hababam.0']=progress.cleanSave({strokes:b.placements,hints:0,elapsed:1,complete:false,stars:0},b);const before=JSON.stringify(p);
  const h=view('components/game/Solo.tsx',{...modules,'@/lib/game/legacy':legacy,'./common':commonStubs});try{
   h.start('Solo',{config:{themeId:'hababam',level:0,classic:true},progress:p,onProgress(){},onBack(){},onMap(){},onNext(){}});assert.equal(h.find('PlayLayout').props['inlineTargets'],false);for(const stroke of h.find('PlayLayout').props['board'].placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();assert.equal(h.find('VictorySummary').props['best'],undefined);assert.equal(h.find('VictorySummary').props['improved'],false);assert.equal(h.find('VictorySummary').props['goal'],null);assert.equal(JSON.stringify(p),before);
  }finally{h.close();}
 });
});

describe('confirmed Challenge and phase-based Sprint sound',()=>{
 it('keeps Challenge pending/rejected claims silent and sounds only a confirmed word',async()=>{
  for(const accepted of [true,false]){const sounds:unknown[]=[],gate=deferred<any>(),initial={id:'challenge-1',code:'ABCDEFGH23',themeId:'uzay',creator:true,serverNow:10000,starts:0,finished:null,duration:0,strokes:[],board:content.TUTORIAL,expires:100000,ghost:null,results:[]};
   const h=view('components/game/Challenges.tsx',{...modules,'./common':{...commonStubs,useChime:()=>((v:unknown=false)=>sounds.push(v)),getSocial:async()=>({challenges:[]}),socialApi:async()=>{const next=await gate.promise;if(!accepted)throw new Error('Claim rejected');return next;}}},initial);
   try{h.start('Challenges',{authenticated:true,onLogin(){},progress:progress.emptyProgress(),onProgress(){}});await h.settle();const target=content.TUTORIAL.placements[0]!;h.find('PlayLayout').props['onCommit'](target.a,target.b);await h.settle();assert.deepEqual(sounds,[]);gate.resolve({...initial,strokes:[target]});await h.settle();assert.deepEqual(sounds,accepted?[false]:[]);if(accepted){h.find('PlayLayout').props['onCommit'](target.a,target.b);await h.settle();assert.deepEqual(sounds,[false]);}}finally{h.close();}
  }
 });
 it('does not replay a Challenge completion after a newer finished view or unmount',async()=>{
  for(const leave of [false,true]){const sounds:unknown[]=[],gate=deferred<any>(),initial={id:'challenge-1',code:'ABCDEFGH23',themeId:'uzay',creator:true,serverNow:10000,starts:0,finished:null,duration:0,strokes:[],board:content.TUTORIAL,expires:100000,ghost:null,results:[]};
   const h=view('components/game/Challenges.tsx',{...modules,'./common':{...commonStubs,useChime:()=>((v:unknown=false)=>sounds.push(v)),getSocial:async()=>({challenges:[]}),socialApi:async()=>gate.promise}},initial);
   try{h.start('Challenges',{authenticated:true,onLogin(){},progress:progress.emptyProgress(),onProgress(){}});await h.settle();const target=content.TUTORIAL.placements[0]!;h.find('PlayLayout').props['onCommit'](target.a,target.b);await h.settle();if(leave)h.close();else{h.slots[0]!.value={...initial,finished:10000,strokes:content.TUTORIAL.placements};h.update('Challenges',{authenticated:true,onLogin(){},progress:progress.emptyProgress(),onProgress(){}});}gate.resolve({...initial,finished:10000,strokes:content.TUTORIAL.placements});await h.settle();assert.deepEqual(sounds,[]);}finally{h.close();}
  }
 });
 it('Sprint has one start and neutral time-up cue without per-second alarm or repeated result',()=>{
  const sounds:unknown[]=[],h=view('components/game/Sprint.tsx',{...modules,'./common':{...commonStubs,useChime:()=>((v:unknown=false)=>sounds.push(v))}});
  try{h.start('__SprintRun',{seed:42,owner:'test',progress:progress.emptyProgress(),onProgress(){},onBack(){},onReplay(){}});const start=walk(h.tree).find(n=>n.type==='button'&&text(n).includes('Hızlı Turu başlat'));assert.ok(start);start.props['onClick']();h.paint();assert.deepEqual(sounds,[]);h.time(14000);assert.deepEqual(sounds,['start']);h.time(30000);assert.deepEqual(sounds,['start']);h.time(80000);assert.deepEqual(sounds,['start','finish']);h.paint();assert.deepEqual(sounds,['start','finish']);}finally{h.close();}
 });
});

describe('actual numbered Solo completes, advances and replays without new awards',()=>{
 it('persists real completion and opens the correct numbered next chapter',async()=>{
  let p=progress.emptyProgress();const calls:any[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});
  try{
   h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1',campaign:true},progress:p,onProgress(fn:any){p=fn(p);},onBack(){},onMap(){},onNext:(c:any)=>calls.push(c)});
   assert.equal(h.find('PlayLayout').props['title'],'Bölüm 1');assert.match(text(h.find('PlayLayout')),/İlk kelime/);
   for(const stroke of h.find('PlayLayout').props['board'].placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}
   h.expire();await h.settle();assert.equal(p.saves['route:uzay-1']?.complete,true);assert.equal(p.saves['route:uzay-2'],undefined);
   assert.equal(h.find('JourneyResult').props['before'].state.pieces,0);assert.equal(h.find('JourneyResult').props['after'].state.pieces,1);
   const next=walk(h.find('Modal')).find(n=>n.type==='button'&&text(n)==='Bölüm 2’ye geç')!;assert.ok(next);next.props['onClick']();assert.equal(calls[0].journey,'uzay-2');assert.equal(calls[0].campaign,true);
   const replay=walk(h.find('Modal')).find(n=>n.type==='button'&&text(n).includes('Bir daha oyna'))!;replay.props['onClick']();assert.equal(calls[1].journey,'uzay-1');assert.equal(calls[1].practice,true);
  }finally{h.close();}
 });
 it('uses saved cells on resume and does not award an existing piece on replay',async()=>{
  const b=content.journeyBoard(content.journeyById('uzay-1')!),p=progress.emptyProgress();p.saves['route:uzay-1']=progress.cleanSave({strokes:b.placements,hints:0,elapsed:10,complete:false,stars:0},b);
  const h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{
   h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1',campaign:true,practice:true},progress:p,onProgress(){},onBack(){},onMap(){},onNext(){}});assert.equal(h.find('PlayLayout').props['strokes'].length,0);
   for(const stroke of b.placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();assert.deepEqual(h.find('JourneyResult').props['rewards'],[]);assert.equal(h.find('JourneyResult').props['before'].state.pieces,1);assert.equal(h.find('JourneyResult').props['after'].state.pieces,1);
  }finally{h.close();}
  const resumed={...p,saves:{'route:uzay-1':progress.cleanSave({strokes:[b.placements[0]!],hints:1,elapsed:12,complete:false,stars:0},b)}};
  const r=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});try{r.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1',campaign:true},progress:resumed,onProgress(){},onBack(){},onMap(){},onNext(){}});assert.equal(r.find('PlayLayout').props['strokes'].length,1);assert.equal(r.find('PlayControls').props['hints'],2);}finally{r.close();}
 });
});

describe('imperative selection label owns its mode transitions',()=>{
 it('updates the word and loupe without parent callbacks, then restores blocked/review/pause messages',()=>{
  const upstream:string[]=[],props={...base,board:{...content.TUTORIAL,size:10},onPreview:(s:string)=>upstream.push(s)},h=view('components/game/common.tsx');h.start('PlayLayout',props);
  const slots=new Map<string,{textContent:string;hidden:boolean}>();for(const key of ['message','word','count','loupe'])slots.set('[data-selection-'+key+']',{textContent:'',hidden:true});
  const root={classList:{toggle(){}},querySelector:(s:string)=>slots.get(s)};const preview=walk(h.tree).find(n=>String(n.props['className']??'').startsWith('selection-preview'))!;preview.props['ref'].current=root;
  const before=upstream.length;h.find('Board').props['onPreview']('KELİME');assert.equal(upstream.length,before);assert.equal(slots.get('[data-selection-word]')!.textContent,'KELİME');assert.equal(slots.get('[data-selection-loupe]')!.textContent,'E');assert.equal(slots.get('[data-selection-message]')!.hidden,true);
  for(const [mode,message] of [['inputBlocked','Sunucu onayı bekleniyor.'],['readOnly','Keşif tamamlandı'],['paused','Oyun duraklatıldı.']]){h.update('PlayLayout',{...props,[mode!]:true});assert.equal(slots.get('[data-selection-message]')!.hidden,false);assert.ok(slots.get('[data-selection-message]')!.textContent.startsWith(message!));for(const key of ['word','count','loupe'])assert.equal(slots.get('[data-selection-'+key+']')!.hidden,true);h.update('PlayLayout',props);h.find('Board').props['onPreview']('YENİ');}
  h.close();
 });
});


describe('optional riddle shelf and actual Solo continuation',()=>{
 it('opens a new clue chapter, preserves replay intent and keeps the shelf secondary',()=>{
  const p=progress.emptyProgress(),first=riddles.RIDDLE_CHAPTERS[0]!,calls:any[]=[],h=view('components/game/RiddleShelf.tsx');
  try{h.start('RiddleShelf',{progress:p,onPlay:(c:any)=>calls.push(c)});h.find('button').props['onClick']();assert.equal(calls[0].journey,first.id);assert.equal(calls[0].campaign,undefined);assert.equal(calls[0].practice,false);
   const b=content.journeyBoard(first);p.saves['route:'+first.id]=progress.cleanSave({strokes:b.placements,elapsed:30,hints:0,complete:false,stars:0},b);h.update('RiddleShelf',{progress:p,onPlay:(c:any)=>calls.push(c)});
   assert(text(h.tree).includes('1/32'));const list=walk(h.tree).find(n=>n.props['className']==='riddle-chapter-list')!;const buttons=walk(list).filter(n=>n.type==='button');assert.equal(buttons.length,32);buttons[0]!.props['onClick']();assert.equal(calls[1].journey,first.id);assert.equal(calls[1].practice,true);
  }finally{h.close();}
 });
 it('saves a real four-answer clue completion and advances to a different optional chapter without an album award',async()=>{
  let p=progress.emptyProgress();const first=riddles.RIDDLE_CHAPTERS[0]!,calls:any[]=[],h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs});
  try{h.start('Solo',{config:{themeId:first.themeId,level:0,journey:first.id},progress:p,onProgress(fn:any){p=fn(p);},onBack(){},onMap(){},onNext:(c:any)=>calls.push(c)});
   assert.equal(h.find('PlayLayout').props['wordList'].clues,first.clues);for(const stroke of h.find('PlayLayout').props['board'].placements){h.find('PlayLayout').props['onCommit'](stroke.a,stroke.b);await h.settle();}h.expire();await h.settle();
   assert.equal(p.saves['route:'+first.id]?.complete,true);assert.deepEqual(h.find('VictorySummary').props['rewards'],[]);assert.equal(h.find('VictorySummary').props['goal'],null);
   const next=walk(h.find('Modal')).find(n=>n.type==='button'&&text(n).startsWith('Sıradaki:'))!;assert(next);next.props['onClick']();assert.equal(calls[0].journey,riddles.RIDDLE_CHAPTERS[1]!.id);assert.equal(calls[0].campaign,undefined);
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
  let writes=0;const sounds:any[]=[],p=progress.emptyProgress(),h=view('components/game/Solo.tsx',{...modules,'./common':{...commonStubs,useChime:()=>((sound:any)=>sounds.push(sound))}});
  try{h.start('Solo',{config:{themeId:'uzay',level:0,journey:'uzay-1',campaign:true},progress:p,onProgress(){writes++;},onBack(){},onMap(){},onNext(){}});await h.settle();
   const beforeWrites=writes,beforeSounds=sounds.length,layout=h.find('PlayLayout').props,controls=h.find('PlayControls').props,strokes=JSON.stringify(layout['strokes']),group=layout['board'].targets[2].group;
   layout['wordList'].onFocusGroup(group);await h.settle();const after=h.find('PlayLayout').props;
   assert.equal(after['wordList'].focusedGroup,group);assert.match(text(h.find('PlayLayout')),/Hedefin: MARS/);assert.equal(JSON.stringify(after['strokes']),strokes);assert.equal(h.find('PlayControls').props['hints'],controls['hints']);assert.equal(writes,beforeWrites);assert.equal(sounds.length,beforeSounds);
   const target=after['board'].placements.find((x:any)=>x.id===after['board'].targets[2].id);after['onCommit'](target.a,target.b);await h.settle();assert.notEqual(h.find('PlayLayout').props['wordList'].focusedGroup,group);
  }finally{h.close();}
 });
 it('actual picker resumes, replays and blocks a locked chapter through the existing callbacks',()=>{
  const p=progress.emptyProgress(),b=content.journeyBoard(content.journeyById('uzay-1')!);p.saves['route:uzay-1']=progress.cleanSave({strokes:b.placements,elapsed:10,hints:0,complete:false,stars:0},b);
  const calls:any[]=[],h=view('components/game/JourneyHome.tsx',modules);
  try{h.start('JourneyHome',{progress:p,onPlay:(c:any)=>calls.push(c),onExplore(){}});
   const replay=walk(h.tree).find(n=>n.type==='button'&&String(n.props['aria-label']).startsWith('Bölüm 1:'))!;replay.props['onClick']();h.paint();assert.equal(calls[0].practice,true);assert.equal(calls[0].campaign,true);
   const locked=walk(h.tree).find(n=>n.type==='button'&&String(n.props['aria-label']).startsWith('Bölüm 4:'))!;assert.equal(locked.props['disabled'],true);locked.props['onClick']();h.paint();assert.equal(calls.length,1);
   walk(h.tree).find(n=>n.type==='button'&&n.props['aria-label']==='Bütün yolculuk bölümlerini aç')!.props['onClick']();h.paint();assert.equal(h.find('Modal').props['title'],'Senin yolculuğun');assert.equal(walk(h.find('Modal')).filter(n=>n.type==='button'&&String(n.props['aria-label']).startsWith('Bölüm ')).length,96);
  }finally{h.close();}
 });
});

// Story flow executes real Solo with its complete deterministic board.
function storyPage(index=0,initial=progress.emptyProgress(),practice=false){
 const story=stories.LIVING_STORIES[index]!,board=content.journeyBoard(story),events:string[]=[],next:any[]=[];let saved=initial,backs=0;
 const h=view('components/game/Solo.tsx',{...modules,'./common':commonStubs,'@/lib/game/telemetry':{track:(event:string)=>events.push(event)}});
 h.start('Solo',{config:{themeId:story.themeId,level:0,journey:story.id,practice},progress:initial,onProgress:(fn:any)=>{saved=fn(saved);},onBack:()=>backs++,onMap:()=>backs++,onNext:(config:any)=>next.push(config)});
 const commit=(index:number)=>{const target=board.placements.find(p=>p.text===story.steps[index]!.word)!;h.find('PlayLayout').props['onCommit'](target.a,target.b);};
 return {...h,get tree(){return h.tree;},story,board,events,next,commit,get saved(){return saved;},get backs(){return backs;}};
}
describe('living story sequential interaction, hints, replay and navigation',()=>{
 it('keeps the full input board, exposes one clue and rejects a later answer without progress or penalty',()=>{
  const h=storyPage();try{const l=h.find('PlayLayout');assert.equal(l.props['board'].targets.length,4);assert.equal(l.props['wordList'].board.targets.length,1);assert.equal(l.props['wordList'].board.targets[0].text,'KIYI');assert.equal(l.props['wordList'].onFocusGroup,undefined);
   h.commit(2);h.paint();assert.equal(h.find('PlayLayout').props['strokes'].length,0);assert.equal(h.find('PlayControls').props['hints'],3);assert.match(h.find('StoryHud').props['notice'],/Bu kelime birazdan/);assert.equal(h.events.includes('story_step'),false);
   h.commit(0);h.paint();assert.equal(h.find('PlayLayout').props['wordList'].board.targets[0].text,'FENER');assert.equal(h.find('PlayLayout').props['board'].targets.length,4);assert.equal(h.find('StoryHud').props['stage'],1);assert.equal(h.saved.saves['route:'+h.story.id]!.complete,false);
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
  const initial=progress.emptyProgress(),story=stories.LIVING_STORIES[1]!,b=content.journeyBoard(story);initial.last={themeId:'uzay',level:0,journey:'uzay-2'};initial.saves['route:'+story.id]=progress.cleanSave({strokes:b.placements.filter(p=>story.steps.slice(0,2).some(s=>s.word===p.text)),elapsed:41,hints:1,complete:false,stars:0},b);
  const h=storyPage(1,initial);try{assert.equal(h.find('StoryHud').props['stage'],2);assert.equal(h.find('PlayLayout').props['wordList'].board.targets[0].text,'FİLİZ');assert.equal(h.saved.last?.journey,'uzay-2');for(let i=2;i<5;i++){h.commit(i);h.paint();}h.expire();assert.equal(h.saved.last?.journey,'uzay-2');
   const review=storyPage(1,progress.loadProgress(JSON.stringify(h.saved)));try{assert.equal(review.find('PlayLayout').props['readOnly'],true);assert.equal(review.events.includes('story_complete'),false);assert.equal(review.events.includes('story_start'),false);}finally{review.close();}
  }finally{h.close();}
 });
 it('replay starts empty, keeps the completed keepsake and preserves a better previous score',()=>{
  const initial=progress.emptyProgress(),story=stories.LIVING_STORIES[0]!,b=content.journeyBoard(story),key='route:'+story.id;initial.saves[key]=progress.cleanSave({strokes:b.placements,elapsed:20,hints:0,complete:false,stars:0},b);
  const h=storyPage(0,initial,true);try{assert.equal(h.find('PlayLayout').props['strokes'].length,0);assert.equal(h.find('PlayLayout').props['hint'],null);h.find('PlayControls').props['onHint']();h.paint();for(let i=0;i<4;i++){h.commit(i);h.paint();}h.expire();assert.equal(h.find('StoryResult').props['save'].stars,2);assert.equal(h.saved.saves[key]!.stars,3);assert.equal(h.saved.saves[key]!.elapsed,20);}finally{h.close();}
 });
 it('keeps the chosen chapter view through a home remount',()=>{
  let selected:'stories'|'journey'='stories';const props={progress:progress.emptyProgress(),onPlay(){},onExplore(){},onViewChange:(value:'stories'|'journey')=>selected=value},h=view('components/game/JourneyHome.tsx',modules);
  try{h.start('JourneyHome',props);const button=walk(h.tree).find(n=>n.type==='button'&&text(n)==='Bölüm yolculuğu')!;button.props['onClick']();h.paint();assert.equal(selected,'journey');const next=view('components/game/JourneyHome.tsx',modules);try{next.start('JourneyHome',{...props,initialView:selected});assert.equal(walk(next.tree).find(n=>n.props?.['className']==='journey-classic-panel')!.props['hidden'],false);}finally{next.close();}}finally{h.close();}
 });
});
