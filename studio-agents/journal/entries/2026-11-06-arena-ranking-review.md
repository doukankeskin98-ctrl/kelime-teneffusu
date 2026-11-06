# Arena sonuç sıralaması · sınırlı deneyim incelemesi

Kaynak: 0.39.0, `e20496350cfa0f8e7988a5d2d14fde1014d6266b`. Yalnız kaynak okundu; uygulama kodu, test, tarayıcı, oyuncu verisi ve yayın değiştirilmedi. Aşağıdaki satırlar başlangıç kaynağına aittir.

## 1. Bitmiş maçta sıralama eski ve ayrı pencereye dönüyor

`components/game/Arena.tsx:116–122`: alt Sıralama ve HUD, bitişten sonra da `setRanking(true)` çalıştırıyor. `ranking=true` ortak sonuç ekranını bastırıyor. Ayrı sıralama `Modal` çağrısı `scene="stadium"` veya temalı sınıf almıyor; `historical` da geçilmediği için tamamlanmış maçta bağlantı durumu canlıymış gibi gösterilebiliyor. Aynı anda sıralama açıkken maç biterse kullanıcı sonuç yerine bu eski pencerede kalıyor.

Öneri: bitmiş maçtaki her sonuç/sıralama girişi aynı sonuç sunumunu açsın. Aktif maçtaki sıralama gerekiyorsa stadyum temalı kısa panel olarak kalsın. Maç tamamlanınca bu canlı panel kapanıp gerçek sonuç ekranı gelsin; veri aynı sunucu sonucundan okunmalı. Kabul: normal bitiş, sıralama açıkken süre bitişi, sonuçtan tahta incelemesine geçiş ve yeniden Sıralama tıklaması aynı temalı sonuç listesini verir. Sonuç açılınca puan/ödül yeniden üretilmez.

## 2. Maç sıralaması, oda galibiyetleri ve genel derece ayrı anlamlar taşıyor

`Arena.tsx:121` maç listesini zaten doğrudan render ediyor; aynı listeyi ikinci kez eklemek çözüm değil. Oda galibiyetleri ise kapalı `details` içine alınmış. `app/world-journey.css:10` sonuç satırlarını krem kartlara, `app/viewport-arena.css:66–69` seri tablosunu açık krem panele çeviriyor. Ana Arena’daki `hubPanel==='rankings'` de `scene` almıyor (`Arena.tsx:90`); içeriği genel dereceli düello puanı, son maç puanı değil (`:137–142`).

Öneri: kısa sonuç başlığının altında açıkça “Maç sıralaması”, gerekiyorsa ardından görünür ve daha düşük ağırlıklı “Oda galibiyetleri” sunulsun. İki tablo aynı koyu stadyum paletini, hizalı sayıları ve Sen işaretini kullansın. Ana sayfadaki genel liste “Derece sıralaması” diye ayrılmalı; oda sonucunun yerine konmamalı. Kabul: ilk maç, çok maçlı oda, berabere ve ayrılan oyuncu hallerinde gerçek maç puanı/oda galibiyeti karışmaz. `server.ts:74–84` ve `:107–110` kaynaklı rank değerleri korunmalı; istemci indeksiyle yeniden sıra üretilmemeli.

## 3. Büyük grupta oyuncunun kendi sonucuna erişim zayıf

`Arena.tsx:128–135`: iki liste de 12'li sayfalama ile ilk sayfadan başlıyor. `viewport-arena.css:20` roster listesine 38dvh kaydırma alanı verirken, `dialog-frame.css:12` sonuç gövdesi de kayıyor. Büyük grupta Sen ilk 12 dışında kalabilir; uzun ad/çok satır iki kaydırma alanını daha da ağırlaştırır.

Öneri: liste üstünde kısa ve gerçek “Sen · sıra / oyuncu · puan” özeti her zaman bulunabilsin; maç sonucu için tek belirgin kaydırma yüzeyi seçilsin. Uzun adlar sarılmalı, sıra/puan ayrı dar sütunlarda kalmalı; genel derece listesi dahil erişilebilir odak ve 44px eylemler korunmalı. Kabul: 2, 8 ve 13+ oyuncu; eşit rank, uzun Türkçe ad, ayrılmış oyuncu, ilk sayfa dışında Sen; 321×570 ve 414×736 önizlemelerinde sonuç başlığı ve ana devam/tekrar eylemi erişilebilir.

Bu inceleme görsel kalite, fiziksel dokunma, FPS veya VoiceOver kabulü değildir. Koordinatör güncel çizimle ilgili görünür akışları ve hedefli regresyonları doğrulamalı; bu sınırlı düzeltmede oyun/puan/sıralama kuralları değişmemeli.

## Uygulama sonrası dar kaynak kontrolü

Yalnız `Arena.tsx` çalışma farkı ve yeni `app/arena-standings.css` okundu. Ana sonuçta maç ve oda tabloları açık; alt/HUD bitmiş maç girişleri ortak sonuca bağlı; canlı ve genel sıralama stadyum paletinde. Sunucu sıraları yeniden hesaplanmıyor. Dörtten fazla oyuncuda Sen sıra/puan özeti görünür. Koordinatörün 2/8/16 oyuncu, sayfa 2 ve 321×570/414×736 önizleme kabulü ile 800 test sonucu kendi doğrulamasıdır; bu uzman turunda yeniden çalıştırılmadı.

Tek kalan somut kaynak engeli koordinatöre bildirildi: lobideki `seriesOpen` Modal’ı footer’sız kaldığı için `.modal-content` sarmalı oluşmuyor. Yeni `.arena-scoreboard[open]` kuralının `overflow:hidden` değeri eski `.dialog-scrolls` davranışını eziyor. Uzun oda serisi kısa ekranda kırpılabilir. Öneri: bu pencereye de “Lobiye dön” footer ekleyerek ortak içerik kaydırmasını ve sabit eylemi kullanmak. Başka yeni kapsam veya puan/oyun mantığı değişikliği önerilmedi.
