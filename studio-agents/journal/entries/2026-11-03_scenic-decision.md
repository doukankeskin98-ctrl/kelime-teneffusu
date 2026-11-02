# 3 Kasım 2026 · Görsel yolculuk / 0.25.0

Başlangıç: en güncel Sites 764a7e716ba206b8d6fda683fedf1b6067b530e9, 0.24.1. Kullanıcı, gerçek iPhone yansıtması üzerinden WoW Search'te incelenen tahta/sahne/yolculuk bütünlüğünü kendi oyununa uygulamayı istedi. Salt inceleme sınırını yeni açık uygulama talimatıyla kaldırdı.

Tek odak: özgün tam ekran bölge sahnesi + sade büyük tahta + gerçek ilerlemeye bağlı görsel devam/sonuç. Beş özgün raster sahne, eski vektör çizimleri ve marka korunarak yeni sunum katmanında kullanılır. Bir başlık/renk değişimi yeterli kabul edilmez. Yeni içerik üreticisi, ödeme, bağımlılık, tablo/göç yok.

Kabul: 360×568 ve iPhone8Plus Safari içerik bütçesi 414×622 ile normal, hikâye/bilmece, Arena; 390×844 ve tablet görünümünde görsel kontrol. Tahtanın bütün satırları, okunur harfler, erişilir kontroller, hedef listesi, gerçek sürükleme/iki uç ve sonuç→sonraki akışları. Büyük metin gerektiğinde okunur doğal taşmayı korur. Aynı sahne home/play/resultta; kısa telefonda tekrar HUD resmi alan yemez.

Tahta kararı: mevcut kare tahta formatı, eski ID/seed/grid/save snapshotları değiştirilmez. Dikdörtgen CSS esnetmesi isabeti bozar; bu tur alanı dış kart/chrome'dan geri alır. Solo'da ücretsiz180° bakış değişimi yalnız sunum grid/çizgi/hint kopyalarına uygulanır; commit özgün koordinata döner, key yönü içerir. Hız/sunucu/onay/Arena kuralları aynı kalır.

İki dar bağımsız uzman yalnız ayrılmış experience/reliability günlüklerini yazdı. Sonuçlar kaynak kanıtıdır; fiziksel cihaz veya tutma ölçümü değildir. Test/içerik/tip/build/Worker/GitHub CI/tam ağaç eşleşmesi ve native yayın cevabı aşağıda tamamlanmadan sürüm bitmiş sayılmaz.


## Uygulama ve doğrulama

Beş özgün WebP sahne; ana giriş, hikâye kartları, sabit oyun arka planı ve native sonuç diyaloğu aynı görsel dili kullanıyor. Eski kare tahtaları dikdörtgenmiş gibi germedik: sayı/kimlik/motor ve kayıt sözleşmesini koruduk. StoryHud'un sabit yüksekliği kaldırıldı; kısa ekranda yardımcı mesaj erişilebilir fakat görsel alandan çıkarıldı. Tahtaya ve hedefe öncelik verildi. Ana numaralı yolculuk, gerçek bölüm kilitleri, koleksiyon parçası sayısı ve açılacak dünyayı gösterir. Biten hikâyelerden sonra eski hikâyeyi öneren ana düğme yerine bölüm yolculuğu gelir. 180° dönüşüm yalnız Solo sunumu, özgün grid/target/save değiştirmez; yeni yön Board'u yeniden bağlar ve yarım hareketi iptal eder. Arena/rekabet dönüşümü yok.

Gerçek yerel tarayıcıda: 414×622 görünüm (iPhone 8 Plus Safari araç çubuklarına ayrılmış alanı temsil eden ölçü), 360×568, 390×844 ve 768×1024 DOM ölçüleri kontrol edildi. 414'te 7×7 tahta 363px, 360'ta 9×9 tahta 309px ve 19px harf; tüm satırlar ve alt kontroller görünür, yatay taşma yok. Hikâye 6×6 ve tek bilmece kartı, normal bilmece hedef değiştirme/tam liste/pause-resume, dokuzlu tablet tahta incelendi. Gerçek sürükleme ile döndürülmüş Bölüm 2'de NEPTÜN/MERKÜR/JÜPİTER tamamlandı; sonuçtan incelemeye ve Bölüm 3'e geçildi. Hikâyede KIYI çizildi, sıradaki bilmece açıldı, ipucu ve dönüşüm çalıştı. Yeniden yüklemede hesap/ilerleme geri geldi; iki tamamlanmış ana bölüm ve önceki hikâye yıldızları korunuyor. Sonuç diyaloğunda eski beyaz arka planın yeni açık metinle çakışması, tarayıcı görüntüsünde bulundu ve düzeltildi. Kanıt görüntüleri çalışma alanının `scenic-review/` dizininde; kaynak paketine oyuncu verisi veya ekran görüntüsü eklenmedi.

557/557 test,118 grup;165 authored tahta/3300 alternatif,64 grup tahtası,774 tanım/919 Arena kelimesi ve96 rekabet tahtası,714 Sprint kelimesi denetimi geçti. Tip kontrolü ve üretim build geçti;28 offline varlık,20 Safari12 syntax chunk kontrolü.578 üretim Worker HTTP kontrolü;iki eski oyuncu,sekiz özel grup ve16 eşzamanlı açık grup oturumu. Yeni beş WebP'nin gerçek Content-Type ve build SW listesi kontrol edildi. Tüm eski content/story/arena/progress/server/drizzle kaynakları başlangıçla aynı. Dar ikinci uzman incelemesinde engelleyici kayıt/dönüşüm hatası yok.

Sınırlar: bu tur fiziksel iPhone Safari/parmak, ses/haptik/FPS veya kurulu PWA offline testi yapılmadı. Arena lobisi gerçek UI'de görüldü; yeni çok oyunculu aktif Arena görseli iki cihazla test edilmedi, ortak sunucu davranışı HTTP ve mevcut bileşen testleriyle doğrulandı. Oyuncu keyfi/retansiyon etkisi ölçülmüş değildir. GitHub CI/tam kaynak ağacı/yayın sonucu aşağıdaki kaynaktan ayrı gerçek release makbuzunda doğrulanır.
