# Geliştirme defteri

## 24 Ekim 2026 · 0.8.2

Güncel Sites kaynağı `acaa1fc2de1fc64bbec85d3fa08cd400b69f9122`, kayıtlı 12. sürüm, herkese açık sahip erişimi ve GitHub `main` başlangıcı `33d9d6f3034e7cec4f190fc0eb68678a589187b3` doğrulandı. 24 Ekim kaynak çifti henüz yok. Önceki sürümün kişisel başlangıç kartı korunuyor.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kartta doğrulanmış çevrimdışı hazırlık | Bağlantı kesildiğinde hangi tarihli/ek bölümün bu cihazda açılacağını önceden bilir. | Seçildi. Yalnız kimliği, hash'i, içeriği ve kelime yolları doğrulanan yerel tahta hazır sayılır; bulut tamamlaması indirme kanıtı değildir. |
| Kelime listesinde yalnız kalanları gösterme | Kalabalık tahtada aramayı kolaylaştırabilir. | Sonraki aday. Temel çevrimdışı erişim belirsizliği daha doğrudan bir sorun; gerçek cihaz gözlemi önce gelir. |
| Yeni keşif odası / iOS prototipi | Kalıcı koleksiyon veya kurulabilir uygulama deneyimini genişletir. | Ayrı aşama. Destekli etkileşim/cihaz doğrulaması olmadan geniş yeni akış eklenmedi. |

### Uygulama öncesi kabul ölçütleri

- **Parkede küçük mola:** Basketbol, Rahat, 6 × 6; POTA, PAS, ŞUT, FİLE. **Yörüngede bir gün:** Uzay, Dengeli, 8 × 8; UYDU, ROKET, KAPSÜL, YÖRÜNGE, MODÜL, İSTASYON, ANTEN. Her ikisinde iki çapraz eğim, geçerli Türkçe yazım ve alternatif yerleşim kontrolü.
- Sabit UTC tarih/sıra kimlikleri ve yeni snapshot: `content/releases/2026-10-24.json`. Dosya yeniden çalışmada yeniden üretilmez; önceki yayınlar, tahta motoru ve beşli harita kümeleri aynı kalır.
- Ana sayfa, arşiv ve Albüm içindeki bölüm kartlarında gerçekten indirilmiş tahta için **Çevrimdışı hazır**. Çevrimdışıyken eksik/bozuk/uyuşmayan tahta için **İnternet gerekli**, açıklama ve devre dışı açma eylemi. Bağlantı gelince mevcut yenileme yolu eylemi yeniden açar.
- Yerel kontrol tamamlanmadan hazır/eksik iddiası yok. Bulut ilerlemesi ve cihaz hazırlığı ayrı tutulur; başka hesaba ait kayıt veya sahte tamamlanma üretilmez. Puan, yıldız, damga ve kayıt birleştirme kuralları değişmez.
- Kartı hazır gösteren doğrulama ile çevrimdışı bölüm açılışı aynı kimlik/hash/içerik kuralını kullanır. Bozuk önbellek veya kapalı depolama hazır sayılmaz. Eski bölüm bir kez çevrimiçi açılarak mevcut indirme yoluyla hazırlanır; yeni indirme/abonelik servisi yok.
- Mevcut testler, güncel içerik denetimi, TypeScript, üretim derlemesi ve iki oyunculu Worker HTTP kontrolleri geçmeden yayın yapılmaz. GitHub ve Sites tam kaynak eşleşmesi korunur.

### Doğrulama ve sıradaki iş

İki bölümün değişmez dosyası oluşturuldu; kimlikleri `20261024-0001-4000-8000-000000000001` ve `20261024-0002-4000-8000-000000000001`, tohumları `2026102401` ve `2026102402`. Katalog, ana sayfa ve arşiv kaydı eklendi. Aynı tarihte yeniden çalışılırsa bu çift korunur ve varsa yarım kalan yayın bu kaynak durumundan sürdürülür.

Kartlara cihaz hazırlığı ve çevrimdışı eksik tahta açıklaması uygulandı. Aynı doğrulama bölüm açılışında da kullanılır; farklı kimlikteki ağ yanıtı kabul edilmez. Hesap veya katalog değiştiğinde eski kart durumu gösterilmez. Bağlantı kesildikten sonra gelen geç bir ağ yanıtı çevrimdışı durumunu yanlışlıkla hata/hazır durumuna çeviremez. Başka sekmedeki önbellek değişikliği/silinmesi ve bağlantı dönüşü mevcut olay dinleyicilerinden güncellenir. Yeni sunucu isteği, göç, ödül, bağımlılık veya ücretli servis yoktur. Metin ve ikon birlikte kullanılır; eksik kart soluklaştırılıp okunmaz hale getirilmez. Bulut ilerlemesi için belirsiz indirme metni kaldırılarak cihaz hazırlığı ayrı gösterilir.

Beş yeni regresyon testi: tamamlanmış kayıt tek başına indirme sayılmaz; yanlış kimlikteki tahta reddedilir; hash/içerik/yol uyuşmazlığı reddedilir; kapalı depolama veya yazma hatası hazır sayılmaz; yeni içerik eklenirken eski arşiv tahtası, hesap ayrımı ve iyi sonuç korunur. Önceki bütün regresyonlar geçerli.

