# 0.51 sonrası native hazırlık incelemesi

Başlangıç: `be10b96`, paket 0.51.0. Koordinatörün sınırlı görevi: açılış, cold/warm davet yönlendirmesi, native form davranışı ve yayın dosyası. Uygulama kodu salt okunur; bu günlük dışında yazılmadı. Telefon, kurulum, dağıtım, alan adı veya TestFlight işlemi yapılmadı. Kök sözleşme, rol sözleşmesi, sürüm/harita/öncelikler ve son uyumluluk günlüğü okundu. `mobile-game-quality` yönteminin küçük kapsam, kayıt koruma ve cihaz kanıtını ayırma ilkeleri kullanıldı.

## 1. Açılış katmanı React ilk commitinde kayboluyor

**Kanıt:** `mobile/index.html:5–20` içinde karanlık başlangıç ve 15 saniye hata yolu zaten var; fakat `#native-boot`, React'in devraldığı `#root` altında. `mobile/main.tsx:31` ilk renderda bu düğümü kaldırır. Timeout, düğüm yoksa sessiz döner; React henüz anlamlı ekranı hazırlamasa da koruma bitmiş olur. `components/game/App.tsx:95–99,152–153` yerel kayıt okuması sonrası `ready` kullanır. `.game-boot` mevcut kaynakta krem değildir; `app/game-shell.css:83` rengi `#142f3c`tir. Splash PNG koyu yeşil Kt., HTML başka ton ve K simgesi, React başka ton ve Kt. sunar.

**Native boş yüzey:** `capacitor.config.ts:3–6` backgroundColor belirtmiyor. Kurulu Capacitor 8.5.3 `CAPBridgeViewController.swift:308–314`, ayar yoksa hem WKWebView hem scrollView için `UIColor.systemBackground` kullanıyor. `SceneDelegate.swift:10–12` yeni UIWindow oluşturuyor, onun da sabit rengi yok. Yeni plugin gerekmez.

**En küçük öneri:**

- `capacitor.config.ts` genel `backgroundColor` ve `SceneDelegate.window.backgroundColor` aynı karanlık renk olsun. LaunchScreen storyboard arka planı da aynı sabit renk olsun; mevcut PNG kullanılacaksa onun zeminine uydurulsun veya imageView yerine aynı renkte sade native marka kullanılsın.
- HTML boot'u React root'un kardeşi yap; başlangıçta root'u görünmez/etkileşimsiz tut. `ready=true` commitinden sonra, çizim fırsatı veren çift `requestAnimationFrame` sonunda boot kapansın. Bu olay bulut hesabını veya interneti beklemesin.
- Timeout ve yakalanmamış ilk render hatası aynı root-dışı katmanda görünür hata/yeniden dene sunsun. Hata sonrası geç gelen ready olayı hata ekranını gizlemesin. Başarıda timer ve dinleyiciler temizlensin. React ağacı üzerinde `replaceChildren` ile React dışı değişiklik yapılmasın.
- Sıradan bir görsel/yan ekran hata olayı, başarılı oyun açıldıktan sonra oyunu yeniden boot'a düşürmesin.

**Kabul:** geciktirilmiş React mount; ready=false sonrası timeout; başarılı ready sonrası timeout olmaması; timeout sonrası geç ready; ilk render exception; çevrimdışı yerel kayıt okuması; reload öncesi/sonrası mevcut kayıtların aynı kalması. Üç başlangıç aşamasında ekranın açık renge dönmediği simülatör kaydıyla ayrıca görülmeli. Kaynak incelemesi beyaz flaşın cihazda gözlendiği iddiası değildir.

## 2. Native cold/warm URL olayları JS'e bağlanmamış

**Kanıt:** `SceneDelegate.swift:14–22` üç olayı doğru olarak `SceneDelegateProxy`'ye iletiyor. `GameBridgeViewController.swift:4–7` üç mevcut plugini kaydediyor; burada yeni URL proxy gerekmez. `mobile/main.tsx:15–29` yalnız appStateChange dinliyor, appUrlOpen/getLaunchUrl yok. `App.tsx:97` ilk search'i okuyor, `App.tsx:113` popstate ile ekranı geri kuruyor. Mevcut paylaşım kodu `lib/platform/sharing.ts:11–17` oda için 8, arkadaş/meydan için 10 karakterlik `[A-HJ-NP-Z2-9]` kodu üretiyor.

