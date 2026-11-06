# WoW incelemesi sonrası akış · Deneyim incelemesi

Kaynak: 0.38.2, `329edf0`. Sınırlı, salt okunur kod incelemesi; uygulama kodu veya yayın değiştirilmedi. Fiziksel referans kanıtı çalışma alanındaki `world-review/wow-2026-11-06/observations.json`; yeni fiziksel telefon doğrulaması yok.

## 1. Öncelik: tamamlamayı tek hareket dizisine bağla

Kaynak: `components/game/common.tsx:115`, `components/game/Solo.tsx:73`, `app/world-journey.css:23`, `app/continuous-play.css:46-51`, `components/game/JourneyResult.tsx:14-23`.

Mevcut akış uçuşu bekliyor; fakat `is-celebrating` bütün oyun yüzeyini `visibility:hidden` ile aynı anda kapatıyor. Sonuç, sahnenin üzerinde tekrar koyu ve sınırları belirgin büyük bir panel açıyor. Referansta araçlar/üst bilgi geri çekiliyor, ardından tahta kayboluyor; sahne sürekliliği daha açık.

Öneri: mevcut kayıt ve resmi bitiş anından bağımsız sunum evreleri; son harf inişi tamamlandıktan sonra üst/alt araçlar, ardından tahta/raf opacity/transform ile ayrı kısa aralıkta ayrılsın. Sonuçta tek güçlü devam düğmesi, kısa yıldız/albüm özeti; ayrıntılar açılır kalsın. Aynı sahne ikinci kez büyük kart arka planı olarak tekrarlanmasın.

Kabul: son harf uçuşu kesilmez; sonuç atlama, azaltılmış hareket, arka plana alma ve tahta incelemesi doğru çalışır; tekrar ödül yok; 375×667 ve kısa Safari kullanılabilir alanında başlık/kapat/devam görünür. Yeni dizi için FPS iddiası ancak cihaz ölçümüyle yapılabilir.

## 2. Rekabet üst alanındaki yinelenen bilgi ve seçim konumu

Kaynak: `components/game/Arena.tsx:122-123`, `components/game/Challenges.tsx:59-60`, `components/game/CompetitionHud.tsx:4-10`, `components/game/common.tsx:105-115`, `app/play-comfort.css:53-54`, `app/arena-experience.css:10`.

Arena bulunan kelime sayısını HUD etiketi ve alt meta satırında yineliyor. Meydan, kurallarda/yan açıklamada bulunan davet veya kayıtlı performans açıklamasını ayrıca üstte sürekli tutuyor. Çizilen kelime mobilde konu başlığını gizleyerek onun yerine geliyor; referansta sabit raf ve tahta arasındaki küçük baloncuk aynı işi yapıyor.

Öneri: skor/süre/sıra HUD'unu koru; normal durumda meta satırını kaldır, bağlantı sorunu ve gerekli durum mesajını koşullu göster. Konu sabit kalsın; seçim baloncuğu raf/tahta arası küçük boşlukta, yerleşim boyutu değişmeden ve işaretçi olaylarını engellemeden görünsün. Üst başlıkları büyütüp tahtayı tekrar sıkıştırma.

Kabul: Arena/Meydan saat ve gerçek skor görünür; bağlantı uyarısı kaybolmaz; çizim sırasında başlık yer değiştirmez; tüm tahta satırları görünür. Mevcut board ölçüsü ve harf kontrastı eski ekranlara göre yeniden bozuk sayılmamalı.

## 3. Bağlamsal araç menüsü var; eksik olan görsel ve eylem sırası birliği

Kaynak: `components/game/common.tsx:119-125,129-143`, `components/game/PlayPreferences.tsx:10-19`, `components/game/GameSettings.tsx:18-31`.

Solo ve rekabet zaten ayrı, kısa oyun araçları kullanıyor. Ses, büyük tahta, titreşim ve hareket tercihlerinin yeniden kurulmasına gerek yok. Ancak iki ayrı JSX blok aynı menüyü sürdürüyor; “Oyuna dön” küçük eşdeğer araç hücresinde ve titreşim/hareket tercihlerinden önce, durum açıklaması ise en sonda kalıyor. Pencere varsayılan krem modal yüzeyine dönüyor.

Öneri: ortak oyun-ayarları gövdesi ve sahneye uyumlu tek sınıf; ses/titreşim temel satırlarda, görünüm rahatlıkları ikincil açılır bölümde, kurallar ikincil eylemde; en altta tek belirgin Oyuna dön. Rekabetin “süre devam ediyor” uyarısını üstte görünür tut. Mevcut Solo menü açılışında duraklatma ve kapatınca devam etme davranışını aynen koru.

Kabul: aynı tercih bütün modlarda aynı değeri değiştirir; rekabet saati durmaz, Solo kendi duraklatma durumunu korur; klavye odağı ve güvenli alanlar korunur. Satın alma, yeni SDK, haptik şiddeti, ilerleme, içerik veya bölüm kimliği değişmez.

## Yeniden yapılmaması gerekenler

0.38.2 yerel Arena/Meydan kelime onayı; kabul edilmiş 720 ms uçuş/180 ms iniş ve haptik dengesi; 0.36 sabit hedef rafı; 0.37 ilk giriş çizim rehberi ve ortak alt ekran kabuğu zaten mevcut. 168 bölüm/242 Meydan seçeneği ve kayıt uyumluluğu korunmalı. Yeni genel rehber, reklam veya içerik yeniden sıralaması bu teslim için gerekli değil.
