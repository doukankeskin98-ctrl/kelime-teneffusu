# WoW açık işlerini tamamlama · güvenilirlik incelemesi

Kaynak: 0.39.1, `c509336469f8246bdffb8a9c432fa744bcc2fcaf`. Salt okunur kaynak incelemesi; uygulama/test/canlı veri/cihaz/yayın değiştirilmedi. Bu günlük dışında dosya yazılmadı. Üç öncelikli entegrasyon riski aşağıdadır; henüz uygulanmamış yeni özellik için bunlar mevcut üretim hatası iddiası değildir.

## 1. Tekrarlanan kelime normal hedef eşleştirmesine verilemez

Kaynak: `lib/game/engine.ts:28–36,84–88`, `lib/game/progress.ts:45–50`, `components/game/Board.tsx:67–85`, `lib/game/input-gesture.ts:24–33`.

`makeCustomPuzzle` aynı/ters kelimeleri reddeder; `match` metni eşleşen ilk hedefi döndürür; `cleanSave` aynı hedef kimliğini yalnız bir kez sayar. BEYAZ'ın tahtadaki ikinci yerleşimi normal Solo üzerinden gönderilirse ilk hedef sayılır veya zaten bulundu diye reddedilir. Sadece farklı target.id vermek yeterli değildir.

En düşük gerileme riski: ayrı bonus modeli + bağımsız eşleştirici. Ortak Board ve gesture motoru aynen kullanılabilir. Bonus eşleştiricisi doğrulanmış düz çizginin iki ucunu yön bağımsız kanonikleştirip occurrence kimliği üretmeli; her farklı yerleşim bir kez sayılmalı. Üretici küçük sabit tahtada hedefin tüm gerçek oluşumlarını taramalı veya bütün bulunabilir oluşumların hedef listesinde olduğunu kanıtlamalı. Sadece yerleştirme listesine bakıp sonradan rastgele dolgu ile oluşan doğru kelimeyi reddetmek oyuncuya bozuk seçim gibi görünür. Erken kabulde normal Board'un kelime metni/uzunluğu kontrolü kullanılabilir; son onayı bonus endpoint eşleştiricisi verir. Normal motor/progressBoard/route kayıtlarına bonus hedefleri eklenmemeli.

Kabul: bütün oluşumlar ileri/ters, yatay/dikey/iki çaprazla seçilebilir; aynı uçlar ters sırada ikinci puan yazmaz; farklı iki oluşum aynı yazıya rağmen ayrı sayılır; farklı hücrelerdeki tesadüfi oluşumlar reddedilmez; hızlı son harf atlama ve pivot geçmiş testleri korunur; tamamlandıktan ve zaman dolduktan sonra select etkisizdir. Farklı tohumlar için generator→scan→select tüm oluşumları tüketir, sayı UI hedefiyle eşittir. Son kelime uçuşu puanlamayı yönetmez.

## 2. Bonus / dünya gösterimi mevcut ana ilerleme kapılarını değiştirmemeli

Kaynak: `lib/game/main-journey.ts:9–18,24–45`, `lib/game/discovery.ts:32–45,54–67,70–74`, `components/game/Solo.tsx:85–94,151–155,173–179`, `tests/main-journey.test.ts:31–54`.

Dünya erişimi üçüncü tamamlanan durakta açılır; altıncı bölüm beş ana durak tamamlandığında açılan, önceden kaydı bulunan gerçek bulmacadır. Yayınlanmış 168 numara ilk rotalarda sırayla oynanmaz; gerçek devam mevcut dünyadaki boşluğu tamamlar. Altıncı bölümün yerine süreli bonus koymak veya "normal→zor→bonus" için dizi/kimlikleri yeniden sıralamak eski kayıtları ve albüm haklarını bozar.

Öneri: altı asıl bölüm aynen kalır; bağımsız bonus, ilk rota tamamlamasından sonra isteğe bağlı kısa geçiş olur. Süre bitmesi/atlama ana dünyayı kilitlemez. Dünya tanıtımı bir sunum aşaması olup geçerli nextJourneyAfter/nextMainChapter sonucunu kullanır; yeni dünya kapısını yeniden hesaplayan bir sistem olmaz. İlk kez dünyaya girişte/gerçek geçişte gösterilir, her resume/replay'de otomatik yeniden başlamaz. Bonus ve reveal ana save.complete veya stars alanlarını değiştirmez.

