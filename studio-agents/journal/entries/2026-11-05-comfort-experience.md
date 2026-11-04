# Hedefler ve tahta yerleşimi — dar deneyim incelemesi

Kaynak: `b759e86`, 0.35.0. Uygulama kodu salt okunur incelendi. Kullanıcının `32605B31-A1A7-46EA-9E57-88B06DC1ABAC` klasöründeki iki JPG görseli karşılaştırıldı; bu inceleme canlı WoW veya fiziksel telefon testi değildir.

## 1. Normal hedefler içerikteki tek bir uzun/bölünmüş kelime yüzünden görünmezleşiyor

- Kaynak: `lib/game/word-card.ts:8–9`, `components/game/common.tsx:94–95,108`, `app/board-first.css:27`, `components/game/Solo.tsx:145–147`.
- Kök neden: `compactWordRack`, en fazla dokuz kısa, boşluksuz, tek parçalı hedefte açılıyor. Tek bölünmüş grup veya uzun etiket tüm rafı kapatıyor; mobilde WordList gizlenip tek hedefli kart ve Tümü diyaloğu kalıyor. İkinci görselde Anadolu bölümünün hedefleri bu nedenle tek KÖPRÜ kartına düşmüş. Referans görselinde konu ve bütün hedefler tahta üstünde birlikte okunabiliyor.
- Aynı alanda tamamlanan grup sayısı (`2/6`), etkin hedefin liste indeksi (`Kelime 3/6`) ve `Hedefin: KÖPRÜ` tekrarı var. Sayım hesabı yanlış değil; iki ayrı anlam aynı ilerleme diliyle sunuluyor.
- En küçük çözüm: Normal oyunda grup temelli hedef rafını uzun/bölünmüş kelimeler için de koru; gerektiğinde etiketi dengeli satırlara böl. Tek tamamlanma göstergesi kalsın; normal moddaki Hedefin/kart indeksi tekrarını kaldır. Konu başlığı bölümden gelmeye devam etsin; hedef değiştikçe bölüm konusu değişmesin.
- Kabul: Anadolu15 gibi bölünmüş hedefli bölümde bütün hedef grupları birlikte görünür; bir parçayı bulmak grubu tamamlamaz; diğer parça okunur/örtülü durumunu korur. Odak ve ipucu aynı kalan gruba gider. Tümünü görmek için hedefler arasında dolaşmak gerekmez. `data-word-group`, `data-word-label`, `data-word-part` animasyon hedefleri korunur.

## 2. Bilmecede tek kart tüm bulmacanın yapısını saklıyor

- Kaynak: `lib/game/word-card.ts:9`, `components/game/common.tsx:40–60,64–80`, `app/board-first.css:27–35`, `app/continuous-play.css:35–36`.
- Kök neden: `clues` mevcutsa raf koşulu daima false. Tam liste diyaloğuna girmeden kaç hedefin kaldığı, hangi sıra üzerinde çalışıldığı ve diğer hedeflerin uzunluğu birlikte görülemiyor. Diyalogda tüm uzun ipuçlarını göstermek de oyundan ayrı bir okuma ekranı yaratıyor.
- En küçük çözüm: Bütün gruplar için sabit numara ve harf sayısı içeren kısa seçilebilir slotlar, bunların altında tek etkin ipucu. Bulunan grupta cevap görünür; kalan grubun cevabı ve baş harfi kurallara göre gizli kalır. Hedef değiştirme yalnız sunumu/odak ipucunu değiştirir.
- Kabul: Normal hedef rafıyla aynı konum ve tamamlanma dili kullanılır. Slot numarası `Tanım 3` gibi sıra olarak okunur; ikinci bir `3/6` ilerleme sayacı olmaz. Etkin ipucu kesilmeden okunur; uzun ipucu tüm ipuçlarını üst üste açmaz. Gizli cevap erişilebilir ad, title veya yeni slot etiketiyle sızmaz. Pause, yardım, sonuç ve sunucu bekleme sırasında odak/slot etkileşimi mevcut engelleme sözleşmesini korur. Grup/Arena aynı bulmaca ve aynı hedef sırasını korur; ekran ölçüsü içerik üretimini değiştirmez.

## 3. Tahta sahnesi, kare tahtadan uzun hesaplanıp ortalanıyor

