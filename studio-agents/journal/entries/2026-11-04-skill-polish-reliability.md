# 4 Kasım 2026 · Beceri rehberleriyle çizim güvenilirliği incelemesi

Rol: `ios_reliability_review`. İncelenen taban: `27555c6af0dafa0a2cda72ebbd018292613e53b3`, 0.32.1. Başlangıç çalışma ağacı temizdi. Kapsam: Board, input-gesture, viewport, legacy-ui, WordFeedback ve Solo sonuç/ilerleme bağlantısı. Uygulama veya test dosyası değiştirilmedi, yayın yapılmadı; bu görevde test, tarayıcı veya fiziksel cihaz çalıştırılmadı.

Kök AGENTS, reliability rolü/kuralları/runbook, güncel sürüm/harita/öncelik ve son ortak bakım kaydı okundu. Uygulanan beceriler: `/Users/dogukankeskin/.codex/skills/mobile-game-quality/SKILL.md` ve interaction-and-motion / flow-content-and-verification referansları; `/Users/dogukankeskin/.codex/skills/javascript-testing-expert/SKILL.md`. Mevcut Node test runner ve pnpm v9 lockfile düzeni korunmalı; yeni test aracı veya bağımlılık önerilmiyor.

## 1. Hızlı tek örnek tahtanın dışına taşınca aradan geçilen kelime kabul edilmiyor

- Kaynak: `components/game/Board.tsx:65–70`, `lib/game/input-gesture.ts:27–35` ve `9–18`.
- Tetikleyici: 6×6 tahtanın ilk satırı KALEXX; başlangıç hücre merkezi `(row=.5,col=.5)`, sonraki tek move/up örneği `(row=.5,col=7.5)`. Bunlar hücre değil, kesirli tahta koordinatlarıdır.
- Kaynak izi: projected endpoint son hücreye sınırlandırılır; fakat uzaklık hâlâ ham dış noktadan ölçüldüğü için .47 / .65 eşiği reddeder. `current` başlangıçta, `moved=false` kalır. `Board.move` değişmeyen hücrede `earlyWordEnd` çağırmaz. Sürekli görsel uç son hücreye kadar uzasa da bırakmada kabul üretilmez. Bu sonuç kaynak üzerinden çıkarıldı; fiziksel tekrar üretim değildir.
- Oyuncu etkisi: hedefin üzerinden hızlıca geçen ve ekran dışına taşan düz kaydırma kaçabilir. Mevcut fast-skip testleri hücre merkezleriyle sınırlıdır.
- En küçük öneri: mevcut iç-nokta/axis/radius davranışını koru; yalnız sınırı aşan projected step için aks boyunca dışarı taşan bileşeni çıkarıp son geçerli hücreye dik uzaklığı kontrol et. Fazla bileşeni yuvarlanmış step yerine sürekli projeksiyon `t` ile hesapla; aksi halde kesirli dış noktalar aynı hatayı sürdürebilir. Genel off-axis dış noktaları körlemesine clamp ederek kabul etme.
- Risk ve kabul: sekiz yön ve iki uçta dış overshoot, ilk örnekte henüz axis olmaması, release-only, son satır/sütun, ters sürükleme, >.47 dik sapma, KALE/KALEM öneki ve erken kabul sonrası devam. Doğru raydaki hedef bir kez kabul edilmeli; yanlamasına uzak örnek yeni harf/kelime oluşturmamalı; kayıt/puan/tahta değişmemeli. `tests/input-gesture.test.ts` ve gerçek Board harness'li `tests/board-interactions.test.ts` uygundur.

## 2. Hücre değişmediğinde bile her ham move mantıksal yolu yeniden oluşturuyor

- Kaynak: `components/game/Board.tsx:69` her move'da `snapLine`; `54` her schedule'da `notifyLetters`; `52` her rAF'ta yeniden notify, kelime map/join ve `paint`; `23–28` aynı hücre listelerini karşılaştırıp SVG özelliklerini tekrar yazıyor. `lib/game/engine.ts:77–82` her snapLine çağrısında yeni dış dizi ve her hücre için yeni çift üretir.
- Ölçülebilir kaynak sayımı: 10 hücre seçiliyken aynı mantıksal uçta 1000 move, yalnız snapLine üzerinden 11000 dizi oluşturur (1000 dış dizi + 10000 hücre çifti). Schedule aşamasında 10000 `join(',')` sonucu ve Set sorgusu yapılır. Her boyanan karede aynı 10 hücrenin iki yöndeki `some` araması 110 hücre eşleşme kontrolü yapar. Bunlar kaynak aritmetiğidir; heap tahsisi veya FPS cihaz ölçümü değildir.
- Mevcut koruma: native titreşim her örnekte gönderilmez; soundedCells bunu engeller. React sahnesi de her move'da render edilmez. Sorun bu korumaların öncesindeki yinelenen JS işidir.
- En küçük öneri: kabul edilen hücre değişince cells/harf listesi/önizleme/titreşim bölümünü güncelle; aynı hücrede yalnız son kesirli tip'i saklayıp rAF'ta çizgi ucunu boya. Hızlı örnekler arasında mantıksal hücre kabulünü boya hızına düşürme; erken kabul rAF beklemesin.
- Risk ve kabul: aynı hücre içinde 1000 örnekte görsel uç güncellenirken yeni hücre dizileri, harf bildirimi, metin önizlemesi ve React render birikmemeli. Gerçek hücre uzatma/kısaltma, geri sürükleme, son release ve iptal hâlâ aynı kabulü üretmeli. Mevcut continuous-ink / logical-selection testleri genişletilebilir; işlem sayımı kontrollü bir performans regresyonu olarak tutulmalı, fiziksel FPS yerine sunulmamalı.