Bonus sayacı açık politika ister: sakin, rekabetsiz ara tur için aktif oynama süresi; hazır/öğretim/ayar/arka plan duraklar. Monoton bir saat veya reducer'da geriye gitmeyen elapsed kullanın. visibility/native inactive sırasında seçim iptal edilir; geri dönüşte kendiliğinden başlamaz. Aynı anda final-word ve timeout yalnız tek terminal sonuç yaratmalı. Soğuk yeniden giriş için ya doğrulanmış owner-scoped bonus snapshot + duraklatılmış devam ya da açık "tur yeniden başlar" davranışı uygulanmalı; devam ediyormuş gibi görünmemeli. İlk seçenek hissi daha iyi korur. onSelect kabulü tick'i beklemeden mevcut elapsed/deadline kontrolü yapmalı.

Kabul: eski journey-0271/0290/0310 fixture'larının kimlik, kelime, grid, sıra/gate/ödül ve save merge sonuçları aynı; üçüncü durakta açılmış dünyaya erken girme korunur; altıncı bitiş replay/refresh bonus hakkını/ana parça sayısını artırmaz; bonustan çıkış/reload ana bölümü geri almaz; son mevcut dünya tamamlandığında olmayan next'e gidilmez. pause→wait→resume, native inactive, hidden→visible, yanlış saat/gelecek kayıt, iki hızlı start, duplicate finish ve son kelime–timeout sınırı ayrı testtir.

## 3. Yan ödül yolunu türetmek ayrı para/claim defterinden daha güvenli

Kaynak: `lib/game/progress.ts:27–43,53–74`, `lib/game/discovery.ts:32–63`, `lib/game/original-content.ts:38` ve `components/game/App.tsx:81–89,128–145`, `lib/game/progress-sync.ts:42–80`.

Mevcut kalıcı başarılar temizlenmiş tamamlama kayıtlarından türetilir; replay ayrı ödül claim'i vermez. Eski→özgün bölüm alias'ları tek krediye indirilir. Yeni alanlar loadProgress'in allowlist'i tarafından atılır; normal JSON spread ile istemciye alan eklemek bulut/yeniden açılışta korunacağı anlamına gelmez. Hesap değişiminde bonus state'i yalnız adı değişen storage key'e yazmak önceki oyuncunun sonucunu yeni oyuncuya aktarabilir.

Öneri: tek, süresiz kozmetik hatıra yolu; ilerleme kanonik olarak tamamlanmış ana bölüm sayısından türetilsin (toplam yıldız veya repeatable replay sayısı değil). Örneğin her N farklı ana bölümde yeni rozet/çerçeve; hak UI açılmasından/claim animasyonundan bağımsız, earned ids deterministic. Eski oyuncuların emeği otomatik kredilensin. Ek currency, ek rekabet avantajı, ödeme veya claim mutation gerekmiyor. Kullanılan görünüm tercihi gerekiyorsa sadece izin verilen earned cosmetic id saklansın; yükleme ve merge sanitize testleri eklensin. Owner key/unmount mevcut App örneğine uygun olmalı; bonus için ilk owner capture + değişimde retire veya component key gerekir. Bonus rekoru ve in-flight snapshot asıl ilerlemeden ayrı kalırsa yerel/cihaz sınırı UI'da dürüstçe belirtilmeli.

Kabul: local/cloud merge idempotent, sırası değişince aynı earned set; replay ve alias eski+yeni kayıt çift saymaz; bozuk/uydurma complete yalnız cleanSave'den sonra kredi verir; yeni oyuncu önceki owner bonusuna/kozmetiğine erişmez; storage throw oyunu çökertmez ve kalıcı kaydın başarılı olduğunu iddia etmez; yeni isteğe bağlı alanların eski kaydı yükleme çıktısı değişmez. Gerçek gelir veya Game Center altyapısı bu görsel yol üzerinden varmış gibi sunulmaz.

