# Mevcut domain, davetler ve Apple hesap işleri

Domain kararı: mevcut `kelime-teneffusu.healica.chatgpt.site` korunur; API ve kayıtlar taşınmaz. Yeni domain maliyeti/taşınması bu tur yok.

## Davet hazırlığı

Uygulama soğuk/sıcak başlangıçta gelen oda, arkadaş ve meydan davetini dinler. Yalnız aynı HTTPS origin, tek geçerli davet kodu ve kök yol kabul edilir. Eski launch cevabı daha yeni davetin üzerine yazamaz. Giriş penceresi açıkken güncel dönüş adresi korunur. Bu yönlendirme **iOS'un uygulamayı bağlantıdan açtığını kanıtlamaz**.

Aktivasyon için kullanıcı Team ID sağladığında:
1. Apple Developer'da aynı Bundle ID için Associated Domains aç; dağıtım profili yenile.
2. `docs/store-052/apple-app-site-association.template.json` içindeki appID'yi gerçek `TeamID.com.kelimeteneffusu.game` yap. Dosyayı aynı domainde `/.well-known/apple-app-site-association` altında JSON, redirectsiz200 yanıtla yayımla; auth/cache/Apple CDN testini yap. Eksik Team ID ile yayımlama.
3. iOS entitlements'a `applinks:kelime-teneffusu.healica.chatgpt.site` ekle; Debug/Release signing'e bağla. Mevcut entitlement'ları silme.
4. İmzalı telefonda Mail/Notlar üzerinden üç daveti, kurulu/kurulu değil, açık/kapalı, hesabı yok/var, bozuk/yabancı URL durumlarını dene. Aynı domaini Safari adres çubuğuna yazmak universal-link kabul deneyi değildir.

[Apple Associated Domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains), [Capacitor App](https://capacitorjs.com/docs/apis/app).

## Game Center

Köprü kapalıdır. Developer üyeliği → App Store Connect uygulaması → Game Center capability → leaderboard kimliği/skor anlamı → entitlement/provisioning → gerçek sandbox oyuncusuyla doğrulama. Apple hesabına otomatik giriş sunucudaki Arena kimliğinin doğrulanmış eşleşmesi değildir. İmzalı oyuncu doğrulama ve hesap bağlama tasarımı olmadan mevcut kaydı başka kimliğe taşımayın. Kullanıcı onayı ve cihaz kabulünden sonra bayrak açılır.

## Bildirim ve puanlama — uygulanan yerel köprü

Günlük bulmaca bitince tek, isteğe bağlı teklif; ayarlardan da erişilebilir. İzin yalnız oyuncu düğmeye dokununca istenir. Kabulde cihazın yerel saatine göre her gün 19.00'da **sessiz** bildirim planlanır. Redden sonra otomatik tekrar sorulmaz. Kapatma, bekleyen ve teslim edilmiş yalnız oyuna ait bildirimi kaldırır. Devam eden izin yanıtı, arada yapılan kapatma tercihini geri açamaz. Hesap silme akışında bildirim iptali de kontrol edilir; iptal başarısızsa tamamlanmış gibi gizlenmez. APNs, cihaz anahtarı ve yeni sunucu verisi yok.

Simülatörde Türkçe iOS izin penceresinde kabul → açık durum → kapatma doğrulandı. Gerçek bildirim teslimi, saat dilimi/yaz saati değişimi ve sistem ayarından izin kaldırma fiziksel test listesinde açık kaldı.

StoreKit isteği doğal bir dünya bitişinde, en az üç ayrı yerel kullanım gününden sonra yapılabilir. Üç yıldız/olumlu yanıt filtresi, ödül veya özel yıldız formu yok. Bir sürümde bir kez ve en az 120 gün arayla deneme kaydedilir. iOS pencereyi göstermeyebilir; oyunun çağrısı oyuncunun puan verdiği anlamına gelmez. TestFlight'ta görünen mağaza yorumu beklenmez; mağaza sürümündeki gösterim Apple tarafından yönetilir. Kayıt/ödül biçimi değişmedi.
