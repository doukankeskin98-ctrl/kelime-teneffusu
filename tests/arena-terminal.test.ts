// Executes the real Arena caller with controlled hooks and server state.
// This validates component state wiring, not a DOM, live room or physical device.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {TUTORIAL} from '../lib/game/content.ts';
import * as engine from '../lib/game/engine.ts';
import * as progress from '../lib/game/progress.ts';
import type {RoomView} from '../lib/game/server.ts';

type Node={type:unknown;props:Record<string,any>};
type Slot={value?:any;ref?:{current:any};deps?:unknown[];cleanup?:()=>void;updates?:any[]};
const compiled=ts.transpileModule(readFileSync('components/game/Arena.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function nodes(value:unknown):Node[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return [];const n=value as Node;return [n,...['children','aside','footer'].flatMap(key=>nodes(n.props?.[key]))];}
function text(value:unknown):string{if(typeof value==='string'||typeof value==='number')return String(value);if(Array.isArray(value))return value.map(text).join(' ');return value&&typeof value==='object'?text((value as Node).props?.['children']):'';}
const NOW=2_000_000;
const publicBoard=(({placements:_placements,...board})=>board)(TUTORIAL);
function room(phase:RoomView['phase'],starts:number|null,ends:number|null):RoomView{return {revision:3,id:'arena-1',code:'ABCDEFGH',kind:'friend',phase,themeId:'uzay',starts,ends,winner:phase==='finished'?'alice':null,reason:phase==='finished'?'Süre doldu':'',round:1,serverNow:NOW,board:publicBoard,golden:null,you:{id:'alice',name:'Alice',ready:true,strokes:[TUTORIAL.placements[0]!],score:140,rematch:false},opponent:{name:'Bora',ready:true,count:1,score:120,online:true,rematch:false}};}
function harness(initial:RoomView|null,claim?:(action?:string)=>Promise<RoomView>,get?:()=>Promise<RoomView|null>){
 const sounds:unknown[]=[];let live:(room:RoomView,sourceId?:string)=>void=()=>{};
 const slots:Slot[]=[],effects:(()=>void)[]=[],apiCalls:{action:string;data:unknown}[]=[];let cursor=0,pending=true,tree:unknown;
 const changed=(slot:Slot,deps:unknown[])=>!slot.deps||slot.deps.length!==deps.length||deps.some((v,i)=>!Object.is(v,slot.deps![i]));
 const hooks={
  useState(value:any){const slot=slots[cursor++]??={value:typeof value==='function'?value():value};return [slot.value,(next:any)=>{(slot.updates??=[]).push(next);pending=true;}];},
  useRef(value:any){const slot=slots[cursor++]??={};return slot.ref??={current:value};},
  useEffect(fn:()=>void|(()=>void),deps:unknown[]){const slot=slots[cursor++]??={};if(changed(slot,deps)){slot.deps=deps;effects.push(()=>{slot.cleanup?.();const cleanup=fn();slot.cleanup=typeof cleanup==='function'?cleanup:undefined;});}}
 };
 const common={PlayLayout:'PlayLayout',WordList:'WordList',Modal:'Modal',useChime:()=>((cue:unknown=false)=>sounds.push(cue)),shareLink:async()=>false,getApi:async()=>get?get():initial,api:async(action:string,data:unknown)=>{apiCalls.push({action,data});return claim?claim(action):initial;}};
 const icons=new Proxy({}, {get:(_target,key)=>String(key)}),exports:Record<string,any>={};
 const jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
 vm.runInNewContext(compiled,{exports,require:(name:string)=>{if(name==='react')return hooks;if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'Fragment'};if(name==='lucide-react')return icons;if(name==='@/lib/game/catalog')return {findTheme:()=>({title:'Uzay'})};if(name==='@/lib/game/engine')return engine;if(name==='@/lib/game/telemetry')return {track(){}};if(name==='./common')return common;if(name==='./useLiveRoom')return {useLiveRoom:(_id:string,accept:(room:RoomView,sourceId:string)=>void)=>{live=(room,sourceId=_id)=>accept(room,sourceId);return 'connected';}};return {};},location:{search:'',origin:'https://example.test',href:'https://example.test/',pathname:'/'},history:{replaceState(){}},URL,URLSearchParams,Event,AbortController,Date:{now:()=>NOW},setInterval:()=>1,clearInterval(){},setTimeout,clearTimeout});
 const render=()=>{pending=false;cursor=0;for(const slot of slots)for(const update of slot.updates?.splice(0)??[])slot.value=typeof update==='function'?update(slot.value):update;tree=exports['Arena']({authenticated:true,onLogin(){},progress:progress.emptyProgress(),onProgress(){},practice(){}});for(const effect of effects.splice(0))effect();};
 const find=(type:string)=>{const found=nodes(tree).find(n=>n.type===type);assert.ok(found,type+' should exist');return found;};
 return {apiCalls,sounds,copy:()=>text(tree),modalCount:()=>nodes(tree).filter(n=>n.type==='Modal').length,push:(next:RoomView,sourceId?:string)=>live(next,sourceId),layout:()=>find('PlayLayout'),has:(type:string)=>nodes(tree).some(n=>n.type===type),click(label:RegExp){const button=nodes(tree).find(n=>n.type==='button'&&label.test(text(n)));assert.ok(button,label+' should exist');button.props['onClick']();},closeModal(){find('Modal').props['onClose']();},async settle(){for(let i=0;i<20;i++){await Promise.resolve();if(pending)render();}},close(){for(const slot of slots)slot.cleanup?.();}};
}

describe('Arena terminal board review',()=>{
 it('opens quick groups from the main action and retains a separate ranked duel action',async()=>{
  for(const [button,group] of [[/Hızlı eşleş/,true],[/Dereceli düello · 2 kişi/,false]] as const){const h=harness(null,async()=>room('ready',null,null));try{await h.settle();h.click(button);await h.settle();assert.equal(h.apiCalls.length,1);const data=h.apiCalls[0]!.data as {kind:string;mode?:string};assert.equal(data.kind,'quick');assert.equal(data.mode,group?'group':undefined);}finally{h.close();}}
 });
 it('opens the result first, then preserves a visible read-only board and can reopen the same result',async()=>{
  const h=harness(room('finished',NOW-121_000,NOW-1_000));
  try{await h.settle();assert.equal(h.layout().props['readOnly'],true);assert.equal(h.layout().props['paused'],false);assert.match(h.layout().props['reviewStatus'],/Düello tamamlandı/);assert.equal(h.has('Modal'),true);h.closeModal();await h.settle();assert.equal(h.has('Modal'),false);assert.equal(h.layout().props['readOnly'],true);assert.equal(h.layout().props['strokes'].length,1);h.layout().props['onCommit'](TUTORIAL.placements[1]!.a,TUTORIAL.placements[1]!.b);await h.settle();assert.equal(h.apiCalls.length,0);h.click(/Düello sonucu/);await h.settle();assert.equal(h.has('Modal'),true);assert.match(text(h.layout().props['aside']),/Düello sonucu/);}finally{h.close();}
 });
 for(const [name,value,paused,readOnly] of [['countdown',room('active',NOW+4_000,NOW+124_000),true,false],['active',room('active',NOW-1_000,NOW+119_000),false,false],['expired server wait',room('active',NOW-121_000,NOW-1_000),true,false]] as const)it(`keeps ${name} input state separate from terminal review`,async()=>{const h=harness(value);try{await h.settle();assert.equal(h.layout().props['paused'],paused);assert.equal(h.layout().props['readOnly'],readOnly);}finally{h.close();}});
});

function deferredRoom(){let resolve!:(v:RoomView)=>void,reject!:(e:Error)=>void;const promise=new Promise<RoomView>((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
describe('Arena sound follows confirmed events',()=>{
 it('keeps pending/rejected words silent and plays an accepted word once',async()=>{
  for(const ok of [false,true]){const initial=room('active',NOW-1_000,NOW+119_000),gate=deferredRoom(),h=harness(initial,()=>gate.promise),target=TUTORIAL.placements[1]!;
   try{await h.settle();h.layout().props['onCommit'](target.a,target.b);await h.settle();assert.equal(h.sounds.length,0);assert.equal(h.layout().props['inputBlocked'],true);assert.equal(h.layout().props['busy'],true);if(ok)gate.resolve({...initial,revision:4,you:{...initial.you,strokes:[...initial.you.strokes,target]}});else gate.reject(new Error('Claim rejected'));await h.settle();assert.deepEqual(h.sounds,ok?[false]:[]);assert.equal(h.layout().props['inputBlocked'],false);assert.equal(h.layout().props['busy'],false);if(ok){h.layout().props['onCommit'](target.a,target.b);await h.settle();assert.equal(h.apiCalls.length,1);assert.equal(h.sounds.length,1);}}finally{h.close();}
  }
 });
 it('plays terminal result once and suppresses an older claim ACK after SSE finish',async()=>{
  const initial=room('active',NOW-1_000,NOW+119_000),gate=deferredRoom(),h=harness(initial,()=>gate.promise),target=TUTORIAL.placements[1]!;
  try{await h.settle();h.layout().props['onCommit'](target.a,target.b);await h.settle();h.push({...room('finished',NOW-121_000,NOW-1),revision:5});await h.settle();assert.deepEqual(h.sounds,['complete']);gate.resolve({...initial,revision:4,you:{...initial.you,strokes:[...initial.you.strokes,target]}});await h.settle();assert.deepEqual(h.sounds,['complete']);assert.equal(h.layout().props['readOnly'],true);h.closeModal();await h.settle();h.click(/Düello sonucu/);await h.settle();assert.deepEqual(h.sounds,['complete']);}finally{h.close();}
 });
 it('does not celebrate an old loaded result and uses a neutral finish for loss or tie',async()=>{
  const restored=harness(room('finished',NOW-121_000,NOW-1));await restored.settle();assert.deepEqual(restored.sounds,[]);restored.close();
  for(const winner of [null,'bob']){const h=harness(room('active',NOW-1_000,NOW+119_000));try{await h.settle();h.push({...room('finished',NOW-121_000,NOW-1),winner,revision:4});await h.settle();assert.deepEqual(h.sounds,['finish']);}finally{h.close();}}
 });
 it('announces countdown to playing once, without a tick or replay on later revisions',async()=>{
  const h=harness(room('active',NOW+4_000,NOW+124_000));try{await h.settle();assert.deepEqual(h.sounds,[]);h.push({...room('active',NOW-1,NOW+119_999),revision:4});await h.settle();assert.deepEqual(h.sounds,['start']);h.push({...room('active',NOW-1,NOW+119_999),revision:5});await h.settle();assert.deepEqual(h.sounds,['start']);}finally{h.close();}
 });
});


describe('Arena next and overlay lifecycle',()=>{
 it('dispatches one next mutation for rapid clicks and accepts the successor without leaving the room',async()=>{
  const initial=room('finished',NOW-121_000,NOW-1),gate=deferredRoom(),h=harness(initial,()=>gate.promise);
  try{await h.settle();h.click(/Yeni oyun oyna/);h.click(/Yeni oyun oyna/);assert.equal(h.apiCalls.length,1);assert.equal((h.apiCalls[0]!.data as any).round,1);gate.resolve({...initial,phase:'ready',round:2,revision:4,board:null,you:{...initial.you,ready:false,strokes:[],score:0}});await h.settle();assert.equal(h.has('PlayLayout'),false);assert.equal(h.modalCount(),0);h.click(/Hazırım/);await h.settle();assert.equal(h.apiCalls[1]!.action,'ready');assert.equal((h.apiCalls[1]!.data as any).round,2);}finally{h.close();}
 });
 for(const label of [/Sıralama/,/Kurallar/])it(`keeps one modal if a match finishes with ${label} open`,async()=>{
  const h=harness(room('active',NOW-1,NOW+119_999));try{await h.settle();h.click(label);await h.settle();assert.equal(h.modalCount(),1);h.push({...room('finished',NOW-121_000,NOW-1),revision:4});await h.settle();assert.equal(h.modalCount(),1);assert.equal(h.layout().props['readOnly'],true);h.closeModal();await h.settle();assert.equal(h.modalCount(),1);h.closeModal();await h.settle();assert.equal(h.modalCount(),0);}finally{h.close();}
 });
 it('ignores an older recovery after successful leave, even when a new room is already open',async()=>{
  const initial={...room('ready',null,null),board:null},gate=deferredRoom();let gets=0,failed=false;
  const h=harness(initial,async action=>{if(action==='ready'&&!failed){failed=true;throw new Error('Retry');}if(action==='enter')return {...initial,id:'arena-2',revision:0};return initial;},async()=>++gets===1?initial:gate.promise);
  try{await h.settle();h.click(/Hazırım|Hazırsın/);await h.settle();h.click(/Odayı kontrol et/);h.click(/Odadan ayrıl/);await h.settle();h.click(/Özel oda oluştur/);await h.settle();gate.resolve({...initial,revision:9});await h.settle();h.click(/Hazırım|Hazırsın/);await h.settle();assert.equal((h.apiCalls.at(-1)!.data as any).id,'arena-2');}finally{h.close();}
 });
});

it('accepts a server quick-queue transfer only from the current stream and ignores retired stream callbacks',async()=>{const waiting={...room('waiting',null,null),kind:'quick',id:'queued',board:null},h=harness(waiting);try{await h.settle();const paired={...room('ready',null,null),kind:'quick',id:'paired',board:null};h.push(paired,'queued');await h.settle();h.click(/Hazırım|Hazırsın/);await h.settle();assert.equal((h.apiCalls[0]!.data as any).id,'paired');h.push({...paired,id:'retired',revision:20},'queued');await h.settle();h.click(/Hazırım|Hazırsın/);await h.settle();assert.notEqual((h.apiCalls.at(-1)!.data as any).id,'retired');}finally{h.close();}});

it('offers the previous finished ranking in a successor lobby even without receiving the finish event',async()=>{const initial={...room('ready',null,null),board:null,round:2,lastResult:{round:1,winner:'alice',reason:'Tüm kelimeler bulundu',players:[{id:'alice',name:'Alice',score:800,count:6,ready:true,online:true,rematch:false,left:false,rank:1}]}},h=harness(initial);try{await h.settle();h.click(/Önceki maç sonucu/);await h.settle();assert.equal(h.modalCount(),1);h.click(/Lobiye dön/);await h.settle();assert.equal(h.modalCount(),0);}finally{h.close();}});

it('restores a paired quick room even if its result arrived before a delayed queue reconnect',async()=>{const initial={...room('waiting',null,null),kind:'quick',id:'queue-old',board:null},h=harness(initial);try{await h.settle();h.push({...room('finished',NOW-121_000,NOW-1),kind:'quick',id:'host-new'},'queue-old');await h.settle();assert.equal(h.layout().props['readOnly'],true);assert.equal(h.modalCount(),1);}finally{h.close();}});

// The actual series component, with static hooks: the lobby must not hide wins in details.
describe('visible room win table',()=>{
 it('shows every recorded win directly and gives no inferred victory to an empty series',()=>{
  const exports:Record<string,any>={},jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
  vm.runInNewContext(compiled,{exports,require:(name:string)=>{if(name==='react')return {useState:(v:unknown)=>[v,()=>{}]};if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};if(name==='lucide-react')return new Proxy({},{get:(_t,k)=>String(k)});return {};}});
  const series={rounds:3,players:[{id:'alice',name:'Alice',rank:1,wins:2,played:3,draws:1,score:480,active:true},{id:'bob',name:'Bora',rank:2,wins:0,played:3,draws:1,score:300,active:true}]};
  const tree=exports['ArenaSeriesBoard']({series,you:'alice'});assert.equal(tree.type,'section');assert.equal(nodes(tree).some(n=>n.type==='details'),false);assert.equal(nodes(tree).filter(n=>n.type==='li').length,2);assert.match(text(tree),/Oda galibiyetleri/);assert.match(text(tree),/Sen\s+2\s+galibiyet/);assert.match(text(tree),/Bora/);
  const empty=exports['ArenaSeriesBoard']({series:{...series,rounds:0},you:'alice'});assert.match(text(empty),/İlk tamamlanan maçtan sonra/);assert.equal(nodes(empty).filter(n=>n.type==='li').length,0);
 });
 it('keeps large-room tables paginated without silently dropping players',()=>{
  const exports:Record<string,any>={},jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});let current=0;
  vm.runInNewContext(compiled,{exports,require:(name:string)=>{if(name==='react')return {useState:()=>[current,(v:number)=>{current=v;}]};if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};if(name==='lucide-react')return new Proxy({},{get:(_t,k)=>String(k)});return {};}});
  const series={rounds:1,players:Array.from({length:16},(_,i)=>({id:'u'+i,name:'Oyuncu '+i,rank:i+1,wins:i===0?1:0,played:1,draws:0,score:0,active:true}))};
  let tree=exports['ArenaSeriesBoard']({series,you:'u0'});assert.equal(nodes(tree).filter(n=>n.type==='li').length,12);nodes(tree).find(n=>n.type==='button'&&text(n)==='Sonraki')!.props['onClick']();tree=exports['ArenaSeriesBoard']({series,you:'u0'});assert.equal(nodes(tree).filter(n=>n.type==='li').length,4);assert.match(text(tree),/Oyuncu 15/);
 });
});

