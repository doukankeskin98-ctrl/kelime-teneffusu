# 0.55.0 — Daha belirgin bulma anı, kesintisiz yolculuk

16 Kasım 2026 · iOS yapı 48. Başlangıç: 0.54.0 / Sites 110 / kaynak `adaa17e78a49b677bad588629104d9751eb3a0d6`. Kabul tasarımı: [game-look.md](game-look.md).

## Oyuncunun göreceği değişiklikler

- Doğru kelimeler sekiz canlı, opak renkle ve hücrenin %84'ü kalınlığında işaretlenir. Kısa büyüme ve uç parlaması vardır; koyu harfler okunur kalır. Bonus keşifleri de ayrı renklidir. Mevcut alternatif paletler korunur.
- Övgü artık sonraki çizimde silinmez: 140 ms giriş, 900 ms okunur bekleme, 200 ms çıkış. İki yıldız ve sekiz küçük parçacık eşlik eder. Canlı seçilen harflerle aynı ayrılmış alanı kullanır; kısa ekranda başlık alanına taşınarak tahtadan yer almaz. Ayarlar, arka plan ve bölüm sonucu efekti kapatır. Azaltılmış harekette durgundur.
- Bonus harfleri yinelenen hedef yazısının üstüne yığılmak yerine ayrı toplama noktasına uçar. Bonus ekranı önceden yüklenir; yükleme sırasında dünya sahnesi görünür kalır. Başarısız ön yükleme yeniden denenebilir.
- Ana ekranda dünyanın gerçek altı adımı görünür; günlük bulmacaya doğrudan erişilir. Ana bölüm düğmesinin basılabilirliği belirginleşir. Sonuç başlığı alıştırma, günlük ve dünya tamamlanmasına göre değişir; tekrar ve tahta inceleme ikincil seçeneklerde toplanır. Yeni dünya bildirimi çizimi bekletmez.
- Dar ekranda gizli kelime yıldızlarının satır bölmesi ve uzun alt mesajın araçlara yaklaşması düzeltildi. Son kelimenin mevcut uçuş/sonuç zamanlaması ve tek dokunuşla devam korunur.

## Doğrulama ve sınırları

| Kontrol | 16 Kasım sonucu / kanıt düzeyi |
| --- | --- |
| Tam test seti | 1.002 / 1.002, 174 test grubu |
| Worker HTTP | 742 kontrol; iki eski oyuncu, sekiz özel ve on altı eşzamanlı açık grup oturumu; yerel izole sunucu |
| Tip / içerik / şema / 312 bölüm manifesti | Geçti; kimlik, kelime, koordinat, sıra ve kayıt şeması değişmedi |
| Lint | 428 mevcut hata / 159 uyarı, artış yok; borç bitmiş değildir |
| Web / mobil / imzalı iOS derlemesi | Geçti; mobil 0.55.0 (48), 60 eşleşen paket dosyası |
| Renk kontrastı | Üç paletin 24 rengi, koyu harfe karşı en az 4,98:1 |
| İlk oyun / sonuç / bonus / sonraki bölüm | 320×568, 375×667, 393×852, 430×932 gerçek Chrome dokunma emülasyonunda geçti; son boyutta azaltılmış hareket de denendi |
| Övgü / kelime inişi | Sonraki çizimde övgü kalır, süre sonunda gider; uçuşta tamamlanma çizgisi gizlidir. Bonusun ilk üç keşfinin renkleri ayrıdır. Test + tarayıcı görüntüsü |
| Bütün bölümlerin yerleşimi | İki küçük boyutta 312'şer bölüm; ayrıntılı sonuç `layout-all.log` ve `layout-*.json` içinde |
| Gerçek iPhone | 14 Pro Max'e mevcut uygulamayı silmeden kuruldu. Kurulum öncesi/sonrası 10 yerel kayıt değeri birebir aynı. Yansıtma üzerinden tamamlanmış 35. bölümde altı kelime, övgü, sonuç ve tek dokunuşla 42. bölüme devam oynandı. Ayarlar ve ana ekran görüntülendi |
| Parmak / titreşim | Kullanıcı 0.55.0 için “Akıcı, titreşim dengeli” diye doğruladı |

