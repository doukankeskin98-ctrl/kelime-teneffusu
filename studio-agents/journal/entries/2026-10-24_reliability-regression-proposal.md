# Yerel hata dönüşü için dar regresyon önerisi · 24 Ekim 2026

Hedef yalnız ilk incelemenin 1 numaralı bulgusu: geçerli cihaz tahtasıyla açılan hata dönüşünde tamamlanmanın buluta gönderilecek sayılması. Aşağıdaki blok koordinatör tarafından `tests/published-play-sync.test.ts` olarak eklenebilir; bu incelemede uygulama/test dosyası oluşturulmadı. Mevcut `typescript`, `node:test` ve Node VM yeterlidir; yeni bağımlılık yok.

Çalıştırma: `node --experimental-strip-types --experimental-transform-types --test tests/published-play-sync.test.ts`. Böylece mevcut `tests/*.test.ts` komutu da testi kapsar. Test gerçek `PublishedChapters.tsx` dosyasını okur, yalnız TypeScript/JSX derlemesi uygular ve gerçek `PublishedPlay` fonksiyonunu çağırır. Üretim `catch`, `dirty`, `flush` veya birleştirme mantığının kopyası yoktur; davranış kaynak metninde kelime arayarak sınanmaz.

```ts
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as cache from '../lib/studio/chapter-cache.ts';
import * as chapterProgress from '../lib/studio/chapter-progress.ts';
import * as progress from '../lib/game/progress.ts';
import * as content from '../lib/studio/content.ts';
import {RELEASE_BATCHES} from '../lib/studio/releases.ts';
import type {SavedLevel} from '../lib/game/progress.ts';
import type {Puzzle} from '../lib/game/engine.ts';

const chapter=RELEASE_BATCHES[0]!.chapters[0]!.chapter;
const complete=progress.cleanSave({strokes:chapter.board.placements,
 elapsed:19,hints:0,complete:false,stars:0},chapter.board);
const compiled=ts.transpileModule(
 readFileSync('components/game/PublishedChapters.tsx','utf8'),
 {compilerOptions:{module:ts.ModuleKind.CommonJS,
  jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}
).outputText;
type VNode={type:unknown;props:Record<string,unknown>};
type Slot={value?:unknown;ref?:{current:unknown};deps?:unknown[];cleanup?:()=>void};
type Timer={fn:()=>void;delay:number;repeat:boolean};
type SoloView={props:{config:{practice:boolean};external:{
 board:Puzzle;save?:SavedLevel;onSave:(save:SavedLevel)=>void}}};
function deferred<T>(){
 let resolve!:(value:T)=>void;
 const promise=new Promise<T>(yes=>{resolve=yes;});
 return {promise,resolve};
}
const response=(save:SavedLevel)=>({ok:true,json:async()=>({save})}) as Response;
function children(node:unknown):unknown[]{
 if(Array.isArray(node))return node;
 if(!node||typeof node!=='object')return [];
 const value=(node as VNode).props?.['children'];
 return Array.isArray(value)?value:[value];
}
function findSolo(node:unknown):SoloView|undefined{
 if(node&&typeof node==='object'&&(node as VNode).type==='Solo')
  return node as unknown as SoloView;
 for(const child of children(node)){const found=findSolo(child);if(found)return found;}
 return undefined;
}
function textOf(node:unknown):string{
 return typeof node==='string'?node:children(node).map(textOf).join(' ');
}

function harness(owner:string,mode:'reject'|'timeout'){
 const values=new Map<string,string>([
  [cache.BOARD_KEY,JSON.stringify({[chapter.id]:chapter})],
  [cache.saveKey('alice'),JSON.stringify({[chapter.id]:complete})]
 ]),reads:string[]=[];
 const storage={getItem:(key:string)=>{reads.push(key);return values.get(key)??null;},
  setItem:(key:string,value:string)=>{values.set(key,value);}};
 const puts:{id:string;save:SavedLevel}[]=[],upload=deferred<Response>();
 const request=async(path:string,init:RequestInit={}):Promise<Response>=>{
  if(init.method==='PUT'){
   puts.push(JSON.parse(String(init.body)) as {id:string;save:SavedLevel});
   return upload.promise;
  }
  assert.equal(path,'/api/chapters?id='+encodeURIComponent(chapter.id));
  if(mode==='reject')throw new Error('Controlled network failure');
  assert.ok(init.signal);
  const signal=init.signal;
  return new Promise((_resolve,reject)=>{
   const abort=()=>reject(new DOMException('Aborted','AbortError'));
   if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});
  });
 };
 const slots:Slot[]=[],effects:(()=>void)[]=[],timers=new Map<number,Timer>();
 let cursor=0,timerId=0,pendingRender=true,tree:unknown;
 const hooks={
  useState(initial:unknown){
   const slot=slots[cursor]??=( {value:typeof initial==='function'?initial():initial} );
   cursor++;
   return [slot.value,(next:unknown)=>{
    const value=typeof next==='function'?next(slot.value):next;
    if(!Object.is(slot.value,value)){slot.value=value;pendingRender=true;}
   }];
  },
  useRef(initial:unknown){
   const slot=slots[cursor++]??={};return slot.ref??={current:initial};
  },
  useEffect(effect:()=>void|(()=>void),deps:unknown[]){
   const slot=slots[cursor++]??={};
   if(!slot.deps||slot.deps.length!==deps.length||
    deps.some((value,i)=>!Object.is(value,slot.deps![i]))){
    slot.deps=deps;
    effects.push(()=>{slot.cleanup?.();const cleanup=effect();
     slot.cleanup=typeof cleanup==='function'?cleanup:undefined;});
   }
  },useId:()=> 'test-id'
 };
 const windowTarget=new EventTarget();
 const documentTarget=Object.assign(new EventTarget(),{hidden:false});
 const timer=(repeat:boolean)=>(fn:()=>void,delay:number)=>{
  const id=++timerId;timers.set(id,{fn,delay,repeat});return id;
 };
 const exports:Record<string,unknown>={};
 const jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
 const modules:Record<string,unknown>={
  react:hooks,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},
  '@/lib/game/progress':progress,'@/lib/studio/content':content,
  '@/lib/studio/chapter-progress':chapterProgress,
  '@/lib/studio/chapter-cache':{...cache,
   dictionary:(key:string)=>cache.dictionary(key,storage),
   rememberChapter:(value:content.PlayableChapter)=>cache.rememberChapter(value,storage)},
  '@/lib/auth/firebase-client':{memberFetch:request},
  '@/lib/studio/release-stamps':{playableReleasePair:()=>null},
  './Solo':{Solo:'Solo'},
  './useChapterCards':{useChapterCards:()=>({values:{},status:'ready',retry(){}})}
 };
 vm.runInNewContext(compiled,{exports,
  require:(name:string)=>modules[name]??{},fetch:request,localStorage:storage,
  navigator:{onLine:true},AbortController,DOMException,queueMicrotask,
  window:windowTarget,document:documentTarget,
  setTimeout:timer(false),setInterval:timer(true),
  clearTimeout:(id:number)=>timers.delete(id),clearInterval:(id:number)=>timers.delete(id)
 });
 const play=exports['PublishedPlay'] as (props:unknown)=>unknown;
 const render=()=>{
  pendingRender=false;cursor=0;
  tree=play({chapter,userId:owner,progress:progress.emptyProgress(),
   onProgress(){},onBack(){}});
  for(const effect of effects.splice(0))effect();
 };
 return {
  puts,reads,values,upload,
  async settle(){
   for(let i=0;i<30;i++){await Promise.resolve();if(pendingRender)render();}
  },
  solo(){const solo=findSolo(tree);assert.ok(solo,'validated cached board should open');return solo;},
  hasSolo:()=>!!findSolo(tree),text:()=>textOf(tree),
  mountSolo(){
   const solo=this.solo(),external=solo.props.external;
   // Solo.tsx calls onSave with its initial save once on mount; no new move.
   external.onSave(progress.cleanSave(solo.props.config.practice?undefined:external.save,external.board));
  },
  online:()=>windowTarget.dispatchEvent(new Event('online')),
  tick(){for(const entry of [...timers.values()])if(entry.repeat)entry.fn();},
  expireLoad(){
   const entry=[...timers.values()].find(value=>!value.repeat);
   assert.ok(entry,'load should have an abort deadline');entry.fn();
  },
  close(){for(const slot of slots)slot.cleanup?.();timers.clear();}
 };
}

describe('PublishedPlay cached completion after failed board fetch',()=>{
 for(const mode of ['reject','timeout'] as const){
  it(`${mode}: uploads unchanged device completion and waits for acknowledgement`,async()=>{
   const page=harness('alice',mode);
   try{
    await page.settle();
    if(mode==='timeout'){
     assert.equal(page.hasSolo(),false);
     assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
     page.expireLoad();await page.settle();
    }
    assert.equal(page.solo().props.external.save?.complete,true);
    assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
    page.mountSolo();await page.settle();
    page.online();page.tick();await page.settle();
    assert.equal(page.puts.length,1,'completion must upload without a new move');
    assert.equal(page.puts[0]!.id,chapter.id);
    assert.equal(JSON.stringify(page.puts[0]!.save),JSON.stringify(complete));
    assert.doesNotMatch(page.text(),/Hesabında kayıtlı/,'PUT is still pending');
    page.upload.resolve(response(complete));await page.settle();
    assert.match(page.text(),/Hesabında kayıtlı/);
    assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
   }finally{page.close();}
  });
 }
 it('never reads another owner’s completion from the same cached board',async()=>{
  const page=harness('bob','reject');
  try{
   await page.settle();const save=page.solo().props.external.save!;
   assert.equal(save.strokes.length,0);assert.equal(save.complete,false);
   page.mountSolo();await page.settle();page.online();page.tick();await page.settle();
   assert.equal(page.reads.includes(cache.saveKey('alice')),false);
   for(const sent of page.puts){assert.equal(sent.save.strokes.length,0);assert.equal(sent.save.complete,false);}
   assert.doesNotMatch(page.text(),/Hesabında kayıtlı/);
   assert.equal(JSON.parse(page.values.get(cache.saveKey('alice'))!)[chapter.id].complete,true);
  }finally{page.close();}
 });
});
```