Yerel sonuç: **118/118 test**, **32 tahta + 640 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. Son metin düzenlemesinden sonra etkilenen 15 kart/çevrimdışı testi yeniden geçti ve son üretim paketiyle iki bağımsız oyunculu **175 Worker HTTP kontrolü** başarılı oldu. Önceki üç yayın dosyası, tahta motoru, klasik oyun, standart katalog, ilerleme/harita kuralları ve veritabanı/göçler başlangıç kaynağıyla aynı. GitHub CI, tam kaynak eşleşmesi ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üç saatlik üretim hata günlüğü boş; bu tüm oturumların hatasız olduğuna kanıt değildir. Mevcut Sites yayın görüntüsü ilk öğrenme turunun masaüstü görünümünü gösteriyor; yeni değişikliğin mobil/etkileşim testi sayılmaz. Destekli önizleme durumu kapalı ve önceki kilit sorununda toparlanma kanıtı yok; tekrar tekrar başlatılmadı. Gerçek telefon, ekran okuyucu, FPS ve tarayıcı çevrimdışı geçişi doğrulanmış sayılmaz. Tahta önbelleği testleri, PWA kabuğunun fiziksel cihazda ilk indirme testinin yerine geçmez. Öncelik destekli gerçek iPhone/Android üzerinde ilk karttan oyuna, çevrimdışı bölüm açılışına ve arşive dönüşe kadar doğrulama; ardından izinli oyuncu gözlemi ve iOS dikey prototipi.

## 24 Ekim 2026 · 0.8.1

Başlangıç: en güncel Sites kaynağı `99630ee37b9fdac40922725787e3d155fef7ae6d`, kayıtlı 11. sürüm ve herkese açık sahip erişimi doğrulandı. GitHub `main` başlangıcı `f24d2b7d9d0cf14eb3efd3e9f6a05a9d339ed7f6`; kaynak ağaçları aynı. UTC 23 Ekim'in iki bölümü zaten yayında olduğundan yeni çift üretilmedi. İstanbul'da 24 Ekim'e geçilmiş olması UTC içerik kaydını değiştirmez.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kişisel keşfi ana sayfanın başına alma | Oyuna dönmek için günlük kartları, damgayı ve büyük tanıtım alanını kaydırma ihtiyacını azaltır. | Seçildi. Doğru başla/devam/tekrar hedefi günlük katalogdan önce görünür; mevcut öneri ve kayıt kuralları kullanılır. |
| Arşivde küçük metin ve çizim ölçülerini düzeltme | Tarih, zorluk ve oynama eylemi telefonda daha rahat okunur. | Aynı gezinme işinin parçası olarak seçildi. Sayfa/pencerede en az 11 px tarih, 12 px metaveri, 13 px eylem ve dar ekranda tek sütun. |
| Kişisel keşif odası / yeni gizem mekaniği | Kalıcı ilerlemeyi daha zengin bir deneyime dönüştürür. | Sonraki aşama. Önce mevcut keşfe ulaşma ve gerçek cihaz doğrulaması; yüzeysel yeni ödül veya kalabalık eklenmedi. |
| iOS uygulama prototipi | Kurulum, dokunma ve çevrimdışı akışın mağaza yolunda sınanmasını sağlar. | Xcode/iPhone ve giriş akışı doğrulaması gereken ayrı iş. Native sürüm hazır veya App Store'a uygun iddiası yok. |

### Yapılanlar ve kabul ölçütleri

- **Keşfet → ilk kart:** kişisel sonraki/yarım kalan keşif, gerçek bölüm başlığı, tema ve varsa bulunan kelime sayısı. Tek bir ana eylem mevcut `nextDiscovery` sonucunu açar. Tamamlanmış kayıt yanlışlıkla yarım gösterilmez; tekrar en iyi sonucu korur.
- **Harita / Dünyalar / Arkadaşla oyna:** ilk iki bağlantı sayfadaki gerçek bölümlere, üçüncü düğme mevcut Arena'ya gider. İlk öğrenme turu, Günlük sekmesi, sosyal akışlar ve arşiv korunur.
- Krem/orman yeşili tasarım, önerilen temanın mevcut özgün SVG çizimi, 48 px ana eylemler, dar ekranda tek sütun, görünür klavye odağı ve azaltılmış hareket desteği. Büyük tekrarlı tanıtım ve hızlı seçim alanları tek başlangıç alanında birleştirildi.
- Arşiv kartlarının çizimine doğru `theme-art` sınıfı bağlandı; sınırlı çizim alanı gerçekten uygulanır. Tarih/metaveri/oynama yazıları sayfa ve pencerede aynı okunabilir ölçeği kullanır. Küçük ekranda kartlar bir sütun olur.
- Kartların gerçek yükleniyor/boş/çevrimdışı/hata/yeniden dene durumları, hesap ayrımı ve bölümden dönüş korunur. Yeni ağ isteği, bağımlılık, ödeme, ölçüm, tablo veya göç eklenmedi.
- Eski bölüm kimlikleri, kelimeler, deterministik tahtalar, beşli harita kümeleri ve ödül kuralları değişmedi. Kaynak yayın dosyaları yeniden üretilmedi.
- Bağlı bakım görevinin yönergesine somut etki/kanıt/maliyet/risk önceliklendirmesi, tutarlı tasarım ve tamamlanmış küçük aşamalarla ilerleyen proaktif stüdyo çalışma biçimi eklendi. Zamanlama, mevcut kalite kapıları ve kayıt koruma şartları aynı kaldı. Kesintisiz çalışma garantisi verilmez.

### Doğrulama ve sınırlar

