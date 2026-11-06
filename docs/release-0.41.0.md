# 0.41.0 · Daha sade oyun akışı

7 Kasım 2026 · iOS paket sürümü 0.41.0 / build 26.

## Değişen deneyim
- Ana ekrandaki ürün adı iki okunaklı satırda. Yinelenen bölüm etiketi, küçük zorluk eki ve ikinci harita kısayolu kaldırıldı. Tek ana Oyna/Devam et eylemi, mevcut bölüm haritası ve üç ana sekme korunur.
- Sonuçtaki ana düğme sonraki gerçek bölüme gider. Dünya geçişinde ikinci Oyna ekranı yok. Bonus 60 saniyelik isteğe bağlı ayrı eylem; bonus kütüphanesi ve kayıtları korunur. Sözcük Yolu tek yerde, Koleksiyon/Başarımlar içinde.
- Ayarlar, yardım, gizlilik/destek ve oyuncu giriş penceresi ortak koyu sahne tasarımına geçti. Ses/titreşim önce; ses düzeyi, erişilebilirlik, renkler ve kullanım verileri açılır gruplarda. Küçük ekranda içerik kaydırılırken kapatma eylemi görünür. Giriş metni sadeleştirildi.
- Bonusun yeniden açılış açıklaması kısaltıldı; süre oyuncu başlatmadan ilerlemez. Bonus ses düğmesi ortak açma/kapatma işlemini kullanır. Ana ses motorundaki sıfır düzeyden açma zaten çalışıyordu; o motor değiştirilmedi.
- iOS kontrolü 39 paket dosyasını native kopyayla içerik olarak karşılaştırır; eksik/eski/kalıntı uygulama dosyası ve package/Xcode sürüm uyuşmazlığında başarısız olur. Mevcut pakette eski dosya bulunmadı; bu koruyucu bir yayın kontrolüdür.

## Kanıt
- 823 test; tip kontrolü; içerik denetimi; şema farkı olmaması; üretim derlemesi; 695 Worker HTTP kontrolü geçti.
- Native build + Capacitor sync + mobile:check geçti: 0.41.0 (26), 39 eş dosya, 21 paketli dünya sahnesi.
- Gerçek GameApp bileşenleri ve izole sentetik yerel kayıtlarla 414×736 ve 321×570 CSS pikselde önizleme. Başlık/ayarlar/erişilebilirlik/destek/Arena giriş ekranı incelendi. Dar ekranda yatay taşma yok; örnek 11×11 tahtanın tamamı görünür (yaklaşık305px).
- Gözlemevinde bir gece bölümünde ODAK tek gerçek sürüklemeyle kabul edildi; kutlama sonrası ana düğme tek dokunuşla Tarihin izleri tahtasına geçti. Bu tarayıcı girdisi fiziksel parmak veya FPS ölçümü değildir.
- Hesap değişiminden kalan başlatma callback'i, gerçek yeni dünya bölümüne tek dokunuş, bonusun ana kayıtları değiştirmemesi ve native paket hataları hedefli regresyonlarla kontrol edildi.
- Önizleme görüntüleri ve yayın makbuzu çalışma alanındaki world-review/0.41.0 klasöründe. Kullanıcının gerçek kayıtlarına yazılmadı.

## Korunanlar ve sınırlar
168 ana bölümün kimlikleri, kelimeleri, tohumları, eski tahta/kayıt formatları, ödüller ve Arena puan/tekrar engeli değişmedi. Yeni bağımlılık, reklam/ödeme SDK'sı veya yeni özellik paketi eklenmedi.

Bu sürüm TestFlight'a yüklenmedi ve telefona kurulmadı. Dağıtım üyeliği/imzası, gerçek beta geri bildirim adresi ve kamu destek/gizlilik bilgileri tamamlanmadan mağaza hazırlığı bitmiş sayılmaz. Gerçek küçük iPhone'da uzun oturum, VoiceOver, ses/haptics; iki gerçek oyunculu Arena ve hesap sağlayıcısı kabulü açık. Tam kusursuzluk, WoW eşdeğerliği veya ölçülmemiş performans/oyuncu memnuniyeti iddiası yok.

Güncel Apple kaynakları ve somut dış kapılar: [TestFlight incelemesi](../studio-agents/journal/entries/2026-11-07-testflight-readiness.md), [yayın dosyası](app-store-readiness.md).
