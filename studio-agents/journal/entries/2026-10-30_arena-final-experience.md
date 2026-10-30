# 30 Ekim 2026 · Arena ve ekran son deneyim incelemesi

Kapsam: ortak `PlayLayout`, viewport ölçümü/CSS, Arena lobi→oyun→sonuç→yeni oyun, canlı yanıt ve kurtarma bağlamı. Kök AGENTS, deneyim rolünün AGENT/RULES/HEARTBEAT/MEMORY/RUNBOOK dosyaları, marka/oyuncu/strateji ortak bağlamı, README, güncel geliştirme/harita ve bu turun karar/ilk deneyim günlüğü okundu. Uygulama ve test dosyalarına yazılmadı; bu dosya tek yazma alanıdır. Yayın koordinatördedir. Ek ajan açılmadı.

## Önceki üç düzeltmenin durumu

- Okunabilir minimum artık yalnız tahta boyutuna uygulanmıyor; bütün frame için `min-height` hesaplanıyor. Çok kısa alan/büyük yazıda doğal erişilebilir taşma, sahne dışına taşan ortalanmış tahta yerine kullanılıyor. Mystery bağlantı düğmesinin miras `grid-column:1/-1` değeri açıkça `auto` ile sıfırlanmış.
- Sonuç, sıralama, ayrılma ve kurallar modal koşulları öncelik sırasına bağlanmış. Sıralama/kurallar açıkken finish gelmesi tek modal bırakıyor; kapatılınca gerçek sonuç açılıyor, terminal tahta salt okunur kalıyor.
- Kurtarma ve mutation cevapları epoch+room+round bağlamıyla korunuyor. Ayrılma sonrası eski recovery başka odayı diriltmiyor; reddedilen eski revision saatin offset'ini değiştirmiyor. Aynı anda next tıklaması ref kilidiyle tek istek oluyor; belirsiz mutation otomatik tekrarlanmıyor, 12 saniye sonra kurtarma metni var.

## Son okumada koordinatöre bildirilen iki somut bulgu

1. **Yüksek, hızlı eşleşme oda transferi.** `Arena.tsx` `accept(next,allowSwitch=false)` içindeki farklı room id reddi, eski snapshot güvenliği için eklenmiş ama gerçek quick eşleşme transferini de reddediyor. Sunucu `pairWaiting` eski waiting oda üyeliğini başka host oda id'sine taşıyabilir; `/api/live` başlangıcı `game.state(member.userId,id)` ile yeni gerçek aktif oda snapshot'ını gönderir ve onu izlemeye başlar. İstemci eski waiting id'sinde kalıp host id'li bütün güncellemeleri reddeder, `useLiveRoom` yine connected gösterir. En küçük düzeltme: olayın kaynak stream/lifecycle bağlamını doğrulayarak yalnız aynı aktörün quick waiting→paired oda geçişine izin ver; genel farklı-id kabulüne dönme. Kabul: eski waiting oda A, sunucu eşleştirilmiş B'yi verince UI B'ye geçer; terk edilmiş A stream'inden geciken cevap B'yi/A'yı geri getirmez.

2. **Orta, masaüstü/yatay görünür alan küçülmesi.** `common.tsx` `targetMinimum = screen.clientHeight - columns.clientHeight + targets.scrollHeight` stretch grid öğesinin ayrılmış yüksekliğini içerik minimumu sayabilir. Taşma olmayan targets paneli sütun kadar yüksek olduğunda targetMinimum≈mevcut screen yüksekliği; bu da `min-height` ile eski yüksekliği koruyup küçülen viewport'a dönüşü engelleyebilir. Yalnız gerçek taşma varsa hedef minimumunu dahil et veya çocukların intrinsic içerik boyunu ölç. Kabul: 900→600→900 ve büyük yazı→normal ölçümlerinde eski min-height kilitlenmez; okunabilir tahta ve gerçek taşan metin erişilebilir kalır.

