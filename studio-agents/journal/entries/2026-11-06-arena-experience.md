# 6 Kasım · 0.38 Arena oyun çerçevesi incelemesi

Başlangıç kaynak: `5b893192551c8521d57d1d64da74e61587efd5f4` / 0.37.0. Kapsam Arena, Challenges, ortak PlayLayout, viewport ölçümü ve bu ekranları etkileyen CSS. Uygulama salt okunur; test, tarayıcı, kurulum veya yayın yapılmadı. Koordinatör gerçek arayüzü ayrıca inceliyor. `mobile-game-quality` akış/tahta kabul ölçütleri kullanıldı.

## 1. P1 · Oyun açıkken menünün 100 px alt rezervi hâlâ tahtadan çıkarılıyor

**Kaynak:** `app/game-shell.css:4,75`, `app/game-styles.css:15,23`, `app/viewport-arena.css:2`, `lib/game/viewport.ts:44–57`, Arena `onPlaying` için `components/game/Arena.tsx:61`, Challenges `onPlaying` için `components/game/Challenges.tsx:24`.

Arena/Challenges ana shell içindeki `.main-content.arena-is-playing` altında kalıyor. Daha sonra yüklenen `.native-shell .main-content` aynı özgüllükteki oyun frame kuralını `padding:16px 20px 100px` ile geçersiz kılıyor. Telefonun üst rezervi 16 px; 24 px üst rezerv yalnız en az 760 px genişlikte. `measurePlayFrame` container'ın gerçek `paddingBottom` değerini okuyup görünür yükseklikten çıkarıyor. Solo'nun `.game-app` çerçevesi ise 8 px + safe-area alt, 12 px + safe-area yan rezerv kullanıyor. Safe-area hariç rekabet modları böylece 92 px fazla alt boşluk ve toplam 16 px daha az genişlik alıyor. Fitter bu yanlış bütçeyi doğru ölçüyor; sonra tahta küçülüyor veya 26 px hücre alt sınırına gelince sayfa taşıyor.

**En küçük çözüm:** Geç yüklenen, oyun oturumuna özgü tek çerçeve kuralıyla `.arena-session .main-content.arena-is-playing` için Solo'nun safe-area bütçesini kullan. Menü rezervini aktif oyuna taşımama; fitter'ın okunurluk tabanını düşürme ve içerik/tahta boyutunu ekrana göre değiştirme.

**Kabul:** Aynı viewport ve safe-area değerlerinde Solo/Arena/Challenge container padding hesabı eşit. 414×628, 375×600, 320×568 ve native safe top/bottom senaryolarında tüm tahta satırları görünür; hedef/alt araç sınırı sayfa dışında kalmaz. 9×9 yeni ve desteklenen eski yoğun tahtalarda ayrı ölçüm; `--fitted-board`, overhead ve `data-fit` kayıtlarıyla önce/sonra karşılaştırma. Dönüş/bağlantı/bilmece satırı değişirken tahta pointer teması sırasında hareket etmez.

## 2. P1 · Challenge saati krem üzerinde açık renk; rekabet HUD'ları eski yüksekliği koruyor

**Kaynak:** `components/game/Challenges.tsx:40–41`, `app/studio.css:20,28`, `app/scenic-journey.css:9,30,42–43`, `app/world-journey.css:10,13`, `components/game/Arena.tsx:112–113`, `app/play-comfort.css:43`, `lib/game/viewport.ts:50–53`.

Challenge'ın `.ghost-scorebar` yüzeyi krem, fakat foreground tanımlamıyor. `.scenic-play` üst bileşeni `#fffdf2` verdiğinden `.ghost-clock` ve ana sayılar bu açık zeminde açık renkle kalıyor. Arena koyu HUD için ayrı override almış; Challenge almamış. Ayrıca eski ghost HUD mobilde 14 px dikey padding, 24 px sayı, sayı marjları ve ilerleme çubuklarını koruyor. Solo ise 28 px HUD kullanıyor. Arena'da skor/saat/rütbe satırının altında aynı maç/tur türü, kelime sayısı, galibiyet ve bağlantı metni yeniden bulunuyor; dar ekranda bu ikinci satır sarılabiliyor. Gerçek yüksekliklerin tamamı fitter overhead'ine dahil.

