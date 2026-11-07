# 0.42.0 — Sade ayarlar ve canlı çizim rehberi

## Karar ve kabul sözleşmesi (uygulama öncesi)

Kaynak: Sites 89 / fe6c6c67f0ba799b58278351156cd1b2223e9640, 0.41.0. Kullanıcının iki gerçek ekranı temel alınır. Tek sınırlı salt okunur uzman incelemesi kullanıldı; yeni bağımlılık, müzik servisi, içerik paketi veya veri şeması eklenmez.

- Ana ayarlar sahne üzerinde kısa, büyük kontroller: ses, desteklenen cihazda titreşim, yolculuk/destek. Ayrıntılar ikinci katmanda; yardım, gizlilik ve hesap silme görünür bağlantılarda. Olmayan müzik kontrolü gösterilmez.
- Öğretici gerçek hedefin hücre merkezlerini izleyen özgün el simgesiyle çiz/bırak/tekrar döngüsü gösterir. Demo seçim, puan, ipucu, ses/titreşim veya kayıt üretmez. Gerçek dokunma ve klavye seçimi anında öncelik kazanır.
- Duraklama, yardım, arka plan ve hedef değişiminde gösterim temizlenir. Sistem ve uygulama hareket azaltma ayarlarında statik rehber kalır. Atla ve iki uç dokunma korunur.
- Sıfır başarıyla ilk bölümde bekleyip dönen oyuncu zaman aşımı nedeniyle öğretimi kaybetmez. İlerlemeli hesaplara rehber zorlanmaz.
- Mobil önizlemede 414×736 ve kısa/dar ekran, ayrıntı sayfaları, gerçek kelime seçimi, rehberin kapanması ve hareket azaltma kontrol edilir. Hedefli regresyonlar ve zorunlu proje kontrolleri tamamlanır. Fiziksel iPhone/FPS/VoiceOver veya mağaza kabulü iddia edilmez.

## Sonuç

Sözleşme uygulandı. 827 test /163 grup, tip/içerik/şema/web/695 Worker HTTP/native paket kontrolleri geçti. 414×736 ve321×570 gerçek bileşen önizlemesi; yatay/çapraz sürükleme, pause/resume/Atla, azaltılmış hareket ve ayar alt yolları doğrulandı. Rehber/listedeki hedef çelişkisi, zaman aşımı ve kenardaki el kesilmesi düzeltildi. Kaynak raporu docs/release-0.42.0.md; dış yayın makbuzu ve ekranlar world-review/0.42.0. Fiziksel cihaz/FPS/VoiceOver sınırı korunur.
