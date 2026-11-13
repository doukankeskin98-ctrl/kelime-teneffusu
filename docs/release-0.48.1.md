# 0.48.1 · Okunaklı hedefler ve güvenli mobil yerleşim

13 Kasım 2026. Claude'un deneme dalı ve bağımsız inceleme düzeltmeleri aynı oyun adresine yayın için birleştirildi. Önceki yerel teslim notları kendi tarihlerini anlatır; güncel yayın yetkisi ve sürüm bu kayıttadır.

## Değişiklikler

Açık hedefler yazı tipinin doğal harf genişliklerini kullanır; gizli harf yuvaları ve kelimenin tek satırda kalması korunur. Küçük ekranda 44 px dokunma satırları çakışmaz; alan başlık/boşluklardan kazanılır. Bölüm kapakları, sonuç kartı hizası, hikâye görselleri ve web kurulum bandı kontrastı düzeltilmiştir. Hazırlanmış sunum tahtalarının uygunsuz dizi listesi genişletilmiştir. Ayrıntı: [inceleme raporu](codex-0.48-cila-review.md).

Çizim motoru, harf uçuşu, titreşim zamanı, temel tahta koordinatları, bölüm kimlikleri, ilerleme/kayıt anahtarları ve DB şeması değişmedi. Yeni katalog meydan okumalarının 24 varyantı yeni sunumu kullanır; açık maçlar saklanan tam tahta ile devam eder. Tarihi Klasik mod tümüyle yeni filtre kapsamına alınmış sayılmaz. Ambiyans eklenmedi.

## Doğrulama ve geri dönüş

İncelemede 914 test, 722 izole Worker HTTP kontrolü, içerik/tip/şema/web/mobil paket ve lint artış koruması geçti. 320×568 / 375×667 hedefli tarayıcı kanıtları inceleme raporundadır. Yayın sürüm numarası sonrası paketler ve zorunlu kapılar yeniden doğrulanır; gerçek yayın cevabı ve canlı testler depo dışı teslim makbuzuna yazılır. Fiziksel iPhone kurulumu bu isteğe dahil değildir.

Yayın öncesi geri dönüş noktası **0.48.0 / Sites 100**:

- Proje: `appgprj_6ad7c9366ae88191a67ce62cdf26ab43`.
- Sürüm: `appgprj_6ad7c9366ae88191a67ce62cdf26ab43~appgver_39d54b21413c8191b6c6a52890645da1`.
- Kaynak: `ce70fba830d79161298edc734a8896f3f5148ad4`; ağaç: `f69b7c0eaf6cb3367f848a2d65f57ea1cb193677`.
- Sites'ta saklanan yayın paketinin SHA-256 değeri: `d56f289e69d99aab70b5e0e41f3ea75293b78a6d302cbe0cd3377504e376f6ea`.
- Yerel tam Git bundle ve kaynak tar yedeği: çalışma alanındaki `world-review/0.48.1-rollback/`. Bundle bütünlüğü ve dosya SHA-256 değerleri doğrulandı.

Geri dönüşte bu kayıtlı Sites sürümünü aynı projeye yeniden deploy et; canlı D1 veritabanını veya cihaz ilerlemelerini eski yedeğe yükleme. Yeni sürümde kazanılan ilerleme değişmeyen temel koordinat/kayıt biçimindedir. Her iki sunucu da meydan okumanın saklanmış tam tahtasını tüketir. Geri dönüşten sonra sürüm, devam eden bölüm ve mevcut maç yeniden kontrol edilir. Yayından önceki oyuncu verisine geri dönmek bu prosedürün parçası değildir.
