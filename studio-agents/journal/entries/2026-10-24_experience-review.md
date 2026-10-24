# Oyuncu deneyimi · ilk sınırlı inceleme

24 Ekim 2026. İnceleme tabanı: 0.8.2, Sites kaynak `14e8cceb5f4d7ece7911eba21ab98b5523b254cf`. Bugünün iki bölümü zaten yayımlanmış kabul edildi; içerik üretimi veya uygulama değişikliği yapılmadı.

Kapsam: `PublishedPlay`, `PublishedChapters`, `DailyDiscoveries`, bunların kart/kayıt ve solo giriş-dönüş bağlantıları. AGENTS, deneyim rolünün beş dosyası, öncelikler, strateji/marka/oyuncu bağlamı, koordinatörün ilk kaydı, README, sürüm/harita belgeleri ve geliştirme defterinin son kaydı okundu. Bu dosya dışında yazım yapılmadı.

## Öncelik sırası

| Sıra | Bulgu | Etki | Kanıt | Maliyet / risk |
| --- | --- | --- | --- | --- |
| 1 | Doğrulanmış indirilmiş bölüm, zayıf bağlantıda ağ okumasını bekliyor | Kısa solo molada oyuna ulaşmayı geciktirebilir | Başlatma sırası ve yükleme ekranı kaynakta açık | Küçük-orta; geç bulut yanıtını güvenli birleştirme korunmalı |
| 2 | Cihaz kaydı hatası, olumlu onay simgesi ve normal kayıt rengiyle gösteriliyor | Ayrılmadan önce kaydın güvende olmadığını fark etmeyi zorlaştırabilir | Hata durumunun simge/CSS eşlemesi açık | Küçük; kayıt kuralları değişmeden sunum düzeltmesi |
| 3 | Ana sayfa arşivinden açılan bölümden dönüş arşiv bağlamını kaybediyor | Eski tarihteki diğer keşfe dönmek için ek adım gerektirir | Pencere kapanışı ve üst düzey geri dönüş kaynakta açık | Küçük-orta; arşiv kökeni ve sayfa bağlamını koruma |

## 1. İndirilmiş bölümün açılışını bulut kontrolünden ayır

**Kaynak:** `components/game/PublishedChapters.tsx:38–49,54–57`; hazır kart bildirimi için `components/game/ChapterAvailability.tsx:4–9`, `components/game/DailyDiscoveries.tsx:23`; yerel doğrulama için `lib/studio/chapter-cache.ts:18–24`.

**Kanıt:** Oynatıcı doğrulanmış yerel tahtayı önce buluyor (`42`), ancak `navigator.onLine` doğruysa bölüm GET'ini, ardından hesap varsa ilerleme GET'ini bekliyor (`43–46`). Tahta yalnız bu sıradan sonra gösteriliyor. `8000` ms iptal eşiği tanımlı (`41`); hata halinde yerel tahta ile açılabilen yol mevcut (`47`). Bu bekleyişte gösterilen metin yalnız “Bölümün ve kayıtların hazırlanıyor…” ve dönüş eylemi (`56`); yerel tahtayla hemen açma seçeneği yok. Kart ise aynı doğrulanmış tahta için “Çevrimdışı hazır” diyor.

**Varsayım / oyuncu faydası:** Bağlantı var görünüp istekler ilerlemiyorsa, oyuncu indirilmiş bölümün neden açılmadığını anlayamayabilir. Doğrulanmış cihaz kaydıyla oyuna erişim, kısa molada beklemeyi azaltabilir. Bu, gerçek cihazda ölçülmüş gecikme veya oyuncu davranışı değildir; 8 saniye gözlem sonucu değil kaynakta tanımlı eşiktir.

**En küçük öneri:** Doğrulanmış tahta bulunduğunda yerel kayıtla açılış yolunu ağ isteğinin tamamlanmasına bağımlı bırakma. Gerekirse yükleme ekranında açık bir “Cihaz kaydıyla aç” eylemi sun. Bulut doğrulanana kadar “Cihaz kaydınla açıldı · Hesabın kontrol ediliyor” gibi doğru durum göster; mevcut hesap/generation sınırları ve en iyi kayıt birleştirmesi korunsun. Yeni istek veya içerik indirme sistemi gerekmez.

**Kabul ölçütleri:**

- Geçerli önbellek ve doğru hesaba ait yarım kayıt varken iki GET de bekletilse bile oyuncu ağ yanıtı/iptal eşiği gelmeden yerel tahtaya ve bulunan kelimelere ulaşabilir.
- Yerel tahta yoksa veya kimlik/hash/içerik doğrulaması başarısızsa bu yol sunulmaz; mevcut hata/yeniden dene davranışı korunur.
- Bekleyen bulut yanıtı gelince yeni bulunan kelimeler, en iyi tamamlanmış sonuç ve hesap ayrımı korunur; bulut onayından önce “Hesabında kayıtlı” denmez.
- Koordinatör değiştirirse bu senaryolar hedefli kontrolle sınanır; destekli önizleme toparlandığında zayıf bağlantıda gerçek dokunmatik açılış ayrıca gözlenir.

## 2. Cihaz kaydı hatasının görsel dilini düzelt