**En küçük çözüm:** Arena ve Challenge için aynı koyu renkli kompakt skor/saat sistemi: sabit merkez saat alanı (`tabular-nums`, `white-space:nowrap`, `flex-shrink:0`), iki yanda kısa oyuncu/puan bilgisi; gerekli bağlantı durumu kısa ve sabit alan. İsim taşması tek satır ellipsis; ayrıntı sıralama panelinde kalır. Sürenin anlamı ayrı kalmalı: Arena kalan süre, Challenge geçen süre. Bu yalnız sunum değişikliği; server starts/ends/duration ve ready/claim kuralları korunur.

**Kabul:** İki modda saat ve skor sahneye bakılmaksızın okunur; 0:59 → 1:00, üç haneli skor ve uzun isim HUD yüksekliğini değiştirmez. Bağlantı yeniden kuruluyor yazısı geldiğinde tahta küçülmez. Final bekleyişi ve 720/180/1040 ms geri bildirim süreleri değişmez. Testler metnin varlığını doğrulayabilir; kontrast ve gerçek bbox görünür tarayıcıda ayrıca doğrulanmalı.

## 3. P1 · Lobi temel eylemleri kadro ve açık seri tablosunun arkasında kalıyor

**Kaynak:** `components/game/Arena.tsx:100–106,123–131`, `app/world-journey.css:9`, `app/viewport-arena.css:20`, `app/studio-polish.css:60,90–91`, `app/game-shell.css:2`.

Hazırım/Maçı başlat, kadronun, varsa seri tablosunun, önceki sonuç girişinin ve özel oda kodunun ardından geliyor. `ArenaSeriesBoard` tipi `expanded?` kabul etse de bileşen bu değeri okumuyor; lobby de sonuç gibi 12 satıra kadar seri tablosunu açıyor. Lobi dışı ana sahne kaldırıldığı için krem shell üstünde dar bir sahne kartı kalıyor. `.lobby-ready` sticky olsa da en yakın `.arena-scenic-lobby` atası `overflow:hidden` ve kendi scroll yüksekliği yok; bu nedenle eylem viewport'a tutunmuyor. Rematch veya kalabalık odada hazır ol/başlat/ayrıl eylemleri uzun içerikten sonra geliyor. Kaynak kusuru kesin; hangi telefon yüksekliğinde ne kadar aşağıda kaldığı görsel ölçüm bekliyor.

**En küçük çözüm:** Mevcut stadyum sahnesini lobi boyunca koru. Kısa başlık/durum, sınırlı ve kaydırılabilir oyuncu listesi, seri için kısa özet + mevcut ayrıntı paneli kullan. Hazırım/Başlat ile Ayrıl, içerik akışının dışında safe-area üzerinde tek alt eylem bölgesi olsun; sticky kullanılacaksa scroll konteyneri gerçekten bu paneli içermeli ve overflow:hidden tuzağı kaldırılmalı. Host/allReady/canStart koşulları, özel oda paylaşımı ve eski maç sonucuna erişim aynen kalır.

**Kabul:** Tek kişi bekleme, iki kişi ready, host/non-host, 12 kişi, önceki seri sonuçlu rematch ve cancelled oda. Her durumda birincil eylem ve ayrılma görünür ve en az 44 px; liste kaydırmak eylemleri kaybettirmez. Oda kodu ve paylaşım erişilebilir. Ana Arena → lobi → geri sayım → tahta → sonuç → lobi akışında açık krem dış yüzeye sıçrama yok.

## Ortak küçük yerleşim kararı ve bilmece sınırı

Tek karar: var olan PlayLayout + mevcut sahne üzerinde aynı gerçek viewport bütçesi, kompakt rekabet HUD'ı, bütün normal hedefler veya numaralı bilmece yuvaları + tek etkin tanım, hemen ardından kare tahta, tek alt araç satırı. Yeni bağımlılık, font, oyun motoru veya hedef sayısı değişimi gerekmiyor.

