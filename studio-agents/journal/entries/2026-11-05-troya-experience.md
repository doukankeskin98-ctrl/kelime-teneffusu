# Sonuç dialogu: güvenli alan ve boşluk — deneyim incelemesi

Kaynak: `5c503d7`, 0.36.0; uygulama salt okunur. Kanıt görseli: `2A68D3A4-482D-4845-A535-E815260D38A6/2-Fotoğraf-2.jpg`. Görselde Tebrikler/Kapat üst sistem alanına yakın; kazanım içeriği ile Yeni dünyaya geç arasında belirgin boşluk var. Görsel kullanıcının paylaştığı ekran görüntüsüdür; bu incelemede fiziksel iPhone veya tarayıcı işletilmedi.

## 1. Ortak dialog yardımcısı güvenli alan sınırını geçersiz kılıyor

- Kaynak: `lib/game/legacy-ui.ts:26`; `app/continuous-play.css:46`; `app/layout.tsx:4`; `capacitor.config.ts:4`.
- `openGameDialog` bütün dialoglara `visualViewport.height - 24` değerini inline `maxHeight` olarak yazıyor. Böylece CSS'teki `100svh - 20px - safe-top - safe-bottom` sınırı uygulanmıyor. Native yapılandırma `viewportFit:'cover'` ve `contentInset:'never'`; WebView içerik alanı sistem güvenli bölgesini kendiliğinden ayırmıyor. Mevcut merkezleme status alanı dışında kalmayı garanti etmiyor.
- Fallback aynı kusuru paylaşıyor: `legacy-ui.ts:26` top için yalnız 12px alt sınırını kullanıyor; `viewport-arena.css:44` de güvenli inset içermiyor.
- Asgari ortak çözüm: Native dialog ve fallback için tek bir güvenli görünür dikdörtgen tanımla. JS viewport yüksekliğini CSS değişkenine aktarabilir; CSS güvenli inset sınırını korumalı. Ya da helper aynı safe-top/bottom ve visualViewport offset'ini ölçüp hem üst sınırı hem yüksekliği tek hesapta uygulamalı. Sadece başlığa padding eklemek alt eylem güvenliğini çözmez.
- Kabul: Dialog başlık/kapat/eylem rect'leri görünür viewport içinde kalmalı; üst/alt güvenli inset'e ek yaklaşık 12px dış pay korunmalı. 430×932, safe-top59/bottom34 için üst sınır en az71px ve alt sınır en fazla886px olmalı. Inset0 tarayıcıda gereksiz çifte boşluk oluşmamalı. Kapat/Escape/geri odak davranışı korunmalı.

## 2. Esnek sonuç gövdesi kalan yüksekliği boşluğa dönüştürebiliyor

- Kaynak: `app/world-journey.css:26–36`; `app/achievement-loop.css:89–92`; `app/studio-polish.css:43–45`; `app/continuous-play.css:46–49`.
- Dialog `height:auto` olsa da gövde `flex:1 1 auto`, başlık ve eylemler `flex:0 0 auto`. Kaynakta gövdenin büyümesini engelleyen bir sonuç sözleşmesi yok. Dialogun WebKit tarafından verilen yüksekliğinin içerikten fazla olduğu durumda farkın tamamı modal-content'e gider; CTA içeriğin ardından gelmek yerine aşağıda kalır. Paylaşılan görüntü bu mekanizmayla uyumlu; WebKit'in hesaplanan yüksekliği bu tur ölçülmedi.
- Asgari ortak çözüm: Sonuç panelini içerik yüksekliğine göre sığan, yalnız güvenli üst sınıra gelince gövdesi küçülüp kaydırılan bir flex düzenine getir. Gövde için `flex-grow:0` ve doğal temel yükseklik, panel için içerik yüksekliği yaklaşımı; uzun Arena listesinde gövde scroll'u, başlık ve footer erişimi korunmalı. Ekrandaki büyük boşluğu sabit negatif margin ile saklama.
- Kabul: Kısa sonucu uzun ve kısa ekranlarda karşılaştırırken content sonu ile footer arası yaklaşık16–24px normal payda kalmalı; artan ekran yüksekliği panel içindeki boşluğu büyütmemeli. Sonuç ayrıntısı açıldığında veya yeni albüm satırı eklendiğinde içerik kaydırılır; devam/kapat eylemleri erişilebilir kalır. 320×568 ve 414×736 gibi kısa görünümler ile 430×932 uzun görünüm birlikte kontrol edilmeli.

