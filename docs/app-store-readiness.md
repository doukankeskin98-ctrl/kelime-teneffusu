# App Store hazırlığı — 14 Kasım 2026

Çalışma paketi: **0.52.0 / iOS yapı 43**. Son yayımlanan taban: 0.51.0 (`be10b96`, Sites v105). Güncel yayın makbuzu ayrı tutulur. Bu belge bir mağaza kabulü veya hukuki uygunluk garantisi değildir.

## Kesinleşen ürün kararları

İlk paket **reklamsız, satın almasız, genel kitleye yönelik**. Mevcut `https://kelime-teneffusu.healica.chatgpt.site` adresi korunur. Yeni izleme SDK'sı yok. Ambiyans/müzik yok. 312 yayımlanmış bölüm / 52 rota korunur. Altı rev2 taslağı kapalıdır; kayıt v3 yazıcısı açılmadı. Apple Developer, yayıncı kimliği ve destek adresi kullanıcı kararıyla şimdilik atlandı. Tekrar kimlik bilgisi istemeyin; sahte değerle gönderim yapmayın.

## Gönderimi engelleyen açık işler

1. Aktif Apple Developer üyeliği, doğru Team ID, App Store Connect uygulama kaydı ve dağıtım imzası. Simülatör `.app` paketi TestFlight `.ipa` değildir.
2. Gerçek yayıncı/veri sorumlusu, takip edilen destek kanalı, moderasyon sorumlusu ve yanıt süresi; gizlilik/saklama/sağlayıcı listesi hukuki kontrolü. Yerel rapor kopyalamak çalışan destek kanalı değildir.
3. Soğuk açılış kabulü: simülatörde beyaz parlama yok, fakat uzun siyah sistem geçişinin nedeni doğrulanamadı; alanı dar test makinesi dışında tekrar ölçülmeli. Fiziksel iPhone kabulü: kayıt devamı, çizim/yön değiştirme, ses ve sessiz anahtarı, titreşim, arka plan dönüşü, VoiceOver, çevrimdışı oyun, iki cihazlı Arena. Kullanıcı bu adımı erteledi; doğrulanmış sayılmadı.
4. Son dağıtım arşivinin Validate App, birleşik Privacy Report, sembol dosyaları, destek/gizlilik URL'leri, yaş anketi ve gerçek hesap silme denemesi.
5. Son native paketten mağaza ekran görüntüleri. Tek K ikonu kullanıcı tarafından seçildi ve uygulandı; altı gerçek tarayıcı görüntüsü 1290×2796 taslak olarak hazır, fiziksel cihaz görüntüsü değildir.

## Apple kuralları ve kanıt ayrımı

| Başlık | Bu oyun için kontrol |
|---|---|
| 2.1 / 1.5 | Tam çalışan paket, erişilebilir sunucu ve gerçek destek iletişimi. Hesapsız yolculuk ile misafir Arena incelenebilir olmalı. |
| 1.2 | Oyuncu adları: filtre, bildir/engelle, gerçek moderasyon ve iletişim. Kodun bulunması işletilen moderasyon kanıtı değildir. |
| 4.2 | Oyuna özgü değer ve akış; yerel HTML select/details kullanılması tek başına yasak değildir. Gereksiz kontrol değişimi yerine kullanılabilirlik doğrulanır. |
| 4.8 | Son pakette sunulan üçüncü taraf girişleri ve istisnalar birlikte değerlendirilir; native'de ChatGPT giriş düğmesi saklı. E-posta/misafir akışı otomatik ihlal sayılmaz. |
| 5.1.1 | Uygulama ve metadata içinde erişilebilir politika, doğru veri beyanı, misafir dahil hesap silme ve sağlayıcıda tamamlanma. |
| 5.2 | WoW'dan görsel/ses/marka kopyalanmadı. Efektlerin CC0 kaynak kaydı pakette. |

Kaynak: [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/). Bu tablo yaklaşık gereksinim özeti; son gönderimde maddelerin bütünü tekrar kontrol edilir.

14 Kasım doğrulaması: yükleme için Xcode26+/iOS26 SDK+; minimum destek hedefi iOS13+. Proje hedefi15; kullanılan Xcode27.2/iOS27.2 simülatör derlemesi dağıtım arşivi değildir. Genel kitle otomatik4+ veya Kids Category demek değildir. Yaş anketinin güncel sosyal özellik soruları cevaplanır; 16 Kasım'daki Shared Location ve Dating/Relationships alanları dahil güncel form kullanılmalı; duyurulan son tarih12Ocak2027. [Apple gereksinimleri](https://developer.apple.com/news/upcoming-requirements/), [yaş anketi](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/).

## App Privacy beyan taslağı

Aşağıdaki tablo kaynak incelemesidir; App Store Connect'e gönderilmedi. Son archive'ın uygulama+Capacitor+eklentilerin `.xcprivacy` dosyalarını birleştiren raporuyla ve gerçek ağ akışıyla karşılaştırılmalı.

