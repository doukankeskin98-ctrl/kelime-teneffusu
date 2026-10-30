# 30 Ekim 2026 · Oyun sesleri · Deneyim incelemesi

Rol: oyuncu deneyimi. Başlangıç kaynak `ad12f7814845fd978f91fdcad58aaa3ac4f4b9e6`, paket `0.13.1`. Kök AGENTS, stüdyo README/kayıt/son öncelikler, experience AGENT/RULES/HEARTBEAT/MEMORY/RUNBOOK, BRAND/STRATEGY, son geliştirme ve ilgili sonuç/inceleme kayıtları okundu. Kapsam: mevcut oyun akışları ve ses tetikleyicileri, en fazla üç öneri. Uygulama kodu, ortak hafıza, test veya yayın değiştirilmedi; yalnız bu günlük yazıldı.

## 1. Anlamlı aşamaları aynı sakin ses ailesiyle ayır

**Kanıt.** `components/game/common.tsx:14–24` iki seçenekli sinüs dizisi sunuyor: normal kelimede iki nota, tamamlamada dört nota; bütün olaylar aynı `.045` tepe kazancını kullanıyor. Solo `:96`, Mystery `:27,32`, Sprint `:17`, Arena `:39`, Challenges `:25` bu iki seçeneği kullanıyor. Mystery bağlantı çözümü normal kelimeyle aynı, ipuçları sessiz; Sprint başlangıcı ve süre bitişi için ayrı işitsel anlam yok. Board `:24–40` seçim/tap/klavye akışında ses yok. Bu kaynak bulgusudur; mevcut melodinin rahatsız edici olduğu dinleyerek doğrulanmadı.

**Etki / maliyet / risk.** Etki yüksek (kullanıcının doğrudan isteği), maliyet orta (tek küçük sentezleyici + mevcut olaylara bağlama), risk orta (fazla tekrar ve yanlış tetikleme). Marka sakin, sıcak ve küçük mola duygusunda; uzun müzik veya sert rekabet alarmı gerekmiyor. Ürün etkisi varsayımdır.

**En küçük kullanılabilir öneri.** Mevcut Web Audio yolunda kısa, yumuşak giriş/çıkış zarfı olan, ortak uyumlu notaları paylaşan az sayıda motif. Seçim en hafif, kelime belirgin, tamamlanma daha zengin olmalı; başarı önemini yalnız daha yüksek sesle anlatma. Aşağıdaki süreler dinleme öncesi tasarım hedefidir, ölçülmüş konfor standardı değildir.

| Olay | Ses ve tetikleme | Kaynak / sınır |
| --- | --- | --- |
| Gerçek tur başlangıcı | Yaklaşık 250–400 ms hafif açılış motifi, bir kez | Solo/Mystery yeni oynanabilir oturum; Sprint/Arena gerçek aktif geçişi. İlk sayfa yükleme, kayıt geri yükleme veya inceleme açılışı başlangıç değildir. |
| Seçime başlama | 50–90 ms çok hafif tek dokunuş | Board ilk hücreyi seçme; pointer ve Enter/Space eşdeğer. Her harfte, sürükleme hareketinde veya odak gezinmesinde tekrarlanmaz. |
| Yeni doğrulanmış kelime | Yaklaşık 180–280 ms iki notalı sıcak işaret | Yerel kabul veya sunucu onayı; aynı kelime tekrarında yok. Son kelimede bunun yerine tamamlama motifi. |
| İpucunun gerçekten gösterilmesi | Yaklaşık 180–300 ms kısa, merak hissi veren motif | Solo `:101–104`, Mystery `:31`; günlükte yalnız `confirmed` içindeki gerçek `hintCell` (`Solo:78–80`). Düğmeye basıldığı anda değil. |
| Gizli bağlantının doğru çözülmesi | Yaklaşık 300–450 ms küçük açılış/keşif motifi | Mystery `:32`; yanlış cevapta sert buzzer yok, mevcut açıklama sürer. |
| Sprint tahtasının bitmesi | Kısa tahta tamamlama motifi; sonraki tahtada ek kutlama yok | Sprint `:17`, `lib/game/sprint.ts:27`; tek son kelime bir kez ses üretir. |
| Bölüm veya yarışmanın gerçek bitişi | Yaklaşık 450–700 ms nazik kapanış; diğer aynı-an seslerinden öncelikli | Solo/Mystery son doğru kelime; Sprint süre bitişi; Arena onaylı terminal geçişi; Challenge onaylı tamamlanma. Kaybedilende cezalandırıcı düşüş/buzzer yok. |
| Duraklat / devam et | İstenirse aynı hafif kontrol ailesinden bir işaret | Yalnız kullanıcının açık eylemi; sekme gizlenmesiyle otomatik pause sessiz. Harita, sekme, yardım ve her düğmeye ayrı jingle eklenmez. |

**Kabul.** Bir tam Solo + Mystery + Sprint + Arena/Challenge senaryosunda olayların anlamı aynı kalır. Harf başına, saniye başına, hover/scroll veya rakip her kelime bulduğunda ses yok. Yanlış/tekrar seçim sessiz metinle açıklanabilir; rahatsızlık azaltmak için zorunlu hata tonu gerekmez. Hızlı tekrarlar kısa bir ortak aralık/öncelik kuralıyla birikmez; aynı son kelime word+complete+result olarak üç kez çalmaz. Yeni paket, ses servisi, ağdan indirilen dosya veya ücretli üretim gerekmez.

## 2. Başarı yalnız doğrulanmış olayı anlatmalı

