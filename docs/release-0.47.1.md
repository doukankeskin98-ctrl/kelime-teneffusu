# 0.47.1 — arka plan sesinin kaldırılması

Kullanıcı hem sentetik rüzgârı hem hazırlanan piyano örneğini beğenmedi ve ses çalışmasını şimdilik iptal etti. Son kapsam: arka plan sesi oynatıcısını, jest dinleyicilerini ve menü/oyun içi Ambiyans seçeneğini tamamen kaldır. Piyano dosyasını yayımlama. Kısa geri bildirim sesleri ve titreşimler değişmesin. Eski kayıtlardaki ambience alanını geriye uyumluluk için koru; bu alan artık hiçbir oynatıcı başlatmasın.

Yeni müzik, yeni menü, kayıt göçü, bölüm/ödül değişikliği yok. İlgili testler, içerik, tip, üretim/Worker ve native paket kontrolleri son kapsam üzerinden yeniden doğrulanır. Fiziksel telefona kurulum bu sürümde yapılmaz.

Doğrulama: 874 test / 167 süit, içerik denetimi, tip kontrolü, üretim derlemesi ve 712 Worker HTTP kontrolü geçti. Native paket 46 eşleşen dosya; Xcode generic iOS build başarılı. Üretim/native paketlerinde piyano dosyası veya ambiyans oynatıcısı bulunmuyor. Yerel tarayıcıda sade ayarlar doğrulandı.