## 3. Footer'sız ortak sonuçlarda kırpılmanın kaydırma yolu yok

- Kaynak: `components/game/common.tsx:26`; `components/game/Sprint.tsx:34`; `components/game/Mystery.tsx:43`; `app/continuous-play.css:46`.
- Modal yalnız `footer` prop'u varsa `.modal-content` oluşturuyor. Sprint ve Mystery sonuçları `scene-result` kullanıyor fakat children/eylemleri doğrudan dialog içinde. Ortak scene-result kuralı `overflow:hidden`; bu iki sonuçta yüksekliğe sığmayan içerik için kaydırılabilir body yok. Güvenli yükseklik doğru daraltılınca bu açık daha görünür olabilir.
- Asgari ortak çözüm: Bu mevcut sonuçları aynı body/footer sözleşmesine almak veya footer'sız scene-result'a açık scroll fallback vermek. Yeni sonuç tasarımı veya oyun kuralı gerekmez.
- Kabul: Kısa görünümde Sprint uzun rekor başlığı ve kayıt uyarısı, Mystery uzun açıklamasıyla bütün eylemlere ulaşılır. Normal/öykü/Arena/ek mod sonuçları aynı güvenli sınırdan yararlanır; dialog dışındaki sayfa kaydırılarak kaçış gerekmez. Legacy fallback de aynı içerik/eylem erişimini sağlamalı.

## Sınırlar

Bu rapor üç ortak yerleşim kusuruyla sınırlıdır. Uygulama dosyası değiştirilmedi; test, tarayıcı, yayın veya alt ajan kullanılmadı. Veri/ödül hesaplarına, mevcut ilerlemeye, 720/180/1040ms kelime ve sonuç zamanlamasına dokunmak gerekmiyor. Fiziksel iPhone doğrulaması yapılmış sayılmaz; görsel kusurun giderildiği ancak yeni önizleme/cihaz kanıtıyla söylenebilir.

## Safari son kelime geçişinde skorun üzerindeki düğme

Koordinatörün `frame-005.704` karesinde gördüğü “Sonuca geç” düğmesi skor satırının üzerine geliyordu. Solo bu düğmeyi HUD içinde üretiyordu ve CSS onu mutlak konumlandırıyordu. Son kelime onaylandığında düğme artık tahtanın altındaki mevcut kontrol satırında, İpucu düğmesinin yerinde gösteriliyor. Sonuç açıldığında aynı alan inceleme durumuna geçiyor. Kısa ekran için satır ve düğme en az 44px yüksekliğinde. Yerleşim normal belge akışını kullanıyor. Enter ve Boşluk aktivasyonunu tarayıcının `button type="button"` davranışı sağlıyor.

Üç hedefli test dosyasındaki 102 test geçti. Testler kontrol satırında tek bir sonuç düğmesi bulunduğunu, yedi Solo türünde geçişin aynı tahtayı koruduğunu ve iki hızlı etkinleştirmede ödül veya kaydın ikinci kez yazılmadığını kontrol ediyor. Günlük yarış testi sunucu onayından sonra aynı eylemin ek istek göndermediğini de doğruluyor. Değişen dosyaların `git diff --check` kontrolü geçti.

Bu ek düzeltmede doğrulama, bileşen davranış testleri ve 44px CSS yüksekliği ile sınırlı. Safari karesinin çekildiği kısa görünümdeki son görsel kontrol ve gerçek cihazda klavye/dokunma denemesi koordinatörün kabulüne ait.
