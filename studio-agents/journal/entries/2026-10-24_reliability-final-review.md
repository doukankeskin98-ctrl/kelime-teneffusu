# Son güvenilirlik incelemesi · 24 Ekim 2026

Kapsam: koordinatörün kabul ölçütüne göre `PublishedChapters.tsx`, `app/releases.css`, kalıcı regresyon ve ilgili sürüm notlarının salt okunur diff incelemesi. Uygulama/test kaynağı değiştirilmedi.

**Sonuç:** Seçilen dar düzeltmede yeni yayın engeli saptanmadı. Bu sonuç zorunlu yayın kontrollerinin veya koordinatörün yayın kararının yerine geçmez.

## Çözülmüş davranış

- `components/game/PublishedChapters.tsx:47`: tahta isteği reddedilip/zaman aşımına uğrayıp doğrulanmış cihaza dönüldüğünde `dirty.current=true` atanıyor. Değişmeyen tamamlanma yeni hamle/süre gerektirmeden mevcut gönderim yoluna giriyor.
- Atama mevcut `active` ve `generation` koşulunun içinde. Aynı sahibin `saveKey(userId)` okuması, tahta doğrulaması, en iyi sonuç birleştirmesi ve PUT onay koşulları değiştirilmemiş.
- `PublishedChapters.tsx:57`: `storage-error` olumlu onay yerine `TriangleAlert` ve `failed` sınıfı, `syncing` ise `LoaderCircle` gösteriyor. Açıklama metni korunmuş. `app/releases.css:81–82` hata için ayrı biçim/sarılma ve küçülmeyen simge ekliyor; genel azaltılmış hareket kuralı mevcut.
- `tests/published-play-sync.test.ts:19–23,152–187` gerçek TSX akışını çalıştırıyor. GET reddi ve iptali sonrası değişmeyen tamamlamanın PUT'u, bekleyen PUT sırasında “Hesabında kayıtlı” denmemesi, onay sonrası durum ve başka sahibin kaydının okunmaması sınanıyor.
- Önceki örnek doğrulamasında mevcut düzeltmeyle **3/3 geçti**; eski bileşen kaynağıyla iki ağ senaryosu `0 !== 1` PUT hatası verdi, sahip ayrımı testi geçti. Kalıcı test bu örnekle aynı; bu tur test/derleme yeniden çalıştırılmadı.

## Açık kalanlar

- İlk inceleme **2 numara açık**: kısmi PUT sürerken tamamlayıp çıkış son gönderimi düşürebilir. Kuyruk/çıkış yolu bu diff'te değişmiyor.
- İlk inceleme **3 numara açık**: sonuçlanmayan eski hesap PUT'u aynı bölümde yeni hesabın gönderim kilidini tutabilir. Gönderim kilidi ve PUT süre sınırı bu diff'te değişmiyor.
- İndirilmiş tahtanın ağ isteğini/sekiz saniyelik iptali beklemesi de çözülmüş sayılmıyor. Geliştirme/sürüm notları bu sınırları açık tutuyor.

## Doğrulama sınırı

VM testi sahte hook/JSX, HTTP, depolama ve zamanlayıcılarla dar bir davranış kontrolüdür; gerçek React/DOM, StrictMode, telefon, fiziksel çevrimdışı geçiş, ekran okuyucu veya FPS testi değildir. Hata biçiminin gerçek ekran görünümü doğrulanmadı. Canlı oyuncu/DB kullanılmadı; önizleme engeli aşılmadı. Son test, içerik, tip, üretim derlemesi, Worker HTTP, GitHub/Sites eşleşmesi ve yayın sonucu koordinatörün çıkış kapıları olarak kalır.
