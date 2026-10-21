# Yönetim Atölyesi

`/yonetim` canlı oyun için içerik ve işletim panelidir. `/atolye` tarayıcıdaki yerel taslak aracıdır ve canlı veriyi değiştirmez.

## İlk hesabı bağlama

Sites tarafından doğrulanan ChatGPT kimliği kullanılır. Oyuncu kullanıcı adı, misafir cookie'si, e-posta sağlayıcısındaki hesap veya istemciden gönderilen rol yönetim yetkisi vermez. Her okuma ve yazma isteği D1 içindeki tek sahip kaydına göre ayrıca doğrulanır.

İlk kurulumda 32 rastgele baytlık, hex biçiminde bir kod üretilir. Yalnızca `SHA-256('kelime-admin-setup-v1:' + kod)` özeti `ADMIN_SETUP_HASH` gizli ortam değerine, son geçerlilik zamanı ise Unix milisaniyesi olarak `ADMIN_SETUP_EXPIRES_AT` gizli ortam değerine kaydedilir. Yeni ortam revizyonunu uygulamak için sürüm yayımlanır. Kod kaynakta, GitHub'da, analitikte veya otomasyon metninde saklanmaz.

Sahip, kendisine özel verilen `/yonetim#kurulum=...` bağlantısını açar, ChatGPT hesabıyla giriş yapar, gösterilen hesabı kontrol ederek bağlama düğmesine basar. Fragment sunucuya gönderilmez ve istemcide adresten temizlenir. Yalnızca aynı sekmedeki giriş dönüşü için geçici sessionStorage kullanılır. Yerel saklama kullanılamıyorsa kod, girişten sonra özel bağlantı yeniden açılarak girilebilir. Kurulum kodu 72 saat sonra geçersizleşir; bu süre yalnızca ilk bağlama içindir. Hesap bağlandıktan sonra kod başka bir sahibi bağlayamaz ve mevcut yöneticinin erişimi süreden etkilenmez.

Bu ilk sürüm tek sahip destekler. Diğer yöneticiler ekleme veya sahip hesabını değiştirme arayüzü yoktur. Hesap erişimi kaybolursa Site sahibinin doğrulanmış işletim süreciyle yeni kurulum yapılması gerekir; ziyaretçilere açık bir sıfırlama uç noktası bulunmaz. Sites hizmet erişim anahtarı ziyaretçi kimliği sağlamaz, panel yetkisi yerine kullanılamaz. Başka bir hosta taşınırsa güvenilen kimlik başlıkları için eşdeğer doğrulanmış proxy sınırı kurulmalıdır.

## İçerik akışı

1. Bölüm adı, mevcut tema, 3–10 Türkçe kelime, 6–12 tahta boyutu, yerleşim numarası, zorluk etiketi ve isteğe bağlı oyuncu notu hazırlanır.
2. Önizleme, asıl tahta ve 20 alternatif yerleşimi denetler. Asıl tahtada iki eğimde çapraz kelime bulunması zorunludur. Yazım ve tema uyumu insan kontrolündedir.
3. Tahta önizlemede kaydırılarak veya iki uca dokunularak oynanabilir; çözüm çizgileri açılabilir. Taslak D1'e kaydedilir, halka görünmez. Aynı yeni taslak isteğinin tekrarı yeni bölüm oluşturmaz.
4. Son yayın özeti ve kontrol onayıyla bölüm yayımlanır. Sunucu güncel revizyonu ve kayıtlı içeriğin özetini tekrar doğrular. Yeni keşifler alanında görünür, yeni uygulama paketi yayımlamak gerekmez.
5. Yayımlanan kelimeler ve gerçek tahta JSON'u değişmez. Düzeltme yeni taslak kopyasından ayrı bölüm olarak yapılır. Arşivleme yeni keşifler listesinden kaldırır; bilinen kimlikle tahta ve ilerlemeler erişilebilir kalır. Geri açma aynı tahtayı ve yayın tarihini kullanır.

