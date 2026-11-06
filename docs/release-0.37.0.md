# 0.37.0 uygulama raporu · 6 Kasım 2026

Bu teslim, 6 Kasım stüdyo incelemesindeki uygulanabilir oyun akışı, kimlik ve oyuncu güvenliği işlerini kapsar. Yeniden geniş araştırma yapılmadı; iki mevcut uzman yalnız kendi kapsamlarında inceleme yaptı. Uygulama ve yayın koordinatörde kaldı. App Store kabulü veya WoW ile eşdeğer performans iddiası yoktur.

## Oyuncunun göreceği değişiklikler

- Yeni oyuncu ilk ana tahtada kısa, atlanabilir rehber görür: düz çizim, çapraz çizim, bağımsız seçim. Var olan ilerlemeli oyuncu yeniden öğreticiye zorlanmaz. Yardım menüsündeki “Çizerek dene” gerçek alıştırmayı açar. Alıştırmadan dönüş mevcut yolculuğu korur; yıldız veya bölüm tamamlaması uydurmaz.
- Arkadaşlar, Meydan okuma, Günlük ve Arşiv aynı sahneli menü sistemine taşındı. Dev tanıtım başlıkları yerine işlem odaklı başlıklar; okunaklı metin, kod alanı, kart ve 44 piksel veya daha büyük temel kontroller var. Küçük ekranlarda sütun düzeni değişir. Albümde bölüm adları oyundaki konu başlığıyla aynı kaynaktan gelir.
- Meydan ve Gizli Tema son kelimeyi kaydettikten sonra uçuşun tamamlanmasını bekler; ardından arka plan korunarak kutlama açılır. Azaltılmış hareket, arka plana alma, yeniden açılan tamamlanmış sonuç ve “Sonuca geç” akışları sonucu tekrar üretmez. Bitmiş tahta salt inceleme modundadır.
- Meydan oyun araçları ortak bileşeni kullanır. Yardım gerçek meydan kurallarını anlatır; yanlış günlük yarış/ipucu açıklaması kaldırıldı.
- Arena alt sekmeleri URL ile eşleşir. Yenileme ve geri dönüş aynı bağlamı açar; davet parametreleri korunur. Gerçek hesap sahibi değişince açık oyun kapatılır; eski rehber veya oyun kaydı yeni hesaba yazılmaz.
- Kutlamanın alıştırma açıklamasındaki açık zemin/açık yazı hatası, mobil görsel kontrolde yakalanıp düzeltildi. Arkadaş sayısı rozeti ve kod alanının eski küçük yazı kuralı da düzeltildi.

## Kayıt ve hesap bütünlüğü

Misafir e-posta hesabına bağlanırken yalnız Solo JSON'u taşınmaz: sunucu doğrulanmış misafir sahibini koruyarak hesabı o kimliğe bağlar. Böylece ek bölümler, Arena geçmişi, tekrar kayıtları ve arkadaş ilişkileri aynı kimlikte kalır. Başka bir mevcut hesaba rekabet geçmişi gelişigüzel birleştirilmez. Bağlama sonunda eski misafir oturumları iptal edilir. Aktif ve hâlâ geçerli misafir oturumu 90 günlük süreyi yeniler; süresi bitmiş veya iptal edilmiş token canlandırılmaz.

168 ana bölüm, mevcut bölüm kimlikleri/kelimeleri/tohumları/tahtaları, yıldızlar, ödüller, eski göçler, çizim motoru ve haptics değişmedi. İleriye dönük iki veritabanı göçü eklendi; gerçek oyuncu verisi test amacıyla silinmedi.

## Silme ve sosyal güvenlik

Ayarlardan başlatılan hesap silme açık onay, sahip kontrolü ve bağlı e-posta hesabında yakın zamanda yeniden doğrulama ister. Kişiye ait kayıt/oturumlar silinir; ortak maçlarda diğer oyuncuların sonuçları korunarak silinen oyuncu anonimleştirilir. Silinme işareti, gecikmiş kayıt/puan/oda isteklerinin kişiyi tekrar oluşturmasını veritabanında engeller. Aynı silme makbuzuyla güvenli tekrar mümkündür.

Bağlı sağlayıcının silme yanıtı alınamazsa ekran “tamamlandı” demez. Yerel veri silindi/sağlayıcı kapanışı bekliyor durumu korunur. Yetkili yönetim kuyruğu, sağlayıcı konsolunda kapanışı doğrulayıp işlemi denetlenebilir biçimde tamamlamaya izin verir. Bu işletim yolunun gerçek sağlayıcı kabulü henüz yapılmadı.

Oyuncu satırlarından bildir/engelle, ayarlardan engel kaldırma; yetkili yönetimde rapor inceleme, uygunsuz adı sıfırlama/kısıtlama ve kısıtı kaldırma eklendi. Engellenen iki oyuncunun aynı odada yer alması kodla katılım, hızlı eşleşme ve yeni tur dahil sunucuda denetlenir. Aynı rapor tek açık inceleme kaydı üretir. Sabit kaba ifade filtresi insan incelemesinin yerine geçmez.

## Doğrulama

