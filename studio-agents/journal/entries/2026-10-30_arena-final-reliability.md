# 30 Ekim 2026 · Arena son güvenilirlik incelemesi

Rol: güvenilirlik. Kök AGENTS, rol AGENT/RULES/HEARTBEAT/MEMORY/RUNBOOK, stüdyo README, güncel README/sürüm/harita/geliştirme/öncelik bağlamı, arena-fit-decision ve arena-scale-reliability okundu. Uygulama, testler, şema ve yayın salt okunur; yalnız bu benzersiz günlük yazıldı. Canlı veri, kimlik veya başka proje üzerinde işlem yok.

## İlk düzeltmelerin bağımsız kontrolü

Kaynakta ayrılan oyuncunun aktif üyeliği CAS kazanan writeToken'a bağlı kapatılıyor; yeni round başlangıcında ortak tahta ve bütün katılımcıların kalıcı kelime/grid imzaları aynı batch içinde. Eski aktif odalar roomPuzzle fallback'iyle aynı engine/seed/level'ı kullanıyor; uygulanmış 0000–0003 göçleri değişmedi. 0004 yalnız arena_seen ve arena_pool ekliyor. Takip eden ilk inceleme düzeltmeleri okundu:

- Geçerli fakat 8×8'e sığmayan adaylar null ile atlanıyor; bounded scan başarısızsa cursor ilerliyor. 146'ncı aday dört seed denemesinden sonra hâlâ null, fakat artık kalıcı seçici kilidi değildir. Tükenme açık hata verir; eski içerik açılmaz.
- Süre dolmuş active round, next callback'inden önce finished olarak kaydediliyor. Terminal ranks, finished ayrılmadan önce donduruluyor.
- Mutation etkin üyelik ve lease kontrolünü hem okumada hem yazma CAS'ında kullanıyor. Süresi bitmiş oda salt okunabilir, yeni tur için diriltilemez.
- 64 sınırlı CAS denemesi ve değişikliksiz next cevabında no-op, aynı oda çekişmesini azaltıyor.

Bağımsız stdin probe'u, gerçek geçici SQLite fixture'ında tek özel odaya **16 oyuncu**, eşzamanlı **16/16 ready**, ortak start ve deadline'dan doğrudan **16 next** çağrısında yalnız **round 2 ve 16 tekil result** üretti. Bu fixture testi, üretim D1 yük/kapasite veya gerçek cihaz kanıtı değildir. Mevcut bankalarda ters yazılı eş hedef çifti bulunmadı; 1.600.508 aday altılı sayıldı. Bunların tamamı 8×8'e sığan oynanabilir bölüm olarak iddia edilmez; runtime çözülebilirlik ve iki çapraz eğim denetimi uygular.

## Bu son incelemede bulunan üç sınır

1. **Yeni quick odada tur çiti.** İlk diff'in server fence'i `expectedRound === undefined && !room.mode` kabul ediyordu. Yeni quick de mode taşımadığından probe: round 1 ready, bitiş, next(1), aynı no-round ready isteği round 2'nin hazır durumunu false→true yaptı. Etki: gecikmiş eski istemci mutation'ı yeni maça uygulanır. Öneri: yeni oda protocol işareti; sadece gerçekten eski işaretsiz odalara uyumluluk; rematch dahil round/owner guard. Koordinatör protocol:2 ve regresyon eklediğini bildirdi; nihai doğrulama aşağıda ayrıca kaydedilir.

2. **Başka oyuncunun next isteği sonucu görmeden geçirebilir.** İlk diff'te nextGame, finished alanlarını sıfırlıyor; karşı taraf terminal SSE'yi almadan doğrudan ready round 2 alırsa önceki skor/sıra RoomView veya lobiden erişilemez. DB result satırları korunur, fakat sonuç kullanıcıya kaybolur. Öneri: tek önceki tur özeti ve successor lobide sonuç erişimi; finish bildirimi kaçırılmış kullanıcı için test. Yeni sonuç ekranı veya kapsamlı geçmiş ürünü gerekmez.

3. **Eski rematch ile ayrılma yarışı.** Kontrollü DB read interleave probe'u: quick round 1 finished; A rematch oyu verir; B'nin callback dışı active COUNT=2 okumasından sonra A leave tamamlanır; B callback'i A.left=true/A.rematch=true görünce every(rematch) üzerinden round 2 ready ve iki yeni player üretir. DB'de yalnız B active kalır. Sonuç kilitli iki kişilik oda. Öneri: callback içinde herhangi bir left oyuncu varsa reddet; leave de aynı revision CAS'ını kullandığından yarış kaybedeni yeniden güncel roster'ı okur. Kabul: callback dışı count ile mutation arasına tamamlanmış leave sokulduğunda round ilerlemez, ayrılan kişi yeniden roster'a dirilmez.

## Test ve sınır

İnceleme başında review-final.log içindeki test parse hatası (`!['n']ext`) koordinatöre bildirildi ve düzeltildi. Sonra aynı log **62/62 hedefli test** başarı bildirdi; bu, uzman tarafından bütün suite'in yeniden çalıştırıldığı anlamına gelmez. Yukarıdaki bağımsız küçük probe'lar ayrıca uzman tarafından çalıştırıldı. İlk rematch probe wrapper'ı fixture'ın sync metodunu taşımadığı için hata verdi; neden belirlendi, prototype methodlarını koruyan Proxy ile düzeltildi ve yalnız ikinci probe davranış kanıtı sayıldı. `git diff --check` temizdi.

Tam test, içerik, TypeScript, üretim Worker HTTP, CI, tam kaynak eşleşmesi ve Sites yayını koordinatörün sorumluluğundadır. Destekli tarayıcı bağlantı engeli bu uzman tarafından çözülmedi; gerçek telefon, gerçek sağlayıcı girişi veya canlı 16 oyuncu kapasitesi doğrulanmış sayılmaz.

## Düzeltmeler sonrası son karar

Koordinatörün son diff'i yeniden okundu. Yeni odalarda `protocol:2` var; fence yalnız işaretsiz eski odalara no-round uyumluluğu tanır. Rematch API'si de round ve owner guard alır, mevcut callback güncel roster'daki `left` kaydını reddeder. Next/rematch geçişi son turun gerçek winner/reason/ranked participants özetini `lastResult` olarak korur; successor lobide **Önceki maç sonucu** gerçek özetle açılır.

Yalnız bu üç değişen kabulü seçen test komutu bağımsız çalıştırıldı: `node --experimental-strip-types --experimental-transform-types --test --test-name-pattern='requires the round|keeps the exact previous|does not resurrect' tests/arena-multiplayer.test.ts`. **3/3 geçti, skip/fail yok.** Yeni quick'de eksik/eski round reddi; finish bildirimi kaçan ve yeni service instance açan kişinin önceki sıralamaya erişimi; dış COUNT ile mutation arasına bırakılmış leave'in round'u ilerletmemesi doğrulandı.

Bu dar güvenilirlik kapsamındaki üç somut bulgu kapandı. Önceki beş düzeltmeyle birlikte kaynak ve hedefli kabul bakımından ek yayın engeli bulunmadı. Bu karar tam kapılar, üretim/cihaz kapasitesi veya gerçek yayının yerine geçmez; bütün sonuçların son kanıtı koordinatörün validation kaydıdır.
