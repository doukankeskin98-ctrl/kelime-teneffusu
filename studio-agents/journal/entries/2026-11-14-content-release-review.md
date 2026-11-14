# 0.52 içerik uzmanı — yayımlanmamış altılı rev2 adayı

Kapsam: `be10b96` üzerinde salt okunur içerik/üretim incelemesi. Yalnız bu günlük yazıldı; uygulama, kayıt, yayın ve cihaz kurulumu yapılmadı. Koordinatörün doğruladığı dar kapsam: mevcut dört adayı iyileştirip aynı `ufuk-gok` rotasını 295–300 arasında altılıya tamamlamak. Ana katalog 312 bölüm olarak kalır. `CONTENT_REVISION_TWO` ve `COMPACT_PROGRESS_WRITES` kapalı kalmalıdır. Telefon testi kullanıcı isteğiyle ertelidir.

## Kabul ve editoryal karar

Mantıksal kimlikler, rev1 başlık/hedef/tohum/asıl ve sunum tahtaları, beşli harita kümeleri, albüm ve haftalık ödül kimlikleri değişmez. Yeni içerik yalnız rev2 kaydına aittir. Altı adayın her biri en fazla %50 önceki hedef, en yakın tekrar için `>12` bölüm, sıfır yakın kopya ve güvenli sunum eşiğini sağlamalıdır. Rota yükü, gerçekten yansıtılan tahta ve revizyonun gerçek tanım/gizleme kurallarıyla ölçülmelidir.

Bilim terimlerinin sayısını azaltmak için birinci adaydan HİDROJEN/HELYUM, ikinciden FOTON, üçüncüden PARALAKS çıkarılır. Kısa cevaplı dördüncü bölüm kalan astronomi terimlerini tanımlarıyla verir. Beşinci bölüm gündelik gözlem hazırlığı, altıncı bölüm renklerle daha rahat bir kapanıştır. Gizlemeyi artırmak gerekmiyor: mevcut ufuk rotası davranışındaki beşinci bölümün tek baş harfli hedefi yeterlidir; tümü gizli hedef sıfırdır. Bu, gizleme üst sınırını sağlar ve son iki bölümde gerçek ters yönlerle birlikte mekanik eşiği karşılar.

| Bölüm / kimlik | Başlık | Hedefler | Zorluk / not |
| --- | --- | --- | --- |
| 295 / `ufuk-gok-1` | Yıldızın içinden | ÇEKİRDEK, KATMAN, YAKIT, ISI, IŞIN | Rahat. `Yıldızın merkezinden yayılan ışığa uzan.` |
| 296 / `ufuk-gok-2` | Yıldız ışığı | TAYF, DALGA, RENK, PARLAK, SÖNÜK | Dengeli. `Tayf, ışığın renklere ayrılmış görünümüdür.` |
| 297 / `ufuk-gok-3` | Uzaklığı ölçmek | AÇI, ÖLÇÜM, MESAFE, KONUM, HESAP, ÜÇGEN | Dengeli. `Farklı noktalardan bak, uzaklığın izini sür.` |
| 298 / `ufuk-gok-4` | Yıldızın ömrü | BULUT, ÇÖKÜŞ, FÜZYON, DEV, CÜCE, KALINTI | Dengeli, altı tanım. `Tanımı oku, cevabı yıldızların arasında bul.` |
| 299 / `ufuk-gok-5` | Gözlem hazırlığı | TRİPOD, AYAR, NETLİK, SESSİZLİK, KARANLIK, SABIR | Ustalık, yalnız SABIR baş harfli. `Gözlem için ortamını ve araçlarını hazırla.` |
| 300 / `ufuk-gok-6` | Ufukta renkler | ŞAFAK, GURUP, KIZILLIK, MAVİ, TURUNCU, ALACA | Dengeli, hepsi açık. `Gurup, Güneş’in ufukta batışıdır.` |

Ortak alt başlık `Gökyüzü Defteri`; mevcut tema kimliği aynen korunur. YAKIT yıldızdaki enerji kaynağını genel ve tanıdık bir sözcükle anlatır; bir yanma tarifi veya bilimsel simülasyon iddiası değildir.

