# Kelime Teneffüsü: ürün ve kalite incelemesi

21 Ekim 2026 · Kaynak sürümü 0.5.1 · İnceleme tabanı 0.5.0

Oyunun güçlü yönü, Türkçe kelime keşfini sakin bir defter estetiğiyle ve gerçek arkadaş rekabetiyle birleştirmesi. Öncelik, bu kimliği daha anlaşılır ve güvenilir hale getirmek. Yeni mod sayısını artırmak yerine ilk kelimeyi bulma, ara verip dönme, sıradaki bölümü seçme ve arkadaşla buluşma akışları iyileştirildi.

Bu inceleme kaynak kodu, stil kuralları, içerik doğrulaması, otomatik servis testleri ve üretim Worker paketi üzerinden yapılmıştır. Fiziksel telefon, tarayıcı ekran görüntüsü, gerçek oyuncu gözlemi veya üretim yük testi yerine geçmez. “Dünya standartları” bir pazarlama iddiası olarak onaylanmış değildir; aşağıdaki ölçülebilir çıkış ölçütleriyle takip edilecek kalite hedefidir.

## Bu sürümde düzeltilen somut sorunlar

| Alan | Bulgu | Uygulanan değişiklik |
| --- | --- | --- |
| Kayıt güvenliği | Hesabı açık oyuncunun yerel kaydı sekiz saniyelik eşitleme döngüsüne bağlıydı. Erken kapanış son ilerlemeyi kaybettirebilirdi. | Her ilerleme değişiminde hesap anahtarına anında yerel yazım; ağ eşitlemesi ayrı. Sayfa gizlenirken veya kapanırken uygun boyutta son gönderim denemesi. Tarayıcı kapanış gönderimi garanti sayılmaz; esas koruma yerel kayıttır. |
| Hesap ve eşzamanlılık | Geç gelen istekler ve PUT sürerken bulunan kelimeler için istemci yaşam döngüsü ayrıca korunmalıydı. | Hesaba bağlı, iptal edilebilir eşitleme oturumu; eski oturum yanıtlarını yok sayma; sunucu yanıtını en güncel yerel ilerlemeyle birleştirme. Yeni kelimeler sunucuda onaylanmadan “kaydedildi” gösterilmez. |
| Ayarlar | İlk bulut okuması sırasında yapılan yeni bir renk/erişilebilirlik seçimi eski tercihle değişebilirdi. | Yükleme sırasında değiştirilen tercihler korunur; el değmemiş tercihler yeni cihazda hesaptan alınır. |
| Ana sayfa | Tamamlanmış son bölüm de “kaldığım yerden” yönlendirmesi alabiliyordu. | Gerçek yarım kalan bölüm, sıradaki tamamlanmamış bölüm ve tekrar oynama ayrılır. Başlık, tema ve varsa bulunan kelime sayısı gösterilir. Tamamlanan haritanın ardından standart içerik önerilir. |
| Okunabilirlik | Bazı mobil yardımcı etiketler çok küçük veya açık renkliydi; ilgili son CSS kuralları ekranlara göre farklılaşıyordu. | Açıklama, kelime etiketi, ayar ve sonuç metinleri büyütüldü; ikincil renkler koyulaştırıldı. Ana düğme ve simge kontrolleri en az 44 CSS piksel hedefe taşındı. Her tahta hücresi bu ölçüde değildir; büyük harf modu 46 piksel hücre sunar. |
| Seçim geri bildirimi | İki dokunuşla seçimde başlangıç noktası, büyük harf modunda ise kaydırma ile seçim arasındaki fark yeterince açık değildi. | Seçimin iki ucuna halka, seçilen harf sayısına görünür sayaç, büyütülmüş tahtaya uygun iki uca dokunma açıklaması eklendi. Sekiz yönlü seçim matematiği korundu. |
| Sonuç ve kişisel başarı | Sonuç özeti tek cümlede kalıyordu. Gizli Tema tekrarlarında aynı yıldızla daha yavaş süre eski en iyi süreyi değiştirebiliyordu. | Süre, bulunan kelime ve ipucu özeti; gerçekten iyileşen solo sonuçta kişisel en iyi bildirimi. Gizli Tema aynı en iyi sonuç korumasını kullanır. |
| Hata ve geri dönüş | Sıralama hatası yeniden deneme sunmuyordu. Bekleme odasından çıkış başarısız olsa da antrenman açılabiliyordu. Modal içindeki boşluğa dokunmak pencereyi kapatabiliyordu. | Sıralama için yeniden dene; odadan çıkış onaylandıktan sonra antrenmana geçiş; modalı yalnızca dış alan tıklamasıyla kapatma. |

## A'dan Z'ye değerlendirme ve sıradaki kalite eşiği

