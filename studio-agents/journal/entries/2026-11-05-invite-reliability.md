# 5 Kasım 2026 · Davet paylaşımı güvenilirlik incelemesi

Başlangıç kaynağı 0.36.3, `6b31e76e386328c4ac808859c2ce806ef348692a`. Koordinatörün resmi Sites helper ile açtığı kaynak kullanıldı. AGENTS, güvenilirlik rolü/runbook, sürüm ve geliştirme kayıtları, öncelikler, 5 Kasım içerik bakım kaydı ve ilgili gerçek çağıranlar okundu. Kapsam davet URL'si, paylaşım sonucu ve alıcıdaki açılış sınırıdır. Uygulama dosyaları değiştirilmedi. Bu ilk incelemede test veya cihaz çalıştırılmadı.

## 1 · Native davet yanlış kaynağı kullanıyor

- Kanıt: `components/game/Arena.tsx:72`, `Friends.tsx:29–30`, `Challenges.tsx:30` URL'yi `location.origin` ile kuruyor. `capacitor.config.ts:3` yerel `dist-mobile` paketini açıyor. `lib/platform/runtime.ts:2,14` herkese açık HTTPS adresini ve native uyumlu `publicGameOrigin()` yardımcısını zaten içeriyor.
- Tetikleyici/etki: native WKWebView içindeki oda, arkadaş veya meydan okuma paylaşımı, yerel kaynak adresini gönderebilir; alıcı oyunun herkese açık sayfasına ulaşamaz. Bu kaynak temelli somut kusurdur; gerçek paylaşım paneli bu incelemede denenmedi.
- En küçük öneri: üç davet türünü tek doğrulanan URL kurucusunda birleştir; native'de gerçek HTTPS oyun adresi, web'de mevcut web kaynağı. Oda sekiz, arkadaş/meydan on karakterlik kod kuralı değişmesin. İlgisiz sayfa sorgusu, kimlik bilgisi veya hash paylaşılmasın.
- Kabul: gerçek Arena/Friends/Challenges çağıranlarında `capacitor://localhost` yerel kaynağı altında herkese açık HTTPS link; web kaynak ve üç tür için alıcı parser'ıyla aynı kod; bozuk/uzun kodla URL üretilmemesi; mevcut kayıt ve oda durumuna paylaşım nedeniyle mutation gönderilmemesi.

## 2 · İptal ve paylaşım başarısızlığı birbirinden ayrılmıyor

- Kanıt: `components/game/common.tsx:145`, `AbortError` ile tüm paylaşım/kopyalama yollarının başarısızlığını aynı boş stringe indiriyor. `Arena.tsx:72` ve `Challenges.tsx:30` iptal sonrası kod mesajı gösteriyor. `Friends.tsx:17` boş sonuçta yeni mesaj göstermediğinden önceki başarı mesajı kalabiliyor. Paylaşım tamamlanma beklerken art arda çağrıya ortak kilit yok.
- Tetikleyici/etki: oyuncu paneli kapatır veya paylaşım desteklenmeyen bir ortamda düğmeye basar. İptal, başarısızlık ve gerçekten kopyalanma tutarlı ifade edilmiyor. Yeni native panel eklenirse aynı dokunuşların üst üste panel açma ihtimali ayrıca korunmalı.
- En küçük öneri: paylaşıldı/kopyalandı/iptal/kullanılamıyor/bekleyen işlem sonuçlarını açık ayır. İptalden sonra panoyu değiştirme veya başarı metriği üretme. Başarısızlıkta görünür mevcut davet kodu kullanılabilsin. Aynı anda tek paylaşım işlemi olsun. Native köprü eklenecekse tamamlanma/cancel/error ana UIKit completion sonucuna dayanmalı.
- Kabul: Web Share başarı; `AbortError` hem DOMException hem name alanlı hata; share bulunmaması ve clipboard başarı; her iki yolun olmaması veya reddi; native başarı/iptal/hata; hızlı iki tık ve iptalden sonra yeniden deneme. Üç gerçek çağıranda iptal başarı bildirimi/`invite_share` üretmemeli. Gecikmiş sonuç kapatılan veya değişen davetin ekranına yazılmamalı.

