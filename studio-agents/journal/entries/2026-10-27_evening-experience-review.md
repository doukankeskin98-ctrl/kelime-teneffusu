# Tamamlanan tahtaya dönüş · bağımsız deneyim incelemesi

27 Ekim 2026 akşam. Koordinatörün açtığı güncel Sites `34fa40459d180ac0e893db6ccd85b7be4f49c49a` /0.12.3, GitHub main `79de8c94407d12a653b06f3412e96cab2f257c83`, eş tam ağaç `d84cb38403d7dd2c1d72f4334300a3782f2fdbd7`. Kök AGENTS, studio-agents README/kayıt/öncelikler, son maintenance-validation, experience AGENT/RULES/HEARTBEAT/MEMORY/RUNBOOK ve ortak BRAND/STRATEGY/AUDIENCE okundu. İnceleme Solo/common/Board ve koordinatörün bildirdiği ilişkili Mystery sonuç yoluyla sınırlı. Uygulama/test/yayın koordinatörde; bu uzman yalnız bu günlük dosyasını yazar. Yeni ajan, servis, hesap, ücret, tarayıcı yolu veya geniş araştırma yok.

## Kaynakla kanıtlanan bulgular

1. **Tamamlanmış tahtada yanlış Devam et eylemi.** Başlangıç `components/game/Solo.tsx:82,90,96`, `common.tsx:69`: controls `paused||completed` alır, gerçek tahta yalnız `paused`/yardım durumuna bakar. Oyuncu sonucu kapatıp tahtaya bakınca tahta açıktır ama düğme Devam et der. İlk tıklama gerçek paused false→true yapar ve harfleri gizler; completed hep true olduğu için kontrol hâlâ Devam et yazar. `Mystery.tsx:35` aynı birleşik kontrol durumunu kullanır. Etki: açık eylem ile yaptığı iş ters; sonuç inceleme akışı güvenilmez görünür. Kanıt doğrudan, maliyet küçük/orta, temel timer/kayıt dışı dar değişiklik riski.

   Gerçek Solo gövdesini mevcut solo-resume testinin kontrollü hook/JSX kabuğunda tamamlanmış sabit bölümle çalıştıran read-only probe **exit0**: completed result kapandıktan sonra `layout.paused=false`, `controls.paused=true`; `onPause` ilk çağrısından sonra `layout.paused=true`, `controls.paused=true`. Kontrol metni common gerçek gövdesindeki paused→Devam et kuralından gelir. İlk probe kabuğunda EventTarget global'i unutulduğu için exit1 oldu; kabuğa sağlandı, son kanıt exit0. Bu React concurrency/DOM veya telefon gözlemi değildir.

   Kabul: completed ve paused ayrı sunulur. Bitmiş tahtada devam/pause ve tüketilemeyecek ipucu düğmeleri sunulmaz; büyütme/ses/yardım ve sonuç eylemi gerçekten çalışır. Aktif solo/daily/mystery duraklama ve süre kuralları aynı kalır; pause hâlinde harf gizleme korunur.

2. **Gizli Tema sonucu kapatılınca geri açılmıyor.** Koordinatörün bulduğu `components/game/Mystery.tsx:35,39`: result onClose review=true yapar; aside'da Solo'daki gibi Sonucu göster eylemi yoktur. Yeni bağlantı, tekrar ve sonuç açıklamasına bu ekrandan dönüş kaybolur. `solved` durumundaki bağlantı kartı ayrıca tamamlanmadan sonra da Son kelime açıldı. Tahtada onu da bul. der. Etki: bitirdiği bulmacanın ödül/sonraki adımı geri alınamaz gibi algılanabilir; kalıcı kayıt silinmez ama yolculuk kopar.

   Pinlenmiş **0.12.3 gerçek Mystery gövdesi**, gerçek mysteryBoard/cleanSave/content/discovery modülleri ve kontrollü hooks ile read-only probe **exit0**: tamamlanmış+çözülmüş save başlangıcında result vardır; onClose sonrasında modal yok, aside içinde yeniden açabilecek button sayısı0. Kaynakla aynı davranış; canlı oyuncu/test hesabı veya DB kullanılmadı.

   Kabul: bitmiş Mystery tahtasında görünür, çalışan Sonucu göster sonuçtaki gerçek sonraki/tekrar/geri eylemlerini yeniden açar. Tamamlandı kopyası son kelimeyi aratmaz. Yardım ile sonuç aynı anda üst üste açılmaz; yardımın kapanması doğru inceleme/sonuç bağlamını korur. Tekrar yeni turu açar ama önceki iyi sonuç/kalıcı kazanımı bozmaz.

3. **Bitmiş tahta yeni seçime açıkmış gibi davranıyor.** `Board.tsx:7–11,28–44` yalnız paused ile girdi engeller; Solo/Mystery tamamlanınca gerçek board paused değildir. Oyun callback'leri complete guard'ıyla yeni commit'i atar ama Board önizleme harfleri/çizgileri ve Kaydır/iki uca dokun talimatı yeni seçim varmış gibi sunulur. Bu kabul edilmiş kelime veya puan kazanımı değildir; gerçekte sonuç alınmayan girdi geri bildirimidir. Birinci bulguyla aynı bitmiş/inceleme durumunun eksik ayrımıdır, ayrı büyük özellik değildir.

   Kabul: açık read-only inceleme durumu harfleri ve bulunmuş çizgileri görünür tutar; yeni drag/tap/Enter seçimi üretmez. İncelemeye geçerken devam eden drag, iki-uç/klavye anchor'ı ve pending preview RAF temizlenir; eski callback/son pointerup yeni commit yapamaz. Arrows ile harf inceleme kalabilir; ARIA/talimatlar seçim yerine incelemeyi anlatır. Paused ayrı kalır ve harfleri gizler. Zoom'da gerekiyorsa scroll/pan ve normal aktif oyunun sekiz yönü korunur.

