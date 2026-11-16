# 16 Kasım 2026 — Arena kapasite koordinasyonu

Odak: veri okuma/yazma çoğalması; mevcut içerik/oyuncu verisine dokunmadan ayrı geçici DB ile yük. İki sınırlı read-only inceleme kullanıldı. Yeni servis/bağımlılık/ücret açılmadı.

Uygulanan: isteğe bağlı koşullu native room GET, revizyonu aynı SSE'de görünüm atlama, heartbeat sonucunu tekrar kullanma, etkin üyelikte gereksiz UPDATE kaldırma, moderasyon sorgularını ve aday engel sorgularını birleştirme, bitmiş turda tekrar makbuz/rating işi yapmama, bağlantı hata backoff/jitter.

Kanıt: docs/release-0.56.0.md, ../world-review.nosync/arena-capacity-0560/. 1.010 yerel tam test + ek 64-aday regresyonu; 749 Worker HTTP; tip/içerik/şema/web/mobil geçti. İki uzman diff'te somut engelleyici gerileme bulmadı. 427 mevcut lint hatası/159 uyarı; artış yok.

Kapasite sonucu: 10.000 sentetik oturum oluşturuldu; en fazla64 HTTP uçuşu ile hedeflenen10k/s yükün büyük bölümü gönderilemedi. Gerçek10k eşzamanlı Arena doğrulanmadı. İlk after koşusundaki2.207 sınıflandırılmamış istisna iki tanı tekrarında oluşmadı; kesin nedeni doğrulanmadı, gizlenmedi. Üretimde yük/FPS/gerçek cihaz kanıtı değildir.

Sonraki zorunlu kapı: hosting kotası ve bütçesi bilinen uzak izole ortam; oda başına push/state, eşleştirme bölümlendirme ve içerik havuzu çekişmesi; yük altında kelime ACK ve sonuç doğruluğu. Oyuncu verisini eski yedekle geri almak yok. 0.55.0 kaynak bundle ve Sites111 geri dönüş referansı saklandı. Yayın makbuzu kontrol sonrası kanıt klasörüne yazılır.
