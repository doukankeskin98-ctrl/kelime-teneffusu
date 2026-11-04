# 5 Kasım 2026 · Sabit hedef rafı ve tahta konumu: güvenilirlik ön incelemesi

Başlangıç: `b759e86`, 0.35.0; başlangıç çalışma ağacı temiz. Yetki yalnız kaynak okuma ve bu günlük. `mobile-game-quality` akış/doğrulama rehberi uygulandı. Aşağıdakiler mevcut bir arıza iddiası değil, önerilen her zaman görünür hedef rafının koruması gereken üç somut bağımlılıktır.

## 1. İçerik değişirken rafın ve tanım alanının geometrisi sabit kalmalı

Kaynak: `lib/game/viewport.ts:31–36,52–58,67–76`; `components/game/common.tsx:67–78`; `lib/game/word-card.ts:12–18`. Sığdırıcı hedef panelinin gerçek çocuk sınırlarını ölçer; tüm kullanılabilir yüksekliği stage'e ayırır. Fiziksel çizim sürerken ölçüm ertelenir, temas bitince bekleyen ölçüm uygulanır. Bu koruma, kelime kabulünden sonra bir maskenin gerçek cevaba dönüşmesi, uzun/parçalı adın satır değiştirmesi veya seçili tanımın değişmesiyle oluşan normal yerleşimi sabitlemez. Üste hizalama tek başına bu ikinci sorunu çözmez.

En küçük koruma: aynı bölümün raf/numara yuvalarına ve seçili tanım alanına tüm gerekli sunum durumları için sabit yer ayırmak; bulunan öğeleri kaldırmamak veya yeniden sıralamamak. Büyük yazı/çok dar ekranın mevcut okunabilirlik ve doğal taşma tercihi kaybolmamalı. Gerçek ekran yönü veya viewport değişikliğine yanıt verme sürmeli.

Kabul: 320×568, 375 genişlik ve 414×628 görünümde en uzun tanım ↔ en kısa tanım, normal/baş harfli/tam saklı hedefin kabulü ve `KUYRUKLU YILDIZ` iki parçasının ayrı kabulü boyunca aynı viewport altında tahta x/y/genişlik/yüksekliği en fazla 1 CSS px yuvarlama farkıyla sabit; hiçbir hedefin metni kesilmez. Son kelimenin 720 ms uçuşu ve 1040 ms sonuç beklemesi içinde aynı kontrol. `tests/play-fit.test.ts:120` temas boyunca erteleme testi korunmalı; yeni rafın gerçek font/satır düzeni yalnız VM testiyle kanıtlanmış sayılmamalı.

## 2. Yeni yuvalar mevcut uçuşun gerçek varış kimliğini korumalı

Kaynak: `components/game/WordFeedback.tsx:30–54,60–75`; `components/game/common.tsx:70,77–78`. Uçuş aynı `data-word-group` için genişliği pozitif ilk öğeyi seçer. Harf hedefleri, eşleşen `data-word-part` kimliği veya metni cevaba birebir eşit `data-word-label` üzerinden ölçülür. Yeni numara yuvası ve seçili tanım paneli aynı grup niteliğini taşırsa yanlış yüzey seçilebilir; yalnız numaralı yuva veya kaybolan cevap etiketi gerçek harf hedefleri yerine kutu merkezine dönüşe yol açar. `data-word-arriving` son harf varışına kadar aynı kalıcı öğede kalmalıdır.

En küçük koruma: her grup için tek kalıcı varış öğesi; parçalarda ayrı, sabit `data-word-part` kimlikleri. Seçili tanım açıklamasını ikinci bir uçuş hedefi yapmamak. Tamamlanan cevabı ve varış dekorasyonunu aynı düğümde tutmak; gecikmeyi mantıksal kabul/kayıt/haptik yoluna taşımamak.

Kabul: yeni numaralı bilmece yuvasına gerçek WordFeedback bileşeniyle kabul → ölçülen varışın doğru grup/harf olması; başka tanım seçilince uçuşun hedef değiştirmemesi; iki parçanın kısa aralıkla kabulünde ortak varış sayacının son harfe kadar korunması; pause/unmount/resize sırasında temizlenmesi. `tests/word-feedback.test.ts:50,82` okuma-yazma ayrımı ve çakışan varış temizliği temel alınabilir. Süreler 720 ms + en çok 84 ms harf gecikmesi + 180 ms iniş, sonuç 1040 ms olarak kalır.