| Alan | Mevcut temel / bu incelemenin sonucu | Sonraki somut doğrulama |
| --- | --- | --- |
| Sanat yönetimi | Krem, orman yeşili, adaçayı ve bal tonları; özgün SVG sahneler ve defter dili tutarlı bir kimlik oluşturuyor. | Gerçek 320, 360, 390 ve 430 CSS piksel ekranlarda metin, görsel, taşma ve uzun Türkçe ad kontrolü. Yeni görseller ancak içerik boşluğu varsa üretilmeli. |
| Bilgi hiyerarşisi | Ana sayfada tek açık devam önerisi; tema, rota ve rekabet ayrı bağlamlarda. | İlk beş oyuncunun yardım almadan sıradaki bölümü bulup bulamadığını gözle; ilk ekranda hâlâ fazla seçenek varsa ikincil alanları daralt. |
| İlk deneyim | Oynanabilir 6 × 6 öğretici, cezasız yanlış seçim, çaprazlar ve iki uca dokunma zaten mevcut. | Oyuncunun ilk kelimeyi ne kadar sürede bulduğu ve öğreticiden neden ayrıldığı. Hedefleri veri gelmeden başarı oranı gibi sunma. |
| Dokunma ve akıcılık | Pointer Events, kareye hizalanan seçim çizgisi, büyük harf modu ve klavye desteği var. | Düşük güçlü Android ve iPhone'da çapraz sürükleme, uzun kelime, ekran döndürme ve arka plandan dönüş. Girdi gecikmesi ve kare sürelerini cihazda ölç. |
| Zorluk ve içerik | 16 tema, 96 standart bölüm; 15 rota, üç bonus ve altı Gizli Tema. Her tahtanın hedefleri ve çapraz yerleşimleri otomatik sınanıyor. | Editoryal Türkçe kontrolü, tema başına kelime çeşitliliği ve oyuncunun zorlandığı bölüm verisi. Üretim doğruluğu, eğlenceli zorluk eğrisi kanıtı değildir. |
| İlerleme ve ödüller | Kazanılan dünya, bonus ve koleksiyon parçaları kalıcı. Tekrar oyun daha iyi sonucu koruyor; solo ilerleme Arena derecesi vermiyor. | Yeni bölüm sonrası açılan ödülün oyuncu tarafından anlaşılması. Kaçırılan gün cezası, zorunlu bekleme veya uykuyu engelleyen baskı ekleme. |
| Arena ve sosyal | Gerçek iki kişilik sunucu doğrulamalı düello, özel oda, Elo, rövanş, arkadaş kabulü ve kayıtlı performans mevcut. | İki gerçek cihaz, zayıf ağ, terk etme, yeniden bağlanma ve paylaşım uygulamasından dönüş. Gerçek trafik olmadan kapasite veya eşleştirme süresi iddiası yapma. |
| Çevrimiçi ölçek | D1 üzerinde 650 ms sürüm kontrolü yapan SSE, mevcut çalışma modeli. | Eşzamanlı oda sayısına göre gecikme, veritabanı isteği ve maliyet ölç. Mimariyi ancak ölçülen darboğaz gerekliyse değiştir. |
| Kimlik ve kayıt | Hesaba özel bulut kayıtları; korunmuş misafir oturumu; ChatGPT girişi. | Firebase e-posta ortamı henüz bağlı değil. Bağlandığında gerçek doğrulama e-postası, sıfırlama, çakışan ad ve cihaz değişimi uçtan uca sınanmalı. |
| Erişilebilirlik | Kontrast, büyük harf, azaltılmış hareket, isteğe bağlı ses/titreşim ve klavye var. Bu sürüm okuma ve kontrol boyutlarını iyileştiriyor. | VoiceOver/TalkBack, büyük sistem yazısı, odak sırası, yalnızca renge dayanmayan durumlar ve tüm ekranların kontrast kontrolü. Tam WCAG uygunluğu iddia edilmez. |
| PWA ve çevrimdışı | İlk indirmeden sonra solo oyun açılabilir; API ve kimlik cevapları önbelleğe alınmaz. | iOS ana ekran kurulumu, yarım indirme, güncelleme sırasında oyun, depolama kısıtı ve uçak modu. |
| Güvenlik ve adalet | Sunucu yetkisi, istek sınırları, güvenli cookie, yönetici yetkisi ve eşzamanlı sonuç kontrolleri testlerde var. | Üretimde kötüye kullanım sinyalleri ve otomatik çözücü davranışlarının incelenmesi. Mevcut doğrulamalar tam hile önleme garantisi değildir. |
| Yönetim ve yayın | Yayınlanan içerik değişmez; taslak, önizleme, arşiv, geri alma ve denetim günlüğü mevcut. | Yedekten geri yükleme tatbikatı, hata bildirimi sahipliği ve günlük bölümün editoryal kalite kontrolü. Kaynak sürümü geri alma, oyuncu veritabanını geri sarma anlamına gelmez. |
| Ölçüm ve gizlilik | Analitik isteğe bağlı ve varsayılan kapalı; gerçek toplu veriler gösterilir. | İzinli ilk kelime süresi, bitirme, hatalı seçim, yeniden bağlanma ve geri dönüş metriklerini yeterli örneklemle yorumla. Küçük sayıdan başarı yüzdesi çıkarma. |
| Paylaşım ve ticari hazırlık | Paylaşılabilir oyun ve oda bağlantıları, PWA simgeleri ve paylaşım kartı var. | Gerçek mesajlaşma uygulamalarında kart/davet kontrolü; ticari kampanyadan önce kullanılan tema ve karakterler için izin değerlendirmesi. Gelir özelliklerinden önce çekirdek deneyimi doğrula. |

