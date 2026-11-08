# 0.43.0 · Kesintisiz bölüm ve yerleşme geri bildirimi

## Kabul (uygulama öncesi)
Kullanıcı dört notun yorumunu onayladı: gereksiz durdurma/devam adımlarını kaldırmak, tahta/kelime öncelikli hiyerarşi, açık Bölüm N + konu, gerçek ödül ve sonraki hedef. Ayrıca uçan harfler yerine oturduğunda kısa titreşim istiyor. Odak bu tek oyun döngüsü; yeni ekonomi, içerik, altyapı veya genel yeniden tasarım yok.
- Ayrı duraklat düğmesi kaldırılır; tek oyunculu oyun menü/arka planda süreyi işletmez, döndüğünde ek dokunuş istemez. Arena/günlük sunucu saati değişmez. Açık yardım/ayar kendiliğinden kapanmaz veya tahtayı etkinleştirmez.
- Ana ekran/tahta/sonuç mevcut global bölüm numarasını ve konusunu tutarlı gösterir; küçük ekran tahta alanı korunur. Eski ID/sıra/kayıtlar değişmez.
- Mevcut albüm parçası ve sonraki gerçek açılış görünür; tekrar oynamada yeni kazanım uydurulmaz. Albüm finali ile süreli bonus metni ayrılır.
- Son harfin gerçek iniş callback'i en fazla bir kısa haptik tetikler. Ayar kapalıysa, iptal/arka plan/unmount/reduced-motion durumunda gecikmiş pulse yok. Sonraki kelime çizimini kesmez; Arena ACK ikinci kez çaldırmaz. Ödül/kayıt animasyondan bağımsız kalır.
- Hedefli yaşam döngüsü/haptik/kayıt testleri, gerekli proje kontrolleri, küçük mobil görseller ve native paket. Fiziksel cihaz yalnız erişilebiliyorsa mevcut yetkiyle yedekli güncellenir; titreşim hissi kullanıcı kabulünden ayrı iddia edilmez.

## İnceleme
Tek uzman JourneyHome/ödül sunumunu salt okunur değerlendirdi; üç bulgu ayrı günlükte. Koordinatör ortak pause/lifecycle/WordFeedback ve yerel iOS haptik yolunu inceler. Yeni bağımlılık yok.

## Sonuç
Kabul maddeleri uygulandı. 189 hedefli /835 toplam test, tip/içerik/şema, web,695 Worker,native paket ve imzalı Release geçti. Son görsel CSS için web/Worker/native yeniden; ödül iddiaları için20 test yeniden geçti. 414×628 ve321×487 gerçek CSS alanında yerel UI; dikey/çapraz çizimler, sonuç ve sonraki bölüm. Kısa sonuçta devam düğmesini gizleyen eski block kuralı gözlenip giderildi. Fiziksel iPhone unavailable: kurulum/his kabulü yapılmadı. Değişmeyen kayıt/tahta/seed/ödül kuralları; QA yalnız localhost. Sınırlar docs/release-0.43.0.md.