Bu iki bulgu ilk son okuma anında açıktır; koordinatör düzeltmesi ayrıca okunmadan kapanmış sayılmaz. Genel tasarım yeniden yazımı önerilmedi.

## Doğrulama sınırı

Bu uzman yalnız kaynak, kontrollü hook/VM ve geometri aritmetiğini inceler. Koordinatörden gelen destekli preview bilgisi: CLI healthy, CUA tam URL'de ERR_CONNECTION_REFUSED; başka tarayıcı/ağ yolu denenmedi. Fiziksel telefon, DOM rect/scrollHeight/computed style, native focus, 200% sistem yazısı ve Safari araç çubuğu ölçümü yapılmış değildir. Sayfa kaydırmasız bütün cihazlar iddiası kurulmaz. Normal görünür hedefler tek tam WordList'ten gelir; Mystery gizli bonusu ve onay bekleyen Arena hedefi veri sınırları korunur. 44 px kontrol minimumları, gerçek katılımcı listesi/sayfalama, sonraki oyun eyleminin ayrı alt alanda kalması kaynakta mevcut; fiziksel boyut/konfor kanıtı değildir.

Çalıştırılan dar kontrol: `node --experimental-strip-types --experimental-transform-types --test tests/arena-terminal.test.ts tests/word-access.test.ts tests/viewport.test.ts`: **36/36 test, 7 suite geçti**. Normal hedeflerin tek kopyası, confirmed vs pending, Mystery/clue sınırları, terminal inceleme, tek next, gecikmiş recovery, tek modal ve viewport aritmetiği testlidir. Yukarıdaki quick oda transferi ile stretch minimum küçülmesi bu 36 testte yer almıyordu; başarılı sonuç onları kapatmaz.

## Koordinatör düzeltmelerinden sonra kapanış

İki ana bulgu kaynakta yeniden okundu ve kapatıldı. `useLiveRoom` snapshot callback'ine gerçek bağlantının `sourceId` değerini taşıyor. Arena, farklı oda transferini yalnız güncel kaynak bağlantısı ve aynı aktörün quick/waiting bağlamında kabul ediyor; emekli stream başka odayı geri getiremiyor. Gecikmiş reconnect'te host maçın zaten finished olması da kapsanıyor. Hedef minimumu artık stretch panelin ayrılmış scrollHeight'ından değil çocuk içeriğin gerçek alt kenarları ve alt padding'den türetiliyor; önceki ekran yüksekliği minimum diye tutulmuyor.

Yeni `lastResult` özeti successor lobide **Önceki maç sonucu** üzerinden açılıyor. Finish olayını ağdan kaçırmış oyuncu önceki gerçek sıralamayı görüp **Lobiye dön** ile aynı odada kalabiliyor. Tur/oda değişimi geçmiş sonuç penceresini temizliyor; bu pencere sadece lobi branch'inde, aktif oyunun sonuç/ranking modal'larıyla birlikte mount olmuyor. Önceki sonucun bağlantı durumu metnini tarihsel kelime sayısı olarak sunmak ve mevcut achievement-modal footer düzenini kullanmak koordinatöre küçük tutarlılık önerisi olarak aktarıldı; protokol engeli olarak işaretlenmedi.

Yeni dar kontrol bizzat çalıştırıldı: `tests/arena-terminal.test.ts tests/viewport.test.ts` **20/20 test, 3 suite geçti**. Quick oda transferi, emekli stream reddi, gecikmiş terminal transferi, önceki maç özeti ve viewport küçülme/büyüme aritmetiği dahil. Önceki 36 test sonucu farklı an/scope'a aittir, toplanıp yeni toplam diye sunulmaz.

**Son kaynak/VM kararı:** atanmış deneyim ve istemci bağlamı kapsamında açık engelleyici bulgu kalmadı. Gerçek DOM/telefon, piksel sığması, fiziksel dokunma ve Safari araç çubuğu doğrulama sınırları sürer. Tam test/build/Worker/CI/yayın ve ölçek kapasitesi koordinatörün ayrı kanıtına tabidir.
