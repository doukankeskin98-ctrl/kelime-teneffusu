# Profesyonel deneyim geçişi · Güvenilirlik incelemesi

Rol: bağımsız güvenilirlik uzmanı. Uygulama kodu, canlı veri ve yayın değiştirilmedi. İnceleme başlangıcı 0.19.0 kaynak; koordinatörün yeni kapsamlı ürün talebi için mevcut kapı/kayıt/tahta sözleşmeleri değerlendirildi. Kaynak satırları inceleme anını gösterir.

## 1. Eski dünyada yalnız süre veya ipucu içeren kayıt devam önerisini kaybediyor

- Kaynak: `lib/game/discovery.ts:29–30`, `lib/game/main-journey.ts:19–25`.
- Tetikleyici: eski açık katalogdan `turkiye-4` kaydı, sıfır bulunan kelime, 20 saniye, bir ipucu; `last.journey=turkiye-4`, önceki dünya henüz tamamlanmamış.
- Beklenen: kullanıcının başlamış geçerli bölümüne devam edebilmesi; boş, hiç oynanmamış kayıt dünyayı açmamalı.
- Gerçek: `loadProgress` süre/ipucunu koruyor, fakat `discoveryState` yalnız complete/strokes aradığı için Türkiye kilitli. `mainJourneyState` uzay-1 ve continuing=false döndürüyor.
- Kanıt: gerçek saf TypeScript modüllerini kullanan yalıtılmış Node probe çalıştı. Çıktı: `{save:{strokes:[],hints:1,elapsed:20,complete:false,stars:0},worldUnlocked:false,current:"uzay-1",continuing:false}`. Üretim kaydı okunmadı veya yazılmadı.
- Etki/risk: geri dönen oyuncu kaldığı yerden düğmesini kaybeder. Kayıt silinmez. Dar düzeltme için eski başlangıç uyumluluğunun süre/ipucunu kapsaması düşünülmeli; sayıların `cleanSave` ile doğrulanmış olması korunmalı.
- Kabul: sonraki dünyada yalnız elapsed ve yalnız hints örnekleri ayrı ayrı sürer; temiz sıfır kayıt kilit açmaz; önceki 3/5 kapıları, tamamlanmış eski bonus ve normal bölüm erişimleri değişmez. `main-journey.test.ts` ve `discovery.test.ts` uygun yerlerdir.

## 2. Numaralı yolculuk sonuç ekranı gerçek bonus açılışını gizliyor

- Kaynak: `components/game/JourneyResult.tsx:12,19`; ödül kaynağı `lib/game/discovery.ts:49`.
- Tetikleyici: uzay-1…4 tamamlandıktan sonra uzay-5 tamamlanır.
- Beklenen: yeni açılan Gözlemevinin kapısı albüm finali sonuçta görünmeli; tekrar oyununda yeniden açılmış gibi kutlanmamalı.
- Gerçek: `discoveryRewards` piece ve bonus üretiyor; JourneyResult `world|album` filtresi bonusu eliyor. Sıradaki CTA çalışabilir, ancak kazanım görünmüyor.
- Kanıt: yalıtılmış gerçek modül probe sonucu rewards `[piece:Uzak ufuk, bonus:Gözlemevinin kapısı]`; mevcut filtre sonucu `[]`.
- Etki/risk: beş bölüm emeğinin açtığı hedef görünmez; yeni ödül veya şema gerektirmeyen bir sunum kusuru.
- Kabul: dördüncü bölümde bonus mesajı yok, beşinci bölümde doğru isimle var; altıncıda albüm tamamlanır; aynı tamamlanmış kaydın tekrarında bonus/world/album kutlamaları yok. `achievement-loop.test.ts` genel VictorySummary için bonusu test ediyor, numaralı JourneyResult için etmiyor; oraya gerçek before/after verisiyle kapsam eklenmeli.

## 3. Yeni oynanabilir bölüm yolunda korunması gereken sınır

