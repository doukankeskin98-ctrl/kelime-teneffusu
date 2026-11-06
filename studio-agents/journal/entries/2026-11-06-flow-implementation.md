# 6 Kasım · İlk oyun rehberi ve sonuç geçişi sözleşmesi

İncelenen başlangıç `22fe40945523870479467a5bfa66e94a511f44f3`. Uygulama salt okunur tutuldu. Yalnız mevcut tahta üreticisi Node ile çalıştırılarak iki tahtanın yerleşimleri okundu. Test, tarayıcı, kurulum veya yayın yapılmadı.

## İlk oyun rehberi

`Solo.tsx:42,46,82,142,156,161` ve `content.ts:22,66` mevcut tahta/alıştırma kaynaklarıdır. Yeni tahta üretmeye gerek yok. Sıfır tabanlı mevcut yerleşimler şöyle.

| Tahta | İlk düz hedef | İlk çapraz hedef | Serbest kalanlar |
| --- | --- | --- | --- |
| İlk ana bölüm `uzay-1`, 6×6 | YILDIZ `[5,0] → [5,5]` | GÜNEŞ `[0,5] → [4,1]` | DÜNYA, MARS |
| Açık alıştırma `TUTORIAL`, 6×6 | KELİME `[5,0] → [5,5]` | MERAK `[0,0] → [4,4]` | KEŞİF |

Deterministik seçim için mevcut `board.placements` sırasından ilk düz ve ilk çapraz hedef alınabilir. Düz, aynı satır veya sütun; çapraz, eşit ve sıfır olmayan satır/sütun uzaklığıdır. Seçili kimlikler bir oyun başlangıcında sabit kalır. Aşama, bu kimliklerin doğrulanmış `strokes` içinde bulunmasına göre ilerler. Timer veya yalnız pointerup olayı rehber aşaması ilerletmez. Başka doğru kelimeyi önce bulan oyuncu engellenmez. Çaprazı önce bulduysa düz tamamlanınca aynı çapraz yeniden istenmez.

- **Temiz kayıt** Otomatik rehber yalnız ilk ana bölümün ilk gerçek oyununda açılır. Uygunluk mount anındaki başlangıç ilerlemesinden sabitlenir. Solo her saniye elapsed yazdığı için uygunluğu her render'da yeniden hesaplamak rehberi ilk saniyede kapatır.
- **İlerlemiş kayıt** Önceden anlamlı stroke, süre, ipucu, tamamlama/günlük/klasik ilerlemesi bulunan oyuncuya otomatik rehber bindirilmez. Mevcut `tutorialDone=false` tek başına yeni oyuncu kanıtı değildir. Elle açılan alıştırma her oyuncuya açıktır.
- **Yarım oyun ve mola** Aynı oturumda pause/help/background rehberi dondurur ve işaretlerini gizler; resume aynı doğrulanmış aşamayı gösterir. Önceden var olan yarım kayıt otomatik rehberin hedefi değildir. Yeniden açılışta eski kaydı sıfırlama veya öğreticiye yönlendirme yapılmaz.
- **Geç** Rehberi geç eylemi yalnız sunumu kapatır. Stroke, complete, hints, yıldız ve ödül değişmez. `tutorialDone` mevcut anlamıyla gerçek alıştırma tamamlama kaydı olarak kalır. Kalıcı atlama istenirse bunu ayrı, owner kapsamlı rehber tercihiyle sakla; tutorialDone'a sahte tamamlama yazma. Manuel alıştırma bu tercihi aşabilmeli.
- **Gösterim** `PlayLayout`/`Board` mevcut hint ve hintEnd koordinat dönüşümünü zaten biliyor. Rehber bu mekanizmanın sunumunu kullanabilir; ücretli/puan etkili `useHint` çağrılmamalı. Gerçek ipucu varsa onun gösterimi öncelikli olmalı. Rehber başlangıç/son işareti `pointer-events:none` olmalı. Azaltılmış harekette statik ok/işaret ve kısa metin yeterli. Aşama değişiminde tahta yeri ve hücre ölçüsü aynı kalmalı; Geç eylemi en az 44 px ve klavyeyle erişilebilir olmalı.