**Kurulu SDK davranışı doğrulandı:** `@capacitor/ios/Capacitor/Capacitor/CAPSceneDelegateProxy.swift` cold URL'yi ilk capacitorViewDidAppear'a erteler; ardından hem SceneDelegateProxy.lastURL hem ApplicationDelegateProxy.lastURL doldurulur. `@capacitor/app/ios/Sources/AppPlugin/AppPlugin.swift` URL olaylarını retainUntilConsumed=true saklar, getLaunchUrl son URL'yi döndürür.

**En küçük öneri:** saf allowlist parser ve küçük bootstrap adaptörü. Yalnız mevcut `GAME_ORIGIN` ile tam eşleşen HTTPS origin, `/` yolu ve tek geçerli `oda`/`arkadas`/`meydan` daveti kabul edilsin. Kullanıcı bilgisi, başka port/host/protokol/path, belirsiz çoklu veya tekrar parametreler reddedilsin; token/oobCode/return_to gibi kimlik parametreleri taşınmasın. Native origin'e yalnız temizlenmiş relative search uygulanıp mevcut popstate restorasyonu çalıştırılsın; dış URL'ye navigate edilmesin.

Önce appUrlOpen listener kaydedilsin, sonra getLaunchUrl alınsın. Aynı cold olayın iki kaynaktan gelmesi tekilleştirilsin; daha yeni warm olaydan sonra eski launch yanıtı uygulanmasın. Aynı daveti ileride yeniden açmak kalıcı Set ile engellenmesin. URL main render öncesi gelirse history güncellemesi ilk route okumasına yeter; sonrasında popstate çalışmalı. Açık oyun ve modal durumları için yeni URL'nin neyi kapattığı açık olsun; progress/reset/hesap değişikliği yapılmasın.

**Kabul:** üç davet türü, cold event+launch duplicate, launch gecikmesi sırasında yeni warm event, aynı daveti daha sonra tekrar açma, başka domain/credentials/path/scheme ve bozuk/çoklu kodların etkisiz kalması; açık Solo kaydı ve aktif hesap sahipliğinin değişmemesi.

**Yetki/bilgi sınırı:** bu kod Team ID, yeni alan adı ve AASA olmadan hazırlanabilir. Associated Domains, AASA ve Apple takımına bağlı Universal Links etkinliği ayrı karardır. İç handler testinin geçmesi, HTTPS bağlantısının kurulu uygulamayı açtığını kanıtlamaz. Mevcut Game Center false bayrağına dokunulmaz.

## 3. Form davranışı ve yayın envanterinin doğru sınırı

`mobile/native.css:1` callout'u body'de kapatıyor, input/textarea'da geri açıyor; genel metin seçimi ve minimum native kontrol yazı boyutu normalize edilmiyor. Küçük düzeltme yalnız native scope'ta yapılmalı: buton/oyun yazılarında seçim/tap highlight bastırılabilir; input/textarea ve contenteditable'da `user-select:text` ve normal callout korunmalı. Metin/email/password/search, select ve textarea için 16 px minimum yazı iOS otomatik odak zoomunu önlemeye yöneliktir; checkbox/range boyutlarına ve 44 px dokunma alanlarına dokunulmamalı. Native select'i erişilebilirliksiz özel menüye dönüştürmek gerekli değildir. Kod girişlerinde spellCheck=false/autoCorrect=off mevcut uppercase/uzunluk doğrulamasını tamamlar. Klavye açıldığında form kaydırması korunmalı; global scrollEnabled=false yapılmamalı.

**Destek:** `SupportReport.tsx:14–18,23–30` yalnız taslak/kopya yapar ve bunu açıklar; gerçek gelen kutusu yok. E-posta/yayıncı bilgisi gelmeden çalışan destek kanalı iddia edilemez, uydurma adres veya otomatik gönderim eklenemez. Bilgi beklerken yerel taslak akışı, doğrulanmış bilgiyle açılan koşullu iletişim yapılandırması ve release kontrolü hazırlanabilir; saklama süresi/yanıt süresi uydurulamaz.

