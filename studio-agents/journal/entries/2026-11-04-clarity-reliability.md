# 4 Kasım 2026 · Güvenli üst alan ve tahtaya dokunarak devam

Rol: `ios_reliability_review`. Kaynak `/private/tmp/kt-device-settings-fix`, taban `bc998c6`. Kapsam native safe-area CSS/başlangıç, Board/common/Solo duraklatma ve Arena kilit anlamı. Kod değiştirilmedi, test/derleme/cihaz çalıştırılmadı. Onaylı 0.34.1 kelime uçuşu ve 0.34.0 haptikler kapsam dışında tutuldu.

## Kaynak nedenleri

1. **Safe-area padding sabit header yüksekliğinin içine sıkıştırılıyor.** `mobile/index.html` viewport-fit=cover, `capacitor.config.ts:4` contentInset never kullanıyor; üst güvenli boşluk CSS üzerinden ayrılıyor. `mobile/native.css:1` native-topbar padding-top'unu safe-area değerine yükseltiyor fakat `app/studio-polish.css:8` header yüksekliğini 58 px'de bırakıyor. `app/game.css:3` global border-box, aynı studio-polish satırı 40 px ikonlar tanımlıyor. Örneğin safe-top 59 px ise padding tek başına sabit yüksekliği aşar; flex satırının içerik alanı kalmaz. Bu kaynak düzeyinde geometrik kusurdur; cihazdaki gerçek env değeri bu incelemede ölçülmedi. Oyun ekranı `.game-app/.arena-is-playing` ise ayrı env-top padding yoluna sahip (`app/viewport-arena.css:2`, `app/board-first.css:4`); header çözümü için bu alanlara ikinci üst inset eklenmemeli.

   En küçük düzeltme native-topbar'ın toplam yüksekliğini satır yüksekliği + safe-top olarak tanımlamak; padding-top da aynı tek safe-top kaynağını kullanmalı. Swift bridge'den sabit iPhone/Island pikseli veya yeni dependency gerekmez. Gerçek cihazda env değeri sıfırsa ayrıca UIKit/WebView geometrisi doğrulanmalı; bu olasılık mevcut kaynakta kanıtlanmış değildir.

2. **Duraklatılmış tahta etkileşimli devam kontrolü içermiyor.** `components/game/Board.tsx:20,59–60` paused durumunu disabled'a çevirip down girişini reddeder. `Board.tsx` son render'ındaki `.board-paused` yalnız div; `app/game.css:8` bu katmana pointer-events:none verir. `common.tsx:85,108` Board'a resume callback'i taşımıyor. Solo visibility handler'ı (`Solo.tsx:70–78`) normal bölümü arka plana geçince durduruyor; devam yolu yalnız alt PlayControls toggle'ı (`Solo.tsx:125`). Bu yüzden tahta dokunuşunun hiçbir devam etkisi yok.

   En küçük düzeltme opsiyonel `onResume` yetkisi: yalnız paused, readOnly/blocked olmayan ve callback verilmiş tahtada tam-tahta semantik button overlay. Pointerdown'da değil, tamamlanan click/Enter'da devam; jest önce temizlenmeli ve bu dokunuş ilk harf/anchor olarak kullanılmamalı. Callback toggle değil idempotent `setPaused(false)` olmalı. Solo bunu yalnız `!daily && paused && !completed && !help && !exit && !dailyLocked` koşuluyla vermeli; callback yürürken document/native aktifliği de denetlenmeli. Geri/ayar/yardım etkileşimlerini yanlışlıkla başlatmamak için bütün ekrana genel onClick eklemek yerine tahta yüzeyi yeterli.

3. **paused bütün modlarda kullanıcı duraklatması anlamına gelmiyor.** `Arena.tsx` paused'u countdown veya sürenin bitip terminal server yanıtının beklenmesi için de kullanıyor; inputBlocked pending claim ve readOnly finished ise ayrı kilitler. Arena'ya onResume verilmemeli, Board paused gördüğü için kendi kendine kilit açmamalı. Günlük Solo da yerel mola vermiyor ve zamanı server üzerinden ilerletiyor; günlük/pending/review durumlarına resume eklenmemeli. Help/exit kaynaklı Solo overlay de salt paused görünümünden resume yetkisi çıkarmamalı.

