# 0.50 hazırlığı · Native açılış ve hareket incelemesi

13 Kasım 2026. Sınırlı, salt okunur inceleme; uygulama kodu değiştirilmedi. Başlangıç kaynağı 0.49.0. Fiziksel cihaz veya Game Center hesabı denenmedi.

## 1. Native açılışta boş ekran ve kurtarma boşluğu

Kaynak: `mobile/index.html:1`, `mobile/main.tsx:30`, `components/game/App.tsx:149`. HTML kökü boş ve başlangıç rengi bile dış modül/CSS'nin yüklenmesine bağlı. React'in `game-boot` yüzeyi ancak bütün modül grafiği çalıştıktan sonra gelir. Modül yükleme/ilk render hatası için native kökte hata sınırı veya görünür yeniden deneme yoktur. LaunchScreen'deki mevcut özgün Kt. görseli uygundur; esas eksik onun React'e devridir.

Öneri: HTML içinde bağımlılıksız, aynı renkli kısa açılış yüzeyi; modül yükleme başarısızlığında yalnız yeniden yükleyen okunaklı geri dönüş; React render hatası için sınır. Yeniden yükleme hiçbir localStorage/oturum/ilerleme temizlememeli, otomatik sonsuz tekrar olmamalı. Minimum zamanlı sahte yükleme veya rastgele yüzde eklenmemeli.

Kabul: normal açılışta ilk sahne gelince kapak kaldırılır; modül yüklenmediğinde düğme görünür; render hatasında da düğme çalışır; yeniden açılış mevcut kayıtları aynen okur. Bu kaynak kanıtıdır; beyaz flaşın fiziksel süresi ölçülmedi.

## 2. Etkin harf uçuşu sistem hareket tercihi değişince iptal edilmiyor

Kaynak: `components/game/WordFeedback.tsx:16-28,75-82`. Hareket tercihi layout effect çalıştığında okunuyor; media-query değişimine abone olunmuyor. CSS'nin azaltılmış hareket kuralları Web Animations API uçuşunu iptal etmez. Sonradan yapılan haptik kontrolü titreşimi durdursa da mevcut uçuş zaman aşımına kadar sürebilir. `useResultPresentation.ts:16-24` aynı değişimi zaten dinliyor.

Öneri: mount boyunca matchMedia change dinleyicisi; azaltma etkinleşince mevcut work listesini `clear()` ile iptal et, varış işaretlerini temizle. Tercih geri kapanınca eski uçuş yeniden başlamasın. Gerekirse uygulama tercihi değişimi için ayrı olay veya tercihin effect bağımlılığı kullanılabilir. 720 ms uçuş, mevcut harf gecikmesi, iniş titreşimi ve onay/ödül kuralları değişmemeli.

Kabul: uçuş sırasında reduce-motion değişimi animasyonları, timer ve wordArriving işaretini temizler; eski onfinish haptik üretmez; ayarı kapatma uçuşu tekrar oynatmaz. Mevcut test harness'in `reduced(value)` işlevi yalnız bool değiştiriyor; medya olayı üretme ve animasyon iptalini ayrı sınamak gerekir.

## 3. Game Center ürün açığı; etkin servis olarak sunulmamalı

`GameBridgeViewController.swift:4-6` yalnız Haptics/Sharing kaydeder. GameKit, Game Center entitlement/capability ve oyuncu doğrulama köprüsü yoktur. `Info.plist` içindeki `LSSupportsGameMode` farklı sistem özelliğidir. Apple, Game Center'ın SSO olmadığını açıkça söylüyor: mevcut Arena hesabı/ilerleme sahibi bununla otomatik değiştirilmemeli. [Apple yapılandırması](https://developer.apple.com/documentation/gamekit/initializing-and-configuring-game-center), [oyuncu doğrulaması](https://developer.apple.com/documentation/gamekit/authenticating-a-player).

En küçük güvenli hazırlık: `GameCenterPlugin.swift`, CAPBridgedPlugin, `jsName=GameCenter`; yalnız status/authenticate/openDashboard. Tüm yöntemler `KTGameCenterEnabled=false` Info.plist kapısıyla pasif başlasın; bu halde Apple UI veya sahte bağlı durum gösterilmesin. Gerçek etkinleştirmede Apple App ID/Game Center ayarı, yetkili provisioning ve imzalı `com.apple.developer.game-center` entitlement doğrulanmalı. iOS'un public Security başlıklarında bulunmayan SecTask API'leriyle runtime entitlement okuma eklenmemeli.

