# iOS paketli istemci: güvenilirlik incelemesi

3 Kasım 2026. Salt okunur kaynak incelemesi; uygulama kodu değiştirilmedi. Başlangıç kaynağı koordinatörün açtığı `72294023f7fc80ec479413ac03ebccc9e0d42bc5` (0.28.1). Kullanıcı artık iOS test uygulamasını yetkilendirdi; Apple Developer hesabı henüz yok. Aşağıdakiler çalıştırılmış cihaz kanıtı değildir.

## 1. Öncelik 1: API taşıması, kimlik ve canlı akış aynı değişiklik değildir

**Kaynak:** `lib/auth/firebase-client.ts:9,27-34,58`; `components/auth/EntryPanel.tsx:10-11`; `lib/auth/guest.ts:3-10`; `lib/auth/server.ts:16-30`; `app/api/game/route.ts:26-28`; `components/game/useLiveRoom.ts:13-32`; `app/api/live/route.ts:15-34`.

Mevcut istemci aynı kökte `/api/` ister. Misafir oturumu `__Host-kt-player`, Secure/HttpOnly/SameSite=Lax cookie ile doğrulanır; yazan uçlar tam aynı Origin şartı arar. Paketli `capacitor://localhost` istemcisinde yalnız API adresini değiştirmek, cookie/CORS/Origin koşullarını karşılamaz. Canlı oda `fetch` yanıtını ReadableStream olarak parça parça okur; JSON için kullanılan native HTTP köprüsünün aynı streaming/abort davranışını sağladığı varsayılamaz. Capacitor belgeleri tüm fetch/XHR patch'inin isteğe bağlı olduğunu belirtir; otomatik global patch en az riskli seçim değildir.

**Öneri:** Yerel varlıkları paketleyip API erişimini tek, dar taşıma sınırından geçir. Üretim HTTPS origin'i sabit/izinli olsun; geliştirici adresi yayın paketinde bulunmasın. JSON istekleri için native HTTP seçiliyorsa cookie kalıcılığı, iptal, timeout ve yalnız `/api/` izinleri ayrı doğrulansın. Başka hosta token/cookie/Authorization gönderilmesin; oai kimlik başlıkları istemciden üretilmesin. `requireSameOrigin` kaldırılmasın, CORS `*` açılmasın. SSE webde korunmalı; native için streaming kanıtlanana kadar mevcut `room` okumasıyla açıkça tasarlanmış, görünürlükte duran ve hız sınırına uyan polling daha sınırlı bir alternatiftir. `publicAuthConfig`, misafir giriş/çıkış, katalog/tahta okumaları ve telemetry içindeki düz fetch'ler de taşıma kapsamına alınmalı. ChatGPT giriş bağlantısı paket içi göreli URL olarak bırakılmamalı; desteklenmeyen giriş sessizce çalışıyor gibi sunulmamalı.

**Kabul testi 1:** Paketli uygulamada misafir oluştur → kimliği ve oda kodunu kaydet → uygulamayı kapat/aç → aynı kimlikle aynı odanın doğrulanmış durumunu al. Yeni cookie üretme/çift misafir olmamalı. İki istemci aynı tahta/revizyonu görmeli; arka plan→ön plan sonrası eski yanıtlardan skor/oda değişmemeli. Ek güvenlik denetimi: başka Origin yazması 403 kalmalı, başka host isteği taşıma tarafından reddedilmeli. Native HTTP'nin iptal/timeout davranışı gerçek runtime'da ayrıca sınanmalı.

## 2. Öncelik 1: Safari kaydı ile kurulu uygulamanın kimliği kendiliğinden birleşmez

**Kaynak:** `components/game/App.tsx:63-74`; `lib/game/progress-sync.ts:42-67`; `lib/auth/guest.ts:15-16`; `components/auth/EntryPanel.tsx:11`; `lib/game/server.ts:56,120-127`.

İlerleme `kelime-teneffusu-v2:<owner>` ve `:last-user` anahtarlarıyla ayrılır. Yeni misafir oturumu yeni UUID üretir. Arena'nın tekrar engeli `arena_seen.user_id` üzerinden çalışır; yalnız solo JSON içe aktarmak aynı oyuncunun Arena geçmişini taşımaz. Hesap değişince App bilinçli olarak farklı sahibin kaydına geçer; bu sınır native geçiş kolaylığı için kaldırılmamalı.

