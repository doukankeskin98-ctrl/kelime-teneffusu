# 6 Kasım 2026 · İlk giriş, dokunma ve hesap güvenilirliği incelemesi

Koordinatörün isteğiyle salt okunur inceleme. Taban: `ae43883cc0f9fb45f6ada3707bdbd7fbf444bc43` / 0.36.4. İnceleme sırasında koordinatörün 0.36.5 SupportReport, App ve paket değişiklikleri çalışma ağacına geldi; bunlara dokunulmadı. Aşağıdaki App satırları inceleme anındaki çalışma ağacına aittir. Uygulama, cihaz, dağıtım, veri veya hesap değiştirilmedi. AGENTS, rol kaydı, reliability rolü ve mobile-game-quality rehberi kullanıldı. Görev açıkça 4–7 bulgu istediği için altı risk/eksik sıralandı; bunların tamamı yeni hata iddiası değildir.

## 1. Misafirden kalıcı hesaba geçiş tam oyuncu kaydını taşımıyor — P1, kaynakla doğrulanmış eksik

- Kaynak: `components/game/App.tsx:71,83`; `lib/game/progress.ts:7-13,26-41`; `components/game/PublishedChapters.tsx:56-69,79`; `app/api/account/route.ts:10-11`; `lib/auth/accounts.ts:15-19`.
- Mevcut koruma: aynı oturumdaki `kt-upgrade-progress` standart Solo v2 ilerlemesini birleştiriyor. Bunu yok saymak yanlış olur. Eski Sites hesabı ve Firebase hesabı bağımsız olarak aynı e-postayı doğrularsa eski oyun kimliği korunuyor.
- Açık: geçiş paketi yalnız `Progress` nesnesi. Tarihli/ek bölümlerin owner'a bağlı ayrı kayıtları, Arena sonuçları/derece/tekrar geçmişi ve arkadaş grafiği bu nesnede yok. Misafirin doğrulanmış cookie sahipliği `Accounts.claim` tarafından yeni kimliğe bağlanmıyor. Safari cookie deposu ile native HTTP cookie deposunu birleştiren bir geçiş de mevcut değil.
- Tetikleyici: misafirle bir ana bölüm, bir tarihli bölüm ve bir Arena maçı tamamla; “Kalıcı hesabımla devam et” üzerinden e-posta hesabına geç. Ana bölüm korunabilir; kalan verinin aynı oyuncunun verisi olarak devam etmesi kaynakta sağlanmıyor. Bu, veritabanı satırlarının silinmesi değil, yeni kimlikten ulaşılamamasıdır.
- En küçük doğru kapsam: mevcut iki kimliğin sahipliğini doğrulayan, yeniden denenebilir hesap bağlama/devretme işlemi; Solo kopyası ile kimlik devrini birbirine karıştırmayan UI. Rekabet puanı istemcideki JSON'dan üretilmemeli.
- Kabul: iki test hesabı ve bir misafirle ana bölüm/ek bölüm/Arena geçmişi/arkadaş/tekrar geçmişi aynı sahipte korunmalı. Bağlama tekrarında iki ödül/sonuç oluşmamalı; başka hesabın cookie/tokenı ile birleştirme reddedilmeli. Safari→native ve ikinci cihaz ayrı doğrulanmalı. Eski sahipten geç gelen yanıt yeni hesabı değiştirmemeli.
- Mevcut test sınırı: `tests/auth.test.ts:87-95` aynı e-postalı eski Sites hesabını doğruluyor; tam guest→native/account aktarımını doğrulamıyor.

## 2. Misafir kimliği çıkışta ve 90 gün sonunda geri alınamıyor — P1, kaynakla doğrulanmış kullanıcı kaybı riski

