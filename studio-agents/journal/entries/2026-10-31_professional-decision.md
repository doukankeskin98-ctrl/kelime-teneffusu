# 31 Ekim 2026 · Profesyonel yolculuk ve oyun deneyimi

Kullanıcı tüm mobil UI/UX ve oynanışı ileri taşımayı, web sürümünü gelecekte satılabilir uygulamaya hazırlamayı istedi. Native uygulama/ödeme bu turun dışında. Yeni kapsam önceki dar yayın görevlerinin faz sınırlarını genişletir. Başlangıç Sites43/0.19.0, kaynak4327211. Numaralı ana yolculuk kaynakta aktif; eski bağlamın yalnız taslak bilgisi eskimiştir.

Adaylar: yeni mod/ekonomi (deneyimi dağıtır); yalnız renk değişimi (yetersiz); ana döngünün görsel ve işlevsel iyileştirilmesi (seçildi). Bölüm seçimi → anlaşılır hedef → buluş → gerçek koleksiyon → sonraki bölüm. İki uzman salt okunur ürün/güvenilirlik incelemesi; kod ve yayın koordinatörde.

Uygulama öncesi kabul:
- Özgün vektör dünya sahnesi ve belirgin ana Oyna/Devam eylemi; krem/orman yeşili kimliği.
- Etkileşimli yakın bölümler ve bütün yolculuk seçicisi; erişim mevcut dünya/bonus kapısından gelir. Bitmiş bölüm practice turu açar, kayıt/en iyi sonuç korunur.
- Solo hedef odağı: seçilebilir kelime/tanım, bulununca sıradaki kalan hedef. Konum/cevap ifşası, ipucu tüketimi, puan ve ağ oyunu semantiği değişmez.
- Başarı ekranında gerçek parça, yıldız, albüm ve dünya/bonus açılışı; tekrarda yeni ödül iddiası yok. Sonraki bölüm gerçek eksik kayda dayanır.
- İlk oyun yönlendirmesi ve metinler kısa/doğal; mobil kontroller en az44px; küçük telefonda Oyna ilk ekranda.
- 360/390px telefon ve768px tablet, tarayıcıyla başlangıç/kelime/sonuç/tekrar/ayar; yatay taşma ve erişilemeyen kontrol yok. Fiziksel cihaz/ses/FPS ayrıca açık.
- İçerik/kimlik/tohum/eski tahtalar/göçler korunur. Regresyon, içerik/tip/build/Worker ve CI/kaynak eşleşmesi geçmeden yayın yok.

Kaynaklar: https://developer.apple.com/app-store/onboarding-for-games/ ; https://developer.apple.com/design/human-interface-guidelines/feedback ; https://supercell.com/en/games/brawlstars/blog/news/rip-masteries/ ; https://developers.google.com/youtube/gaming/playables/certification/best_practices_design . Tutma/gelir artışı ölçülmedi.

Yerel macOS sistem git Xcode lisansına takıldı; mevcut paketli git kullanıldı. Aynı Site kaynak yardımcıyla açıldı. Linux-only pnpm kurulumuna Darwin için aynı sabit pnpm/frozen-lockfile ve proje deposu eklendi; bağımlılık yükseltmesi yok.

## Uygulama ve doğrulama

0.20.0: özgün SVG dünya panoraması, telefon/masaüstü görsel sistemi, gerçek açılma ve tekrar durumlu yakın yol ve 96 bölüm seçicisi, yalnız solo için cevabı ifşa etmeyen hedef seçimi, gerçek bonus/ödül sunumu. Eski yalnız süre/ipucu kayıtları ve kısmi bonus devamı korunur; aynı available seti ana öneri/seçiciye hizmet verir. Kayıt formatı/şema, içerik ve tahta kimlikleri, ekonomi, günlük ve Arena kuralları aynı.

493/493 test (104 grup), yedi yeni odak/picker/eski kayıt/bonus davranış kontrolü; bağımsız uzman56/56 hedefli testi ve eski bonusun sıfır/stroke/elapsed/hint/complete probunu çalıştırdı, açık bulgu kalmadı. TypeScript temiz. İçerik156 ana tahta ve3.120 alternatif +64 farklı12×12/dokuz grup tahtası; üretim build20 istemci chunk Safari12 sözdizimi;525 izole Worker HTTP kontrolü (iki legacy, sekiz private-group,16 public-group oturumu) geçti. Yeni bağımlılık veya migration yok.

CUA yerel tarayıcı: gerçek CSS390×844 ana ekran/ilk bölüm, dört kelime iki uçla seçildi, üç yıldız ve0→1 albüm, sonraki bölüm,360×640 tahta/kontroller ve duraklatma/devam,96 bölüm penceresi ve kilit, dört tanımlı İpucu Avı,768×1024 tablet geometri, adaçayı/büyük harf/kontrast tercihi. scrollWidth telefon360/tablet768 ile clientWidth'a eşit; küçük telefonda kontroller altı621.7 <640. Yerel D1 şeması ayrı test verisine uygulandı; canlı oyuncu kaydı kullanılmadı. Yerel mock profil hiçbir ticari/gerçek hesap iddiası değildir. Önceki browser erişim engeli bu macOS checkout'ta yok. Sonuç albümündeki eski compact genişlik hatası görsel QA ile bulundu ve width100% ile onarıldı.

Fiziksel iOS/Android, ekran okuyucu, gerçek parmak kaydırma/medya ses konforu, mağaza yayını, FPS/retention ve ödeme doğrulanmadı. Bu sürüm ticari yayın onayı değildir. GitHub CI/ağaç eşleşmesi ve aynı Site yayını son native sonuçla ayrıca kaydedilir.