**Öneri:** Aynı doğrulanmış kalıcı hesapla giriş en dar aktarım yolu; gerçek sağlayıcı hazır değilse hazırmış gibi sunma. Misafir aktarımı isteniyorsa sunucuda kısa ömürlü/tek kullanımlık, eski oturuma bağlı ve açık kullanıcı eylemiyle oluşturulan bir geçiş tasarlanmalı; yeni kimliğe sadece görünür ad kopyalanmamalı. Oturum cookie'sini JSON'a, URL'ye, günlüğe veya localStorage'a dışa aktarmak çözüm değildir. İlk yerel prototip yalnız solo dosya aktarımı sunarsa bunun Arena kimliği/geçmişi taşımadığını açıkça belirt ve tam geçiş kabulünü açık bırak.

**Kabul testi 2:** Eski hesaptan kısmi normal bölüm + tamamlanmış/ödüllü bölüm + oynanmış Arena bulmacasıyla uygulamaya geç. Bölüm/tahta SHA'ları, bulunan kelimeler, en iyi yıldız/süre ve ödüller değişmemeli; aynı sunucu oyuncusunun eski Arena içerikleri yeni odada dışlanmalı. Farklı hesap, süresi dolmuş veya ikinci kez kullanılan aktarım başka sahibin kaydını açamamalı. Kaynak tarayıcı kaydı silinmemeli; başarısız aktarım uygulamanın mevcut kaydını değiştirmemeli.

## 3. Öncelik 2: Web kurulumu ve yaşam döngüsü paketli uygulamada ayrılmalı

**Kaynak:** `components/game/Platform.tsx:14-31`; `components/game/useCloudProgress.ts:11-18`; `components/game/Solo.tsx:74-75`; `components/game/Board.tsx:33-35`; `lib/game/haptics.ts:1-9`; `lib/studio/releases.ts:1-30`; `app/page.tsx:1-4`.

GameApp istemci ağırlıklı; başlıca server prop'u yayın kataloğu. Katalog ve temel sahne/tahta varlıkları yerel paketlenebilir, böylece uzaktaki siteyi başlatma URL'si yapmak gerekmez. Ancak Platform şu anda PWA service worker kurar ve Safari ana ekran önerisi gösterir; bunlar native pakette gereksiz/yanlış. Kaydetme, yarım seçimi bırakma ve duraklatma DOM görünürlük olaylarına bağlıdır. Uygulama yaşam döngüsünde aynı olayların gerçekten geldiği doğrulanmalı. Haptics için hazır adaptör sınırı vardır; oyun kurallarını değiştirmeden native geri bildirim bağlanabilir.

**Öneri:** Native giriş dosyası mevcut GameApp, stil ve kataloğu kullansın; sunucu/DB kodu istemci paketine girmesin. Native işaretini sunum/adapter seçimi için kullan, sunucu kimliği olarak kullanma. PWA install/SW akışını native'de kapat. Uygulama arka planında ses/seçim/stream kaynaklarını kapat, ön planda sahiplik ve güncel oda durumunu yeniden doğrula. Yerel kayıt ilk önce kalıcı olsun; son ağ gönderiminin işletim sistemi tarafından tamamlanacağı varsayılmasın.

**Kabul testi 3:** Temiz kurulumdan sonra ilk kez uçak modunda ana yolculuk ve paketli normal/bilmeceli bölüm açılabilsin. Bir kelime bul, uygulamayı arka plana al, kapat/aç ve aynı board/kelimeyle devam et; yarım sürükleme temizlensin, tekrar ödül verilmesin. Çevrimdışıyken Arena açık bağlantı gereksinimi göstersin; hayalet bağlı durumu olmasın. Tekrar çevrimiçi açılışta yerel ve sunucu ilerleme birleşsin, gecikmiş eski hesap yanıtı uygulanmasın. Native pakette Safari kurulum önerisi ve service-worker güncelleme çağrısı bulunmasın.

## Doğrulama sınırı ve dayanaklar

Bu incelemede gerçek iPhone, simülatör, native HTTP cookie deposu, SSE/polling, performans, ses veya haptik çalıştırılmadı. Kaynakta çalışan web sözleşmesi saptandı; native sonuçlar koordinatörün derleme ve cihaz kanıtına bağlıdır. İlk 120 ana bölüm ve içerik uyumluluğu korunmalıdır; App Store'a uygunluk veya WoW üstü kalite bu raporla kanıtlanmış değildir.

- https://capacitorjs.com/docs/apis/http — native HTTP yardımcıları ve isteğe bağlı fetch/XHR patch'i.
- https://capacitorjs.com/docs/apis/cookies — native cookie API'si ve isteğe bağlı document.cookie patch'i.
- https://capacitorjs.com/docs/config — paket/host yapılandırması.
