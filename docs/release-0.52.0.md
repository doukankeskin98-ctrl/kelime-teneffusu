# 0.52.0 — Yolculuk, oyun hissi ve iOS hazırlığı

14 Kasım 2026 · iOS yapı 43 · taban `be10b96` / 0.51.0 / Sites v105. Bu teslim App Store kabulü veya gerçek cihaz performans garantisi değildir. Canlı yayın sonucu ayrıca kaydedilir.

## Oyuncuya görünen değişiklikler

- **Yolculuğum:** kullanıcının seçtiği yakın dünyalarla açılan harita. Kaldığın dünya, önceki/sonraki dünya, altı bölümün ilerlemesi ve kilitleri birlikte görünür. İsteyene tüm 52 dünya; dünya içinde gerçek bölüm adları ve numaraları. Albümler aynı yerden açılır.
- **Tek K ikonu:** seçilen C yönü web ve iOS ikonlarına uygulandı. Marka adı aynı.
- **Çizim ve hareket:** yanlış çizgi parmağın olduğu yerde kısa tepki verir. Tahta 280 ms'de döner; giriş en fazla 240 ms. Dokunmak hareketi hemen keser, doğru kelimeyi kabul etmek animasyonu beklemez. Hareketi azalt tercihi korunur.
- **Bölüm sonu:** başlık ve devam düğmesi sabit; içerik gerektiğinde kendi içinde kayar. Albüm parçası görselle gösterilir. Simülatörde yakalanan ilk karede sonuç ekranının sayfanın altına düşmesi düzeltildi. Yeni dünya kısa, oyunu engellemeyen bir karşılamayla belirtilir.
- **Ayarlar ve formlar:** oyunla uyumlu açılır bölümler ve destek kategori düğmeleri; boş oyuncu adı için satır içi uyarı. Pencereler başlığa kaydırmadan odaklanır, kapandığında odağı geri verir. Klavye odağı kaldırılmadı.
- **Ses:** 9 kısa CC0 efekt; yükleme çizim sırasında yapılmaz. Ambiyans eklenmedi. Yalnız yeni oyuncularda ses/titreşim açık başlar; mevcut tercihler değiştirilmez. Yeni seslerin gerçek telefon hoparlörü ve sessiz anahtarı kabulü bekler.
- **Arena:** açık grupta herkes hazırsa sunucu 5 saniyelik geri sayımı başlatır. Özel arkadaş odası ve dereceli düello davranışları korunur. Ayrılan oda sahibi ve süresi dolan katılımcı beklemeyi kilitlemez. Rakibin kelime sayısı mevcut alanda görünür; maçın ilk bitirenle sona erdiği baştan açıklanır. Bildir düğmesinin hazır yazısını örtmesi giderildi.
- **iOS:** koyu başlangıç, açılış hatasında tekrar deneme, Türkçe proje dili. Gelen davetleri güvenli işleyen köprü hazır; Universal Links için Team ID/AASA henüz yok. İsteğe bağlı sessiz günlük bildirim ve kurallı StoreKit çağrısı yerel köprüye eklendi; ek SDK yok.

## İçerik ve kayıt güvenliği

312 yayımlanmış bölümün kimliği, sırası ve tahtası değişmedi. Kaydın, yıldızların, albümlerin, ödüllerin ve mevcut tercihlerin korunması test edildi; canlı oyuncu verisi kullanılmadı.

295–300 için konu uyumlu **altılı kapalı rev2 aday rota** tamamlandı. Tekrar, uygunsuz sözcük, ipucu/cevap ve ölçülebilir zorluk kontrolleri var. Eski rev1 kayıtları yerinde tutulur. `CONTENT_REVISION_TWO=false` ve `COMPACT_PROGRESS_WRITES=false`; içerik sessizce oyuncuların altında değiştirilmedi. Mevcut 52 rotanın bütün zorluk eğrisi ve beş yakın kopya **henüz düzelmiş sayılmaz**. Önce bu altılı rotanın oyuncu/cihaz kabulü, sonra onaylı kontrollü açılış gerekir.

Yoğun sentetik kayıt 239.749 / 256.000 bayt, 16.251 bayt pay. Kompakt yazıcı aktive edilmeden büyük yeni içerik paketi eklenmedi. Dünya arka planları için 18 mevcut sahne kullanılır; yeni ayrıntı kazandırmayan otomatik büyütme yapılmadı.

## Kontroller ve kanıt düzeyi