298 için eksiksiz tanımlar:

```text
BULUT = Yıldız doğurabilen gaz ve toz topluluğu.
ÇÖKÜŞ = Yerçekimi etkisiyle içe doğru büzülme.
FÜZYON = Hafif atom çekirdeklerinin birleşmesi.
DEV = Kırmızı ...: genişlemiş bir yıldız türü.
CÜCE = Beyaz ...: yıldızdan kalan küçük, yoğun çekirdek.
KALINTI = Bir oluşumdan geriye kalan.
```

`DEV` ve `CÜCE` tanımlarında astronomik tamlama açıkça verilir; insan tasviri veya bütün cüce yıldızların kalıntı olduğu yanlış genellemesi yapılmaz. Gaz/toz bulutu, füzyon, kırmızı dev ve beyaz cüce ilişkisi [NASA Stars](https://science.nasa.gov/universe/stars/) ve [NASA yıldız türleri](https://science.nasa.gov/universe/stars/types/) ile karşılaştırıldı. Taslak tanımlar `reviewDraft` içinde sıfır hata/sıfır uyarı ve `proseSafetyIssues` içinde sıfır sorun verdi.

## Salt okunur üretim ölçümü

Uygulama dosyası değiştirmeyen Node heredoc ile altı Journey nesnesi bellekte oluşturuldu. `journeyBoard`, mevcut presentation seed (`presentation:route:<id>@2`), `qualityPuzzle`, gerekiyorsa `repairFiller`/geniş kurallı üretim ve `projectBoard` kullanıldı. İlk iki kaynak/policy boyutu 8, diğer dördü 9. Yönler ilk bölümde `forward`, sonrakilerde `all`; `reverseLimit` sırası **0, 2, 2, 2, 3, 1**. Bu ölçümde seçilen ilk bölüm hedef sırası yukarıdaki gibidir; sıra değiştirilirse tahta yeniden ölçülmelidir.

| Bölüm | Önceden görülen hedefler | Oran | En yakın tekrar | Yansıtılan şekil / hücre | Çapraz / ters |
| --- | --- | --- | --- | --- | --- |
| 295 | Yok | %0 | — | 8×8 / 64 | 0 / 0 |
| 296 | DALGA, RENK | %40 | 71 | 8×8 / 64 | 0 / 2 |
| 297 | ÖLÇÜM | %16,7 | 249 | 9×8 / 72 | 3 / 1 |
| 298 | BULUT | %16,7 | 87 | 9×9 / 81 | 3 / 2 |
| 299 | TRİPOD, KARANLIK | %33,3 | 30 | 9×9 / 81 | 0 / 2 |
| 300 | TURUNCU, ALACA | %33,3 | 23 | 9×8 / 72 | 1 / 1 |

Altı adayda yakın kopya sıfır ve geniş `PRESENTATION_RULES` ile güvenlik sorunu sıfır. Novelty hem önceki altılı rev2 adayları kullanılarak hem bütün önceki bölümler rev1 tutularak hesaplandı; tablo her iki tarihte de aynı. Altılı içinde hiçbir hedef tekrarlanmıyor; dolayısıyla bu rotadaki rev1/rev2 karışımlarında da kısa mesafeli aday tekrarı oluşmuyor.

Hedef sırası **5, 5, 6, 6, 6, 6**; ortalama **5,67** (ilk dünya **5,5**). Yansıtılan hücre ortalaması **72,33** (ilk dünya **65,17**). Son iki hedef ortalaması ilk ikiden **1 fazla**. Beşinci bölümde bir baş harfli hedef, son iki bölümde sırasıyla 2 ve 1 ters yerleşim var; tümü gizli hedef yok. `difficultyIssues` boş döndü. 300'de policy boyutunu 8 yapmak 8×6/48 hücreye sıkıştırıyor; daha rahat kapanış yine 9×8/72 olarak korunmalıdır.

Bu sayılar oynama süresi, terimlerin anlaşılması, küçük ekranda 6 tanımın rahatlığı, fiziksel parmak kullanımı veya oyuncu memnuniyeti kanıtı değildir. Başlangıç varsayımı: 295'te 5 açık hedef, 297'de ek hedef ve çaprazlar, 298'de kısa tanımlar, 299'da tek baş harfi, 300'de daha az arama alanı ile farklı ama ölçülü tempo. Oyuncu kabulünde özellikle TAYF/FÜZYON/GURUP anlaşılması ölçülmeli.

## Koordinatöre uygulama haritası

1. `lib/game/journey-revisions.ts:7–15`: mevcut `Pick<Journey,'title'|'words'|'size'>` kaydı tanım, not, zorluk ve alt başlığı taşıyamıyor; `journeyRevision` bunları `clues:undefined`, boş not ve sabit Dengeli ile eziyor. Aday tipi güvenli Journey alanlarını taşımalı; aday metadata sonradan ezilmemeli. `id`, `themeId`, revision, ödül kimliği ve temel katalog üyeliği aday tarafından değiştirilebilir alanlar olmamalı. Altı mevcut mantıksal kimlik altında yalnız rev2 eklenir; `horizons-content.ts`, `MAIN_JOURNEY_IDS`, EXPEDITIONS ve rev1 kaynaklarına dokunulmaz.
2. `lib/game/journey-presentation.ts:7–19`: mevcut policy aday `size` değerini gözetmiyor; dünya pozisyonu ve en uzun sözcükle başka boyut seçiyor. Sadece `@2` anahtarında ayrı aday policy seçilmeli. Yukarıdaki `size`/`directions`/`reverseLimit` değerleri aday metadata veya ayrı rev2 policy kaydında tutulabilir. Normal `route:<id>` anahtarının policy'si ve seed'i değişmemeli. `@2` son ekini ancak revizyon ayrıldıktan sonra kaldır.
3. `scripts/prepare-safe-layouts.ts:1–25`: bütün registry adaylarını zaten tarıyor. Altı adaya geçiş yeni iki `route:ufuk-gok-5@2` / `route:ufuk-gok-6@2` girdisi üretir. Dört eski pilotun @2 girdileri yayımlanmamış taslaklar olduğu için yenilenebilir. Her **@2 dışı** layout'un eski değerle JSON eşitliği doğrulanmalı; manifesti yeniden basmak çözüm değildir.
4. `lib/game/world-presentation.ts:34–57`: rev2 başlığı zaten çözülüyor; `chapterVeils(...,2)` tanım varsa maske üretmiyor, ufuk rotasında beşinci bölümün son hedefini baş harfli yapıyor. Bu aday için maskeleme kodu değişimi gerekmiyor. Gerekli olan kalite/önizleme çağrılarının revision=2 ile çalışmasıdır.
5. `scripts/check-editorial-quality.ts:42–53`: güncel kontrol yalnız dört bağımsız adayı denetliyor ve sabit `4 inactive` mesajı yazıyor. Tam altılı üyelik, gerçek rev2 tanım/maske/`projectBoard` yükü ve `difficultyIssues(rev2Loads,openingLoads)` eklenmeli; sayı registry'den türetilmeli. Rev1 manifesti/borç raporu aynen kalmalı, rev2 için ayrı aday raporu eklenmeli. Aday title/note/clues için içerik güvenliği de denetlenmeli.
6. `lib/game/journey-revisions.ts:21–26`: flag false kalmalı; varsayılan yeni oyun hâlâ rev1, eski kayıt herhangi bir içerikle rev1'e sabit. Save anahtarı `route:<id>`, görünüm anahtarı `route:<id>@2`; `@2` ödül veya ana kayıt kimliği olarak kullanılmamalı. Var olan revizyon ayırma ve mantıksal ödül tekilleştirme korunmalı.

## Anlamlı doğrulamalar

- Tam altılı aday için novelty eşiğini, yakın tekrar sınırını, şema üyeliğini, altı tanımın tamlığını, kaynak hedeflerin sunum tahtasında gerçekten bulunmasını ve projected yük eğrisini doğrula. Salt `boardIssues` geçişi stale @2 layout'ta hedeflerin gerçekten yazıldığını tek başına kanıtlamaz; her `placement` yolundaki harfler kendi hedef metnine eşit olmalı.
- Negatif fixture: aday kelimesini bir önceki bölüm hedefiyle değiştirmek kısa tekrar kapısını, dört hedefli düz rota yükünü koymak eğri kapısını, eksik/bütünleşmemiş tanım riddle kapısını kırmalı. Genel kalite işlevini taklit eden çok sayıda ayrı test gerekmiyor.
- `tests/progress-compatibility.test.ts` var olan 312 rev1 hash testi ve eski kayda sabitleme testi korunmalı. Yeni 5–6 dahil her adayda rev1/rev2 çizimlerinin karışmaması, hem rev1 hem rev2 tamamlanmasının bölüm/album/haftalık ödülü tekrar vermemesi kapsamı genişletilmeli; bitmiş 6. bölüm için albüm son parça eşiği özellikle temsil edilmeli.
- `CONTENT_REVISION_TWO === false` ve `COMPACT_PROGRESS_WRITES === false` sürüm kabulünde açık kalmalı; editor-only preview kullanımı bu bayrakları açmamalı. Aday kaydı `PLAYABLE_JOURNEYS` toplamını ya da yayımlanmış 312 sayısını büyütmemeli.
- Rev1 manifesti ve **@2 dışı tüm safe-layout girdileri** eşitliği; odak editoryal/ilerleme kontrolleri; ardından koordinatörün zorunlu yayın kapıları. Bu uzman tam test paketi çalıştırmadı; ölçüm yalnız bellekte oluşturulan adaylar ve tanım denetimidir.

Sonuç: 295–300 için uygulanabilir, sayısal ve içerik güvenliği filtrelerinden geçmiş altılı **yayımlanmamış aday** var. 193–312 bütün içerik borcu kapandı, fiziksel telefon kabulü tamamlandı veya yeni içerik oyuncuya açıldı denemez.

## Ek — 14 Kasım 2026 App Store birincil kaynak doğrulaması

Koordinatörün sınırlı ek göreviyle `docs/app-store-readiness.md` ve güncel Apple/TBMM/Resmî Gazete kaynakları okundu. Kullanıcının son kararı: **ilk paket reklamsız, satın almasız, genel kitle; mevcut alan adı korunur.** Apple hesabı, yayıncı adı ve destek e-postası bu tur atlanır; yeni hesap/alan adı/SDK açılmaz, mağazaya beyan gönderilmez. Aşağıdakiler kaynak gereksinimleri; mağaza kabulü veya uygulanmış hukuki uygunluk beyanı değildir.

### Kaynakla kesinleşenler

| Konu | Doğrulanan kural ve bu dosyaya etkisi | Birincil kaynak |
| --- | --- | --- |
| Derleme eşiği | 28 Nisan 2026'dan beri App Store Connect'e yüklenen iOS uygulaması **Xcode 26+ / iOS 26 SDK+** ile derlenmeli. 9 Eylül 2026'dan beri deployment target **iOS 13+** olmalı. SDK ile minimum çalıştırılabilir iOS sürümü farklı alanlardır. Kaynak projede `IPHONEOS_DEPLOYMENT_TARGET = 15.0` doğrulandı; bu yalnız hedef-OS eşiğini karşılar, dağıtım arşivi kabulü değildir. | [Apple gereksinimleri](https://developer.apple.com/news/upcoming-requirements/) |
| Yaş anketi | 31 Ocak 2026 yenilenmiş anket eşiği geçmiştir; yeni başvuru güncel bütün soruları cevaplar. Genel kitle seçimi otomatik 4+ veya Kids Category anlamına gelmez; nihai yaş derecesi App Store Connect cevaplarına bağlıdır. | [Apple gereksinimleri](https://developer.apple.com/news/upcoming-requirements/), [yaş derecesi](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/) |
| Sosyal medya sorusu | 9 Temmuz duyurusu, Eylül 2026'dan yeni başvuru/güncellemede sosyal medya yeteneklerinin beyanını zorunlu kılar. Apple tanımı sosyal akış veya benzeri keşif yoluyla kullanıcı içeriğini yeniden dağıtma, yayma veya onunla etkileşmeyi kapsar. Arkadaş listesi/maç sıralaması tek başına bu soruya otomatik Evet veya Hayır kanıtı değildir; gerçek ekran davranışıyla cevaplanmalı. | [Apple 9 Temmuz 2026](https://developer.apple.com/news/?id=tlur8uvi) |
| Yaklaşan anket değişikliği | **16 Kasım 2026** itibarıyla Shared Location ve Dating and Relationships alanları eklenir; bütün uygulamalar için son tarih **12 Ocak 2027**. Şimdiki paket gerçek konum paylaşımı veya flört işlevi sunmuyorsa gönderim anında bu gerçek davranış beyan edilir. | [Apple 2 Kasım 2026](https://developer.apple.com/news/?id=yxkh08us) |
| Destek / gizlilik | Uygulama ve Support URL kolay ulaşılabilir gerçek iletişim yolu sunmalı (1.5). Gizlilik politikası bağlantısı App Store Connect metadata'sında ve uygulama içinde erişilebilir olmalı (5.1.1(i)). Kullanıcıya cevap vermeyen kopyalama ekranı tek başına çalışan destek kanalı değildir. Mevcut alan adında bu sayfaları barındırmak mümkündür; yeni domain kuralı yoktur. | [App Review 1.5 / 5.1.1](https://developer.apple.com/app-store/review/guidelines/) |
| Hesap silme | Uygulamada kolay bulunan tüm hesap ve ilgili verileri silme yolu gerekir; yalnız devre dışı bırakma yetmez. Otomatik/misafir hesaplar da kapsanır. Makul süreli manuel işlem mümkündür; süre ve tamamlanma kullanıcıya bildirilmeli. Yerel profil düğmesi gerçek sağlayıcıdaki silmenin tamamlandığı kanıtı değildir. | [Apple hesap silme açıklaması](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion) |
| Paylaşılan kullanıcı içeriği | 1.2; uygunsuz içeriği filtreleme, bildirme ve zamanında yanıt, kötüye kullanan kullanıcıyı engelleme, yayımlanmış iletişim ister. Oyuncu adları/bildiriler için mevcut kod ile gerçekten işletilen moderasyon birbirinden ayrı kabul edilmelidir. | [App Review 1.2](https://developer.apple.com/app-store/review/guidelines/) |
| App Privacy | Geliştiricinin ve gömülü üçüncü tarafların topladığı veriler, kimliğe bağlılık ve kullanım amaçları açıklanır; yalnız uygulama işlevi için toplanması genel muafiyet değildir. Reklamsız olması “veri toplamıyoruz” sonucunu doğurmaz. Zorunlu Privacy Policy URL herkese açık olmalı. `.xcprivacy`, App Store Connect cevaplarının ve son dağıtım arşivi/veri akışı incelemesinin yerine geçmez. | [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/) |

### Türkiye — kapsam, yürürlük ve sonraki değişiklik

**Kesin metin:** [7578'in TBMM kaydı](https://tbmm.gov.tr/Yasama/Kanun/5F9CED52-3776-46E4-BE23-019CB8DA2666) yayımı **1 Mayıs 2026 / RG 33240** olarak doğruluyor. [7578 m.21–23,27 tam metni](https://cdn.tbmm.gov.tr/KKBSPublicFile/D28/Y4/KanunMetni/9bf93173-7648-4771-ab36-0e45666c423d.htm) oyun/geliştirici/dağıtıcı/platform tanımlarını ayırıyor. İnternetten dağıtılan çevrimdışı oyun da oyun tanımında. **15 yaş altı hizmet yasağı sosyal ağ sağlayıcı hükmü**; her oyuna otomatik yaş yasağı diye aktarılmamalı. Oyun platformuna ilişkin ek 5; derecelendirme, hesap/ücretli işlem ebeveyn kontrolleri ve uyum bilgisi yükümlülükleri içeriyor. Yurt dışı platform temsilciliğindeki günlük **100.000** eşiği, bütün diğer platform yükümlülüklerinden genel muafiyet değil. M.22–23 yayımından altı ay sonra, **1 Kasım 2026**'da yürürlüğe girer; diğer maddeler yayım tarihinde.

**Sonraki doğrulanmış değişiklik:** [7590 TBMM kaydı](https://tbmm.gov.tr/Yasama/Kanun/da9978b9-5655-4725-8ffa-019f273b6db5) yayımı **31 Temmuz 2026 / RG 33326** olarak gösteriyor. [7590 m.27(5),31](https://cdn.tbmm.gov.tr/KKBSPublicFile/D28/Y4/KanunMetni/152a9101-15fe-4138-aceb-99a304bb9ec3.htm), 7578'in 22–23. maddelerindeki yetki atıflarını **Siber Güvenlik Başkanlığı** yönünde değiştiriyor; ilgili değişiklik yayımı tarihinde yürürlüğe giriyor. Bu nedenle eski “BTK karar verecek” anlatımı doğrudan kopyalanmamalı.

**Karar/ayrı doğrulama:** Kelime Teneffüsü işletmecisinin yalnız geliştirici mi, kendi sunucusu ve web erişimi nedeniyle ayrıca oyun platformu mu olduğu gerçek hizmet modeli üzerinden hukuki değerlendirme ister. Sosyal ağ sağlayıcılığı ve Apple sosyal medya sorusu aynı sınıflandırma değildir. Genel kitle/reklamsız seçimi bunları kendiliğinden çözmez. Uygulanacak Türk yaş derecelendirme usulünün App Store derecesiyle karşılanıp karşılanmadığı bu incelemeyle kesinleşmedi.

**Kaynak sınırı:** Resmî Gazete 7578/7590 sayfaları açılışta zaman aşımına uğradı; aynı kanunların TBMM tam metinleri okunarak sonuçlar doğrulandı. Sınırlı taramada [10 Ekim 2026 sosyal ağ/yaş doğrulama yönetmeliği](https://www.resmigazete.gov.tr/eskiler/2026/10/20261010-15.pdf) Resmî Gazete indeksinde bulundu; indeks görünen kapsamı sosyal ağ sağlayıcılara ait. PDF bütünü bu araçla açılamadığı için bütün yürürlük/teknik şartları doğrulanmış sayılmadı. Ayrı oyun-platformu derecelendirme yönetmeliğinin güncel uygulama ayrıntıları da bu dar incelemede doğrulanamadı; “yönetmelik yok” veya “otomatik muafız” sonucu çıkarılmadı.

### Koordinatörün belgeye uygulayacağı dar düzeltmeler

- Başlıktaki 7 Kasım tarihi ve gövdedeki tarihsel `168 bölüm / 28 rota` güncel hazırlık durumundan ayrılmalı; mevcut yayımlanmış katalog 312. Tarihsel test delilleri yeni mağaza kabulü gibi gösterilmemeli.
- “İlk TestFlight reklamsız önerilir” artık kullanıcı kararı olarak **ilk paket reklamsız/satın almasız/genel kitle** yazılmalı; reklam/IAP ileriki isteğe bağlı işlerdir, ilk gönderim için koşul değildir.
- Yayıncı adı, Apple hesabı/Team ID, takip edilen iletişim adresi, destek işletimi, sağlayıcı silme testi, gerçek saklama süreleri, son arşiv Privacy raporu ve anket yanıtları açık karar/kanıt olarak kalmalı. Kullanıcı bunları bu tur atladığından tekrar soru yöneltilmez; sahte değer yazılmaz.
- Yeni sürüm hazırlığı mevcut alan adını kullanır. Destek/gizlilik için taslak yol ve metin hazırlanabilir; gerçek iletişim ve veri sorumlusu kesinleşmeden yayımlanmış veya App Store gönderimine hazır sayılmaz. Bu uzman yalnız günlük ekini yazdı; uygulama veya mağaza değişikliği yapmadı.

## Son sınırlı inceleme — uygulanan adaylar ve hızlı grup başlangıcı

Koordinatörün mevcut çalışma ağacı salt okunur incelendi. Geniş test/derleme/yayın kapıları tekrar çalıştırılmadı. Dört veya daha fazla varsayımsal bulgu üretmek yerine aşağıdaki **iki somut açık** bildirildi; koordinatör düzeltmeleri sonrasında aynı dar senaryolar yeniden doğrulandı.

1. **P1, düzeltildi — son hazır olmayan kişi ayrılınca/hareketsiz kalınca hızlı grup kilitleniyordu.** İlk diff yalnız `GameService.ready` içinde otomatik başlatıyordu, UI ise hızlı gruptan ev sahibinin Başlat düğmesini kaldırıyordu. Bellek içi fixture: A+B+C aynı hızlı gruba girer; A ve B hazır olur; C ayrılır veya 30 saniye boyunca heartbeat vermez. Önceki sonuç her iki durumda `phase=ready`, `starts=null`, `canStart=true`; kalan iki Hazırsın düğmesi kapalı olduğundan oyuncular başlayamıyordu. Koordinatör geçişi `lib/game/server.ts` içindeki ortak `mutate` yoluna, canlı/ayrılmamış aktör ve en az iki hazır katılımcı şartıyla taşıdı. Ayrılan aktörün silinip 403 ile dönmesi riskini önlemek için ayrılma ardından canlı katılımcının sonraki state/heartbeat'i başlatıyor. Beş saniyelik heartbeat yazım azaltması phase değişimini artık yutmuyor. Yeniden oynatılan iki fixture sonucunda `phase=active`, tam **5000 ms** geri sayım, yalnız A+B ve tekrarlanan state'de değişmeyen `starts` doğrulandı. `app/api/live/route.ts` canlı state heartbeat'ini yaklaşık beş saniyede bir gerçekten çağırıyor. Board allocation ve CAS mevcut ortak yoldan geçiyor; bu düzeltme ayrı veya ikinci bir başlangıç yazarı eklemiyor.
2. **P2, düzeltildi — rev2 metinleri otomatik içerik güvenliği kapısının dışındaydı.** `scripts/check-content.ts` yalnız ana `PLAYABLE_JOURNEYS` kaynaklarını taradığı için ayrı registry'nin başlık/not/tanımları denetlenmiyordu. Şimdiki altı aday temizdi; kapı yeni uygunsuz tanımı yakalayamazdı. Koordinatör `scripts/check-editorial-quality.ts` rev2 döngüsüne `proseSafetyIssues` ve `targetSafetyIssues` ekledi. Son kaynakta başlık/not/tanımlar ve bütün hedefler açıkça denetleniyor.

Bağımsız dar içerik doğrulaması (Node heredoc, uygulama dosyasına yazmadan):

- Yayımlanmış **312** bölümün fixture'a göre `id`, `number`, `contentHash`, `boardHash`, `displayHash` değerleri aynı.
- `git show HEAD:lib/game/safe-layouts.ts` ile karşılaştırılan **535 adet @2 dışı** hazırlanmış yerleşimin JSON içeriği aynı.
- Altı rev2 sunum tahtasında bütün hedef placement yolları gerçek harf dizisini üretiyor; geniş güvenlik kontrolü, hedef/metin kontrolü, tanım tamlığı, önceki rev1 tarihe göre novelty ve zorluk kontrolü geçti.
- Gerçek görünür şekiller **8×8, 8×8, 9×8, 9×9, 9×9, 9×8**; hedef yükleri **5,5,6,6,6,6**. 298 tanım turu, 299 yalnız bir baş harfli hedef, diğerlerinde gizli hedef yok. Başlık/kelime/tanım uyumu ilk yazar önerisiyle örtüşüyor; TAYF ve GURUP kısa notla açıklanıyor, CÜCE tanımı beyaz cüceyi açıkça sınırlıyor.
- `COMPACT_PROGRESS_WRITES === false` ve `CONTENT_REVISION_TWO === false` canlı kaynakta doğrulandı. Varsayılan oyuncu seçimi rev1; altılı yayımlanmamış aday olmaya devam ediyor.

Bu sınırlı kapsamda düzeltme sonrası açık engelleyici bulgu kalmadı. Koordinatörün geniş testleri, HTTP/gerçek tarayıcı kanıtı ve ertelenmiş fiziksel telefon/oyuncu kabulü bu incelemenin yerine geçmediği ayrı aşamalardır.
