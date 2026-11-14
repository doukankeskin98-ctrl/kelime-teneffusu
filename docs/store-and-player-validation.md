# Görünürlük ve ilk oyuncu kabulü — 0.52.0

14 Kasım 2026. Bu dosya uygulanabilir hazırlıktır; mağazada yayımlanmış sayfa, canlı deney veya yapılmış oyuncu görüşmesi değildir. Mevcut mağaza yayın kapıları `app-store-readiness.md` içinde kalır.

## Mağaza metni

- Ad: **Kelime Teneffüsü**
- Alt başlık: **Kelime bul, yeni yerler keşfet**
- Tanıtım: **Her bölümde yeni bir konu. Harfleri birleştir, manzaralar arasında ilerle. İstersen Arena’da aynı bulmacada yarış.**
- Anahtar kelime taslağı: `bulmaca,Türkçe,harf,arama,bilmece,yolculuk,sözcük,zeka`

Açıklama:

> Bir kelime molası ver. Gökyüzünden sokaklara, doğadan sofraya uzanan konularda saklı kelimeleri bul. Parmağını harfler üzerinde kaydır; her bölümle yolculuğuna devam et.
>
> Kendi hızında oynayabileceğin 312 bölüm ve 52 rota seni bekliyor. Bazı bölümlerde kelimelerin bir kısmı saklı, bazılarında cevabı bir bilmece anlatıyor. Zorlanırsan aradığın kelimeyi seçip ipucu alabilirsin. Kaydırmaya alternatif olarak kelimenin iki ucuna dokunmak da mümkün.
>
> Kısa bir ara için bonus turlarını ve 60 saniyelik Hızlı Tur’u dene. Arkadaşlarınla aynı anda oynamak istersen Arena’ya katıl. Meydan okumada aynı bulmacayı farklı saatlerde tamamlayıp sonuçlarını karşılaştırabilirsin. Çevrimiçi modlar internet bağlantısı gerektirir.

