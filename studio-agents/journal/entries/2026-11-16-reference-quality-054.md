# 0.54 hazırlığı — WoW referansı ve sahne kalitesi

16 Kasım 2026. Oyuncu deneyimi uzmanı; kaynak ve mevcut görüntüler salt okunur incelendi. Başlangıç `package.json`, README ve `docs/development-log.md:1–9` ile 0.53.0. Uygulama kodu, test, derleme, yayın veya kurulum yapılmadı. Yalnız bu günlük yazıldı. `mobile-game-quality` becerisi kullanıldı. 312 bölüm, kayıt biçimi, mevcut efekt sesleri ve ödül kuralları sabit kabul edildi.

## Kanıt ve karar

WoW kaynakları `../world-review/wow-2026-11-06/` altında; `world-review.nosync` altında değiller. `observations.json:69–129` ve aşağıdaki gerçek PNG'ler incelendi: `motion-050.png`, `motion-060.png`, `motion-089.png`, `08-level23-result.png`, `09-bonus24-entry.png`, `13-level25-new-world.png`. Önceki gözlem fiziksel iPhone 14 Pro Max / WoW 4.13.2 üzerinde kullanıcı oynarken alınmış. Bu tur yeni cihaz denemesi yapılmadı. İncelenen kanıt klasörleri ve repo günlüklerinde kullanıcıya ait yeni video yolu bulunmadı; bir video izlenmiş gibi değerlendirme yapılmadı.

Kendi sürümümüz için `../world-review.nosync/release-0530/after-375-{start,praise,world-result,bonus,bonus-result}.png` görüntüleri açılıp görsel olarak incelendi. Bunlar önceki yerel tarayıcı yakalamalarıdır. Tek kareden hareket süresi/FPS, kullanıcı memnuniyeti veya fiziksel parmak rahatlığı çıkarılamaz. Dünya sonucu görüntüsünde yarı saydam görünen hatıra bölümü giriş animasyonu sırasında yakalanmış olabilir; kalıcı kontrast hatası diye raporlanmadı.

`docs/wow-follow-ups.md:3–15` bonus, dünya karşılaması, ritim ve yan etkinliğin 0.40.0'da uygulandığını belgeliyor. `Solo.tsx:190–191,206` artık bonusu ana devam eylemi yapıyor. Bu işleri eksik özellik diye tekrar yapmak doğru değil.

**Tek odak önerisi:** mevcut arka plan üzerinde **son kelime → büyük dünya ilerleme görseli → bonusun okunaklı oyun paneli → aynı dille bonus sonucu**. Görsel omurga mevcut dünyanın resmi, krem yüzey, orman yeşili, sıcak altın ve altı gerçek albüm parçası olsun. Yeni oyun motoru, motion paketi, varlık indirme veya ekonomi gerekmez. WoW'un para/reklam/yan ikon kalabalığı taşınmaz. Aşağıdaki üç öneri mevcut çalışmayı iyileştirir; gerçek oyuncuya etkisi henüz ürün varsayımıdır.

## 1. Sonuçta ana ödül küçük bir bilgi satırına dönüşüyor

**Gözlenen referans:** `08-level23-result.png` aynı resif sahnesinde büyük tebrik başlığı, büyük `11/12` dünya madalyonu ve tek baskın bonus düğmesi gösteriyor. Yerleşimin merkezi dünyanın tamamlanma durumu. Referanstaki 12 ve para ekonomisi bizim oyuna uyarlanacak kurallar değildir.

**Güncel kaynak/görüntü:** `JourneyResult.tsx:12–27` her sonuçta bölüm ve konu, büyük yıldızlar, küçük hatıra kartı, ayrı altı parçalı ince bar, açılan ödül satırları, TrailResult ve ayrıntıları sıraya koyuyor. `Solo.tsx:206–208` bunlara bonus/geç/tekrar/incele eylemleri ile sıradaki hedefi ekliyor. `app/studio-polish.css:48–56` büyük yıldızlara karşı albüm ilerlemesini 6 px çubuklar ve küçük metinle çiziyor. `after-375-world-result.png` üzerinde bunun sonucu, dünya bitişinin tek bir güçlü görsel yerine üst üste bilgi satırlarıyla anlatılması. Modalın sahneli ve saydam olması zaten uygulanmış; yeni öneri onu yeniden yapmak değil.

