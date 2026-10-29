# 29 Ekim 2026 · 0.13.0 · Arena bitmiş tahta incelemesi

Rol: güvenilirlik ve oyun kalitesi. İncelenen kaynak `1f2258a4c1c43a77ab61af4da708e39b5a9250c6`, paket `0.13.0`. Uygulama/test kaynağı değiştirilmedi; yayın, canlı veri, gerçek hesap veya cihaz kullanılmadı ve test çalıştırılmadı. Aşağıdaki sonuçlar güncel kaynak ile mevcut testlerin salt okunur incelemesidir.

## 1. Kanıtlı sorun: bitmiş düello, inceleme yerine duraklatılmış tahta gösteriyor

**Kaynak ve tetikleyici.** `components/game/Arena.tsx:48-55` içinde `finished = room.phase === 'finished'`; aynı görünüm `PlayLayout` için `paused={countdown>0||seconds<=0||finished}` veriyor fakat `readOnly` vermiyor. `components/game/Board.tsx` içinde `paused` her harfi `·` olarak çiziyor, duraklatma erişilebilir etiketini kullanıyor, `tabIndex=-1` yapıyor ve girdiyi kapatıyor. Buna karşılık `readOnly`, harfleri ve kabul edilmiş çizgileri koruyor, klavyeyle hücre incelemesine izin veriyor, dokunma kaydırmasını açıyor ve seçim/commit'i yine engelliyor. Bu fark mevcut `tests/board-interactions.test.ts:106-145` ve `tests/completed-review.test.ts:34-38` kabullerinde açıkça tanımlı.

**Gerçek davranış.** Sonuç penceresi kapatılınca `review=true` olur ve modal kalkar; oyuncu tahtaya döner, ancak `finished` hâlâ `paused` ürettiğinden bütün harfler nokta olarak kalır. Seçim önizlemesi de `readOnly` olmadığı için “Kaydır veya ilk ve son harfe dokun” çağrısını gösterebilir. Böylece “Düello sonucu” düğmesi olan bir inceleme yüzeyi varmış gibi görünürken bitmiş oyun fiilen incelenemez.

**Oyuncu etkisi.** Oyuncu kendi bulduğu çizgileri bağlamındaki harflerle değerlendiremez; sonucun nedenini ve kaçırdığı kelimeleri öğrenemez. Görsel durum ile metin/girdi durumu birbirini tutmaz. Etki yüksek, çözüm maliyeti düşük, mevcut Arena protokolü ve kayıt yapısına dokunma riski düşüktür.

**Düşük riskli çözüm.** Arena çağrısında terminal durumu etkileşim kilidinden ayır: `readOnly={finished}` ver; `finished` değerini `paused` ifadesinden çıkar. Süre sıfıra ulaşmış fakat sunucudan terminal revizyonu henüz gelmemiş aktif aralıkta `seconds<=0` kilidi korunmalı; countdown davranışı da değişmemeli. Sonuç ekranı kapalıyken bitmiş tahta harfleri ve yalnız sunucudan onaylı `room.you.strokes` çizgilerini göstermeli. Arena'ya özgü inceleme metni istenirse ortak Solo metnini yanlış bağlamda kullanmamak için ayrı, küçük bir `reviewStatus`/etiket girdisi düşünülebilir; bu, görünür tahta düzeltmesinin önkoşulu değildir.

## 2. Sonuç, kurallar ve ayrılma akışı için korunması gereken davranış

**Kaynak kanıtı.** `components/game/Arena.tsx:51-57` bitmiş halde kelime açılır erişimini `wordListUnavailable={finished||leaving||rules}` ile kapatıyor; sağ panelde sunucu tarafından onaylı `room.you.strokes` listesini bırakıyor. Sonuç modalı `finished&&!review`; kapatma `setReview(true)`, “Düello sonucu” `setReview(false)`. Geri düğmesi `leaving=true` yapıyor; bitmiş oyunda ayrılma metni “Sonucun kaydedildi” diyor. Kurallar ayrı `rules` modalıyla açılıyor. `commit` ayrıca `room.phase!=='active'` ve sunucu zamanı sınırlarıyla erken dönüyor; yani `readOnly` düzeltmesi istemci ve sunucu kapılarına ek savunma olur, onların yerine geçmez.