## 3. WordFeedback yeni onay yokken de geometri okuyor

- Kaynak: `components/game/WordFeedback.tsx:22–28`. Ledger boş `fresh` döndürse de efekt ekranı ve tahtayı arayıp en az iki `getBoundingClientRect` çağırır; ancak sonra boş döngüye girer. Aynı doğrulanmış kimlikleri taşıyan yeni strokes dizisi / board referansı efekt bağımlılığını değiştirmeye yeterlidir.
- Etki: tekrar gelen aynı durum yeni bir kutlama üretmez, fakat gereksiz geometri okuması üretir. Önceden başka DOM yazısı varsa bu okumanın layout maliyeti olabilir; süre burada ölçülmedi.
- En küçük öneri: görünürlük/reduced-motion temizliğinden sonra `fresh.length===0` ise DOM/geometri bölümüne girmeden dön. Çoklu onayda hedef ölçümlerini DOM'a etiket eklemeden önce toplamak da mevcut `appendChild` → sonraki hedef ölçümü ardışıklığını kaldırabilir.
- Kabul: `tests/word-feedback.test.ts` gerçek dekoratif efekt harness'inde aynı ID'lerle yeni dizi verildiğinde yeni etiket/animasyon ve geometri okuması oluşmamalı. Yeni tek onay bir kez animasyon üretmeli; reduced motion, pause/rotation, restore, dört etiket sınırı ve gizli çok parçalı etiket davranışı korunmalı.

## Sınırlar ve odak

Öncelik sırası: dışa taşan hızlı çizimin kaçması; aynı hücrede gereksiz iş; onaysız geribildirim ölçümleri. İlk bulgu oynanış doğruluğu, diğer ikisi kaynaktan sayılabilen iş yükü kusurudur. Yeni düzeltmeler fiziksel cihazda p95 gecikme/kare süreleri ölçülmeden 'akıcı' veya belirli FPS olarak raporlanmamalı.

Önceki uçan etiketin gizli cevabı açması, bırakmada bekleyen rAF, üst bildirimin tahtayı itmesi ve hücre içinde hiç görsel takip olmaması güncel kaynakta tekrar bulgu olarak sunulmadı; bunların mevcut düzeltmeleri görüldü. Solo kaydı/ödülü animasyon bitişinden bağımsız güncelleniyor; sonuç gecikmesi yalnız görünürlüğü yönetiyor. Bu inceleme App Store, fiziksel haptics, iki gerçek Arena katılımcısı veya tüm ekranların görsel kabulü değildir.

## Uygulama delta incelemesi

Koordinatörün sonraki diff'i salt okunur incelendi. `Drag.cells` yalnız kabul edilen hücre değişiminde yeniden üretiliyor; aynı referansla `paint/show` artık hücre sınıflarını, kelime metnini ve harf bildirimlerini yinelemiyor. Mevcut rAF iptali ve erken kabul yolları korunmuş. `WordFeedback` boş fresh listesinde geometri okumadan çıkıyor; bütün yeni uçuş hedeflerini DOM yazılarından önce ölçüyor. Bu iki değişiklikte yeni kesin hata görülmedi; ilgili sayım ve cleanup regresyonlarının kaynakları okundu.

Taşma düzeltmesi sürekli projeksiyonu kullanıyor ve ham noktayı tahta dışındaki iki hücrelik bantla sınırlıyor. Ancak incelenen diff'te `outside` koşulu `<0 || >size` olduğundan **tam kenar/köşe** dışarıda kalıyor. Örnek: 6×6'da başlangıç `(.5,.5)`, tek diagonal örnek `(6,6)`; son hücre merkezine uzaklık yaklaşık .707 olduğundan hem move .47 hem release .65 reddediyor ve geçilen hedef kabul edilmiyor. Koordinatöre sınırı `<=0 || >=size` ile dahil etme; iki karşı köşe, tam kenar, release-only, iki hücre eşiği ve epsilon üstü reddi testleri önerildi. Bu kayıt anında kesin açık delta bulgusu budur.

Koordinatör 157 hedefli testin geçtiğini bildirdi; inceleyici test çalıştırmadı ve bu sayıyı bağımsız doğrulamadı. Tüm test/tip, görsel ve fiziksel cihaz kanıtları koordinatörün nihai doğrulama kaydına aittir.

### Son sınır düzeltmesi — açık bulgu kapandı

Son kaynak okumasında `lib/game/input-gesture.ts:36` koşulunun `value<=0 || value>=size` olduğu doğrulandı. `tests/input-gesture.test.ts:57` tam iki karşı köşe, yatay kenar, iki hücrelik tolerans eşiği ve eşiğin hemen dışını move/release durumlarıyla kapsıyor. `tests/board-interactions.test.ts:344` gerçek Board bileşeninde yalnız bırakma örneğiyle tam sağ-alt köşeye varan çapraz KALE'nin doğru uçta kabulünü doğrulayan regresyonu içeriyor. Böylece önceki delta incelemesindeki kesin açık sınır bulgusu kaynak ve test kapsamı yönünden giderildi; bu dar incelemede kalan kesin engelleyici hata yok.

Koordinatör tüm 667 testin geçtiğini bildirdi. İnceleyici yeni test çalıştırmadı; yalnız belirtilen kaynak/test düzeltmelerini okudu. Fiziksel cihaz, kare süresi ve görsel kabul sınırları değişmez.
