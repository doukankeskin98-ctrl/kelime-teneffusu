# Kayıt uyumluluğu incelemesi · 13 Kasım 2026

Kapsam: 0.50.1 kaynak üzerinde, onaylanan `docs/content-revision-plan-0501.md` için salt okunur çağıran/tehdit incelemesi. Uygulama kodu, gerçek oyuncu kayıtları ve yayın değişmedi. Fiziksel telefon kullanıcı isteğiyle ertelendi. Bu belge uygulamanın kabulü değildir; sonraki yama incelemesine giriş koşuludur.

## En önemli üç risk

1. **Eski okuyucuya yeni biçim gönderilmesi boş kayıt gibi görünür.** `progress.ts:33–54` yalnız v2 okur; `CloudProgress.stored` da v2 ister. API GET/PUT'ta biçim yeteneği pazarlığı yok. `ProgressSync:62,78` gelen nesneyi yeniden JSON yaparak tekrar okur. Yeni sunucunun eski istemciye v3 dönmesi veya kompakt kaydı açtıktan sonra geniş JSON'ı eski 256 KB okuyucuya sokması kayıp görünümüne yol açar. Yeni codec wire boyutunu bir kez denetlemeli; açılmış nesneye giriş/sayı sınırları olan ayrı doğrulama uygulanmalı. Bozuk/gelecek sürüm veri boş ilerleme olmamalı.
2. **Aynı bölüm kimliği farklı tahta demek olursa çizimler karışır.** `progressBoard:22–31` önbelleği yalnız anahtarla, `mergeProgress:64–76` çizimleri hedef ID ile birleştirir. Board lookup/cache anahtarı içerik revizyonunu içermeli. Eksik revizyon kesin olarak rev1 olmalı; 'güncel' anlamına gelmemeli. Farklı revizyonların koordinatları/ID'leri asla birleşmemeli; eski çevrimdışı yazı yeni revizyonu veya kazanımları silememeli. İki sürümde çevrimdışı başlanmış çakışan kayıt varsa birini sessizce atmak yerine saklanan varyant veya açık, kayıt koruyan çatışma sonucu gerekir.
3. **Geçişin bütün depolama yolları birlikte değişmeli.** `App.tsx:94,98,103` ile `ProgressSync:42–56` ayrı yerel okuyup yazıyor. Yalnız eşitleme yolunu değiştirmek anonim oyuncu kaydını eski biçimde bırakır. `erasure-client.ts:7–12` ve sunucu `erasure.ts:28` yalnız mevcut ana kayıtları siliyor; eklenen geçici/gölge/yedekler sahip kapsamıyla silmeye dahil edilmeli. Aksi halde 'hesabı sil' yeni yedeği bırakır.

## Kesin çağıran haritası

- `components/game/App.tsx:92`: misafirden hesap yükseltme `kt-upgrade-progress` oturum yedeği.
- `App.tsx:94`: ilk açılış son kullanıcı veya anonim anahtar; `98`: çevrimdışı/anonim yazma; `103`: hesap değişimi ve yükseltme birleşimi; `163`: çıkıştaki sahip seçimi.
- `components/game/useCloudProgress.ts:11–14`: sahip sabitli GET/PUT, yanıt `progress` alanı; `expectedOwnerId` korunmalı.
- `lib/game/progress-sync.ts:42–56`: yerel yazma/başlangıç birleştirme; `62,78`: uzaktan gelen veri doğrulama; `75–80`: gönderim ve ACK karşılaştırması. ACK kıyaslaması wire sırası/biçimi yerine aynı doğrulanmış anlamsal veriyi kullanmalı.
- `app/api/progress/route.ts:10–14`: kimlik, sahip, same-origin, rate limit, UTF-8 istek bütçesi; bu korumalar değişmemeli. Format yeteneği GET ve PUT'ta açıkça belirtilmeli.
- `lib/game/cloud.ts:8–25`: kalıcı okuma/merge/6 denemeli CAS. Geçiş yedeği mevcut satırın aynı revision değerine bağlı olmalı; CAS kaybında eski snapshot yazılmamalı.
- `lib/auth/erasure-client.ts:7–12`, `lib/auth/erasure.ts:24–35`: yeni yerel ve sunucu geçiş kayıtlarının sahip kapsamında temizliği.
- `lib/game/progress.ts:79–88`: tamamlanmış kayıtlar istatistiği. Yeni içerik revizyonu aynı mantıksal bölümün yıldız/ödül sayısını ikiye katlamamalı.

## Minimum uygulanabilir geçiş

