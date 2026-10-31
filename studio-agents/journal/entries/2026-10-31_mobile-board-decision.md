# 31 Ekim 2026 · Tahta öncelikli mobil oyun / 0.22.0

Kullanıcının iki gerçek Safari görüntüsü: dokuz iki sütunlu tanım kartı yüksekliği sınırsız; başlık/skor ve48px seçim satırından sonra tahta aşağı taşar. Fitter26px hücre tabanını koruyarak doğal sayfa taşmasına izin verir; bu güvenli ama oynanış için yetersizdir. Dış panel ve iç tahta dolgusu kullanılabilir eni de azaltır.

Tek çözüm: yeni grup turları sürümlü9×9/yedi kelime; portre oyunlarda tam liste yerine önceki/sonraki ile seçilen okunur bir hedef ve bütün hedeflere pencere erişimi; kompakt HUD ve az çerçeveyle tahta önceliği.12×12 genişliği en iyi durumda~32px hücre bırakır;9×9 aynı alanda~42px verir, yedi hedef120s turun içerik yoğunluğunu korur. Zorluk çapraz/ters yerleşim ve tanımlardan gelir. UI bütün modların aynı PlayLayout yolunda uygulanır; ekran boyutu asla bulmaca üretmez.

Kabul:414×622 iPhone8Plus Safari içerik bütçesi,360×568 ve390×700 dar ekranlar; normal/bilmeceli grup, solo normal/bilmece ve eski12×12 snapshot. Tüm satırlar/alt kontroller görünür, yatay taşma yok; sürükleme ve iki uç seçim doğrulanır. Tam tanım gizlenmez, yanlış hedef seçim kuralı eklenmez. Onaylı hamle/puan/server saati/altın kelime korunur. Eski puzzle snapshot, kimlik/kayıt/ilerleme/ödül, arena_seen ve usedRiddleIds korunur; yeni havuz cursoru ayrı. Tek bağımsız saltokunur uyum uzmanı; model/bağımlılık/ekonomi değişimi yok.

Gerekli kapılar: hedefli yerleşim/hedef/Board/aktif eski oda kontrolleri, mevcut tüm testler, içerik, tip, build/Safari syntax, Worker HTTP, GitHub CI/tam kaynak eşleşmesi ve aynı publicSite yayını. Destekli tarayıcı görüntüsü fiziksel Safari/dokunma performansı kanıtı değildir.

## Uygulama ve hedefli gözlem

Güncel açılan kaynak0.21.1/4034dc2, GitHub main56040fdb; taban ağaç40cecb6d iki tarafta eşit. Akşam cihaz kayıt düzeltmesi korunmuştur. Tek uyum uzmanı yeni64 tahtayı ve snapshot/tekrar sınırını inceledi; uygulama rootta kaldı.

Ortak MobileTargets yalnız sunum/focus değiştirir; bütün hedefler dialogda, altın kelime ve onaylı tamamlamalar korunur. Normal modda herhangi bir doğru hedef kabul edilir. Solo odak ipucuyla aynı callback'i paylaşır. Başlıktaki seçim metni alanı büyütmez; koyu/açık yüzeyde ayrı okunur zemin vardır. Board koordinat, gesture ve kayıt algoritmaları değiştirilmedi. Yalnız portrait CSS aralık/panel/score compact yapılır.

Yerel gerçek UI:9×9 bilmeceli Arena'da ASLAN çapraz sürükleme ve TAVŞAN iki uç kabulü; normal Arena'da8harf BACAKSIZ sürüklemesi; normal Solo VENÜS ve bilmeceli Solo FİL iki uç kabulü. Listeden uzun tanım seçimi→aynı tahtaya geri dönüş, hedef tamamlama sonrası sıradaki, normal/bilmeceli tur sırası gözlendi. Aktif oturumlar yerel test oyuncularıydı. Eski12×12 bilmece snapshotı yerel test incelemesine konup144 hücre/tüm satırlar414×622'de doğrulandı; yeni tur eski board'u yeniden üretmez. Otomatik test ayrıca aktif12×12 claim→reload→finish→next geçişini kapsar.

Ölçüler:414×622 Arena bilmeceli tahta368px, hücre~41px, yazı23px;360×568 normal314px/19px ve uzun tanım309px/19px, bütün alt kontroller görünür, document.scrollHeight===innerHeight.360×568 Solo normal7×7 tahta300px, bilmece6×6 tahta337px; normal ve bilmece sayfa taşmasız. Bunlar tarayıcı içerik alanıdır; fiziksel iPhone8Plus/Safari motoru, parmak ergonomisi, cihaz FPS ve büyük sistem yazısı test edilmedi. 200% erişilebilir metin için doğal taşma hâlâ mümkündür; tam metin saklanmaz. Tablet/desktop eski tam liste yolu korunur.

512 test/109 grup,161 authored/3220 alternatif+64 yeni grup tahta ve typecheck geçti. Son CSS sonrasında üretim build/20 client chunk Safari12 syntax ve531 Worker HTTP kontrolü geçti. Yeni bağımlılık/göç/yayımlanmış bölüm değişimi yok. Son CI/ağaç eşleşmesi/yayın makbuzu repo dışı release0.22.0 kaydına eklenir.
