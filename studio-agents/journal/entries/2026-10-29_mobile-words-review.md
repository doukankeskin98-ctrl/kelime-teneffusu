# 29 Ekim · mobil kelime erişimi · dar deneyim incelemesi

Başlangıç: koordinatörün açtığı Site28 / 0.12.6, helper `b9969c10fcc9236c5ac303b9060f86eb78355827`; GitHub `232629509f8b75dd75f1b0a861c157a46e0493c6`, eş ağaç `905ff88778ea9bfa110b516f17ba888819a61206`. Kök sözleşme, README, sürüm/harita belgeleri, son defter/öncelikler, evening-daily-recovery-validation, deneyim rolü dosyaları ve strateji/marka/oyuncu bağlamı okundu. Uygulama/test salt okunur; yalnız bu dosya yazıldı. Bugünün yeni içerik çifti koordinatördedir.

Kullanıcının doğrudan sinyali kelimeleri görmek için yukarı kaydırma gereğidir. Bu tur telefon/DOM gözlemi, VM çalıştırması, ekran görüntüsü veya FPS ölçümü yapılmadı. Bulgular güncel kaynak/markup/CSS kanıtıdır. Önceki düzeltmeler eski kusur gibi yeniden raporlanmadı: hedeflerde iç scroll kaldırılmış; tahta kalan yüksekliğe uyar; tanım/cevap intrinsic alanı korunur; Solo/Gizli Tema bitmiş incelemesi gerçek pause'tan ayrılmıştır.

## Öncelik ve seçim önerisi

| Sıra | Aday | Etki / kanıt | Maliyet / risk |
| --- | --- | --- | --- |
| 1 | Tahta yakınından açılan güncel Kelimeler yüzeyi | Kullanıcının doğrudan şikâyetine karşılık gelir; mevcut tek liste konumu kaynakta kesin, cihazdaki mesafe/etki ölçülmedi | Küçük-orta; doğru confirmed veri ve tek modal yönetimi şartıyla orta risk |
| 2 | Arena bitmiş tahtasının duraklatılmış görünmesi | Sonuç kapatılınca harf/çizgi incelemesi kaynakta engelleniyor | Küçük; finished/clock/claim sınırını korumak şartıyla düşük-orta risk |

**Tek odak önerim 1.** İkinci aday bu odak düzeltmesini büyütmemeli; ayrı sonraki iş olabilir. Yeni üçüncü aday üretmek için kapsam genişletilmedi.

## 1. Hedefler hâlâ yalnız tahtanın üstündeki kaydırılabilir sayfa konumunda

**Kaynak:** `components/game/common.tsx:47–67`, `app/mobile-game.css:15,22,25`, `app/crafted-play.css:23,34`, `lib/game/viewport.ts:1–6`; mod çağrıları `Solo.tsx:113`, `Sprint.tsx:21`, `Arena.tsx:50`, `Mystery.tsx:35`.

**Kanıt:** Mobilde `.targets-panel` `order:-1` ile tahtadan önce görünür. Hedef listesi `max-height:none;overflow:visible`; kelimeleri kesen eski iç scroll yok. Ancak liste normal sayfa akışında, yakın bir yeniden açma eylemi yok. Ortak PlayLayout DOM'u board-panel ve ardından aside üretir; mobil görsel sıra CSS ile ters çevrilir. Tahta boyutu okunabilir hücre alt sınırının altına zorlanmaz ve zoom sığdırmayı devre dışı bırakır. Dolayısıyla doğal sayfa kaydırması/büyük yazı/zoom kullanılan durumda tahtaya gelmiş oyuncunun hedeflere geri erişimi aynı üst konuma dönmeye bağlıdır. Gizli Tema'nın bağlantı kartı ve Arena'nın Altın Kelime açıklaması da aynı üst aside içindedir.

**Oyuncu faydası / varsayım:** Tahtanın yanından hedeflere ulaşmak, kullanıcıya kelimeleri tekrar hatırlamak için sayfanın başına dönmeden kısa bir bakış sağlayabilir. Bu, bütün telefonlarda aynı anda tüm öğelerin sığmadığına veya belirli bir süre kazanıldığına dair ölçüm değildir.