- Bu, uygulanmamış yeni seçiciye ilişkin sözleşmedir; mevcut uygulama hatası olarak sunulmaz.
- Kaynak: `JourneyHome.tsx:21` şu anda etkileşimsiz span; `main-journey.ts:19–25`, `discovery.ts:29–33`, `Solo.tsx:38,73–75,117`, `App.tsx:75`.
- Erişim numaradan veya yalnız `number<=current.number` koşulundan türetilmemeli. Açık dünyadaki normal bölümler oynanabilir; bonus beş normal bölüm tamamlanınca açılır; eskiden başlanmış dünya erişimi korunur. Önerilen ana bölüm, varsa gerçek yarım kayıt, yoksa ilk gerçek eksiktir.
- Tamamlanmış bölüm seçimi `campaign:true, practice:true` ile açılmalı; aksi hâlde Solo eski tamamlanmış kaydı açıp doğrudan sonuç gösterir. Yeni/yarım bölüm `practice:false` olmalı; yeniden oynama yarımken eski en iyi kayıt korunmalı.
- Kilitli bölüm odaklanıp açıklanabilir ama oyun açmamalı; native button, görünür kilit, açıklayıcı erişilebilir isim, en az 44px hedef. Modal eklenirse focus dönüşü, Escape ve arka plan etkileşim engeli korunmalı.
- Kabul: başlangıçta uzay normal bölümleri açık, Türkiye ve uzay finali kilitli; üç uzay tamamlanınca Türkiye, beş tamamlanınca uzay finali; eski turkiye-4 kısmî kaydı numara 13'e devam eder; numara 2 tamamlanıp 1 eksikken ana CTA 1 kalır; tamamlanan düğme boş tekrar tahtası açar, bitene kadar eski yıldız ve süreyi değiştirmez. Tam kataloğu bitiren oyuncuya yeni bölüm varmış gibi tekrar sunulmaz.

## Doğrulama haritası ve sınırlamalar

- Saf veri: `tests/main-journey.test.ts`, `discovery.test.ts`, `achievement-loop.test.ts`.
- Gerçek Solo callback/kayıt/sonraki/tekrar: `tests/word-access.test.ts:175–198`. Kontrollü React/VM harness, fiziksel DOM değildir.
- Ortak çerçeve/tahta değişirse `board-interactions`, `play-fit`, `viewport`, `input-gesture`, `completed-review`, `board-color`, `word-access` korunmalı. Günlük bekleyen kelime listesine yalnız onaylı strokes verilmesi; gizli bilmece cevapları ve parçalı isimler korunmalı.
- Harf sesleri pointer/click yerine gerçek yeni seçim hücresi yoluna bağlı kalmalı; tekrar render, geri düzeltme ve iptal başarı sesi üretmemeli. Reduced-motion, ses kapalı ve review/paused/blocked sınırları korunmalı.
- `attachPlayFit` `.play-heading`, `.play-hud`, `.targets-panel`, `.selection-preview`, `.play-controls`, `.board-stage` ölçülerine bağlı. Yeni dış dekor yüksekliği ölçü dışında bırakılmamalı; seçim sırasında layout güncellemesi yalnız koordinatı yeniden tabanlamalı, çizimi iptal etmemeli.
- İki yalıtılmış probe dışında tam test paketi çalıştırılmadı. Tarayıcı, fiziksel cihaz, ses dinleme, FPS, üretim kapasitesi ve oyuncu etkisi doğrulanmış sayılmaz. Son değişiklikler ve yayın kapısı koordinatörce ayrıca doğrulanacak.

## Son uygulama incelemesi

Koordinatörün JourneyHome/picker, mainJourneyChapters, discoveryState, Solo, common ve JourneyResult farkı salt okunur incelendi.

- İlk iki bulgu düzeltilmiş: yalnız süre/ipucu içeren eski normal bölüm artık devam olarak öneriliyor; bonus ödülleri JourneyResult içinde ayrı albüm finali açılışı olarak gösteriliyor.
- Picker normal dünyalarda gerçek kapıları kullanıyor; bitmiş bölüm `campaign:true, practice:true`, yarım bölüm mevcut kayıtla açılıyor. Kilitli düğmeler disabled ve play callback ayrıca unlocked kontrolü yapıyor. Numarayı erişim/ödül yerine kullanmıyor.
- focusedWordGroup yalnız kalan hedef grubunu belirliyor. Kullanıcının tercih ettiği grup bütün parçaları bitene kadar korunuyor; sonra ilk kalan grup, tümü bitince null. Yeni WordList düğmesinin erişilebilir adı ve Solo hedef mesajı `wordCardCopy` kullanıyor; bulunmamış bilmecenin cevabı yeni label/HUD yolundan açıklanmıyor. Hedef seçimi yalnız React preferredGroup state'ine yazıyor; ipucu, süre, yıldız, kayıt ve ses çağrısı yok. Günlük ve bitmiş/duraklamış/yardım durumları canFocus dışında.

### Kalan somut P2: eski yarım bonus tekrar kilitleniyor

