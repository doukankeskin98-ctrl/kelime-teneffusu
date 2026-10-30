# Keşif Haritası

Harita mevcut on beş rota bölümünü tek bir ilerleme yolunda birleştirir. Sıra: Yıldız İskelesi (Uzay), Anadolu Patikası (Türkiye), Teneffüs Bahçesi (Hababam). İlk dünya açıktır. Bir dünyadaki üç farklı rota bölümünü tamamlamak sonrakini, beşini tamamlamak o dünyanın yeni bonus bölümünü açar. Herhangi bir yıldız sayısı veya hız şartı aranmaz; ipuçlarıyla tamamlamak da geçerlidir.

Her rota bölümünün belirli bir koleksiyon parçası vardır. Beş ana bölüm ve bir bonus, altı parçalık sahneyi oluşturur. Harita, bir sonraki parçanın adını ve tam açılış koşulunu gösterir. Kazanımlar doğrulanmış `Progress.saves` üzerinden türetilir. Ayrı ödül talebi, tüketilebilir anahtar, günlük sıfırlanan ödül veya tekrar oynayarak çoğaltılabilen bir bakiye yoktur.

## Uyumluluk

- Eski 96 standart bölüm, 15 rota bölümü, altı Gizli Tema ve klasik Hababam oyunu korunur. Mevcut tema seçicisinde bölüm kilidi eklenmez.
- Haritanın beşli bölüm kümeleri sabit kimliklerle tanımlıdır. Aynı temaya daha sonra eklenen içerik bu kümeleri büyütmez; kazanılmış dünya ve bonus açılışlarını geri kilitlemez.
- Eski bir rotaya daha önce başlamış oyuncu o dünyaya haritadan da erişebilir. Eski tamamlamalar parçalarını otomatik verir. Beş bölümün rota hatırası korunur; yeni altıncı parça ek bir bonus hedeftir.
- Yeni bonuslar `JOURNEY_BONUSES` içindedir. Kimlikleri `uzay-gozlemevi`, `turkiye-kartpostal`, `hababam-yillik`; kayıt anahtarları `route:<id>` olarak kalır. Kaynakta bu kimlikleri veya yayımlanmış bulmacaların kelimelerini/tohumlarını değiştirmeyin.
- `PLAYABLE_JOURNEYS`, değişmeyen `ALL_JOURNEYS` ana atlası ve 32 yeni isteğe bağlı İpucu Avı bölümünü kayıt doğrulamasına dahil eder. Yeni bölümler ana sıra, beşli kümeler ve altılı albümlere eklenmez. Eski `Progress.v = 2` biçimi, yerel anahtarlar ve bulut birleştirme sürer. Veritabanı göçü gerekmez.
- Tekrar oyununda mevcut en iyi yıldız/süre korunur. Aynı parçanın yeniden kazanıldığı söylenmez. Bölüm sonu ekranı o oyunda gerçekten yeni açılan parça, dünya, bonus ve tamamlanan sahneyi gösterir.
- Solo açılışlar sunucu rekabet derecesine katkı yapmaz. Haritadaki kilitler bu ek yolculuğun sunumudur; bir hile önleme veya hesap yetkilendirme sınırı değildir.

## Denetim ve geliştirme

`lib/game/discovery.ts` saf ilerleme/ödül kurallarını, `components/game/Discovery.tsx` haritayı, parçalı sahneleri, albümleri ve sonuç kartlarını içerir. Görseller özgün SVG'dir; raster görsel veya ek çalışma zamanı bağımlılığı eklenmez. Dar ekran düzeni, büyük dokunma alanları, klavye odağı, metinli kilit koşulları ve yüksek kontrast desteği vardır. Geri dönüş harita bölümüne götürür; otomatik sonraki oyun başlatılmaz.