Göndermeden önce sayılar final dağıtım kataloğuyla doğrulanır. Rakip oyun/marka adı veya kazanılmamış ödül sıfatı kullanılmaz. İsim ve alt başlık 30 karakter sınırının içindedir. [Apple ürün sayfası](https://developer.apple.com/app-store/product-page/)

## Gerçek oyunla görsel çekim sırası

| Sıra | Kısa metin | Kanıtlanacak ekran |
|---|---|---|
| 1 | Konuyu gör. Kelimeyi bul. | Konu ve bütün hedefleri açık, bir kelimesi yeni tamamlanmış ana tahta |
| 2 | Her dünyada yeni bir durak | Yolculuk ana ekranı ve ondan açılan gerçek bölüm |
| 3 | Bir ipucuyla yeniden bak | Seçili hedef ve ona ait gerçek ipucu; bilgi çakışması yok |
| 4 | Kısa bir kelime molası | Gerçek bonus turu; aynı kelimenin birden çok konumu |
| 5 | Aynı bulmaca, birlikte yarış | İki gerçek test oyunculu Arena ve hemen görünen sonuç sıralaması |
| 6 | Kendi rahatlığında oyna | Gerçek ses/titreşim ve görünüm seçenekleri |

Ekranlar son iOS paketinden, kişisel hesap/bildirim içermeden alınır. Mevcut yerel önizlemeler yalnız yerleşim kanıtıdır, fiziksel iPhone mağaza görseli diye sunulmaz. Gerçek oyunda bulunmayan tahta, ödül veya rakip çizilmez. İlk kısa video, kesintisiz olarak konu → çizim → harf yerleşmesi → bir sonraki bölüm akışını gösterir; yapay hızlandırma yapılmaz.

İlk deney: aynı başlık/açıklama/ikonla yalnız ilk ekranın anlatımını değiştir. A: konu ve okunaklı tahta. B: kelimenin bulunup yerine oturması. Birincil ölçüt mağaza sayfasından indirmeye dönüşüm; uygulama içi ilk bölüm tamamlama da izlenir. Küçük örneklemde erken kazanan ilan edilmez, test bitiş kuralı trafik görüldükten sonra önceden belirlenir. Apple ikon, ekran görüntüsü ve önizleme varyantlarını ürün sayfası optimizasyonuyla karşılaştırmaya izin verir; bu hesap/mağaza aşaması henüz çalıştırılmadı. [Apple ürün sayfası optimizasyonu](https://developer.apple.com/app-store/product-page-optimization/)

## Bu paketin altı görsel taslağı

`../world-review.nosync/release-052/store-01-home.png` ile `store-06-arena.png` arasındaki dosyalar 1290×2796 boyutunda gerçek yerel oyun görüntüleridir. Sıra: ana yolculuk, yakın dünyalar haritası, tahta, bulunan kelime, sonuç, Arena girişi. Canlı oyuncu veya uydurma rakip içermezler. Bunlar tarayıcı emülasyonundan alınmıştır; son imzalı native paketten çekilecek mağaza dosyalarının yerine tamamlanmış sayılmaz. Yukarıdaki ideal çekim planında bonus, ipucu ve iki cihazlı maç çekimleri ayrıca bekler.

## İlk oyuncu denemesi

Oyunu daha önce görmemiş 5–8 yetişkin; farklı ekran ve tek/çift el alışkanlıkları. Sonuçlar küçük bir kullanılabilirlik gözlemidir, bütün oyuncu kitlesi için istatistiksel iddia değildir. Katılımcı onayı olmadan kayıt veya kişisel veri toplama yok. Gözlemci ilk denemede yönlendirme yapmaz; yalnız “Aklından geçenleri söyleyebilirsin” der.

1. Oyunu aç, bir bölüm oyna. Başlama ve ilk kelime için yardım gerekiyor mu?
2. Yanlış yöne başlayıp parmağını kaldırmadan yön değiştir. Anlaşılır mı, yanlış reddedilen doğru çizim var mı?
3. Bir kelimeye ipucu al; sonra devam et. Hangi kelimeye yardım verildiğini anlayabildi mi?
4. Bölümü bitir, sonraki bölüme geç. Ödül ve bölüm numarası anlaşılır mı?
5. Sesi/titreşimi değiştir, oyuna dön. Sonra kısa oyun bul ve geri dön.
6. Arena bekleme, eşleşme, maç ve sonuç. İki oyuncunun gerçek saati/tahtası birlikte doğrulanır.

Her katılımcı için: anonim kod, cihaz/OS, görev sonucu, yardım sayısı, yanlış seçim örneği, ilk kelimeye süre, ilk bölüm bitişi, en belirgin üç sürtünme. Boş kayıt tablosu: `kod | cihaz | görev | başarı/yardım | süre | gözlenen sorun | tekrar denemesi`.

Öncelik hesabı: ilerleme kaybı/oynanamama önce; sonra birden fazla oyuncuda tekrarlanan engel; sonra kozmetik ayrıntı. Bir turda en fazla üç kanıtlı sorun düzeltilir ve aynı görev tekrar edilir. Mevcut izinli `first_word`, `level_complete`, `selection_miss`, `input_feedback`, `frame_sample`, `retention_day1/7` olayları yeterli; yeni SDK/izinsiz izleme eklenmez. Olay tanımı dışında cihaz veya bölüm kırılımı varmış gibi rapor yazılmaz.

## Tekrarlanan sürüm kabulü

Kaynak → tip/test/içerik/şema → web/native derleme → Worker HTTP → değişen ekranlarda görsel kontrol → aynı kaynak ağacıyla GitHub CI ve yayın. Bu kontroller fiziksel his kabulünün yerine geçmez.

Fiziksel kabul kartı: eski kaydın yedeği ve güncelleme sonrası eşitliği; küçük telefon Safari/WKWebView; kenar/çapraz/geri yön; art arda doğru kelimeler; son kelimeden hemen sonra tekrar dokunma; ipucu ve çevir; arka plana alıp dönme; ekran kilidi; yavaş/kopuk ağ; iki cihazda Arena'ya son anda katılım; en az 15 dakika çizim; azaltılmış hareket, büyük harf modu ve VoiceOver. Pil/ısınma/kare süresi gerçek cihazda ölçülmeden sayı verilmez.

Yayıncı kimliği, çalışan destek kanalı, Apple üyeliği, dağıtım imzası, gizlilik beyanları ve inceleme erişimi tamamlanmadan App Store’a hazır denmez. Bu dosya bu dış kapıları kapatmaz.