`main-journey.ts` yeni picker erişimi tamamlanmış bonusu istisna olarak açıyor, fakat eski kısmi bonusu açmıyor. Mevcut `mainJourneyState.available` de bonusUnlocked şartını arıyor. Kaynak/yalıtılmış probe: `turkiye-kartpostal` bir gerçek stroke, 20 saniye, bir ipucu, normal beş bölüm tamamlanmamış. Temiz yüklenen kayıtta `worldUnlocked:true`, `unlocked:false`, `continuing:true`, ana öneri `uzay-1`.

Bu veri kaybı değildir; eski açık katalogdan başlanmış bonusun oynanabilir devamı kaybolur. Başlangıç uyumluluğunun bonus için de istendiği durumda aynı doğrulanmış started save koşulu picker ve devam seçiminde paylaşılmalı. Kabul: sıfır bonus kaydı kapıyı açmaz; kısmi gerçek stroke, elapsed-only ve hint-only eski bonus yeniden açılır; boş yeni profilde beşli kapı kalır; tamamlanmış bonus replay açılır ve ödül çoğaltmaz. Koordinatöre bildirildi, bu inceleme sırasında uygulama koduna müdahale edilmedi.

### Son çalıştırılan kontroller

`node --experimental-strip-types --experimental-transform-types --test tests/main-journey.test.ts tests/achievement-loop.test.ts tests/word-access.test.ts`: **49/49 geçti**. Bu sonuç mevcut davranışın hedefli regresyonudur; yeni picker/focus davranışının tümü için yeterli kabul değildir. Yeni test önerileri: gerçek picker callback'leri/locked/replay; split-group focus geçişi; gizli cevaplı focus button etiketi; actual Solo focus sırasında oyun verisi ve sesin değişmemesi; bonus ilk açılış/tekrar ayrımı.

Son incelemede fiziksel DOM/cihaz/ses/FPS kontrolü yapılmadı. Koordinatörün devam eden UI ve tam sürüm kontrollerinin yerine geçmez.

## Nihai doğrulama · açık P2 kapandı

Son kaynakta `mainJourneyState` ve picker erişimi `mainJourneyChapters` tarafından hesaplanan aynı açık bölüm kümesini kullanıyor. Eski bonus istisnası doğrulanmış kayıtta gerçek complete/stroke/elapsed/hint etkinliği gerektiriyor; sıfır kayıt bu istisnayı almıyor. Önceki “Kalan somut P2” bulgusu bu değişiklikle kapandı.

`loadProgress` üzerinden temizlenen `turkiye-kartpostal` verisiyle beş ayrı yalıtılmış probe yeniden çalıştırıldı ve tüm assertions geçti:

- Sıfır kayıt: kilitli, devam değil, ana öneri uzay-1.
- Yalnız gerçek stroke: açık, devam, ana öneri turkiye-kartpostal.
- Yalnız 20 saniye: açık, devam, ana öneri turkiye-kartpostal.
- Yalnız bir ipucu: açık, devam, ana öneri turkiye-kartpostal.
- Tamamlanmış kayıt: açık, devam değil, ana öneri uzay-1; tekrar seçimine uygun, eksik bölüm önerisine karışmıyor.

Yeni yedi davranış testi incelendi. İlk profil kapıları ve beş bölüm sonrası bonus açılışı, eski normal/bonus süre ve ipucu kayıtları, dokunulmamış bonus kilidi, gerçek JourneyResult bonus mesajı, parçalı hedef odağı, gizli cevap erişilebilir etiketi, Solo odak değişiminde veri/ses yan etkisi olmaması ve picker callback'lerinin practice/campaign ayrımı kapsanıyor. Aynı üç dosyanın hedefli paketi bağımsız olarak yeniden çalıştırıldı: **56/56 geçti**, 13 suite, hata ve atlama yok. Koordinatörün bildirdiği tam paket **493/493**, typecheck ve içerik doğrulaması sonuçları bu bağımsız hedefli kontrolün dışında, koordinatör kanıtıdır.

Compact sonuç sahnesi için `.journey-result-scene .collection-scene` kuralında `width:100%`, `min-width:0`, `height:auto`, `aspect-ratio:16/9` düzeltmesinin kaynakta bulunduğu doğrulandı. Taşmanın tarayıcıda giderildiği bilgisi koordinatörün UI kontrolüne dayanıyor; burada ayrıca tarayıcı testi yapılmadı.

İncelenen kaynak ve hedefli davranış kapsamında açık engel kalmadı. İlk iki bulgu ile eski yarım bonus P2 kapalıdır. Fiziksel cihaz, ses dinleme, FPS ve üretim kapasitesi bu inceleme tarafından doğrulanmış sayılmaz. Uygulama kodu değiştirilmedi; Worker, CI ve yayın işlemleri koordinatörde.
