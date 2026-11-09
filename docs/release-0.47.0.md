# 0.47.0 — yeni yollar, ambiyans ve haftalık hatıra

## Uygulamadan önce kabul sözleşmesi

- 168 ana bölümden sonra dört altılı rota: toplam 192. Eski görünür sıra, kimlik, kelime/tohum/tahta, beşli dünya kapıları, albümler ve kayıtlar değişmez. Her yeni başlık bütün hedefleri kapsar; 6–8 hücre, 4–5 hedef, rota başına bir kısa tanım bölümü. Baş harfi/gizli hedefler seyrektir.
- Ambiyans varsayılan kapalı, efekt sesinden bağımsız tek anahtar. Ana ayarlar ve oyun içi dişlide aynı tercih görünür. Özgün, düşük seviyeli atmosfer; indirme/SDK/ana iş parçacığında sürekli zamanlayıcı yok. Arka planda, kapatıldığında, hesap değişiminde ve sayfa çıkışında ses kesilir; gecikmiş açılış sesi geri getirmez. Gerçek cihaz/kulaklık miks kabulü ayrıca belirtilir.
- İstanbul takviminde pazartesi başlayan haftada beş farklı ana bölüm. Gerçek tamamlamayı say; sonuç/bitmiş kayıt açma sayılmaz. Sıfırdan tekrar oynanan bölüm haftada bir kez sayılabilir. Ödül otomatik, kalıcı ve kozmetiktir; harcanabilir bakiye/Arena puanı değildir. Günlük giriş zorunluluğu veya kaçırılan gün cezası yok.
- Sonuçta kısa ilerleme satırı, ayrıntı/kalıcı hatıralar mevcut Başarımlar alanında. Yeni ana menü veya promosyon kartı yok. Kısa ekranı ve sonraki bölüm düğmesini sıkıştırma.
- Yakın haftanın tekil bölüm kümeleri ve kazanılan hafta kimlikleri temizlenir/birleşir. Çift olay/cihaz aynı ödülü çoğaltmaz; eski istemci yeni kazanımı silmez; saat geri alma kazanılmış ödülü geri almaz. Eski kayıt biçimi v2 aynı kalır; yeni alanlar isteğe bağlıdır.
- Hedefli içerik/ödül/ses yaşam döngüsü testleri; tüm testler, içerik, tip, db farkı, web/mobile derleme, Worker HTTP, 375/414 görünür alan kontrolü. Fiziksel iPhone hissi otomatik testle doğrulandı sayılmaz.

## Editoryal kapsam

Başlık–kelime sözleşmesi ve bağımsız editör kontrolü bu sürümdeki dört rotanın tamamını kapsar. Ayrıntılar kaynak içerik dosyasındaki açık başlıklarda ve içerik testlerindedir.

## Uygulanan sonuç

- 169–192: Ustaların Sokağı, Kitap Köşesi, Yolcu Günlüğü, Zamanın İzinde. 24 farklı konu, paket içinde tekrarsız 101 hedef, 16 editoryal tanım. 4–5 hedefli 6–8 tahtalar; yalnız dört ilk-harfli ve bir tamamen gizli hedef. Mevcut sahip olunan sahneler kullanıldı. Dört isteğe bağlı dünya bonusu aynı sistemle açılır; bunlar ana bölüm sayısına dahil değildir.
- Ambiyans: özgün hafif rüzgâr dokusu, 800 ms giriş/200 ms çıkış; Web Audio üzerinde sınırlı tek ses grafiği. Varsayılan kapalı, efekt/titreşimden bağımsız ortak ayar. Arka plan, sayfa kapanışı, ses kesintisi, hızlı aç/kapat ve hesap değişimi temizliği; gecikmiş resume yanıtları sesi geri getiremez. Yeni ses dosyası, bağımlılık, servis veya çizim döngüsü yok.
- Pazartesi başlayan İstanbul haftasında beş farklı ana bölüm. Tamamlanmış kaydı yalnız açmak sayılmaz; sıfırdan yeniden oynama haftada bir sayılır. Tarihli hatıra otomatik ve kalıcıdır; yıldız/hak/Arena puanı vermez. Sonuçta mevcut rozet satırı yerine tek satır, ayrıntılar Profil → Başarımlar’da. Bildirim veya yeni ana menü yok.
- Kayıt v2 ve eski kimlikler korunur. Eski istemcinin eksik yeni alanları kazanımı silmez; çevrimdışı cihaz kümeleri birleşir. Yeni katalogla 150 kB sınırı yetersiz kalıyordu: yerel UTF-8 kayıt sınırı 256000, HTTP/native zarfı 257024 bayt olarak hizalandı. Diğer native uçların 160000 bayt sınırı korunur.

## Doğrulama

882 test / 168 grup; son sonuç yerleşimi sonrası etkilenen 109 test tekrar geçti. Tip, 297 düzenlenmiş tahta / 5940 alternatif, Arena içerik kontrolleri, db:generate (göç farkı yok), web üretim/Safari12 sözdizimi ve mobil paket kontrolleri geçti. 712 izole Worker HTTP kontrolü yeni 24 bölümü, haftalık çevrimdışı birleştirmeyi, hesap ayrımını ve fazla büyük isteğin kayıtları değiştirmeden reddini içerir.

Önceki 168 ana bölüm kimliği/görünür sırası, 28 dünya metadata’sı ve 235 oynanabilir tahta hash’i birebir korunur. 391 eski/yeni kayıt, 3660 günlük tarih ve desteklenen takvim boyunca bütün kazanılmış haftalar ortak boyut bütçesi altında yeniden yüklenir.

Gerçek uygulama bileşenleriyle, izole yerel test kaydı ve taklit çevrimiçi taşıma üzerinden: 375×667 normal tahta, çapraz KÜP seçimi, haftalık kazanım, 169→170 geçişi, ana/oyun içi Ambiyans eşleşmesi, Profil → Başarımlar; 414×628 bilmeceli171 ve sekizli191 tahta, YELKOVAN sürükleme, harf yıldızları, tüm satırlar ve taşma kontrolü. Kısa sonuçta ödül satırının aşağıda kalması gözlendi ve süre ayrıntısının önüne taşınıp boşluklar azaltıldı.

Yerel geliştirme tarayıcısında bir çizim+geri bildirim penceresi: 88 kare aralığı, p95 18.4 ms, en uzun64.9 ms;34 ms üstü2. Bu küçük ölçüm üretim/telefon FPS garantisi değildir. Çizim, kelime uçuşu ve haptik motorları değiştirilmedi.

0.47.0 (34) iOS imzasız derleme başarılı; telefona kurulmadı. Ambiyansın fiziksel iPhone/kulaklık ses dengesi ve gerçek oyuncu içerik keyfi ayrıca doğrulanmalı. Haftalık hatıra cihaz takvimli kozmetik kazanımdır; sunucu tarafından hileye dayanıklı para/ödül sistemi olduğu iddia edilmez. GitHub/Sites kesin sürüm ve CI makbuzu yayın raporunda tutulur.