**Küçük öneri:** Mevcut açık hedef listesini koru; tahta yakınından erişilen açık adlı bir **Kelimeler** düğmesiyle aynı güncel WordList'i yerel bir pencerede sun. Ayrı sözlük, hedef sırası, arama kuralı veya bulunmuş kayıt türetme sistemi kurma. Kalabalık listenin tamamını sticky yapıp tahta alanını kapatma; metni küçültme/kırpma veya iç scroll zorunluluğuyla eski soruna dönme. Yeni pencerenin doğal büyük metin kaydırması güvenli kalabilir. Board hit/yerleştirme kodu değişmeden, aç/kapa sırasında mevcut tahta/zoom konumunu koru.

### Verinin doğru aktarılması

| Akış | Yeni listede kullanılacak kesin kaynak | Özellikle korunacak sınır |
| --- | --- | --- |
| Solo / tarihli bölüm / günlük | Mevcut WordList'in `board`, `save.strokes`, `journey?.clues` girdileri (`Solo:113`) | PlayLayout'a giden optimistic `pending` çizgisi listede bulunmuş sayılmaz. Günlük belirsiz işlem süresince yalnız onaylı kelimeler değişir. |
| Arena | `board`, `room.you.strokes`, güncel `golden` (`Arena:49–50`) | Rakibin/optimistic pending'in çizgisi oyuncunun bulduğu kelime sayılmaz; golden pencere açıkken değişirse liste ve ×2 işareti güncellenir. |
| Arkadaşının İzinde | `view.board`, `view.strokes` (`Challenges:32–33`) | `displayed` pending birleşimi yalnız tahta içindir; listeye taşınmaz. |
| Gizli Tema | `visibleBoard`, `save.strokes` (`Mystery:33–35`) | Çözülmemiş gizli bonus yeni yüzeyde açığa çıkmaz; bağlantı çözülünce gerçek görünür hedef eklenir. |
| Hızlı Tur | `state.board`, `state.strokes` (`Sprint:21`) | Yeni tur/round gelince önceki dört kelime açık pencerede kalmaz; sonuç/countdown önceliği korunur. |

`WordList` grup ve parça hesabı tek kaynaktır (`common:27–44`): grup yalnız bütün parçaları bulununca tamamlanır. Düğmenin grup sayısını mevcut parça sayacıyla karıştıran yeni “N kaldı” hesabı eklenmemeli; ya yalnız “Kelimeler” denmeli ya mevcut doğru sayaç anlamıyla taşınmalı. İpucu Avı gizli cevap/harf sayısı/iki ölçü yüzü ve erişilebilir ad, golden işareti, kısmi uzun adlar aynı bileşenden gelmeli. Genel PlayLayout `strokes` prop'u, confirmed ile pending'i ayıramadığı için bu listeye kaynak olamaz.

### Pencere, odak ve saat kabulü

