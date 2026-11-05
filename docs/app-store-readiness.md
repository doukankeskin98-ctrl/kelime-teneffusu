# iOS yayın dosyası · 5 Kasım 2026

0.36.4 ek kanıtı: iOS native sistem paylaşımı ve herkese açık davet URL'leri düzeltildi. Simülatörde üç tür için Copy; ayrıca oda davetinin sistem Paste içeriği, iptal ve yeniden açma geçti. Bu sonuç fiziksel cihaz, iki oyuncu, Universal Links veya App Store yayın kabulü değildir. Telefon kurulumu ertelendi; aşağıdaki mağaza kapıları açık kalır.

İlk sürüm için yayıncının seçtiği hedef genel kitle. Yayıncı adı ve takip edilen destek adresi henüz belirlenmedi. Ücretli üyelik, dağıtım arşivi, TestFlight ve inceleme kaydı açık. Bu çalışma sürümünde gerçek reklam veya satış bulunmuyor. Mevcut App Store Connect beyanı, politika veya yaş derecesi yayımlanmış sayılmaz.

## 0.36.2 sürüm kararı

| Sıra | Teslim | Kabul kanıtı |
|---|---|---|
| 1 · Dokunma ve oturum | Gerçek tahtada sağ ve sol elle uzun kenar kelimeleri; çaprazlar, pivot, son örnek, kenardan taşma; kesilen çizim, kilit ve geri dönüş | Bölüm 12 tek sürüklemede BADİ EKREM. Özgün iOS dokunma testi ve eski kayıt kontrolleri var. Fiziksel telefonda kısa ve uzun oturum ile kare sürelerini ayrıca ölç |
| 2 · Oyuncu hesabı ve Arena | Ayarlardan yeniden doğrulanmış silme; misafir, e-posta, tüm oturumlar ve sağlayıcı silmesini kapsayan yeniden denenebilir işlem. Ortak maç kayıtlarında diğer oyuncuyu koru. İsimleri bildir/engelle ve işleten bir moderasyon kuyruğu veya önceden denetlenen isimler | İki deneme hesabıyla silme ve yeniden giriş, iki gerçek cihazla Arena engelleme/rövanş, inceleme notu ve yanıt veren destek kanalı |
| 3 · Mağaza paketi ve erişilebilirlik | Gerçek yayıncı, herkese açık çalışan gizlilik ve destek URL’leri, iletişim ve saklama uygulaması, hesap/sağlayıcı veri envanteri, arşiv gizlilik raporu, yaş anketi, telif envanteri. İlk oynanış/sonraki bölüm VoiceOver ve azaltılmış hareketle kontrol edilir | İmzalı dağıtım arşivi, uygun üyelik, TestFlight, ekran görüntüleri ve inceleme erişimi. Çevrimdışı solo, yeniden kurulum/ilerleme aktarımı, düşük güçlü cihazda uzun oyun ve ağ kesintisi doğrulanır |
| 4 · İçerik ve ekonomi | Oynayarak açılan bölümler/albüm parçaları ilk ödül döngüsü. Bir sonraki özgün bölüm paketi için konu/kelime editör kontrolü, eski tahta kimlikleri ve Arena tekrar kontrolü | Mağaza paketinde dağıtım hakkı doğrulanmış metin/görsel/font/ses bulunur. Ayrı bir gelir denemesi ancak temel oyun ve hesap güvenliği kabul edildikten sonra başlar |

## Oyun Modu, reklam ve satın alma

iOS oyun paketi `LSSupportsGameMode` ile sistem Oyun Modu desteğini bildiriyor. Uygun iPhone'da sistem, oyun tam ekrandayken durumu ve bildirimi yönetir. Oyun içi açılış bildirimi taklit edilmez. Apple, arka plan işlerini sınırlar ve bazı kablosuz aksesuarların gecikmesini azaltır. Oyunun dokunma doğruluğu ve uzun oturum performansı ayrıca test edilir. [Apple WWDC](https://developer.apple.com/videos/play/wwdc2025/209/) · [Apple Oyun Modu](https://support.apple.com/en-ie/105118)

Önerilen ilk TestFlight reklamsızdır. Daha sonra oyuncunun kendi isteğiyle açtığı tek deneme önerisi bir **solo pratik ipucudur**. Ödül ve koşul düğmeye basılmadan görünür. Reklam yüklenmezse oyuncu oynamaya devam eder. Kullanılmayan bir ipucu yıldız hesabını etkilemez; kullanılınca mevcut ipucu kuralları geçerlidir. Hikâye geçişine zorunlu reklam veya Arena'da puan/süre üstünlüğü eklenmez.

