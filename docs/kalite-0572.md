# 0.57.2 · İlk tur, okunurluk ve bölüm sonucu

18 Kasım 2026 · iOS yapı 54 · Yerel aday · Başlangıç 0.57.1 (`9e5a482`)

**Ne değişti.** Gizlilik, destek ve dört oyun rehberindeki açık zeminli metinler Berrak’ın koyu yazı renklerini kullanıyor. Açılan dünyayı bildiren bölüm sonu ile o dünyaya giriş ayrı anlarda gösteriliyor. İlk çizim rehberinin ipucu sayacı ve “Atla” düğmesi için kendine ait yeri var.

**Nasıl ölçüldü.** Eski mobil paket ve yeni paket aynı yerel tarayıcıda, geçici profil ve sentetik ilerlemeyle karşılaştırıldı. Mobil güvenli alanlar benzetildi. 320×568 ve 393×852’de altı pencere açıldı. Hesap işleminin açıklaması ve doldurulmuş destek önizlemesi de ölçüme dahil edildi. CI yapılandırması artık pencere kontrastını, gerçek bölüm geçişlerini ve ilk çizim düzenini tarayıcıda denetliyor.

**Ne kaldı.** Fiziksel iPhone’da parmak hissi ve VoiceOver kontrolü, uzaktaki CI çalışması ve yayın ayrı adımlar. Bu dilim için canlı ortama dağıtım yapılmadı.

## Oyuncunun gördüğü fark

- İlk rehberde saklı harf örneği, bilmece cevabının uzunluğu ve açıklama aynı kartta okunabiliyor. Destek raporunun konu düğmeleri, açıklama metni ve kullanılabilirlik durumu okunuyor.
- 3→4 ve 9→10 geçişlerinde başlık **Tebrikler!** Haritada açılan dünya altta duyuruluyor. 6. bölümün ilk tamamlanışında **Dünya tamam!** ve bonus seçimi korunuyor. Yeni dünyaya girildiğinde karşılamada dünyanın adı görünüyor.
- 320 piksel genişlikte sayacın boyalı kenarından rehber kartına uzaklık 3 pikselden 9 piksele çıktı. Sol el düzeni, ipucu kullanımı ve son harften önce bırakma da sınandı. 393 piksel genişlikte “Atla” dokunma alanı 40,64 pikselden 44 piksele çıktı.

| Ekran | İlk kelimeden önce ve sonra tahta genişliği |
|---|---|
| 320×568 | 304 → 304 px |
| 375×667 | 359 → 359 px |
| 393×852 | 377 → 377 px (önceki sürümde 360 → 377 px) |
| 430×932 | 414 → 414 px |

Tahta dikdörtgeni, tahta alanı ve iki köşe harfinin konumu karşılaştırıldı. İlk kelimenin kabulü telefonu temsil eden dört tarayıcı boyutunda da bu ölçüleri değiştirmedi.

## Metin kontrastı

İki genişlikte toplam 190 görünür metin ölçümü alındı. En düşük sonuç 5,47:1. Ölçüm, yazı rengini ve saydamlığı gerçek ekran görüntüsünde yazının arkasında bulunan renkle karşılaştırır. Kaydırılabilen içerik, seçili seçenek, metin alanı ve devre dışı eylem de ölçülür. Her metin için sonuç ve eşik `release-0572/metin-kontrasti.csv` kanıt dosyasında bulunur.

| Pencere / durum | Her genişlikte ölçüm | İki genişlikte en düşük oran (yuvarlanmış) |
|---|---:|---:|
| Gizlilik ve hesap | 13 | 5,485:1 |
| Hesap işleminin açıklaması açık | 18 | 5,485:1 |
| Destek | 20 | 5,485:1 |
| Destek raporu önizlemesi açık | 21 | 5,471:1 |
| Bilmece | 6 | 5,471:1 |
| Saklı kelime | 6 | 5,471:1 |
| Gizli tema | 6 | 5,471:1 |
| Günlük bulmaca | 5 | 5,471:1 |

## Doğrulama ve geri dönüş

1.017 birim ve bütünleşme testi ile 749 yerel Worker HTTP kontrolü geçti. Tip, içerik, web derlemesi, iOS paket içeriği ve lint borcu denetimi geçti. Mevcut lint borcu 427 hata ve 155 uyarı. İçerik kontrolü yayımlanmış 312 bölümün kayıt manifestini doğruladı. Veritabanı şemasında değişiklik yok.

Yerel test hesabının oyuncu adı alanı sunucu sözleşmesiyle eşleştirildi. Renk örneklemesi her kaydırmadan sonra güncel kare üzerinden yapılıyor. Fiziksel cihaz, TestFlight ve gerçek oyuncu hesapları kullanılmadı. Geri dönüş için önceki kaynak `9e5a482`; bu aday kayıt göçü, ödül ya da tahta değişikliği içermiyor.
