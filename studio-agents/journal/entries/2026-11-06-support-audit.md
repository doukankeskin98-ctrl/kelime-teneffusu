# 6 Kasım 2026 · Koordinatör · İnceleme ve destek raporu

Başlangıç 0.36.4 Sites `ae43883cc0f9fb45f6ada3707bdbd7fbf444bc43`; GitHub main `89cb9cb46bf5ced18ae36dfd1ef34a41f0768074`. Kullanıcı kapsamı: ayrıntılı proaktif inceleme, Opus değerlendirmesi, Game Center/Apple/üyelik yanıtları ve e-posta beklemeden Sorun bildir hazırlığı. Telefon kurulumu ertelenmiş durumda.

## Uygulama öncesi karar ve kabul

Tam arayüz dönüşümü, ilk giriş rehberi ve hesap entegrasyonu adayları arasında bu turun açık uygulama isteği olan destek raporu seçildi; diğerleri kanıtlı açık listesi olarak sunulur. Kabul: Ayarlardan bulunur; kategori/açıklama ve isteğe bağlı sürüm/platform; parola/kimlik/oturum/ilerleme otomatik toplanmaz; gerçek kanal yokken gönderildi denmez; kopyalama yoksa metin elle alınır; geri dönüş/kapatma çalışır; mevcut kayıt/tahta/ödül değişmez.

## Gerçek değişiklik

0.36.5, iOS build 18. App ayarına Sorun bildir; SupportReport formu ve saf rapor hazırlama işlevi. 1200 karakter sınırı, en az 10 karakterle kopyalama, açık gönderim durumu, erişilebilir alanlar/odak, teknik bilgi tercihi, kopyalama hata yolu ve geç işlem/unmount koruması. Geri dönüş odağı tarayıcıda gövdeye düştüğü görülünce Sorun bildir düğmesine geri verildi. Sunucu veya e-posta gönderimi eklenmedi. Bu genel form sosyal moderasyon veya hesap silme yerine geçmez.

## İnceleme ve doğrulama

İki sınırlı uzman uygulama koduna dokunmadan UI ve kimlik/güvenilirlik günlüklerini yazdı. Koordinatör Arena → Arkadaşlar/Meydan eski görünümünü tarayıcıda gördü; diğer yollar kaynak incelemesi seviyesindedir. Opus'un paylaşım/seri/öğretici yokluğu iddiaları düzeltilerek [ayrıntılı rapor](../../../docs/studio-audit-2026-11-06.md) yazıldı. Apple resmi üyelik/TestFlight/transfer/GameKit/hesap silme/veri belgeleri 6 Kasım'da kontrol edildi.

758 test /152 grup; içerik, tip, şema (değişiklik yok), web/mobile derlemeleri, Capacitor sync/mobile check ve 639 Worker HTTP geçti. Dar 167 test alt kümesi uzman tarafından da geçti. Impeccable değişen UI denetleyicisi `[]` döndürdü; bu erişilebilirlik sertifikası değildir. Son odak değişikliği sonrası tip/derleme/mobile/Worker kontrolleri yenilendi.

Destekli yerel tarayıcı: form boşken kopyalama kapalı; açıklama ile gerçek pano metni eşleşti; teknik bilgi açık/kapalı içerik farkı doğrulandı; başarı “Henüz gönderilmedi” der; ayarlara dönüş ve kapatma kontrol edilir. Gerçek ölçü 302×654; 390×844 istenen override gerçekleşmediği için iPhone emülasyonu iddiası yok. Yerel profil erişim hatası üretime mal edilmedi. Kayıtlar sıfırlanmadı.

Fiziksel cihaz, uzun FPS, Game Center, iki oyunculu canlı test, TestFlight yükleme veya App Store onayı yok. Kullanıcının iPhone'u güncellenmedi. Yeni öğretici ve kapsamlı UI dönüşümü bu sürümde uygulanmış değildir. Yayın sonucu, CI ve tam ağaç eşleşmesi release-0.36.5 makbuzunda ayrıca kaydedilir.
