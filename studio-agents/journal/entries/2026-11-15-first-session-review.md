# 15 Kasım 2026 — İlk oyun akışı, dar kaynak incelemesi

Taban: 0.52.0 / `6a5c9e1`. Oyuncu deneyimi uzmanı; uygulama koduna dokunulmadı. Test/derleme/tarayıcı/telefon çalıştırılmadı. Aşağıdakiler kaynak ve mevcut test kapsamından çıkarılmıştır; görsel etkiyi koordinatörün mobil önizlemesi doğrulamalıdır.

## 1. Öğrenme bitse de rehber ve ek Tamam eylemi kalıyor

**Kaynak:** `lib/game/journey-presentation.ts:14`, `lib/game/first-play.ts:8–14`, `components/game/Solo.tsx:64–76,166,198`, `components/game/FirstPlayGuide.tsx:4`, `app/scene-continuity.css:46–52`.

İlk iki gerçek sunum tahtası yalnız düz yönler kullanır. İlk düz kelime kabul edilince `firstPlayStep` hedefi olmayan step3 döndürür. `Solo` bunu hâlâ gerçek rehber olarak tutar; rehber ancak oyuncu Tamam'a basarsa veya bölüm tamamlanırsa kapanır. Üstte en az 58 px (dar ekranda64 px) öğretici alan kalır. `onTurn={!daily&&!guide?...}` nedeniyle öğrenme hedefi bitmiş olsa bile Çevir de yoktur.

**Oyuncu etkisi:** Oyuncu başarılı seçim yapmışken ikinci bir onay istenir; tahtaya ayrılabilecek alan ve doğal oyun kontrolleri geri gelmez. Bunun fiziksel rahatlığa etkisi henüz ölçülmedi.

**En küçük öneri:** Hedef kalmadığında rehberi otomatik bitir; istenirse başarıyı kısa tek metinle bildir, ayrı Tamam koşulu koyma. Çizim anında yerleşim sıçramasını önlemek için bitişi aktif sürüklemenin sonuna bağla ya da mevcut satırın sınırları içinde kısa geçişle yap. `guideDone` yalnız gösterim tercihi; tutorialDone, yıldız, ipucu veya kayıt koordinatlarına dokunma. Açıkça açılan alıştırma kendi rehberini koruyabilir.

**Hedef kabul:** Gerçek `presentationBoard(journeyBoard(...),'route:uzay-1')` ile ilk doğru kelime sonrası çizim kabulü anında kalır; el ve rehber en geç güvenli hareket sonunda çekilir; Çevir geri gelir; kalan üç kelime ve sonuç/sonraki bölüm aynı kayıtla çalışır. Yanlış seçim rehberi tamamlamaz. Atla tercihi yenilemede korunur. 320 px ve375 px görüntüde tahta yer değiştirmesi kontrol edilir.

**Mevcut test boşluğu:** `tests/first-play-navigation.test.ts:8–9` kanonik eski ilk tahtanın düz→çapraz sırasını test ediyor; oyuncunun artık gördüğü hazırlanmış ilk tahta farklı. `tests/word-access.test.ts:223–233` yalnız ilk step1'i ve en son tamamlanmayı kontrol ediyor, ilk başarı sonrasındaki ara durumu kontrol etmiyor. Eski kanonik testi silmek yerine gerçek sunum ve ara davranış kabulü eklenmeli.

## 2. Açık oturumdaki rehber, sonradan gelen rehberi kapatma tercihini izlemiyor

**Kaynak:** `components/game/Solo.tsx:64–71`, `components/game/useCloudProgress.ts:15–19`, `components/game/App.tsx:94,152`.

`guideAtStart` yalnız mount'ta hesaplanır. Açık Solo'ya bulut eşitlemesiyle `progress.guideDone=true` geldiğinde, aynı sahip/run için Solo yeniden mount olmaz ve `guideSkipped` de false kalır. Bu nedenle başka oturumda kapatılmış öğretici bu oturumda görünmeye devam eder. Kod üzerinden tekrar üretim: boş kayıtla ilk Solo'yu aç → aynı props/run ile yalnız progress.guideDone'ı true yap → guide hesaplaması hâlâ step1 döndürür.

**Oyuncu etkisi:** Kayıt kaybı değil, geç eşitlenen mevcut tercih için sunum tutarsızlığı. Yeni cihazda ilk hesap eşitlemesi beklenirken görülebilir.

**En küçük öneri:** Ana yolculuk rehberinin görünürlüğünde canlı `progress.guideDone` / `tutorialDone` tercihlerini de dikkate al. Explicit `config.tutorial` açılışını bu tercihle kapatma. Genel `needsFirstPlayGuide(progress)` fonksiyonunu her render'da körlemesine kullanmak aktif ilk oyundaki bir vuruştan sonra bütün rehberi istemeden değiştirebilir; ilk bulguyla birlikte kontrollü bitiş tasarlanmalı.

**Hedef kabul:** Aynı Solo örneğinde geç guideDone=true/tutoralDone=true → rehber kapanır; false/boş başka güncelleme rehberi geri açmaz; explicit alıştırma yine rehber gösterir. İlerleme/puan/tahta hiçbir şekilde sıfırlanmaz.

## Kapsam dışında bırakılanlar / yanlış pozitifler

- Yardım altındaki genel yön satırı kaynakta var ama viewport CSS'i gizliyor; görünür bir ilk bölüm sorunu olarak raporlanmadı.
- Mevcut oyuncuda kayıtlı stroke/hint/complete ve guideDone başlangıç filtreleri zaten var. Yeni genel onboarding ekranı, zorunlu hesap, ekonomi veya içerik revizyonu önermiyorum.
- Gecikmiş genel bulut ilerlemesinin aktif Solo ile birleşmesi daha geniş senkronizasyon konusudur; bu dar incelemede veri kaybı iddiası veya kapsamlı düzeltme önerisi yapılmadı.

Öncelik: önce1;2 aynı rehber yaşam döngüsünde küçük ek koruma. Gerçek yeni oyuncu gözlemi yapılmadığı için retention veya memnuniyet artışı sayısı verilemez.

## Uygulama sonrası dar kaynak kontrolü

Koordinatörün değişen rehber akışı yeniden okundu: hedefi kalmayan rehberin kapanması, güncel guideDone/tutorialDone tercihi ve explicit alıştırma istisnasında ek bir davranış sorunu bulunmadı. `attachPlayFit` aktif çizimde ölçümü ertelediğinden yalnız rehber taşındı diye sürükleme geometrisinin bozulduğu iddia edilmedi. Sonuç başlığındaki odak çerçevesinin `:not(h2)` ile ayrılması etkileşimli kontrollerin mevcut klavye çerçevesini koruyor. Bunlar kaynak düzeyinde sonuçtur; mobil görünüm koordinatörde.

Bir regresyon riski koordinatöre iletildi: `Solo.tsx:195` içindeki `className={guide?'sr-only':'play-notice'}` rehber açıkken tüm notice'ı gizliyor. İlk kelimeden önce İpucu kullanımı (`Kelimenin ilk harfi burada.`) veya 1–2 harf eksik seçim (`… harfine kadar kaydır.`; `word-card.ts:51–66`) böylece görünür yönlendirme vermiyor. Tekrar eden genel eğitim metnini gizlemek yeterli; anlamlı explicit ipucu/yakın ıskalama mesajını mevcut rehber cümlesinde ya da mevcut tek satırda görünür tutmak önerildi. Ek panel gerekmiyor.

Bu ikinci kontrol sırasında da test, derleme, tarayıcı veya cihaz çalıştırılmadı; uygulama dosyası değiştirilmedi.
