# Arena kapasite çalışması — kabul ölçütleri

16 Kasım 2026. Başlangıç: 0.55.0. Yalnız izole, geçici yerel veritabanı ve sentetik oyuncularla yük uygulanır. Canlı adrese yük, ücretli servis veya gerçek oyuncu verisi kullanılmaz.

Odak: değişmeyen odanın gereksiz sorgu/yazılarını azaltmak. Kişiye özel oda görünümü ortak önbelleğe alınmaz; kimlik, üyelik, süre sonu, eşleştirme transferi, skor, tur çiti ve kayıt biçimi korunur. Çizim ve kelime animasyonu değişmez.

Kabul:
- Önce/sonra aynı yerel Worker senaryosu; sunulan yük, tamamlanan istek, gecikme, hata ve yük üreticisinin yetiştiremediği istekler ayrı raporlanır.
- 10.000 sentetik oturum oluşturmak, 10.000 aktif oyuncuya kapasite kanıtı sayılmaz. Test üreticisi ve yerel D1 aynı Mac üzerindedir.
- Değişmeyen SSE izleme bir oda okumasıyla; geçerli native koşullu sorgu kimlik ve etkin üyelik okumasıyla yanıtlanır. En geç mevcut beş saniyelik heartbeat'te tam durum ve moderasyon yenilenir.
- İlk görünüm, revizyon değişimi, yeniden bağlanma, iptal/transfer, hazır ve süre sonu tam yetkili durum döndürür. Kelime ACK yolu koşullu yanıttan etkilenmez.
- Eski istemci tam yanıt almaya devam eder. Yeni protokol isteğe bağlıdır.
- Sonuçların ve puanların yalnız bir kez yazılması, ayrılan/silinen oyuncu güvenliği, aynı tur/tahta ve yinelenen istek testleri geçer.
- İlgili testler, içerik, tip, lint borcu, web/mobil derleme ve Worker HTTP kapısı geçer. Gerçek cihaz/FPS ve uzaktaki 10.000 oyuncu kapasitesi bu testlerle doğrulanmış sayılmaz.

Ölçüm, sonuç ve açık 10.000 oyuncu kabul kapısı: [0.56.0 raporu](release-0.56.0.md).
