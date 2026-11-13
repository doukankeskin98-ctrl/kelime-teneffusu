# 0.51.0 · Kayıt ve içerik uyumluluğu

Onaylanan planın ilk dağıtım aşaması: eski v2 ve kompakt v3 okunur; canlı ana kayıt v2 yazılır, doğrulanmış v3 kopyası ayrı tutulur. `COMPACT_PROGRESS_WRITES=false`, `CONTENT_REVISION_TWO=false`. Fiziksel iPhone testi kullanıcı tarafından ertelendi. Bu sürüm, 120 bölümün zorluk/tekrar sorununu tamamlanmış saymaz.

## Değişen davranış

- 312 yayımlanmış bölümün kimlik, sıra, içerik, kanonik tahta ve güvenli sunum özetleri birebir korunur. Dört kapalı rev2 adayının sunum anahtarı ayrı, mantıksal kayıt/ödül kimliği aynıdır. Başlanmış ve tamamlanmış rev1 kayıtları kendi tahtasına sabitlenir. İki sürümün çizgileri asla birleştirilmez; her ikisinin geçmişi saklanır.
- v3, çizimleri silmeden tekrarlanan nesne anahtarlarını tuple biçiminde saklar. Alternatif kabul edilen yollar, zaman, ipuçları, yıldızlar ve tercihler korunur. Bilinmeyen sürüm veya geçersiz v3 çizgisi boş kayıt gibi kabul edilmez.
- İstemci sunucunun v3 desteğini okur; ilk dağıtımın gerçek PUT gövdesi v2 kalır. Eski sunucuya yeni biçim gönderilmez. Rev2 içeren kaydı eski istemci okuyamaz/yazamaz: sunucu güncelleme gerektiğini bildirir ve kayda dokunmaz.
- Yerel geçiş kodu geçici yazım, geri okuyup karşılaştırma, birebir eski ham yedek ve en son ana anahtar değişimini uygular. Hata/kota/kesilme senaryolarında eski kayıt korunur. Değişmemiş gölge her eşitleme döngüsünde yeniden yazılmaz. Kalıcı v3 anahtarını içeren bir kayıt daha eski okuyucu-uyumlu sürümle açıldığında v3 kalır.
- Bulut ana kayıt ve gölge, aynı veritabanı işlemi içinde kaynak baytları ve revision eşleştirilerek yazılır. CAS çakışması yeniden denenir; başarısız gölge ana kaydı da geri alır. Yeni `0008` göçü yalnız tablo ekler, mevcut oyuncu kayıtlarını topluca dönüştürmez. Yedek/gölge sahip ayrımına ve hesap silmeye dahildir.
- Menü, sonraki bölüm, sonuç ve maske bilgisi gerçekten oynanan revizyonu izler. Sözcük Yolu iki revizyonda tek mantıksal kazanımı sayar; daha yüksek yıldızlı eski kayıt gelince kazanılmış kelime sayısı azalmaz. Tam kayıt birleştirmesi sürükleme sırasında çalışmaz.

## Kanıt

- 959/959 test; 740 izole Worker HTTP kontrolü. Eski/yeni istemci, kısmi kayıt, sahip değişimi, çakışan revizyon, çift ödül, bilinmeyen/bozuk kayıt, kota ve her yazım adımında hata, başarısız readback, CAS yarışı, silme ve uyumlu geri dönüş kapsandı. Gerçek oyuncu verisi kullanılmadı.
- İçerik denetimi: 312 eski manifest aynen; 539 hazırlanmış güvenli sunum (535 eski + 4 kapalı aday). Dört adayda en fazla %50 tekrar, 12 bölümden uzun tekrar mesafesi, yakın kopya ve güvenli tahta kontrolleri geçti. Tam altılı rota değildir; bilimsel sözcük yükü oyuncuyla denenmedi.
- Yoğun sentetik kayıt v2 **239.751**, v3 **170.343** bayt: dönüşüm yaklaşık %29 küçültür; v3'te **85.657 bayt** pay. Canlı ana yazıcı v2 kaldığından gerçek kapasite henüz açılmadı; mevcut v2 payı **16.249 bayt**. Yeni büyük paket ekleme kapısı kapalıdır.
- Dört aday gerçek tarayıcıda 320×568 CSS alanında görüldü; tahta bütünüyle görünür, yatay taşma yok, yatay hücreler en az36,1px. 297 ayrıca375×667'de44,4px. IŞIN sürüklenerek tek seferde kabul edildi. 295 rev1 eski başlık ve dört hedefle açıldı. Tarayıcı ölçeği nedeniyle istenen fiziksel viewport ile CSS ölçüsü farklıydı; raporlanan ölçüler DOM'dan doğrulanan gerçek CSS alanıdır.
- Tip/içerik/lint guard/şema, web/offline ve Safari sözdizimi, mobil0.51.0(42) paket denetimi geçti. Mevcut lint borcu428 hata/162 uyarı, artış0. Büyük mobil parça uyarısı korunur; eşik değiştirilmedi.
- Kanıt dizini: `../world-review.nosync/0.52.0-compat/` (çalışma başlangıcında verilen dizin adı; teslim sürümü0.51.0). Ekranlar, test/build logları ve yayın makbuzu burada. Fiziksel iPhone, VoiceOver/FPS ve gerçek iki cihazla Arena bu tur doğrulanmadı; telefona kurulmadı.

## Geri dönüş ve aktivasyon

Başlangıç0.50.1 kaynak `e7c2ae75f2123e2e9802ede995119a8a751fe3ca`, ağaç `8d746e674c24e3d67d0067a2a6d3c02d57a2d280`; `before-0.50.1.bundle` doğrulandı. 0.51.0 paket arşivi çift okuyucuyu, iki revizyonu ve yeni tabloyu silme desteğini taşıyan geri dönüş tabanıdır. Oyuncu veritabanı veya cihaz kaydı eski yedeğe topluca geri alınmaz.

**0.50.1'i körlemesine geri yayımlama:** gölge tablolar oluşunca eski hesap silme kodu bunları temizlemez. v3 aktive edilirse eski okuyucu veriyi de anlayamaz. Görünüm/özellik geri alınırken codec, revizyon kataloğu, migration tablosu ve silme desteği korunmalı; uygulanmış SQL göçü geri çevrilmemeli. Bu sürümde bayraklar kapalı olduğu için aynı 0.51.0 arşivi aktivasyon sonrası güvenli özellik kapatma tabanıdır; yeni içerik revizyonları eklendiyse bu taban da o manifestleri içermelidir.

Kalıcı yazıcı açılmadan önce: fiziksel iPhone'da mevcut kısmi kayıt/çevrimdışı aç-kapat/yeniden bağlanma, eski ve yeni istemci eşitlemesi, silme ve geri dönüş kabulü; hesap bazlı kontrollü aktivasyon ve izleme; >=64KB kapasite payı. Sonra rev2 seçimi için tam altılı rota editoryal/zorluk/telefon/oyuncu kabulü. Dört aday ve 20 rotanın yeniden düzenlenmesi otomatik açılmaz. İki bayrağı topluca çevirmek kontrollü aktivasyon değildir; hesap bazlı seçim sonraki kabul adımında eklenecektir.
