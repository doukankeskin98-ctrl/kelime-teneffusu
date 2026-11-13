# 0.48.0 üzerine cila dalı · 13 Kasım 2026

Dal `claude/0.48-cila`, başlangıç `baslangic-0.48.0` (`ce70fba`). Ayrı deneme kopyasında hazırlandı. **Yayımlanmadı, birleştirilmedi, telefona kurulmadı.** Sürüm numarası bilerek 0.48.0 bırakıldı; numara ve native build artışı yayın anında yapılır.

13 Kasım yerel inceleme düzeltmesi: Claude'un `76aa196` teslimi `codex/0.48-cila-review` dalında korunuyor. Aşağıdaki kapsam ve dokunma alanı açıklamaları kaynak ve tarayıcı ölçümleriyle düzeltilmiştir. Yeni kanıt ve sınırlar: `codex-0.48-cila-review.md`.

## Neden

0.48.0'ın bağımsız incelemesi ve gerçek başsız Chrome ölçümleri somut kusurlar gösterdi. Yeni menü, özellik veya bağımlılık eklenmedi; çizim motoru, harf uçuşu, titreşim zamanlaması, kayıt biçimi ve kanonik tahta koordinatları değişmedi.

## Değişenler

1. **Hedef rafı tipografisi.** Açık hedef harfleri sabit `.64em` kutulardaydı; I ve İ gibi dar harfler yüzünden "Y I L D I Z", "JÜP İ TER" görünüyordu. Açık harfler artık yazı tipinin kendi genişliğini kullanır. Gizli hedefler bulunana kadar tek ızgarada kalır, açılınca raf kaymaz. Raf kelimesi hiçbir yoğunlukta satır atlamaz.
2. **Kısa ekranda yoğun raf.** İlk cila 34 px satır kullanıyordu; fakat satırdaki gerçek düğme 44 px kaldığı için komşu dokunma alanları üst üste biniyordu. İncelemede satırlar 44 px'e döndürüldü; alan başlık ve etkileşimsiz boşluklardan kazanıldı. Yazıların doğal genişliği, satır kırmama ve tahtanın 26 px hücre alt sınırı korunuyor. 600 px'ten uzun ekranların bu kuralı değişmedi.
3. **Tek kişilik tahtalarda geniş aile listesi.** 0.48.0'ın 8 girdilik listesi hazır tahtalarda AMINA, İBNE, BOK, SIÇ, SEKS, ÇÜK gibi dizileri kapsamıyordu. Tek kişilik sunum tahtaları 50 girdilik listeden geçer (`PRESENTATION_RULES`). 395 hazır tahtanın 345'i birebir aynı; 46'sında yalnız 1–2 dolgu harfi değişti (hedefler yerinde); 4'ü yeniden yerleştirildi (`bonus:renkler-atolye`, `bonus:kesif-zanaat`, `route:riddle-teknoloji-1`, `uzay.3`). SEKSEK ve GEÇİŞ gözden geçirilmiş istisnadır. İstisnasız bir hedef eklenirse `pnpm content:prepare` kelimeyi adıyla bildirir. Bu bir moderasyon garantisi değildir; MAL ve ANAN gibi gündelik kelimeler bilerek engellenmedi.
4. **Bölümler ekranı.** Dünya kapağı sahnenin boş orta bandını gösteriyordu; artık dünyanın kendisi görünür. Uzun bölüm adları karttan taşmaz; altı bölüm 375×667'de birlikte görünür.
5. **Sonuç ekranı.** Küçük görseli gizlenen sıradan sonuçta parça adı ortalanır.
6. **Hikâyeler.** Kart görseli kartın üçte ikisini kaplıyor, sağda boş bant bırakıyordu; artık kartı doldurur.
7. **Ana ekrana ekle bandı (yalnız web, iPhone Safari).** Başlık ve simge açık zeminde görünmüyordu; okunur hâle geldi.