**Öneri:** `JourneyResult` içinde mevcut `after.state.earned/pieces` ve SceneArt'tan bir büyük dünya madalyonu oluştur: yaklaşık 136–168 px dünya resmi çevresinde altı ayrı parça, merkez/altında belirgin `n/6` ve dünya adı. `newPiece` olan yalnız gerçek segment bir kez yerleşsin; diğerleri sabit kalsın. Gerçek `save.stars` üç daha küçük yıldız olarak başlıkla madalyon arasına alınabilir. Yeni hatıranın adı tek alt satır; tüm gerçek kazanımlar ve önceki en iyi ayrıntı içinde erişilebilir kalsın. Sadece gerçekten yeni dünya/album ödülü doğduğunda o olayı öne çıkar; üçüncü bölümde açılan dünya ile altıncı parçada tamamlanan albümü eşitleme. `TrailResult` zaten tek ikincil satır üretir, bu sınırı koru. Normal bölüm için “Bölüm N tamamlandı”, albüm tamamlanmasında “Albüm tamamlandı” gibi gerçek duruma bağlı başlık kullanılabilir.

**Kod odağı:** `components/game/JourneyResult.tsx:12–27`, `components/game/Solo.tsx:206–208`, `app/coordinated-play.css:23–52`, `app/studio-polish.css:47–56`. `Modal`ın odağı/kapaması ve mevcut bonus/next callback'leri korunmalı. Ortak `.scene-result` seçicileri Arena sonuç tablosunu da etkileyebildiğinden yeni hiyerarşi `.journey-outcome`/`.bonus-outcome` ile sınırlansın.

**Kabul:** sıradan bölüm, gerçek dünya açılışı, 6/6 albüm, tekrar ve son katalog bölümü görüntüleri; 320×568 / 375×667 / 414×736'da ana ilerleme ve baskın CTA ilk görünümde; ayrıntıdaki tüm gerçek ödüller erişilebilir. Yenileme/tekrar sahte “yeni” parça veya ödül üretmez. Kaynakta sonuç sayıları yalnız mevcut ilerlemeden türetilir.

## 2. Bonusun süre ve keşif ilerlemesi görsel olarak ayrışmıyor

**Gözlenen referans:** `09-bonus24-entry.png` hedef kelime, büyük süre halkası ve `0/16` barını tek açık panelde birleştiriyor. Sayı ile doluluk aynı bakış alanında. Girişin tam ilk saniyesi kaydedilmediğinden gözlenen 75 sayısı referansın kesin toplam tur süresi diye kullanılamaz.

**Güncel kaynak/görüntü:** `BonusRound.tsx:42–47` süreyi küçük saat ikonu + sayı, bulunanları sahne üstünde ayrı satır gösteriyor. `app/journey-interludes.css:14–18` saat 24 px, bulunan sayı 14 px; ilerleme geometrisi yok. `after-375-bonus.png` görüntüsünde “0/10 bulundu” ile genel açıklama doğrudan ayrıntılı arka planın üstünde. Sonuçta aynı sayıya üç ayrı metin satırı dönülüyor ve büyük boşluk kalıyor (`after-375-bonus-result.png`). Bu mekanik mevcut, fakat normal bölümden ayrı kısa etkinlik hissi zayıf.

**Öneri:** hedef kelime, kalan süre ve bulunan ilerleme tek krem bonus panelinde: hedef solda, sağda yaklaşık 64–72 px süre halkası, altta `n / toplam keşif` yazılı gerçek ilerleme barı. Süre halkası `BONUS_DURATION` ve `save.elapsed` üzerinden; bar `save.found.length / board.targets.length` üzerinden çizilsin. Renk değişiminin yanında kalan saniye daima görünür; düşük sürede yanıp sönme/acele sesi eklenmesin. Varsayılan “Her çizgi ayrı bir keşif” satırı introda kalabilir; yanlış/tekrar seçim mesajı panelde ayrılmış tek satırda görünür. Panelin toplam yüksekliği bugünkü HUD+sayım yüksekliğini aşmasın; tahtayı küçültme.

