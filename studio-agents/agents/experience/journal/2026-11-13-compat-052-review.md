# 0.52 uyumluluk incelemesi — içerik ve oyuncu akışı

13 Kasım 2026. Salt okunur kaynak incelemesi ve dört taslağın mevcut kelime geçmişine karşı küçük ölçümü. Uygulama kodu, oyuncu verisi, yayın veya fiziksel telefon değiştirilmedi. Kullanıcı geçiş planını onayladı; telefon kabulü ertelendi.

## Öncelikli bulgular

1. **P1 — Revizyon yalnız katalog varsayılanı değiştirilerek açılamaz.** `content.ts:61–62` mevcut okuyucuların tek bölüm/tahta kaynağı. `Solo.tsx:49–59` bölüm, kanonik tahta, sunum anahtarı ve ilk kayıt ayrı hesaplanıyor. `progress.ts:22–40,69` önbellek ve doğrulama yalnız mantıksal anahtarla çalışıyor. Yeni içerik aynı anahtarla varsayılan yapılırsa eski çizimler yeni tahtada temizlenip kaybolabilir. Rev1 fonksiyon varsayılanı aynen kalmalı; açık bir revizyon çözümleyici bölüm ve kaydı birlikte seçmeli, Solo açılışında sabitlenmeli. Yarım kayıt yalnız çizim değil, süre/ipucu içeren kayıtları da kapsamalı.
2. **P1 — Yeni sunum ayrı hazırlanmalı.** `journey-presentation.ts:29–35` SAFE_LAYOUTS satırları anahtara bağlı; hedef sayısı farklıysa hata, sayı aynıysa eski yollar yeni kelimelere uygulanabilir. Rev2 için ayrı sunum anahtarı ve hazırlanmış güvenli yerleşim gerekir. `prepare-safe-layouts.ts` yeni girdileri eklemeli; mevcut 312 içerik/kanonik/sunum SHA manifesti değişmeden geçmeli. `journeyPolicy` revizyon sonekini bölüm kimliği sanmamalı. `board-projection.ts` eşleme korunmalı; hiçbir kayıt görsel/projeksiyon koordinatıyla yazılmamalı.
3. **P1 — Mantıksal ödül ile revizyona ait çizim ayrı kavramdır.** `discovery.ts:40–74`, `original-content.ts:39`, `main-journey.ts:24–47` mantıksal `route:<id>` tamamlanmasına dayanıyor. Revizyonlar ayrı ödül kimliği olmamalı. Eski en iyi tamamlanma korunurken yeni revizyonun kısmi çizimi ayrı tutulmalı; farklı revizyonların stroke listeleri birleşmemeli. `journey-flow.ts:36–48` tamamlanmış hedef sayısını statik katalogdan sayıyor: eski dört kelimeli tamamlanma, yeni altı kelimeli katalogdan altı sözcük kazandırmamalı. Gerçek kaydın revizyonuna ait grupları saymalı.

## En küçük bütünlüklü uygulama haritası

- Ayrı immutable revizyon manifesti; mantıksal kimlik/sıra/route/ödül kimliği sabit. `journeyById` ve `journeyBoard` rev1 için mevcut davranışı korur. Açık revizyon resolverı yeni başlangıçta rev2 seçer; mevcut rev1 kayıt/yarım oyun ve rev1 geçmişi eskisini kullanır.
- `progressBoard(key, revision)` ve cache anahtarı birlikte sürümlenir. Eksik revision yalnız bilinen eski kayıtta 1 sayılır; bilinmeyen revision sessizce 1'e dönüştürülmez. Kayıt doğrulaması gerçek revizyonun tahtasına göre yapılır.
- Solo'da resolver sonucu run boyunca sabit. Memo bağımlılığı revision içerir. Başlık, kelime sayısı, clues, veil, tahta, sunum anahtarı ve kaydın revision'ı aynı seçime dayanır. Sunucudan geç eşitleme geldiğinde açık tahtayı değiştirmez.
- Revizyonu oynatmadan önce aynı içerik görünümü: `mainJourneyChapters/mainJourneyState`, `JourneyHome`, `ChapterPicker`, `WorldWelcome`, `next-discovery`, `JourneyResult`, `Discovery` başlık/hedef sayısı/etiket kaynakları. `worldChapter` yalnız id ile başlık okuduğundan resolver desteklemezse yanlış konu gösterir.
- Challenge/Arena: `challenge-content.ts:16,37` şu anda tek rev1 kataloğuna bağlı. Ortak snapshot geçmişlerini değiştirmeyin. Yeni meydan içeriği tercih edilirse revision bilgisini yeni oluşturulan snapshot'a dahil edin; var olan maç/snapshot olduğu gibi kalmalı. Ekran ölçüsüne göre içerik üretmeyin.
- Kalıcı completion/weekly/album kimlikleri mantıksal id üzerinden bir kez sayılmalı. `weekly-reward` aynı haftada id'yi tekilleştiriyor; içerik revizyonunu yeni chapter id gibi eklemeyin. Tamamlanmış bölümün düşük yıldızlı tekrarı eski best'i düşürmemeli.

