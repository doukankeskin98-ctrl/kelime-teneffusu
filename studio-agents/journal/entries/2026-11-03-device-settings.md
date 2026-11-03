# Gerçek iPhone: erişilebilir titreşim ayarı

## Kabul ve karar

0.30.1 (3), kullanıcının iPhone 14 Pro Max / iOS 27.2 cihazına kendi kişisel Apple takımıyla kuruldu ve açıldı. Kullanıcı tarif edilen titreşim ayarını bulamadı. Üst dişlinin GameSettings bileşeni titreşim içermiyor; Koleksiyon normal belge akışındayken iOS scrollEnabled:false alt ayarlara erişimi engelliyor.

En küçük düzeltme: native belge kaydırmasını açmak; destekli native oturumda üst dişliye mevcut progress.haptics tercihini kullanan anahtar eklemek. Web titreşimi sessiz kalır; tercih, kayıt, içerik, Arena ve tahta seçim kuralları korunur. Apple hesabı/sertifika/özel anahtar repoya yazılmaz.

Kabul: fiziksel cihazda dişli → Dokunma titreşimi görünür ve değişir; Koleksiyon aşağı kayar; tahta sürüklemesinde sayfa kaymaz. Eski ayar/ilerleme korunarak uygulama üzerine kurulur. İlgili kontroller, imzalı cihaz derlemesi ve gerçek ekran doğrulaması gerekir. Fiziksel titreşim hissini yalnız kullanıcının geri bildirimi doğrulayabilir.

Salt okunur iOS güvenilirlik incelemesi aynı nedeni doğruladı: App.tsx normal main akışı ve native WKWebView scrollEnabled bağlantısı. Kaynak çalışma klasöründeki iCloud dataless dosyaları zaman aşımına uğradığı için aynı yayımlanmış commit resmi Sites helper ile geçici yerel checkout'a açıldı; mevcut kaynak/kayıt silinmedi.

## Sonuç

0.30.2 (4) imzalı cihaz derlemesi geçti; mevcut uygulama silinmeden iPhone 14 Pro Max / iOS 27.2 üzerine kuruldu ve açıldı. İki tamamlanmış bölüm / 6 yıldız korunmuş göründü. Üst dişlide Dokunma titreşimi göründü ve Açık yapıldı; Hareketi azalt kapalıydı. Aynı gerçek cihazda Koleksiyon dikey sürüklemesi alt Ayarlar bölümüne ulaştı. Bölüm 3'te çapraz ROKET sürüklemesi kabul edildi, 1/5 ilerledi ve tahta yer değiştirmedi. Görseller: ../world-review/0.30.2-iphone-{haptics,scroll,board}.png.

624 test / 131 grup, tip, içerik denetimi, web/mobil paket, mobile:check, imzalı Xcode cihaz derlemesi ve 628 Worker HTTP geçti. Native belge kaydırmasını kapatan paketler mobile:check ile reddedilir. Başlangıçtaki iCloud kaynak/bağımlılık hatalı test denemesi iptal edildi; yerel temiz bağımlılıklar kurulduktan sonra tüm kontroller yeniden ve başarılı çalıştı.

Kullanıcı harf geçişi ve doğru kelime titreşiminin çalıştığını doğruladı. Takılmanın kutlamada değil kelime çizerken olduğunu netleştirdi; takip düzeltmesi device-drag günlüğündedir. Ekran görüntüsü his/FPS kanıtı değildir. Safari→uygulama kimlik/ilerleme aktarımı ve mağaza yayın kapıları açık. Kişisel test profilinin bitişi 10 Kasım 2026; App Store/TestFlight dağıtımı yapılmadı. GitHub/Sites CI ve yayın makbuzu depo dışında tutulur.
