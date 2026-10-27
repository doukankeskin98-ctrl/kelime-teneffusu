# Geliştirme defteri

## 27 Ekim 2026 · 0.12.3 · Bekleyen bulut kaydından geri dönüş

En güncel Sites helper `258fe66fa71b4b834abf03b6e7699f56ca85a0e4`, Site24/0.12.2 ve GitHub main `00646a4c6d26ae8360e8a5d86149bd691ee75dac`; eş tam ağaç `2f00fe32f8f18845efdf122002f3463c946ea0e9` üzerinden devam. Owner/public ve aynı URL doğrulandı. README/sürüm/harita, rol/öncelikler/son koordinatör kaydı ve ortak bilgi okundu. Tek bağımsız güvenilirlik uzmanı sınırlı kaynak/probe ve son diff incelemesinde; kod/test/yayın koordinatörde. Uygulama öncesi adaylar, gerekçe ve kabul `studio-agents/journal/entries/2026-10-27_maintenance-decision.md` içindedir.

### Bugünün kalıcı iki keşfi

- **Mahalle maçı:** Futbol, Rahat6×6, KALE / FORMA / PAS / GOL; seed `2026102701`, ID `20261027-0001-4000-8000-000000000001`.
- **Sokakta doksanlar:** 90’lar, Dengeli8×8, KASET / WALKMAN / BİLYE / JETON / MİSKET / SEKSEK / MEKTUP; seed `2026102702`, ID `20261027-0002-4000-8000-000000000001`.
- Yeni tek `content/releases/2026-10-27.json` ve sona eklenen RELEASE_BATCHES girişi. Kimlik, spec/hash, sabit board, iki çapraz eğim ve20 alternatif kontrolü. Türkçe/tema/yük incelemesi kaynak düzeyinde; ölçülmüş oyuncu zorluğu iddiası yok. Aynı dosyayı yeniden çalışmada üzerine yazmak yerine mevcut snapshot/kayıt/yayından devam edilir. Ana sayfa/ilgili dünya/arşiv/tarihli damga yolları bu çifti bulur; eski beşli harita kümeleri genişlemez.

### Seçilen davranış ve oyuncu faydası

Gerçek cihaz gözlemi, yanıt vermeyen ana eşitleme ve yeni kozmetik oda karşılaştırıldı. Destekli preview'in önceki ERR_CONNECTION_REFUSED engelinde somut recovery kanıtı yok; alternatif server/browser denenmedi ve aynı başarısız deneme tekrarlanmadı. Doğrudan kanıtlı kayıt beklemesi seçildi. Uzmanın eski gerçek ProgressSync bellek probe'unda hiç çözülmeyen GET/PUT, üç yeni cycle sonrasında da sırasıyla loading/sending ve syncing durumunda kaldı; dispose sinyali iptal etse de callback yok sayınca public promise bitmedi. Bu kaynak kusurudur, canlı kullanıcı olayı veya sağlayıcı testi değildir.

Her load/save callback'i artık8sn deneme sınırında: token/yenileme/HTTP/yanıt gövdesi dahil. Her deneme ayrı controller kullanır, instance dispose aktif attempt'i iptal eder, timer/listener temizlenir. Signal'i dinlemeyen callback bile race sonrası kanalı sürekli kilitlemez. Timeout loaded/ACK üretmez; son yerel kelime ve iyi sonuç korunur. Sonraki olağan veya manuel deneme güncel snapshot ve yeni signal kullanır; geç eski success veya owner-error yeni state/cache/status/ACK/account blokunu değiştirmez. HTTP iptali sunucunun yazıyı kesin geri aldığı anlamına gelmez; mevcut idempotent/best merge korunur. Yoğun anlık retry, çıkış veya reload eklenmez.

**Albüm → ana kayıt satırı:** bulut onayı beklemesi fiziksel bağlantının kesin koptuğu diye anlatılmaz. Ana ilerlemenin cihazda kaldığı ve bulut eşitlemesinin beklediği görünür; **Yeniden eşitle** ilk GET başarısızlığını da anında tekrar dener. Cihaz yazımı başarısızsa sahte başarı yok; owner-blocked durumda bulut yeniden açılmaz ve mevcut local-only kurtarma kalır. Bu metin ayrı ek bölüm/Sprint/aktif tur kaydını kapsamış gibi sunulmaz. Min44px doğal sarılan düğme ve mevcut status alanı, yeni modal yok.

Önceki owner/current/explicit409 ayrımı, cache/load/merge/ACK ve keepalive boyut sınırı korunur. Eski daily/atlas/engine/catalog/legacy, sabit5+1, reward/best, CloudProgress algoritması, DB/uygulanmış göç/manifest/lock aynı kalır. Yeni bağımlılık, ücret, hesap, hizmet, grafik veya zamanlayıcı yok. Son kapı sayıları ve gerçek GitHub/Sites yayın kanıtı `studio-agents/journal/entries/2026-10-27_maintenance-validation.md` içinde tamamlanır. Gerçek telefon/DOM/yerleşim/büyük yazı/ekran okuyucu/FPS/provider timing/concurrent React/iki cihaz/PWA doğrulanmış sayılmaz. App Store hazır veya ölçülmüş tutma/keyif iddiası yok. Haftalık inceleme24Ekim kaydına göre31Ekim/sonraki uygun çalışmada kalır.

## 26 Ekim 2026 · 0.12.2 · Ana ilerlemenin hesap sınırı

Başlangıç güncel Sites helper `262c78ce48d0b2925b9a92bb754e9a6e0a845c62`, başarılı Site23 /0.12.1; owner/public, aynı URL, GitHub main `3e7f595dc8f8039ef7e013c1b7978498b839a1ea` tam ağaç `7686ef09d4ee04db6bd840d43b39ffeb812becba` ile eşleşti. README/sürüm/harita, çalışma sözleşmesi/rol kaydı/öncelikler ve son koordinatör kaydından devam edildi. **Patili komşular** ve **Perde açılıyor** zaten başarıyla yayımlanmıştı; yeni çift veya snapshot üretimi yok.

Gerçek cihaz/görsel kanıtı, ana eşitlemede hesap niyeti sınırı ve kozmetik/keşif odası adaylarından kayıt güvenliği seçildi. Uygulama öncesi kapsam/kabul `studio-agents/journal/entries/2026-10-26_evening-account-decision.md` içinde. Tek bağımsız güvenilirlik uzmanı yalnız kendi evening-account-review günlüğüne yazdı; uygulama/test/yayın koordinatörde. Negatif kanıt: pinlenmiş gerçek route + gerçek CloudProgress/yalıtılmış SQLite kabuğunda actor Bob/beklenen Alice GET200 Bob verisini döndürdü, PUT200 Bob marker'ını değiştirdi. Bu, auth bypass veya canlı veri olayı değildir; stale istemci niyetinin sunucu actor'ına bağlanmadığı kaynak kusurudur. Tam Worker negatif probe'u tamamlanmamış ve sonlandırılmış; kanıt diye sayılmadı.

**Ana eşitleme:** yeni hook her GET query/PUT body'de instance owner'ını taşır. Route mismatch/empty owner'da başka progress verisini döndürmeden/yazmadan409 ve açık PROGRESS_OWNER_CHANGED kodu verir. Doğru owner ve guard alanı olmayan eski istek biçimi çalışır. Bu geriye uyum kararı nedeniyle koruma yeni guard taşıyan istemci içindir; eski istemciye otomatik retrofit sayılmaz. Auth/CSRF/rate/size ve DB/göç korunur. Mevcut concurrency409 kodsuz kalır; sıradan retry gerektiren çakışma hesap-değişti sanılmaz.

**Gecikmiş callback:** class opsiyonel isCurrent predicate'i hook'taki canlı owner ve instance ref'ine bakar; eski instance dispose öncesi de yeni read/current ref'ine, cache/write/status'a dokunmaz. Render sırasında dispose yan etkisi eklenmez. Açık owner hatası o instance için bulut alışverişini durdurur; aynı sahibin yeni yerel discoveries/persist'i sürer. Yeni owner yeni instance ile mevcut load/merge yoluna döner.

**Oyuncunun gördüğü değişiklik:** ana sayfa/Albüm ve Solo, ek bölüm, Gizli Tema, Hızlı Tur/Arena yüzeylerinde Hesap değişti bildirimi vardır. Cihazın ana progress yazımı gerçekten başarılıysa ve oyun dışındaysa Profili yenile eylemi açılır. Yazım başarısızsa bu başarı iddiası yapılmaz; yalnız cihaz kaydını yeniden dene ile persist denenir, yanlış bulut kanalına istek gitmez. Aktif turda reload sunulmaz; turdan çıkınca kullanılacağı açıklanır. Ana Progress'in kaydı, ayrı ek bölüm/Sprint/tüm aktif tur durumunun kaydı diye sunulmaz. Albüm durum metni hesap değişimini çevrimdışı diye anlatmaz.

Son kaynakla **206/206 test /44 grup**, **114 tahta /2280 alternatif**, TypeScript ve üretim build geçti. 16 yeni kabul gerçek route/store/SQLite, gerçek hook request/code/predicate, ProgressSync blocked/local/storage/inactive GET+PUT ve notice eylemlerini kapsar; önceki App gezinme kabulüne shell/oyun inGame kablolaması eklenir. Başlangıç uyumluluk fixture'ında PUT kendi sound tercihini değiştirdiği için sonraki true varsayımı yanlıştı; fixture aynı marker'ı yollayacak şekilde düzeltildi. Son kontrollerde başarısızlık kalmadı. **217 üretim Worker HTTP kontrolü** de son build ile geçti. CI/paket ve gerçek yayın kanıtı koordinatör doğrulama kaydında ayrıca tutulur.

Eski içerikler, motor/tahta, ödül/best/unlock, solo/ek bölüm merge ve kuyruk, cloud merge algoritması, şema/göç/manifest/lock değişmez. Yeni servis, hesap, ücret, bağımlılık, görsel veya zamanlayıcı yok. Önceki preview bağlantı engelinde yeni recovery kanıtı yok; alternatif server/browser veya aynı başarısız erişim denemesi yinelenmedi. Gerçek telefon/DOM/yerleşim/ekran okuyucu/FPS, gerçek cookie-token provider yarışı ve concurrent React doğrulanmadı. Sıradaki öncelik destekli gerçek cihaz, zayıf bağlantı ve iki gerçek hesapla bu geçişi izlemek; App Store hazır oluşu iddiası yok. Haftalık değerlendirme son24Ekim kaydına göre31Ekim/sonraki uygun çalışmada kalır.

## 26 Ekim 2026 · 0.12.1 · Aradan sonra temiz seçim

Güncel Sites helper `7d06e7fc2f50a00fabe79b26e92b39cf00c88d8c`, başarılı 22. sürüm / package 0.12.0 ile başlandı. GitHub main `0a2d81092bc7fc1054da28595bb49a1f20be5b8a`, tam ağaç `9e7caf15901aa873dd3e6491e3cddba7a7cf52c8` eşleşir; owner/public erişimi ve aynı adres korunur. Eski yerel 0.11.3 tabanı kullanılmadı. Gece eklenen ana ekran/yeşim-fildişi tahta/seçili harf/kenar bildirimi ve onaylı günlük sesi değişmeden kalır. Başlangıç/kabul `studio-agents/journal/entries/2026-10-26_maintenance-intake.md`; tek odak uygulama öncesi maintenance-decision kaydında.

### İki yeni kalıcı keşif

