# 0.42.1 · Ayar ve yardım düğmelerinde kontrast

8 Kasım 2026 · iOS 0.42.1 / build 28.

## Değişiklik
Gerçek iPhone kurulumunda görülen açık zemin üzerindeki açık geri/kapat metni düzeltildi. Ortak oyun penceresinin içerik ve alt eylem alanındaki ikincil düğmeler artık açık zemin ve koyu yeşil metni birlikte tanımlar. Oyun, el animasyonu, kayıt formatı, bölüm içeriği ve Arena kuralları değişmedi; bağımlılık eklenmedi.

## Kanıt
827 test, tip/içerik/şema kontrolü geçti. Üretim web paketi, 695 Worker HTTP kontrolü, 39 dosya /21 sahne native paket kontrolü, imzalı Release derlemesi geçti. Gerçek iPhone 14 Pro Max üzerinde ana ayarlar, Diğer ayarlar geri düğmesi ve Nasıl oynanır Kapat düğmesi açılıp okunaklılık/geri dönüş doğrulandı. Son kurulumdaki sekiz yerel kayıt girdisinin tamamı hash olarak eşit; 15 bölüm /36 yıldız korundu.

0.38.2 → 0.42.0 kurulumu, yedi yerel girdinin hash eşitliğiyle doğrulandı. Kullanıcı alıştırmada elin akıcı olduğunu ve çizim başlayınca hemen kaybolduğunu bildirdi. Kullanıcının sonraki oyunundan sonra 0.42.1 için sekiz girdili yeni yedek alındı: 15 tamamlanmış bölüm, 36 yıldız. İlk 0.42.1 kurulum karşılaştırmasında yalnız açık bölümün süresi 42 → 68 saniye ilerledi; diğer bütün değerler aynı. Yedekler ve cihaz ekranları yalnız yerel world-review/0.42.1 içinde, oyuncu verisi depoya girmez.

## Sınır
Bu teslim fiziksel kurulum, kayıt korunması ve hedefli ayar/yardım kontrolüdür. Uzun oturum FPS, VoiceOver ve TestFlight/App Store kabulü sayılmaz. Kullanıcının el rehberi geri bildirimi 0.42.0 davranışına aittir; 0.42.1 animasyon kodunu değiştirmez.
