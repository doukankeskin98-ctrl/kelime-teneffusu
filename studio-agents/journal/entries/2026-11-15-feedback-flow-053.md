# 15 Kasım 2026 — Ardışık kelimelerde kısa övgü, dar kaynak incelemesi

Taban: README ve geliştirme defterinde 0.52.2. Güvenilirlik/akış incelemesi; uygulama ve test kaynağı değiştirilmedi. Test, derleme, tarayıcı, fiziksel cihaz ve yayın çalıştırılmadı. Atanmış bu günlük dışına yazılmadı. 0.52.2'de geri getirilen seslere dokunulmamalı. WoW tetik kuralları incelenmedi; aşağıdaki eşikler bu oyun için önerilen başlangıç ayarıdır, rakip oyunun doğrulanmış davranışı değildir.

## 1. Övgü, mevcut harf uçuşunun `fresh` listesine değil gerçek kabul olayına bağlanmalı

**Kaynak:** `lib/game/word-feedback.ts:40–53`, `components/game/WordFeedback.tsx:26–34`, `components/game/common.tsx:97–104,136`.

Mevcut uçuş defteri sunum içindir: yerel `preview` eşleşmesi ağ dönüşünden önce uçabilir; ACK aynı uçuşu sessiz tüketir, geri çekme aynı kelimenin tekrar denenmesine izin verir. `confirmed` dizisine sonradan gelen uzak kayıt da yeni ID olabilir. Bu defterden doğrudan ardışık başarı üretmek onaysız/sonradan geri yüklenmiş kelimeyi sayabilir. Bu mevcut uçuş davranışında hata iddiası değildir; yeni övgü katmanı için uygun olmayan bir olay kaynağıdır.

**En küçük öneri:** `PlayLayout` içinde tek ortak dekoratif övgü bileşeni ve saf, geçici bir eşik/tekilleştirme yardımcısı. Modlardan aynı oturumdaki gerçek eylem için `{scope, targetId, actionId, selectedAt, terminal, assisted}` benzeri dar olay verilsin. Yeni genel event bus, depolama, puan, ödül, telemetri veya bağımlılık gerekmiyor. `Board`, harf uçuşu defteri, ses ve haptik tetiklerini yeniden düzenlemeye gerek yok.

| Mod | Başarı kaynağı | Özellikle dışlanacak yol |
| --- | --- | --- |
| Yerel Solo / yolculuk / hikâye / dış bölüm | `Solo.tsx:137–157`: duplicate/story/canonical guard'larından sonra `foundRef` ve `save`a eklenen gerçek yeni stroke | `Solo.tsx:91–97` uzaktan resume merge'i; `requestHint` (159–164); son hedef |
| Günlük | `Solo.tsx:124–126` claim-confirmed callback'i, yalnız bu foreground oturumunda gerçekten başlatılmış action ile eşleşiyorsa | `DailyActionSession.restore()` da confirmation çağırabilir (`daily-action.ts:43–45,60–66`); yalnız callback adı yeni kullanıcı eylemi kanıtı değildir |
| Arena | Aynı owner/room/round'daki yerel claim'in sunucuca onaylanması; yalnız o action'ın target ID'si | `Arena.tsx:43–53` genel snapshot/recover veya başka oyuncu değişimi; pending başlangıcı (99); reddedilen/timed-out claim; son hedef veya bitmiş maç |
| Meydan | Aynı view'daki yerel claim'in onayı (`Challenges.tsx:48–53`) | `recover()` (32–40), açılış/resume, pending başlangıcı; son hedef |
| Bonus | `selectBonus(...).accepted` sonrasında (`BonusRound.tsx:35–37`) kabul edilen farklı placement ID'si | Aynı kelimenin zaten bulunan çizgisi, uzaktan bonus merge'i (34), süre dolması (`tick`,23–25), son yerleşim |