## 3 · Alıcı web akışı korunmalı; uygulamanın linkle açılması ayrı sınır

- Mevcut koruma: `components/game/App.tsx:73–75` URL sorgusundan Arena alt görünümünü seçiyor; `lib/auth/shared.ts:7–19` yalnız güvenli dönüş yolu ve geçerli kodları koruyor. `Arena.tsx:51–55` önce devam eden odayı getiriyor, mevcut oda yoksa geçerli davete katılıyor; sahip/epoch ve abort kontrolleri var. `Friends.tsx:14,18` daveti önizleyip kabul düğmesini bekliyor. `Challenges.tsx:20,23` önizlemeyi alıp oyuncu başlatmadan yarış süresini başlatmıyor.
- Sınır: App davet sorgusunu yalnız mountta okuyor. `mobile/main.tsx:13–25` native lifecycle dinliyor ama davet için `appUrlOpen` veya launch URL işleyicisi yok. Doğru HTTPS link üretmek otomatik Universal Links teslimi veya kurulu uygulamayı açma kanıtı değildir. Bu sınır kapsam genişletilmeden finalde açık tutulabilir.
- Kabul: üç geçerli web linki doğru alıcı ekrana gider; giriş gerekiyorsa güvenli auth dönüşü aynı daveti taşır; bozuk kod sunucu katılımı başlatmaz; devam eden oda başka davetle sessizce terk edilmez; arkadaş kabulü ve meydan okuma başlatması açık oyuncu eylemi bekler. Safari alıcı yolunun çalışması native uygulamaya deep link doğrulaması diye sunulmamalı.

## Yanlış pozitifler ve doğrulama sınırı

`publicGameOrigin()` ve `shareLink()` mevcut haliyle yalnız tanımlanırken global okumaz; salt importtan doğan bir SSR arızası saptanmadı. Yeni ortak modül de Node/SSR importunda `location`, `navigator` veya native köprü istememeli. Web Share'in WKWebView'da bulunması veya kopyalama izni bu kaynak incelemesinden kesinleştirilemez. Yeni bağımlılık gerekmeden mevcut native köprü/adaptör düzeni kullanılabilir, fakat işletim sistemi panelinin iptal/geri dönüş davranışı simülatör ve sonra fiziksel iPhone kanıtı gerektirir. Sunucu davet/üyelik kuralları, puan, kayıt ve yarış süresi bu incelemenin değişiklik hedefi değildir.

Son diff incelemesi koordinatörün uygulamasından sonra eklenecek.

## Son diff incelemesi · 0.36.4 adayı

`lib/platform/sharing.ts`, native kurulum/köprü, üç gerçek çağıran, ortak yeniden dışa aktarım, runtime SSR dönüşü, Xcode kaynak kaydı ve simülatör test yalıtımı incelendi. Bu sınırda yeni bir yayın engelleyici uygulama kusuru saptanmadı. Dört URL üretimi ortak kurucuya geçiyor; native'de HTTPS kaynak kullanılıyor. İptal panoya düşmüyor ve başarı sayılmıyor; ortak JS kilidi ve native panel kilidi mevcut. Arena epoch/oda/tur, Friends açık davet bağlamı/aktiflik, Challenges görünüm kimliği/aktiflik ile geç sonucu bırakıyor. App, auth return ve sunucu kuralları değiştirilmemiş.

Native köprü sadece beklenen HTTPS host/path/tek davet sorgusunu kabul ediyor. Panel ana kuyrukta, aktif ve görünür sunucudan açılıyor; completion sonucu paylaşıldı/kopyalandı/iptal/hata olarak ayrılıyor. Xcode kaydı yeni Swift dosyasını derleme kaynaklarına ekliyor. QA kurulum betiği booted iPhone simülatörü filtresini ve ayrı `com.kelimeteneffusu.sharingqa` kimliğini koruyor; fiziksel kullanıcı uygulamasını hedeflemiyor. Yeni SDK/bağımlılık yok.

