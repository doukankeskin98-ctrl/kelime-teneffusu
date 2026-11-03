# iOS test sürümü · karar ve kabul

Kullanıcı 3 Kasım'da kurulabilir iPhone test sürümüne başlama ve App Store politika hazırlığını açıkça istedi. Apple Developer hesabı yok. Yayıncı kimliği/destek adresi yanıtı bekleniyor. Temel kaynak 0.28.1 / Site61 / 72294023f7fc80ec479413ac03ebccc9e0d42bc5.

Seçim: aynı GameApp/tahta/içerik ve sunucuyu kullanan, yerel varlıkları paketlenmiş Capacitor iOS istemcisi. Site URL'sini açan uzak kabuk seçilmedi: çevrimdışı açılış ve derleme kimliği ölçülebilmeli. Tam oyun motoru yeniden yazımı, kanıt olmadan risk/maliyet yaratır. Web önizleme devam eder; sunucu Origin/kimlik kuralları gevşetilmez.

Kabul: iOS simülatör derlemesi; paketli sahne/120 bölüm; gerçek simülatör UI ile solo/sonuç/yeniden açılış; yerel kaydın korunması; native haptics ve arka plan/ön plan köprüsü; web PWA akışının değişmemesi. JSON API yalnız sabit HTTPS sunucuya gider, abort/geç cevap sınırı korunur; native Arena bounded polling kullanır, web SSE aynı kalır. Gerçek cihaz/FPS/ses/haptics ancak denenirse doğrulanır.

İlerleme aktarımı ana kabul kapısıdır. Cihazdaki solo yedeği kimlik/oturum/rekabet geçmişi değildir; guest Arena geçmişi başka bir kimliğe aktarılmış gibi sunulamaz. Tam hesap taşıma/hesap silme/moderasyon ve yayıncı bilgisi tamamlanmadan mağaza hazır sonucu verilmez.

Politika işi gerçek veri envanteri, privacy manifest, yayın kapıları ve işletmeci bilgisiyle tamamlanacak taslaklardan oluşur. Bilinmeyen saklama süreleri, tüzel kişi veya destek adresi uydurulmaz. App Store/ödeme/sözleşme hesabı kullanıcı yerine açılmaz.

İki sınırlı salt okunur uzman: iOS transport/kayıt uyumluluğu ve politika/veri envanteri. Koordinatör tek kod sahibi. Son test ve yayın sonuçları ayrıca eklenecek.

## Gerçek doğrulama

601 test / 127 grup geçti. Yeni transport/polling testleri sabit host, header süzme, yönlendirme reddi, abort ve geç sonuçları, serileştirme hatası/204/205/bozuk status ile Promise kapanmasını ve native polling nesil sınırını kapsar. Eski VM testlerine yalnız yeni runtime importunun kontrollü bağımlılığı eklendi; önceki beklentiler gevşetilmedi. İncelemede bulunan settle-before-Response hatası düzeltildi. TypeScript, 191 tahta/3820 alternatif, 64 grup tahtası, 774 Arena tanımı/919 kelime, 714 hızlı kelime ve 622 yerel üretim Worker HTTP kontrolü geçti. Web Safari 12 söz dizimi kapısı geçti; gerçek Safari cihaz testi değildir.

Paket kontrolü yerel entry/16 sahne/sabit HTTPS/PrivacyInfo resource ve ATS istisnası olmamasını doğrular. Xcode 27.2 ile Debug iphonesimulator build başarılı. iPhone 16e / iOS 26.2 Device Hub içinde gerçek UI: ilk 4 kelime kaydırması, 3 yıldızlı sonuç, ikinci bölüme devam, ana ekranda 1/120, arka planda duraklama, misafir test oturumu, özel 9×9/7 kelimeli lobi ve ayrılma. Bu iki oyunculu maç testi veya fiziksel haptics/FPS kanıtı değildir. Test adı iOS Test; özel odadan çıkıldı. Kanıtlar depo dışında `../world-review/0.29.0-ios-board.png`, `0.29.0-ios-result.png`, `0.29.0-ios-arena.png`.

Politikalar kaynak ve Apple/KVKK birincil belgeleriyle incelendi; gizlilik manifesti ilk teknik envanterdir. Nihai arşiv/ağ raporu, işletmeci gerçekleri, hak/yaş incelemesi ve uygulamadaki silme/moderasyon/kimlik geçişi henüz kapalı değildir. Apple hesabına giriş, sözleşme kabulü, ücret veya App Store Connect beyanı yapılmadı. İlerleme biçimleri ve canlı DB değişmedi.
