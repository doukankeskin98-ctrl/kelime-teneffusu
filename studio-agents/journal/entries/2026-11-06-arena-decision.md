# Arena ve özgün katalog — 0.38.0 kabul ölçütü

Tek odak: Arena ve Meydan okumanın oynanabilir çerçevesi, tutarlı lobi ve güncel, özgün bölüm seçimi. Kanıt: rekabet ekranı menünün 100px alt boşluğunu koruyor; Meydan saati açık zemin/açık yazı; lobi eylemleri tam seri tablosundan sonra kalıyor; Meydan yalnız 16 legacy tema sunuyor.

- Rekabet oyunlarında menü boşluğu yok; gerçek 414×736 ve küçük telefon önizlemesinde bütün tahta/araçlar görünür, sayaç okunur.
- Lobi hazır/başlat/ayrıl erişilebilir; seri bilgisi ayrı; sunucu hazır/host ve ortak bulmaca kuralları korunur.
- Meydan bütün aktif authored bölümleri sunar; sunucu kanonik bölümü snapshot olarak kaydeder. Eski kayıtlar eski resolver ile doğrulanır.
- Hababam, yapım/marka odaklı dört diğer rota yeni kimlikli 30 özgün bölümle değiştirilir. Eski tamamlamalar kapı/album kredisi sağlar, eski çizimler yeni tahtaya kopyalanmaz.
- Yeni Arena/günlük/Sprint seçimleri emekli içerik sunmaz; açık maç snapshot ve tekrar geçmişi korunur.
- İlgili regresyonlar, tüm proje kontrolleri, görsel önizleme; gerçek iPhone ve hukuki uygunluk garantisi yok. Telefon kurulumu yapılmayacak.

## Kabul sonucu

Hedefli uygulama tamamlandı. İki uzman son farkı tekrar okudu; boş yeni kaydın eski yarım bölümü kilitlemesi, geç kalan Meydan yanıtı kurtarması ve yeni maçta eski seri penceresi düzeltildi. Tarayıcı ölçüleri/695 HTTP/788 test ve sınırlar: [sürüm raporu](../../../docs/release-0.38.0.md). İleriye dönük nullable DB sütunu dışında eski kayıt değiştirilmez. Yayın/CI makbuzu ayrı tutulur.
