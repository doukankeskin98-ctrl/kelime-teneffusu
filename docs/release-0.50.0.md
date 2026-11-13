# 0.50.0 · Yeni Ufuklar

13 Kasım 2026. Ana yolculuk 192→312 bölüm, 32→52 rota. Bu bir App Store onayı veya kusursuzluk garantisi değildir.

120 yeni, konulu bölüm; 480 hedef ve 80 tanım. Dört hedefli, 6–8 hücrelik tahtalar. Her altılı rotada bir tanım bölümü; beşinci bölümde yalnız bir hedefin baş harfi gösterilir, tamamen gizli hedef eklenmez. 120 ayrı hatıra ve 20 isteğe bağlı kelime molası mevcut ödül/ilerleme akışına bağlandı. Mevcut dünya görselleri yeniden kullanılır; 20 yeni illüstrasyon üretildiği iddia edilmez. Tekrarlanan hedef kümeleri ve başlıklar içerik testinde reddedilir.

Uyumluluk fixture'ı önceki 192 kimliği/sırayı, 32 dünyayı, tüm eski kanonik tahtaları ve 395 hazırlanmış görünür yerleşimi birebir karşılaştırır. Kayıt biçimi, koordinatlar, yıldızlar ve bulut sahibi değişmez. 120 yeni kaydın eski istemci yazısından sonra korunması üretim Worker paketinde kontrol edilir. Kayıt boyutu mevcut 256.000 bayt bütçesinde kalır; sınır artırılmadı. Eski iki testin tarihî 150.000 bayt sabiti gerçek ortak bütçeye bağlandı.

İçerik güvenliği: hazırlanmış eski/yeni aktif tahtalarda sekiz yönde geniş tarama; yeni Arena/Sprint için açık `wide-v1` politikası. Önceki üreteçler ve digest testleri korunur. Günlük geniş politika 15 Kasım 2026'dan başlar; daha önce verilebilen günler değişmez. Mevcut maç snapshot'ları değişmez. Emekli içerik yalnız eski kayıt doğrulaması için tutulur, yeni kataloğa açılmaz. Taslak hedef/tanım kontrolü ve sunucu preview/save/publish güvenlik kapısı eklendi. Eski yayımlanmış dosyalar yeni politikayla yeniden üretilmez. BİSİKLET gibi sözlük istisnaları yalnız gerçekten yerleştirilmiş sözcüğün kendi hücrelerinde geçerlidir. Yeni incelenen istisnalar KAKAO, MAKAK, KISAYOL, BOKS; cümledeki meşru “sık” sözcüğü kör alt-dizi filtresiyle engellenmez. Tarama insan editörünün yerine geçmez.

Native açılışta boş kök yerine sade marka ekranı, modül/render hatasında kayıt silmeyen yeniden deneme var. Devam eden harf uçuşu sistem/oyun azaltılmış hareket tercihi değişince iptal edilir; zamanlayıcı, uçuş ve hedef işareti temizlenir. Onay/iniş süresi ve çizim motoru değiştirilmedi.

Game Center: GameKit/Capacitor köprüsü, tek otomatik deneme, açık kullanıcı tekrar denemesi, tek bekleyen işlem, süre sınırı ve geç callback koruması hazır. Ana ayarlardaki erişim yalnız yapılandırıldığında görünür. `KTGameCenterEnabled=false`: Apple App ID/entitlement/provisioning/App Store Connect ve gerçek cihaz doğrulaması olmadan açılmaz. Game Center kimliği Arena hesabının yerine kullanılmaz; Apple adı/kimliği kayda veya sunucuya gönderilmez. Mevcut Oyun Modu desteği ayrı özelliktir. iOS26'da eski dashboard yerine GKAccessPoint kullanılır; açılma bildirimi kapanma gibi yorumlanmaz.

## Kanıt

