# İpucu, sürükleme ve aynı sahnede sonuç — uygulama kabulü

Seçilen odak: mevcut oyunun etkileşim geri bildirimini düzeltmek. Alternatif geniş yeniden tasarımın maliyeti ve kayıt riski bu talep için gereksiz. Referans olarak önceki gerçek WoW ekranları yeniden incelendi; statik görüntülerden hareket süresi veya FPS sonucu çıkarılmadı.

Uygulamadan önce kabul ölçütleri:
- İpucu seçili görünür grubun ilk eksik parçasını izler; seçili grup yoksa liste sırası kullanılır. Günlük istek yeniden denenirken hedef ve işlem kimliği korunur. Hikâye ve gizli tema kilitleri korunur.
- Doğru hedef sürükleme sırasında bir kez kabul edilir; hızlı örnek atlama, ters yön ve döndürülmüş görünüm desteklenir. Uzun hedefin öneki olan kısa hedef otomatik kabul edilmez; parmağı bırakma/iki uç/klavye çalışır. Sonraki move/up/cancel ikinci işlem doğurmaz.
- Günlük ve Arena başarıları sunucu onayından önce kutlanmaz. Yeni animasyonlar ödül/kayıt veya oyun kurallarını yönetmez.
- Başarı çizgisi ve hedef vurgusu tahta satırlarını örtmez, tahtayı hareket ettirmez. Bölüm sonucu aynı arka plan üzerinde, erişilebilir devam düğmesiyle sunulur. Azaltılmış hareket desteklenir.
- Oyuncu kayıtları, bölüm kimlikleri/tahtaları, ödüller, Arena tekrar engeli ve 0.26.1 gizli hedef dengesi değişmez. Arayüz dili kısa ve tutarlı hale gelir.
- Etkilenen davranış testleri, tüm proje testleri, içerik denetimi, tip kontrolü, üretim derlemesi ve Worker HTTP denetimi yapılır. Küçük mobil önizleme incelenir; gerçek cihaz testi yapılmadıysa açıkça belirtilir.

Uzmanlar salt okunur etkileşim/güvenilirlik ve deneyim incelemeleri yaptı; uygulama ve yayın koordinatörde.

## Uygulama ve yerel doğrulama

- Seçili hedef ipucu Solo/Günlük/Gizli Tema'da bağlandı. Günlük optional targetId; eski makbuz, owner kontrolü, kota ve CAS aynı. Uzman incelemesinin bulduğu uncertain + başka cihazda hedef bulunması kilidi kapatıldı ve regresyon testi eklendi.
- Board erken kabulü callback'ten önce gesture/RAF temizler. Yalnız caller'ın açık hedefleri aday; prefix belirsizliğinde kısa hedef otomatik kabul edilmez. Sunucu pending çizgileri başarı parıltısı üretmez. Mevcut dokunma/klavye/iptal testleri korundu.
- Aynı GameScene yerinde kalırken normal/günlük/hikâye/Arena sonucu native dialog üzerinde açılır; devam her zaman erişilebilir. Bulunan hedef ve çizgi ucu kısa vurgulanır; azaltılmış hareket desteklenir. Sonraki Arena tahtasında hedef animasyonu için liste anahtarı değişir.
- 583 test/125 grup, tip kontrolü, içerik denetimi, üretim derlemesi ve 615 Worker HTTP kontrolü başarılı. Yeni Worker kontrolleri seçili ipucu, bilinmeyen hedef, daha önce bulunan hedef ve eski receipt tekrarını içerir. Derlemenin Safari 12 sözdizimi denetimi gerçek Safari testi değildir.
- Gerçek yerel UI, 414×622: Uzak uzay hedefini IŞIK YILI'na çevirip ipucunun [7,11] ilk hücresine gittiği görüldü. Normal ilk bölümde MARS ve GÜNEŞ son harflerinin ötesine native drag, DÜNYA dikey ve YILDIZ yatay ile tamamlandı. Tahtayı incele geri dönüşü çalıştı; önceki albüm parçası tekrar verilmedi.
- 360×568: Doğanın sırları bölümünde 2/4 kayıt korundu; sonraki hedef BAYKUŞ seçilince ipucu [4,5]'e gitti. BAYKUŞ/ZÜRAFA ters yönde çizilip bölüm tamamlandı, sonraki farklı bilmeceye geçildi. Sonuç gövdesi/CTA çakışması görsel incelemede düzeltilip tekrar kontrol edildi.
- Görseller depo dışında: ../world-review/0.27.0-result-414.png, 0.27.0-result-360.png, 0.27.0-selected-hint-360.png, 0.27.0-riddle-result-360.png. Yerel gerçek UI kanıtlarıdır; Arena görsel veya fiziksel cihaz kanıtı değildir.
- GitHub tam ağaç/CI ve Sites yayın sonucu uygulama sonrası depo dışı release-0.27.0.json makbuzuna yazılır. Bu yerel kayıt yayın sonucunu önceden varsaymaz.
