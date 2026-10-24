# Mobil arayüz son kaynak incelemesi · 25 Ekim 2026

İncelenen değişiklik: `common.tsx`, `Board.tsx`, `lib/game/viewport.ts`, `app/mobile-game.css`; ortak Arena ve admin tüketicileri kaynak üzerinden kontrol edildi. Uygulama/test kaynağı değiştirilmedi.

## Tek somut düzeltme

`common.tsx` mobil fit hesabı kalan alandan sabit 16 px çıkarıyor; `mobile-game.css` ise `.game-app` için `padding-bottom:max(12px,env(safe-area-inset-bottom))` uyguluyor. `screen.getBoundingClientRect()` ebeveyn padding'ini içermez. Home indicator alt güvenli alanı 34 px olan standalone iPhone'da hesap 18 px eksik boşluk bırakabilir: sayfa taşması oluşur ve alt kontrol güvenli alanın içine girer. Kalan alandan gerçek oyun/arena sarmalayıcısının hesaplanmış alt padding'inin en az 16 px olan değerini çıkarmak gerekir. Kaynak düzeltmesi koordinatöre iletildi; doğrulanmış fiziksel cihaz hatası olarak sunulmaz.

## Korunan davranışlar

- Fit minimum hücre okunabilirliğini koruyup kısa ekranda doğal taşmaya izin verir. Normal moddan ayrı zoom/pinch yolu fitting değişkenini kaldırır; 46 px zoom hücresi ve iki uç seçimi kalır.
- Kelime listesi max-height/overflow kısıtı kaldırılmış, gruplar/parçalar gizlenmemiş. Bulunma ve golden durumları orijinal onaylı strokes üzerinden hesaplanmaya devam eder.
- Board boyut değişimini ResizeObserver ile seçim iptaline bağlar. Yeni tahta çizgi animasyonu koordinatları taşımaz. Pointer, klavye, pause ve server claim yolları değişmemiş.
- Ortak PlayLayout içeriği, footer, bağlantı/hata ve Arena zaman/puan verileri korunur. API, kimlik, kayıt şeması, tahta/tohumlar ve ödül kuralları değişmemiş.
- Reduced-motion için yeni animasyonlar devre dışıdır. Sabit hücre minimumu gerçek 200% metin erişilebilirliği testi yerine geçmez.

## Sınır

Destekli tarayıcı QA `ERR_CONNECTION_REFUSED` nedeniyle yapılamadı. İnceleme DOM yerleşimi, fiziksel dokunma, ekran okuyucu veya FPS doğrulaması değildir. Tip/test/içerik/derleme/Worker/CI ve yayın kontrollerinin sonucu koordinatör tarafından kaydedilir. Güvenli alan düzeltmesi ve uygun kontroller tamamlanmadan tüm mobil fit kabul ölçütleri geçti denmemeli.
