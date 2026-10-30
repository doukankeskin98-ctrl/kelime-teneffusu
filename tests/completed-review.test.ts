// Actual shared controls/layout and Mystery component with controlled hooks/clock.
// No DOM, native dialog focus, physical scrolling or screen-reader claim.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as content from '../lib/game/content.ts';
import * as engine from '../lib/game/engine.ts';
import * as progress from '../lib/game/progress.ts';
import * as discovery from '../lib/game/discovery.ts';
import {wordCardCopy} from '../lib/game/word-card.ts';
const compile=(path:string)=>ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
type Node={type:unknown;props:Record<string,any>};
function nodes(v:any):Node[]{return Array.isArray(v)?v.flatMap(nodes):v&&typeof v==='object'?[v,...['children','aside','footer'].flatMap(k=>nodes(v.props?.[k]))]:[];}
function text(v:any):string{return typeof v==='string'||typeof v==='number'?String(v):Array.isArray(v)?v.map(text).join(''):v&&typeof v==='object'?text(v.props?.['children']):'';}
const jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
const icons=new Proxy({},{get:(_t,key)=>String(key)}),common:Record<string,any>={};
vm.runInNewContext(compile('components/game/common.tsx'),{exports:common,require:(name:string)=>name==='react/jsx-runtime'?{jsx,jsxs:jsx,Fragment:'Fragment'}:name==='react'?{useRef:()=>({current:null}),useEffect(){}}:name==='lucide-react'?icons:name==='./Board'?{Board:'Board',strokeColor:()=> '#9ab37d'}:name==='@/lib/game/word-card'?{wordCardCopy}:{}});

describe('shared completed controls and review instructions',()=>{
 it('replaces hint/pause with review and keeps working zoom, sound and help controls',()=>{
  let zoom=0,sound=0,help=0;
  const actions={onPause(){throw new Error('No resume action in completed review');},onHint(){throw new Error('No hint consumed in completed review');},onZoom:()=>zoom++,onSound:()=>sound++,onHelp:()=>help++};
  for(const paused of [false,true]){
   const tree=common['PlayControls']({...actions,paused,completed:true,zoom:false,sound:false,hints:2});
   const buttons=nodes(tree).filter(n=>n.type==='button');assert.equal(buttons.length,3);assert.match(text(tree),/İnceleme/);assert.doesNotMatch(text(tree),/İpucu/);
   assert.deepEqual(buttons.map(n=>n.props['aria-label']),['İncelemek için tahtayı büyüt','Sesi aç','Nasıl oynanır']);for(const b of buttons)b.props['onClick']();
  }
  assert.equal(zoom,2);assert.equal(sound,2);assert.equal(help,2);
  const regular=common['PlayControls']({...actions,paused:true,zoom:false,sound:false,hints:2});
  assert.equal(nodes(regular).filter(n=>n.type==='button').length,5);assert.equal(nodes(regular).find(n=>/hint-button/.test(n.props['className']??''))!.props['disabled'],true);assert.ok(nodes(regular).some(n=>n.props['aria-label']==='Devam et'));
 });
 it('passes read-only state and original ink to Board and never invites a new selection in review',()=>{
  const strokes=content.TUTORIAL.placements,props={title:'İlk keşif',kicker:'KEŞİF',onBack(){},board:content.TUTORIAL,strokes,paused:false,readOnly:true,zoom:false,onCommit(){},preview:'ESKİSEÇİM',onPreview(){},children:null,aside:null,footer:null};
  const tree=common['PlayLayout'](props),board=nodes(tree).find(n=>n.type==='Board')!,note=nodes(tree).find(n=>String(n.props['className']??'').startsWith('selection-preview'))!;
  assert.equal(board.props['readOnly'],true);assert.equal(board.props['paused'],false);assert.equal(board.props['strokes'],strokes);assert.match(text(note),/Keşif tamamlandı/);assert.doesNotMatch(text(note),/ESKİSEÇİM|Kaydır|iki ucuna/);
  const live=nodes(common['PlayLayout']({...props,readOnly:false,preview:''})).find(n=>String(n.props['className']??'').startsWith('selection-preview'))!;assert.match(text(live),/Kaydır veya ilk ve son harfe dokun/);
 });
});

