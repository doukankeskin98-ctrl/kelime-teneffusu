# Odak kararı · yarım seçimi arka planda bırakma

Başlangıç ve içerik kabulü maintenance-intake günlüğünde. Tek uzman gerçek Board gövdesi VM'sinde native pointercancel/element blur gelmeyen durumda global blur + hidden visibility sonrasında AHO preview'nun kaldığını ve sonraki up'ın commit verdiğini doğruladı. Bu, fiziksel cihazda o native olay sırasının gözlendiği iddiası değildir.

Adaylar: (1) destekli gerçek telefon/görsel kontrolü, yüksek fayda fakat önceki preview engelinde recovery kanıtı yok; (2) Board pencere/sekme yaşam döngüsünde yarım seçimi iptal etme, somut source+VM kanıtı, küçük maliyet ve düşük kayıt riski; (3) yeni kozmetik keşif odası, daha büyük kapsam ve temel kullanım önceliğine göre düşük değer. İkinci odak seçildi. Günlük içerik ayrı mevcut sözleşme olarak eklenir; sırf görsel değişiklik sayısı için 0.12.0 yeniden tasarlanmaz.

## Uygulama öncesi kabul

- `window.blur` veya `document.hidden === true` visibilitychange, devam eden drag/tap/klavye anchor'ını, preview harflerini ve sıradaki preview frame'ini ortak clear yoluyla iptal eder. Eski pointerup tek başına kelime göndermez; yeniden etkileşim yeni seçimle başlar.
- Pencereye geri dönme/visibility visible tek başına puan/kelime üretmez; aktif görünür seçim de gereksiz bozulmaz. Günlük ve Arena saatleri/ceza/puan kuralları değişmez. Yalnız yarım girdi temizlenir; kabul edilmiş strokes veya kayıtlar kaybolmaz.
- Global listener'lar unmount'ta kaldırılır. Yüklü yeni onPreview callback'i kullanılır; component unmount sonrası state callback'i çağrılmaz.
- Mevcut sekiz yön, ters çapraz drag, iki uca dokunma, zoom'da pan/tap ayrımı, klavye, pause, element blur, pointercancel ve resize temizleme davranışı kabul testleriyle korunur. UI işaretleri aynı preview hücrelerinden gelir; grid/hit rect/tahta geometrisi değişmez.
- Gerçek Board TSX gövdesi kontrol edilen hook/event/RAF kabuğunda çalıştırılır; eski kaynak yeni guard kabullerinde başarısız olmalı. Bu, gerçek DOM/native event sırası, fiziksel telefon, sistem büyük yazısı, ekran okuyucu veya FPS testi değildir.
- İki yeni sabit bölüm: Patili komşular, Hayvanlar, Rahat 6×6/4 kelime, seed 2026102601; Perde açılıyor, Sinema, Dengeli 8×8/7 kelime, seed 2026102602. ID tarih/sıra kuralıyla; snapshot ve hash sabit. Ana sayfa/arşiv/dünya API ve damga eşleşmesi mevcut yol üzerinden doğrulanır. Eski içerik, ödül grubu ve schema/göç/manifest korunur.
- Test, içerik, tip, üretim build, Worker HTTP ve mevcut CI başarılı olmadan yayın yok. Son diff tek uzmanla dar kapsamda kontrol edilir; GitHub/Sites tam ağaç eşleşmesi ve aynı public adrese gerçek yayın sonucu gereklidir.

Ek dar kabul (aynı tahta yaşam döngüsü): uzman odak korunurken paused aria-label'ın gerçek cursor harfini söylemeye devam ettiğini JSX ile doğruladı. Duraklatılmış tahta erişilebilir adında satır/sütun/harf yerine ekrandaki duraklama mesajını sunacak. Normal klavye cursor bilgisi korunacak; ekran okuyucuda gerçek telaffuz ölçülmüş sayılmayacak.