**Kaynak:** `components/game/PublishedChapters.tsx:50–57`; `app/discovery.css:32,34`; `app/quality.css:44`; sonuçtaki farklı hata sunumu için `app/releases.css:56`.

**Kanıt:** `localStorage.setItem` başarısız olunca `storage-error` durumuna geçiliyor (`50`) ve metin bunu açıkça bildiriyor (`54`). Fakat üst durum satırı bu durumda da `<Check>` seçiyor (`57`); kaydedildi durumundan ayrı bir hata sınıfı yok. CSS normal kayıt metnini yeşil tonuyla biçimlendiriyor. Tarihli sonuç kartında hata için ayrıca `.failed` sunumu var; oyun sürerken üst satırda aynı ayrım yok.

**Varsayım / oyuncu faydası:** Olumlu onay işareti, hata metnini hızlı tarayan oyuncuya çelişkili sinyal verebilir. Açık bir uyarı simgesi ve ayırt edilebilir hata sunumu, özellikle oyun bitmeden çıkarken kaydın güvende olmadığını fark etmeye yardımcı olabilir. Yanlış anlama görülmüş değildir.

**En küçük öneri:** Yalnız `storage-error` için uyarı simgesi ve hata sınıfı ekle; mevcut açık metni ve `role="status"` davranışını koru. Renk tek başına anlam taşımasın. `saved`, `syncing`, yerel ve bağlantı bekleyen durumlar mevcut kayıt doğruluğunu korusun.

**Kabul ölçütleri:**

- Cihaz yazması başarısızken olumlu onay simgesi gösterilmez; hata metni simge ve ayrı stil ile birlikte görünür.
- Sonraki başarılı yazma ve gerçek bulut onayı ilgili durumu doğru yeniler; yalnız stil değişikliği kayıtlı iddiası üretmez.
- Kaynak stilinde büyük metin/dar ekran sarılması korunur; gerçek telefon ve ekran okuyucu doğrulaması yapılmadan bu alanlarda başarı iddiası kurulmaz.

## 3. Arşivden bölüme ve geri dönüşte seçilen tarihi koru

**Kaynak:** `components/game/DailyDiscoveries.tsx:21,25`; `components/game/App.tsx:62,69–74,81`; arşiv sayfalaması için `components/game/PublishedChapters.tsx:25,27,33`.

**Kanıt:** Ana sayfanın arşiv penceresi kart seçilince açıkça kapanıyor (`DailyDiscoveries:25`). Üst bileşen oyun görünümüne geçtiğinde Keşfet ve arşiv bileşenleri kaldırılıyor (`App:73,81`). Genel geri dönüş ek bölümü temizleyip sayfanın tepesine gidiyor (`62`); arşiv kökeni, seçilen tarih veya yüklenmiş sayfalar taşınmıyor. Albüm için ayrı dönüş işareti var (`69`), ana sayfa arşivi için yok.

**Varsayım / oyuncu faydası:** Eski tarihli ilk keşfi oynayan kişi aynı tarihin ikinci kartına veya başka eski bölüme dönerken arşivi yeniden açmak zorunda kalır. Gelecekte daha fazla sayfa olduğunda yeniden yükleme de gerekebilir. Arşiv konumunu korumak kalıcı bölümlere dönüşü kolaylaştırabilir; ek adımların terk etkisi ölçülmedi.

**En küçük öneri:** Ek bölüm açılırken kökeni ana sayfa/arşiv/Albüm olarak koru. Arşiv kökeninden açık dönüşte aynı pencereyi seçili tarih ve mevcut sayfa bağlamıyla geri getir; diğer giriş noktaları kendi mevcut dönüşünü kullansın. Otomatik sonraki oyun başlatma veya kayıt değişikliği gerekmez.

**Kabul ölçütleri:**

- Ana sayfa arşivinde eski bir tarihten açılan bölümden geri dönünce aynı tarih tekrar görünür; oyuncu arşivi yeniden açmak zorunda kalmaz.
- Sayfalama varsa önceden yüklenen aralık korunur; kullanıcı başka bölüme yönlendirilmez.
- Ana sayfanın doğrudan iki kartından dönüş ana sayfaya, Albümden dönüş damga alanına devam eder; geri dönüş oyun veya ödül kaydı yazmaz.

## Doğrulama sınırı ve devir

Yalnız kaynak ve stil üzerinden yolculuk incelemesi yapıldı. İlk solo öğrenme tahtasının yerel içerikle açılması (`App.tsx:42–48`, `Solo.tsx:25,28`), kartta ilerleme ile cihaz hazırlığının ayrı bileşenlerle sunulması ve arşivde mevcut 44 px eylem/tek sütun kuralları korunan olumlu tasarım kararlarıdır; gerçek cihaz doğrulaması değildir.

Yeni test, sunucu, tarayıcı veya alternatif önizleme yolu çalıştırılmadı. Önceki kilit/erişim engelinin giderildiğine dair kanıt yok. Fiziksel telefon, dokunma, ekran okuyucu, çevrimdışı PWA kabuğu, FPS ve oyuncu tutma ölçülmedi. Günlükteki kabul ölçütleri öneridir; uygulanmış veya geçmiş kontrol gibi okunmamalıdır. Öncelik önerim 1 numaralı açılış sürtünmesi; nihai seçim, uygulama ve yayın koordinatördedir.