Üretim Worker akışına kişisel başlangıcın günlük katalogdan önce geldiğini ve iki sayfa bağlantısının gerçek hedefleri olduğunu denetleyen iki kabul kontrolü eklendi. Mevcut öneri/başla/devam/tekrar, hesap, misafir, bulut birleştirme, arkadaş, Arena, içerik ve çevrimdışı solo regresyonları korunur.

Yerel sonuç: **113/113 test**, **30 tahta + 600 alternatif yerleşim**, TypeScript ve son üretim derlemesi başarılı. Son paket üzerinde iki bağımsız oyuncuyla **171 üretim Worker HTTP kontrolü** geçti. Kaynak fark kontrolünde eski yayın dosyaları, motor, klasik içerik, katalog, ilerleme ve veritabanı/göçler başlangıçla aynı. Son üç saat için erişilebilir üretim hata günlüğü boş döndü; bu tüm oyuncu oturumlarının hatasız olduğuna kanıt değildir. Özel oyuncu verisi veya izinsiz ölçüm okunmadı. Kaynak ağacı/GitHub CI ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Destekli önizleme bu tur yeniden denendi ancak mevcut Vinext sunucu kilidi (`PID 14`, `/site`, `4173`) nedeniyle başlatılamadı. Önizleme yardımcısı başlatılmış bir önizleme göstermedi. Kilit silinmedi, bilinmeyen süreç durdurulmadı ve başka tarayıcı yolu denenmedi. Gerçek tarayıcı düzeni, telefon dokunması, ekran okuyucu ve FPS doğrulanmış değildir; kaynak/HTTP incelemesi bunların yerine geçmez.

### Sıradaki öncelikler

1. Destekli önizleme/gerçek iPhone ve Android doğrulaması: ilk karttan başlama, yarım oyuna dönüş, çapraz seçim, arşiv, büyük yazı ve çevrimdışı yeniden açılış. Kabul: taşma veya erişilemeyen kontrol yok; bölüm/kayıt/dönüş aynı kalıyor.
2. İzinli ilk oyuncu gözlemlerinden en büyük sürtünmeyi seçme. Kabul: gerçek örnek ve ölçülebilir hedef; uydurma kullanım veya başarı oranı yok.
3. iOS için tek oynanabilir dikey akış: ilk açılış, solo bölüm, kayıt ve geri dönüş. Kabul: gerçek derleme/cihaz doğrulaması; giriş sağlayıcısı veya satın alma bağlanmadan çalışıyor sayılmaz.

## 23 Ekim 2026 · 0.8.0

En güncel Sites kaynağı `f8c047a097196d0262502b2c1f111a5591ad2477`, herkese açık sahip erişimi ve 10. sürüm kontrol edildi. Önceki başarılı yayın `appgdep_6ada6e8c26508191865368588bcdbf2b`; GitHub başlangıcı `e5a8ea97f4583b87216cdeb2b30565021047e8d7`. 23 Ekim dosyası yoktu; iki yeni, değişmez bölüm `content/releases/2026-10-23.json` içine eklendi. Önceki yayın dosyaları korunur.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Albümde kalıcı damga rafı | Oyuncu eski hatıralarını bir yerde görür, kalan keşfi bulur ve bölümden aynı rafa döner. | Seçildi. Önceki sonuç ekranı aşamasını tamamlar. Yalnız gerçek iki tamamlamadan türetilir, yeni kayıt veya ödül talebi yoktur. |
| iOS prototipi ve App Store hazırlığı | Kurulabilir uygulamada dokunma, çevrimdışı kayıt ve giriş sınanabilir. | Bu tur uygulanmadı. Gerçek Xcode/iPhone doğrulaması ve yayın hesabı kurulumu ayrı aşama; çalışan web sürümü korunur. |
| Varsayılan iOS simge adreslerini tamamlama | Ana ekrana ekleme uyumluluğuna yardımcı olabilir. | Küçük 404'ler kaydedildi; temel oynanış arızası kanıtı yok. Cihaz/PWA doğrulamasıyla ele alınacak. |

### Yeni içerik

- **Fırında bir sabah:** Lezzetler, Rahat, 6 × 6, EKMEK, SİMİT, MAYA, PİDE. Tohum `2026102301`, kimlik `20261023-0001-4000-8000-000000000001`.
- **Eski kentin izleri:** Dünya Turu, Dengeli, 8 × 8, MOZAİK, SÜTUN, KEMER, HEYKEL, KİTABE, HARABE, KAZI. Tohum `2026102302`, kimlik `20261023-0002-4000-8000-000000000001`.
- Her tahtada iki çapraz eğim; istenen boyut ve bölüm başına 20 alternatif yerleşim kontrolü. Yeni kelime/tema çifti, ana sayfa kartları ve kalıcı arşivde bulunur.
- Aynı UTC tarihinin yeniden çalışmasında bu dosya yeniden üretilmez. Eksik yayın aynı kimlikler ve snapshotlarla sürdürülür; önceki tarihler değişmez.

### Yapılanlar ve kabul ölçütleri