- Kaynak: `lib/auth/guest.ts:3-10,15-21`; `app/api/session/route.ts:9-15`; `components/game/App.tsx:73,79,83`; `components/game/Pages.tsx:66`.
- Oturumun ömrü oluşturulma anından itibaren 90 gün. Okuma sırasında uzatma/yenileme yok. `deleteGuest` yalnız geçerli tokenı siliyor; sonraki profil oluşturma yeni `guest:<UUID>` üretiyor. UI çıkıştan sonra geri açılamayacağını söylüyor, fakat süre dolması için bir kurtarma veya kalıcı hesaba güvenli dönüştürme yolu yok.
- Tetikleyici: düzenli oynayan misafirin 91. gün dönüşü veya misafir çıkışı→yeniden profil. Önceki owner cache'i fiziksel olarak kalabilir; yeni owner gelince App yeni owner'ın cache'ini seçer. Aynı nickname sahiplik kanıtı değildir ve eski veriyi geri getirmez.
- Öneri: önce 1. bulgudaki kalıcı kimlik bağlamasını çöz; misafiri kalıcı hesaba dönüştürme ve çıkış etkisini doğru anlat. Aktif guest session yenileme tasarlanacaksa token çalma/yenileme sınırı ve revoke davranışı korunmalı. Sadece süreyi sonsuza uzatmak kurtarma çözümü değildir.
- Kabul: 89./91. gün, uygulama güncellemesi, çıkış, cookie kaybı ve yeniden kurulum ayrı senaryolar. Oyuncu kayıtları erişilemez hale gelmeden dönüştürülebilmeli; çıkmış/eski/revoke edilmiş token yeniden kabul edilmemeli. Aynı adı seçen başka kişi eski kaydı alamamalı.
- Mevcut test: `tests/studio.test.ts:39-44` 91. günde reddi ve token iptalini açıkça doğruluyor. Bu güvenlik testi, oyuncu kurtarmanın varlığını kanıtlamaz.

## 3. Hesap silme yalnız oturum kapatmayla karşılanıyor — P1, doğrulanmış yayın hazırlığı açığı

- Kaynak: `components/game/Pages.tsx:66`; `lib/auth/firebase-client.ts:59`; `app/api/session/route.ts:15`; `lib/auth/guest.ts:21`; `app/api/account/route.ts:5-13`.
- UI “Bu profilden çıkış yap” sunuyor. Firebase `signOut`, guest session token silme ve cookie temizleme var; kullanıcının oyun verilerini/hesabını/sağlayıcı hesabını silen tamamlanabilir bir işlem yok. `/api/account` yalnız claim POST sağlıyor. Genel destek raporu bu işlemin yerine geçmez.
- Öneri: sahibi yeniden doğrulanan, idempotent ve kısmi başarısızlıktan devam edebilen silme. Provider hesabı, tüm oturumlar, kişisel ilerleme ve ilişkiler kapsanmalı; diğer oyuncunun ortak maç geçmişi korunacak biçimde kişisel alanlar silinmeli/anonimleştirilmeli. Politika kararı koordinatörün Apple incelemesinden ayrı ele alınır.
- Kabul: misafir ve kalıcı hesap; iki cihazda açık oturum; sağlayıcı çağrısı başarısız; tekrar deneme; silme sonrası eski token ve geç gelen istek. Yeniden giriş silinmiş ilerlemeyi cache/cloud'dan diriltmemeli, diğer oyuncunun sonucu bozulmamalı.

## 4. Paylaşılan oyuncu adları için bildir/engelle/moderasyon yolu yok — P1, doğrulanmış eksik

