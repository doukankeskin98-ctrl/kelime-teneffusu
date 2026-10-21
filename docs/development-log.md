# Geliştirme defteri

## 21 Ekim 2026 · 0.6.1

Güncel Site kaynağı `605dcca989c7715ac866ac944e6c13b2e60c93a5`, kayıtlı 7. sürüm ve aynı içeriğin önceki başarılı yayını kontrol edildi. Bugünün **Ormanın minik komşuları** ve **Merak laboratuvarı** bölümleri zaten kaynakta ve yayında. Tarihli JSON, kimlikler, kelimeler ve tohumlar değiştirilmedi; ikinci bir çift eklenmedi.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kartlarda gerçek ilerleme ve doğrudan devam/tekrar | Oyuncu neyi bitirdiğini ve nerede kaldığını açmadan görür. | Seçildi. Yarım kart doğru bulunan kelime sayısını, bitmiş kart gerçek yıldız ve en iyi süreyi gösterir. |
| Çok aşamalı harita finali | Koleksiyon için daha uzun bir keşif hedefi sağlayabilir. | Bu tur ertelendi. Önce yeni günlük içerikteki eksik ilerleme geri bildirimini tamamla. |
| Dokunmatik tolerans ayarı | Yanlış son harf seçimini azaltabilir. | Cihaz kanıtı olmadan değiştirilmedi. Destekli tarayıcı/telefon gözlemi bekleniyor. |

### Uygulananlar ve kabul ölçütleri

- Ana sayfa ve her iki ek bölüm kataloğunda **Kaldığın yerden**, **Tamamlandı**, kazanılmış yıldız ve gerçek en iyi süre. Hiç kaydı alınamayan kartta uydurma sıfır veya yeni oyun iddiası yerine **Keşfi aç** ve yükleme/çevrimdışı/hata açıklaması.
- **Bir daha keşfet**, sonuç ekranını tekrar açmak yerine boş bir tur başlatır. Sonraki tekrarlar da güncel en iyi kaydı karşılaştırma temeli olarak kullanır; ödül veya rekabet puanı eklemez.
- Kartlar önce bu hesabın doğrulanmış cihaz tahtasını okuyabilir; bulutla geçerli hedef kimlikleri üzerinden birleştirilir. Başka hesabın cihaz anahtarı okunmaz. Hesap değişiminde istek iptali ve eski yanıtı yok sayma uygulanır.
- Hesaba özel toplu okuma en fazla 24 bölüm kabul eder. İstemciden gelen kullanıcı kimliği kullanılmaz. Taslaklar görünmez; arşivlenmiş, önceden yayımlanmış bölümlerin ilerlemesi korunur. Kart yanıtında yalnız hedef kimlikleri ve sonuç bilgisi vardır; tahta veya koordinatlar verilmez.
- Mevcut bulut kayıtlarına, uygulanan göçlere veya tahta üretimine dokunulmadı. Cihaz anahtarları korunarak ortak önbellek okuma kodu ayrıldı. Yeni bağımlılık veya ücretli hizmet eklenmedi.
- On yeni regresyon senaryosu: doğru devam/bitirme metni, bilinmeyen durum, sahte veri reddi, iki cihaz birleşimi, uzun isim parçaları, hesap ayrımı, bozuk önbellek, özel toplu okuma, istek sınırları ve arşivden ilerleme.

Çıkış kapıları: tüm mevcut testler, içerik denetimi, TypeScript, üretim derlemesi ve üretim Worker HTTP kontrolü. HTTP akışına yetkisiz kart okumasının reddi, gerçek sonuç, `no-store`, kullanıcı taklidi ve istek boyutu kontrolleri eklendi. Önceki destekli önizleme erişim engelini aşacak başka tarayıcı yolu denenmedi; bu tur görsel/telefon/FPS kontrolü yapılmış sayılmaz.

Yerel sonuç: **98/98 test**, **26 tahta + 520 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı; iki bağımsız oyuncuyla **154 üretim Worker HTTP kontrolü** geçti. GitHub CI ve Sites'in gerçek yayın sonucu ayrıca tamamlanmadan bu kayıt tek başına yayın kanıtı sayılmaz.

Sonraki öncelik gerçek mobil seçim ve ekran yerleşimi gözlemi; ardından yarım kalan keşiflerin bulunabilirliği hakkında oyuncu geri bildirimi. Bu değişiklik mevcut günlük iki bölümü korur; bir sonraki tarihin bölümleri yeni, değişmez kayıt olarak eklenir.

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
