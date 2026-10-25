# Arşiv dönüşü · koordinatör doğrulaması

0.11.2 güncel Sites helper kaynağı `965a4bea9af80d347bfaab8cca630ba02a0c8bc1` üzerinden 0.11.3. Kabul/adaylar archive-decision, tek gerçek uzman ilk/son incelemesi archive-reliability-review günlüğünde. Son incelemenin yakaladığı eski dönüş niyeti Solo/Gizli Tema/Hızlı Tur/haritaya bağımsız geçişte temizlendi; ilgili bölüm zinciri ilk kökeni korur. Yeni ajan veya geniş tekrar araştırması yok.

## Geçen yerel kapılar

- **178/178 test, 39 grup.** Önceki 165 regresyon + 13 yeni gerçek hook/bileşen VM kabulü. İlk test fixture'ında dünya özet sayısı verilmediğinden dünya seçicisi oluşmamıştı; fixture doğru releaseCounts ile düzeltildi, son tam paket geçti. Bu, canlı UI'da eksik dünya iddiası değildir. İlk tip hataları dataset index imzası/test tuple erişimiyle giderildi; son tip kontrolü temiz.
- **112 düzenlenmiş tahta / 2240 alternatif yerleşim** içerik denetimi geçti. Bugünün yalnız Kıyıda bir gün / Efsanelerin kapısı çifti var. Önceki yayın snapshot'ları değişmedi.
- TypeScript, son uygulama girdileriyle Sites üretim derlemesi, **iki bağımsız oyuncuyla 200 üretim Worker HTTP kontrolü**, git diff whitespace kontrolü başarılı. HTTP, gerçek derlenmiş Worker'ı yalıtılmış Miniflare DB üzerinde çalıştırır; canlı oyuncu kayıtlarına test yazılmaz. Hesap/misafir, save merge/sahip, arkadaş/oda/Arena, tarihli içerik ve offline paket regresyonları mevcut kontrolde korunur.
- Son build sonrası yalnız README/sürüm/öncelik/geliştirme/günlük belgeleri güncellendi. Runtime, test, bağımlılık ve içerik girdileri değişmedi; geçen kontroller gereksiz tekrarlanmadı. Kilit dosyası ve bağımlılık girdileri değişmediği için yeniden kurulum yok.
- Canlı Worker hata günlüğünün erişilebilen örneği **0 olay** döndürdü; bütün oturumların hatasız olduğu sonucuna genellenmez.

## Koruma ve sınırlar

Arşiv/Albüm/dünya/studio kökeni, public özet aralığı, companion, sayfalama bilgisi ve seçili hedef aynı App oturumu belleğinde tutulur; özel card values, earned/availability, board veya save taşınmaz. Kart ilerlemesi mevcut sahibin hook'unda yenilenir. Owner/source/collection/theme/seçili ID uyuşmazlığı reddedilir. İlk sayfa bitmeden seçim ve reconnect'te yeni önek/boşluk durumları kabulde yer alır. Sekme yenilemesi/OS kapanması için gezinme konumu garantisi yok.

Eski yayın JSON'ları; katalog/engine/content/atlas/discovery/progress/legacy; Solo ve chapter save birleşimi/kuyruğu; DB, uygulanmış göçler, pnpm lock ve hosting manifesti başlangıçla aynı. PublishedPlay gövdesi değişmedi; yalnız aynı modüldeki liste görünümü yeni hook'a taşındı. Yeni servis, hesap, ücret, görsel, bağımlılık veya zamanlayıcı yok. Oyun ücretsiz ve public adres korunur.

Destekli preview önceki ERR_CONNECTION_REFUSED engelinden toparlanmış sayılmaz; alternatif server/browser denenmedi. Fiziksel telefon, DOM/piksel/focus sonucu, sistem büyük yazısı, ekran okuyucu, FPS, gerçek PWA yeniden açılışı veya iki gerçek hesabın cihazlar arası düellosu test edilmiş sayılmaz. Kaynak/VM/HTTP testleri bunların yerine geçmez. Oyuncu etkisi ve App Store hazır oluşu iddia edilmez.

Sonraki öncelik destekli gerçek iPhone/Android gözlemi: ilk açılış, çapraz/iki uç seçimi, İpucu Avı dönüşümü, büyük yazı, arşiv/Albüm odak/scroll, offline/PWA ve hesap/arkadaş düellosu. App Store aşaması Xcode/cihaz/sağlayıcı doğrulamasına bağlı. Haftalık değerlendirme 24 Ekim'de yapıldı; 31 Ekim veya sonraki uygun çalışmaya kadar çoğaltılmaz.

Bu kayıt yerel doğrulama kanıtıdır. Tam kaynak paketi, GitHub PR/CI/birleştirme/tam ağaç eşleşmesi ve aynı adrese başarılı Sites yayını ayrıca gerçek servis sonuçlarıyla doğrulanır; yapılmamış yayın tamamlanmış sayılmaz.
