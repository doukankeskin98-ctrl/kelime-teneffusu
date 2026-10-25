# Bakım son güvenilirlik incelemesi · 25 Ekim 2026

Kabul kaynağı: `2026-10-25_maintenance-decision.md`; başlangıç güncel 0.11.0 Sites kaynağıdır. İncelenen dar diff: `PublishedPlay`, gerçek Solo, kayıt kuyruğu, bölüm API'si, iki VM test dosyası ve Worker HTTP sahip kontrolleri. Uygulama/test dosyasına dokunulmadı; test/derleme tekrar çalıştırılmadı.

**Sonuç:** Seçilen kayıt/açılış kabulünü engelleyen yeni somut hata saptanmadı. Bu kaynak incelemesi, koordinatörün devam eden tam test/içerik/tip/derleme/HTTP/CI ve yayın doğrulamasının yerine geçmez.

## Karşılanan davranış

- `PublishedChapters.tsx:78–82`: yalnız `matchingCachedChapter` ile doğrulanan tahta yerel sahip kaydıyla açılıyor, iki GET atlanıyor ve mevcut queue tek başlangıç PUT'unu gönderiyor. Açılış PUT sonucunu beklemiyor; pending/onay durumu korunuyor. Eksik/uyuşmayan cache cold yola kalıyor.
- `PublishedChapters.tsx:68–71,121`: onay aynı queue/generation içinde ayrı `resume` alanını güncelliyor. İlk `save` karşılaştırma tabanı ve Solo key'i değişmiyor. `chapter-save-queue.ts:45–46,60–64` iptal/timeout sonrasında veya UI ayrıldıktan sonra canlı onay callback'i üretmiyor; önceki detached drain ve yeni sahip bağımsızlığı sürüyor.
- `Solo.tsx:34–40`: resume güncel state ile functional merge ediliyor, eşit sonuçta aynı state dönüyor; practice kabul etmiyor. `73` yeni seçimi güncel state'e eklediğinden aynı aralıktaki cloud merge kelimeleri düşürmüyor. Kayıt doğrulaması ve iyi sonuç helper'ı değiştirilmemiş.
- `Solo.tsx:45–53`: süre artışı güncel `s.elapsed`e monoton performans tick farkını ekliyor; yüksek bulut süresi eski başlangıç bazına dönmüyor, duraklatma/yardımda sayaç duruyor. Daily sunucu saat yolu ayrı kalıyor.
- `Solo.tsx:84,96`: kesinleşmemiş cached başlangıçta yeni kişisel rekor iddiası kapalı; yardım/çıkış açıkken sonuç penceresi üstüne binmiyor. Cloud hydration commit'e özgü kelime patlaması üretmiyor. Sonraki replay kendi başlangıç tabanını yalnız queue onayı varsa doğrulanmış sayıyor (`PublishedChapters.tsx:121`).
- `PublishedChapters.tsx:96`, `app/api/chapters/route.ts:16`: kalan cold özel okuma beklenen sahibi gönderiyor ve sunucu gerçek kimlikle karşılaştırmadan save döndürmüyor. Eski GET biçimi ve önceki PUT sahip guard'ı korunmuş. Yeni endpoint, tablo veya bağımlılık yok.

## Regresyon kanıtının kapsamı

- `tests/published-play-sync.test.ts:174–396` gerçek PublishedPlay/queue gövdesini çalıştırıyor: GET'siz hazır tahta, cold timeout/hash reddi, tek uçuş, sahip değişimi, eski yanıt, son snapshot drain, deadline/JSON, depolama/offline, aynı key ile resume, replay tabanı ve unmount sonrası callback yokluğu.
- `tests/solo-resume.test.ts:98–165` gerçek Solo gövdesini çalıştırıyor: yeni yerel/bulut kelimeleri, render öncesi iki sıradaki güncelleme, hydration sonrası süre/duraklatma, yardım/sonuç ayrımı, eski iyi sonuç, practice ve rekor koşulu. Güncel state birleşimi yalnız sahte Solo prop'una bakılarak iddia edilmiyor.
- Koordinatör hedefli **16 + 8 senaryonun geçtiğini** bildirdi; bu incelemede yeniden yürütülmedi. Worker kaynağı `scripts/verify-worker.mjs:61–63` yanlış/boş/correct beklenen sahipte cold okuma kabulünü ekliyor; son üretim paketiyle çalışma sonucu koordinatör tarafından ayrıca doğrulanmalı.
- 25 Ekim yayın çifti yeni tek JSON dosyası ve `RELEASE_BATCHES` ekidir; içerik/kimlik/hash/alternatif tahta kapıları koordinatörün devam eden içerik kontrolündedir. Bu dar kaynak incelemesi tek başına içerik denetimi veya yayın kanıtı sayılmadı.

## Sınırlar

Cached açılış bir ek merge PUT'u yapar; mevcut 40/dk sınırı geçerlidir. Bu, ağsız/ilk indirmesiz her bölümün açılması veya sekme/OS kapanışında garantili bulut teslimi değildir. Arşiv konumu ve İpucu Avı kart yüksekliği bu diff'in kapsamı dışında kalır. VM kabukları gerçek DOM, React eşzamanlı/StrictMode, fiziksel telefon/ağ, ekran okuyucu veya FPS kanıtı değildir. Canlı oyuncu/DB kullanılmadı; destekli önizleme engeli aşılmadı. Kod, son çıkış kapıları ve aynı adrese yayın koordinatördedir.
