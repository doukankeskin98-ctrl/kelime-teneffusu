# 0.45.0 — Sabit bilgi alanı ve kolay seçim

## Değişen deneyim

İpucu/yanlış seçim/kayıt birleşmesi mesajları artık bölüm konusunun üzerine yerleşmez. Solo ve günlük oyunda daima ayrılan durum alanı kullanılır; normal tamamlanma konuşma duyurusu görsel raf/onay animasyonunu tekrar etmez. Hikâye açıklaması ve ilk el rehberi kendi akışında korunur. Kısa ekrandaki yoğun tahtalarda mesaj kontrollerin yanına geçer. Yoğun rafların genişliği çizilen 16px harf hücreleriyle eşleşir; font küçülmeden gereksiz satır kaybı giderilir. Tahta içeriği değişmez.

Yan oyunlarda üç ana giriş: Günlük bulmaca, Kısa oyunlar, Hikâyeler. Bonus/Hızlı Tur kendi kurallarını korur. Gizli Tema, İpucu Avı, Serbest oyun ve Ek bölümler açılır alt gruptadır. Alt gruptan dönünce açık kalır; bölüm arşivinin konumu ve oyun dönüş bağlamı korunur.

Oyun içi ayarlarda aynı görünümde büyük Ses/Titreşim anahtarları; görünüm/hareket/kurallar aynı pencerenin ayrıntısında. Ayrıntı açmak oyunun duraklatma sahibini değiştirmez. Ana sayfa çıkışı solo saatini yeniden başlatmaz; günlük ve yarış modlarının sunucu saati sürer. Cihaz desteklemiyorsa titreşim gösterilmez.

Yıldız toplamına dokunulduğunda yıldızın harcanmayan en iyi sonuç toplamı olduğu, albüm/rozet ayrımı açıklanır. Yeni bakiye, ödül veya yazma işlemi yok. İlk on numaralı bölüme kısa başlangıç notları gerçek sırayla bağlanır; devam edilen/bitirilmiş bölümde zorunlu eğitim başlamaz, kazanılmamış dünya/albüm açılışı vaat edilmez.

Hızlı Arena kuyruğunda tek oyuncu 15 saniye bekledikten sonra isteğe bağlı Meydan okumaya geçiş görünür. Sunucu, koşulu üyelik işlemi ve her CAS tekrarında kontrol eder. Aynı anda rakip gelirse ayrılma reddedilir; aktif maç terk edilmez. Başarılı, güncel ayrılma yanıtı olmadan başka ekrana geçilmez. Normal ayrılma, puan, tur, hazır olma ve tekrar engeli kuralları aynı.

## Doğrulama

- 853 test; tip kontrolü; şema üretimi ve migration farkı kontrolü geçti. Yeni testler: kuyruk/CAS yarışı, başarılı/başarısız/eski yanıtta navigasyon, menü hedefleri, sabit durum yüzeyi, ilk on gerçek bölüm eşleşmesi.
- İçerik: 273 yazılmış tahta, 5460 alternatif yerleşim; 64 ek grup tahtası; 774 Arena tanımı / 963 kelime, 96 yeni yarış tahtası ve 697 hızlı tur kelimesi denetimi geçti. Bunlar yeni yazılmış bölüm sayısı değildir.
- Üretim web derlemesi ve Safari 12 sözdizimi denetimi; mobil paket 0.45.0 (32), Capacitor senkronu, 39 native dosyanın eşitliği geçti. Yeni SDK yok.
- 703 üretim Worker HTTP kontrolü izole yerel Worker’da geçti; iki eski oyuncu, sekiz özel ve on altı eşzamanlı açık grup oturumu. Canlı oyunculara test yazılmadı.
- Destekli tarayıcı önizlemesinde gerçek CSS 375×667 ve 414×628: normal/gizli/bilmeceli tahta, ipucu, dişli, detay aç/kapat, ana sayfa, yan kütüphane dönüşü. Yoğun 12×12 tahtada da tüm satırlar ve kontroller görünür. 414×628 normal/yoğun ve 375×667 bilmecede ipucundan önce/sonra tahta/konu kutuları eşit. Küçük ekran optimizasyonunda tahta/kelime/seed değiştirilmedi.
- Yerel tarayıcıda çapraz GÜNEŞ sürüklemesi tek harekette kabul edildi; bulunmuş kelime ve 1/4 ilerleme doğrulandı. 430×837 sentetik Arena bekleme önizlemesinde alternatif geçişin görünürlüğü ve metin kontrastı kontrol edildi; bu, gerçek iki telefon eşleşmesi değildir.
- İki uzman yalnız değişen navigasyon ve sunucu yarışını okudu. Tasarım dedektörü kaynak taramasında bulgu vermedi; parsed-page kontrast sertifikası veya tam erişilebilirlik testi değildir.

Görsel kanıtlar çalışma alanında `world-review/0.45.0/` içinde; GitHub/Sites kaynak eşitliği ve yayın kimliği ayrı teslim makbuzunda tutulur.

## Sınırlar ve sonraki gerçek kabul

Bu sürüm telefona kurulmadı; fiziksel haptik/VoiceOver, 15 dakika oyun, iki gerçek telefonda yarış ve 5–8 yeni oyuncu gözlemi yapılmadı. Önceki 0.44.1 (31) fiziksel kurulumunda sekiz kayıt değeri aynıydı ve kullanıcı ayar/kelime onayını sorunsuz buldu; bu kabul yeni sürümün fiziksel testi değildir.

Mevcut bölüm kimlikleri, içerik/tohumlar, eski kayıtlar ve ödül hesabı korundu. Reklam/mağaza/Game Center/yeni ölçüm sistemi eklenmedi. Mağaza metni, gerçek ekran çekim listesi, deney ve oyuncu kabul planı `store-and-player-validation.md` içinde hazır; App Store yayını veya oyuncu araştırması tamamlandı sayılmaz.