1. Oyun içi `Progress` nesnesini codec'ten ayır. Saf encoder/strict decoder; v2 ve v3 wire okur. V3 çizimleri `[id,r0,c0,r1,c1]`; bütün ayarlar, zaman, ipuçları, yıldızlar, günler, bonuslar, haftalık hatıralar ve alternatif doğru çizgiler korunur. Değişmemiş v2'ye default revision alanı zorunlu eklemek yerine yokluğu rev1 olarak tanımlamak karşılaştırmaları sade tutar.
2. Önce çift okuyucu uyumluluk çıktısı hazırla. V2 kayıt ham olarak korunur; v3 gölge üretilir ve decode sonucunun doğrulanmış v2 ile tüm alanlarda eşliği kanıtlanır. Eşlik bozulursa writer açılmaz, mevcut ham kayıt değişmez.
3. Yerelde v3 için ayrı sahip/anonim anahtar kullan. Geçici yaz → geri oku/doğrula → son anahtar yaz → geri oku/doğrula; hata halinde önceki kayıt kullanılabilir kalır. Eski v2 anahtarını v3 ile ezme. Sonraki açılışta eski çevrimdışı v2 değişiklikleri de revizyon güvenliğiyle ele alınmalı. Ham v2 yedeği yalnız ilk geçişte kaydedilip sonraki denemelerde ezilmemeli.
4. Sunucuda kontrol edilen hesap geçişi: eski v2 satırı ve dönüşüm gölgesi sahibine bağlı saklanır; mevcut revision ile atomik CAS/batch. Eski protokole desteklenmeyen içerik revizyonu veya eski bütçeye sığmayan açılmış yanıt gönderilmez. Uyumsuz istemciye açık güncelleme-gerekli cevabı; başarısız cevapta hiçbir kayıt/revision değişikliği yok.
5. Önce yeni sunucu okuyucusu ve geri dönüş paketi, sonra yeni istemci writer'ı. Geri dönüş paketi v3 + rev1/rev2 okuma yeteneğini ve tüm katalog kimliklerini korur; ham 0.50.1 sunucusunu dağıtmak writer açıldıktan sonra güvenli değildir.

## Odaklı kabul testleri

- Kısmi/tam rev1 ve rev2, ters/alternatif doğru yollar, en yüksek süre/ipucu, bütün kalıcı ayarlar/ödüller: v2 veya runtime → v3 → eşit veri.
- Sıkıştırılmış UTF-8 bütçe, genişletilmiş nesnenin eski JSON bütçesinden büyük olması, aşırı tuple/entry sayısı, bozuk tuple, gelecekteki v4/rev99: hata ve değiştirmeme.
- Eski GET/PUT istemcisi + v3 saklı veri; rev2 mevcutken eski yazı: yeni veri, yıldız ve ödüller korunur; empty success dönmez.
- Eski ve yeni iki çevrimdışı istemcinin aynı bölümde farklı revizyonları: çizgiler birleşmez ve hiçbir varyant sessizce kaybolmaz.
- V2 gölge dönüşüm eşliği başarısızlığı, yerel geçici/son anahtar kota hatası, geri okuma bozulması, yarıda kapanma: eski ham kayıt açılır.
- Birinci CAS çakışır, yeniden denemede başka cihazın yeni ilerlemesi bulunur: eski snapshot yazılmaz; yedek doğru revision'a bağlıdır.
- Hesap A→B geçişinde geç cevap ve pending yazma; anonim→misafir→kalıcı hesap: sahip sızıntısı yok.
- Kullanıcının hesap silmesi: sahibi için tüm yeni v3/pending/shadow/backup kayıtları gider; diğer sahip aynen kalır.
- Aynı mantıksal bölüm iki revizyonda tamamlanır: albüm, haftalık katkı ve toplam yıldız ikinci kez çoğalmaz.
- Geri dönüş yapısı bütün v2/v3/rev1/rev2 kayıtlarını okuyup yarım oyunun aynı tahtasını açar.

Kaynak incelemesi ve mevcut testlerin okunması yapılmıştır; bu ajan tarafından geniş test seti veya fiziksel cihaz testi çalıştırılmadı.

## İlk yama incelemesi · 14 Kasım 2026

İncelenen yama: ayrı codec, strict reader, sahipli yerel anahtarlar, v2 yetkili/gölge kayıt, format pazarlığı, transactional CAS/gölge tablo, silme kapsamı ve `tests/progress-compatibility.test.ts`. Uygulama dosyaları değiştirilmedi. İki küçük, salt bellek deposu kullanan Node tekrar üretimi çalıştırıldı; gerçek kullanıcı verisi okunmadı.

