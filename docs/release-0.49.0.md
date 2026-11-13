# 0.49.0 · Tahtaya daha fazla alan

13 Kasım 2026. Hedef listesi ve tahta yoğunluğu birlikte düzeltildi. Ekrana sığmak tek başına rahat oynanabilirlik kabulü değildir.

Hedef rafında gereksiz iç boşluklar azaltıldı. İkincil hedef seçiciler 36 px gerçek satır/dokunma yüksekliğini paylaşır; görünmez dokunma alanları komşu satıra taşmaz. Ana oyun kontrolleri 44 px kalır. Bu, tahta alanı lehine bilinçli bir ikincil kontrol tercihidir; fiziksel parmak kabulünün yerine geçmez.

Sunum, bütün kabul edilen hedef yollarını tarayarak yalnızca hiçbir hedefin kullanmadığı dolgu satır/sütunlarını kaldırabilir. Karar ekran boyutundan bağımsızdır. Yeni komşuluk sakıncalı metin veya fazladan hedef üretirse uygulanmaz. En az altı hücrelik kenar ve sınırlı en-boy oranı korunur. 192 ana bölümün 31'i sıkıştırmadan yararlanır; her tahtanın 6×7 olabileceği iddia edilmez. On harfli UZAYMEKİĞİ korunur; bölüm 5, 10×10 yerine 8 sütun ×10 satır görünür.

Asıl tahta, kelimeler, kimlikler ve tohumlar değişmez. Girdi/kayıt özgün koordinatlara geri eşlenir. Döndürme, klavye, yön değiştirme, kenar seçimi, ipucu, el rehberi ve harf uçuşları aynı satır/sütun geometrisini kullanır. Arena ekranları farklı olsa da içerik/eşleme aynıdır. Veritabanı veya kayıt göçü yoktur. Parçalı kelimelerde kalan hedef sayısı üst listedeki grup sayımıyla eşitlendi.

## Doğrulama

- 923 test /170 test grubu ve 722 izole üretim Worker HTTP kontrolü geçti. İçerik, tip, şema, web/mobil paket ve lint artış kontrolü geçti. Lint borcu artmadı (428 hata, 163 uyarı).
- Bütün 192 ana bölümde hedef/koordinat güvenliği; zararlı komşuluk ve fazladan hedefte geri dönüş; dikdörtgen kenar/yön/klavye; döndürülmüş uçuş ve ipucu eşlemesi test edildi.
- Gerçek tarayıcı önizlemesinde bölüm 5: 414×736'da raf 140→72 px, hücre yaklaşık 36,4→45,1 px. 375×667'de raf 108 px/hücre 39,4 px; 320×568'de raf 108 px/hücre 31,1 px. Metin/kontrol taşması veya hedef dokunma çakışması ölçülmedi. En dar ekran hâlâ daha sıkışıktır.
- Normal/ters çevrilmiş çizim, yeniden açıldığında 3/7 devam, görünür doğru harfe ipucu, uzun UZAYMEKİĞİ, KUYRUKLU/YILDIZ parçaları ve bölüm sonu→bölüm 6 geçişi tarayıcı girdileriyle doğrulandı. Bölüm 6 da 320×568'de taşmıyor.
- Kanıt: çalışma alanındaki `world-review.nosync/0.49.0-comfort/`. Yerel önizlemede çevrimiçi profil servisi yoktur. Canlı çok cihazlı Arena, fiziksel iPhone, uzun oturum FPS ve VoiceOver bu turda denenmedi. Native paket 0.49.0 (39) hazır; telefona kurulmadı.

## Geri dönüş

Önceki canlı sürüm 0.48.1 / Sites 101; kaynak `f5e7517f97c3b49fb2a65f8f516e01eefffc35f1`, ağaç `023d843bcda2d066aa3ff978ec048b3c382ac889`.

Sites sürümü: `appgprj_6ad7c9366ae88191a67ce62cdf26ab43~appgver_94a5158daf348191a6e87e933b413a1a`. Geri dönüşte bu sürüm aynı adrese yeniden yayımlanır; oyuncu veritabanı veya cihaz kayıtları eski yedeğe yüklenmez. Yeni sunumda kazanılan ilerleme özgün koordinatlarla kaydedildiğinden eski sürüm tarafından okunur.
