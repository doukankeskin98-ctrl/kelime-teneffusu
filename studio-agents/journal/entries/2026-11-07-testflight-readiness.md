# TestFlight hazırlık incelemesi — 7 Kasım 2026

Rol: güvenilirlik, salt okunur kaynak incelemesi. İncelenen kaynak 0.40.0 / native build 25. Bu not dışında uygulama, dağıtım veya kullanıcı verisi değiştirilmedi. Apple hesabı ve App Store Connect kaydı açılmadı.

## Tek uygulanabilir bulgu

**P2 — Mobil paket kontrolü, Xcode'un gerçekten paketleyeceği kopyayı doğrulamıyor.**

- Kaynak: `scripts/verify-mobile.mjs:9–17`, `ios/App/App.xcodeproj/project.pbxproj:319–349`; mevcut CI sırası `.github/workflows/check.yml:27–29`.
- Tetikleyici: web/mobil kod değiştikten sonra `mobile:build` ve `mobile:check` çalıştırılıp `cap copy/sync` unutulursa, eski `ios/App/App/public` içeriği Xcode'a kalabilir. Kontrol yalnız `dist-mobile` varlıklarını okur. `package.json` sürümü ile Debug/Release `MARKETING_VERSION`, iki `CURRENT_PROJECT_VERSION` değeri de karşılaştırılmaz.
- Beklenen: başarılı mobil kontrol, hazırlanmış mobil web çıktısının native projeye eksiksiz kopyalandığını ve sürüm etiketlerinin tutarlı olduğunu doğrulasın.
- Gerçek: kontrol, native kopyanın eskimesini veya sürüm ayrışmasını yakalayamaz. **Bu incelemede mevcut kopyanın eski olduğu saptanmadı:** `index.html` ve 7 üretilmiş asset SHA-256 ile eşit; paket ve Xcode sürümleri 0.40.0 olarak eşit. Dolayısıyla bu bir mevcut oyuncu hatası iddiası değil, kanıtlanmış doğrulama boşluğu.
- Oyuncu etkisi: geliştiricinin yeni sanarak kurduğu native pakette eski menü/oynanış kalabilir; sürüm etiketleri yanıltıcı olabilir.
- Öneri: mevcut `mobile:check` içine bütün kaynak build varlıkları için `dist-mobile` → `ios/App/App/public` dosya/bayt eşitliği ve package/Xcode sürüm uyumu kontrolü ekle. Capacitor'un ayrıca ürettiği dosyaları fazla dosya diye reddetme. Yeni SDK veya servis gerekmez.
- Kabul: doğru kopya geçer; izole fixture içinde tek JS/CSS dosyası eski/eksikse açık mesajla başarısız olur; native index eskiyse ve Debug/Release sürümleri farklıysa başarısız olur. Bu test gerçek kullanıcının paketini veya cihaz verisini değiştirmez.
- Risk: düşük; yalnız gönderim öncesi hata yakalama. Kontrolün kendisi, fiziksel cihaz hissi veya Apple kabulü yerine geçmez.

## Doğrulanan mevcut temel

- `capacitor.config.ts`: yerel `dist-mobile`, `server.url` yok, global HTTP patch kapalı, belge kaydırması açık.
- `Info.plist` ve Xcode: iPhone-only hedef, dikey yön, iOS 15 minimum, Game Mode bildirimi, keyfi cleartext izni yok. iPad yön listesi iPhone hedefinde tek başına hata değildir.
- Native simge ve açılış görseli görsel olarak incelendi; Capacitor varsayılanları değil, mevcut Kt markası.
- App Privacy manifest kaynakta ve Xcode Resources içinde. Manifestin varlığı, son arşivin tüm sağlayıcı davranışını kanıtlamaz.
- Bu makinede `xcodebuild -version`: Xcode 27.2 / 27B52. Dağıtım arşivi üretilmedi veya doğrulanmadı.
- Üç bulgu kotasını doldurmak için doğrulanmamış native hata üretilmedi.

## Kodla tek başına tamamlanamayacak yayın koşulları

Mevcut `docs/app-store-readiness.md:34–45` açıkları hâlâ dürüstçe korunmalı: Apple Developer Program yetkisi, App Store Connect uygulama/bundle kaydı ve dağıtım imzası bu incelemede doğrulanmadı. Önceki kişisel cihaz imzası TestFlight dağıtım kanıtı değildir.

Gerçek, takip edilen beta geri bildirim e-postası; kamuya açık destek/gizlilik sayfası ve işletmeci/saklama kararları; sağlayıcıdaki gerçek hesap silme ve moderasyon işletimi; yaş/varlık hakları dosyası; iki gerçek Arena cihazı ve eski/küçük iPhone kabulü açık. Uydurma adres, yayıncı veya saklama süresi eklenmemeli. `SupportReport.tsx` yalnız rapor kopyaladığını doğru biçimde söyler; bu gönderim hizmeti sayılmaz.

Game Center, reklam, IAP ve push bildirimleri ilk beta için zorunlu özellik değildir. Bunları eklemek temel oynanış kabulünün yerine geçmez. Mevcut Game Mode bildirimi Game Center oturumu değildir.

## 7 Kasım 2026 tarihinde doğrulanan Apple kaynakları

- [SDK minimum requirements](https://developer.apple.com/news/upcoming-requirements/?id=04282026a): 28 Nisan 2026'dan beri App Store Connect yüklemeleri Xcode 26+ ve iOS 26+ SDK ister. Minimum kullanıcı işletim sistemi hedefiyle derleme SDK'sı ayrı kavramdır; iOS 15 hedefini sırf bu kural nedeniyle yükseltmek gerekmez.
- [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/): test build'i 90 güne kadar kullanılabilir; ilk dış test build'i incelemeye gönderilir. Yerel derleme veya Sites yayını TestFlight kabulü değildir.
- [Provide test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information/): dış test için beta açıklaması ve feedback e-postası gibi test bilgileri App Store Connect'te tamamlanır.

Sınır: telefon bağlantısı, canlı hesabı değiştirme, Apple dağıtımı, ağ/veri envanteri sertifikasyonu veya kapsamlı güvenlik denetimi yapılmadı. Fiziksel his/FPS için güvence verilmez.