`common.tsx:41–67` bilmece yapısı zaten bütün numaralı/harf sayılı yuvaları ve tek etkin tanımı sunuyor. `play-comfort.css:27–35` bir yuva satırı ve 46/52 px etkin tanım kullanıyor. Bunu bütün uzun tanımları aynı anda gösteren listeye döndürmek tahta bütçesini yeniden bozar. Uzun tanım tam liste panelinde okunabilir kalmalı; hedef seçimi yalnız sunumdur. 320 px'de 7 veya eski 9 yuvanın yatay hedef genişliği 44 px'den küçük olabilir: tek satırın fiziksel parmak rahatlığı bu kaynak incelemesiyle kabul edilmiş değildir. Tahta yerleşimi düzeltildikten sonra koordinatör bu sınırı gerçek bbox ve mümkünse cihazla değerlendirmeli. Süreli oyunda tam tanım paneli açıldığında sürenin devam ettiği davranışı korunur ve anlaşılır olmalıdır.

Sınır: fiziksel iPhone Safari/Capacitor, parmak seçimi, VoiceOver ve kare süresi denenmedi. Günlük yalnız kaynak kök nedenleri ve hedefli kabul ölçütleridir; üç bulgu henüz uygulanmış sayılmaz.

## 0.38 uygulama diff'i · ikinci dar kontrol

Koordinatörün Arena, Challenges, CompetitionHud ve `arena-experience.css` çalışma ağacı diff'i okundu. Yeni geniş denetim, uygulama/test değişikliği veya tarayıcı kullanımı yapılmadı. Bu aşamada önceki 100 px menü rezervi, Challenge HUD foreground ve açık seri tablosunun lobby akışını uzatması kaynakta giderilmiş görünüyor. Fiziksel/geometrik kabul koordinatörün arayüz kontrolündedir.

1. **P2 · Seri paneli maçlar arasında taşınıyor.** `Arena.tsx:22,65,114`: yeni `seriesOpen`, room id/round değişiminde sıfırlanmıyor. Hazır oyuncu paneli açıkken host maçı başlatırsa aktif oyun dalı paneli unmount ediyor, state true kalıyor; sonraki lobi/rematch eski paneli kendiliğinden tekrar açıyor. Minimal düzeltme: oda/round reset'e `setSeriesOpen(false)` ve lobby'den active/finished fazına geçişte lobby modal state temizliği. Kabul: seri açık → başka oyuncu başlatır → sonuç → yeni lobby, hiçbir eski panel otomatik açılmaz.

2. **P1 · Timeout ardından belirsiz claim kendiliğinden uzlaştırılmıyor.** `Challenges.tsx:32,42–43,66–68`: yeni 12 saniyelik timeout pending/busy'yi temizliyor, fakat aynı oyunu sunucudan okumuyor. Tek GET recovery online olayında. Sunucu kelimeyi kabul etmiş fakat yanıt gecikmişse, bağlantısı online kalan istemci son kelime/finished bilgisini alamayıp sayacı sürdürebilir. Yeni hata metnindeki yeniden bağlantıda kontrol sözü native resume veya yalnız yavaş ağ için yeterli değil. Minimal çözüm: belirsiz claim sonrası aynı id/code guard'lı GET veya görünür Durumu kontrol et eylemi; online/native resume bu read-only recovery'yi paylaşmalı. Mutation otomatik tekrarlanmamalı. Kabul: sunucuda kabul edilmiş final claim yanıtı timeout → online değişmeden recovery → bir kez tamamlanmış sonuç, bir kez puan; eski code/owner cevabı güncel oyuna uygulanmaz.

3. **P2 · Koyu kadro satırındaki güvenlik ikonu için selector yanlış.** `arena-experience.css:14` `.player-safety-trigger` kullanıyor; `PlayerSafety.tsx:11` gerçek sınıfı `.safety-trigger`. Dolayısıyla `game.css:3` icon-button koyu yeşili ve `studio.css:6` subtle şeffaf zemini yeni koyu kadro satırında kalıyor. Minimal düzeltme yalnız gerçek sınıfa scope'lu foreground. Kabul: başkasının satırında bildir/engelle ikonu ve odak halkası koyu zeminde görülür; 44 px mevcut hedef korunur.

Koordinatör bilmece harf sayısı toplamını ayrı olarak düzelttiğini bildirdi; bu ikinci kontrolde o iş yeniden açılmadı. Diğer içerik/katalog/emeklilik diff'leri bu görevin kapsamı dışındadır.
