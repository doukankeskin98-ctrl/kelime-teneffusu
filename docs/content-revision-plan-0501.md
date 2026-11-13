# İçerik ve kayıt geçişi — karar için hazır plan

Durum: 0.50.1'de geçiş uygulanmadı. Bu belge, yayımlanmış kelimeleri/tahtaları ve kayıt biçimini değiştirmeden önce istenen somut plandır. Telefon testi kullanıcı isteğiyle ertelendi.

## Şimdi korunan sözleşme

312 bölümün kimliği, gösterim sırası, başlığı, hedefleri, üretim girdileri, asıl tahtası ve ekranda oynanan güvenli tahtası SHA-256 manifestiyle sabit: `tests/fixtures/journey-0500-quality.json`. `content:check` hem eski manifesti hem yeni editoryal kontrolleri çalıştırır. Mevcut kayıt hâlâ v2; çizim koordinatları ve kazanılmış ödüller aynı. Bir temanın görselini değiştirmek için bulmaca üreten `themeId` değiştirilmiyor.

## Doğrulanan açıklar

- Yeni 120 bölümde 480 hedefin 182'si önceki ana bölümlerde görülmüş (%37,9). Aynı dörtlüyü karşılaştırmak yeterli değildi. Yeni kontrol en az üç ortak hedef ve küçük kümenin en az %75'i aynıysa yakın kopyayı reddeder; bütün geçmişte görülen hedef oranını ve son görülme uzaklığını raporlar.
- Yeni ana bölüm kabulünde en fazla %50 önceden görülmüş hedef ve en az 12 bölüm tekrar aralığı aranır. Başlık-kelime anlam uyumu otomatik güvenlik taramasının yerine geçmez; editör kontrolü gerekir.
- Yeni altılı rota için son iki bölümün ortalama hedef sayısı ilk ikiden en az bir fazla olmalı; rota ortalaması ilk dünyanın hedef/hücre ortalamasının altına düşmemeli; son bölüm çiftinde ters yön, bilmece veya sınırlı gizleme bulunmalı. En fazla bir tamamen gizli, iki baş harfli hedef. Bu ölçüler oyuncu deneyi değil, kabul filtresidir. Okunaklılık ayrı zorunlu koşuldur; küçük harflerle zorluk sağlanmaz.
- Mevcut rotaların bu yeni kurallara uymayan durumları sayı ve kimlikle raporlanır. Eski sorunlara yalnız aynı içerik/tahta özeti ve aynı sorun koduyla izin verilir; yeni sorun veya değişmiş eski içerik sessizce istisna alamaz.
- Eski/yeni/alias toplam 511 kayıt, en uzun saklanan günlük tarihçe, 2100'e kadar haftalık hatıralar ve 52 bonus birlikte doldurulduğunda test kaydı **239.751 / 256.000 bayt**. Kalan **16.249 bayt**. Bu yoğun sentetik senaryodur; gerçek oyuncu verisi veya matematiksel üst sınır değildir. Yeni paket için en az 64 KB boşluk şartı kondu; mevcut v2 bu koşulu karşılamıyor.

## Önerilen içerik revizyonu

