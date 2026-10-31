# Kelime Teneffüsü

0.20.0: özgün dünya sahnesi, dokunulabilir yakın bölüm yolu, gerçek kapılara bağlı 96 bölümlük seçici, solo kelime/tanım hedefi ve daha belirgin gerçek ödül ekranı. Eski elapsed/hint-only ve kısmi bonus kayıtları devam önerisinde korunur. İçerik/tohum/kayıt şeması/rekabet kuralları değişmedi. 493 test, 156 ana tahta/3.120 alternatif +64 grup tahtası, tip/üretim/Safari sözdizimi ve525 Worker kontrolü geçti. Destekli yerel tarayıcıda 360×640,390×844 ve768×1024 alanlarında oyun akışı kontrol edildi; fiziksel cihaz/ses/FPS kabulü değildir. Kanıt: studio-agents/journal/entries/2026-10-31_professional-decision.md.

0.19.0: yeni açık/özel grup turları her iki türde12×12/dokuz kelime, ayrı değişmez grup havuzu ve64 yeni tahta denetimi. Eski aktif maçlar aynen sürer; sonraki tur yeni ölçüye geçer. Beyaz/kahverengi/adaçayı/kum kişisel tahta seçimi mevcut kayıt v2 içinde kalır; diğer oyuncuya/oda puanına etkisi yok. Eski dueller/içerik/göçler korunur.

0.18.1: 31 Ekim için Kuş sesleri (Rahat6×6,4 kelime) ve Dağ yolculuğu (Dengeli8×8,7 kelime). Yayın kapısı tarih/slot/ID/hash bütünlüğünü de denetler; eski kayıtlar ve 0.18.0 ses/grup davranışı korunur.

Türkçe, telefon öncelikli kelime keşif oyunu. React, Vinext/Vite ve Cloudflare Workers + D1 üzerinde çalışır. Lovable kredisi veya Lovable çalışma zamanı gerekmez.

## Oyun

- 0.18.0: cihazda kalıcı, anında uygulanan %0–100 Oyun sesi; güçlendirilmiş ve sınırlanmış ortak ses çıkışı, her yeni harfe kısa değişken tını ve ayrı yumuşak yanlış deneme sesi. 144 yeni tanım-cevap, ana sayfa/Keşfet’te 32 ek İpucu Avı bölümü; eski 96 bölümlük ana sıra ve albümler değişmez. Yeni grup odası ipucu turuyla başlar, normal turla dönüşümlü sürer. Tür, tanımlar ve kullanılan bilmeceler sunucuda aynı oda kaydıyla korunur; tükenmede açık uyarı vardır. Uzun Arena metinleri ve kontroller satır kırar. Fiziksel dinleme ve gerçek telefon ekran kontrolü aşağıdaki doğrulama sınırında açıktır.

- 0.17.0 · Faz 1: sekiz yön kilidi ve aynı çizgide geri düzeltme, doğrudan çizilen seçim izi, kısa buluş vurgusu, büyük tahtada seçili harf büyüteci ve tek sonuç geçişi. 0.16.2 içeriği ve kayıtlar korunur. Gerçek cihaz/FPS ve görsel kabul hâlâ açıktır; Faz 0 ve Faz 2–4 tamamlanmış sayılmaz.

