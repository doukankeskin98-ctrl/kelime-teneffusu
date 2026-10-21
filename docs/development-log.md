# Geliştirme defteri

## 21 Ekim 2026 · 0.6.0

Oyuncu geri bildirimi: önceki Markdown raporu açılmadı ve sitedeki farklar anlaşılmadı. 0.5.1 ağırlıklı olarak kayıt güvenliği ve küçük kullanım düzeltmeleriydi; kapsamlı bir görsel yenileme yapılmış gibi sunulmamalı.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Yeni bölümleri görünür kılma, uygulama içinde sürüm notları | Oyuncu ne eklendiğini hemen görür ve tek dokunuşla açar. | Bu tur seçildi. Ana sayfada iki belirgin kart, gerçek sürüm etiketi, çalışan arşiv ve dosyasız yenilik penceresi. |
| Ek bölüm kayıtlarının eşitleme durumunu düzeltme | Ağ isteği sürerken bulunan kelimeler kaybolmaz; onaylanmamış kayıt için bulutta kaydedildi denmez. | Bu tur düzeltildi. İlk bulut okumasında yerel kelimeleri yükleme sırasına alma ve geç PUT yanıtına karşı üç regresyon senaryosu. |
| Dokunmatik seçim toleransını değiştirme | Dar ekranda yanlış son harf seçimini azaltabilir. | Cihaz gözlemi olmadan değiştirilmedi. Önce gerçek çapraz sürükleme ve iki dokunuş gözlemi. |
| Kozmetik keşif odası ve ortak arkadaş gizemi | Kalıcı kişisel bağ ve ortak hedef yaratabilir. | Bu tur kapsam dışında. Önce çekirdek akış, gerçek cihaz kontrolü ve mevcut keşiflerin bulunabilirliği. |

### Uygulanan kapsam

- **Ormanın minik komşuları:** Rahat, 6 × 6, dört kelime, Hayvanlar.
- **Merak laboratuvarı:** Dengeli, 8 × 8, yedi kelime, Bilim.
- Tarih/sıra numarasından türeyen sabit kimlikler ve dondurulmuş tahta JSON'ları. Dosya `content/releases/2026-10-21.json`; aynı tarihin içeriği yeniden üretilmez.
- Ana sayfanın üstünde iki geniş keşif kartı; 0.6.0 etiketli **Neler değişti?** düğmesi; güncel ve önceki sürümün gerçek değişikliklerini açıklayan okunabilir pencere.
- **Bölüm arşivi:** kaynakta yayımlanan eski bölümler kalıcıdır. Arşiv 24'lük sayfalarla yüklenir, yükleme/hata/yeniden dene ve önbellekli çevrimdışı durumları korunur.
- Yeni bölümler mevcut ek bölüm oynatıcısını ve hesaba özel `chapter_saves` kayıtlarını kullanır. İlk indirmeden sonra son 100 tahta cihazda saklanabilir. Ana ilerleme JSON'u her gün büyütülmez; yeni veritabanı şeması gerekmez.
- İlk bulut yanıtında yalnız cihazda bulunan kelimeler gönderim sırasına alınır. PUT sürerken eklenen kelimeler sunucuda onaylanana kadar kayıt durumu beklemede kalır.
- Yönetim panelinden hazırlanmış içerik, yetki, denetim günlüğü, oyuncu puanları ve mevcut harita kümeleri değiştirilmez. Kaynak bölümlerinin kimlikleri panel taslaklarına ayrılmaz.

### Yayın ve doğrulama

İlgili doğrulamalar: 11 yeni içerik, kimlik, arşiv, kayıt sahipliği ve eşitleme senaryosu; bütün mevcut regresyonlar; içerik denetimi; TypeScript; üretim derlemesi ve iki oyunculu Worker HTTP akışı. HTTP kontrolüne ana sayfadaki iki başlık, yenilik düğmesi, arşiv ve bu bölümlerde hesaba özel kayıt eklendi.

Yerel sonuç: **88/88 test**, **26 tahta + 520 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. Son üretim paketinde iki bağımsız oyuncuyla **146 HTTP kontrolü** geçti. GitHub CI ve Sites yayın sonucu ayrıca doğrulanmadan bu kayıt tek başına canlı yayın kanıtı sayılmaz.

Tarayıcı önizleme sunucusu başlatıldı ancak destekli bulut tarayıcısı önizlemeye bağlanamadı; sonraki sayfa erişimi tarayıcı güvenlik ilkesi tarafından engellendi. Başka tarayıcı yolu veya güvenlik aşma denenmedi. Görsel yerleşim, fiziksel dokunma ve FPS doğrulanmış sayılmaz. Kaynak, içerik ve HTTP kontrolleri bu sınır açıkça belirtilerek sürdürülür.

### Sonraki öncelik

Gerçek iPhone/Android üzerinde ana sayfanın ilk ekranı, arşivden dönüş, 200% metin, ekran döndürme ve çapraz seçim. Yeni mekaniklerden önce gözlenen taşma veya yanlış seçim düzeltilmeli. E-posta sağlayıcısı hâlâ bağlı değildir; yeni üyelik kabiliyeti iddia edilmez.

## Yeniden çalışma ve yarım kalan yayını sürdürme

1. Güncel Site kaynağını aç; UTC tarihine ait dosyayı ve `RELEASE_BATCHES` kaydını kontrol et.
2. O tarihin 1 ve 2 numaralı girdileri varsa yeniden üretme. Dosya tamam ama yayın yarıda kalmışsa aynı içerik/kimliklerle doğrulama, GitHub ve Sites yayın adımlarını tamamla.
3. Yalnız bir girdi hazırlanmışsa mevcut girdiyi ve tahtasını koru; eksik sıra numarasını ekle. Testler tarih başına tam iki, bir Rahat ve bir Dengeli bölüm şartını denetler.
4. Yeni tarih için yeni snapshot dosyası ekle ve `lib/studio/releases.ts` listesine bir kez kaydet. Yayımlanmış dosyaların kelimelerini, tohumlarını, kimliklerini veya tahtalarını değiştirme.
5. `pnpm content:check`, `pnpm typecheck`, `pnpm test`, üretim derlemesi ve Worker HTTP kontrolünü geçir. Sites kaynak/paketleme yardımcısını kullan; GitHub ağacını aynı kaynak ağacıyla eşleştir ve CI sonrası birleştir.
6. Sites'in başarılı yayın sonucu ve gerçek adresi son doğrulamadır. Kaynak kaydının varlığı tek başına yayın başarısı değildir. Bir sonraki çalışmada kaydedilmiş sürümü ve canlı yayını birlikte kontrol et.
