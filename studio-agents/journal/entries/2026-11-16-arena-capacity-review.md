# Arena kapasite incelemesi — 16 Kasım 2026

0.55.0 kaynağında sınırlı, salt okunur inceleme. Uygulama/test değiştirilmedi; test, üretim trafiği veya yük çalıştırılmadı. Aşağıdaki sayılar kaynak akışından hesaplanan SQL statement sayısıdır; D1 fatura satırı, gerçek throughput veya 10.000 eşzamanlı oyuncu kanıtı değildir. Yeni ücretli altyapı önerilmedi.

## 1. Değişmeyen canlı oda için tam görünüm üretimi

Kaynak: `app/api/live/route.ts:13,22-28`; `lib/game/server.ts:95-112,179`.

SSE, 22 saniye boyunca 650 ms bekleyerek `watch()` çağırıyor. `watch()` oda revision'ı değişmese bile `publicView()` çalıştırıyor. Her olağan tick en az 1 oda SELECT + 2 name-lock SELECT yapar. Tamamlanmış tur varsa yeni revision için series CTE de çalışır. Oda sıralaması ve board da tekrar hazırlanır; route sonunda değişmeyen revision için bu görünüm atılır.

SQL süresinin sıfıra yakın olduğu varsayımsal istek hızında 10.000 açık SSE × 1/0,65 = yaklaşık 15.385 watch/sn; en az 46.154 SELECT/sn. Gerçek döngüye SQL gecikmesi ve reconnect boşlukları eklendiğinden bunlar ölçülmüş throughput değildir. Heartbeat, reconnect, claim ve eşleştirme bunlara dahil değildir.

En küçük öneri: `watch` bilinen revision'ı kabul etsin; üyeliği doğrulanmış ve değişmemiş odada publicView üretmeden küçük bir unchanged sonucu döndürsün. Başka kullanıcının odasına erişim engeli, süre bitiminde settle ve eşleştirme nedeniyle oda transferi kısa devreden önce işlenmeli. SSE'nin üç saniyelik clock mesajı ve 650 ms değişiklik algılaması korunmalı. Bu, sıradan değişmeyen tick'i 3→1 statement'a indirir; tek başına 10.000 oyuncu ölçeğini çözmez. Paylaşılan oyuncuya özel view cache önerilmez.

Kabul: aynı oda/revision için ikinci watch yalnız tek oda okuması; yetkisiz oyuncuya 403; süre dolunca sonuç; heartbeat ve watch üzerinden transfer; istemci saat akışı; cancel/abort sonrası sorgu yok. `tests/live-room-transfer.test.ts` gerçek route'u VM ile çalıştırır ve transfer için hazır başlangıçtır. Name moderation revision değiştirmez; değişmiş bir view gönderildiğinde restriction mutlaka tekrar okunmalıdır. Geçerli davranışta da değişmeyen revision'lı moderasyon görünümü wire'a gönderilmiyor.

## 2. Heartbeat sonucunun atılması ve bitmiş turun tekrar yazma girişimleri

Kaynak: `app/api/live/route.ts:25-27`; `lib/game/server.ts:43-46,48-73,172-203`.

Her yaklaşık 5,2 saniyede `state()` expiry UPDATE, active-room SELECT, mutate room SELECT, room CAS UPDATE ve iki name-lock SELECT çalıştırır (çakışmasız aktif ilk tur için yaklaşık 6 statement; series miss varsa +1). Route bu view'ı atıp hemen `watch()` ile aynı odayı tekrar okur. 10.000 açık bağlantıda ideal heartbeat aralığıyla yaklaşık 1.923 state/sn; her biri oda revision'ını da artırarak diğer izleyicilerde view üretimini tetikler. Aynı oda üzerindeki çok sayıda oyuncu ve 64'e kadar CAS denemesi bunun maliyetini artırabilir.

`save()` finished oda üzerinde her seen/rematch/leave yazımında N oyuncu için sonuç INSERT OR IGNORE'larını yeniden dener. Legacy iki kişilik quick düelloda ayrıca iki rating SELECT ve beş rating/rating-event yazma statement'ı tekrar hazırlanır. İdempotent olması tekrar işini ucuz yapmaz. `active()` expiry UPDATE de aktif ve sağlıklı lease için no-op yazma statement'ıdır.

