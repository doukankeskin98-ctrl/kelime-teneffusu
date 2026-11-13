# 0.51 deneyim incelemesi — sahne ve dokunma

13 Kasım 2026. Salt okunur kaynak incelemesi; yalnız bu rapor yazıldı. Tam test/cihaz kabulü yapılmadı. `workshop`, `valley`, `courtyard`, `school`, `bakery`, `square`, `garden`, `neighborhood`, `cinema` varlıkları doğrudan görüntülendi. 0.50 yerel ölçüm kanıtı yalnız karşılaştırma için okundu.

## 1. Sahne kimliği konu kimliğinden ayrılmalı

`lib/game/scene.ts:2-8` yalnız geniş `themeId` değerini kullanıyor. Yeni 20 rota sekiz tema üstüne kurulduğu için birçok farklı bağlam aynı sahile/atölyeye düşüyor. `horizons-content.ts` içindeki `themeId` değerlerini düzeltmek güvenli çözüm değildir; tahta üretimi ve içerik sözleşmesinin parçası olabilir. Sunuma özel, rota ve gerektiğinde bölüm kimliğiyle çalışan bir resolver kullanılmalı. Aşağıdaki öneriler tahta/sıra/ödül anahtarı değiştirmez.

| Rota | Şimdi | Uygun mevcut sahne / yeni varlık gereksinimi |
| --- | --- | --- |
| Çiftlik Sabahı | garden: orman deresi | Yeni çiftlik avlusu gerekir: tahıl tarlası, ambar/kümes, kiler/arıcılık ayrıntıları kenarlarda. Orman çiftlik değildir. |
| Ormanın Katları | garden | garden uygun; ağaç/orman/akarsu bütünlüğü var. |
| Göl Kıyısında | garden | valley daha uygun: geniş tatlı su, kıyı bitkileri ve dağ vadisi görülüyor. |
| Yağmurdan Sonra | harbor | garden bir ıslak orman bağlamına daha yakın, ancak görsel açık güneşli; yalnız filtreyle yağmur resmi olduğu iddia edilmemeli. İdeal sonraki varlık: yağış sonrası ıslak patika, su birikintisi ve açılan gökyüzü. |
| Dağ Evinin Yolu | harbor | valley dış mekân için uygun dağ/vadi; son ev içi bölüm yeni sıcak iç mekân sahnesine geçebilir. |
| Ada İskelesi | bosphorus | harbor daha doğru: iskele/koy/tekne bağlamı. |
| Kentin Ayrıntıları | bosphorus | square daha doğru: kent mimarisi, meydan, yaya yolu. |
| Mahalle Pazarı | bakery | bakery yalnız yakın yiyecek bağlamı; sebze pazarı değil. İdeal yeni sahne: yeşil/mor sebze tezgâhları, tartı, açık yürüyüş yolu. Bu açık kalan sanat ihtiyacı sayılmalı. |
| Fırın Sokağı | bakery | bakery doğrudan uygun. |
| Kahvaltı Sofrası | bakery | Yeni sıcak iç mekânı sofra/çay köşesiyle kullanmak daha doğru; yalnız fırın sokağı bütün hedefleri anlatmıyor. |
| Evde Bir Gün | school | Yeni sıcak iç mekân gerekli: pencere, oturma alanı, çekmece ve ev eşyaları. Okul bahçesi kesin uyumsuz. |
| Minik Bahçıvan | garden | workshop sera/saksı/bahçe gereci bağlamı nedeniyle daha uygun; garden doğal orman. |
| Fotoğraf Gezisi | workshop | square kent çekimi gezisine daha uygun, fakat son karanlık oda konusu dış mekânda kalır. İdeal iç mekân: fotoğraf masası, kamera, baskılar; yeni sanat ihtiyacı olarak açık kaydedilmeli. |
| Tiyatro Kulisi | courtyard | cinema kırmızı perde/sahne nedeniyle en yakın mevcut seçenek; fakat projeksiyon perdesi gerçek kulis değildir. İdeal tiyatro varlığı perde kenarı, kulis masası, kostüm ve ışıklarla ayrılmalı. |
| Renk ve Desen | workshop | workshop geniş sanat/üretim ailesi olarak kabul edilebilir; resim gereçleri görünmüyor. İdeal atölye varyantı: boya, palet, kumaş örnekleri kenarlarda. |
| Dokuma Evi | workshop | workshop geniş üretim ailesi olarak kabul edilebilir; dokuma tezgâhı görünmüyor. Resim/dokuma atölyesi ortak özgün sanatla güçlenebilir. |
| Deney Masası | workshop | workshop bilimsel alet/sera/mekanizma bağlamıyla mevcutlar içinde en uygun. |
| Gökyüzü Defteri | observatory | observatory doğrudan uygun. |
| Yol Kenarı Defteri | harbor | square kent/yolculuk için daha yakın; tren istasyonu/kara yolu özgün varlığı ideal. Liman kara yolu bölümünü yanlış yönlendiriyor. |
| Kışın Renkleri | harbor | Yeni kış/sıcak oda sahnesi gerekli: pencereden açıkça görünen karlı dağ/çamlar, içeride soba/şömine ve battaniye. Koyu CSS filtre sahili kışa dönüştürmez. |

