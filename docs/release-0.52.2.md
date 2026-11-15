# 0.52.2 — Eski efekt seslerine dönüş

15 Kasım 2026 · iOS yapı45 · taban0.52.1 / Sites v107 / kaynak `90213c05f399c6e9ab4a1ecfffb88b9d8338d996`.

Kullanıcı0.52.0 ile eklenen kayıtlı efektleri beğenmedi ve önceki sesleri geri istedi. Kabul ölçütü: yalnız ses motoru0.51.0 davranışına döner; son arayüz, ilk oyun rehberi, animasyon, titreşim zamanlaması, ses tercihi, tahta ve kayıtlar değişmez.

## Değişiklik

`lib/game/sound.ts`, 0.51.0 kaynağı `be10b96` ile birebir aynı dosyaya döndü. Harf seçimi, kelime onayı, ipucu, yanlış deneme, menü, başlangıç ve sonuç sesleri eski kısa tonları kullanır. Yeni örnek ses bankası oynatıcıya bağlı değildir. Eski yükleme/susma/arka plan korumaları aynen korunur. Ambiyans eklenmedi. Mevcut ses seviyesi, ses ve titreşim açık/kapalı tercihleri değişmez; yeni oyuncu varsayılanları da bu paketin konusu değildir.

Eski seslerin herhangi bir arızası giderilmiyor; bu, kullanıcının beğendiği ses karakterine hedefli geri dönüştür. 0.52.0 ve0.52.1'in diğer iyileştirmeleri geri alınmadı. Kaynakta kullanılmayan eski örnek paketi ve lisans kayıtları korunur; oyun motoru bunları çalmaz.

## Doğrulama

- Ses motorunun0.51.0 kaynağıyla dosya eşitliği: geçti.
- 33 hedefli ses/titreşim testi; aç/kapat, sessiz seviye, görünürlük, gecikmiş ses kuyruğu, kesinti ve sonlanma dahil: geçti.
- 984 tüm test ve742 izole Worker HTTP kontrolü: geçti.
- Tip, içerik, şema, web, mobil paket: geçti. 312 yayımlanmış bölümün manifesti değişmedi; SQL göçü yok.
- Lint artışı0; mevcut428 hata/162 uyarı aynen görünür.
- Ek OfflineAudioContext denemesinde bit düzeyinde eşitlik doğrulanamadı: aynı kaynak için bile Chrome kayan nokta çıktısında yaklaşık0.000000007–0.000000015 fark oluştu. Sıfır fark sınırı yükseltilmedi; deneysel ölçüm başarılı kabul edilmedi ve ürünün regresyon testi olarak eklenmedi. Deneyin kodu ve başarısız ölçüm günlüğü kanıt dizininde saklandı. Geri dönüşün doğrulaması birebir kaynak eşitliği ve mevcut ses/titreşim davranış testleridir. Fiziksel hoparlör/dinleme kabulü değildir.
- Yeni örnek sesin çalmasını bekleyen tek test, geri getirilen davranışı sınamak üzere tüm olaylarda eski ton/no-decode/no-fetch kontrolüne çevrildi. Susturma, temizlik ve sonlu çalma kontrolleri korunur; diğer ses bankası testleri silinmedi.

Kanıt: `../world-review.nosync/release-0522/`. `browser-audio.log`, deneysel karşılaştırma kodu, hedef testler, tüm test/derleme/Worker günlükleri ve yayın makbuzu. Kullanılmayan örnek dosyalarının önbellekte bulunması, çalındıkları anlamına gelmez. Bu tur gerçek iPhone kurulumu veya fiziksel ses testi yapılmadı; önceki simülatör testmanagerd engelini yeniden denemedik. Görsel bileşenler değişmediğinden yeni genel ekran taraması yapılmadı.

## Geri dönüş

Başlangıç paketi0.52.1 / Sites v107 ve `baseline-0521.bundle` saklanır. Yeni veri göçü olmadığı için görünüm/ses paketi geri alınabilir; oyuncu verileri eski yedeğe döndürülmez. Web sürümü aynı adreste yayınlanır; native paket hazırlanması telefondaki kurulu binary'yi kendiliğinden güncellemez.