- Tek anda bir oyun penceresi: yardım, çıkış, Mystery tahmin, sonuç veya geri sayım açıldığında Kelimeler kapanmalı veya hiç açılamamalı. Solo sonucun help/exit guard'ı (`Solo:118–120`), Mystery choose/help/result (`Mystery:37–39`), Arena rules/leaving/result ve Sprint finish/exit/countdown üzerinde üst üste dialog bırakılmamalı. Özellikle pencere açıkken son sunucu yanıtı veya süre bitişi sonuç açabilir.
- `common.tsx:26` Modal mevcut native dialog ve body overflow cleanup kullanır. Yeni yüzey bunun yaşam döngüsünü izlemeli; programatik kapama sonrası odak canlı açıcıya, açıcı unmount olmuşsa güvenli oyun başlığına dönmeli. Escape ve Kapat çalışmalı; erişilebilir adı açık olmalı. Gerçek native odak davranışı VM'de doğrulanmış sayılmaz.
- Aç/kapa yeni claim/hint/save/pause/start/replay dispatch'i, tohum veya skor değişikliği üretmemeli. Günlük saati (`Solo:104`), Arena saati (`Arena:30,48`), kayıtlı meydan okuma süresi ve Sprint tick'i (`Sprint:16`) sürmeli. Liste açmak yarışmayı durdurma yolu olamaz; Solo'nun mevcut ara verme davranışı yanlışlıkla değiştirilmemeli.
- Zoom, board yatay kaydırma ve sayfa konumu aç/kapa sonrası korunmalı; metin büyütmede veya yatay görünümde düğme/listenin içeriği kesilmemeli. Boyut/blur nedeniyle mevcut yarım seçimin güvenle temizlenmesi korunmalı; kapanan pencereden eski bir seçim commit olmamalı.
- Kaynak/markup kabulleri: bütün modlarda düğme doğru güncel hedef kaynağını açar; onaysız hamle bulunmuş gösterilmez; pending onay/ret, golden değişimi, parçalı ad, İpucu Avı, Mystery bonus açılışı, Sprint yeni round ve sonuç-önceliği sınanır. Kabul için 360×640/390×844, normal/büyük yazı, zoom ve gerçek native scroll/focus ayrıca destekli ortamda gözlenmelidir; kaynak kontrolü bunun yerine geçmez.

## 2. Arena sonucundan dönüşte bitmiş harfler hâlâ gizleniyor

**Kaynak:** `components/game/Arena.tsx:48–54`; `components/game/Board.tsx:43–46`; ortak readOnly sunumu `common.tsx:47,67`.

**Kanıt:** Arena sonuç penceresini kapatma `setReview(true)` yapar (`54`), fakat PlayLayout hâlâ `paused={countdown>0||seconds<=0||finished}` alır (`50`). Board pause'ta harfleri `·` yapar, bulunan çizgileri çizmez, “Hazır olduğunda devam et” katmanını ve duraklatılmış erişilebilir adını gösterir (`43–46`). Sonuç kapalıyken oyuncu hedef listesini görse de bitmiş tahtadaki yerlerini inceleyemez. Solo/Gizli Tema için eklenmiş readOnly ayrımı Arena'ya taşınmamıştır. Bu bir kaynak akışı bulgusudur; cihazda denenmiş hata değildir.

**Oyuncu faydası / varsayım:** Sonucu kapatan oyuncunun bulduğu kelimelerin konumunu yeniden görebilmesi, tamamlanma sonrası anlamlı bir dönüş sağlayabilir. Keyif veya tekrar oynama etkisi ölçülmedi.

**Küçük öneri:** Ayrı sonraki işte Arena finished incelemesini gerçek countdown/pause'tan ayır; var olan readOnly görünümünü kullan. Tamamlanan odada hiçbir yeni claim açılmasın; eski zaman sınırı, puan, sunucu doğrulaması ve rövanş aynı kalsın.

**Kabul:** Sonuç kapatılınca harfler ve onaylı çizgiler görünür, açık inceleme metni vardır; yeni drag/tap/Enter/Space claim üretmez. Countdown hâlâ tahtayı saklar. Zoom/ses/kurallar ve sonucu yeniden açma çalışır. Süre0 olup finished yanıtı henüz gelmediğinde yeni hamle hâlâ engellenir. Bu aday 1 numaralı hedef erişimi değişikliğine kendiliğinden eklenmemeli.

## Sınırlar ve devir

Koordinatörün toplu metrics notu odağı değiştirmedi: yakın dönem az app_open ve eski client_error sayımları kelime erişimi, performans veya yeni sürüm arızası kanıtı değildir; root'un veri okuması bu uzman tarafından yapılmış sayılmaz. Yeni kök neden veya kullanım/retention sonucu türetilmedi.

Önizlemenin önceki `ERR_CONNECTION_REFUSED` engelinde somut recovery yok; aynı deneme veya alternatif browser/server çalıştırılmadı. Gerçek telefon/DOM/büyük yazı/native dialog/scroll/ekran okuyucu/FPS doğrulaması yok. Testler veya uygulama değiştirilmedi; geniş test tekrarı, grafik, dış araştırma, yeni ajan/servis/bağımlılık kurulmadı. Son diff incelemesi uygulamadan sonra ayrıca istenebilir. Uygulama, içerik, kontroller ve yayın koordinatördedir.