- **Albüm → Keşif damgaların:** tarihe göre raf; kazanılmış damganın gerçek hatıra penceresi, iki bölümün adları, tamamlanma koşulu ve **Keşifleri aç** eylemi.
- Kalan veya eski bölümler raftaki tarihin penceresinden açılır. Tamamlanan bölüm doğrudan tekrar oyununa, yarım bölüm kendi kaydına gider. Aynı sabit çift bağlamı sonuç ekranına taşınır.
- Raftan açılan bölümden geri dönünce Albüm ve damga alanı korunur. Sonuçtaki geri dönüş yazısı her iki giriş noktası için **Keşiflerine dön** olarak genelleştirildi.
- Tamamlanmış damgalar eski kayıtlardan otomatik görünür; tekrar, yeni tarih veya ek içerik damgayı çoğaltmaz ya da kilitlemez. Beşli dünya kümeleri ve mevcut bonuslar değiştirilmez.
- Yükleniyor, boş, çevrimdışı ve hata durumları mevcut ortak katalog/özel ilerleme okumasını kullanır. Bilinmeyen kayıtta uydurma sayı veya ödül yoktur. Yeniden deneme ve eski tarihler için sayfalama korunur. Yalnız yüklenen tarihler gösterilir; bütün koleksiyon için doğrulanmamış toplam iddiası yoktur.
- Özgün damga SVG'si ve krem/orman yeşili/altın dili; dar ekranda tek sütun, 44 px eylemler, okunur metinli durumlar ve mevcut azaltılmış hareket tercihi. Yeni animasyon, görsel üretimi, bağımlılık veya ücretli hizmet eklenmedi.
- Raf aynı hesaba özel doğrulanmış bölüm kayıtlarını okur. Yeni tablo/göç, ödül bakiyesi, sunucu yazması veya Arena puanı yoktur. Hesap değişiminde önceki yanıtı göstermeme ve cihaz/bulut birleştirme yolu korunur.

### Kontroller ve sınırlar

Tarih büyümesini hesaba katmak için eski damga senaryoları sabit 22 Ekim örneğine bağlandı; bütün arşiv sayfaları testte okunur. Önceki kazanım, hesap ayrımı, çevrimdışı doğrulama, son kelime ve tekrar testleri korunur. Yeni regresyon, yalnız yalıtılmış test belleğindeki sentetik tarihlerle 24 bölüm sınırını aşar; eski damga çiftlerinin kaybolmadığını, sayfada bölünmediğini ve yinelenmediğini doğrular. Üretim içeriğine sahte bölüm eklenmez.

Yerel sonuç: **113/113 test**, **30 tahta + 600 alternatif yerleşim**, TypeScript ve son üretim derlemesi başarılı. İki bağımsız oyuncuyla **169 üretim Worker HTTP kontrolü** geçti. Küçük ekrandaki raf başlığı ve durum metinleri okunur boyuta getirildikten sonra üretim paketi yeniden derlendi ve HTTP akışı bu paketle çalıştırıldı. Önceki yayın JSON'ları, tahta motoru, klasik içerik ve veritabanı göçleri başlangıç kaynağıyla aynıdır. Tam kaynak ağacı/GitHub CI ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üretim günlüklerinde istemci iptalleri ve varsayılan simge/robots adreslerinde 404 vardı; uygulama istisnası kaydı görülmedi. Bu örnek tüm oturumların hatasız olduğu anlamına gelmez. Yetkili oyun oturumu olmadan özel kullanım ölçümleri veya oyuncu verisi okunmadı.

Önceki destekli önizleme erişim engelinin giderildiğine dair kanıt yok; başka tarayıcı veya güvenlik aşma yolu denenmedi. Bu tur gerçek telefon, tarayıcı etkileşimi, ekran okuyucu ve FPS doğrulanmış sayılmaz. Mobil düzen, metin, odak ve dokunma boyutları kaynakta incelenir; bu inceleme gerçek cihaz testinin yerine geçmez.

Sonraki öncelik gerçek iPhone/Android üzerinde albümden bölüme geçiş ve geri dönüş, çapraz seçim, büyük yazı ve çevrimdışı dönüş. Sonra iOS prototipinin giriş/kayıt/çevrimdışı davranışını küçük bir dikey akışta doğrulama. Native paket, Apple ile Giriş, reklam, ödeme veya abonelik henüz uygulanmadı.

## 22 Ekim 2026 · 0.7.1

Güncel Sites kaynağı `3201ab2a4addeb0a57f3eed3a915ee84f6c4bc66`, kayıtlı 9. sürüm ve `appgdep_6ada36fcbb448191b5e70f34f7dfb857` başarılı yayını esas alındı. GitHub başlangıcı `bba457490d84e81503610f411bdf7b36c9ef88c8`. Bugünün **Bir avuç melodi** ve **Robot atölyesi** bölümleri zaten yayında; ikinci çift eklenmedi. Kaynak yayın dosyaları, kimlikler, kelimeler ve sabit tahtalar korunur.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Damga durumunu gerçek bölüm sonucuna bağlama | Oyuncu tamamlamasının kalıcı hedefe nasıl katkı yaptığını hemen görür ve diğer keşfe kolay döner. | Seçildi. Geçerli son kelimeyle güncellenir; eksik/başka hesaptaki kayıt kazanım sayılmaz. |
| Albümde ayrı damga rafı | Hatıraları tek yerde toplar. | Sonraki aşama. Önce sonuçtan hedefe bağlantıyı tamamla; arşivdeki mevcut hatıralar korunur. |
| iOS varsayılan simge adreslerini düzenleme | Ana ekrana ekleme uyumluluğunu iyileştirebilir. | Günlüklerdeki küçük 404'ler kaydedildi; temel oyun hatası kanıtı yok. Gerçek cihaz/PWA kontrolünde ele alınacak. |

### Yapılanlar ve kabul ölçütleri

