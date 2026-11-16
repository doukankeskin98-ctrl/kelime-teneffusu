# 0.56.0 — Arena yükünü azaltma ve kapasite sınırı

16 Kasım 2026 · iOS paket 49 (telefona kurulmadı). Başlangıç: 0.55.0 / Sites 111 / `a532eb0808b914ac2064266a55c5be6ef9515fc0`.

**10.000 eşzamanlı Arena oyuncusu için kabul verilmedi.** Bu paket ölçülmüş darboğazları azaltır; uzaktaki kapasite garantisi değildir. Mevcut üretime yük testi uygulanmadı. Yeni servis, ücretli plan, hesap veya bağımlılık eklenmedi.

## Değişen davranış

- Değişmeyen native odada tahta, oyuncu ve geçmiş sonuçları yerine küçük bir saat yanıtı gelir. Kimlik ve etkin üyelik her HTTP isteğinde doğrulanır. Revizyon, oda veya tur değişince tam görünüm gelir; en geç mevcut beş saniyelik heartbeat'te moderasyon/presence yenilenir. Hazır, transfer ve süre sonu yolları atlanmaz.
- Web SSE aynı revizyonda görünüm üretmez. Heartbeat'in ürettiği görünüm yeniden kullanılır; aynı tick'te ikinci okuma yapılmaz. Saat olayları sürer.
- Sağlam etkin üyelik artık her sorguda UPDATE çalıştırmaz. Süresi geçen üyelik mevcut kurallarla bırakılır.
- İsim moderasyonu iki yerine bir sorguyla güncel uygulanır. 64 eşleştirme adayı için 64 ayrı engel sorgusu yerine bir sınırlı engel grafiği sorgulanır; bloklar ve yarış koruması korunur.
- Bitmiş turun heartbeat'i aynı sonuç ve rating yazma girişimlerini tekrar etmez. İlk bitişin CAS/atomik makbuzları ve ödül tekilleştirmesi korunur.
- Bağlantı hatalarında native sorgular kademeli ve dağıtılmış aralıkla yeniden denenir (en fazla 15 saniye); başarılı yanıtta normal saniyelik sorguya dönülür. Web yeniden bağlantıları da aynı anda yığılmamak için hafif dağıtılır.
- Çizim motoru, harf uçuşu, titreşim, ses, kelime ACK yolu, 312 tahta ve kayıt biçimi değişmez. Kişiye özel görünüm ortak cache'e alınmaz.

## Ölçüm yöntemi

`node --experimental-strip-types --experimental-transform-types scripts/arena-load.mjs --conditional --out=/absolute/report.json`

Yalnız geçici Miniflare/workerd ve D1. Uzak URL seçeneği yok; üretim kimlik bilgisi yok. Gerçek cookie doğrulamasıyla 10.000 sentetik oturum, 5.000 ayrı iki kişilik oda. Önceki tur makbuzları da var. Aynı test tahtası kullanıldı; oda süreleri yalnız steady-state okuma ölçümü için uzatıldı. Üretim puzzle üretimi, yoğun eşleştirme, sonuç kapanışı ve 10.000 SSE bağlantısı kapasitesi bu ölçümün kapsamında değil.

Her aşama 20 saniye, kişi başına saniyede bir room GET hedefli açık-döngü yük. Mac'i sınırsız kuyrukla kilitlememek için en fazla **64 uçuşta istek**. Slot doluyken gönderilemeyen teklifler ayrı sayılır. Dolayısıyla 10.000 oturum, 10.000 açık bağlantı demek değildir. İstemci ve sunucu aynı Mac'tedir; bu rakamlar üretimdeki oyuncu sınırı olarak kullanılamaz.

## Önce / sonra

Aşağıdaki sonra verisi tanı günlüğü eklenen tekrar koşusudur. p95 yalnız başarılı dispatch→body yanıtlarına aittir; gönderilemeyen isteğin bekleme süresini içermez.

| Hedef istek/sn | Önce tamamlanan / sunulan | Sonra tamamlanan / sunulan | p95 önce → sonra | Sonra gönderilemeyen |
| --- | --- | --- | --- | --- |
| 100 | 1.999 / 1.999 | 1.999 / 1.999 | 18.6 → 6.8 ms | 0 |
| 500 | 3.035 / 9.995 | 9.826 / 9.997 | 494.2 → 118.4 ms | 171 |
| 2.000 | 2.968 / 39.984 | 10.836 / 39.996 | 653.1 → 190.1 ms | 29.160 |
| 10.000 | 2.452 / 199.930 | 8.836 / 199.917 | 866.8 → 220.6 ms | 191.081 |

100 istek/sn aşamasında sunulan 1.999 isteğin tamamı iki sürümde de karşılandı. Son koşuda 500 istek/sn aşamasının yaklaşık %98,3'ü, 10.000 aşamasının yalnız %4,4'ü gönderilip tamamlandı. **500 ve üstü aşamalar kapasite kabulünden geçmedi.** Son zamanlayıcı tikinden kalan planlanmış fakat sayılmamış teklifler ayrıca `lastTickGap` alanındadır (son koşu: 1/3/4/83). `completedPerSecond` sabit 20 saniyeye bölünür; drain dahil daha doğru değer `wallCompletedPerSecond` alanıdır (son koşu 10k: yaklaşık 440/sn).

İlk iyileştirilmiş koşuda 2.000 aşamasında 2.207 sınıflandırılmamış istemci/harness istisnası vardı. Bu başarısızlık saklanmadı. Hata sınıflandırma eklendi; ayrı 2.000 oturumluk 30 saniyelik tanı ve aynı 10.000 oturumlu tam tekrar koşusunda istisna oluşmadı. İlk olayın kesin nedeni doğrulanamadı; çözülmüş üretim hatası veya sıfır hata garantisi sayılmaz. Ham `after.json`, `diagnostic.json` ve `after-repeat.json` ayrı saklanır.

