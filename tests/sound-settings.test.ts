// Actual settings + preference module in a fresh VM, with a controlled device store.
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const compile=(file:string)=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const audioSource=compile('lib/game/sound.ts'),settingsSource=compile('components/game/SoundSettings.tsx');
const nodes=(v:any):any[]=>Array.isArray(v)?v.flatMap(nodes):v&&typeof v==='object'?[v,...nodes(v.props?.children)]:[];
const text=(v:any):string=>Array.isArray(v)?v.map(text).join(''):typeof v==='string'||typeof v==='number'?String(v):v&&typeof v==='object'?text(v.props?.children):'';
function settings(values=new Map<string,string>(),enabled=true){
 let fail=false,cursor=0,dirty=true,tree:any;const slots:any[]=[],effects:(()=>void)[]=[],chimes:string[]=[],window=new EventTarget();
 const storage={getItem:(key:string)=>values.get(key)??null,setItem(key:string,value:string){if(fail)throw new Error('blocked');values.set(key,value);}};
 const audio:Record<string,any>={};vm.runInNewContext(audioSource,{exports:audio,window,localStorage:storage,Event});
 const hooks={useState(v:any){const slot=slots[cursor++]??={value:v};return[slot.value,(next:any)=>{slot.value=next;dirty=true;}];},useId(){return 'sound-setting';},useEffect(fn:()=>void,deps:unknown[]){const slot=slots[cursor++]??={};if(!slot.deps||deps.some((v,i)=>!Object.is(v,slot.deps[i]))){slot.deps=deps;effects.push(()=>{slot.cleanup?.();slot.cleanup=fn();});}}};
 const props={enabled,onChange(next:boolean){props.enabled=next;dirty=true;}},exports:Record<string,any>={};
 const jsx=(type:any,props:any)=>({type,props});
 vm.runInNewContext(settingsSource,{exports,require:(name:string)=>name==='react'?hooks:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name==='lucide-react'?{Play:'Play',Volume2:'Volume2',VolumeX:'VolumeX'}:name==='@/lib/game/sound'?audio:{useChime:()=>((action:string)=>{chimes.push(action);if(action==='enable'&&audio['readSoundLevel']()===0)audio['setSoundLevel'](audio['DEFAULT_SOUND_LEVEL']);})},window});
 const paint=()=>{for(let i=0;(dirty||effects.length)&&i<30;i++){if(dirty){dirty=false;cursor=0;tree=exports['SoundSettings'](props);}while(effects.length)effects.shift()!();}return tree;};paint();
 return{audio,props,values,chimes,paint,fail(v:boolean){fail=v;},get tree(){return tree;},find(predicate:(n:any)=>boolean){const result=nodes(tree).find(predicate);assert(result);return result;},change(percent:number){nodes(tree).find(n=>n.type==='input').props.onChange({currentTarget:{value:String(percent)}});paint();},close(){for(const s of slots)s.cleanup?.();}};
}
describe('all-effects volume slider',()=>{
 it('covers every0–100 value, applies immediately and restores the exact value after a fresh module load',()=>{
  const map=new Map<string,string>(),s=settings(map);for(let n=0;n<=100;n++){s.change(n);assert.equal(s.audio['readSoundLevel'](),n/100);assert.equal(s.find(x=>x.type==='input').props.value,n);assert.equal(s.props.enabled,n>0);}
  s.change(73);const id=s.find(x=>x.type==='input').props.id;assert.equal(s.find(x=>x.type==='label').props.htmlFor,id);s.close();
  const reopened=settings(map);assert.equal(reopened.find(x=>x.type==='input').props.value,73);assert.equal(reopened.audio['readSoundLevel'](),.73);reopened.close();
 });
 it('keeps0 silent after reopening and lets the explicit switch unmute it again',()=>{
  const s=settings();s.change(0);assert.equal(s.props.enabled,false);assert.equal(s.find(x=>x.type==='input').props['aria-valuetext'],'Kapalı');assert(s.find(x=>x.type==='button'&&text(x).includes('Sesi dene')).props.disabled);
  const values=s.values;s.close();const reopened=settings(values,false);assert.equal(reopened.audio['readSoundLevel'](),0);reopened.find(x=>x.props?.role==='switch').props.onClick();reopened.paint();assert.equal(reopened.props.enabled,true);assert.equal(reopened.find(x=>x.type==='input').props.value,30);reopened.close();
 });
 it('applies a blocked-storage preference in-session, explains persistence failure and retries without losing the setting',()=>{
  const s=settings(new Map([['kt-sound-level-v1','.55']]));s.fail(true);s.change(88);assert.equal(s.audio['readSoundLevel'](),.88);assert.equal(s.values.get('kt-sound-level-v1'),'.55');assert(text(s.tree).includes('Ayar bu oturumda uygulandı'));
  s.fail(false);s.find(x=>x.type==='button'&&text(x).includes('Kaydetmeyi yeniden dene')).props.onClick();s.paint();assert.equal(s.values.get('kt-sound-level-v1'),'0.88');assert(!text(s.tree).includes('kaydedilemedi'));s.close();
 });
});