- 0.16.2: **Kahvaltı sofrası** (Rahat 6×6) ve **Orkestra provası** (Dengeli 8×8), 30 Ekim'in sabit kaynak çifti; ilgili dünya, ana sayfa ve kalıcı arşivden erişilir. İçerik kapısı yeni kimlik/tohum altında tekrarlanan normalize kelime kümesini veya aynı gerçek tahtayı reddeder. Bu bakım sürümü Faz 1'i içermiyordu.
- 0.16.1 · görünür oda galibiyetleri ve ses sürekliliği: Tablet portresinde 1100px'e kadar tek sütunlu tahta, 720px'e kadar gerçek alan kullanımı, küçülmeyen büyük harf modu. Büyütmede tek parmak çizim varsayılandır; Seç/Taşı kontrolü açıktır. Native Touch/Pointer çift olayları tek seçime iner; adres çubuğu yüksekliği çizimi kesmez. Hızlı eşleş ana eylemi derecesiz açık grup lobisine, ayrı eylem dereceli iki kişilik düelloya gider. Grup serisi sonuç makbuzlarından galibiyet/beraberlik/maç türetir; yeni tur, yenileme ve ayrılma kazanımı değiştirmez. Fiziksel telefon/tablet testleri ayrıca açıktır.
- 0.15.2: Kaydırma sırasında ölçüm kaynaklı yerleşim, başlangıç hücresini silmez; tahta koordinatları güncellenir. Hızlı kaydırmada son bırakma koordinatı da işlenir. Pointer Events ve eski Safari Touch Events aynı Board'u kullanır; döndürme, arka plan ve pause iptali korunur.
- 16 tema, 96 özgün bölüm. Sekiz yön, her tahtada iki eğimde çapraz kelimeler.
- Hababam, Uzay ve Türkiye için ayrıca 15 düzenlenmiş rota bölümü; küçük tahtalardan başlayan zorluk akışı.
- Keşif Haritası: 16 dünyada 96 bölüm ve kalıcı koleksiyon parçası. İlk üçlü korunur; 13 yeni haritada 78 bölüm ve 26 İpucu Avı vardır. Üç durak sonraki dünyayı, beş durak bonusu açar.
- Altı Gizli Tema: kelimeleri bul, ortak bağlantıyı çöz, bonus kelimeyi aç.
- İlk açılışta oynanabilir 6 × 6 öğrenme turu. Kaydırma, iki uca dokunma ve klavye kontrolü. Pencere odağı kaybolduğunda veya sekme gizlendiğinde yarım seçim temizlenir; bulunan kelimeler korunur. Günlük/Arena saatleri durdurulmaz.
- Ortak oyun çerçevesi gerçek görünür ekran yüksekliğini, güvenli alanı, HUD/hedef/kontrol ölçülerini kullanır. Normal oyunda bütün hedefler tek görünür listede; büyük harf modunda ayrıca **Kelimeler** erişimi vardır. Çok kısa ekran veya büyütülmüş metinde okunabilir tahta için doğal akışa genişler, öğeler üst üste bindirilmez. Gizli cevaplar ve yalnız sunucuca onaylanan kelime işaretleri korunur. Gerçek telefon sığması aşağıdaki doğrulama sınırına tabidir. Safari düzeltmesi: bütçe şişmiş flex track yerine gerçek başlık/hedef/kontrol kutularından çıkarılır; kare ve harf boyutu piksel olarak verilir. ResizeObserver yokken resize/orientation/pageshow/scroll ve içerik gözlemi kullanılır; eski istemciye dokunma ve dialog yolu eklenir. İstemci Safari 12 sözdizimine derlenir, üretim build'i bu çıktıyı denetler. Fiziksel iOS 12/Safari doğrulaması henüz yapılmış sayılmaz.
- Ana sayfanın ilk kartında kişisel sıradaki/yarım kalan keşif, gerçek koleksiyon parçası ve açılış eşiği; haritaya, dünyalara ve arkadaş oyununa doğrudan geçiş. Günlük eklenen bölümler ilgili dünyanın bölüm seçicisine katılır; keşif atlası ana kartın hemen altındadır.
- Sonuçta gerçek parça/dünya/bonus kazanımları öne çıkar; sonraki keşif, tekrar ve tahta inceleme eylemleri ayrı alt alandadır. O turun yıldızları ile önceki en iyi sonuç ayrılır. 0/1/2–3 ipucu sırasıyla 3/2/1 yıldız verir; süre yıldızı etkilemez, parçayı kazanmak için yıldız şartı yoktur.
- Keşif albümleri, rozetler, açılan renk paletleri, kişisel en iyi solo sonuçları ve tekrar oynama.
- Tamamlanan Solo ve Gizli Tema tahtaları ayrı inceleme durumunda açık kalır: harfler/çizgiler, büyütme, ses ve yardım korunur; yeni hamle veya ipucu sunulmaz. Gizli Tema sonucunu kapatınca **Sonucu göster** ile yeniden açabilir, sonraki keşfe veya gerçek tekrar oyununa geçebilirsin. İnceleme kazanımları ve en iyi sonucu değiştirmez.
- Her gün İstanbul saatine göre ortak bulmaca. Süre sunucuda, ipucu başına +15 saniye.
- Günlük oyunda kelime/ipucu onayı beklenirken tahta açık kalır; yeni seçimler ve ipucu bekler, süre sürer. Sekiz saniyede yanıt alınamazsa **Kontrol et ve sürdür** aynı günlük kaydını kontrol eder. Bekleyen kelime/ipucu aynı sekmede geri dönüş ve sayfa yenileme boyunca korunur; günlük oyunu yeniden açınca önce bu işlem kontrol edilir. İpucu aynı anahtarla tekrar cezalandırmadan sürer. Sekme kapanışı veya cihazlar arası koruma garantisi verilmez. Hesap değişirse eski yanıt uygulanmaz, günlük sayfasına dönüşte profil yeniden kontrol edilir.
- 120 saniyelik Arena: ana Hızlı eşleş ile açık grup, kodlu özel grup veya ayrı dereceli iki kişilik düello. Gruplar ikinci kişide kapanmaz. Herkes hazır olur, grup maçını oda sahibi başlatır; aktif tura sonradan katılım yoktur. Açık grubun başlangıcında 30 saniyedir bağlantısı olmayan katılımcılar çıkarılır, sahiplik bağlı oyuncuya devredilir; özel oda kuralı değişmez. Tek sunucu saati/tahta/puan, sayfalı gerçek sıralama, ayrılma ve yeniden bağlanma. Dört kişilik uygulama sınırı yoktur; oda veri bütçesi ve mevcut D1/SSE altyapısı kapasiteyi sınırlar.
- **Yeni oyun oyna** aynı oda/kodda tek sonraki tur lobisini açar. Sonuçlar bir kez yazılır; önceki sonuç lobiden erişilir. Hesaba bağlı D1 geçmişinde normalize kelime kümesi ve gerçek grid ayrı denetlenir, tüm katılımcıların geçmişlerinin birleşimi dışlanır. Denetlenmiş sözlükten yeni altılı kombinasyonlar üretilir, 8×8 çözülebilirlik/iki çapraz eğim doğrulanır. Aday sığmazsa atlanır, sonlu havuz tükenirse açık hata verilir. Eski bölüm sessizce tekrarlanmaz. Yenileme/aynı doğrulanmış hesap geçmişi silmez; yeni misafir kimliği ayrı profildir.
- Yeni Arena protokolünde hesap/tur sınırı, oda revizyonu ve aktif üyelik kontrol edilir. Hızlı tekrarlar tek tur açar; eski ACK/SSE/kurtarma cevapları yeni oda veya hesabı değiştirmez. Biten tahta salt okunur incelenebilir.
- Dereceli hızlı eşleşmede Elo, bekledikçe genişleyen beceri aralığı. Özel odalar dereceyi değiştirmez.
- Arkadaşının İzinde: gerçek, sunucuda kaydedilmiş bir performansa karşı aynı tahta. Canlı olmadığı açıkça gösterilir.
- Onayla kabul edilen arkadaş davetleri, haftalık arkadaş sıralaması ve maç geçmişi.
- Özgün SVG sahneler, isteğe bağlı ses/titreşim, büyük harf, kontrast ve azaltılmış hareket desteği. Kısa ahşap tınılı seçim/kelime/ipucu/bağlantı/başlangıç/bitiş sesleri, %0–100 cihaz ses çubuğu ve örnek dinleme. Varsayılan sessiz; sınırlı, kuyruksuz harf tınısı ve motif öncelikleri, gizli sekmede iptal; ağ oyunlarında yalnız onaylı kelimeye başarı sesi. Müzik döngüsü, son saniye alarmı ve ses dosyası indirmesi yok.
- Ana ekrana kurulabilen PWA. İlk başarılı indirmeden sonra solo oyunlar çevrimdışı açılır. API ve hesap yanıtları önbelleğe alınmaz.
- Yönetim Atölyesi: yetkili ChatGPT hesabıyla taslak, oynanabilir önizleme, yayın, arşiv, gerçek kullanım verileri, hata sayımları ve işlem günlüğü. Panelden yayımlanan bölümler ayrı Yeni keşifler alanında açılır.
- Arşivden veya Albümdeki bir tarihten açılan bölüm, oyun içi geri dönüşte aynı liste/tarih penceresine döner. Yüklenen aralık aynı oturum belleğinde korunur; seçilen karta odak/scroll istenir. Sekme yenilemesinde bu gezinme konumu saklanmaz.
- Günlük iki kalıcı keşif: ana sayfada kolay ve orta bölüm kartları, sayfalı bölüm arşivi ve **Neler değişti?** penceresi. Kaynak yayın kaydı `content/releases/`, seçim ve doğrulama notları [geliştirme defterinde](docs/development-log.md).
- Doğrulanmış cihaz tahtası bulunan tarihli/ek bölüm ağ yanıtı beklemeden açılır. Hesap kaydı arka planda birleştirilir; aktif keşif ve tekrar turu birbirinden ayrılır. İlk indirme internet gerektirir.
- Tarihli/ek bölüm kaydı hesap ve bölüme bağlı gönderim kuyruğundadır. Oyun içinde geri dönüşte bekleyen kısmi kaydın ardından son tamamlama da gönderilir; hesap değişince eski istek yeni hesabı kilitlemez. Cihaz kaydı hemen tutulur, hata/sekme kapanmasında buluta teslim garantisi verilmez.
- Ek bölüm kartlarında hesaba özel ilerleme, kaldığı yerden devam etme, kazanılmış yıldızlar ve en iyi süre. Tamamlanan karttan doğrudan tekrar oyun açılır; en iyi sonuç korunur.
- Ana sayfa, arşiv ve Albümdeki bölüm kartlarında bu cihaza ait **Çevrimdışı hazır** bilgisi. Yalnız doğrulanmış yerel tahta hazır sayılır; çevrimdışıyken indirilmemiş kart bağlantı bekler. Bulut ilerlemesi ile cihaz hazırlığı birbirine karıştırılmaz.
- Keşif damgaları: aynı tarihin iki sabit bölümünü tamamla, kalıcı tarihli hatıranı aç. İpucu veya hız şartı yok; önceki tamamlamalar geçerli ve damgalar tarihli arşivde kalır. Bölüm sonucunda damga durumu ve varsa kalan keşfe doğrudan geçiş görünür. Albümdeki tarihli damga rafından eski hatıralar ve bölümler açılır.