En küçük öneriler: heartbeat'te dönen authoritative view doğrudan route'un gönderim/revision hesabında kullanılsın, o tick'te ikinci watch çağrılmasın. Sonuç/rating receipt statement'ları yalnız yeni terminal geçişte veya yeni tur receipt'inde oluşturulsun; mevcut atomik room+receipt batch ve CAS guard korunsun. Lease temizliği optimize edilecekse önce active row okunup yalnız süresi dolmuş lease koşullu olarak temizlensin; eşzamanlı yenileme ve başka odaya geçiş guard'ları korunsun. Bunları bir anda tek büyük değişikliğe bağlamak gerekmez.

Kabul: ilk finished geçişinde tüm sonuçlar ve rating event bir kez; 10 finished heartbeat'ten sonra played/wins/score/Elo değişmez ve receipt/rating SQL sayısı sıfır; yarışan iki settle/leave/rematch sonucu eksiltmez veya çoğaltmaz. Eski finished snapshot ve varsa legacy eksik receipt varsayımı ayrıca karara bağlanmalı; yalnız phase kontrolü geçmiş eksik kayıtları onarma davranışını kaldırabilir. Önce test verisinde atomic receipt invariant'ı doğrulanmalı. SSE heartbeat view'ı transferi ve yeni revision'ı aynen iletmeli; turun ilk başlangıcı ve timeout ötelenmemeli.

## 3. Görünüm başına moderasyon ve seri toplamı çoğalması

Kaynak: `lib/game/server.ts:32,95-112`; `app/api/live/route.ts:13`; `app/api/game/route.ts:11`; `lib/game/safety-service.ts:28-38`.

İki ayrı restriction SELECT aynı view içinde current/lastResult oyuncuları ve series oyuncuları için çalışır; ikinci sorgu receipts boşken de çalışır. Series cache anahtarına revision eklenmiştir. Bir skor/seen değişikliği tamamlanmış turları değiştirmediği halde aynı sonuç tablosunu tekrar toplatır. Cache servis örneğine bağlıdır: SSE'de en çok 22 saniye, normal HTTP'de yalnız o istek boyunca yaşar. Her izleyici aynı oda serisini ayrı hesaplar.

En küçük öneri: series receipts önce alınıp current + lastResult + receipt ID birleşimi için tek restriction sorgusu yapılarak 2→1 SELECT; sonra bütün isimler aynı güncel restriction sonucundan maskelenir. Series cache'i completed round ile ilişkilendirmek ikincil adaydır; historical nickname ve moderation değişikliği için tazelik sınırı açık olmalı. Salt revision anahtarını silip sınırsız/stale isim önbelleği kurulmamalı. Moderasyon sorgusunu güvenlik pahasına kaldırmak önerilmez.

Kabul: hiç geçmişi olmayan oda, geçmişte olup odadan ayrılan oyuncu, current player, lastResult ve series içinde isim sıfırlama aynı response'ta maskelenir. Aynı completed-round için score/heartbeat değişiminde wins/draws/round totals korunur; yeni finished turda cache invalidation; eşitlikte sıralama ve silinen oyuncu korunması. SQL instrumentation ile view başına restriction sorgusu en çok bir olmalı.

## İkinci sıra bulgular ve kimlik maliyeti