**Manifest yanlış pozitiflerini düzeltme:** Contacts kaldırılmamalı: Apple'ın güncel tanımı social graph'ı da kapsıyor ve oyunda arkadaş grafiği var. CustomerSupport da yalnız SupportReport'a bakılarak kaldırılmamalı: `lib/game/safety-service.ts:7–9` reporter_id, target_id, reason, name_snapshot ile gerçek oyuncu raporu saklıyor; `docs/app-store-readiness.md` mevcut kategoriyi bu moderasyon yoluna dayandırıyor. Yerel destek taslağı toplanmıyor, sunucu güvenlik raporu toplanıyor ayrımı envanterde açık yazılmalı. CustomerSupport/OtherUserContent sınıflaması yayın beyanının bağlamında gözden geçirilebilir; bugün otomatik silme kanıtı yok. Üçüncü taraf arşiv manifest raporu/ağ denetimi yerine yalnız app xcprivacy dosyasının geçerli plist olması sunulamaz.

Güncel birincil kaynak: [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) (14 Kasım 2026 erişim; Contacts social graph, cihazda kalan veri ve destek kategorisi tanımları kontrol edildi).

## Mevcut araçlarla dar doğrulama

`xcode-select -p` mevcut `/Applications/Xcode.app/Contents/Developer` kurulumunu gösterdi. `idb` ve `maestro` kurulu değil; gerekmez. Projede `tests/ios-edge/EdgeQA.xcodeproj` XCTest UI altyapısı ve `scripts/verify-ios-edge.mjs` ayrı `com.kelimeteneffusu.edgeqa` / `sharingqa` paketleriyle zaten mevcut. Bunlar mevcut edge/sharing senaryolarını sınar; yeni startup/deeplink senaryosu eklenmeden bu yeni davranışları doğrulamaz.

Bu incelemede sandbox içi `xcrun simctl list devices available` CoreSimulatorService bağlantısı ve log izinleri nedeniyle başarısız oldu. Bu sonuç kurulu runtime yoktur kanıtı değildir; koordinatör izinli host ortamından tekrarlayabilir. Simülatör kurulumu/başlatması bu rol tarafından yapılmadı.

Önerilen koordinatör kontrolleri:

1. Saf parser/bootstrap/timeout için hedefli Node testleri; yeni bağımlılık gerekmez.
2. `pnpm mobile:build`, `pnpm exec cap sync ios`, `pnpm mobile:check`; paket eşitliği bozulmadan derleme.
3. `xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/kt-native-review CODE_SIGNING_ALLOWED=NO build` (çalıştırılmadı).
4. Açık, ayrı bir iPhone simülatöründe mevcut `node scripts/verify-ios-edge.mjs <UDID> edge` / `sharing` yardımcıları; startup/form senaryosu için aynı XCTest altyapısına ayrı senaryo. Gerçek uygulamanın veya telefonun kayıt deposu kullanılmaz.
5. İç URL handler testi AASA olmadan yapılabilir; `simctl openurl` ile gerçek HTTPS Universal Link testi ancak alan adı/takım ilişkilendirmesi tamamlanırsa anlamlıdır. Sırf testi açmak için kalıcı custom scheme eklenmez.

Tam test paketi, mobil build, Xcode build veya UI testi bu uzman tarafından çalıştırılmadı. Kod değişikliği ve son diff kabulü koordinatöre aittir.

## Koordinatörün ilk uygulama diffi — sınırlı ikinci inceleme

14 Kasım 2026: root-dışı boot, `kt-game-ready`, allowlist/adapter, SceneDelegate rengi ve Arena entry anahtarı incelendi. Aşağıdaki somut sınırlar koordinatöre iletildi:

