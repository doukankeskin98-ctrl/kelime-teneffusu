# Dünya yenilemesi — oyuncu deneyimi incelemesi

Rol: Oyuncu deneyimi. Kapsam: Home → dünya/bölüm → tahta → sonuç → devam ve Arena lobi/maç/sonuç. Uygulama salt okunur incelendi; yalnız bu günlük yazıldı. Kaynak satırları 0.25.0 başlangıcına aittir. İnceleme cihaz veya tarayıcı ölçümü değildir.

## 1. Dünya bir sahne ve bir devam zinciri olmalı

- Kaynak: `lib/game/main-journey.ts:7–10,29–40`; `components/game/JourneyHome.tsx:19–20,33–39,46`; `components/game/Solo.tsx:124–125`; `lib/game/scene.ts:4–9`.
- Kanıt/etki: İlk 18 küresel bölüm sırası Uzay → Türkiye → Uzay diye dallanıyor. Evde yakın bölüm şeridi de bu küresel diziyi kesiyor. Oyuncunun bir dünyayı bitirdiği hissi, sadece yeni resimlerle oluşamaz. Ayrıca 16 tema şu an beş resim türüne indirgenmiş.
- Öneri: Sabit bölüm kimlikleri ve numaraları korunsun; önerilen devam önce mevcut dünyanın beş ana keşfi ve albüm finalini tamamlasın. Ev, bölüm ve sonuç aynı dünya resmini taşısın. Ev şeridinde o dünyanın altı durağı, bölüm başlığında açık konu ve `Dünya adı · 2/6` konumu gösterilsin. Küresel numara ikincil kimlik olarak kalabilir. Kazanılmış diğer dünyalar haritadan erişilebilir kalsın; yeni dünya açılışı otomatik olarak oyuncuyu mevcut dünyadan koparmasın.
- Kabul: `uzay-3` sonrası varsayılan devam `uzay-4`; erken açılmış Türkiye hâlâ seçilebilir. Beş ana keşfin ardından mevcut gerçek bonus kapısı çalışır. Tamamlanmış dünyanın ardından gidilen yeni dünya sonucu ve sonraki tahtada aynı kimliği taşır. Yarım kalmış gerçek son bölüm önceliğini kaybetmez.
- Öncelik: yüksek etki, yüksek kaynak kanıtı, orta maliyet; kayıt kapılarıyla karıştırılırsa yüksek risk.

## 2. Gizli kelimenin çözülebilirliğini konu ve tutarlı ipucu düzeyi kurmalı

- Kaynak: `lib/game/atlas-content.ts:19–25`; `lib/game/word-card.ts:3–9`; `components/game/common.tsx:40,51–55,63–75`; `components/game/Solo.tsx:53,127,134`.
- Kanıt/etki: Atlas başlıklarının çoğu bütün dünyalarda aynı “İlk adım / Yeni ufuk / Usta kaşif” ifadesi. Kelime tamamen gizlenirse bunlar arama alanını daraltan bir konu sağlamıyor. Baş harf/boş kutu kuralı yalnız ana listeye eklenirse mobil tek hedef kartı, liste diyaloğu, odak düğmesinin erişilebilir adı veya parçalı hedef alt metni cevabı açabilir.
- Öneri: Gerçek mevcut hedeflerden türetilen kısa konu başlığı ekle; örneğin hayvanlar ilk dört kelime için “Evimizin küçük dostları”, ikinci dört için “Vahşi doğa” gibi. Açık → bazı ilk harfler → bazı tam gizli hedefler kademesi sabit bölüm kimliğine bağlı olsun; telefon boyutuna ve o anki hedef sırasına bağlı olmasın. İlk karşılaşmada tek satır kural yeterli; zorunlu yeni öğretici akış gerekmez. Baş harf ve harf sayısı birlikte okunmalı; bulunan cevap kendi yerinde açılmalı. Aynı veri üreticisi bütün görsel ve erişilebilir hedef kopyasını oluşturmalı. Bilmece metni kendi işlevini korumalı, parçalı adlar açıkça birlikte tamamlanmalı.
- Kabul: İlk harfli, tamamen gizli ve bulunmuş hedef için ana raf/mobil kart/tüm hedefler diyaloğu/odak etiketi aynı bilgiyi verir. İlk harfi gizlenen hedef erişilebilir etikette sızmaz. Maskeli kelime açıldığında raf satır sayısı ve tahta konumu sıçramaz. En az bir sonraki dünyada da aynı sistem görülür; yalnız tek özel hikâyede uygulanmaz.
- Öncelik: yüksek etki, yüksek kaynak kanıtı, orta maliyet; yanlış başlık ve maske sızıntısı riski.