- `pairWaiting()` (`server.ts:150-155`) 64 adayın her birine sırayla `blockedRoom()` SELECT çağırabilir. Yeniden bağlanan yalnız oyuncuların kümelendiği testte bu N+1 yol ayrıca ölçülmeli. Engelleri aday kümesi için topluca okuyup aynı deterministik çiftleme filtresini korumak sonraki küçük adaydır; yanlış eşleşmeyi önleyen DB guard/trigger kaldırılmamalı.
- `allocate()` (`server.ts:117-131`) tüm oyuncu geçmişini SQL pencere/JSON aggregate ile toplar; 128 aday boyunca ayrı seen SELECT yapabilir. Eski tahta/kelime tekrarsızlığı değiştirilmeden uzun geçmişli start senaryosu ayrı ölçülmeli. Taze içerik seçimini sadeleştirmek için tekrar kuralı zayıflatılmamalı.
- `/api/live` kimliği yalnız reconnect girişinde doğrular. Guest için 1 indexed session SELECT + SHA-256; native için 1 deleted-player SELECT; email için JWT doğrulama, 1 account SELECT ve 1 deleted-player SELECT vardır. Firebase lookup cache'i 512 entry/30 saniyedir, JWT doğrulama cache'ten önce çalışır (`lib/auth/verify.ts:7-27`). Identity provider yükü yerel guest/native sentetik testinden çıkarılamaz.
- Her SSE açılışında rate limiter 1 upsert + 1 count SELECT; bazen 1 sınırlı cleanup DELETE yapar (`security.ts:4-13`). 22 saniyelik akışla 10.000 bağlantı için reconnect boşluğu yok varsayımında yaklaşık 455 yeni istek/sn. SSE süresini uzatmak runtime/CPU/subrequest sınırı doğrulanmadan düşük riskli çözüm sayılmamalı.
- `/api/game` email GET, `currentPrincipal`/account lookup'u ön kontrol ve `gameMember()` içinde iki kez yapar (`route.ts:21-24`). Aynı request içinde principal/account paylaşımı güvenli küçük adaydır; endpoint'in needsVerification/needsUsername davranışı ve deletion kontrolü korunmalı.

## İzole ölçüm kabulü

`scripts/verify-worker.mjs:22-35` mevcut build'i Miniflare ve ayrı D1 `integration` ile başlatır. Buradaki native kimlik başlıkları yalnız trusted isolated harness'a özeldir; üretimde sahte başlıkla yük gönderilmemeli. Test katmanları ayrı raporlanmalı:

1. Statement instrumentation ile değişmeyen watch, heartbeat, finished heartbeat, series, start ve queue resume için before/after sayımları; batch tek ağ çağrısı olsa da içindeki her SQL ayrı sayılır. No-op write statement ile gerçekten değişen row ayrılır.
2. Yerel Worker HTTP: düşük eşzamanlılıktan yükselen 25/100/250/500 istemci, 2/8/32 kişilik farklı odalar ve tek sıcak oda. SSE kurulum hızı ile açık eşzamanlı bağlantı sayısı ayrılır. Claim ACK p50/p95/p99, hata/409 oranı, SSE değişiklik gecikmesi, DB statement sayısı, event-loop gecikmesi ve resident memory raporlanır. Reconnect dalgası ve farklı istek zamanlarına dağıtılmış oturumlar ayrı çalıştırılır.
3. 10.000 kapasite iddiası yalnız gerçekten 10.000 açık istemciyle yeterli süreli uçtan uca ölçümden ve kullanılan platform limitlerinin doğrulanmasından sonra değerlendirilebilir. Servis çağrısı veya yerel kısa sentetik iş yükü bu iddia için yeterli değildir. Ücret artırmadan yapılan optimizasyonun sonuçları dürüstçe yerel ölçüm olarak verilmeli.

İlerleme/ödül/katalog/mobil çizim dosyaları bu inceleme kapsamı dışındadır ve değiştirilmedi. Fiziksel parmak hissi, FPS, gerçek iki cihaz Arena ve üretim kapasitesi bu notta doğrulanmış değildir.

## İkinci inceleme: uygulama diff'i ve yük üreticisinin iddia sınırı

Koordinatörün hazırladığı kaynak diff'i, `scripts/arena-load.mjs` ve `../world-review.nosync/arena-capacity-0560/before.json` salt okunur incelendi. `after.json` bu inceleme sırasında henüz yoktu. İkinci incelemede de uygulama/test değiştirilmedi ve CPU yoğun iş ya da yük testi başlatılmadı.

### Kaynak diff'i