type Slot={value?:any;deps?:unknown[];ref?:{current:any};cleanup?:()=>void};
function mystery({complete=true,solved=true}:{complete?:boolean;solved?:boolean}={}){
 const spec=content.MYSTERIES[0]!,board=content.mysteryBoard(spec),key='mystery:'+spec.id;
 const initial=progress.cleanSave({strokes:complete?board.placements:[],elapsed:17,hints:1,complete:false,stars:0},board);
 let ownerProgress={...progress.emptyProgress(),saves:{[key]:initial},mysteries:solved?[spec.id]:[]},tree:any,cursor=0,dirty=true,now=0,id=0,back=0;
 const slots:Slot[]=[],effects:(()=>void)[]=[],timers=new Map<number,()=>void>(),exports:Record<string,any>={},writes:progress.Progress[]=[],next:string[]=[];
 const changed=(slot:Slot,deps:unknown[])=>!slot.deps||deps.length!==slot.deps.length||deps.some((v,i)=>!Object.is(v,slot.deps![i]));
 const hooks={useState(initial:any){const slot=slots[cursor++]??={value:typeof initial==='function'?initial():initial};return[slot.value,(n:any)=>{const value=typeof n==='function'?n(slot.value):n;if(!Object.is(value,slot.value)){slot.value=value;dirty=true;}}];},useRef(initial:any){return(slots[cursor++]??={}).ref??={current:initial};},useMemo(fn:()=>any,deps:unknown[]){const slot=slots[cursor++]??={};if(changed(slot,deps)){slot.deps=deps;slot.value=fn();}return slot.value;},useEffect(fn:()=>void|(()=>void),deps:unknown[]){const slot=slots[cursor++]??={};if(changed(slot,deps)){slot.deps=deps;effects.push(()=>{slot.cleanup?.();const cleanup=fn();slot.cleanup=typeof cleanup==='function'?cleanup:undefined;});}}};
 const modules:Record<string,unknown>={react:hooks,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'lucide-react':icons,'@/lib/game/content':content,'@/lib/game/engine':engine,'@/lib/game/progress':progress,'@/lib/game/discovery':discovery,'@/lib/game/telemetry':{track(){}},'./common':{PlayLayout:'PlayLayout',PlayControls:'PlayControls',Modal:'Modal',Help:'Help',WordList:'WordList',useChime:()=>()=>{}}};
 vm.runInNewContext(compile('components/game/Mystery.tsx'),{exports,require:(n:string)=>{assert.ok(n in modules,n);return modules[n];},window:new EventTarget(),document:Object.assign(new EventTarget(),{hidden:false}),Event,performance:{now:()=>now},setInterval:(fn:()=>void)=>{timers.set(++id,fn);return id;},clearInterval:(id:number)=>timers.delete(id),setTimeout:()=>++id,clearTimeout(){}});
 const update=(fn:(p:progress.Progress)=>progress.Progress)=>{ownerProgress=fn(ownerProgress);writes.push(ownerProgress);dirty=true;};
 const paint=()=>{for(let i=0;dirty&&i<25;i++){dirty=false;cursor=0;tree=exports['Mystery']({id:spec.id,progress:ownerProgress,onProgress:update,onBack:()=>back++,onNext:(id:string)=>next.push(id)});while(effects.length)effects.shift()!();}return tree;};
 const find=(type:string)=>{const n=nodes(tree).find(n=>n.type===type);assert.ok(n,type);return n;};
 const click=(label:string)=>{const n=nodes(tree).find(n=>n.type==='button'&&text(n).includes(label));assert.ok(n,label);n.props['onClick']();paint();};
 paint();return {board,key,spec,writes,next,paint,click,get back(){return back;},get value(){return ownerProgress;},get tree(){return tree;},layout:()=>find('PlayLayout'),controls:()=>find('PlayControls'),has:(type:string)=>nodes(tree).some(n=>n.type===type),closeResult(){find('Modal').props['onClose']();paint();},help(){find('PlayControls').props['onHelp']();paint();},closeHelp(){find('Help').props['onClose']();paint();},tick(seconds:number){now+=seconds*1000;for(const fn of [...timers.values()])fn();paint();},commit(index:number){const p=board.placements[index]!;find('PlayLayout').props['onCommit'](p.a,p.b);paint();},close(){for(const s of slots)s.cleanup?.();timers.clear();}};
}

