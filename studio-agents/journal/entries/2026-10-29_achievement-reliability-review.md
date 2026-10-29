# 29 Ekim 2026 · hedef → oyun → kazanım güvenilirlik incelemesi

Atanan kapsam: oyuncunun UI/UX ve başarı hissi isteği için mevcut ilerleme/ödül sözleşmesini incelemek. Başlangıç kaynak `71a02511c7ed8123ffd9a0b06609fd89741e2c67`, 0.12.7. Kök AGENTS, rol kaydı/README, reliability AGENT/RULES/HEARTBEAT/MEMORY/RUNBOOK, knowledge ve güncel harita/sürüm/defter/son doğrulama bağlamı okundu. Uygulama/test/deploy değişikliği yapılmadı; yalnız bu benzersiz günlük yazıldı. Koordinatör tek uygulama ve yayın sahibidir.

Bu inceleme kaynak ve mevcut test okumalarına dayanır. Kullanıcı görüşü gerçek geri bildirimdir; yeni görsel yaklaşımın başarı hissini/oyuncu dönüşünü artıracağı henüz ölçülmüş değildir. Yeni test veya gerçek DOM/cihaz/sağlayıcı kontrolü bu uzman tarafından çalıştırılmadı. Önceki önizleme engeli aşılmış sayılmaz.

## En değerli üç sınır ve uygulanabilir öneri

### 1. Gösterilen hedef, oynatılan bölümün gerçek kazanımı olmalı

- Kaynak: `lib/game/next-discovery.ts:6–20`, `lib/game/discovery.ts:26–43`, `components/game/DiscoveryStart.tsx:10–26`.
- Mevcut öneri yalnız harita değildir: son standart bölüm, aynı temada sonraki standart bölüm, açık harita, en sonda standart/replay olabilir. `recommendedExpedition(progress).nextPiece` değerini ana karta koşulsuz koymak farklı bölümün ödülünü vaat eder. Bu, henüz eklenmemiş UI için önleyici kabul sınırıdır; mevcut kaynakta böyle bir yanlış vaat yoktur.
- Öneri: ana hedefi `recommendation.config.journey` üzerinden gerçek Journey'ye ve onu içeren ExpeditionState'e bağla. O rotanın `chapters + bonus` içindeki indeksi parça adını ve `earned[index]` durumunu verir. Standart öneride parça vaat etme; gerçek tamamlama/yıldız veya kaldığın ilerleme hedefi göster.
- Hedef eşiği aynı kaynaktan gelsin: 3 farklı ana bölüm sonraki dünyayı, 5 ana bölüm bonusu, 6 gerçek parça sahneyi açar. İpucu ve süre açılışa engel değildir. Eski katalogdan başlanmış rota erişimi `started` istisnasıyla açık kalabilir; kilitli olmayan bir dünyayı tekrar açılacakmış gibi anlatma.
- Oyuncu faydası: oynamadan önce neyi kazanacağını ve ne kadar kaldığını anlayabilir. Etki yüksek; salt sunumla maliyet/gerileme riski düşük.
- Kabul: boş kayıt; son standartta yarım ilerleme; tamamlanmış standarttan sonraki öneri; 2→3, 4→5, 5→6 eşikleri; eski ilerlemeden açık sonraki dünya; bütün haritalar tamamken standart/replay. Gösterilen parça ve ana eylemin gerçekten açtığı Journey aynı olmalı. Aktif öneri değişince eski hedef kalmamalı.

### 2. Kutlama, turun gerçek kazanımı ile korunmuş en iyi sonucu ayırmalı

