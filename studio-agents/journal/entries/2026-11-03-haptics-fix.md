# 0.30.1 — iOS harf seçimi titreşimi

Kullanıcı kaydırma titreşiminin tamamlanmasını açıkça istedi. Güncel Sites 63 / 0.30.0 kaynağı açıldı. Tek dar güvenilirlik incelemesi; uygulama koordinatörde.

Teşhis: Board bütün modlarda onSelectLetter → chime('letter') çağırıyor; hook yalnız eski 'select' cue'yu titreşime aktarıyor. Ayrıca native adapter selectionStart olmadan selectionChanged çağırıyor; kurulu Capacitor Swift uygulamasında generator nil olduğu için bu çağrı sessizce etkisiz.

Seçim: Ortak hook'ta letter→selection bağlantısı; ilk harfte native prepare/start, mantıksal seçim bitince end. Girdi/kelime kabulü/ses/kayıt/ödül ve bütün bölüm içerikleri değişmez.

Uygulama öncesi kabul:
- iOS seçim başlangıcı değişimden önce, her mantıksal seçim sonunda tek temizleme; iki uç/klavye/erken kabul/iptal/unmount uyumlu.
- Hızlı harflerde en fazla bir native seçim işlemi, 50 ms aralık; kuyruk veya sonradan yinelenen pulse yok. Başarı titreşimleri bu sınıra takılmaz.
- Kapalı tercih, arka plan, blur, duraklatma ve cleanup geç yanıtı titreşime çevirmesin; eski oturum yeni generator'ı kapatmasın.
- Ses kapalıyken opt-in titreşim çalışsın; web sessiz kalsın. Varsayılan tercih korunur.
- Gerçek hook/Board ve kontrollü native driver testleri; gerekli proje kontrolleri, paket ve Xcode simülatör derlemesi. Fiziksel titreşim hissi simülatörde doğrulanmış sayılmaz.

Doğrulama: 624 test /131 grup; 65 hedef haptik/Board/hook testi. Native driver testleri pending Start→Stop→yeni seçim, geciken End, yoğun 100 çağrı, sessiz ses/opt-in, 50ms actual tick aralığı, hata ve temizlemeyi kapsar. Board iki tap/klavye/erken kabul/pause/iptal/unmount davranışları geçti. Tek uzman son kaynak incelemesinde engel bulmadı ve 65 hedef testi bağımsız doğruladı.

215 tahta +4300 alternatif, 64 grup tahtası, 774 Arena tanımı/919 kelime, 96 taze rekabet tahtası, 714 Hızlı Tur kelimesi; tip/web/mobil paket/Xcode simülatör derlemesi ve 628 üretim Worker HTTP geçti. Eski içerik/kayıt/ödül ve seçim kabul kodu değişmedi. Fiziksel Taptic Engine hissi/yoğunluğu/gecikmesi ölçülmedi. GitHub/Sites tam ağaç, CI ve yayın makbuzu ../world-review/release-0.30.1.json içinde ayrıca kaydedilir.
