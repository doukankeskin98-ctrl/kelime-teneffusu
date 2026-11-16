# 0.56.1 — Kesintiden sonra güvenli devam

16 Kasım 2026 · iOS paket 50. İki doğrulanmış akış hatası ve bir destek ekranı kontrast hatası giderildi; oyun kuralları, kayıtlar, 312 bölüm ve çizim/haptik/animasyon zamanlamaları değişmedi.

## Oyuncuya etkisi

- Arena'da bitmiş tahtayı incelerken kurallar veya çıkış onayı açık kaldıysa başka oyuncunun başlattığı sonraki turda eski pencere kendiliğinden geri gelmez. Aynı tur içinde sonuç gelirken açık pencere korunur; skor, maç süresi ve sunucu işlemleri değişmez.
- Destek, bonus ve diğer sonradan yüklenen ekranlar bağlantı hatasından sonra **Yeniden dene** ile kendi yerlerinde yeniden yüklenir. Tam uygulama yenilemesi yok; ana oyunun durumu ve ekrana aktarılan ilerleme/devam bilgisi korunur. Başarılı modül tekrar indirilmez, ortak ön yükleme hâlâ tek istektir.

- Destek ekranındaki başlık/seçenekler eski açık tema metin rengini dayatıyordu. Form artık içinde bulunduğu ortak pencerenin metin rengini kullanır; seçilmiş sarı düğmenin koyu yazısı korunur.

## İnceleme kapsamı ve kabul

Seçilen ECC becerileri ve kurulum sınırları `ecc-skills-0561.md` içinde. Bir sınırlı bağımsız Arena incelemesi kullanıldı. Ayar ana/ayrıntı ekranı, ilk bölüm ve ağ toparlama görüntülerle kontrol edildi. İnceleme bütün mağaza/VoiceOver/cihaz/10 bin oyuncu kabulü değildir; eski içerik/zorluk ve mağaza hesabı işleri tamamlandı sayılmaz.

Kabul: yeni Arena turunda önceki turdan pencere ve feedbackPaused kalmaması; aynı tur penceresinin korunması; bozuk chunk indirmesi düzeldikten sonra sayfa zaman kökeni ve sahte kayıt birebir aynı kalarak desteğin açılması; ilk başarılı kelimede rehberin çekilmesi, tahtanın yer değiştirmemesi ve tek dokunuşla sonraki bölüm.

## Kanıt

- Tam yerel test seti: 1.015/1.015 geçti. Son test tip düzenlemesinden sonra ilgili 38 test ayrıca geçti; atlanan test yok.
- Tip, içerik/312 sabit manifest, lint artış kapısı ve şema kontrolü geçti. Mevcut lint borcu 427 hata/159 uyarı; artış 0. Katalogdaki bilinen tekrar/zorluk bulguları bu düzeltmenin konusu değildir.
- Web ve mobil üretim derlemesi; iOS 0.56.1 (50) içindeki 60 dosya eşleşmesi geçti. Paket derlemesi fiziksel telefona kurulum veya imzalı mağaza arşivi değildir.
- 749 izole Worker HTTP kontrolü geçti: iki eski istemci, sekiz özel grup ve 16 eşzamanlı açık grup test oturumu. Bu yerel işlev doğrulaması üretimde kapasite testi değildir.
- Tarayıcı: ayarlar 320×568, 375×667, 430×932; ilk bölüm/kelime/sonuç/sonraki bölüm ayrıca 393×852. Yatay taşma yok. 375 px başlangıç ve sonuç tahta ölçüsü aynı: x8/y160, 359×359. 320 px'de 304×304, bütün tahta ve kontrol yuvası görünür.
- Destek başlığı kontrastı 1,02:1 → 11,21:1; seçilmemiş seçenekler 1,10:1 → 9,97:1. Seçili seçeneğin 8,50:1 kontrastı ve 44 px dokunma yüksekliği korunur. Ölçüm gerçek hesaplanmış tarayıcı renkleri üzerinden; bütün uygulamanın erişilebilirlik kabulü değildir.
- HTTP 503 ile destek modülü bilerek engellendi; bağlantı açıldıktan sonra gerçek tarayıcıda form, yeniden yükleme olmadan geldi. `performance.timeOrigin` ve localStorage ilerleme metni birebir aynı. Beklenen 503 bu senaryonun arızasıdır; canlı servis arızası değildir.
- Önce/sonra mobil giriş JS: 858.825 → 859.009 bayt (+184 bayt); CSS 525.913 → 525.910 bayt. Yeni bağımlılık veya stil katmanı yok. Bu ölçü FPS veya kullanıcı gecikmesi ölçümü değildir. Kullanıcıdan akıcı kabulü almış çizim kodu değiştirilmedi.
- Bağımsız son kaynak/test incelemesinde engelleyici bulgu görülmedi. Gerçek iPhone, haptik, VoiceOver ve iki gerçek cihaz denenmedi.

CI ve yayın makbuzu aşağıdaki kanıt klasöründe son adımda kaydedilir; bu paragraf tek başına bunların geçtiği iddiası değildir.

## Geri dönüş

Başlangıç `c1dfe8a83050861f41629f251f89d84781706dcb`, 0.56.0 / Sites112. Kaynak bundle `../world-review.nosync/ecc-057/baseline-0560.bundle`; görüntüler, JSON karşılaştırmaları ve kontrol günlükleri aynı klasörde. Geri dönüş yalnız uygulama kaynağı/paketidir, oyuncu verisi eski bir yedekle değiştirilmez. Şema, kayıt biçimi, tahta/kelime/sıra ve içerik bayrakları aynı kaldığından veri göçü gerekmez.