## 3. Görünen raf ile açılmış oyun hedefleri aynı şey sayılmamalı

Kaynak: `components/game/Solo.tsx:109,120,136–139`; `components/game/common.tsx:108`; `lib/game/story-content.ts:7,47–51`; `lib/game/word-card.ts:12–18,22–39`; `lib/game/world-presentation.ts:42–50`. Hikâye yalnız sıradaki hedefi `wordList.board.targets` içine koyar. Ortak tahta bu listeyi otomatik erken kabul için `earlyTargets` olarak kullanır. Sadece bütün cevapları göstermek amacıyla hikâyede bu listeyi tam tahtaya genişletmek kilitli hedefleri erken tanımaya dahil eder; Solo'nun son kontrolü reddetse de temas yanlışlıkla tüketilebilir. Ayrıca parçalı hedef tamamlanması grup bazlıdır; bir parça bulununca diğer parça veya bütün gizli etiket açılmamalıdır. Bilmece slot seçimi, Solo'nun mevcut seçili hedef ipucu davranışına bağlanmalı; sıra/puan/kabul kuralına dönüşmemelidir.

En küçük koruma: hikâyenin mevcut tek adım istisnasını korumak veya gösterilecek raf verisi ile izinli `earlyTargets` verisini açıkça ayırmak. Mevcut `wordCardCopy`, `veiledText`, grup tamamlanması ve seçili ipucu kurallarını tekrar kullanmak; kayıt/içerik/seed/rekabet kurallarını değiştirmemek.

Kabul: hikâyede ileriki kelimenin üzerinden geçmek kabul/sonraki adıma geçiş üretmez; gerçek sıradaki hedef tek kabul olur. Numaralı bilmece slotunu seçip ipucu alınca seçilen hedef işaretlenir. `tests/word-access.test.ts:408–433,451–466` kapsamındaki kısmi gizli `KUYRUKLU YILDIZ`, yeniden açılış, görünür/erişilebilir etiket ve izinli erken hedef testleri yeni rafı gerçekten render ederek sürmeli. Arena rakip ekran boyutundan bağımsız aynı bulmacayı ve yalnız doğrulanmış stroke durumunu göstermeye devam etmeli.

## Doğrulama sınırı

Bu tur kaynak ve mevcut testler okundu. Test, tarayıcı, fiziksel cihaz veya FPS ölçümü yapılmadı; uygulama, kayıt, ayar ve yayın değiştirilmedi. Onaylanmış animasyon/haptik sürelerinin korunması uygulama son diff'inde ayrıca kontrol edilecek. Eski yayın/test kayıtları yeni düzen için başarı kanıtı değildir.

## Uygulama diff incelemesi · 5 Kasım

Koordinatörün 106 hedefli testin geçtiğini bildirdiği diff ve yeni `app/play-comfort.css` okundu; inceleyen test veya tarayıcı çalıştırmadı. Hikâyede sunum `wordList.board` ile kabul `earlyTargets` artık ayrılmış; Solo yalnız etkin story target'ını, bitişte boş listeyi geçiriyor. Normal rafta gruplar/part kimlikleri kalıcı; ikinci parçanın gereksiz baş harfi açıklanmıyor. Numaralı tanım yuvaları grup kimliğini taşıyor; uçuş o sabit yuvayı hedefliyor, onay işareti `data-word-arriving` süresince saklı. Animasyon süre sabitleri, haptik, motor ve kayıt kodu diff kapsamına alınmamış.

Üç düzeltme gerekli:

