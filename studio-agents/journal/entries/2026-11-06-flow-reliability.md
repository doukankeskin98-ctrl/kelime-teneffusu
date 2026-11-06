# Son kelime → sonuç akışı: dar güvenilirlik incelemesi

6 Kasım 2026. İncelenen başlangıç: 0.38.2 / 329edf0. Uygulama koduna dokunulmadı. Telefon bağlantısı kullanıcı isteğiyle kapsam dışında.

## 1. Raf, son harfin inişinden önce çekilmemeli

Kaynak: `lib/game/word-feedback.ts:5–6`, `components/game/WordFeedback.tsx:66–74`, `components/game/common.tsx:116`, `app/world-journey.css:23`. Uçuş 720 ms, son harf gecikmesi en çok 84 ms, hedefteki onay 180 ms: tam iniş 984 ms'ye kadar sürer. Mevcut sonuç 1040 ms'de doğrudan görünür ve oyun yüzeyi `visibility:hidden` olur. Yeni çıkış animasyonu 800 ms'de rafı/tahtayı taşırsa ölçülmüş harf hedefleriyle çakışır. Bu mevcut hareketin bozuk olduğu iddiası değil; önerilen fazlandırmanın somut sınırıdır.

Öneri: kabul edilmiş 720/180 hızlarını koru. Raf/tahta çıkışını son inişten sonra başlat; kısa opacity/transform geçişinin ardından sonuç aç. Daha erken çekilecek alan yalnız rafı taşımayan başlık/alt kontroller olabilir. DOM geometrisini uçuş sırasında değiştirme.

Kabul: en uzun kelimede son hedef pop tamamlanmadan raf/tahta koordinatları değişmez; azaltılmış harekette bütün beklemeler atlanır; sonuç atlama hemen işler. `tests/word-feedback.test.ts` gerçek dekorasyon lifecycle ve glyph zamanlamasını denetliyor, görsel koordinasyon ayrıca tarayıcıda izlenmeli.

## 2. Rekabet sonucu bekleme süresi uçuş başlangıcına bağlı olmalı

Kaynak: `components/game/Challenges.tsx:50–51`, `components/game/useResultPresentation.ts:11–17`, `components/game/Arena.tsx:23–31,81–82`. 0.38.2 yerel geçerli çizimde uçuşu başlatıyor; Meydan `prepare()` ve Arena sonuç sayacı ise sunucu onayından sonra tam 1040 ms'yi yeniden bekliyor. Örneğin onay 900 ms sürerse harf çoktan yerleştiği halde sonrasında tekrar bir saniye boş beklenir. Sunucu otoritesi korunmalı; bu gecikme görsel sunum konusu.

Öneri: yalnız yerel geçerli son çizimin sunum başlangıç/deadline'ını kaydet. Sunucu bitişi onayladıktan sonra yalnız kalan sunum süresini bekle; geç ACK'te uçuşu yeniden başlatma. Timeout/ret/oda değişiminde yerel sunum kaydını temizle. Rakibin bitirmesi, sürenin dolması veya geçmiş sonucu açma, yerel başarı animasyonu üretmesin.

Kabul: hızlı ACK uçuşu kesmez; 1200 ms gecikmiş ACK yeniden 1040 ms bekletmez; ret puan/sonuç yaratmaz; live update ile HTTP aynı kelimeyi iki kez oynatmaz. Resmî `room/view`, sonuç, puan ve kayıt yalnız sunucudan gelir.

## 3. Tek sonuca geçiş yaşam döngüsü; kayıt animasyondan bağımsız

Kaynak: `Solo.tsx:57,73,85–95,124–128,144`, `Arena.tsx:23–31`, `useResultPresentation.ts:10–18`. Ortak hook background'da beklemeyi bitirirken Solo ve Arena'nın ayrı timeout yollarında aynı dinleyici yok. Solo bulut birleştirmesiyle son kelime geldiğinde de taze yerel tamamlamaymış gibi 1040 ms bekler. Bunları yeni hareket fazlarıyla çoğaltmak yerine aynı sunum sözleşmesine almak daha düşük riskli.

Öneri: görünür ve yerel tamamlamaya ait sunumu ortak fazlarla yönet. Background/pagehide, reduced motion, yeni scope ve kullanıcı atlaması her fazı idempotent temizlesin. Tahtayı incele açılışı yalnız sunumu kapatsın; ilerleme yazımı ve ödüller mevcut derhal yazılan yolda kalsın.

Kabul: son kelimede kayıt hemen complete olur; ekran gizlenip döndüğünde yarım/fazı takılmış kutlama kalmaz; restore/history anında sonuç veya inceleme gösterir; scope değişimi eski timer'ı yeni bölüme taşımaz; art arda atla/devam et ödülü çift vermez. `tests/solo-resume.test.ts` ve `tests/result-presentation.test.ts` bu sözleşmeyle genişletilebilir.

## Doğrulama sınırı

Başlangıçta `result-presentation`, `word-feedback`, `solo-resume` test dosyalarındaki 32 test geçti. Bunlar gerçek TypeScript modüllerini kontrollü saat/hook/DOM taklitleriyle çalıştırır; React StrictMode, gerçek DOM yerleşimi, fiziksel iPhone veya FPS doğrulaması değildir. Nihai diff ayrıca gözden geçirilmelidir.

## Uygulama sonrası dar diff incelemesi

Ortak hook, yerel başlangıç zamanından kalan gecikme ve 1040 ms sonrası 220 ms çıkış eklendikten sonra aynı üç test dosyasındaki 36 test geçti. Arena `accept` içindeki sürüm/oda/tur korumaları ve referansla güncel `isPending` denetiminde ek hata bulunmadı. Günlük `receive` ve `confirmed` aynı senkron görev içinde çalışıyor; mevcut React batching sırasını bozan bir async sınır yok.

Bir yaşam döngüsü açığı koordinatöre iletildi: yeni `useResultPresentation` etkisi `!done` iken erken döndüğü için yerel `prepare()` ile sunucu onayı arasında background/pagehide/reduced dinleyicisi kurulmuyor. Gerçek hook mevcut test harness'iyle bellek içinde çalıştırıldı: `prepare → nativeHide/pageHide/reduce` üç yolunda da `isPending() === true` kaldı. Mevcut testler önce `done=true` yaptığı için bu pencereyi kapsamıyordu. İptal dinleyicileri bekleme başladığında kurulmalı; zamanlayıcılar yalnız resmî bitişte başlamalı. Yeni kapsamlı doğrulama sonucu koordinatörün nihai sürüm kaydında yer alır.

**Düzeltme doğrulandı:** dinleyiciler artık `waiting` sırasında, sunucu onayından önce de kuruluyor; zamanlayıcılar yalnız `done` durumunda başlıyor. Kapsamlı `wasPrepared` makbuzu, iptal edilmiş uçuşun Arena onayında yeniden başlatılmasını engelliyor. İstek hatasında Arena/Meydan sunum beklemesi temizleniyor; sunucu sonucu ve ilerleme değişmiyor. Eklenen pre-ACK background/pagehide/reduced testi geçti. Son incelemede `result-presentation`, `arena-terminal`, `solo-resume` dosyalarının toplam **46 testi geçti**; atanmış sunum/yaşam döngüsü kapsamında açık engelleyici bulgu kalmadı. Bu sonuç görsel/telefon/FPS kabulü değildir.
