# Canlanan hikâye · Güvenilirlik bağlantı incelemesi

31 Ekim 2026. Salt okunur başlangıç incelemesi, kaynak 0.20.0. Koordinatör beş yeni, sabit yazılmış hikâye/anlam zinciri bölümü uyguluyor. Bu not yeni özelliğin uygulanmış olduğunu veya kabulden geçtiğini söylemez. Uygulama, canlı veri, şema ve yayın değiştirilmedi; yalnız bu günlük yazıldı.

## 1. Sıralı hedef, hamle ve ipucu kabulünde aynı kuralla korunmalı

Kaynak: `components/game/Solo.tsx:95–108,119–123`, `lib/game/engine.ts:28–38,84–89`, `lib/game/progress.ts:42–47`, `lib/game/word-card.ts:9–21`; benzer mevcut saklı hedef guard'ı `components/game/Mystery.tsx:22–33`.

Mevcut Solo her doğru tahta hedefini kabul ediyor. Görünür listeyi tek hedefe indirmek bu kabulü değiştirmez. İpucu ise authored kelime sırasını değil, üreticinin uzunluğa göre yerleştirdiği `placements` sırasını kullanıyor. Hikâye bunu doğrudan devralırsa ilerideki parça erken canlanabilir veya ipucu henüz açılmamış kelimeyi gösterebilir. Bunlar mevcut serbest Solo için hata değil; yeni sıralı modun somut entegrasyon riskidir.

Gerçek modüllerle yalıtılmış probe: uzay-1'in aktif ilk grubu 0 iken `placements[0].group=3`, sonraki kelimenin full-board `match` sonucu group1. Yalnız group0 bulunan kayıt full board ile `complete=false`, tek gruba filtrelenmiş board ile `cleanSave` sonucu `complete=true`. Bu yüzden saklama/bitirme tahtasını filtrelemek erken yıldız ve sonuç üretebilir.

Öneri: hikâye aktif aşamasını ayrı kalıcı sayaçtan değil doğrulanmış stroke kimliklerinden ve authored grup sırasından türet. Çok parçalı bir hedef varsa bütün parçaları bulunmadan aşama ilerlemesin. `commit` içinde full-board eşleşmesi sonrası, stroke/ses/telemetry/save değişiminden önce aktif grup guard'ı; `useHint` içinde aynı aktif grubun kalan placement'ı. Hamle anında `foundRef.current` kullanılması aynı render arası çift girişte aşamayı güncel tutar. `cleanSave`, complete, yıldız ve toplam hedef sayısı full board'a dayanır; yalnız WordList/BoardWords sunumu geçmiş ve aktif hedeflerle sınırlanır. Gelecek tanım/cevaplar HUD, aria-label, zoom penceresi veya odak düğmesi üzerinden açıklanmamalı. Normal Solo'daki tercih edilen odak, hikâyenin sıradaki grubunu değiştirmemeli. Pause/help/exit/review guard'ları korunmalı.

Kabul: sonraki gerçek kelimenin koordinatları doğrudan commit'e verildiğinde stroke/aşama/hint/yıldız/kazanım ve başarı sesi değişmez; aktif kelime iki yönden kabul edilir; aynı hamle ikinci kez eklenmez; aktif hedef ipucu doğru group'a gider; çok parçalı hedefin yarısı aşama ilerletmez. Art arda iki callback, pause/yardım/review ve bitiş tekrarı dahil. Aynı tam board review'da görünür; filtreli listeden erken tamamlama yok. Sahne değişimi yalnız kabul edilmiş keşfin türevidir; animasyon callback'i kayıt veya ödül vermez. Azaltılmış harekette doğru son sahne doğrudan görünür.

## 2. Yeni içerik kayıt kataloğuna eklenmeli, eski ana yolculuğa karışmamalı

Kaynak: `lib/game/content.ts:5–6,40–44`, `lib/game/progress.ts:13–38,42–61`, `lib/game/discovery.ts:43–63`, `lib/game/main-journey.ts:7–14,36–44`, `components/game/Solo.tsx:32–38,69–78,113–118`, `components/game/App.tsx:75,105`, `scripts/check-content.ts:11–18`, `tests/riddle-groups.test.ts:15–32,83–89`.

