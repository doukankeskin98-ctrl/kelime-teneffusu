# Oyun hissi yenilemesi — sınırlı deneyim incelemesi

3 Kasım 2026. Kullanıcının bütün önerileri uygulama isteği kapsamında, uygulama koduna ve yayına dokunmadan kaynak/önceki görüntü incelemesi. Koordinatör uygulama ve yayın sahibidir.

## İncelenen kanıt

- `components/game/common.tsx:36-78`: mobil hedef odağı, kelime listesi ve onay vurgusu.
- `components/game/common.tsx:81-104`: ortak PlayLayout, sabit tahta ölçümü ve mevcut GameScene devamlılığı.
- `components/game/JourneyResult.tsx:13-27`, `app/world-journey.css:25-52`: madalyon, kazanım, yıldız, açılış ve ayrıntı hiyerarşisi.
- `components/game/JourneyHome.tsx:22-36`, `components/game/App.tsx:114-128`, `components/game/Pages.tsx:61-70`: ana eylem, üç ana sekme, ek yollar ve koleksiyon.
- `app/mobile-game.css:2`, `app/game-shell.css`: platform font yedeği ve menü görsel kuralları.
- Önceki simülatör görüntüsü `../world-review/0.29.0-ios-result.png` yeniden açıldı. Bu bir yeni cihaz/FPS veya hareket süresi doğrulaması değildir.

## En yüksek etkili üç bulgu

### 1. Onaylı kelimeyi tek, kesintisiz görsel hareketle bağlamak

**Kanıt/etki:** Tahtadaki stroke/end-flash ve WordList `word-confirmed` birbirinden bağımsız. Sürüklerken erken kabul zaten mevcut; yeniden icat etmek yerine kabulün oyuncuya görünür neden-sonuç bağı kurulmalı. Kelimenin tahtada bulunması ile listede tamamlanması bir bütün olarak algılanabilir. Bu fayda kullanıcı geri bildirimine dayanan tasarım varsayımıdır, ölçülmüş ürün etkisi değildir.

**Öneri:** Onaylı yeni stroke'tan kısa settle/ışık geçişi, ardından pointer-events:none görsel iz/kelime ile hedef bölgesine bağlanma. Kısa bir hedef parlaması yeterli; tahta taşıma, ölçekleme veya girişi bekleten sıra kullanılmamalı. Animasyon sayısı sınırlı tutulmalı. Kayıt/ödül işlemi animasyon sonuna bağlanmamalı.

**Kabul:** Ardışık üç hızlı kelimede sonraki çizim her zaman çalışır; pending Arena başarısı kutlanmaz; yeniden açılan eski bulunmuşlar tekrar uçmaz. Döndürülmüş tahta için uçuş başlangıcı görünür hücrelerle eşleşir. `MobileTargets` bulunan gruptan hemen ilerlediğinden tek bilmece modunda uçuş sabit ilerleme göstergesine yönelir; eski kelime yeni bilmecenin üzerine binmez. Kompakt listede kendi hedefinin merkezine yönelir. Hareket azaltma anında sade onaya geçer. Uzun/çok parçalı kelime tamamlanması ve son kelime sonuç geçişi ayrıca kontrol edilir.

**Maliyet/risk:** Orta; paylaşılan sunum katmanı ve yeni efekt yaşam döngüsü. Oyun kurallarını değiştirmeden uygulanabilir. Başarı makbuzu, unmount temizliği ve gesture akıcılığı güvenilirlik incelemesiyle doğrulanmalı.

### 2. Sonuç ekranında yıldız ve tek gerçek kazanımı odak yapmak

**Kanıt/etki:** JourneyResult, world heading + büyük madalyon + piece + PieceTrail + unlock + yıldız + ayrıntı birlikte üretir. Son CSS 172px madalyonu yıldızlardan önce konumlandırıyor. 0.29 simülatör görüntüsünde büyük halka, albüm başlığı, ayrıntı ve sonraki bölüm birbirinden kopuk bloklar halinde. Odağın bölünmesi oyuncunun beklediği kısa başarı anını zayıflatıyor.

**Öneri:** Aynı sahnenin üzerinde ortalanmış başarı başlığı, sırayla yerleşen gerçek yıldızlar ve tek küçük kazanım kartı. Albüm ilerlemesi küçük 6 duraklı şerit olabilir. Dünya açılma/album tamamlama ayrı daha belirgin varyant; normal bölüm kısa. Ayrıntı/replay/tahta inceleme ikincil kalsın. Devam tek ana eylem olarak hemen erişilebilir.

**Kabul:** 360×568 ve 414×622 kullanılabilir alanlarda yıldızlar ve Devam aynı anda görünür; uzun açılış metni/ayrıntı açılması CTA'yı kapatmaz. Son kelime→sonuç→sonraki bölüm sırasında arka plan beyaza düşmez. Tekrar oyunda yeni parça kazanılmış gibi gösterilmez; yıldız ve ilerleme gerçek kayıttan gelir. Azaltılmış hareket animasyon zincirini beklemez. Arena sonuçları aynı başarı dilinde ancak gerçek kazanan/skora bağlıdır.

**Maliyet/risk:** Orta; JourneyResult markup ve ortak sonuç CSS. Ödül/kayıt modeli değişmeden yapılabilir.

### 3. Üç sekmeyi koruyup giriş/etkinlik/koleksiyon hiyerarşisini tutarlı yapmak

