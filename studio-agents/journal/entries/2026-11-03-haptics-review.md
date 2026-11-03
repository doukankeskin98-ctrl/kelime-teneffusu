# Harf kaydırma titreşimi — dar güvenilirlik incelemesi

3 Kasım 2026. Salt okunur inceleme; uygulama veya oyun/ilerleme kuralları değiştirilmedi. Kaynak: Board, ortak PlayLayout, useGameSound, haptics adaptörü, mobile/main, kurulu Capacitor iOS kaynakları ve mevcut testler. Fiziksel cihaz titreşim hissi bu incelemeyle doğrulanmış değildir.

## 1. Harf sinyali haptik adaptöre ulaşmıyor

- Kaynak: `components/game/Board.tsx:48-50`, `components/game/useGameSound.ts:29-33`; Solo, Arena, Sprint, Mystery `onSelectLetter={depth=>chime('letter',depth)}` kullanır.
- Gerçek: Board yeni seçilen hücreler için deduplikasyonlu harf sinyali verir; useChime haptik koşulunda `letter` yok, yalnız `select/word/complete/reveal` var. Mevcut caller'lar `onSelectStart` üzerinden select göndermediğinden kaydırma titreşimi gerçekleşmez.
- Etki: harf sesi/çizgisi çalışırken dokunsal geri bildirim eksik. Başarı titreşimi ayrı çalışabilir; bu yüzden bütün haptiklerin bozuk olduğu iddia edilmez.
- En az müdahale: useChime'da `letter` cue'sunu selection haptik pulse'a bağla. Ses kapalı/haptik açık tercihi bağımsız kalmalı. Board'un yeni hücre deduplikasyonu ve pointer/touch tek sahipliği korunmalı; input/commit kodu await etmemeli.
- Kabul: `letter` + haptik açık/ses kapalı native pulse üretir; haptik kapalı hiçbir pulse üretmez; hücre jitter/backtracking veya pointer/touch handoff fazladan sinyal üretmez. Başarı cue'su mevcut onaylı yoldan tek kez gelir.

## 2. iOS selectionChanged hazırlıksız no-op

- Kaynak: `mobile/main.tsx:14`, `node_modules/@capacitor/haptics/ios/Sources/HapticsPlugin/Haptics.swift:19-32`, `HapticsPlugin.swift:49-69`.
- Gerçek: mevcut adaptör yalnız `selectionChanged()` çağırır. Swift tarafında generator yalnız `selectionStart()` ile yaratılır; Changed nil generator varken bir şey yapmaz; End generator'ı nil yapar.
- Koordinatörün seçtiği dar tasarım: ilk harfte lazy Start → Changed; sonraki harflerde hazır generator ile Changed. Adaptörün mevcut function API'sine optional `stopSelection` eklenir. Ayrı factory/driver kontrollü test edilebilir. Bir adet in-flight selection işlemi, yaklaşık 45–55ms minimum pulse aralığı, fazlalıkları bırakma; harf başına Promise kuyruğu veya sonradan oynatılan titreşim dizisi yok.
- Yaşam döngüsü: start/end epoch veya session kimliğiyle korunmalı. Stop pending Start'ı geçersiz kılar; Start çözülünce Changed göndermez, kaynağı End ile kapatır. Eski End yeni session'ın generator'ını kapatmamalı; yaşam döngüsü çağrıları sıralanmalı. Word/Complete pulse'ları selection throttle'dan bağımsız kalmalı; seçim kapandıktan sonra hafif başarı/notification mevcut kuralla gelir. Reject/throw yalnız isteğe bağlı geri bildirimi bırakır, oyun hatası oluşturmaz.
- Sınır: plugin `call.resolve()` çağrısını main queue işi tamamlanmadan yapıyor. Promise sırası yalnız köprü çağrısının teslim sırasını güvenceye alır; fiziksel titreşimin gerçekleştiği kanıtı değildir.
- Kabul: ilk seçim Start→Changed, sonraki hücre Changed; 100 hızlı harf çağrısı bounded native işlem ve sıfır gecikmiş pulse kuyruğu; rejected Start/Changed/End sonrası yeni seçim çalışır; pending Start→Stop→resolve sonrası Changed yok; Stop→yeni seçim→eski Start resolve yeni session'ı bozmaz; Word/Complete pending seçimden sonra kaybolmaz.

## 3. Bitiş tüm iptal yollarında idempotent olmalı