- `watch` kısa yolu oda JSON'unda kullanıcı üyeliğini, eşleştirme transferini, expiry ve deadline'ı kontrol ettikten sonra uygulanıyor. Güncel view gerektiğinde moderation sorgusu korunuyor. SSE heartbeat görünümünün aynı tick'te yeniden `watch` ile üretilmesi kaldırılmış. Kaynakta bu değişikliklere bağlı somut doğruluk veya performans engeli bulunmadı; bu gözlem test başarısı değildir.
- `poll` aktif membership SELECT'ini kullanıyor; aynı oda/revision, geçerli lease, ayrılmamış oyuncu, beş saniyeden yeni seen ve aktif/finished faz koşulları birlikte sağlanınca unchanged döndürüyor. Yeni oda ve deadline bu yoldan atlanmıyor. İstemci ilk okumada `after` göndermiyor; sonraki okumada yalnız full snapshot'tan alınan revision kullanıyor. Native koşullu endpoint testi üretimde SSE ile aynı taşıma değildir.
- `publicView` restriction ID birleşimi current, lastResult ve series kullanıcılarını içeriyor. Series cache revision anahtarı bu diff'te korunmuş; önbellek tazeliği konusunda yeni gevşeme yok.
- `pairWaiting` aday blok grafiğini tek SELECT ile alıp her current+candidate birleşimindeki her iki yönlü blok ilişkisini aynı anlamla süzüyor. Kararlı sıralama/çiftleme ve kayıt guard'ları değişmiyor. 64 tek kişilik aday için küme en çok 65 oyuncudur; SELECT bütün veritabanı bloklarını istemez. En yoğun olası kümede JS filtreleme maliyeti artar ama mevcut alan sınırlıdır. Somut engelleyici hata bulunmadı. Düşük öncelikli fırsat: aday listesi boşsa önceki sürüm hiç blok sorgusu yapmazken yeni sürüm tek SELECT yapıyor; boş listede sorgu atlanabilir. Başka adaylar arasındaki blokların ilgisiz adayı yanlış elememesini, actor→candidate ve candidate→actor yönlerini ölçen kabul örneği yararlı olur.

### before.json'ın doğru okunması

| Aşama etiketi | Sunulan | Başlatılan / tamamlanan | Üreticide gönderilmeyen | En çok uçuşta | Raporlanan completed/20 sn |
| --- | ---: | ---: | ---: | ---: | ---: |
| 100 kullanıcı × 1 istek/sn | 1.999 | 1.999 | 0 | 11 | 100,0/sn |
| 500 kullanıcı × 1 istek/sn | 9.995 | 3.035 | 6.960 | 64 | 151,8/sn |
| 2.000 kullanıcı × 1 istek/sn | 39.984 | 2.968 | 37.016 | 64 | 148,4/sn |
| 10.000 kullanıcı × 1 istek/sn | 199.930 | 2.452 | 197.478 | 64 | 122,6/sn |

10.000 etiketli aşamada tekliflerin yaklaşık %1,23'ü gönderilip tamamlanmış, %98,77'si üretici sınırında gönderilmemiş. `errors=0`, yalnız başlatılan istekler için HTTP/parse başarısıdır; bütün sunulan yükün taşındığı anlamına gelmez. `allOfferedServed=false` doğru sonucu verir. 10.000 gerçek eşzamanlı istek veya açık SSE bağlantısı kurulmamıştır. 10.000 kimlik/5.000 oda fixture'da bulunur, aynı anda en çok 64 GET çalışır. Aşama başına farklı kimlik sayısı ayrıca tutulmadığından bütün 10.000 kimliğin gerçekten istek yaptığı da rapordan çıkarılamaz.

`p50/p95/p99`, başarıyla tamamlanan isteklerde dispatch başlangıcından body okunmasına kadardır. Gönderilmeyen teklifler, planlanan saat ile gerçek dispatch arasındaki scheduler gecikmesi ve hatalı istekler bu dağılımda yoktur. Bu nedenle p95'i bütün tekliflerin veya oyuncuların gecikmesi olarak etiketlememek gerekir.