**Risk.** Sadece `paused` kaldırılıp `readOnly` eklenmezse bitmiş tahta yeniden seçilebilir görünür ve eski/pending pointer olayı çalışabilir. Sadece `readOnly` eklenip `paused` korunursa Board, `paused` önceliği nedeniyle harfleri yine gizler. Modal durumları gelişigüzel birleştirilirse sonuç ile kurallar/ayrılma üst üste gelebilir veya sonuç yeniden açılamaz. Bitmiş halde kelime popup'ını açmak da mevcut “overlay/terminal sırasında ek açılır yüzey yok” sözleşmesini değiştirir; bu dar düzeltmede gereksizdir.

**Önerilen davranış.** Sonuç modalı ilk terminal görünümde aynen açılsın. Kapatınca açık harfli, `readOnly` inceleme tahtasına dönülsün. “Düello sonucu” aynı sonucu yeniden açsın. Geri düğmesi mevcut bitmiş-oyun ayrılma onayını açsın. Kurallar modalı mevcut davranışla tek başına açılsın; sonuç/kurallar/ayrılma aynı anda görünmesin. Yeni yardım, yeniden oynama veya kelime popup davranışı eklenmesin.

## 3. Zaman, puan, rövanş ve rating kayıt güvenliği

**Mevcut korumalar.** Arena istemci saati `components/game/Arena.tsx:30,48,52` içinde 200 ms aralıkla yalnız yerel `now`/görsel süreyi güncelliyor; skor `RoomView` içinden okunuyor. Claim kapısı hem istemcide `phase==='active'`, başlangıç/bitiş sunucu zamanı ile hem `lib/game/server.ts:135-142` içinde tekrar uygulanıyor. Sunucu bitişi `settle` veya bütün kelimelerin bulunmasıyla belirliyor. Sonuç ve Elo yazımı `lib/game/server.ts:35-50` içinde `room.id:round` kimliğine bağlı `INSERT OR IGNORE`, `rating_events` ve revizyon koşullarıyla tekilleştiriliyor. Rövanş `lib/game/server.ts:147-158` içinde yalnız bitmiş ve iki aktif üyeli odada çalışıyor; iki taraf kabul edince round artıyor, yeni seed üretiliyor ve oyuncu skor/çizgi/rövanş alanları sıfırlanıyor. Mevcut `tests/server.test.ts:18-21`, `tests/studio.test.ts:84-88` ve `tests/concurrency.test.ts:4-16` bu sunucu korumalarını kapsıyor.

**Sınır ve öneri.** UI düzeltmesi `run('rematch')`, `leave`, `accept`, `useLiveRoom`, `RoomView`, server save/settle veya rating koduna dokunmamalı. Bitmiş tahtayı incelemek yeni claim, score, result, rating veya progress yazısı üretmemeli. 200 ms istemci intervali terminal halde gereksiz yeniden çizim yapabilir, ancak kaynakta puan/rating yazısı üretmiyor; bu dar düzeltmede interval yaşam döngüsünü değiştirmek ek yarış riski taşır ve ayrı ölçümlü performans işi olmalıdır.

## Uygulama öncesi anlamlı kabul ölçütleri

