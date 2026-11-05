# Kelime Teneffüsü · 6 Kasım 2026 stüdyo incelemesi

Başlangıç: yayımlanmış 0.36.4, Sites kaynağı `ae43883cc0f9fb45f6ada3707bdbd7fbf444bc43`. İnceleme; mevcut akışları, Opus değerlendirmesini, iki sınırlı uzman kaynak incelemesini ve Apple'ın güncel birincil belgelerini bir araya getirir. Aşağıdaki açıklar tamamlandı sayılmaz. Bu turdaki uygulama değişikliği 0.36.5 **Sorun bildir rapor hazırlama ekranıdır**; tüm oyunun yenilenmesi değildir.

## Kanıt ve sınır

- Kaynak: Yolculuk/bölüm seçici/Solo/sonuç; Etkinlikler/Günlük/Arşiv; Arena/lobi/maç/Arkadaşlar/Meydan; Koleksiyon/albüm/profil; ayarlar/yardım/kimlik ve kayıt sahipliği.
- Yerel destekli tarayıcıda Arena → Arkadaşlar ve Meydan geçişinde eski krem sayfa/alt menüye dönüş görüldü. Destek raporunun formu, gerçek pano içeriği, teknik bilgi seçimi, geri dönüşü ve kopyalandı durumu kontrol edildi. Gözlenen viewport 302×654 CSS piksel; istenen 390×844 override aynı ölçüyü üretmedi, bu yüzden iPhone boyut testi diye sunulmaz.
- Yerel profil API hatası geliştirme ortamındadır; üretim hesabı arızası kanıtı değildir. Gerçek oyuncu verisi sıfırlanmadı.
- 758 test / 152 grup, içerik/tip/şema denetimleri, web ve mobil derleme, Capacitor sync/mobile check ve 639 Worker HTTP kontrolü geçti. 167 testlik dokunma/kimlik alt kümesi ayrıca bağımsız incelendi. Son odak düzeltmesinden sonra etkilenen tip/build/mobile/Worker kontrolleri yenilenir.
- Fiziksel iPhone, uzun oturum FPS, iki gerçek Arena oyuncusu, Game Center veya TestFlight hesabı bu turda denenmedi. Test sayısı WoW düzeyinde his veya App Store onayı anlamına gelmez.

## Ürün ve arayüzde doğrulanan açıklar

| Öncelik | Bulgu | Yapılacak iş ve kabul |
|---|---|---|
| P1 | Arena → Arkadaşlar/Meydan; Yolculuk → Etkinlikler → Günlük/Arşiv ortak sahneli kabuktan çıkıyor | Aynı arka plan, başlık/geri/alt gezinme ve form-listesi sistemi. Dört yolun boş/yükleniyor/hata/dolu durumları küçük ekran ve büyük yazıyla incelenmeli. Sloganlı eski tanıtım kartları oyun içi işlemin önüne geçmemeli. |
| P1 | İlk oyuncu rehberi kendisi bulmak zorunda | Var olan 6×6 öğretici ve ilk bölüm cümlelerini, ilk tahtada eyleme bağlı ve atlanabilir kısa rehbere dönüştür. Düz seçim → çapraz seçim → bağımsız seçim; mevcut ilerlemeli oyuncu zorlanmaz, tahta kimliği/kelimeleri değişmez. Yardımdan tekrar açılır. |
| P1 | Meydan okuma ortak araç ve bitmiş tahta sözleşmesini eksik kullanıyor | `readOnly`, istek kilidi, tema sahnesi ve MatchTools ortaklaştırılır. Bitmiş tahta yeni seçim üretmez; ayarlara erişim rekabet saatini durdurmaz. |
| P1 | Meydan final kelimesinin uçuşunu sonuç açılırken iptal ediyor; Gizli Tema da hemen sonuç açıyor | Solo/Arena'daki son kelime → tamamlanmış hedef → kutlama → devam sırasını paylaş. Puan/kayıt hemen kesinleşir; animasyon yalnız sunumdur. Kesinti, azaltılmış hareket ve atla ile ödül yinelenmez. |
| P2 | “Nasıl oynanır” iki farklı yere götürüyor; öğretici sonucu “Yolculuğa dön” deyip arşive dönebiliyor | Kurallar ve oynanabilir alıştırma tek yardım akışında; geri/sonraki düğmesinin adı gerçek hedefi söyler. |
| P2 | Yazı ailesi büyük ölçüde ortak olsa da boyut/ağırlık/hiyerarşi tutarsız | Teneffüs/Manrope'u değiştirmek yerine ortak başlık/gövde/etiket/tahta ölçeği. 8–10 px metinleri, dev sloganları, 800/400 ağırlık farklarını kaldır. Türkçe harfler, uzun adlar ve büyük yazı ayrıca incelenir. |
| P2 | Albüm başlığı ile oyunun güncel konu adı ayrışabiliyor | Örnek: `uzay-5` “Uzak ufuklar” / “Uzak uzay”. Tek sunum kaynağı + bölüm numarası; kalıcı ID ve kayıtlar korunur. |
| P2 | Arena alt ekranı ile URL her zaman birlikte güncellenmiyor | Arkadaşlar/Meydan geçişi, yenileme ve geri dönüş aynı bağlamı korumalı; davet kodları kaybolmamalı. |

