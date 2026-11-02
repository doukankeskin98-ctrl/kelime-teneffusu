# 2 Kasım 2026 · Profesyonel oyun akışı / çeşitlilik incelemesi

Salt okunur uygulama incelemesi; başlangıç Sites kaynağı `41e57965da229c832f510e6de5ac43d54c2acedc`, sürüm 0.23.3. Koordinatörün görevi: oturumlar arası yeni içerik ve eski ilerleme uyumluluğu. Uygulama/test kodu ve canlı veri değiştirilmedi.

## 1. Somut açık: Hızlı Tur yalnız 24 kelimeyi geçmişsiz karıştırıyor

- Kaynak: `lib/game/sprint.ts:3-10`, `components/game/Sprint.tsx:8-19`.
- Tetikleyici: Hızlı Turdan çıkıp yeniden açmak veya sonuçtan yeni tur açmak. Yeni seed/grid üretiliyor; daha önce görülen kelimeleri veya tam hedef kümelerini tutan kayıt yok. Kalıcı tek kayıt `kt-sprint-best-v1:<owner>` rekoru.
- Tekrar üretim: mevcut `sprintBoard(seed,0)` üzerinde seed 1–20 ile 20 ilk tahta; 80 gösterilen hedeften yalnız 21 farklı kelime, 59 önceden görülmüş hedef. Bu kontrollü örnektir, gerçek oyuncu oturumu ölçümü değildir. Kaynak zaten en fazla24 tekil hedef sınırını kanıtlıyor.
- Etki: Arena çeşitliliği düzelmiş olsa da aynı uygulamadaki Hızlı Turda belirgin tanıdık içerik devam eder. Rastgele seed kalıcı özgünlük anlamına gelmez.
- En küçük çözüm: mevcut yazılmış kelime havuzundan altı harfe kadar seçilmiş geniş bir Hızlı Tur sözlüğü; owner'a bağlı, sürümlü ve doğrulanan ayrı cihaz geçmişi; önce görülmemiş kelimeler, tükenince yakın geçmişten uzak ve az/eski kullanılmış hedefler. Tam dört kelimelik setleri ayrıca engelle. Mevcut6×6/dört hedef,60 saniye/puan/çarpan ve eski rekor anahtarı korunmalı. ARENA_LIBRARY içinde uzunluğu<=6 olan718 kelime var; yeniden yüzlerce tanım yazmak gerekmiyor. İstemciye tüm Arena tanımlarını taşımadan kelime listesini ayırmak değerlendirilebilir.
- Geçmiş, sonuçta değil tahta gerçekten gösterildiğinde yazılmalı; erken ayrılma aynı hedeflere geri düşmemeli. Girişte geçmiş yüklenmeden yeni tahtayı başlatmamak; aynı açık turun yeni tahtalarında da geçmişi ilerletmek gerekir.
- Kabul: ownerA ile40 aç/başlat/ayrıl/yeniden oluştur akışında160 hedef benzersiz; bir tur içinde yeni tahtalar da aynı geçmişe eklenir; bozulan JSON güvenli okunur; ownerB farklı kaydı kullanır; saklama hatası dürüstçe görünür; eski rekor ve ana Progress.v2 birebir korunur. Tükenme testinde yeni tam set/grid, düşük sıklık ve yakın geçmişten kaçınma doğrulanır. İki açık sekmede eski snapshot'ın yeni geçmişi sessizce ezmesi önlenmeli veya açık bir sınırlama olarak belirtilmeli.

## 2. Mevcut koruma doğru; Arena'yı tekrar yazmak gerekmiyor

- Kaynak: `lib/game/server.ts:110-137`, `lib/game/arena-fresh.ts:12-42`, `tests/arena-variety.test.ts:48-96`.
- Arena bütün aktif oyuncuların kalıcı arena_seen makbuzlarını birleştiriyor; bırakılmış ama görülmüş tur da kayda dahil. Normal, bilmeceli ve dereceli modlar ortak hedef geçmişini kullanıyor. Son12 maç kişi başına değerlendirilir; görülmemiş kelimeler öncelenir. Tam hedef kümesi ve grid tekrar kontrolü ayrıca durur.
- Çalıştırıldı: `node --experimental-strip-types --experimental-transform-types --test tests/sprint.test.ts tests/arena-variety.test.ts`;14 test/3 grup geçti.54 oda/mod değişimi ve yeni GameService örnekleri içeren mevcut kabul372 hedefin tamamını farklı buldu; eski makbuz, diğer oyuncu geçmişi ve tükenme-aday değişimi de geçti.
- Uygulama önerisi: bunu regresyon kapısı olarak koru. Görsel veya Hızlı Tur düzenlemesi için Arena seed, snapshot, skor, kimlik veya makbuz şemasını değiştirme. Normal tekrar oynama/yarım bölüme devam gibi kullanıcı niyetlerini yanlışlıkla yeni içerik üretimine dönüştürme.

## 3. Kimlik sınırı: odadan ayrılmak ile hesaptan çıkmak farklı

- Kaynak: `lib/auth/guest.ts:5-21`, `app/api/session/route.ts:7-15`, `components/game/App.tsx:58,70,117`.
- Tarayıcıyı kapatıp aynı geçerli misafir cookie'siyle dönmek aynı kimliği korur. Açık hesap çıkışı misafir oturumunu iptal eder; yeni misafir oturumu yeni UUID'dir. E-posta hesabına geçişte solo Progress birleştiriliyor; Arena geçmişi oyuncu kimliğine bağlı kalır.
- Bu kaynak incelemesinde aynı kimlikle odadan ayrılmanın Arena geçmişini sıfırladığı bir kusur bulunmadı. Farklı hesap/yeni misafir için tekrar etmeme sözü verilmemeli. Kullanıcının gerçek belirtisinin kimlik değişimi olduğu kanıtlanmış değildir.
- Bu tur önerisi: güvenlik sınırını gevşeterek hesap geçmişlerini birleştirmeyin; doğru kullanıcı metni ve aynı-kimlik kabulü yeterli. Kalıcı hesap yükseltme geçmiş taşıması ayrıca sunucu doğrulamalı yetkilendirme ve izolasyon testleri gerektirir.

