# 4 Kasım 2026 · Günün Renkleri içerik paketi

## Odak ve kabul (uygulama öncesi)

Kullanıcı yeni bölümlerin eklenmesini, başlık ve hedef kelimelerin tam uyumunu istedi. Seçilen kapsam: mevcut 144 ana bölümün arkasına dört temalı rotada 24 yazılmış bölüm; numaralar 145–168. 300/600 hedeflerine topluca çıkmak yerine bu paket başlık/kelime/Türkçe tanım incelemesinden geçer. Mevcut sahneler ve 3/5/6 açılış düzeni kullanılır; yeni görsel sistem, bağımlılık, tarihli çift veya Arena değişikliği yoktur.

Kabul: her başlık bütün hedeflerini doğrudan kapsar; 24 farklı kelime kümesi, 6–8 satır, 4–5 hedef, dört tanım bölümü, rahat dördüncü duraklar, en fazla dört baş harfli ve bir tamamen gizli hedef. Önceki 144 numara/kimlik ve bütün mevcut yolculuk tahtaları snapshot hashleriyle korunur. Yeni yarım/tam kayıtlar yerel ve sunucu doğrulamasından geçer; 144 bitirmiş oyuncu 145'e devam eder; eski albümler ve kazanımlar yeniden verilmez. Bir bağımsız editoryal inceleme, hedefli uyumluluk testleri, zorunlu içerik/tip/tüm test/web/mobil/Worker kapıları ve destekli küçük ekran önizlemesi yapılır. GitHub CI ve Sites ağaç eşitliğinden sonra aynı adrese yayın. Fiziksel iPhone, FPS ve titreşim hissi bu içerik görevinin doğrulanmış sonucu değildir.

## Sonuç

0.32.0 içerik uygulaması tamamlandı. 168 ana bölüm /28 rota. Dört rotada24 farklı küme,100 farklı hedef,16 kısa tanım. Bağımsız editoryal incelemede üç kapsam uyuşmazlığı düzeltildi: Süt ürünleri → SÜT yerine AYRAN; Resim gereçleri başlığı TUVAL dahil; Ahşap atölyesi başlığı ZIMPARA dahil. Yeni başlıklar ayrı sunum override'ı olmadan doğrudan görünür. Eski katalogda aynı küme veya üç ve üzeri ortak hedefli bölüm bulunmadı.

642 test /133 grup geçti. Yeni fixture önceki0.31.0 kaynağından değişiklik öncesi alındı:144 eski numara ve181 tahta SHA-256 eşit. Beş yeni kabul testi24 bölüm boyunca gerçek kapı/devam/ödül zincirini, kısmi kayıt/yükleme/birleştirme ve tekrar ödülü olmamasını doğruluyor. Mevcut transport bütçesinde307 solo kayıt ve3660 günlük tarih korunuyor. 239 yazılmış tahta /4780 alternatif düzen,64 grup tahtası,774 Arena tanımı/919 kelime ve714 Hızlı Tur hedefi geçti. Tip/web üretim/Safari12 sözdizimi guard ve mobile build/sync/check başarılı. Yeni native kod değişmedi; iOS sürüm0.32.0(8) paket içeriği hazır, Xcode/fiziksel cihaz kurulumu bu tur yapılmadı.

639 üretim Worker HTTP kontrolü geçti: yeni145 kısmi kaydı,24 yeni tamamlanmış kayıt ve son168 devamı gerçek server doğrulaması/bulut okuması/owner ayrımıyla sınandı. Eski bitmiş kıyı ve bonus kayıtları korunuyor. İzole test verisi kullanıldı; canlı oyuncu kaydı değiştirilmedi.

Destekli tarayıcıda gerçek Solo ve JourneyHome bileşenleri, üretime girmeyen mobile/artifacts/pack fixture'ında ayrı test kaydıyla açıldı. 414×628:145 ELMA gerçek sürüklemeyle bulundu; reload sonrası1/4 kaldı; diğer üç hedefle tamamlandı, üç yıldız/Elma dalı/1/6 kutlaması ve tek devamla146 Turunçgiller görüldü. 320×568:146 sekiz satırlı tahta300px/23.52px harflerle tam görünür;153 Mutfak gereçleri tanımı, hedef değişimi ve300px tahta görüldü;168 Müzik toplulukları üç açık/bir gizli hedefle tam görünür. Yerel test wrapper'ının callback imzası ilk denemede hatalıydı; React SetStateAction sözleşmesine düzeltildikten sonra kayıt kontrolü yeniden geçildi. Üretim kaydetme kodu değiştirilmedi.

Görseller depo dışında ../world-review/0.32.0 altında. Gerçek iPhone dokunma/FPS/titreşim ve kurulu uygulama güncellemesi yapılmadı. GitHub CI/ağaç eşitliği ve Sites yayın yanıtı dışarıdaki release-0.32.0.json makbuzuna yazılır. Yeni ücret, bağımlılık, göç, hesap, Arena veya tarihli çift yoktur.
