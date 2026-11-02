# 0.26.0 · Bütünlüklü dünya yolculuğu

## Seçim ve kabul (uygulamadan önce)
Kullanıcının talebi: tüm ana yolculukta dünyalar, bölüm konuları, giderek azalan kelime yardımı, sonuç ve geçişler; Arena aynı görsel kaliteye ulaşacak. Tek odak bütünlüklü oyuncu akışı. Yalnız bir hikâye veya arka plan değişimi yeterli değil.

- 16 dünyanın ayırt edilebilir sahnesi; dünya seçimi, bölüm, sonuç aynı sahne kimliğini taşımalı.
- Mevcut 96 bölüm kimliği/sırası, bulmaca içeriği, tohumlar, tahtalar, beşli dünya kapıları ve kayıtlar değişmeyecek. Önerilen devam aynı dünyayı tamamlayacak; kazanılmış erişim kısıtlanmayacak.
- Her bölümün gerçek kelimeleriyle ilgili konusu görünür. Kelime yardımı bölüm kimliğine bağlı deterministik profille açık / baş harf / gizli aşamalarına ilerler; bulunan cevap açılır. Bilmece, parçalı hedef ve ekran okuyucu cevapları yanlışlıkla açmamalı.
- Sonuç gerçek ilerleme/parçayı gösterir; kısa, azaltılmış hareketi destekleyen animasyon ve belirgin devam düğmesi. Ödül/rekor uydurulmaz.
- Arena lobi/oyun/sonuç aynı kimlikte, mevcut ortak tahta ve kalıcı tekrar engeli aynı kalır.
- 360px küçük mobil ile 414px Safari alanı hedefli görsel kontrol; otomatik kontroller gerçek cihaz testi diye sunulmaz.
- İçerik denetimi, testler, tip, derleme, Worker HTTP, GitHub CI ve tam kaynak eşitliği geçmeden yayın yok.

## Doğrulama
- 563 test / 120 grup, tip kontrolü ve üretim derlemesi geçti. 165 yazılmış tahta / 3300 varyasyon, 64 ek grup tahtası, 774 Arena tanımı / 919 kelime ve 714 Hızlı Tur kelimesi içerik denetiminden geçti.
- Korunan içerik, discovery, progress, server, grup içeriği ve DB dosyalarında fark yok. Yeni bağımlılık/göç yok; eski global bölüm numaraları aynen test ediliyor.
- Gerçek yerel UI: 414×622'de Uzay 3, 360×568'de Uzay 4, 414×622'de mevcut 12×12 Uzay 5; Anadolu ilk bölüm oynanıp tamamlandı. Baş harf ve tamamen gizli hedeflerde kelime bulununca tahta üst/ölçüsü değişmedi. Yenileme sonrası bulunan ASTEROİT ve kalan gizli hedefler korundu; döndürmeden sonra yerel çizimle bölüm tamamlandı.
- 360×568 İpucu Avı: mevcut 2/4 kayıt ve tüm tahta satırları görünür. Normal Solo 9×9 tahta 310 px, 414 genişlikte 359 px; 6×6 bilmece tahtası 336 px. Küçük sonuçta ödül/yıldız/sonraki bölüm birlikte görünür.
- Arena gerçek yerel özel lobi oluşturma/çıkış; oda değişiminde sayfa başa döner, canlı skor revizyonu kaydırmaz. Aktif normal/bilmeceli tur ve sonuç, gerçek bileşenlerin açıkça etiketli örnek oyunculu görsel örneğiyle 360×568/414×622'de denetlendi. Örnek dosyalar derlemeden önce kaldırıldı. Görsel örnek iki gerçek oyuncu testi değildir.
- Görseller depo dışındaki `../world-review/` içinde: hidden-found-360x568, bosphorus-board-414x622, bosphorus-result-414x622, riddle-360x568, arena-clue-fixture-414x622, arena-result-fixture-360x568. Eski uzun sonuç denemeleri teslim kanıtı değildir.
- Bağımsız uyumluluk/deneyim incelemelerindeki maske erişilebilirliği ve parçalı başarı bildirimi açıkları kapatıldı. Araç menüsü süreli günlük oyunu durdurmaz; normal Solo'da yalnız kendi duraklatmasını geri alır.
- 611 üretim Worker HTTP kontrolü geçti: iki eski oyuncu, sekiz özel grup ve on altı eşzamanlı açık grup oturumu. Kaynak/görsel dosyaları değişmeden paketlenecek; GitHub CI, tam ağaç eşitliği ve yayın sonucu depo dışı `../world-review/release-0.26.0.json` teslim kaydına yazılacak.
- Fiziksel cihaz/Safari, iki gerçek telefon, VoiceOver, FPS veya tutma ölçümü yok. Üretim yayını ancak CI ve kaynak eşitliği kapılarından sonra yapılacak.