- Kaynak: `components/game/Solo.tsx:27–33,63–71,107–112,121`; `lib/game/discovery.ts:45–70`; mevcut `tests/discovery.test.ts:26–46`.
- Mevcut model doğru temeli sunuyor: `progressAtStart` → `resultProgress`, `discoveryRewards` yalnız false→true geçişleri verir; `keepBestSave` daha iyi yıldız/süreyi korur; `nextJourneyAfter` önce mevcut dünyadaki eksik keşfe sonra açık diğer dünyaya yönlendirir.
- Öneri: sonuçtaki ana görseli gerçekten yeni parça/dünya/bonus/sahneye bağla; birden çok kazanım varsa birini öne çıkarıp diğerlerini dürüstçe listede tut. Yeniden oynamada yeni parça yoksa mevcut koleksiyonu ve varsa gerçek kişisel en iyiyi göster. Koleksiyon/rekor metni, daha kötü tekrarın bu tur kazandığı yıldızlarla aynı veri gibi sunulmasın. Ara sonuçta yeni ödül verme, kutlama animasyonunu herhangi bir claim/write işlemi yapar hale getirme.
- Arka planda başka kaydın birleşmesi bütün `discoveryRewards(before, after)` sonucuna ek dünya/parça getirebilir. Yeni ekranda bunları yalnız o turun kazanımı diye bağlamak yerine mevcut doğrulanmış koleksiyon güncellemeleri olarak ayırmak veya bu turdaki Journey ile ilgili kazanımı özellikle seçmek daha doğru olur. Bu kaynakta veri kaybı kanıtı değildir; yeni sunumun atıf sınırıdır.
- Oyuncu faydası: sonuç somut bir başarı ve sonraki hedef sunar; tekrarda sahte ödül hissi oluşturmaz. Etki yüksek, sunum kapsamı orta; ödül hesaplarına dokunulmazsa risk düşük.
- Kabul: yeni bölüm→bir parça; üçüncü bölüm→parça+gerçek dünya açılışı; beşinci→bonus; bonus→sahne; kötü tekrar→0 yeni parça ve eski best korunur; iyi tekrar→gerçek best; sonuç kapat/aç→yeni ödül veya kayıt çoğalması yok; bütün haritalar bittiğinde geçerli geri dönüş. Yeni ana CTA `nextJourneyAfter` ile tutarlı olmalı, otomatik yeni oyun başlamamalı.

### 3. Ustalık geri bildirimi, kelime grupları ve mevcut yıldız kuralıyla tutarlı olmalı

- Kaynak: `lib/game/word-card.ts:3–13`, `lib/game/progress.ts:43–48`, `components/game/Solo.tsx:89–116,121`, `components/game/common.tsx` WordList.
- `board.targets` / `save.strokes` uzun isimlerde ayrı parçaları sayar. `wordListProgress` ise oyuncunun gördüğü grupları, her parçanın bulunması koşuluyla sayar. Yeni "son kelime", "X/Y kelime" ve bitiş özeti yüzeylerinde bu ayrım önemlidir. Oyun motorunun hedef/parça tamamlama kuralını değiştirmeye gerek yoktur.
- Yıldız kuralı hâlihazırda tamamlamada `3 - Math.min(2, hints)`: 0 ipucu→3, 1→2, 2 veya 3→1 yıldız. Hız yıldızı etkilemez. Açıkça anlatılan bu mevcut ustalık hedefi, yeni sayısal ekonomi olmadan oyuncuya tekrar için anlamlı hedef verir. Başlamadan "kazanıldı" gibi gösterilmemeli; yarım oyunda ancak olası/korunan yıldız düzeyi olarak açıklanmalı.
- İpucu Avı'nda bulunmamış cevap `wordCardCopy` sözleşmesi dışında görsel/erişilebilir etikete sızmamalı. Sunucu onayı bekleyen günlük/Arena çizgisi tamamlama/son-kelime kutlaması için kullanılmamalı. Mevcut doğru veri `save.strokes`, `room.you.strokes` vb. confirmed kaynaktır.
- Oyuncu faydası: ilerleme ve başarı mesajları aynı şeyi anlatır; uzun kelimeler ile tanım modunda yanlış başarı hissi oluşmaz. Etki orta-yüksek; saf türetilen sunumla düşük maliyet.
- Kabul: iki parçalı bir isimde ilk parça bulununca grup tamam sayılmaz; son parça bulunduğunda yalnız bir tamamlanan kelime; duplicate/unknown stroke artış yapmaz; boş hedef/0 payda güvenli; 0/1/2/3 ipucu yıldızları ve hız bağımsızlığı; tanım cevabı bulunmadan görünmez; pending yanıt sonrası ilk gerçek ACK bir kez günceller.

## Korunması gereken temel ve sonraki kontrol

- Yeni görsel ilerleme yalnız mevcut doğrulanmış save/discovery APIsinden türetilmeli. Yeni göç, kalıcı alan, XP cüzdanı, seed/kelime/kimlik değişikliği gerekmez.
- Sabit 5+1 harita kümeleri, eski başlamış dünya erişimi, en iyi save seçimi, paylaşılmış günlük zaman kuralı ve arşiv kaynak kimlikleri korunmalı.
- Bugünün Bayram sabahı / Bilim sergisi çifti zaten kaynakta ve yayımlıdır; ikinci çift yok.
- Son diff incelemesinde özellikle ana öneri ile gerçek oynatılan config eşleşmesi, tekrar/ilk tamamlama ayrımı ve yeni CTA yolları okunmalı; ilgili gerçek-source/VM testlerine ek olarak tam kalite kapıları koordinatörce yürütülmeli. Saf/VM kabul, gerçek native odak/kaydırma/telefonda sığma veya oyuncu memnuniyeti ölçümü değildir.

