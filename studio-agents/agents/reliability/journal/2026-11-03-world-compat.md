# 2026-11-03 · Dünya akışı ve gizli hedefler uyumluluk incelemesi

Kapsam: uygulama salt okunur; bu günlük dışında değişiklik yok. İnceleme, 0.25.0 kaynağının hedef sunumu / devam önerisi üzerine yapılmıştır. Aşağıdakiler henüz uygulanmış yenilemede doğrulanmış hata değil, somut mevcut çağrı noktalarıyla desteklenen değişiklik riskleridir. Geniş test, canlı veri ve cihaz testi çalıştırılmadı.

## 1. Gizleme kararı kayıt varlığına bağlanırsa yeni oyun yeniden girişte cevabını açar

Kaynak: `components/game/Solo.tsx:35–47`, `lib/game/progress.ts:6–10,42–55`. Solo başlangıç kaydını `previousBest` içinde tutar, normal oynama ise aynı kayıt anahtarını yazmaya devam eder. `cleanSave` yalnız tanımlı kayıt alanlarını üretir.

Tetikleyici: yeni bir bölümde maskeli hedef oynanır; süre/çizgi kaydedilir; oyuncu çıkar ve döner. “Eski kaydı varsa görünür göster” koşulu yeni kaydı da eski sayar. Oyuncunun kayıtlı çizgileri doğru kalsa bile bulmacanın gösterim kuralı oturumlar arasında değişir.

Öneri: `chapterId` ve sabit hedef grup sırasından hesaplanan saf, deterministik bir sunum profili kullanın. İlerleme sayısı, ekran ölçüsü, saat, rastgelelik veya `previousBest` varlığı profili değiştirmesin. İlk bölümler tam metin; sonraki aşamada belirli gruplar ilk harf; daha ileride belirli gruplar yalnız uzunluk/boşluk. Bulunan hedefin cevabı açılır. Mevcut kayıt şeması, tahtalar ve puanlar aynen korunabilir. Eski yarım oyunun görünür metnini de aynen korumak ayrıca istenirse bunu açık sürüm metadatasıyla kalıcı hale getirmek ve normalize/birleştir yollarından geçirmek gerekir; yalnız başlangıç ref'i bu ayrımı sağlayamaz.

Kabul: aynı bölümün boş, kısmi, serialize/load sonrası ve farklı ekran boyutundaki maskeleri bulunan hedefler dışında aynı kalır. İki sekmede bulunan kelime birleşince yalnız o hedef açılır. Grid/placements/save anahtarları önceki fixture ile aynıdır; yeniden oynama en iyi sonucu düşürmez ve yeni ödül üretmez.

## 2. Bir görünümü maskelemek yan mesajlarda ve parçalı adlarda cevabı açık bırakır

Kaynak: `lib/game/word-card.ts:7–10`, `components/game/common.tsx:40,52,63–75`, `components/game/Solo.tsx:127,139`. `wordCardCopy` hem görünen metni hem liste/odak düğmesi ARIA metnini besler; ancak mobil ve masaüstü parçalı adlarda ayrıca ham `t.text` yazılır. Solo etkin hedef durum satırı aynı helper'ı ayrı çağırır.

Öneri: maske profilini `WordListData` ile aktarın ve ortak sunum helper'ında çözün. Mobil kart, liste, modal, odak düğmesi, Solo “Hedefin” mesajı aynı kopyayı kullansın. Maskeli cevapları CSS ile görünmez yapmak yerine maskeli metni üretin. Erişilebilir ifade örneği “M ile başlıyor, 4 harf”; tam gizlide “Hedef 3, 5 harf”. Çok parçalı grupta ya tüm parçalar ortak kuralla ayrı maskelensin ve bulunan parça açılsın ya da bu grupların baştan görünür olması açık bir tasarım kararı olsun. İlk parçanın `label` alanı tüm adı taşıdığı için kısmi buluş tüm etiketi açmamalı. Bilmecelerde mevcut gerçek tanım önceliği korunmalı.

Kabul: `tests/word-access.test.ts` gerçek bileşen harness'iyle mobil kart / açık liste / odak etiketi / Solo durum mesajının hiçbiri bulunmamış maskeli cevabı vermez; bulunan cevap bütün yüzeylerde açılır. Türkçe İ/I/Ş/Ğ, boşluklu iki parçalı ad, kısmi bulunmuş grup, bilmece ve tam gizli hedef test edilir. Salt odak/listeler/save/ipuçları/süre değişmez. Arena görsel yenilemesi kişiye göre gizleme eklemez; mevcut ortak `room.board` ve `room.clues` bütün katılımcılar için aynıdır.

