# Oynanış ve dünya akışı: sınırlı inceleme

25 Ekim 2026. Kullanıcı yeni yönlendirmesi: kozmetik düzeltme yeterli değil; eğlenceli ve profesyonel oyun akışı gerekiyor. Tarihli yeni bölümler ayrı raf yerine ait oldukları dünya/bölüm yapısına katılmalı. Yalnız kaynak incelemesi; uygulama değişmedi.

## 1. Oyuncunun seçebildiği, tahtaya bağlı küçük keşif hedefi

Kaynak: `components/game/Solo.tsx` içindeki `board`, `save.strokes`, `commit`, sonuç penceresi; `lib/game/engine.ts` Puzzle/Stroke modeli.

Bugün tüm hedefler aynı kelime-listesi tamamlama döngüsüne bağlanıyor. Üç küçük seçenek sun: “İlk 3 kelime”, “Uzun kelime avı”, “Çapraz keşif”. Oyuncu seçmeden oyun başlayabilmeli; hedef zorunluluk veya ödül şartı değil. İlk üç hedefi `min(3, board.targets.length)` adet gerçek bulunan hedefle ölç; uzun hedefi tahtadaki en uzun `target.text` uzunluğuna sahip kelimelerden herhangi biriyle; çapraz hedefi gerçek kabul edilen çizginin iki eksende de değişmesiyle ölç. Tahtada çapraz yerleşim yoksa bu seçenek gösterilmez. Uzunluk Türkçe Unicode karakterlerinden sayılmalı; uzun isimlerin parça hedefleri açık anlatılmalı.

Mevcut stroke verisinden türet, yeni para/puan/kayıt şeması ekleme. Yanlış seçim, ara verme ve ipucu mini hedefi düşürmez. Bir kez elde edilen hedefi kısa, metinli başarıyla kutla; tamamlanmış eski kayıtta yeni kazanım animasyonu çalıştırma. Tutorial ve rekabetçi günlükte ilk sürümde bu seçenekleri gösterme; standart, rota ve yayımlanmış solo bölümlerde uygula.

Kabul: her hedef gerçek board/strokes ile belirlenir; tekrar/tersten aynı hedef iki sayılmaz; alternatif geçerli çapraz çizgi başarı sayılır; kayıt devamında durum doğru görünür; ipucu/yıldız ve rekabet skoru değişmez. Hedef çubuğu mobil sığma bütçesini bozmamalı. Etki yüksek, maliyet orta, risk düşük-orta. Eğlence artışı hipotez, oyuncu testi yapılmadı.

## 2. Tek dünya kataloğu: yeni bölümler ait oldukları dünyada

Kaynak: `components/game/Pages.tsx:Explore`, `components/game/App.tsx` tema penceresi, `components/game/PublishedChapters.tsx`, `lib/studio/releases.ts:releaseCatalogue`.

Bugün Explore sırasıyla başlangıç, DailyDiscoveries, harita, PublishedChapters ve 16 dünya kataloğunu gösteriyor. Yeni içerik mevcut dünyalardan ayrı sunuluyor. Ana ekranı kısa devam kartı + dünyalar + katlanabilir/ayrı harita düzenine indir. Yeni bölümleri `spec.themeId` ile dünya kartına ve o dünyanın bölüm seçicisine bağla; örneğin “6 klasik · 2 yeni keşif”. Dünya açılınca ilgili kalıcı yeni bölümler, rota ve standart bölümler tek yerde bulunsun. Son eklenenlere dünya kartında küçük gerçek tarih/yeni etiketi yeterli; ikinci dev raf oluşturma.

Kritik sınır: yeni bölümleri sabit beşli rota kümesine ekleme. Kimlik/tahta/tohum, `chapter_saves`, tarih çifti damgası ve mevcut dünya açılışları aynı kalmalı. Katalog sayfalaması tüm eski bölümlere erişim sağlamalı; sadece ana sayfaya gelen son iki summary’yi tüm katalog sanma. Bilinmeyen veya yüklenmeyen ilerlemeyi sıfır diye gösterme.

Kabul: her yayımlanmış bölüm doğru dünyadan açılır; yeni bölüm eklemek eski kazanımı kilitlemez; önceki tarih ve sayfalara erişilir; dünya kartı ve picker aynı veriyle sayar; bölümden geri dönüş seçilen dünyaya gider. Etki yüksek, maliyet orta, risk orta. Eski kayıt korunarak sunum bütünlüğü kurulabilir.

## 3. Sonuç ekranında tek net sonraki adım ve gerçek sosyal çıkış

Kaynak: `components/game/Solo.tsx:next` ve sonuç penceresi; `components/game/PublishedChapters.tsx:PublishedPlay` dış sonuç; `components/game/App.tsx` Arena gezinmesi.

Bugün standart/rota için Sonraki Keşif var; yayımlanmış bölümde genel eylem Keşiflerine Dön, tarih çiftindeki diğer bölüm ayrı alt sonuçta görünüyor. Aynı ekranda yarışan iki yön oluşabiliyor. Tek birincil eylem kullan: mevcut dünyadaki açık sıradaki bölüm, varsa yarım keşif, yoksa dünya seçimi. Etikette gerçek sonraki bölüm adı veya dünya adı görünsün. İkincil olarak gerçek Arena/arkadaş akışına “Arkadaşınla oyna” geçişi eklenebilir; bu bölümün karşılaşmaya dönüştüğü veya hayali skorla arkadaşın yenildiği söylenmesin.

Sonuçta gerçek bulunan kelime, ipucu/yıldız ve seçilmiş mini hedefin özeti yer alsın. Otomatik yeni bölüm başlatma, geri sayım veya seri kaybı baskısı olmasın. Tekrar Oyna ve Tahtayı İncele ikincil kalabilir.

Kabul: her modda ana düğme metni gideceği yerle eşleşir; yayımlanmış sonraki bölüm doğru `onRelated`/kayıt kanalıyla açılır; tamamlanmış bölümde tekrar pratik en iyi kaydı korur; sosyal geçiş gerçek mevcut giriş/oda akışına gider. Etki orta-yüksek, maliyet küçük-orta, risk orta.

## Devir

Önerilen bütünlük: tek dünya → seçilebilir küçük hedef → gerçek kelime geri bildirimi → anlamlı sonuç → aynı dünyada sonraki bölüm. Önce 1 ve 2, ardından 3. Kaynak incelemesi görsel, fiziksel cihaz veya oyuncu tutma doğrulaması değildir. Bu günlük dışında dosya değiştirilmedi.
