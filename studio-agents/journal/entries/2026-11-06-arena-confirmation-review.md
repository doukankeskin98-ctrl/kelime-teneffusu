# Arena / Meydan kelime onayı — dar güvenilirlik incelemesi

Kaynak: 0.38.1, 6 Kasım 2026. Kullanıcı iPhone'da çizim sonrası onayın Arena tarafında Solo'dan yavaş olduğunu bildirdi. Son görülen yer Meydan sonucu olduğu için iki çevrimiçi akış birlikte okundu. Bu inceleme salt okunur; cihaz gecikmesi/FPS ölçülmedi, uygulama veya test kodu değiştirilmedi.

## Bulgular

1. **Geri bildirim ağ turuna bağlı.** `components/game/Arena.tsx:77-82,119-122` ve `components/game/Challenges.tsx:47-61`: istemci `match` ile kelimeyi zaten biliyor; sadece bekleyen çizgi hemen gösteriliyor. Kelime sesi/titreşimi, resmi raf ve `WordFeedback` ise HTTP cevabını bekliyor. `components/game/common.tsx:116` dekorasyonu `wordList.strokes` üzerinden çalıştırıyor. Solo `components/game/Solo.tsx:111-128` yerel eşleşmede sesi ve stroke'u hemen işliyor. Kullanıcının farkıyla uyumlu kaynak kanıtı budur; ağ gecikmesinin kaç ms olduğu ölçülmedi.

2. **Yerel dekorasyon ile resmi skor ayrılmalı.** Arena sunucu `lib/game/server.ts:257-261`, Meydan `lib/game/social.ts:60-67` doğrulama ve resmi süre/skor sahibi. Sadece yerel sunum stroku/sesi öne alınabilir; skor, sayım, sıralama, `finished`, ödül ve sonuç geçişi kabul edilmiş snapshot'a bağlı kalmalı. Arena `accept` revision/owner/room korumaları, `newerChallenge` ve eylem kilitleri korunmalı. Bu dar işte paralel claim kuyruğu açmaya gerek yok.

3. **Tekrarlama ve ret yaşam döngüsü ayrı kabul ister.** `lib/game/word-feedback.ts:37-49` ledger ID'leri kalıcı hatırlıyor. Bekleyen stroke'u doğrudan `confirmed` diye vermek, reddedilen aynı kelimenin yeniden denemesinde animasyonu yutabilir; HTTP ile canlı güncellemenin ikisi de ses üretirse çifte onay olur. Bekleyen görsel deneme scope'u (oda/tur veya challenge ID + deneme), temizleme/yeniden deneme ve gerçek ACK tekilleştirme açık kurulmalı. Arena canlı güncellemesi native'de polling, web'de SSE (`useLiveRoom.ts:11-40`); testler iki kaynağın sırasına bağımlı olmamalı.

## Önerilen tek odak ve kabul ölçütleri

Yerel geçerli seçimde normal kelime dekorasyonu ve dokunsal onayı hemen başlat; resmi durum ağdan gelsin. Solo hız/timing değerlerini değiştirme. Bekleme sırasında mevcut resmi skor ve tek claim kilidi kalsın.

- Çözülmemiş/deferred claim yanıtı varken yerel doğru kelime sunumu başlar; resmi skor/sayım/result değişmez.
- Yanlış kelime ve daha önce bulunan kelime yeni başarı sunumu veya ikinci istek üretmez.
- HTTP önce, canlı/poll önce ve eski HTTP cevabı durumlarında tek kelime sunumu; resmi snapshot geri gitmez.
- Ret/zaman aşımı/terminal maçta sunucu tarafından kabul edilmeyen kelime kalıcı işaretlenmez; aynı kelimeyi geçerli yeni deneme tekrar animasyon alabilir. Ret sonrası geçerli recover, gerçekte kabul edilmiş skoru kaybetmez.
- Son kelime sunumu hemen başlayabilir; sonuç ekranı yalnız sunucu bitişiyle açılır ve uçuşu gereksiz ikinci kez başlatmaz.
- Oda/tur/hesap değişimi, çıkış, unmount, background ve reduced-motion eski sunumu taşımamalı veya başarıyı tekrar oynatmamalı.
- Mevcut Arena terminal harness'i (`tests/arena-terminal.test.ts:57-65`) ağ öncesi sessizlik bekliyor: sözleşme bilinçli değiştirilmeli, ret/tekrar/ACK yarışı kapsamı korunmalı. Meydan actual-component regresyonu da aynı davranışı sınamalı.

Sınır: statik kaynak ve mevcut test sözleşmeleri incelendi. Yeni uygulamanın test/cihaz doğrulaması koordinatöre aittir; fiziksel parmak hissi ölçülmüş değildir.

## Uygulama sonrası dar diff incelemesi

Koordinatörün Arena/Challenges `localFeedback`, PlayLayout aktarımı, WordFeedback iptal Map'i ve preview-aware ledger değişiklikleri okundu. Yerel→ACK aynı uçuşu koruyor; çekilen pending ID uçuşunu/varış işaretini temizliyor; tekrar deneme yeniden sunum alırken geç recover ACK ikinci uçuş üretmiyor. Terminalde sunucuda olmayan pending stroke görünümden kalkıyor. Resmi skor/sayım/raf/sonuç ve eylem kilidi korunmuş. İncelenen diff'te engelleyici yeni yarış bulunmadı. Testleri koordinatör çalıştırıyor; burada test başarısı iddia edilmiyor.

Kalan deneyim sınırı: rafın resmi bulunmuş işareti ve sonraki kelimeye giriş hâlâ sunucu yanıtını bekliyor. Değişiklik ilk ses/titreşim/uçuş gecikmesini kaldırır; bütün Arena ağ gecikmesinin kaldırıldığı söylenmemeli. Fiziksel his kabulü açık.