## Aynı tur · uygulamanın dar son kaynak incelemesi

Koordinatörün ilk uygulama diff'i okundu: `common.tsx`, beş çağıran oyun bileşeni, `word-card.ts`, son CSS importu ve yeni `word-access.css`. Bu uzman uygulama veya test yazmadı. İnceleme anında koordinatör typecheck'in geçtiğini, anlamlı yeni testlerin hazırlanmakta olduğunu bildirdi; tamamlanmamış testler geçirilmiş sayılmadı.

**Son kaynak sonucu:** Bu değişiklikte açık yayın engeli oluşturan somut kaynak kusuru bulunmadı. İlk öneri, yalnız onaylı hedefleri tahta yakınından açan küçük yüzeye dönüştürülmüş. Aday 2 Arena bitmiş incelemesi bu değişikliğe eklenmemiştir; tamamlandı sayılmaz.

- `common.tsx:27–38`: `BoardWords` yalnız kendi aç/kapa durumunu yönetiyor; mevcut WordList'i kullanıyor. Yerel özet ve düğme açıkça “hedef” sayıyor. `word-card.ts:8–14` görünür grubu ancak tüm parçaları onaylandığında tamamlıyor; yanlış/yabancı stroke sayıyı büyütemiyor. `WordList`'in tanım/cevap, parçalı ad ve golden sunum gövdesi korunmuş (`common:39–56`).
- Caller başına tek veri objesi hem aside'a hem yeni yüzeye gidiyor: `Solo.tsx:113–114` confirmed `save.strokes` ve `journey?.clues`; `Arena.tsx:50–51` confirmed `room.you.strokes` ve güncel `golden`; `Challenges.tsx:33–34` confirmed `view.strokes`; `Mystery.tsx:35–36` filtrelenmiş `visibleBoard`; `Sprint.tsx:21–22` gerçek güncel round tahtası/strokes. Tahtanın optimistic pending çizgileri yeni listeye yanlış kaynak yapılmamış.
- `common.tsx:79`: BoardWords normal akışta seçim önizlemesi ile tahta arasına eklenmiş; harf üzerine katman koymuyor. paused/readOnly/inputBlocked veya caller'ın overlay engeli bileşeni renderdan çıkarıyor; açık pencere state'i de onunla kalkıyor. Varsayılan kimlik tahta/grid/görünür hedeflerden türetiliyor; Arena/Challenges ayrıca room/view kimliğini veriyor. Yardım/çıkış/tahmin, Sprint geçiş/countdown/finish ve Arena finished/rules/leaving durumları açık eski listeyi yeni bağlama taşımıyor.
- `common.tsx:32–36`: kapatma RAF'ı önceki denemeyi iptal ediyor, yalnız bağlı açıcıya `focus({preventScroll:true})` çağırıyor; unmount cleanup RAF'ı iptal ediyor. Native Modal yaşam döngüsü tekrar kullanılıyor. Yeni açık/kapalı state hiçbir pause/claim/hint/save/start/replay çağrısına bağlı değil; caller saat/reducer effect'lerinde diff yok. Pencere metni sürenin işlemeye devam ettiğini açıkça söylüyor.
- `app/word-access.css:2–18`, `app/layout.tsx` son import: 44 px doğal akış eylemi, görünür odak, sarılan metin ve intrinsic liste ızgarası var. Gizli tanım/cevap yüzünün alanı korunuyor; listede fixed metin yüksekliği veya kırpma yok. Bulunmuş etiketin pasif pencerede tekrar animasyonu kapatılmış. Board, motor, katalog ve ana progress dosyalarında bu incelemedeki diff boş; hit eşleme/kelime/puan kuralları değiştirilmemiş.

