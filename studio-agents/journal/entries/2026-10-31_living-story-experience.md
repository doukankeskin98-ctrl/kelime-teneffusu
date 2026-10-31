# Yaşayan hikâyeler · oyuncu deneyimi incelemesi

31 Ekim 2026. Salt okunur kaynak incelemesi; uygulama/yayın koordinatördedir. Bu dosya içerik ve kabul önerisidir, uygulanmış veya gerçek oyuncuda doğrulanmış sonuç değildir.

## Kaynak ve kapsam

- `components/game/JourneyHome.tsx:13–34`: tek bölüm eylemi, sahne, yakın yol, koleksiyon hedefi ve mevcut İpucu Avı rafı. Yaşayan hikâye ana girişini mevcut ana96'yı gizlemeden burada sunmak mümkün.
- `components/game/JourneyScene.tsx:3–19`: mevcut premium yeşil/krem/altın SVG diorama dili; benzersiz SVG kimlikleri ve dekoratif sahnenin metinsel ilerlemeden ayrılması korunmalı.
- `components/game/common.tsx:30–43`: tamamlanmış hedef ve gizli bilmece yüzlerinin ayrımı. Hikâyede yalnız güncel ipucu görünmeli; sonraki cevaplar metne/erişilebilir ada açığa çıkmamalı.
- `components/game/JourneyResult.tsx:10–21`: gerçek kazanım/tekrar ayrımı; yeni hikâye albümü de gerçek tamamlanmadan türetilmeli.
- `lib/game/riddle-content.ts:1–89`: önceki 32 bölümün kimlik/cevapları değişmez; yeni authored hikâyeler ayrı kimlik alanı almalı.
- `lib/game/engine.ts:36–39`: authored tahta en az6, en fazla13; kelime en az2 harf. AY uygundur; TELESKOP için tahta en az8 gerekir.

## Beş authored hikâye

Her satır bir doğru kelime ve onun kabul edilmesiyle gerçekleşen sahne değişimidir. İpucu aktif kelimeyi tanımlar; önceki satırın değişimi sonraki satıra bağlam verir. Önerilen ölçüler yerleşim denetiminden geçmeden kesin içerik sayılmaz. İlk bölüm dört hedefle, sonraki bölümler beş hedefle derinleşir.

### 1. Fenerin Işığı · dünya/kıyı · 6×6 · dört adım

Giriş: “Küçük bir kıyı kasabası uykuya dalıyor. Son teknenin yolunu aydınlatalım.”

| Kelime | Kısa ipucu | Kabul sonrası sahne |
| --- | --- | --- |
| KIYI | Denizin karaya dokunduğu yer. | Kumluk ve kayalar belirir; suyun kenarı görünür. |
| FENER | Gece gemilere ışıkla yol gösteren yapı. | Kule belirir; yumuşak ışık denize uzanır. |
| YELKEN | Rüzgârı tutup tekneyi ilerleten bez. | Küçük teknenin yelkeni açılır. |
| LİMAN | Teknelerin yanaştığı korunaklı durak. | İskele ve sıcak ışıklar tamamlanır; tekne yerine yerleşir. |

Final: “Işık yandı. Küçük tekne evine döndü.” Kalıcı hatıra: **Kıyıdaki ışık**.

### 2. Ormanın Uyanışı · hayvanlar/doğa · 7×7 · beş adım

Giriş: “Ormanın küçük açıklığında yeni bir hayat bekliyor.”

| Kelime | Kısa ipucu | Kabul sonrası sahne |
| --- | --- | --- |
| TOHUM | Toprakta yeni bir bitkiye dönüşecek küçük tane. | Toprakta bir ekim noktası ve tane belirir. |
| YAĞMUR | Bulutlardan damla damla düşen su. | Bulut ve kısa, hafif damlalar eklenir. |
| FİLİZ | Tohumdan çıkan ilk taze sürgün. | İki yapraklı küçük bitki yükselir. |
| ÇİÇEK | Bitkinin renkli yapraklarla açan bölümü. | Bitki renklenir; küçük bir çiçek açar. |
| KELEBEK | Tırtıldan dönüşen, renkli kanatlı böcek. | Kelebek çiçeğe konar; açıklık tamamlanır. |

Final: “Bir avuç toprak, küçük bir orman hatırası.” Kalıcı hatıra: **İlk çiçek**.

### 3. Fırında İlk Sabah · lezzetler · 7×7 · beş adım

Giriş: “Mahalle uyanmadan fırından güzel kokular yükselsin.”

