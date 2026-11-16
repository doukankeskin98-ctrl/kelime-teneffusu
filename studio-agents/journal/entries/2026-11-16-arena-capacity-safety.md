# Arena kapasite iyileştirmesi — güvenilirlik sınırları

16 Kasım 2026, kaynak 0.55.0. Salt okunur güvenilirlik incelemesi. Uygulama, test, göç veya canlı veri değiştirilmedi; test/benchmark çalıştırılmadı. Bu belge yük testi sonucu veya 10.000 eşzamanlı oyuncu kapasite onayı değildir. Yalnız atanmış günlük dosyası yazıldı.

## 1. Öncelik: değişmeyen okumayı ucuzlat; durum bakımını kaybetme

**Kaynak:** `app/api/live/route.ts:13–28`, `lib/game/server.ts:43–46,95–112,142–205`, `lib/platform/room-poll.ts:3–14`, `components/game/useLiveRoom.ts:12–19`.

SSE her 650 ms sonrasında `watch` çağırıyor. `watch` değişmeyen revizyonda bile oda satırını okuyor ve `publicView` hazırlıyor; normal ilk turda iki ayrı isim kısıtlama sorgusu daha çalışıyor. Henüz değişiklik olup olmadığı ancak bundan sonra route'ta karşılaştırılıyor. Sorgu süresini sıfır varsayan salt aritmetik, 10.000 açık SSE için yaklaşık 15.385 watch/s ve en az 46.154 SQL statement/s verir; heartbeat, kimlik ve diğer işlemler hariçtir. Bu ölçülmüş trafik veya D1 fatura satırı sayısı değildir.

Native polling her yanıt sonrasında 1 saniye bekliyor; `/api/game?action=room` doğrudan `state` çağırıyor. `state` salt okuma değildir: süresi biten üyelikleri kapatır (`active` içindeki UPDATE sıfır satır değiştirirken de çağrılır), etkin odayı bulur, ilk turda bekleyen kuyrukları eşler, oyuncu varlığını yeniler, ayrılan/zaman aşımına uğrayan son hazır olmayan katılımcı sonrasında hızlı grubu başlatabilir ve süre dolan sonucu kesinleştirir.

**Önerilen küçük değişiklik:** Yetkili ve değişmeyen revizyon için tam görünüm hazırlamadan dönme. Kimlik/oda üyeliği, emekli kuyruktan yeni odaya geçiş ve sunucu deadline kontrolü atlanmamalı. `state` bakım yolu kontrollü aralıkla ve ilk bağlantı/foreground/reconnect sırasında sürmeli. SSE saat olayları korunmalı. Bir SSE bağlantısı içindeki son yetkili snapshot yeniden kullanılabilir; kullanıcının yetkisini oda ID'sinden varsayan ortak cache kullanılamaz.

**Zaman sınırları:** `online` eşiği 15 saniye (`server.ts:86`), hızlı grup starter eşiği 30 saniye (`:80`), heartbeat yazma eşiği 5 saniye (`:200–201`). Poll azaltılırken bu eşikler ve ağ gecikmesi payı birlikte değerlendirilmelidir. Saat/golden/online zamanla değiştiği için revizyon tek başına bütün görünümün sonsuza dek geçerli olduğunu söylemez. Aktif maç deadline'ı revizyon değişmese de terminale geçmelidir.

**Kabul:** Değişmeyen tur için azaltılmış SQL sayısı ölçülür; 15/30 saniye sınırlarında yanlış çevrimdışı/roster düşürme olmaz; eski kuyruğun SSE ve native okuması yeni odaya geçer; deadline ilk sonraki okumada tek sonuç üretir. Native polling gizliyken durur, sıradan poll'lar üst üste binmez, iptal edilen eski yanıt yazılmaz.

## 2. Öncelik: cache'in yetki, oyuncu ve terminal kayıt sınırları

**Kaynak:** `lib/auth/server.ts:16–27,41`, `lib/auth/guest.ts:8–11`, `app/api/game/route.ts:25,29–43`, `lib/game/server.ts:48–73,81–112,180–203,278–283`, `db/schema.ts:5–6,29–30`.

`RoomView` kişiseldir: `you.strokes`, `you.score`, rakip özeti ve onaylanan bilmecenin etiketi kullanıcıya göre değişir. Oda ID'siyle anahtarlanmış ortak `RoomView` başka oyuncunun durumunu sızdırır/karıştırır. Kimlik sunucudaki `gameMember` ile alınmalı; istemcinin owner/room/revision bilgisi yetki kanıtı değildir. Ayrılmış oyuncunun geçmiş oda okuması mevcut sözleşmede mümkünken mutasyon için etkin üyelik aranır; okuma optimizasyonu bu iki davranışı istemeden birleştirmemeli.