describe('Mystery result return and completed review preserve achievements',()=>{
 it('can reopen a dismissed result and reach next/back without changing time, hints, best or collection',()=>{
  const h=mystery();try{
   const before=JSON.stringify(h.value);assert.equal(h.has('Modal'),true);h.closeResult();assert.equal(h.has('Modal'),false);assert.equal(h.layout().props['readOnly'],true);assert.equal(h.layout().props['paused'],false);assert.equal(h.controls().props['completed'],true);
   assert.match(text(h.layout().props['aside']),/Bağlantıyı tamamladın/);assert.doesNotMatch(text(h.layout().props['aside']),/Son kelime açıldı/);h.commit(0);h.tick(30);h.click('Sonucu göster');assert.equal(h.has('Modal'),true);h.click('Yeni bağlantı');assert.equal(h.next.length,1);h.click('Keşfe dön');assert.equal(h.back,1);assert.equal(JSON.stringify(h.value),before);
  }finally{h.close();}
 });
 it('does not stack help and result even if a queued result action arrives while help is open',()=>{
  const h=mystery();try{h.closeResult();h.help();assert.equal(h.has('Help'),true);assert.equal(h.has('Modal'),false);h.click('Sonucu göster');assert.equal(h.has('Help'),true);assert.equal(h.has('Modal'),false);h.closeHelp();assert.equal(h.has('Help'),false);assert.equal(h.has('Modal'),true);assert.equal(h.layout().props['paused'],false);}finally{h.close();}
 });
 it('gives nearby words only visible Mystery targets and closes access for connection choice',()=>{
  const h=mystery({complete:false,solved:false});try{const initial=h.layout().props['wordList'];assert.equal(initial.board.targets.length,h.spec.words.length);assert.equal(initial.strokes.length,0);assert.equal(initial.board.grid,h.layout().props['board'].grid);assert(!initial.board.targets.some((t:any)=>t.text===h.spec.answer));assert.equal(nodes(h.layout().props['aside']).filter(n=>n.type==='WordList').length,0);for(let i=0;i<3;i++)h.commit(i);h.click('Bağlantıyı bul');assert.equal(h.layout().props['wordListUnavailable'],true);h.click(h.spec.answer);assert.equal(h.layout().props['wordListUnavailable'],false);assert.equal(h.layout().props['wordList'].board.targets.length,h.board.targets.length);}finally{h.close();}
 });
 it('starts a real empty replay while retaining the permanent completed best and collection',()=>{
  const h=mystery();try{
   const best=JSON.stringify(h.value.saves[h.key]),collection=[...h.value.mysteries];h.click('Bir daha keşfet');assert.equal(h.has('Modal'),false);assert.equal(h.layout().props['readOnly'],false);assert.equal(h.controls().props['completed'],false);assert.equal(h.layout().props['strokes'].length,0);h.commit(0);assert.equal(h.layout().props['strokes'].length,1);assert.equal(JSON.stringify(h.value.saves[h.key]),best);assert.deepEqual([...h.value.mysteries],collection);
  }finally{h.close();}
 });
 it('honors an existing completed board even when the separate connection flag is missing, without granting a new collection',()=>{
  const h=mystery({solved:false});try{assert.equal(h.value.mysteries.length,0);h.closeResult();const aside=h.layout().props['aside'];assert.match(text(aside),new RegExp(h.spec.answer));assert.equal(nodes(aside).some(n=>n.type==='button'&&/Bağlantıyı bul/.test(text(n))),false);assert.equal(h.layout().props['wordList'].board.targets.length,h.board.targets.length);h.click('Sonucu göster');assert.equal(h.value.mysteries.length,0);}finally{h.close();}
 });
});


it('pending daily controls and layout expose actual waiting without a fake pause or completed board',()=>{
 const actions={onHint(){},onPause(){},onZoom(){},onSound(){},onHelp(){}};
 const controls=common['PlayControls']({...actions,paused:false,completed:false,canPause:false,blocked:true,busy:true,zoom:false,sound:false,hints:3});
 const buttons=nodes(controls).filter(n=>n.type==='button'),hint=buttons.find(n=>/hint-button/.test(n.props['className']??''))!;assert.equal(buttons.length,4);assert.equal(hint.props['disabled'],true);assert.equal(hint.props['aria-busy'],true);assert.equal(buttons.filter(n=>!n.props['disabled']).length,3);assert.doesNotMatch(text(controls),/İnceleme/);
 const tree=common['PlayLayout']({title:'Günlük',kicker:'GÜNLÜK',onBack(){},board:content.TUTORIAL,strokes:[],paused:false,readOnly:false,inputBlocked:true,busy:true,inputStatus:'Kelimen doğrulanıyor.',zoom:false,onCommit(){},preview:'BEKLİYOR',onPreview(){},children:null,aside:null,footer:null});
 const board=nodes(tree).find(n=>n.type==='Board')!,note=nodes(tree).find(n=>String(n.props['className']??'').startsWith('selection-preview'))!;assert.equal(board.props['blocked'],true);assert.equal(board.props['busy'],true);assert.equal(board.props['paused'],false);assert.equal(board.props['readOnly'],false);assert.equal(text(note),'Kelimen doğrulanıyor.');
});
