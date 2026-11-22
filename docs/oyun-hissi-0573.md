# Kelime Teneffüsü 0.57.3 · Bulma ve bölüm bitişi

18 Kasım 2026. Karşılaştırma sürümü 0.57.2, kaynak 5208ad7. Yerel iOS paket numarası 55.

## Oyuncunun göreceği değişiklikler

Küçük telefonda mekanik rehberin başlığı ve düğmesi görünür kalıyor. Uzun açıklama kendi alanında kayıyor. Diğer ayarlarda seçili kart, ses seviyesi ve açma/kapama denetimleri aynı mor temayı kullanıyor.

Parmakla çizilen hattın saydamlığı iki ayrı katmanda çarpılıyordu. Artık seçili harfler koyu mor üzerinde beyaz. Kelime listeye ulaştığında üzerindeki çizgi belirginleşiyor. Bir sonraki kelime önceki uçuş sırasında çizilebiliyor.

Son kelimenin çizgileri manzarada beliriyor. Yeni albüm parçası varsa ışık izleri görünür tahtadaki çizgilerin uçlarından madalyona gidiyor. Yolculuk içinde konfeti dünya finaline ayrıldı. Sol üstteki sayaç o bölümde kazanılan ek yıldızları gösteriyor. Daha iyi skor getirmeyen tekrarda artış sıfır. Son çizimden 300 ms sonra tahtaya dokunmak sonucu açıyor. Hareketi azalt tercihinde ışık uçuşu ve konfeti kapanıyor.

## Kanıt

Tüm ekran ölçüleri mobil Chrome emülasyonundan. Oyuncu hesapları yerine izole örnek kayıtlar kullanıldı. Kanıt klasörü çalışma alanındaki `../world-review.nosync/release-0573/`.

| Kontrol | Gözlem |
| --- | --- |
| 4 rehber × 4 ekran | 320×568'de daha önce 4 düğmenin yalnız 1'i ilk açılışta tamamen dokunulabiliyordu. Şimdi dört boyda da 4/4. |
| Diğer ayarlar ve Başarımlar | 320 ve 393 pikselde 105'er metin ölçümü. En düşük 5,485:1. |
| Çizimde gerçek katman saydamlığı | 320 pikselde eski çizgi %23,1, yeni çizgi %94. Yeni beyaz harfle kontrast 5,87:1. |
| Peş peşe iki kelime | 320 ve 393 pikselde önceki uçuş DOM'da hâlâ etkinken sonraki kelimeye yeni dokunuşla başlandı. |
| Sonuç | Son çizginin kaydından sonuç düğmesinin açılmasına 1,266–1,279 sn. Azaltılmış harekette aynı tarayıcı güncellemesinde açıldı. Normal bölümde ve dünya finalinde ayrı çekim alındı. |
| Regresyon | 1.017 test ve 749 yerel Worker HTTP kontrolü geçti. Tip, içerik, web ve mobil kontrolü geçti. 312 yayımlanmış bölümün manifesti doğrulandı. Lint denetimi 0 artış bildirdi. |

Üç an için `uc-an-once.mp4` ve `uc-an-akis.mp4`. Sonuç görüntüleri 100 ms aralıklı kare dizilerinde, ham kareler gerçek zaman damgalarıyla `akis/` altında. Araç komutları: `node scripts/visual/berrak.mjs --polish` ve `node scripts/visual/berrak.mjs --moments`.

## Kalan çalışma ve cihaz sınırı

Sabit tahta düzeni sonraki faz. 320×568'de 9. bölümde araçların üst kenarı 514 px, 10. bölümde 26 px olarak ölçüldü. Gerçek iPhone'da parmak, titreşim, VoiceOver ve kare süresi bu fazda doğrulanmadı. Yayın ve cihaz kurulumu yapılmadı. Kaydedilen ilerleme, tahta, ses ve titreşim kuralları için veri göçü yok.
