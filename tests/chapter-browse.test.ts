import * as riddleContent from '../lib/game/riddle-content.ts';
// Executes actual hooks/components with controlled IO. No browser layout or phone claims.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as content from '../lib/studio/content.ts';
import * as browse from '../lib/studio/chapter-browse.ts';
import * as stamps from '../lib/studio/release-stamps.ts';
import * as cardProgress from '../lib/studio/card-progress.ts';
import * as progress from '../lib/game/progress.ts';
import * as catalog from '../lib/game/catalog.ts';
import {releaseCatalogue} from '../lib/studio/releases.ts';
import type {ChapterBrowseReturn} from '../lib/studio/chapter-browse.ts';
import type {PublishedChapter} from '../lib/studio/content.ts';

type Node={type:unknown;props:Record<string,any>};
type Slot={value?:any;ref?:{current:any};deps?:unknown[];cleanup?:()=>void};
const chapters=releaseCatalogue(0,Date.parse('2026-10-25T20:00Z')).chapters;
const first=chapters[0]!,pair=stamps.releasePairs(chapters)[0]!;
function snapshot(overrides:Partial<ChapterBrowseReturn>={}):ChapterBrowseReturn{
 return {source:'archive',ownerId:'alice',collection:'releases',chapters,companions:[],nextOffset:null,hasPage:true,selectedId:first.id,...overrides};
}
function nodes(value:unknown):Node[]{
 if(Array.isArray(value))return value.flatMap(nodes);
 if(!value||typeof value!=='object')return [];
 const node=value as Node;return [node,...nodes(node.props?.['children'])];
}
function pick(tree:unknown,type:string){const node=nodes(tree).find(n=>n.type===type);assert.ok(node,type);return node;}
function deferred<T>(){let resolve!:(v:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return {promise,resolve};}
function harness(file:string,modules:Record<string,unknown>={},globals:Record<string,unknown>={}){
 const slots:Slot[]=[],effects:(()=>void)[]=[],exports:Record<string,any>={};
 let cursor=0,dirty=true,mounted=true,afterUnmount=0,render:()=>any,tree:any;
 const hooks={useState(initial:any){const slot=slots[cursor++]??={value:typeof initial==='function'?initial():initial};return [slot.value,(next:any)=>{if(!mounted)afterUnmount++;const value=typeof next==='function'?next(slot.value):next;if(!Object.is(value,slot.value)){slot.value=value;dirty=true;}}];},
  useRef(initial:any){return (slots[cursor++]??={}).ref??={current:initial};},
  useEffect(fn:()=>void|(()=>void),deps:unknown[]){const slot=slots[cursor++]??={};if(!slot.deps||deps.some((d,i)=>!Object.is(d,slot.deps![i]))){slot.deps=deps;effects.push(()=>{slot.cleanup?.();const clean=fn();slot.cleanup=typeof clean==='function'?clean:undefined;});}},
  useId:()=> 'catalogue-test-id',useMemo:(fn:()=>any)=>fn()};
 const jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(code,{exports,require:(name:string)=>name==='@/lib/game/riddle-content'?riddleContent:name==='react'?hooks:name==='react/jsx-runtime'?{jsx,jsxs:jsx,Fragment:'Fragment'}:modules[name]??new Proxy({},{get:(_t,key)=>String(key)}),URL,URLSearchParams,AbortController,Event,console,...globals});
 const paint=()=>{for(let i=0;dirty&&i<30;i++){dirty=false;cursor=0;tree=render();while(effects.length)effects.shift()!();}return tree;};
 return {exports,start(fn:()=>any){render=fn;return paint();},paint,async settle(){for(let i=0;i<12;i++){await Promise.resolve();paint();}return tree;},unmount(){mounted=false;for(const slot of slots)slot.cleanup?.();},get afterUnmount(){return afterUnmount;}};
}
function catalogue(options:{restore?:ChapterBrowseReturn;online?:boolean;storage?:Map<string,string>}={}){
 const flights:{url:string;signal:AbortSignal;reply:ReturnType<typeof deferred<Response>>}[]=[],events=new EventTarget(),navigator={onLine:options.online!==false},storage=options.storage??new Map<string,string>();
 const h=harness('components/game/useChapterCatalogue.ts',{'@/lib/studio/content':content},{navigator,window:events,localStorage:{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v)},fetch:(url:string,init:{signal:AbortSignal})=>{const reply=deferred<Response>();flights.push({url,signal:init.signal,reply});return reply.promise;}});
 h.start(()=>h.exports['useChapterCatalogue']({initial:[],initialCompanions:[],collection:'releases',restore:options.restore}));
 return {...h,get afterUnmount(){return h.afterUnmount;},flights,events,navigator,storage,async respond(index:number,items:PublishedChapter[],next:number|null,ok=true){flights[index]!.reply.resolve({ok,json:async()=>({chapters:items,nextOffset:next,companions:[]})} as Response);return h.settle();}};
}
const fixture=Array.from({length:54},(_,i)=>({...first,id:`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`}));