**Kalan doğrulama sınırı:** Normal akıştaki yeni eylem ekran bütçesine ek alan tüketir; kaynakta harfleri örtmez ancak kısa telefon/büyük yazıda toplam görünümü iyileştirdiği henüz ölçülmedi. Gerçek native dialog odak dönüşü, programatik kapanışta sonuç dialogu önceliği, body overflow cleanup, sayfa/zoom yatay scroll konumu ve küçük ekran sığması DOM/telefon kontrolü ister. Bağlı açıcı yoksa kod onu zorla odaklamaz; yeni üst pencerenin native odağı gerçek tarayıcıda gözlenmelidir. Kaynak/VM sözleşmesi bu gözlemin yerine geçmez.

Koordinatörün anlamlı testleri, son üretim derlemesi/HTTP, tam kaynak eşleşmesi/CI ve yayın sonucu ayrıca kendi doğrulama kaydında tamamlanmalıdır. Bu günlük tek başına test veya yayın makbuzu değildir.

### Son test kaynağı incelemesi · 0.12.7 hazırlığı

`tests/word-access.test.ts`, `daily-ui.test.ts` ve `completed-review.test.ts` ekleri ile son ortak bileşen/helper diff'i okundu. Yeniden test çalıştırılmadı; uygulama/test dosyası değiştirilmedi. Test kaynaklarında yeni engel bulunmadı. Koordinatör ilk dar paket için **37/37** bildirdi; ardından empty-dialog ve anahtar/baseline assertion'ları güçlendi. İncelenen son word-access dosyası 12 `it` içeriyor; ilk bildirilen 37 sayısı son tam paket sonucu olarak genellenmez. Son tam test/tip/içerik/derleme kapıları koordinatörde sürmektedir.

- `word-access.test.ts:22–31`: gerçek TSX gövdeleri TypeScript ile VM'e yüklenir; hook, saat, RAF, document/dialog ve ağ sınırları kontrollüdür. Bu, yalnız benzer sahte UI'yi test etmekten daha somut kaynak sözleşmesi kanıtıdır; React/native DOM çalıştırması değildir.
- `40–77`: boş liste eylemi yok; split grupta bütün parçalar onaylanmalı, yinelenen/yabancı stroke sayılmaz. Board'a gelen pending/zoom girdisi korunurken WordList ayrı confirmed veri alır; eylem board-stage dışında, guards ve room/board anahtarı sınanır. Aç/kapa, canlı golden/strokes güncellemesi, bağlı açıcıya `preventScroll` isteği, ayrılmış açıcıya dokunmama ve RAF cleanup kontrolleri vardır. Gerçek WordList'te İpucu Avı görünür/ARIA yüzleri; gerçek Modal handler'ında X/Escape/backdrop ve body overflow cleanup yolu denetlenir.
- `80–103`: actual Arena/Challenges/Solo/Sprint gövdelerinin confirmed/pending ayrımı, timer ilerlemesi, clues, hint sayısı, exit/result/round/finish guard girdileri sınanır. `daily-ui.test.ts` eki onay öncesi liste sayılmamasını, gerçek günlük cevabından sonra listeye geçişi ve yardım engelini; `completed-review.test.ts` eki Mystery gizli bonusunun görünmemesini ve choose→çözüm geçişini kapsar.
- **Kesin kapsam sınırı:** Caller testleri BoardWords'ü ayrı bir kontrollü VM'de açıyor; gerçek React ağacındaki iç içe child mount/unmount veya native modal önceliği yürütülmüyor. Key/guard testleri doğru kaynak prop/çıktısını doğrular; browser'da eski dialogun top-layer'dan kalktığını ölçmez. `focus({preventScroll:true})` argümanı ve sahte dialog cleanup'ı doğrulanır; gerçek odak, sayfa scroll'u, zoom `scrollLeft/scrollTop`, erişilebilirlik ağacı, CSS sığma, büyük yazı ve fiziksel dokunma ölçülmez. Saat assertion'ları bu kontrollü composition sınırındadır; üretim timer/provider/FPS iddiası çıkarılmaz.

Son kaynak yaklaşımı ve anlamlı yalıtılmış sözleşme kapsamı uygun görünüyor; gerçek cihaz/DOM sınırı açık kalır. Bu ek, koordinatörün son kalite kapıları veya gerçek yayın makbuzunun yerine geçmez.
