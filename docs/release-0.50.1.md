# 0.50.1 · İçerik kabulü, kayıt koruması ve telefon yerleşimi

13 Kasım 2026. 312 bölüm / 52 rota; iOS paket 41. Fiziksel iPhone testi kullanıcı isteğiyle sonraya bırakıldı.

## Değişenler

- Ana kopyadaki `node_modules` artık Claude denemesine sembolik bağ değil. Kilit dosyasıyla bağımsız kuruldu; deneme klasörü silinse de bu kurulum ona ihtiyaç duymaz.
- Yeni içerik için yakın kopya taraması: en az üç ortak hedef, küçük kümenin en az %75'i. Editör ve sunucunun preview/save/publish yolları aynı kontrolü kullanır. Ana kataloğun kabulü ayrıca geçmiş hedef oranı, 12 bölüm tekrar mesafesi, altılı rota yükü ve kayıt payını denetler.
- 312 yayımlanmış bölümün kimliği/sırası/içeriği/asıl tahtası/oynanan güvenli tahtası SHA-256 manifestiyle sabitlendi. Mevcut yakın kopyalar ve zorluk borcu açık raporlanır; testler bunları düzelmiş göstermez. Ana içerik genişlemesi kayıpsız küçültme ve en az 64 KB pay sağlanana kadar kapalıdır.
- Sırf rota sonuna gelindi diye gösterilen “Ustalık” etiketi kaldırıldı. Gerçekten açık hedefler Keşif, tanımlı hedefler Bilmece, gizlemeli hedefler Saklı kelime olarak gösterilir. Bulmacanın gerçek zorluğu bu etiketle değişmez.
- Kış ve çiftlik için iki özgün sahne; diğer yeni rotalar daha uygun mevcut sahnelere bağlandı. Ev/sofra sıcak iç mekânı, gökyüzü gözlemevini kullanır. Görsel eşlemesi bulmaca `themeId` değerinden ayrıdır; kayıt/tohum/koordinatlar değişmez. Ana ekran, harita, oyun, sonuç, albüm, bonus ve ayar arka planı aynı eşlemeyi kullanır. Her rotaya ayrı illüstrasyon üretildiği iddia edilmez.
- Normal kelime seçme satırları ve düğmeleri gerçek 44px yüksekliğe çıktı. Kısa telefonlardaki yoğun eski tahtalarda numara/konu tek başlık alanına alındı; girişte başlık yalnız saydamlıkla gelir, hedef düğmelerinin üstüne kaymaz. 5. bölümde 320px genişlikte hücre 31,5px; önceki 0.50.0 kanıtındaki yaklaşık31,1px korunuyor.
- Arena bilmece yuvaları cevap uzunluğuna göre baştan sabit genişlik ayırır. Kısa hedefler boş üçüncü satır yaratmaz; cevap açılınca komşu hedefler yer değiştirmez. İncelenen yedi hedefli örnekte 320×568'de hücre yaklaşık25,9→31,0px.
- Bulut kaydı UTF-8 byte sınırı birleşmeden önce ve sonra, veritabanına yazmadan denetlenir. Sınır aşılırsa sağlam mevcut kayıt ve revision değişmez. Bozuk/aşırı büyük saklı satır boş ilerleme diye döndürülmez. Bu önleyici korumadır; mevcut oyuncuda doğrulanmış kayıp bulunmadı. Şema v2 aynı, veri göçü yok.

## Kanıt

