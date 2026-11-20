# Kelime Teneffüsü 0.57.6 · Okunurluk

20 Kasım 2026 · Yerel web ve iOS paketi 58. Karşılaştırma sürümü 0.57.5, Git kaydı `b2b789a`.

Ana ekrandaki dört kısayol, dünya ilerlemesi ve oyun içindeki bölüm numarası açık renkli manzaralarda da okunuyor. Yolculuğum'da seçili sarı bölüm noktasının rakamı koyu altın renginde. Dünya numaraları, albüm parçası açıklamaları, ayar seçenekleri ve Arena'daki ikincil bilgiler için en az 13 CSS piksel kullanılıyor. Bütün dünyalar açılınca liste başlığına odaklanılıyor.

Profil bağlantısı kurulamadığında yeniden deneme seçeneği çevrimiçi özelliklerin bulunduğu ekranlarda görünüyor. Yerel kayıt alanı uyarısı ayrı çalışıyor. Hesap silme işleminin kendi onay penceresi var. Oyuncu vazgeçip geri dönerse onay kutusunu tekrar işaretlemesi gerekiyor.

## Tekrarlanabilen kontroller

- Yerel mobil derleme için `pnpm mobile:build` çalıştırılır. Ardından Chrome ve Pillow kurulu ortamda `pnpm menu:readability 320` ve `pnpm menu:readability 393` çalıştırılır. Her genişlikte 34 ekran sırayla açılır. İzole tarayıcı profili sentetik bir kayıtla başlar.
- Test her sayfada hedef ekranı, yatay taşmayı, metin boyutunu, görünür dokunma alanlarını ve kontrastı kontrol eder. Görsel kontrast için yazı dolgusunu geçici olarak gizleyen ikinci bir kare alınır ve pikseller doğrudan harflerin bulunduğu yerden örneklenir. Normal metin için alt sınır 4,5:1, büyük metin için 3:1, tahta dışındaki etiketli kontroller için 44 CSS pikseldir.
- Ölçüm, düğmenin erişilebilir adında zaten okunduğu için ekran okuyucudan gizlenmiş ipucu sayacını da içerir. İstisna yalnız küçük yuvarlak bir rozetteki bir veya iki rakama, en az 12 px ve 800 yazı ağırlığında uygulanır. Düşük kontrast, ince rozet, düz satır içi sayı ve kesilmiş yazı için olumsuz örnekler de hata verdi.
- ZIP'teki ilk araç kaydırma alanının dışında veya kapalı panelin içinde duran yazıyı zaman zaman arkadaki manzaraya karşı ölçüyor. Karşılaştırma galerisinde özgün aracın ham sayıları ve gerçek görünür metin denetimi ayrı gösterilir.
- Beş bölümde (1, 5, 10, 121 ve 312) iki ekran boyutunda tahta ve alt araç yerleşimi kontrol edildi. Sentetik hesapta onaylama, vazgeçme, Escape ve yeniden açma denendi. Tarayıcı ve yerel servis silme isteği kaydetmedi.

## Sürüm kapsamı

Oyuncu kayıt biçimi, bölüm verisi, Arena puanlaması, çizim ve titreşim kodu bu değişikliğin dışında. 1.018 otomatik test, içerik, tip ve derleme denetimleri ile 749 yerel Worker HTTP kontrolü geçti. Lint denetimi mevcut borçta artış bulmadı.

Ekran denemeleri Chrome mobil benzetiminde yapıldı. Gerçek iPhone, VoiceOver, TestFlight ve canlı site bu turdaki doğrulamanın dışında. Kaynak ile galerinin bulunduğu aynı proje klasöründe sonuçları açmak için [önce/sonra karşılaştırmasına](../../world-review.nosync/release-0576/index.html) gidilebilir.
