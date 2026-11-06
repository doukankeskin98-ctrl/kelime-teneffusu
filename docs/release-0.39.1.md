# 0.39.1 · Arena sıralaması sonuç ekranında

Maç bittiğinde maç sıralaması ve oda galibiyetleri aynı stadyum sahnesinde, açık iki bölüm olarak görünür. Oda galibiyetlerinin kapalı ayrıntı alanı kaldırıldı. Bitmiş tahtanın üst ve alt sıralama girişleri aynı sonucu açar; eski ayrı sıralama penceresine dönmez. Aktif maç, önceki sonuç, oda galibiyetleri ve genel derece sıralaması aynı koyu renk/okunaklı satır dilini kullanır. Genel derece ile oda ve maç puanları açıkça ayrılır.

Dörtten kalabalık grupta oyuncunun sıra/puan özeti liste sayfasından bağımsız görünür. Sunucunun sıra değerleri ve eşitlikler aynen korunur; sayfalama oyuncuları düşürmez. İç içe liste kaydırması kaldırıldı. Küçük ekranda yalnız içerik kayar; devam/dönüş düğmeleri görünür kalır. İki oyuncunun maç ve oda sonuçları 414×736 görünümde içeriği kaydırmadan birlikte görünür.

Kayıt, ödül, içerik/tahta, sunucu puanlama, dokunma motoru ve onaylanmış kelime/haptik/sonuç zamanlaması değişmedi. iOS paketi 0.39.1/build24; telefon kurulumu bu teslimde yapılmadı.

Doğrulama:801 otomatik test, tip/içerik kontrolü, değişmeyen şema, web üretim paketi,695 Worker HTTP kontrolü ve mobil paket/senkron denetimi. Arena hedefli yeni testleri: bitmiş tahtadan aynı sonucu açma; aktif sıralamada maç bitişi/tek pencere; açık oda galibiyetleri; ikinci sayfadaki oyuncunun gerçek kişisel sırası; lobide uzun seri listesinin sabit dönüş eylemiyle açılıp kapanması. Mevcut aynı tur/sonraki tur, gecikmiş onay, eşitlik ve kayıt testleri korundu.

Tarayıcıda gerçek Arena bileşeniyle izole, örnek oyunculu yerel önizleme:2/8/16 kişi, eşitlik, uzun ad, ikinci liste sayfası, sonucu kapatıp alt düğmeyle geri açma, yeni tur hazırlığı, canlı ve genel derece sıralaması. Ölçülen CSS görüntüleri414×736 ve321×570; yatay taşma yok, içerik içinde iç içe liste kaydırması yok, kısa ekranda alt eylem görünür. Bu örnekler gerçek çok oyunculu maç veya fiziksel iPhone/FPS doğrulaması değildir. Yerel görseller çalışma alanı world-review/0.39.1 altında, kaynak/yayın paketinin dışındadır.

Bonus turu, bölüm ritmi ve diğer WoW çıkarımları tamamlanmış sayılmadı; kullanıcı isteğiyle docs/wow-follow-ups.md içinde sonraki işler olarak saklandı. Yayın ve GitHub CI makbuzu kaynak dışında tutulur.