1. **Timeout sonrası geç ready hata ekranını kaldırıyordu.** `mobile/index.html` ready dinleyicisi koşulsuzdu. Koordinatör inceleme sırasında `hasFailed` korumasını ekledi. Güncel inline script Node VM içinde timeout→ready sırasıyla çalıştırıldı: hata/retry önce görünür, geç ready sonrasında da görünür. Bu bulgu yeni kaynakta kapandı; gerçek WKWebView görsel testi değildir.
2. **Warm davetlerde yalnız Arena remount yeterli değildi.** Aktif `Challenges.view` varken yeni `meydan` prop'u yalnız kod/preview'ı değiştiriyordu; eski tahta ve `onPlaying` durumu kalıyordu. Koordinatör aynı entry anahtarını Challenges'a ekledi. Friends'te kabul edilen davet `join` alanını temizlerken invitation prop'u aynı kaldığı için aynı linki daha sonra açmak effect'i tekrar çalıştırmıyordu; Friends için de entry anahtarı önerildi. Bu kabul, saf URL adaptörü testinin callback sayısından bağımsız gerçek component state sınırıdır.
3. **Açık giriş penceresi eski dönüş adresini koruyordu.** `App.tsx` restore yeni daveti uygularken `authReturn` değişmiyordu. `EntryPanel.onDone` eski authReturn'a location.assign yaptığı için giriş bitince yeni davet kayboluyordu. Formu kapatmadan restore sırasında temizlenmiş mevcut pathname+search ile authReturn güncellemesi önerildi.

`node --experimental-strip-types --experimental-transform-types --test tests/incoming-links.test.ts`: mevcut üç test geçti. Native renk literal'i, Capacitor backgroundColor alanı ve mevcut SceneDelegate köprüsünde kaynak temelli compile engeli bulunmadı. Bu, Xcode build sonucu değildir. Root'un devam eden düzeltmelerinden sonraki son kaynak/uygulama kabulü ayrı doğrulanmalı.

## Ses ve tahta animasyonu — üçüncü sınırlı inceleme

Koordinatörün yeni göreviyle boot/davet, SoundSamples/GameSound ve Board/PlayLayout lifecycle diffi salt okunur incelendi. İlk hedefli `board-interactions`, `sound`, `sound-samples`, `mobile-haptics` grubu: **96 test geçti**. Yeni sample loader geç decode sonucunu dispose sonrasında yayımlamıyor; pending fetch AbortController ile iptal oluyor. BufferSource sesleri mevcut stop/visibility/mute öncelik yoluna katılıyor. Ek somut sample lifecycle hatası bulunmadı; fiziksel ses dinlemesi yapılmadı.

### Bulgu ve kapanış: dönüş, ölçülen tahta geometrisini büyütüyordu

`common.tsx` dönüş sınıfını ölçülen `.letter-board` üzerine ekliyor; CSS transform gerçek yerleşimi değiştirmese de `getBoundingClientRect()` görsel sınırını değiştiriyor. Önceki `viewport.ts:106` bu genişliği tekrar yüksekliğe yazıyordu. Gerçek attachBoardSize helper'ı 300 px layout ve 45 derece dönüşü modelleyen DOM ile çalıştırıldığında ardışık yükseklikler **424, 511, 573, 617 px** oldu. Kaynakta somut geri besleme doğrulandı; ilk model gerçek tarayıcı ölçümü değildir.

Koordinatör `offsetWidth` ile dönüştürülmemiş yerleşim genişliğine geçti. Kendi tamamladığı mobil build ardından mevcut Google Chrome/CDP yardımcısı kullanılarak ayrı localhost origin ve geçici profil üzerinde gerçek paket denendi. API yalnız yerel misafir fixture döndürdü; canlı servis veya oyuncu kaydı kullanılmadı.

- 375×667 önizleme, 18 ara kare: layout genişlik/yükseklik **359×359 px** sabit. Görsel dönen bbox en yüksek **506 px**, sonrasında359 px. Console exception **0**.
- Ayrı ikinci denemede dönüş aktifliği açıkça beklendi. Touch öncesi `board-turning=true`, görsel bbox **433.27 px**, layout359 px. Gerçek CDP touch pointerdown olayında sınıf **false**, ölçüm359 px oldu.
- Döndürülmüş hedef koordinatlarıyla ilk gerçek sürükleme **1 kelimeyi** kabul etti; sonrasında `data-selecting=false`. Console exception **0**.
- Geçici browser/sunucu kapatıldı. İlk localhost denemesi sandbox EPERM ile açılmadı; aynı izole işlem izinli host çalıştırmasıyla tamamlandı. Kullanıcı tarayıcı profili veya telefon kullanılmadı.