1. Her mantıksal bölüm numarası/kimliği sabit kalır. Mevcut içerik `revision:1` olarak kalıcı manifestte tutulur. Yeni tasarım `revision:2` olur; tek bir kimliğin tahtası yerinde ezilmez.
2. Başlanmış bir kayıt, ilk çiziminden itibaren kendi içerik revizyonuna sabitlenir. Yarım kalan rev1 aynı harflerle açılır. Biten bölümün yıldızları, en iyi sonucu, albüm parçası ve haftalık ödülü korunur. Yeni revizyonu yeniden oynamak aynı ödülü ikinci kez vermez.
3. Hiç başlanmamış bölüm, onaylı rev2'yi alabilir. Tamamlanmış bölümlerin geçmişi rev1 olarak görüntülenebilir. İki revizyonun çizimleri birleştirilemez. Sunucu, cihaz sürümünden bağımsız olarak kayıt revizyonunu doğrular.
4. Önce 295–298 için dört taslak: **Yıldızın yapısı** (PLAZMA, ÇEKİRDEK, KÜTLE, BASINÇ, ENERJİ), **Yıldız ışığı** (TAYF, FOTON, DALGA, RENK, PARLAK), **Uzaklık ölçümü** (PARALAKS, AÇI, ÖLÇÜM, MESAFE, KONUM, HESAP), **Yıldızın ömrü** (BULUT, ÇÖKME, FÜZYON, DEV, CÜCE, KALINTI). Bunlar yayın içeriği değildir: günlük Türkçe uygunluğu, önceki sözcükler, 12 bölüm mesafesi, güvenlik, telefon yerleşimi ve oynama süresiyle elenecek adaylardır. Bilimsel kavram yükü gerçek oyuncuyla kontrol edilmeden zorluk diye kabul edilmez.
5. 193–312'yi topluca daha büyük tahtaya çevirmek yerine 20 rota tek tek düzenlenir: 4–5 açık hedefli giriş, 5 hedefli pekiştirme, 5–6 hedefli çapraz/ters arama, kısa tanım turu, 6 hedefli tek gizli hedefli tepe, 5–6 hedefli daha rahat final. Rota ortalaması ve önceki/sonraki rota geçişi ölçülür. Ekstra gizleme ve küçük harfler zorluk aracı olmaz. Somut kabul adayı: hedef sayıları 5, 5, 6, 6, 6, 6; görünür hücre sayıları 49, 56, 64, 72, 81, 72 (ortalama65,67). Mevcut ilk dünyanın ortalamaları5,5 hedef ve65,17 hücre. Bu aday sayısal eşiği sağlar; tema, okunaklılık ve gerçek oynama deneyi geçmeden yayımlanmaz.

## Önerilen kayıpsız kayıt küçültme

- v3'te her çizimde tekrarlanan nesne anahtarları yerine tuple kullan: `[hedefId, başlangıçSatır, başlangıçSütun, bitişSatır, bitişSütun]`. Tamamlanmış kayıtlardaki çizimleri silme; alternatif kabul edilen yollar da korunur. Revizyon bilgisi kaydın yanında tutulur.
- Önce v2 ve v3'ü okuyabilen, fakat yalnız v2 yazan uyumluluk sürümü yayımlanır. Oyuncu başına mevcut ham kayıt korunur; dönüştürülmüş kopya gölge olarak yazılır. Çözülmüş iki kayıt bütün alanlarda eşit olmadan ana kayıt değişmez.
- Ardından hesap başına kontrollü v3 yazımı açılır. Sunucu birleştirmesi yalnız aynı bölüm revizyonları içinde yapılır; en iyi yıldız ve ödül tekilleştirme kuralları aynı kalır. Başka hesabın yedeği okunamaz/aktarılamaz.
- Eski çevrimdışı istemcinin dönüşü: yeni alanları bilmeyen v2 yüklemesi bunları silemez. Sunucu bilinmeyen revizyonları korur; istemciye desteklemediği kayıt revizyonunu uyumlu sürüme geçmeden yazdırmaz. Sadece bayt sınırını büyütmek çözüm değildir.
- Yerel kayıt da önce ayrı geçici anahtara yazılır, okunur ve karşılaştırılır. Anahtar geçişi son adımdır. Kota, kapanma, disk hatası veya yarıda kesilme durumunda eski kayıt kullanılabilir kalır.
- 0.50.1'e doğrudan geri dönmek v3 yazımı açıldıktan sonra güvenli sayılmaz. Geri dönüş paketi bütün 312+ kimlikleri, rev1/rev2 manifestlerini ve çift okuyucuyu içerir. Görünümü/özelliği geri alır; kayıt okuyucusunu geriye almaz.

## Geçiş öncesi zorunlu kanıt

Eski tam ve kısmi kayıt → v3 → eski anlam birebir eşit; çevrimdışı eski/yeni iki cihaz; çakışan revizyonlarda çizimleri karıştırmama; aynı ödülü iki kez vermeme; hesap değişimi; yarıda kapanma ve kota hatası; maksimum alan uzunlukları; sunucu CAS çakışması; geri dönüş paketiyle okuma; güvenlik taraması; küçük ekran ve fiziksel iPhone. Kayıt boyutunda en az 64 KB pay. Geçiş planı onayından sonra önce bu kanıtlar ve geri dönüş paketi hazırlanır, sonra yazıcı açılır.

**Karar gerektiren adım:** Revizyonlu içerik ve v3 kayıpsız kayıt geçişini bu sözleşmeyle uygulamak. 0.50.1 bu geçişi açmaz, yayımlanmış bulmacaları değiştirmez. Gerçek zorluk/tekrar sorunu bu adım tamamlanmadan çözüldü diye raporlanmaz.
