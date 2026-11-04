# 5 Kasım 2026 · Safari TROYA seçimi: dar güvenilirlik incelemesi

Başlangıç `5c503d7`, 0.36.0; çalışma ağacı başlangıçta temiz. Kapsam: `Board.tsx`, `input-gesture.ts`, `legacy-ui.ts`, mevcut ilgili testler ve koordinatörün çıkardığı iki video karesi. Uygulama değiştirilmedi; yalnız bu günlük yazıldı. Geniş test/audit, tarayıcı, cihaz veya yayın işlemi yapılmadı. İki küçük salt okunur Node çağrısı gerçek saf girdi fonksiyonlarının davranışını ölçtü; bunlar fiziksel Safari testinin yerine geçmez.

## Tek doğrulanmış hata sınıfı: çizgi A'yı gösterirken mantıksal seçim Y'de kalabiliyor

Kaynak: `lib/game/input-gesture.ts:20–45,49–60`, `components/game/Board.tsx:67–72`. İlerleme yalnız hücre merkezine `.47` uzaklık içinde, bırakmada `.65` içinde kabul ediliyor. Görsel uç aynı uzaklık kapısını kullanmıyor; doğru eksene sürekli projekte ediliyor ve tahta sınırına sıkıştırılıyor. `earlyWordEnd` yalnız kabul edilmiş mantıksal uçla çalışıyor. Böylece A hücresinin köşesindeki geçerli bir temas, çizgide tam A merkezini gösterirken kelimeyi TROY olarak bırakabiliyor.

Video kanıtı: `/private/tmp/kt-troya-frames/frame-001.426.jpg` ve `frame-002.852.jpg` üzerinde 8×8 tahtada başlangıç `[3,2]`, son harf `[7,6]`. İkisinde de çizgi A'yı örterken HUD “TROY 4 harf”; ikinci karede “Tekrar dene.” görünür. Kareler gerçek parmak koordinatını veya Safari olay sırasını içermiyor; aşağıdaki kaynak tekrar üretimi gözlenen uyuşmazlıkla tutarlı fakat videodaki koordinatın birebir kaydı değildir.

Gerçek fonksiyonlarla tekrar üretim:

- `start=[3,2]`, `current=[6,5]`, `axis=[1,1]`, `point=[7.01,6.99]`, `size=8`; TROYA aynı çapraz üzerinde.
- Nokta son A hücresinin içindedir. Merkez uzaklığı `hypot(-.49,.49)=.69296` olduğundan hem move hem release `current=[6,5]` döndürür.
- `gestureTip` aynı nokta için tam A merkezi `[7.5,6.5]` üretir.
- `earlyWordEnd` mevcut uçta `null` döndürür. Board release yolu eski ucu iletir; bu yol TROY'da biter.
- Mevcut `tests/input-gesture.test.ts:8` dairesel alanın yaklaşık %69.4 olduğunu bilinçli olarak sınıyor. Merkez örnekleri, tahta dışı grace ve pivot testleri var; tahta içindeki hedef hücre köşesi ile gösterilen uç/mantıksal uç uyumu eksik.

## Önerilen dar düzeltme ve sınırları

Koordinatörün önerdiği ek kabul yolu uygundur: nokta tahta içindeyken `floor(point)` hesaplanan aday ray hücresiyle birebir aynıysa hücreyi kabul et; bunun dışındaki durumlarda mevcut merkez/perpendicular denetimini koru. Genel yarıçapı büyütmek yan rayları da gevşeteceği için gereksizdir. Tahta dışındaki floor hücresini önce clamp edip bu kapıya sokmamak gerekir: dış noktalarda mevcut iki hücrelik grace, son hücre ve eksene dik uzaklık sınırı sürmeli.

Bu yöntem "her hücrenin bütün alanı her durumda kabul edilir" diye genellenmemeli. Başlangıca komşu çapraz hücrenin uç köşesinde `atan2` daha önce cardinal ray seçebilir; örnek `[0,0]→point[1.01,1.99]` mevcut kodda başlangıçta kalıyor. Aday rayı yeniden tasarlamadan yalnız floor-eşitliği eklemek bu yakın-anchor belirsizliğini çözmez; mevcut köşe jitter korumasını sürdürür. TROYA'nın beşinci hücresindeki örnek bu belirsizliğe sahip değildir. Yakın-anchor davranışı ayrı bir amaç haline getirilmeden bu dar düzeltmeye ek kapsam açılmamalı.