- **Patili komşular:** Hayvanlar, Rahat, 6×6, KEDİ / KÖPEK / PATİ / YUVA; seed `2026102601`, ID `20261026-0001-4000-8000-000000000001`.
- **Perde açılıyor:** Dünya Sineması, Dengeli, 8×8, SENARYO / KAMERA / KURGU / SAHNE / AFİŞ / SEANS / REJİ; seed `2026102602`, ID `20261026-0002-4000-8000-000000000001`.
- `content/releases/2026-10-26.json` yeni tek snapshot; RELEASE_BATCHES'e yalnız bir giriş eklendi. İki çapraz eğim, spec/hash, seed/ID ve 20 alternatif yerleşim doğrulanır. Türkçe kelime ve tema uyumu kaynak incelemesiyle değerlendirildi; ölçülmüş oyuncu zorluğu iddia edilmez. Önceki beş tarih/tahta/kelime/seed dosyası aynı. Mevcut ana sayfa, kalıcı arşiv, dünya filtresi ve tarihli damga yolu çifti bulur; eski beşli harita kümeleri genişletilmez.

### Seçilen iyileştirme

Gerçek cihaz gözlemi, input yaşam döngüsü kusuru ve yeni kozmetik keşif odası adaylarından ikinci iş seçildi: doğrudan kaynak/VM kanıtı, düşük maliyet ve kayıt dışı dar etki. Tek sınırlı güvenilirlik uzmanı kendi günlüğünde eski Board gövdesinde global blur/hidden sonrası preview ve pointerup commit'ini doğruladı; son diff'i de inceledi. Bu native cancel üretmeyen kontrollü olay dizisi uygulamadaki eksik korumayı gösterir; fiziksel telefonda gözlenmiş arıza gibi sunulmaz.

**Tahta → başka pencere/sekme/arka plan:** window blur veya yalnız hidden visibility olayı aynı clear yolunu çağırır. Drag, iki-uç ve klavye anchor'ı, bekleyen preview RAF'ı ve seçili harfler temizlenir; eski pointerup kelime göndermez. Yeniden seçim yeni girdiden başlar. Visible olayı tek başına aktif seçimi bozmaz. Listener'lar unmount'ta kaldırılır; ref üzerinden güncel onPreview kullanılır. Kabul edilmiş çizgiler, tahta rect/hit/ölçüleri, saat/ceza/skor/kayıt kuralları değiştirilmez. Günlük/Arena zamanı arada sürer.

**Duraklatma → erişilebilir açıklama:** odak kalmış olsa bile paused etiketi gerçek cursor harfi yerine duraklamayı anlatır. Devamda normal konum/harf ve klavye talimatları döner. Görünür nokta yüzeyi ve tabIndex davranışı korunur; ekran okuyucu anonsu gözlenmedi.

### Doğrulama ve sınırlar

12 yeni gerçek Board TSX/snapLine VM kabulü; global iptaller, pending RAF/stale up, keyboard/tap anchor, visible event, latest callback/unmount, sekiz yön, ters çaprazlar, mouse/touch iki-uç, zoom pan, Escape/native cancel/blur/resize/signature ve paused ARIA. Aynı testler değiştirilmemiş 0.12.0 Board kaynağında **6 başarısız / 6 başarılı**, düzeltilmiş kaynakta **12/12 başarılı**. Bu karşılaştırma yalnız input/markup sözleşmesidir. Bütün paket **190/190 test, 41 grup**, **114 tahta / 2280 alternatif**, TypeScript ve üretim derlemesi geçti. İki bağımsız oyuncuyla **204 üretim Worker HTTP kontrolü** de geçti. CI ve tam kaynak/yayın kanıtı ayrı koordinatör kaydında tutulur.

Destekli `sites-preview status` stopped döndürdü; önceki ERR_CONNECTION_REFUSED için somut repair/recovery kanıtı yoktu. Aynı tarayıcı denemesi veya alternatif server/browser tekrarlanmadı. DOM/native pointer sırası, React concurrency/StrictMode, gerçek telefon/büyük sistem yazısı, ekran okuyucu, fiziksel PWA ve FPS doğrulanmadı. Bu sınır açık cihaz önceliğidir; dünya standardı, eğlence/tutma, App Store hazır oluşu veya gelir sonucu iddia edilmez. Canlı log örneği 0 olaydır, bütün oturumlara genellenmez.

Yeni ücret, servis, hesap, grafik üretimi, bağımlılık veya zamanlayıcı yok. Önceki bölüm/atlas/ödül, Solo/PublishedPlay ve save kuyruğu/merge, DB/göç/manifest/lock aynı kaldı. Sonraki öncelik destekli gerçek cihaz/önizleme erişimi ve ilk kelime/çapraz/duraklatma/arşiv dönüşü gözlemi; yeni büyük deneyim bunun önüne geçirilmez. Haftalık değerlendirme 24 Ekim kaydına göre 31 Ekim veya sonraki uygun çalışmada yapılır; bugün yinelenmedi.

## 25 Ekim 2026 · 0.12.0 · Dokunulan bir keşif

Kullanıcının skill odaklı görsel/oynanış isteği: game-ui-ux ve layout-and-flow, game-feel ve feedback-recipes okunarak mevcut React/TypeScript SVG/CSS yüzeyinde uygulandı. Kalıcı skill push'ı önceki turda başarısız olduğundan korunmuş kaynak kopyaları çalışma rehberi olarak kullanıldı. Motor/dependency, hesap, kayıt, kelime, tohum ve ödül değişikliği yok.

Ana sayfada gerçek yıldız/keşif/dünya birikimi, daha kısa resimli giriş ve doğrudan sıradaki bölüm eylemi. Oyun ekranında yeşim zemin, fildişi harf yüzeyi ve belirgin kontrast. Seçilen harfler aynı preview hücrelerinden türetilen renk/ölçek tepkisi verir; hit koordinatları değişmez. Normal buluşlar alt kenar bildirimi, son kelime büyük kutlama kullanır. Günlük buluş sesi yalnız başarılı sunucu yanıtından sonra çalar. Hareket azaltma, büyük yazıda doğal akış ve ipucu kartlarının iki yüzlü boyut koruması sürer.

Tek sınırlı deneyim incelemesi: grid positioning ve Sprint başlık kontrastı bulguları düzeltildi. 178 test, TypeScript, 112 tahta/2240 alternatif, üretim derlemesi başarılı. Worker HTTP 200 kontrolü ve final paket doğrulaması yayın kaydında. Destekli preview yine ERR_CONNECTION_REFUSED; DOM, gerçek telefon, büyük yazı piksel ölçümü ve FPS gözlenmedi. Dünya standardı, retansiyon veya eğlence başarısı kanıtlanmış sayılmaz.


## 25 Ekim 2026 · 0.11.3 · Keşiflerine aynı yerden dön

Güncel Sites helper `965a4bea9af80d347bfaab8cca630ba02a0c8bc1`, sürüm 20, owner/public erişimi ve GitHub main `8bf758e73367f9bb07dcac76e92c0164968997da` aynı tam ağaçla açıldı. Bugünün **Kıyıda bir gün** / **Efsanelerin kapısı** çifti zaten yayımlanmış; snapshot/kimlik/tohum/kelimeler değişmedi. Kök sözleşme, güncel README/sürüm/harita, öncelik ve son günlükten devam edildi.

Arşiv dönüşü, gerçek cihaz kanıtı ve yeni keşif odası adaylarından, açık öncelik ve doğrudan kaynak kanıtı nedeniyle ilk iş seçildi. Kabul uygulamadan önce `studio-agents/journal/entries/2026-10-25_archive-decision.md` içine yazıldı. Tek sınırlı güvenilirlik uzmanı ilk kaynak/VM incelemesini ve son diff kontrolünü yürüttü; uygulama ve yayın koordinatörde.

**Oyuncunun gördüğü değişiklik:** Ana sayfadaki bölüm arşivinden açıp geri döndüğünde arşiv yeniden açılır; Albümde tarih seçip oynadıysa aynı tarih penceresi geri gelir. Dünya filtresi kendi temasında kalır. Yüklenen eski sayfalar ve çiftin companion özetleri aynı oturum belleğinde durur; ilk sayfa ağ yanıtı bunları silmez. Seçilen karta yeniden odak/nearest scroll istenir. Sonuçtan çiftin diğer bölümüne geçiş ilk dönüş hedefini korur. Doğrudan ana sayfa kartı arşiv açmaz; Solo, Gizli Tema, Hızlı Tur veya yeni gezinme eski dönüş niyetini temizler. Son nokta bağımsız incelemenin yakaladığı somut ek kusurdu ve kabul testine eklendi.

**Katalog güvenilirliği:** Başarısız sayfa kendi offset'iyle denenir; başarılı aralık korunur. Reconnect ilk sayfayı birleştirir. Yeni ön bölümler sayısal offset'i kaydırmışsa overlap üzerinden düzeltilir; yeni ilk sayfayla hiç örtüşme yoksa yeni içerik boşluğu yüklenebilir kalır, eski kartlar yine kaybolmaz. İptal edilmiş/geç yanıtlar istek nesliyle yok sayılır. API'nin ilk sayfası gelmeden bir kart seçilmişse dönüşte görünür özetler korunur ve eksik ilk sayfa tamamlanır. Yeni kalıcı cache/DB biçimi yoktur; mevcut ilk-sayfa cihaz cache'i korunur.

Taşınan snapshot yalnız public katalog metaverisi, köken/hesap/filtre ve dönüş hedefidir; private kart değerleri, earned bayrağı, playable tahta veya save taşınmaz. Sahip/köken/koleksiyon/tema/seçili kimlik uyuşmazlığı reddedilir; ilerleme mevcut sahibin hook'uyla yeniden okunur. Sekme yenilemesi veya OS kapanmasında gezinme konumu kalıcılığı iddia edilmez. Önceki kayıt kuyruğu, Solo birleşimi, rekor, ödül ve sabit atlas kümeleri değiştirilmedi.

13 yeni gerçek hook/bileşen VM kabulü: iki sayfa ve devam imleci, çevrimdışı dönüş, ilk yanıt öncesi seçim, aynı sayfa retry, reconnect/ön ek/boşluk, stale/abort/unmount, eski cache, Albüm tarihi, sahip/filtre ayrımı, odak/scroll hedef çağrısı ve gerçek App related/doğrudan/dünya/bağımsız mod dönüşleri. Bunlar DOM, React concurrency/StrictMode veya telefon testi değildir. **178/178 test, 39 grup**, **112 tahta/2240 alternatif**, TypeScript, üretim build ve iki bağımsız oyuncuyla **200 Worker HTTP** geçti; kanıt son koordinatör kaydında tutulur; GitHub CI/tam ağaç eşleşmesi ve gerçek Sites yayın cevabı ayrıca gereklidir. Yeni ücret, hesap, bağımlılık, görsel üretimi veya zamanlayıcı yok. Sıradaki öncelik destekli gerçek cihaz/ilk açılış ve bu dönüşün büyük yazı/dokunma gözlemidir; preview toparlanma kanıtı bulunmadığından alternatif yol denenmedi.

## 25 Ekim 2026 · 0.11.2 · İpucu Avı kartlarının alanını koru

