# Güvenilirlik incelemesi · 24 Ekim 2026

Atanan kapsam: 0.8.2, Sites kaynak `14e8cceb5f4d7ece7911eba21ab98b5523b254cf`; `PublishedPlay` yükleme/çevrimdışı dönüş, asenkron bölüm kaydı, tahta önbelleği ve ilgili testler. Uygulama/test kaynağı değiştirilmedi. Tek yazılan dosya bu günlük.

AGENTS, rolün beş yönergesi, öncelikler, strateji, koordinatör alımı, README, sürüm/harita belgeleri ve geliştirme defterinin son kaydı okundu. Aşağıdaki üç bulgu kaynakta somut tetikleyiciye dayanır; gerçek oyuncu oturumunda gözlenmiş hata veya ölçülmüş ürün kaybı iddiası değildir.

## 1. Ağ isteğinden yerel tahtaya dönüş, değişmeyen tamamlamayı gönderim kuyruğuna almıyor

**Öncelik:** P2; küçük düzeltme adayı. **Kanıt:** `components/game/PublishedChapters.tsx:40–47,51,57`.

- **Tetikleyici:** Hesabın cihazında doğrulanmış tahta ve henüz buluta ulaşmamış tamamlanmış kayıt var. `navigator.onLine` doğru fakat herkese açık tahta GET'i hata veriyor veya sekiz saniyelik iptale kadar yanıt vermiyor. `start` dış `catch` ile mevcut yerel tahtayı açıyor.
- **Beklenen:** Yerel tamamlanma korunur ve bağlantı döndüğünde/değerlendirildiğinde bulut tarafından onaylanıncaya kadar gönderilecek kayıt sayılır.
- **Gerçek:** Efekt başında `dirty=false`; normal yolda satır 44 bunu `true` yapıyor, dış `catch` yolu yapmıyor. `savedSignature` zaten aynı yerel kayda ayarlandığından `Solo` ilk `onSave` çağrısı da bunu kirli saymıyor. Tamamlanmış oyun zamanlayıcısı çalışmıyor (`components/game/Solo.tsx:34–42`); `online`, beş saniyelik kontrol ve tamamlamanın mikro görevi `flush` çağırsa da `dirty=false` kapısından dönüyor. Kayıt cihazda sağlam; bulut onayı gelmeyen tamamlanma bu açılışta kendiliğinden gönderilmiyor.
- **Oyuncu etkisi:** Başka cihaz/hesap kartı bu tamamlamayı göremeyebilir. Ayrıca doğrulanmış yerel tahta mevcutken bile açılış ağ GET'i ve iptalini bekleyebilir; sekiz saniyelik gecikme kaynak ve yalıtılmış deneyle doğrulandı, cihazda ölçülmedi.
- **En küçük düzeltme:** Yerel geri dönüşü de henüz onaylanmamış kayıt olarak kuyruğa al; hesap kimliği ve geç yanıt korumalarını koru. Tahtayı hemen açan daha büyük bir yeniden düzenleme bu hata için şart değildir.
- **Kabul/regresyon:** Doğru hesap için yerel tamamlama ve geçerli tahta kur; çevrimiçi görünen bağlantıda tahta GET'ini reddet veya süre aşımına uğrat. Yeni kelime/oyun süresi eklemeden `online`/periyodik kontrolü tetikle. Gönderilen PUT aynı hesabın tam kaydını içersin; olumlu yanıt olmadan “Hesabında kayıtlı” gösterilmesin. Yerel en iyi sonuç ve başka hesap boşluğu aynı kalsın. Mevcut `tests/offline-chapters.test.ts:10–50` yalnız önbellek/okuma yardımcısını, `tests/releases.test.ts:67–68` yalnız birleştirme sonucunu sınar; bu dış `catch` yolu kapsamda değil.

## 2. Önceki PUT sürerken tamamlama ve geri dönüş, son bulut gönderimini düşürüyor