Bu bulgu düzeltme ve gerçek tarayıcı kabulüyle kapandı. Fiziksel cihaz FPS/haptik kabulü değildir.

### Bulgu ve kapanış: isteğe bağlı resim hatası açılışı kalıcı engelliyordu

Global capturing error listener bütün kaynak hatalarını fatal sayıyordu. `hasFailed` eklenince ilk sahne resmi hatası→`kt-game-ready` sırası çalışan oyun üstünde kalıcı yeniden-dene perdesi bırakıyordu. Inline boot scriptinin VM çalıştırmasında `readyAppCoveredByFailure=true` ile tekrar üretildi. Koordinatör listener'ı window script hatası, SCRIPT ve stylesheet LINK ile sınırladı. Yeni `mobile-boot.test.ts` resim hatası, timeout/late-ready, script hatası ve post-ready React crash durumlarını doğruladı; bu bulgu kapandı.

### Doğrulama açığı: yanlış seçim klonu

Board VM harness'ında classList/useLayoutEffect uyumu eklendi, fakat ink DOM stub'ı halen `cloneNode`, `appendChild`, `removeAttribute`, `remove` içermiyordu. Dolayısıyla yeni yanlış seçim dalı mevcut 96 testte çalışmıyordu. Koordinatöre minimal kabul önerildi: gerçek yanlış seçim→tek clone; yeniden seçim/unmount→clone ve timer temizliği; onCommit sayısı ve eski kabul çizgileri değişmezliği. Bu, kaynakta görülmüş oyun çökmesi iddiası değil, yeni imperatif DOM yolunun doğrulama açığıdır.

Sound fixture başlangıçta yalnız oscillator fallback yolunu çalıştırıyordu. Koordinatör decodeAudioData/window.fetch/playbackRate içeren gerçek sample dalı kabulünü ekledi; sample playback, pitched letter, background stop ve onended disconnect geçti. Son dar tekrar `mobile-boot`, `incoming-links`, `sound`, `sound-samples`, `viewport`: **33 test geçti**. Tam paket ve native XCTest bu uzman tarafından tekrarlanmadı.

## Native sonuç ilk boyası — ekran görüntüsü incelemesi

Koordinatörün sağladığı `world-review.nosync/release-052/native-attachments/A4CC19D6-B8E3-41E4-A45E-05DA61CF6966.png` açılıp incelendi. iPhone17 native sonuç görüntüsünde sahne görünürken Tebrikler başlığı ekranın alt kenarında; bu görüntü düzgün sonuç yerleşimi kabulü değildir. XCTest mevcut kodu yalnız `waitForExistence` ile metni bekleyip hemen screenshot alıyor, sonra `next.exists` ile düğmeye dokunuyor. Testin geçmesi başlık/eylemlerin görünür güvenli alan içinde olduğunu kanıtlamıyor; XCTest dokunurken öğeyi kaydırabilir.

Kaynakta doğrulanan açık: `common.tsx:28` Modal açılışını passive `useEffect` üzerinden yapıyor. `app/world-journey.css:26–30` ise `.modal.scenic-outcome.celebration-outcome` için **open koşulu olmadan display:flex** tanımlıyor; böylece kapalı dialog'un UA display:none kuralı geçersizleşiyor. `dialog-frame.css:5` fixed/bottom:auto/margin0 kullanıyor ama ilk top değeri yok. `Solo.tsx` modal'ı görünmez ancak layout yüksekliğini koruyan `.scenic-play.is-celebrating` kardeşi olarak ekliyor. showModal/fit öncesi ilk boyada kapalı dialog'un statik başlangıcı görünmez tahtanın altında olabilir. Görüntüde başlığın yaklaşık854 CSSpx'de/874px yüksekliğin altında olması bu akışla uyumludur; bunun tek neden olduğu native tekrar olmadan kesinleştirilmedi.