En dar bağlantı: yeni ayrı `STORY_CHAPTERS` sabit dizisi, mevcut temalara ait yeni değişmez kimlikler, yalnız `PLAYABLE_JOURNEYS` içine append. `route:ID`, `journeyById`, `journeyBoard`, knownKeys, `progressBoard`, `loadProgress`, `last`, bulut birleştirme ve içerik denetimi bu kanalı zaten kullanır. `Journey` üzerindeki isteğe bağlı hikâye meta verisi veya ID'den çözülen ayrı meta veri tablosu eski kayıt şeması gerektirmez. Eski `JOURNEYS`, `ALL_JOURNEYS`, `MAIN_JOURNEY_IDS`, tema kelime bankaları ve seed/words değişmemeli; 96 ana bölüm, 32 riddle, 3/5/6 albüm kapıları korunur. Authored words sırası hedef group kimliklerini belirlediğinden yeni yayımlanan hikâyenin kelime/aşama sırası da sonradan değiştirilmemeli.

`cleanSave` koordinatları full board üzerinde doğrular, sahte complete/stars alanlarına güvenmez; bütün geçerli hedefleri sıra gözetmeden tutar. Hikâye sahnesi `strokes.length` yerine gerçek tamamlanmış authored grupları/ilk eksik grubu kullanmalı. İki cihazın geçerli önek kayıtlarının birleşimi yine geçerli önektir. Yeni kalıcı stage/scene/reward alanı eklemek mevcut birleşimin dışında ikinci doğruluk kaynağı yaratır; bu kapsam için gerekli değil. Hikâye dışındaki eski kayıtların temizleme kuralı daraltılmamalı.

`practice:true` boş tur açar; yarım tekrar kalıcı en iyi kaydı yazmaz, tamamlanan tekrar `keepBestSave` ile iyileştirebilir. Yeni hikâye ödülü varsa ayrı tekrar edilebilir talep yerine kalıcı tamamlamadan türetilmeli. Ana albüme yeni parça eklememeli. Sonraki hikâye ve son hikâye sonrası rafa dönüş özel dal ister: mevcut `nextJourneyAfter` hikâye kimliğini bulamayınca ana haritanın ilk açık eksik bölümünü önerir. App geri dönüşü de yeni hikâye rafına bağlanmalı; riddle dalı örnek olabilir.

Gerçek tam katalog + 3660 günlük tarih probe: 230 kayıt, 111.376 JSON karakteri, progress zarfıyla 111.409 UTF-8 byte; mevcut sınır 150.000 (`app/api/progress/route.ts:11`). Beş yeni kayıt sonrası gerçek bütçe testi yeniden çalışmalı. Sabit beklentiler `PLAYABLE_JOURNEYS=128` → 133 ve bilinen save=230 → 235 olabilir; 96/32 beklentileri değişmemeli. Bu sayılar uygulama beklentisidir, eklenmiş içerik kanıtı değildir.

Kabul: yeni beş ID benzersiz ve eski hiçbir ID/tahta/hash değişmemiş; her sabit board çözülebilir ve iki çapraz eğim içerir. Kısmi kayıt reload'da aynı sahne/aktif ipucuna döner; elapsed-only/hint-only kayıt sürer; complete flag sahteciliği tamamlamaz. İki cihaz birleşimi keşifleri korur; daha kötü/kısmi tekrar en iyi kaydı ve sahne hatırasını azaltmaz; iyi tekrar ödül çoğaltmaz. Hikâye bitince ana harita tamamlanma sayısı/kapıları aynı kalır. `last` round-trip, owner değişimi ve çevrimdışı yerel kayıt mevcut kanalda kalır. Beşini bitirince son CTA bitmiş bölümü yeniymiş gibi sunmaz.

## 3. Ölçüm yeni doğruluk veya ödül kaynağı olmamalı

