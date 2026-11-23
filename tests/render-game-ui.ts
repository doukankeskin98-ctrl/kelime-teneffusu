// Shallow component harnesses render the actual stateless UI primitives so clicks,
// labels and keyboard navigation exercise the same elements as the browser.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
export function testGameUi(jsx:unknown){
 const exports:Record<string,unknown>={};
 const source=ts.transpileModule(readFileSync('components/ui/GameUI.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports,require:(name:string)=>name==='react/jsx-runtime'?{jsx,jsxs:jsx,Fragment:'Fragment'}:name==='lucide-react'?new Proxy({},{get:(_,k)=>String(k)}):{}});
 return exports;
}