## 3. Geçiş ve Arena kalitesini tahtanın alanından yemeden artır

- Kaynak: `components/game/Arena.tsx:64–84`; `components/game/Solo.tsx:61,134–150`; `components/game/SceneArt.tsx:9–10`; `app/board-first.css:3–25`; `app/scenic-journey.css:70–95`; `lib/game/viewport.ts:34–51,78–85`.
- Kanıt/etki: Arena PlayLayout sahne parametresi göndermediği için varsayılan avluya düşüyor; lobi ve sonuç aynı sahneyi devam ettirmiyor. Sonuç ana akışta son kelimeden yalnız 120ms sonra açılıyor. Yeni sürekli başlık/şerit/ödül paneli eklemek, zaten gerçek üst alanı ölçüp tahtayı küçülten yerleşimde yeniden küçük tahta yaratır.
- Öneri: Arena’ya aynı lobi → maç → sonuç sahne kimliği; gerçek hazır oyunculara bağlı açık ana eylem; sonuçta gerçek sıralama ve tek belirgin aynı-oda devam düğmesi. Sıralama/kurallar ikincil diyalogda kalabilir. Normal oyunda son çizgi → kısa parıltı → gerçek albüm halkası/parçası → açık sonraki konu zinciri; animasyon üst katmanda, tıklamayı kapatmadan, azaltılmış hareket tercihinde gecikmesiz çalışsın. Yeni dünya etiketi var olan başlığa sığsın, ayrı kalıcı şerit eklenmesin.
- Kaynak hesabıyla telefon bütçesi (görsel ölçüm değildir): 8px yan boşlukla 360px genişlikte en çok 344px, 414px genişlikte 398px tahta kalır. 360×568 ve 414×622 görünür alanlarda üst/alt 6px ve son 2px hesaba katılınca çerçeve yaklaşık 554/608px olur; tam genişlikte kare için başlık+durum+hedefler+araçlar+aralık toplamı yaklaşık 210px'i aşmamalı. Hedef bütçe: başlık44 + durum34 + hedefler80 + araçlar44 + aralık8 =210px. Arena'nın ayrı skor ve tur/bağlantı satırı 20–30px ekleyebilir; tur bilgisini mevcut başlık/skor alanına birleştirmek yeni süs eklemekten değerlidir. Uzun bilmece büyürse metni kesmek yerine mevcut tek-hedef/tümü akışını koru.
- Kabul: Gerçek mobil önizlemede 360×568 ve 414×622 için tüm tahta kenarları, hedef ve temel araçlar görünür; raf maskeden açık cevaba geçince tahta sıçramaz; sürüklerken kutlama dokunmayı çalmaz. Arena normal ve bilmeceli tur, uzun oyuncu adı, beraberlik ve yeni tur hazır durumu kontrol edilir. Azaltılmış hareket aynı sonucu hemen gösterir. Sonraki düğmesi hâlâ doğrudan anlaşılır, ödül ikinci kez yazılmaz.
- Öncelik: yüksek etki, yüksek kaynak kanıtı, orta maliyet; mobil alan ve gerçek çok oyunculu durumlar doğrulanmazsa yüksek risk.

## Doğrulama sınırı

Bu incelemede tarayıcı açılmadı, otomatik test veya fiziksel iPhone testi yapılmadı. Piksel bütçeleri mevcut kaynak kurallarından hesaplandı; cihaz ölçümü olarak sunulmamalı. Kullanıcı tutma, FPS veya gerçek cihaz dokunma kalitesi ölçülmüş değildir. Uygulama ve yayın koordinatöre bırakıldı.