Revizyon karşılaştırması eşzamanlı sekmelerin birbirini ezmesini önler. Sadece tamamlanan taslak, yayın, arşiv, geri açma, hesap bağlama ve hata inceleme işlemleri atomik işlem günlüğüne yazılır. Son 50 işlem panelde görünür. Silme, oyuncu yasaklama ve ödeme yönetimi bu sürümün kapsamında değildir.

## Oyuncu kayıtları

Ek bölümler ana 120 bölümü ve Keşif Haritası ödüllerini değiştirmez. Ek bölüm kayıtları ayrı, sürümlü D1 ve cihaz kayıtlarında tutulur. Bulunan yollar asıl tahta üzerinden sunucuda doğrulanır; yıldızlar yeniden hesaplanır. Hesaplar birbirinin kayıtlarını okuyamaz. Farklı cihazlardaki kısmi yollar birleştirilir, daha iyi tamamlanmış sonuç korunur. Solo sonuçları Arena puanı veya Elo kazandırmaz.

Ek tahtalar ilk başarılı açılışlarından sonra cihazda saklanır; en son 100 indirilen tahta korunur. İnternet yokken indirilmiş bir tahta açılabilir ve ilerleme cihazda kaydedilir. Bağlı profilde değişiklikler bağlantı sırasında beş saniyede bir, tamamlamada ve dönüşte eşitlenmeye çalışılır. Yeni veya indirilmemiş içerik internet gerektirir. Cihaz saklaması engellenirse kullanıcıya bildirilir. Bu sürüm ek bölüm kayıtlarını misafirden farklı hesaba otomatik taşımaz.

## Gerçek kullanım ve hata verileri

- Genel durum, gerçek oyuncu profillerini, son 24 saatte biten düelloları ve farklı yarışmacıları, İstanbul takvim günündeki günlük bitirişleri ve hesaba kaydedilmiş ek bölüm bitirişlerini gösterir.
- Yedi günlük grafik düello, günlük ve ilk ek bölüm bitiriş kayıtlarına dayanır. Cihazda kalmış solo oyunlar ve tekil ziyaretçi sayısı olarak yorumlanmaz.
- Kullanım verileri yalnızca isteğe bağlı anonim toplu olay sayımlarıdır. Varsayılan ölçüm izni kapalıdır. Son 7 veya 30 gün okunabilir. Olay sayısı tekil oyuncu veya temsilî bir kullanıcı araştırması değildir.
- Oyun sağlığı, beklenmeyen sunucu hatalarını gün/alan/genel kod bazında sayar. Kullanıcı kimliği, metni, istek adresi ve ham hata mesajı saklanmaz. İncelendi işareti mevcut sayımı kapsar; yeni olaylar tekrar görünür.
- Veritabanına ulaşılamayan kesinti, istemci veya fiziksel telefon sorunlarının tamamı bu sayımlara yansımayabilir. Kayıt olmaması kesintisiz çalışma garantisi değildir.

## İşletim ve doğrulama

Yeni `0003` geçişi beş tablo ekler; önceki şemayı veya oyun kayıtlarını dönüştürmez. Panel ve hesap yanıtları `no-store` döner; servis çalışanı `/yonetim` ve API yollarını önbelleğe almaz. İçerik silinmez; arşivleme geri alınabilir. Platform veritabanı yedekleme/geri yükleme yetenekleri bu panelden yönetilmez.

`pnpm test` sahip bağlama yarışlarını, yetki sınırlarını, taslak tekrarı ve sürüm çakışmalarını, yayın değişmezliğini, kayıt sahipliğini ve gerçek sayımları kapsar. `node scripts/verify-worker.mjs` üretim paketini izole Miniflare/D1 üzerinde HTTP ile sınar; test kimlikleri ve kasıtlı veritabanı hatası yalnızca bu geçici ortamda oluşturulur. Gerçek Sites giriş yönlendirmesini veya dokunmatik cihaz davranışını taklit etmez.

Bakım otomasyonu kaynak koduna yeni standart içerik eklemeye devam edebilir. Ziyaretçi kimliğini taklit ederek panel sahibi gibi davranmamalı, sahip bağlama kodunu promptuna kaydetmemelidir. Panelin runtime içeriklerini ve oyuncu kayıtlarını sürüm yükseltmelerinde korumalıdır.
