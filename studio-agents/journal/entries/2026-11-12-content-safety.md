# 12 Kasım 2026 · İçerik güvenliği ve başlangıç akışı

Kabul: yeni hedef tahtalarında engelli diziler/istenmeyen hedef kopyaları bulunmaması; ilk iki bölümde ters/çapraz yok, üçüncüde çapraz var; kayıt kimliği/koordinatı/yıldızı kaybolmaması; çevrimdışı Arena'nın eşleşme başlatmaması ve hesaplar arasında kayıt sızmaması.

Tek koordinatör ve bir sınırlı, salt okunur uyumluluk inceleyicisi kullanıldı. `board-quality.ts`, `journey-presentation.ts` ve üretilmiş `safe-layouts.ts` sunumu eski kanonik kayıttan ayırıyor. Eski `journeyBoard`/`cleanSave` davranışı korunuyor. Tespit edilen 19 alternatif çizim yalnız yeni kanonik konuma indirgenip silinmiyor; sunum eşlemesiyle korunuyor.

İnceleme bulguları: Solo alıştırma ipucu eski yerleşimi gösteriyordu; üçüncü bölüm yönleri çapraza izin verse de çaprazı garanti etmiyordu; çevrimdışı A → çevrimiçi B profilinde Mystery açık kalabiliyordu. Üçü düzeltildi ve gerçek bileşen/üretici regresyonları eklendi. Dosya/rule lint bütçesi borç artışına karşı CI kapısıdır, lint borcunun temizlendiği anlamına gelmez.

897 test / 169 grup, 722 Worker HTTP, içerik, tip, şema, web ve mobil paket kontrolleri geçti. Yerel 414×628 ve 320×567 önizlemede sürükleme/sonuç/devam/kayıt yenileme kontrol edildi. Fiziksel iPhone, canlı iki oyuncu ve ilk kullanıcı araştırması yapılmadı. Yayın kimliği ve GitHub/Sites ağaç eşitliği teslim makbuzuna yazılır; anahtar veya oyuncu verisi kaydedilmez.

Sonraki iş: fiziksel cihaz/yeni oyuncu kabulü ve gerçek yayıncı/destek/TestFlight hazırlığı. Yeni menü veya ses eklemek değil. Ayrıntı: `docs/release-0.48.0.md`.