## 295–298 taslak değerlendirmesi

Ölçüm: `reviewNovelty` ve önceki 294 ana bölüm, sonra adayları sırayla geçmişe ekleme. Plan taslakları henüz yayımlanmış içerik değildir.

| Bölüm | Sonuç | Öneri |
| --- | --- | --- |
| 295 Yıldızın yapısı | PLAZMA/ÇEKİRDEK/KÜTLE/BASINÇ/ENERJİ: %80 tekrar, en yakın 4 bölüm; kabul kapısından geçmez | HİDROJEN/HELYUM/ÇEKİRDEK/KATMAN/IŞIN: önceki294'te %0 tekrar. Yıldızın bileşimi/yapısı/radyasyonu birlikte doğal bir konu; bilgi yükü ayrıca denenmeli. |
| 296 Yıldız ışığı | TAYF/FOTON/DALGA/RENK/PARLAK: %40 tekrar, mesafe71 | Plan adayı yakın kopya/tekrar kapısını geçiyor. PARILTI ile değiştirmek %60'a çıkarıyor. |
| 297 Uzaklık ölçümü | PARALAKS/AÇI/ÖLÇÜM/MESAFE/KONUM/HESAP: %16,7 tekrar, mesafe249 | PARALAKS ileri kavram; bilmecesiz genel kelime oyununda oyuncu anlayışı doğrulanmalı. |
| 298 Yıldızın ömrü | BULUT/ÇÖKME/FÜZYON/DEV/CÜCE/KALINTI: %16,7 tekrar | ÇÖKÜŞ daha doğal isim. DEV/CÜCE'nin yıldız türü bağlamı başlık veya tanımla açık olmalı. |

Bu dört revizyon, kalan 116 bölümün zorluk eğrisini düzelttiği anlamına gelmez. Altılı rota denetimi yalnız dört adayla geçmez; 299–300'ün yükü/tekrar mesafesiyle birlikte değerlendirme gerekir. Yeni kuralların eski rev1 borcunu gizlemesi yerine rev2 için ayrı kabul raporu üretin.

## Kabul testleri

- 312 rev1 id/sıra/içerik/kanonik/sunum hash'i aynı; rev2 hiçbir rev1 SAFE_LAYOUTS satırını değiştirmez.
- 295'e yeni başlayan ve rev1'de bir çizim/süre/ipucu bırakan üç ayrı oyuncu doğru tahtayı alır; başlık ve hedef listesiyle eşleşir. Açık oyun eşitlemede değişmez.
- Aynı mantıksal bölümün rev1 ve rev2 kısmi çizimleri iki yönde merge edildiğinde karışmaz; tamamlanmış best, yıldız/album/weekly/wordTrail ödülü çoğalmaz veya azalmaz.
- Rev2 bilgisi taşıyan kayda eski çevrimdışı istemci yazınca sunucu rev2'yi ve yıldız/ödülü korur. Eski istemciye doğrulayamayacağı rev2 çizimi rev1 diye verilmez.
- İlk/son harf sürükleme, tersten kabul ve döndürme hem rev1 hem rev2 sunumdan kanoniğe aynı revision üzerinden gider.
- 320×568 ve414×736'da yeni hedefler/tanımlar/konular ölçülür; küçük hedefe geçmek veya metni kesmek test geçirme çözümü değildir.

Sınır: kaynak incelemesi ve kelime tekrarı ölçümü; görsel/gerçek iPhone, VoiceOver, FPS veya gerçek oyuncu bilgi yükü kabulü değildir.

## İlk yama incelemesi — 14 Kasım

İncelenen yama rev2 açılışını ve kompakt yazıcıyı kapalı tutuyor (`CONTENT_REVISION_TWO=false`, `COMPACT_PROGRESS_WRITES=false`). Rev1 varsayılanı, revizyona ait üretim tohumu, ayrı `@2` sunumu, revizyon önbelleği, run başında `useState` ile sabitleme ve açık eski/yeni kayıt testleri doğru yönde. Fiziksel kabul olmadan aktif içerik göçü iddiası yok.

