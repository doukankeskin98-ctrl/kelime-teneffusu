# Berrak · oyuncu arayüzü

| Ekran ve öğe | Kaynak | Kabul |
|---|---|---|
| Ana sayfa · profil, yıldızlar, ayarlar | App, JourneyHome | Gerçek değerler ve erişilebilir düğmeler |
| Dünya başlığı, altı dilimli bölüm halkası | JourneyHome, journeyGoal | Dünya verisinden gelir; halka Yolculuğum'u açar |
| Günlük, Albüm, Arena, Diğer | JourneyHome, Pages, App | Dört doğrudan yol; yalnız gerçek günlük durumunda işaret |
| Bölüme giriş | JourneyHome | Tek yeşil eylem; yarım oyun, hikâye ve yolculuk sonu ayrı ele alınır |
| Bölüm numarası, kategori, hedef kartı, tahta | PlayLayout, Solo, Board | Açık sahne, okunan hedefler, sabit hücreler |
| Harf balonu, övgü, iki araç | PlayLayout, usePlayPraise | Aynı alan, ilk dokunuşta harf, yeniden başlatmadan ayırt edilen çevirme simgesi |
| Tebrik, yıldız ve madalyon | JourneyResult, Solo, BonusRound | Gerçek ödül; yeni parça ve tekrar farklı; hareketi azalt tercihi korunur |
| Ev, devam, bonus, tekrar, tahtayı incele | Solo, BonusRound, App | Tek dokunuşla doğru hedef, tamamlanmış kayıt korunur |
| Günlük, Arena, meydan, bonus, Sprint, profil, ayarlar, kimlik ve destek | Ortak tema ve ekran bileşenleri | Aynı renk görevleri ve düğme dili; süre, skor, bildirim ve hata görünür |

Kaldırılacaklar: ana sayfada kelime logosu, ikinci harita düğmesi, bölüm açıklaması, kopya kısayollar ve alt gezinme; oyunda koyu üst paneller, tekrarlanan normal bölüm sayacı, yazılı araç hapları; sonuçta yinelenen başlık, ayrıntı yığını ve genel kapatma simgesi. Yardım, ödül ayrıntısı ve erişilebilir adlar ilgili etkileşimde kalır.

Referans 393 × 852. Kısa ekranda sayıların yerleşimi içeriğe ve güvenli alana göre değişir. İpucunu, hedefi, ilk harfi, harf uçuşunu ve tahtayı korumak görsel eşleştirmenin parçasıdır. Oyun mantığı, kayıt şeması ve ödüller bu değişiklikten bağımsızdır.

## Uygulama ve karşılaştırma · 18 Kasım 2026

Yukarıdaki dokuz satır uygulandı. Kaldırılacaklar listesindeki öğeler ana sahnelerden çıkarıldı. Rol dağılımı mor araç ve başlık, beyaz okuma yüzeyi, lacivert harf, yeşil devam eylemi ve altın kazanım olarak ekranlar arasında ortaktır. Dünya resimleri, oyuncunun seçtiği tahta ve kelime paleti, hata/uyarı rengi ve süre bitişi anlamlarını korur.

- Ana sayfada dört kısayol ile profil ve ayarlara doğrudan erişim var. Altı dilim gerçek albüm durumunu gösterir. Son bölümün bitişi ve yarım kalan hikâyeye dönüş ayrı test edildi.
- Çizim, övgü, ipucu ve çevirme aynı tahtada çalışıyor. Berrak örneğinde 393×852 ekranda tahta 377×377 px ve üst kenarı 272,7 px. Taslakta üst kenar 258 px. İki hedef satırının her birinde 44 px dokunma alanı korunuyor. İki gerçek araç, çizim/haptik zamanlamaları ve ilk dokunuş rehberi korunuyor.
- Normal sonuç, yeni dünya açılışı, dünya finali, bonus ve tekrar farklı gerçek ödül durumlarını gösteriyor. Madalyona dokununca turun ayrıntıları açılır. Yeni dünya açıldığında ev ve devam eylemlerinin yeri normal sonuçla aynıdır.
- Harita ve bölüm içi seçim, albüm, profil, başarımlar, kimlik, gizlilik, destek, günlük, kısa oyunlar, ayarlar ve Arena aynı kart ve düğme sistemini kullanıyor. Eksik katalog yanıtı albümü kapatmıyor. Yeniden dene eylemi mevcut kartların yanında kalıyor.
- 320×568 ve 375×667'de 312'şer bölüm açıldı. Taşma, çakışma, kırpılan hedef ya da ekran dışı kontrol bulgusu sıfır. En küçük hücreler sırayla 26,09 ve 35,88 px. Bunlar harf ızgarasının hücreleridir. Hedef düğmeleri ve oyun kontrol düğmeleri en az 44×44 px.
- Ana sayfa, övgü, çizim, dünya açılışı ve olağan sonuç dört telefon boyutunda doğrulandı. 393 px genişlikte yan ekranlar dahil görsel araç toplam 38 durum kaydetti. Ayrı yerel Worker'da iki misafirle hızlı eşleşme, lobi, maç, sıralama ve meydan okuma doğrulandı. İki cihazla üretim maçı ve fiziksel dokunuş bu koşuların kapsamı dışında.
- Renk belirteçlerinden hesaplanan kontrast oranları lacivert harf/beyaz tahta **15,77**, beyaz/mor bant **5,49**, beyaz/yeşil düğmenin ortası **5,09**, tamamlanmış hedef/beyaz **4,94**. Sekiz standart kelime rengi ve lacivert harf arasında **6,12–9,81**. Okyanus ve Orkide paletlerinde en düşük değer **7,08**.
- Derlenen CSS mobilde 528.087 → 518.770 bayt; webde 549.413 → 540.096 bayt. Yeni paket bağımlılığı eklenmedi. Mevcut 312 bölümün imzaları ve kayıt biçimi aynı.
- Kanıtlar çalışma klasörünün yanındaki `world-review.nosync/release-0570` dizininde. `karsilastirma.jpg` dosyasında her çiftin solu taslak, sağı çalışan oyun; `yan-ekranlar.jpg` yan menüler; `screens/report.json` dokunma alanları ve ölçüler; `arena/` yerel maç; `layout-320.json` ve `layout-375.json` bölüm başına ölçüler. iOS simülatöründe açılış görüntüsü alındı. Fiziksel iPhone bağlantısız ve Geliştirici Modu kapalıydı.