Kaynak: `lib/game/telemetry.ts:3–13`, `app/api/metrics/route.ts:5–10`, `components/admin/AdminApp.tsx:38–44`, `components/game/Solo.tsx:58,79,95–102`.

İstemci olay tipi, sunucu allowlist ve yönetimde görünen adlar ayrı üç bağlantı. Yeni olay yalnız istemciye eklenirse sunucu 400 döndürür. `track(event,number)` ikinci sayıyı genel süre bucket'larına çevirir; aşama 1/2/3 sayıları anlamlı aşama metriği olmaz, hepsi under17'ye düşer. Mevcut izin/çevrimiçi sınır ve yalnız event+bucket payload'ı korunmalı; oyuncu kimliği, kelime/cevap, stroke, kayıt veya serbest metin eklenmemeli.

Hikâye başlangıcı, kabul edilen ilk kelime, gerçekten ilerleyen aşama ve o turdaki gerçek tamamlama uygun çağrı noktalarıdır. Render, animasyon bitti, sonuç aç/kapa veya kayıt hydrate olayları yeni başarı sayımı olmamalı. Mevcut Solo completion effect'i initial save.complete olduğunda da çalışır; bu noktaya yeni story_complete olayı körlemesine eklenmemeli. Yeni olayları canlı bir tamamlanma geçişi veya başlangıçta incomplete olan tur koşuluyla sınırla. Tekrarda oyun tamamlaması ölçülebilir, fakat kalıcı yeni ödül olarak sunulamaz. Yeni olay sayıları tekil oyuncu veya etki/retention kanıtı değildir.

Kabul: izin kapalı/offline iken istek yok; izinli kabulde tam beklenen bounded olay/bucket; gelecek/duplicate/yanlış seçimde aşama-tamamlama yok; reload/complete review/result reopen yeni complete saymaz; gerçek bitiş tek sayılır. API yeni olayları kabul eder, bilinmeyen olay/alan genişliği mevcut kurala göre reddedilir. Ölçüm başarısızlığı oyun/kayıt/ödül akışını etkilemez.

## Önerilen test yerleri ve doğrulama sınırı

- Yeni saf hikâye içeriği/aşama helper testleri: beş değişmez kimlik, sıra, split grup, görünür hedefler, tam/kısmi reload, knownKeys/bütçe, ana96/riddle32/albüm izolasyonu.
- `tests/word-access.test.ts` gerçek Solo gövdesi VM harness'i: aktif/gelecek callback, doğru hint, iki yön/çift hamle, gizli cevap erişilebilir adı, replay/next/back ve pause/help/review. Bu harness fiziksel DOM veya concurrent React kanıtı değildir.
- `tests/riddle-groups.test.ts` mevcut full-save bütçesi ve riddle sayısı beklentileri; `tests/discovery.test.ts`, `main-journey.test.ts`, `achievement-loop.test.ts`, `progress-owner.test.ts`, `progress-deadline.test.ts` eski sözleşme regresyonları.
- `scripts/check-content.ts` PLAYABLE_JOURNEYS eklerini otomatik denetler; authored hikâyenin aşama/cevap eşlemesi ayrıca test ister. Worker `/api/progress` PUT/GET, gerçek yeni hikâye kaydı ve owner izolasyonuyla doğrulanabilir.

Bu başlangıç incelemesinde iki yalıtılmış saf veri probe'u çalıştırıldı; uygulama henüz eklenmediğinden yeni özellik testi veya tam suite çalıştırılmadı. Tarayıcı, fiziksel cihaz, ses konforu, ekran okuyucu, FPS, oyuncu etkisi ve yayın doğrulaması yapılmış sayılmaz. Son diff ve test kanıtı koordinatörün uygulamasından sonra ayrıca incelenebilir.

## Uygulama farkının salt okunur incelemesi

Koordinatörün `story-content`, `StoryExperience`, `StoryScene`, Solo/App/JourneyHome/Pages, CSS ve üç telemetry bağlantısı incelendi. Test veya uygulama dosyası yazılmadı. Koordinatörün tip düzeltmesi ve davranış testleri bu inceleme sırasında sürüyordu; aşağıdaki satırlar inceleme anına aittir.

