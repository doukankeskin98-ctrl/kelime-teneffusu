# iOS yayın dosyası · 3 Kasım 2026

Durum: iOS uygulaması simülatörde ve kişisel imzayla iPhone 14 Pro Max üzerinde kuruldu/açıldı. Bu belge App Store kabulü veya hukuki uygunluk onayı değildir. Kişisel Apple hesabı Xcode’a bağlandı; ücretli Apple Developer Program üyeliği ve TestFlight henüz yok. İşletmeci adı/destek e-postası yanıtı bekleniyor. Kesinleşmemiş bir politika canlıya konmadı.

## Şimdi uygulanan temel

Aynı GameApp, tahta ve 120 bölüm; paketli sahneler; iOS 15+; yerel açılış; opsiyonel haptics; arka plan→ön plan sınırı; sabit HTTPS JSON API; native tek-uçuşlu Arena sorgusu, mevcut web SSE; mevcut sunucu yetki/puan/anti-repeat kuralları. Apple takım/sertifika/profil bilgisi yok. Bundle ID geliştirme kimliği, Apple'da rezervasyon iddiası yok.

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