Başlangıç güncel Sites helper kaynağı `bb33a116f8d7adb859890b5edbd8942d54526e60` / başarılı 19. sürüm ve public sahip erişimi; GitHub main `84cc59ea6cf970723f3464de6a047a243e472cb2`, eş ağaç `eaff7e5546b31b9fe371ba94ac8797955690b7eb`. Bugünün **Kıyıda bir gün** ve **Efsanelerin kapısı** çifti zaten yayında; yeni çift eklenmedi. Önceki kayıt/açılış düzeltmesi aynı kaldı.

Önceki deneyim incelemesinden kalan somut sorun seçildi: hedef bulununca tanım sınıfı ve uzun metin kayboluyor, kart/ızgara küçülebiliyor ve PlayLayout yeniden ölçümü tahtayı değiştirebiliyordu. Arşiv dönüşü ve gerçek cihaz kanıtı diğer adaylar; yeni büyük özellik veya geniş araştırma tekrarı yapılmadı. Uygulama öncesi kabul `studio-agents/journal/entries/2026-10-25_clue-layout-decision.md` içinde.

**Oyun ekranı → İpucu Avı:** kartın `clue-tag` türü artık tamamlamadan bağımsız. Tanım/harf sayısı ve cevap aynı intrinsic grid alanında her iki durumda da ölçüye katılır; yalnız görünür yüz değişir. Böylece kısa tanımın uzun cevabı için de yer önceden ayrılır. Sabit metin yüksekliği, kırpma ve iç scroll yoktur; büyük yazı doğal sarılır. Bulunmamış cevap inline `visibility:hidden` ve `aria-hidden=true`; erişilebilir kart adı yalnız tanımı/harf sayısını içerir. Harf sayısı bileşenin açık kuralıyla ayrı satırdadır. Normal çok parçalı kelimeler, Altın Kelime ve bulunmuş renk/hareket tercihleri korunur.

**165/165 test, 37 grup**, **112 tahta / 2240 alternatif**, TypeScript, son üretim derlemesi ve iki bağımsız oyunculu **200 Worker HTTP kontrolü** geçti. Dört yeni gerçek WordList markup sözleşmesi, tüm 26 İpucu Avı bölümünün durumlarını, gizli/erişilebilir yüzleri, uzun metin ve normal parçalı/golden davranışını denetler. Bu testler CSS piksel geometrisi ölçmez. Paylaşılan bileşen değiştiği için tüm regresyonlar ve son build/HTTP doğrulandı; içerik/tahta/atlas/Progress/ödül/kayıt kuyruğu/DB/göç/manifest başlangıçla aynı. Yeni bağımlılık, servis, görsel üretimi, harcama veya zamanlayıcı yok.

Tek sınırlı uzman son kaynak/erişilebilirlik incelemesi yaptı. Açık harf sayısı satır kuralı önerisi uygulandı; başlangıçtaki olası bitişme uyarısı gözlenmiş üretim kusuru sayılmadı. Son inceleme engel bulmadı. Gerçek DOM, telefon, büyük sistem yazısı, ekran okuyucu ve FPS doğrulanmadı; önceki preview engelinde toparlanma kanıtı yok, başka browser/server denenmedi. Sıradaki odak arşivden dönüş bağlamını koruma; gerçek cihaz doğrulaması açık kalır. CI/tam kaynak eşleşmesi/birleştirme ve aynı adrese Sites yayını gerçek araç sonuçlarıyla ayrıca doğrulanır.

## 25 Ekim 2026 · 0.11.1 · Beklemeden keşfe dön

Başlangıç en güncel Sites kaynağı `d3dfeb4a91453c56e15b1cf1a947434bc5a875f7`, başarılı 18. sürüm, aynı public adres ve sahip erişimi; GitHub main `69d219b217d02764b8721bb674e9c4285aeda7db`. Eski yerel 0.8.4 paketi kullanılmadı. Güncel 0.9/0.10/0.11 mobil düzeni, Hızlı Tur ve atlas devamı korundu. Root sözleşmesi, rol ve son doğrulama/öncelikler okundu; iki sınırlı bağımsız inceleme yalnız ayrılmış günlüklerine yazdı. Uygulama/yayın tek koordinatörde kaldı.

### İki kalıcı bölüm

- **Kıyıda bir gün:** Dünya Turu, Rahat, 6×6; KUM, ADA, KIYI, DALGA. Tohum `2026102501`, kimlik `20261025-0001-4000-8000-000000000001`.
- **Efsanelerin kapısı:** Mitoloji, Dengeli, 8×8; ZEUS, HERA, HERMES, ATHENA, APOLLON, ARTEMİS, ATLAS. Tohum `2026102502`, kimlik `20261025-0002-4000-8000-000000000001`.
- `content/releases/2026-10-25.json` tek değişmez snapshot'tır. İki çapraz eğim, temizlenmiş spec/hash ve 20 alternatif kontrolü geçer. Mevcut ana sayfa, kalıcı arşiv, tarihli damga ve dünya filtresi bu çifti bulur. Önceki dört tarih dosyası ve harita kümeleri aynı kalır. Yeniden çalışmada mevcut çift çoğaltılmaz.

### Seçim ve yapılan davranış

Üç aday: doğrulanmış cihaz tahtasında ağ beklemesi; mobil hedef görünürlüğü/İpucu Avı kart yüksekliği; arşiv dönüş bağlamı. Kullanıcının iç kelime kaydırması şikayeti 0.9 kaynak düzeninde giderilmiş; aynı yenileme tekrarlanmadı ve cihazda doğrulanmış gibi sunulmadı. İki uzman da hâlâ açık indirilmiş bölüm bekleyişini önceliklendirdi. Uygulama öncesi kabul `studio-agents/journal/entries/2026-10-25_maintenance-decision.md` içinde.

- **Çevrimdışı hazır → aç:** yalnız kimlik/hash/spec/yolları eşleşen cihaz tahtasıyla hemen Solo açılır; seri tahta/progress GET'leri atlanır. Hesap varsa mevcut beklenen sahip korumalı merge PUT'u arka planda başlar. İlk indirme/bozuk cache mevcut cold yol, açık hata ve yeniden denemede kalır. Cold özel okumada da beklenen sahip kontrolü vardır.
- **Geç hesap onayı:** aynı kuyruk/nesil ayrı resume snapshot'ı verir. Solo key/tur sıfırlanmaz; functional merge ve functional yeni seçim yeni/diğer cihaz kelimelerini birlikte korur. Süre güncel state'e performans tick farkı eklediği için yüksek bulut süresinden geriye dönmez; Daily sunucu saati ayrı kalır.
- **Tekrar / rekor / yardım:** tekrar turu tarihsel snapshot'ı almaz; eski iyi sonuç kuyruk/cihazda saklanır. İlk cached turda hesap tabanı kesin değilse yeni kişisel rekor iddiası kapalıdır; sonraki tekrar onaylı başlangıçla karşılaştırabilir. Yüklenen kelimeye sahte buluş animasyonu verilmez; yardım açıkken sonuç penceresi üstüne binmez.
- **Korunanlar:** hesap değişimi iptali, geç eski yanıtı yok sayma, aynı sekmede son kayıt drain'i, token/HTTP/JSON deadline'ı, depolama uyarısı ve çevrimdışı yeniden deneme. Yeni endpoint, tablo, göç, bağımlılık, grafik üretimi, ücretli hizmet veya zamanlayıcı yok.

### Kanıt ve sonraki iş

**161/161 test, 36 grup**, **112 tahta / 2240 alternatif**, TypeScript, son Sites üretim derlemesi ve iki bağımsız oyuncuyla **200 Worker HTTP kontrolü** geçti. Dört yeni PublishedPlay bağlantı ve sekiz gerçek Solo gövdesi senaryosu eklendi; önceki 12 kuyruk kabulü korunarak eski cached bekleme varsayımı anında açılışa, cold timeout ayrı fixture'a taşındı. Yalıtılmış hook/IO/zamanlayıcı kabuğunda eski 0.11.0 Solo sekiz yeni kabulün beşinde, eski PublishedPlay seçilmiş iki açılış/birleşim kabulünün ikisinde başarısız oldu; düzeltilmiş kaynakta geçti. Bu VM'ler DOM, React eşzamanlı/StrictMode veya telefon kanıtı değildir.

Worker yanlış/boş beklenen sahipte özel okumayı reddeder, doğru sahipte kayıt verir; eski istemci biçimleri çalışır. Yeni iki bölümün ana sayfa/arşiv/API/dünya filtresi, eski atlas snapshotları, hesap/misafir, bulut birleşimi, arkadaş/Arena, kayıt ve çevrimdışı regresyonları da geçti. Eski yayın dosyaları, motor/katalog/klasik/atlas içerik, ödül/harita/Progress kuralları, veritabanı/göçler ve hosting manifesti başlangıçla aynı. Son bağımsız dar inceleme yeni engel bulmadı.

Erişilebilen üretim hata günlüğü örneği boş döndü; tüm oyuncu oturumları için hatasızlık kanıtı sayılmaz. Destekli preview ERR_CONNECTION_REFUSED sonrasında toparlanma kanıtı yok; başka browser/server denenmedi. Gerçek telefon, ekran okuyucu, fiziksel çevrimdışı PWA ve FPS doğrulanmadı. Cached açılış başına tek başlangıç PUT'u mevcut 40/dk sınırına tabidir; sekme/OS kapanışında buluta kesin teslim garantisi yoktur. Oyuncu tutma/keyif, gelir veya App Store hazır oluşu iddia edilmez. Sonraki öncelik İpucu Avı hedef/tahta yüksekliğini buluş sırasında sabit tutma ve destekli gerçek cihaz kontrolü; arşiv dönüş konumu açık. GitHub CI/tam ağaç eşleşmesi ve gerçek Sites yayın sonucu bu kayıttan sonra ayrıca doğrulanır.

## 25 Ekim 2026 · 0.11.0 · Keşif atlasının devamı

Kullanıcı üç haritayı bitirdiğini bildirdi. 13 yeni temalı 5+1 harita, toplam 78 bölüm eklendi. İlk üçlü, kimlikler ve 18 mevcut tahta birebir korundu. İlerlemeyle yeni dünya açılır; bitmiş eski üçlü yeni ilk dünyaya önerilir. Yeni bölüm kayıtları v2 Progress ile yerel/bulut doğrulamaya dahildir. Toplam 16 harita, 96 parça/bölüm; sınırsız üretim veya gerçek oyuncu tutma artışı iddia edilmez.

Yeni 26 İpucu Avı bölümü kısa tanım ve harf sayısından kelime bulmayı gerektirir. Tanım yalnız kabul edilmiş kelime bulununca cevaba döner; erişilebilir etiket cevabı sızdırmaz. Yeni tahtalar 6–9 hücre, dört ila altı hedeftir. Hareketli bulut/yıldız, hacimli duraklar, seçili hedef alanı ve koleksiyon göstergesiyle harita baştan düzenlendi, ana ekranın ilk oyun alanına taşındı. Bölüm sonu gerçek sıradaki keşfin adını gösterir ve gerektiğinde yeni dünyaya geçirir.

Kabul edilmiş kelime tahtada adıyla kısa animasyon gösterir. Son kelimeden sonra 650ms görünürlük; azaltılmış harekette beklemeden sonuç. Daha önce bulunan çizgiler yüklenirken yeniden canlandırılmaz. Yeni mod yardımında tanım oyunu açıklanır. Tahta üzerindeki efekt yerleşim veya seçim koordinatlarını değiştirmez; hedefler açık kalır.

