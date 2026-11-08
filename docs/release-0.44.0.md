# 0.44.0 — Sade yolculuk ve görünür Arena tercihi

8 Kasım 2026. Önceki sürüm: 0.43.0. iOS paket: 30.

## Oyuncunun gördüğü değişiklikler

- Ana gezinme Yolculuk ve Arena. Ana ekranda tek `Bölüm N` eylemi; konu yanında. Ödül kartı ve alt bölüm halkaları kaldırıldı. `Yolculuğum → Albümlerim` dünya parçalarını, avatar → Profil/Başarımlar istatistik ve rozetleri açar. Yan oyunlar tek listede; günlük, bonus ve hikâye içerikleri silinmedi. Eski profil ve arşiv adresleri çalışır.
- Görünen bölüm numarası gerçek dünya sırasını izler: ilk dünya artık 1–6. Numaralar kayıt anahtarı değildir; eski 168 bölüm kimliği, kelimeler, tohumlar, tahtalar, ilerleme ve kilit koşulları değişmedi. Eski sürümde gördüğün bir bölümün numarası değişebilir; kazanımı değişmez.
- Normal oyunda üstte bölüm ve ayarlar, hemen altında konu ve birlikte görünen hedefler. Tekrarlanan sayaç/ödül/açıklama satırları azaltıldı. Ana sayfaya dönüş ayarlarda; günlük/Arena'nın süre ve çıkış güvenliği korunur.
- Saklı her harf, harfle aynı sabit hücreyi kullanan belirgin yıldız. Açılınca hedef sırası ve ölçüsü değişmez. Bölünmüş sözcüklerde ikinci parçadan fazladan baş harf açılmaz. Harf uçuşu yeni harf hücrelerini hedefler; iniş haptiki ve tekil onay korunur.
- Bilmecede seçilebilir gizli kelimeler, altında sabit yükseklikte etkin soru. Uzun soruların tamamına dokunarak erişilir. Dört hedef tek sıraya, daha kalabalık turlar birkaç sıraya yerleşir. Eski yoğun tahtalarda kesilen hedef satırı giderildi; tahta içeriği ekran boyutuna göre değiştirilmez.
- Normal bölüm sonucu daha kısa; dünya/albüm eşiğinde daha belirgin kutlama. Devam eylemi animasyon bitmesini zorunlu kılmaz. Azaltılmış hareket davranışı korunur.
- Arena’da hızlı eşleşmenin hemen üstünde tek `Araya bilmece ekle` anahtarı. Kapalı varsayılan: yalnız kelimeler. Açık: ilk maç kelime, sonra bilmece/kelime dönüşümü. Özel oda kurucusu seçer; davetli oda kuralını devralır. Tercih cihazdaki ilgili profil için saklanır.
- Yeni oda politikası kalıcı JSON verisinde; sorgu, katılma kontrolü ve eşzamanlı kuyruk UUID'si birlikte ayrılır. Eski politika alanı olmayan odaların geçerli turu, tahtası ve eski dönüşümü korunur. Havuzlar ve ömür boyu tekrar engeli makbuzları sıfırlanmaz. Şema göçü gerekmedi.
- Taşınan albüm ve özel oda pencerelerindeki eski açık/koyu stil çakışmaları da giderildi.

## Doğrulama

- 839 test; TypeScript kontrolü; içerik denetimi (273 yazılmış bölüm, 5460 varyant, ek grup tahtaları ve Arena içerikleri); şema üretimi farkı yok.
- Üretim web derlemesi ve Safari sözdizimi koruması; 697 gerçek yerel Worker HTTP kontrolü: eski oyuncular, eski bilmece odası, yeni normal/mixed sözleşmesi, sekiz özel oda ve on altı eşzamanlı hızlı grup oturumu.
- Yeni odalar için iki politikada dört tur/servis yeniden başlatma; aynı dakika 8+8 farklı tercihin iki kuyrukta kalması; davetle katılım ve eski oda uyumu. Mevcut tekrar engeli/kayıt testleri korunur.
- Mobil paket/sürüm kontrolü: 0.44.0 (30); Xcode Release cihaz derlemesi başarılı.
- Gerçek tarayıcı önizlemesi: 414×628 ve 375×667 CSS piksel. Ana ekran, normal bölüm, gizli harfli eski 12×12 kayıt, bilmece, ayarlar/ana sayfa dönüşü, bölüm seçici, albüm, Profil/Başarımlar, yan oyunlar ve Arena tercihinin yeniden yükleme sonrası korunması kontrol edildi. Bir bölüm gerçek UI sürüklemeleriyle yatay/dikey/çapraz tamamlandı; onay öncesi/sonrası hedef dikdörtgenleri aynı kaldı. Normal ve bilmece tahtaları görünür alan içinde; yatay taşma yok.
- Impeccable mekanik denetimi bulgu vermedi; bu sonuç fiziksel cihaz kabulü değildir.

## Sınırlar

Önizleme yerel sentetik kayıtlarla yapıldı; gerçek oyuncu verisi değiştirilmedi. Bu turda fiziksel iPhone kurulumu, dokunsal değerlendirme, uzun oturum FPS/VoiceOver ve iki gerçek çevrimiçi oyuncu testi yapılmadı. Eski 12×12 kayıtlar içerik uyumu için korunur; hücreler doğal olarak 7×7/9×9'dan daha yoğundur. TestFlight/App Store hesabı ve mağaza dış bağımlılıkları bu sürümle tamamlanmış sayılmaz. Yayın kanıtı ayrıca sürüm makbuzunda tutulur.
