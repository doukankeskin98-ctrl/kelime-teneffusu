# 2 Kasım 2026 · Profesyonel oyun döngüsü / deneyim incelemesi

Salt okunur uygulama incelemesi; taban Sites 41e57965da229c832f510e6de5ac43d54c2acedc, 0.23.3. Kullanıcı WoW Search incelemesindeki kullanılabilirlik, ilerleme ve içerik yeniliği önerilerini uygulamamızı; eski kayıtları korumamızı istedi. Kaynaklar ve deneyim rolü okundu. Uygulama/test koduna, tarayıcıya veya canlı veriye müdahale edilmedi. Aşağıdaki ürün faydaları tasarım varsayımıdır; kullanıcı testi veya fiziksel cihaz ölçümü değildir.

## 1. Normal hedeflerin hepsini tek kartın arkasına saklama

- Kanıt: `components/game/common.tsx:31-51,96`, `app/board-first.css:27-34,51`. Portrait görünümde birden fazla hedef içeren bütün listeler gizleniyor; normal kelimeler de bilmeceler gibi önceki/sonraki düğmeli tek karta dönüşüyor. Kısa kelimelerde oyuncu tahtada gördüğü başka bir kelimenin hedef olduğunu anlamak için kart değiştirmek veya pencere açmak zorunda.
- Öneri: Normal kısa hedeflerde kompakt, satıra saran kelime rafı; bulunan hedefte çizgi ve onay işareti. Uzun/multipart/çok sayıda hedef ve bilmecelerde mevcut okunur tek-kart + tam-liste akışını koru. Sunum seçimi içerik uzunluğuna göre yapılabilir; tahtanın içeriği ekran genişliğine göre değişmemeli. Tek harf kutuları/kalın kart chrome'u ekleme.
- Etki/kanıt/maliyet/risk: Yüksek kullanılabilirlik fırsatı, doğrudan CSS ve bileşen kanıtı, orta uygulama maliyeti; asıl risk hedef satırlarının tahta alanını yeniden tüketmesi. `attachPlayFit` ölçümünü koru, kısa ve uzun listeleri ayrı görsel kabul et.
- Kabul: 360×568 ve 414×622 görünümde 6–7 kısa normal hedef okunur, tahta bütün satırları görünür, yatay kaydırma gerekmez. Bilmecede tek tam ipucu ve 44px kontroller korunur. Arena listesi yalnız onaylı strokes kullanır; bekleyen seçim hedefi tamamlandı göstermez. Büyük yazı/legacy uzun isimler tam-listeden okunur. Yerleşim değişimi mevcut sürüklemeyi bozmaz.

## 2. Yeniden açılışta oyuncunun gerçek devam yolunu görünür tut

- Kanıt: `components/game/App.tsx:45`, `components/game/JourneyHome.tsx:14-16,23-25,28-30`, `components/game/StoryExperience.tsx:22-28`, `lib/game/main-journey.ts:29-36`. Uygulama her yeniden açılışta `stories` görünümüne dönüyor. Ana yolculukta gerçek yarım kaydı doğru bulan mevcut kural olsa da onun devam kartı gizli panelde. Hikâye rafı tüm beş hikâye bitince ilk hikâyeye dönüyor. Bu, sunucudaki tekrar engeli çalışsa bile “yine aynı oyunlar” algısını güçlendirebilir; Arena tahsis hatası olduğuna kanıt değildir.
- Öneri: Ana girişte gerçek kayıttan türetilen tek belirgin devam/yeni bölüm eylemi; seçilen hikâye/yolculuk yüzeyini cihazda kalıcı tercih olarak koru veya son geçerli oyun türünden türet. Biten hikâye kümesinin ana eylemini açık yeni yolculuk/keşfe yönlendir; bitmiş oyunlar ayrı ve açık “yeniden oyna” eyleminde kalır. Eski bölümün tahtası/kimliği değiştirilmez. Yarım oyuna dönmek ilerlemeyi korumak için aynı tahtayı açmalıdır; yeni oda ve yeni bölüm seçimi bundan ayrı tutulur.
- Etki/kanıt/maliyet/risk: Yüksek görünür süreklilik, doğrudan başlangıç state'i kanıtı, düşük/orta maliyet. Risk hesaplar arasında yanlış devam kartı veya yükleme sırasında erken tercih yazılması; mevcut hesap/ready sınırları korunmalı.
- Kabul: Ana yolculukta yarım kayıt → geri çık → tam reload, aynı kayıt görünür devam eyleminde. Tamamlanmış bölüm sıradaki yeni bölüm yerine ana öneri olamaz. Hikâye/yolculuk arasında seçim → reload tercih korunur. Beş hikâye bitince başlangıç hikâyesi “yeni” diye önerilmez. Hesap değişiminde diğer hesabın devam kartı sızmaz.

## 3. Öğreticiyi erken çıkışta tamamlanmış sayma; başlangıçta erişilebilir yap

- Kanıt: `components/game/App.tsx:78` öğreticiden her geri dönüşte `tutorialDone:true` yazıyor. Buna karşılık `components/game/Solo.tsx:75` zaten yalnız gerçek tamamlama için bu alanı yazıyor. `components/game/JourneyHome.tsx:36` öğretici erişimini sadece yolculuk panelinin altına koyuyor; varsayılan hikâye panelinde görünmüyor. `lib/game/content.ts:57` mevcut öğretici üç kelimeli 6×6, eski tahta ve kimlik değişimi gerekmiyor.
- Öneri: Erken geri dönüşün tamamlandı yazımını kaldır; gerçek tamamlama Solo'daki mevcut yol üzerinden sürsün. Yeni oyuncuya ana eylem yakınında küçük, isteğe bağlı “Birlikte deneyelim” erişimi sun. Mevcut FIRST_TEN_LESSONS ve üç kelimeli öğreticiyi kullan; yeni zorunlu modal veya onboarding motoru ekleme. İlerleyen oyuncuya tekrar zorla gösterme.
- Etki/kanıt/maliyet/risk: Somut akış kusuru, düşük maliyet/düşük veri riski. Mevcut true kayıtlar geri alınmamalı veya topluca yeniden yazılmamalı.
- Kabul: Sıfır/tek kelime bulunmuş öğreticiden çıkış tamamlandı sayılmaz; üç hedefi bulmak kalıcı tamamlanma verir; daha önce true olan kayıt true kalır. Öğreticiye ana görünümden ulaşılır ve mevcut oyun kaydı silinmez. İlk hedefin işareti, iki uca dokunma ve çapraz seçim korunur.

## Ortak doğrulama sınırı

Kaynak incelemesi görsel kalite, gerçek parmak hassasiyeti, Safari motoru, ses/titreşim veya oyuncu tutma ölçümü değildir. Normal/İpucu Avı/Arena hedef sunumu, reload/hesap sınırı ve öğretici tamamlanma için hedefli kabul; ardından projedeki içerik, tip, üretim build, Worker ve CI kapıları gerekir. Oyunun mevcut görsel kimliği, kayıt v2, eski board snapshotları, ödüller, günlük içerik ve rekabet kuralları korunmalıdır.
