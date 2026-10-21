# Kelime Teneffüsü

Türkçe, telefon öncelikli kelime keşif oyunu. React, Vinext/Vite ve Cloudflare Workers + D1 üzerinde çalışır. Lovable kredisi veya Lovable çalışma zamanı gerekmez.

## Oyun

- 16 tema, 96 özgün bölüm. Sekiz yön, her tahtada iki eğimde çapraz kelimeler.
- Hababam, Uzay ve Türkiye için ayrıca 15 düzenlenmiş rota bölümü; küçük tahtalardan başlayan zorluk akışı.
- Keşif Haritası: üç dünyada kalıcı ilerleme, 18 belirli koleksiyon parçası ve açılan üç bonus bölüm. Üç durak sonraki dünyayı, beş durak bonusu açar.
- Altı Gizli Tema: kelimeleri bul, ortak bağlantıyı çöz, bonus kelimeyi aç.
- İlk açılışta oynanabilir 6 × 6 öğrenme turu. Kaydırma, iki uca dokunma ve klavye kontrolü.
- Keşif albümleri, rozetler, açılan renk paletleri, kişisel en iyi solo sonuçları ve tekrar oynama.
- Her gün İstanbul saatine göre ortak bulmaca. Süre sunucuda, ipucu başına +15 saniye.
- 120 saniyelik gerçek iki kişilik Arena. Özel odalar, paylaşım bağlantısı, ortak geri sayım, Altın Kelime, bağlantıdan dönüş ve karşılıklı rövanş.
- Dereceli hızlı eşleşmede Elo, bekledikçe genişleyen beceri aralığı. Özel odalar dereceyi değiştirmez.
- Arkadaşının İzinde: gerçek, sunucuda kaydedilmiş bir performansa karşı aynı tahta. Canlı olmadığı açıkça gösterilir.
- Onayla kabul edilen arkadaş davetleri, haftalık arkadaş sıralaması ve maç geçmişi.
- Özgün SVG sahneler, isteğe bağlı ses/titreşim, büyük harf, kontrast ve azaltılmış hareket desteği.
- Ana ekrana kurulabilen PWA. İlk başarılı indirmeden sonra solo oyunlar çevrimdışı açılır. API ve hesap yanıtları önbelleğe alınmaz.
- Yönetim Atölyesi: yetkili ChatGPT hesabıyla taslak, oynanabilir önizleme, yayın, arşiv, gerçek kullanım verileri, hata sayımları ve işlem günlüğü. Panelden yayımlanan bölümler ayrı Yeni keşifler alanında açılır.

Sahte rakip, uydurma çevrimiçi oyuncu sayısı ve hazırlanmış skor listesi yoktur. Satın alınmış rekabet avantajı veya ödeme akışı eklenmemiştir.

## Üyelik ve ilerleme

Misafir profilinde 256 bit rastgele oturum anahtarı, HttpOnly/Secure/SameSite cookie ve sunucuda yalnızca anahtarın SHA-256 özeti kullanılır. Misafir profili bu tarayıcıya bağlıdır. Kalıcı hesaplar için Sites ChatGPT girişi korunur. Firebase e-posta, şifre, doğrulama, şifre sıfırlama ve benzersiz kullanıcı adı uygulaması hazırdır; aşağıdaki dört ortam değeri yapılandırılmadan e-posta yöntemi sunulmaz:

`FIREBASE_PROJECT_ID`, `FIREBASE_WEB_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_APP_ID`.

Kurulum ayrıntıları: [docs/email-membership.md](docs/email-membership.md). Gizli servis hesabı anahtarı istemciye veya kaynak koduna konmaz. Yerel kaynakta ortam değerlerini, kullanıcı verilerini ve oturum anahtarlarını saklamayın.

