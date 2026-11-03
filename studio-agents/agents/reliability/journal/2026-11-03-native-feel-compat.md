# 2026-11-03 · 24 bölüm / dört devam rotası uyumluluk incelemesi

Salt okunur kapsam: AGENTS ve güvenilirlik rolü; discovery/content/main-journey/world-presentation/progress, doğrudan bu kimlikleri kullanan Home/Discovery/ödül görünümleri ve mevcut kabul testleri. Uygulama/test değişikliği, test çalıştırma, yayın ve canlı veri işlemi yapılmadı. Aşağıdaki riskler planlanan genişletmenin yanlış bağlanması halinde oluşur; mevcut sürümde 24 bölümün bulunduğu veya test edildiği iddia edilmez.

## 1. Rota kimliği ile görsel tema kimliği ayrılmalı; bonus ve albüm açıkça rotaya ait olmalı

Kaynak: `lib/game/discovery.ts` Expedition tipi, `discoveryState` içindeki bonus/album `.find(themeId===expedition.id)`; `content.ts` Journey.themeId ve journeyBoard; `main-journey.ts` örtük `${e.id}-atlas-6` üretimi.

En az riskli model:
- Expedition.id: özgün rota/ödül kimliği. İlk 16 değer değişmez, dört yeni değer sona eklenir.
- Expedition.themeId: mevcut katalog/görsel tema kimliği. İlk 16 için eski id ile aynı; yeni rotalarda mevcut bir THEMES kimliği.
- Expedition.chapterIds: tam beş normal bölüm; Expedition.bonusId: açık altıncı bölüm kimliği.
- Expedition.album: bu rotanın title/description/stamp metadatası veya açık albumId. Aynı tema altındaki yeni albümü `ALBUMS.find(themeId)` ile seçmeyin; eski albüme bağlanır. Yeni rota albümü doğrudan metadata olarak tanımlanırsa eski ALBUMS kimliklerini değiştirmek gerekmez.
- Yeni Journey kayıtları mevcut themeId değerlerini kullanır, özgün bölüm id/words/seed üretim girdilerine sahiptir. Yeni içerik ayrı sabit dosyada; content.ts normal beşlileri JOURNEYS'e, finalleri JOURNEY_BONUSES'a ekler. Runtime döngü yaratmamak için içerik dosyasının Journey/Expedition bağlantıları type-only olmalı veya bağımsız veri tipleri kullanılmalı.
- Ana sıra ilk 96 ID'yi aynen tutup yeni 24 ID'yi sona ekler. Mevcut EXPEDITIONS flatMap korunacaksa final `${id}-atlas-6` tahmini yerine açık bonusId kullanılmalı.

Ödül ID'leri (`piece:<route>:<position>`, `album:<route>`, `world:<route>`) Expedition.id'ye bağlı kalır. DiscoveryReward.themeId sahne çizimi için Expedition.themeId olmalı. Aynı tema iki albüme ait olacağından yeni parça kontrolünü tema + başlık yerine tam parça ödül ID'siyle yapmak daha güvenlidir (`JourneyResult.tsx` newPiece).

Kabul: İlk 96 kimliğin numarası ve tam board hash'i aynı; eski 16 rota bonus/album/earned dizileri aynı. Yeni rotanın beşinci bölümü kendi finalini, altıncısı kendi albümünü tamamlar; eski aynı-tema albümünde hiçbir değişiklik olmaz. Tekrar oynamak aynı parça ödülünü üretmez.

## 2. Bölüm üyeliği tema eşitliğiyle bulunmamalı; bütün görünümler tek rota helper'ına bağlanmalı

Kaynak: `main-journey.ts` mainJourneyChapters, worldOrder, nextMainMilestone; `world-presentation.ts:worldChapter`; `JourneyHome.tsx:21,40,43,48`; `Discovery.tsx` WorldArt kullanımları.