Sahte rakip, uydurma çevrimiçi oyuncu sayısı ve hazırlanmış skor listesi yoktur. Satın alınmış rekabet avantajı veya ödeme akışı eklenmemiştir.

## Üyelik ve ilerleme

Misafir profilinde 256 bit rastgele oturum anahtarı, HttpOnly/Secure/SameSite cookie ve sunucuda yalnızca anahtarın SHA-256 özeti kullanılır. Misafir profili bu tarayıcıya bağlıdır. Kalıcı hesaplar için Sites ChatGPT girişi korunur. Firebase e-posta, şifre, doğrulama, şifre sıfırlama ve benzersiz kullanıcı adı uygulaması hazırdır; aşağıdaki dört ortam değeri yapılandırılmadan e-posta yöntemi sunulmaz:

`FIREBASE_PROJECT_ID`, `FIREBASE_WEB_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_APP_ID`.

Kurulum ayrıntıları: [docs/email-membership.md](docs/email-membership.md). Gizli servis hesabı anahtarı istemciye veya kaynak koduna konmaz. Yerel kaynakta ortam değerlerini, kullanıcı verilerini ve oturum anahtarlarını saklamayın.

Solo ilerleme cihazda hemen kaydedilir; bağlı profilin D1 kaydıyla eşitlenir. Farklı cihazların bulduğu kelimeler birleştirilir, daha iyi tamamlanmış sonuçlar korunur. Solo kayıtları rekabetçi puan veya derece vermez. Misafirden kalıcı hesaba geçerken solo ilerleme taşınır; bu aktarım dereceleri birleştirmez.