Referans ilkeleri: Dream Games resmi Royal Match dünya/alan ilerlemesi ve tutarlı sanat; PeopleFun resmi Wordscapes kelime keşfi ve sakin sahneleri. Varlık kopyası veya yeni ücretli servis yok. Mevcut SVG sistemi, tek uygulama sahibi ve iki sınırlı ajan incelemesi kullanıldı. Kapsam ve kabul atlas-intake; kaynak/kayıt incelemesi atlas-reliability; doğrulama atlas-validation günlüğündedir.

## 25 Ekim 2026 · 0.10.0 · Oynanış, dünyalar ve arkadaşlar

Önceki görsel yenilemenin ötesinde isteğe bağlı Hızlı Tur eklendi: 3 saniye hazırlık, 60 saniye oyun, 6×6 tahtada dört kelime, 7 saniye seri penceresi, en fazla ×3 çarpan, tamamlanan tahta için 100 puan ve yeni tahta. Yanlış seçim seriyi sıfırlar; süre arka planda devam eder. Sonuç gerçek puan, kelime, tahta ve en uzun seriyi gösterir. Cihaz rekoru hesap anahtarıyla ayrılır; bulut ilerlemesi, ödül veya rekabetçi derecelere yazılmaz.

Tarihli kaynak bölümler dünya kartlarının toplamına ve ilgili dünyanın bölüm penceresine katılır. API temayı sayfalamadan önce filtreler, bütün arşivden sayar ve damga çiftinin eksik eşini özet olarak taşır. Aynı tema çifti 24 kayıt sınırında bölünse de bağlantı korunur. Son eklenenler yalnız isteğe bağlı özet alanıdır. Eski kimlikler, tohumlar, kelimeler, beşli keşif haritaları ve tamamlamalar korunur. Tema üzerinden bölümden dönünce dünya penceresi tekrar açılır.

Arkadaşlar; ekip araması, haftalık lig ve maç geçmişi sekmeleri, görünür davet kodu/paylaş/odaya dön adımları, boş/yükleniyor/hata/yeniden dene durumlarıyla yenilendi. Var olan aktif oda yeni arkadaş daveti sanılmaz. Mutasyon başarısı ile yenileme hatası ayrılır; hesap değişiminde bileşen yeniden açılır. Sunucu oturum, oda, izin ve sonuç kuralları korunur.

Tek özgün ada illüstrasyonu WebP olarak 173 KB'a indirildi. Hareketli yıldız, süre halkası, seri çubuğu, puan geri bildirimi ve geri sayım eklendi. Azaltılmış hareket desteği var. İki sınırlı uzman incelemesi yapıldı; uygulama ve yayın tek koordinatörde. Yeni servis, bağımlılık veya zamanlayıcı yok.

Doğrulama sonuçları ortak sürüm günlüğünde. Önizleme bağlantısı önceki denemede reddedildi; toparlanma kanıtı olmadan alternatif yol denenmedi. Gerçek telefon, görsel sığma, FPS, oyuncu keyfi/tutma artışı ve App Store hazır oluşu doğrulanmış sayılmaz.

## 25 Ekim 2026 · 0.9.0 · Mobil oyun deneyimi

Kullanıcının profesyonel mobil UI/UX isteği öncelik oldu. İki sınırlı uzman incelemesi, tek uygulama sahibi. Kelime listesindeki 133px iç kaydırma kaldırıldı; tüm hedef/parçalar açık ızgarada kalır. Ortak PlayLayout kullanılabilir viewport, gerçek içerik yüksekliği ve güvenli alt boşluğa göre tahtayı boyutlar; aşırı kısa ekran/büyük yazıda 22px hücre alt sınırıyla doğal taşma korunur. Büyük harf modu bilinçli kaydırma ve iki uca dokunma davranışını korur. Tahta ölçüsü değişirse seçim temizlenir.

Krem/yeşil/altın kimliği; yuvarlak başlıklar, daha canlı dünya başlangıç kartı, hacimli kontroller, hedef/çizgi geri bildirimi ve hafif sonuç kutlamasıyla yenilendi. Azaltılmış hareket ve kontrast korunur. Oyun motoru, tahta kimlikleri, içerik, ödül, hesap ve kayıt kodu değiştirilmedi. Yeni bağımlılık veya ücretli servis yok.

Destekli preview CLI çalışıyor bildirdi, bulut tarayıcısı ERR_CONNECTION_REFUSED verdi; status aynı adresi bildirdi. Alternatif tarayıcı yolu kullanılmadı. Görsel/gerçek telefon sığması ve FPS doğrulanmadı. Yerel 133 test, 32 tahta/640 alternatif ve tip kontrolü geçti. Son derleme/Worker/CI/yayın kanıtı ortak doğrulama günlüğünde takip edilir.


## 24 Ekim 2026 · 0.8.4 · Son kayıt ve hesap kuyruğu

Güncel Sites kaynağı `4e3e63c8c9df9af590128c21e198c1e16712ffc4`, kayıtlı 14. sürüm ve herkese açık sahip erişimi; GitHub main `4e311d7bea09a784f4fedf612f77de5031fd9db1` kontrol edildi. Bugünün **Parkede küçük mola** ve **Yörüngede bir gün** çifti zaten yayında; dört kaynak yayın dosyası aynen korunur.

Adaylar, seçim ve uygulama öncesi kabul ölçütleri `studio-agents/journal/entries/2026-10-24_evening-coordinator-decision.md` içinde. Açık iki kayıt sorunu, indirilmiş tahtanın açılışı ve arşiv dönüşü karşılaştırıldı. Son tamamlamanın başka cihazda görünmesi ve hesap güvenliği önce geldi. Tek sınırlı güvenilirlik uzmanı tasarım ve son diff'i bağımsız inceledi; aynı deneyim taraması/araştırması tekrarlanmadı. Koordinatör kod, test ve yayının tek sahibi kaldı.

### Oyuncuda değişen davranış

- **Tarihli/ek bölüm → geri dönüş:** ilk kısmi gönderim sürerken son kelimeyi bulup geri dönersen, başarılı ilk yanıtın ardından son tamamlama da aynı hesap için gönderilir. İkinci gönderimde yeni son kayıt oluşması da korunur. Başarısız gönderimde kayıt cihazda kalır; kontrolsüz tekrar döngüsü yoktur.
- **Aynı bölümde hesap değişimi:** eski kanal iptal edilir, yeni hesap ayrı gönderir. Geç eski yanıt veya `finally` yeni kaydı/arayüzü/kilidi değiştiremez. Hesap değişiminin geçiş karesinde eski kayıt veya boş hata yerine hazırlık durumu gösterilir.
- **Uzayan istek:** sekiz saniyelik uygulama sınırı token bekleme, HTTP ve JSON okumayı kapsar. Aktif oyunda sonraki olağan bağlantı/periyodik deneme en son kaydı gönderir. Sunucu beklenen hesapla doğrulanmış kimliği karşılaştırır; değişmiş/yanlış/boş kimlik altında eski snapshot yazılamaz. Alanı olmayan eski istemci isteği geriye uyumludur.
- **Cihaz kaydı:** yazı hemen yapılır, ayrılmış kanalın geç yanıtı da kendi sahibinin mevcut cihaz kaydıyla en iyi sonuç kuralını kullanır. Depolama hatası açık kalır; gerçekten düzeldiğinde durum yenilenir. Oyun içi **Neler değişti? → 0.8.4** bu davranışları anlatır.

### Doğrulama ve sınırlar

**130/130 test, 30 grup**, **32 tahta / 640 alternatif**, TypeScript ve son üretim derlemesi geçti. Son üretim paketiyle iki bağımsız oyunculu **180 Worker HTTP kontrolü** başarılı. Mevcut üç TSX regresyonuna dokuz anlamlı senaryo eklendi: çıkışta son kayıt, hesap/iptal/geç yanıt, zaman aşımı ve tekrar, hata sonrası durma, daha iyi cihaz sonucu, ikinci uçuşta üçüncü kayıt, takılan JSON, cihaz yazma hatası/düzelme ve çevrimdışı dönüş. İlk yeni senaryo kümesi eski 0.8.3 bileşeniyle altı başarısızlık vererek asıl tetikleyicileri yakaladı; düzeltilmiş kaynakta geçti. Bu testler gerçek TSX ve kuyruk gövdesini sahte hook/IO/zamanlayıcıyla çalıştırır; DOM, React eşzamanlı/StrictMode veya telefon testi değildir.

Worker kontrolleri yanlış/boş beklenen sahip ve yetkisiz yazıyı reddeder, diğer oyuncunun kaydını değiştirmez, doğru sahipte ve eski istemci biçiminde kayıt kabul eder. Önceki hesap, misafir, bulut birleştirme, arkadaş odası, Arena, çevrimdışı/önbellek ve sabit harita regresyonları korunur. Eski bölümler/tahtalar/kelimeler, motor, klasik içerik, kayıt/ödül/harita kuralları, veritabanı/göçler ve hosting manifesti başlangıçla aynı. Yeni bağımlılık, ücret veya entegrasyon yoktur.

Bağımsız son inceleme engel bulmadı. Son küçük hazırlık görünümü değişikliği koordinatör tarafından TSX kabulü, tip, tam test, yeniden derleme ve son HTTP paketiyle doğrulandı; bağımsız incelemeye dahilmiş gibi sunulmaz. İlk haftalık değerlendirme `2026-10-24_weekly-review.md` içinde, gerçek erişilebilir 21–24 Ekim kaydı ve eksik cihaz kanıtıyla yapıldı. Sonraki öncelik indirilen tahtayı ağ beklemeden açmak ve geç bulut yanıtını yeni kelimeleri silmeden birleştirmek; ardından arşiv dönüşü ve destekli gerçek cihaz kontrolü.

Destekli önizleme engelinde toparlanma kanıtı yok; alternatif tarayıcı/server denenmedi. Telefon, ekran okuyucu, fiziksel çevrimdışı PWA açılışı ve FPS doğrulanmadı. Sekme kapanması/işletim sistemi sonlandırmasında buluta kesin teslim iddiası yok; cihaz kaydı korunur. Oyuncu tutma, gelir veya deneyim artışı ölçülmedi. App Store/native paket, e-posta sağlayıcısı, reklam ve ödeme bu sürümde kurulmadı. GitHub CI, tam ağaç eşleşmesi ve Sites'in gerçek yayın cevabı ayrıca tamamlanmadan bu yerel kayıt yayın kanıtı değildir.

## 24 Ekim 2026 · 0.8.3 · İlk ajan döngüsü

Kullanıcı `Agent-dosyaları v1(1).zip` ile bakım ve geliştirmede ajan yapısını kullanmamızı istedi. Güncel Sites kaynağı `14e8cceb5f4d7ece7911eba21ab98b5523b254cf`, kayıtlı 13. sürüm, herkese açık sahip erişimi ve GitHub `33b85d16c7291576969ca4914ae15087538603b1` doğrulandı. Bugünün iki bölümü zaten yayımlandı; aynı içerik dosyaları korunur.

Şablon `studio-agents/` altında oyuna uyarlandı. Kök AGENTS, iki uzman rolü, hedef/ölçüt, uygulama rehberi, mevcut göreve bağlı döngü, ortak günlük ve boş başlayan kanıtlı rol hafızaları var. Yeni eklenti/hesap/ücretli servis veya ayrı zamanlama kurulmadı. Koordinatör uygulama ve yayının tek sahibi; iki gerçek alt ajan salt okunur bağımsız inceleme yaptı. Dosya varlığı çalışan süreç veya ürün başarısı gibi sunulmaz.