**Hedefli kabul** Mevcut uzay-1/TUTORIAL board hash ve grid aynı; ilk düz ve çapraz selector sonuçları yukarıdaki gerçek yerleşimler; yanlış/tekrar/out-of-order doğru kelime; iki uca dokunma/ters seçim; ilk saniyede rehber kaybolmaması; mevcut save'lerin otomatik atlaması; pause/resume; skip'in sıfır oyun durumu yazımı; reduced motion; rehber tamamlanınca kalan kelimelerin normal kabulü. Güncel `word-access.test.ts` Solo harness'i ve `daily-ui.test.ts:145–154` dürüst tutorialDone kayıt testi genişletilebilir. Sahne/tahta geometrisi gerçek dar tarayıcıda ayrıca ölçülmeli.

## Son kelime → sonuç

Hazır ortak sonuç hook'u yok. `Solo.tsx:51,67,138` yerel ready+timer, `Arena.tsx:21–29` aynı turda active→finished ve doğrulanmış stroke artışı ayrımı kullanıyor. Challenges'ta sonuç timer'ı yok (`Challenges.tsx:33–40`). Mystery de complete anında sonucu açıyor (`Mystery.tsx:39–43`).

Tek küçük ortak hook çıkarılacaksa mevcut Arena geçiş modelini temel alsın. Girdiler scope, completed ve doğrulanmış stroke sayısı; çıktılar ready/waiting/skip. Scope değişimi ve unmount eski timer'ı temizlemeli. İlk render zaten complete ise sonuç hemen hazırdır. Yalnız aynı scope'ta yeni doğrulanmış final kelime normal hareket açıksa `WORD_RESULT_DELAY_MS=1040` bekler. Mevcut 720 ms uçuş, en fazla 84 ms harf gecikmesi ve 180 ms varış değerleri korunur (`lib/game/word-feedback.ts:5–6`). Score/save/finished hemen kalıcı olur, yalnız modalın görünmesi bekler.

- **Challenges** Hook koşulsuz olarak `if(view)` dönüşünden önce çağrılmalı. Scope `view.id`, count yalnız `view.strokes.length`; pending stroke başarı sayılmaz. `!!view && view.finished!==null` kullanılmalı. Kullanıcı yeni meydan okuma açtığında önceki ready/timer taşınmaz.
- **Mystery** Scope mevcut `spec.id + ':' + feedbackRun`. Aynı bölümü Tekrar oyna eylemi yeni scope açar; eski en iyi kayıt ve solved geçmişi korunurken yeni oyunun yerel ready durumu temizlenir.
- **Feedback** `done/readOnly` seçimi kilitlerken WordFeedback görünür kalmalı. `feedbackPaused` yalnız gerçek yardım/çıkış/tahmin paneli veya kutlamayı kapsar. Challenges'taki `wordListUnavailable={done||exit}` varsayılanından ayrı `feedbackPaused` geçilmezse final uçuş yine yutulur. `WordFeedback.tsx:20–23` ve ledger `word-feedback.ts:37–45` yeniden kullanılmalı; yeni animasyon motoru gerekmez.
- **Geçiş denetimi** Sonuca geç mevcut alt kontrol yuvasında olmalı. Çift dokunuş aynı ready sonucunu verir. Help/exit/guess açıkken sonuç ikinci modal olarak açılmamalı; ready korunur, panel kapanınca görünür. Sonuç kapatılıp yeniden açıldığında harf uçuşu tekrarlanmaz. Background/azaltılmış hareketten dönüşte tamamlanmış oyun yeniden 1040 ms bekletilmez.

**Hedefli kabul** Yeni final öncesi/1040 ms sınırı; pending son kelimenin reddi; bitmiş kayıtla açılış; yinelenen onay; hemen skip ve çift skip; sonuçtan inceleme ve yeniden açma; yardım/çıkış modalı çakışması; önceki scope timer'ının sonraki oyunu açmaması; Mystery aynı bölümü tekrar başlatma. Mevcut `tests/word-access.test.ts` Challenges onay testleri, `tests/completed-review.test.ts` Mystery inceleme testleri ve `tests/word-feedback.test.ts` iptal/reduced-motion ledger testleri uygun temel. Yeni hook eklenirse bu dosyaların kontrollü modül/clock mock'ları birlikte güncellenmeli.