it('plays the ready cue only after a newly ready state is accepted, never on failure',async()=>{
 for(const accepted of [false,true]){const initial={...room('ready',null,null),you:{...room('ready',null,null).you,ready:false}},gate=deferredRoom(),h=harness(initial,()=>gate.promise);try{await h.settle();h.click(/Hazırım/);await h.settle();assert.deepEqual(h.sounds,[]);if(accepted)gate.resolve({...initial,revision:4,you:{...initial.you,ready:true}});else gate.reject(new Error('Ready rejected'));await h.settle();assert.deepEqual(h.sounds,accepted?['ready']:[]);}finally{h.close();}}
});


it('shows current/next group mode, passes frozen clues and never names an unconfirmed golden answer',async()=>{
 const active:RoomView={...room('active',NOW-1000,NOW+119000),mode:'group',roundKind:'clue',nextRoundKind:'words',clues:Object.fromEntries(TUTORIAL.targets.map((t,i)=>[t.text,'Tanım '+(i+1)])),you:{...room('active',0,1).you,strokes:[]}};
 const next:RoomView={...active,revision:5,round:2,phase:'ready',roundKind:'words',nextRoundKind:'clue',board:null,clues:undefined,starts:null,ends:null};
 const h=harness(active,async()=>next);try{await h.settle();assert.equal(h.layout().props['wordList'].clues,active.clues);const aside=text(h.layout().props['aside']);assert(aside.includes('İşaretli tanım'));for(const t of TUTORIAL.targets)assert(!aside.includes(t.label));
  h.push({...active,revision:4,phase:'finished',ends:NOW,winner:'alice'});await h.settle();assert(h.copy().includes('Normal kelime turu'));h.click(/Yeni oyun oyna/);await h.settle();assert.match(h.copy(),/Maç\s+2/,h.copy());assert(h.copy().includes('Bilmeceli tur'));assert.equal(h.apiCalls.filter(c=>c.action==='next').length,1);
 }finally{h.close();}
});
