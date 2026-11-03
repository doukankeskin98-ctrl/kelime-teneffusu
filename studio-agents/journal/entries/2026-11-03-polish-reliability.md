# Kelime bulma ve kutlama cilası — güvenilirlik incelemesi

3 Kasım 2026. Rol: salt okunur güvenilirlik incelemesi. Uygulama veya yayın değiştirilmedi. Kapsam: mevcut Board, ortak PlayLayout/WordList/MobileTargets, Solo/Arena kesinleşme, ses ve mevcut kontrollü testler. Bu kayıt fiziksel cihaz, DOM animasyonu, ses dinleme veya FPS kanıtı değildir.

## 1. Efektin kaynağı yalnız kesinleşmiş hedef farkı olmalı

- Kaynak: `components/game/common.tsx:60-66,80-104`, `components/game/Board.tsx:15-16,39`, `components/game/Solo.tsx:137-140`, `components/game/Arena.tsx:95-98`.
- Mevcut koruma: Solo ve Arena tahta `strokes` verisine iyimser pending çizgi eklerken `wordList.strokes` yalnız kesinleşmiş kayıtları taşır. Board pending çizgiyi `is-new` yapmaz. `tests/board-interactions.test.ts:245-247` onay öncesi parıltısız ve onay sonrası vurgulu davranışı kontrol eder.
- Risk: Yeni uçuşları tahta çizgi sayısından üretmek reddedilebilecek kelimeyi kutlar. Board `initialFound` ve WordList `seen` bugün kısmen `animationend` üzerinden tüketiliyor; hareket azaltma/gizlenme/animasyon iptali olay üretmeyebilir. Bu, veri bozulması kanıtı değil, yeni efekt sistemi için yaşam döngüsü riskidir.
- Öneri: `wordListKey ?? boardIdentity` ile scoped dekoratif katman. Mount'taki onaylı ID'ler sessiz baseline; sonraki yeni ID'ler görsel başlamadan tüketilir. `animationend`/timeout yalnız geçici efekt DOM'unu temizler. En fazla son birkaç efekt, birikmiş kuyruk yok. Pending→rejected sıfır; pending→confirmed tek efekt.
- Kabul: kaydedilmiş çizgilerle mount sıfır efekt; aynı confirmed snapshot/revision yeniden gelirse sıfır; paused/hidden durumda gelen onay görünürlüğe dönüşte oynatılmaz; tahta döndürme aynı ID'yi tekrar kutlamaz; yeni Arena round aynı target ID'leri kullansa da yeni kapsamın ilk yükü sessizdir; StrictMode effect replay/unmount pending RAF/timeout üretmez.

## 2. Dekoratif hareket tahta geometrisi ve giriş sahipliğinden ayrılmalı

- Kaynak: `components/game/Board.tsx:20-24,48-50,65-67`, `components/game/common.tsx:81-103`, `components/game/Solo.tsx:134-137`.
- Mevcut koruma: seçim önizlemesi imperative ve RAF başına işlenir; erken kabul pending hareketi temizleyip bir kez commit eder. `tests/board-interactions.test.ts:235-243` pointermove sırasında React render olmamasını; devamındaki early-word testleri hızlı örnek atlama/ters yön/önek belirsizliğini sınar. PlayLayout döndürmede Board'u yeni key ile mount eder ve koordinatları özgün tahtaya dönüştürür.
- Risk: uçuşu React preview state'ine veya her pointermove ölçümüne bağlamak gecikme/reflow yaratır. Story hedef rafı doğru kelimeden hemen sonra sıradaki hedefe geçer; yalnız `wordList.board.targets` içinden önceki ID aranırsa efekt kaybolabilir veya yanlış hedefe uçabilir.
- Öneri: efektler `pointer-events:none`, `aria-hidden`, akış dışında ve sınırlı ömürlü olsun; `transform/opacity` kullanılsın. Uçuş başlangıç/bitiş ölçümü yalnız onay olayında yapılır; tamamlanan hedef bilgisi tam `board.targets` içinden alınır. Görünür hedef bulunamazsa ilerleme sayacına sade vurgu; hareketli tahta/çevrilmiş koordinatlar için mevcut `viewCell` kullanılır. Harfler ve tahta fiziksel boyutu animasyonda ölçeklenmez.
- Kabul: 100 move/RAF olayında mevcut render sınırı korunur; doğru kelimeden hemen sonra ikinci sürükleme kabul edilir; effect katmanı hit test veya odak almaz; döndürme/viewport değişiminde eski ekran koordinatlı uçuş bırakılır; hızlı üç başarı aynı anda okunur ve DOM sabit üst sınırdadır. Mobil görsel test harf/tahta taşmasını font yüklendikten sonra da inceler.

## 3. Sonuç animasyonu kayıt, ödül ve ses otoritesi olmamalı