Ürün sahibi gelir modelini seçtikten sonra ağda uygulama ve reklam birimi oluşturulur. Test kimlikleriyle yükleme, vazgeçme, tamamlama ve tekrar gelen bildirim denenir. Sunucu imza ve işlem kimliğini doğrular, ödülü tek kez kaydeder. Arka plana alma veya geç onay oyuncuya iki ödül vermez. Yeni SDK için veri etiketleri ve saklama incelenir. Bölgeye göre rıza akışı, Apple'ın tanımladığı şekilde uygulamalar arası takip yapılacaksa ATT kararı gerekir. Kişiselleştirme veya izin reddi oyun girişini engellemez. Dijital içerik satışı seçilirse StoreKit satın alma, işlem doğrulama ve uygulanabilir geri yükleme akışları ayrı test edilir. [Ödüllü reklam](https://developers.google.com/admob/ios/rewarded) · [AdMob ödül kuralları](https://support.google.com/admob/answer/7313578?hl=en) · [Sunucu doğrulaması](https://developers.google.com/admob/ios/ssv) · [Apple veri kullanımı](https://developer.apple.com/app-store/user-privacy-and-data-use/) · [StoreKit](https://developer.apple.com/documentation/storekit/in-app-purchase)

## Şimdi uygulanan temel

Ana yolculukta 168 bölüm ve 28 rota; paketli sahneler; iOS 15+; yerel açılış; opsiyonel haptics; arka plan→ön plan sınırı; sabit HTTPS JSON API; native tek-uçuşlu Arena sorgusu, mevcut web SSE; mevcut sunucu yetki/puan/anti-repeat kuralları. Kişisel geliştirme imzası cihaz kurulumu için doğrulandı. Dağıtım imzası açık. Bundle ID geliştirme kimliği, Apple'da rezervasyon iddiası yok.

App Privacy manifest kaynakta gerçekten işlenen kategorileri gösterir: kullanıcı kimliği, oyun içeriği, arkadaş grafiği, yapılandırılmış üyelikte e-posta; isteğe bağlı ürün etkileşimi/performans, toplu hata sayımları. Reklam/IDFA/tracking SDK yok; bu, sunucuda veri toplanmıyor demek değildir. Son arşiv privacy raporu ve ağ denetimi yapılmadan App Store Connect beyanı tamamlandı sayılmaz. Sistem HTTPS/Web Crypto kullanımı için export alanı exempt olarak hazırlanmıştır; yeni kripto/SDK eklenirse yayıncı yeniden değerlendirir.

## Mağaza gönderimini engelleyen açıklar

| Koşul | Somut tamamlanma ölçütü | Durum |
|---|---|---|
| Yayıncı/Apple hesabı | Bireysel veya şirket hesabı, Team ID, imzalı arşiv, uygun bundle ID | Kişisel cihaz imzası var; mağaza hesabı/arşivi açık |
| Mevcut oyuncunun geçişi | Safari'deki aynı kimliğin, solo/ek bölümlerin ve Arena geçmişinin uygulamada güvenli devamı; ikinci cihaz ve eski yanıt testi | Açık; solo JSON kimlik aktarımı değildir |
| Hesap silme | Uygulamadan başlatma, sahiplik/yeniden doğrulama, tüm oturumları iptal, D1 ve sağlayıcı kapsamı, ortak maçları bozmadan silme/anonimleştirme | Açık; çıkış yalnız oturum kapatır |
| Paylaşılan adlar | Uygunsuz adı bildirme, engelleme, moderasyon kuyruğu ve cevap veren destek kanalı | Açık |
| Gizlilik/KVKK | Gerçek işletmeci, amaç/hukuki sebep, sağlayıcı/aktarım, saklama ve imha uygulaması, hak başvurusu, çalışan kamu URL'si | Bilgi + işletim kararı bekliyor |
| Native giriş | ChatGPT/Sites hesabı için güvenli geçiş, gerekiyorsa 4.8 eşdeğer giriş; e-posta sağlayıcısının cihaz testi | Açık; işlevsiz ChatGPT yönlendirmesi native'de gösterilmez |
| Yaş ve haklar | Gerçek özelliklerle yaş anketi; marka/karakter/isim/sahne/ses/font hak envanteri | Açık; 4+ veya Kids iddiası yok |
| Cihaz kalitesi | Küçük ve düşük güçlü gerçek iPhone, 20 dk oyun, kilit/arama/bağlantı kesintisi, VoiceOver, ses/haptics, kare süreleri, iki gerçek Arena oyuncusu | Fiziksel iPhone açılış/ayar/kaydırma/seçim görüldü; uzun oturum, his/FPS ve diğer cihazlar açık |

