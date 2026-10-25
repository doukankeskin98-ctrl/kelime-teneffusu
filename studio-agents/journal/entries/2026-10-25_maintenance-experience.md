# Bakım · sınırlı deneyim incelemesi

25 Ekim 2026. Koordinatörün açtığı güncel kaynak: Sites `d3dfeb4a91453c56e15b1cf1a947434bc5a875f7`, 0.11.0; Site 18 yayını başarılı, GitHub `69d219b217d02764b8721bb674e9c4285aeda7db`. 0.8.3 incelemesi güncel davranış sayılmadı. Kök sözleşme, deneyim rolü dosyaları, güncel öncelikler, son atlas/mobil deneyim ve doğrulama kayıtları ile güncel sürüm belgeleri okundu.

Kapsam: `PlayLayout`, `WordList`, `Board` ve `PublishedPlay` açılışı. Uygulama ve testler salt okunur kaldı; yalnız bu günlük yazıldı.

## Kullanıcının şikâyetinde kaynakta çözülmüş olanlar

- **Kelimeleri görmek için iç kaydırma:** `app/mobile-game.css:15,22` hedef listesindeki eski `max-height:133px;overflow-y:auto` kuralını `max-height:none;overflow:visible` ve mobil üç sütunla değiştiriyor. `app/layout.tsx:4–11` bu dosyayı eski stil dosyalarından sonra yüklüyor. Kaynakta tüm hedefler listelenmeye devam ediyor (`common.tsx:27–29`). Eski iç kaydırma kusuru aynı haliyle sürüyor diye raporlanamaz.
- **Ekran bütçesi:** `common.tsx:33–50` görünür yüksekliği, oyun dışı alanı ve alt güvenli alanı kullanarak tahtayı sığdırıyor. `lib/game/viewport.ts:1–6` hücre başına 22 px okunabilirlik alt sınırını koruyor; büyük yazı/çok kısa ekranda doğal sayfa taşması bilinçli kalıyor. Bu, her telefon için tek ekran garantisi değildir.
- **Oynama ve başarı geri bildirimi:** `Board.tsx:18,24–38` boyut değişiminde seçimi temizliyor; kaydırma, iki uç ve klavye yolları korunuyor. Eski kayıt çizgileri ile yeni buluş ayrılmış (`8,38`; `atlas-adventure.css:11`). Hacimli tahta/kontroller, 44 px mobil oyun düğmeleri ve hareket azaltma mevcut (`mobile-game.css:15,22,27`). 0.11 kelime adıyla geri bildirim ve son kelime sonrası kısa sonuç geçişi eklemiş (`Solo.tsx:29–34,62–63,80,86`). Bunlar gerçek kod değişiklikleridir; profesyonel algı, dokunma rahatlığı ve cihazda sığma henüz gözlenmiş sonuç değildir.

## 1. İndirilmiş bölümün ağ beklemesi hâlâ açık

**Öncelik:** Yüksek etki, güçlü kaynak kanıtı, orta uygulama riski. 24 Ekim bulgusunun güncel kaynakta teyididir; yeni keşfedilmiş veya çözülmüş iş sayılmaz.

**Kanıt:** `PublishedChapters.tsx:73` doğrulanmış yerel tahtayı önce buluyor. Ancak çevrimiçi görünüldüğünde bölüm GET'i (`75–81`), hesap varsa ilerleme GET'i (`85–90`) bekleniyor; `open` ancak `92`'de çalışıyor. Hata halinde yerel açılış var (`94`), başlangıçta 8000 ms iptal eşiği var (`47`). Yükleme ekranı yalnız genel hazırlık metni ve dönüş sunuyor (`110–111`). 0.9/0.11 görsel yenilemesi bu bağımlılığı kaldırmamış.

**Oyuncu faydası / varsayım:** Bağlantı var görünürken istekler ilerlemiyorsa, indirilmiş bir keşfe erişmek için beklemek gerekebilir. Doğrulanmış cihaz kaydıyla açılış kısa molaya dönüşü kolaylaştırabilir. Süre veya terk etkisi ölçülmedi; 8000 ms kaynak eşiğidir.

