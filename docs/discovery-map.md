# Keşif Haritası

Harita mevcut on beş rota bölümünü tek bir ilerleme yolunda birleştirir. Sıra: Yıldız İskelesi (Uzay), Anadolu Patikası (Türkiye), Teneffüs Bahçesi (Hababam). İlk dünya açıktır. Bir dünyadaki üç farklı rota bölümünü tamamlamak sonrakini, beşini tamamlamak o dünyanın yeni bonus bölümünü açar. Herhangi bir yıldız sayısı veya hız şartı aranmaz; ipuçlarıyla tamamlamak da geçerlidir.

Her rota bölümünün belirli bir koleksiyon parçası vardır. Beş ana bölüm ve bir bonus, altı parçalık sahneyi oluşturur. Harita, bir sonraki parçanın adını ve tam açılış koşulunu gösterir. Kazanımlar doğrulanmış `Progress.saves` üzerinden türetilir. Ayrı ödül talebi, tüketilebilir anahtar, günlük sıfırlanan ödül veya tekrar oynayarak çoğaltılabilen bir bakiye yoktur.

## Uyumluluk

- Eski 96 standart bölüm, 15 rota bölümü, altı Gizli Tema ve klasik Hababam oyunu korunur. Mevcut tema seçicisinde bölüm kilidi eklenmez.
- Haritanın beşli bölüm kümeleri sabit kimliklerle tanımlıdır. Aynı temaya daha sonra eklenen içerik bu kümeleri büyütmez; kazanılmış dünya ve bonus açılışlarını geri kilitlemez.
- Eski bir rotaya daha önce başlamış oyuncu o dünyaya haritadan da erişebilir. Eski tamamlamalar parçalarını otomatik verir. Beş bölümün rota hatırası korunur; yeni altıncı parça ek bir bonus hedeftir.
- Yeni bonuslar `JOURNEY_BONUSES` içindedir. Kimlikleri `uzay-gozlemevi`, `turkiye-kartpostal`, `hababam-yillik`; kayıt anahtarları `route:<id>` olarak kalır. Kaynakta bu kimlikleri veya yayımlanmış bulmacaların kelimelerini/tohumlarını değiştirmeyin.
- `ALL_JOURNEYS` kayıt doğrulamasına bonusları da dahil eder. Eski `Progress.v = 2` biçimi, yerel anahtarlar ve bulut birleştirme sürer. Veritabanı göçü gerekmez.
- Tekrar oyununda mevcut en iyi yıldız/süre korunur. Aynı parçanın yeniden kazanıldığı söylenmez. Bölüm sonu ekranı o oyunda gerçekten yeni açılan parça, dünya, bonus ve tamamlanan sahneyi gösterir.
- Solo açılışlar sunucu rekabet derecesine katkı yapmaz. Haritadaki kilitler bu ek yolculuğun sunumudur; bir hile önleme veya hesap yetkilendirme sınırı değildir.

## Denetim ve geliştirme

`lib/game/discovery.ts` saf ilerleme/ödül kurallarını, `components/game/Discovery.tsx` haritayı, parçalı sahneleri, albümleri ve sonuç kartlarını içerir. Görseller özgün SVG'dir; raster görsel veya ek çalışma zamanı bağımlılığı eklenmez. Dar ekran düzeni, büyük dokunma alanları, klavye odağı, metinli kilit koşulları ve yüksek kontrast desteği vardır. Geri dönüş harita bölümüne götürür; otomatik sonraki oyun başlatılmaz.

`tests/discovery.test.ts` eşik açılışlarını, ipuçlu tamamlamaları, eski kayıtları, tekrar ödülü olmamasını, en iyi sonucu ve iki cihazın bulut birleşimini sınar. İçerik denetimi üç yeni bonusu da yerleştirir. Üretim Worker HTTP kontrolü haritanın sunucu çıktısını ve bonus kayıtlarının sunucuda doğrulanıp sahibine özel saklandığını doğrular. Bunlar gerçek telefon/tarayıcı etkileşim testinin yerine geçmez.

Bu paket harita, belirli ödüller, koleksiyon sahneleri ve üç bonus bölümünü kapsar. Çok aşamalı final bulmacaları, döşenebilir kişisel oda ve arkadaşla ortak bulmaca bu pakette uygulanmadı.

Bağlı bakım görevi 08.00 ve 20.00 UTC için etkindir. Her UTC tarihi için iki yeni bölüm hedefler; bakım ve iyileştirme iki çalışmada da yapılır. Görevin kaydedilmiş olması her çalışmanın başarıyla tamamlandığı anlamına gelmez. Düzenli içerik eklerken mevcut harita kimliklerini ve kazanımları koruyun, başarılı yayından önce aynı tarihli bölümleri yeniden üretmeyin.
