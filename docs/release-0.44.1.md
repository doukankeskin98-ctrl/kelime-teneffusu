# 0.44.1 — Kelime onayı ve anlaşılır oyun kontrolleri

8 Kasım 2026. 0.44.0 üzerine hedefli düzeltme; iOS paket 31.

## Değişiklikler

- Harfleri ayrı hücrelere taşıyan önceki sürümde dış kapsayıcıda kalan çizgi düzeltildi. Birbirine bitişik harf hücreleri kesintisiz tamamlanma çizgisini taşır; uçuş sürerken gizlenir, inişten sonra görünür. Tamamlanan kelime okunaklı biçimde soluklaşır. Bölünmüş sözcükte yalnız bulunan parça çizilir; gizli kalan harf açılmaz. Normal, bilmece ve ortak kelime listesi aynı durumu kullanır.
- Normal, günlük, hikâye, Arena, meydan okuma, hızlı tur ve bonus ayarları sağ üstte aynı belirgin dişliyle. Başlık yerleşimi ile sade oyun davranışı ayrıldı; yarış sayaçları ve geri/çıkış korumaları korunur. Bonus menüsü kendi saatini durdurur; arka plandan dönüş veya eski seçim geri çağrıları menü arkasından turu ilerletemez.
- Tahta 180° çevirme işlevi aynı. Tek yeniden-yükle oku yerine tahta ve dönüş okları ile görünür Çevir etiketi. Eski dairesel düğmenin metni sıkıştıran genişlik kuralı görsel önizlemede giderildi.
- Ayarlarda Oyuna dön ana eylem; Ana sayfaya dön ikincil. Ana sayfaya çıkarken menünün durdurduğu saat tekrar başlatılmaz; günlük çıkış mevcut onaydan geçer.
- Ana ekranın konu/oyna grubu yukarı alındı, boşluk üst ve alt arasında dengelendi. Bölüm seçimi Bölümler adıyla ayrışıyor; Diğer oyunlar oyun simgesi taşıyor. Yeni kart/mod eklenmedi.
- Hikâye adımı alanının sade başlık kuralı yüzünden sıfır yüksekliğe düşmesi giderildi; 375×667 görünümde soru ve tahta çakışmıyor.

## Doğrulama

- 844 test, 697 üretim Worker HTTP kontrolü, TypeScript, içerik denetimi ve üretim web/Safari sözdizimi kontrolü geçti. Beş yeni davranış testi: süreli başlık/HUD, Solo menüsünden çıkış, bonus menüsünde arka plan, çıkış ve uzaktan tamamlama.
- Yerel gerçek tarayıcıda 414×628 ve 375×667; uzun ana ekran için 430×837 CSS piksel. GÜNEŞ ve DÜNYA gerçek UI sürüklemesiyle bulundu. Uçuş sırasında çizgi opaklığı 0; yerleşince 1; diğer kelimeler 0. Tamamlanan renk rgb(97,117,104), aranılan rgb(25,56,47). Onay öncesi/sonrası hedef dikdörtgenleri eşit. Çevirme sonrası iki bulunan hedef korundu.
- Aynı gerçek hedef bileşenleriyle ayrı sentetik görünümde kısmi KUYRUKLU / gizli YILDIZ ve bilmece tamamlanması görsel olarak kontrol edildi. Menü eylemleri, ana sayfaya dönüş ve hikâye adımı/tahta sınırları incelendi. Yatay taşma yok.
- iOS 0.44.1 (31) paket eşitliği kontrolü geçti. Xcode sonucu yayın makbuzunda ayrıca belirtilir. Mekanik tasarım taraması bulgu vermedi; bu görsel veya fiziksel cihaz garantisi değildir.

## Korunanlar ve sınırlar

Bölüm kimlikleri, kelimeler, tahtalar, tohumlar, kayıt biçimi, ödüller, Arena eşleşme politikası ve tekrar engeli değişmedi. Gerçek oyuncu verisiyle oynamak yerine yerel sentetik kayıtlar kullanıldı. Fiziksel iPhone kurulumu, titreşim hissi, uzun oturum FPS ve iki gerçek oyuncu kabulü yapılmadı. Yayın sonucu ayrı makbuzdadır.