**Küçük öneri:** Geçerli yerel tahta ve doğru sahipte kayıt varken yerel oyun yolunu ağ tamamlanmasına bağlama; gerekirse bekleme ekranında “Cihaz kaydıyla aç” seçeneği sun. Bulut kontrolü ayrı ve doğru durumla sürsün. Geç yanıtın aktif oyundaki kelimeleri kaybetmemesi ve mevcut gönderim kuyruğunun sahip sınırı korunması şarttır.

**Kabul:** İki GET bekletilirken geçerli yerel tahta ve bulunan kelimeler ağ yanıtından önce açılabilir; bozuk/hash'i farklı tahta bu yolu açmaz. Geç bulut yanıtı yeni kelimeleri ve iyi sonucu korur; hesap onayından önce “Hesabında kayıtlı” denmez. Koordinatör değiştirirse hedefli regresyon, daha sonra destekli gerçek cihaz kontrolü gerekir.

## 2. İpucu Avı hedefi bulununca kart ve tahta yüksekliği değişebiliyor

**Öncelik:** Orta etki, güçlü durum/CSS kanıtı; oyuncuya etkisi henüz gözlenmedi. Küçük sunum düzeltmesi adayı.

**Kanıt:** `common.tsx:29`, `copy.isClue` doğruyken `clue-tag` sınıfını ve harf sayısını gösteriyor. `lib/game/word-card.ts:3–5` hedef bulununca bu sınıfı ve detay satırını kaldırıyor. Mobilde bekleyen tanımın alt yüksekliği 43 px (`app/atlas-adventure.css:20`), bulunan sıradan etiketinki 28 px (`app/mobile-game.css:22`). Yeni İpucu Avı bölümleri dört hedefli (`lib/game/atlas-content.ts:23–25`); üç sütunlu düzende tek kartlı son satırın veya tamamlanan ilk satırın yüksekliği küçülebilir. `PlayLayout` bu değişikliği yeniden ölçüyor (`common.tsx:43–48`); gerçek tahta boyutu değişirse `Board` mevcut seçimi temizliyor (`Board.tsx:18`).

**Oyuncu faydası / varsayım:** Tanım cevaba dönüşürken hedeflerin ve tahtanın sabit yerde kalması takip etmeyi kolaylaştırabilir. Hızlı ardışık iki uç seçiminin bu yeniden boyutlama anına rastlayıp temizlenmesi mümkün bir etkidir; cihazda tekrar üretilmiş hata olarak sunulmamalıdır.

**Küçük öneri:** İpucu Avı kartlarının tamamlanmamış/tamamlanmış durumlarında ayrılan alanı koru. Aynı kart/ızgara satırının tanım ve harf sayısı için gereken yüksekliği cevap görünümünde de rezerve et; metni kırpma veya hedefleri listeden kaldırma. Sabit piksel yüksekliğiyle büyük yazıyı kesme.

**Kabul:** Dört tanımlı bölümde tek kartlı son satır ve ilk satır tamamlanırken hedef/tahta sınırları yalnız başarı sunumu nedeniyle değişmez. Uzun tanım, normal/büyük yazı ve azaltılmış harekette bütün metin okunur; iç scroll geri gelmez. Gerçek viewport değişiminde seçimi güvenle temizleyen mevcut davranış korunur. Destekli önizleme toparlanınca DOM yerleşimi ve hızlı iki uç seçimi gözlenir.

## Devir ve sınır

Kaynakta yeni kritik kayıt kaybı veya engellenmiş temel seçim kusuru saptanmadı; tam doğruluk onayı değildir. Tek bakım odağı olarak 1 numaralı açık açılış işi daha güçlüdür. 2 numara, sonraki küçük kullanılabilirlik düzeltmesi veya hedefli DOM kontrolü adayıdır.

Yeni test, grafik, rakip araştırması veya alternatif browser/server çalıştırılmadı. Destekli önizlemenin `ERR_CONNECTION_REFUSED` engelinde toparlanma kanıtı yok. Fiziksel telefon, tarayıcı etkileşimi, büyük yazı, ekran okuyucu, FPS ve oyuncu keyfi/tutma etkisi ölçülmedi. Kabul maddeleri öneridir; geçmiş doğrulama gibi okunmamalıdır. Uygulama, içerik seçimi ve yayın koordinatördedir.
