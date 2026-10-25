# Studio sürümü: teslim ve doğrulama

0.6.0 ile günlük kaynak bölümleri, kalıcı arşiv ve uygulama içi sürüm notları eklendi. Güncel kapsam, kabul ölçütleri ve doğrulama sınırları: [geliştirme defteri](development-log.md). Önceki tarayıcı kontrolü ifadeleri bu sürüm için yeni bir görsel test yapıldığı anlamına gelmez.

0.6.1, bu kartlarda gerçek hesap/cihaz ilerlemesini ve doğru devam/tekrar eylemini gösterir. Kart verisi en fazla 24 kimlikle, yalnız mevcut hesap için okunur; yanıt önbelleğe alınmaz ve kelime yolları içermez. Geçersiz veya hash'i uyuşmayan cihaz tahtasından ilerleme gösterilmez.

0.7.0, **Bir avuç melodi** ve **Robot atölyesi** bölümleriyle tarihli keşif damgalarını ekler. Her tarihin sabit iki bölümünü tamamlamak o çiftin kalıcı hatırasını açar. Damga gerçek hesaba özel tamamlamalardan türetilir; ayrı ödül yazımı, süre/ipuçsuzluk şartı ve yeni şema yoktur. Arşiv çiftleri tarihe göre gösterir. Anlık oyun sonu damga bildirimi bu aşamada uygulanmadı.

0.7.1, tarihli bölüm sonucunda doğrulanmış damga durumunu ve varsa aynı çiftin kalan keşfine geçişi gösterir. Son doğru kelime anında hesaba katılır; diğer kayıt bilinmiyorsa tamamlandı iddiası yoktur. Eski arşiv çiftleri ve tekrar oyunları aynı kalıcı hatırayı kullanır.

0.8.0, **Fırında bir sabah** ve **Eski kentin izleri** bölümleriyle Albümde tarihli damga rafını ekler. Raf mevcut tamamlamalardan türetilir; eski bölümlere açılan pencere, doğru devam/tekrar ve bölümden rafa dönüş sunar. Bilinmeyen ilerleme kazanılmış gibi gösterilmez. Yeni şema veya ödeme entegrasyonu yoktur.

## Uygulanan ürün akışları

0.11.3: arşiv/Albüm/dünya listesi kökeni oyun içi geri dönüşte korunur. Yüklü public özetler, companions, imleç ve seçilen kart/tarih aynı oturum belleğinde taşınır; private ilerleme taşınmaz. İlgili bölüm zinciri ilk kökeni korur, bağımsız oyun yeni dönüş başlatır. Hatalı sayfa aynı offset ile tekrar edilir; reconnect eski aralığı silmez, yeni ön içerik imleci kaydırırsa düzeltilir ve büyük içerik farkının boşluğu yüklenebilir kalır. Sekme yenilemesi/OS kapanması konumu saklamaz. Odak/scroll hedef çağrısı testlidir; gerçek DOM/piksel/telefon sonucu ayrıca doğrulanmalıdır.

0.11.2: İpucu Avı kartlarında tanım ve cevap aynı intrinsic alanda yer tutar; bulununca kart türü veya ayrılan metin alanı kaybolmaz. Gizli yüz görünür/erişilebilir cevap olarak sunulmaz; uzun metin ve büyük yazı kırpılmaz. Normal/parçalı/golden davranışları korunur. Kaynak/markup sözleşmesi doğrulandı; gerçek telefon ve CSS piksel sığması ayrıca gözlenmelidir.

0.11.1: **Kıyıda bir gün** ve **Efsanelerin kapısı** tarihli bölümleri ana sayfa, arşiv ve ilgili dünyalara eklenir. Doğrulanmış cihaz tahtası ağ beklemeden açılır; hesap kaydı mevcut korumalı PUT'la arka planda birleştirilir. Geç onay aktif turdaki kelimeleri/süreyi korur; tekrar boş kalır. Belirsiz hesap başlangıcında kişisel rekor iddiası gösterilmez. İlk indirme hâlâ gerçek tahtayı bekler; fiziksel telefon/PWA ve FPS doğrulaması açık kalır.

0.11.0: 13 yeni harita/78 bölüm ve 26 İpucu Avı; eski üçlü tamamlanınca yeni dünyaya öneri, gerçek sıradaki bölüm eylemi, yeniden tasarlanan yol atlası ve kabul edilmiş kelime kutlaması. Sonlu katalog, kalıcı kayıt ve cihaz doğrulama sınırları [harita belgesinde](discovery-map.md).

0.10.0: isteğe bağlı 60 saniyelik Hızlı Tur, dünyalara katılan tarihli bölümler ve tema filtreli API, görünür oda daveti ve ekip/lig/geçmiş sekmeleri, özgün ada sahnesi ve puan/seri animasyonları. Kapsam ve sınırlar geliştirme defterinde.

