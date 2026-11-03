# 0.30.0 — ortak oyun hissi ve içerik

Kullanıcı bütün önerileri uygulama yetkisi verdi. Seçilen odak: kelime → kutlama → sonraki bölüm akışını aynı tipografi, sahne ve hareket dilinde tamamlamak. İki dar salt okunur deneyim/güvenilirlik incelemesi yapıldı; uygulama koordinatörde.

Uygulama öncesi kabul:
- Onaylı kelime başına tek dekoratif tahta→hedef hareketi; optimistic ağ isteği, yeniden giriş ve döndürme ödül/efekt üretmez. Efektler pointer-events:none, sınırlı sayıda ve zamanında temizlenir; oyun/ödül/ses animationend beklemez.
- Sonuç aynı dünya üzerinde gerçek yıldızlar/tek kazanım ve küçük albüm ilerlemesiyle sunulur; Devam daima erişilebilir. Azaltılmış hareket, arka plan ve hızlı geçişte güvenlidir.
- Paketli ve lisanslı Türkçe font web/native/çevrimdışında aynıdır. Tahta hücre geometrisi korunur.
- Üç ana sekme korunur; ek içerikler Etkinlikler'de, koleksiyon önce albümler. Arena bekleme/maç/sonuç ortak sanat dili kullanır; sunucu/puan/tekrar kuralları değişmez.
- Eski 120 bölümün kimlik, sıra, kelime, tohum, tahta hashleri; bütün kayıt/ödül göçleri korunur. Yeni bölüm paketi sona eklenir, dengeli açık/kısmi hedefler kullanır.
- Hedefli davranış testleri + bütün testler + içerik/tip + web/native derleme + Worker HTTP + küçük mobil görünüm kontrolü. Gerçek cihaz/FPS/dinleme ölçülmediyse garanti verilmez.

Doğrulama: 611 test/130 grup; 215 tahta ve 4300 alternatif, 64 grup tahtası, 774 Arena tanımı/919 kelime, 96 taze rekabet tahtası, 714 Hızlı Tur kelimesi. Tip/web/mobil/Xcode simülatör derlemesi, 628 üretim Worker HTTP geçti. DB göç farkı yok.

359×568 ve 414×622 kullanılabilir tarayıcı alanında gerçek sürükleme ile ilk bölüm tamamlandı; son harften öte sürükleme tek kabul verdi. Tahta→hedef ışığı DOM'da tek örnek görüldü. Gerçek sonuçta yıldızlar ve albüm ilerlemesi korundu; sonraki bölüm eski 12×12 yarım kaydı 1 ipucuyla açtı. 359×568'de tahta 333px ve harf 18px, alt satır görünür/yatay taşma yok. Hikâyede TOHUM bulundu ve bilmeceye geçildi, tahta yeri değişmedi. Profil avatarı doğrudan açık oyuncu kontrollerine gider; menü/Etkinlikler/koleksiyon/Arena özel lobi oluşturma ve antrenmana çıkış görüldü. Arena ilk koyu lobi kontrolündeki düşük kontrast/yüksek boşluk düzeltildi; yeniden görsel doğrulandı.

İki uzman son diffte scope/replay temizliği, font kök değişkeni, Arena miras stili ve profil erişimini işaretledi; hepsi giderildi. Ledger ve gerçek WordFeedback bileşeni testleri restore/tekrar/optimistic/bounded efekt/hidden/paused/reduced/unmount kapsamını doğrular. Oyun ödül/save/ses animasyon callbacklerine bağlanmadı.

Görseller ../world-review/0.30.0-*.png. Fiziksel telefon/iki cihaz Arena, VoiceOver, FPS ve ses/haptics hissi ölçülmedi. App Store yayın kapıları açık kalır. GitHub/Sites ağaç/CI ve yayın sonucu ../world-review/release-0.30.0.json makbuzunda ayrıca doğrulanır.
