# 0.48.0 · Güvenli içerik ve kademeli başlangıç

12 Kasım 2026. Öncelik, içerik denetiminde ortaya çıkan uygunsuz harf dizilerini ve ilk bölümlerdeki zorluk sıçramasını mevcut kayıtları kaybetmeden gidermekti.

## Yapılanlar

- 395 sabit sunum tahtası önceden üretildi ve sürümlendi. Sekiz yönde uygunsuz diziler ve hedeflerin istenmeyen ikinci kopyaları denetleniyor. BİSİKLET, ÇİPURA ve TOKMAK gibi gerçek kelimeler için dar, tam kelimeye bağlı istisnalar var. Bu bir kapsamlı dil/moderasyon garantisi değildir.
- Eski bölüm kimlikleri, kelimeler, asıl tahta üretimi ve kayıt koordinatları değişmedi. Yeni görünümde bulunan kelime eski kayıt biçimine çevriliyor; eski farklı konumdan bulunmuş kelime de yeni görünümde doğru işaretleniyor. Denetimdeki 19 alternatif hedef konumu, ters çizimler, yarım kayıt, ipucu, bulut birleştirme, yıldız ve bonus kimlikleri regresyonla korundu.
- İlk iki bölüm yalnız ileri yatay/dikey; üçüncü bölüm mutlaka bir çapraz içeriyor. İlk altı bölümde ters kelime yok. İlk iki dünyanın açık hedefleri artırıldı; ikinci dünyanın beşinci bölümünde son hedef grubu ilk harf desteğiyle veriliyor. Sonraki dünyalar kolay açılış, kademeli yönler ve daha sakin final izliyor. Kelime sayısı ve bölüm başlıkları değişmedi. Uzun hedefler nedeniyle her tahtanın 8×8 olması vaat edilmiyor; beşinci bölüm 12×12 yerine 10×10.
- Yeni Arena, Meydan, Sprint ve bonus tahtaları aynı güvenlik denetimini kullanıyor. Arena içeriği ekran boyutuna göre değişmiyor. Önceden açılmış oda ve meydan okumaların kayıtlı ortak tahtaları değiştirilmedi. Günlük yarışlarda eski ve yeni istemcileri aynı tarih için ayırmamak üzere yeni üretim 14 Kasım 2026 UTC'den itibaren geçerli; önceki tarihlerin tahtaları sabit.
- İnternet yokken Arena eşleşme düğmeleri kapalı ve tek kişilik oyuna geçiş açık. Profil yükleme hatası bağlantısızlıkla karışmıyor; yeniden deneme var. Bağlantı dönünce otomatik yeni eşleşme başlatılmıyor. Çevrimdışı A hesabından çevrimiçi B hesabına geçişte açık tek kişilik ekranlar kapanıyor; A'nın bilmece kaydı B'ye yazılamıyor.
- CI'a dosya/kural bazında yeni lint hatası artışını engelleyen kontrol eklendi. Eski borç gizlenmedi: 428 hata ve 164 uyarı sürüyor; tam `pnpm lint` temiz değildir. Önceki tabana göre yeni artış sıfır.

## Doğrulama

- 169 test grubunda 897 test geçti; atlanan test yok.
- 722 izole üretim Worker HTTP kontrolü geçti: eski oyuncular, özel gruplar ve eşzamanlı herkese açık gruplar dahil. Bu canlı kullanıcı/üretim yük testi değildir.
- 395 sabit yerleşimin yeniden üretilebilirliği, 297 yazarlı tahta ve 5940 alternatif yerleşim; Arena/Sprint içerik kapıları geçti.
- Tip kontrolü, şema üretimi (göç yok), web üretim derlemesi, Safari sözdizimi kapısı, mobil derleme/Capacitor kopyası ve 0.48.0 (37) paket eşitliği geçti.
- Yerel tarayıcıda gerçek DOM görünümü 414×628 ve 320×567: tüm tahta satırları görünür; yatay taşma yok. Eski 3/4 yarım bölümden MARS sürükleme → kutlama → ikinci bölüm → VENÜS sürükleme → yeniden yükleme ile 1/5 ve ipucu miktarının korunması kontrol edildi. Küçük görünümde ikinci bölüm tahtası 264px, harfler 23,52px; büyük görünümde 324px.
- Bir sınırlı bağımsız incelemede eski koordinatı kullanan alıştırma ipucu, üçüncü bölümün çapraz garantisi ve çevrimdışı hesap değişimindeki bilmece sınırı bulundu; düzeltildi ve hedefli testlerle doğrulandı.

## Sınırlar ve devamı

Bu sürüm fiziksel iPhone'a kurulmadı. Gerçek cihazda uzun oturum, titreşim/çizim hissi, VoiceOver ve yeni oyuncularla zorluk kabulü henüz ölçülmedi. Akıcılık için sabit solo tahtalar önceden üretildi; çizim motoru ve titreşim zamanlaması değiştirilmedi. Bu, ölçülmüş yeni FPS iddiası değildir. Üretim derlemesindeki büyük paket uyarısı ayrıca sürüyor.

Eski aktif rekabet görüntüleri ve kataloğa sonradan eklenmiş bilinmeyen yönetici içerikleri geriye dönük topluca yeniden yazılmadı. Yeni statik içerik için `pnpm content:prepare` ve `pnpm content:check` zorunlu. Yeni bir üretim algoritması günlük yarışlarda ayrı sürüm/tarih geçişi gerektirir.

Yayıncı kimliği, gerçek destek kanalı, Apple Developer/TestFlight ve gerçek oyuncu kabulü dış işler olarak açık. Bu çalışma onları tamamlanmış veya App Store'a hazır ilan etmez. Kullanıcının iptal ettiği ambiyans geri eklenmedi. Yayın ve kaynak eşleşmesi sonucu ayrı teslim makbuzunda tutulur.