Kaynak/satır ve ayrı kabul senaryoları: [UI incelemesi](../studio-agents/journal/entries/2026-11-06-ui-audit.md). Görülmeyen bütün ekranlar için piksel kontrolü yapıldı iddiası yoktur.

## Dokunma, ilerleme ve kimlik

1. Yeni bir tahta algoritması hatası bu kaynak incelemesinde kanıtlanmadı. TROYA köşesi, dış kenar toleransı, sekiz yöne pivot, hızlı bırakmanın son örneği, Pointer/Touch tek kabul, iptal/arka plan ve KALE/KALEM ayrımı mevcut korumalardır. Bunları rastgele yeniden yazmak yerine gerçek cihaz kabulü gerekir: sağ/sol elle 100 bilinen geçerli çizim, yanlış/çift kabulün sıfır olması, çizim boyunca sabit geometri, 20 dakika düşük güç/ısınma/kilit/ağ kesintisi. 60 Hz için p95 16,7 ms kare süresi bir ölçüm hedefidir; gerçekleşmiş sonuç değildir.
2. Misafirden kalıcı hesaba geçiş standart Solo ilerlemesini birleştiriyor; tarihli ek bölüm sahipliği, Arena profili/geçmişi/tekrar kayıtları ve arkadaşlar aynı aktarımın içinde değil. Veriler silinmiş demek değil; yeni sahip altında görünmeyebilir. Sunucuda doğrulanmış, tekrar çağrıda çoğaltmayan bütüncül sahiplik bağlama gerekir. İstemci skorlarına güvenilmez.
3. Misafir oturumu oluşturulduktan 90 gün sonra veya çıkışta kurtarma yolu eksik. Eski yerel kayıt başka sahip anahtarında kalabilir. Güvenli hesap bağlama/kurtarma; cihaz değişimi ve Safari→uygulama geçişi birlikte tasarlanmalı.
4. Hesap silme yok. Oturum kapatma veri silme değildir. Misafir dahil uygulamadan başlatılabilen, sahipliği doğrulanan, oturum/sağlayıcı/veri kapsamı belirli, yarıda kalırsa güvenle yinelenebilir silme gerekir. Başka oyuncuların ortak maçları korunmalı, eski önbellek hesabı yeniden yaratmamalı.
5. Oyuncu adları için içerik denetimi, oyuncu bildir/engelle ve işletilen moderasyon kanalı eksik. Arkadaş silmek engellemek değildir. Destek formu bu açığı kapatmaz. Önceden denetlenen ad sistemi de ürün alternatifi olabilir; kullanıcı üretimi ad sürdürülecekse operasyonuyla beraber uygulanmalı.
6. Game Center yok. GameKit doğrulama, capability ve sunucuda kimlik bağlama uygulanmamış. Mevcut Oyun Modu bildirimi bundan farklıdır.

Ayrıntı: [Güvenilirlik incelemesi](../studio-agents/journal/entries/2026-11-06-reliability-audit.md).

## Game Center için doğru deneyim

Apple cihazında zaten Game Center'a giriş yapmış oyuncu, oyun GameKit doğrulamasını başlatınca aynı oyuncu adıyla tanınabilir. Gerekirse Apple giriş ekranı sunar; her cihazda sessiz başarı garanti değildir. Doğrulama başarısız/iptal olursa solo oynamak engellenmemeli. Oyun başında tekrar eden hesap formu ve izin yağmuru önerilmez.

Önerilen yapı: hemen oynanabilir yerel/misafir profil; mevcut Game Center hesabının güvenli bağlanması; sabit kendi oyuncu kimliğimiz; sunucuda Apple imza doğrulaması; hesap değişiminde yanlış oyuncuya kayıt yazmayı engelleme. Takma ad kimlik anahtarı olamaz. Game Center tek başına bulut kaydı, eski Safari hesabı aktarımı veya Arena backend'i sağlamaz. Bunlar ayrıca geliştirilir. Oyun Modu sistem performans özelliğidir; Apple ile Giriş başka bir kimlik sağlayıcıdır. Game Center App Store için zorunlu değildir.

