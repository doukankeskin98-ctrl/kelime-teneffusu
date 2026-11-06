# 0.38.0 · Arena ve özgün bölüm kataloğu

## Oyuncuya yansıyan değişiklikler

Arena lobisi, aktif maç ve Meydan ortak sahne/ölçek kullanır. Rekabet ekranlarında menüye ait 100 piksel alt boşluk kaldırıldı; süre, puan ve sıralama yüksek kontrastlı sabit bir satırda. Lobi hazır/başlat/ayrıl eylemleri oda istatistiklerinin altında kaybolmaz; geçmiş maç ve seri ayrı pencerede açılır. Başlayan yeni maç eski pencereyi kapatır. Maç sonucunda oda galibiyetleri isteğe bağlı açılır; ana sonuç ve devam düğmesi önde kalır.

Meydan okuma 242 seçilebilir bölüm sunar: 205 etkin yolculuk, 6 Gizli Tema tahtası ve 31 uygun tarihli bölüm. Sonradan yönetimden yayımlanan uygun bölümler bütün katalog sayfalarından alınır. Seçilen bölümün adı, kelimeleri ve bilmeceleri sunucuda sabitlenir; bütün katılımcılar aynı tahta görüntüsünü oynar. Eski tema koduyla açılmış mevcut maçlar uyumlu kalır.

Normal hedefler rekabet ekranında üç sütunda birlikte görünür; uzun hedefler gerektiğinde iki satıra geçer. Bilmecelerde tanımın uzunluğu yanlışlıkla harf sayısı sayılıyordu: artık cevabın gerçek harf sayısı gösterilir. Uzun tanım ayrı sınırlı alanda kalır. Dar ekran boşlukları mevcut dokunma hedeflerini küçültmeden azaltıldı.

İpucu başlangıç halkası iki kısa vurgu sonrası sakinleşir; hareket azalt ayarında hareket etmez. Önceden kabul edilen kelime uçuşu/haptik ritim ve çizim yön değiştirme motoru korunur. Meydan son kelime onayını bekler; sonuç düğmeleri sabit alt alanda, metinler koyu sahnede okunaklıdır. Kaybolan sunucu yanıtında onaylı kelimeyi geri almak için salt okuma kurtarması, yeniden bağlantı ve uygulamaya dönüş kurtarması eklendi. İstek otomatik tekrar gönderilip ikinci kelime/puan üretilmez.

## Özgün içerik ve ilerleme

Hababam, Yeşilçam, diziler, film/yapım ve 90'lar marka odaklı beş rota yeni seçimlerden kaldırıldı. Yerlerine yeni kimlikli 30 bölüm: Okul Günleri, Tiyatro Sokağı, Öykü Atölyesi, Film Atölyesi, Sokak Oyunları. Konu/kelime eşleştirmeleri bölüm bazında hazırlandı. Ana yolculuğun 168 sıra numarası ve 28 rota kimliği değişmedi.

Eski bölüm tanımları/tahtaları ve kayıtlar geriye uyumluluk için tutulur. Eski tamamlamalar, yıldızlar ve albüm kredisi yeni bölümden önce değerlendirilir; çift ödül yaratılmaz, eski çizim yeni tahtaya uygulanmaz. Yarım eski kaydın yanına boş yeni kayıt gelmesi dünya kilitlemez. Eski marka içeren tarihli tek bölüm arşivlenir; kazanılmış damga eşleri silinmez.

Yeni Arena havuzları 963 etkin kelimeyi ve mevcut 774 tanımı kullanır; eski tekrar geçmişi ve açık maç görüntüleri korunur. Sprint yeni seçimlerinde emekli adlar yoktur. Günlük seçim geçişi 7 Kasım 2026 UTC sınırında başlar; önceki günlerin bulmacaları değişmez. Bu içerik temizliği hukuki telif incelemesi veya mağaza onayı yerine geçmez.

## Doğrulama ve sınırlar

- 788 test / 159 grup geçti. Son küçük durum düzeltmesi ardından 103 ilgili test tekrar geçti.
- TypeScript, 273 authored tahta / 5460 alternatif yerleşim, Arena/Sprint içerik denetimleri geçti.
- 695 üretim Worker HTTP kontrolü: eski ve yeni Meydan API, bölüm kataloğu, emekli içerik reddi, iki kişinin aynı tahtası, onaylı kelime kurtarması; iki legacy oyuncu, sekiz özel grup ve on altı eşzamanlı açık grup oturumu.
- İleriye dönük tek nullable content sütunu göçü; şema yeniden üretiminde ek fark yok. Web derlemesi, 42 çevrimdışı varlık, 21 Safari 12 sözdizimi parçası; mobil derleme/senkron ve paket denetimi geçti.
- Lint bütünü temiz değil: devralınan 365 hata 364'e indi, eklenen kural hatası yok. Bu eski borç bu kapsamda giderilmiş sayılmadı.
- Gerçek tarayıcıda hızlı grup lobisi, hazır ol/başlat, bilmeceli maç, sonuç/ayrılma; Meydan katalog/başlat/dört yönde kelime çizimi/tamamlama/sonuç/dönüş denendi. Yerel ikinci oyuncu bir test katılımcısıdır, iki fiziksel cihaz denemesi değildir.
- 414×736: bilmeceli Arena tahtası yaklaşık 396 piksel; yoğun 12×12 Meydan tahtası yaklaşık 388 piksel (önce yaklaşık 316). 321×570: yoğun tahta yaklaşık 305 piksel; Arena yaklaşık 301 piksel. Bütün satırlar ve araçlar görünür, sayfa yüksekliği görüntü yüksekliğini aşmaz. Ölçüler DOM üzerinden doğrulandı; önizleme aracında ölçek çarpanı vardır.
- Eski yoğun 12×12 tahtalar kayıt ve ortak bulmaca uyumluluğu için korunur. Çok küçük ekranda bunların hücreleri yeni 8×8/9×9 Arena tahtalarından küçüktür; fiziksel parmak rahatlığı bu tur kanıtlanmış değildir.
- Fiziksel iPhone kurulumu kullanıcının önceki kararıyla ertelendi. FPS, gerçek dokunma/haptik hissi, VoiceOver, iki gerçek cihaz, TestFlight ve App Store kabulü bu raporun kapsamı değildir.

Yayın/CI sonucu ve görsel kanıt dosyaları çalışma alanındaki `world-review/0.38.0` teslim makbuzunda tutulur.