Deneyim incelemesi açılış beklemesi, kayıt hatasının olumlu simgesi ve arşiv dönüş bağlamını; güvenilirlik incelemesi hata dönüşündeki gönderim eksiği ile iki uçuş/kuyruk sorununu raporladı. Kaynaklı bulgular ve sınırlar `studio-agents/journal/entries/2026-10-24_*review.md`, seçim ve uygulama öncesi kabul ölçütü `2026-10-24_coordinator-decision.md` içindedir.

Seçilen odak: tahta GET'i hata/zaman aşımı verince cihazdaki tamamlanmış kayıt `dirty=false` kaldığı için yeni hamle olmadan buluta gönderilmiyordu. Geri dönüş yolu artık gönderim bekleyen kayıt sayılır; mevcut sahip/generation sınırı ve birleştirme korunur. Aynı kayıt güvenilirliği işinde depolama hatası uyarı simgesi/hata biçimi, uçuş sırasında bekleme simgesi eklenir. İndirilmiş bölümün sekiz saniyeye kadar ağ bekleyişi, uçuş sırasındaki son kaydın kaçması, eski hesap PUT kilidi ve arşiv konumu ayrı açık işlerdir; bu sürüm bunları düzeltmiş sayılmaz.

Yerel sonuç: **121/121 test**, **32 tahta + 640 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. Son paketle iki bağımsız oyunculu **175 Worker HTTP kontrolü** geçti. Üç yeni kalıcı regresyon gerçek TSX gövdesini yalıtılmış hook/IO kabuğunda çalıştırır; yeni hamle olmadan doğru sahipte gönderimi ve bulut onayını beklemeyi denetler. Eski kaynakla iki hata senaryosu başarısız, düzeltilmiş kaynakla üçü başarılı. Bu test DOM, gerçek React eşzamanlı render veya telefon testi değildir. Günlük yayınlar, motor/klasik içerik, ilerleme/harita kuralları ve veritabanı/göçler başlangıçla aynı. Son bağımsız diff incelemesi ve kısa ortak sonuç ajan günlüğünde tutulur. GitHub CI/kaynak eşleşmesi ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Gerçek telefon, ekran okuyucu, tarayıcı çevrimdışı geçişi veya FPS bu tur ölçülmedi. Önceki destekli önizleme engelinde toparlanma kanıtı yok; başka tarayıcı/server yolu denenmedi. Oyuncu tutma veya performans artışı iddiası yoktur. Son üretim hata örneğindeki istemci iptalleri ve varsayılan simge 404'leri takip listesinde; uygulama istisnası görülmemesi tüm oturumlar için başarı garantisi sayılmaz.

## 24 Ekim 2026 · 0.8.2

Güncel Sites kaynağı `acaa1fc2de1fc64bbec85d3fa08cd400b69f9122`, kayıtlı 12. sürüm, herkese açık sahip erişimi ve GitHub `main` başlangıcı `33d9d6f3034e7cec4f190fc0eb68678a589187b3` doğrulandı. 24 Ekim kaynak çifti henüz yok. Önceki sürümün kişisel başlangıç kartı korunuyor.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kartta doğrulanmış çevrimdışı hazırlık | Bağlantı kesildiğinde hangi tarihli/ek bölümün bu cihazda açılacağını önceden bilir. | Seçildi. Yalnız kimliği, hash'i, içeriği ve kelime yolları doğrulanan yerel tahta hazır sayılır; bulut tamamlaması indirme kanıtı değildir. |
| Kelime listesinde yalnız kalanları gösterme | Kalabalık tahtada aramayı kolaylaştırabilir. | Sonraki aday. Temel çevrimdışı erişim belirsizliği daha doğrudan bir sorun; gerçek cihaz gözlemi önce gelir. |
| Yeni keşif odası / iOS prototipi | Kalıcı koleksiyon veya kurulabilir uygulama deneyimini genişletir. | Ayrı aşama. Destekli etkileşim/cihaz doğrulaması olmadan geniş yeni akış eklenmedi. |

### Uygulama öncesi kabul ölçütleri

- **Parkede küçük mola:** Basketbol, Rahat, 6 × 6; POTA, PAS, ŞUT, FİLE. **Yörüngede bir gün:** Uzay, Dengeli, 8 × 8; UYDU, ROKET, KAPSÜL, YÖRÜNGE, MODÜL, İSTASYON, ANTEN. Her ikisinde iki çapraz eğim, geçerli Türkçe yazım ve alternatif yerleşim kontrolü.
- Sabit UTC tarih/sıra kimlikleri ve yeni snapshot: `content/releases/2026-10-24.json`. Dosya yeniden çalışmada yeniden üretilmez; önceki yayınlar, tahta motoru ve beşli harita kümeleri aynı kalır.
- Ana sayfa, arşiv ve Albüm içindeki bölüm kartlarında gerçekten indirilmiş tahta için **Çevrimdışı hazır**. Çevrimdışıyken eksik/bozuk/uyuşmayan tahta için **İnternet gerekli**, açıklama ve devre dışı açma eylemi. Bağlantı gelince mevcut yenileme yolu eylemi yeniden açar.
- Yerel kontrol tamamlanmadan hazır/eksik iddiası yok. Bulut ilerlemesi ve cihaz hazırlığı ayrı tutulur; başka hesaba ait kayıt veya sahte tamamlanma üretilmez. Puan, yıldız, damga ve kayıt birleştirme kuralları değişmez.
- Kartı hazır gösteren doğrulama ile çevrimdışı bölüm açılışı aynı kimlik/hash/içerik kuralını kullanır. Bozuk önbellek veya kapalı depolama hazır sayılmaz. Eski bölüm bir kez çevrimiçi açılarak mevcut indirme yoluyla hazırlanır; yeni indirme/abonelik servisi yok.
- Mevcut testler, güncel içerik denetimi, TypeScript, üretim derlemesi ve iki oyunculu Worker HTTP kontrolleri geçmeden yayın yapılmaz. GitHub ve Sites tam kaynak eşleşmesi korunur.

### Doğrulama ve sıradaki iş

İki bölümün değişmez dosyası oluşturuldu; kimlikleri `20261024-0001-4000-8000-000000000001` ve `20261024-0002-4000-8000-000000000001`, tohumları `2026102401` ve `2026102402`. Katalog, ana sayfa ve arşiv kaydı eklendi. Aynı tarihte yeniden çalışılırsa bu çift korunur ve varsa yarım kalan yayın bu kaynak durumundan sürdürülür.

Kartlara cihaz hazırlığı ve çevrimdışı eksik tahta açıklaması uygulandı. Aynı doğrulama bölüm açılışında da kullanılır; farklı kimlikteki ağ yanıtı kabul edilmez. Hesap veya katalog değiştiğinde eski kart durumu gösterilmez. Bağlantı kesildikten sonra gelen geç bir ağ yanıtı çevrimdışı durumunu yanlışlıkla hata/hazır durumuna çeviremez. Başka sekmedeki önbellek değişikliği/silinmesi ve bağlantı dönüşü mevcut olay dinleyicilerinden güncellenir. Yeni sunucu isteği, göç, ödül, bağımlılık veya ücretli servis yoktur. Metin ve ikon birlikte kullanılır; eksik kart soluklaştırılıp okunmaz hale getirilmez. Bulut ilerlemesi için belirsiz indirme metni kaldırılarak cihaz hazırlığı ayrı gösterilir.

Beş yeni regresyon testi: tamamlanmış kayıt tek başına indirme sayılmaz; yanlış kimlikteki tahta reddedilir; hash/içerik/yol uyuşmazlığı reddedilir; kapalı depolama veya yazma hatası hazır sayılmaz; yeni içerik eklenirken eski arşiv tahtası, hesap ayrımı ve iyi sonuç korunur. Önceki bütün regresyonlar geçerli.

Yerel sonuç: **118/118 test**, **32 tahta + 640 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. Son metin düzenlemesinden sonra etkilenen 15 kart/çevrimdışı testi yeniden geçti ve son üretim paketiyle iki bağımsız oyunculu **175 Worker HTTP kontrolü** başarılı oldu. Önceki üç yayın dosyası, tahta motoru, klasik oyun, standart katalog, ilerleme/harita kuralları ve veritabanı/göçler başlangıç kaynağıyla aynı. GitHub CI, tam kaynak eşleşmesi ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üç saatlik üretim hata günlüğü boş; bu tüm oturumların hatasız olduğuna kanıt değildir. Mevcut Sites yayın görüntüsü ilk öğrenme turunun masaüstü görünümünü gösteriyor; yeni değişikliğin mobil/etkileşim testi sayılmaz. Destekli önizleme durumu kapalı ve önceki kilit sorununda toparlanma kanıtı yok; tekrar tekrar başlatılmadı. Gerçek telefon, ekran okuyucu, FPS ve tarayıcı çevrimdışı geçişi doğrulanmış sayılmaz. Tahta önbelleği testleri, PWA kabuğunun fiziksel cihazda ilk indirme testinin yerine geçmez. Öncelik destekli gerçek iPhone/Android üzerinde ilk karttan oyuna, çevrimdışı bölüm açılışına ve arşive dönüşe kadar doğrulama; ardından izinli oyuncu gözlemi ve iOS dikey prototipi.

## 24 Ekim 2026 · 0.8.1

Başlangıç: en güncel Sites kaynağı `99630ee37b9fdac40922725787e3d155fef7ae6d`, kayıtlı 11. sürüm ve herkese açık sahip erişimi doğrulandı. GitHub `main` başlangıcı `f24d2b7d9d0cf14eb3efd3e9f6a05a9d339ed7f6`; kaynak ağaçları aynı. UTC 23 Ekim'in iki bölümü zaten yayında olduğundan yeni çift üretilmedi. İstanbul'da 24 Ekim'e geçilmiş olması UTC içerik kaydını değiştirmez.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kişisel keşfi ana sayfanın başına alma | Oyuna dönmek için günlük kartları, damgayı ve büyük tanıtım alanını kaydırma ihtiyacını azaltır. | Seçildi. Doğru başla/devam/tekrar hedefi günlük katalogdan önce görünür; mevcut öneri ve kayıt kuralları kullanılır. |
| Arşivde küçük metin ve çizim ölçülerini düzeltme | Tarih, zorluk ve oynama eylemi telefonda daha rahat okunur. | Aynı gezinme işinin parçası olarak seçildi. Sayfa/pencerede en az 11 px tarih, 12 px metaveri, 13 px eylem ve dar ekranda tek sütun. |
| Kişisel keşif odası / yeni gizem mekaniği | Kalıcı ilerlemeyi daha zengin bir deneyime dönüştürür. | Sonraki aşama. Önce mevcut keşfe ulaşma ve gerçek cihaz doğrulaması; yüzeysel yeni ödül veya kalabalık eklenmedi. |
| iOS uygulama prototipi | Kurulum, dokunma ve çevrimdışı akışın mağaza yolunda sınanmasını sağlar. | Xcode/iPhone ve giriş akışı doğrulaması gereken ayrı iş. Native sürüm hazır veya App Store'a uygun iddiası yok. |

### Yapılanlar ve kabul ölçütleri