## 3. Dünya içinde devam önerisi, eski erişim ve ödül sayacıyla aynı rotayı izlemeli

Kaynak: `lib/game/main-journey.ts:5–40,44–56`, `lib/game/discovery.ts:28–34,60–63`, `components/game/Solo.tsx:124–125`, `tests/main-journey.test.ts:18–53,59–74`. İlk 18 global numara dünyalar arasında iç içe; `nextMainChapter` en erken global eksiği seçer. `nextJourneyAfter` zaten mevcut dünyayı önce tamamlar. Mevcut bonus erişimi `mainJourneyChapters` içinde daha önce başlamış eski kaydı ayrıca korur.

Öneri: sabit `MAIN_JOURNEY_IDS` ve global numaraları değiştirmeden Home/Solo devam önerisinde dünya önceliği kullanın. Gerçek son yarım bölüm daima önce gelsin; ardından geçerli son dünyanın açık eksikleri, sonra açık diğer dünyalar. Dünya içi 1/6 ve konu ana başlık olsun; global numara gerektiğinde ikincil kalabilir. Eski 3/5/6 açılma koşulları ve eski başlamış bonus istisnası aynen kalsın. `nextMainMilestone` eski global sıralamayı simüle ettiğinden yeni CTA ile kullanılacaksa aynı öneri yoluna uyarlanmalı veya yalnız mevcut dünyanın gerçek eksik parça sayısı gösterilmeli.

Kabul: uzay-3 bittiğinde Türkiye erişimi açılır ama ana devam uzay-4'tür; beşinci normal bölümden sonra mevcut bonus, bonus bitince yeni dünya gelir. Eski turkiye-kartpostal kaydı sadece süre/ipuçları içeriyorsa bile devam edebilir. Boş sıfırlı bonus kaydı kilidi açmaz. Arşiv/standart oyun ana yolculuk son bölümünü ele geçirmez. Bütün 96 bölüm bittiyse sahte yeni içerik veya ödül gösterilmez. `tests/main-journey.test.ts` kimlik/tahta/gate korumaları tutulur; yalnız yeni sunum rotası için ayrı kabul testleri eklenir.

## Uygulama sonrası salt okunur inceleme

Koordinatörün çalışma ağacındaki `world-presentation.ts`, `main-journey.ts`, `word-card.ts`, `common.tsx` ve `Solo.tsx` incelendi. İki somut düzeltme:

1. **P1 — Parçalı gizli hedef başarı mesajında erken açılıyor.** `components/game/Solo.tsx:111`: tek bir alt parçanın kabulünde hem `setFoundWord` hem `setMessage` bütün `target.label` değerini kullanıyor. Gerçek örnek `uzay-5` içindeki gizli `KARA DELİK`: yalnız KARA bulununca henüz bulunmayan DELİK de başarı animasyonu / status satırında açılıyor. Grup tamamlanana kadar yalnız `target.text` veya “Bir parça bulundu” gösterilmeli. Kabul: ilk parça çizilince kalan parçanın cevabı toast/status/ARIA içinde bulunmaz; son parçayla tam ad açılır.
2. **P2 — Tamamlanan parçalı hedefin harf sayısı boşluğu sayıyor.** `components/game/common.tsx:73` içinde fallback uzunluk hesabı `replace(/\\s/g,'')` kullanıyor; bu regex boşluğu temizlemez. `wordCardCopy` maskeli ve bulunmamış hedefte doğru sayımı üretse de hedef tamamlanınca `detail` kalkar ve bu fallback çalışır. Örneğin KARA DELİK bulunmadan önce 9, tamamlandıktan sonra 10 harf gösterilir. Aynı helper'daki doğru `/\s/g` hesabını kullanın. Kabul: Türkçe iki parçalı adın tamamlanmadan / tamamlandıktan sonra harf sayısı aynıdır.

Diğer kontrol sonucu: profil artık bölüm / grup sırasından saf hesaplanıyor; yeniden girişte kayıt varlığından etkilenmiyor. Ortak liste, mobil, odak ve Solo etkin hedef kopyaları maskeyi alıyor. Ana devam dünya önceliğine geçti; mevcut erişim helper'ı ve eski başlamış bonus istisnası korunuyor. Menü normal oyunda duraklatıyor ve yalnız kendisinin başlattığı duraklamayı geri alıyor; günlük oyunun süresini durdurmuyor. Bu sonuç kaynak incelemesidir; test/cihaz doğrulaması yapılmadı.
