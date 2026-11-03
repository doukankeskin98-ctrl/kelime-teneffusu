# 4 Kasım 2026 · Sürekli çizim güvenilirlik incelemesi

İnceleyen: `ios_reliability_review`. Kapsam: Board/input-gesture/viewport, menü ve native titreşim yolu, WordFeedback ve bu yolları etkileyen bildirim yerleşimi. Uygulama dosyaları değiştirilmedi; bu görevde test, derleme, cihaz veya yayın işlemi yapılmadı.

## Sonuç

İncelenen son kaynakta aşağıdaki üç somut bulgunun karşılığı düzeltildi. Bu dar kapsamda kalan kesin bir engelleyici hata bulunmadı. Bu sonuç fiziksel cihaz akıcılığı veya bütün yeni arayüz değişiklikleri için kabul değildir.

## Bulgular ve düzeltmeler

1. `components/game/WordFeedback.tsx:39`: uçan etiketin doğrudan `target.label` kullanması, çok parçalı gizli hedefin bulunmamış parçasını açıyordu. Artık gruptaki bütün hedef kimlikleri doğrulanmadan yalnız `target.text` gösteriliyor; tamamlanınca tam etiket kullanılıyor. `tests/word-feedback.test.ts` içindeki KUYRUKLU / YILDIZ regresyonu gerçek dekoratif efektin etiketlerini denetliyor.

2. `components/game/Board.tsx:70`: aynı ilk hücre içinde yapılan küçük hareketten sonra, rAF çalışmadan parmak kaldırıldığında bekleyen kesirli uç iki-dokunuş işaretini yeniden boyayabiliyordu. Bırakma yolu artık `pending` ve rAF'ı temizliyor. `tests/board-interactions.test.ts` içindeki ilk hücrede kesirli hareket / bırakma / flush testi, çizginin hücre merkezinde kaldığını ve sonraki ikinci dokunuşun tek kabul ürettiğini denetliyor.

3. `lib/game/viewport.ts:67`: fitter'ı ertelemek, oyun öncesine eklenen hesap/kayıt uyarısının CSS akışıyla tahtayı itmesini tek başına engellemiyordu. `components/game/App.tsx:114` ve `128` uyarıları ortak `game-notices` katmanına aldı; `app/continuous-play.css:52` oyun ve aktif Arena için bu katmanı sabit konumlandırıyor. Böylece incelenen üst bildirimler normal oyun yerleşiminden çıkarıldı. Gerçek CSS motorunda bildirim açılırken tahta konumunun sabit kalması ayrıca görsel kabul gerektirir.

## Korunan ayrımlar

- `gestureTip`, kesirli görsel koordinatı hesaplıyor; `advanceGesture` ve `earlyWordEnd` hücre/kelime kabulünü sürdürüyor. Aynı hücre içindeki görsel hareket yeni önizleme, titreşim, kabul veya React render gerektirmiyor.
- Ölçüm kilidi fiziksel temas için tutuluyor; iki-dokunuş veya klavye seçiminin mantıksal titreşim oturumuna bağlanmıyor. Fitter ertelenmiş işi temas sonunda yeniden planlıyor. Mevcut iptal, eski native touch devri ve erken kabul testleri bu davranışla birlikte korunuyor.
- Native `menu` cue'su ayrı tek atımlı sürücüye gidiyor; selection oturumunu başlatmıyor veya sonlandırmıyor, bekleyen menü darbelerini kuyruğa almıyor.
- Menü geribildirimi yalnız `click` dinliyor; pointer hareketi/kaydırma başlangıcı üzerinden darbe üretmiyor. DOM testi iç simge, kapsam, disabled, opt-out, tercih, görünürlük, uygulama etkinliği ve cleanup yollarını kapsıyor. Sentetik click de şu an etkinleştirme sayılıyor; bu incelemede engelleyici hata olarak değerlendirilmedi.

## İncelenen regresyonlar ve kabul sınırı

Kaynakları okunan hedefli testler: `tests/board-interactions.test.ts`, `tests/input-gesture.test.ts`, `tests/play-fit.test.ts`, `tests/menu-feedback.test.ts`, `tests/native-haptics.test.ts`, `tests/word-feedback.test.ts`. Yeni fitter testi fiziksel temas boyunca tekrarlanan ölçüm taleplerinde yazıların ertelendiğini ve bırakmada bir karede son bütçenin uygulandığını denetliyor. Testlerin bu görevde çalıştırıldığı veya geçtiği iddia edilmiyor; çalıştırma koordinatörün doğrulama kaydına aittir.

Kontrollü DOM/geometri testleri WebKit'in gerçek yerleşimini ve fiziksel parmak gecikmesini ölçmez. Cihaz kabulünde sabit viewport'ta tahta konumu/boyutu, kesirli uç takibi, hızlı/yavaş sekiz yön, geri sürükleme, erken kabul sonrası devam, bildirim gelişi, yön değişimi, arka plana geçiş ve menü/harf titreşimi birlikte denenmeli. FPS, girişten boyamaya gecikme ve uzun oturum kararlılığı bu incelemede ölçülmedi. WoW ile ölçülmüş eşdeğerlik iddiası yok.
