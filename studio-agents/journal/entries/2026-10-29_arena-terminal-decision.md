# Arena bitiş deneyimi — koordinatör kararı

## Adaylar

- Üretim taramasındaki `/robots.txt` ve `/sitemap.xml` 404 yanıtları: arama görünürlüğü için yararlı, fakat oyun yolculuğunu etkilemiyor.
- Arena bitiş tahtası: `finished` durumu tahtayı `paused` yapıyor; duraklatılmış Board harfleri örttüğü için oyuncu bulduğu kelimeleri ve kalan tahtayı inceleyemiyor.
- Gerçek telefon/sağlayıcı doğrulaması: yüksek öncelikli, ancak destekli önizleme bu çalışmada kullanılamıyor.

## Seçim ve gerekçe

Arena bitiş tahtasını salt okunur inceleme durumuna geçirmek seçildi. Bu, açık öncelik kuyruğundaki doğrulanmış bir ana akış kusuru; oyuncunun sonucunu anlamasını ve rövanşa bilinçli karar vermesini doğrudan etkiliyor. Kapsam, skor, derece, rövanş, kayıt ve oda servislerine dokunmadan arayüz durumuyla sınırlı.

## Kabul ölçütleri

1. Bekleme ve geri sayım sırasında tahta kapalı; etkin düelloda oynanabilir kalır.
2. Süresi bitmiş ancak sunucu sonucu henüz gelmemiş etkin oda girişe kapanır.
3. `finished` odada harfler ile kabul edilmiş çizgiler görünür, tahta salt okunurdur ve yeni seçim göndermez.
4. Sonuç penceresi ilk bitişte açılır; kapatılınca tahta incelenebilir ve “Düello sonucu” ile tekrar açılabilir.
5. Rövanş, ayrılma, skor, derece ve sonuç kaydı davranışları değişmez.
6. Hedefli regresyon testi, tam test paketi, içerik denetimi, tip kontrolü, üretim derlemesi ve Worker HTTP denetimi geçer.

## Doğrulama sınırı

Gerçek iPhone/Safari dokunma, kaydırma, odak ve piksel doğrulaması destekli cihaz/önizleme olmadan tamamlanmış sayılmayacak.
