# 31 Ekim 2026 · Mobil grup tahtası · Dar uyumluluk incelemesi

Koordinatörün isteği: uygulama koduna dokunmadan yeni grup turları için 9×9/yedi kelime seçeneği, eski oda ve tekrar engeli. UI, yayın, model ve bağımlılık değişikliği bu incelemenin dışında.

## Kanıt ve karar desteği

`ARENA_BANKS` yalnız3–8 harfli tam kelimeleri alıyor (`lib/game/arena-content.ts:8`); bilmece bankasının en uzun cevabı da8 harf. Geçici, depo dışı probe, mevcut üreticinin yalnız pool sürümü ve boyut/kelime sabitlerini 9×9/yediye çevirdi. İlk48 normal+16 bilmece:64 tam, çözülebilir, benzersiz grid ve kelime kümesi; bütün çıktılar9×9/yedi. Ayrıca iki havuzda64/100/1000/orta/son ordinal örneklerinde null yok. Bu örneklem bütün kombinasyon havuzunun kanıtı değildir. 9×9/yedi içerik açısından uygulanabilir; zorluk için iki çapraz eğim ve yerleşim doğrulaması korunmalı.

## En fazla üç uyumluluk riski ve kabul

1. **Eski cursor ile yeni kombinasyon sırasını karıştırmak.** `group-content.ts:6–11,14,27` pool kimliği, kombinasyon uzunluğu, sıraya bağlı tohum sözleşmesidir. Yeni normal/bilmece pool kimlikleri kullanılsın (örn. `arena-group-9x7-v2` / `arena-group-clue-9x7-v2`); eski pool satırları sıfırlanmasın. Kabul: eski iki grup ve iki düello cursor değeri değişmeden yalnız yeni pool ilerler. `tests/riddle-groups.test.ts:71,78` literal eski pool isimleri yeni sabitlerle güncellenmeli; exhaustion eşiği yediden az olmalı.

2. **Devam eden12×12 tahtayı yeniden üretmek.** `server.ts:26` kaydedilmiş `room.puzzle` değerini doğrudan kullanır; yeni allocate yalnız aktif olmayan→aktif geçişinde çalışır (`server.ts:169`). Bu sözleşme korunursa mevcut grid/target/stroke/score değişmez. Kabul: gerçek eski12×12/9 normal ve bilmeceli snapshot ile state→claim→reload→finish→next/start; eski tur aynı, tek sonraki tur9×9/7 ve tüm katılımcılarda eşit. Mevcut `group-board.test.ts:23` eski8×8 altı kelimeyi sınamakta;12×12 vaka ayrıca gerekir. İnceleme anındaki gerçek iki eski örnek `/private/tmp/kt-mobile-legacy-groups.json` içine alındı; oyuncu verisi içermez.

3. **Yeni pool ile geçmişi resetlemek veya bilmece tüketimini gevşetmek.** `server.ts:117` bütün aktif oyuncuların `arena_seen` kelime-kümesi/grid geçmişine pooldan bağımsız bakar; `group-content.ts:30,35` oda içindeki tekil `usedRiddleIds` değerlerini dışlar. `server.ts:51–56` cursor/oda/makbuz ortak CAS kaydı değişmemeli. Kabul: yeni poolun ilk adayı katılımcılardan birinin eski makbuzunda ise atlanır; önceki12×12 bilmece ID'leri sonraki turda görünmez; kullanılan ID ve eski makbuzlar silinmez; başarısız kayıt cursor/oda/bilmece geçmişini birlikte geri alır. Normal kelime geçmişi mevcut davranışta tam küme bazlıdır; bir önceki dokuzlu kümeden bazı kelimeler içeren farklı yedili küme yasak değildi ve bu çalışma tekil normal kelime yasağı eklememelidir.

## Değişecek hedefli kabul noktaları

`tests/group-board.test.ts` boyut/sayı/exhaustion, `tests/riddle-groups.test.ts` literal poollar, `scripts/check-content.ts:25–29` boyut/sayı, `scripts/verify-worker.mjs:174,190,214` ortak grup tahta boyutu/sayısı. Ana96 bölüm, eski riddle32, günlük snapshotlar, kayıt şeması ve düello üreticisi değişmemeli.

Görsel/dokunma veya fiziksel iPhone kanıtı bu incelemede yok; koordinatörün mobil önizlemesi ayrıdır. Uygulama kodu değiştirilmedi.
