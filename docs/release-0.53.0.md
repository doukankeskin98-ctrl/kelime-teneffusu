# 0.53.0 — Başarı geri bildirimi ve yolculuk bonusları

15 Kasım 2026 · iOS paket 46 · taban 0.52.2 / Sites 108 / kaynak `a024ff0c6878faf1160b71fe3c432bbab1fa67be`.

## Oyuncunun göreceği değişiklik

- Aynı tahtada 8 saniye içinde iki farklı kelimeyi bulan oyuncuya kısa **Çok iyi!** yazısı görünür. Devamında en az iki yeni kelime ve 4 saniye arayla **Harika!**, **Müthiş!** gelebilir; bir tahtada en fazla üç gösterim. Bunlar WoW'un bilinmeyen tetik kurallarının kopyası değil, bu oyun için test edilebilir ilk ayardır. Oyuncu memnuniyeti henüz ölçülmedi.
- Yazı 900 ms görünür, dokunma yakalamaz, yeni çizime başlandığında çekilir. Tahta ve hedef rafı boyutu/konumu değişmez. Azaltılmış harekette sabit görünür. Aynı olay için yeni ses, titreşim, puan veya para eklenmedi; harf uçuşu/iniş/sonuç süreleri değişmedi.
- Dünya ilk tamamlandığında sonuç ana eylemi **Bonus turuna geç** olur: normal yolculukta altı bölümde bir, mevcut 52 dünyanın her birinde. Oyuncu bonus menüsü aramaz. Açık geçme eylemi vardır; bonus tamamlamak bölüm açma şartı değildir. Tekrar oynama ve eski tamamlanmış kayıtlar yeniden bonus zorlamaz.
- Bonus tanıtımı sadeleşti, teknik “yerleşim” sözcüğü kaldırıldı; uzun örnek kelimeler küçük ekran genişliğine daralabilir. Sayaç oyuncu başlatmadan çalışmaz. Bonus sonrası gerçek sıradaki bölüm; son dünyada ana sayfa.

## Kayıt ve akış güvenliği

312 yayımlanmış bölüm/kimlik/sıra/tahta manifesti, kayıt şeması, puan/ödüller, Arena ortak içerik ve onay motoru değişmedi. Kompakt yazım, revizyon2 ve Game Center bayrakları açılmadı. `sound.ts` ve haptik dosyaları 0.52.2 ile aynı; kullanıcının geri istediği eski sesler korunur, ambiyans yok.

Övgü, gerçek yerel çizim uçları ile doğrulanmış oyuncu stroke'u eşleşince oluşur; yalnız optimistic ink veya harf uçuşunu izlemiyor. ACK/snapshot tekrarları, restore, uzaktan ilerleme, stale/background onay, ipucuyla gösterilmiş çizgi ve son kelime övülmez. Geçici sayaç görünmez; yanlış denemede puan/ödül cezası yok. Gösterim DOM dekorasyonu olarak yürür, pointer-move dinleyicisi/animasyon kuyruğu/ek React board çizimi oluşturmaz.

## Kontroller ve sınırlar

- 993/993 test; 742 üretim Worker HTTP kontrolü geçti.
- Tip, içerik/312 manifest, şema, web ve mobil eşitlik kontrolleri geçti. Mobil 0.53.0 (46), 59 paket dosyası eşleşti; yeni SQL göçü yok.
- Lint 428 mevcut hata / 162 uyarı; artış yok. Testlerdeki eski kontrol/layout harness'ine yeni dekoratif hook sınırı eklendi; eski beklemeler silinmedi. Gerçek hook ve ortak PlayLayout ayrıca davranış testinde çalıştı.
- Yerel Chrome dokunma emülasyonu: 320×568, 375×667, 414×622, 430×932. İlk iki kelime/övgü/sonraki çizim, 6. bölüm sonucu → bonus tanıtımı → bütün bonus kelimeleri → sonuç → 7. bölüm. 430 px'de azaltılmış hareket. Tahta konumu değişmedi, taşma ve JavaScript hatası yok.
- Statik tasarım tarayıcısı üç değişen dosyada bulgu üretmedi; bu araç DOM kontrastı, ergonomi veya FPS kanıtı değildir. Ekran görüntüleri ayrıca gözle incelendi.
- Fiziksel iPhone, VoiceOver, çok cihazlı canlı Arena ve native FPS bu turda denenmedi. iOS paketi hazırlanması telefona kurulum değildir. Övgünün ağ onayı eşleştirmesi ve kesinti davranışı birim/ortak bileşen düzeyinde; kamuya açık rastgele oyuncularla test yapılmadı.
- Yarım bonus kayıtları mevcut biçimde korunur. Tam uygulama kapatıp açınca otomatik bonus ekranı restorasyonu eklenmedi; normal ana yol devamı korunur, yarım bonus kendi rafından sürdürülebilir. Henüz başlamamış bonusu geçmek sahte “tamamlandı” kaydı üretmez.
- Genel içerik eğrisi ve yakın kopyalar bu pakette çözülmüş sayılmaz: editoryal kontrol hâlâ 52 rota/5 yakın kopyayı açık bildirir. Apple hesap/destek ve gerçek mağaza kabul işleri de açık.

Kanıt: `../world-review.nosync/release-0530/` (önce/sonra PNG, gerçek UI akış JSON'u, test/derleme/Worker günlükleri, yayın makbuzu). Kabul sözleşmesi: `journey-rhythm-053.md`.

## Geri dönüş

`baseline-0522.bundle` doğrulandı. Önceki kaynak `a024ff0c6878faf1160b71fe3c432bbab1fa67be`, önceki Site 108. Bu paket veri biçimi/içerik değiştirmediği için görünüm ve akış geri alınabilir; oyuncuların yeni ilerlemesi eski yedekle değiştirilmez.
