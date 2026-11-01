# 1 Kasım akşam · Güvenli güncelleme geçişi

Başlangıç güncel Site49/0.23.1, kaynak c1992739b6265e06ca0e72b8acd681e7e200281f; GitHub06bd430 ve tam ağaç8ccf2f2012559b00d279473ea49f3c485f0680ad eşit. Örgü sepeti/Tren garı zaten yayımlı; ikinci çift yok. Son180dakika error-only Worker sorgusu0 olay; genel hatasızlık iddiası değildir.

Adaylar: yeni kozmetik özellik(kanıt yok); fiziksel provider/PWA kontrolü(araç/cihaz kanıtı yok, önceki preview kilidinde somut recovery yok); güncelleme aktivasyonunun eski cache temizlik hatasında kesilmesi(somut public/sw.js kaynağı, seçildi). Sabah ağ yanıtı koruması bu ayrı activate yolunu kapsamaz. Etki: indirilmiş güncellemenin eski cache temizliği yüzünden devre dışı kalmasını önlemek; gerçek oyuncu etkisi ölçülmedi. Dar saf SW değişimi için tek koordinatör, ek ajan yok.

Koddan önce kabul: cache listesini okuma veya bir eski cache silme hatası clients.claim çağrısını engellemez; bir silme hatası diğer eski cache temizliğini durdurmaz; yalnız bu oyunun eski cache'leri silinir, güncel/başka uygulama cache'i korunur. Claim'in kendi hatası gizlenmez; başarısız install yine reddedilir; kullanıcı onaysız skipWaiting eklenmez. Fetch/özel veri cache istisnaları, kayıt/ödül/tahta/rekabet ve12 günlük snapshot değişmez. Hedefli gerçek SW handler testleri, nihai test/tip/içerik/build/Worker/CI ve tam kaynak eşleşmesi gereklidir.

Fiziksel Safari/Android/ses kesintisi, iki gerçek provider ve kurulu PWA ilk açık önceliktir. Bu kontrollü lifecycle testleri gerçek cihaz doğrulaması değildir. Haftalık inceleme31Ekim'de yapılmıştır.

Son kaynak incelemesi: kurulum/fetch/message değişmedi; try sınırı yalnız eski cache temizliğinde, claim hatası dışarı yayılır. Yeni iki hata senaryosu eski kaynakta başarısız, dört yeni lifecycle kontrolüyle toplam18 SW kontrolü başarılı. Nihai538 test/113grup, tip,163 tahta/3260 alternatif+64 grup+96 rekabet tahtası geçti; şema farkı yok.96 korunan oyun/kayıt/ödül/bileşen/göç dosyası ve12 tarih snapshotı byte-eş. Preview status stopped; önceki kilitte recovery kanıtı bulunmadığından start tekrarlanmadı. Yeni görsel/fiziksel cihaz/provider/PWA/dinleme/FPS kanıtı yok.

Üretim build/çevrimdışı varlıklar/Safari12 syntax ve WorkerHTTP kontrolü başarılı. CI/tam ağaç ve dağıtım makbuzu yayın PR metaverisine eklenir.