Tek helper önerisi: `expeditionForChapter(chapterId)` bölümün chapterIds veya bonusId üyeliğini çözer. Main state/milestone/word-presentation bu helper'ı kullanır. `worldChapter` pozisyonu beşli listeden + açık bonusId'den bulur, konu metni rota kimliğinden veya yeni bölüm metadata'sından gelir. Yeni rotalar eski dünyanın TOPICS dizisini otomatik kullanmamalı.

Home yakın-altılı yol ve galeri filtreleri chapter.themeId yerine route.id kullanmalı; yoksa aynı temadaki eski/yeni rotalar bir kartta 12 bölüm olarak birleşir veya yeni rota items[0] boş olduğu için hata verir. Seçici, galeri, albüm sahnesi ve ödül görselleri `SceneArt/WorldArt theme={expedition.themeId}` kullanmalı. UI anahtar/rota seçimi ise expedition.id olarak kalır. Solo açarken `config.themeId=chapter.themeId`, `journey=chapter.id` gönderilir.

Orijinal 3/5/6 kapıları aynen kalabilir. Yeni dört rota en sona eklenince ilk yeni rota mevcut son rotanın üç normal bölümüyle açılır; bu seçimin numara 97'yi mutlaka ilk 96'nın hepsini bitirme şartına bağlamadığını bilin. Eski 96'yı tamamlamış oyuncuda doğrudan 97 önerilir; eski yarım oyun varsa önce o devam eder. `started(save)` ile eski hint-only/elapsed-only/bonus devamı korunmalı.

Kabul: 20 ayrı rota, her birinde yalnız kendi altı bölümü; mevcut 16 görsel tema yeniden kullanılır. 20 yeni/benzersiz arka plan iddiası yapılmaz. Aynı tema içindeki yeni rota özeti, konu, maskeler, kalan parça ve finale geçiş doğru rotaya ait olur. 96/16 sabit metinleri toplamdan türetin; testlerde 16 ayrı sanat varlığı korumasını 20 rota sayısıyla karıştırmayın.

## 3. v2 kayıt yolu yeterli; içerik kimlikleri ve tam-katalog kabulü büyütülmeli

Kaynak: `progress.ts:knownKeys,resolveProgressBoard,loadProgress,mergeProgress`; `app/api/progress/route.ts` 150000 bayt limiti; `tests/atlas-continuation.test.ts`, `tests/discovery.test.ts`, `tests/main-journey.test.ts`, `tests/world-presentation.test.ts`.

Yeni bölümler PLAYABLE_JOURNEYS'e eklenince route:<id> kayıt anahtarları otomatik tanınır. Journey.themeId mevcut THEMES içinde kaldığı sürece last destination doğrulaması da çalışır; kayıt sürümü/anahtarı ve mevcut hesap/veri altyapısını değiştirmeye gerek yok. Yeni rota id'sini yanlışlıkla last.themeId yapmayın: loadProgress bu hedefi düşürür.

Hedefli kabul:
- İlk 96 MAIN_JOURNEY_IDS + tüm orijinal board hash'leri korunur. Mevcut atlas-legacy-boards.json yalnız ilk 18 tahtayı koruyor; kalan 78 için de baz sürümden karşılaştırma gerekir.
- Yeni 24 benzersiz ID, her biri 5+1 rotaya tam bir kez üye; tam kelime kümesi bakımından eski bölümler/diğer yeni bölümlerle aynı olmayan, konuya uygun içerik. Yerleşim tohumu farklılığı tek başına yeni bölüm sayılmamalı.
- Yeni normal ve final bölümlerde empty/elapsed-only/hint-only/partial/complete kayıtlar serialize-load, last, iki cihaz birleşimi ve cloud owner ayrımıyla korunur.
- Eski 96'sı tamam oyuncu 96/120 görür, önceki albümleri tamdır ve ilk yeni rotanın ilk bölümü önerilir; 120'si tamam oyuncu yeni kayıt/ödül uydurmadan sonlu katalog sonunu görür.
- `atlas-continuation.test.ts` mevcut tüm tamamlanmış tahtalar + 3660 günlük geçmişin API sınırına sığması kontrolü 24 yeni bölümü de kapsayarak korunmalı; limit sessizce kaldırılmamalı.
- Mevcut discovery 3/5/6, replay-best, tamamlama ödülleri ve maskelerin son gruplarda seyrek olması kontrolleri aynen korunur. world-presentation testini rota üyeliği üzerinden altı bölümle doğrulayın; tema başına altı varsayımı artık geçerli değildir.