Bonus sonucu, aynı keşif ilerleme halkasını büyüterek `10/10` ya da gerçek kısmi sayıyı ana görsel yapabilir; bir açıklama + en iyi tek ikincil satır yeterli. Başla, pas geç, sonuçtan devam ve yeniden dene callback'leri aynı kalır. Hazırlık ekranı aynı hedef görselini kullanabilir; sayaç yalnız mevcut `resume` ile başlar. Bonus bitirmeye yeni ödül veya yeni dünya erişim koşulu bağlanmaz.

**Kod odağı:** `components/game/BonusRound.tsx:42–47`, `app/journey-interludes.css:14–18,35`; `WordFeedback.tsx:39–64` için hedef panelinde `[data-word-group="0"]` ve gerçek `[data-word-label]` korunmalı, uçuş halkaya değil kelimeye inmeli. `PlayLayout` ve tahta/projection kodu yeniden yazılmamalı.

**Kabul:** 0/10, ara sayı, 10/10, süre bitimi ve 10 saniye altı; kısa ekranda bütün satırlar görünür; sayaç/sayı için erişilebilir etiket; arka plan/ayar/yardım boyunca mevcut durdurma ve devam davranışı; aynı yerleşim ikinci kez sayılmaz. Reduced motion'da geometrik değerler doğru, hareket zorunlu değil. Introda 10 saniye beklemek süre tüketmez. Mevcut ses çağrıları değişmez.

## 3. Tamamlanma geçişinin katmanları aynı anda çekiliyor

**Gözlenen referans:** `motion-050.png` son kelimenin yükselişini; `motion-060.png` başlık ve alt araçlar ayrılmışken rafta/tahtada kalan son tamamlanmayı; `motion-089.png` resifin tek başına görünmesini gösteriyor. Sıralama görsel kanıtla mevcut; ekran kayıt sıklığı güvenilir olmadığından kesin milisaniye aktarılmıyor.

**Güncel kaynak:** `WordFeedback.tsx:39–100` gerçek hücre/kelime geometrisiyle uçuş ve varış haptiki zaten yapıyor. `lib/game/word-feedback.ts:6–9` 720 ms uçuş, 180 ms iniş, 1040 ms sonuç bekleme, 220 ms çıkış tanımlıyor. `useResultPresentation.ts:25–30` son uçuş bitimini bekliyor; geç ACK, görünmezlik ve reduced motion davranışları var. Ancak `app/coordinated-play.css:2–10` başlık/HUD, raf/tahta ve araçları aynı çıkış başında, aynı 220 ms'de çekiyor. Mevcut 0.53 övgüsü ayrı bir çizim üstü baloncuk (`usePlayPraise.tsx:29–40`, CSS:75–81); tek başına bu sahne hiyerarşisini değiştirmiyor. `after-375-praise.png` baloncuğun ikinci harf satırının üstünde yer aldığını gösteriyor; onu büyütmek oyun alanını daha fazla kapatır.

**Öneri:** mevcut 220 ms toplam çıkış penceresi içinde küçük bir katman sırası: ilk bölümde başlık ve araçların çekilmesi, kısa gecikmeyle raf/tahtanın çözülmesi, sonra 1. bulgudaki büyük dünya ilerlemesi. Örneğin başlık/araçlar 0–100 ms, raf/tahta 60–220 ms; bunlar önerilen başlangıç değerleridir, referanstan ölçülmüş süreler değildir. 720/1040 ms onaylanmış uçuş davranışı, toplam sonuç gecikmesi ve skip korunur. Yeni “kazandın” perdesi/ek dokunuş eklenmez. GameScene aynı kalır; motor yalnız resmi sonucu üretir. Övgü opsiyonel ikincil vurgu olarak kalır, ana tasarım değişikliği ona indirgenmez.

**Kod odağı:** `app/coordinated-play.css:2–10` ve sonuç giriş stilleri; gerekirse yalnız açık CSS süre değişkenleri. `common.tsx:107,141–143` PlayLayout/praise/WordFeedback bağlantıları ile `useResultPresentation.ts` mevcut yaşam döngüsü korunmalı. Yeni zamanlayıcı zinciri, ses üretimi veya kayıt alanı gerekmez.