## Tahta ve kayıt uyumluluğunun kapsamı

`tests/shared-boards-frozen.test.ts` günlük (70 gün), Arena (40 tur, dört mod) ve Sprint (36 tur) üretimlerinin 0.48.0 ile bayt eşitliğini özetlerle korur. `quality-1` bu dalda değişmedi. Günlük bulmaca tarih üzerinden yeniden üretildiği için yeni üretim kuralı tarih sınırı gerektirir. Arena oda tahtasını saklar; Sprint kişisel oyundur. Bu modların sürümleme ihtiyaçları aynı değildir.

**Yeni katalog meydan okumaları tamamen donuk değildir.** Sunum tahtalarını kullandıkları için 23 rota ve bir gizem bölümü olmak üzere 24 yeni meydan okuma varyantı değişir. Zaten açılmış meydan okumalar saklanan tam tahta içeriğinden oynanır; yeni üretici onlara uygulanmaz. `tests/original-catalogue.test.ts` gerçek 0.48.0 fikstürüyle taşınmış hedefleri olan eski bir maçı ve yeni maçı iki oyuncuyla tamamlar; yeniden katılım, aynı tahta, gizli koordinatlar ve eski sonucun korunmasını denetler.

Geniş liste hazırlanmış sunum tahtalarını kapsar; tarihi **Klasik** modun tüm tahtalarını temizlediği iddia edilmez. Klasik modun kayıt/koordinat sözleşmesi bu düzeltmede değiştirilmedi. `tests/board-quality.test.ts` içindeki tema testi Klasik mod testi olarak adlandırılmaz.

## Doğrulama

- Tam kontrol seti: testler, içerik hazırlığı ve denetimi, tip kontrolü, lint koruması (yeni artış yok; 428 hata / 164 uyarılık eski borç sürüyor), web ve mobil üretim derlemesi, native paket eşitliği, Worker HTTP kontrolleri. Sayılar teslim notundadır.
- Claude teslimindeki `pnpm layout:audit`: 192 ana bölüm × iki ekran ölçüsü için o tarihte sıfır geometri uyarısı bildirildi. Ancak eski kontrol gerçek dokunma alanı çakışmalarını ve harf kutularının kırpılmasını yakalamıyordu; bu sonuç hatasız oynanış kanıtı değildir. Denetim bu açıkları yakalayacak şekilde genişletildi. İnceleme dalında 384 ekranlık toplu tarama yeniden çalıştırılmış sayılmaz; hedefli tarayıcı kanıtı ayrı rapordadır.
- Harf uçuşu: ilk iki bölümün dokuz kelimesinde uçan harfler raftaki kendi harfinin merkezine 0 px sapmayla indi; uçuş süresi değişmedi (yaklaşık 1,08 sn).

## Sınırlar

- Hepsi tarayıcı emülasyonudur. Fiziksel iPhone'da parmak rahatlığı, titreşim, kare hızı, Safari araç çubuğu davranışı ve VoiceOver denenmedi.
- Sonuç ekranı açılınca odak ilk düğmeye (Kapat) gider. Emülasyonda odak halkası ekran kenarına çok yakın göründü; gerçek dokunmatik cihazda halkanın hiç çıkmaması beklenir ama doğrulanmadı.
- Küçük ekrandaki 34 px satır ödünleşimi kaldırılmıştır; 44 CSS px alan, fiziksel iPhone'da rahatlık garantisi değildir.
- Ses ve titreşim varsayılanı (kapalı) belgelenmiş karar olduğu için değiştirilmedi.

## Araç

`scripts/visual/` bağımlılık kurmaz; bilgisayardaki Chrome'u ayrı geçici profille başsız çalıştırır. CI'a bağlı değildir. `veteran-save.ts` yalnız denetim için geçerli bir örnek kayıt üretir; gerçek oyuncu kaydına dokunmaz.
