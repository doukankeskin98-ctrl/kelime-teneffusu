# 31 Ekim 2026 · Arena oda dışı tekrar incelemesi

Rol: güvenilirlik; salt okunur uygulama incelemesi. Kullanıcı sinyali: aynı oda serisinde çeşitlilik var, çıkıp yeni hızlı eşleşme/özel grup kurunca tanıdık bulmacalar geliyor. İncelenen taban 0.22.0. Kod, canlı veri, hesap veya yayın değiştirilmedi.

## Bulgular ve kabul ölçütleri

1. **Tekil bilmece geçmişi oda sınırında kalıyor.** `lib/game/server.ts:111` yalnız `room.usedRiddleIds` okur, `:119` yine odaya ekler; yeni açık/özel oda kurucuları `:206`/`:224` eski oyuncunun tekil tanımlarını taşımaz. `lib/game/group-content.ts:30` bu diziden kalan tanımları seçer. Beklenen: aynı oyuncu yeni oda açınca daha önce gördüğü tanımların önceliği düşmeli. Mevcut: yeni oda boş tanım geçmişiyle başlar. Yerel bellek içi SQLite/GameService reproduksiyonu: aynı iki kimlikle 12 kez oluştur→hazır→başlat→süreyi bitir→ayrıl, her seferinde yeni GameService; hem friend hem quick akışında 12 farklı tahta ve 24 kalıcı makbuz olmasına rağmen 9. odada ARI/PANDA, 10. odada AYRAN/EKMEK/PİLAV/TAHİN, 11. odada AKOR/DAVUL, 12. odada TÜNEL geri geldi. 84 hedef görünümünde 75 farklı hedef. Kabul: yeni odalar, servis yeniden kuruluşu ve grup→düello→grup dönüşünde bütün katılımcıların önceki hedefleri hesaba katılmalı; yeni profilin boş geçmişi eski oyuncunun geçmişini bastırmamalı.

2. **Büyük kombinasyon sayısı gerçek içerik genişliğiyle aynı değil.** `server.ts:117` ve `db/schema.ts:29` yalnız tam normalize kelime kümesi veya gerçek grid eşitliğini kalıcı engeller. Farklı yedili kümede aynı tekil kelime/tanım tekrarına izin verir. `group-content.ts:11,35` 8×18 = 144 tanımdan çok sayıda kombinasyon çıkarır; yeni tohum/yerleşim oyuncunun tanıdığı cevabı yeni içerik yapmaz. Öneri: eski sabit solo içerik ve aktif snapshotlara dokunmadan ayrı yeni rekabetçi kaynak kütüphanesi; hedef düzeyinde görünme sayısı/son görünümle tercih. Var olan `arena_seen.words_key` makbuzları başlangıç geçmişi olarak hesaba katılmalı. Kabul: eski makbuzlarla başlayan oyuncuda yakın kelime tekrarının azalması, farklı kelime kümeleri ve gridlerin kalıcı korunması; çok oyunculu birleşik geçmişte tükenme politikasının açık ve kontrollü olması; yeni ayrı geçmiş kaydı eklenirse yayınlanan tahta ile aynı atomik işlemde yazılması ve hata halinde cursor/oda/geçmişin birlikte geri alınması.

3. **Oda çıkışı kimlik kaybı değildir; gerçek misafir çıkışı ayrı sınırdır.** `lib/auth/guest.ts:4,7-10` 90 günlük geçerli cookie ile aynı user_id'yi çözer; `app/api/session/route.ts:9` var olan misafiri yeniden yaratmaz. `server.ts:250-255` yalnız oda üyeliğinden ayrılır, auth oturumunu veya arena_seen'i silmez. `guest.ts:21` / session DELETE ise oturumu siler; sonra yeni misafir farklı kimliktir. Bu bugın kanıtı değildir ama vaat sınırıdır. Kabul: normal sayfa yenileme ve oda dönüşünde aynı kimliğin geçmişi korunmalı; farklı hesap/yeni misafir geçmişleri karıştırılmamalı. Yeni cihaz/yeni kimlikte evrensel tekrar etmeme garantisi verilmemeli.

Kaynak sayımı: 315 farklı normal hedef; 1.600.508 altılı veya 4.349.057 yedili kombinasyon. Bilmece tarafı 144 farklı hedef ve 254.592 yedili kombinasyon. Bu sayılar gerçek tekil tanım genişliği ile kombinasyon sayısını ayrı raporlamanın nedenini gösterir; bütün kombinasyonların yerleşebildiği iddiası değildir.

## Seçilen tasarıma dar inceleme

Koordinatörün yeni server-only freshArenaPuzzle, ayrı sürümlü pool ve eski generator/snapshotları koruma yaklaşımı uygundur. arena_seen makbuzlarından aggregate hedef frekansı/son görünüm, önce hiç görülmemiş hedefler, sonra az/eski görülenler; yeterli seçenek varken kişi başına son12maç hedeflerini dışlama. Tam küme/grid ömürboyu engeli ve aynı-start atomik makbuz korunur. Yeni yüzlerce tanım ayrı rekabetçi kaynağa eklenir; solo144 tanım değişmez.