`tests/discovery.test.ts` eşik açılışlarını, ipuçlu tamamlamaları, eski kayıtları, tekrar ödülü olmamasını, en iyi sonucu ve iki cihazın bulut birleşimini sınar. İçerik denetimi üç yeni bonusu da yerleştirir. Üretim Worker HTTP kontrolü haritanın sunucu çıktısını ve bonus kayıtlarının sunucuda doğrulanıp sahibine özel saklandığını doğrular. Bunlar gerçek telefon/tarayıcı etkileşim testinin yerine geçmez.

Bu paket harita, belirli ödüller, koleksiyon sahneleri ve üç bonus bölümünü kapsar. Çok aşamalı final bulmacaları, döşenebilir kişisel oda ve arkadaşla ortak bulmaca bu pakette uygulanmadı.

Bağlı bakım görevi 08.00 ve 20.00 UTC için etkindir. Her UTC tarihi için iki yeni bölüm hedefler; bakım ve iyileştirme iki çalışmada da yapılır. Görevin kaydedilmiş olması her çalışmanın başarıyla tamamlandığı anlamına gelmez. Düzenli içerik eklerken mevcut harita kimliklerini ve kazanımları koruyun, başarılı yayından önce aynı tarihli bölümleri yeniden üretmeyin.

## Tarihli keşif damgaları

0.7.0 ile günlük kaynak çiftlerine ayrı, kalıcı bir hatıra eklenir. Her UTC tarihinin yalnız sabit 1 ve 2 numaralı bölümünü tamamlamak o tarihin damgasını açar. Hız, yıldız ve ipucu şartı yok; geçmiş tarihler daha sonra tamamlanabilir. Kazanım mevcut özel `chapter_saves` ve doğrulanmış cihaz kayıtlarından türetilir. Bilinmeyen kayıt kazanılmış veya sıfır gibi sunulmaz. Ayrı talep/bakiye, yeni göç veya tekrarla çoğalan ödül yoktur.

Ana sayfa son çifti, kalıcı arşiv her tarihin bölüm ve damgasını gösterir. Bu sistem yukarıdaki beşli rota kümelerini, dünya açılışlarını ve koleksiyon parçalarını değiştirmez. Daha fazla tarih veya bölüm eklemek önceki damgayı yeniden kilitlemez. 0.7.1 ile oyun sonucu damganın gerçek durumunu ve varsa aynı tarihte kalan keşfi gösterir. Kalan bölüme geçiş oyuncunun seçimiyle olur. Bilinmeyen diğer kayıt ödül sayılmaz; tekrarda aynı damga gösterilir. 0.8.0 ile Albüm sekmesindeki tarihli raf da uygulanır. Kazanılmış hatıralar ve aynı tarihin iki bölümü buradan açılır; bölümden dönüş aynı raf alanına gider. Sayfalama eski tarihleri korur, yalnız yüklenen tarihler gösterilir; bilinmeyen kayıt için ödül veya toplam uydurulmaz.

## 0.11.0: atlasın devamı

İlk üç haritanın arkasına 13 benzersiz temada 78 bölüm eklendi. Toplam 16 harita, 96 bölüm/parça. Yeni bölgeler `lib/game/atlas-content.ts` içinde sürümlenmiş kelime bankası, ipucu metinleri ve parçalarla sabittir. Haritalar 5+1 düzenini ve 3/5 açılış eşiğini korur. Bu sonlu, denetlenmiş bir katalogdur; sınırsız otomatik içerik üretimi iddia edilmez. İlerledikçe bir sonraki harita kendiliğinden açılır. Gelecekte yeni bölgeler sona eklenir; yayımlanmış satırların sırası, kelimeleri ve kimlikleri değiştirilmez.

