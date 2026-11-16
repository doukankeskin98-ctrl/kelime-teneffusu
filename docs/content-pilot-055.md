# Kapalı içerik pilotu: yön ve ortak harf ölçümü

16 Kasım 2026. Bu çalışma bir raporlama aracıdır; içerik aktivasyonu veya kayıt göçü değildir. `CONTENT_REVISION_TWO` ve `COMPACT_PROGRESS_WRITES` kapalıdır. Yayımlanmış 312 bölümün kimliği, kelimeleri, kanonik/sunum tahtaları ve oyuncu kayıtları değiştirilmedi.

## Tekrar üretim

Depo kökünde:

```sh
node --experimental-strip-types --experimental-transform-types scripts/audit-board-directions.ts --out /tmp/kelime-board-directions-055.json
```

`--out` verilmezse JSON standart çıktıya yazılır. Araç `MAIN_JOURNEY` içindeki 312 bölümün hazırlanmış güvenli sunum tahtasını ve `revisionCatalogueQuality()` içindeki altı rev2 adayını ayrı raporlar. 379 öğeli `PLAYABLE_JOURNEYS` kayıt doğrulama kataloğu bu ana yolculuk sayısıyla karıştırılmamalı.

Yön, hedefin ilk harfinden son harfine, oyuncunun isteğe bağlı tahta dönüşünden önce ölçülür. **Ortak hücre**, en az iki hedefin aynı harf hücresini kullanmasıdır. **Kesişen çift**, ortak hücresi olan benzersiz hedef çiftidir; hücreler arasında kesişen çapraz çizgiler sayılmaz. Rapor hedef parçalarını sayar; çok sözcüklü cevapların parçaları ayrı yerleşimler olabilir.

## Ölçülen mevcut durum

| Kapsam | Hedef yerleşimi | Tek eksenli tahta | Çapraz içeren tahta | Ortak hücreli tahta | Ortak hücre / kesişen çift |
| --- | ---: | ---: | ---: | ---: | ---: |
| Yayımlanmış 312 ana bölüm | 1.359 | 112 | 127 | 93 | 124 / 119 |
| İlk dünyanın altı bölümü | 34 | 4 | 1 | 2 | 8 / 3 |
| Kapalı altı rev2 adayı | 34 | 2 | 3 | 1 | 1 / 1 |

| Rev2 adayı | Yönler | Ortak hücre / çift |
| --- | --- | ---: |
| ufuk-gok-1 · Yıldızın içinden | sağ 5 | 0 / 0 |
| ufuk-gok-2 · Yıldız ışığı | sağ 3, yukarı 1, sol 1 | 0 / 0 |
| ufuk-gok-3 · Uzaklığı ölçmek | sağ 2, sol 1, aşağı-sağ 2, aşağı-sol 1 | 0 / 0 |
| ufuk-gok-4 · Yıldızın ömrü | sağ 1, sol 1, aşağı 1, aşağı-sol 2, yukarı-sol 1 | 1 / 1 |
| ufuk-gok-5 · Gözlem hazırlığı | aşağı 4, yukarı 2 | 0 / 0 |
| ufuk-gok-6 · Ufukta renkler | sağ 2, aşağı 2, yukarı 1, aşağı-sol 1 | 0 / 0 |

Altı adayın kelimeleri, ipuçları, revizyon kimlikleri ve hazırlanmış tahtaları mevcut; ayrı bir prototipte incelemek için teknik girdi hazırdır. Altı adayın yalnız birinde ortak hücre bulunuyor. Özellikle “Ustalık” etiketli beşinci adayın tamamı dikey: etiketin vaat ettiği çeşitlilik henüz yerleşimle gösterilmiyor. Bu sayılar algılanan zorluğu, eğlenceyi veya oyuncunun hazır oluşunu ölçmez.

## Önerilen editoryal kabul

- **İlk dünya öğretir.** İlk iki bölümde ters yön gerektirmeyen mevcut yaklaşım korunur; çapraz ve diğer yükler aşamalı tanıtılır. Buradaki kolaylık, geç dünyalara uygulanacak bir tavan değildir. Ortak hücre sayısını artırmak uğruna ilk deneyim yoğunlaştırılmaz.
- **Her dünya kendi eğrisini taşır.** Editör, altı konum için öğretme, geliştirme, zorlanma ve rahatlama amacını; kelime bilgisi, yönler, ortak hücreler, ipucu/gizleme ve görsel yoğunlukla birlikte önceden yazar. Rapor bu niyetle karşılaştırılır. Her tahtaya sekiz yön, aynı kesişme sayısı veya sürekli artan zorluk zorunluluğu konmaz.
- **Bu pilotta beşinci aday yeniden ele alınır.** Yeni deneme varyantı için en az iki eksen ve bir ortak harf hücresi somut bir başlangıç hedefidir; bu, tüm oyuna uygulanmış bir kural veya mevcut bölümün değişikliği değildir. Doğal Türkçe, konu bütünlüğü ve okunabilirlik korunamıyorsa sırf kotayı dolduran yerleşim kabul edilmez. İlk adayın yalnız yatay olması ancak geç dünyadaki öğretme/rahatlama amacı açıkça yazılarak değerlendirilir.
- **Teknik geçiş oyuncu kabulü sayılmaz.** Mevcut güvenlik, tekrar mesafesi, yerleşim, ipucu ve revizyon uyumluluğu kapıları geçmeli; ardından gerçek oyuncuyla ilk kelime, yön fark etme, ortak harfi kullanma ve bölüm sonrası devam gözlenmelidir. Fiziksel telefonda okunabilirlik ve seçim doğrulanmadan “pilot hazır” denmez. Bu tur bu testler çalıştırılmadı.

Bu rapor bir aktivasyon kapısını açmaz. Rev2 seçimi ve kalıcı v3 yazımı için [mevcut ayrı kabul ve geri dönüş koşulları](release-0.51.0.md#geri-dönüş-ve-aktivasyon) geçerlidir. Önceki sürüm notundaki dört aday sayısı tarihseldir; bu ölçüm güncel altılı kaynağı kullanır.