Seri sonucu yalnız kalıcı `results` kayıtlarından ve döndürülen snapshot'ın tamamlanmış tur sınırına kadar türetilir. Mevcut `seriesCache` servis örneği başınadır ve `room:completed:revision` anahtarlıdır; aynı tamamlanmış turlar için heartbeat revizyonu yeni sorgu açar. Daha uzun yaşayan cache düşünülecekse DB/ortam nesnesi sınırı, tamamlanmış tur, süre/kapasite sınırı ve başarısız Promise temizliği açık olmalı. Kullanıcı adı/kısıtlama ve aktif roster cache dışından güncel uygulanmalıdır; başka bir işlem bunları oda revizyonu olmadan değiştirebilir. Eski snapshot'a gelecekte tamamlanan turun makbuzunu eklemek yasaktır.

**Korunacak yazma işlemi:** Her `ready/start/claim/next` güncel oda satırında CAS tekrarından geçer. `expectedRound` fence, etkin üyelik/lease kontrolü, `writeToken` ile aynı batch'e bağlı sonuç/rating/üyelik/içerik makbuzları, `(room:round,user)` sonuç tekilliği ve `one_active_room_per_player` kalmalı. Mutasyon cached snapshot'a uygulanamaz ve cached cevapla kabul edilmiş sayılamaz. Havuz tahsisi ile `arena_seen` kaydı ayrılmamalı; içerik hatasında eski kayıtlar silinmemeli.

**Anında onay:** `components/game/Arena.tsx:93–100` yerel doğru kelimenin ses/dekorasyonunu hemen başlatır; resmi raf, skor ve sonuç sunucudan gelir. Claim yanıtı poll turunu beklememeli. `accept` içindeki owner, oda, revizyon ve aynı revizyonda `serverNow` sırası (`:43–49`) korunmalı; SSE terminalinden sonra gelen eski HTTP ACK geri dönüş üretmemeli. Yeni paralel claim kuyruğu bu maliyet işi için gerekli değildir.

**Kabul:** Aynı odada iki farklı kullanıcı farklı kendi stroke'larını görür; yabancı üye cached/uncached yollarda reddedilir; isim kısıtlaması/ayrılma/hesap silme cache nedeniyle canlanmaz. Aynı claim iki kez puan kazandırmaz; eski tur mutasyonu yeni turu değiştirmez; yarışan next tek sonraki tur açar; sonuç ve rating tam bir kez yazılır; eski snapshot seri sonucu gelecekteki turu içermez.

## 3. Öncelik: yük testinde kabul gecikmesini ve sıcak yazma noktalarını ayrıca ölç

**Kaynak:** `app/api/game/route.ts:18,25,34`, `app/api/live/route.ts:11,22–25`, `lib/game/security.ts:4–13`, `lib/game/server.ts:54–59,114–140,155–168,181,209,230–245`.

Oda GET'i mevcut kaynakta rate limit kullanmıyor. POST, `game:<user>` için 180/dakika; SSE bağlantı açma `live:<user>` için 30/dakika. Limit bir SQL upsert ve ayrı count okumasıdır. Oda okumalarını aynı POST kotasına eklemek, birden çok sekme/cihazda gerçek kelime işlemlerini kısıtlayabilir ve ucuzlaştırılmak istenen her okumaya yazma ekler. Ayrı okuma bütçesi gerekiyorsa bu maliyet ve normal istemci frekansı ayrıca ölçülmeli. SSE açılış kotası açık stream sayısına doğrudan bir üst sınır değildir; 22 saniyelik stream ömrü boyunca çoklu bağlantı yük profiline dahil edilmelidir. Mevcut rate limit yarışında count okuması kendi artışından sonraki başka artışları görebilir; sınır çevresinde fazla ret olabilir, limit aşımını kabul etme kanıtı değildir.

Okuma azaltımı bütün ölçek sorunlarını çözmez: aynı odanın JSON satırı tüm claim/ready/heartbeat yazmalarında ortak CAS noktasıdır; içerik havuzu başına tek `arena_pool` satırı başlangıçlarda ortak tahsis noktasıdır. CAS döngüleri 64 denemeyle sınırlıdır. Hızlı grup kuyruk seçimleri aynı ilk slotta yoğunlaşabilir; kurtarma eşlemesi 64 aday üzerinden blok denetimi yapar. Bunlar kaynakta görülen yoğunlaşma noktalarıdır; 10.000 oyuncuda hata verdiği bu incelemede kanıtlanmadı.

**İzole yük kabulü:** Native okuma ve SSE, ilk tur/çok turlu seri, hazır/claim/next, yeniden bağlanma ve başlangıç burst'leri ayrı raporlanmalı. DB statement/okunan-yazılan satır, yanıt boyutu, claim ACK p50/p95/p99, 409/429/503 oranı, kayıp/çift skor ve sonuç sayısı kaydedilmeli. Çoğu isteği salt bekleme okuması olan bir 10.000 sanal kullanıcı çalışması, 10.000 aktif yarışmacı kabulü değildir. Test DB'si ve oyuncu kimlikleri üretimden ayrı olmalı; reset yalnız bu fixture'a uygulanmalı.

## Mevcut dar regresyon haritası