Arena'da WebSocket ACK'den önce stroke'u getirebilir (`Arena.tsx:53,100`). Yalnız ACK anındaki önceki stroke farkına bakmak gerçek başarıyı kaçırır; hem snapshot hem ACK'ye ayrı ayrı bağlamak iki kez sayar. Yerel action kaydı + scope/target tekilleştirmesi, onayın hangi taşıma yolundan geldiğinden bağımsız olarak bir defa üretmeli. Meydan'ın `confirmed` karşılaştırması (52) de aynı anda gelen recovery ile eski durum değişmiş olabileceği için tek başına ortak olay modeli yerine kullanılmamalı. Reddedilmiş/geri çekilmiş pending övgü üretmez; aynı hedefin daha sonra gerçekten kabul edilen yeni denemesi sayılabilir.

**Kabul ölçütü:** Yerel kabulde bir olay; pending başlangıcında sıfır; ACK→snapshot ve snapshot→ACK sıralarında toplam bir; reddetme/retry toplam yalnız gerçek kabul kadar; restore/cloud merge/batch snapshot sıfır. Scope oda+turu, günlük denemesi, bölüm+run veya bonus attempt ayrımını korur. Çok sözcüklü hedeflerde sayım birimi mevcut kabul edilen `target.id` olur; aynı group'un gizli tam cevabı övgü metninde açığa çıkarılmaz.

## 2. Küçük, süreli bir sunum; anlık giriş ve son-kelime koreografisi bağımsız kalmalı

**Kaynak:** `components/game/Board.tsx:64–73,85–103`; `common.tsx:123–136`; `app/coordinated-play.css:13–15`; `WordFeedback.tsx:69–87`; `lib/game/word-feedback.ts:6–8`; `useResultPresentation.ts:25–42`.

Erken kabul geçerli son harfte `onCommit` çağırıyor; pointerup'ı veya animasyonu beklemiyor. Harfler 720 ms uçuyor, son harften sonra iniş haptiki ve 180 ms hedef yerleşmesi var; sonuç ayrı 1040 ms bekleme + 220 ms sahne çıkışı kullanıyor. Övgü bunların sürelerini, başarı sesini veya haptik sayısını değiştirmemeli. `readOnly` kelime kabul edildiği anda true olabilir; `celebrating`/`departing` ise daha sonra gelir. Yalnız `celebrating` ile bastırmak son kelimede sonuç öncesi gereksiz övgü gösterir.

**Başlangıç önerisi (oyuncu testiyle ayarlanacak):** En son uygun başarıdan en fazla 8 saniye sonra gelen ikinci yeni başarıda kısa `Harika!`; sonraki övgü için en az iki ek uygun başarı ve en az 4 saniye ara; aynı tahta/run içinde en fazla üç gösterim. Görünür süre yaklaşık 900 ms. Geçerli kabul zamanını yerel `performance.now()` ile action anında kaydet; ağ gecikmesini oyuncunun hızına dönüştürme. Bayat/gecikmiş onayı sonradan övgü kuyruğuna alma. Gerçek yanlış tamamlanmış seçim sessizce seriyi sıfırlar; duplicate hiçbir zaman artırmaz ve oyuncuya bir kayıp/ceza bildirimi verilmez.

Tek kısa yazı, tek DOM düğümü; `pointer-events:none`, yerleşimi değiştirmeyen mutlak konum, mevcut temanın okunaklı renkleri. Skor, çarpan, jeton, yıldız veya seri sayısı yok. Harf uçuşu bitişini bekleyen yeni timer zinciri yok. Aktif yeni çizgi/kelime baloncuğu öncelikli olmalı: övgü yeni seçimi örterse anında kaldır, sonra yeniden oynatma veya sıraya koyma. Overlay, `Board`'un `key`, `disabled`, pointer capture, geometry veya commit yolunu değiştirmemeli. Duyuru yalnız dekoratifse `aria-hidden`; mevcut başarı durum mesajını ikinci kez okutma.

