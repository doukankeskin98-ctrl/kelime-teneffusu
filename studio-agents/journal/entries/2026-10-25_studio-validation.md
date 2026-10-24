# 0.10.0 uygulama ve doğrulama

Başlangıç Sites HEAD c2fe8ca6b667011c7b71c09ec433d9d9744eeba7, GitHub main bb17c86877245a9b7ac6dcb5003205937d355ff3, eş ağaç 5af4feac4ced7eb55e79e18c47530196b8768466. Kapsam ve uygulama öncesi kabul studio-intake kaydında. İki sınırlı inceleme ve tek koordinatör uygulaması.

Hızlı Tur reducer ve arayüzü: üç saniye hazırlık, 60 saniye süre, dört hedefli 6×6 tahtalar, seri/çarpan/bonus, tahta geçişi, çıkış ve sonuç. Yerel hesap anahtarlı rekor; sunucu derecesine yazım yok. Dünyalara kaynak bölümü sayısı ve sayfalı tema kataloğu, oradan açılan bölümün dönüşünde tema penceresi. Arkadaş akışında ekip/lig/geçmiş, davet kodu ve kullanıcı kontrollü paylaşım, mevcut aktif odaya doğru dönüş, hata/yenileme/mutasyon ayrımı. Tek ada çizimi ve azaltılmış hareketi gözeten oyun animasyonları.

Son bağımsız incelemenin aynı temalı çiftin 24 kayıt sınırında bölünmesi bulgusu düzeltildi. Companion seçiminde tema yerine mevcut sayfa ID kümesi kullanılır. Bu senaryoyu yaratan 25 tarihli regresyon geçti. Önbellek yokken sunucudan gelen başlangıç kartları ve eş bölümler boşaltılmaz. Bu son iki düzeltme koordinatörce kontrol edildi; bağımsız final onayı gibi sunulmaz.

Son kod: 143/143 test, 32 grup; 32 kaynak tahta/640 alternatif içerik kontrolü; tsc --noEmit; Sites üretim derlemesi; iki bağımsız oyuncuyla 186 Worker HTTP kontrolü; git diff --check başarılı. Yeni testler süre/dedup/seri/bonus/geçiş/arka plana dönüş, rekor doğrulama ve temalı sayfalama/damga eşlerini kapsar. Worker tema doğrulaması, toplam/board-free özet, aynı damga çifti ve yeni giriş/görsel kaynağını kontrol eder. Mevcut hesap, kayıt, sosyal, düello, admin ve eski içerik kontrolleri de geçti.

Tek görsel imagegen ile üretildi: yazısız yüzen bahçe adası, krem kelime taşları, küçük gözlemevi, mint/yeşil/altın renkler, solda arayüz metni için sakin boşluk. Teslim kaynağı public/art/discovery-island.webp, 1280 px, 172796 bayt. Prompt amacı özgün mobil kelime oyunu sahnesi; mevcut marka veya oyun kopyası yok. Tek üretimden mevcut sharp ile WebP dönüşümü, yeni bağımlılık yok.

Önceki destekli preview ERR_CONNECTION_REFUSED verdi. Toparlanma kanıtı olmadan alternatif yol denenmedi. Görsel tarayıcı, fiziksel telefon, FPS ve gerçek oyuncu keyfi/tutma etkisi doğrulanmadı. Dünya çapı stüdyo kalitesi veya App Store hazır oluşu iddia edilmez. GitHub CI, eş ağaç, merge ve Sites yayın sonucu bu kayıttan sonra gerçek servis cevaplarıyla doğrulanır.
