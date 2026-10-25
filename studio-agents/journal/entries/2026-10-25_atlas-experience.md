# Atlas genişlemesi: deneyim incelemesi

25 Ekim 2026. Kullanıcı mevcut üç haritayı tamamladığını, devam ve daha güçlü görsel/oynanış hissi istediğini bildirdi. Kapsam: Discovery, Solo, common, Board, Pages ve son mobil stiller. Yalnız kaynak incelemesi; kod değişmedi.

## 1. Yeni dünyayı hemen görünür kılan gerçek devam yolu

Kaynak: `components/game/Discovery.tsx:DiscoveryMap`, `components/game/Solo.tsx:nextJourney/next`, `components/game/Pages.tsx:Explore`.

Mevcut harita üç görsele ve sabit `/15 durak`, `/18 parça` sayaçlarına dayanıyor. Bölüm bitişi aynı dünya içinde ilerliyor; bonus bitişinde genel haritaya dönüyor. Üç dünyayı bitiren oyuncunun yeni içerik için tamamlanmış uzun kataloğu yeniden taraması istenmemeli.

Öneri: yeni genişletilmiş haritada varsayılan seçim ilk açık tamamlanmamış dünya olsun; eski üç dünyanın tamamı bitmişse yeni ilk dünya doğrudan seçilsin. Üst devam kartı aynı öneriyi kullansın. Yeni altı bölümlü dünya düğümleri bir yol üzerinde bir sonraki düğümü vurgulasın. Başlık/sayaç/açılma metinleri durumdan türesin; eski beş+bonus kuralı yeni altılıya yanlış kopyalanmasın. Sonuç ekranında gerçek sonraki bölüm adı ve dünya adıyla tek birincil düğme; son bölümde “Yeni dünyaya geç” ancak gerçekten açık sonraki dünya varsa.

Kabul: eski üçü tamamlanmış kayıt yeni dünyaya tek ana eylemle ulaşır; eski kazanımlar korunur; tümü bitmiş durumda boş veya yanlış Sonraki düğmesi yoktur; yeniden oynanan eski bölüm ödül/kilitleri değiştirmez. Etki yüksek, maliyet küçük-orta, risk orta.

## 2. Başarı animasyonunu gerçek yeni buluşa bağla

Kaynak: `components/game/Board.tsx` strokes çizgileri, `components/game/Solo.tsx:commit` ve sonuç penceresi, `app/mobile-game.css` found-stroke/word-tag animasyonları.

Mevcut çizgi ve etiketler kısa animasyona sahip; `commit` çoğu kelime için aynı mesajı gösteriyor. Son hedefte tamamlanma penceresi hemen açılıyor. Kaydedilmiş çizgiler tekrar monte olunca aynı animasyon çalışabildiğinden devam etme/duraklatma gerçek yeni başarıdan ayırt edilmelidir.

Öneri: yalnız en son kabul edilmiş hedef kimliğiyle kısa, tek seferlik vurgulama; mesajda bulunan kelimenin adı ve kalan gerçek hedef sayısı. Son kelimede kısa tahta tamamlanma anı, ardından sonuç kartı; kesinti ve reduced-motion durumunda bekletme gereksiz. Sonuçta yeni harita parçası ve sıradaki bölümün küçük önizlemesi aynı görsel ritmi tamamlasın. Eski kazanımda yeni ödül patlaması yok; gizli zamanlayıcı veya otomatik sonraki oyun yok.

Kabul: hatalı/tekrar seçim başarı animasyonu üretmez; günlükte başarı sunucu onayıyla kesinleşir; eski kaydı açma ve duraklatıp sürdürme bütün çizgileri yeniden kutlamaz; hızlı ardışık seçimde son kelime/sayaç doğrudur; reduced-motion ani, metinli geri bildirimi korur. Etki yüksek, maliyet orta, risk orta. Daha eğlenceli algı kullanıcı testiyle doğrulanmalı, FPS iddiası kurulmaz.

## 3. Yeni hikâye ve ödül katmanları tahta alanını tüketmesin

Kaynak: `components/game/common.tsx:PlayLayout`, `lib/game/viewport.ts:fittedBoardSize`, `app/mobile-game.css:22-25`, `components/game/Board.tsx` ResizeObserver.

Son düzen hedeflerde iç kaydırmayı kaldırıyor ve kalan yüksekliğe göre tahtayı boyutluyor. Fakat okunabilirlik sınırı `cells*22`; uzun başlık/çok hedef/yeni başarı çubuğu toplamı büyürse tahta daha fazla küçülmeyip sayfa taşabilir. Bu kontrollü erişilebilirlik sınırı, her cihazda tek ekran garantisi değildir.

Öneri: oyun sırasında harita hikâyesi, büyük karakter/ödül kartı ve yeni dünya açıklamalarını ek paneller yapma. Kompakt tek satır dünya/bölüm kimliği, bütün kelimeler, tahta ve alt kontrolleri koru. Ödül/hikâye sonuçta veya yardım penceresinde anlatılsın. Hedef etiketleri sabit yerinde kalsın; bulunanları kaldırıp diğerlerini zıplatma. Uzun etiketlerde iki sütuna geçişi değerlendir; metni kırpmak veya aşırı küçültmek çözüm değil.

Kabul: yeni haritaların en uzun başlığı ve en fazla hedefi olan bölümünü 360x740/390x844 ve yatay görünümde kontrol et; tüm hedefler görünür ve listede iç scroll yok; 44 px kontroller korunur; büyük yazı/zoomda doğal taşma kesilmez. Başarı animasyonu layout boyutunu değiştirmesin; aksi halde Board resize gözlemcisi sürüklemeyi iptal edebilir. Etki yüksek, maliyet küçük, risk düşük.

## Devir ve sınır

Yeni içerik miktarı kadar devam yolunun görünürlüğü ve başarıdan sonraki açık eylem önemlidir. İlk odak 1, ardından 2; 3 her ikisinin kabul sınırıdır. Tarayıcı veya fiziksel cihaz testi yapılmadı. Bu günlük dışında yazım yok.
