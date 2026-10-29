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
function text(value:unknown):string{if(typeof value==='string')return value;if(Array.isArray(value))return value.map(text).join(' ');return value&&typeof value==='object'?text((value as Node).props?.['children']):'';}
const NOW=2_000_000;
const publicBoard=(({placements:_placements,...board})=>board)(TUTORIAL);
function room(phase:RoomView['phase'],starts:number|null,ends:number|null):RoomView{return {revision:3,id:'arena-1',code:'ABCDEFGH',kind:'friend',phase,themeId:'uzay',starts,ends,winner:phase==='finished'?'alice':null,reason:phase==='finished'?'Süre doldu':'',round:1,serverNow:NOW,board:publicBoard,golden:null,you:{id:'alice',name:'Alice',ready:true,strokes:[TUTORIAL.placements[0]!],score:140,rematch:false},opponent:{name:'Bora',ready:true,count:1,score:120,online:true,rematch:false}};}
function harness(initial:RoomView){
 const slots:Slot[]=[],effects:(()=>void)[]=[],apiCalls:{action:string;data:unknown}[]=[];let cursor=0,pending=true,tree:unknown;
 const changed=(slot:Slot,deps:unknown[])=>!slot.deps||slot.deps.length!==deps.length||deps.some((v,i)=>!Object.is(v,slot.deps![i]));
 const hooks={
  useState(value:any){const slot=slots[cursor++]??={value:typeof value==='function'?value():value};return [slot.value,(next:any)=>{(slot.updates??=[]).push(next);pending=true;}];},
  useRef(value:any){const slot=slots[cursor++]??={};return slot.ref??={current:value};},
  useEffect(fn:()=>void|(()=>void),deps:unknown[]){const slot=slots[cursor++]??={};if(changed(slot,deps)){slot.deps=deps;effects.push(()=>{slot.cleanup?.();const cleanup=fn();slot.cleanup=typeof cleanup==='function'?cleanup:undefined;});}}
 };
 const common={PlayLayout:'PlayLayout',WordList:'WordList',Modal:'Modal',useChime:()=>()=>{},shareLink:async()=>false,getApi:async()=>initial,api:async(action:string,data:unknown)=>{apiCalls.push({action,data});return initial;}};
 const icons=new Proxy({}, {get:(_target,key)=>String(key)}),exports:Record<string,any>={};
 const jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
 vm.runInNewContext(compiled,{exports,require:(name:string)=>{if(name==='react')return hooks;if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'Fragment'};if(name==='lucide-react')return icons;if(name==='@/lib/game/catalog')return {findTheme:()=>({title:'Uzay'})};if(name==='@/lib/game/engine')return engine;if(name==='@/lib/game/telemetry')return {track(){}};if(name==='./common')return common;if(name==='./useLiveRoom')return {useLiveRoom:()=> 'connected'};return {};},location:{search:'',origin:'https://example.test',href:'https://example.test/',pathname:'/'},history:{replaceState(){}},URL,URLSearchParams,Event,AbortController,Date:{now:()=>NOW},setInterval:()=>1,clearInterval(){}});
 const render=()=>{pending=false;cursor=0;for(const slot of slots)for(const update of slot.updates?.splice(0)??[])slot.value=typeof update==='function'?update(slot.value):update;tree=exports['Arena']({authenticated:true,onLogin(){},progress:progress.emptyProgress(),onProgress(){},practice(){}});for(const effect of effects.splice(0))effect();};
 const find=(type:string)=>{const found=nodes(tree).find(n=>n.type===type);assert.ok(found,type+' should exist');return found;};
 return {apiCalls,layout:()=>find('PlayLayout'),has:(type:string)=>nodes(tree).some(n=>n.type===type),click(label:RegExp){const button=nodes(tree).find(n=>n.type==='button'&&label.test(text(n)));assert.ok(button,label+' should exist');button.props['onClick']();},closeModal(){find('Modal').props['onClose']();},async settle(){for(let i=0;i<20;i++){await Promise.resolve();if(pending)render();}},close(){for(const slot of slots)slot.cleanup?.();}};
}

describe('Arena terminal board review',()=>{
 it('opens the result first, then preserves a visible read-only board and can reopen the same result',async()=>{
  const h=harness(room('finished',NOW-121_000,NOW-1_000));
  try{await h.settle();assert.equal(h.layout().props['readOnly'],true);assert.equal(h.layout().props['paused'],false);assert.match(h.layout().props['reviewStatus'],/Düello tamamlandı/);assert.equal(h.has('Modal'),true);h.closeModal();await h.settle();assert.equal(h.has('Modal'),false);assert.equal(h.layout().props['readOnly'],true);assert.equal(h.layout().props['strokes'].length,1);h.layout().props['onCommit'](TUTORIAL.placements[1]!.a,TUTORIAL.placements[1]!.b);await h.settle();assert.equal(h.apiCalls.length,0);h.click(/Düello sonucu/);await h.settle();assert.equal(h.has('Modal'),true);assert.match(text(h.layout().props['aside']),/Düello sonucu/);}finally{h.close();}
 });
 for(const [name,value,paused,readOnly] of [['countdown',room('active',NOW+4_000,NOW+124_000),true,false],['active',room('active',NOW-1_000,NOW+119_000),false,false],['expired server wait',room('active',NOW-121_000,NOW-1_000),true,false]] as const)it(`keeps ${name} input state separate from terminal review`,async()=>{const h=harness(value);try{await h.settle();assert.equal(h.layout().props['paused'],paused);assert.equal(h.layout().props['readOnly'],readOnly);}finally{h.close();}});
});
