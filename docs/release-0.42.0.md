# 0.42.0 · Sade ayarlar ve çizim rehberi

7 Kasım 2026 · iOS paket sürümü 0.42.0 / build 27.

## Değişiklikler
- Ana ayarlar artık sahne üzerinde kısa bir oyun menüsü. Büyük ses ve desteklenen cihazda titreşim anahtarları; Yolculuk/Destek düğmeleri; Diğer ayarlar, Nasıl oynanır ve Gizlilik ve hesap bağlantıları. Alttaki menü yazıları araya girmez. Ayrıntı katmanında ses düzeyi, erişilebilirlik, renkler ve isteğe bağlı ölçüm korunur. Olmayan müzik sistemi için sahte kontrol eklenmez.
- Hesap silme, misafir hesaplarında da Gizlilik ve hesap ekranının başında bulunur; mevcut doğrulama/sunucu işlemleri değişmez. Destekte yinelenen geri düğmesi kaldırılır. Alt ekran değişiminde klavye odağı başlığa taşınır; destekten dönünce çağıran düğmeye döner.
- İlk oyun ve yardım alıştırmasında özgün el simgesi gerçek hedefi 2,6 saniyelik çiz/bırak/tekrar döngüsüyle gösterir. El, kenarlarda tahtanın içine yönelir; döndürülmüş tahta koordinatlarını izler. Animasyon CSS ile çalışır; kare başına React güncellemesi, seçim çağrısı, ses/titreşim, ipucu veya puan üretmez.
- Gerçek seçim başladığında rehber derhal çekilir. Duraklama, yardım, engelli tahta, kaydırma modu, arka plan ve sökülmede durur. Hareket azaltma açıkken el ve yol statik kalır. Atla, iki uç dokunma ve klavye yolu korunur.
- Rehberin önerdiği kelime, listedeki vurgu ve varsayılan ipucu hedefi eşleşir. İlk bölümde henüz kelime bulmadan 10 saniyeden fazla bekleyip çıkan yeni oyuncu rehberi kaybetmez. Eski başarılı ilerlemeler rehbere zorlanmaz.

## Doğrulama
- 827 test / 163 grup; tip kontrolü; içerik denetimi; şema farkı olmaması; web üretim derlemesi; 695 Worker HTTP kontrolü geçti.
- Native derleme, Capacitor sync ve paket denetimi geçti: 39 eş dosya, 21 dünya sahnesi, 0.42.0 (27).
- İzole yerel kayıtlarla gerçek GameApp, 414×736 ve 321×570 CSS pikselde incelendi. Dar ayarlar 542px içerik yüksekliğinde kaydırmasız sığdı; düğmeler en az 44px. Öğretici tahta yaklaşık252px, bütün satırlar görünür; yatay taşma yok.
- Gerçek arayüzde YILDIZ yatay ve GÜNEŞ çapraz kelimeleri birer sürüklemeyle seçildi; hedef ve rehber adımı güncellendi. Bekleme sırasında kelime sayısı değişmedi. Duraklamada el kaldırıldı, devamda geri geldi, Atla ile kaldırıldı. Oyun içi hareket azaltmada hand/traveller animasyonları computed-style ile `none` doğrulandı.
- Hedefli regresyonlar: dokunma/klavye önceliği, arka plan/temizlik, dönen tahta, ilk rehberin geri dönüşü, ayarlar→ayrıntı/destek/gizlilik/misafir hesap silme erişimi ve aynı ilerlemenin korunması. Önizleme ekranları çalışma alanı world-review/0.42.0 içinde; rehber görüntüsü azaltılmış hareketin statik halidir.

## Apple rehberleri ve sınırlar
Apple belirli bir rakibin ekranını şart koşmaz. Sade ana kontroller, bağlam içinde öğretim, azaltılmış harekette anlaşılır alternatif ve hesap silmeye erişim esas alındı: [Settings](https://developer.apple.com/design/human-interface-guidelines/settings), [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding), [Motion](https://developer.apple.com/design/human-interface-guidelines/motion), [Account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/). Kaynak erişim sınırı uzman günlüğünde belirtilir.

168 ana bölüm, içerik/tahta/tohum/kimlikler, kayıt formatı, ödüller ve Arena kuralları değişmedi. Yeni bağımlılık yok. Fiziksel iPhone, titreşim hissi, VoiceOver, uzun oturum FPS ve TestFlight dağıtımı bu turda doğrulanmadı. Önizlemedeki titreşim anahtarı sentetik platform adaptörüyle görünürlük/tercih testi; fiziksel titreşim kanıtı değildir. Yayıncı/destek bilgileri ve diğer mağaza dış kapıları önceki yayın dosyasında açık kalır; bu sürüm App Store onayı iddiası taşımaz.