- Tarihli bir bölüm tamamlanınca sonuç penceresinde **Keşif damgan tamam** veya kalan keşif hedefi görünür. Tamamlanmış gerçek tahta kullanılır; kendi kaydının bulut yanıtını beklemeden son doğru kelime hesaba katılır.
- Diğer bölümün doğrulanmış kaydı eksikse başlığı ve **Diğer keşfi aç** eylemi gösterilir. Oyuncu kendi seçimiyle aynı tarihin diğer bölümüne geçer; sonuç ve geri dönüş eylemleri korunur, otomatik yeni oyun başlatılmaz.
- Sonuç kartında gerçek cihaz/bulut eşitleme durumu da görünür; cihaz kaydı hatası sonuç penceresinde uyarılır. Bulut onayı gelmeden hesabında kayıtlı denmez.
- Diğer kayıt yükleniyor/çevrimdışı/hata durumundaysa bilinmiyor olarak kalır. Eksik bulut bilgisi tamamlandı veya sıfır gibi sunulmaz. Hata/eksik kayıtta yeniden kontrol, bağlantı gelince mevcut otomatik okuma ve çevrimdışı doğrulanmış cihaz kaydı davranışı korunur.
- Ana sayfa, eski tarihli arşiv ve yeniden oyundan aynı sabit çift bağlamı taşınır. Bölüm kimliği, hash, tarih veya içerik eşleşmiyorsa bu sonuç kartı açılmaz. Yönetim panelindeki bağımsız bölümler bu hedefe dahil edilmez.
- Tekrarda aynı hatıra gösterilir; yeni damga veya bakiye kazanıldığı söylenmez. Hız, yıldız veya ipucu şartı yok. Koleksiyon/harita açılışları, bulut yazma ve en iyi kayıt birleştirme yolu değiştirilmedi; Arena derecesi verilmez.
- Aynı özgün SVG damgası, krem/orman yeşili/altın dili, metinli durum ve 44 px eylemler kullanılır. Sonuç penceresinin kaydırma, klavye odağı, geri dönüş ve azaltılmış hareket davranışı korunur.
- Yeni servis, bağımlılık, ücret, tablo veya göç yok. Salt okunan tek ek bölüm metaverisi mevcut hesaba özel toplu uçtan alınır. Hesap değişiminde önceki yanıtın gösterilmemesi önceki kancayla sürer.

### Doğrulama ve sınırlar

Yedi yeni test: doğru çift/hash/içerik sınırı; sahte tamamlama/yol reddi; son kelimeyi bulut onayından önce doğru sayma; iki sıra için doğru diğer hedef; bilinmeyen kayıt durumları; tekrar/ipuçlu oyunda aynı damga; eski arşiv ve gerçek sahip ayrımı. Üretim Worker akışına gerçek tamamlamadan diğer hedef, ardından gerçek ikinci kayıttan tek damga kontrolü eklendi. Önceki testler ve HTTP kontrolleri korunur.

Yerel sonuç: **112/112 test**, **28 tahta + 560 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. İki bağımsız oyuncuyla **165 üretim Worker HTTP kontrolü** geçti. Önceki bütün kaynak bölüm dosyaları, tahta motoru, klasik oyun, içerik ve veritabanı göçleri başlangıç kaynağıyla aynıdır. GitHub ağacı/CI ve gerçek Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üretim günlüklerinde iki istemci iptali ve varsayılan simge/robots adreslerinde 404 vardı; uygulama istisnası kaydı yoktu. Bu sınırlı günlük örneği tüm oyuncu oturumlarının hatasız olduğu anlamına gelmez. İzinli ürün ölçümlerine yetkili oyun oturumu olmadan erişilmedi.

Önceki destekli önizleme erişim engeli için onarım/toparlanma kanıtı yok; başka tarayıcı veya güvenlik aşma yolu denenmedi. Gerçek telefon, tarayıcı etkileşimi, ekran okuyucu ve FPS bu tur doğrulanmadı. Bu sınırla kaynak, servis ve üretim Worker doğrulaması sürdürülür.

Sonraki öncelik iPhone/Android üzerinde seçim, 200% metin, sonuçtan diğer keşfe geçiş ve geri dönüş; ardından Albümde kalıcı damga rafı. Kullanıcıyla iOS/App Store hazırlığı ve gelir modeli konuşuluyor; native paket, Apple hesabı, ödeme/reklam SDK'sı veya abonelik henüz uygulanmadı.

## 22 Ekim 2026 · 0.7.0

Güncel Sites kaynağı `edc2a77eb91fc9f1c08336399d14606be80072fe`, herkese açık sahip erişimi ve 8. sürüm kontrol edildi. GitHub `main` başlangıcı `480360f7bb92bee3a18becec0766e6d22345009a`. Önceki iki tarihli bölüm değişmeden korunur; 22 Ekim girdisi yoktu. Yeni, değişmez kayıt `content/releases/2026-10-22.json` olarak eklendi. Aynı tarihin yeniden çalışmasında bu dosya ve sabit kimlikler kullanılacak.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Tarihin iki keşfini bir kalıcı damgaya bağlama | Açık, ulaşılabilir küçük hedef ve eski keşiflere dönmek için anlamlı bir hatıra sağlar. | Seçildi. Yalnız o tarihin sabit iki kimliğinin gerçek tamamlanmasıyla açılır; tekrar veya yeni içerik çoğaltmaz ve kilitlemez. |
| Arşivde tema filtresi ve arama | Büyüyen içerikte istediği bölümü bulmayı kolaylaştırır. | Dört bölüm varken öncelik değil. Önce tarihe göre anlaşılır gruplama. |
| Dokunmatik toleransı değiştirme | Gerçek yanlış seçimleri azaltabilir. | Önce destekli iPhone/Android gözlemi gerekli. Kanıt olmadan çekirdek seçim davranışı değiştirilmedi. |

