# 0.33.0 · Çizim ve oyun geri bildirimi

Odak: aynı tahta ve kayıtlar üzerinde akıcı çizim, tutarlı başarı/sonuç akışı ve oyun içi rahatlık ayarları. İnceleme becerileri: mobile-game-quality, Impeccable (yerel bağlam fallback), React performance, JavaScript testing. İki uzman yalnız inceleme yaptı.

## Uygulamadan önce kabul ölçütleri
- Sekiz yönde hızlı kaydırma ve makul tahta dışı taşma doğru kelimeyi bir kez kabul eder; eksen sapması, gizli/kilitli hedef, KALE/KALEM belirsizliği kuralları korunur.
- Aynı hücrede çizgi hareketi yeni yol üretmez, yeni React render veya tekrar titreşim tetiklemez.
- Yeni doğrulama yokken kelime efekti geometri okumaz. Efektler sınırlı, iptal edilebilir ve kayıt/puan akışından bağımsızdır.
- Arena sonuç açılınca hedef/araç pencereleri kapanır. İncelemede hedefler yeniden erişilir.
- Titreşim ve hareket azaltma aktif oyunda erişilir; rekabet saati ayarlarda durmaz.
- Dünya içi duraklar anlaşılır; küresel bölüm kimliği/sırası korunur ve konu adı her yerde aynıdır.
- 414×628 ve küçük telefon önizlemesinde normal, bilmeceli, hikâye, Arena, sonuç ve ayarlar kontrol edilir. Gerçek iPhone ve FPS iddiası yapılmaz.
- İçerik, kayıt, ödül ve Arena üretimi değişmez; test, içerik, tip, web/mobile build ve Worker HTTP kapıları geçer.

## Sonuç
Tamamlanan kod: Drag.cells cache ve referans bazlı boyama; sürekli projeksiyonla sınırlı dış kenar yakalama; WordFeedback fresh0 erken dönüş + bütün geometri okumaları yazmalardan önce; eski etiket pseudo katmanı kaldırma; transform/opacity bitiş halkası; yıldız/parça ritmi; shared preference provider, MatchTools ve bütün GameApp girişlerine kapsam; MobileTargets kutlama kapanışı; durak/küresel bölüm ayrımı; Arena kontrastı. Yeni bağımlılık/engine yok.

İki son inceleme bulgusu giderildi: tam 0/size köşe sınırı artık grace içinde (exact-edge ve release-only regresyonları); finished Arena incelemesinde MatchTools review ile yeniden erişilebilir ve saat metni değişir. İlk testlerde iki eski harness doğrudan Kurallar düğmesi arıyordu; taşınan MatchTools onHelp sözleşmesine uyarlandı. Yeni testler gerçek davranışı korur.

667/667 test, 136 grup; içerik 241/4820 +64 grup/96rekabet ve 774tanım/919kelime/714Sprint; typecheck; web build+offline42varlık/Safari12syntax21chunk; mobile build/copy/check16scene; Worker639izole HTTP geçti. Worker ilk denemesi sandbox yerel port EPERM, yetkili tekrar geçti. Fiziksel cihaz veya FPS sonucu değildir. İçerik/kayıt/ödül/tekrar engeli/göç dosyaları tabana göre değişmedi.

Destekli CUA/Vite önizlemesi gerçek CSS alanı ölçülerek 414×628 ve 320×568 kullanıldı (IAB ekran ölçeği nedeniyle viewport isteği ölçüme göre ayarlandı). Normal145 dört kelime sürüklenerek bitti; 1/4 kısmi kayıt reload sonrası korundu; sonuç sahnesi ve tek Devam ile146 açıldı. 320×568'de8×8 tahta300px ve alt kontroller görünür; riddle6×6/uzun tek hedef, Arena9×9 örneği320×568, eski12×12 örneği414×628 kontrol edildi. Hikâyede KIYI gerçekdrag ile2.adıma geçti. Oyun araçları solo pause/resume ve azaltılmış hareket anahtarı DOM'da doğrulandı; Arena araçları açıkken saat sürdü. Ana menü/Koleksiyon gerçek GameApp ile izole yanıtlar üzerinden kontrol edildi. Fixture'ın eksik chapters alanı bir kez boş ekran üretti; mock sözleşmesi düzeltildi, üretim koduna hata gibi taşınmadı. Fixture/artifacts üretime dahil değildir.

Görseller depo dışında `world-review/0.33.0/`. iOS kaynak0.33.0/build9 ve paket hazır; Xcode/cihaz kurulumu yapılmadı. İki gerçek Arena hesabı, fiziksel iPhone Safari/native kare süreleri, titreşim hissi ve VoiceOver açık kabul olarak kalır. GitHub CI/tam ağaç ve Sites makbuzu dışarıda `world-review/release-0.33.0.json` ile tamamlanır.

Son görsel teyit: Arena bitmiş sonuç örneği414×628 görüldü; kapat→tahtayı incele→araçlar yeniden açıldı ve süreyi sürüyor göstermeyen inceleme metni doğrulandı. Koyu skor/sıralama yüzeyi 320×568'de sahne üzerinde okunur kaldı. İki uzman düzeltmelerden sonra kendi notlarını kapattı. Şema üretimi23tablo ile değişiklik olmadığını doğruladı.