## Hedefli regresyonlar

- **Header geometrisi:** 0 ve Dynamic Island benzeri safe-top ile gerçek CSS'te header toplam yüksekliği satır+inset, ikon/text üst sınırı safe-top altında; 320 px ve mevcut iPhone genişliğinde taşma/çifte inset yok. Normal oyun header'ı ve alt nav değişmiyor. CSS kaynak assertion'ı yerine önizleme/cihaz bounding rect kontrolü bu kusuru kanıtlar.
- **Tek jestle güvenli devam:** `tests/board-interactions.test.ts` gerçek Board harness'inde paused+resume callback, click/Enter başına tek resume, sıfır commit/letter/anchor; eski up/cancel olayları bir kelime üretmez, ayrı sonraki jest normal çalışır. Legacy touch/pointer çift teslim, blocked/readOnly/paused fakat callback yok durumları resume üretmez. `tests/solo-resume.test.ts` arka plan→ön plan sonrası paused kalması, tahta resume sonrası saatin tekrar ilerlemesi ve kayıt/ödülün değişmemesi için uygundur.
- **Mod yetkisi:** `tests/word-access.test.ts` veya completed-review/Solo harness ile gerçek PlayLayout onResume yalnız normal duraklatmada mevcut; yardım/çıkış, tamamlanmış review ve günlük kilitte yok. `tests/arena-terminal.test.ts` countdown/pending/finished durumunda callback verilmediğini ve server kilidi/readOnly'nin korunduğunu denetlemeli.

## Doğrulama sınırı

Kök nedenler kaynak ve CSS aritmetiğine dayanır; fiziksel Dynamic Island ölçümü veya yeni resume dokunuşu bu incelemede yapılmadı. Animasyon/haptik davranışı için yeni ayar önerilmedi. Kayıt, tahta içeriği, oyun kuralları ve Arena otoritesi değişmemeli.

## Son uygulama incelemesi

Koordinatörün hazır delta'sı salt okunur incelendi. `app/clarity.css` header yüksekliğini `58px + safe-top`, iç üst boşluğu `7px + safe-top` yapıyor; 44 px kontroller için kalan satır 58 px. Journey/Arena sahne min-height hesabından aynı safe-top bir kez düşülüyor. Eski native-only üst-padding override'ı `mobile/native.css` içinden kaldırılmış. Oyun ekranının ayrı safe-area padding yoluna ikinci inset eklenmemiş.

Board resume kontrolü `.letter-board` içinde değil, `.board-scroll` altında onun kardeşi olan semantik button olarak kurulmuş. Bu nedenle pointer/legacy-touch çizim dinleyicilerine ait DOM atası üzerinde değildir; callback yalnız click ile, paused/!readOnly/!blocked/explicit callback ve foreground denetiminden sonra çalışır. Önce mevcut jest temizlenir. Solo callback'i `setPaused(false)` kullanıyor, aynı callback iki kez çağrılsa oyun tekrar durmaz. Günlük, completed, help/exit veya dailyLocked durumlarında callback verilmez; Arena'ya yeni resume yetkisi eklenmemiş. Bu dar kaynak incelemesinde kritik açık engel bulunmadı.

Yeni Board testleri explicit yetki, resumed tap'in anchor/commit üretmemesi, sonraki bağımsız jest, blocked/review/countdown benzeri yetkisiz durumlar ve background click reddini; Solo/ortak layout testleri idempotent resume ve help korumasını kapsıyor. İnceleyici bu test kaynaklarını okudu, test çalıştırmadı. Koordinatör 131 hedefli testin geçtiğini ve 414×628 tarayıcı önizlemesinde tam-tahta dokunuşu → seçili hücre 0 → sonraki ELMA çizimiyle 1/4 kabulü doğruladığını bildirdi. Bu tarayıcı kanıtı native Dynamic Island inset'inin fiziksel cihaz ölçümü olarak sunulmamalı; o sınır ayrıca korunur.
