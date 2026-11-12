# 0.48.0 üzerine cila dalı · 13 Kasım 2026

Dal `claude/0.48-cila`, başlangıç `baslangic-0.48.0` (`ce70fba`). Ayrı deneme kopyasında hazırlandı. **Yayımlanmadı, birleştirilmedi, telefona kurulmadı.** Sürüm numarası bilerek 0.48.0 bırakıldı; numara ve native build artışı yayın anında yapılır.

## Neden

0.48.0'ın bağımsız incelemesi ve gerçek başsız Chrome ölçümleri somut kusurlar gösterdi. Yeni menü, özellik veya bağımlılık eklenmedi; çizim motoru, harf uçuşu, titreşim zamanlaması, kayıt biçimi ve kanonik tahta koordinatları değişmedi.

## Değişenler

1. **Hedef rafı tipografisi.** Açık hedef harfleri sabit `.64em` kutulardaydı; I ve İ gibi dar harfler yüzünden "Y I L D I Z", "JÜP İ TER" görünüyordu. Açık harfler artık yazı tipinin kendi genişliğini kullanır. Gizli hedefler bulunana kadar tek ızgarada kalır, açılınca raf kaymaz. Raf kelimesi hiçbir yoğunlukta satır atlamaz.
2. **Kısa ekranda yoğun raf.** 320×568'de 10×10 ve 11×11 bölümlerde (5 ve 10) İpucu/Çevir düğmeleri ekranın 20–38 px altındaydı; bu 0.48.0'da da vardı. Kısa ekranda raf satırı 34 px olur: raf 4 yerine 3 satır, hücre 26 → 29 px, düğmeler ekranda. 600 px'ten uzun ekranlar değişmedi.
3. **Tek kişilik tahtalarda geniş aile listesi.** 0.48.0'ın 8 girdilik listesi hazır tahtalarda AMINA, İBNE, BOK, SIÇ, SEKS, ÇÜK gibi dizileri kapsamıyordu. Tek kişilik sunum tahtaları 50 girdilik listeden geçer (`PRESENTATION_RULES`). 395 hazır tahtanın 345'i birebir aynı; 46'sında yalnız 1–2 dolgu harfi değişti (hedefler yerinde); 4'ü yeniden yerleştirildi (`bonus:renkler-atolye`, `bonus:kesif-zanaat`, `route:riddle-teknoloji-1`, `uzay.3`). SEKSEK ve GEÇİŞ gözden geçirilmiş istisnadır. İstisnasız bir hedef eklenirse `pnpm content:prepare` kelimeyi adıyla bildirir. Bu bir moderasyon garantisi değildir; MAL ve ANAN gibi gündelik kelimeler bilerek engellenmedi.
4. **Bölümler ekranı.** Dünya kapağı sahnenin boş orta bandını gösteriyordu; artık dünyanın kendisi görünür. Uzun bölüm adları karttan taşmaz; altı bölüm 375×667'de birlikte görünür.
5. **Sonuç ekranı.** Küçük görseli gizlenen sıradan sonuçta parça adı ortalanır.
6. **Hikâyeler.** Kart görseli kartın üçte ikisini kaplıyor, sağda boş bant bırakıyordu; artık kartı doldurur.
7. **Ana ekrana ekle bandı (yalnız web, iPhone Safari).** Başlık ve simge açık zeminde görünmüyordu; okunur hâle geldi.

## Ortak tahtalar donuk

Arena, günlük, Sprint ve meydan okuma tahtaları `quality-1` kurallarıyla (`SHARED_RULES`) üretilmeye devam eder. `tests/shared-boards-frozen.test.ts` günlük (70 gün), Arena (40 tur, dört mod) ve Sprint (36 tur) tahtalarının 0.48.0 ile bayt eşitliğini özetlerle korur. Bu listeyi genişletmek her oyuncunun aynı tahtayı görmesi için tarihli yeni bir üretici sürümü gerektirir; bu dalda yapılmadı.

## Doğrulama

- Tam kontrol seti: testler, içerik hazırlığı ve denetimi, tip kontrolü, lint koruması (yeni artış yok; 428 hata / 164 uyarılık eski borç sürüyor), web ve mobil üretim derlemesi, native paket eşitliği, Worker HTTP kontrolleri. Sayılar teslim notundadır.
- `pnpm layout:audit`: 192 ana bölümün tamamı gerçek başsız Chrome'da 320×568 ve 375×667'de açılıp ölçüldü. Sayfa kayması, yatay taşma, bölünen veya kırpılan kelime, ekran dışında kalan düğme: sıfır. Kısa ekran kuralı geçici olarak kaldırıldığında denetim iki bölümü yakalayıp hata koduyla çıktı.
- Harf uçuşu: ilk iki bölümün dokuz kelimesinde uçan harfler raftaki kendi harfinin merkezine 0 px sapmayla indi; uçuş süresi değişmedi (yaklaşık 1,08 sn).

## Sınırlar

- Hepsi tarayıcı emülasyonudur. Fiziksel iPhone'da parmak rahatlığı, titreşim, kare hızı, Safari araç çubuğu davranışı ve VoiceOver denenmedi.
- Sonuç ekranı açılınca odak ilk düğmeye (Kapat) gider. Emülasyonda odak halkası ekran kenarına çok yakın göründü; gerçek dokunmatik cihazda halkanın hiç çıkmaması beklenir ama doğrulanmadı.
- 34 px raf satırı yalnız 600 px'ten kısa ekranda ve 10×10 üstü tahtalarda geçerlidir; önerilen 44 pt dokunma hedefinin altındadır. Bilinçli ödünleşim: aksi hâlde düğmeler ekran dışında kalıyor.
- Ses ve titreşim varsayılanı (kapalı) belgelenmiş karar olduğu için değiştirilmedi.

## Araç

`scripts/visual/` bağımlılık kurmaz; bilgisayardaki Chrome'u ayrı geçici profille başsız çalıştırır. CI'a bağlı değildir. `veteran-save.ts` yalnız denetim için geçerli bir örnek kayıt üretir; gerçek oyuncu kaydına dokunmaz.