| Kontrol | Sonuç / sınır |
|---|---|
| Birim / bileşen davranışı | 979/979; çizim, yön değiştirme, bildirim yarışları, modal odak, kayıt ve revizyon sınırları dahil |
| Worker HTTP | 742; izole yerel veritabanı, iki eski oyuncu, sekiz özel grup ve 16 eşzamanlı açık grup oturumu |
| Tip / içerik / şema / web / mobil paket | Geçti; 312 manifest, 417 yazılmış tahta, 8.340 alternatif, altı kapalı aday |
| Lint artış kapısı | 428 eski hata / 162 uyarı; artış 0. Borç ortadan kalkmış sayılmaz |
| Tarayıcı | 320×568, 375×667, 414×622, 430×932; çizim→sonuç, başlık/alt eylem/ödül görünürlüğü; yatay taşma ve JS istisnası yok |
| iOS simülatör | iPhone 17 / iOS 27.2; ayarlar, bildirim izni kabul/aç/kapat, harita, dört gerçek sürükleme, bölüm sonucu ve Bölüm 2'ye geçiş geçti. Başlık ve devam düğmesinin hem konumu hem dokunulabilirliği ölçüldü |
| Gerçek iPhone / VoiceOver / FPS | Bu tur denenmedi; kullanıcı telefon adımını erteledi |

Kanıt dizini: `../world-review.nosync/release-052/`. `native-summary.json` ve `native-final/` başarılı XCTest'in makbuzu/görüntüleridir. `browser-flow.json` dört ekran boyutunu, `browser-flow-store.json` son 430 px kontrolünü içerir. `store-01-home.png`…`store-06-arena.png` gerçek tarayıcıdan 1290×2796 taslaklardır; fiziksel iPhone görüntüsü değildir. Video örnekleme hızı oyun FPS ölçümü değildir. Açık/koyu soğuk açılışlar 10 kare/sn örneklendi ve iki kayıtta da oyun ekranına ulaşıldı; beyaz parlama görülmedi. Ancak sistem açılışında uzun siyah bekleme sürdü. Makinede yaklaşık 300 MB boş alan bulunması ölçümü etkileyebilir; kesin neden doğrulanmadı. Bu yüzden hızlı/kesintisiz soğuk açılış kabulü açık kaldı; fiziksel cihazda yeniden ölçülmeden “tamam” sayılmaz. Eski opak Kt açılış görseli kaldırılarak ilk yerel yüzey koyu renge eşitlendi.

## Hesap/karar bekleyenler

- Apple Developer, yayıncı kimliği, destek kanalı: kullanıcı bunları şimdilik atladı. Gizlilik/destek metinleri taslak; sahte e-posta veya gönderim başarısı eklenmedi.
- TestFlight'a yükleme, App Store gönderimi, alan adı değişimi ve Game Center aktivasyonu yapılmadı. Simülatör Debug paketi imzalı dağıtım arşivi değildir.
- Hayalet rakip için gerçek tur kaydı, oyuncunun paylaşım izni, silme/engelleme ve yarış durumları tasarımı `store-052/arena-ghost-design.md` içinde. Uydurma canlı rakip eklenmedi; tasarım onayı bekler.
- Genel kitle, reklamsız ve satın almasız ilk paket kararı korundu. iPad, gelir ekonomisi, büyük CSS/JS ayırma ve lint borcu için tahminler `store-052/scope-and-next.md` içinde.
- Mağaza beyanları ve hukuki açıklar: `app-store-readiness.md`. Kurulan/kurulmayan beceriler: `store-052/skills-and-assets.md`.

## Beş dakikalık gerçek telefon kabulü

1. Mevcut kayıtla aç: bölüm/yıldız/yarım tahta aynı mı; Yolculuğum yakın dünyayı doğru işaretliyor mu?
2. Üç kelime çiz: yanlış yönden parmağı kaldırmadan dön, kenardaki harfi yakala; uçuş/yerleşme/titreşim zamanını dinle ve hisset.
3. Çevir'e basıp animasyon sürerken hemen çiz; duraklama veya yanlış hücre var mı? Hareketi azalt açıkken tekrar et.
4. Son kelime → başlık/yıldız/albüm → sonraki bölüm. Küçük ekranda düğmeler ve en son satır bütünüyle görünüyor mu?
5. Ayarlardan ses/sessiz anahtarı/titreşim; bildirim aç/kapat; arka plana alıp geri dön. İkinci cihazla Arena eşleşme ve aynı tahta kontrolü ayrıca gerekir. VoiceOver ve 15 dakikalık ısınma/kare süresi ayrı uzun kabul turudur.

## Geri dönüş

Başlangıç kaynağı `be10b96c82acbe329fe5ad7e13586a945c216cac`, 0.51.0 Sites v105. `baseline-051.bundle` saklandı. Bu pakette SQL göçü, eski içerik veya kayıt biçimi açılışı yok; görünüm/özellik geri alınırken 0.51.0 çift okuyucu/silme desteği korunmalı. Veritabanını veya oyuncu kayıtlarını eski yedeğe topluca geri alma.

Yalnız iOS geri dönüşünde: bu sürümde açılmış yerel günlük bildirim önce ayarlardan kapatılmalı; eski binary bildirim planını kendiliğinden silmez. İkon ve yerel StoreKit deneme tarihi oyuncu yıldızı/ilerlemesi değildir. İleride rev2/v3 bayrakları açılırsa eski pakete kör geri dönüş uygun değildir; yeni manifest/okuyucu desteğini taşıyan geri dönüş paketi gerekir.
