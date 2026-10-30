# Kelime Teneffüsü

Türkçe, telefon öncelikli kelime keşif oyunu. React, Vinext/Vite ve Cloudflare Workers + D1 üzerinde çalışır. Lovable kredisi veya Lovable çalışma zamanı gerekmez.

## Oyun

- 16 tema, 96 özgün bölüm. Sekiz yön, her tahtada iki eğimde çapraz kelimeler.
- Hababam, Uzay ve Türkiye için ayrıca 15 düzenlenmiş rota bölümü; küçük tahtalardan başlayan zorluk akışı.
- Keşif Haritası: 16 dünyada 96 bölüm ve kalıcı koleksiyon parçası. İlk üçlü korunur; 13 yeni haritada 78 bölüm ve 26 İpucu Avı vardır. Üç durak sonraki dünyayı, beş durak bonusu açar.
- Altı Gizli Tema: kelimeleri bul, ortak bağlantıyı çöz, bonus kelimeyi aç.
- İlk açılışta oynanabilir 6 × 6 öğrenme turu. Kaydırma, iki uca dokunma ve klavye kontrolü. Pencere odağı kaybolduğunda veya sekme gizlendiğinde yarım seçim temizlenir; bulunan kelimeler korunur. Günlük/Arena saatleri durdurulmaz.
- Kısa solo listeleri (en fazla sekiz kelime grubu) doğrudan tahta alanında görünür. Diğer oyunlarda tahtanın hemen yanındaki **Kelimeler** ile güncel listeye yakın erişim. Solo/İpucu Avı/Günlük, Gizli Tema, Hızlı Tur, Arena ve kayıtlı meydan okumada doğrulanmış hedefler; **Tahtaya dön** ile devam. Uzun adlar bütün parçaları bulununca tamamlanır; bekleyen sunucu hamlesi bulunmuş sayılmaz, gizli cevap erken açılmaz. Listeyi açmak süreyi durdurmaz.
- Ana sayfanın ilk kartında kişisel sıradaki/yarım kalan keşif, gerçek koleksiyon parçası ve açılış eşiği; haritaya, dünyalara ve arkadaş oyununa doğrudan geçiş. Günlük eklenen bölümler ilgili dünyanın bölüm seçicisine katılır; keşif atlası ana kartın hemen altındadır.
- Sonuçta gerçek parça/dünya/bonus kazanımları öne çıkar; sonraki keşif, tekrar ve tahta inceleme eylemleri ayrı alt alandadır. O turun yıldızları ile önceki en iyi sonuç ayrılır. 0/1/2–3 ipucu sırasıyla 3/2/1 yıldız verir; süre yıldızı etkilemez, parçayı kazanmak için yıldız şartı yoktur.
- Keşif albümleri, rozetler, açılan renk paletleri, kişisel en iyi solo sonuçları ve tekrar oynama.
- Tamamlanan Solo ve Gizli Tema tahtaları ayrı inceleme durumunda açık kalır: harfler/çizgiler, büyütme, ses ve yardım korunur; yeni hamle veya ipucu sunulmaz. Gizli Tema sonucunu kapatınca **Sonucu göster** ile yeniden açabilir, sonraki keşfe veya gerçek tekrar oyununa geçebilirsin. İnceleme kazanımları ve en iyi sonucu değiştirmez.
- Her gün İstanbul saatine göre ortak bulmaca. Süre sunucuda, ipucu başına +15 saniye.
- Günlük oyunda kelime/ipucu onayı beklenirken tahta açık kalır; yeni seçimler ve ipucu bekler, süre sürer. Sekiz saniyede yanıt alınamazsa **Kontrol et ve sürdür** aynı günlük kaydını kontrol eder. Bekleyen kelime/ipucu aynı sekmede geri dönüş ve sayfa yenileme boyunca korunur; günlük oyunu yeniden açınca önce bu işlem kontrol edilir. İpucu aynı anahtarla tekrar cezalandırmadan sürer. Sekme kapanışı veya cihazlar arası koruma garantisi verilmez. Hesap değişirse eski yanıt uygulanmaz, günlük sayfasına dönüşte profil yeniden kontrol edilir.
- 120 saniyelik gerçek iki kişilik Arena. Özel odalar, paylaşım bağlantısı, ortak geri sayım, Altın Kelime, bağlantıdan dönüş ve karşılıklı rövanş. Biten düelloda sonuç penceresini kapatınca harfler ve onaylı çizgiler salt okunur kalır; sonucu yeniden açabilirsin.
- Dereceli hızlı eşleşmede Elo, bekledikçe genişleyen beceri aralığı. Özel odalar dereceyi değiştirmez.
- Arkadaşının İzinde: gerçek, sunucuda kaydedilmiş bir performansa karşı aynı tahta. Canlı olmadığı açıkça gösterilir.
- Onayla kabul edilen arkadaş davetleri, haftalık arkadaş sıralaması ve maç geçmişi.
- Özgün SVG sahneler, isteğe bağlı ses/titreşim, büyük harf, kontrast ve azaltılmış hareket desteği. 0.14.0: kısa ahşap tınılı seçim/kelime/ipucu/bağlantı/başlangıç/bitiş sesleri; Albümde üç cihaz ses düzeyi ve örnek dinleme. Varsayılan sessiz, tek ses grubu ve tekrar sınırı, gizli sekmede iptal; ağ oyunlarında yalnız onaylı kelimeye başarı sesi. Müzik döngüsü, son saniye alarmı ve ses dosyası indirmesi yok.
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
