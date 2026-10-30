# 30 Ekim 2026 · 0.15.0 · Ekrana uyum ve grup Arena doğrulaması

Başlangıç Sites kaynağı `f6d6de3e4f2a53a62047cc35c0ab38252466239d`, GitHub main `944e789bacb62a38fe2f57e252fa559e39d42f84`; başlangıç tam ağaçları `3fc56b0c5c33655d6e679f554c0d4a2f16e077f2` ile aynı. Yeniden devam ederken source helper uzak dalı tekrar okudu; kaynak ilerlememişti. Owner/public erişimi ve GitHub push/admin hakkı araçla doğrulandı.

## Uygulanan davranış

- Ortak PlayLayout, gerçek visualViewport ve safe-area boşluklarından sonra kalan yükseklikte HUD, tek hedef listesi, tahta ve 44 px temel kontrolleri düzenler. Boyutlar ölçülür; çok kısa görünüm/büyütülmüş yazıda okunurluk alt sınırı bütün çerçeveyi doğal akışta genişletir. Gizli hedefler, parçalı adlar ve onaylanmış çizgiler önceki veri sözleşmesini korur. Dikey telefon ve yatay/tablet/masaüstü yerleşimleri ayrı kurallıdır.
- Özel grup oda dört kişiye sabitlenmez; herkes hazır, en az iki kişi ve host başlatma koşulu vardır. Roster başlangıçta sabitlenir. Gerçek ortak tahta, sunucu saati, skor ve eşit puan sırası; büyük roster 12 kişilik sayfalarda. Bir oyuncunun bağlantısının kopması süreyi sıfırlamaz, gruptan açık ayrılma kalanları ilk rakibin galibiyetiyle bitirmez.
- Yeni oyun oyna tek round ilerlemesi, aynı oda/kod, yeniden hazır olma. Önceki sonuç lobiden açılır; biri erkenden ilerlese bile diğer oyuncu sonucu görebilir. Terminal sıra ayrılmayla değişmez. Hızlı eşleşme gerçek sunucu oda transferini source stream bağlamıyla kabul eder.
- Yeni `0004` göçü iki tablo ekler: profil bazında normalize hedef kümesi/gerçek grid geçmişi ve içerik cursor'ı. Tüm katılımcıların geçmişleri birlikte dışlanır. Denetlenmiş kelime bankalarının altılı kombinasyonlarından 8×8, çözülebilir, iki çapraz eğimli aday seçilir. Uymayan aday atlanır, sınırlandırılmış tarama ilerler, sonlu havuz sonunda açık hata verilir. Kimlik/etiket/sıra/seed değişimi aynı hedef kümesini yeni saydırmaz.
- Oda/allocator/geçmiş aynı transaction ve revizyon/token kazanımına bağlıdır. Yeni quick ve group protokolünde round/owner/aktif üyelik kontrolü, 12 saniyelik istemci kurtarma sınırı, aynı-tık kilidi ve stale ACK/recovery/SSE reddi. Deadline sonucunu sonraki turdan önce ayrı atomik kayıt; rövanş/ayrılma yarışı callback içinde korunur. Eski aktif odanın motor tahtası değişmez.

## Geçen kalite kapıları

- Tam paket **362/362 test, 74 grup**, sıfır fail/skip. Önceki işlev testleri korunmuş, yeni tur protokolüne açık round argümanları eklenmiştir; eski kayıt/oyun doğruluk iddiaları kaldırılmamıştır.
- **4, 8 ve 16 bağımsız servis kimliği** aynı odada eşzamanlı join/ready/claim. Üç ardışık tur, hızlı tekrar next, eski tur istekleri, server instance/reconnect, terminal kayıt tekilliği, üyelik süresi, host ayrılması ve sıralama.
- Gerçek içerik anahtarları, farklı oyuncu geçmişlerinin birleşimi, gerçek grid çakışması, ilk tema geçişi sonrasında yeni içerik, ordinal146 sığmama regresyonu, 250 adaylık örneklem, tam havuz tükenmesi ve transaction rollback testleri geçti.
- **339 üretim Worker HTTP kontrolü** geçti. Mevcut iki oyuncu akışına ek **8 eşzamanlı grup oturumu**: katılma/hazır/başlat, aynı tahta/süre, gerçek hamle/skor/sonuç, SSE yeniden bağlanma, 12 yinelenen next isteği, ikinci yeni tahta, aynı doğrulanmış test kimliğiyle yeni isteklerde geçmiş korunması. İzole Miniflare/D1; canlı oyuncuların verilerine test yazılmadı.
- TypeScript geçti. İçerik denetimi **120 yazarlı tahta / 2.400 alternatif** geçti. Sites üretim derlemesi geçti, **22 sürümlü çevrimdışı istemci varlığı** hazırlandı. Son sürüm-notu düzenlemesinden etkilenen releases paketi **12/12** geçti.
- Drizzle tekrar üretimi yeni fark üretmedi; yalnız ek schema-only migration. 23 motor/katalog/legacy/harita/ilerleme/tarihli içerik/uygulanmış göç dosyası başlangıçla bire bir aynı. Hosting/bağımlılık girdileri aynı; yalnız paket sürümü değişti. `git diff --check` temiz.
- Önceki turda iki sınırlı uzman ilk/son incelemeyi yaptı; devam turunda iki sınırlı son uzman kendi benzersiz günlüklerine yazdı. Güvenilirlik 16 oyuncu/16 next probe ve üç son regresyonu; deneyim source transferi, modal ve geometriyi ayrıca doğruladı. İkisi de son dar kapsamda açık engel bırakmadı. Uygulama ve yayın tek koordinatördedir.

## Doğrulanmamış sınırlar

Destekli önizleme süreci durdurulduktan sonra eski generated vinext kilidi kenara alındı. `sites-preview` healthy ve `http://terminal.local:4173/` verdi; CUA tam URL'ye **ERR_CONNECTION_REFUSED** döndürdü. Alternatif tarayıcı/ağ yolu kullanılmadı. 320×568,360×640,390×844,430×932, tablet/masaüstü ve 200% yazı için hesap/kaynak kontrolleri vardır; gerçek DOM/piksel/çentik/araç çubuğu/dokunma/odak ölçümü yoktur. Bu sınırda “her telefonda kaydırmasız doğrulandı” denmez.

HTTP harness'ın trusted identity header'ları gerçek sağlayıcıyla çıkış/giriş değildir. Aynı doğrulanmış profilin kalıcı D1 geçmişi test edildi; silinmiş misafir cookie'si yeni profil üretir. 16 servis kimliği veya 8 HTTP oturumu gerçek üretim kapasitesi garantisi değildir. Mevcut 650 ms SSE/D1 izleme altyapısı dağıtık yük ölçümü bekler. Eski tamamlanmış Arena turlarında tutulmamış içerik geçmişi uydurulmadı; yeni altılı alan bu sürümden itibaren kalıcıdır. Aday sayısı bütün adayların oynanmış/uygun olduğu iddiası değildir.

Sıradaki öncelik: gerçek iPhone/Android ve dört/üstü cihazla aynı akış, gerçek provider ile yeniden giriş, D1/SSE gecikme/yük ölçümü. Mevcut ücretsiz yapı, kayıtlar, eski bölümler/ödüller ve açık adres korunur. Bu doğrudan düzeltme turunda yeni tarihli bölüm eklenmedi.

GitHub CI, tam kaynak ağacı eşleşmesi ve Sites saved version/deployment makbuzları bu commit'in içine gömülmez; yayın kapısında gerçek dış sistem sonuçlarıyla ayrıca doğrulanır.
