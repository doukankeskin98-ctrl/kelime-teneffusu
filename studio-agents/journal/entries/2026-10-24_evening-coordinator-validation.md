# Akşam doğrulaması · 0.8.4

Seçim/kabul: `2026-10-24_evening-coordinator-decision.md`. Bağımsız tasarım ve son inceleme: `2026-10-24_evening-reliability-{design,final}.md`. Koordinatör tek kod/yayın sahibi; ikinci geniş tarama tekrarlanmadı.

- **130/130 test, 30 grup.** Önceki üç TSX testi ve dokuz yeni kuyruk/hesap/deadline/cihaz/çevrimdışı senaryo geçti. İlk yeni kabul kümesi eski 0.8.3 bileşeniyle altı gerçek başarısızlık verdi. Geç onay önce kaydedildi sayılmaz; cihazdaki iyi sonuç korunur.
- **32 tahta / 640 alternatif**, TypeScript, son üretim derlemesi ve iki bağımsız oyunculu **180 Worker HTTP kontrolü** geçti. Worker ekleri beklenen hesabın yetki olmadığını ve yanlış kimlik altında yazı yapılamadığını doğrular; eski istemci biçimi sürer.
- Hesap değişiminin ilk karesindeki hazırlık görünümü son küçük koordinatör düzeltmesidir. Son bağımsız diff incelemesinden sonra geldiği için ayrıca TSX kabulü, tip, tam test, yeniden derleme ve son Worker paketiyle doğrulandı.
- Dört eski tarihli yayın, motor, klasik içerik, standart katalog, ilerleme/ödül/harita kuralları, DB/göçler ve Site manifesti başlangıçla aynı; yeni bağımlılık veya harcama yok. Aynı UTC gününün çifti çoğaltılmadı.
- İlk haftalık değerlendirme gerçek kaynak ve defterle yapıldı. Oyuncu metriği veya ürün etkisi uydurulmadı. Ham üretim istek/kimlik/IP/başlık verisi günlüğe yazılmadı.
- Gerçek DOM/React StrictMode, iPhone/Android, ekran okuyucu, fiziksel çevrimdışı PWA ve FPS doğrulanmadı. Önizleme engeli aşılmadı. Oyun içinde geri dönüşte son kaydın drain'i, sekme/OS kapanmasında garantili teslim iddiası değildir.

Sıradaki iş indirilen tahtanın ağdan bağımsız açılışı ve geç bulut birleşimi. Arşiv dönüşü ve gerçek cihaz testi açık kalır. Bu kayıt yerel kanıttır; GitHub CI/tam ağaç eşleşmesi ve aynı URL'ye Sites yayını gerçek araç sonuçlarıyla ayrıca tamamlanır. Yayın başarısı yalnız belge metninden çıkarılmaz.