- Kaynak: `lib/game/viewport.ts:50–58,72–73`, `app/viewport-arena.css:8,38`, `app/scenic-journey.css:81`.
- Kök neden: Tahta genişlikle sınırlanırken `stageHeight` kalan ekran yüksekliğinin tamamı. Grid center hizası bu yüksek alanın ortasına yerleştiriyor. İkinci görselde hedef kartı ile ilk tahta satırı arasındaki geniş boşluk bu kaynak davranışıyla uyumlu.
- En küçük çözüm: Portrait oyun tahtasını rafın hemen altında üst hizala; artan yüksekliği tahta üstüne bölüştürme. Fit hesabının gerçek HUD/raf/kontrol ölçümleri, okunaklı minimumu ve çizim sırasında düzeni sabitleme koruması kalsın. Kontroller board altıyla tutarlı bir ilişki kursun.
- Kabul: 360 ve 414 genişlikte normal/bilmece/Arena önizlemelerinde ilk ve son satır görünür; 320×568 ve kısa Safari görünür yüksekliğinde açıkça sınır kontrolü yapılır. Uzun hedef, ipucu, döndürme ve bulunan sözcük değişimi tahtayı gereksiz aşağı kaydırmaz. Sürükleme devam ederken resize fit uygulanmaz; pointer bırakma sonrası hesap güncellenir. Harfleri küçültmek veya zorunlu zoom çözüm değildir.

## Koruma ve doğrulama sınırı

Kimlik, hedef içeriği, tahta/tohum, kayıt, ödül, tekrar engeli ve Arena ortak içerik sözleşmesine dokunulması gerekmiyor. Mevcut 720 ms uçuş / 180 ms iniş / 1040 ms final sırası, hedef uçuş metadatası ve haptics korunmalı. Hikâyenin kasıtlı tek adımlı hedef akışı normal çok hedefli bölümle karıştırılmamalı (`Solo.tsx:136–139`).

Bu tur uygulama dosyası değiştirilmedi, test veya tarayıcı çalıştırılmadı. Fotoğraf gözlemi ile kaynak çıkarımı yukarıda ayrıldı; yeni düzenin görsel kabulü koordinatörün mobil önizlemesini bekliyor.

## Son dar inceleme — uygulama sonrası

İncelenen kanıt: çalışma ağacı diffi ve `app/play-comfort.css`; koordinatörün `world-review/0.36.0/anadolu-phone.jpg` (430×932, bildirilen safe inset 59/34) ve `riddle-414.jpg` önizlemeleri. İki görüntüde hedef alanı ve tahta bitişik, tahta bütün satırlarıyla görünür. Anadolu örneğinde altı grup aynı rafta; 2/6 tamamlanma tek sayaç. Dört slotlu bilmece örneğinde etkin ipucu okunur. Fiziksel telefon veya canlı WoW ölçümü değildir.

### Açık bulgu 1 — açıklama ve eylem geri bildirimleri gizleniyor

- `app/play-comfort.css:7`, `components/game/Solo.tsx:146`: Alıştırmanın ilk çizim açıklaması, `veilInstruction` ve `FIRST_TEN_LESSONS` hâlâ üretiliyor, fakat yalnız `message` state'i `has-notice` alabiliyor. Yeni genel görsel gizleme bu ilk karşılaşma açıklamalarını büyük ekranlarda da saklıyor. Bu, yinelenen Hedefin satırını kaldırmaktan daha geniş bir değişiklik.
- Kısa ekranlarda ikinci cascade sorunu var: `app/scenic-journey.css:111` içindeki `clip-path:inset(50%)!important` ve `padding:0!important`, yeni `has-notice` stilinin normal öncelikli `clip-path:none` ve padding'ini bastırıyor (`app/play-comfort.css:8`). Böylece ipucu kullanımı veya yanlış seçim açıklaması da 700px altındaki görünür yükseklikte görünmez kalır.
- Hikâyede `StoryHud` notice/reveal metni aynı `<p role="status">` üzerinde; `app/play-comfort.css:66` bunu bütünüyle `display:none` yapıyor. Kısa ekranda “Bu kelime birazdan”, ücretsiz ilk ipucu açıklaması ve bulunan kelimenin sahneye etkisi kaybolur (`components/game/StoryExperience.tsx:34`).
- En küçük çözüm: Gerçek yönerge/eylem bildirimi için açık bir sunum sınıfı ayır; bunu tüm yüksekliklerde görünür kıl. Sıradan tekrar/success metni sessiz kalabilir. Story notice bilgisini gizlenen dekoratif anlatıdan ayır.
- Kabul: İlk alıştırma, ilk örtülü hedef, normal ipucu/yanlış seçim ve hikâyede erken seçilen sonraki kelime için oyuncuya görünen açıklama bulunur. 360×640 ve 414×628 görünümünde notice rect'i 1px/kırpılmış olmaz; tahtayı veya kontrolleri kapatmaz.