- **Keşfet → ilk kart:** kişisel sonraki/yarım kalan keşif, gerçek bölüm başlığı, tema ve varsa bulunan kelime sayısı. Tek bir ana eylem mevcut `nextDiscovery` sonucunu açar. Tamamlanmış kayıt yanlışlıkla yarım gösterilmez; tekrar en iyi sonucu korur.
- **Harita / Dünyalar / Arkadaşla oyna:** ilk iki bağlantı sayfadaki gerçek bölümlere, üçüncü düğme mevcut Arena'ya gider. İlk öğrenme turu, Günlük sekmesi, sosyal akışlar ve arşiv korunur.
- Krem/orman yeşili tasarım, önerilen temanın mevcut özgün SVG çizimi, 48 px ana eylemler, dar ekranda tek sütun, görünür klavye odağı ve azaltılmış hareket desteği. Büyük tekrarlı tanıtım ve hızlı seçim alanları tek başlangıç alanında birleştirildi.
- Arşiv kartlarının çizimine doğru `theme-art` sınıfı bağlandı; sınırlı çizim alanı gerçekten uygulanır. Tarih/metaveri/oynama yazıları sayfa ve pencerede aynı okunabilir ölçeği kullanır. Küçük ekranda kartlar bir sütun olur.
- Kartların gerçek yükleniyor/boş/çevrimdışı/hata/yeniden dene durumları, hesap ayrımı ve bölümden dönüş korunur. Yeni ağ isteği, bağımlılık, ödeme, ölçüm, tablo veya göç eklenmedi.
- Eski bölüm kimlikleri, kelimeler, deterministik tahtalar, beşli harita kümeleri ve ödül kuralları değişmedi. Kaynak yayın dosyaları yeniden üretilmedi.
- Bağlı bakım görevinin yönergesine somut etki/kanıt/maliyet/risk önceliklendirmesi, tutarlı tasarım ve tamamlanmış küçük aşamalarla ilerleyen proaktif stüdyo çalışma biçimi eklendi. Zamanlama, mevcut kalite kapıları ve kayıt koruma şartları aynı kaldı. Kesintisiz çalışma garantisi verilmez.

### Doğrulama ve sınırlar

Üretim Worker akışına kişisel başlangıcın günlük katalogdan önce geldiğini ve iki sayfa bağlantısının gerçek hedefleri olduğunu denetleyen iki kabul kontrolü eklendi. Mevcut öneri/başla/devam/tekrar, hesap, misafir, bulut birleştirme, arkadaş, Arena, içerik ve çevrimdışı solo regresyonları korunur.

Yerel sonuç: **113/113 test**, **30 tahta + 600 alternatif yerleşim**, TypeScript ve son üretim derlemesi başarılı. Son paket üzerinde iki bağımsız oyuncuyla **171 üretim Worker HTTP kontrolü** geçti. Kaynak fark kontrolünde eski yayın dosyaları, motor, klasik içerik, katalog, ilerleme ve veritabanı/göçler başlangıçla aynı. Son üç saat için erişilebilir üretim hata günlüğü boş döndü; bu tüm oyuncu oturumlarının hatasız olduğuna kanıt değildir. Özel oyuncu verisi veya izinsiz ölçüm okunmadı. Kaynak ağacı/GitHub CI ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Destekli önizleme bu tur yeniden denendi ancak mevcut Vinext sunucu kilidi (`PID 14`, `/site`, `4173`) nedeniyle başlatılamadı. Önizleme yardımcısı başlatılmış bir önizleme göstermedi. Kilit silinmedi, bilinmeyen süreç durdurulmadı ve başka tarayıcı yolu denenmedi. Gerçek tarayıcı düzeni, telefon dokunması, ekran okuyucu ve FPS doğrulanmış değildir; kaynak/HTTP incelemesi bunların yerine geçmez.

### Sıradaki öncelikler

1. Destekli önizleme/gerçek iPhone ve Android doğrulaması: ilk karttan başlama, yarım oyuna dönüş, çapraz seçim, arşiv, büyük yazı ve çevrimdışı yeniden açılış. Kabul: taşma veya erişilemeyen kontrol yok; bölüm/kayıt/dönüş aynı kalıyor.
2. İzinli ilk oyuncu gözlemlerinden en büyük sürtünmeyi seçme. Kabul: gerçek örnek ve ölçülebilir hedef; uydurma kullanım veya başarı oranı yok.
3. iOS için tek oynanabilir dikey akış: ilk açılış, solo bölüm, kayıt ve geri dönüş. Kabul: gerçek derleme/cihaz doğrulaması; giriş sağlayıcısı veya satın alma bağlanmadan çalışıyor sayılmaz.

## 23 Ekim 2026 · 0.8.0

En güncel Sites kaynağı `f8c047a097196d0262502b2c1f111a5591ad2477`, herkese açık sahip erişimi ve 10. sürüm kontrol edildi. Önceki başarılı yayın `appgdep_6ada6e8c26508191865368588bcdbf2b`; GitHub başlangıcı `e5a8ea97f4583b87216cdeb2b30565021047e8d7`. 23 Ekim dosyası yoktu; iki yeni, değişmez bölüm `content/releases/2026-10-23.json` içine eklendi. Önceki yayın dosyaları korunur.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Albümde kalıcı damga rafı | Oyuncu eski hatıralarını bir yerde görür, kalan keşfi bulur ve bölümden aynı rafa döner. | Seçildi. Önceki sonuç ekranı aşamasını tamamlar. Yalnız gerçek iki tamamlamadan türetilir, yeni kayıt veya ödül talebi yoktur. |
| iOS prototipi ve App Store hazırlığı | Kurulabilir uygulamada dokunma, çevrimdışı kayıt ve giriş sınanabilir. | Bu tur uygulanmadı. Gerçek Xcode/iPhone doğrulaması ve yayın hesabı kurulumu ayrı aşama; çalışan web sürümü korunur. |
| Varsayılan iOS simge adreslerini tamamlama | Ana ekrana ekleme uyumluluğuna yardımcı olabilir. | Küçük 404'ler kaydedildi; temel oynanış arızası kanıtı yok. Cihaz/PWA doğrulamasıyla ele alınacak. |

### Yeni içerik

- **Fırında bir sabah:** Lezzetler, Rahat, 6 × 6, EKMEK, SİMİT, MAYA, PİDE. Tohum `2026102301`, kimlik `20261023-0001-4000-8000-000000000001`.
- **Eski kentin izleri:** Dünya Turu, Dengeli, 8 × 8, MOZAİK, SÜTUN, KEMER, HEYKEL, KİTABE, HARABE, KAZI. Tohum `2026102302`, kimlik `20261023-0002-4000-8000-000000000001`.
- Her tahtada iki çapraz eğim; istenen boyut ve bölüm başına 20 alternatif yerleşim kontrolü. Yeni kelime/tema çifti, ana sayfa kartları ve kalıcı arşivde bulunur.
- Aynı UTC tarihinin yeniden çalışmasında bu dosya yeniden üretilmez. Eksik yayın aynı kimlikler ve snapshotlarla sürdürülür; önceki tarihler değişmez.

### Yapılanlar ve kabul ölçütleri

- **Albüm → Keşif damgaların:** tarihe göre raf; kazanılmış damganın gerçek hatıra penceresi, iki bölümün adları, tamamlanma koşulu ve **Keşifleri aç** eylemi.
- Kalan veya eski bölümler raftaki tarihin penceresinden açılır. Tamamlanan bölüm doğrudan tekrar oyununa, yarım bölüm kendi kaydına gider. Aynı sabit çift bağlamı sonuç ekranına taşınır.
- Raftan açılan bölümden geri dönünce Albüm ve damga alanı korunur. Sonuçtaki geri dönüş yazısı her iki giriş noktası için **Keşiflerine dön** olarak genelleştirildi.
- Tamamlanmış damgalar eski kayıtlardan otomatik görünür; tekrar, yeni tarih veya ek içerik damgayı çoğaltmaz ya da kilitlemez. Beşli dünya kümeleri ve mevcut bonuslar değiştirilmez.
- Yükleniyor, boş, çevrimdışı ve hata durumları mevcut ortak katalog/özel ilerleme okumasını kullanır. Bilinmeyen kayıtta uydurma sayı veya ödül yoktur. Yeniden deneme ve eski tarihler için sayfalama korunur. Yalnız yüklenen tarihler gösterilir; bütün koleksiyon için doğrulanmamış toplam iddiası yoktur.
- Özgün damga SVG'si ve krem/orman yeşili/altın dili; dar ekranda tek sütun, 44 px eylemler, okunur metinli durumlar ve mevcut azaltılmış hareket tercihi. Yeni animasyon, görsel üretimi, bağımlılık veya ücretli hizmet eklenmedi.
- Raf aynı hesaba özel doğrulanmış bölüm kayıtlarını okur. Yeni tablo/göç, ödül bakiyesi, sunucu yazması veya Arena puanı yoktur. Hesap değişiminde önceki yanıtı göstermeme ve cihaz/bulut birleştirme yolu korunur.

### Kontroller ve sınırlar

Tarih büyümesini hesaba katmak için eski damga senaryoları sabit 22 Ekim örneğine bağlandı; bütün arşiv sayfaları testte okunur. Önceki kazanım, hesap ayrımı, çevrimdışı doğrulama, son kelime ve tekrar testleri korunur. Yeni regresyon, yalnız yalıtılmış test belleğindeki sentetik tarihlerle 24 bölüm sınırını aşar; eski damga çiftlerinin kaybolmadığını, sayfada bölünmediğini ve yinelenmediğini doğrular. Üretim içeriğine sahte bölüm eklenmez.

Yerel sonuç: **113/113 test**, **30 tahta + 600 alternatif yerleşim**, TypeScript ve son üretim derlemesi başarılı. İki bağımsız oyuncuyla **169 üretim Worker HTTP kontrolü** geçti. Küçük ekrandaki raf başlığı ve durum metinleri okunur boyuta getirildikten sonra üretim paketi yeniden derlendi ve HTTP akışı bu paketle çalıştırıldı. Önceki yayın JSON'ları, tahta motoru, klasik içerik ve veritabanı göçleri başlangıç kaynağıyla aynıdır. Tam kaynak ağacı/GitHub CI ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üretim günlüklerinde istemci iptalleri ve varsayılan simge/robots adreslerinde 404 vardı; uygulama istisnası kaydı görülmedi. Bu örnek tüm oturumların hatasız olduğu anlamına gelmez. Yetkili oyun oturumu olmadan özel kullanım ölçümleri veya oyuncu verisi okunmadı.

Önceki destekli önizleme erişim engelinin giderildiğine dair kanıt yok; başka tarayıcı veya güvenlik aşma yolu denenmedi. Bu tur gerçek telefon, tarayıcı etkileşimi, ekran okuyucu ve FPS doğrulanmış sayılmaz. Mobil düzen, metin, odak ve dokunma boyutları kaynakta incelenir; bu inceleme gerçek cihaz testinin yerine geçmez.

Sonraki öncelik gerçek iPhone/Android üzerinde albümden bölüme geçiş ve geri dönüş, çapraz seçim, büyük yazı ve çevrimdışı dönüş. Sonra iOS prototipinin giriş/kayıt/çevrimdışı davranışını küçük bir dikey akışta doğrulama. Native paket, Apple ile Giriş, reklam, ödeme veya abonelik henüz uygulanmadı.

## 22 Ekim 2026 · 0.7.1

