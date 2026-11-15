# 0.53 — Oyun içi başarı ve yolculuk ritmi

15 Kasım 2026. Başlangıç 0.52.2 / Sites 108. Tek odak: mevcut çizim → kabul → dünya bitişi → bonus → sonraki bölüm zinciri. Yeni bölüm, ekonomi, ses paketi veya kayıt göçü yok.

## Uygulama öncesi kabul

- Aynı etkin tahtada 8 saniye içinde iki farklı, yerel çizimle eşleşen doğrulanmış kelime kısa bir övgü üretir. Sonrakiler için en az iki yeni kelime ve 4 saniye gerekir; tur başına en fazla üç gösterim. Bunlar WoW'un doğrulanmış eşikleri değil, bu oyun için başlangıç tasarımıdır.
- Pending seçim, restore/cloud merge, tekrar çizim, ipucuyla gösterilen seçim ve son kelime övgü üretmez. Yanlış deneme, arka plan, yardım/ayarlar ve tahta değişimi geçici zinciri temizler. Puan/ödül/ceza eklenmez.
- Tek dekoratif öğe, 900 ms; yerleşim değişmez, dokunuş yakalamaz, yeni çizimde çekilir. Hareket azaltmada sabit metin. Mevcut harf uçuşu, haptik ve sonuç zamanları korunur.
- Bir dünya ilk kez tamamen bittiğinde ana sonuç eylemi bonus turuna gider (normal sırada altı bölümde bir). Açık bir geçme seçeneği kalır; bonus ilerlemenin kilit koşulu olmaz. Sayaç yalnız oyuncu başlatınca çalışır.
- Tekrar tamamlamalar bonusu yeniden zorlamaz. Bonus sonrası gerçek sonraki bölüm; son dünyada ana sayfa. Yarım bonus kaydı korunur; uygulamanın soğuk açılışını otomatik bonus restorasyonu diye sunmayız.
- 312 yayımlanmış bölüm, kayıt şeması, ortak Arena tahtaları ve 0.52.2'de geri getirilen sesler değişmez. Gerçek oyuncu/cihaz memnuniyeti ve FPS bu testlerden çıkarılmaz.

## Doğrulama

Saf olay modeli: onay sıraları, retry, süre sınırı, kesinti, ipucu, terminal ve restore. Gerçek ortak bileşen: canonical/çevrilmiş koordinatlar, sonraki çizim, reduced motion. Kampanya sonucu: bonus ana eylemi, geçme ve replay. Bonusun mevcut duraklama/süre/kayıt kontrolleri. 320/375/414/430 px yerel görsel akış. Sonunda tek tam proje kapısı; fiziksel telefon ertelenmiş.
