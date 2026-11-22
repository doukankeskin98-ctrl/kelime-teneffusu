# Kelime Teneffüsü 0.57.7 · Bütünlük

21 Kasım 2026. Başlangıç sürümü 0.57.6 (`d89169d`), yerel iOS paketi 59. Çalışma dalı `codex/0.57.7-butunluk`. Yayın, TestFlight gönderimi ve telefona kurulum yapılmadı.

## Oyuncuya yansıyan değişiklikler

Günlük bulmaca artık ilk dokunuşta oyuncu adı istemeden başlatılabiliyor. Sunucu aynı bulmacayı ve oturumu doğruluyor. Sonuçta sıralamaya katılmayı seçen oyuncu adını belirleyebiliyor. Adı olmayan oyuncu herkese açık sıralamada görünmüyor. Günlük bulmaca, Arena ve profil istekleri geç döndüğünde eski ekranı veya farklı bir oyuncunun adını ve ilerlemesini değiştirmemeleri için kontroller eklendi.

Ana ekrandaki ve bölüm sonundaki yıldız sayacı toplamı gösteriyor. Yeni kazanım kısa süre ayrı görünüyor. Bölüm sonucu albümdeki ilerlemeyi gösteriyor. Yeni dünya açıldığında bunun adı ayrıca okunabiliyor. Tamamlanan dünya sayısı ve üç farklı tema için kazanılan Gezgin Ruh rozeti artık farklı ölçüler olarak sunuluyor.

Yolculuk, albüm, profil, ayarlar, destek ve Arena'daki terimler aynı anlamda kullanılıyor. Sese hem ana menüden hem oyun içinden aynı ayar ile erişiliyor. Bölüm seçimi ve ipucu yolları korunuyor. Hesapsız oyuncunun avatarı kişi simgesi. Çevrimdışı oyun sırasında bir profil hatası genel uyarı olarak gösterilmiyor. Kayıt alanı ve hesap doğrulama uyarıları yerlerinde. Destek, kopyalanabilir bir rapor üretiyor. Henüz doğrudan gönderim kanalı yok.

## Gezintide dönüş yolları

| Ekran | Kontrol | Tek dokunuşun hedefi |
|---|---|---|
| Arena, Günlük, Oyunlar, Profil | Sol üst geri | Yolculuk ana ekranı |
| Meydan okuma, Arkadaşlarım | Arena’ya dön | Arena girişi |
| Ayarlar / diğer ayarlar, destek, gizlilik | Ayarlara dön | Ana ayar seçenekleri |
| Ayarlar ve bu alt paneller | Sağ üst kapat | Ayarları açan ekran |
| Oyun içi ayarlar | Oyuna dön / kapat | Aynı tahta |
| Oyun içi ayarlar | Ana sayfaya dön | Yolculuk |
| Yolculuğum / dünya ayrıntısı | Dünyalar | Dünya listesi |
| Sonuç | Tekrar / Tahta | Aynı bölümü tekrar oyna / bitmiş tahtayı incele |
| Hedef veya konu seçimi | Kapat | Seçiciyi açan ekran |

## Kontroller

| Kontrol | Yerel sonuç |
|---|---|
| Otomatik testler | 1.047 geçti |
| Worker | Yerel üretim derlemesi üzerinde 749 HTTP kontrolü geçti |
| Tip denetimi, web ve mobil paket, içerik | Geçti. Mevcut lint borcu 426 hata ve 155 uyarı. Artış yok |
| Okunurluk ve sözlük | 320×568 ve 393×852'de 34'er menü. Ölçülen metinlerde boyut, kontrast ve terim ihlali sıfır |
| İlk yolculuk | Her iki boyutta altı bölüm, 10/10 bonus, sonraki dünya ve 18 yıldız. Önceki sürümde aynı akışta görülen yedi kural ihlali yeni sürümde sıfır |
| Harita | 312 başlık her iki genişlikte kelime sınırında kalıyor. 0, 1, 3, 5, 6 ve 120 bölüm örneklerinde ilk iki dünyanın bölüm düğmeleri oyun kurallarıyla eşleşiyor |
| Kontrol konumları | Referanstaki 18 kontrolün tamamı her iki genişlikte 4 piksel toleransın içinde |
| Sonuç ekranı | Normal sonuç ve yeni dünya bildirimi yedi ekran/güvenli alan düzeninde ölçüldü. Ödül içeriği ile ana düğme arasında en az 16 px var. İkincil düğmelerin etiketleri küçük ekranda da okunuyor |
| Eski kayıt | 120 bölüm, 360 yıldız, 20 tamamlanan dünya. Ayrı örnekte 7 bölüm, 21 yıldız, 0 tamamlanan dünya ve kazanılmış Gezgin Ruh |
| Normal kapanış | İki ayrı yerel Chrome profilinde önceki kayıt ve yıldızlar yeniden açılışta birebir aynı |

[Menüler ve ilk dünya için yan yana karşılaştırma](../world-review.nosync/butunluk-0577/karsilastirma/index.html) · [Yerel ölçümler ve ekran görüntüleri](../world-review.nosync/butunluk-0577/) · [Yeni içerik pilotunun mevcut durumu](yerel-yolculuk-pilotu-0580.md)

Görseller, sentetik kayıtla yerel tarayıcıda elde edildi. Karşılaştırma farklı ekranları açan ana menüden ilerler. Revizyon 2 paketinin masaüstü deneyinde Chrome sürecinin zorla kapatıldığı SIGTERM ve SIGKILL serilerinde kayıt kaybı bildirilmişti. Bu çalışmada tekrarlanan kapanış testi normal Chrome kapanışını ölçtü.

## Fiziksel cihaz ve teslim sınırı

M9 kabulü için iPhone'da bir test kaydıyla bölüm tamamlanır. Bir saniye içinde uygulama kapatılıp yeniden açılır. Bölüm, yıldız ve albüm parçası her denemede karşılaştırılır. Cihaz, iOS sürümü ve 20 ayrı denemenin sonucu kayda geçer. Fiziksel iPhone deneyi bekliyor. İşletim sisteminde zorla kapatma, titreşim ve FPS bu çalışmada doğrulanmadı. Kayıp görülürse paketteki sahip ayrımı, birleştirme ve bozuk kopya kurtarma tasarımı uygulanır.

0.58 içerik tablosu ayrı aşamada. Yeni içerik ve kayıt bayrakları kapalı. Bu sürüm tahta kimliklerini, yerleşimleri, çizim motorunu veya kayıt biçimini değiştirmedi. Yerel geri dönüş noktası 0.57.6 kaydı `d89169d`. Yayımlama öncesi sunucuyu eski sürüme döndürme değerlendirmesi adsız günlük oturumları da kapsamalı. Oyuncu veritabanının eski bir kopya ile üzerine yazılması geliştirme değişikliklerini geri almanın bir parçası değildir.