- Kaynak: `lib/game/server.ts:22,37`; `lib/auth/guest.ts:13`; `components/game/Pages.tsx:76`; `app/api/social/route.ts:22-29`; `lib/game/social.ts:84-89`.
- Adlar Unicode harf/rakam ve sınırlı noktalama açısından temizlenip uzunlukla sınırlandırılıyor; bu içerik denetimi değildir. Adlar Arena/arkadaş/sıralama/geçmişte diğer kişilere gösteriliyor. Sosyal API arkadaş `remove` içeriyor; kullanıcı `block` veya `report`, moderasyon kuyruğu ve eşleştirme engeli içermiyor.
- Öneri: ilk sürüm için önceden denetlenen isim politikası veya rapor+engelle+işletilen inceleme yolu seçilmeli. Arkadaş silmenin engelleme diye sunulmaması gerekir.
- Kabul: uygunsuz bir ad test hesabından diğerine göründüğünde raporlanabilmeli; blok sonrası yeni davet/eşleşme yolu kapalı olmalı; mevcut maçtan güvenli ayrılma ve karşı tarafın sonuç bütünlüğü korunmalı. Rapor hedefi/kanıtı denetlenebilir olmalı, kullanıcı arayüzündeki başarı gerçek sunucu kaydına dayanmalı.

## 5. Game Center entegrasyonu bulunmuyor — P2, istenen ürün deneyimi açığı

- Kaynak: `mobile/main.tsx:14-28`; `ios/App/App/GameBridgeViewController.swift:3-7`; `ios/App/App/Info.plist:25-26`; `components/auth/EntryPanel.tsx:9-12`; `lib/auth/server.ts:16-26`.
- Native köprü Haptics ve Sharing eklentilerini kaydediyor. Oyun kimlikleri mevcut Sites, e-posta ve guest yolları. iOS/mobile/auth ağacında GameKit/GKLocalPlayer/Game Center doğrulaması, başarı veya sıralama entegrasyonu bulunmadı. `LSSupportsGameMode` yalnız Oyun Modu bildirimi; Game Center bağlantısı değildir.
- Bu bulgu “her App Store oyunu Game Center kullanmak zorunda” iddiası değildir. Kullanıcının talep ettiği profesyonel ilk giriş/sistem oyuncu deneyiminin henüz geliştirilmemiş kısmıdır. Sahte “bağlandı” bildirimi eklenmemeli.
- Öneri: Game Center kullanılacaksa sistem doğrulama durumu, iptal/çevrimdışı devam, hesap değiştirme ve mevcut oyun kimliğine sahiplik bağlama bir bütün olarak tasarlanmalı; mevcut hesabı sessizce değiştirmemeli. Sadece bir giriş ekranı eklemek 1. bulguyu çözmez.
- Kabul: Game Center oturumu açık/kapalı, iptal, çevrimdışı ilk giriş, foreground dönüş ve sistem hesabı değişimi. Misafir olarak oyun kullanılabilmeli; yanlış oyuncuya progress yazılmamalı; sistemce doğrulanmamış kullanıcıya bağlı durumu gösterilmemeli.

## 6. Dokunma/his ve kesinti kabulü gerçek cihazda kapanmış sayılmaz — P1 yayın kabulü, yeni algoritma hatası iddiası değil

