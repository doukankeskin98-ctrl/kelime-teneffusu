# Mobil seçim yaşam döngüsü · bağımsız güvenilirlik incelemesi

26 Ekim 2026. Başlangıç: koordinatörün açtığı güncel Sites `7d06e7fc2f50a00fabe79b26e92b39cf00c88d8c`, **0.12.0**. Kök AGENTS, ajan README/kayıt/öncelikler, reliability rolünün AGENT/RULES/HEARTBEAT/MEMORY/RUNBOOK dosyaları, son skill-experience/skill-polish-decision ve archive-validation okundu. Kapsam Board, PlayLayout ve Solo üzerinden dokunma/iki uç/klavye seçimi; sunucu/kayıt/ödül ve görsel kimlik değişikliği önerilmez. Yalnız bu benzersiz günlüğe yazıldı. Uygulama ve test dosyaları salt okunur, yayın yapılmadı.

## 1. Pencere/sekme odağı kaybolduğunda yarım seçim açık kalabiliyor

**P2, en değerli dar odak. Kaynak:** `components/game/Board.tsx:9–18,31–34,38`; `components/game/Solo.tsx` zamanlayıcı/visibility effect'i. `clear` drag, bekleyen RAF, anchor ve preview'ı temizliyor. Paused/signature/zoom, element blur, pointercancel/lostpointercapture ve boyut değişimi bu yolu kullanıyor. Buna karşılık Board `window.blur` veya `document.visibilitychange` dinlemiyor. Solo yalnız yarışmasız aktif turda hidden→paused koruması sağlıyor; Daily ve diğer yarışmalı görünümler süreyi sürdürürken Board bu üst korumaya bağlı değil.

**Tekrar üretim:** Gerçek `Board.tsx` TypeScript'i JSX/hook/RAF/ResizeObserver/IO kabuğunda çalıştırıldı; gerçek `snapLine` kullanıldı. Kontrollü 6×6 tahtada [0,0]→[2,2] drag sonrası preview **AHO**. `window.blur` ve `document.hidden=true` + `visibilitychange` sonrasında preview yine **AHO**. Native `pointercancel` veya element `onBlur` üretilmeyen bu olay dizisinde dönüşte aynı pointerup **bir commit** çağırdı. Kontrol olarak gerçek element `onBlur` handler'ı yeni iki-uç anchor'ını ve preview'ı temizledi.

**Kanıt sınırı:** VM, tarayıcının gerçek native pointercancel/focusout sırasını modellemez. Bu nedenle bütün telefonlarda oluşan gözlenmiş hata veya tarayıcının mutlaka bozuk davrandığı iddiası yok. Kanıt, uygulamanın native iptal gelmeyen lifecycle için açık koruma içermediğidir. İşletim sistemi/sekme dönüşünde eski niyetin sürmesini engelleyen tutarlı iptal davranışı oyuncuya faydalı bir korumadır; oyuncu etkisi ölçülmedi.

**Öneri / maliyet / risk:** Board'da window blur ve yalnız hidden visibilitychange ortak clear yoluna bağlansın; unmount listener/RAF cleanup tamam olsun. Saat, sunucu süreleri, puan, tamamlanmış çizgiler veya kayıt değişmesin. Görünürlük geri gelince otomatik seçim/commit yapılmasın; oyuncu yeni bir ilk harfle başlasın. Uygulama düşük maliyet; regresyon riski normal drag/two-tap/keyboard akışını gereksiz yere temizlemektir.

**Kabul:** Gerçek Board VM senaryoları normal/ters çapraz drag, iki-uç, zoom'da pan ve klavye seçimini korusun. Window blur veya hidden olayında hem drag hem iki-uç/keyboard anchor ve pending RAF temizlensin; sonraki pointerup commit etmesin. Visible visibilitychange normal aktif seçimi keyfi temizlemesin. Pause/zoom/board değişimi, resize, pointercancel ve element blur korumaları sürsün. Unmount listener'ları ve bekleyen RAF'ı söksün. Fiziksel cihaz doğrulaması ayrı açık kalsın.

## 2. Duraklatılan tahtanın erişilebilir adı hâlâ güncel harfi söylüyor

**P3 erişilebilirlik tutarlılığı. Kaynak:** `components/game/Board.tsx:38–40`. Harf yüzeyi paused iken noktalara dönüşüyor, SVG seçimi gizleniyor ve tabIndex -1 oluyor; fakat `aria-label` içindeki `focused` cursor satırı `paused` koşuluna bağlı değil. Klavye odağı korunurken (örneğin üstten pause/arka plan durumu) label hâlâ konum ve gerçek harfi içeriyor.

**Tekrar üretim:** Gerçek Board JSX gövdesiyle odak state'i açılıp paused render'ına geçildi. Görünür harf çocukları **[·, ·, ·, ·]**, tabIndex **-1**, erişilebilir ad ise **“1. satır, 1. sütun: A.”** içerdi. Bu yalnız markup/state sözleşmesi kanıtıdır; ekran okuyucu anonsu veya fiziksel odak davranışı ölçülmedi.