- Kaynak: `components/game/Solo.tsx:66,78-88,105-113,151-159`, `components/game/useGameSound.ts:8-36`, `lib/game/sound.ts:49-110`, `lib/game/haptics.ts:6-10`.
- Mevcut koruma: kayıt/ödül completed durumuyla işlenir; 380ms sonuç açılışı yalnız sunumdur. Günlük/Arena chime kesinleşmiş yanıt yolundadır. Sesin ortak engine'i, gizli/arka plan guard'ı, tek phrase/priority/gap sınırı ve hatada oyunu durdurmayan haptik adaptörü zaten var. `tests/sound-hook.test.ts` lifecycle/unmount/hidden dönüşünde replay olmamasını; `tests/completed-review.test.ts` sonuç→inceleme→sonuçta kayıt ve koleksiyonun değişmemesini kontrol eder.
- Risk: yeni yıldız/uçuş bitişinde ödül yazmak veya ses çalmak çift ödül/tekrar ses yaratabilir. Her yıldız için ayrı chime çağrısı mevcut priority/tek phrase davranışını gereksiz karmaşıklaştırır. Tamamlama animasyonunda devam düğmesini kilitlemek hızlı oyuncuyu bekletir.
- Öneri: tamamlanmış veri doğrudan sonuçta görünür; yıldız hareketleri dekoratiftir. Devam ilk anda kullanılabilir; kapanış/sonraki bölüm bütün geçici işi temizler. Ses ve haptik mevcut onay akışında bir kez çalar; uçuş ve yıldızlar aynı doğrulanmış olayın görsel takvimini kullanır. Hareket azaltmada aynı sonuç metni/yıldızlar/eylemler gecikmesiz görünür.
- Kabul: son kelime→hemen devam, sonuç→incele→yeniden sonuç, arka plan→dönüş, reduced-motion ve unmount sırasında aynı kayıt/best/albüm değerleri korunur; yeni bölümde eski callback/ses/partikül yoktur. Mevcut content/progress/early-input/server testleri geçmeden görsel sonuç kabul edilmez.

## Son inceleme

Uygulama sonrası koordinatörün diff'i üzerinde bu üç kabul başlığı yeniden değerlendirilecek. Henüz yeni uygulama veya yeni test sonucu yok.

## Uygulama sonrası dar inceleme

İncelenen yeni kaynak: WordFeedback, word-feedback ledger, Celebration, JourneyResult, ortak bağlantı, typography ve native paket girişleri. Aşağıdaki iki P2 davranış kontrollü gerçek WordFeedback fonksiyonu + sahte DOM/timer ortamında tekrar üretildi; bu tarayıcı/FPS kanıtı değildir.

1. **P2 — kapsam değişince eski uçuş temizlenmiyor.** `components/game/WordFeedback.tsx:18-23`: ledger yeni scope'u baseline alır fakat `work.current` silinmez. Kontrollü çıktı: scope A'da bir onay sonrası `active=1,timer=1`; scope B/boş listeye geçince yine `active=1,timer=1`. Yeni tahtada 600ms'ye kadar eski uçuş/destination animasyonu kalabilir. Scope değişiminde clear veya scope ile component key gerekir. Kabul: kapsam değişir değişmez eski spark/timer/Animation sıfır; yeni kapsamın baseline'ı sessiz.
2. **P2 — aynı tahtadaki açık tekrar oyununda yeni kelimeler kutlanmıyor.** `lib/game/word-feedback.ts:4-10`, `components/game/Mystery.tsx:38,42`: Mystery tekrar düğmesi aynı component ve board içinde strokes'u [] yapar; scope değişmez. Ledger eski ID'leri unutmuyor. Kontrollü çıktı: baseline [0] → [] → [0] için sıfır efekt. Açık tekrar sayacını scope'a katmak güvenlidir; normal Solo run key ile remount olduğu için bu yoldan etkilenmez. Kabul: tekrar turunda her yeni doğru kelime bir kez efekt üretir; tamamlanmış eski best ve koleksiyon değişmez.

Diğer sınırlar kaynakta doğru: WordFeedback confirmed verisini wordList'ten alıyor; son Solo kelimesi readOnly olurken paused olmadığı için efekt üretebiliyor; hidden/native-inactive/rotation dekorasyonu temizliyor; efektten save/chime/onCommit çağrısı yok; en fazla dört uçuş ve 600ms temizlik var. Uygulama içi/OS hareket azaltma sonucu okunur bırakıyor. Fontlar iki yerel WOFF2 + OFL ile geliyor; native publicDir aynı assetleri paketliyor, web offline hazırlığı woff2 içeriyor; mevcut attachPlayFit font ready sonrası tekrar ölçüyor. Gerçek font renderı/cihaz QA koordinatörde.