- İncelenen kaynak: `components/game/Board.tsx:23-86`; `lib/game/input-gesture.ts:11-86`; `lib/game/legacy-ui.ts:6-14`; `lib/game/viewport.ts:15-20,65-90`; `mobile/main.tsx:20-25`; `components/game/Solo.tsx:70-78,133-141`; `components/game/Arena.tsx:22-29,39-58,110`; `lib/platform/native-haptics.ts`.
- Önceki TROYA/kenar sorunları mevcutmış gibi tekrar raporlanmadı. Tam on-ray hücre kabulü, dış kenarda 0.45 hücre temas payı, sınırlı iki hücre taşma, sekiz yön pivot, görsel ucun seçilmemiş sonraki harfe ulaşmaması kaynakta mevcut.
- Pointer→Touch devralma, doğru kaynağa/id'ye göre move/up/cancel, son bırakma örneğinin değerlendirilmesi, tek commit öncesi drag/RAF temizliği, blur/hidden/rotation iptali bulunuyor. KALE/KALEM kısa önek erken kabule zorlanmıyor. Haptics asenkron ve kuyruksuz; oyun kabulü native feedback yanıtını beklemiyor.
- Fiziksel sürükleme sırasında fitter erteleniyor; iki dokunmalı anchor geometriyi kilitlemiyor. Tamamlama animasyonu mantıksal kaydın yerine geçmiyor. Solo resume guard, günlük yarışta devam eden süre, Arena server phase/round/owner/revision korumaları mevcut. Menü kapanışının otomatik devam davranışı tek başına hata ilan edilmedi.
- Açık kanıt: mevcut birim/harness testleri işletim sisteminin gerçek event sıralamasını, WebKit frame pacing'i, gerçek haptic şiddetini veya bilek/parmak rahatlığını ölçmez. Bu tur fiziksel iPhone veya simülatör kullanılmadı. 0.36.4 için simülatör paylaşım kanıtı da bu alanları kapsamaz.
- Önerilen ölçülebilir kabul: normal girişten tutorial/normal/bilmeceli/gizli/Arena'ya git; iki cihaz sınıfında sağ/sol el ile toplam en az 100 doğru ilk çizim, sekiz yön, son hücre köşesi/kenarı, hızlı yalnız down/up, pivot, KALE/KALEM. Beklenen doğru kabul 100/100; yanlış/çift kabul 0. Çizim sırasında tahta rect değişimi 0 (gerçek döndürme iptal edebilir). Seçim→görsel geri bildirim ve kare süreleri kaydedilip 60 Hz cihazda p95 ≤16.7 ms kare bütçesi hedefi ölçülmeli; bu hedef henüz elde edilmiş sonuç değildir.
- Kesinti matrisi: aktif sürükleme, iki-dokunma anchor, araç menüsü, yardım, kelime uçuşu ve Arena bekleyen onay sırasında Home/kilit/kontrol merkezi. Dönüşte stale commit/çift ödül 0; Solo duraklama durumu anlaşılır; günlük/Arena saati server kuralında kalır. 20 dakikalık fiziksel oturum, düşük güç ve ağ kaybı ayrıca yapılmalı.

## Çalıştırılan dar kontrol ve mevcut güçlü korumalar

Komut:

```sh
node --experimental-strip-types --experimental-transform-types --test tests/input-gesture.test.ts tests/board-interactions.test.ts tests/auth.test.ts tests/progress-owner.test.ts tests/progress-deadline.test.ts tests/native-transport.test.ts
```

Sonuç: **167 test / 32 suite geçti; 0 fail, 0 skip**. Test çıktısı `/private/tmp/kt-reliability-audit-tests.log`. Tam proje/test/build/content/Worker paketi tekrarlanmadı; uygulama kodu değişmedi. Bu sayı dokunmanın kaliteli veya WoW düzeyinde olduğunun ölçüsü değildir.

Özellikle korunanlar:

- `ProgressSync` owner başına ayrı; canlı owner/revision ve geç yanıt koruması, request'in token+HTTP+parse bütününe uygulanan timeout, yerel yazma hatasının cloud success diye gösterilmemesi (`lib/game/progress-sync.ts:14-83`, `components/game/useCloudProgress.ts:7-27`; owner/deadline testleri).
- Native API sabit HTTPS origin ve API yoluna bağlı; caller cookie/origin başlığı geçirilmiyor, response cookie JS'ye açılmıyor; redirect reddi ve iptal sonrası geç yanıt emekliliği var (`lib/platform/native-transport.ts`, ilgili testler).
- Board testleri yeni hücre içi hareketi React render/haptic/preview tekrarı olmadan, native/pointer arbitrajını, son-örnek kabulünü, pivotu, cancellation ve duplicate önlemeyi sınar. Yeni kanıtlanmış bir tahta algoritma hatası bulunmadı; gerçek cihaz kabul sınırı açık kaldı.

Politika/mevzuat değerlendirmesi bu alt incelemede yapılmadı; koordinatör birincil Apple kaynaklarını ayrıca inceliyor. Bu kayıt uygulama veya mağazaya gönderim onayı değildir.
