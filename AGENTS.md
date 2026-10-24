# Kelime Teneffüsü çalışma sözleşmesi

Kullanıcının 24 Ekim 2026'da verdiği ajan şablonu bu oyun için `studio-agents/` altında uyarlanmıştır. Bu kurallar yalnız bu depoya aittir. Mevcut kullanıcı yetkisi rutin geliştirme, GitHub birleştirme ve aynı Site adresine yayını kapsar; yeniden sohbet onayı istemeyin.

1. En güncel Sites kaynağını açın. README, `docs/studio-release.md`, `docs/discovery-map.md`, geliştirme defterinin son kaydı ve `studio-agents/orchestrator/PRIORITIES.md` ile son ortak günlük kayıtlarını okuyun.
2. `studio-agents/AGENT_REGISTRY.md` üzerinden işi yönlendirin. Bağımsız ve anlamlı incelemeler varsa en fazla iki uzmanı sınırlı kapsamda paralel çalıştırın. Basit işler için tek koordinatör yeterlidir; sırf rol sayısı artsın diye ajan açmayın. Delege araçları yoksa aynı kontrolleri sırayla yapın ve bunu kaydedin.
3. Uzmanlar uygulama kodunu değiştirmez veya yayın yapmaz. Yalnız kendilerine ayrılan, çakışmayan günlük dosyasına kaynak/satır, etki, öneri, kabul ölçütü ve doğrulama sınırı yazar. Ortak karar ve kod değişikliği koordinatördedir.
4. Birkaç adaydan etki/kanıt/maliyet/risk ile tek odak seçin; kabul ölçütünü uygulamadan önce yazın. Tarihli iki bölüm zaten varsa yeniden üretmeyin. Önceki günlük veya geliştirme kaydında tamamlanmamış işi tamamlanmış saymayın.
5. Oyuncu kayıtlarını, eski bölüm kimliklerini/kelimelerini/tohumlarını/tahtalarını, sabit beşli harita kümelerini, kazanılmış ödülleri ve uygulanmış göçleri koruyun. Yeni ücret, hesap, entegrasyon veya bağımlılığı sırf bu ajan düzeni için eklemeyin. Diğer projelere dokunmayın.
6. Gerçek oyuncu sinyali yoksa ürün etkisini varsayım olarak yazın. Uyku kaybı, cezalandırıcı devamlılık, uydurma rakip/ödül/skor ve satın alınan rekabet avantajı hedeflemeyin.
7. İlgili testler, içerik denetimi, tip kontrolü, üretim derlemesi ve Worker HTTP kontrolleri geçmeden yayınlamayın. Kaynak değişince etkilenen kontrolü yenileyin. Testsiz görsel/cihaz/FPS garantisi vermeyin; destekli önizleme engelini alternatif yollarla aşmayın.
8. Koordinatör tam Sites/GitHub ağaç eşleşmesini ve gerekli CI başarısını doğrular, sürümü aynı herkese açık adrese yayımlar. Sonucu gerçek yayın cevabıyla doğrular; gizli anahtar, oturum veya oyuncu verisini günlüğe yazmaz.
9. Ortak günlüğe gerçek bulgular ve doğrulama; role ait MEMORY dosyasına yalnız tekrarlanan kanıtlı örüntüler yazın. Haftalık incelemeyi ilk uygun mevcut görev çalışmasında yapın; ayrı zamanlayıcı veya arka plan servisi oluşturmayın.

Bu dosyalar çalışma rehberidir. Sürekli çalışan bir sunucu, yeni model aboneliği veya bağımsız zamanlama kurmaz. Mevcut bağlı bakım görevinin yetki ve sıklığı geçerlidir.
