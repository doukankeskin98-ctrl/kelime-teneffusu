# Öncelikler

25 Ekim 2026, 0.10.0: kullanıcı tüm deneyim ve eğlenceyi önceliklendirdi. Hızlı Tur, dünya içi günlük katalog ve sosyal davet akışı uygulandı. İki sınırlı incelemenin gerçek bulguları studio-* günlüklerinde. Sonraki kanıt gereksinimi: erişilebilir destekli önizleme ve gerçek telefonlarda bu akışların oynanması; oyuncu gözlemi olmadan eğlence/retansiyon başarısı iddia etmeyin. 24 kayıt sınırında aynı tema çiftinin damgası regresyonla korunur.

25 Ekim 2026: kullanıcının mobil UI/UX isteği önceliklendirildi. 0.9.0 uygulaması, iki uzman incelemesi ve kontroller 2026-10-25_mobile-* günlüklerinde. Öncelik: destekli telefon görünümünde 360×640, 390×844, 430×932 normal/büyük yazı, çapraz seçim, duraklatma, Arena ve kayıt geri dönüşünü doğrulamak. İlk önizleme ERR_CONNECTION_REFUSED nedeniyle gözlenemedi. App Store veya tam stüdyo kalitesi onayı verilmedi. Bundan sonraki isteklerde aynı görev/ortak günlük/tek uygulama sahibi yapısı sürer; yeni otomasyon veya servis kurulmadı.


24 Ekim 2026 akşam. Başlangıç: Sites `4e3e63c8c9df9af590128c21e198c1e16712ffc4`, GitHub `4e311d7bea09a784f4fedf612f77de5031fd9db1`, 0.8.3.

0.8.4 odağı tamamlandı: hesap/bölüm başına kuyruk; gönderim sürerken tamamlayıp oyun içinden çıkışta son snapshot drain'i; yeni hesabı kilitlemeyen iptal; token/HTTP/JSON dahil süre sınırı; sunucuda beklenen hesap kontrolü; cihazdaki iyi sonucu koruyan geç yanıt birleşimi. Tek sınırlı uzman tasarım/son inceleme yaptı. Yerel 130 test, 180 Worker HTTP, tip, 32 tahta/640 alternatif ve son üretim derlemesi geçti. GitHub CI/ağaç eşleşmesi ve Sites yayın sonucu ayrıca gerçek metadata ile doğrulanır. Son kanıt `../journal/entries/2026-10-24_evening-coordinator-validation.md`.

1. İndirilmiş tahtayı ağ beklemeden açma; geç bulut yanıtını oyun sırasında bulunan yeni kelimeleri silmeden birleştirme. Kabul: doğrulanmış tahta hemen açılır, bekleyen hesap kaydı doğru anlatılır, çoklu cihazın iyi sonucu ve sahip sınırı korunur. Önce kaynak/yalıtılmış regresyon, sonra destekli cihaz gözlemi.
2. Arşivden dönüşte seçilen tarih ve yüklenmiş aralığı koruma. Doğrudan ana sayfa ve Albüm dönüşü kendi bağlamında kalmalı.
3. Destekli iPhone/Android doğrulaması: ilk açılış, çapraz seçim, iki uca dokunma, büyük yazı, kayıt/çevrimdışı yeniden açılış ve arkadaş odası. Önceki önizleme kilit/erişim engelinde toparlanma kanıtı yok. Kaynak/VM/HTTP testi gerçek telefon veya FPS ölçümü sayılmaz.
4. İzinli oyuncu gözlemi ve iOS dikey prototipi. Xcode/cihaz ve giriş sağlayıcısı doğrulanmadan hazır sayma; ölçülmemiş tutma/gelir artışı iddiası yok.
5. PWA gerçek cihaz kontrolüyle varsayılan Apple/favikon adreslerindeki önceki 404'leri değerlendir. Küçük simge eksiği, kanıtlanmış çekirdek kayıt sorunlarının önüne geçmez.

24 Ekim'in **Parkede küçük mola** ve **Yörüngede bir gün** çifti yayımlandı; ikinci çift yok. 0.8.3 hata dönüşündeki tamamlamayı tekrar gönderme ve durum simgeleri korunur. Bu tur ilk iki açık kuyruk/hesap işi geride bırakılır; indirilmiş tahtanın başlangıç ağ bekleyişi, arşiv bağlamı ve gerçek cihaz doğrulaması tamamlanmış sayılmaz. Sekme kapanması/OS sonlandırmasında garantili bulut teslimi yoktur; cihaz kaydı ve tekrar açılışta olağan eşitleme korunur.

Son haftalık değerlendirme: **24 Ekim**, `../journal/entries/2026-10-24_weekly-review.md`. Sıradaki: 31 Ekim veya sonraki ilk uygun mevcut çalışmada; yeni görev/servis oluşturma. Yeni keşif odası/ortak gizem, çekirdek erişim ve gerçek cihaz kanıtından sonra değerlendirilir. Ücret, reklam, mağaza yayını veya yeni hesap bu turun kapsamında değildir.
