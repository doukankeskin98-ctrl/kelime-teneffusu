import assert from 'node:assert/strict';
import {it} from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

type Props=Record<string,unknown>;
type View={type:unknown;props:Props;key?:number};
type Load=()=>Promise<{default:unknown}>;
type Lazy={loader:Load};
type RetryState={Screen:Lazy;attempt:number};
type Deferred=((props:Props)=>View)&{preload:Load};
const lazyChild=(view:View)=>(view.props['children'] as View).props['children'] as View;
function setup(load:Load){
 let state:RetryState|undefined;
 const jsx=(type:unknown,props:Props,key?:number)=>({type,props,key});
 const exports:Record<string,(name:string,load:Load)=>Deferred>={};
 class Component{constructor(public props:Props){} }
 const react={Component,Suspense:'Suspense',lazy:(loader:Load)=>({loader}),useState:(initial:()=>RetryState)=>{
  state??=initial();return [state,(next:(current:RetryState)=>RetryState)=>{state=next(state!);}];
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('components/game/DeferredScreen.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:(name:string)=>name==='react'?react:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:{} });
 return exports['deferredGameScreen']!('TestScreen',load);
}

it('shares an in-flight preload, releases rejected loads and caches only the successful module',async()=>{
 let calls=0,reject!:(reason:Error)=>void;
 const component=()=>null,loadedModule={default:component};
 const screen=setup(()=>{calls++;return calls===1?new Promise((_resolve,no)=>{reject=no;}):Promise.resolve(loadedModule);});
 const first=screen.preload(),same=screen.preload();assert.equal(first,same);assert.equal(calls,1);
 reject(new Error('offline'));await assert.rejects(first,/offline/);
 assert.equal(await screen.preload(),loadedModule);assert.equal(calls,2);
 assert.equal(await screen.preload(),loadedModule);assert.equal(calls,2);
});

it('retries the failed screen with a new lazy boundary while preserving its parent props',async()=>{
 let calls=0;const loadedModule={default:()=>null};
 const screen=setup(()=>++calls===1?Promise.reject(new Error('offline')):Promise.resolve(loadedModule));
 const props={worldId:'world-1',progress:{stars:40},onContinue:()=>{throw Error('Retry must not navigate');}};
 const first=screen(props),firstChild=lazyChild(first);
 await assert.rejects((firstChild.type as Lazy).loader(),/offline/);
 const Boundary=first.type as new(props:Props)=>{state:{failed:boolean};render:()=>View};
 const boundary=new Boundary(first.props);boundary.state={failed:true};
 const error=boundary.render(),button=(error.props['children'] as View[])[1]!;
 (button.props['onClick'] as ()=>void)();
 const second=screen(props),secondChild=lazyChild(second);
 assert.notEqual(first.key,second.key);assert.notEqual(firstChild.type,secondChild.type);
 assert.equal(secondChild.props['progress'],props.progress);assert.equal(secondChild.props['onContinue'],props.onContinue);
 assert.equal(await (secondChild.type as Lazy).loader(),loadedModule);assert.equal(calls,2);
});
