# Kelime Teneffüsü 0.57.4 · Küçük ekranda tahta ve ipucu

19 Kasım 2026. Yerel iOS paket numarası 56. Önceki yerel kontrol noktası 0.57.3, kaynak `5d6fc7b`.

## Oyunda ne değişti?

Yolculukta konu başlığı, kelime listesi, tahtanın üst kenarı ve alt araçlar her bölümde aynı hizayı koruyor. Önceki sürümde 320×568 ekranda araçların üst kenarı 9. bölümde 514 px, 10. bölümde 26 px idi. Artık her iki bölümde de 516 px. Çizim sırasında ilk harf başlık alanında görünür. İpucu düğmesinden hedef seçilebilir. Seçimi kapatmak ipucu harcamaz. İki bilmeceli bölümde kesilen kapalı harfler de kelime alanına sığdırıldı.

## Ölçümler

Yayımlanmış 312 bölüm dört portre ekranında yerel Chrome ile açıldı. Her satır, 312 ayrı bölüm ziyaretinin sonucudur. Bu kontroller tahta başlangıcını, dokunma araçlarının yerini ve içeriğin görünür alana sığmasını ölçer.

| Ekran | En küçük hücre | Yerleşim hatası |
| --- | ---: | ---: |
| 320×568 | 30,39 px | 0 |
| 375×667 | 35,89 px | 0 |
| 393×852 | 37,69 px | 0 |
| 430×932 | 41,39 px | 0 |

320×568 ekranda 10. bölümün yayımlanmış tahtası 272 px genişliğinde, harfleri 21 px. TROYA ilk harften son harfe tarayıcı dokunuşlarıyla çizildi. Ardından düğmeden başka bir hedef için ipucu alındı. Her iki işlemde de tahta konumunu korudu. Yoğun liste kontrolünde 12 kısa hedef dört sütun ve üç satırda 14 px ile göründü. Bu son örnek sentetik. Dar ekran testi otomatik kontrol dizisine eklendi.

Aynı bölümün yalnız deneme için hazırlanan 9 satır × 7 sütun adayı ayrı bir yerel pakette 291 px genişlik ve 26 px harf verdi. Bu sürümün oynanabilir kataloğu mevcut 312 bölümden oluşuyor. Yeni içerik için aday tahtanın seçilmesi ayrı bir karar.

## Doğrulama ve kanıt

1.017 test ve 749 yerel Worker HTTP kontrolü geçti. Bölüm manifesti, tip denetimi, lint bütçesi, web derlemesi ve mobil paket kontrolü geçti. Kontroller örnek kayıtlar üzerinde yapıldı. Kayıt biçimi ve bölüm koordinatları korundu.

Ölçümler ve ekran görüntüleri çalışma alanındaki `world-review.nosync/release-0574/` klasöründe. Üç oyun anı `uc-an-akis.mp4` dosyasında yan yana gösterilir. Dört telefon boyutunun verileri `tahtalar/`, tekrar çalıştırılan küçük ekran testi ve TROYA çizimi `son-kontrol/`, ayrı bölüm adayı `aday-10/` altındadır.

Fiziksel iPhone'daki parmak hissi, kare süreleri, VoiceOver ve titreşim bu sürüm için açık kontroller. Mevcut Manrope yazı tipi kullanılıyor. İki yazı tipi arasındaki görsel tercih ve ilk 18 bölümün içerik değerlendirmesi açık. Bu kayıt yerel bir geliştirme sürümüne aittir.
