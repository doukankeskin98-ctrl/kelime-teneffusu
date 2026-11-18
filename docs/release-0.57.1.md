# 0.57.1 · Berrak

18 Kasım 2026 · iOS yapı 53

Önceki sürüm notundaki sonuç ekranı düzeltmesi çentikli ekranları kapsamıyordu. Yeni yerleşimde albüm parçası, sayaç ve açıklama için gereken alan önce ayrılır. Madalyon kalan yüksekliğe sığar. Oyuncu ayrıntıları açtığında içerik kaydırılabilir.

Uzun yolculuk tahtalarında konu bandı çizim sırasında ilk harfi, ipucu kullanıldığında ilgili yönlendirmeyi gösterir. Kısa ekranda araçlar üstte yer alır. İlk bölümün el rehberi korunur. Önceden tamamlanmış bölümü tekrar açmak ve aynı bölüme ilk kez girmek ayrı durumlar olarak ölçülür.

Bonus hazırlığı ve oyununda hedef mor bantta, süre ve bulunan kelime sayısı beyaz kartta görünür. Süre azaldığında uyarı rengi korunur. Bonusun sonunda ana eylem “Devam et”tir. Ayarlarda “Destek” liste satırıdır ve okuma yüzeylerinde ikincil yazılar koyulaştırılmıştır.

## Tekrarlanabilir kontroller

Mobil derlemeden sonra şu kontroller ayrı, sentetik kayıtlarla çalışır.

- `node scripts/visual/layout-audit.mjs 320x568,393x852 2,9,10 --first-visit` başlangıç rehberini, tahta ölçüsünü, ilk harf balonunu, TROYA seçimini ve istenen ipucunu sınar.
- `node scripts/visual/berrak.mjs --surfaces` iki güvenli alan profilinde harita, albüm, ayarlar, bonus ve bölüm sonu geçişini kontrol eder.
- `node scripts/visual/berrak.mjs` ve `node scripts/visual/journey-rhythm.mjs` sonuç türlerinde ödül metninin gerçek sınırını, düğmeye dokunulabilmesini ve genişletilen ayrıntıların son satırına erişimi ölçer. Altı telefon ölçüsünde, 375×667 için de iki ayrı güvenli alanla, yedi profil kullanılır.

Kayıt şeması, 312 bölümün sırası ve koordinatları, ödül kimlikleri, eşitleme ve Arena kuralları aynıdır. Geri dönüş noktası 0.57.0 / Sites v115 (`8c0c650`). Günlük bulmacanın giriş koşulları bu paketin kapsamı dışındadır. Tarayıcı dokunma testleri fiziksel cihaz titreşimini ölçmez.