## Doğrulama sınırı

Kontroller yalıtılmış SQLite/saf oyun mantığı üzerindedir. Gerçek tarayıcı, fiziksel telefon, üretim oturum cookie'si, iki gerçek hesap, uzun dönem kütüphane tükenmesi ve canlı yük denenmedi. Profesyonellik/retansiyon artışı ölçülmüş değildir. Son uygulama diff'i verilirse değişen kabullere göre yeniden dar inceleme yapılabilir.

## Uygulama sonrası dar inceleme · ilk sonuç

Yeni `sprint-history.ts`, `sprint-vocabulary.ts`, reducer ve Sprint bileşeni okundu. `tests/sprint.test.ts tests/sprint-history.test.ts` çalıştırıldı:11 test/2 grup geçti;100 yarım/yeniden açılan oturum400 farklı hedefi,220 tahta tüm sözlüğün görülmesini ve en çok iki kullanımı doğruluyor. Ana kayıt/rekor anahtarı değiştirilmemiş; start diski yeniden okuyor ve ilk tahtayı eşzamanlı kaydediyor; App oyuncu kimliğiyle Sprint'i yeniden bağlıyor. Saklama hatası görünür ve puan/saati değiştirmiyor.

**Yayın öncesi açık:** `components/game/Sprint.tsx` yeni history effect'i `state.history` değerini son cihaz kaydını birleştirmeden yazıyor. Aynı oyuncunun iki sekmesinde A başlar(seq1), B A'yı okuyup başlar(seq2), A ilk tahtasını bitirip kendi eski seq1'inden devam eder ve diski seq2 ile ezer. Kontrollü reducer+aynı depolama akışı probe'unda B'nin SİDNEY/SMAÇ/ÇORBA/ARMUT dört hedefi de silindi;3 görülen tahta2 sayıldı. Bu, sonraki girişte görülmüş hedefi yeniden görülmemiş saydırır.

Öneri: son cihaz geçmişiyle kayıpsız ve yinelenebilir birleşim; kayıt öncesi birleşim yanında geçişte yeni hedef seçimi öncesi de son geçmiş alınmalı. Tam snapshot kullanımları körce toplanmamalı; aynı snapshot yeniden yazılınca sayılar artmamalı. İki bağımsız tur/aynıowner/stale yazar kabulü eklenmeli. localStorage gerçek eşzamanlı atomik işlem değildir; eşzamanlı sekme garantisi ayrıca iddia edilmemeli. Bu somut sıralı stale-yazar kaybı giderilmeden yeni geçmiş işine tam kabul verilmedi.

## Son dar doğrulama · stale sekme bulgusu kapandı

Koordinatörün `mergeSprintHistory` birleşimi, başlangıç/geçiş öncesi son kayıt okuması ve eşzamanlı kayıt değişiklikleri yalnız bildirilen kusur kapsamında yeniden okundu. Sözcük ve set birleşimi artık eski sekmenin diğer sekmedeki görülmüş hedefleri silmesini önlüyor; uses/last/sequence alanlarında maksimum alındığından aynı snapshot'ın yeniden yazılması kullanım sayısını çoğaltmıyor. Geçiş seçimi de birleştirilmiş geçmişle yapılıyor.

`tests/word-access.test.ts` içindeki gerçek Sprint bileşenini ortak Map depolamasıyla çalıştıran iki hedefli kabul yeniden çalıştırıldı:2/2 geçti. A başla→B başla→A sonraki tahta akışında12 farklı hedef ve sequence3 korunuyor. Ayrılma/yeniden mount testi eski987 rekorunu değiştirmeden12 farklı hedefi koruyor. Bu düzeltme için kalan yayın engeli bulunmadı. Gerçek eşzamanlı localStorage yarışı, fiziksel iki tarayıcı/cihaz veya bulut geçmişi garantisi verilmedi; diğer doğrulama sınırları sürer.

## 6×6 yerleşim sınırı · son minimal inceleme

İçerik kapısının bulduğu BARAJ/BASKET/BAŞLIK/BATERİ son dört görülmemiş hedef vakası için yalnız Sprint üretimine `diagonalPolicy='any'` verilmesi okundu. `makeCustomPuzzle` ve iç üreticinin varsayılanı `both`; eski çağrıların dalı, yön sırası, rastgele sayı akışı ve çıktı biçimi aynı. Sprint sekiz yönden yerleştirebilir; iki karşıt çaprazı her tahtada zorunlu kılmaz. `variedSprintBoard` hâlâ6×6 ve dört hedef koşulunu denetler, görülmemiş kelimeleri atlamaz.

`tests/sprint-history.test.ts tests/engine.test.ts tests/atlas-continuation.test.ts` çalıştırıldı:22 test/5 grup geçti. Yeni somut son-dört-vaka,100 yeniden açılış,220 tahta kapsamı, eski atlasın birebir tahta snapshotları,4800 normal tahta ve1200 klasik tahta kabulü başarılı. Bu minimal değişiklik için kalan engel bulunmadı. Yeni içerik kapısı sözlüğü ardışık dörtlü örnekler ve beş seed ile kapsar;714 kelimenin bütün olası dörtlü kombinasyonlarını taradığı iddia edilmemeli.