**Öncelik:** P2; hesaplar arasında taşınan ilerleme beklentisini etkiler. **Kanıt:** `components/game/PublishedChapters.tsx:48,51–55,57`, `components/game/App.tsx:62,73`.

- **Tetikleyici:** İki kelimelik kısmi kayıt için PUT beklemedeyken oyuncu bölümü tamamlar ve keşiflere döner. Tamamlama mikro görevi ve geri düğmesi `flush` çağırır.
- **Beklenen:** İstek sürerken oluşan son kayıt da gönderim için tutulur; kısmi yanıt son tamamlanmanın onayı sayılmaz.
- **Gerçek:** Her iki çağrı `sending=true` nedeniyle hemen çıkar. `back` bileşeni kaldırır; efekt temizliği periyodik denemeyi durdurur ve `active=false` yapar. Eski PUT yanıtı `active` korumasıyla işlenmez; `finally` yalnız `sending=false` yapar, yeni kayıt için gönderim başlatmaz. Sunucuya giden tek snapshot kısmi kalır. Tamamlama yerel depolamada korunur.
- **Oyuncu etkisi:** Aynı bölüm yeniden açılana kadar diğer cihazda tamamlama/damga eksik kalabilir. Bu, yerel kayıt kaybı değildir; son bulut yazımının kaçırılmasıdır.
- **En küçük düzeltme yönü:** Uçuş sırasında gelen boşaltma isteğini kaybetmeyen, sahip ve istek nesline bağlı bir kuyruk kullan; mevcut istek bitince en son onaylanmamış snapshot'ı gönder. UI kapanışının gerekli son gönderimi düşürmemesi ve hesap değişince eski snapshot'ın yeni kimlikle gönderilmemesi birlikte sağlanmalı. Tek başına `finally` içine mevcut `flushRef` çağrısını eklemek, kaldırılma/hesap değişimi için yeterli kabul edilmemeli.
- **Kabul/regresyon:** İlk kısmi PUT'u geciktir; bu sırada son doğru kelimeyi kaydet ve geri dön. İlk yanıtı tamamla. İkinci gönderimde tam yerel snapshot bulunsun, aynı sahibin bulut kaydı tamamlansın; kısmi yanıt son kaydı onaylamasın. Ayrı hesap değişimi dalında eski kayıt yeni hesaba gönderilmesin. `tests/releases.test.ts:64–65` saf `chapterSyncResult` ile geç yanıtın kelimeyi silmediğini doğruluyor; gerçek boşaltma/kaldırılma sırasını doğrulamıyor.

## 3. Sonuçlanmayan eski hesap PUT'u yeni hesabın gönderimlerini de engelliyor

**Öncelik:** P2; bağlantı sorununun ömrü yeni hesaba taşınıyor. **Kanıt:** `components/game/PublishedChapters.tsx:38–41,48–53`, `components/game/App.tsx:73`.

- **Tetikleyici:** A hesabının PUT'u sonuçlanmıyor. Aynı bölüm açıkken profil B'ye değişiyor; üst bileşenin anahtarı yalnız bölüm kimliği olduğundan `PublishedPlay` aynı örnek olarak kalıyor. B yerel kayıt oluşturuyor ve gönderim tetikleniyor.
- **Beklenen:** A'nın eski isteği B'nin kayıt kanalını kilitlemez; A'nın geç yanıtı B'ye uygulanmaz.
- **Gerçek:** Hesap değişimindeki efekt `generation` ve veri alanlarını yeniliyor fakat `sending` bayrağını yenilemiyor. PUT'ta süre sınırı veya iptal sinyali de yok. A isteği sonuçlanana kadar B'nin bütün `flush` çağrıları `sending=true` nedeniyle dönüyor. Buna karşılık mevcut `active/generation` koşulu A yanıtının B'nin yerel kaydına yazılmasını doğru biçimde önlüyor; hesaplar arası veri karışması bu deneyde oluşmadı.
- **Oyuncu etkisi:** Yeni hesapta cihaz kaydı sürse de bulut eşitleme eski hesabın ağ isteğini bekliyor. Tarayıcının gerçek ağ zaman aşımı süresi ölçülmedi; uygulama düzeyinde üst sınır bulunmadığı kaynakta açık.
- **En küçük düzeltme yönü:** Gönderim kilidini sahip/nesil veya eşsiz istek belirteciyle sınırla; eski neslin isteğini iptal et ve PUT'a makul bir süre sınırı ver. Eski isteğin `finally` bloğunun daha yeni isteğin kilidini açmamasını da güvenceye al. Yalnız `sending=false` sıfırlaması yeni eşzamanlılık yarışı doğurabilir.
- **Kabul/regresyon:** A PUT'unu beklet; aynı bölümde B'ye geç, B kaydını değiştir, `online`/periyodik kontrolü çalıştır. B kendi ilerlemesini gönderebilsin. A yanıtı daha sonra gelince B'nin verisini, durumunu veya yeni uçuş kilidini değiştirmesin. Aynı sahipte süre aşımı sonrası en son kaydın tekrar denenmesi de sınansın.

