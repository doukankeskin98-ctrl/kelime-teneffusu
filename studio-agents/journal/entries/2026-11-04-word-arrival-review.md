# 4 Kasım 2026 · Kelimenin listeye varış sırası

Rol: `ios_reliability_review`. İncelenen kaynak `/private/tmp/kt-device-settings-fix`, taban `2f0b8ab` / 0.34.0. Kapsam: common WordList/MobileTargets/PlayLayout, WordFeedback, Solo sonuç kapısı ve Arena terminal sunumu. Uygulama/test kodu değiştirilmedi; test, build veya cihaz çalıştırılmadı. Haptikler kullanıcı tarafından onaylandı ve bu görevin dışında.

## 1. Varış beklemesi yalnız sunuma ait olmalı; bütün iptal yolları hedefi kesinleştirmeli

Kanıt: `components/game/common.tsx:64–79` doğrulanan strokes üzerinden found sınıfını, check işaretini, çizgiyi ve gizli cevabın açılmasını aynı render'da uygular. `WordFeedback.tsx` ise sonraki efektte bağımsız uçuş başlatır. Uçuşu yavaşlatmak tek başına listeyi bekletmez; hedef uçuş başlamadan tamamlanmış görünür.

En küçük güvenli düzen: authoritative strokes/done, kaydetme, puan, tekrar-kabul engeli, erişilebilir found bilgisi ve ipucu/odak kuralları hemen güncellensin. Yalnız görsel check/strike/landing, başlayan uçuşun varışına bağlansın. Kısa başlangıç vurgusu → ölçülmüş harf kaynaklarından hedef gliflerine yaklaşık 650–760 ms uçuş → kısa yerleşme; tek ortak süre sözleşmesi kullanılsın. DOM üstüne geçici arrival durumu ekleniyorsa ilk boyamadan önce kurulmalı; normal useEffect ile sonradan gizlemek ilk karede çizgi/check parlamasına neden olabilir.

Kesinti sahipliği: aynı split grubuna yakın zamanda iki parça kabul edilirse, ilk uçuşun cleanup'ı ikinci hâlâ sürerken hedefi açmamalı. Destination başına token/sayaç veya son uçuş sahibi tutulmalı. Dört-uçuş limitiyle eviction, animation API hatası, görünmeyen hedef, no-op plan, pause/blur/background, orientation, scope değişimi ve unmount hedefi asılı gizli bırakmamalı. Reduced motion/restored state doğrudan son sunumu göstermeli. Uçuş sonucu kabul/ödül üretmemeli.

Anlamlı test: gerçek WordFeedback + hedef DOM davranışında kabul anında kayıt/board strokes değişsin, arrival öncesi yalnız check/strike beklesin, arrival'da bir kez kesinleşsin. İki aynı-grup uçuşu ve erken iptalde token sahipliği, ardından üçüncü kabul/restore yanlışlıkla yeniden animasyon üretmesin. `tests/word-feedback.test.ts` mevcut ölçüm/cleanup harness'i uygundur; sadece helper süresini doğrulamak yeterli değildir.

## 2. Solo'nun 380 ms sonuç kapısı uzun son-kelime uçuşunu örter

Kanıt: `components/game/Solo.tsx:50,66,140,151` complete hemen oluşurken `resultReady` 380 ms sonra sonuç modalını açar. Yeni 650–760 ms uçuş son kelimede ortasında kesilecektir. Kayıt ve tamamlama `Solo.tsx:80–88,106–113` ile zaten görsel kapıdan bağımsızdır; bu ayrım korunmalı.

En küçük öneri: yalnız sonuç modalı için varış + kısa landing süresine uyumlu ortak sunum gecikmesi. Son kelime kabulünde readOnly ve kayıt hemen; bölüm sonu birkaç yüz milisaniye sonra. Uçuş iptal olursa sonucu sonsuza dek bekletmeyen bounded fallback bulunmalı. Kaydedilmiş tamamlanmış bölümü açma, reduced motion ve mevcut “Sonuca geç” etkileşimi anında sonuç vermeli. Başarı/haptik yeniden üretilmemeli.

Anlamlı test: gerçek Solo harness'inde son kabul → save.complete/strokes hemen kalıcı → sonuç varış öncesi yok → landing sonrası tek modal → next doğru bölüm. Tamamlanmış restore, skip, background/unmount ve reduced-motion durumları gecikmeyi/ödülü tekrar üretmesin. Mevcut `tests/word-access.test.ts` gerçek Solo/persist/next testleri başlangıç noktasıdır.

## 3. Arena final onayında sadece modalı geciktirmek uçuşu geri getirmez

Kanıt: `components/game/Arena.tsx:93–104` finished geldiği an modalı gösterir ve `wordListUnavailable={finished||leaving||rules||ranking}` gönderir. `common.tsx:108` bu değeri WordFeedback paused'a aktarır. Final onay/finished tek room güncellemesindeyse ledger yeni stroke'u görünmezken tüketir; uçuş hiç başlamaz. Bu mevcut kaynak sırasıdır, fiziksel gözlem iddiası değildir.

En küçük öneri: authoritative finished/score/clock/readOnly durumunu hiç geciktirme. Sonuç görünürlüğü ve efekt kesintisini kontrol erişiminden ayır: finished tahta, yerel oyuncuya yeni onaylı son stroke geldiyse kısa arrival penceresinde okunabilir kalsın. Kurallar/ranking/leaving modalları, arka plan ve restore gerçek kesinti olarak kalsın. Rakibin bitirmesi/süre dolması/önceden bitmiş odaya girişte yeni yerel kelime yoksa sahte uçuş veya gereksiz bekleme yaratma. Round/scope değişiminde bekleyen callback yeni maça taşınmamalı.

