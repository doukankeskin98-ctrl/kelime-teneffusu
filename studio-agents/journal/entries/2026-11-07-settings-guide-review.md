# Sade ayarlar ve çizme öğreticisi — 2026-11-07

Rol: experience. 0.41.0 çalışma kaynağı üzerinde salt okunur inceleme. Kod, yayın, hesap veya ilerleme değiştirilmedi. Kapsam: mevcut ayarların sadeleşmesi ve gerçek tahtada döngülü el gösterimi; yeni müzik/reklam servisi veya WoW görsellerinin kopyalanması kapsam dışı.

## Resmî kaynaklar ve uygulamaya karşılığı

- [Apple HIG — Settings](https://developer.apple.com/design/human-interface-guidelines/settings): az ayar, iyi varsayılanlar, sistem tercihlerine saygı; göreve özgü seçenekler bağlamında kalmalı. Mevcut ses/titreşim önde; görünüm, erişilebilirlik ve hesap/destek ayrı kısa gruplar olabilir. İşlevi bulunmayan müzik veya reklam kaldırma kontrolü eklenmemeli. Bu gruplama proje önerisidir, Apple'ın zorunlu ekran şeması değildir.
- [Apple HIG — Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding): yaparak öğrenme, bağlama yakın kısa açıklamalar, isteğe bağlı/atlanabilir öğretim; atlanan öğretim her açılışta geri gelmemeli, yardımda yeniden bulunabilmeli.
- [Apple HIG — Motion](https://developer.apple.com/design/human-interface-guidelines/motion): hareket anlam taşımalı, kısa ve kesin olmalı; bilgi yalnız harekete bağlı kalmamalı ve kullanıcı animasyonun bitmesini beklememeli.
- [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility): Reduce Motion etkin olduğunda otomatik/tekrarlayan hareket azaltılmalı; sık kullanılan etkileşimler basit ve erişilebilir olmalı.
- [Apple — Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/): hesap açılabilen uygulamalarda silme uygulama içinden başlatılabilmeli ve kolay bulunmalı; otomatik misafir hesapları da kapsamda. Yalnız devre dışı bırakma veya destek e-postasına yönlendirme yeterli değil. Mevcut `DeleteAccount.tsx:22–23` erişimi sadeleşmede korunmalı; bu inceleme sunucu silme işlemini veya Apple token iptalini doğrulamaz.

Kaynak metinleri 7 Kasım 2026'da resmî Apple sonuçlarından okundu. HIG HTML sayfaları JavaScript kabuğu döndürdü; resmî Markdown bağlantıları araçta desteklenmeyen içerik türü verdi. Bu nedenle HIG metin doğrulaması resmî sayfaların arama dizinindeki içeriklerine dayanır; kaynak sınırı budur.

## En önemli üç davranış riski

### 1. Gösterim gerçek seçim motorunu çalıştırmamalı

Kaynak: `Board.tsx:23–36,53–57,59–86,95`; `FirstPlayGuide.tsx:3–4`. `show/notifyLetters/commit` gerçek seçim önizlemesi, ses/titreşim ve kayıt akışına bağlı. El demosunu bu yollarla sürmek istemsiz seçim veya geri bildirim üretebilir. Öneri: mevcut tahta koordinatlarında ayrı `pointer-events:none`, `aria-hidden` sunum; gerçek pointer/touch/klavye etkileşimi başlayınca el derhal gizlenir. Oyuncu seçimi sırasında demo yeniden başlamaz. Hedef bulunduğunda, Atla, pause/help/arka plan, readOnly veya unmount sırasında temizlenir. Hücre merkezlerini mevcut SVG `n×n` koordinatlarından türetmek sabit piksel kaymasını önler.

Kabul: demo birkaç kez dönerken stroke/puan/ipucu/titreşim değişmez; çizim demo bitişini beklemeden başlayabilir; yatay/çapraz/ters hedef ve yeniden boyutlandırmada gösterim doğru hücrelere oturur; iptal/arka plan sonrası hayalet el kalmaz. Bunlar yeni uygulama için kabul koşullarıdır, mevcut demoda doğrulanmış hata iddiası değildir.

### 2. Döngü, erişilebilirlikte tek öğretim kanalı olmamalı

Kaynak: `FirstPlayGuide.tsx:4`, `Board.tsx:87,94–97`, `GameSettings.tsx:14,25`. Mevcut kısa metin, Atla, ilk/son harfe dokunma ve klavye alternatifleri korunmalı. Sistem `prefers-reduced-motion` veya oyun içi hareket azaltma açıkken sürekli hareket yerine statik başlangıç/bitiş işareti ve yön çizgisi gösterilmeli. Dekoratif el erişilebilir ağaca ve `role=status` döngüsüne sokulmamalı; ekran okuyucuya her tur yeniden bildirim yapılmamalı.

Kabul: normal ve hareketi azalt modlarında aynı kelime öğrenilip seçilebilir; Atla çalışır; tab/Enter ile seçim ve yardım kapatma erişilebilir kalır; sistem tercihi açıkken oyun ayarı kapalı olsa da sürekli döngü yoktur. Fiziksel VoiceOver testi bu incelemede yapılmadı.

### 3. İlk öğretim yalnız zaman geçti diye kaybolmamalı

Kaynak: `lib/game/first-play.ts:5–6`, `Solo.tsx:52–57`. `needsFirstPlayGuide`, herhangi bir kayıtta `elapsed>10` olduğunda false döner. İlk bölümde henüz kelime bulmamış yeni oyuncu 10 saniyeden fazla bekleyip çıkarsa rehber sonraki girişte sessizce kaybolabilir; bu gerçek kontrol akışı riski, cihazda tekrar üretilmiş sonuç değildir. Yeni gösterim bunu çoğaltmamalı. Öneri: yeni oyuncunun başlamış öğretimini tamamlaması/atlamasıyla ayırt et; eski ilerlemeli hesaplara öğretimi zorla açma. Mevcut bölüm/ödül kayıtlarını sıfırlama.

Kabul: sıfır ilerlemeli oyuncu ilk kelime öncesi 10 saniyeyi aşar, çıkar ve döner → gerekli rehber bulunabilir; Atla sonrası tekrar zorlanmaz; eski ilerlemeli hesaplar otomatik öğretime düşmez; yardımdan isteğe bağlı yeniden öğretim açılabilir.

## Doğrulama sınırı

Bu çalışma kaynak ve resmî rehber incelemesidir; görsel sonuç, gerçek parmak konforu, titreşim, FPS, VoiceOver ve App Store kabulü doğrulanmadı. Tam oyun yeniden tasarımı veya yeni bağımlılık önerilmedi.