**Kabul:** son kelime bir kez rafa iner, tablo/raf inişten önce kaybolmaz; mevcut bekleme penceresi uzamaz; sonucu atlama çalışır; arka plana geçiş, yenileme, reduced motion ve geç sunucu ACK'ı kutlamayı yeniden oynatmaz. Kontrol resmi tamamlanmayı animasyon sonuna bağlamaz. Görsel sıra kısa ekran kaydı veya ayrık karelerle incelenmeli; sadece statik sonuç ekranı bu kabulü kanıtlamaz.

## Teslim sınırı

Öncelik 1 → 2 → 3. İlk ikisi aynı dünya/keşif ilerleme görsel diliyle bir tutarlı dil oluşturur; üçüncü mevcut geçişi ona bağlar. Bu inceleme yeniden bir geniş UI denetimi veya yeni özellik yol haritası değildir. Kaynakta mevcut korumalar incelendi, test çalıştırılmadı. Yeni tasarımın gerçek oyuncu memnuniyeti, uzun oturum, fiziksel dokunma/haptik ve FPS etkisi doğrulanmış değildir. Koordinatör değişiklik sonrası ilgili mevcut kayıt/sonuç/bonus testleri ve dar mobil görsel akış kabulünü yapmalıdır.

## Uygulama sonrası kısa kontrol — 16 Kasım 2026

`JourneyResult.tsx`, `BonusRound.tsx`, `lib/game/result-motion.ts`, `app/coordinated-play.css` ve `release-0540/after-375-world-result.png`, `after-375-bonus.png`, `after-375-bonus-intro.png` yeniden incelendi. Test/derleme/tarayıcı/cihaz çalıştırılmadı; uygulama değiştirilmedi. 375×667 görüntülerinde sonuç madalyonu ve bonus hedef/süre/sayım hiyerarşisi belirgin; bütün tahta satırları ve ana eylemler görünür. Hazır görünüm ile aktif bonus aynı sahnede, CTA açık. Bu üç karede kritik görsel kesilme bulunmadı. Kaynakta bonus başlangıç öncesi `inputBlocked`, commit'in `running` koruması ve yardım/ayar kapanışındaki `started` koşulları mevcut; bu kontrol çalışma zamanı kabulü değildir. Motion yalnız sunum öğelerine yazıyor; arka plan/hareket azaltma/unmount temizliği kaynakta var. 220 ms çıkış penceresinde 0–100 / 60–220 sırası uygulanmış.

**Koordinatöre iletilen tek P2 öncelik gerilemesi:** `JourneyResult.tsx:33` bütün yeni `world`/`bonus`/`album` bildirimlerini kapalı Ayrıntılar'a taşımış; `coordinated-play.css:101` dış `result-next-goal` alanını da gizliyor. `discovery.ts:46,64` gerçek yeni dünyayı erişim kapısında açtığında, mevcut madalyon yalnız o anki albümün parçasını gösteriyor. Özellikle ilk yeni dünya açılan 3/6 sonucunda daha önce görünür “Yeni dünya” olayı ana görünümden kayboluyor. Bu kayıt veya erişim hatası değil, önemli kazanımın görünürlük gerilemesi; 6/6 örneği bunu kapsamaz. En dar öneri yeni `kind==='world'` ödülü varsa madalyon altında tek “Yeni dünya açıldı · …” satırı; tüm ödül kartlarını geri getirmek gerekmez. Sonraki dünya zaten açıksa/tekrarda bu satır gösterilmez. Koordinatörün “ek kazanımlar ayrıntıda” kararına göre bu bilinçli ürün tercihi olarak da bırakılabilir; kritik yayın engeli diye raporlanmadı.

Doğrulanamayan sınır: bu uzman yalnız üç 375 px statik görüntüyü gördü. 320 px, yeni dünya 3/6 sonucu, bonus süresinin tükenmesi, kesinti sonrası gerçek animasyon durumları, VoiceOver, fiziksel parmak/haptik ve FPS bu kontrolün kanıtı değildir. Koordinatörün çalışan test akışı sonucu ayrıca değerlendirilmelidir.