- **P1 — Reader-first rollback wire uyumu:** `COMPACT_PROGRESS_WRITES=false`, ancak `useCloudProgress.ts` PUT gövdesinde her zaman v3 encoder kullanıyor. 0.50.1 sunucusuna geri dönüldüğünde eski `loadProgress` v3'ü boş ilerleme sayar; yeni keşifler eşitlenmez ve sunucu boş tercihleri birleştirebilir. Reader-first aşamada taşıma yazısı da v2 kalmalı veya gerçek sunucu yeteneği doğrulanmadan v3 gönderilmemeli. Kabul: eski sunucu okuyucusu, yeni istemcinin ürettiği PUT gövdesinden tüm yeni çizimleri ve tercihleri aynen alır.
- **P1 — Strict v3 kayıplı okuma:** Geçerli bir kompakt kaydın ilk tuple hedef ID'si `unknown-target` yapıldığında `readProgress` hata vermeden o çizimi atarak `strokes:[]` döndürüyor. `normalizeProgress(strict)` kaydın hedef/koordinat/içerik doğrulamasının veri değiştirmediğini denetlemeli; bozuk v3 satır sonraki kayıtta ezilmemeli. Kabul: bozuk hedef, yanlış koordinat, tekrar hedef veya tutarsız complete/stars için strict okuma reddedilir ve kalıcı satır/revision değişmez.
- **P2 — Aktifleştirme sonrası yerel geri okuma bozulması:** `writeStoredProgress` son kompakt anahtarı yazdıktan sonra doğrulama hatası alırsa sonraki `readStoredProgress`, sağlam legacy/yedek olmasına karşın aynı bozuk kompakt anahtarda duruyor. Mevcut testler yalnız setItem'ın yazmadan hata vermesini kapsıyor. Önceki geçerli kompakt kaydı/pointer'ı koruyan, ilk geçişte legacy'yi kullanılabilir tutan kurtarma yolu ve yazdıktan sonra bozulma testi gerekli. Writer şu an kapalı olduğundan yeni kullanıcı geçişini etkilemez; aktivasyondan önce çözülmeli.
- **P2 — Gereksiz gölge yazımı:** `ProgressSync.flush`, değişmeyen ACK için erken dönmeden önce her 8 saniyede tüm kaydı tekrar kodlayıp doğruluyor ve localStorage'a yazıyor. Gölge son doğrulanan snapshot ile aynıysa bu senkron iş atlanmalı. Kabul: sabit kayıtta tekrarlanan flush gölgeye yeniden yazmaz; değişen kayıt bir yeni gölge yazar.
- **Eksik sınır kanıtı:** v3 bayt bütçesine sığıp açılmış v2 gösterimi 256.000'i aşan kayıt için doğrudan okuma ve API roundtrip testi henüz yok. Tuple sayısı ve string/entry sınırları okunmuş; mevcut örnek katalog testi bu sınırı aşmıyor.

Olumlu: ana CAS/gölge tek transaction; kaybedilen CAS gölgeyi mevcut revision/veri şartıyla koruyor. Silme kapsamına yeni tablo ve tüm sahipli anahtarlar eklenmiş. Farklı içerik revizyonları ayrı geçmişte tutuluyor; çizimler birleştirilmiyor. Bu bulgular koordinatöre iletildi; düzeltme sonrası sonuç ayrıca kaydedilmeli.

## Hedefli tekrar inceleme · 0.51.0 reader-first

14 Kasım 2026. Önceki iki P1 ve iki P2 bulgusu incelenen düzeltmelerle kapandı:

- Hook sunucu capability yanıtını okuyor; reader-first ve rev1 için gerçek PUT gövdesi v2. Modern içerik, destek bildirmeyen sunucuya gönderilmiyor. Eski sunucuya dönüşte yeni istemcinin v3'ü sessizce boş kayıt saydırma yolu kapandı. Keepalive hesabı gerçek v2 gösterimiyle temkinli 60 KB sınırı kullanıyor.
- Strict v3 okuma, her etkin/tarihsel kaydın temizlenen halini orijinal decoded kayıtla karşılaştırıyor. Bozuk hedef, koordinat veya completion artık reddediliyor.
- Başarısız kompakt geri okuma önceki kompakt değeri geri yüklüyor; ilk geçişte yeni bozuk kompakt anahtar kaldırılıp legacy yetkili kalıyor. Gerçek hook storage wrapper'ında removeItem mevcut.
- Sync aynı shadowSnapshot için tekrar codec/doğrulama/yazma yapmıyor. Bağımsız bellek deposu denemesi: üç değişmeyen flush tek gölge yazımı; değişen snapshot bir ek yazım; sonraki sabit flush ek yazım yok.

Yalnız `tests/progress-compatibility.test.ts` ve `tests/progress-owner.test.ts` çalıştırıldı: **34/34 test, 6 suite geçti**. Genişletilmiş runtime 256.000 baytı aşarken kompakt kayıt sınırda kalıp sunucuda kayıpsız okunuyor; eski okuyucuya açık upgrade-required sonucu test edildi. Ayrıca ilk aktivasyonun compact readback bozulmasını bellek deposuyla bağımsız tekrar ürettim: compact anahtar yok, eski legacy okunabilir kaldı.

Bu hedefli tekrar incelemede açık yayın engeli bulunmadı. Sonuç yalnız **COMPACT_PROGRESS_WRITES=false / CONTENT_REVISION_TWO=false** reader-first sürümü içindir; bütün katalog/CI/Worker kanıtı koordinatörün, gerçek iPhone kabulü ertelenmiş ayrı kapsamdır. Kalıcı compact writer ve rev2 aktivasyonu bu inceleme ile açılmış sayılmaz. Uygulama kodu değiştirilmedi.