Solo ilerleme cihazda hemen kaydedilir; bağlı profilin D1 kaydıyla eşitlenir. Farklı cihazların bulduğu kelimeler birleştirilir, daha iyi tamamlanmış sonuçlar korunur. Solo kayıtları rekabetçi puan veya derece vermez. Misafirden kalıcı hesaba geçerken solo ilerleme taşınır; bu aktarım dereceleri birleştirmez.

Sites kimlik başlıkları bu platformun doğrulanmış erişim sınırında kullanılır. Başka bir hosta taşırken bu başlıklara doğrudan güvenmeyin; yerel kimlik sağlayıcısını ve güven sınırını yapılandırın.

## Geliştirme ve kontroller

Node 24, pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm content:check
pnpm typecheck
pnpm test
pnpm build
node scripts/verify-worker.mjs
```

İçerik kontrolü, 24 düzenlenmiş bulmacanın tüm hedeflerini ve 480 alternatif yerleşimini doğrular. Birim/servis testleri 6.000 özgün ve klasik tahta, kayıt uyumluluğu, kimlik, eşzamanlı güncellemeler, derece, zaman sınırları, arkadaşlar ve gerçek kayıtlı performansları kapsar. Üretim Worker kontrolü iki bağımsız oturumla HTTP üzerinden misafir girişi, CSRF reddi, meydan okuma, arkadaş kabulü, canlı olay akışı, düello, özel ilerleme, çıkış ve PWA paketini sınar. Tarayıcı veya dokunmatik ekran testi değildir.

`.openai/hosting.json` mevcut Site kimliğini ve `DB` bağlamasını korur. Şema `db/schema.ts`, değişmez SQL geçişleri `drizzle/` altındadır. Şemayı değiştirince `pnpm db:generate` çalıştırın ve yeni SQL ile Drizzle kayıtlarını birlikte ekleyin. Veritabanı istek sırasında oluşturulmaz. Sites, geçişleri yayımlarken uygular. Yayın için Sites kaynak/paketleme yardımcılarını kullanın.

## İçerik ve işletim

`/yonetim` tek sahip için canlı içerik yönetimini, gerçek kullanım verilerini ve hata takibini sunar. Özel kurulum bağlantısı ve doğrulanmış ChatGPT hesabıyla bir kez bağlanır. Kurulum, yayın ve kayıt sınırları: [docs/admin-panel.md](docs/admin-panel.md).

`/atolye` yerel bölüm taslağı düzenler, yerleşim/çözümleri gösterir ve JSON dışa aktarır. Canlı içeriği değiştirmez. Harita ve ödül uyumluluğu: [docs/discovery-map.md](docs/discovery-map.md). Düzenlenmiş içerik `lib/game/content.ts`, standart temalar `lib/game/catalog.ts` içindedir. Kaynağa eklenen içerik CI kontrolünden geçer.

Canlı durum tarayıcıya SSE ile iletilir. Kalıcı durum D1 üzerinde izlenir; bu sürüm WebSocket/Durable Object altyapısı kullanmaz. Sunucu puan, sıra, üyelik, doğru seçim ve süreyi denetler. Bu, otomatik çözücülerin tamamen engellendiği anlamına gelmez.

İsteğe bağlı ölçümler varsayılan kapalıdır. E-posta, kelime yolları veya kalıcı analitik kullanıcı kimliği gönderilmez. Günlük toplu olay/bucket sayımları ve cihazda tutulan tarihlerle izin veren kullanıcıların D1/D7 dönüşleri izlenebilir. Bunlar tüm oyuncuları temsil eden ölçümler değildir. Ayrıntılı çıkış kontrolleri ve henüz yapılmamış doğrulamalar: [docs/studio-release.md](docs/studio-release.md).

## İlk fotoğrafın korunması

`lib/game/legacy.ts`, fotoğraftaki 20 Hababam ismini, dört turu, deterministik yerleşimi ve `hababam-kelime-v1` kayıt biçimini korur. Eski tohumlar aynı tahtaları üretir. Klasik oyun ana sayfadan açılır. Farklı bir alan adındaki eski tarayıcı kayıtları otomatik taşınamaz.