Doğrudan SQL sayacıyla, değişmeyen ilk tur / taze heartbeat koşulunda:
- Native: **5 SQL (1 yazma girişimi) → 1 SELECT**; cookie doğrulamasının ayrı SELECT'i iki tarafta da ayrıca vardır.
- Web watch: **3 SELECT → 1 SELECT**.
- Eski tam-yanıt istemcisi: **5 SQL → 3 SELECT**.
- Örnek native yanıt: **1.851 → 101 bayt**. Bu anlık değişmeyen durumdur; bütün oturumun ortalaması değildir.

Okuma yükü bittikten sonra 100 ayrı oyuncuda 10 eşzamanlı geçerli kelime + aynı isteğin tekrarı denendi. Her oyuncuda tek çizgi/tek skor doğrulandı. `p95PairMs` iki isteğin toplam süresidir; yük altında kelime ACK p95'i değildir.

## Doğrulama

- Yerel tam set: 1.010 test, 174 grup geçti; sonradan eklenen 64 aday sorgu regresyonu ayrıca geçti (toplam kaynakta 1.011 test).
- 749 izole Worker HTTP kontrolü: eski istemci, yeni koşullu protokol, misafir doğrulama, aynı tahta, sekiz özel/16 açık grup, kayıt ve sonuç güvenliği.
- Tip, içerik/312 manifesti, şema farkı, web ve mobil derleme geçti. Mobil paket 0.56.0 (49): 60 native dosya eşleşir.
- Lint: 427 mevcut hata / 159 uyarı; artış yok. Lint borcu bitmiş değildir.
- Native hook, saat-only yanıtın mevcut tahtayı değiştirmemesi, cursor transferi, SSE saat/heartbeat, görünürlük/abort, yeniden deneme, üyelik/expiry, moderasyon ve terminal makbuz regresyonları geçti.
- İki sınırlı bağımsız kaynak incelemesinde somut engelleyici regresyon bulunmadı; bunlar test ve cihaz kanıtı yerine geçmez.
- Bu tur yeni görsel/çizim değişikliği yok. Fiziksel iPhone, FPS, internet gecikmesi, 10.000 gerçek bağlantı, yük altında claim ve çok cihazlı Arena denenmedi.

## 10.000 oyuncuya ulaşmak için açık kapı

Mevcut tek D1 veritabanını saniyelik oda polling'iyle büyütmek yeterli kabul edilemez. Cloudflare tek bir D1 veritabanının sorguları sırayla işlediğini ve taşan kuyruğun overloaded hatasına dönebildiğini açıklar: https://developers.cloudflare.com/d1/platform/limits/ (16 Kasım 2026 kontrolü).

Sonraki altyapı adımı, oda başına olay yayınlayan ve odaları bağımsız çalıştıran sunucu katmanı (ör. Durable Objects/WebSocket), kalıcı oyuncu ilerlemesi/sonuçların mevcut kayıt sözleşmesiyle korunmasıdır. Eşleştirme bölümlenmeli; ortak Arena içerik sayacı ve tek sıcak odanın CAS çakışması da ölçülmelidir. Ham progress silme/taşıma bu paket için gerekmiyor.

Geçişin güvenli sınırı: eski açık odalar eski runtime'da tamamlanır; yalnız yeni test odaları yeni protokole geçer. Kimlik/üyelikten üretilen kısa ömürlü bağlantı bileti, anlık kelime ACK, tekrar engeli, tur çiti ve tek terminal makbuz korunur. Native JSON köprüsü SSE taşımadığı için native bağlantı da ayrıca uygulanıp test edilir. Bu mimari bu pakette etkinleştirilmedi.

Uzak izole ortamda önce gerçek hosting kotası ve bütçe sınırı doğrulanmalı, ardından 100→500→2.000→10.000 bağlantılı uzun koşuda eşleştirme, kelime ACK p95/p99, kopma/geri dönme, toplu sonuç ve süre sonu birlikte denenmeli. Aday kabul: 30 dakika steady load, ACK p95<250 ms/p99<750 ms, hata<%0,1, sıfır yanlış skor/çift ödül ve bütün teklifler için kuyruk takibi. Bunlar bu çalışmada sağlandığı iddia edilmeyen hedeflerdir; ürün/bölge bütçesine göre gözden geçirilir.

Sites hesabının üretim kotasına, fiyat planına ve ayrı oda-runtime binding'ine bu testlerden karar verilemez. Yeni ücretli altyapı açılmadı. **Bu kapı geçmeden 10.000 kişilik eşzamanlı Arena duyurusu yapılmamalı.** Tek kişilik bölümlerin cihazda çalışması farklı yük profilidir; 10.000 kurulum ile 10.000 Arena oyuncusu aynı şey değildir.

## Kanıtlar ve geri dönüş

`../world-review.nosync/arena-capacity-0560/`: before/after/after-repeat/diagnostic JSON ve günlükleri, query-counts.json, kapı günlükleri, baseline-0550.bundle. Yük üreticisi her koşu sonunda geçici Worker ve DB'yi kapatır.

0.55.0 kaynak kaydı ve Sites111 saklıdır. Şema/kayıt değişmedi; eski sunucu yeni `after` parametresini yok sayarak tam yanıt verebilir, eski istemci de yeni sunucudan tam yanıt alır. Geri dönüş gerçek oyuncu verisini eski yedekle değiştirmez. GitHub/CI/Sites eşleşmesi ve yayın makbuzu yayın adımında ayrıca kaydedilir; bu belge tek başına yayın kanıtı değildir.