Fısıltı Ormanı, Tarçın Sokağı, Melodi Koyu, Rüzgâr Limanı, Merak Vadisi, Işık Atölyesi, Kaset Sokağı, Yeşil Tribün, Altın Parke, Perde Adası, Gülüş Mahallesi, Hikâye Meydanı ve Efsane Tepesi yeni rotalardır. Her biri 6–9 hücreli, dört ila altı kelimeli altı bölüm içerir. Üçüncü ve son bölümler İpucu Avı'dır: hedef kelime yerine kısa tanım ve harf sayısı görünür. Cevap bulunduğunda kart kelimeye dönüşür. Normal ipucu ve yıldız kuralları korunur; erişilebilir etiket de bulunmamış cevabı açığa çıkarmaz.

`JOURNEYS` ve `JOURNEY_BONUSES` yeni kayıtları içerir; `ALL_JOURNEYS` üzerinden istemci ve sunucu aynı tahtayı doğrular. Yeni ID biçimi `<theme>-atlas-<1..6>`, kayıt anahtarı yine `route:<id>`. İlk 18 board SHA snapshot testiyle korunur. Bütün mevcut/yeni tamamlamalar ve 3660 günlük geçmiş, mevcut 150000 byte HTTP sınırına sığar. Yeni göç yoktur.

Ana sayfada kişisel kartın hemen altında etkileşimli yol haritası bulunur. Bölüm düğmeleri durum, gerçek yıldız, hedef ve kazanılacak parçayı gösterir. Bütün haritalar penceresi eski ve yeni bölgeleri seçtirir. Sonuç ana eylemi önce aynı haritanın kalan bölümünü, sonra açık sıradaki dünyayı açar; eski üçlü tamamlandığında öneri Fısıltı Ormanı olur. Ödüller aynı doğrulanmış kayıttan türetilir, tekrar kazanılmaz.


## 0.13.0 · Hedefi ve kazanımı aynı yolculukta görmek

Ana kart, oynanacak gerçek önerinin journey kimliğinden parça/konum/albüm/açılış hedefi çıkarır. Aynı bilgi Solo başında görünür. Sonuçta mevcut discoveryRewards ve doğrulanmış saves üzerinden yeni parça/dünya/bonus/albüm; yeni ödül yoksa açık tekrar metni gösterilir. Sonraki hedef mevcut nextJourneyAfter fonksiyonundan gelir, oyuncu eylemi olmadan oyun açılmaz. Standart bölüm, günlük veya tutorial için harita ödülü uydurulmaz. Altılı sahneler ve 3/5/6 kuralları, eski dünyaya erişim istisnası ve tam katalog davranışı değişmez.

Sunum yardımcıları achievement-view ve AchievementLoop içindedir; bunlar kayıt veya ödül yazmaz. SSR ve actual Solo kontrollü kabul testleri hedef eşleşmesini, açılışları, tekrar/rekor ayrımını ve buton callback'lerini kapsar. Kısa hedef listesinde yalnız confirmed grup tamamlamaları vardır; parçalı uzun adlar eski kelime motoruyla kalır. Gerçek cihaz/piksel/odak-kaydırma doğrulaması ayrıca gerekir.


## İnceleme dalı: numaralı ana yolculuk

`main-journey.ts` mevcut 96 kimliği bir kez sıralar; numara yalnız sunumdur. İlk 18 bölüm üç dünyanın içeriklerini öğrenme/mola/ustalık ritmiyle birleştirir; 19–96 mevcut atlas sırasıdır. İlk albüm 10. bölümde, ilk yeni dünyalar 3 ve 7 sonunda açılır. Gerçek eski yarım bölüm devam eder; diğer durumda ilk oynanabilir eksik bölüm seçilir. Daha sonraki bir bölümün bitmiş olması önceki boşlukları doldurmaz. Bütün kayıt anahtarları, tahtalar, 3/5/6 açılışları ve ödül türetimi aynıdır. Sonuçtan devam ilk gerçek eksik bölüme gider. Ana yolculuk sonludur; diğer içerikler Keşfet ve arşivde kalır. Bu dal canlıya yayımlanmadı.