| Kelime | Kısa ipucu | Kabul sonrası sahne |
| --- | --- | --- |
| ELEK | Unu ince ince geçiren delikli mutfak aracı. | Elek ve bir miktar un tezgâha gelir. |
| HAMUR | Un ve suyun yoğrulmuş hâli. | Tezgâhta yuvarlak hamur oluşur. |
| FIRIN | Hamuru sıcağıyla pişiren mutfak bölümü. | Taş kemer görünür; içi sıcak renkle aydınlanır. |
| EKMEK | Hamurun pişmesiyle sofraya gelen temel yiyecek. | Kızarmış somunlar sepete yerleşir. |
| SOFRA | Yemeğin birlikte paylaşıldığı düzen. | Örtü ve iki tabak eklenir; pencereye sabah ışığı vurur. |

Final: “Ekmek hazır. Sabahın ilk molası senin.” Kalıcı hatıra: **Fırından bir sabah**.

### 4. Gökyüzüne Bir Pencere · uzay · 8×8 · beş adım

Giriş: “Küçük gözlemevinde bu gece göğe biraz daha yakınız.”

| Kelime | Kısa ipucu | Kabul sonrası sahne |
| --- | --- | --- |
| MERCEK | Işığı kırıp görüntüyü odaklayan saydam parça. | Parlak cam parçası gözlemevi tezgâhında belirir. |
| TELESKOP | Uzak gök cisimlerini yakından gösteren araç. | Ayaklı teleskop göğe çevrilir. |
| AY | Dünya'nın doğal uydusu. | Gökyüzünde büyük, yumuşak bir Ay görünür. |
| KRATER | Ay'ın yüzeyindeki çanak biçimli çukur. | Ay yüzeyine belirgin üç çukur eklenir. |
| YILDIZ | Geceleri gökte gördüğümüz, kendi ışığını üreten gök cismi. | Son yıldızlar yerleşir; gözlemevi panoraması tamamlanır. |

Final: “Gökyüzü aynı. Artık sen daha fazlasını görüyorsun.” Kalıcı hatıra: **Gözlemevindeki gece**.

### 5. Avluda Akşam · müzik · 7×7 · beş adım

Giriş: “Işıklar asıldı. Küçük avluyu bir şarkıyla dolduralım.”

| Kelime | Kısa ipucu | Kabul sonrası sahne |
| --- | --- | --- |
| NOTA | Müzikte bir sesin yazılı işareti. | Sehpadaki sayfaya notalar eklenir. |
| GİTAR | Telleri parmakla ya da penayla çalınan çalgı. | Bir sandalye ve gitar sahneye yerleşir. |
| RİTİM | Müziğin düzenli vuruş örüntüsü. | Küçük bir vurmalı çalgı ve kısa görsel tempo belirir. |
| KORO | Birlikte şarkı söyleyen topluluk. | Sahneye üç stilize insan silüeti eklenir. |
| ALKIŞ | Beğeniyi elleri birbirine vurarak gösterme. | Dinleyiciler ve avlu ışıkları tamamlanır. |

Final: “Bir avlu, birkaç ses, birlikte güzel bir akşam.” Kalıcı hatıra: **Avlunun şarkısı**.

## En fazla üç deneyim önceliği

### 1. İlk beş dakikada kelime → sahne ilişkisini açıkça öğret

Etki: Oyuncunun ayırt edici deneyimi uzun açıklama okumadan anlaması. Ana girişte “Kelimeleri bul, hikâyeyi canlandır” ve tek ilk hikâye eylemi; içeride tek güncel ipucu, harf sayısı ve dört/beş küçük adım. İlk bölümde ilk kelimeye kısa ve isteğe bağlı yönlendirme. Diğer hikâyeleri beklemeye veya tarih koşuluna kilitleme. Eski ana yolculuğa dönüş görünür kalsın.

Kabul: Her doğru kelime tam bir yeni sahne ayrıntısı ve sıradaki tek ipucu üretir; bütün sahne baştan açık değildir. Erken bulunan başka hedef oyuncuyu cezalandırmaz; “Şimdi bu ipucunun cevabını arıyoruz” gibi nötr açıklama kullanılır. İlk hedef dışındaki cevaplar yardım/aria başlıklarında görünmez. Yenilemede bulunan hedef ve sahne aynı adımda döner. İlk hikâye sonunda gerçek koleksiyon kartı görünür ve yeniden açılabilir; tekrar ikinci hatıra üretmez.

### 2. Mobil tahtaya öncelik ver; sahneyi süs olarak büyütme

Etki: Canlanan resmin kelime seçimini sıkıştırmaması. Oyun sırasında sahne kompakt bir şerit, sonuçta geniş panorama olsun. Etkin ipucu iki-üç kısa satıra sığsın, bulunmuş kelimeler küçük geçmiş izleri olarak açılabilsin. Kısa ekranda sahne küçük önizlemeye katlanabilir; büyük harf tercihinde yazıyı küçülterek sığdırma. Sahne hareketi giriş çizimini veya ölçümü sıfırlamamalı.