0.12.2 istemcisi ana ilerleme GET/PUT isteğine beklediği hesap sahibini ekler; farklı/boş sahibi sunucu açık bir hesap-değişti koduyla reddeder. Eski istemci biçimi geriye uyumlu kalır; yeni guard olmayan eski sürümlere geriye dönük koruma iddia edilmez. İstemci bu durumda o bulut kanalını durdurur, aynı sahibin yerel kaydını sürdürür. Cihaz yazımı bozuksa önce yalnız kayıt tekrarı; sağlam ve oyun dışında ise profil yenileme sunulur. Bu, gerçek kimlik sağlayıcısında cihazlar arası yarışmanın test edildiği anlamına gelmez.

0.12.3 ana ilerlemenin her GET/PUT denemesini sekiz saniyelik istemci süre sınırına bağlar; token edinme/yenileme ve JSON okuma da bu sınırdadır. Yanıt vermeyen callback eşitlemeyi sürekli kilitlemez; son yerel keşifler ve iyi sonuçlar sonraki denemede birleştirilir. Albümde bekleyen eşitleme için **Yeniden eşitle** ilk okumayı da tekrar dener. Timeout sunucunun bir yazmayı kesinlikle yapmadığı veya sekme kapanışında buluta teslim garantisi anlamına gelmez. Cihaz/hesap onayları ayrıdır; eski owner, reward ve kayıt biçimi kuralları aynı kalır.

