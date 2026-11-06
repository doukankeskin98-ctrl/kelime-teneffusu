# 0.39.0 · Kelimeden kutlamaya tek akış

6 Kasım 2026. Kullanıcının fiziksel WoW incelemesinden sonra istediği sunum iyileştirmeleri; telefon bağlantısı ve kurulumu bu teslimde atlandı.

- Solo, günlük, Gizli Tema, Arena ve Meydan ortak sonuç sunumunu kullanır. Son harf/raf inişi tamamlandıktan sonra başlık ve araçlar çekilir, tahta yumuşakça kaybolur, mevcut sahnenin üzerinde sonuç açılır. 720 ms uçuş ve180 ms iniş korunur; çekilme220 ms.
- Arena/Meydan yerel uçuş başlangıcını hatırlar. Resmî sonuç sunucudan gelmeden açılmaz; geç gelen onay uçuş süresini yeniden başlatmaz. Arka plan, pagehide, azaltılmış hareket, atlama, ret ve yeni tur eski sunumu temizler.
- Seçilen kelime raf/tahta sınırında dokunmayı engellemeyen bir baloncukta görünür. Konu başlığı sabit kalır; tahta boyutu ve vuruş geometrisi değişmez.
- Rekabette yinelenen sayım/açıklama satırı kaldırıldı. Puan, süre, rakip ve bağlantı problemi görünür kalır.
- Oyun içi ayarlar ortak kısa panel; tercihlerden sonra tek belirgin dönüş. Solo duraklatır, süreli oyun saati çalışır.
- Sonuçtaki büyük opak kart kaldırıldı. Gerçek albüm parçası/ilerlemesi, yıldızlar, bölüm numarası ve sıradaki konu tek akışta; tekrar ve tahta inceleme ikincil.

Kayıt şeması, ilerleme birleştirme, yıldız/ödül kuralları, bölüm kimlikleri, kelimeler, kilitler, Arena ortak tahta ve tekrar engeli değişmedi. Yeni ücretli ürün, reklam SDK'sı veya hesap akışı yok.

Doğrulama:797 otomatik test; tip kontrolü;273 yazılmış tahta/5460 alternatif,64 grup tahtası,774 Arena tanımı/96 yarış tahtası ve697 hızlı oyun kelimesi içerik denetimi;695 üretim WorkerHTTP kontrolü geçti. Web üretim paketi/42 çevrimdışı varlık/21 Safari12 sözdizimi parçası; iOS web paketi/senkronizasyon/21 sahne ve iOS simülatör kenar testi geçti. İki sınırlı bağımsız deneyim/güvenilirlik incelemesi yapıldı; bulunan sunucu öncesi arka plan temizliği düzeltildi.

Tarayıcıda dar321×570 ve414×736 CSS boyutlarında normal tahta, gerçek yatay/dikey/çapraz seçim, sonuç, inceleme dönüşü ve ortak ayar paneli kontrol edildi.414×736, iPhone8Plus ekran ölçüsünü temsil eder; iPhone Safari veya fiziksel dokunma/FPS testi değildir. Görseller çalışma alanı world-review/0.39.0 altında tutulur. Gerçek cihazda haptik his ve uzun oturum akıcılığı henüz bu sürümde doğrulanmadı.

Güçlük ritmi ve yeni bonus ekonomisi bu sürümde içerik yeniden sıralamasıyla değiştirilmedi. Mevcut ana yol, seyrek gizli kelimeler ve açılan bonuslar korunur. Mağaza/ödüllü reklam/Game Center entegrasyonu için bu sürüm tek başına yayın uygunluğu iddiası taşımaz.