1. **[P2] Uzun/parçalı rafta eski `nowrap` kuralı yeni sarmayı bastırıyor.** `app/scenic-journey.css:75` içindeki `.game-app .scenic-play .viewport-targets.has-word-rack .word-tag` (beş sınıf) `white-space:nowrap` bildiriyor. `app/play-comfort.css:10` içindeki yeni en güçlü karşılık dört sınıflı ve `white-space:normal` önemli değil. Bu nedenle normal Solo portrede etiket hâlâ sarılmaz; çocuk `overflow-wrap:anywhere` bunu düzeltmez. En dar düzeltme: raftaki gerçek etiket/çocuğa `white-space:normal` veya eşit/yüksek özgüllük. Kabul: 320 px görünümde `KUYRUKLU YILDIZ` ve uzun tek hedef için computed white-space normal, hücre sınırı dışına taşan yazı yok; bulunan/saklı geçişlerde kutu boyutları aynı.

2. **[P2] Geniş Solo ekranında panel sırası ters kalıyor.** `components/game/common.tsx:114` hedef panelini DOM'da öne aldı. `app/play-comfort.css:70` geniş/landscape durumda hedefe `order:1` veriyor ancak iki sınıflı bu kural, `app/viewport-arena.css:13` içindeki üç sınıflı `.game-app .viewport-play .targets-panel { order:0 }` kuralına yeniliyor. Böylece Solo'da hedef ve tahta order:0 kalır; hedef geniş sol kolona, tahta dar sağ kolona gider. En dar düzeltme: son medya kuralına `.game-app .scenic-play` kapsamını eklemek. Kabul: geniş masaüstü ve landscape Solo görünümünde board-panel soldaki geniş grid alanında; hedef paneli sağda; portrait hedef→tahta sırası korunmuş.

3. **[P3] Hikâye büyük harf modu yan listesi gelecek tanımları gösteriyor.** `components/game/common.tsx:114` zoom sırasında `BoardWords`'e artık bütün hikâye wordList'ini gönderiyor. `BoardWords:36` doğrudan `WordList` çağırıyor; `WordList:69` `activeOnly` kullanmıyor. Ana numaralı görünüm ve onun penceresi yalnız etkin tanımı korurken, zoom'daki “Kelimeler” penceresi sonraki tanımları erken açıyor. Cevaplar görsel olarak açıklanmıyor, puan/kabul kuralı aşılmıyor; sıra ile ipucu açma sunumu geriliyor. En dar düzeltme: hikâye BoardWords verisini yalnız etkin hedefe süzmek veya aynı etkin tanım görünümünü kullanmak. Kabul: story+zoom → Kelimeler içinde etkin tanım var, sonraki adıma ait tanım yok; sonraki gerçek kabulden sonra açılan tanım güncelleniyor.

Bu üç madde koordinatöre kaynaklarıyla iletildi. Düzeltme ve görsel doğrulama bu kayıt anında henüz inceleyen tarafından doğrulanmadı.

## Üç düzeltmenin kapanışı · 0.36.0

Yalnız yukarıdaki üç madde yeniden kaynak/test üzerinden incelendi:

- **1 kapandı:** `app/play-comfort.css:14` gerçek `[data-word-label]` öğesine açıkça `white-space:normal` veriyor. Atadan miras gelen eski `nowrap` artık etiketi yönetmiyor; parçalı etiketin alt span'leri de bu normal sarmayı miras alır.
- **2 kapandı:** `app/play-comfort.css:70` geniş/landscape panel sırasını hem `.game-app .scenic-play` hem `.main-content .scenic-play` kapsamında belirliyor. Eski üç sınıflı kural ile özgüllük eşit ve bu dosya sonra yüklendiğinden board order:0 / targets order:1 uygulanır.
- **3 kapandı:** `components/game/common.tsx:32,37` hikâye yan listesini etkin grup veya doğrulanmış stroke'larla sınırlandırıyor; normal oyun aynı listeyi kullanmaya devam ediyor. `tests/word-access.test.ts:551–553` gerçek BoardWords penceresini açıp WordList'e yalnız etkin hedefin geçirildiğini sınayan regresyonu içeriyor.

Bu üç bulgu kapsamında kalan engel yok. Koordinatör tam 710 testin geçtiğini bildirdi; inceleyen bu tur testi tekrar çalıştırmadı ve yeni görsel/fiziksel cihaz doğrulaması yapmadı. Uygulama kodu değiştirilmedi, kapsam genişletilmedi.