Kabul: 360×780, 390×844 ve 768×1024'te son satır/etkin ipucu/ipuçları/geri eylemi erişilebilir. Büyük sistem yazısında üst üste binme yok. Reduced-motion aynı durum değişimini hareketsiz gösterir. Son kelimede yalnız bir sonuç açılır. Çizim sürerken yeni sahne/ölçüm güncellemesi başlangıç hücresini silmez. Fiziksel Safari ve Android kanıtı ayrı kaydedilir.

### 3. Bütün ekranlarda ortak sanat ve etkileşim dili

Etki: Hikâyenin mevcut oyuna sonradan eklenmiş ayrı bir ürün gibi görünmemesi. Orman yeşili ana eylemler, sıcak fildişi yüzeyler, küçük altın başarı vurguları; aynı yazı ölçeği, kenar yuvarlaklığı, gölge ve basılma hâlleri. Beş sahne için ayrı renk aksanı olabilir ama çizgi/ışık/perspektif ortak kalır. Mevcut Dünya, Günlük, Arena, Albüm ve ayarlar da aynı kart/başlık/buton dilini kullanmalı. Sürekli müzik ya da her hareket için yeni efekt eklemek gerekmez; mevcut ses tercihleri korunur.

Kabul: Normal/odaklı/basılı/devre dışı buton durumları ayırt edilir; arayüz eylemleri en az44px hedeflidir. Dört kişisel tahta renginde okunurluk korunur. Hikâye koleksiyonu ana96 ve riddle32 sayacını şişirmez. Görsel sahnenin her aşaması kısa metinle de anlaşılır; sadece renk veya ses bilgi taşımaz. Kayıt doğruluğu kaynak/testle, görünür kompozisyon gerçek tarayıcıyla ayrı doğrulanır.

## Doğrulama sınırı

Bu öneriler kaynak incelemesine dayanır. Beş kelime bankasının kesin yerleşimleri, yeni bileşenlerin gerçek ekran düzeni ve oyuncu ilgisi henüz bu incelemede test edilmedi. Süre/geri dönüş/tutma artışı iddia edilmez. Kelime ve sahne bağı, ilk oyuncu gözleminde değerlendirilmesi gereken bir ürün hipotezidir. Yeni ücret, can, kaybedilen seri, günlük ceza veya ödeme avantajı önerilmez.

## Uygulama sonrası salt okunur ürün incelemesi

Koordinatörün isteği üzerine `story-content.ts`, `StoryExperience.tsx`, `StoryScene.tsx`, `living-stories.css` ve Solo/Home/App/Pages entegrasyonları yeniden okundu. Uygulama kodu değiştirilmedi. İlk `git diff --stat` çağrısı Mac Xcode lisansı nedeniyle dosya okumadan önce durdu; kaynaklar bağımsız salt okunur komutlarla okundu. Tarayıcı kontrolü koordinatörde; aşağıdakiler kaynak bulgusudur.

### Genel kabul

24 kelimelik beş hikâyenin Türkçe ipuçları cevaplarıyla anlam bakımından uyumlu. İlk kelimeyi açıkça verme, sonraki hedefleri ipucuyla açma, ipucunu yalnız etkin kelimeye bağlama ve gelecekteki hedefi cezasız reddetme uygulanmış. Gözlemevi öneriden farklı olarak UYDU ve GEZEGEN kullanıyor; buna karşılık sahne gerçek yapay uydu ve halkalı gezegen çiziyor, eşleşme doğru. Her sahnede 4/5 kabul aşaması ayrı görsel ayrıntıya bağlı. `StoryScene` dekoratif; aşamalar `StoryHud` metninde de anlatılıyor. Ana96 yolculuk ayrı görünümde erişilebilir, hikâye koleksiyonu 5 üzerinden ayrı gösteriliyor. Tamamlanmış kartlar tekrar oyununu, yarımlar devam etmeyi sunuyor.

### P2 · Hikâyelerde yıldız koşulu görünmüyor