## Tek odak önerisi ve sınırlar

Bu üç bulguyu tek **tamamlanmış tahtayı inceleme ve sonuca geri dönüş** aşaması olarak çözmek anlamlıdır. Kaynak/VM kanıtı yüksek, oyuncu eylemi faydası açık; dokunma/renk/tahta geometrisi veya kalıcı kayıt değişikliği gerektirmez. Bitmiş state'in Board, PlayLayout, PlayControls ve Mystery/Solo kablolamasında açık olması kabul edilmelidir. Son diff için bu sınırlar üzerinden tekrar kaynak incelemesi yapılacaktır.

İlk taramada daily pending-action adayı da görüldü (`Solo.tsx:67,72,77,78,82,90`): busy sırasında hint düğmesi etkin görünür, callback sessiz döner; tahta başka seçimi önizleyebilir. Bu ayrı network/reconciliation kapsamıdır; bu tur tamamlanmış gibi sayılmaz ve bitmiş/inceleme odağına eklenmez. Büyük özellik, genel görsel yeniden tasarım veya mevcut arşiv/clue/account işini tekrar açma önerilmedi.

Gerçek destekli tarayıcı/telefon erişimi yapılmadı. Önceki preview engelini aşan alternatif yol kullanılmadı. CSS piksel sığması, sistem yazısı, ekran okuyucu anonsu, native olay sırası, React eşzamanlılık/StrictMode, FPS, keyif/tutma ve App Store hazır oluşu iddia edilmez. Bugünün Mahalle maçı / Sokakta doksanlar çifti zaten yayımlandı, yeniden üretim önerilmez.

Son diff incelemesi uygulamadan sonra bu dosyaya eklenecek. Bu ilk inceleme uygulamanın veya yayının tamamlandığı anlamına gelmez.

## Son bağımsız diff incelemesi

Koordinatörün Board/common/Solo/Mystery ve scoped studio.css değişiklikleri ile üç ilgili test dosyası tekrar okundu. **Kaynak incelemesinde yeni yayın engeli bulunmadı.**

- `readOnly` duraklatmadan ayrıdır. Bitmiş Solo/Mystery tahta harf/accepted ink görünür; completed sırasında önceki paused bayrağı tahtayı gizlemiyor. Yardım durumu ayrı gizler ve kapatılınca aynı incelemeye döner. Girdi ref'i her render'da paused/readOnly okur; down/tap/move/up, commit ve pending RAF yeni seçim yapamaz. Review'e geçiş drag/tap/keyboard anchor ve preview'i temizler. Ok tuşu incelemesi ve doğru yönerge kalır. `touchAction` incelemede pan-x/pan-y olur; aktif normal seçim none ve eski zoom davranışı korunur. Bu, fiziksel kaydırma ölçümü değildir.
- Completed controls yalnız İnceleme + zoom/ses/yardım sunar. Gerçekte çalışmayacak hint/pause kaldırılır, büyütme etiketi yeni kelime seçimine davet etmez. Dar CSS yalnız review sınıflarında44px kontrol ve doğal metin sarılması uygular; fixed clipping, yeni iç scroll veya tahta geometrisi eklenmedi.
- Mystery Sonucu göster ile doğru result/next/replay/back eylemlerine döner; yardım/choose ve sonuç modalı üst üste render edilmez. Tamamlanan bağlantı kopyası son kelimeyi tekrar aratmaz. Complete save ayrı solved bayrağı eksikken de bitmiş WordList/cevap görünür; yeni collection bayrağı kendiliğinden verilmez. Replay temiz current save ile gerçekten yeniden seçilebilir; kalıcı iyi sonuç ve önceki mystery koleksiyonu existing keepBest/union yoluyla korunur.
- Koordinatörün yeni **11 kabulü** kaynak üzerinden incelendi:3 gerçek Board readOnly/normal-zoom/pan/arrow/stale-before-effect/reentry;2 Solo result/help/uzaktan-complete-while-paused;2 shared control/layout;4 Mystery resultreturn/helpqueue/replay/best/missingflag. Önceki input/pause/resume kabulleri korunur. Koordinatör35 dar test ve typecheck exit0 bildirdi; bu uzman aynı testleri gereksiz tekrar çalıştırmadı. Test gövdeleri gerçek bileşenleri kontrol edilmiş hooks/JSX/clock içinde çalıştırır; DOM/native dialog focus/React concurrency veya telefon değildir.
- Final kaynak incelemesinde `git diff --check` exit0; engine/content/atlas/progress/discovery/cloud/queue/DB/migration/hosting/lock kapsamlarında diff yoktu. Koordinatör final tam paket/content/build/Worker/CI ve GitHub/Sites tam ağaç/yayın kapılarının sahibidir; bu inceleme onların geçtiği iddiası değildir.

Daily pending network adayı uygulanmış sayılmaz. Gerçek cihaz, preview toparlanması, piksel yerleşimi/odak ve ekran okuyucu anonsu açık kalır. Rol MEMORY'ye tek tur gözlemi kalıcı örüntü diye eklenmedi.