- 932 test /171 grup, tip ve içerik kontrolü; 535 hazırlanmış güvenli yerleşim, 417 içerik tahtası ve 8.340 alternatif yerleşim; 96 geniş kurallı Arena, 40 Sprint ve 45 gelecek günlük örneği. Ayrıca tüm963 Arena sözcüklerinin geniş kurallarla yerleşebilirliği.
- Üretim Worker paketinde 724 HTTP kontrolü: kayıt birleştirme, eski istemci yazısından sonra yeni ilerlemenin korunması ve çok oyunculu akışlar başarılı. Veritabanı şeması değişmedi.
- 120 yeni bölümün tamamı gerçek tarayıcı önizlemesinde 320×568'de ölçüldü: taşma/dokunma çakışması yok; en küçük hücre yaklaşık34px. Temsilî bölümler 414×736 ve375×667'de de incelendi. Bu, fiziksel parmak rahatlığı kabulü değildir.
- Bölüm193'te normal ve ters sürükleme, döndürme,4/4 onay ve kutlama ve 194. bölüme doğrudan devam akışı tarayıcı girdisiyle denendi. Yeni madalya/başlık hiyerarşisi görüntülerle incelendi.
- İzole yerel ölçüm: 120 yeni Arena üretiminde medyan9,28ms, p95 11,21ms, en yüksek132,41ms; boş sonuç0. Aynı örnek eski politika medyan8,08ms. Bunlar cihaz FPS veya üretim gecikmesi sayıları değildir. Üretim çizim sırasında çalışmaz; ana yolculuk tahtaları önceden hazırlanır.
- Native Swift simülatör derlemesi başarılı. 0.50.0 (40) mobil paketi, 46 native dosya eşleşmesi ve 21 sahne varlığı kontrol edildi. Açılış hatası ekranı tarayıcıda da doğrulandı. Fiziksel iPhone, Game Center gerçek oturumu, çok cihazlı canlı Arena, uzun oturum/düşük güç ve VoiceOver bu çalışmada denenmedi.
- Lint borcu428 hata/163 uyarı; artış0. Yeni borç kabul edilmedi; tüm lint temiz denmez. Mobil ana paket büyük parça uyarısı devam ediyor; eşik yükseltilmedi.
- Yerel kanıtlar: `../world-review.nosync/0.50.0-studio/`.

## Kaynaklar ve mağaza sınırı

[Apple Game Center kurulumu](https://developer.apple.com/documentation/gamekit/initializing-and-configuring-game-center), [oyuncu kimlik doğrulama](https://developer.apple.com/documentation/gamekit/authenticating-a-player), [GKAccessPoint](https://developer.apple.com/documentation/gamekit/gkaccesspoint/trigger(handler:)). Game Center bir genel uygulama giriş servisi değildir.

[LDNOOBW sözlük deposu](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words) CC-BY-4.0, yalnız araştırma kopyası indirildi. Liste doğrudan içeri alınmadı veya çalıştırılmadı: kısa kökler ve kimlik sözcükleri nedeniyle Türkçe bağlam incelemesi gerekiyor. Ürüne yeni bağımlılık eklenmedi.

Gerçek yayıncı/destek kanalı, ücretli Apple üyeliği, dağıtım imzası/arşivi, App Store Connect beyanları ve TestFlight/gerçek cihaz kabulü hâlâ dış hazırlıklar. Ayrıntılar `app-store-readiness.md`. Reklam/satış veya iptal edilmiş ambiyans eklenmedi.

## Geri dönüş

Başlangıç0.49.0, kaynak d73ff10db44421e15c390bb5d138e3eb83086e05; ağaç24fad9cfdcbcf3b533916d22494d464ab8ff0a6e. Tam Git yedeği `before-0.49.0.bundle` doğrulandı. Sites102: `appgprj_6ad7c9366ae88191a67ce62cdf26ab43~appgver_574b0f77cf0c819196a8eff107b61a1c`.

Yeni bölüm oynandıktan sonra eski sunucuyu doğrudan dağıtmak güvenli bir kayıt geri dönüşü sayılmaz: yeni kimlikleri tanımayan okuyucu bunları ayıklayabilir. Geri dönüşte yeni katalog/ödül kimlikleri ve tarihli günlük politika korunarak yalnız ilgili görsel/davranış değişikliği geri alınmalı; oyuncu veritabanı veya cihaz kaydı eski yedeğe yüklenmemeli.
