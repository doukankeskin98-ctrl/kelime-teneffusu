# Cila incelemesinin tamamlanması · 13 Kasım 2026

## Kapsam ve sınır

Kullanıcının tercihi doğrultusunda düzeltmeleri Codex tamamladı. Claude'un dokuz commit'i (`76aa196`) korunarak aynı deneme kopyasında `codex/0.48-cila-review` dalı açıldı. Başlangıç etiketi `baslangic-0.48.0` / `ce70fba` değişmedi. Ana çalışma kopyasına, oyuncu kayıtlarına ve canlı servise dokunulmadı. Yayın, GitHub aktarımı/birleştirmesi, TestFlight veya telefona kurulum yapılmadı. Paket sürümü 0.48.0 (37) bırakıldı.

## Yapılan düzeltmeler

- **Dokunma alanı çakışması:** 34 px raf satırındaki 44 px düğmeler komşu satıra 10 px taşıyordu. Bölüm 5'te son hedefler tahtaya da taşıyordu. Satırlar 44 px'e döndü. Kısa ve yoğun ekranlarda boş HUD marjı, konu başlığı dolgusu ve panel aralıkları azaltıldı; tahta hücresinin 26 px alt sınırı değişmedi. Uzun ekranlar ve çizim geometrisi değiştirilmedi.
- **Gerçek yerleşim kontrolü:** `layout-measure.mjs` hedeflerin gerçek dokunma kutularını, birbiriyle/tahtayla çakışmayı, eksik veya ekran dışı alt kontrolleri ve ayrı harf kutularının raf dışına taşmasını ölçer. Eski `layout:audit` bu ortak ölçümü kullanır. Hatalı 34/44 px örneği dahil dört bağımsız geometri testi eklendi. Eşikler gevşetilmedi.
- **Eski meydan okuma uyumluluğu:** Değişmeyen ana kopyanın `ce70fba` içeriğinden gerçek bir eski `riddle-teknoloji-1` maçı fikstürü alındı. Aynı bölümün yeni hedef koordinatları farklı olduğu için test gerçek bir göç riskini kapsar. Eski tahtayı iki oyuncu iki yönde tamamlar; yeniden katılım aynı tahtayı verir. Yeni maç yeni düzeni kullanırken eski sonuç listesi, bitiş zamanı, süre ve çizimler aynen kalır. Sunucu çalışma mantığını değiştirmek gerekmedi.
- **Doğru raporlama:** Yeni katalog meydan okumalarının 24 varyantı sunum tahtası değişikliğini alır; önceden açılmış maçlar kayıtlı içerikten devam eder. Arena, günlük ve Sprint'in bu dalda donuk kalan üretimleri ile meydan okumaların davranışı ayrıştırıldı. Tarihli üretici sınırı gereksinimi günlük bulmacaya aittir; her moda yanlış genellenmedi. Tema tahtası testi tarihi Klasik mod kapsamındaymış gibi adlandırılmıyor.

Claude'un doğal harf genişliği, gizli harf yuvaları, kelimelerin bölünmemesi, bölüm kapakları, sonuç kartı hizası, hikâye görselleri, web kurulum bandı kontrastı ve genişletilmiş hazırlanmış içerik listesi korunuyor. Yeni bağımlılık, özellik veya ambiyans eklenmedi.

## Doğrulama

- Tam test seti: **914/914**, 170 test grubu. Son CSS boşluk ayarından sonra ilgili 9 tipografi/geometri testi, ek sonuç-koruma kontrollerinden sonra 9 katalog/uyumluluk testi yeniden geçti.
- İçerik: 395 hazır güvenli düzen, 297 yazılmış tahta / 5.940 alternatif; 64 grup tahtası; 774 Arena tanımı / 963 kelime; 96 yeni yarış tahtası; 697 hızlı oyun kelimesi.
- Tip kontrolü, değişmeyen DB şeması, web ve mobil üretim derlemesi geçti. Son mobil paket: 46 eşleşen dosya, 21 sahne, sürüm 0.48.0 (37). Yalnız yerel iOS paketine kopyalandı; cihaz kurulumu yapılmadı.
- Lint koruması geçti: **0 yeni artış**. Önceden kalan 428 hata / 164 uyarı hâlâ vardır; temiz lint iddiası yoktur.
- Son üretim paketiyle **722 izole Worker HTTP kontrolü** geçti. Gerçek oyuncu veya canlı sunucu kullanılmadı.
- Destekli tarayıcı önizlemesinde mevcut arayüz üzerinden bölüm oynandı; kayıt enjekte edilmedi. 320×568'de komşu hedef seçimi, ipucu, döndürme, çok parçalı kelimeler, tamamlanma ve sonraki bölüm; bölüm 5'te yarım kayıt sonrası yeniden açılış doğrulandı. Bölüm 10, 320×568 ve 375×667'de ölçüldü. Bölüm 11'de gizli hedefin ipucu, açılma ve çizilmesi doğrulandı.

| Son ölçüm | Hücre | Yatay/sayfa taşması | Dokunma çakışması | Alt düğme sınırı |
|---|---:|---|---|---|
| Bölüm 10 · 320×568 | 26,01 px | Yok | Yok | 559,97 / 568 px |
| Bölüm 10 · 375×667 | 32,28 px | Yok | Yok | Ekranda |
| Bölüm 11 · 320×568, saklı ve açılmış hedef | 28,61 px | Yok | Yok | Ekranda |

Yerel kanıt klasörü: `../world-review/claude-0.48-cila` (depo dışındadır; deneme kopyasının kardeş dizini). Dosyalar: `codex-bolum10-320x568.png`, `codex-gizli-375x667.png`, `codex-gizli-acildi-320x568.png`, `codex-yerlesim-olcumleri.json`. Ölçümlerde tarayıcının gerçek DOM viewport'u esas alındı.

## Kalan sınırlar

- Fiziksel iPhone, parmak rahatlığı, Taptic Engine, VoiceOver ve FPS bu turda denenmedi. Tarayıcı sürüklemesi bu testlerin yerine geçmez.
- Güncellenmiş 384 ekranlık toplu `layout:audit` bu turda çalıştırılmadı. Hedefli gerçek tarayıcı ölçümleri ve denetleyici testleri yapıldı; tüm ekranlarda kusursuzluk iddiası yoktur.
- Tarihi Klasik tahtaları geniş sunum filtresine taşımak bu düzeltmenin kapsamında değildir; eski kayıt/tahta sözleşmesi korunmuştur. Yeni geniş liste bütün modlar için bir moderasyon garantisi değildir.
- Yerel mobil önizleme canlı API'ye bağlı değildir; ana sayfadaki çevrimdışı profil uyarısı bu test ortamına aittir. Gerçek iki cihazlı Arena yeniden denenmedi; izole sunucu kontrolleri geçti.
- Tamamlanan iş yerel inceleme paketidir. App Store/TestFlight ve yayın için ayrıca cihaz kabulü ve mevcut dış hesap/yayıncı koşulları geçerlidir.
