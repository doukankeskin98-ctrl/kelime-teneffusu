# Beceri destekli oyun deneyimi incelemesi

- Tarih: 2026-11-04
- Rol: experience
- Taban: `/private/tmp/kt-device-settings-fix`, `27555c6`.
- Yöntem: AGENTS/experience kuralları ve `mobile-game-quality` becerisinin etkileşim, hareket, akış ve doğrulama referanslarıyla dar kaynak incelemesi. App/JourneyHome, ortak PlayLayout/Modal, JourneyResult, Arena, GameSettings ve ilgili son CSS katmanları incelendi. Uygulama kodu değiştirilmedi.
- Korunacak sınırlar: güncel 168 ana bölüm, eski global numara/kimlik/tahta/kayıt/ödül kuralları ve Arena geçmişi. Tahta düzeni yeni içerik sayılmaz.

## 1. Arena bitişi açık hedef listesini kapatmıyor

**Kanıt:** `components/game/Arena.tsx:98` bitişte `readOnly=true` ve `wordListUnavailable=true` gönderiyor; sonuç penceresi `:103` üzerinden ayrıca açılıyor. `components/game/common.tsx:107` içindeki MobileTargets `unavailable` hesabı, `wordListUnavailable` değerini yalnız `!readOnly` iken kullanıyor. Bitişte `paused` da false. MobileTargets içindeki açık liste yalnız `unavailable` true olunca kapanıyor (`:46,59`). Dolayısıyla maçın süresi hedef listesi açıkken dolarsa iki dialog aynı anda kalabiliyor.

**Etki:** Sonuç kapatılınca oyuncu beklenmedik biçimde eski listenin içine dönebilir; odak ve gövde kaydırma kilidi iki dialogun yaşam döngüsüne bağlı kalır. Bu turda gerçek Arena oturumunda gözlenmedi; kaynak durum geçişi bulgusudur.

**En küçük öneri:** Kutlama açıkken hedef listesini kullanılamaz yapmak (`celebrating` koşulunu ortak hesapta değerlendirmek). Salt okunur tahta incelemesinde listeyi yeniden açmak mümkün kalmalı. Sonuç, kural ve oyuncu sıralaması için yeni üst üste modal düzeni eklenmemeli.

**Kabul:** Hedef listesi açıkken zaman bitişi veya rakibin son kelimesi sonucu yalnız sonuç dialogu görünür. Sonucu kapatma okunabilir tahtaya döner; listesi yeniden açılabilir. Aynı senaryoda puan/kayıt, sonuç devamı ve odak geri dönüşü değişmez.

**Öncelik/risk:** P2; küçük ortak sunum değişikliği, düşük oyun kuralı riski.

## 2. Dünya hattı ve bölüm seçici aynı bölümü farklı adlandırıyor

**Kanıt:** `components/game/JourneyHome.tsx:37` ana konu başlığını `worldChapter(...).topic` üzerinden gösterirken `:39` küçük hattın erişilebilir adında eski `chapter.title` kullanıyor. `components/game/ChapterPicker.tsx:24-25` görünür ve erişilebilir adlarda konu başlığını kullanıyor. `lib/game/world-presentation.ts:15,32-38` Uzay'ın beşinci durağını “Uzak uzay” olarak tanımlıyor; eski bölüm adı “Uzak ufuklar”. Küresel sıra `lib/game/main-journey.ts:11,18` nedeniyle Uzay dünyası 1,2,3,5,9,10 numaralarını içeriyor.

**Etki:** Konu metni ve ekran okuyucu/düğme adı uyuşmuyor. Altı duraklık görsel hat üzerindeki küresel sıçramalar dünya içindeki ilerlemeyi açıklamıyor. Koordinatör bu turdaki tarayıcı gözleminde atlayan numaraları ve ad çelişkisini bildirdi; bu uzman doğrudan ekran gözlemi yapmadı. Küresel numaralar kayıt hatası değildir ve önceki uyumluluk düzeltmesinin parçasıdır.

**En küçük öneri:** Başlık için aynı `worldChapter` sunum kaynağını kullanmak. Dünya hattında açık “Durak 1–6” terminolojisi; erişilebilir adda örneğin “Durak 5/6 · Bölüm 9 · Uzak uzay” sunmak. Bölüm seçici de durak ve küresel bölüm ayrımını aynı dille açıklamalı; ana Oyna/bölüm başlığı gerçek küresel Bölüm 9 bilgisini korumalı. Yalnız numarayı sessizce 1–6'ya çevirmek yeni bir belirsizlik yaratır.

**Kabul:** Aynı kimlik ana ekran, durak düğmesi, bölüm seçici, oyun ve sonuçta aynı konu adıyla tanınır. Yerel durak 5 ile küresel bölüm 9 açıkça ayrılır. Eski kimlikler, numara eşlemesi, başlangıç/tekrar oynama ve kilitler değişmez.

**Öncelik/risk:** P2; dar metin/sunum düzeltmesi. Numara değişimini ilerleme kuralına taşımama şartıyla düşük risk.