| Kontrol | Sonuç ve kapsam |
|---|---|
| TypeScript | Geçti |
| Testler | 778 test, 157 grup; kayıt/tahta/dokunma/oturum ve yeni rehber, sonuç, silme, bağlama, engelleme yarışları |
| Gerçek Worker HTTP | 685 kontrol; izole Miniflare/D1, iki eski oyuncu, sekiz özel grup, 16 eşzamanlı açık grup ve ayrı güvenlik test profilleri |
| İçerik | 243 authored bulmaca, 4.860 alternatif düzen; 168 ana bölüm korunur. Alternatif tohumlar yeni özgün bölüm diye sayılmaz |
| Şema | 27 tablo; db:generate ek fark üretmedi; eski göçler değişmedi |
| Web/mobil | Üretim web derlemesi, iOS yerel paket derlemesi, Capacitor sync ve mobile:check geçti. 16 dünya sahnesi ve HTTPS API korunur |
| Safari sözdizimi | 21 istemci parçası uyumluluk kontrolünü geçti; fiziksel Safari testi değildir |
| Mobil görsel | Yerel destekli tarayıcıda ölçülmüş 321×570 ve 414×736 CSS piksel. Rehberde 290×290 tahtanın tamamı görünür; üç gerçek fare sürüklemesi kabul edildi; sonuç ve doğru geri dönüş görüldü. Arkadaşlar/Meydan/Günlük/Arşiv incelendi. 414 genişlikte yatay taşma yok |
| Lint | Başlangıç kaynağında 365 hata vardı; yeni kaynakta da 365. Eklenen hata yok. Mevcut React ref/effect ve test türleme borcu ayrıca duruyor; tam lint başarılı denmiyor. Üretilen paketler artık kaynak lint taramasına girmez |

Testler; silinirken odaya katılan başka oyuncuyu ezmeme, eşzamanlı hesap bağlama/silme, çift moderasyon kararı, silinen sahibin gecikmiş yazısının reddi ve aktif/sona ermiş misafir oturumu ayrımını içerir. Fiziksel his, FPS, gerçek sağlayıcı veya canlı yük testi sonucu değildir.

## Mağaza ve işletim için kalan gerçek kapılar

- Ücretli Apple Developer üyeliği, App Store Connect kaydı, dağıtım arşivi ve TestFlight. iOS paketi 0.37.0 / build 19 olarak hazırlandı; telefona kurulmadı.
- Game Center bağlantısı bu teslimde uygulanmadı. Apple capability/oyuncu doğrulaması, sunucuda kimlik bağlama ve gerçek cihaz kabulü gerekir. Oyun Modu bildirimi Game Center girişi değildir.
- Firebase projesi/ortam değerleriyle iki gerçek hesap ve cihazda giriş, bağlama, yeniden doğrulama, silme ve başarısız sağlayıcı kapanışı kabulü.
- Gerçek yayıncı, takip edilen destek kanalı, herkese açık gizlilik/destek sayfası, saklama/imha takvimi ve hak başvurusu işletimi. Sorun bildir hazırlama/kopyalama hazır; gerçek bir gönderim adresi uydurulmadı. Uygulama içi gizlilik bilgileri eklendi ve Privacy Manifest'e oyuncu bildirimleri için Customer Support kategorisi işlendi; hukuki metin ve App Store beyanı tamamlanmış değildir.
- Moderasyon için gerçek yetkili, yanıt süresi ve düzenli kuyruk takibi. Silinen hesapların yeniden oluşmasını engelleyen sınırlı güvenlik işareti ile anonim maç sonuçlarının saklama kararı ayrıca belgelenmeli.
- Küçük/düşük güçlü gerçek iPhone'da uzun oturum, sağ/sol el çizimleri, ağ/arama/kilit kesintisi, VoiceOver ve iki gerçek Arena oyuncusu. Bu teslimde yeni dokunma sorunu kanıtlanmadan motor yeniden yazılmadı.
- İçerik, görsel, font, ses ve marka hak envanteri; yaş anketi ve son arşiv gizlilik raporu. Reklam ve satın alma mağazaya çıkmak için zorunlu değildir; yeni reklam/analiz SDK'sı eklenmedi.

## İşletim notu

Yönetim → Oyuncu bildirimleri yalnız mevcut yetkili erişimden açılır. Açık rapor incelenir; gerektiğinde ad sıfırlanır, karar denetim kaydına yazılır. İtiraz sonrasında kısıt aynı panelden kaldırılabilir. Sağlayıcı silme kuyruğunda, yalnız ilgili sağlayıcı hesabının gerçekten bulunmadığı konsolda doğrulandıktan sonra kapanış onayı verilir. Hata yanıtı veya zaman aşımı tek başına silme kanıtı değildir. Destek ve saklama sorumluları belirlenmeden bu kod “işletilen mağaza operasyonu” diye sunulmaz.

Bu dosya doğrulanmış kaynak teslimini tanımlar. GitHub CI/birleştirme ve Sites yayın sonucu, koordinatörün sürüm makbuzunda ayrıca kaydedilir; başarısız yayın yerel değişikliği canlı sürüm yapmaz.