### İçerik ve kabul ölçütleri

- **Bir avuç melodi:** Müzik, Rahat, 6 × 6, NOTA, RİTİM, GİTAR, PLAK. Sabit tohum `2026102201`.
- **Robot atölyesi:** Teknoloji, Dengeli, 8 × 8, SENSÖR, YONGA, YAZILIM, BELLEK, ROBOT, İŞLEMCİ, KODLAMA. Sabit tohum `2026102202`.
- Tarih/sıra kimlikleri `20261022-0001-4000-8000-000000000001` ve `20261022-0002-4000-8000-000000000001`. Her iki çapraz eğim, istenen tahta boyutu ve bölüm başına 20 alternatif yerleşim doğrulaması.
- Önceki yayın JSON'u, klasik oyun, standart içerik ve beşli harita kümeleri değiştirilmedi.

### Uygulanan deneyim

- Ana sayfada **İki keşif, bir hatıra** alanı; iki bölümün adları ve gerçek tamamlanma işaretleri. İpucu, yıldız veya hız şartı yok. Tarih kaçırma, süre sonu, ceza veya seri zorunluluğu yok.
- İki tamamlama doğrulanınca **Damganı gör** gerçek kazanımı, tarihini ve iki başlığını gösteren özgün SVG hatıra ekranını açar. Eski tamamlamalar aynı kuralla otomatik tanınır; yeniden kazanıldı iddiası veya ek bakiye yok.
- Kalıcı arşiv tarihe göre gruplanır, her çiftin damgası yanında kalır. Yalnız sabit sıra 1 ve 2 kimlikleri hedefi belirler; sonradan eklenen içerik hedefi büyütemez.
- Yükleniyor, eksik kayıt, çevrimdışı ve hata durumlarında bilinmeyen kayıt sıfır veya kazanılmış ödül gibi sunulmaz. Eksik ilerleme önceki sürümün yeniden kontrol düğmesiyle okunabilir. Doğrulanmış iki cihaz kaydı çevrimdışıyken damgayı göstermeye yeterlidir. İndirilmemiş/önbellekten çıkmış tahtanın çevrimdışı kaydı bilinmiyor olarak kalır.
- Ayrı ödül talebi, yeni sunucu yazması, şema/göç, bağımlılık, ücretli hizmet veya analitik toplama eklenmedi. Damga mevcut hesaba özel, doğrulanmış bölüm kayıtlarından türetilir; Arena derecesi vermez. Hesaplar, arkadaşlar, puanlar ve kazanılmış dünyalar korunur.
- Krem, orman yeşili ve sıcak altın çizgisi; özgün yaprak damgası, metinli durumlar, 44 px eylemler, dar ekranda tek sütun, klavye odağı ve mevcut azaltılmış hareket desteği.
- Bu aşama ana sayfa ve arşivde kalıcı damga gösterimini kapsar. Oyun sonu penceresinde anlık damga bildirimi ve Albüm sekmesinde ayrı damga rafı henüz uygulanmadı; tamamlanmış sayılmaz.

### Kontroller ve sınırlar

Yedi yeni senaryo sabit çift/gruplama, sahte kimlik, eksik kayıt durumları, sahte tamamlama, ipuçlu/yavaş oyun, eski kazanımın korunması, gerçek hesaba özel bulut ve çevrimdışı kayıtları kapsar. Üretim Worker kontrolü ana sayfadaki koşulun ödül vermeden gösterildiğini ve arşivde tarih/sıra bilgisinin korunduğunu denetler. Önceki kayıt birleştirme, hesap/misafir, arkadaş, Arena, arşiv, güvenlik ve PWA regresyonları korunur.

Erişilebilir üretim günlüklerinde uygulama istisnası görülmedi; üç iptal edilmiş istemci isteği ve iki iOS simge araması için 404 vardı. İptaller tek başına veri kaybı veya sunucu hatası kanıtı değildir. Belirli Apple simge boyutunun keşfi sonraki PWA cihaz kontrolünde incelenecek. Gerçek kullanım ölçümlerine yetkili uygulama oturumu olmadan erişilmedi; kullanıcı kimliği taklit edilmedi.

Önceki destekli önizleme bağlantısı/güvenlik engeli için altyapı onarımı veya toparlanma kanıtı yok. Başka tarayıcı yolu denenmedi. Gerçek mobil düzen, fiziksel dokunma, ekran okuyucu ve FPS bu tur doğrulanmış sayılmaz. Kaynak, içerik, servis ve üretim Worker kontrolleri bu sınırla sürdürülür.

Yerel sonuç: **105/105 test**, **28 tahta + 560 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı; iki bağımsız oyuncuyla **160 üretim Worker HTTP kontrolü** geçti. 21 Ekim yayın JSON’u başlangıç kaynağıyla byte düzeyinde aynıdır. Test veritabanı üretimden ayrıdır.

Çıkış kapıları: tam kaynak ağacının GitHub eşleşmesi ve CI; ardından aynı Sites adresine başarılı yayın sonucu. Bu kayıt tek başına yayın kanıtı değildir.

Sonraki öncelik destekli iPhone/Android kontrolünde seçim, 200% metin, arşiv ve damga ekranından dönüş, ana ekrana ekleme. Ardından bir sonraki faydalı adım, gerçek tamamlanma anında damga bilgisini oyun sonucuna bağlamak; yeni içerik mevcut kazanımları genişletmeyecek.