Koordinatöre hedefli öneri: Modal açma/fit işini `useLayoutEffect` içine al; `.modal.game-dialog:not([open]){display:none!important}` ile kapalı dialog'u bütün görsel sınıflardan bağımsız gizle. `openGameDialog` içindeki showModal→maxHeight→top hesabı zaten senkron; önce yükseklik veya Safari flex kurallarını genişçe değiştirmek gerekmiyor. Native tekrarın kabulü metin varlığından daha güçlü olmalı: başlık frame'i üst güvenli alandan aşağıda, next düğmesinin frame'i alt güvenli alandan yukarıda ve hittable; içerik kaydırması dış frame'i taşımamalı. Sabit sleep tek başına kabul değildir.

Bu iki düzeltmeden sonra sorun kalırsa sonraki dar teşhis için `dialog.open`, inline top, gerçek rect/offsetHeight ve visualViewport height/offsetTop değerleri alınmalı. Şimdilik kesin Safari flex bug veya yanlış safe-area sayısı iddia edilmedi. Uygulama değiştirilmedi; tam kapılar/native XCTest bu incelemede çalıştırılmadı.

## Yerel hatırlatma ve StoreKit — sınırlı kaynak incelemesi

`GameEngagementPlugin.swift`, `engagement.ts`, `DailyReminder.tsx`, çağıran Solo/DeleteAccount ve ilgili manifest/kayıtlar okundu. Kaynakta otomatik notification permission isteği yok: yalnız açık setReminder(true) eylemi requestAuthorization yapıyor; 19:00 calendar trigger ses alanı eklemiyor. StoreKit çağrısı aktif foreground scene, üç tarih, sürüm tekilliği ve120 gün aralığıyla kapılı. Bunlar kaynağa dayalı bulgular; sistem izin/gerçek review sheet kabulü bu uzman tarafından çalıştırılmadı.

Koordinatöre üç somut sınır iletildi:

1. **Hesap silme sırasında off kaybolabilir.** Native `setReminder` başındaki reminderBusy guard'ı false çağrısını da reddeder. Önceki enable/authorization/add sürerken DeleteAccount'ın `void setDailyReminder(false).catch(()=>{})` çağrısı yutulur; eski enable daha sonra bildirimi planlayabilir. False isteği busy'den bağımsız üstün gelmeli ve native generation'ı geçersizleştirmeli; geç authorization callback'i ekleme yapmamalı, add zaten gönderildiyse completion'da iptal üstünlüğü korunmalı. Generation kontrolleri ana kuyrukta yapılmalı. DeleteAccount kapatmayı await etmeli; başarısızsa hesabın silindiği gerçeği korunarak cihaz hatırlatmasının kapatılamadığı açıklanmalı ve tekrar denenecek cleanup bilgisi korunmalı. Başarısız cleanup ardından erasure bilgisini sessizce silip sayfa değiştirmek uygun değil.
2. **Resume status sonucu yeni kullanıcı tercihini ezebilir.** İzin paneli kapandığında kt-app-resume ayrı status sorgusu açar. Pending request eklenmeden alınmış disabled snapshot, başarılı setReminder sonucundan sonra çözülüp anahtarı Kapalı gösterebilir. Refresh/change ortak generation ve lock kullanmalı; mutation başladığında eski read'ler emekliye ayrılmalı, mutation sırasında gelen refresh sonradan yapılmalı. Change completion için mounted guard gerekir. Mevcut adapter testleri bu gerçek component yarışını yürütmüyor.
3. **Ayrı gün sayımı yalnız cold plugin load'a bağlı.** Üç gün boyunca uygulamayı kapatmadan background/foreground yapan oyuncu tek gün sayılabilir. recordDay ortak helper'ı gerçek foreground dönüşünde çağrılmalı; yalnız requestReview sırasında saymak, review'e uygun milestone olmayan günleri yine kaçırır. Tek sürüm/120gün sınırları korunmalı.

