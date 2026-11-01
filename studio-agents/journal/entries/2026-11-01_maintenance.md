# 1 Kasım 2026 · İçerik ve çevrimdışı kabuk güvenilirliği

Başlangıç: en güncel Site48/0.23.0, kaynak f9ecdd138519f5c1a06da425dd700901adeb50c5; GitHub main0cac2af, tam ağaç d23d30cee961abbf067b780b11f1b93138f40dad eşit. Bugünün çifti yok; son mobil/Arena davranışı korunur. Küçük bağımsız kapsam için tek koordinatör; ek uzman açılmadı.

Adaylar: yeni ödül/kozmetik (kanıt yok, cihaz önceliğini atlar); fiziksel Safari/provider/PWA (bu ortam fiziksel cihaz ve kullanıcı provider oturumu sağlamaz); mevcut SW depolama arızası (somut kaynak: başarılı ağ HTML/asset cevabı cache.open/put hatası nedeniyle kaybolabiliyor, seçildi). Etki: depolama kotası/özel mod gibi cache arızasında çevrimiçi oyun açılışını korumak. Düşük maliyet/risk: fetch stratejisi/hesap cache istisnaları aynı; yeni DB/servis/özellik yok. Etki henüz gerçek oyuncuda ölçülmedi.

Uygulamadan önce kabul: (1) 1 Kasım tek sabit çift, kolay6×6/dört ve orta8×8/yedi hedef; iki çapraz eğim, özgün küme/grid ve eski snapshot byte-eş. (2) Gerçek public/sw.js handler'larında cache.open/match/put/delete hata verdiğinde başarılı ağ cevabı aynen döner; ağ yoksa mevcut kabuk veya dürüst503. (3) Başarısız kurulum offline-hazır sayılmaz; API/kimlik/üye/yönetim/POST/diğer origin cache dışı kalır. (4) Eski kayıt/ödül/rekabet/aktif tahta değişmez. Nihai test/tip/içerik/şema/build/Worker/CI ve tam ağaç eşleşmesiyle aynı adrese yayın.

Açık sıra korunur: fiziksel Safari/Android/tablet ve ses kesintisi; iki gerçek provider hesabı ve gerçek PWA yeniden açılışı; izinli oyuncu gözlemi. SW kontrollü testleri bu kabullerin yerine geçmez. Haftalık değerlendirme31Ekim'de yapılmış; bugün tekrar rapor üretilmez.

Yerel kanıt: aynı gerçek SW scripti eski kaynakta14 testin9'unda başarısız; düzeltmeyle14/14 geçti. Nihai toplu534 test/112 grup başarılı.163 authored board/3260 alternatif,64 grup ve96 yeni rekabet tahtası/919 kelime denetimi başarılı. Drizzle şema farkı yok. Test harness'indeki iki index-signature erişimi tip kontrolünce yakalandı, yalnız testte bracket notation düzeltildi; hedefli test/tip yeniden doğrulanır. Kayıt, ödül, oyun/rekabet/mobil bileşenleri ve eski11 tarih snapshotı byte-eş.

Son180dakika üretim error-only Worker log sorgusu0 olay döndürdü; bütün oturumlara hata yok garantisi değildir. Destekli sites-preview stopped; start mevcut vinext server lock(/site) nedeniyle healthy olmadı. Başka sunucu sonlandırılmadı veya tarayıcı yolu denenmedi. Bu tur yeni DOM/fiziksel cihaz/provider/PWA/FPS/dinleme kanıtı yok. Önceki0.22 yerel DOM kanıtı kendi sınırlarıyla korunur. İlk başarılı offline kurulum şartı ve mevcut güncelleme onayı akışı aynıdır.

Son tip kontrolü ve hedefli14 test geçti. Üretim build/çevrimdışı varlıklar/Safari12 syntax ve üretim Worker HTTP kapıları başarıyla tamamlandı; sayı Worker logunda ve yayın PR kaydında verilir.95 korunan dosya/11 eski snapshot byte-eş. CI/tam ağaç/yayın makbuzu kaynak paketinden sonra PR metaverisine eklenir.
