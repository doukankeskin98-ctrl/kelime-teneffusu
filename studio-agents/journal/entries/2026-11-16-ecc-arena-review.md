# 16 Kasım 2026 — ECC Arena akış incelemesi

Kapsam: 0.56.0 kaynağında hazır → başla → sonuç → tekrar; `Arena.tsx`, `useLiveRoom.ts`, `room-poll.ts`. Uygulama kodu değiştirilmedi; ağ/üretim/oyuncu verisine erişilmedi. `click-path-audit` ile durum sırası incelendi. `benchmark-optimization-loop` okundu; bu doğruluk hatası için hız iddiası veya gereksiz benchmark yapılmadı. Önceki kapasite incelemesi tekrar edilmedi.

## Tek doğrulanan bulgu — P2: Eski turun penceresi yeni turda geri açılıyor

**Kaynak:** `components/game/Arena.tsx:25` (`leaving`, `rules` state), `:75` (oda/tur değişiminde sıfırlama), `:119–135` (lobide bu pencereler çizilmez), `:143` (`feedbackPaused`), `:150–151` (aktif/bitmiş tahtada pencere koşulları).

**Tekrar üretim:** Bitmiş maçın sonuç penceresini kapatıp tahtayı incele. Geri düğmesinden çıkış onayını veya araçlardan kuralları aç. Diğer oyuncu Tekrar oyna diyerek aynı odada ikinci tur lobisini açsın. Gelen oda görünümü lobiye geçer; pencere görünmez, fakat `leaving`/`rules` doğru kalır. Lobide Hazırım'a basıp ikinci tur başladığında önceki turun penceresi kendiliğinden yeniden açılır.

**Beklenen:** Yeni tur, o turda açılmamış eski çıkış onayı/kurallar penceresi olmadan başlar. **Gerçek:** Çıkış varyantında önceki “Arena’ya dönelim mi?” yeni turda “Düellodan ayrılacak mısın?” olarak görünür; kurallar varyantında kurallar geri açılır. İkisinde de `feedbackPaused=true`. Sunucunun maç süresi devam ederken oyuncu yeniden bir pencere kapatmak zorunda kalır. Bu bir veri/puan kaybı bulgusu değildir.

**Dar öneri:** Oda/tur anahtarı değişimini izleyen mevcut `useEffect` sıfırlamasına `setLeaving(false)` ve `setRules(false)` ekle. Aynı tur içindeki active → finished güncellemelerinde mevcut açık pencere davranışını değiştirme; skor, süre, kayıt, ses ve sunucu işlemleri korunur.

**Kabul:** İki varyantta da ikinci tur lobisinde ve hazır→aktif geçişinden sonra modal sayısı sıfır, `feedbackPaused=false`; ready isteği round=2 taşır. Aynı tur içinde sonuç gelirken açık kurallar/çıkış onayı kaybolmamalı. Mevcut tek-next, stale ACK/recovery ve sonuç sunum testleri geçmeli.

## Çalıştırılan yerel kanıt

Mevcut `tests/arena-terminal.test.ts` kontrollü React-hook harness'i ve gerçek `Arena.tsx` bellekte transpile edilerek çalıştırıldı. Test veya uygulama dosyasına yazılmadı. Aşağıdaki komut proje kökünde çalıştırıldı:

```sh
node --experimental-strip-types --experimental-transform-types --input-type=module <<'NODE'
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(process.cwd()+'/tests/arena-terminal.test.ts');
const base=readFileSync('tests/arena-terminal.test.ts','utf8').split("describe('Arena terminal board review'")[0];
const proof=`
(async()=>{
 for(const overlay of ['leave','rules']){
  const initial=room('finished',NOW-121_000,NOW-1);
  const successor={...initial,phase:'ready',round:2,revision:4,board:null,starts:null,ends:null,you:{...initial.you,ready:false,strokes:[],score:0}};
  const started={...successor,phase:'active',revision:5,board:publicBoard,starts:NOW-1,ends:NOW+119999,you:{...successor.you,ready:true}};
  const h=harness(initial,async action=>{assert.equal(action,'ready');return started;});
  try {
   await h.settle();h.closeModal();await h.settle();
   if(overlay==='leave')h.layout().props['onBack']();
   else nodes(h.layout().props['headerAction']).find(n=>n.type==='MatchTools').props['onHelp']();
   await h.settle();const before=h.modal().props['title'];
   h.push(successor);await h.settle();const lobbyModals=h.modalCount();
   h.click(/Hazırım/);await h.settle();
   console.log(JSON.stringify({overlay,before,lobbyModals,readyRound:h.apiCalls[0].data.round,nextRoundModal:h.modal().props['title'],feedbackPaused:h.layout().props['feedbackPaused']}));
  }finally{h.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1});`;
vm.runInNewContext(ts.transpileModule(base+proof,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports:{},require,console,process,EventTarget,Event,URL,URLSearchParams,AbortController});
NODE
```

Doğrulanan çıktı:

```json
{"overlay":"leave","before":"Arena’ya dönelim mi?","lobbyModals":0,"readyRound":2,"nextRoundModal":"Düellodan ayrılacak mısın?","feedbackPaused":true}
{"overlay":"rules","before":"Düello kuralları","lobbyModals":0,"readyRound":2,"nextRoundModal":"Düello kuralları","feedbackPaused":true}
```

Kalıcı regresyon testi bu akışı kullanıp son iki beklentiyi `modalCount() === 0` ve `feedbackPaused === false` olarak doğrulayabilir. Yukarıdaki komut kusurlu başlangıç davranışını yazdırır; düzeltme sonrası eski modalın bulunmasını beklememelidir.

**Doğrulama sınırı:** Gerçek bileşenin kontrollü durum/handler yürütmesidir; DOM, fiziksel telefon, gerçek iki oyuncu, gecikme/FPS veya canlı servis kanıtı değildir. Native polling'in asılı kalması ikinci bulgu yapılmadı: `lib/platform/native-transport.ts` zaten 10 saniyelik timeout ve abort sonucu bırakma koruması içerir. Native resume, `mobile/main.tsx:25–29` üzerinden polling'in dinlediği visibilitychange olayını üretir. Hazır/başlat/tekrar için mevcut epoch, round ve revision korumalarını değiştirecek başka somut hata bu sınırlı incelemede gösterilmedi.

## Son dar diff incelemesi

Koordinatörün `Arena.tsx` oda/tur effect'ine eklediği iki reset, `tests/arena-terminal.test.ts` içindeki iki yeni tur varyantı ve aynı tur penceresini koruma beklentisi incelendi; ayrıca `DeferredScreen.tsx` ve yeni `tests/deferred-screen.test.ts` yerinde yeniden deneme değişikliği okundu. Somut engelleyici gerileme bulunmadı: Arena sıfırlaması yalnız oda/tur anahtarı değişiminde çalışıyor; DeferredScreen yeni lazy örneği ve anahtarlanmış Boundary ile reddedilen React.lazy durumundan çıkıyor, aynı parent ve güncel props korunuyor, başarısız preload temizlenirken başarılı modül/in-flight isteği paylaşılmaya devam ediyor. `node --experimental-strip-types --experimental-transform-types --test tests/arena-terminal.test.ts tests/deferred-screen.test.ts` bağımsız çalıştırıldı: **38/38 test geçti**. Koordinatörün bildirdiği gerçek tarayıcı 503 → retry, aynı timeOrigin ve aynı kayıt doğrulaması bu incelemede tekrarlanmadı; bağımsız fiziksel cihaz/üretim kanıtı sayılmadı. Uygulama koduna dokunulmadı, kapsam genişletilmedi.