**Kanıt/etki:** App'te Yolculuk/Arena/Koleksiyon zaten sabit üç hedef. JourneyHome ise dünya/rota/bölüm bilgisi ve üç ek kısa yolu birlikte açıyor. Koleksiyon önce profil/kayıt, istatistik ve hikâyeler gösteriyor, asıl dünya albümleri aşağıda. `mobile-game.css:2` cihazın ui-rounded/Trebuchet/Arial fontuna bağlı; yazı ölçüsü ve biçimi farklı platformlarda değişebilir. Menü hedefinin anlamı ile ilk görünen içeriğin uyuşmaması ve farklı tipografi oyun bütünlüğünü zayıflatıyor.

**Öneri:** Üç ana sekme değişmeden kalsın. Yolculukta dünya + mevcut bölüm + tek Oyna, ek yollar tek Etkinlikler alanında toplansın. Koleksiyonda albümler ilk görünür içerik olsun; profil/hesap yönetimi avatar üzerinden açıkça erişilebilir olsun. Arena giriş/lobi/sonuç aynı renk ve başlık sistemini kullansın. Paketlenmiş lisanslı Türkçe font, tahta ve metin için okunaklı ağırlık kuralları; gereksiz büyük harf/harf aralığı ve süslü sloganlar azaltılsın.

**Kabul:** İlk ekranda ana eylem baskın ve tek bakışta anlaşılır. Günlük/hikâye/eski kitaplık, derin adres ve profil ayarları kaybolmaz. Üç sekme yer değiştirmez; etkin ekran doğru işaretlenir. 360px genişlikte ve uzun Türkçe metinlerde taşma yok; küçültülmüş düğmelerle sığdırma yapılmaz. Fontlar web ve paketli iOS'ta çevrimdışı yüklenir, Türkçe harfler eksiksizdir; lisans dosyası pakette tutulur.

**Maliyet/risk:** Orta; sunum ve gezinme erişimi. Menü sadeleşmesi sırasında mevcut yolların kaybı en önemli regresyon riski.

## Doğrulama sınırı

Bu inceleme kaynak ve önceki statik simülatör görüntüsüne dayanır. Yeni uygulama çalıştırılmadı, fiziksel cihaz veya WoW hareketi kare kare ölçülmedi. Animasyon zamanlaması, gerçek ses/titreşim konforu, erişilebilir odak ve küçük telefon görsel kabulü uygulamadan sonra doğrulanmalıdır. Eski kimlik, kelime, tahta, kayıt, ödül ve Arena tekrar engeli kapsam dışı ve korunması gereken sınırlardır.

## Uygulama sonrası dar diff incelemesi

Koordinatörün yeni `JourneyResult`, Etkinlikler menüsü, albüm odaklı Koleksiyon ve `studio-polish.css` değişiklikleri kaynak üzerinden incelendi. Uygulama kodu değiştirilmedi. Üç somut düzeltme adayı bildirildi:

1. **Yeni font kökleri eski değişkenler tarafından gölgeleniyor.** `app/typography.css:17-21` yalnız `:root` değişkenlerini ve `.game-app` seçicilerini kullanırken `app/mobile-game.css:2`, `.app-shell` ve `.game-app` üzerinde yerel `--sans/--serif:ui-rounded...` atıyor. Yerel atama kökten kalıtılan Manrope değerini geçersiz kılar; menü/Arena kökü `.app-shell` olduğundan yeni font kuralları ayrıca bu ekranları kapsamıyor. Öneri: son font dosyasında iki uygulama kökünde değişkenleri ve metin/başlık kapsamını birlikte tanımlamak. Kabul: computed font-family hem ana menü hem Solo harf hem Arena metninde Teneffus; Türkçe font dosyaları yüklenmiş olmalı.

2. **Arena lobisinin koyu zemini uygulanmıyor.** `app/studio-polish.css:60-61` yeni koyu zemin ve açık metinler ekliyor; `app/world-journey.css:9` içindeki `background:#fcf9ed!important` yeni zemini engelliyor. Aynı eski dosyanın 160/195px `padding-top!important` değeri 86px'e inen hero ile geniş boşluk bırakır. Öneri: eski baskın kuralları güncellemek veya açıkça uyumlu biçimde kaldırmak; yalnız metni koyulaştırarak tasarım hedefini kaybetmemek. Kabul: 360/414 lobi ekranında başlık/oda kodu/yardım metni okunur, hero sonrası gereksiz boşluk yok.

3. **Avatarın verdiği söz artık karşılanmıyor.** `components/game/App.tsx:118` üzerindeki “Oyuncu profilini aç” eylemi yalnız koleksiyon sekmesine gider. `components/game/Pages.tsx:61` profili bütün albümlerin sonrasındaki kapalı `details.collection-player` içine taşıdı. Kullanıcı avatara dokunduğunda profil açılmaz; uzun albüm listesini kaydırıp yeniden bir panel açması gerekir. Öneri: ayrı profil sheet veya details'i açıp odağı/kaydırmayı ona yönelten açık profil yolu. Kabul: ana ekran avatarına tek dokunuş oyuncu adını ve hesap/kayıt durumunu görünür kılar; Koleksiyon sekmesi normal albüm başına gider.

Sonuç kompozisyonu ve Etkinlikler yönlendirmesinde bu kaynak incelemesinde ek kesin hata bulunmadı. Yeni yıldız/sonuç görsel kabulü, gerçek mobil boyut ve hareket örneği koordinatörün önizlemesinde ayrıca doğrulanmalıdır.