Mevcut Challenges asenkron arkadaş meydan okuması zaten ayrı ve çalışır bir akıştır. Bu içerik genişlemesi için tekrar kurulması veya kayıtlarının bu rotalara taşınması gerekmiyor.

## 0.28.0 çalışma ağacı dar incelemesi

Kıyı rotalarının gerçek kodu ve doğrudan bağlı devam/ödül görünümleri salt okunur incelendi. Uygulama/test dosyası değiştirilmedi; test çalıştırılmadı.

1. **P1 — Eski tema penceresi yeni rotaları aynı listeye karıştırıyor ve yeni rota kapılarını atlatıyor.** `components/game/App.tsx:128` hâlâ `JOURNEYS.filter(j=>j.themeId===theme.id)` ile koşulsuz oynatıyor. Yeni 20 normal kıyı bölümü `themeId=dunya` olduğundan eski beş bölümle aynı “BEŞ BÖLÜM VE BİR ALBÜM FİNALİ” listesinde gösteriliyor. Kilitli yeni bölüme buradan girmek kayıt oluşturuyor; `discoveryState` eski devam korumasındaki `started(save)` sayesinde rota açılıyor. Düzeltme: eski pencerenin albüm listesi eski base expedition.chapterIds ile sınırlandırılsın veya yeni rotalar kendi kimliği/erişim kontrolüyle ayrı gruplansın. Eski açık katalogdaki mevcut bölümleri yeniden kilitlemeyin. Kabul: boş kayıtta eski Dünya bölümleri önceki gibi erişilebilir; yeni kıyı rotalarının kilitli bölümleri bu pencereden oynanamaz; ana yolculukta 3/5 kapıları geçilince doğru altılı rota açılır.

2. **P2 — Gerçek parça adı çakışması, sonuçta yanlış “yeni parça” bildirimi oluşturabilir.** `components/game/JourneyResult.tsx:14` ve `components/game/AchievementLoop.tsx:VictorySummary` parça kazanımını themeId + title ile arıyor. Eski dunya albümünün “Cep pusulası” parçası ile yeni kiyi-liman albümünün “Cep pusulası” aynı themeId=dunya değerini taşıyor. Diğer cihazın ilerlemesi oyun sırasında birleşirse veya yeni rotanın o parçası tekrar oynanırken eski rotanın parçası kazanılırsa, ödül listesinde yalnız diğer rota ödülü olsa da mevcut parça yeni kazanılmış gibi gösterilebilir. Düzeltme: `piece:${goal.state.expedition.id}:${goal.position}` tam ödül ID'siyle karşılaştırın; JourneyResult'ta goal yerine after. Kabul: aynı isim/tema, farklı rota ödülü is-new / has-new-piece oluşturmaz; gerçek mevcut rota ödülü oluşturur. Ödül verisi doğru rota ID'siyle üretiliyor; sorun sunum eşleşmesindedir.

Diğer kontrol sonucu: discoveryState yeni rotaların explicit bonusId ve kendi album metadatasını kullanıyor; eski Dünya bonusuna bağlanmıyor. `journeyGoal` üyeliği bölüm kimliğinden çözüyor. `nextDiscovery` yeni bölümün gerçek themeId=dunya + journey ID'sini gönderiyor; kayıt hedefini rota kimliğiyle karıştırmıyor. `mainJourneyChapters`, ana devam/milestone ve `worldChapter` rota üyeliği helper'ını kullanıyor; Home yakın yolu ve seçici altılı grupları doğru ayırıyor. Yeni 96-board fixture ayrıca mevcut; bu incelemede çalıştırılmadı.