**Öneri / fayda / maliyet / risk:** Paused durumda erişilebilir ad açık Türkçe duraklama/devam mesajı versin; aktif hücre harfi ve seçim talimatı yalnız oynanabilir durumda sunulsun. Düşük maliyet ve düşük risk, kayıt/rekabet kuralı değiştirmez. Kabul: paused yüzey ile accessible name tutarlı; unpause'ta geçerli cursor/harf ve normal klavye akışı geri gelir. Sesli okuma testi ayrıca yapılmalı.

## Korunanlar ve doğrulama sınırı

0.12.0 seçili hücre sınıfları aynı `preview` koordinatlarından üretiliyor; pointer hit testi hücre CSS dönüşümünden hesaplanmıyor, Board kare rect'i üzerinden kalıyor. Bu kaynak özelliği gerçek piksel hizalama ölçümü değildir. `clear` pending RAF iptalini zaten kapsıyor. Yeni seçimi/ödülü değiştiren başka somut engel bu dar incelemede saptanmadı; her kaynağın kusursuz olduğu sonucu çıkarılmaz.

İki kısa bellek VM deneyi dışında tam test, type/build, Worker HTTP, canlı DB, gerçek hesap düellosu veya browser/telefon çalıştırılmadı. Önizleme engeli aşılmadı; DOM/React concurrency/StrictMode, büyük sistem yazısı, ekran okuyucu, FPS ve cihaz dokunması doğrulanmış sayılmaz. Yükleme, hesap, kayıt kuyruğu, eski içerik/tahta/kimlik ve göç dosyaları değiştirilmedi. Rol MEMORY'ye tekil bulgu tekrarlanan örüntü gibi eklenmedi. Son diff incelemesi gerekirse aynı görevin devamı olarak yapılabilir.

## Uygulama sonrası son dar diff incelemesi

Kabul kaydı `2026-10-26_maintenance-decision.md` ve son `Board.tsx` diff'i ile `tests/board-interactions.test.ts` okundu. **Bu dar kapsamda kalan yeni somut yayın engeli bulunmadı.** Nihai tam test/tip/içerik/build/Worker HTTP/CI ve aynı kaynakla yayın kapıları koordinatöre aittir; bu inceleme o kontrollerin yerine geçmez.

- `Board.tsx:14–23`: yeni `clearRef` her render'da güncel clear/onPreview yoluna bağlanır. Tek mount effect'i window blur'da ve yalnız `document.hidden` true olan visibilitychange'te ortak clear'i çağırır; aynı handler referanslarını unmount'ta kaldırır. Görünürlük geri gelmesi yeni seçim/commit üretmez. Mevcut clear, drag/pending preview frame/anchor/preview temizliğini yapar; kabul edilmiş `strokes` prop'una dokunmaz. Mevcut ayrı RAF cleanup'ı korunur.
- Input hit rect, grid ölçüsü, snapLine yön kuralları, iki-uç/zoom/keyboard fonksiyonları, puan/süre/kayıt ve 0.12.0 görsel kimliği değişmemiştir. Dolayısıyla öneri dar yarım-girdi iptalini uygular; çevrimiçi saatleri durdurma gibi yeni bir oyun kuralı eklemez.
- `Board.tsx:44`: paused erişilebilir ad artık açık duraklama/devam metnidir; satır/sütun/gerçek harfi içermez. Aktif klavye cursor açıklaması aynı kalır. Paused görünür nokta yüzeyi ve tabindex davranışı değiştirilmez.
- Yeni gerçek Board/snapLine VM kabulleri okunarak değerlendirildi: iki global iptal, pending RAF ve stale up; zoom iki-tap anchor; klavye anchor; görünür olayı koruma; güncel callback/unmount; sekiz yön; mouse/touch iki uç; zoom pan; Escape; native cancel/lost capture/element blur/resize/zoom/signature; paused ARIA/input. Fixture normal accepted stroke'u korumayı da kontrol eder. Salt koda benzeyen bir string araması yerine gerçek TSX handler/state/effect zinciri çalıştırılır.
- Koordinatör 12 dar kabulün geçtiğini ve aynı kabullerin 0.12.0 gerçek Board baseline'ında **6 başarısız / 6 başarılı** çıktığını bildirdi; bu son incelemede testler yeniden çalıştırılmadı. Tam paket kontrolleri de bu rol tarafından sahiplenilmez. Yeni iki günlük içeriğin Türkçe/tahta/kimlik/yayın doğrulaması koordinatörün ayrı kapsamıdır.

Sınır: hook/JSX/event kabuğu DOM, React concurrency/StrictMode, tarayıcının native focus/pointercancel sırası, gerçek telefon, büyük sistem yazısı, ekran okuyucu anonsu veya FPS kanıtı değildir. Bu alanlar hâlâ açık doğrulama önceliğidir. Yalnız bu günlük güncellendi; uygulama, test, diğer belgeler veya yayın durumuna yazılmadı.