## 3. Aktif oyunda rahatlık ayarlarına erişim kopuyor

**Kanıt:** `components/game/GameSettings.tsx:22-25` titreşim, kontrast ve hareket azaltma kontrollerini içeriyor. `components/game/App.tsx:116-119` aktif Solo/Sprint/Mystery/ek bölüm dalları ayar modalından önce dönüyor; Arena oyununda üst bar `:123` üzerinden gizleniyor. Ortak oyun araçları `components/game/common.tsx:118` yalnız zoom/ses/yardım sunuyor; Arena alt kontrolleri `components/game/Arena.tsx:98` yalnız zoom/ses/kurallar sunuyor.

**Etki:** Oyuncu rahatsız edici titreşimi veya hareketi tam yaşadığı anda kapatmak için oyundan çıkmak zorunda. Arena'da bu, aktif maçtan ayrılma anlamına gelebilir. Ana menüdeki ayarlara erişim önceki sürümde düzeltilmiştir; burada bulunan açık yalnız aktif oyun bağlamıdır.

**En küçük öneri:** Oyun araçlarında mevcut tercihleri kullanan ortak kısa rahatlık kontrolleri sunmak; en az ses, destekli cihazda titreşim ve hareket azaltma. Tam profil/ekonomi/renk ayarlarını oyun içine taşımamak. Solo duraklatma davranışı ve Arena süresinin devam ettiği bilgisi korunmalı.

**Kabul:** Oyundan ayrılmadan titreşim/hareket azaltma tercihi değişir; geri dönünce aynı tahta ve kayıt sürer. Desteksiz web ortamında titreşim kontrolü gösterilmez. Arena saati durmaz, tercih değişimi claim/puan üretmez. Bir kontrol etkinleştirmesi bir tercih değişikliğidir.

**Öncelik/risk:** P2; diğer iki bulgudan sonra. Ortak tercih sahipliğini korumak gerekir; yeni kayıt anahtarı veya farklı bir ayar paneli sistemi gerektirmez.

## Mevcut olanlar ve doğrulama sınırı

Sistem azaltılmış hareket tercihi `app/game.css:15` içinde genel olarak uygulanıyor; uygulama tercihi `app/game-shell.css:72` içinde, son sonuç/tahta kuralları `app/continuous-play.css:46-48` içinde uygulanıyor. `WordFeedback.tsx:20-23` tercihi kontrol ediyor; animasyon işleri sınırlı ve unmount/görünürlük temizliği bulunuyor. Solo sonucu azaltılmış harekette bekletilmiyor (`Solo.tsx:66`). Bunlar yeni öneri veya bu turda uygulanmış özellik sayılmadı.

Bu uzman turunda test çalıştırılmadı, canlı önizleme açılmadı, fiziksel telefon veya WoW gözlemi yapılmadı. Görsel kontrast, büyük metin taşması, gerçek dokunma rahatlığı, VoiceOver, yerleşim ölçüsü ve kare süresi doğrulanmış değildir. Koordinatörün tarayıcı denetimi ve hedefli davranış testleri bu kaynak incelemesini tamamlamalı; performans veya eşdeğer stüdyo kalitesi iddiası çıkarılamaz.

## Son delta kaynak kontrolü

Koordinatörün son değişiklikleri salt okunur incelendi. `PlayPreferencesProvider` ana kabuğun ve dört erken oyun dönüşünün tamamını kapsıyor; haptics güncellemesi işlevsel setter ile mevcut ilerlemeyi koruyor. `PlayComfortSettings` mevcut rahatlık tercihlerini kullanıyor, ayrı kayıt sahibi oluşturmuyor. MobileTargets artık `celebrating` sırasında kapanıyor. JourneyHome yerel durağı açık “Durak” metniyle ayırıyor, erişilebilir adında küresel bölüm numarasını ve ortak konu adını koruyor. CSS değişiklikleri görsel katmanda; gerçek cihaz akıcılığı sonucu çıkarılmadı.

**P2 regresyon — giderildi:** İlk deltada `MatchTools finished={finished}` terminal maçta araç düğmesini kalıcı kapatıyor, sonuçtan tahta incelemesine dönünce zoom/ses/kurallar erişimi kayboluyordu. Son kaynak kontrolünde `components/game/Arena.tsx:98` artık `review={review}` geçiriyor. `components/game/common.tsx:111-119` bitiş ve incelemeyi ayırıyor: bitiş açık paneli kapatıyor; incelemede araç düğmesi ve modal yeniden kullanılabiliyor; metin “Tamamladığın tahtayı inceleyebilirsin.” oluyor. İncelenen bu düzeltmede açık bulgu kalmadı. Koordinatör ayrıca gerçek 414×628 yerel tarayıcıda bitmiş Arena sonucu → kapat → araçları aç akışını ve metni gördüğünü bildirdi; bu görsel kanıt bu uzmanın doğrudan gözlemi değildir.

Bu son kontrolde kod veya test çalıştırılmadı; yalnız atanmış günlüğe bu sonuç eklendi.