Güncel Sites kaynağı `3201ab2a4addeb0a57f3eed3a915ee84f6c4bc66`, kayıtlı 9. sürüm ve `appgdep_6ada36fcbb448191b5e70f34f7dfb857` başarılı yayını esas alındı. GitHub başlangıcı `bba457490d84e81503610f411bdf7b36c9ef88c8`. Bugünün **Bir avuç melodi** ve **Robot atölyesi** bölümleri zaten yayında; ikinci çift eklenmedi. Kaynak yayın dosyaları, kimlikler, kelimeler ve sabit tahtalar korunur.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Damga durumunu gerçek bölüm sonucuna bağlama | Oyuncu tamamlamasının kalıcı hedefe nasıl katkı yaptığını hemen görür ve diğer keşfe kolay döner. | Seçildi. Geçerli son kelimeyle güncellenir; eksik/başka hesaptaki kayıt kazanım sayılmaz. |
| Albümde ayrı damga rafı | Hatıraları tek yerde toplar. | Sonraki aşama. Önce sonuçtan hedefe bağlantıyı tamamla; arşivdeki mevcut hatıralar korunur. |
| iOS varsayılan simge adreslerini düzenleme | Ana ekrana ekleme uyumluluğunu iyileştirebilir. | Günlüklerdeki küçük 404'ler kaydedildi; temel oyun hatası kanıtı yok. Gerçek cihaz/PWA kontrolünde ele alınacak. |

### Yapılanlar ve kabul ölçütleri

- Tarihli bir bölüm tamamlanınca sonuç penceresinde **Keşif damgan tamam** veya kalan keşif hedefi görünür. Tamamlanmış gerçek tahta kullanılır; kendi kaydının bulut yanıtını beklemeden son doğru kelime hesaba katılır.
- Diğer bölümün doğrulanmış kaydı eksikse başlığı ve **Diğer keşfi aç** eylemi gösterilir. Oyuncu kendi seçimiyle aynı tarihin diğer bölümüne geçer; sonuç ve geri dönüş eylemleri korunur, otomatik yeni oyun başlatılmaz.
- Sonuç kartında gerçek cihaz/bulut eşitleme durumu da görünür; cihaz kaydı hatası sonuç penceresinde uyarılır. Bulut onayı gelmeden hesabında kayıtlı denmez.
- Diğer kayıt yükleniyor/çevrimdışı/hata durumundaysa bilinmiyor olarak kalır. Eksik bulut bilgisi tamamlandı veya sıfır gibi sunulmaz. Hata/eksik kayıtta yeniden kontrol, bağlantı gelince mevcut otomatik okuma ve çevrimdışı doğrulanmış cihaz kaydı davranışı korunur.
- Ana sayfa, eski tarihli arşiv ve yeniden oyundan aynı sabit çift bağlamı taşınır. Bölüm kimliği, hash, tarih veya içerik eşleşmiyorsa bu sonuç kartı açılmaz. Yönetim panelindeki bağımsız bölümler bu hedefe dahil edilmez.
- Tekrarda aynı hatıra gösterilir; yeni damga veya bakiye kazanıldığı söylenmez. Hız, yıldız veya ipucu şartı yok. Koleksiyon/harita açılışları, bulut yazma ve en iyi kayıt birleştirme yolu değiştirilmedi; Arena derecesi verilmez.
- Aynı özgün SVG damgası, krem/orman yeşili/altın dili, metinli durum ve 44 px eylemler kullanılır. Sonuç penceresinin kaydırma, klavye odağı, geri dönüş ve azaltılmış hareket davranışı korunur.
- Yeni servis, bağımlılık, ücret, tablo veya göç yok. Salt okunan tek ek bölüm metaverisi mevcut hesaba özel toplu uçtan alınır. Hesap değişiminde önceki yanıtın gösterilmemesi önceki kancayla sürer.

### Doğrulama ve sınırlar

Yedi yeni test: doğru çift/hash/içerik sınırı; sahte tamamlama/yol reddi; son kelimeyi bulut onayından önce doğru sayma; iki sıra için doğru diğer hedef; bilinmeyen kayıt durumları; tekrar/ipuçlu oyunda aynı damga; eski arşiv ve gerçek sahip ayrımı. Üretim Worker akışına gerçek tamamlamadan diğer hedef, ardından gerçek ikinci kayıttan tek damga kontrolü eklendi. Önceki testler ve HTTP kontrolleri korunur.

Yerel sonuç: **112/112 test**, **28 tahta + 560 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. İki bağımsız oyuncuyla **165 üretim Worker HTTP kontrolü** geçti. Önceki bütün kaynak bölüm dosyaları, tahta motoru, klasik oyun, içerik ve veritabanı göçleri başlangıç kaynağıyla aynıdır. GitHub ağacı/CI ve gerçek Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üretim günlüklerinde iki istemci iptali ve varsayılan simge/robots adreslerinde 404 vardı; uygulama istisnası kaydı yoktu. Bu sınırlı günlük örneği tüm oyuncu oturumlarının hatasız olduğu anlamına gelmez. İzinli ürün ölçümlerine yetkili oyun oturumu olmadan erişilmedi.

Önceki destekli önizleme erişim engeli için onarım/toparlanma kanıtı yok; başka tarayıcı veya güvenlik aşma yolu denenmedi. Gerçek telefon, tarayıcı etkileşimi, ekran okuyucu ve FPS bu tur doğrulanmadı. Bu sınırla kaynak, servis ve üretim Worker doğrulaması sürdürülür.

Sonraki öncelik iPhone/Android üzerinde seçim, 200% metin, sonuçtan diğer keşfe geçiş ve geri dönüş; ardından Albümde kalıcı damga rafı. Kullanıcıyla iOS/App Store hazırlığı ve gelir modeli konuşuluyor; native paket, Apple hesabı, ödeme/reklam SDK'sı veya abonelik henüz uygulanmadı.

## 22 Ekim 2026 · 0.7.0

Güncel Sites kaynağı `edc2a77eb91fc9f1c08336399d14606be80072fe`, herkese açık sahip erişimi ve 8. sürüm kontrol edildi. GitHub `main` başlangıcı `480360f7bb92bee3a18becec0766e6d22345009a`. Önceki iki tarihli bölüm değişmeden korunur; 22 Ekim girdisi yoktu. Yeni, değişmez kayıt `content/releases/2026-10-22.json` olarak eklendi. Aynı tarihin yeniden çalışmasında bu dosya ve sabit kimlikler kullanılacak.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Tarihin iki keşfini bir kalıcı damgaya bağlama | Açık, ulaşılabilir küçük hedef ve eski keşiflere dönmek için anlamlı bir hatıra sağlar. | Seçildi. Yalnız o tarihin sabit iki kimliğinin gerçek tamamlanmasıyla açılır; tekrar veya yeni içerik çoğaltmaz ve kilitlemez. |
| Arşivde tema filtresi ve arama | Büyüyen içerikte istediği bölümü bulmayı kolaylaştırır. | Dört bölüm varken öncelik değil. Önce tarihe göre anlaşılır gruplama. |
| Dokunmatik toleransı değiştirme | Gerçek yanlış seçimleri azaltabilir. | Önce destekli iPhone/Android gözlemi gerekli. Kanıt olmadan çekirdek seçim davranışı değiştirilmedi. |

### İçerik ve kabul ölçütleri

- **Bir avuç melodi:** Müzik, Rahat, 6 × 6, NOTA, RİTİM, GİTAR, PLAK. Sabit tohum `2026102201`.
- **Robot atölyesi:** Teknoloji, Dengeli, 8 × 8, SENSÖR, YONGA, YAZILIM, BELLEK, ROBOT, İŞLEMCİ, KODLAMA. Sabit tohum `2026102202`.
- Tarih/sıra kimlikleri `20261022-0001-4000-8000-000000000001` ve `20261022-0002-4000-8000-000000000001`. Her iki çapraz eğim, istenen tahta boyutu ve bölüm başına 20 alternatif yerleşim doğrulaması.
- Önceki yayın JSON'u, klasik oyun, standart içerik ve beşli harita kümeleri değiştirilmedi.

### Uygulanan deneyim

- Ana sayfada **İki keşif, bir hatıra** alanı; iki bölümün adları ve gerçek tamamlanma işaretleri. İpucu, yıldız veya hız şartı yok. Tarih kaçırma, süre sonu, ceza veya seri zorunluluğu yok.
- İki tamamlama doğrulanınca **Damganı gör** gerçek kazanımı, tarihini ve iki başlığını gösteren özgün SVG hatıra ekranını açar. Eski tamamlamalar aynı kuralla otomatik tanınır; yeniden kazanıldı iddiası veya ek bakiye yok.
- Kalıcı arşiv tarihe göre gruplanır, her çiftin damgası yanında kalır. Yalnız sabit sıra 1 ve 2 kimlikleri hedefi belirler; sonradan eklenen içerik hedefi büyütemez.
- Yükleniyor, eksik kayıt, çevrimdışı ve hata durumlarında bilinmeyen kayıt sıfır veya kazanılmış ödül gibi sunulmaz. Eksik ilerleme önceki sürümün yeniden kontrol düğmesiyle okunabilir. Doğrulanmış iki cihaz kaydı çevrimdışıyken damgayı göstermeye yeterlidir. İndirilmemiş/önbellekten çıkmış tahtanın çevrimdışı kaydı bilinmiyor olarak kalır.
- Ayrı ödül talebi, yeni sunucu yazması, şema/göç, bağımlılık, ücretli hizmet veya analitik toplama eklenmedi. Damga mevcut hesaba özel, doğrulanmış bölüm kayıtlarından türetilir; Arena derecesi vermez. Hesaplar, arkadaşlar, puanlar ve kazanılmış dünyalar korunur.
- Krem, orman yeşili ve sıcak altın çizgisi; özgün yaprak damgası, metinli durumlar, 44 px eylemler, dar ekranda tek sütun, klavye odağı ve mevcut azaltılmış hareket desteği.
- Bu aşama ana sayfa ve arşivde kalıcı damga gösterimini kapsar. Oyun sonu penceresinde anlık damga bildirimi ve Albüm sekmesinde ayrı damga rafı henüz uygulanmadı; tamamlanmış sayılmaz.

### Kontroller ve sınırlar

Yedi yeni senaryo sabit çift/gruplama, sahte kimlik, eksik kayıt durumları, sahte tamamlama, ipuçlu/yavaş oyun, eski kazanımın korunması, gerçek hesaba özel bulut ve çevrimdışı kayıtları kapsar. Üretim Worker kontrolü ana sayfadaki koşulun ödül vermeden gösterildiğini ve arşivde tarih/sıra bilgisinin korunduğunu denetler. Önceki kayıt birleştirme, hesap/misafir, arkadaş, Arena, arşiv, güvenlik ve PWA regresyonları korunur.

Erişilebilir üretim günlüklerinde uygulama istisnası görülmedi; üç iptal edilmiş istemci isteği ve iki iOS simge araması için 404 vardı. İptaller tek başına veri kaybı veya sunucu hatası kanıtı değildir. Belirli Apple simge boyutunun keşfi sonraki PWA cihaz kontrolünde incelenecek. Gerçek kullanım ölçümlerine yetkili uygulama oturumu olmadan erişilmedi; kullanıcı kimliği taklit edilmedi.

Önceki destekli önizleme bağlantısı/güvenlik engeli için altyapı onarımı veya toparlanma kanıtı yok. Başka tarayıcı yolu denenmedi. Gerçek mobil düzen, fiziksel dokunma, ekran okuyucu ve FPS bu tur doğrulanmış sayılmaz. Kaynak, içerik, servis ve üretim Worker kontrolleri bu sınırla sürdürülür.

