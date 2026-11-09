# 0.46 ortak arayüz ve performans kabulü

Odak: ortak pencere/düğme sahipliği, yinelenen alt ekran başlıkları ve Arena saatinin gereksiz renderları.

- Pencereler varsayılan olarak aynı oyun yüzeyini kullanır; sahneli sonuç ve şeffaf ayarlar ayrı varyanttır. Kapatma alanı en az 44×44 CSS px; uzun içerik ve küçük ekranlarda başlık/işlemler erişilebilir.
- Diğer oyunlar ve profil tek görünür sayfa başlığı taşır.
- Arena hub, hazır lobi ve sonuçta saat interval'i yoktur. Hızlı eşleşme 15 sn alternatifi tek deadline ile; aktif tur sunucu saati korunur. Gizlenme/dönüş zaman hesabını düzeltir, yeni puan veya ek süre üretmez.
- Önce/sonra aynı yerel fixture için 30 sn React commit sayısı ve üretim giriş paketi ölçülür. Tarayıcı ölçümü fiziksel iPhone FPS kanıtı sayılmaz.
- Kayıt anahtarları, şema, bölüm kimlikleri/tahtalar ve dokunma motoru değişmez. Ortak pencereler 375 ve 414 px görünür alanda incelenir.
- Gereken kontroller: hedefli zamanlayıcı regresyonu, tüm proje testleri, typecheck, içerik, db:generate farkı, web/mobile derleme ve Worker HTTP.

Diğer öneriler: kullanım dışı yan ekranların yüklemesini ayırma yalnız giriş paketinde ölçülebilir kazanç ve güvenli hata/dönüş davranışı sağlarsa uygulanır. Kullanıcı araştırması, reklam/lig servisleri ve fiziksel cihaz hissi otomatik testle tamamlanmış sayılmaz.

## Sonuç — 9 Kasım 2026

0.46.0 / iOS 33. Varsayılan Modal artık ortak koyu oyun penceresidir. Özel sonuç/ana ayarlar düzenleri korunur. Pencere dış yüzeyinin kuralları dialog-frame.css içine taşındı; yeni bir geçersiz kılma dosyası eklenmedi. 44 px kapatma alanı, kelime/tanım listesi, açık renk albüm kartlarının kendi metin rengi ve Diğer oyunlar/Profil çift başlıkları düzeltildi.

Arena hub/sonuç/hazır lobide sürekli saat yok; hızlı bekleme alternatifi tek 15 sn deadline kullanır. Aktif tur saniye sınırlarında yenilenir, görünmezken durur ve görünürken sunucu zamanı üzerinden yetişir. Hamle kabulü render edilmiş eski zamana göre değil, hamle anındaki saate göre ön kontrol yapar; nihai doğrulama sunucudadır. Dokunma motoru ve kayıt formatları değişmedi.

Sprint, Friends, Mystery, BonusRound, SupportReport, DeleteAccount ve PrivacyInfo isteğe bağlı yüklenir; kısa yükleme ve hata dönüşü vardır. Offline paketleyici bu parçaları da paketler. iPhone GameSharing izinli origin'i Capacitor yapılandırmasından alır; aynı GAME_ORIGIN hem web davetlerini hem bu yapılandırmayı besler. HTTPS, tek davet parametresi ve kod doğrulama korunur.

### Ölçüm

- Aynı kaynak karşılaştırması, yerel Vite geliştirme önizlemesi, aynı mock transport, React Profiler: açılıştan sonraki 1–31 saniyede Arena hub **150 → 0 commit**, toplam React commit işi **534 → 0 ms**. Bu bir boşta iş azaltma ölçümüdür; native FPS/cihaz pil ömrü değildir.
- Gerçek mobile üretim giriş JS **673633 → 626406 bayt**, yaklaşık %7 azalma. Aynı Python gzip işlemiyle **212478 → 198163 bayt**. Firebase zaten ayrı paketteydi.
- CSS **502415 → 503320 bayt** (gzip **96435 → 96573**). Bu turda CSS boyutunun düştüğü iddia edilmiyor; ortak sahiplik düzeltildi. Kör CSS silme yapılmadı.
- 414×628 tarayıcı viewport'unda aynı ODAK çapraz sürüklemesi +1300 ms geri bildirim örneği: önce 90 aralık / p95 18.4 ms / maksimum49.9 ms; sonra89 aralık / p95 18.5 ms / maksimum50 ms. İkisinde de34ms üzeri1 aralık. Tek kısa örnek; hız artışı kanıtı değildir, fiziksel iPhone'da uzun oturum ölçümü açık kalır.

### Doğrulama

859 test /164 grup; typecheck;273 düzenlenmiş tahta /5460 alternatif; ek Arena/kelime kontrolleri; db:generate fark yok; üretim web derlemesi;703 Worker HTTP kontrolü; mobil paket46 dosya eşleşmesi; iOS Release imzasız derleme başarılı.

375×667: ayarlar, ertelenen destek ekranı, yan menü, kısa oyun penceresi, Hızlı Tur açılışı/dönüşü ve tanım listesi. 414×628:9×9 bölümün tamamı, oyun ayarları/yardım, tek çapraz sürükleme/kelime onayı/sonuç. Yerel veriler sentetiktir. Bu tur telefona yükleme veya gerçek parmak/titreşim testi yapılmadı. Önceki kişisel ilerlemelere dokunulmadı.

## Önceki önerilerin kalan sırası

- İlk5 dakika ve uzun oturum:5–8 gönüllü yeni oyuncu gözlemi, fiziksel iPhone/Android ölçümü gerekir; test sonucu yerine yazılmaz.
- İçerik: konu/kelime uyumuyla24 özgün bölüm önerisi sonraki içerik paketi olarak kalır. Mevcut168 bölümün kimlikleri ve tahtaları değişmedi. Yerleşim varyasyonları yeni bölüm sayılmaz.
- Ses: sınırlı başarı melodisi/isteğe bağlı ambiyans, önce kulaklık ve cihaz karşılaştırmasıyla; kabul edilmiş titreşim/kelime uçuşu bu sürümde değiştirilmedi.
- Haftalık cezasız ilerleme, açıkça etiketli alıştırma rakibi ve isteğe bağlı hatırlatma ayrı ürün deneyleridir. Sahte insan rakip veya gizli Arena zorluğu eklenmez.
- Reklam/IAP/mağaza yayını: yayıncı hesabı, gerçek destek kanalı, sağlayıcı ve mağaza beyanı netleşince. Ücretli servis veya yeni SDK bağlanmadı.
- Ayrıntılı istemci hata raporu için önce mevcut Apple/Xcode ve isteğe bağlı hata sayaçlarıyla pilot kanıtı; hassas günlükleri otomatik göndermek varsayılan olmaz. Arkadaşlık ilişkileri mevcutken Contacts beyanı körlemesine kaldırılmaz.

Kaynak, kontrollerden sonra GitHub ve Sites'ta aynı ağaçla saklanır. Masaüstündeki iCloud boşaltması nedeniyle derleme geçici yerel çalışma alanında tamamlandı; son kaynak ayrıca çalışma alanındaki kalıcı stüdyo kopyasına aktarılır.
