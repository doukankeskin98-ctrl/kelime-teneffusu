import * as projection from '../lib/game/board-projection.ts';
import assert from 'node:assert/strict';import {it} from 'node:test';import {readFileSync} from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
it('draw guide pauses on background/blur, respects native inactivity and removes listeners on unmount',()=>{
 const exports:Record<string,any>={},ref={current:{hidden:false}},document=Object.assign(new EventTarget(),{hidden:false}),window=new EventTarget();let active=true,cleanup:(()=>void)|undefined;
 const code=ts.transpileModule(readFileSync('components/game/DrawGuide.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,document,window,require:(name:string)=>name==='@/lib/game/board-projection'?projection:name==='react'?{useRef:()=>ref,useEffect:(f:()=>()=>void)=>{cleanup=f();}}:name==='@/lib/platform/runtime'?{gameIsActive:()=>active}:{jsx:(type:any,props:any)=>({type,props}),jsxs:(type:any,props:any)=>({type,props})}});
 const tree=exports['DrawGuide']({size:8,a:[7,7],b:[0,0]});assert.equal(tree.props['aria-hidden'],'true');assert.equal(tree.props.style['--guide-dx'],'-87.5%');assert.equal(tree.props.style['--guide-dy'],'-87.5%');assert.equal(ref.current.hidden,false);
 document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));assert(ref.current.hidden);document.hidden=false;active=false;document.dispatchEvent(new Event('visibilitychange'));assert(ref.current.hidden);active=true;window.dispatchEvent(new Event('focus'));assert(!ref.current.hidden);
 window.dispatchEvent(new Event('blur'));assert(ref.current.hidden);window.dispatchEvent(new Event('focus'));assert(!ref.current.hidden);window.dispatchEvent(new Event('pagehide'));assert(ref.current.hidden);
 cleanup!();ref.current.hidden=false;document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('blur'));assert(!ref.current.hidden);
});