## 21 Ekim 2026 · 0.6.1

Güncel Site kaynağı `605dcca989c7715ac866ac944e6c13b2e60c93a5`, kayıtlı 7. sürüm ve aynı içeriğin önceki başarılı yayını kontrol edildi. Bugünün **Ormanın minik komşuları** ve **Merak laboratuvarı** bölümleri zaten kaynakta ve yayında. Tarihli JSON, kimlikler, kelimeler ve tohumlar değiştirilmedi; ikinci bir çift eklenmedi.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kartlarda gerçek ilerleme ve doğrudan devam/tekrar | Oyuncu neyi bitirdiğini ve nerede kaldığını açmadan görür. | Seçildi. Yarım kart doğru bulunan kelime sayısını, bitmiş kart gerçek yıldız ve en iyi süreyi gösterir. |
| Çok aşamalı harita finali | Koleksiyon için daha uzun bir keşif hedefi sağlayabilir. | Bu tur ertelendi. Önce yeni günlük içerikteki eksik ilerleme geri bildirimini tamamla. |
| Dokunmatik tolerans ayarı | Yanlış son harf seçimini azaltabilir. | Cihaz kanıtı olmadan değiştirilmedi. Destekli tarayıcı/telefon gözlemi bekleniyor. |

### Uygulananlar ve kabul ölçütleri

- Ana sayfa ve her iki ek bölüm kataloğunda **Kaldığın yerden**, **Tamamlandı**, kazanılmış yıldız ve gerçek en iyi süre. Hiç kaydı alınamayan kartta uydurma sıfır veya yeni oyun iddiası yerine **Keşfi aç** ve yükleme/çevrimdışı/hata açıklaması.
- **Bir daha keşfet**, sonuç ekranını tekrar açmak yerine boş bir tur başlatır. Sonraki tekrarlar da güncel en iyi kaydı karşılaştırma temeli olarak kullanır; ödül veya rekabet puanı eklemez.
- Kartlar önce bu hesabın doğrulanmış cihaz tahtasını okuyabilir; bulutla geçerli hedef kimlikleri üzerinden birleştirilir. Başka hesabın cihaz anahtarı okunmaz. Hesap değişiminde istek iptali ve eski yanıtı yok sayma uygulanır.
- Hesaba özel toplu okuma en fazla 24 bölüm kabul eder. İstemciden gelen kullanıcı kimliği kullanılmaz. Taslaklar görünmez; arşivlenmiş, önceden yayımlanmış bölümlerin ilerlemesi korunur. Kart yanıtında yalnız hedef kimlikleri ve sonuç bilgisi vardır; tahta veya koordinatlar verilmez.
- Mevcut bulut kayıtlarına, uygulanan göçlere veya tahta üretimine dokunulmadı. Cihaz anahtarları korunarak ortak önbellek okuma kodu ayrıldı. Yeni bağımlılık veya ücretli hizmet eklenmedi.
- On yeni regresyon senaryosu: doğru devam/bitirme metni, bilinmeyen durum, sahte veri reddi, iki cihaz birleşimi, uzun isim parçaları, hesap ayrımı, bozuk önbellek, özel toplu okuma, istek sınırları ve arşivden ilerleme.

Çıkış kapıları: tüm mevcut testler, içerik denetimi, TypeScript, üretim derlemesi ve üretim Worker HTTP kontrolü. HTTP akışına yetkisiz kart okumasının reddi, gerçek sonuç, `no-store`, kullanıcı taklidi ve istek boyutu kontrolleri eklendi. Önceki destekli önizleme erişim engelini aşacak başka tarayıcı yolu denenmedi; bu tur görsel/telefon/FPS kontrolü yapılmış sayılmaz.

Yerel sonuç: **98/98 test**, **26 tahta + 520 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı; iki bağımsız oyuncuyla **154 üretim Worker HTTP kontrolü** geçti. GitHub CI ve Sites'in gerçek yayın sonucu ayrıca tamamlanmadan bu kayıt tek başına yayın kanıtı sayılmaz.

Sonraki öncelik gerçek mobil seçim ve ekran yerleşimi gözlemi; ardından yarım kalan keşiflerin bulunabilirliği hakkında oyuncu geri bildirimi. Bu değişiklik mevcut günlük iki bölümü korur; bir sonraki tarihin bölümleri yeni, değişmez kayıt olarak eklenir.

## 21 Ekim 2026 · 0.6.0

Oyuncu geri bildirimi: önceki Markdown raporu açılmadı ve sitedeki farklar anlaşılmadı. 0.5.1 ağırlıklı olarak kayıt güvenliği ve küçük kullanım düzeltmeleriydi; kapsamlı bir görsel yenileme yapılmış gibi sunulmamalı.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Yeni bölümleri görünür kılma, uygulama içinde sürüm notları | Oyuncu ne eklendiğini hemen görür ve tek dokunuşla açar. | Bu tur seçildi. Ana sayfada iki belirgin kart, gerçek sürüm etiketi, çalışan arşiv ve dosyasız yenilik penceresi. |
| Ek bölüm kayıtlarının eşitleme durumunu düzeltme | Ağ isteği sürerken bulunan kelimeler kaybolmaz; onaylanmamış kayıt için bulutta kaydedildi denmez. | Bu tur düzeltildi. İlk bulut okumasında yerel kelimeleri yükleme sırasına alma ve geç PUT yanıtına karşı üç regresyon senaryosu. |
| Dokunmatik seçim toleransını değiştirme | Dar ekranda yanlış son harf seçimini azaltabilir. | Cihaz gözlemi olmadan değiştirilmedi. Önce gerçek çapraz sürükleme ve iki dokunuş gözlemi. |
| Kozmetik keşif odası ve ortak arkadaş gizemi | Kalıcı kişisel bağ ve ortak hedef yaratabilir. | Bu tur kapsam dışında. Önce çekirdek akış, gerçek cihaz kontrolü ve mevcut keşiflerin bulunabilirliği. |