describe('catalogue return and interrupted pagination',()=>{
 it('restores two loaded pages and next offset immediately without a network request, including offline',async()=>{
  const value=snapshot({chapters:fixture.slice(0,48),nextOffset:48,selectedId:fixture[40]!.id}),h=catalogue({restore:value,online:false});
  const state=h.paint();assert.equal(h.flights.length,0);assert.equal(state.chapters.length,48);assert.equal(state.next,48);assert.equal(state.loading,false);assert.equal(state.offline,true);
  h.navigator.onLine=true;state.more();assert.equal(new URL(h.flights[0]!.url,'https://test').searchParams.get('offset'),'48');
  const full=await h.respond(0,fixture.slice(48),null);assert.equal(full.chapters.length,54);assert.equal(full.next,null);
 });
 it('finishes the first catalogue page when a card was selected before its response',async()=>{
  const value=snapshot({chapters:fixture.slice(0,2),hasPage:false}),h=catalogue({restore:value});
  assert.equal(h.paint().chapters.length,2);assert.equal(h.flights.length,1);
  const loaded=await h.respond(0,fixture.slice(0,24),24);assert.equal(loaded.next,24);assert.equal(loaded.chapters.length,24);
 });
 it('retries the failed second page and keeps the first page and offset',async()=>{
  const h=catalogue();await h.respond(0,fixture.slice(0,24),24);h.paint().more();
  const failed=await h.respond(1,[],null,false);assert.equal(failed.chapters.length,24);assert.equal(failed.next,24);assert.match(failed.error,/yüklenemedi/);
  failed.retry();assert.equal(new URL(h.flights[2]!.url,'https://test').searchParams.get('offset'),'24');
  const done=await h.respond(2,fixture.slice(24,48),48);assert.equal(done.chapters.length,48);assert.equal(done.next,48);
 });
 it('reconnect refresh retains older pages, companions, and known end of archive',async()=>{
  const old=snapshot({chapters:fixture.slice(0,48),companions:[fixture[50]!],selectedId:fixture[40]!.id}),h=catalogue({restore:old});
  h.events.dispatchEvent(new Event('online'));
  const refreshed=await h.respond(0,[fixture[53]!,...fixture.slice(0,23)],24);
  assert.equal(refreshed.chapters.length,49);assert.equal(refreshed.next,null);assert.equal(refreshed.companions[0].id,fixture[50]!.id);assert.ok(refreshed.chapters.some((c:PublishedChapter)=>c.id===fixture[40]!.id));
 });
 it('adjusts the cursor for new front releases and fills a non-overlapping reconnect gap',async()=>{
  const old=snapshot({chapters:fixture.slice(2,50),nextOffset:48,selectedId:fixture[40]!.id}),h=catalogue({restore:old});
  h.events.dispatchEvent(new Event('online'));const shifted=await h.respond(0,fixture.slice(0,24),24);
  assert.equal(shifted.next,50);assert.equal(shifted.chapters.length,50);
  const separated=catalogue({restore:snapshot({chapters:fixture.slice(48),nextOffset:null,selectedId:fixture[50]!.id})});
  separated.events.dispatchEvent(new Event('online'));let view=await separated.respond(0,fixture.slice(0,24),24);
  assert.equal(view.next,24);assert.equal(view.chapters.length,30);view.more();view=await separated.respond(1,fixture.slice(24,48),48);
  assert.equal(view.chapters.length,54);assert.equal(view.next,48);
 });
 it('ignores an aborted late response and does not update an unmounted catalogue',async()=>{
  const h=catalogue();h.events.dispatchEvent(new Event('online'));assert.equal(h.flights[0]!.signal.aborted,true);
  await h.respond(1,fixture.slice(0,24),24);await h.respond(0,[fixture[53]!],null);assert.equal(h.paint().chapters.length,24);
  h.paint().more();h.unmount();assert.equal(h.flights[2]!.signal.aborted,true);await h.respond(2,fixture.slice(24),null);assert.equal(h.afterUnmount,0);
 });
 it('keeps the existing validated first-page cache when a cold request fails offline',async()=>{
  const storage=new Map([['kt-published-catalogue-v1:releases',JSON.stringify(chapters)]]),h=catalogue({online:false,storage});
  const state=await h.respond(0,[],null,false);assert.equal(state.chapters.length,chapters.length);assert.equal(state.offline,true);assert.equal(state.loading,false);
 });
});