Sınır: bu tur test çalıştırılmadı, tarayıcı/gerçek cihaz gözlenmedi. Koordinatör uygulama farkını gönderdikten sonra bu üç sözleşmeyle dar son inceleme yapılabilir.

## Uygulama sonrası dar inceleme (0.40 çalışma farkı)

Yeni `journey-bonus.ts`, `journey-flow.ts`, `BonusRound.tsx`, `progress.ts` ile `App.tsx` entegrasyonu salt okunur incelendi. Uygulama kodu değiştirilmedi. Gerçek Node fonksiyon çağrısıyla aşağıdaki ilk bulgu tekrar üretildi; tarayıcı veya cihaz testi yapılmadı.

1. **Tamamlanmış bonus aynı denemede geri açılabiliyor.** `journey-bonus.ts:53–55` karşılaştırması attempt→elapsed→found sırasını kullanıyor. Probe: uzay bonusunda aynı attempt, cihaz A 20.000 ms'de 10/10/finished; cihaz B 30.000 ms'de 1/10/unfinished. Birleşim 30.000 ms,1/10,finished=false,best=10 verdi. Tamamlanmış turun oynanışı geri açılıyor. Aynı denemede terminal durum elapsed'ten önce korunmalı, sonuçlar bütün deneme olarak deterministik seçilmeli. `BonusRound.tsx:27` de yalnız yeni attempt veya +1.000ms elapsed farkını içeri aldığı için eşit/yakın zamanda gelen tamamlanma/rekor değişimini kaçırıyor. Kabul: yukarıdaki birleşim her iki sırada tamamlanmış kalır; tamamlanmış uzak kayıt aktif bileşeni durdurur; yalnız best artışı sonucu günceller; partial keşifler ayrı cihazlar arasında yapay tamamlama oluşturmaz.

2. **Dünya tanıtımı hesap değişimini taşımamalı.** `App.tsx:77–78,95,135`: bonus owner ile korunurken welcome yalnız SoloConfig tutuyor. Hesap yenileme diğer oyunları kapatıyor ama welcome'ı kapatmıyor. Eski hesabın açtığı dünya tanıtımından yeni hesabın kilitli dünyası playSolo ile başlatılabilir; welcomedWorlds da yeni profile yazılır. Welcome owner bağlamını yakalamalı, owner değişiminde kapanmalı ve Oyna işleyicisi aynı owner + mevcut erişim kontrolünü yapmalı. Kabul: owner A açık dünya tanıtımında B'ye değişince hiçbir eski welcome/oyun açılmaz ve B progress'i değişmez; aynı owner güncellemesi/reconnect tanıtımı bozmaz.

Diğer incelenen sözleşmeler: endpoint kanonik eşleştirme, dolgu sonrası bütün gerçek oluşumların taranması, eski altıncı bölümden sonra ek bonus, mevcut gate ve başlık kimliklerinin korunması, türetilmiş kozmetik rozet ve bonus owner render/yazma koruması kaynakta mevcut. Ana kayıt/tahta göçü eklenmemiş. Son test/diff ve fiziksel his kanıtı koordinatörün ayrıca kontrolüdür.

### İki bulgunun düzeltme kontrolü

Koordinatörün dar farkı yeniden okundu. `mergeBonusSave` artık aynı denemede terminal durumu elapsed'ten önce seçiyor; ilk 20sn/10kelime ↔ 30sn/1kelime probe'u her iki birleşim sırasıyla tekrar çalıştırıldı ve bitmiş kayıt aynen korundu. BonusRound uzak kayıtta finished/found değişimini durdurarak alıyor; best-only güncellemesini de gösteriyor. App welcome owner yakalıyor, render/oyna işleyicisinde güncel owner'ı denetliyor ve owner değişiminde sahneyi kapatıyor. Eklenen yakın zamanlı terminal kayıt ve eski welcome callback regresyonları kaynakta okunarak doğrulandı; testleri koordinatörün çalıştırdığı ayrı kanıttır. Bu iki düzeltmede kalan somut yayın engeli bulunmadı. Bu sonuç fiziksel cihaz, gerçek iki cihaz bulut eşzamanlılığı veya tüm ürün için kusursuzluk onayı değildir.