0.12.5 günlük açılış/hamle/kontrol isteklerini de token/HTTP/JSON dahil sekiz saniyeyle sınırlar. Aynı açık oyundaki ipucu niyeti sunucuda tek işlem anahtarıyla doğrulanır; belirsiz ilk isteğin ardından gelen tekrar reddi anahtarı erken silmez. Salt okunur kontrol aynı owner/günlük kimliğine bakar, gece yarısından sonra başka gün başlatmaz. Yeni guard taşımayan eski istemciler uyumludur; onların ipucu tekrar davranışı değişmez. Bekleyen anahtar bu aşamada açık Solo oturumundadır; geri çıkış/yenileme sonrası tüm yollar için tek-ceza garantisi verilmez. Gerçek sağlayıcı/cihaz doğrulaması ayrıca açıktır.

0.12.6 bu sınırı aynı sekmede geri dönüş ve sayfa yenilemeye genişletir. Yeni mutation öncesi sessionStorage kaydı ve geri okuma başarılı olmalıdır; kayıt hatasında sessiz yeni istek gönderilmez. Başlangıç owner'a ait bekleyen günlük kimliğini bulur, gece yarısından sonra da önce onu salt okur. Açılışta ipucu otomatik yeniden gönderilmez; açık **Kontrol et ve sürdür** özgün anahtarı kullanır. Yerel kayıt çözümleri veya hesap token'ı saklamaz; başka owner/gün/tahtaya replay edilmez. Kayıt temizlenemezse yeni hamle bekler ve **Kaydı yeniden dene** sunulur. Süresi dolmuş deneme sunucudaki revision engeliyle güvenle kapanır; kabul edilmiş receipt bundan önce kurtarılır. İlk kesin ret veya açık ipucu-limit kodu kalıcı kilit bırakmaz. Bu sekme kapatılırsa, tarayıcı kayıtları silinirse veya başka cihaz kullanılırsa aynı süreklilik iddia edilmez; gerçek telefon/PWA doğrulaması açıktır.

Sites kimlik başlıkları bu platformun doğrulanmış erişim sınırında kullanılır. Başka bir hosta taşırken bu başlıklara doğrudan güvenmeyin; yerel kimlik sağlayıcısını ve güven sınırını yapılandırın.

## Geliştirme ve kontroller