UserDefaults kullanımının manifestte CA92.1 gerekçe kaydıyla eklendiği kaynakta görüldü; mağaza privacy raporu onayı iddia edilmedi. Kod veya test dosyası bu rol tarafından değiştirilmedi; tam kapılar tekrarlanmadı.

## Son açılış kaydı ve Modal odağı — salt okunur inceleme

`release-052/cold-light-10fps.png` ve `cold-dark-10fps.png`, bunları üreten `/tmp/kt052-cold.py`, mevcut kaynak ve build43 kurulu QA bundle metadata'sı incelendi. Yeni build, simülatör çalıştırma veya test başlatılmadı. Mevcut videolar yalnız okunarak ffprobe ve düşük çözünürlüklü raw frame renk analizi yapıldı; uygulama koduna dokunulmadı.

**Kayıt kabul açığı:** script fps10/tile10x8 ve tek output frame ile yalnız ilk8 saniyeyi sunuyor. Light video11.84sn, dark8.503sn. Light ilk yaklaşık4sn eski Bölüm2 yüzeyi, sonra SpringBoard; siyah açılış yaklaşık7.3sn'de başlıyor ve teal yaklaşık11sn'de geliyor, bunların sonu contact-sheet dışında. Dark yaklaşık1.3–5.3sn siyah,5.5sn'den sonra teal. Scriptte launchToStopSeconds; recorder kapanışı ve ffmpeg üretiminden sonra ölçülüyor (light13.37/dark9.39sn), dolayısıyla ilk oyun karesine kadar süre ölçümü değil. Kaydın başındaki eski görüntü/simülatör gecikmesi de launch zamanıyla hizalanmıyor. Tam video sayfalanmalı veya son kısım ayrı okunmalı; gelecek ölçümde launch öncesi/sonrası/kayıt-stop zamanları ayrı yazılıp ilk oyun karesine kadar kayıt sürmeli. Bu incelemede yeniden kayıt yapılmadı.

**Kaynak/paket bulgusu:** Info.plist UILaunchStoryboardName=LaunchScreen, derlenmiş LaunchScreen.storyboardc ve Assets.car kurulu QA build43 içinde var; capacitor.config.json backgroundColor=#123b45. LaunchScreen arka planı, SceneDelegate window ve Capacitor prepareWebView'un webview/scrollview arka planı sabit koyu renkte. WebView CAPBridgeViewController.loadView içinde kurulduktan sonra view=webView oluyor; yerel HTML de html/body/native-boot için aynı koyu rengi kullanıyor. Bu kayıttaki siyahı doğrudan açıklayan eksik renk ataması gösterilemedi. Siyah, HTML boot metni görünmeden önceki launch/host döneminde; kaynak incelemesi bunun yalnız simulator/disk veya kesin WKWebView hatası olduğunu kanıtlamaz. Diskte294MiB boş alan görüldü; gecikme için güçlü karıştırıcı, kanıtlanmış neden değil. Siyah kayıttan “başarılı tek renk açılış” kabulü çıkarılmamalı.

Tek küçük görsel uyumsuzluk sürüyor: LaunchScreen tam ekran opak Splash görseli eski yeşil Kt logo; altındaki yeni #123b45 arka planını kapatıyor. HTML K işareti ve #123b45 ile birebir görsel eşleşme yok; bu eski asset siyah dönemi açıklamıyor. Tek renk/tek marka geçişi isteniyorsa mevcut Splash asset'i aynı palet/işaretle hizalanmalı, sırf bu video nedeniyle yeni plugin/splash geciktirme eklenmemeli.

**Modal:** common.tsx28 now useLayoutEffect sırasıyla openGameDialog→fit→h2.focus(preventScroll) yapıyor; h2 tabIndex=-1, title-change focus ayrı opt-in. Helper kapanırken önceki odağı geri veriyor; fallback tab tuzağı h2'den ilk/son eyleme geçiyor. focused-journey.css207 daha sonra import edilerek yalnız okuma başlığının focus outline'ını kaldırıyor; düğmelerin focus-visible göstergesi korunuyor. Bu değişiklikte somut odak/keyboard regression bulunmadı. Native VoiceOver kabulü çalıştırılmadı.
