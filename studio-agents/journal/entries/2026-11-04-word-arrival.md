# Kelime varış ritmi · 4 Kasım 2026

Kullanıcı 0.34.0 animasyonunu WoW referansına göre yetersiz ve üst hedefe fazla hızlı varıyor buldu. Aynı sürümün titreşimini fiziksel iPhone'da belirgin ve dengeli olarak onayladı; bu görev titreşimi değiştirmez.

Tek odak: okunabilir ayrılış, daha uzun yolculuk ve varışla tamamlanan görsel hedef onayı. Gerçek hücre yazı ölçüsü ve hedef harf konumu ölçülür; yaklaşık hedef merkezi/harf genişliği yerine görünür yazıya ulaşılır. Tamamlanma, kayıt, puan ve sonraki girdi anında kalır. Son kelimeyi sonuç modalı erken örtmemeli. Kontrol kilidi ile dekoratif hareket ayrılır; Arena kuralları/saati bekletilmez.

Kabul: normal/ters/döndürülmüş seçim; açık/gizli/parçalı hedef; hızlı art arda kabul; son kelime/sonuç/atla; blur/resize/arka plan/reduced motion/animasyon hatası cleanup; yeni haptic veya tekrar ödül yok. Eşzamanlı dört uçuş sınırı korunur. Hedefli testler, bütün gerekli proje kontrolleri, mobil tarayıcı hareket gözlemi ve mümkünse aynı iPhone üzerine kayıt koruyarak kurulum. Fiziksel his/kare süresi ölçülmeden kalite eşitliği iddiası yapılmaz.

## Uygulama ve kanıt

- Gerçek38px kaynak harfi artık32px tahmine düşmez. Hedefte Range ile kerning/harf merkezleri, source için computed font ve doğru viewCell kullanılır.720ms lift/travel/landing zaman çizelgesi, en çok84ms stagger, son yüzde4'te crossfade;180ms hedef vurgusu.
- useLayoutEffect ile ilk boya öncesi data-word-arriving, hedef başına sayaç; son glyph onfinish veya tüm stop yollarında görünür onayı serbest bırakma. CSS'nin eski found animasyonu scenic hedefte kapalı, tek WAAPI iniş. Hata/resize/rotation/background/reduced/eviction/unmount temizliği.
- Solo1040ms sonuç kapısı, Arena yalnız aynı aktif maçta artan onaylı own stroke ile finalde gecikme. Saat/save/readOnly anında; explicit Sonuca geç ve restore/reduced doğrudan. Kontrol erişimi ile dekoratif feedback kesintisi ayrı.
- İlk görsel kontrolde finalde eklenen iki sonuç eylemi tahtayı394→304 küçültüyordu. Solo geçici skip footer alanında absolute; aside sonucu yalnız resultReady sonrası. Arena pending-result mevcut footer eyleminin yerini kullanır. Sonraki gerçek sürüklemede394×394 x10/y172.5 değişmedi,4uçan glyph ve örtülmeyen son kelime görüntülendi.
-691test/140grup geçti; final yerleşim için93 ilgili test tekrar geçti. Testler gerçek Solo/Arena caller'da sonuçtan önce kayıt/readOnly, tam1040ms kapı, reduced/restore/skip/rematch ve timer temizliğini doğrular. WordFeedback gerçek ölçü/mock Range, ters/turned, çok parçalı gizli cevap ve çakışan varış sahiplerini kapsar.
- İçerik241/4820 +64 grup/96 yarış/774tanım/919kelime/714Sprint aynı. tsc,23tablo değişmez, web42offline/21Safari12chunk, mobile16sahne, imzalı Release iPhone derlemesi ve639 Worker HTTP geçti.
- Destekli CUA normal, döndürülmüş ve tersten çizim; hedef onayı ertelenirken harf yükselişi görüldü. Bittiğinde0glyph/0arrival flag ve çizili hedef.320×568'de300×300/64hücre, yatay taşma yok. Ayrı yerel fixture kaydı; gerçek iki cihaz Arena veya fiziksel kare süresi ölçümü değil.
- Tek dar uzman incelemesi; son düzende kesin blocker yok. Native haptics dosyalarında değişiklik yok. İçerik/tahta/ID/tohum/kayıt/ödül/Arena geçmişi korunur.

- iPhone14 Pro Max üzerine mevcut uygulama silinmeden0.34.1(12) kuruldu. Kurulum öncesi/sonrası5yerel kayıt girdisinin hashleri aynı veSQLite bütünlüğü geçti. Yeni hareketin fiziksel oyuncu değerlendirmesi ayrı kurulum makbuzunda tutulur.