## Doğrulama ve sınırlar

- İlgili üç dosya çalıştırıldı: `node --experimental-strip-types --experimental-transform-types --test tests/offline-chapters.test.ts tests/chapter-cards.test.ts tests/releases.test.ts`. **27/27 geçti.** Bütün test paketi, derleme veya canlı Worker/DB çalıştırılmadı; bu salt okunur incelemede gerekli değildi.
- Üç tetikleyici, mevcut TSX kaynağı bellekte derlenip Node VM içinde çağrılarak tekrar üretildi. Gerçek `chapter-cache`, `chapter-progress`, `cleanSave` ve kaynak bölüm tahtası; sahte hook/JSX kabuğu, bellek depolama, ertelenmiş HTTP yanıtları ve elle ilerletilen zamanlayıcılar kullanıldı. Kalıcı test veya yardımcı dosya yazılmadı. Çıktılar: (1) 8000 ms iptalinden sonra yerel tamamlama açıldı, `online` + kontrol sonrasında **0 PUT**; (2) son tamamlama cihazda dururken geri dönüşten sonra yalnız **1 kısmi PUT**; (3) A PUT'u beklerken B kaydı cihazda oluştu, B için **0 PUT**, A'nın geç yanıtı B'ye uygulanmadı. Bu bir DOM/gerçek React yaşam döngüsü entegrasyon testi değildir; önerilen regresyonların kalıcı test olarak eklenmesi koordinatöre aittir.
- Olumlu korumalar: cihaz tahtası kimlik/hash/spec/yol doğrulaması kart ve açılışta ortaktır (`lib/studio/chapter-cache.ts:9–24`); kayıtlar sahip anahtarına ayrılır. `chapterSyncResult` geç yanıttaki eksik kelimeyi onay saymaz ve en iyi tamamlanmayı korur (`lib/studio/chapter-progress.ts:5–13`). Sunucu kayıt birleştirmesi gerçek sahip ve revizyon üzerinden çalışır (`lib/studio/store.ts:46–56`); mevcut ilgili testler geçti. Bu korumalar yukarıdaki tetikleme/kuyruk sorunlarını ortadan kaldırmıyor.
- Canlı oyuncu verisi/DB kullanılmadı; yayın yapılmadı. Destekli önizleme engeli aşılmadı. Gerçek tarayıcı/telefon, fiziksel çevrimdışı geçiş, ekran okuyucu ve FPS doğrulanmadı. Ölçülmüş tutma veya performans artışı iddiası yok.

**Devir önerisi:** İlk bulgu en küçük ve doğrudan kaynakla kanıtlanan düzeltmedir. İkinci/üçüncü bulguları aynı anda geniş bir yeniden düzenlemeye dönüştürmeden, sahip sınırlarını kapsayan kabul testleriyle ayrıca ele alın. Kod, odak seçimi ve yayın koordinatördedir.
