# 0.57.0 · Berrak

18 Kasım 2026 · iOS yapı 52

Oyuncu ana sayfadan bölümüne tek dokunuşla döner. Harita, profil, albüm ve Arena aynı görsel dili kullanır. Tahmin ve ipucu akışı doğrudan tahtada kalır. Sonuçta gerçek yıldızlar ve albüm parçası görünür. Dünya açılışı ile bonus turları bu akıştan devam eder.

Küçük ekranda iki bölümdeki dikey kayma, albüm yanıtı eksikken tüm oyunun hata ekranına düşmesi, Arena’da sayaç ve bildirme simgesinin kontrastı, sonuç satırının düğme altında kesilmesi düzeltildi.

1.017 test, 749 yerel Worker HTTP kontrolü, TypeScript, içerik/manifest, web ve iOS simülatör derlemesi geçti. Lint karşılaştırmasında artış yok (mevcut 427 hata, 156 uyarı). 312 bölüm iki küçük ekranda ayrı ayrı açıldı. Ürün karşılaştırmaları, ölçüm sınırları ve kanıt dosyaları [tasarım denetiminde](berrak-0570.md).

Geri dönüş noktası 0.56.2, Sites v114. Kayıt biçimi, bölüm kimlikleri, tahtalar ve sunucu veritabanı şeması korunur. Web yayını ve gerçek cihaz kurulumu ayrı işlemlerdir.
