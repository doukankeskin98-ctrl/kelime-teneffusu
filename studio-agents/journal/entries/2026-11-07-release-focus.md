# 7 Kasım · 0.41.0 kabul sözleşmesi

Başlangıç: Sites88 / 0.40.0 / c2b726f. Güncel kaynak resmî Sites aracıyla açıldı. Kullanıcı kapsamı: sade, okunaklı, ardışık oyun; kayıt ve kararlılık korunacak, gereksiz kredi harcanmayacak.

## Tek odak
Ana oyun döngüsünün önündeki gereksiz arayüz adımlarını kaldırmak. Yeni özellik, SDK, içerik paketi veya ajan eklenmeyecek. İki sınırlı inceleme tamamlandı. Ses sıfırdan açma şüphesi çağrı takibinde çürütüldü: useGameSound zaten düzeyi geri yüklüyor; ses motoru değişmeyecek.

## Kabul
- Ana ekranda tam ve okunaklı ürün adı; küçük telefonda üst düğmelerle çakışmama. Yinelenen açıklama/menü yolları sadeleşecek.
- Oyna ve sonuçtaki Sonraki bölüm gerçek tahtaya tek dokunuşta gider. Dünya değişimi ikinci bir Oyna onayı istemez. Bonus isteğe bağlı ayrı eylemdir; kayıtları ve erişimi korunur.
- Ana ayarlar, yardım ve oyun ayarları aynı sahne dilini kullanır. Sık kullanılan ayarlar önce; erişilebilirlik/renk/mahremiyet seçenekleri erişilebilir gruplarda. Destek ve hesap silme korumaları kaybolmaz.
- iOS paket kontrolü web çıktısının native kopyası ve sürüm numarası uyuşmazsa başarısız olur.
- Normal/son dünya bölümü, bonus bağlantısı, hesap değişiminden kalan callback ve kayıt uyumluluğu hedefli test; 320 ve 414px gerçek tarayıcı önizlemesi. Zorunlu proje/CI/Worker kontrolleri sonrası aynı siteye yayın.

Haftalık değerlendirme bu görevle sınırlı: yeni özellik sayısı yerine tek akış, somut kusur, gerekli kontrol. Fiziksel iPhone, dağıtım hesabı/imzası, gerçek destek kanalı ve iki cihaz kabulü ayrıca açık; TestFlight gönderilmiş sayılmayacak.

## Son doğrulama
823 test, 695 üretim Worker HTTP, tip/içerik/şema/webbuild/native sync+check geçti. 414×736 ve321×570 gerçek DOM önizlemesi; ODAK tek sürüklemede kabul, sonuçtan yeni dünya tahtasına tek dokunuş. Eski CSS kontrastı ve bonus ikincil eylem satır kırılması gözle bulunup düzeltildi. Ses motoruna gereksiz değişiklik yapılmadı. GitHub CI ve Sites yayını ayrı terminal sonuçlarıyla teslim makbuzuna yazılacak.