Doğrulanan bağlantılar:

- Beş yeni sabit hikâye yalnız `PLAYABLE_JOURNEYS` içine eklendi. Eski ana96/riddle32 dizilerine veya tahtalara değişiklik görülmedi. Route kaydı full board ile temizleniyor; sıradan `keepBestSave` ve practice sınırı korunuyor. Hikâye kaydı `last` ana yolculuk önerisini değiştirmiyor. Yeni stage/scene/reward saklama alanı yok.
- `Solo.tsx:97–111` gelecekteki gerçek kelimeyi `storyStage(...foundRef.current).target.id` ile, kabul/ses/telemetry/stroke öncesinde reddediyor. Yinelenen hedef daha önce eleniyor. Son hamle hesabı güncel foundRef uzunluğunda; ipucu da yalnız aynı aktif hedefin placement'ını seçiyor. Görünür liste filtreli, kayıt/complete/toplam hedef full board'da kalıyor. Serbest hedef odağı story için kapalı.
- `story-content.ts:47–51` sparse kayıtta stroke sayısını aşama sanmıyor: ilk eksik authored hedefi seçiyor. Örneğin yalnız üçüncü hedef bulunmuşsa aşama0; birinci/ikinci doldurulunca zaten doğrulanmış üçüncüyü atlayıp dördüncüye geçer. Gelecekte bulunan geçerli stroke kaybedilmez ve eksik ön hedefi erken tamamlamaz. Beş mevcut hikâyenin bütün kelimeleri tek parçalı, hedef text'i authored word ile aynı; bu kaynakta split veya eksik hedef nedeniyle yanlış complete görülmedi. Gelecekte çok parçalı hikâye eklenirse helper kapsamı ayrıca genişletilmeli.
- Yeni `story_step`/`story_complete` yalnız kabul edilmiş commit içinde ve count bucket'ı ile gönderiliyor. Initial completed review/hydration, tekrar sonuç açma, duplicate ve erken hedef bunları üretmez. Gerçek replay tamamlaması bir oyun olayı olarak sayılır, yeni ödül değildir. `story_start` yalnız incomplete tur açılışında; yeniden devam açılışı da bir açılış sayılır. İstemci/server/admin adları eşleşiyor. İzin/offline kapısı ve dar payload değişmemiş.
- Story next dalı ilk gerçek eksik hikâyeye, hepsi tamamken mevcut rafa dönüşe bağlı. Albüm kartları bitmiş kaydı practice ile açıyor. Ödül ve yıldız, önceki kalıcı kayıtla karşılaştırılıyor. StoryScene yalnız çizim; ödül veya state yazmıyor. Hidden panel ve reduced-motion CSS kuralları mevcut.

### P2 · Seçilen yolculuk yüzeyi oyundan geri dönüşte unutuluyor

Kaynak: `components/game/JourneyHome.tsx:15`, `components/game/App.tsx:76–77,106`.

Tetikleyici: ana sayfada “Bölüm yolculuğu” seç, numaralı bölüm veya oradaki İpucu Avı'nı aç, oyun içinden Geri. App Solo dalına geçince JourneyHome unmount olur; Geri yeniden mount eder ve yerel `view` koşulsuz stories başlangıcına döner. Beklenen aynı seçilmiş yolculuk yüzeyine dönmek; gerçek hikâye rafına dönüş. İlerleme silinmez, ancak korunmuş ana yolculuk akışında her dönüşte ek sekme seçimi gerekir. İlk ziyaretin stories olmasıyla çelişmeden view üst oturum state'inde korunabilir. Koordinatöre bildirildi.

Kabul: ilk ziyaret stories; journey→bölüm→Geri journey; journey→riddle→Geri journey; stories→hikâye→Geri stories. Albüm/Keşfet kökeni doğru sekmede kalır. Sekme yenilemesinde kalıcı tercih zorunlu değil. Bu bulgu kaynak yaşam döngüsü izlemesine dayanır; bu tur fiziksel DOM tekrar üretimi yapılmadı.