**Kanıt.** `Arena.tsx:39–40` ve `Challenges.tsx:25–27` sunucu cevabı gelmeden `chime(...)` çağırıyor. Dolayısıyla reddedilen/başarısız son seçim bile tamamlanma sesi verebilir. Buna karşılık günlük Solo `:78–80` sesi `DailyActionSession.confirmed` üzerinden üretiyor; normal Solo `:92–98` ve Mystery `:23–27` yeni kelime korumalarından sonra kabul ediyor. Sprint `:17` artan `words` sayısını izliyor. Bu farklılık özellikle daha zengin bir tamamlama melodisinde görünür hale gelir.

**Etki / maliyet / risk.** Etki yüksek (yanlış kazanım hissi), maliyet düşük–orta, risk orta (async tekrarlar). Ağ protokolü/puan/kayıt değişikliği gerektirmez.

**Öneri.** Arena ve Challenge için başarıyı kabul edilen sunucu görünümündeki yeni kendi kelimesine bağla. Aynı oda/tur/kelime için SSE ve claim ACK birlikte gelince bir kez; daha eski revizyon, reddedilmiş istek, geç eski oturum cevabı, yeniden bağlantı, sayfa geri yükleme ve sonuç penceresini tekrar açma kutlama üretmesin. Arena bitişi kendi son kelimesinden bağımsız gerçekleşebilir; gerçek aktif→finished geçişi ayrı tek kapanış olayıdır. Bitiş mevcut kelime sesiyle çakışırsa kapanışın önceliği olsun.

**Kabul.** Kontrollü gerçek caller testlerinde başarılı claim=bir ses; HTTP hata/ret=başarı sesi sıfır; ACK+aynı SSE=bir; yeni tur aynı kelime kimliği=yeniden bir; restore/review/remount finished=sıfır. Günlük pending/retry/owner değişimi/retired callback kabulleri korunmalı. Ses eklenmesi timer, puan, ödül veya progression yazısı üretmemeli.

## 3. Ses tercihi anında geçerli; sessiz kullanım eksiksiz kalmalı

**Kanıt.** `lib/game/progress.ts:11,40` ses ve haptics ayrı ve varsayılan kapalı. `Pages.tsx:65` açıklaması yalnız kelime melodisini anlatıyor. `common.tsx:16` unlock yalnız `pointerdown`; `:21–22` planlanan sesleri saklamıyor ve `enabled=false` mevcut çalan notaları kesmiyor. Bu yüzden genişleyen ses ailesinde klavye başlangıcı, anında susturma ve arka plan davranışı açık kabul ister. Haptics `:19` ses kapalıyken bağımsız çalışıyor; bu mevcut tercih korunmalı.

**Etki / maliyet / risk.** Etki yüksek (kullanıcı denetimi), maliyet düşük–orta, risk düşük. En ekonomik çözüm mevcut tek aç/kapa tercihidir; yeni ayar ekranı veya kayıt göçü gerekli değil.

**Öneri ve kabul.** Varsayılan/önceden kaydedilmiş kapalı tercihi koru. İlk başlatma yalnız gerçek kullanıcı jestiyle, pointer yanında klavye için de çalışsın. Sesi kapatınca aktif sesler kısa yumuşak sönüşle dursun; yeniden açmak önceki olayları tekrar çalmasın. Gizli sekme, blur, unmount ve eski oturumda kalan planlanmış sesler çalmasın; kullanıcı dönüşünde olay birikimi oynatılmasın. AudioContext/resume hatası oyunu bozmasın. Butonun erişilebilir adı/durumu güncel olsun; profil açıklaması örneğin “Seçimlerde, keşiflerde ve tur sonunda hafif sesler.” olarak gerçek kapsamı anlatsın. Ses kapalıyken bütün metin/simge/sonuç akışları anlaşılır kalmalı; haptics kullanıcının ayrı tercihi olarak sürmeli.

## Sınırlı dış dayanak

Yalnız şu iki birincil platform kaynağı kullanıldı; müzik, sample veya rakip ses paketi alınmadı:

- [Apple Human Interface Guidelines — Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback): geri bildirimin öneme uygun yoğunluğu, tutarlı anlamı ve birden çok erişilebilir kanalla verilmesi. Kaynak arama sonucu tam ilgili ilkeleri sundu (`turn31search0`); doğrudan sayfa JS kabuğuydu, resmi Markdown bağlantısı araç tarafından content-type nedeniyle okunamadı. Bu ürün için küçük/orta/büyük motif önerisi bu ilkelerden yapılan tasarım çıkarımıdır.
- [MDN — Web Audio API best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), Autoplay policy ve User control bölümleri: AudioContext oluşturma/devamının kullanıcı jestiyle başlaması; açık, erişilebilir ses kontrolü (`turn32view1`, satır 198–234). Web Audio'nun mevcut sentez yolunu kullanma tercihi kaynak ve maliyet bağlamına dayalıdır.

Gerçek cihaz, tarayıcı ses çıkışı, kulaklık/hoparlör, ses yüksekliği, uzun oturum dinlemesi, iOS sessiz anahtarı, ekran okuyucu veya oyuncu konforu bu incelemede test edilmedi. Kaynak incelemesi güzel/rahatsız etmeyen ses garantisi değildir. Koordinatör olay/yaşam döngüsü testleriyle davranışı doğrulayıp destekli cihaz dinlemesini açık sınır olarak tutmalıdır. Yeni uzman, zamanlayıcı, hizmet veya yayın açılmadı.