## Test sınırı

Gerçek olanlar: tüm `PublishedPlay` gövdesi, efekt başlangıcı/temizliği, `onSave`, `flush`, iptal sinyali, gerçek bölüm tahtası ve cihaz doğrulama/birleştirme işlevleri. Sahte olanlar: tek bileşenlik basit hook yürütücüsü, JSX ağacı, `Solo` çocuğu, yan bölüm kartları, HTTP, zamanlayıcılar ve bellek depolama. `mountSolo` gerçek `Solo.tsx:28,41–42` başlangıç geri çağrısını bir kez taklit eder; yeni kelime, yeni süre veya değişen kayıt üretmez. `expireLoad` uygulamanın kendi abort callback'ini çağırır; gerçek sekiz saniye beklemez ve süre sabitini teste kopyalamaz.

Bu; DOM, React eşzamanlı render/StrictMode, gerçek tarayıcı ağ iptali, fiziksel çevrimdışı geçiş, sunucu kimlik doğrulaması veya telefon testi değildir. Kart/tahta güvenliği ve sunucu sahip ayrımı için mevcut ayrı testler sürmelidir. İkinci/üçüncü kuyruk bulgusunun çözüldüğüne kanıt üretmez. Görsel `storage-error` ikonunu da sınamaz; ikon değişikliği ayrı kaynak incelemesi ister.

## Örneğin doğrulanması

Kod bloğu bu Markdown'dan belleğe alınıp, hedef test yoluna göre TypeScript derleyicisinin sözdizimi/anlam denetiminden geçirildi: **tanı yok**. Ardından aynı blok Node test çalıştırıcısıyla bellekte yürütüldü. Bu sırada koordinatörün uyguladığı yerel `dirty.current=true` düzeltmesi kaynakta bulunuyordu: **3/3 geçti**. Yeni dosya veya uygulama değişikliği bu ajan tarafından yazılmadı.

Negatif kontrolde yalnız bileşen kaynağı, Git `HEAD` içindeki değişmemiş `PublishedChapters.tsx` sürümünden bellekte okundu; `catch` veya bayrak mantığı elle üretilmedi/değiştirilmedi. **İki ağ hata/süre aşımı testi `0 !== 1` PUT sayısıyla başarısız, başka sahip testi başarılı** oldu. Böylece örnek yalnız mevcut doğru davranışı tekrar eden bir test değildir; seçilen gerilemeyi gerçekten yakalar. Üretim derlemesi ve gerçek React/DOM testi bu örneğin doğrulaması sayılmadı.