### P2 · Aynı render arası yinelenen ipucu çağrısı sınırı aşabiliyor

Kaynak: `components/game/Solo.tsx:108–111`. Bu sınır yeni hikâye kodunun getirdiği bir regresyon değil, mevcut Solo'dan devralınmış bir callback yarışıdır.

Tetikleyici: render'da hints=2 iken aynı onHint callback'i render yenilenmeden iki kez çağrılır. Her ikisi closure `save.hints>=3` kontrolünden geçer, her biri functional `s.hints+1` yazar; 2→3→4 oluşabilir. İpucu hedefi sıralı modda doğru kalsa da “en fazla üç” sözleşmesi aşılır ve sonuçta dört kullanım gösterilebilir; sonraki `cleanSave` üçe kırparak ekrandaki tur ile kalıcı kayıt arasında fark yaratır. Sıradan ayrı tarayıcı click olaylarının React flush etmesi bunu her çift tıklamada oluşan hata yapmaz; callback aynı render'da yinelenince kaynakta koruma yoktur.

Öneri: kabul edilen ipucu sayısını senkron ref veya güncel state sınırıyla atomik tut; reddedilen çağrı için hint sesi/hint koordinatı/mesajı da üretme. Hint'i son kelime commit'iyle art arda çağırınca foundRef tamamlanmış olduğundan kalan placement bulunmaması zaten korunuyor. Koordinatöre bildirildi.

Kabul: hints=2 iken iki aynı-tur callback sonunda en fazla3, tek kabul/ses; hints=3'te hiçbir yan etki yok. Hint→son kelime yıldızı doğru, son kelime→hint değişikliksiz. Pause/help/review sırasında doğrudan callback'in de değişiklik üretmemesi ayrıca sınanabilir. Bu tur yeni probe/test yazılmadı; bu değerlendirme mevcut kaynak kontrolleri ve update sırasına dayanır.

İncelenen yeni kayıt/sıra/telemetry bağlantılarında başka somut P1 veya veri kaybı bulgusu yok. Yukarıdaki iki sınırlı bulgu koordinatörün son kaynak ve kabul testleriyle kapatılmalıdır. Test sayısı, browser yerleşimi ve yayın başarısı bu inceleme tarafından henüz doğrulanmadı.

## Son düzeltme doğrulaması

İki P2 bulgusu kaynakta kapandı. `Solo.tsx:41,109–113` ipucu sayısını senkron `hintCount` ref'iyle sınırlandırıyor, kabul edilen kullanımda ref'i hemen artırıyor ve state'i ayrıca3 ile sınırlıyor. Ücretsiz ilk harf yardımı ücretli ipucu yoluna girmeden dönüyor. `App.tsx:45,114` → `Pages.tsx:26,30` → `JourneyHome.tsx:14–16` bağlantısı seçilen stories/journey yüzeyini App oturumunda tutuyor; remount `initialView` ile aynı yüzeyi geri getiriyor.

Yeni test kaynakları salt okunur incelendi: `word-access.test.ts:274–303` gerçek Solo'da erken hedef reddi, ücretsiz başlangıç, altı hızlı ipucu çağrısının3'te kalması, tek tamamlanma ölçümü, reload/review, daha kötü replay'in en iyi kaydı koruması ve seçili yüzeyin remount'u; `living-stories.test.ts:34–42` sparse kayıt/birleşim ve ana ödül izolasyonu. Koordinatör tam paketin **505/505 geçtiğini** bildirdi. Bu kapanış turunda testler yeniden çalıştırılmadı; 505 sonucu koordinatörün çalıştırma kanıtıdır.

İncelenen iki düzeltme için açık bulgu kalmadı. Yeni kapsam açılmadı; uygulama/test/yayın dosyaları değiştirilmedi. Tarayıcı, fiziksel cihaz ve yayın kabulü koordinatörde kalır.