Bakım ve geliştirme, kullanıcının ajan şablonundan uyarlanan [çalışma sözleşmesi](AGENTS.md) ve [rol düzeni](studio-agents/README.md) ile yürütülür. Koordinatör bağımsız deneyim/güvenilirlik incelemelerini ortak günlükte toplar, tek odak ve kabul ölçütü seçer; uygulama ve yayın tek elde kalır. Mevcut bağlı görev kullanılır, ayrı sürekli ajan sunucusu kurulmaz. Test edilmemiş cihaz veya ölçülmemiş oyuncu etkisi tamamlanmış sayılmaz.

Ürün, görsel düzen, kayıt güvenliği ve sıradaki ölçülebilir kalite hedefleri: [21 Ekim kalite incelemesi](docs/quality-review.md).

Node 24, pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm content:check
pnpm typecheck
pnpm test
pnpm build
node scripts/verify-worker.mjs
```

İçerik kontrolü bütün düzenlenmiş rota/atlas ve Gizli Tema tahtalarını; ayrıca tarihli kaynak yayınlarının sabit tahtalarını ve bölüm başına 20 alternatifini doğrular. Birim/servis testleri 6.000 özgün ve klasik tahta, kayıt uyumluluğu, kimlik, eşzamanlı güncellemeler, derece, zaman sınırları, arkadaşlar ve gerçek kayıtlı performansları kapsar. Üretim Worker kontrolü iki bağımsız oturumla HTTP üzerinden misafir girişi, CSRF reddi, meydan okuma, arkadaş kabulü, canlı olay akışı, düello, özel ilerleme, çıkış ve PWA paketini sınar. Tarayıcı veya dokunmatik ekran testi değildir.

`.openai/hosting.json` mevcut Site kimliğini ve `DB` bağlamasını korur. Şema `db/schema.ts`, değişmez SQL geçişleri `drizzle/` altındadır. Şemayı değiştirince `pnpm db:generate` çalıştırın ve yeni SQL ile Drizzle kayıtlarını birlikte ekleyin. Veritabanı istek sırasında oluşturulmaz. Sites, geçişleri yayımlarken uygular. Yayın için Sites kaynak/paketleme yardımcılarını kullanın.

## İçerik ve işletim

`/yonetim` tek sahip için canlı içerik yönetimini, gerçek kullanım verilerini ve hata takibini sunar. Özel kurulum bağlantısı ve doğrulanmış ChatGPT hesabıyla bir kez bağlanır. Kurulum, yayın ve kayıt sınırları: [docs/admin-panel.md](docs/admin-panel.md).

`/atolye` yerel bölüm taslağı düzenler, yerleşim/çözümleri gösterir ve JSON dışa aktarır. Canlı içeriği değiştirmez. Harita ve ödül uyumluluğu: [docs/discovery-map.md](docs/discovery-map.md). Düzenlenmiş içerik `lib/game/content.ts`, standart temalar `lib/game/catalog.ts` içindedir. Kaynağa eklenen içerik CI kontrolünden geçer.

Canlı durum tarayıcıya SSE ile iletilir. Kalıcı durum D1 üzerinde izlenir; bu sürüm WebSocket/Durable Object altyapısı kullanmaz. Sunucu puan, sıra, üyelik, doğru seçim ve süreyi denetler. Bu, otomatik çözücülerin tamamen engellendiği anlamına gelmez.

İsteğe bağlı ölçümler varsayılan kapalıdır. E-posta, kelime yolları veya kalıcı analitik kullanıcı kimliği gönderilmez. Günlük toplu olay/bucket sayımları ve cihazda tutulan tarihlerle izin veren kullanıcıların D1/D7 dönüşleri izlenebilir. Bunlar tüm oyuncuları temsil eden ölçümler değildir. Ayrıntılı çıkış kontrolleri ve henüz yapılmamış doğrulamalar: [docs/studio-release.md](docs/studio-release.md).

## İlk fotoğrafın korunması

`lib/game/legacy.ts`, fotoğraftaki 20 Hababam ismini, dört turu, deterministik yerleşimi ve `hababam-kelime-v1` kayıt biçimini korur. Eski tohumlar aynı tahtaları üretir. Klasik oyun ana sayfadan açılır. Farklı bir alan adındaki eski tarayıcı kayıtları otomatik taşınamaz.