## Son diff incelemesi · ilk teslim

Koordinatörün `achievement-view.ts`, `AchievementLoop.tsx`, DiscoveryStart, Solo, Pages ve common sunum değişiklikleri salt okunur incelendi. Ödül/save/clock/seed hesapları aynı; goal gerçek journey kimliğine bağlı, standartta null; 3/5/6 eşiği ve eski açık dünya istisnası mevcut state'ten türetiliyor. Inline hedefler confirmed WordList verisini kullanıyor, clue cevabı aynı yardımcıdan geçiyor; yeni HUD ve sonuç kelime gruplarını sayıyor. Sonraki bölüm mevcut `nextJourneyAfter` hesabını izliyor. VictorySummary current parçayı theme/title ile gerçek reward listesinde buluyor; diğer açılışlar aynı doğrulanmış before/after delta'sından geliyor. Uzman root'un yürüttüğü tam testleri yeniden çalıştırmadı.

**Düzeltme gereken somut yeni bulgu:** `Solo` içindeki `previousBest` klasik modda `progress.saves['hababam.<level>']` değerinden geliyor; klasik tur ise `legacyState` içinde saklanıyor. Eski `improved` hesabı classic'i dışladığı için bu ref daha önce classic başarı mesajı üretmiyordu. Yeni VictorySummary best prop'u classic'i dışlamazsa aynı numaralı farklı standart bölümün yıldız/süresi klasik sonuca "En iyi sonucun korunuyor" olarak sızar. Sınırlı çözüm best prop'unda classic'i dışlamak; bu sürümde yeni klasik rekor modeli kurmak gerekmez. Koordinatöre iletildi. Kabul: standart hababam.0 için tamamlanmış best varken klasik ilk bölüm sonucu standart best metnini göstermemeli. Tutorial/daily zaten bileşende bastırılıyor; external best bilinmiyorsa gönderilmemesi korunmuş.

Bu ilk diff'te başka somut kayıt/ödül blocker'ı bulunmadı. Klasik best düzeltmesi ve ilgili dar kabul sonucu görülmeden bu bulgu kapalı sayılmaz. Önerilen diğer dar kabuller: recommendation standart→goal null; 2→3 dünya / 4→5 bonus / 5→6 sahne; legacy unlocked sonraki dünyaya yanlış yeniden-açılma vaadi yok; tekrar sonucu yeni piece yok ve best korunur; aynı hedefin çok parçası grupta bir kez tamamlanır. Gerçek telefon/native akış ve görsel sığma doğrulaması bu source incelemesinin kapsamı dışındadır.

## Klasik best bulgusunun kapanış incelemesi

Koordinatörün düzeltmesi yeniden kaynakta görüldü: `Solo.tsx` VictorySummary `best` prop'u artık `!config.classic && (!external || external.personalBestKnown === true)` koşuluyla geçiliyor. Böylece standart Hababam kaydı klasik sonuç metnine taşınmıyor; gerçek standart/rota ve bilinen external best davranışı korunuyor.

`tests/word-access.test.ts` son suite içindeki yeni kabul, gerçek Solo gövdesini klasik modda çalıştırıp bütün klasik kelimeleri tamamlıyor; standart `hababam.0` için önceden 3 yıldız/1 saniye kayıt varken sonuçta `best === undefined`, `improved === false`, `goal === null` ve standart kayıt değişmezliği aranıyor. Aynı suite gerçek rota üçüncü bölümünün tek parça/dünya açılışını ve sonraki hedef/replay callback eşleşmesini de kapsıyor. `tests/achievement-loop.test.ts` gerçek stateless SSR ile 3/5/6, eski açık dünya, standart devam hedefi, replay/best ve ipucu kurallarını doğrulayacak kabulleri içeriyor. SSR dekoratif WorldArt'ı değiştiriyor; gerçek native dialog/focus/scroll/device ölçümü değildir.

**Kaynak düzeltmesi ve regresyon testinin kapsamı onaylandı; incelenen diff'te açık güvenilirlik blocker'ı kalmadı.** Bu uzman testleri tekrar çalıştırmadı. Çalıştırma başarısı ve final kalite kapıları koordinatörün gerçek araç sonuçlarıyla raporlanır. İlk SSR beklentisindeki `00:45` → mevcut `timeLabel` çıktısı `0:45` düzeltmesi uygulama arızası olarak sayılmaz.
