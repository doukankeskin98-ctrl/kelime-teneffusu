# ECC becerileri — seçici kurulum ve kullanım

16 Kasım 2026. Kullanıcının açık isteğiyle `affaan-m/ECC` deposunun incelenmiş `d2ef2680594f9a17526a6e1a2e18b3d242c5d17b` kaydından altı beceri, Codex'in `skill-installer` yardımcısıyla `~/.codex/skills/` altına kuruldu. Her klasörde MIT LICENSE ve sabit kaynak adresi SOURCE.md var.

| Beceri | Bu turda kullanım |
| --- | --- |
| click-path-audit | Gerçek Arena bileşeninde eski tur → yeni tur pencere durumunu izleme; deferred ekranın hata → yeniden deneme yolu |
| design-system | Mevcut ayar ana ekranı ve ayrıntı penceresinin 320/375/430 px yerleşimini karşılaştırma; yeni tasarım veya token sistemi dayatılmadı |
| benchmark-optimization-loop | Aynı üretim mobil paketinde boyut ve yerleşim başlangıcı/sonucu; tek uygulama adayı, sıfır ücretli servis. Yeni bir hız darboğazı gösterilmediği için spekülatif optimizasyon yapılmadı |
| browser-qa | Geçici yerel API/sahte ilerleme ile menüler, bilinçli HTTP 503, yerinde toparlama ve dört boyutta ilk bölüm → sonuç → sonraki bölüm |
| motion-foundations / motion-patterns | Yardımcı referans: anında giriş, mevcut hareket azaltma ve süreleri koruma. Genel web geçiş kuralları oyun motoruna aynen uygulanmadı |

ECC eklentisi, oturum kancası, global Git kancası, MCP sunucusu, genel AGENTS/config veya model ayarı kurulmadı/değiştirilmedi. Oyun bağımlılıkları değişmedi. Dosya incelemesi ve seçili beceri kurulumu bütün ECC deposunun güvenlik sertifikası değildir.

Bu yönergeler mevcut proje sözleşmesinin, gerçek oyuncu tercihlerinin veya araç güvenlik sınırlarının yerine geçmez. Yeni ses, ambiyans, kayıt göçü, içerik revizyonu, cihaz kurulumu veya ücretli altyapı bu çalışmanın kapsamında değildir.
