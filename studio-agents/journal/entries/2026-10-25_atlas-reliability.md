# Devam eden keşif atlası güvenilirlik incelemesi · 25 Ekim 2026

Kapsam: content.ts, discovery.ts, progress.ts, next-discovery.ts, cloud.ts, progress API, progress-sync.ts ve ortak Solo/Discovery tüketicileri. Kod değiştirilmedi. En fazla üç odak aşağıdadır.

## 1. Harita kimliği bugün tema kimliğiyle aynı; aynı temada ikinci harita yanlış bonus/album seçer

**Kanıt:** `discovery.ts` expedition.id ile bonus ve album için themeId üzerinden ilk `.find` sonucunu kullanır. `Solo.tsx:73–76` haritayı `journey.themeId` üzerinden bulur ve sıradaki bölüm/bonusu oradan çıkarır; DiscoveryResult da bu bağı kullanır. Eski üç haritanın beş sabit chapterIds listesi bilinçli uyumluluk sınırıdır. Yeni bölümleri bu listelere eklemek eski bonus açılışını ve tamamlanmış album durumunu değiştirir.

**Öneri:** Yeni benzersiz temalar için yeni sabit beş bölüm + ayrı altıncı bonus, yeni album ve yeni expedition kimliği eklemek mevcut yapıyla en düşük risklidir. Aynı tema tekrar kullanılacaksa mapId, açık chapterIds/bonusId ve album bağlantısı gerekir; `.find(themeId)` ile devam edilmemeli. Yeni kayıt kimlikleri asla eski `uzay-1..5`, `turkiye-1..5`, `hababam-1..5` veya üç bonus kimliğini tekrar kullanmamalı. Yayınlanan words/size/seed değişmemeli; seed `hash('journey-v1:'+id)` ile kimliğe bağlıdır.

**Kabul:** Güncelleme öncesinde tamamlanmış ilk üç haritanın board JSON hash'leri, chapterIds, bonus açılışları, altı earned parçası ve album complete değerleri aynen kalır. Yeni harita eklemek eski ödül üretmez; yeni bölüm bitince yalnız yeni harita parçası verilir. Aynı temada ikinci harita varsa sonuç ve sonraki bölüm o haritadan seçilir.

## 2. Yeni yolculukların kayıt, devam ve açılış zinciri birlikte bağlanmalı

**Kanıt:** `progress.ts:12` knownKeys modül yüklenirken ALL_JOURNEYS'ten kurulur. `loadProgress` bilinmeyen kayıtları sessizce atar; `last.journey` yalnız aynı kayıtlı themeId ve ALL_JOURNEYS eşleşmesinde korunur. `CloudProgress.save/read` de aynı loadProgress filtresini kullanır. Yalnız UI'ye yeni harita eklemek reload veya bulut eşitlemesinde yeni kaydı kaybettirir. `discoveryState` yeni dünyayı önceki haritanın üç ana bölümünden sonra açar; altıncı bonus açılışı beş ana bölüme bağlıdır. `nextDiscovery` önce geçerli yarım last kaydına öncelik verir, ardından recommendedExpedition yoluna gider.

**Öneri:** Yeni bütün bölüm/bonuslar statik ALL_JOURNEYS, journeyById, progressBoard ve geçerli THEMES ilişkisine dahil edilmeli. Eski v2 anahtarı/şeması korunabilir. Yeni devam haritaları EXPEDITIONS sonuna eklenmeli, ilk üç sıraya sokulmamalı. Kullanıcı altı bölüm bitirme şartı istiyorsa sadece yeni harita geçişlerinde açık gate tanımlanmalı; eski üç için 3 ana bölüm/5 bonus sözleşmesi değişmemeli. UI'nin sabit 15/18, done/5 ve earned[5] varsayımları yeni toplamı doğru göstermeli.

**Kabul:** Her yeni bölüm için kısmi ve tam kayıt local JSON -> loadProgress -> CloudProgress.save/read döngüsünde aynı strokes ve last.journey ile kalır. İki cihazdaki ayrı doğru seçim birleşir; tekrar oyununda iyi yıldız/süre korunur; B hesabı A'nın parçasını görmez. Eski 18 bölümü bitirmiş kullanıcı ilk yeni haritayı açık görür ve nextDiscovery onu önerir; yeni bölüm bitince anlamlı sıradaki bölüm gelir, bonus tamamlandığında haritaya döner. Sahte complete:true doğru strokes olmadan ödül üretmez.

## 3. Sürekli atlası sınırsız tek progress JSON'u olarak büyütme sınırı var