Uygulamada kontrol edilecek üç nokta: SQL json_valid/json_type koruması ve GROUP BY ile küçültülmüş sonuç; son12'nin birleşik grup yerine katılımcı başına hesaplanması. view/canStart tükenme denetiminin eski144havuz yerine yeni geniş havuza bakması. Aynı normalize cevaba yeniID vererek eski room.usedRiddleIds engelini aşmamak. Bunlar tasarım inceleme koşullarıdır, henüz yeni kod arızası değildir.

## Doğrulama sınırı

Reproduksiyon gerçek servis kodu ve göçlerle oluşturulan bellek içi SQLite kullanır; üretim D1, iki fiziksel cihaz veya gerçek sağlayıcı giriş testi değildir. İlk bulgular kaynak ve servis çıktısıyla doğrulandı.

## İlk uygulama incelemesi

`arena-library.ts` kaynak sayımı 630 yeni cevap/tanım, toplam774tanım ve919normalhedef. Otomatik taramada yeni630cevapta 2–8Türkçeharf biçimi, kendi cevabını tam sözcük olarak tanımda söyleme, yinelenen cevap ve yinelenen tanım için sıfır ihlal. `server.ts:118-123` SQL aggregate, katılımcı başına ROW_NUMBER, json_valid+json_type guard kullanıyor. view ve allocate hasFreshRiddles'a geçmiş; usedAnswers eskiID'nin son segmentini alarak eski riddle-v1 cevap engelini koruyor. Mevcut atomic makbuz/CAS/save yolu değiştirilmemiş.

1. **Yayın öncesi düzeltme gerektiren seçim kilidi:** ilk `arena-fresh.ts:22-25` sıralamasında uses→lastSeen belirleyici, ordinal yalnız tam eşitliğin bağıdır. En eski yedi kelime daha önce aynı tam kümede oynandıysa 128ordinal da aynı kümeyi üretir; exact-set engeli bunların tümünü reddeder. Bellek içi servis reproduksiyonu: ilk yedi eski bilmeceyi created1 ile tek makbuza, kalan767tanımı daha yeni tekil makbuzlara ekle (hepsi uses1). Yeni oda start ARENA_CONTENT_UNAVAILABLE/cursor128; yeniden dene aynı hata/cursor256. Saf üreticide128geçerli adayın farklı küme sayısı1. Kabul: unseen/cooldown önceliğini korurken reddedilen tam kümeden sonraki uygun kelimelerle gerçekten yeni kümeye geçmek; çok oynanmış hesapta sonsuz aynı reddedilen kümede kalmamak. Koordinatöre iletildi, düzeltme bekleniyor.

2. **Üç kısa tanım düzeltmesi önerildi:** RADYO (`arena-library.ts:302`) ses dalgası almaz, elektromanyetik yayın alıp sese çevirir; cevabı tanımda söylemeden düzeltilmeli. ÇAP (`:434`) için çemberin iki ucu yerine çember üzerindeki iki noktayı merkezden birleştiren parça denmeli. KORNER (`:606`) kale çizgisi dışına çıkmayı belirtmeli; yalnız top savunandan çıkınca ifadesi taç ile karışır. Bunlar kütüphane genişliği/tekrar mekanizmasını etkilemez ama tanım doğruluğu için iletildi.

Yeni kodda SQL/history/room ID uyumu için başka somut engel bulunmadı. Performans veya üretim kapasitesi ölçülmüş sayılmaz.

## Son dar kabul · seçim kilidi kapandı

Koordinatör düzeltmesi kaynakta kontrol edildi: `freshEntries` ilk adayda frekans/yaş sırasını korur; reddedilen kümeden sonra `variation` ile düşük frekanslı sınırlı aday alanından gerçekten farklı kelimeler seçer. Hiç görülmemiş kelimeler her durumda görülmüşlerin önünde kalır; oda bilmece engeli ve yeterli alternatif varken yakın geçmiş filtresi seçimden önce uygulanır. `allocate` her başarısız adayda variation artırır; kalıcı cursorun ilerlemesi sonraki denemede ordinali de değiştirir. Tam küme/grid engeli ve atomik arena_seen/CAS yolu korunur.

Yalnız `tests/arena-variety.test.ts` yeniden çalıştırıldı: **8/8 geçti**. Özellikle önce bu incelemede iki kez ARENA_CONTENT_UNAVAILABLE üreten oldest-seven makbuz senaryosu, gerçek GameService regresyonunda active duruma geçti, ordinal>0 ve eski kümeden farklı yedi kelime verdi; yeni kalıcı makbuz da yazıldı. Aynı dosyada54yenioda/grup-düello geçişinde372farklı hedef,919hedefin geçerli tahtalarda yerleşimi, eski makbuz/katılımcı geçmişi, bozuk JSON ve eski144tanım uyumu geçiyor. Bu tur geniş test paketi tekrar edilmedi.

RADYO, ÇAP ve KORNER tanımları önerilen anlam düzeltmeleriyle güncellendi; cevap sızdırmama kontrolü de geçti. **Bu sınırlı inceleme kapsamındaki yayın engeli kapandı; açık somut engel kalmadı.** Gerçek cihaz, üretim D1 yükü veya kullanıcı tutma ölçümü yapılmış sayılmaz.
