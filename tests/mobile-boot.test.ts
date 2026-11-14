import {it} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const script=readFileSync('mobile/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)![1]!;
function boot(){
 type Boot={status:{textContent:string};retry:{hidden:boolean;onclick?:()=>void};cloneNode:()=>Boot;remove:()=>void;querySelector:(s:string)=>Boot['status']|Boot['retry']};
 let current:Boot|null;const handlers:Record<string,(event?:unknown)=>void>={},timers:(()=>void)[]=[];
 const make=():Boot=>{const status={textContent:''},retry={hidden:true,onclick:undefined};return{status,retry,cloneNode:make,remove(){current=null;},querySelector:(s:string)=>s.includes('status')?status:retry};};
 current=make();const document={getElementById:()=>current,body:{append:(node:Boot)=>{current=node;}}};
 const window={addEventListener:(type:string,fn:(event?:unknown)=>void)=>{handlers[type]=fn;},kelimeBootFailed:()=>{}};
 vm.runInNewContext(script,{window,document,location:{reload(){}},setTimeout:(fn:()=>void)=>{timers.push(fn);}});
 return{current:()=>current,ready:()=>handlers['kt-game-ready']!(),fail:()=>window.kelimeBootFailed(),timeout:()=>timers[0]!(),error:(tagName:string)=>handlers['error']!({target:{tagName}})};
}
it('the boot layer survives root mounting, leaves only on ready and ignores optional image failure',()=>{const b=boot();assert(b.current());b.error('IMG');b.ready();assert.equal(b.current(),null);b.timeout();assert.equal(b.current(),null);});
it('timeout or fatal render failure remains retryable even if a late ready event arrives',()=>{for(const trigger of ['timeout','fail'] as const){const b=boot();b[trigger]();b.ready();assert.equal(b.current()!.retry.hidden,false);assert.match(b.current()!.status.textContent,/açılamadı/);}});
it('a failed entry script cannot be covered up by ready; a post-ready React crash restores retry',()=>{const b=boot();b.error('SCRIPT');b.ready();assert.equal(b.current()!.retry.hidden,false);const c=boot();c.ready();c.fail();assert.equal(c.current()!.retry.hidden,false);});