- **Kaynak:** `components/game/Solo.tsx:105,131–139`; `components/game/StoryExperience.tsx:34–36`.
- **Kanıt/etki:** StoryHud normal solo HUD ve yıldız hedefinin yerini alıyor. Hikâye yardımında ipucunun yalnız üç kez kullanılabileceği yazıyor; yıldız etkisi açıklanmıyor. Sonuç 3/2/1 yıldızı gösteriyor fakat kural vermiyor. Kayıt kuralı aynı biçimde `3-Math.min(2,hints)`; oyuncu açıklanmayan bir sonuç kaybıyla karşılaşıyor.
- **En küçük öneri:** Oyun sırasında yıldız hedefini ipucu yakınında görünür tut. Yardım ve sonuçta “İpuçsuz 3; bir ipucuyla 2; iki veya üç ipucuyla 1 yıldız. Hatıran her durumda senin.” açıklamasını ekle. Süre yıldız düşürmez bilgisi sonuç detayında kalabilir.
- **Kabul:** 0/1/2/3 ipucu senaryosunda oyun hedefi ve sonuç yıldızı aynı kuralla açıklanır. Her senaryoda hikâye hatırası kazanılır; yeni ceza/kayıt biçimi eklenmez.

### P2 · Ücretsiz ilk işaretin tekrar gösterimi ipucu tüketiyor

- **Kaynak:** `components/game/Solo.tsx:108–111,125,130`.
- **Kanıt/etki:** Fener hikâyesinin ilk oynanışında başlangıç hücresi `firstStoryHint` ile ücretsiz ve sürekli görünür. İpucu düğmesi etkin kalır; kullanınca aynı hücre gösterilir ve `hints` artar. Ek bilgi vermeyen eylem yıldız düşürür. Bu, ilk öğrenme anında oyuncunun güvenini zedeler.
- **En küçük öneri:** Ücretsiz ilk işaret aktifken “İlk harf zaten işaretli” açıklamasıyla tüketimi engelle veya ipucunu no-op/ücretsiz tut. İlk kelime sonrasında normal kural sürsün.
- **Kabul:** Yeni Fener stage0'ında ipucu eylemi hints/yıldızı değiştirmez. Stage1 ve sonrası ilk harf gösterimi normal biçimde bir ipucu tüketir. Başka hikâyelerin yardımı ve geçmiş kayıtları aynı kalır.

### P3 · Orman finali yağmurun durumuyla çelişiyor

- **Kaynak:** `lib/game/story-content.ts:16`; `components/game/StoryScene.tsx:38`.
- **Kanıt/etki:** Final “Yağmur dindi” diyor, ancak yağmur damlaları `n>=2` olduğundan tamamlanan sahnede görünür kalıyor. Kelime→dünya değişimi vaadinde metin ile görsel küçük fakat açık bir tutarsızlık oluşturuyor.
- **En küçük öneri:** Finali “Yağmur toprağı canlandırdı, çiçekler açtı…” yap veya final aşamasında yalnız damlaları kaldır. Kaynak kelimeleri ve sıra değişmesin.
- **Kabul:** Beşinci adımdaki final metni ve sahne yağmurun durumu konusunda aynı şeyi anlatır.

Bu üç bulgu koordinatöre doğrudan iletildi. Bu kaynak anında ilk iki P2 açık olduğundan son ürün kabulü koşulludur. Düzeltme sonrası kontrol ayrı ek kayıtla yapılabilir. Görsel taşma, fiziksel dokunma ve ses kalitesi bu incelemeyle doğrulanmış değildir.

### Düzeltme kontrolü

Koordinatörün düzeltme bildirimi sonrasında kaynak yeniden okundu. İki P2 kaynak seviyesinde kapandı: `StoryExperience.tsx:31–36` oyun sırasında güncel yıldız hedefini, sonuçta ipucu/yıldız ve hatıra kuralını gösteriyor; `Solo.tsx:141` aynı kuralı yardımda açıklıyor. `Solo.tsx:109–113` ücretsiz ilk işaret için ipucu sayacına dokunmadan bilgilendirip dönüyor. Sonraki adımlarda olağan tüketim devam ediyor.

Kısa ekran mesajları artık `Solo.tsx:133` üzerinden StoryHud `notice` alanına aktarılıyor; `StoryExperience.tsx:32` mesajı `role=status` paragrafında gösteriyor. Böylece ayrı `.game-message` alanının kısa ekranda gizlenmesine bağımlılık kaynakta kaldırılmış. Yanlış seçim, ücretsiz ilk ipucu ve yeni sahne açıklaması aynı görünür alanda taşınıyor. Bu gözlem 640px yüksekliğin görsel olarak bizzat ölçüldüğü anlamına gelmez; tarayıcı kontrolü koordinatördedir.

P3 için bu yeniden okumada `story-content.ts:16` hâlâ “Yağmur dindi, çiçekler açtı.” içeriyordu. Metin düzeltmesinin kaynağa henüz yansımadığı koordinatöre bildirildi; bu madde kapandı olarak kaydedilmedi. Yeni ürün engeli saptanmadı. Bu ek kontrolde test çalıştırılmadı, uygulama kodu değiştirilmedi.
