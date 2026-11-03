# iOS yayın hazırlığı: veri ve politika incelemesi

3 Kasım 2026. Salt okunur kaynak incelemesi; uygulama kodu veya canlı politika değiştirilmedi. Başlangıç kaynağı 0.28.1. Apple Developer hesabının olmadığı kullanıcı tarafından belirtildi; yayıncı/veri sorumlusu kimliği ve destek e-postası bu inceleme sırasında kesinleşmedi. Aşağıdaki maddeler ilk simülatör derlemesini engellemez; halka açık mağaza teslimi için kapanması gereken somut açıkları tanımlar. Hukuki uygunluk veya Apple onayı verilmiş değildir.

## 1. Veri yok beyanı doğru olmaz; politika gerçek işletimle eşleşmeli

`db/schema.ts:3–29` oyuncu kimliği/takma ad, kalıcı hesap eşlemesi, oturum özeti, ilerleme, maç/günlük sonuçları, arkadaş ilişkileri, meydan okumalar ve kalıcı Arena içerik geçmişini sunucuda saklıyor. `lib/auth/server.ts:9–25` doğrulanmış e-posta/Firebase kimliği veya Sites kimliğini işler. İsteğe bağlı telemetrinin kapalı olması bunları ortadan kaldırmaz.

| Gerçek akış | Kaynak | Beyan hazırlığında aday kategori / amaç |
| --- | --- | --- |
| Oyuncu ID, kullanıcı adı, misafir ID; kayıtlı hesapta sağlayıcı ID ve işlenen e-posta | `db/schema.ts:3,9,11`; `lib/auth/server.ts:9–25`; `lib/auth/firebase-client.ts:38–49` | Kullanıcı kimliği; etkin e-posta yöntemi varsa e-posta; uygulama işlevi, kullanıcıya bağlı |
| Solo/ek bölüm kayıtları, maç/günlük puanları, eşleştirme, tekrar önleme geçmişi | `db/schema.ts:4–7,12–14,17,25,29` | Oyun içeriği; uygulama işlevi, kullanıcıya bağlı |
| Arkadaş bağlantıları ve davetler | `db/schema.ts:15–16`; `lib/game/social.ts:72–84` | Sosyal grafik/Contacts tanımı açısından değerlendirme; telefon rehberi izni kullanılmıyor |
| İzinli olay ve performans aralıkları; geri dönüş tarihleri cihazda | `lib/game/telemetry.ts:5–24`; `app/api/metrics/route.ts:7–11` | Ürün etkileşimi/performans; ölçüm varsayılan kapalı; D1 yalnız gün/olay/aralık toplamını tutar |
| IP özetiyle oran sınırı; kod bazında toplu işletim hataları | `app/api/session/route.ts:10–11`; `app/api/metrics/route.ts:9`; `lib/game/security.ts:4–13`; `db/schema.ts:19,26` | Güvenlik/teşhis kullanımına göre sınıflandırılmalı; IP hash'i otomatik olarak anonim sayılmaz |

Kabul: Derlenen iOS paketinin gerçek ağ akışına göre App Privacy yanıtları hazırlanmalı. Oyun kayıtları için Gameplay Content açıkça değerlendirilir. İsteğe bağlı ölçümün açıklama istisnası ayrıca incelenir; varsayılan kapalı olmak tek başına istisna değildir. Kaynakta reklam takibi/IDFA akışı bulunmadı; yeni SDK eklenirse yeniden kontrol gerekir. [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/)