### Uygulanan kapsam

- **Ormanın minik komşuları:** Rahat, 6 × 6, dört kelime, Hayvanlar.
- **Merak laboratuvarı:** Dengeli, 8 × 8, yedi kelime, Bilim.
- Tarih/sıra numarasından türeyen sabit kimlikler ve dondurulmuş tahta JSON'ları. Dosya `content/releases/2026-10-21.json`; aynı tarihin içeriği yeniden üretilmez.
- Ana sayfanın üstünde iki geniş keşif kartı; 0.6.0 etiketli **Neler değişti?** düğmesi; güncel ve önceki sürümün gerçek değişikliklerini açıklayan okunabilir pencere.
- **Bölüm arşivi:** kaynakta yayımlanan eski bölümler kalıcıdır. Arşiv 24'lük sayfalarla yüklenir, yükleme/hata/yeniden dene ve önbellekli çevrimdışı durumları korunur.
- Yeni bölümler mevcut ek bölüm oynatıcısını ve hesaba özel `chapter_saves` kayıtlarını kullanır. İlk indirmeden sonra son 100 tahta cihazda saklanabilir. Ana ilerleme JSON'u her gün büyütülmez; yeni veritabanı şeması gerekmez.
- İlk bulut yanıtında yalnız cihazda bulunan kelimeler gönderim sırasına alınır. PUT sürerken eklenen kelimeler sunucuda onaylanana kadar kayıt durumu beklemede kalır.
- Yönetim panelinden hazırlanmış içerik, yetki, denetim günlüğü, oyuncu puanları ve mevcut harita kümeleri değiştirilmez. Kaynak bölümlerinin kimlikleri panel taslaklarına ayrılmaz.

### Yayın ve doğrulama

İlgili doğrulamalar: 11 yeni içerik, kimlik, arşiv, kayıt sahipliği ve eşitleme senaryosu; bütün mevcut regresyonlar; içerik denetimi; TypeScript; üretim derlemesi ve iki oyunculu Worker HTTP akışı. HTTP kontrolüne ana sayfadaki iki başlık, yenilik düğmesi, arşiv ve bu bölümlerde hesaba özel kayıt eklendi.

Yerel sonuç: **88/88 test**, **26 tahta + 520 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. Son üretim paketinde iki bağımsız oyuncuyla **146 HTTP kontrolü** geçti. GitHub CI ve Sites yayın sonucu ayrıca doğrulanmadan bu kayıt tek başına canlı yayın kanıtı sayılmaz.

Tarayıcı önizleme sunucusu başlatıldı ancak destekli bulut tarayıcısı önizlemeye bağlanamadı; sonraki sayfa erişimi tarayıcı güvenlik ilkesi tarafından engellendi. Başka tarayıcı yolu veya güvenlik aşma denenmedi. Görsel yerleşim, fiziksel dokunma ve FPS doğrulanmış sayılmaz. Kaynak, içerik ve HTTP kontrolleri bu sınır açıkça belirtilerek sürdürülür.

### Sonraki öncelik

Gerçek iPhone/Android üzerinde ana sayfanın ilk ekranı, arşivden dönüş, 200% metin, ekran döndürme ve çapraz seçim. Yeni mekaniklerden önce gözlenen taşma veya yanlış seçim düzeltilmeli. E-posta sağlayıcısı hâlâ bağlı değildir; yeni üyelik kabiliyeti iddia edilmez.

## Yeniden çalışma ve yarım kalan yayını sürdürme

1. Güncel Site kaynağını aç; UTC tarihine ait dosyayı ve `RELEASE_BATCHES` kaydını kontrol et.
2. O tarihin 1 ve 2 numaralı girdileri varsa yeniden üretme. Dosya tamam ama yayın yarıda kalmışsa aynı içerik/kimliklerle doğrulama, GitHub ve Sites yayın adımlarını tamamla.
3. Yalnız bir girdi hazırlanmışsa mevcut girdiyi ve tahtasını koru; eksik sıra numarasını ekle. Testler tarih başına tam iki, bir Rahat ve bir Dengeli bölüm şartını denetler.
4. Yeni tarih için yeni snapshot dosyası ekle ve `lib/studio/releases.ts` listesine bir kez kaydet. Yayımlanmış dosyaların kelimelerini, tohumlarını, kimliklerini veya tahtalarını değiştirme.
5. `pnpm content:check`, `pnpm typecheck`, `pnpm test`, üretim derlemesi ve Worker HTTP kontrolünü geçir. Sites kaynak/paketleme yardımcısını kullan; GitHub ağacını aynı kaynak ağacıyla eşleştir ve CI sonrası birleştir.
6. Sites'in başarılı yayın sonucu ve gerçek adresi son doğrulamadır. Kaynak kaydının varlığı tek başına yayın başarısı değildir. Bir sonraki çalışmada kaydedilmiş sürümü ve canlı yayını birlikte kontrol et.