Anlamlı test: gerçek `tests/arena-terminal.test.ts` harness'inde final claim + finished aynı revision, finished SSE'nin claim yanıtından önce gelişi, rakibin bitirişi, terminal restore ve rematch. Tek sonuç/tek başarı, anında readOnly, yeni onay varsa tek varış; yeni round'da eski timer/arrival state bulunmamalı. Worker/Arena otoritesi ve haptikler değişmemeli.

## Ölçüm ve kapsam sınırı

Harf kaynağı ve hedefi görünür DOM gliflerinden ölçülmeli; ters/turned stroke aynı gerçek harflerden çıkmalı. Gizli çok parçalı cevapta henüz bulunmayan parça ölçüm veya uçuş metni üzerinden açılmamalı. MobileTargets bulma anında sonraki karta geçebiliyor (`common.tsx:42–45`); görünmeyen eski grubun listesi sıfır geometri verirse güvenli görünür fallback veya mevcut kart için yalnız sunumsal bekleme gerekir. Bütün ölçümler DOM yazılarından önce toplansın; pointer hot-path'e yeni ölçüm veya React state eklenmesin.

Bu rapor tasarımın kaynak üzerindeki güvenilirlik incelemesidir. Kullanıcının istediği okunurluk, “harfler gerçekten yerine yerleşiyor” hissi ve süre tercihi gerçek cihaz videosu/gözlemiyle ayrıca doğrulanmalıdır; test geçişi bu hissin kanıtı değildir.

## Uygulama delta incelemesi

Son uygulama salt okunur incelendi. WordFeedback layout effect ile ilk boyamadan önce arrival işaretini kuruyor. Kaynak fontu/hücre merkezi ve hedef metnin Range glif kutuları DOM yazılarından önce ölçülüyor; 720 ms uçuş, en fazla 84 ms kademelendirme ve 180 ms landing, 1040 ms ortak sonuç kapısının içinde kalıyor. Son harfin finish'i ve bütün cleanup yolları destination başına referans sayacını idempotent olarak bırakıyor. Çakışan iki aynı-grup uçuşu, interruption ve gerçek eşit olmayan glif ölçümleri yeni WordFeedback test kaynaklarında kapsanmış. Haptik kaynaklarında diff yok.

Solo yalnız görsel sonuç süresini değiştiriyor; kayıt/readOnly/ödül yolları değişmiyor. Arena kontrol erişimini finished durumda kilitli tutup WordFeedback kesintisini `feedbackPaused` ile ayırıyor; sonuç kapısı yeni yerel onayla active→finished geçişinde gecikiyor. İlk delta'daki `previous.phase !== 'finished'` koşulu waiting/ready restore'u da gereksiz geciktirebileceği için bildirildi; son kaynakta `previous.phase === 'active'` olarak daraltıldığı doğrulandı.

İnceleme sırasında eski `target-settle` ile yeni landing arasında transform çakışması olabileceği söylendi; keyframe kaynağı okununca eski efektin **yalnız opacity** kullandığı görüldü ve bu not koordinatöre hemen düzeltildi. Bu bir kesin çift-bounce hatası değildir. Son CSS eski found animasyonunu ayrıca bastırarak varış için tek landing efektini bırakıyor.

Son okumada kesin açık kod engeli bulunmadı. Yeni Arena sonuç kapısının testleri için koordinatöre kontrollü timer ile şu üç senaryo önerildi: active→finished ve yeni own stroke sırasında anında readOnly, varış öncesi modal yok/1040 ms sonra tek modal; aynı-key ready→finished restore'da anında sonuç; round/scope değişiminde eski timer'ın yeni maça taşınmaması. Bu kayıt anında arena-terminal diff'inde yeni davranış testi yerine yalnız fixture uyarlaması görünüyordu; testlerin sonraki eklenme/çalıştırma sonucu koordinatörün doğrulama kaydına aittir. İnceleyici test veya fiziksel cihaz çalıştırmadı.

### Son yerleşim ve regresyon kapanışı

Koordinatörün final-word görsel QA'sında bulduğu tahta küçülmesinin dar düzeltmesi kaynakta okundu: Solo aside sonuç düğmesi `completed && resultReady` ile, Arena aside sonuç düğmesi `finished && resultRound === soundKey` ile açılıyor. Bekleme sırasında Arena yeni akış öğesi eklemek yerine mevcut footer sıralama düğmesini “Sonuca geç” olarak kullanıyor; bu eylem yalnız sonuç kapısını açıyor. Solo skip kontrolü absolute konumla akış dışına alınmış. Bitmiş/readOnly durumu ve gerçek kayıt süresi ertelenmiyor. Bu değişikliklerde kesin açık engel görülmedi.

`tests/arena-terminal.test.ts:124` kontrollü timer ile son onayda anında kilit/1040 ms sonra sonuç, reduced motion/lobi restore'unda anında sonuç, skip ve başka round geldiğinde eski timer iptalini kapsıyor. `tests/solo-resume.test.ts:204` son kelimenin anında complete/readOnly olmasını ve yalnız modalın 1040 ms beklemesini denetliyor. Böylece önceki test-kapsamı notu kapandı. Test kaynakları okundu; inceleyici testleri yeniden çalıştırmadı.

Koordinatör tüm 691 testin ve yeni hedefli kontrollerin geçtiğini, gerçek sürükleme kullanılan görsel önizlemede son kabul boyunca tahta geometrisinin x=10, y=172.5, 394×394 olarak korunduğunu ve dört harf uçuşunun görüntüsünü kaydettiğini bildirdi. Bunlar koordinatörün doğrulama kanıtıdır; bu alt inceleme bağımsız tarayıcı/fiziksel iPhone ölçümü değildir. Son dar güvenilirlik incelemesinde açık engelleyici bulgu kalmadı.