## Gerekli kabul regresyonları

1. Yukarıdaki kesin TROYA örneğini gerçek Board bileşeninde Pointer, Touch, karışık Pointer→Touch devri ve release-only ile çalıştır: ilk doğru çizimde `[3,2]→[7,6]` tek kabul. Ardından ek move/up/cancel/lost-capture yeni kabul veya eski mürekkep üretmemeli. HUD/preview ve kabul son harfte aynı kelimeyi temsil etmeli.
2. Sekiz yönde, başlangıçtan yeterince uzak hedef hücresinin dört köşesine epsilon içerden temas; aynı rayda cell corner kabul. Hemen komşu off-ray hücrede eski endpoint veya geçerli pivot korunmalı, karşılaşılmayan hedefe otomatik sıçrama olmamalı. Nokta tahta dışında ve eksenden uzakken clamp nedeniyle yanlış kabul olmamalı; iki hücre grace eşiği ve epsilon üstü mevcut testleri sürmeli.
3. Pivot turu, son örnekte yön değiştirme, `KALE/KALEM` kısa önek belirsizliği, kilitli/bulunmuş hedefler ve cancel→geç up davranışları korunmalı. `tests/board-interactions.test.ts:284` başlığı kısa öneğin bırakmada seçimini söylüyor ama gövdesi yalnız uzun KALEM kabulünü sınar; ayrıca E hücresinde gerçek release → yalnız KALE kabulünü açıkça sınamak anlamlıdır.

## İncelenen fakat yeni hata kanıtı bulunmayan yollar

`Board.tsx:60–64,71–76` Pointer/Touch devrinde kaynak+kimlik denetimini ve tek aktif drag'i koruyor; `legacy-ui.ts:7–14` gerçek Touch teslimini izliyor. `tests/board-interactions.test.ts:223–229,280–287` devir sonrası pointer iptalinin yok sayılması, gerçek Touch iptali, tek kabul ve önekleri kapsıyor. Bu incelemede yeni bir Safari arbitration/cancellation arızası doğrulanmadı. Video kareleri de olay akışı hakkında kesin hüküm vermiyor; bu yolları gerekçesiz değiştirmemek uygun.

## Çizgi ucunun son seçili harfle eşleşmesi

Koordinatörün tam hücre kabulünü eklediği kaynakta ikinci bir örneği gerçek Board bileşeniyle tekrarladım. T/R/O/Y seçildikten sonra A'nın yan hücresindeki `[6.99,6.99]` örneği HUD'da dört harf bırakırken çizginin yatay uç koordinatı 6.49'a, A merkezine yaklaşıyordu. Regresyon testi düzeltmeden önce bu koordinatta başarısız oldu.

`lib/game/input-gesture.ts` artık çizgi ucunu hesaplarken son seçili hücreyi kullanıyor. Parmak o hücredeyken çizgi kesirli konumu izliyor. Örnek komşu hücreye girdiğinde ileri uzanabilecek çizgi son seçili harfin merkezinde duruyor. Tahta sınırı ve başlangıç harfi sekiz yönde de çizgiyi sınırlandırıyor. `components/game/Board.tsx` mevcut seçimi bu hesaplamaya iletiyor.

Gerçek Board testinde Pointer'dan Touch'a geçen hareket artık Y'nin merkezinde kalıyor. A'nın geçerli köşesine geçildiğinde kelime bir kez kabul ediliyor. Sekiz yönde yan hücreye sapma ile geçerli hücre içindeki kesirli hareketi karşılaştıran matematik testi geçti. Ayrı Board testinde E'de bırakma KALE'yi, M'ye devam etme KALEM'i kabul etti.

İki hedefli dosyadaki 122 test geçti. İlgili dört kaynak ve test dosyasında `git diff --check` temiz. Bu doğrulama Node ortamında geometri ve gerçek Board bileşenini kapsıyor. Fiziksel iPhone'da Safari ile oynama hissi ayrıca doğrulanmalı.