## Doğrulama kapsamı

- 16 yeni regresyon senaryosu: hemen yerel kayıt, çevrimdışı yeniden açılış, ağ hatası, eski hesabın geç yanıtı, PUT sırasında ilerleme, depolama hatası, tercih koruma, bölüm yönlendirme ve en iyi sonuçlar.
- Önceki 61 testle birlikte 77 test; bunların içinde 4.800 standart ve 1.200 klasik tahta yerleşimi, sunucu, yetki, oda ve yönetim senaryoları var.
- Ayrı içerik kontrolü: 24 düzenlenmiş tahta ve 480 alternatif yerleşim.
- TypeScript kontrolü, üretim derlemesi ve ayrı test veritabanında Worker HTTP doğrulaması yayın kapılarıdır. GitHub CI aynı kontrolleri kaynak değişikliği üzerinde çalıştırır.
- Belirli düz renk çiftleri hesaplandı: `#526548 / #fbfaf1` 6,05:1; `#5b6d50 / #fbfaf1` 5,35:1; `#4e643f / #f2f5e8` 5,90:1; `#65715b / #fffef8` 5,11:1. Bunlar tüm sayfa, resim üstü yazı veya durum kombinasyonlarının görsel denetimi değildir.
- Bu ortamda control-browser becerisi bulunmadığından fiziksel cihaz/tarayıcı görsel testi yapılmadı. 60 FPS ve dokunma gecikmesi ölçülmüş sonuç olarak sunulmaz.

## Sonraki geliştirme sırası

1. **Gerçek cihaz doğrulaması:** iPhone Safari/PWA, Android Chrome ve düşük güçlü Android; 200% metin, yatay ekran, büyük harf ve çapraz seçim. Gözlenen taşma veya yanlış seçimi önce düzelt.
2. **İlk oyuncu gözlemi:** önce beş kişiyle öğretici, ilk rota, kaldığı yere dönüş ve davet; ardından 20–30 kişilik küçük grup. Bu sayılar araştırma aşaması önerisidir, istatistiksel başarı kanıtı değildir.
3. **E-posta üyeliği ve operasyon:** kimlik sağlayıcısı hazır olduğunda gerçek e-posta akışı; ardından kurtarma tatbikatı ve yük ölçümü.
4. **Veriye göre içerik:** günlük iki bölüm için yazım, tekrar, çapraz ve zorluk kontrolünü koru. Her bakım turunda yalnızca kanıtlanmış bir sürtünmeyi veya küçük bir içerik boşluğunu hedefle.

Bu turda yeni kütüphane, yapay zekâ görsel üretimi, veri şeması değişikliği veya yeni oyun modu eklenmedi. Mevcut kayıt anahtarları, klasik Hababam tahtaları, kazanılmış ödüller ve rekabet kuralları korundu. Bakım görevi bu incelemeyi kalıcı kontrol listesi olarak kullanabilir; tamamlanmış kontroller ancak kod değişikliği, hata veya yeni risk olduğunda tekrarlanmalı.

## Referans alınan birincil kaynaklar

- [Supercell: UI/UX artist's story](https://supercell.com/en/news/job-uiux-artists-story/): anlamlı küçük animasyonlar, sınırlı seçenekler ve mobil girdide performans. Buradan çıkan tercih, mevcut kimliği koruyup etkileşimdeki sürtünmeleri düzeltmektir.
- [Microsoft Xbox Accessibility Guideline 101](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101): metin okunabilirliği ve ölçekleme. Fiziksel piksel ölçütleri doğrudan CSS pikseli kabul edilmedi.
- [Microsoft Xbox Accessibility Guideline 102](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/102): önemli metin ve arayüz öğeleri için kontrast.
- [W3C WCAG 2.2: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): 44 × 44 CSS piksel dokunma hedefi ve istisnaları. Bu boyutun bazı kontrollere uygulanması tüm oyuna AAA sertifikası vermez.

Kaynaklar 21 Ekim 2026 tarihinde incelendi. Bu kaynaklar oyun için tasarım gerekçesi sağlar; gerçek kullanıcı testlerinin yerini tutmaz.