Övgü her `terminal/readOnly/departing/celebrating` durumda derhal biter. İpucu isteme/yanıtı başarı değildir; seri sıfırlanır. İpucuyla gösterilmiş hedefin kabulünü de övgü dışında tutmak için geçici target ID işareti kullan; `hint` hücresinin hâlâ görünür olup olmadığına güvenme, çünkü 3 saniyede temizleniyor (`Solo.tsx:101`). Tüm bölümü kalıcı olarak cezalandıran yeni kural ekleme. Öğreticinin zorunlu ilk yönlendirmesi de gerekiyorsa aynı assisted guard'ıyla bastırılabilir.

**Kabul ölçütü:** İkinci başarıda en fazla bir kısa metin; hızlı 8–10 kabulde sınırlı gösterim ve en fazla tek övgü/timer. Son hedef/maç süresi dolması/bonus bitişinde övgü yok; sonuç süresi değişmiyor. Övgü sırasında sonraki kaydırma, sekiz yönde pivot, tersten seçim ve erken kabul eskisi gibi çalışıyor. Ses/haptik çağrı sayıları ve harf uçuşu süreleri aynı.

## 3. Yaşam döngüsü sunumdan önce tüketilmeli; arka plandan dönünce eski başarı övülmemeli

**Kaynak:** `WordFeedback.tsx:15–33,73–87`; `lib/platform/activity.ts:1–9`; `Solo.tsx:81–83`; `BonusRound.tsx:29–34`; `lib/game/daily-action.ts:43–73`; `useResultPresentation.ts:12–24,34–42`.

Mevcut uçuşlar görünmez/reduced durumda kelime ID'sini önce tüketiyor ve iptal edilen işi yeniden oynatmıyor. Ortak övgü de aynı ilkeyi korumalı ama kendi accepted-action defterini kullanmalı. Arka plan, `pagehide`, modal/ayar/yardım, scope değişmesi, unmount ve terminal durumda timer + görünür metin temizlenir, geçici seri sıfırlanır. Görünmezken gelen ACK tüketilir; dönüşte övgü veya eski seri devam etmez. Özellikle foreground'a döndükten sonra gelen eski ACK'yi engellemek için action'ın foreground nesli/iptal durumu tutulmalı; sadece ACK anında `document.hidden===false` yeterli değildir.

Azaltılmış harekette aynı kısa metin hareketsiz gösterilebilir; ölçek, kayma veya uçuş eklenmez. Bu modun değişmesi eski övgüyü tekrar başlatmamalı. Başarı/ödül kabulü hiçbir animasyon bitişine bağlanmaz. `observeGameActivity` document görünürlüğü ve native etkinliği birleştiriyor; yeni genel lifecycle altyapısı gerekmez.

**Mevcut ilgili test kaynakları (okundu, çalıştırılmadı):** `tests/word-feedback.test.ts:10–31,56–69,122–130` pending→ACK, rollback/retry, görünmez tüketim, reduced motion, dört uçuş sınırı ve iniş haptikini koruyor. `tests/result-presentation.test.ts:25–51` son harf→sonuç, geç ACK, restore, interruption kapsamı. `tests/board-interactions.test.ts:274–289,358–393` erken kabul ve pivot; `tests/input-gesture.test.ts:33–55` sabit başlangıç noktalı yön değiştirme. `tests/daily-actions.test.ts:66–69` kontrol GET'i ile gerçek kabul kurtarması.

**Yeni dar kabul önerisi:** Saf övgü modeli için zaman penceresi sınırları, cooldown/gösterim sınırı, duplicate, terminal, assisted, yanlış seçim ve scope. Bileşen/olay testi için pending→reject→retry, ACK/snapshot yarışının iki sırası, restore-confirmed, background öncesi action→foreground sonrası ACK, modal sırasında kabul, reduced-motion değişimi ve unmount timer temizliği. Ardından koordinatörün 320/375/414 px önizlemesinde aktif parmak baloncuğu/harf rafı/uzun Türkçe hedefle çakışma kontrolü. Kaynak ve birim testleri fiziksel parmak rahatlığı, haptik his veya oyuncu memnuniyeti kanıtı değildir.