İncelenen `app` rotalarında yayımlanmış gizlilik/destek/koşullar sayfası bulunmadı. Yayıncı, destek kanalı, veri işleyenler, saklama/imha süreleri ve başvuru yolu kesinleşmeden metin taslak olarak kalmalı. Süresi dolan oda/davetin kullanılamaması, DB satırının silindiği anlamına gelmez; kaynakta bütün oyuncu verisi için işletilen silme takvimi yok. KVKK aydınlatmasında kimlik, amaç, aktarım, toplama yöntemi/hukuki sebep ve haklar yer almalı; somut veri işleme hukuki sebebi işletmeci tarafından netleştirilmeli. [KVKK aydınlatma açıklaması](https://www.kvkk.gov.tr/Icerik/6765/AYDINLATMA-YUKUMLULUGUNUN-YERINE-GETIRILMESI-HAKKINDA-KAMUOYU-DUYURUSU)

Capacitor Apple'ın SDK manifest listesinde. Son Xcode arşivinin PrivacyInfo.xcprivacy raporu, kullanılan required-reason API'ler ve varsa native Firebase bileşenleri incelenmeli. Mevcut JavaScript Firebase paketini native Firebase SDK'sı sanıp yanlış manifest beyanı yapılmamalı. [Apple SDK gereksinimleri](https://developer.apple.com/support/third-party-SDK-requirements/)

## 2. Çıkış, hesap silme değil

`app/api/session/route.ts:15` ve `lib/auth/guest.ts:21` yalnız geçerli `game_sessions` tokenını kaldırır. `app/api/account/route.ts` sadece hesap oluşturma/eşleme POST'u içerir. Profilde tam hesap silme veya veri dışa aktarma akışı bulunmadı. `players`, kayıtlar, skorlar, arkadaş grafiği ve `arena_seen` kalır.

Apple misafir olarak otomatik açılan hesapların da uygulama içinden silinmesini başlatabilmeyi bekler; genel oyunda yalnız e-posta gönderme zorunluluğu yeterli değildir. [Apple hesap silme](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion)

Kabul: Hesap ayarlarında açık sonuç açıklaması ve ikinci onay; yeniden kimlik doğrulama/sahiplik; oturumları iptal; hesabın kendi D1 satırları, paylaşılan JSON'lardaki takma ad/kimlik ve üçüncü taraf hesabı kapsamının ayrı ele alınması. Aktif odada silinen oyuncu karşı oyuncunun sonucunu bozmamalı. Yinelenen/gecikmiş istek, iki hesap ve başarısız sağlayıcı silmesi test edilmeli. Veri dışa aktarma kullanıcı hakkı/taşınabilirlik tasarımının ayrı parçasıdır; Apple'ın hesap silme maddesinin doğrudan zorunlu kıldığı özellik diye sunulmaz.

## 3. iOS giriş seçenekleri netleşmeli

`components/auth/EntryPanel.tsx:11` ChatGPT ile devam bağlantısını, yapılandırma varsa e-posta kaydını sunuyor. `lib/auth/accounts.ts:16` eski Sites hesabını yalnız iki doğrulanmış e-postanın eşitliğinde birleştiriyor. Bu akışın yeni uygulamada çalıştığı kanıtlanmış değil.

Üçüncü taraf girişini ana hesap için kullanan uygulamalarda Apple 4.8'in eşdeğer mahremiyet özellikleri koşulu değerlendirilir. Yalnız işletmenin kendi e-posta/parola sistemi için istisna bulunur; Firebase kullanılması tek başına sosyal giriş demek değildir. [Apple 4.8](https://developer.apple.com/app-store/review/guidelines/#login-services)

Kabul: iOS'ta hangi sağlayıcının gerçekten çalışacağı seçilmeli; mevcut Sites kullanıcılarının ilerlemesini güvenli taşıyan doğrulanmış bağlama akışı kurulmalı. ChatGPT düğmesini işlevsiz bırakmak veya kaldırıp eski hesabı erişilemez yapmak çözüm sayılmaz. Apple ile giriş koşulunun son sağlayıcı tasarımına göre uygulanması gerekir.

## 4. Paylaşılan oyuncu adlarının kötüye kullanım yolu açık

`lib/auth/guest.ts:13` karakter/uzunluk temizliği yapıyor; uygunsuz içerik filtresi değil. `lib/game/server.ts:37,325–326` ad değiştirme ve herkese görünen sıralamaları, `lib/game/social.ts:81` yalnız arkadaşlıktan çıkarma işlemini içeriyor. Şikayet, oyuncu engelleme veya moderasyon kuyruğu bulunmadı. İncelenen kaynakta serbest sohbet yok; uygulamayı anonim sohbet hizmeti gibi sınıflandırmıyorum.

Kullanıcıların paylaştığı içerik için Apple 1.2 filtreleme, bildirme, engelleme ve ulaşılabilir iletişim ister. Oyuncu adlarının bu kapsamdaki en dar gerçek yüzey olduğu değerlendirmemdir. [Apple 1.2](https://developer.apple.com/app-store/review/guidelines/#user-generated-content)

Kabul: Uygunsuz adı bildirme, belirli oyuncuyla etkileşimi engelleme, sunucu tarafında uygulanabilir kural ve işletmecinin başvuruları ele alacağı kanal. Arkadaşlıktan çıkarma yeniden eşleşmeyi önlemediği için engelleme diye etiketlenmemeli. Gerçek rapor/engelleme akışı olmadan mağazada bunların varlığı beyan edilmemeli.

## 5. Yaş derecesi tahminle 4+ yazılamaz

Gerçek özellikler: açık eşleşme, kullanıcı adı, arkadaş bağlantısı, kullanıcı tarafından yazılmış takma ad; serbest sohbet, reklam ve ödeme kodu incelemede görülmedi. Mağaza anketi mevcut özelliklerle doldurulmalı, hesap/iletişim/UGC yanıtları görünüşe göre atlanmamalı. Made for Kids seçimi genel-audience yaş derecesinden ayrı ve ileriki sürümleri etkileyen bir karardır. [Apple yaş derecesi](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)

Kabul: Yayıncı hedef yaş grubunu ve satış ülkelerini seçtikten sonra App Store Connect'in ürettiği derece kayıt altına alınır. Şimdiden çocuklara özel pazarlama veya doğrulanmamış yaş rozeti eklenmez. Reklam/ödeme sonradan eklenirse derecelendirme ve beyan yeniden incelenir.

## 6. Görsellerin özgünlüğü bütün içerik haklarını kanıtlamaz

`docs/world-art.md:3–7` sahnelerin özgün üretim kaynağını belgelemektedir. Ancak `lib/game/catalog.ts:4–7`, `lib/game/content.ts:15–16`, `lib/game/legacy.ts:19–36` Hababam karakterleri, film/seri adları ve gerçek sanatçı adları kullanır. Bunların kelime sorusu bağlamında bulunması tek başına ihlal kararı değildir; bütün içeriğin ticari haklarının temiz olduğunu da kanıtlamaz.

Apple 5.2 ve 4.1 bakımından marka, karakter, görsel, yazı tipi, ses ve mağaza materyali için kaynak/lisans kaydı tutulmalı. [Apple fikri haklar](https://developer.apple.com/app-store/review/guidelines/#intellectual-property)

Kabul: Mevcut ilerleme ve tarihsel tahtalar sessizce değiştirilmeden, hak değerlendirmesi gereken içerik işaretlenir. WoW adı/görselleri/logo ve arayüz varlıkları uygulama veya mağaza materyaline taşınmaz. Ticari değerlendirmesi kesinleşmeyen içerik için yayın öncesi hak sahibi/uzman incelemesi gerektiği açık tutulur.

## Doğrulama sınırı

Yalnız kaynak ve 3 Kasım 2026 tarihinde erişilen resmi Apple/KVKK kaynakları incelendi. Üretim DB, gerçek sağlayıcı ayarları, altyapı log saklama sözleşmeleri, Xcode privacy raporu veya App Store Connect hesabı okunmadı. Veri envanteri uygulama kaynağının gösterdiği akışları anlatır; son paketin ağ denetimi ve işletmeci doğrulaması yerine geçmez. Bu inceleme için yeni hesap, ücretli servis veya altyapı oluşturulmadı.