0.9.0, tüm hedefleri açık tutan mobil ızgara ve kullanılabilir ekran yüksekliğine göre boyutlanan tahta getirir. Büyük yazı veya çok kısa ekranlarda okunabilirlik korunarak doğal kaydırma sürer. Ana ekran, kontroller ve başarı anları daha canlı aynı görsel dille yenilendi. Browser preview bağlantısı reddedildiğinden fiziksel telefon, görsel sığma ve FPS doğrulaması bekler.


0.8.4, tarihli/ek bölümlerin gönderimini hesap ve bölüme bağlı bir kuyrukta tutar. Kısmi istek sürerken tamamlayıp oyun içinde geri dönüldüğünde, başarılı ilk yanıtın ardından son tamamlama da gönderilir. Hesap değişimi eski kanalı iptal eder; sunucudaki beklenen hesap kontrolü geç kimlik değişiminde yanlış hesaba yazmayı reddeder. Sekiz saniyelik sınır token, HTTP ve yanıt okumayı kapsar; hata sonrasında aktif oyunun olağan yeniden denemesi sürer. Yerel en iyi sonuç, kayıt biçimi ve ödül kuralları korunur. Sekme kapanması veya işletim sisteminin uygulamayı kapatmasında garantili bulut teslimi iddia edilmez. İndirilmiş tahtanın başlangıçta ağ beklemesi ayrı açık iştir.

0.8.3, tahta isteği hata verdiğinde doğrulanmış cihaz kaydıyla açılan tamamlanmış keşfi de bulut onayı bekleyen kayıt olarak tutar. Yeni kelime bulmadan veya süre eklemeden mevcut gönderim yolu tekrar denenebilir. Üst kayıt satırında cihaz yazma hatası uyarı simgesi ve ayrı hata biçimiyle, gönderim ise bekleme simgesiyle gösterilir. Kayıt, iyi sonuç, kimlik ve ödül birleştirme kuralları aynı kalır. İndirilmiş tahtanın ağdan bağımsız açılışı ve uçuş sırasındaki son gönderim kuyruğu bu sürümde tamamlanmış sayılmaz.

0.8.2, **Parkede küçük mola** ve **Yörüngede bir gün** tarihli bölümlerini ekler. Ek bölüm kartları cihazda doğrulanmış tahta varsa **Çevrimdışı hazır**, bağlantı yok ve tahta eksikse **İnternet gerekli** gösterir. Yerel kontrol tamamlanmadan hazır iddiası yoktur; çevrimdışı eksik kart bağlantı gelene kadar devre dışıdır. Kart ile açılış aynı kimlik/hash/içerik eşleştirmesini kullanır. Bulut tamamlama kaydı yerel tahta indirmesi sayılmaz; hesap ayrımı ve en iyi sonuç kuralları korunur.

0.8.1, ana sayfanın başına kişisel devam/başlama kartını taşır. Mevcut doğrulanmış öneri kuralı, bölüm başlığı ve gerçek bulunan kelime sayısı kullanılır. Harita/dünyalar bağlantıları ve Arena eylemi tek alandadır. Arşiv kartlarının tarih/metaveri yazıları büyütülür, mobil tek sütun ve tema çizimi ölçüleri sayfa ile pencerede tutarlı hale gelir. Kayıt, tahta ve ödül kuralları değiştirilmez. Bu sürümde destekli önizleme başka bir geliştirme sunucusuna ait kilit nedeniyle başlatılamadı; görsel tarayıcı ve fiziksel telefon doğrulaması tamamlanmış değildir.

Ana sayfa, ilk keşif, tema/rota seçimi, tahta, duraklama, ipucu, sonuç, tekrar oynama ve albüm aynı görsel sistemi kullanır. Ana gezinme Keşfet, Arena, Günlük ve Albüm olarak kalır. Arena, canlı düello, kayıtlı performansa meydan okuma ve arkadaşlar arasında ayrılır. Bir karşılaşma açılınca genel gezinme gizlenir; ayrılma ve dönüş oyun içinden yapılır.

Keşif Haritası, üç dünya, 18 koleksiyon parçası ve üç bonus bulmaca eklenmiştir. Açılışlar ve eski kayıt uyumluluğu [discovery-map.md](discovery-map.md) içinde açıklanır. Standart içerik ve klasik kayıtlar korunur. Rotalar ve Gizli Tema ayrı kayıt anahtarlarıyla eklenir. İpuçları, ses, titreşim, kontrast, renk paleti ve büyük harf ayarları oyuncunun kontrolündedir. Ses varsayılan kapalıdır. Titreşim yalnızca cihaz API'si varsa sunulur. Azaltılmış hareket tercihi CSS ile uygulanır.

## Teknik sınırlar