### Açık bulgu 2 — dokuz bilmece hedefi küçük telefonda dar tek satıra sıkışıyor

- Kaynak: `common.tsx` MobileTargets `--clue-count:Math.min(groups.length,9)`; `app/play-comfort.css:26–29`.
- Dokuz hedef için dokuz eşit kolon zorunlu. 360px ekran, 8px dış kenarlar, 8px iç kenarlar ve 3px aralıklarla yaklaşık 34px slot genişliği kalır; 44px yalnız yükseklik için uygulanmış. Dört slotlu sağlanan görsel bu Arena durumu için kabul kanıtı değil.
- En küçük çözüm: Dar ekranda numaralı slotları hedef genişliğini koruyarak iki kısa satıra dağıt; harf sayısını küçülterek sığdırma. Slotların sırası ve ortak Arena içeriği aynı kalsın.
- Kabul: Dokuz hedefli Arena/bilmece 360 ve 414px genişlikte okunur ve isabetli seçilebilir; ilk/son tahta satırı ile oyun kontrolleri aynı önizlemede görünür. Aktif slot/harf sayısı/çift puan göstergesi üst üste binmez.

Kaynak kabulü: Hikâye `earlyTargets` ayrı geçiriliyor ve yalnız mevcut adımı kapsıyor; tüm slotları sunmak ilerideki cevapları erken kabul etmiyor. Normal rafta gizli/bölünmüş hedeflerde ikinci parçanın baş harfi ayrıca açılmıyor. Kelime uçuşu gerçek etiket içindeki boşlukları atlayıp ölçüyor; eski süre sabitleri ve kayıt/ödül hesapları değişmemiş. Yardım/sonuç durumunda ortak `targetsUnavailable` uygulanıyor. Yeni kaynak/test/browser değişikliği yapmadım; yalnız atanmış bu günlük güncellendi.

## Kapanış — görünür yönerge düzeltmesi ve dar Arena sınırı

- Bulgu 1 kaynakta giderildi: `Solo.tsx:146` ilk çizim/örtülü hedef/ders açıklamasına `is-guidance` veriyor. `play-comfort.css:9` guidance ve gerçek notice'ı HUD içinde sabit boyutlu katmanda gösteriyor; `clip-path:none!important` ile eski kısa ekran gizlemesi aşılmış. Hikâye reveal/notice satırı 32px yüksekliğini koruyor; kısa ekran `display:none` kaldırılmış. Koordinatör ayrıca 320px önizlemede hikâyeyi tamamlayıp Sonraki bölüm eylemini gördüğünü bildirdi; bu tarayıcı kontrolünü ben tekrarlamadım.
- Bulgu 2 bir yerleşim tercihi ve açık kabul sınırı olarak korunuyor: Koordinatörün 320px Arena ölçümü dokuz slot için **29.35×44px**, tahta için **265px**. İkinci slot satırı tahtanın asgari yüksekliğini zorladığından tek satır bırakılmış; büyük etkin ipucu/tam liste düğmesi alternatif erişim sağlıyor. Bu, dar slotların fiziksel parmakla isabetli seçildiği anlamına gelmez. **Gerçek telefonda dokuz slotlu Arena için fiziksel parmak kabulü henüz doğrulanmadı**; geniş hedef kullanımıyla eşdeğer rahatlık iddia edilmemeli.

Bu kapanış yalnız belirtilen kaynak düzeltmelerini doğrular ve koordinatörün ölçümünü kaydeder; yeni test, tarayıcı veya geniş inceleme yapılmadı.