- 940 test / 171 grup; tip ve içerik denetimleri geçti. Yeni bulut testleri iki sahibin kayıtlarını/revizyonlarını sınırda aynen korur; bozuk satırın sonraki yazıda ezilmediğini ve UTF-8 hesabını kontrol eder. Küçük test bütçesi yalnız sınır senaryosudur; gerçek256.000 sınırı artırılamaz.
- İçerik denetimi: 535 güvenli görünüm, 417 içerik tahtası, 8.340 alternatif yerleşim; 96 Arena, 40 Sprint ve45 gelecek günlük örneği. Yakın kopya kuralı bütün yayımlı içeriğe geriye dönük uygulandı; beş ana bölüm yakın kopya eşiğini aşıyor. 52 rota yeni, daha katı eğri sözleşmesi için editoryal inceleme istiyor. Bu, hepsinin oynanamaz olduğu veya düzeltildiği anlamına gelmez.
- Birleşik sentetik kayıt239.751/256.000 byte, kalan16.249. Gerçek oyuncu kaydı değil; 511 eski/yeni/alias kayıt, 3660 günlük tarih, 2100'e kadar haftalık hatıra ve52 bonus içerir. Önceki daha dar stresin üstüne bonuslar da eklenmiştir.
- 312 ana bölümün tamamı gerçek tarayıcıda320×568 CSS viewportta ölçüldü: taşma, kelime kırpılması, bölünme, düğme/tahta çakışması0. En küçük hücre29,91px (yaklaşık30). Bu teknik ölçü parmak rahatlığı/FPS kabulü değildir. 12 temsilî bölüm375×667, altı bölüm414×736: sorun0; en küçük hücre35,41 ve39,41px.
- Arena'nın gerçek ortak oyun bileşenleri yerel sentetik ekranla normal/bilmeceli halde denendi. Normal34,34px; bilmece31,01px. KANEPE sürüklenerek bulundu, hedef yuvaları ve tahta ölçüsü onaydan sonra birebir sabit kaldı. Bu canlı çok oyunculu test değildir.
- Bölüm312'de dört kelime sürüklenerek bulundu; sonuç ve albüm küçük resmi aynı kış sahnesini gösterdi. Onay, final ve üç yıldız görüntülendi. Kalıcı kullanıcı verisi yerine bağımsız alıştırma durumu kullanıldı.
- Web/çevrimdışı derleme, Safari12 sözdizimi denetimi,724 izole Worker HTTP kontrolü, iOS0.50.1(41) paket/48 dosya eşliği geçti. Paket kontrolü artık rota sahnelerini de içeriyor;18 benzersiz dünya sahnesi (önceki rapor aynı görsellerin tema tekrarlarını da sayıyordu). Veritabanı şeması değişmedi.
- Lint borcu428 hata/162 uyarı; artış0. Tasarım statik taraması bulgu0. Mobil büyük parça uyarısı sürüyor; eşiği yükseltilmedi.
- Yerel kanıt: `../world-review.nosync/0.50.1-quality/`. Fiziksel iPhone, VoiceOver, düşük güç/FPS, Game Center oturumu ve birden çok gerçek cihazla Arena doğrulanmadı. Ambiyans geri eklenmedi.

## Bilerek ayrı bırakılan adım

Mevcut120 yeni bölümün gerçek zorluğu ve kelime tekrarları bu sürümde yeniden yazılmadı. Önceden istenen onaylı geriye uyumluluk sınırı için somut plan: [İçerik revizyonu ve kayıpsız kayıt geçişi](content-revision-plan-0501.md). Plan çift okuyucu, oyuncu başına gölge dönüşüm, eski çevrimdışı istemci, ödül tekilleştirme ve uyumlu geri dönüş paketini kapsar. Onaylanmadan v3 yazıcı veya rev2 bulmaca açılmadı.

## Geri dönüş

Başlangıç0.50.0 kaynak `b782b9845708cf8e4b47010ec70339f1846504fb`, ağaç `092e57951ce267ff4e6794ec26606e75c59b8eb1`. `before-0.50.0.bundle` doğrulandı. Sites103: `appgprj_6ad7c9366ae88191a67ce62cdf26ab43~appgver_0483c3a4b47c81918d22994261b7fc09`. Bu sürüm yeni kayıt veya bölüm kimliği eklemez;0.50.0 ile v2 ilerleme uyumludur. Oyuncu veritabanı/cihaz kaydı yedeğe geri alınmaz. Daha eski192 bölümlü sürümlere kör geri dönüş yapılmaz.
