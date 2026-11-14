# 0.52.1 — İlk kelimeden gerçek oyuna

15 Kasım 2026 · iOS yapı44 · taban 0.52.0 / Sites v106 / `6a5c9e17943aaa45e41816b9112636ebea8a7cf8`. Dar ilk oturum iyileştirmesi; genel yeniden tasarım veya yeni içerik paketi değil.

## Oyuncuya fayda

- İlk çizim yardımı mevcut alt araç alanına taşındı. 375×667 tarayıcıda tahta üstü 224→160px; ilk doğru kelimede üst kenarı yer değiştirmiyor. Oyuncunun çizim motoru ve hücre eşlemesi değişmedi.
- Gerçek ilk tahta yalnız düz kelimeler içeriyor. Bu öğrenme hedefi tamamlandığında rehber ve el kendiliğinden çekiliyor; ikinci bir “Tamam” gerekmiyor, Çevir erişilebilir oluyor. Yanlış çizim rehberi tamamlamıyor. Açıkça seçilen alıştırma korunuyor.
- İpucu ve eksik çizim açıklamaları aynı kısa rehber satırında görünür; yeni panel veya fazla metin eklenmedi. Ekran okuyucu için durum mesajı korunuyor, görünür rehberin aynı açıklamayı iki kere anons etmesi önleniyor. VoiceOver kabulü ayrıca gerekir.
- Hesap eşitlemesinden gelen rehberi bitirme tercihi açık ilk bölümde de dikkate alınıyor; aktif tahta yeniden üretilmiyor.
- Sonuç başlığındaki gereksiz odak çerçevesi kaldırıldı. Klavyeyle kullanılan düğmelerin odak çerçevesi ve modal başlık odağı korunuyor.

## Seçim ve kabul ölçütleri

Onboarding, mobile-game-quality ve Impeccable becerileri kullanıldı. Bir uzman yalnız ilk oturum kaynaklarını inceledi; kod ve yayın koordinatörde kaldı. Kabul: ilk kelimeyi yanlış dene→ipucu→doğru çiz→kalanları tamamla→ikinci bölüme geç; küçük ekranda tahta ve araçlar görünür, tahta üstü sabit, gereksiz onay yok, kayıt aynı kanonik tahta üzerinde. Yeni oyuncu memnuniyeti veya tutma oranı ölçülmedi.

## Kontroller

- 984 birim/bileşen testi geçti; yeni beş test gerçek ilk sunum tahtasının rehber bitişini, yanlış deneme/ipucunu, geç eşitlenen iki tercihi ve explicit alıştırmayı kapsar. Eski kanonik rehber testleri korunur.
- 742 üretim Worker HTTP kontrolü geçti; izole yerel kayıtlar ve çoklu Arena oturumları. Canlı oyuncu verisi kullanılmadı.
- Dört tarayıcı boyutu: 320×568, 375×667, 414×622, 430×932. İlk bölüm, doğru kelime, sonuç, ikinci bölüm; ayrıca 320px ipucu ve yakın ıskalama. Sonuç düğmelerinde klavye odağı kontrol edildi.
- Tip/içerik/şema/web/mobil geçti. 428 mevcut lint hatası / 162 uyarı; artış0. Yeni testlerde yakalanan iki any tipi düzeltilip ilgili testler ve tip/lint kontrolü yeniden geçti. Bu bir borç temizleme paketi değildir.
- iOS Debug simülatör paketi ve XCTest derlemesi geçti. Dokunarak ilk oturum kabulü tamamlanamadı: iPhone17 aynı anda başka incelemede kullanılıyordu; diğer açık iPhone16e üzerinde Xcode, testmanagerd soketi bulunamadığı için test runner ile iletişim kuramadı. Testler çalışmadı. Yalnız kendi denemelerimiz durduruldu; bu kontrol geçmiş sayılmadı. Tekrar geniş derleme/deneme yapılmadı. Fiziksel iPhone, FPS, titreşim hissi ve VoiceOver da bu tur doğrulanmış sayılmaz.

Kanıt dizini `../world-review.nosync/release-053/` (çalışma kod adı; paket sürümü0.52.1). `before/after-375-*`, `after-320-*`, `after-first-session.json`, test/derleme/Worker günlükleri. Tarayıcı ölçümü gerçek telefon ergonomi ölçümü değildir.

## Korunanlar ve açık işler

312 yayımlanmış bölümün kimliği, sırası, kelimeleri ve kanonik tahtaları aynı. Kayıt biçimi, yıldız, ödül, ipucu hakkı, Arena ortak tahta ve skor kuralları değişmedi. Yalnız ilk öğrenme başarılı olduğunda mevcut `guideDone` tercihi kaydedilir; `tutorialDone` veya bölüm tamamlanması uydurulmaz. Yeni bağımlılık, analiz SDK'sı, ses veya ambiyans yok. Rev2, kompakt kayıt yazımı ve Game Center bayrakları kapalı kaldı.

0.52.0 raporundaki hesap/destek, mağaza gönderimi, gerçek cihaz/ses/kare zamanı, içerik revizyonu ve soğuk açılış açıkları kapanmış sayılmaz. Telefona kurulum, TestFlight veya mağaza gönderimi yapılmadı.

## Geri dönüş

`baseline-052.bundle` tabanı korur. Aynı Sites v106 / kaynak6a5c9e1'e arayüz geri dönüşü mümkündür; yeni veri göçü yok. Oyuncu kayıtları geri yüklenmez/silinmez; yeni kazanılmış ilerleme korunur. Bu sürümde kaydedilen guideDone, önceki sürümün de tanıdığı tercihtir. Yayın kimliği ve GitHub ağaç eşitliği ayrı makbuzda kaydedilir.

## Gerçek telefonda kısa kabul

Mevcut ilerlemeyi silmeden Yardım→Alıştırma ile el rehberini dene. Yeni oyuncu akışı ayrı temiz test profiliyle denenmeli: ipucu→bir harf eksik çizim→doğru kelime→kalan kelimeler→sonuç→sonraki bölüm. Aynı turda harf uçuşu/titreşim ve tek elle erişimi değerlendir; uygulamayı yeniden açıp ilerlemeyi karşılaştır.