[Apple oyuncu doğrulama](https://developer.apple.com/documentation/gamekit/authenticating-a-player) · [Kimliklerin kapsamı](https://developer.apple.com/documentation/gamekit/protecting-the-player-s-privacy-using-scoped-identifiers)

## Opus değerlendirmesinden alınacaklar ve düzeltmeler

- **Al:** İlk 60–90 saniyenin anlaşılır, eylem içinde öğrenilen deneyimi. Sayfa tanıtımı değil ilk başarılı çizim ve net devam yolu.
- **Al:** İzinli ölçümle ilk tahta/ilk kelime/ilk bölüm/sonraki bölüm akışını anlamak. Mevcut isteğe bağlı olaylar ve D1/D7 sayaçları var; bunlar kimlikli, kohortlara ayrılmış tam bir analiz sistemi veya gerçek tutma sonucu değildir. Önce küçük testçi gözlemi ve mevcut veri kalitesi; sırf popüler diye yeni SDK yok.
- **Al:** Bölüm konusu–kelime uyumu, anlamlı zorluk eğrisi, editör denetimli paketler. Binlerce tohum, binlerce özgün bölüm diye sayılmaz. Mevcut 168 ana bölüm ve tüm eski tahtalar korunur. Daha büyük tahta/zaman baskısı otomatik zorluk çözümü değildir.
- **Al:** TestFlight/Xcode çökme kayıtları ve kişisel veriyi toplamayan hata bağlamı. Genel hata sayacı ayrıntılı çökme teşhisi değildir.
- **Düzelt:** Paylaşım, seri hesabı ve öğretici tamamen yok değil. Paylaşım 0.36.4'te native akışla düzeltildi; öğreticinin keşfedilebilirliği ve rehberliği eksik.
- **Ertele:** Reklam, paket, bildirim ve kozmetik mağaza; temel deneyim/kimlik kabulünden sonra ayrı ekonomi kararı. Bunlar TestFlight veya App Store'a girmek için zorunlu özellikler değildir. Oyuncu yararı olmayan bildirim ve cezalandırıcı seri tasarımı eklenmez.
- **Kanıt sayma:** Rapordaki kaynağı doğrulanmamış kayıp/gelir/retansiyon yüzdeleri. Kendi sunucunda analiz aracı çalıştırmak tek başına KVKK uyumu sağlamaz; gerçek veri sorumlusu, amaç, aktarım, saklama ve hak süreçleri gerekir.

## Apple ve mağaza hazırlığı

| Alan | Bugünkü durum | Gerekli kabul |
|---|---|---|
| Native paket | Yerel açılış, HTTPS API, haptics, yaşam döngüsü ve privacy manifest mevcut | Dağıtım arşivi, gerçek cihaz/erişilebilirlik/ağ kesintisi ve arşivde SDK-veri doğrulaması |
| Hesap/veri | İsteğe bağlı ölçüm ve sahip korumaları mevcut | Güvenli tüm ilerleme aktarımı, misafir dahil hesap silme, kurtarma |
| Sosyal güvenlik | Arkadaş/Arena adları mevcut | İçerik filtresi, bildir/engelle ve yanıt veren işletim |
| Destek | 0.36.5 rapor hazırlama/kopyalama | Yayın öncesi gerçek ulaşılabilir destek kanalı, Support URL; TestFlight için gerçek feedback e-postası |
| Gizlilik | Teknik envanter ve taslak var | Gerçek yayıncıya uygun metin, uygulama/mağaza URL'leri, saklama/imha ve App Privacy beyanı |
| Giriş | E-posta/misafir ve web sağlayıcıları | Game Center isteğe bağlı ürün geliştirmesi; sunulan üçüncü taraf girişe göre 4.8 değerlendirmesi |
| İçerik/haklar | Genel kitle hedefi | Gerçek özelliklere göre yaş anketi; görsel/font/ses/metin ve marka/karakter hak envanteri; Kids veya 4+ varsayımı yok |
| Ticari/dağıtım | Cihaz geliştirme imzası var | Ücretli Developer Program, App Store Connect, sözleşme/iletişim/export alanları, beta incelemesi ve inceleme erişimi |

İşlevsiz gönder düğmesi veya sahte e-posta çözüm değildir. Destek taslağı şimdiden hazırlanabilir; mağaza yayını öncesinde gerçek kanal bağlanmalıdır. İzleme yapılmıyorsa sırf uygulama olduğu için ATT penceresi eklenmez; eklenen reklam/analiz SDK'sının gerçek veri kullanımı belirleyicidir. Dijital satış kararı alınırsa uygulanabilir StoreKit/mağaza kuralları ayrıca değerlendirilir.

[Apple Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [Misafir dahil hesap silme](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion) · [İnceleme ve destek](https://developer.apple.com/app-store/review/) · [Veri kullanımı](https://developer.apple.com/app-store/user-privacy-and-data-use/) · [KVKK aydınlatma yükümlülüğü](https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-)

## Kişisel TestFlight → şirket yayını

**Öneri: aynı Apple Developer üyeliğini bireyselden kuruluşa dönüştürmek.** Bireysel ücretli üyelikle TestFlight başlanabilir; ücretsiz Xcode kişisel cihaz imzası buna eşdeğer değildir. TestFlight beta dağıtımı, herkese açık App Store yayını değildir. Dış testçi ilk build'i beta incelemesinden geçer; build'ler 90 gün test edilir.

Şirket kurulunca kurucu/ortak olarak Apple'a üyelik dönüşümü başvurusu yapılabilir. Gerçek tüzel kişilik, D‑U‑N‑S ve şirket doğrulaması gerekir; onay ve süre Apple'a aittir. Ltd veya AŞ seçimini oyun tekniği belirlemez. Bireysel mağaza satıcısı kişinin yasal adı, kuruluş satıcısı yasal şirket adıdır. Şirket adıyla ilk mağaza çıkışı isteniyorsa dönüşüm kabul edildikten sonra genel yayına geçmek uygundur.

**Ayrı şirket hesabına uygulama transferi farklıdır.** Apple'ın standart transfer koşullarında en az bir sürümün App Store'da yayımlanmış olması gerekir. Yalnız TestFlight uygulaması bu koşulu sağlamaz. Bu nedenle “betayı kaldırıp başka hesaptan aynı uygulamayı yükleriz” varsayımıyla ilerlenmez. Yeni uygulama/bundle yolu güncelleme ve kayıt sürekliliğini ayrıca ele almayı gerektirir. Yayımlanmış uygulamanın transferinde Game Center/kimlik/iCloud/anahtarlık gibi kullanılan servislerin geçişi ayrıca denetlenir.

App kaydını silmek taşıma yöntemi değildir; yüklenmiş build varsa bundle ID yeniden kullanımı kısıtlanır. TestFlight testini bitirmek ile App Store Connect kaydını silmek ayrıdır. Dönüşüm için oyunu silip yeniden kurmaya dayanan bir plan önerilmez.

[Üyelik dönüşümü](https://developer.apple.com/help/account/membership/updating-your-account-information/) · [Üyelik koşulları](https://developer.apple.com/help/account/membership/program-enrollment/) · [D‑U‑N‑S](https://developer.apple.com/help/account/membership/D-U-N-S) · [TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/) · [Dış testçiler](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/) · [Transfer koşulları](https://developer.apple.com/help/app-store-connect/transfer-an-app/app-transfer-criteria/) · [Uygulama kaydını kaldırma](https://developer.apple.com/help/app-store-connect/create-an-app-record/remove-an-app/)

## Sonraki teslim sırası

1. **Görünür deneyim:** İlk giriş rehberi + dört eski alt ekranın ortak kabuğu; ortak tipografi, yardım ve geri dönüş. Önce/sonra ekranları ve temiz/eski kayıt akışıyla kabul. Kullanıcının önceki öğretici beklentisi teknik küçük işlerin arkasına tekrar itilmemeli.
2. **Oyun bütünlüğü:** Meydan/Gizli Tema final akışı, araçlar ve bitmiş tahta; bütün modlarda aynı girdi/kesinti kabul matrisi. Kaydırma motorunda yalnız tekrarlanabilir kanıta dayalı değişiklik.
3. **Kimlik ve mağaza engelleri:** Eksiksiz kayıt bağlama/kurtarma → gerçek Game Center bağlantısı; hesap silme ve moderasyon. Bunlar sahte UI ile tamamlandı sayılmaz.
4. **TestFlight adayı:** Gerçek cihaz matrisi, privacy/support/yaş/hak dosyası, dağıtım arşivi ve küçük dış testçi grubu. Kullanıcı yönlendirmeden ilk iki bölümü bitirebiliyor mu, doğrulama buna bakar.
5. **Ölçülen büyüme:** Kaliteli yeni bölüm paketleri; ölçüm sonucuna göre küçük ekonomi/reklam denemesi. Teknik test başarısından tutma/gelir artışı çıkarılmaz.