1. Gerçek `Arena` bileşenini kullanan yalıtılmış UI testinde sunucudan `phase:'finished'` RoomView verildiğinde `PlayLayout.readOnly === true`, `PlayLayout.paused === false`; harfler ve onaylı `room.you.strokes` görünür olmalı. Seçim önizlemesi yeni seçim çağrısı yapmamalı.
2. Sonuç modalını kapatma bitmiş read-only tahtayı göstermeli; pointer/tap/Enter eski handler dahil `claim` çağrısı veya optimistic stroke üretmemeli. “Düello sonucu” aynı sunucu sonucu ile modalı yeniden açmalı.
3. Kurallar ve bitmiş ayrılma onayı ayrı ayrı açılıp kapanmalı; sonuçla üst üste görünmemeli. Bitmiş ayrılmada mevcut `leave` çağrısı ve hata halinde odada kalma davranışı değişmemeli.
4. Countdown ve aktif oyun değişmemeli: countdown sırasında `paused=true`; süre sıfır olup terminal revizyonu beklenirken giriş kapalı; aktif sürede `paused=false`, `readOnly=false`. Reconnecting görünümü ve onaylı/pending stroke ayrımı korunmalı.
5. Rövanşın ilk isteği terminal round/score/rating'i değiştirmemeli; karşılıklı kabul yeni `ready` round'a geçmeli. Aynı bitmiş round için sonuç/rating tek kez kalmalı; özel oda rating değiştirmemeli. Mevcut sunucu testleri ve Worker Arena sonucu kapısı regresyon olarak çalıştırılmalı.
6. Kaynak testi yanında destekli tarayıcı/gerçek cihaz olursa sonuç kapat → tahtayı incele → sonucu yeniden aç → rövanş/ayrıl akışı klavye, dokunma, büyük yazı ve ekran okuyucuyla ayrıca gözlenmeli. Bu incelemede böyle bir cihaz doğrulaması yapılmadı.

## Karar

Önerilen dar uygulama: Arena terminal durumunu `paused` yerine `readOnly` olarak bağlamak ve buna özel bir gerçek-caller kabul testi eklemek. Bu, kaynakta kanıtlı görünürlük/erişilebilirlik sorununu giderirken server-authoritative süre, puan, rövanş ve rating yollarını değiştirmez. Yeni özellik, veri göçü veya tasarım genişlemesi bu düzeltmeye eklenmemelidir.

## Son diff incelemesi

**Karar: engel yok; kaynak kabulü karşılıyor.** `components/game/Arena.tsx` artık bitmiş oda için `readOnly={finished}`, `paused={!finished&&(countdown>0||seconds<=0)}` ve Arena'ya özgü inceleme metni veriyor. Böylece terminalde `paused=false` olduğundan Board harfleri/çizgileri görünür kalır; `readOnly=true` yeni pointer, tap ve Enter seçimini kapatır. Countdown kapalı, aktif süre oynanabilir ve süresi bitip terminal revizyonu bekleyen aktif oda kapalı kalır. `commit` içindeki phase/start/end kapısı değişmemiştir. Sonuç modalının ilk açılışı, `onClose → review=true` dönüşü ve sağ panelde `setReview(false)` ile yeniden açılması korunmuştur.

`common.tsx` değişikliği yalnız varsayılanı geriye uyumlu `reviewStatus` metin girdisidir; Board girdi sözleşmesini değiştirmez. Diff `lib/game/server.ts`, `useLiveRoom`, skor, sonuç/rating tekilleştirme, leave ve rematch koduna dokunmuyor. README/sürüm notları davranışı kaynakla uyumlu ve cihaz kanıtı iddia etmiyor.

Yeni `tests/arena-terminal.test.ts` gerçek Arena caller'ını kontrollü hook/RoomView ile çalıştırıyor; terminal `readOnly/paused`, sonuç kapat-yeniden aç, terminal `onCommit` sonrası API çağrısı olmaması ve countdown/active/expired-server-wait ayrımını doğrudan kapsıyor. Testin başındaki sınırlama doğru: gerçek React DOM, native dialog, gerçek `Board` çizimi, canlı SSE/oda, fiziksel cihaz veya iki hesap değildir. Modalın yeniden açıldığını doğruluyor fakat yeniden açılan skor metninin bire bir aynı olduğunu, kurallar/ayrılma modalı çakışmasını ve rövanş/leave tıklamalarını bu hedef testte doğrudan doğrulamıyor; ilgili kaynak yolları değişmediği ve mevcut Board/server testleri bağımsız koruma sağladığı için bu dar diff için bloklayıcı görmüyorum. Bu son incelemede test çalıştırmadım ve cihaz görmedim.