## Gizlilik metni için hazırlanmış içerik

**TASLAK — yayımlanacak hukuki metin değildir.** İşletmeci: kesinleşmedi. İletişim: kesinleşmedi.

Kelime Teneffüsü solo ilerlemeyi cihazda tutar. Çevrimiçi profile bağlanıldığında ilerleme, oyuncu kimliği/takma ad, maç sonuçları ve arkadaş ilişkileri oyun hizmeti için sunucuda işlenir. Arena'da daha önce görülen içerik, yeni odalarda tekrarı azaltmak için aynı oyuncu kimliğiyle tutulur. Kullanıcı adı ve ilgili skorlar diğer oyuncular tarafından görülebilir. Oyun telefon rehberi, kamera, mikrofon veya konum izni istemez.

İsteğe bağlı kullanım ölçümü başlangıçta kapalıdır. Açılırsa olay ve performans aralıkları toplu sayılır. E-posta, çizilen kelime yolları veya kalıcı analitik kimliği bu ölçümlerde gönderilmez. Güvenlik için istek sınırları ve toplu teknik hata kayıtları bulunur. Sunucu ve sağlayıcı loglarının gerçek saklama süreleri ayrıca doğrulanmalıdır.

E-posta üyeliği yapılandırıldığında Firebase doğrulama/e-posta akışını, web Sites girişi platform kimlik akışını kullanır. Barındırma ve veri hizmeti mevcut Sites/Cloudflare altyapısıdır. Sağlayıcı sözleşmeleri ve yurt dışı aktarım hukuki düzeni işletmeci tarafından netleştirilmeden kesin uygunluk beyanı yapılmaz.

Veri saklama: mevcut kaynak bütün hesap kayıtları için uygulanmış otomatik imha süresi içermiyor. 30/90gün gibi uydurma süre yazılmayacak. Hesap silme ve destek başvurusu devreye alındığında politika gerçek işlemleri açıklayacak. Misafir profilinden çıkmak veri silmek değildir. Uygulamayı kaldırmak sunucudaki veriyi silmez.

## Kullanım koşulları / destek taslağı için kararlar

Hizmet sağlayıcı, iletişim, hedef ülkeler/yaş ve yürürlük tarihi kesinleşmeli. Rekabet kuralları sunucu doğrulaması, uygunsuz takma ad/hile yasağı ve uygulanabilir itiraz yolu ile açıklanmalı. Ödeme/reklam/abonelik şu an uygulanmıyor; hayali satın alma veya iade hükümleri eklenmez. WoW yalnız deneyim referansıdır; adı/logo/görseli/varlıkları mağaza materyaline taşınmaz. Mevcut Hababam/film/sanatçı içerikleri ticari hak incelemesi tamamlanmadan temizlenmiş kabul edilmez; eski oyuncu kayıtları sessizce değiştirilmez.

Destek URL'si ve gelen kutusu doğrulandıktan sonra hata bildirimi; uygulama sürümü, cihaz/iOS ve sorunun açıklamasıyla yapılmalı, parola/oturum anahtarı istenmemeli. Silme/moderasyon başvuruları ayrı görev olarak işlenmeli. Yanıt süresi işletmecinin gerçek kapasitesiyle belirlenmeli.

## Güncel birincil kaynaklar

- [Apple4.2 /4.8 /1.2 /5.1 /5.2](https://developer.apple.com/app-store/review/guidelines/)
- [Misafir dahil hesap silme](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion)
- [App Privacy beyanı](https://developer.apple.com/app-store/app-privacy-details/)
- [Privacy manifest kategorileri](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacycollecteddatatypes/nsprivacycollecteddatatype)
- [SDK manifest gereksinimleri](https://developer.apple.com/support/third-party-SDK-requirements/)
- [Export compliance](https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance/)
- [Yaş derecelendirmesi](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)
- [KVKK aydınlatma](https://www.kvkk.gov.tr/Icerik/6765/AYDINLATMA-YUKUMLULUGUNUN-YERINE-GETIRILMESI-HAKKINDA-KAMUOYU-DUYURUSU)

Kaynak temelli ayrıntılı veri envanteri: `studio-agents/journal/entries/2026-11-03-ios-policy-review.md`. App Store hesabında herhangi bir beyan gönderilmedi ve ücretli kayıt açılmadı. Kişisel cihaz testi Xcode’daki kullanıcı hesabıyla imzalandı.