Fiziksel parmak hissi, kare süresi ve VoiceOver bu kaynak sözleşmesiyle doğrulanmış değildir. Koordinatör uygulama sonrasında yalnız bu iki davranışın dar diff/görsel kabulünü isteyecek.

## Uygulama sonrası dar ikinci kontrol

6 Kasım, aynı taban üzerindeki uncommitted `first-play`, `useResultPresentation`, Solo, Challenges, Mystery ve navigation değişiklikleri kaynak üzerinden okundu. Uygulama/test/tarayıcı değiştirilmedi veya çalıştırılmadı. Aşağıdaki satırlar inceleme anındaki çalışma ağacına aittir; koordinatöre canlı olarak bildirildi.

- **Rehber / sahibi değişen oturum:** `Solo.tsx:49–52` uygunluğu mount'ta doğru sabitliyor; fakat `App.tsx:85,126–127` yeni owner ilerlemesini yüklediğinde mevcut Solo/Mystery örneği hâlâ açık kalabiliyor. Solo'nun mevcut owner sınırı yalnız günlük için (`Solo.tsx:60–61`). Bu durumda eski rehberin Atla veya tamamlama eylemi yeni profile `guideDone` yazabilir. Gerçek, bilinen owner değişiminde aktif yerel oyunu kapatmak; ilk profil yüklenmesini gerçek değişimden ayırmak en küçük güvenli sınırdır. Challenges'a yeni eklenen owner key'i bu mod için doğru. Kabul: A hesabının açık rehberi/sonuç bekleyişi B hesabına taşınmaz, B'nin kayıt/rehber tercihi değişmez.
- **Native sonuç bekleyişi:** `useResultPresentation.ts:15–16` yalnız `document.hidden` okuyor. `mobile/main.tsx:22–24` native pasifliği `gameIsActive=false` ve sentetik visibilitychange ile bildiriyor. `WordFeedback.tsx:14` bu sinyali zaten destekliyor. Hook'un ilk kontrolü ve hide callback'i de `!gameIsActive()` kullanmalı; native arka planda iptal edilmiş uçuşun ardından boş 1040 ms bekleyiş kalmamalı. Scope/unmount timeout temizliği mevcut kodda var; eski scope timer'ı için ek sorun bulunmadı.
- **Kurallar / alıştırma dönüşü:** `Challenges.tsx:43` yeni yardım girişinde `Help daily` kullanıyor; ipucusuz, kod başına oynanan meydan okumaya günlük ipucu/sıralama kuralları gösteriyor. Meydan okumaya özgü kısa kural metni gerekli. `Solo.tsx:154` manuel alıştırma çıkışını her hesap için sabit uzay-1'e bağlıyor; daha önce bitiren kullanıcı anında eski sonuç ekranına düşer. Temiz kayıt ilk bölüme; ilerlemiş kayıt mevcut yolculuk hedefi veya ana akışa dönmeli, CTA bunu doğru söylemeli. Kabul: ilerlemiş kayıtla Ayarlar → Nasıl oynanır → Alıştırma → Devam tamamlanmış ilk bölüm sonucuna döngü yapmaz.

Onaylanan kaynak davranışı: ilk rehber zaman geçtikçe yeniden uygunluk hesaplamıyor; guideDone tutorialDone'dan ayrı tutuluyor; eski kayıt şeması zorunlu yeni alan almıyor; Mystery tekrarında feedbackRun scope'u değişiyor; sonuç gösterimi yalnız yerel doğrulanmış finalde hazırlanıyor; yardım/çıkış/tahmin modalı açıkken yeni sonuç modalı üstüne binmiyor. Gerçek cihaz ve animasyon akıcılığı bu kaynak kontrolünün kanıtı değildir.