En yüksek etkili iki özgün varlık: **karlı çevreye bakan sıcak ev içi** (Kışın Renkleri, Evde Bir Gün, Kahvaltı Sofrası ve Dağ Evi finaline uygun ayrıntılar) ve **çiftlik avlusu**. İki varlıkla tüm 20 rotanın birebir konu bütünlüğü çözüldü denmemeli; pazar, fotoğraf iç mekânı, gerçek tiyatro kulisi ve kara yolu sahneleri hâlâ yaklaşık olacaktır. Bunları görünür sanat borcu olarak kaydetmek, rastgele eşleşmeyi tamamlandı saymaktan iyidir.

Resolver tüm yüzeylerde kullanılmalı: `JourneyHome.tsx:28`, `Solo.tsx:185,196` ve `nextScene`, `WorldWelcome.tsx:10`, `ChapterPicker.tsx:24`, `Discovery.tsx:14,32,42`, `JourneyResult.tsx:22,25`, `BonusRound.tsx:17`, son yolculuğa bağlı ayar arka planı `App.tsx:169`. Hikâye özel sahneleri ve Arena stadyumu açıkça üstün kalmalı. Ödül ID/tema modelini sırf görsel için yeniden tanımlama; ödülün dünya kimliğinden sahne bulunabilir. Kabul: aynı rota için ana sayfa→karşılama→tahta→kutlama→albüm/harita aynı sahne dilini taşımalı; bölüm özel iç mekân varsa dönüş bilinçli olmalı. Yeni varlıklar web/offline/native paketleme listesine de girmeli.

## 2. 44 px hedef, yalnız görünmez katmanı büyüterek düzeltilmemeli

`app/focused-journey.css:36,154,164` 36 px satır ve hedef yüksekliğini koruyor; `app/arena-experience.css` 36/32 px karşı kurallar içeriyor. Önce satırın kendisi 44 px olmalı; görünmez absolute hedefi komşu satırın üzerine büyütmek daha önceki çakışmayı geri getirir. Kelime tamamlanınca hedef düğmesi kalksa bile satır yüksekliği korunmalı, aksi halde tahta/iniş hedefleri hareket eder.

Maliyet her hedef satırında +8 px: iki satır +16, üç satır +24. Önce pasif başlık/üst boşluklar ve alttaki boş durum bildirimi incelenmeli; tahta harf boyutu düşürülerek kazanım geri alınmamalı. İlk ekranda bütün kelimeleri göstermek kullanıcı beklentisi olduğundan raf kaydırması otomatik kaçış olmamalı. Tüm312 başlangıç + temsilî tamamlanmış/yarım ve uzun/kapalı hedef durumları 320×568,375×667,414×736'da doğrulanmalı; Arena düz/bilmeceli başlık+skor alanı ayrıca denenmeli. Mevcut 0.50 kanıtta tek satırlı yeni bölümlerde rafta yaklaşık58px toplam var; buna bakıp bütün eski yoğun bölümlerin de rahat sığacağı varsayılamaz.

## 3. Ölçüm kapısı konforu sertifika gibi göstermemeli

`scripts/visual/layout-measure.mjs:19,46` hedefler için36px istisna veriyor; yeni44px uygulamada bu istisna kalkmalı. `:36` 26px hücre eşiği rahat oyun kanıtı değildir. Teknik geometri hatası, mevcut bölüme göre hücre küçülmesi ve ergonomi uyarısı ayrı raporlanmalı; eşiği düşürerek geçirme yok. Hücre ölçümünde yalnız width değil min(width,height) kullanılmalı. Rapor “0 taşma/çakışma” diyebilir; “parmakla rahat/FPS iyi” sonucu cihaz girdisi olmadan çıkarılamaz.

Kabul: dokunma alanları ≥44×44 ve çakışmasız; eski başlangıç sahnesine kıyasla tahta erişilebilirliği gerilememiş; yeni rota görselleri hem tahta hem küçük albüm kırpmasında konuyu taşıyor. Gerçek iPhone/VoiceOver bu incelemede yapılmadı.