- `tests/arena-multiplayer.test.ts`: 4/8/16 katılımcı, ortak deadline/tahta, eşzamanlı skor, reconnect, tek next, eski tur fence, tahsis rollback, expiry/tek üyelik, geç rematch/leave yarışı.
- `tests/arena-series.test.ts:48–65`: kalıcı galibiyet/beraberlik, servis yeniden açılışı, snapshot sonrası gelecek makbuzun dışlanması.
- `tests/quick-match-resume.test.ts` ve `tests/live-room-transfer.test.ts`: eşleme kurtarması, atomik üyelik transferi, ayrılan/engellenen oyuncu, SSE'nin yeni oda ID'sini izlemesi.
- `tests/quick-group-start.test.ts:32–46`: son hazır olmayan üyenin ayrılması/eskimesi sonrasında tek başlangıç; hayalet içerik makbuzu yok.
- `tests/native-transport.test.ts:44–48`: polling gizlenme, eski yanıtı bırakma ve üst üste binmeme.
- `tests/arena-terminal.test.ts:60–67,94,193`, `tests/word-feedback.test.ts`, `tests/arena-clock.test.ts`: anında yerel sunum, resmi kabul ayrımı, eski ACK/terminal sırası, deadline, arka plan ve saat.
- `tests/concurrency.test.ts`: 24 oyuncu/12 ranked oda, kayıp hamle/çift rating/tek üyelik; kapasite benchmark'ı değildir.
- `tests/studio.test.ts:90–93`, `tests/account-safety.test.ts`, `tests/auth.test.ts`: yabancı watch reddi, silinen/engellenen profil ve kimlik sınırları.

Yeni fast-path için gerekli ilave kanıt: aynı revizyon cevabının yetki/deadline/transfer sınırları; tam görünüm sorgularının gerçekten atlandığı statement sayımı; ayrı servis/DB cache izolasyonu; snapshot-tur sınırı; claim ACK'in polling yavaşlatmasından bağımsız kalması. Test fixture'ı (`tests/fixtures.ts:5–16`) bellek içi SQLite'tır; yerel başarısı Cloudflare gecikme/bağlantı/üretim kapasitesi kanıtı değildir.

## Uygulama sonrası dar diff incelemesi

Koordinatörün `lib/game/server.ts`, iki API route'u, `components/game/useLiveRoom.ts` ve `lib/platform/room-poll.ts` değişiklikleri; yeni `tests/arena-capacity.test.ts`, polling backoff kabulü ve ilgili Worker kontrolleri salt okunur incelendi. Bu ikinci incelemede test/benchmark çalıştırılmadı; bildirilen test başarıları bağımsız tekrar edilmiş sonuç diye sunulmaz. İncelenen diff'te somut yeni güvenlik/uyumluluk gerilemesi bulunmadı.

- `active()` ortak yolda üyelik indeksinden okur; yalnız süresi bitmiş oda gördüğünde temizleyip yeniden okur. İkinci okuma eşzamanlı yeni üyeliği yakalar. Mutasyonların lease/CAS korumaları yerinde.
- `poll()` unchanged yolu yalnız etkin üyelik, istenen oda, aynı revizyon, geçerli lease, ayrılmamış oyuncu ve 5 saniyeden yeni presence altında aktif/bitmiş odalara uygulanır. Waiting/ready bakım işi, yeni etkin odaya geçiş, deadline ve expiry tam state yolunu kullanır. 5 saniye eşiğinde tam görünüm ve moderasyon yeniden okunur; bu zamanlayıcı/ağ gecikmesinden bağımsız katı 5.000 ms teslim garantisi değildir.
- `watch(after)` oyuncu kontrolünü ve transfer/deadline/expiry işini revizyon fast-path'inden önce yapar. SSE yaklaşık 5 saniyelik state bakımını korur; alınan heartbeat görünümü ikinci gereksiz watch yerine kullanılır. Oda değişimi revizyon eşit olsa bile gönderilir; terminal işlemden dönen gerçek `view.revision` kullanılır.
- Kişisel veya DB'ler arası ortak cache eklenmemiştir. Mevcut servis içi seri cache'in tamamlanmış tur/revizyon sınırı korunur. Birleştirilmiş moderasyon sorgusu mevcut roster, önceki sonuç ve seri makbuzlarının kimlik birleşimini kapsar; isim maskesi görünüm kurulmadan uygulanır.
- Terminal makbuz/rating işi yalnız aynı turun zaten bitmiş satırında tekrar edilmez. İlk active→finished geçişi aynı CAS/batch ile sonuçları yazar; stale writer CAS'ı kaybederse ödül üretmez. Kalıcı sonuçlar, mevcut satırlar ve uygulanmış göçler değiştirilmemiştir.
- Toplu blok okuması her aday için aynı ikili küme koşulunu uygular. Eşzamanlı engellemenin DB `blocked_rooms_insert/update` trigger koruması yerinde. Native unchanged cevabı `onRoom` üretmez, saat senkronunu sürdürür; eski tam-state istemcileri çalışır. Poll backoff yalnız hatada devreye girer, başarılı cevapta normal aralığa döner; generation/abort/visibility koruması korunur.

Kaynak incelemesi, üretim yük kapasitesi veya fiziksel cihaz gecikmesi kabulü değildir. Yeni hedefli testlerin, ikinci yük turunun ve yayın kontrollerinin gerçek çıktıları koordinatörün teslim kaydına aittir.