| Veri | Kaynak/amaç | Kimlikle ilişkisi | İzleme |
|---|---|---|---|
| Oyuncu adı, hesap/e-posta | Misafir veya isteğe bağlı e-posta hesabı; uygulama işlevi | Evet | Hayır |
| Kullanıcı kimliği | Oturum, kayıt eşitleme, güvenlik | Evet | Hayır |
| Oynanış içeriği | Bölümler, çizgiler, puan, Arena geçmişi/tekrar engeli | Evet | Hayır |
| Sosyal bağlantılar | Arkadaş/engelleme grafiği; Apple Contacts kategorisi yalnız telefon rehberi değildir | Evet | Hayır |
| Bildirim/şikâyet içerikleri | Sunucuya gönderilen moderasyon raporları; Customer Support | Evet | Hayır |
| Ürün etkileşimi ve performans | Kullanıcının isteğe bağlı ölçümü, başlangıçta kapalı | Kaynakta toplu/kimliksiz | Hayır |
| Diğer tanı verisi | İşletim hata sayaçları; ham oyuncu veya parola yazılmaz | Kaynakta toplu | Hayır |
| Destek taslağı | Şu anda yalnız cihazda kopyalanır; gelecekte gönderim açılırsa beyan yenilenir | Sunucuya gönderilmiyor | Hayır |

Reklamsızlık “veri toplanmıyor” anlamına gelmez. Kamera, mikrofon, konum, reklam kimliği ve ATT eklenmedi. Gömülü sağlayıcının sunucu log/saklama davranışı ayrıca kesinleştirilmeli. [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/).

## Türkiye kapsamı

7578 sayılı Kanun'un oyun tanımı çevrimdışı oynanıp internetten dağıtılan oyunu da kapsar. Sosyal ağ hükmündeki15yaş sınırı her kelime oyununa otomatik uygulanmaz. Oyun platformlarına ilişkin derecelendirme ve ebeveyn kontrolü hükümlerinin bu hizmet modeline uygulanışı ayrıca değerlendirilmelidir.100.000 kullanıcı eşiği bütün yükümlülüklerden genel muafiyet değildir. İlgili22–23.maddelerin yürürlüğü1Kasım2026;7590 sonrası yetki atıfları Siber Güvenlik Başkanlığı yönünde güncellenmiştir. İşletmecinin geliştirici/platform/sosyal ağ niteliği, ikincil düzenlemelerin uygulanışı ve KVKK metni **hukuki doğrulama bekliyor**; yalnız App Store derecesi yeterli varsayılmadı.

[7578 resmî TBMM metni](https://cdn.tbmm.gov.tr/KKBSPublicFile/D28/Y4/KanunMetni/9bf93173-7648-4771-ab36-0e45666c423d.htm), [7590 resmî TBMM metni](https://cdn.tbmm.gov.tr/KKBSPublicFile/D28/Y4/KanunMetni/152a9101-15fe-4138-aceb-99a304bb9ec3.htm). Ayrıntılı kaynak sınırları uzman günlüğündedir; açılmayan ikincil mevzuat doğrulanmış sayılmadı.

## Gönderim kontrol sırası

- [ ] Üyelik/Team/Bundle ID `com.kelimeteneffusu.game`, sahiplik ve dağıtım profili.
- [ ] Yayıncı ve destek bilgilerini `store-052/legal-drafts.md` taslağına koy; herkese açık sayfaları aynı domainde yayımla; uygulama bağlantılarını gerçek hedefe bağla.
- [ ] Age Rating/App Privacy/şifreleme sorularını son uygulama ve archive raporuyla doldur.
- [ ] Giriş gerektiren özellikler için süreli inceleme hesabı ya da çalışan misafir akışı; kimlik bilgilerini repoya koyma. Sunucu inceleme boyunca erişilebilir kalsın.
- [ ] İmzalı Release Archive → Organizer Validate → kullanıcı açık yükleme onayı → TestFlight. Dış test için Beta App Review gerekebilir.
- [ ] Fiziksel cihaz beş dakikalık kabulü ve çok cihazlı Arena; başarısız madde açık kalır.
- [ ] Son native paketten altı ekran; Apple'ın mevcut6.9inç kabul ettiği1320×2868 veya1290×2796 dikey ölçülerini gönderim formunda doğrula. iPad hedefi kapalıdır. [Apple ekran görüntüsü ölçüleri](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).
- [ ] TestFlight deneyimi ardından App Store'a ayrı açık onay; yükleme/yayın otomatik değildir.

## İnceleme notu taslağı

“Kelime Teneffüsü Türkçe bir kelime arama oyunudur. Yolculuk çevrimdışı oynanabilir. Arena ve meydan okuma internet bağlantısı ister; Misafir olarak oyna ile deneme profili açılabilir. İlk sürüm reklam, uygulama içi satın alma veya abonelik içermez. Ayarlar → Gizlilik ve hesap bölümünde silme; oyuncu ekranlarında bildir/engelle bulunur. Game Center ve evrensel bağlantılar yalnız son pakette gerçekten aktive edilirse burada belirtilir.”

İnceleme hesabı: **henüz oluşturulmadı**. Gerçek destek adresi: **bekliyor**. Bu boşluklar doldurulmadan paket “gönderime hazır” sayılmaz.
