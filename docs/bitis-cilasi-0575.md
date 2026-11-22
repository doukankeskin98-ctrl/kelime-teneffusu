# 0.57.5 · Bitiş, tahta ve menüler

19 Kasım 2026. Yerel sürüm, iOS yapı 57. Çalışmanın başlangıcı `28838ec`.

## Oyuncuya yansıyanlar

- Kelime listesi yalnız kullanılabilir dikey alan kadar büyür. 320 pikselde 5. bölümün üç satırı ayrılır. 10. bölümün 11 satırlı tahtası 272 piksel genişliğini ve 21 piksel harflerini korur. İpucunun hedefi ipucu düğmesinden seçilir.
- Son kelimenin şeridi ve harfleri hareket eder. Övgü konu bandında görünür. Çizgiler kısa bir iz bırakarak çekilir ve ışık kazanılan parçaya ulaşır. Sonucu dokunarak öne almak mümkündür.
- Seçili harfin sürükleme sırasındaki ölçeği 1,08. Sistem veya oyun içi hareket azaltma açıkken ek ölçekleme uygulanmaz.
- Profil, Başarımlar, Arena, Günlük ve Diğer oyunlar ortak başlık ve üst düğme düzenini kullanır. Arena sıralama penceresi aynı temaya geçti. Ayarlar satırları ikonlu ve en az 44 piksel yüksekliğinde. Geri dönme ve oyun başlatma eylemleri ayrı renklerle gösterilir.

## Yerel doğrulama

Bölüm sonu düğmesinin görünür ve dokunulabilir olduğu ilk an, 0.57.4 ile aynı Chrome dokunma aracıyla ölçüldü. Üç tekrarın ortancası milisaniye cinsinden verildi.

| Ekran ve akış | 0.57.4 | 0.57.5 |
|---|---:|---:|
| 320, normal | 1285 | 1241 |
| 320, dünya finali | 1291 | 1240 |
| 393, normal | 1287 | 1225 |
| 393, dünya finali | 1291 | 1239 |

Normal hareketle ilk 1,2 saniyenin 100 ms aralıklı son çekiminde her örnek değişti. 36 gerçek tarayıcı dokunuşu beklenen sonraki ekranı açtı. Hareket azaltma etkin olduğunda sonuç doğrudan görünür.

Yayımlanmış 312 bölümün tümü 320×568, 375×667, 393×852 ve 430×932 boylarında açıldı. 1.248 ölçümde sabit tahta ve düğme yerleşimi, taşma ve okunabilirlik kontrolleri geçti. Hiçbir kelime listesi üç satırı veya satırda dört etiketi aşmadı.

36 menü durumu 320 ve 393 pikselde önce ve sonra açıldı. Beş ana sayfanın başlığı her boyda aynı konumda. Son ölçümde 74 başlık metni ve 10 ek Profil/Arena örneği kontrast eşiğini geçti. İki ana ekran başlığına ait son örnek, aynı stil paketini kullanan yerel pilotta çekildi.

Ölçümler ve görseller çalışma alanındaki `../world-review.nosync/release-0575/` dizininde. `menus/ozet.json`, `motion-check/son/YONTEM.md`, `boards-final/` ve `font/` denetimi tekrar incelemek için giriş noktalarıdır.

## Cihaz ve font

9. bölüm iki fontla aynı iPhone 18 Pro simülatöründe açıldı. Sistem ve Manrope görüntülerindeki 64 hücre aynı konumda. Ürün sahibinin seçimine kadar mevcut font tercihi geçerli. Bu turda fiziksel iPhone ile ses, titreşim ve parmak hissi ölçülmedi. Mağazaya veya oyun adresine gönderim yapılmadı.