**Kanıt:** `loadProgress` 150000 karakteri aşan girdide tamamen emptyProgress döndürür; `/api/progress` request body sınırı 150000 byte'tır. CloudProgress tüm kayıtları tek campaign_saves.data JSON'unda taşır. progressBoard cache ilk çözümden sonra board'u tekrar kullanır; bu koruma korunmalı. ProgressSync keepalive sınırını 60000 byte altında tutuyor, büyük payload için normal gönderime geçiyor.

Bu tur yerel ölçüm: bugünkü 120 kayıt tamamen çözülmüş ve maksimum elapsed/hints ile **38618 byte**; ayrıca izin verilen 3660 günlük tarih eklenince `{progress:...}` gövdesi **86210 byte**. Mevcut küçük bir atlas genişlemesi tek başına sınır aşıyor denmiyor. Ancak çok sayıda sürekli harita birikimi için sınır gerçektir; API byte sınırı ile loader karakter sınırı aynı şey değildir.

**Öneri:** Bu sürümün bütün yeni haritaları tamamlanmış en büyük geçerli fixture'ını API gövdesi olarak ölçün; 150000 byte'a yaklaşmamalı. Tüm kayıtları yenileyen veya her render'da bütün yeni board'ları yeniden üreten hesaplar eklemeyin. Sınırsız büyüme sonraki işse sahip/bölüm kayıtlarıyla parçalama tasarımı gerekir; sırf bu sınırlı sürüm için göç şart değil. Limit aşımında sessiz sıfırlama uzun vadeli büyüme için güvenli varsayılan değildir.

**Kabul:** Eski ve yeni tüm bölümler, maksimum tarih listesi ve geçerli ayarlarla serialize edilen request sınır altında; reload/save hiçbir anahtar düşürmez. İlk doğrulama ve tekrar doğrulama süreleri ölçülür; cache sıcak yolunda gereksiz board yeniden üretimi yoktur. Kaynak içerik testi bütün yeni board hedeflerini ve iki eğimde çapraz çözümü doğrular.

## Sınır

İnceleme kaynak ve yukarıdaki boyut ölçümüyle sınırlı. Tarayıcı, fiziksel telefon, gerçek hesap veya üretim DB testi yapılmadı. Kaynak/oyuncu etkisi varsayımı görsel ve performans garantisi değildir. Uygulama, zorunlu regresyonlar, CI ve yayın koordinatöre aittir.

## 0.11 son kaynak incelemesi

Kritik somut yeni hata bulunmadı. İncelenen kapsam: atlas-content.ts, content.ts kayıt listeleri, discovery.ts/nextJourneyAfter, Solo sonuç gecikmesi ve İpucu Avı, wordCardCopy/common.tsx, Discovery haritası.

- Yeni 13 harita benzersiz mevcut tema kimlikleri kullanıyor; beş ana bölüm ve altıncı bonus ALL_JOURNEYS oluşturulmadan önce listelere ekleniyor. Eski üç haritanın kimlik ve sırası korunuyor. Tema üzerinden bonus/album eşleştirmesi bu sınırlı genişlemede belirsizlik yaratmıyor.
- nextJourneyAfter önce mevcut haritanın eksik bölümünü, sonra açık bir haritanın sıradaki bölümünü seçiyor. Solo temayı da değiştirerek devam ediyor. Sonuç penceresinin 650 ms gecikmesi kayıt veya completed durumunu geciktirmiyor; bu sırada yeni seçim kabul edilmiyor.
- Yeni ipuçları tek parçalı hedeflerde cevap bulunana kadar tanım ve harf sayısını gösteriyor. Harita bonus düğmesi beş ana bölüm koşulunu koruyor. Yeni görsel efekt pointer olaylarını yakalamıyor.

Koordinatörün bildirdiği doğrulamalar: 78 yeni bölüm içerik kontrolü, altı atlas testi, eski 18 board SHA eşitliği ve tüm kayıtlar + 3660 tarih için 150000 byte altı gövde. Test kaynaklarının kapsamı bu kabul ölçütleriyle uyumlu; bu son incelemede testler tekrar çalıştırılmadı. Önceki sınırsız kayıt büyümesi notu gelecekteki genişlemeler için geçerliliğini koruyor.

Tarayıcı QA ERR_CONNECTION_REFUSED nedeniyle engelli; bu sonuç görsel yerleşim, gerçek cihaz dokunma veya üretim senkronizasyonu doğrulaması değildir. Kod değiştirilmedi.
