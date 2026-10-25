# İpucu Avı yerleşimi · dar son deneyim incelemesi

25 Ekim 2026. Başlangıç: Sites `bb33a116f8d7adb859890b5edbd8942d54526e60` / 0.11.1; 0.11.2 için hazırlanan sınırlı WordList/CSS değişikliği. Koordinatörün karar kaydı ve güncel deneyim rolü sınırları esas alındı. Bugünkü bölüm çifti ve önceki geniş inceleme tekrarlanmadı.

Okunanlar: `common.tsx` içindeki WordList, `atlas-adventure.css` son iki kuralı, `tests/clue-layout.test.ts` ve `2026-10-25_clue-layout-decision.md`. Uygulama/test yazımı veya test çalıştırma yapılmadı; yalnız bu günlük yazıldı.

## Ana düzeltme kaynakta kabul yaklaşımını karşılıyor

- `components/game/common.tsx:30–40`: `clue-tag` artık tamamlanma durumuna değil gerçek tanımın varlığına bağlı. Tanım+harf sayısı ve cevap her iki durumda da DOM'da kalıyor. Görünmeyen yüz inline `visibility:hidden` ile gizlenirken `aria-hidden` da aynı durumu izliyor; gizleme yalnız haricî CSS'e bağlı değil.
- `app/atlas-adventure.css:25–26`: iki yüz aynı `grid-area:1/1` içinde ve normal metin sarmasıyla yer tutuyor. `display:none`, mutlak konum, sabit metin yüksekliği, kırpma veya yeni iç scroll eklenmemiş. Tanımdan uzun cevap da başlangıçtaki intrinsic ölçüye katılıyor. Bu, önceki tamamlanmada sınıf/ölçü içeriği kaybını kaynakta gideren uygun çözümdür.
- `common.tsx:33,37–41`: bulunmadan erişilebilir kart adı tanım/harf sayısını; bulunduktan sonra cevabı ve “bulundu” durumunu taşıyor. Gizli ölçü yüzleri etkileşimli kontrol içermiyor. Normal parçalı kelime dalı ve golden sunumu korunmuş (`41–42`).
- `tests/clue-layout.test.ts:44–97`: gerçek WordList gövdesinden tüm mevcut İpucu Avı hedefleri için sınıf/iki yüz içeriği, gizleme/erişilebilir ad; uzun tanım ve cevap; normal parçalı/golden davranış sözleşmeleri kontrol ediliyor. Dosya açıkça browser/CSS piksel testi olmadığını söylüyor. İncelemede testler çalıştırılmadı; geçtiği iddia edilmez.

## Son küçük sunum kontrolü tamamlandı

**Kaynak:** `common.tsx:37–38`, `atlas-adventure.css:25–27`.

Harf sayısının `<small>` öğesi tanımın içinde bir `span` altına taşındığından satır ayrımının kendi bileşen kuralında açık tutulması önerildi. Koordinatör daha genel mevcut small kuralını bildirdi; ilk olası bitişme uyarısı gözlenmiş bir kusur sayılmadı. Son eklenen `.clue-question>small{display:block}` kuralı yeniden okundu (`27`): harf sayısı artık genel small/direct-child stillerine bağımlı olmadan ayrı satırda. Erişilebilir adın kendi ayırıcısı da korunuyor.

**Oyuncu faydası:** Tanım ile harf sayısının ayrı okunması, ilk İpucu Avı deneyimindeki kuralı daha kolay taramayı sağlar; etkisi ölçülmedi.

**Son kaynak durumu:** Önerilen açık satır ayrımı koordinatör tarafından eklendi; iki yüzün intrinsic alanda tutulması değişmedi. Bu inceleme uygulama dosyasına yazmadı.

**Kaynak kabulü:** Bulunmadan tanım ve “N harf” ayrı satırda biçimlenir; sabit yükseklik/kırpma eklenmez. Her iki yüz tamamlanmadan önce/sonra ölçüye katılır; erişilebilir ad ve gizli cevap davranışı aynı kalır. Gerçek DOM boyutu ayrıca ölçülmeden sabit piksel konumu iddia edilmemeli.

## Sonuç ve sınır

Son kaynakta ana yerleşim veya erişilebilirlik için açık engel bulunmadı; küçük satır ayrımı da açık kuralla tamamlandı. Koordinatör dört markup sözleşmesi testinin geçtiğini bildirdi; bu uzman testleri çalıştırmadı veya CSS piksel sonucu çıkarmadı. Tam kontrol/build/HTTP ve yayın sonucu bu günlükle onaylanmaz. CSS grid'in gerçek computed boyutları, telefon, büyük sistem yazısı, ekran okuyucu ve hızlı dokunma bu incelemeyle doğrulanmış değildir. Önizlemenin toparlandığına dair kanıt olmadığından browser/server yolu denenmedi. Uygulama, zorunlu kontroller ve yayın koordinatördedir.