`completedPerSecond` tamamlananları sabit 20 saniyeye böler; uçuşta kalan işler bu pencerenin sonrasında drain edilip completed sayısına eklenir. Örneğin 10.000 aşamasının toplam elapsed süresi 20,308 sn, toplam wall throughput yaklaşık 120,7/sn'dir; 122,6/sn offered-window normalizasyonudur. Önce/sonra tabloda ya her iki tanım açık verilmeli ya da `completed / (elapsedMs/1000)` aynı biçimde hesaplanmalıdır. Fark bu kayıtta küçük; kapasite sınırı yorumunda tanım yine önemlidir.

### Harness kapsamı ve karşılaştırma sınırı

- Yerel/ephemeral Miniflare, gerçek cookie doğrulaması ve sentetik DB ayrımı açık. Remote URL veya production credential seçeneği yok. Bu güvenli izolasyon yaklaşımı uygun.
- Ölçülen akış `/api/game?action=room` GET'tir. `--conditional` yalnız `after` ekler. 650 ms SSE watch döngüsü, açık stream sayısı, 22 saniyelik reconnect ve SSE backpressure bu harness ile yük altında ölçülmüyor. Native transport da doğrudan yerel dispatch üzerinden taklit edilir; fiziksel bridge/network gecikmesi yoktur.
- 1 istek/sn/user sunumu sabit oranlı stres senaryosudur. Gerçek native istemci başarılı cevaptan sonra 1 saniye bekler; gerçek döngünün hızı yanıt süresiyle azalır. Böylece bu test, gerçek istemci simülasyonundan çok sunulan yük testi olarak adlandırılmalıdır.
- Tek sentetik board, ikişer oyunculu 5.000 friend/group oda, bir completed geçmiş tur ve uzatılmış deadline kullanılıyor. Başlangıç, taze içerik tahsisi, uzun seri/oyuncu geçmişi, 32 kişilik sıcak oda, eşleştirme/blocked graph ve timeout bu okuma aşamalarında yoktur. Rapordaki “generation/matchmaking tested separately” açıklaması yalnız ayrıca somut test kanıtı gösterildiğinde böyle sunulmalı; bu script içinde onlar çalıştırılmıyor.
- Claim+exact retry kontrolü dört okuma aşamasından sonra ve 10 concurrency ile yapılır. 100 oyuncu/200 request için tekrarda tek stroke/aynı score doğrulaması faydalıdır. Bu, okuma yükü sürerken claim ACK gecikmesi veya aynı odada çarpışan claim/CAS testi değildir. `p95PairMs` ilk claim ve tekrarın birlikte süresidir; tek claim ACK p95 diye yazılmamalı.
- Dört aşama aynı ephemeral DB üzerinde sırayla çalışır; seen/revision ve cache ısınması bir sonraki aşamaya taşınır. Before/after aynı sıra ve fixture'ı kullandığında karşılaştırma yapılabilir, fakat tek 20 saniyelik koşu kararlı üst kapasite veya istatistiksel güven aralığı vermez. Aynı Mac üzerinde test üreticisi ve D1 kaynak paylaşır.
- Generator her başarılı tam yanıtta owner doğrulamak için `sessions.indexOf(s)` yapıyor; en kötü 10.000 eleman taraması generator maliyetidir. İleride `index` fixture alanı ile kaldırılabilir. Mevcut before/after aynı generator'ı kullandığı sürece bunu sonuç değişikliğinin ölçülmüş nedeni saymak doğru değildir.
- Gelecek harness iyileştirmesi: distinctStarted/Completed identities, teklif→dispatch gecikmesi, generation window ve drain süresini ayrı alanlar, dropped oranı, gerçek wall throughput, event-loop/memory örnekleri ve claim'leri okuma yüküyle eşzamanlı ayrı bir senaryo. Bu inceleme sırasında bunlar eklenmedi veya çalıştırılmadı.

Önerilen teslim ifadesi: “10.000 sentetik kimlikli, en çok 64 istek uçuşta olan yerel yük üreticisinde önce/sonra ölçüm yaptık; üreticinin gönderemediği istekleri ayrıca saydık. 10.000 eşzamanlı gerçek oyuncu kapasitesi doğrulanmadı.”
