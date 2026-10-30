# Faz 1 · dar bağımsız giriş incelemesi

Güvenilirlik rolü AGENT/RULES/HEARTBEAT/MEMORY/RUNBOOK ve ortak bağlam okundu. Uygulama salt okunur; yalnız bu günlük yazılır. Başlangıç Board/legacy-touch ve 30 gerçek Board kontrollü kabul testi incelendi; 30/30 geçti. Bu, DOM, native cihaz veya FPS kanıtı değildir.

Yeni yön kilidi/imperative feedback için en yüksek üç regresyon riski:

1. `Board.tsx:33,46` eski hücre hesabı her kenar geçişinde yeni hücreye sıçrar. Yeni merkez ağırlıklı kilit, çapraza giderken merkez alanına girmeyen kısa yatay/dikey örnekte kilitlenmemeli. Kabul: aynı başlangıçtan köşe jitter'ı, sonra çapraz merkez; doğru ilk yön, sekiz yön ve geri dönüş.
2. `Board.tsx:35,47` çizim RAF'ı ile gönderilen sonuç farklı zamanlarda işlenir. Yeni yol da release koordinatını RAF beklemeden değerlendirmeli; ileri gidip geri dönünce son kısa endpoint'i göndermeli. Native takeover sonrası eski pointer up/cancel/lost-capture tek commit'i bozmamalı. Kabul: hızlı down→up, flush öncesi geri dönüş, karma event akışı.
3. `Board.tsx:18–32,54` imperative DOM'a geçince iptal, yeni tahta ve unmount eski frame'i kesin durdurmalı. Timer/parent render'ı seçili harf/çizgiyi silmemeli; yeni strokes/blocked/readOnly durumları yeni seçime izin vermemeli. Kabul: RAF beklerken signature/zoom/rotation/hidden/unmount ve aktif seçim sırasında parent render. Eski onaylı çizgiler korunur.

Bunlar başlangıç risk/kabul yüzeyidir; eski canlı sürümde yeni arıza iddiası değildir.

## Son dar diff incelemesi

- İlk taslaktaki dış koordinatı `while(length)` ile sınıra çekme, 1e12 örneğinde koordinatla doğrusal çalışma riski taşıyordu. Koordinatör aynı kusuru bağımsız yakalayıp inceleme mesajından önce O(1) analitik clamp ile düzeltmişti. Güncel input/Board 46/46 kontrolde uzak koordinat, n=6..13, sekiz yön, ters kısaltma, yeniden ölçüm, native çift akış ve parent render geçti.
- `common.tsx` imperative label'ın blocked/readOnly'de erken dönüşü gerçek bir geçiş kusuruydu: önceki DOM hidden değerleri React'in değişmeyen sanal hidden değerlerinden geri yüklenmez. Koordinatör locked modda bütün slotları doğrudan eşitleyip effect'i koşulsuz yaptı. Bağımsız inline gerçek PlayLayout probe'unda ABC seçimi → WAIT pending geçişinde mesaj açıldı, word/count/loupe gizlendi. Güncel word-access/haptics 27/27 kontrolü de geçti; yeni pending/review/pause regresyonu dahildir.
- CSS'teki color transition'ının seçimde yalnız transform/opacity şartıyla uyuşmadığı bildirildi ve kaldırıldı. Genel stroke-width animasyonu da kaldırıldı. Başlangıçtan beri var olan `initialFound` yaklaşımının pause sonrası yeniden takılan is-new çizgiyi yeniden canlandırması, onaylı/pending ayrımı ve pause/animation-end kaydıyla ele alındı. Güncel Board kontrolü pending çizginin başarı pulse'u almamasını, gerçek onay ve pause sonrası tekrar pulse olmamasını sınar.

Son incelediğim giriş/label diff'inde açık P1 engeli yok. Fiziksel Safari/Touch, 20 el denemesi, <100ms ve 60fps ölçülmedi; destekli browser engeli aşılmadı. Bu inceleme bağımsız cihaz veya görsel kalite onayı değildir.

Son ek diff: common Board kimlik key'i, Strict Mode cleanup/setup, confirmed/pending stroke pulse'u, Solo'nun completed toast'ı bastırması ve sonuç için 120ms gecikme dar incelendi. Değişen input/Board 48/48 kabulü yeniden geçti; iki yeni kontrolün gerçek Strict replay ve pending→confirmed→pause davranışları korunur. Bu son diff'te açık P1 bulgu bulunmadı. Yayın/merge yapılmadı; toplu kapılar ve inceleme dalının teslimi koordinatördedir.