- Kaynak: `components/game/Board.tsx:30-43,51-73`, `components/game/common.tsx` Board bağlantısı; `components/game/useGameSound.ts:16-24,29-33`, `mobile/main.tsx:15-20`.
- Öneri: Board'a optional onSelectEnd; ortak PlayLayout bunu stopHapticSelection'a bağlar. Board'un clear() ve unmount cleanup'ı yalnız aktif mantıksal seçim varsa aynı idempotent helper'ı çağırır. Ref callback'ten önce sıfırlanır. Cleanup state setter/preview yazmaz. End fiziksel pointerup'a ayrı bağlanmaz: ilk tap→ikinci tap ve klavye anchor tek mantıksal seçimdir. Erken kabul clear() üzerinden bitirir; kalan move/up/cancel ikinci End/commit üretmez.
- useChime haptik kapatılınca, blur/hidden/native inactive/pagehide/unmount'ta selection kaynağını kapatır. Temizlik enabled/visible/alive guard'larının arkasında kaybolmamalı. Yeniden görünür olmak otomatik titreşim üretmez. Board pause/readOnly/blocked, orientation, zoom/pan değişimi ve gerçek touch cancel temizliği aynı End yolunu kullanır.
- Kabul: normal commit, miss, early commit, escape, native cancel, blur, hidden, pause, blocked, board rotate ve unmount başına en fazla bir mantıksal End; iki tap/klavye akışı çalışır; hiç seçim başlamadan render/cleanup gereksiz native Start üretmez. StrictMode cleanup/setup sonrası yeni sürükleme çalışır. Eski async callback disable/hidden/unmount sonrası yeni pulse çıkaramaz.

## Gerekli hedefli doğrulama

- `tests/board-interactions.test.ts`: mevcut hareket/geometri/erken kabul/deduplikasyon testlerine End sayacı ve erken kabul sonrası hareketler, unmount/StrictMode, iki tap eklenir; render-per-move sınırı korunur.
- `tests/sound-hook.test.ts`: letter cue, ses/haptik bağımsızlığı, latest preference, hidden/native inactive/pagehide/blur ve unmount temizliği; geri dönüşte replay yok.
- `tests/haptics.test.ts` + native driver testleri: optional adaptör uyumluluğu, Start/Changed/End sıra/epoch/rate/in-flight/reject davranışları kontrollü saat ve ertelenen Promise'lerle sınanır.
- Tip kontrolü, tam testler, web/native derlemesi ve native paket kontrolleri koordinatörde. Simülatör gerçek Taptic Engine hissini kanıtlamaz; fiziksel iPhone doğrulaması ayrı raporlanmalı.

## Uygulama sonrası son dar inceleme

İncelenen son değişiklikler: `lib/platform/native-haptics.ts`, `lib/game/haptics.ts`, `mobile/main.tsx`, `components/game/useGameSound.ts`, Board'un `onSelectEnd` ve ortak PlayLayout bağlantısı. Bu kapsamda somut yayın engeli bulunmadı.

- `letter` artık haptik seçim pulse'ına ulaşır; ses kapalıyken haptik tercihi bağımsızdır. Eski function adaptörler optional stop API ile uyumludur; değiştirilirken önce eski seçim kapanır.
- Native driver bir mantıksal seçim için Start→Changed kullanır; en fazla bir selection işlemi uçuşta kalır. Fazla harfler düşer, kuyruk oluşturulmaz. 50ms sınırı gerçek Changed çağrısı zamanından başlar. Closed/ending session sonlanmadan yeni Start oluşmaz; eski async End yeni session kaynağını kapatamaz. Word/Complete kendi mevcut onay yolunda, selection throttle'dan bağımsızdır. Throw/reject oyun işlemine yayılmaz.
- Board ref'i End callback'inden önce sıfırlar; clear() ve unmount idempotent helper'ı kullanır. Unmount state/preview yazmaz. İki tap ve klavye seçimleri korunur; erken kabul sonrası kalan move/up/cancel ikinci commit veya ikinci mantıksal End üretmez.
- Haptik tercihi kapatma, blur, hidden, pagehide, unmount ve native inactive kaynak temizliği vardır. Yeni görünürlük otomatik pulse üretmez; pending Start kapanışından sonra stale Changed gönderilmez.
- Bağımsız tekrar çalıştırma: `node --experimental-strip-types --experimental-transform-types --test tests/native-haptics.test.ts tests/haptics.test.ts tests/sound-hook.test.ts tests/board-interactions.test.ts` — **65 test / 13 grup, 65 başarılı, 0 başarısız**. Testler ertelenen Start/Changed/End, hızlı 100 çağrı, stop→yeni seçim yarışı, arka plan, hatalar, iki tap, erken kabul ve cleanup durumlarını kapsar. Log: `/tmp/kt-haptics-review-tests.log`.

Bu sonuç kontrollü JS/bridge çağrı sözleşmesi kanıtıdır. Fiziksel iPhone Taptic Engine hissi, yoğunluğu veya gerçek cihaz gecikmesi bu incelemede doğrulanmadı; simülatör bunu kanıtlayamaz. Tam proje/build/paket/yayın kontrollerinin sahibi koordinatördür.
