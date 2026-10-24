# Mobil deneyim 0.9.0 doğrulaması

- İki uzman bağımsız deneyim/güvenilirlik incelemesi, tek uygulama sahibi. Son kaynak incelemesindeki alt güvenli alan düzeltildi: gerçek sarmalayıcı paddingBottom değeri hesaba katılıyor.
- 133 test, 30 grup başarılı; 32 sabit tahta / 640 alternatif, TypeScript ve üretim derlemesi geçti. İki bağımsız oyuncuyla 180 üretim Worker HTTP kontrolü başarılı. 3 yeni test viewport yükseklik/genişlik sınırını ve kısa ekranda okunabilir alt sınırı denetliyor; DOM sığma testi değildir.
- Kelime iç kaydırması kaldırıldı; parçalı/uzun hedefler korunur. Tahta ekran bütçesine uyar; en az 22px hücre alt sınırında gerektiğinde doğal sayfa taşması vardır. Büyük harf modu ve 44px kontroller korunur. Boyut değişiminde aktif seçim temizlenir. Yeni hareketler reduced-motion ile kapatılır.
- Destekli preview CLI URL verdi; cloud browser ERR_CONNECTION_REFUSED; status aynı URL'yi verdi. Alternatif browser yolu denenmedi. Gerçek ekran görüntüsü, dokunmatik/klavye DOM etkileşimi, fiziksel iPhone/Android, 200% metin ve FPS doğrulanmadı. Profesyonel stüdyo eşdeğerliği/tutma artışı iddia edilmez.
- Oyun motoru, tarihli bölüm snapshotları, kimlik/ödül/kayıt kuralları, DB ve göçler 0.8.4 Sites başlangıcıyla aynı. Yeni bağımlılık/hizmet/ücret veya otomasyon yok.
- GitHub main 0.8.3, Sites 0.8.4 olarak bulundu; yeni UI ile birlikte mevcut Sites kayıt kuyruğu düzeltmelerini de koruyarak tam kaynak eşitlenecek. CI, kaynak ağacı ve gerçek yayın sonuçları araç metadata'sıyla doğrulanır; bu dosya tek başına yayın kanıtı değildir.