- Arena 650 ms aralıkla D1 sürümünü izleyen SSE bağlantısıyla güncellenir. Bağlantılar 22 saniyede yenilenir, görünürlük değişiminde yeniden bağlanır. Bu mimari gerçek zamanlı bir WebSocket hub'ı değildir. Bölgesel gecikme ve eşzamanlı kapasite üretim yük testiyle ölçülmelidir.
- Hamleler anında yerel çizgi geri bildirimi verir; sunucu reddederse geçici çizgi kaldırılır. Puan ve süre istemciden alınmaz.
- Sunucuda seçim doğrulaması ve oran sınırları vardır. Otomatik çözücü tespiti, karşılaşma davranışı analizi ve kötüye kullanım incelemesi sonraki işletim çalışmalarındandır.
- Solo ilerleme rekabetçi sıralamaya bağlanmaz. İpuçlu veya değiştirilmiş solo kayıtlarla Arena derecesi kazanılamaz.
- Misafir erişimi tarayıcıdaki cookie ile korunur ve 90 gün süreli olabilir. Çıkış bu oturumu iptal eder. Kalıcı hesapla giriş farklı cihazdan erişim içindir.
- E-posta kayıt ekranları ve sunucu doğrulaması hazırdır. Firebase projesi, e-posta sağlayıcısı, izinli alan adı ve dört ortam değeri olmadan e-posta kayıt/giriş/doğrulama/sıfırlama canlı değildir.
- PWA çevrimdışı erişimi ilk başarılı indirmeyi gerektirir. Yarışmalı modlar internet ister. `/api`, kimlik ve e-posta işlem sayfaları SW önbelleğine alınmaz.

## Doğrulananlar

TypeScript, içerik kontrolü, gerçek SQLite üzerindeki servis testleri ve üretim derlemesi ayrı kontrollerdir. `scripts/verify-worker.mjs` yayımlanacak Worker derlemesini Miniflare üzerinde iki bağımsız oyuncuyla HTTP seviyesinde sınar. Test veritabanı üretimden ayrıdır.

Özgün SVG görselleri rasterleştirilerek görsel olarak incelenmiştir. Bu, sayfanın tarayıcıda ekran görüntüsüyle kontrol edildiği anlamına gelmez.

## Gerçek cihaz ve oyuncu doğrulaması

Önceki destekli önizleme erişim denemesi bağlantı ve tarayıcı güvenlik engeliyle sonuçlandı. Bu engelin giderildiğine dair kanıt olmadığından başka bir tarayıcı yolu denenmedi; güncel değişikliklerin tarayıcı ve fiziksel telefon kontrolü yapılmış sayılmaz. İlk oyuncu grubunda şunlar doğrulanmalı:

1. iPhone Safari, ana ekrandan açılış, Android Chrome ve daha düşük güçlü bir Android cihaz.
2. Çapraz kaydırma, iki uca dokunma, büyük harf modunda kaydırma, ekran döndürme, arka plan/ön plan dönüşü.
3. Zayıf bağlantıda ilk açılış, yarım indirme, çevrimdışı yeniden açılış ve uygulama güncellemesi.
4. Davet bağlantısı, misafir/kayıt/giriş, odaya dönüş, iki gerçek hesapla düello, bağlantı kopması ve rövanş.
5. Firebase bağlandıktan sonra gerçek gelen kutusunda doğrulama, tekrar gönderim, parola yenileme, süresi geçmiş bağlantı ve kullanıcı adı çakışması. Emulator/browser çalışması ayrıca tamamlanmalı.
6. Ekran okuyucu, klavye, büyük sistem yazısı, azaltılmış hareket ve kontrast.

60 FPS, hızlı ilk kelime ve düşük gecikme ürün hedefleridir. Ölçülmüş üretim garantileri değildir. İlk 20–30 oyuncunun gözlemi sürtünmeleri bulmak içindir; başarı veya oyuncu tutma oranı kanıtı değildir.

## İçerik ve operasyon düzeni

İçerik taslağı önce atölyede oynanır, Türkçe yazımı ve tema uygunluğu incelenir, kaynağa eklenir ve CI kontrollerinden geçer. Görsel sahneler, arayüz ve paylaşım kartı özgün vektörlerdir. Yeni koleksiyonlar aynı sanat ve zorluk ölçülerine uyar. Düzenli yeni paket yayını, insan incelemesi ve çalışma kapasitesine göre planlanmalıdır; 08.00 ve 20.00 UTC için bağlı bakım ve içerik görevi etkinleştirildi. Her başarılı çalışmanın kaydı ayrıca doğrulanmalıdır.

Ölçüm varsayılan kapalıdır. Açıldığında `metrics` tablosunda gün, izinli olay adı ve aralık sayımları tutulur. İlk kelime için 15/30/60 saniye aralıkları; giriş geri bildirimi ve kare örnekleri için 17/34/50/100 ms aralıkları bulunur. Dönüş ölçümü yalnızca ölçüme izin veren aynı tarayıcıların ilk gün tarihinden hesaplanır; yeniden kurulum ve veri silme karşılaştırmayı etkiler.

Örnek toplu rapor:

```sql
SELECT day,event,bucket,SUM(count) AS total
FROM metrics
GROUP BY day,event,bucket
ORDER BY day DESC,event,bucket;
```

Gelir modeli bu sürümde uygulanmadı. Oyun döngüsü doğrulandıktan sonra kozmetik veya ek tema paketleri değerlendirilebilir. Üretim eşzamanlı oyuncu kapasitesi, mağaza dağıtımı ve düzenli içerik işletimi ayrıca doğrulanmalıdır.