`GameBridgeViewController.capacitorDidLoad()` içinde registerPluginInstance eklenir. Xcode dosyasında GameSharing gibi dört giriş gerekir: PBXBuildFile, PBXFileReference, App PBXGroup children ve PBXSourcesBuildPhase. Swift GameKit import'u sistem framework'ünü kullanır; üçüncü parti SDK gerekli değildir.

Auth: ana thread, tek uçuş, bir otomatik deneme/uygulama açılışı; foreground ve bağlı presenter koşulu; sunulan Apple VC yalnız geçerli istek hâlâ bekliyorsa gösterilir. Sonuç durumları: notConfigured/authenticated/cancelled/unavailable/busy/timedOut. Timeout/cancel settle-once; geç callback yeniden panel açmaz; iptal/hata otomatik prompt döngüsü oluşturmaz. Tekrar yalnız açık kullanıcı eylemiyle. Solo açılışı bu sonucu beklememeli. Kimlik anahtarı veya Game Center takma adı Arena kullanıcı kimliği olarak yazılmamalı. Sadece gerekli auth/restriction durumlarını döndürmek yeterlidir.

Dashboard: yalnız ana menü/profilde açık eylem. `GKAccessPoint.shared.parentWindow` geçerli oyun penceresine bağlanır; `isPresentingGameCenter` kontrol edilir; `trigger(handler:)` kullanılır. Güncel Xcode SDK'sında GKGameCenterViewController iOS26'dan itibaren deprecated; GKAccessPoint iOS14+ destekli. Handler **gösterim sonrasında** çağrılır, kapanış bildirimi değildir: sonucu `opened` olarak adlandır, buradan oyunu resume etme. Gelecekte kapanış gerekirse observable `isPresentingGameCenter` izlenebilir. [Apple dashboard API](https://developer.apple.com/documentation/gamekit/gkaccesspoint/trigger(handler:)).

Kabul: false bayrakta hiçbir Apple prompt yok; status çağrısı prompt açmaz; mükerrer çağrı tek UI; iptal/gecikmiş yanıt ilerlemeyi değiştirmez. Native derleme ayrı, gerçek Game Center oturum/iptal/hesap değişimi kabulü ayrı yapılır. Bu hazırlık App Store/TestFlight hizmetinin etkin olduğu veya fiziksel kabulün geçtiği anlamına gelmez.

## Uygulama sonrası sınırlı ikinci inceleme

Parent tarafından eklenen native açılış/elle yeniden deneme ekranı ve React kök hata geri dönüşü kayıtları temizlemiyor. WordFeedback artık işletim sistemi hareket tercihini ve uygulamanın data-reduce-motion değişimini dinleyip mevcut WAAPI uçuşlarını iptal ediyor; mevcut consume-ledger ve stop/idempotency düzeni korunmuş. Game Center kaydı dört pbxproj konumuna ve köprüye eklenmiş, Info.plist kapısı false; Arena kimliği aktarılmıyor.

Etkinleştirmeden önce kalan iki somut yaşam döngüsü riski:

1. `ios/App/App/GameCenterPlugin.swift:36` içindeki attempted kapısı otomatik denemeye ek olarak kullanıcının açık tekrar denemesini de engelliyor. İlk iptal/zaman aşımı/handler sırasında meşgul sunucu durumundan sonra düğme uygulama kapanana kadar signedOut döndürür. Automatic/interactive çağrıyı ayır; yalnız otomatik deneme sayısını sınırla. Yeni açık denemede request token kullanılmalı, eski callback yeni isteği bitirmemeli.
2. `ios/App/App/GameCenterPlugin.swift:70` dashboard açma çağrısı bir pending slot ayırmıyor ve süre sınırı taşımıyor. Sunum callback'i gelmezse JS düğmesi busy durumunda kalır; native sunum durumu değişmeden gelen birden çok çağrı da yalnız UI busy kontrolüne dayanır. Dashboard'u token ile tek uçuş ve sınırlı bekleme/tek sonuç davranışına bağla; completion opened anlamını koru.

Bunlar false yapılandırma kapısıyla mevcut oyunda çalışmayan yollardır. Kod incelemesidir; gerçek Apple oturumu/cihaz davranışı test edilmiş değildir. Kaynak kodda değişiklik yapmadım.
