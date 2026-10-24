# Akşam son güvenilirlik incelemesi · 24 Ekim 2026

Kabul: `2026-10-24_evening-coordinator-decision.md`. İncelenen kaynaklar: yeni kuyruk, gerçek `PublishedPlay` bağlantısı, bölüm PUT uç noktası, 12 dar TSX senaryosu ve Worker HTTP ekleri. Uygulama/test dosyasına yazılmadı; test paketi/derleme tekrar çalıştırılmadı.

**Sonuç:** İncelenen diff'te seçilen iki sorunun çözümünü engelleyen yeni kaynak hatası saptanmadı. Zorunlu test/derleme/HTTP/CI ve kaynak eşleşmesi sonuçları koordinatörün yayın kapıları olarak kalır.

## Kabulü karşılayan davranış

- `lib/studio/chapter-save-queue.ts:33–44,54–69`: uçuş sırasında son snapshot nesnede tutuluyor; başarılı kısmi yanıt sonrasında hâlâ pending ve gönderilenden farklı kayıt yeniden gönderiliyor. `detach` yalnız UI gözlemcisini ayırıyor ve drain'i koruyor. İkinci PUT sırasında oluşan üçüncü/son snapshot sabit iki istek sınırında düşmüyor.
- Aynı dosya `41–42,57,63–69` ve `PublishedChapters.tsx:44–45,99`: yeni effect eski nesneyi iptal ediyor; farklı sahip yeni kuyruk/kilit kullanıyor. İptal edilen eski Promise'ın geç sonucu kalıcı/UI işleme yoluna girmiyor; eski `finally` yeni nesnenin kilidine erişmiyor.
- Kuyruk `47–65`: abort olayına bağlı deadline, `options.send`in bütün Promise'ını sınırlıyor. Bileşenin `send`i token/HTTP/JSON'u içeriyor (`PublishedChapters.tsx:55–59`). Hata/timeout başarı bayrağını açmadığından anlık retry döngüsü başlamıyor; timer ve abort listener temizleniyor. Aktif sonraki online/periyodik deneme pending son kaydı yeniden deneyebilir.
- `PublishedChapters.tsx:52–68`: istek sahibi, bölüm/tahta ve yerel anahtar aynı closure'a bağlı. Detached yazı kendi sahibinin mevcut cihaz kaydıyla `mergeChapterSave` yapıyor; yeni turun iyi sonucu eski yanıtla doğrudan değiştirilmiyor. `onSave` eski kuyrukla güncel kanal eşleşmezse dönüyor (`111`).
- `PublishedChapters.tsx:57`, `app/api/chapters/route.ts:20–23`: her yeni kuyruk `expectedOwnerId` gönderiyor. Alan varsa doğrulanmış `member.userId` ile sıkı eşitlik gerekli; yanlış, boş, null veya nesne değer yazım öncesi reddedilir. Yazılacak kimliği hâlâ yalnız `gameMember` belirliyor. Alanı olmayan eski istemci yolu korunmuş. Böylece mevcut `memberFetch`in 401 sırasında kimlik değiştiren retry'si eski snapshot'ı yeni kişi altında yazamaz.
- Fallback önceki düzeltmesi `open(...,true,'offline')` ile korunuyor (`PublishedChapters.tsx:93–94`); tahta doğrulaması, yerel kayıt biçimi ve iyi sonuç birleştirme yardımcısı değişmiyor.

## Regresyonların kapsamı

- `tests/published-play-sync.test.ts:166–201`: önceki üç gerçek TSX fallback/onay/sahip testi korunmuş.
- `209–301`: çıkışta son tamamlama, A→B iptali/geç yanıt/yeni uçuş kilidi, timeout sonrası son kayıtla tekrar, başarısız detached istekten sonra durma, yeni cihaz iyi sonucunu koruma, ikinci uçuş sırasında üçüncü snapshot ve bitmeyen JSON sınırı okunarak doğrulandı.
- `305–330`: cihaz yazma hatası ve gerçek depolama düzelmesi; çevrimdışı son snapshot ve yeniden bağlantı senaryoları eklenmiş. Bunların bu tur çalışma sonucu bağımsız olarak iddia edilmiyor; koordinatör tam testi çalıştırıyor.
- `scripts/verify-worker.mjs:48–52`: yanlış/boş sahip beklentisi ve yetkisiz istek reddi, yanlış sahibin kaydının boş kalması ve doğru sahipte normal kayıt üretim Worker kontrolüne eklenmiş. Kaynak varlığı testin çalışıp geçtiği anlamına gelmez.

## Sınırlar

Önceki 2/3 numaralı sorunlar artık bu diff'in açık kabul senaryolarıyla ele alınıyor; yalnız backlog notu olarak bırakılmamış. Hata/timeout sonrasında ayrılmış kanalın cihaz kaydını koruyup durması bilinçlidir: aynı sekmede başarılı drain ile ağ hatası/sekme kapanması/OS öldürmesinde garantili teslim aynı iddia değildir. İndirilmiş tahtanın başlangıç ağ bekleyişi ve arşiv dönüş bağlamı kapsam dışında kalır. Gerçek React/DOM/StrictMode, telefon, fiziksel ağ, ekran okuyucu ve FPS doğrulanmadı; canlı oyuncu/DB kullanılmadı, önizleme engeli aşılmadı. Yayın kararı ve gerçek yayın doğrulaması koordinatördedir.