- **P1, Solo kayıt anahtarı:** `const key=journey?journeyPresentationKey(journey):…` yeni rev2 için `route:id@2` üretir; bu yalnız sunum anahtarıdır. `knownKeys`, ödül ve kayıt geçmişi mantıksal `route:id` bekliyor. Rev2 resume kaydını bulamaz; sonraki kayıtta bilinmeyen anahtar v2'de atılır/v3'te hata verir. `presentationKey` ayrı kalmalı, `key` mantıksal id'ye dönmeli. Doğrudan merge testleri doğru anahtarı kullandığından actual Solo regresyonu gerekli.
- **P1, çizim yoluna yeni tam kayıt taraması:** Solo `resultProgress` her render'da bütün `mergeProgress` işlemini çağırıyor; `setPreview` sürüklerken render üretir. Önceden tek kayıt `keepBestSave` idi. Tek-bölüm revizyon birleştirme yardımcısı veya tamamlanma/kayıt değişimine bağlı memo gerekir; 511 kayıt/histori her parmak güncellemesinde dolaşılmamalı. Bu kaynakla gösterilmiş yeni yük; FPS ölçümü değildir.
- **P2, başlık tutarsızlığı:** `mainJourneyChapters` ve `mainJourneyState` rev2 chapter döndürüyor, fakat JourneyHome/ChapterPicker `worldChapter(id)` varsayılan rev1 başlığını kullanıyor. WorldWelcome, JourneyResult ve Solo devam başlığında aynı durum var. Çözümlenen revision konu/kelime sayısı/maskeye birlikte taşınmalı.
- **P2, türetilen sözcük kazanımı azalıyor:** Küçük Node tekrar üretimi: `ufuk-gok-1` rev2 tamamlanmış5kelime/2yıldız → eski rev1 tamamlanmış4kelime/3yıldız ile merge → primary rev1, geçmiş[1,2], `wordTrail.words`5→4. Mantıksal bölümde valid revizyon geçmişlerinin en yüksek kazanılmış grup sayısı bir kez sayılmalı; sürümler toplanmamalı. En iyi yıldız seçimi sözcük kilometre taşlarını düşürmemeli. İki merge sırası için test gerekli.

Bu bulgular koordinatöre gönderildi. Tam test seti veya canlı veri çalıştırılmadı; yalnız son bulgu için iki sentetik kayıtla salt bellek içi ölçüm yapıldı. Düzeltme doğrulaması sonraki inceleme kaydında belirtilmeden bu maddeler kapanmış sayılmaz.

## Odaklı kapanış kontrolü — 0.51.0 reader-first

Yalnız önceki dört bulgunun ilgili kodu ve iki hedefli test dosyası kontrol edildi: `tests/solo-resume.test.ts`, `tests/progress-compatibility.test.ts`, **33/33 geçti**. Gerçek Solo rev2 devamı, ikinci kelime sonrası mantıksal kayıt anahtarı ve codec dönüşü doğrulandı. Yeni `resultProgress` yalnız tamamlanmış durumda memo içinde hesaplanıyor; partial sürükleme yolu tam ilerleme birleştirmesi yapmıyor. Birleştirme yalnız gelen kayıt anahtarlarını işliyor. Sözcük Yolu valid geçmişlerde maksimum grup sayısını tek mantıksal bölüm için sayıyor;5→4 gerileme iki merge sırasında da testle kapandı. Bu üç bulgu kapandı; kaynak kontrolü FPS iddiası değildir.

JourneyHome, ChapterPicker ve JourneyResult ana başlıkları revision taşıyor; WorldWelcome da çözülmüş revizyonu alıyor. Solo devam başlığının çözülmediğine dair ilk kontrol notu geri çekildi: güncel `discovery.ts:78–79` içindeki `nextJourneyAfter` zaten `playableJourney` ile gerçek ilerlemeyi çözümlüyor; devam başlığı kapandı. Kalan küçük aktarım ChapterPicker→chapterPace→chapterVeils hattında revision'ın iletilmesi; koordinatör bu iki çağrıyı tamamlıyor.

Son satır kontrolü: ChapterPicker artık `chapterPace(item.chapter.id,item.chapter.revision)`, journey-flow ise `chapterVeils(id,board.targets,revision)` çağırıyor. Başlık/maskeler bulgusu da kapandı. Önceki dört bulgudan açık kalan yok. Bu kapanış yalnız belirtilen yama ve hedefli testler içindir; bütün uygulama, canlı rollout veya fiziksel cihaz kabulü değildir. Rev2 ve kompakt yazıcı kapalı kalır; bütün20rotanın yeni içerik/zorluk kabulü tamamlandı sayılmaz.
