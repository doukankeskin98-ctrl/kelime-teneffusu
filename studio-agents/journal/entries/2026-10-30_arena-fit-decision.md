# 30 Ekim 2026 · 0.15.0 · Ekrana sığan ortak Arena

Başlangıç: Sites32/0.14.0, kaynak f6d6de3e4f2a53a62047cc35c0ab38252466239d. Kullanıcının doğrudan üç maddelik isteği. Koordinatör tek uygulama/yayın sahibi; iki dar gerçek uzman deneyim ve güvenilirlik incelemesi yapıyor. Günlük içerik üretimi bu doğrudan görevin kapsamı dışında, eski bulmacalar korunur.

## Seçim ve kanıt

1. Ortak PlayLayout yalnız tahtayı küçültüyor; caller kartları, yinelenen liste/44px liste açıcı ve sabit110px pay gerçek yüksekliğe sığmayı garanti etmiyor. Ekran yüksekliğini temel alan tek oyun kabuğu ve tek hedef alanı seçildi.
2. Server join/ready/settle/opponent/rematch iki oyunculu. Özel grup Arena, açık ev sahibi başlatması, herkese aynı revision/round/saat, tüm oyuncuların sıralaması seçildi. Dereceli iki kişilik Elo korunacak.
3. Rövanş yalnız seed değiştiriyor, kelime kümesi aynı. Hesaba bağlı kalıcı içerik imzaları, ortak geçmişin birleşimi, denetlenmiş Türkçe havuzdan yeni altılılar, idempotent round geçişi seçildi. Yeni servis/bağımlılık/ücret yok.

## Uygulama öncesi kabul

- Normal telefon görünümünde 320×568,360×640,390×844,430×932; yatay, tablet ve masaüstü için yüksekliğe göre ortak düzen. Tam hedef listesi tek kopya, temel eylemler44px, çentik/alt alan ve visualViewport değişimi; harf/metin kırpma yok. Olağan dışı büyütme ve aşırı kısa görünümde erişilebilir geri dönüş kaydı.
- Özel odada en az4 ve4'ten fazla bağımsız kimlik; liste/puan/süre/sonuç aynı sunucu kaynağından, üye sayısı4'e sabitlenmez. Byte bütçesi gibi gerçek altyapı sınırında açık hata. Dereceli hızlı eşleşme2kişilik kalır; ölçülmemiş üretim kapasitesi iddia edilmez.
- Hazır ol ve ev sahibi başlat ayrı, başlangıç üyeleri sabit; aktif maçta geç katılım yok. Ayrılma/bağlantı kaybı, oda ev sahibi değişimi ve yeniden bağlanma tanımlı.
- Sonuçta Yeni oyun oyna aynı odada yeni lobiye geçirir. round ile sunucu tekilleştirme; aynı istek/reload/geç claim/ready/leave sonraki maçı değiştirmez. Eski API biçimi yalnız eski düello uyumluluğunda korunur.
- Her oyuncunun içerik geçmişi D1'de kalıcı; kelime kümesi ve gerçek grid imzası kimlik/sıra/seed'den bağımsızdır. Tüm katılımcıların birleşik geçmişine bakılır; başlangıç ve geçmiş yazımı tek CAS transaction'da. Sonlu ön havuz bitince özgün altılılar üret ve mevcut motorla çözülebilirlik/iki çapraz eğimi doğrula. Üretilemezse açık hata, eski içerik yeniden açılmaz. Eski standard Arena'nın7hedefinden farklı6hedefli içerik alanı geçmişte kaydedilmemiş eski turlarla birebir tekrarı önler.
- Hedefli SQLite/hook/HTTP testleri4 ve8oyuncu, hızlı çift tıklama, eşzamanlı katılma/başlatma/next/claim, reload/yeni service instance ve aynı kimlikte yeniden oturum, pool tükenmesi. Eski testleri koru; tip/content/build/Worker/CI ve tam ağaç eşleşmesi sonrası aynı adrese yayın.

## İnceleme sınırı ve referans

Önceki skill-polish/skill-experience kayıtlarındaki game-ui-ux (layout-and-flow) ve game-feel (feedback-recipes) kararları okundu; bu oturumun tam kurulu skill kataloğunda ve erişilebilir skill dizinlerinde paketler bulunamadı. Uygulama mevcut proje RUNBOOK'ları ve kayıtlı tasarım ilkeleriyle sürdürüldü; yeniden kurulmuş/çalıştırılmış skill iddiası yok. Sites ve cloud runtime yönergeleri uygulanır. MDN VisualViewport (https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) ve Cloudflare D1 batch (https://developers.cloudflare.com/d1/worker-api/d1-database/)30Ekim kontrol edildi. Gerçek browser/telefon testi yalnız destekli yol erişirse yapılır; alternatif ağ/driver yok. Test edilmemiş konfor, kapasite veya App Store hazırlığı iddia edilmez.