const catalogueModules={'@/lib/studio/chapter-browse':browse,'@/lib/studio/release-stamps':stamps,'@/lib/game/catalog':catalog,'@/lib/studio/card-progress':cardProgress,
 './useChapterCards':{useChapterCards:()=>({values:{},status:'ready',available:{},retry(){}})},'./WorldArt':{WorldArt:'WorldArt'},'./ReleaseAlbum':{ReleaseAlbum:'ReleaseAlbum'},'./common':{Modal:'Modal'}};
describe('actual return UI wiring',()=>{
 it('captures public range, owner, selected date and card before Album closes',()=>{
  let selected:unknown[]=[];const h=harness('components/game/PublishedChapters.tsx',{...catalogueModules,'./useChapterCatalogue':{useChapterCatalogue:()=>({chapters,companions:[],next:24,hasPage:true,loading:false,offline:false,error:''})}},{requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
  const tree=h.start(()=>h.exports['PublishedChapters']({collection:'releases',presentation:'album',userId:'alice',onPlay:(...args:unknown[])=>{selected=args;}}));
  let closed=false;const card=pick(tree,'ReleaseAlbum').props['renderCard'](first,()=>{closed=true;});card.props['onClick']();
  assert.equal(closed,true);const origin=selected[3] as ChapterBrowseReturn;
  assert.equal(origin.source,'album');assert.equal(origin.ownerId,'alice');assert.equal(origin.selectedDate,pair.date);assert.equal(origin.selectedId,first.id);assert.equal(origin.nextOffset,24);assert.equal(origin.chapters,chapters);assert.equal('values' in origin,false);assert.equal('save' in origin,false);
 });
 it('requests focus and nearest-card return only after the restored list mounts',()=>{
  let frame:(()=>void)|undefined,focused=false,scrolled=false;
  const value=snapshot(),h=harness('components/game/PublishedChapters.tsx',{...catalogueModules,'./useChapterCatalogue':{useChapterCatalogue:()=>({chapters,companions:[],next:null,hasPage:true,loading:false,offline:false,error:''})}},{requestAnimationFrame:(fn:()=>void)=>{frame=fn;return 1;},cancelAnimationFrame(){}});
  const tree=h.start(()=>h.exports['PublishedChapters']({collection:'releases',userId:'alice',browseReturn:value,onPlay(){}}));
  const list=pick(tree,'section');list.props['ref'].current={querySelectorAll:()=>[{dataset:{browseChapter:'another'}},{dataset:{browseChapter:first.id},focus:(o:{preventScroll:boolean})=>{assert.equal(o.preventScroll,true);focused=true;},scrollIntoView:(o:{block:string;behavior:string})=>{assert.equal(o.block,'nearest');assert.equal(o.behavior,'instant');scrolled=true;}}]};
  assert.equal(focused,false);assert.ok(frame);frame();assert.equal(focused,true);assert.equal(scrolled,true);
 });
 it('reopens the selected Album date and its close control returns to the shelf',()=>{
  const h=harness('components/game/ReleaseAlbum.tsx',{'@/lib/studio/release-stamps':stamps,'./common':{Modal:'Modal'}});
  const tree=h.start(()=>h.exports['ReleaseAlbum']({pairs:stamps.releasePairs(chapters),values:{},status:'ready',initialSelectedDate:pair.date,renderCard:(c:PublishedChapter)=>c.spec.title}));
  const modal=pick(tree,'Modal');assert.equal(modal.props['title'],stamps.releaseDateLabel(pair.date)+' keşifleri');modal.props['onClose']();assert.equal(nodes(h.paint()).some(n=>n.type==='Modal'),false);
 });
 it('reopens only the same owner archive; a direct card does not open it',()=>{
  for(const owner of ['alice','bob']){
   const onPlay=()=>{},origin=snapshot(),h=harness('components/game/DailyDiscoveries.tsx',{...catalogueModules,'./PublishedChapters':{PublishedChapters:'PublishedChapters'},'@/lib/game/updates':{GAME_UPDATES:[{version:'test'}]}});
   const tree=h.start(()=>h.exports['DailyDiscoveries']({chapters,userId:owner,onPlay,browseReturn:origin}));
   assert.equal(nodes(tree).some(n=>n.type==='Modal'),owner==='alice');if(owner==='alice')assert.equal(pick(tree,'PublishedChapters').props['onPlay'],onPlay);
  }
  const h=harness('components/game/DailyDiscoveries.tsx',{...catalogueModules,'@/lib/game/updates':{GAME_UPDATES:[{version:'test'}]}});
  assert.equal(nodes(h.start(()=>h.exports['DailyDiscoveries']({chapters,onPlay(){}}))).some(n=>n.type==='Modal'),false);
 });
 it('rejects another owner, source, collection or theme and a missing selected card',()=>{
  const value=snapshot();assert.equal(browse.matchingChapterBrowse(value,'archive','alice','releases'),value);
  for(const args of [['archive','bob','releases',undefined],['album','alice','releases',undefined],['archive','alice','studio',undefined],['archive','alice','releases','uzay']] as const)
   assert.equal(browse.matchingChapterBrowse(value,args[0],args[1],args[2],args[3]),undefined);
  assert.equal(browse.matchingChapterBrowse({...value,selectedId:'missing'},'archive','alice','releases'),undefined);
 });
 it('routes related chapters back to their first archive or Album and clears it for a direct home entry',async()=>{
  const values=new Map([[progress.PROGRESS_KEY,JSON.stringify({...progress.emptyProgress(),tutorialDone:true})]]),events=Object.assign(new EventTarget(),{scrollTo(){}}),location={href:'https://test/',search:''};
  const h=harness('components/game/App.tsx',{'@/lib/game/progress':progress,'@/lib/game/catalog':catalog,'@/lib/game/content':{JOURNEYS:[]},'@/lib/game/engine':{istanbulDay:()=> '2026-10-25'},'@/lib/game/legacy':{SAVE_KEY:'legacy'},'@/components/auth/useMembership':{useMembership:()=>({ready:true,revision:0})},'./useCloudProgress':{useCloudProgress:()=> 'account-changed'},'./ProgressAccountNotice':{ProgressAccountNotice:'ProgressAccountNotice'},'./common':{Modal:'Modal',getApi:async()=>({authenticated:true,profile:{id:'alice',nickname:'Alice'}})},'./Pages':{Explore:'Explore',ProfilePage:'ProfilePage'},'./PublishedChapters':{PublishedPlay:'PublishedPlay',PublishedChapters:'PublishedChapters'}},
   {window:events,location,history:{replaceState(){}},localStorage:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)},navigator:{onLine:true}});
  h.start(()=>h.exports['GameApp']({releases:chapters,releaseCounts:{[first.spec.themeId]:2}}));await h.settle();
  assert.equal(pick(h.paint(),'ProgressAccountNotice').props['status'],'account-changed');assert.equal(pick(h.paint(),'ProgressAccountNotice').props['inGame'],false);
  const origin=snapshot();pick(h.paint(),'Explore').props['onExtra'](first,false,pair,origin);
  assert.equal(pick(h.paint(),'ProgressAccountNotice').props['status'],'account-changed');assert.equal(pick(h.paint(),'ProgressAccountNotice').props['inGame'],true);pick(h.paint(),'PublishedPlay').props['onRelated'](pair.chapters[1],pair);pick(h.paint(),'PublishedPlay').props['onBack']();assert.equal(pick(h.paint(),'Explore').props['browseReturn'],origin);
  for(const mode of ['Solo','Mystery','Sprint']){
   const view=pick(h.paint(),'Explore');view.props['onExtra'](first,false,pair,origin);pick(h.paint(),'PublishedPlay').props['onBack']();
   const restored=pick(h.paint(),'Explore');if(mode==='Solo')restored.props['openSolo']({themeId:'uzay',level:0});else if(mode==='Mystery')restored.props['onMystery']('fixture');else restored.props['onSprint']();
   assert.equal(pick(h.paint(),'ProgressAccountNotice').props['status'],'account-changed',mode+' notice');assert.equal(pick(h.paint(),'ProgressAccountNotice').props['inGame'],true,mode+' reload guard');pick(h.paint(),mode).props['onBack']();assert.equal(pick(h.paint(),'Explore').props['browseReturn'],undefined,mode+' clears stale return intent');
  }
  pick(h.paint(),'Explore').props['onExtra'](first,false,pair);pick(h.paint(),'PublishedPlay').props['onBack']();assert.equal(pick(h.paint(),'Explore').props['browseReturn'],undefined);
  const home=pick(h.paint(),'Explore'),theme=catalog.THEMES.find(t=>t.id===first.spec.themeId)!;
  home.props['setTheme'](theme);const world=snapshot({source:'world',themeId:theme.id});pick(h.paint(),'PublishedChapters').props['onPlay'](first,false,pair,world);
  pick(h.paint(),'PublishedPlay').props['onRelated'](pair.chapters[1],pair);pick(h.paint(),'PublishedPlay').props['onBack']();
  const returnedWorld=pick(h.paint(),'PublishedChapters');assert.equal(returnedWorld.props['themeId'],theme.id);assert.equal(returnedWorld.props['browseReturn'],world);
  pick(h.paint(),'Explore').props['setNav']('profil');await h.settle();const album=snapshot({source:'album',selectedDate:pair.date});pick(h.paint(),'ProfilePage').props['onExtra'](first,false,pair,album);pick(h.paint(),'PublishedPlay').props['onBack']();assert.equal(pick(h.paint(),'ProfilePage').props['browseReturn'],album);
 });
});
