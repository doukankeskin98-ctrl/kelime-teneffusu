# Kaydırma onarımı · 0.15.2

Başlangıç Site35 / `ccede3d96cee3e536a3e416e1ceb8de872e8bd8b`, GitHub main `ab48fc45a3113204bf6e237744d4d9601a8197f3`. Güncel kaynak açıldı; tek koordinatör, yalnız Board/ölçüm. Odak/kabul koddan önce geliştirme defterine yazıldı.

Gerçek Board TSX ve ölçüm helper'ıyla beş yeni regresyon kontrolü önce başarısız oldu: Pointer/Touch reflow seçimi siliyor, move olayı teslim edilmemiş hızlı bırakma yalnız tap sayılıyor, opsiyonel capture reddi exception üretiyor. Önceki sabit kutu testleri seçimden doğan reflow'u üretmediği için bu kusuru yakalamadı. Gerçek cihaz bildiriminin tüm nedenlerinin bulunduğu iddia edilmez.

Onarım: içerik kaynaklı ölçümde seçimin başlangıç hücresi korunur ve rect güncellenir; gerçek viewport/döndürme ayrı iptal eder. Önizleme metni aynı satır ölçüsünü kullanır. Up güncel rect/son koordinatı kullanır; eksik move ve capture reddi oyunu durdurmaz. Modern pointer ile eski Touch Events yolları, sekiz yön, iki tap, klavye, son satır, büyütülmüş pan, onaylı çizgiler ve engelli durumlar aynı Board üzerinde denetlenir. Gözlemden sonra gelen döndürme için ek kontrol eklendi.

394/394 test (82 grup), 40 hedefli kontrol, TypeScript, 120 tahta/2.400 alternatif, üretim derlemesi, Safari istemci sözdizimi ve 339 Worker HTTP kontrolü geçti. GitHub CI, tam ağaç eşleşmesi ve gerçek yayın makbuzları ayrıca takip edilir. İçerik, deterministik motor, kayıt/ödül, hesap, Arena protokolü ve schema/göç değişmedi. Destekli browser engelinde düzelme kanıtı yok, alternatif yol denenmedi. Fiziksel iPhone/Safari, native event sırası, DOM piksel ve FPS kanıtı değildir.