Telefon görüntüleri canlı iPhone Yansıtma'dan kaydedildi; fareyle sürükleme, fiziksel parmak testi yerine sayılmadı. Kullanıcı kabulü ayrı kaydedildi. 18 övgü karesi 1.402 ms, 28 sonuç karesi 1.937 ms aralıkta örneklendi. Bunlar ekran görüntüsü zamanlarıdır; cihaz FPS veya kaçan kare ölçümü değildir. Safari Timelines profili, VoiceOver, küçük fiziksel iPhone ve iki gerçek cihazla Arena bu tur doğrulanmadı. Üç normal + bir bilmece + bonus + yeni dünya fiziksel cihaz kabul matrisinin tamamı bitmiş değildir.

## Boyut ve kaynak disiplini

Kaynak CSS toplamı 533.159 → 532.600 bayt (**−559**). Dokunulan mürekkep/övgü kuralları `app/game-ink.css` içinde tek kaynağa taşındı; eski çakışan ve kullanılmayan kurallar kaldırıldı. Mobil derleme günlüğündeki 13 uygulama JS parçasının toplamı yaklaşık 1.070,75 → 1.072,65 kB (**+1,90 kB**); küçük runtime dosyaları bu karşılaştırmaya dahil değildir. Ana mobil parça 856,84 → 858,63 kB; büyük parça uyarısı sürer. Yeni bağımlılık yok.

Xcode'un Masaüstü dosya koordinasyonu beklemesi nedeniyle aynı iOS kaynakları `/tmp` altında derlendi; uygulama kodu veya imzalama kimliği bu sorun için değiştirilmedi. İlk tam veri kapsayıcısı kopyası iOS'un korumalı SplashBoard dosyasında durdu; ayrı WebKit yedeği tamamlandı, SQLite doğrulandı ve kurulumdan sonra değerler karşılaştırıldı. Yedeğin tam cihaz yedeği olduğu iddia edilmez.

## Kanıtlar ve sonraki paketlerin durumu

Yerel kanıt klasörü: `../world-review.nosync/release-0550/`. `after-first-session.json`, `after-rhythm.json`, `arrival-check/`, `layout-*.json`, `contrast.json`, test/Worker/derleme günlükleri; `iphone-home.png`, `iphone-settings.png`, `iphone-result.png`, `iphone-next.png`, `phone-frames/` ve `phone-preservation.json` burada bulunur. Başlangıç karşılaştırması önceki `release-0540/` ve Claude'un `claude-0.54-inceleme/kanit/telefon/` kayıtlarıdır. Telefon karşılaştırmasından ölçülmemiş piksel veya süre çıkarılmadı.

Bu paket Claude'un tüm dört aşamalı önerisini tamamlanmış saymaz. [Ekonomi taslağı](economy.md) onay bekleyen öneridir; jeton ve ücretli ipucu eklenmedi, üç ücretsiz ipucu azaltılmadı. [İçerik raporu](content-pilot-055.md), 312 bölüm ve altı kapalı adayın yön/kesişme ölçümünü içerir; özellikle tek eksenli geç dünya adayları editoryal çalışmaya muhtaçtır. Rev2, kompakt ana kayıt yazıcısı ve Game Center kapalı kalır. Ambiyans ve reddedilen efekt paketi geri gelmedi.

## Geri dönüş

0.54.0 kaynak `adaa17e78a49b677bad588629104d9751eb3a0d6`, Sites 110 ve iOS 47 referansları saklanır; `baseline-0540.bundle` kanıt klasöründedir. Aynı 312 bölüm ve kayıt biçimi kullanıldığı için bu sunum paketinden geri dönüş ilerlemeyi silmeyi gerektirmez. Oyuncu verileri eski yedekle değiştirilmez. Site/GitHub kaynak eşleşmesi, CI ve yayın makbuzu yayımlama adımında ayrıca kaydedilir; bu belge tek başına yayın kanıtı değildir.