Bağımsız hedefli doğrulama: `node --experimental-strip-types --experimental-transform-types --test tests/sharing.test.ts tests/arena-terminal.test.ts` ile 40 test/8 grup geçti; `git diff --check` temiz. Bunlar gerçek paylaşım paneli veya iki gerçek oyuncu kanıtı değildir. Fiziksel telefon bu incelemede kullanılmadı.

Koordinatöre iletilen iki kanıt sınırı:

1. İlk `SharingTests.swift:18–19` kontrolü native `copied` dönüşünü ve QA ekranının paylaşım öncesi gösterdiği URL'yi denetliyordu; panoya yazılan içeriği denetlemiyordu. `mobile/qa/sharing.tsx` içindeki textarea'ya sistem Paste yapıp gerçek kopyada beklenen HTTPS/kod bulunduğunu, local origin veya ilgisiz parametre bulunmadığını doğrulamak önerildi. UIKit'e `[title,url]` verildiğinden panoda yalnız URL veya başlık+URL görülmesi farklı bir kanıt konusudur. Simülatörde panel görülmüş olması, hedef uygulamaya gerçekten mesaj gönderilmiş olduğu anlamına gelmez.
2. Actual Arena testinde `sharing` modülü Node ortamından import edildiği için URL'nin geldiği global, VM'nin `location` nesnesi değildir. Buradaki production URL sonucu SSR fallback'i kullanır. Ayrı modül testleri native transport + local origin ve web origin davranışlarını gerçekten sınar. Bu iki kanıt birlikte değerlendirilir; tek component testi native uçtan uca paylaşım diye sunulmaz. Friends/Challenges geç sonuç korumaları bu incelemede kaynak üzerinden doğrulandı; ayrı component regresyon testi veya gerçek alıcı akışı çalıştırılmadı.

Nihai yayın kararı koordinatörün zorunlu proje kapıları ve tamamlanan native panel kontrolüne bağlıdır. Universal Links ve fiziksel iPhone paylaşım hissi açık sınır olarak kalır.

### Kanıt açıklarının kapanışı için dar yeniden inceleme

Koordinatörün gerçek sistem Paste denemesi, ilk native `[title,url]` aktarımında düz metin alana yalnız başlığın yapıştırıldığını yakaladı. `GameSharingPlugin.swift:34–37` şimdi doğrulanmış HTTPS adresini başlıkla tek string öğesi olarak gönderiyor (`başlık + "\n" + url.absoluteString`). URL'nin host/kod doğrulaması ve completion durumları korunuyor. Bu düzeltmede yeni uygulama riski bulunmadı; üretim kodu panoyu okumuyor veya kullanıcı yerine alıcı seçmiyor.

`tests/ios-edge/SharingTests.swift:31–45` sistem Paste menüsüyle gerçek textarea içeriğini alıp beklenen oda HTTPS adresini, `localhost` ve `token=` yokluğunu kontrol ediyor. Böylece önceki yalnız ekranda gösterilen URL'yi sınayan kanıt açığı test tasarımında giderildi. Üç türün sistem kopyalama durumu, iptal ve yeniden açma hâlâ sınanıyor; gerçek Paste kontrolü son oda örneğinde yapılır. Bu ek not anında koordinatör yeniden native koşuyu çalıştırıyordu; son başarı veya hata makbuzu henüz bu uzman tarafından görülmedi. Native test geçti şeklinde tamamlanmış kabul yazılmadı.

Actual Arena regresyonlarında `setNativeTransport(...)` artık gerçekten etkinleştiriliyor ve çağıranın VM kaynağı `capacitor://localhost` oluyor; URL sonucu SSR fallback'e dayanmıyor. Paylaşım sonrasında native taşıma temizleniyor. Önceki Node-global kanıt sınırlaması bu özel native dal için giderilmiş oldu; bu yine kontrollü component testi olup fiziksel cihaz değildir. Koordinatör 755 toplu testin geçtiğini bildirdi; bu dar yeniden incelemede aynı geniş paket tekrar çalıştırılmadı. `git diff --check` yeniden temiz.