Yerel sonuç: **105/105 test**, **28 tahta + 560 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı; iki bağımsız oyuncuyla **160 üretim Worker HTTP kontrolü** geçti. 21 Ekim yayın JSON’u başlangıç kaynağıyla byte düzeyinde aynıdır. Test veritabanı üretimden ayrıdır.

Çıkış kapıları: tam kaynak ağacının GitHub eşleşmesi ve CI; ardından aynı Sites adresine başarılı yayın sonucu. Bu kayıt tek başına yayın kanıtı değildir.

Sonraki öncelik destekli iPhone/Android kontrolünde seçim, 200% metin, arşiv ve damga ekranından dönüş, ana ekrana ekleme. Ardından bir sonraki faydalı adım, gerçek tamamlanma anında damga bilgisini oyun sonucuna bağlamak; yeni içerik mevcut kazanımları genişletmeyecek.

## 21 Ekim 2026 · 0.6.1

Güncel Site kaynağı `605dcca989c7715ac866ac944e6c13b2e60c93a5`, kayıtlı 7. sürüm ve aynı içeriğin önceki başarılı yayını kontrol edildi. Bugünün **Ormanın minik komşuları** ve **Merak laboratuvarı** bölümleri zaten kaynakta ve yayında. Tarihli JSON, kimlikler, kelimeler ve tohumlar değiştirilmedi; ikinci bir çift eklenmedi.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kartlarda gerçek ilerleme ve doğrudan devam/tekrar | Oyuncu neyi bitirdiğini ve nerede kaldığını açmadan görür. | Seçildi. Yarım kart doğru bulunan kelime sayısını, bitmiş kart gerçek yıldız ve en iyi süreyi gösterir. |
| Çok aşamalı harita finali | Koleksiyon için daha uzun bir keşif hedefi sağlayabilir. | Bu tur ertelendi. Önce yeni günlük içerikteki eksik ilerleme geri bildirimini tamamla. |
| Dokunmatik tolerans ayarı | Yanlış son harf seçimini azaltabilir. | Cihaz kanıtı olmadan değiştirilmedi. Destekli tarayıcı/telefon gözlemi bekleniyor. |

### Uygulananlar ve kabul ölçütleri

- Ana sayfa ve her iki ek bölüm kataloğunda **Kaldığın yerden**, **Tamamlandı**, kazanılmış yıldız ve gerçek en iyi süre. Hiç kaydı alınamayan kartta uydurma sıfır veya yeni oyun iddiası yerine **Keşfi aç** ve yükleme/çevrimdışı/hata açıklaması.
- **Bir daha keşfet**, sonuç ekranını tekrar açmak yerine boş bir tur başlatır. Sonraki tekrarlar da güncel en iyi kaydı karşılaştırma temeli olarak kullanır; ödül veya rekabet puanı eklemez.
- Kartlar önce bu hesabın doğrulanmış cihaz tahtasını okuyabilir; bulutla geçerli hedef kimlikleri üzerinden birleştirilir. Başka hesabın cihaz anahtarı okunmaz. Hesap değişiminde istek iptali ve eski yanıtı yok sayma uygulanır.
- Hesaba özel toplu okuma en fazla 24 bölüm kabul eder. İstemciden gelen kullanıcı kimliği kullanılmaz. Taslaklar görünmez; arşivlenmiş, önceden yayımlanmış bölümlerin ilerlemesi korunur. Kart yanıtında yalnız hedef kimlikleri ve sonuç bilgisi vardır; tahta veya koordinatlar verilmez.
- Mevcut bulut kayıtlarına, uygulanan göçlere veya tahta üretimine dokunulmadı. Cihaz anahtarları korunarak ortak önbellek okuma kodu ayrıldı. Yeni bağımlılık veya ücretli hizmet eklenmedi.
- On yeni regresyon senaryosu: doğru devam/bitirme metni, bilinmeyen durum, sahte veri reddi, iki cihaz birleşimi, uzun isim parçaları, hesap ayrımı, bozuk önbellek, özel toplu okuma, istek sınırları ve arşivden ilerleme.

Çıkış kapıları: tüm mevcut testler, içerik denetimi, TypeScript, üretim derlemesi ve üretim Worker HTTP kontrolü. HTTP akışına yetkisiz kart okumasının reddi, gerçek sonuç, `no-store`, kullanıcı taklidi ve istek boyutu kontrolleri eklendi. Önceki destekli önizleme erişim engelini aşacak başka tarayıcı yolu denenmedi; bu tur görsel/telefon/FPS kontrolü yapılmış sayılmaz.

Yerel sonuç: **98/98 test**, **26 tahta + 520 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı; iki bağımsız oyuncuyla **154 üretim Worker HTTP kontrolü** geçti. GitHub CI ve Sites'in gerçek yayın sonucu ayrıca tamamlanmadan bu kayıt tek başına yayın kanıtı sayılmaz.

Sonraki öncelik gerçek mobil seçim ve ekran yerleşimi gözlemi; ardından yarım kalan keşiflerin bulunabilirliği hakkında oyuncu geri bildirimi. Bu değişiklik mevcut günlük iki bölümü korur; bir sonraki tarihin bölümleri yeni, değişmez kayıt olarak eklenir.

## 21 Ekim 2026 · 0.6.0

Oyuncu geri bildirimi: önceki Markdown raporu açılmadı ve sitedeki farklar anlaşılmadı. 0.5.1 ağırlıklı olarak kayıt güvenliği ve küçük kullanım düzeltmeleriydi; kapsamlı bir görsel yenileme yapılmış gibi sunulmamalı.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Yeni bölümleri görünür kılma, uygulama içinde sürüm notları | Oyuncu ne eklendiğini hemen görür ve tek dokunuşla açar. | Bu tur seçildi. Ana sayfada iki belirgin kart, gerçek sürüm etiketi, çalışan arşiv ve dosyasız yenilik penceresi. |
| Ek bölüm kayıtlarının eşitleme durumunu düzeltme | Ağ isteği sürerken bulunan kelimeler kaybolmaz; onaylanmamış kayıt için bulutta kaydedildi denmez. | Bu tur düzeltildi. İlk bulut okumasında yerel kelimeleri yükleme sırasına alma ve geç PUT yanıtına karşı üç regresyon senaryosu. |
| Dokunmatik seçim toleransını değiştirme | Dar ekranda yanlış son harf seçimini azaltabilir. | Cihaz gözlemi olmadan değiştirilmedi. Önce gerçek çapraz sürükleme ve iki dokunuş gözlemi. |
| Kozmetik keşif odası ve ortak arkadaş gizemi | Kalıcı kişisel bağ ve ortak hedef yaratabilir. | Bu tur kapsam dışında. Önce çekirdek akış, gerçek cihaz kontrolü ve mevcut keşiflerin bulunabilirliği. |

### Uygulanan kapsam

- **Ormanın minik komşuları:** Rahat, 6 × 6, dört kelime, Hayvanlar.
- **Merak laboratuvarı:** Dengeli, 8 × 8, yedi kelime, Bilim.
- Tarih/sıra numarasından türeyen sabit kimlikler ve dondurulmuş tahta JSON'ları. Dosya `content/releases/2026-10-21.json`; aynı tarihin içeriği yeniden üretilmez.
- Ana sayfanın üstünde iki geniş keşif kartı; 0.6.0 etiketli **Neler değişti?** düğmesi; güncel ve önceki sürümün gerçek değişikliklerini açıklayan okunabilir pencere.
- **Bölüm arşivi:** kaynakta yayımlanan eski bölümler kalıcıdır. Arşiv 24'lük sayfalarla yüklenir, yükleme/hata/yeniden dene ve önbellekli çevrimdışı durumları korunur.
- Yeni bölümler mevcut ek bölüm oynatıcısını ve hesaba özel `chapter_saves` kayıtlarını kullanır. İlk indirmeden sonra son 100 tahta cihazda saklanabilir. Ana ilerleme JSON'u her gün büyütülmez; yeni veritabanı şeması gerekmez.
- İlk bulut yanıtında yalnız cihazda bulunan kelimeler gönderim sırasına alınır. PUT sürerken eklenen kelimeler sunucuda onaylanana kadar kayıt durumu beklemede kalır.
- Yönetim panelinden hazırlanmış içerik, yetki, denetim günlüğü, oyuncu puanları ve mevcut harita kümeleri değiştirilmez. Kaynak bölümlerinin kimlikleri panel taslaklarına ayrılmaz.

### Yayın ve doğrulama

İlgili doğrulamalar: 11 yeni içerik, kimlik, arşiv, kayıt sahipliği ve eşitleme senaryosu; bütün mevcut regresyonlar; içerik denetimi; TypeScript; üretim derlemesi ve iki oyunculu Worker HTTP akışı. HTTP kontrolüne ana sayfadaki iki başlık, yenilik düğmesi, arşiv ve bu bölümlerde hesaba özel kayıt eklendi.

Yerel sonuç: **88/88 test**, **26 tahta + 520 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. Son üretim paketinde iki bağımsız oyuncuyla **146 HTTP kontrolü** geçti. GitHub CI ve Sites yayın sonucu ayrıca doğrulanmadan bu kayıt tek başına canlı yayın kanıtı sayılmaz.

Tarayıcı önizleme sunucusu başlatıldı ancak destekli bulut tarayıcısı önizlemeye bağlanamadı; sonraki sayfa erişimi tarayıcı güvenlik ilkesi tarafından engellendi. Başka tarayıcı yolu veya güvenlik aşma denenmedi. Görsel yerleşim, fiziksel dokunma ve FPS doğrulanmış sayılmaz. Kaynak, içerik ve HTTP kontrolleri bu sınır açıkça belirtilerek sürdürülür.

### Sonraki öncelik

Gerçek iPhone/Android üzerinde ana sayfanın ilk ekranı, arşivden dönüş, 200% metin, ekran döndürme ve çapraz seçim. Yeni mekaniklerden önce gözlenen taşma veya yanlış seçim düzeltilmeli. E-posta sağlayıcısı hâlâ bağlı değildir; yeni üyelik kabiliyeti iddia edilmez.

## Yeniden çalışma ve yarım kalan yayını sürdürme

1. Güncel Site kaynağını aç; UTC tarihine ait dosyayı ve `RELEASE_BATCHES` kaydını kontrol et.
2. O tarihin 1 ve 2 numaralı girdileri varsa yeniden üretme. Dosya tamam ama yayın yarıda kalmışsa aynı içerik/kimliklerle doğrulama, GitHub ve Sites yayın adımlarını tamamla.
3. Yalnız bir girdi hazırlanmışsa mevcut girdiyi ve tahtasını koru; eksik sıra numarasını ekle. Testler tarih başına tam iki, bir Rahat ve bir Dengeli bölüm şartını denetler.
4. Yeni tarih için yeni snapshot dosyası ekle ve `lib/studio/releases.ts` listesine bir kez kaydet. Yayımlanmış dosyaların kelimelerini, tohumlarını, kimliklerini veya tahtalarını değiştirme.
5. `pnpm content:check`, `pnpm typecheck`, `pnpm test`, üretim derlemesi ve Worker HTTP kontrolünü geçir. Sites kaynak/paketleme yardımcısını kullan; GitHub ağacını aynı kaynak ağacıyla eşleştir ve CI sonrası birleştir.
6. Sites'in başarılı yayın sonucu ve gerçek adresi son doğrulamadır. Kaynak kaydının varlığı tek başına yayın başarısı değildir. Bir sonraki çalışmada kaydedilmiş sürümü ve canlı yayını birlikte kontrol et.
