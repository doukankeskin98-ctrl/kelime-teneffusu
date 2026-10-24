# Mobil oyuncu deneyimi incelemesi

25 Ekim 2026. Başlangıç 0.8.4. Kullanıcının doğrudan geri bildirimi: mevcut ekran basit ve rahat oynanmıyor; kelimelerin tamamını görmek için kaydırma gerekiyor; öncelik profesyonel, çekici mobil UI/UX. İnceleme salt kaynak/stil üzerinden yapıldı. Kod değiştirilmedi.

## 1. Tek ekranda oynanış: hedeflerdeki iç kaydırmayı kaldır

Kaynak: `components/game/common.tsx:31-34`, `app/studio.css:28`, `app/quality.css:129-134`, `components/game/Solo.tsx:72-75`.

Kanıt: mobilde `.targets-panel` tahtanın üstüne alınırken `.word-list` için `max-height:133px;overflow-y:auto` uygulanıyor. Sonraki kalite CSS’i kelime etiketlerini, panel dolgusunu ve aralıkları büyütüyor. Başlık, süre, mesaj, hedef paneli, seçim önizlemesi, kare tahta ve kontroller toplamı görünür ekran yüksekliğine göre bütçelenmiyor. Bu, kullanıcının tarif ettiği sorunun doğrudan kaynak karşılığıdır.

Öneri: mobil PlayLayout’u kompakt bir oyun kabuğuna dönüştür. Başlık ve gerçek ilerleme tek dar HUD, altında tüm kelimelerin sığdığı düzenli 2/3 sütunlu hedef alanı, merkezde kalan yüksekliğe uyan kare tahta, altta 44 px kontroller. Varsayılan modda hedeflerde iç scroll kaldırılmalı. Normal bölümler için `dvh` ve kalan yükseklik esaslı tahta sınırı kullan; metin büyütme, zoom ve olağandışı uzun klasik içerikte okunabilirliği küçülterek kurtarmaya çalışma, güvenli doğal taşma sun.

Kabul: 360x740 ve 390x844 görünümde standart/rota/günlük 5-10 hedefli tahtalarda başlık, bütün hedefler, tahta ve kontroller aynı görünür alanda; hedef listesinde scroll yok; 320 px ve büyük yazıda kesilme yok. Ekran döndürme, klavye odağı, iki uca dokunma ve zoom korunsun. Arena aynı ortak bileşeni kullandığından skor/geri dönüş alanları ayrıca kontrol edilmeli.

Etki yüksek, maliyet orta, risk orta. Tahta boyutu değişince koordinat eşlemesi mevcut DOMRect üzerinden çalışıyor; etkileşim gözlemi yine gerekli.

## 2. Görsel hiyerarşi ve ödüllendirici geri bildirim

Kaynak: `components/game/common.tsx:27-37`, `components/game/Board.tsx:32-36`, `components/game/Solo.tsx:39-49,77`, `app/studio.css:16-17`.

Kanıt: mevcut renkler ve satır çizgileri tutarlı fakat oyun görünümü çok sayıda ayrı açıklama/panelden oluşuyor. Başarılı kelime için yazı, çizgi ve kısa etiket animasyonu var; ilerleme ile ana etkileşim alanı görsel olarak yeterince birleşmiyor. Bu değerlendirme kullanıcı geri bildirimine dayanan tasarım hipotezidir, davranış ölçümü değildir.

Öneri: krem/orman yeşili/altın kimliğini koruyarak daha canlı doygun vurgu, yumuşak hacimli tahta çerçevesi, belirgin oyun kontrolleri ve yuvarlak hedef kapsülleri kullan. Seçim sırasında aktif harf önizlemesini netleştir; kelime bulunduğunda hedef kapsülü, çizgi ve ilerleme tutarlı kısa geçişle cevap versin. Gerçek tamamlanmada hafif kutlama; yeni puan, para, seri baskısı veya uydurma ödül ekleme.

Kabul: boşta, seçim, yanlış seçim, bulundu, duraklatıldı ve tamamlandı görsel olarak ayırt edilir; yalnız renk yeterli sayılmaz; reduced-motion sıfır hareket uygular; metin ve kontroller erişilebilir kalır. Ölçülmeden FPS veya oyuncu tutma artışı iddiası yok.

Etki yüksek, maliyet küçük-orta, risk düşük. Mevcut çizim/ses altyapısı yeniden kullanılabilir; bağımlılık veya yeni görsel üretim zorunlu değil.

## 3. Ana ekranı oyuna davet eden daha kısa bir girişe dönüştür

Kaynak: `components/game/Pages.tsx:24-30`, `components/game/DiscoveryStart.tsx:14-38`, `app/start.css:30-31`, `components/game/App.tsx:75-81`.

Kanıt: mobil başlangıç kartı giriş, ayrı rota kartı ve kısayollardan oluşan üç katmana ayrılıyor. Üstte ayrıca hoş geldin başlığı, ardından günlük kartlar ve uzun keşif haritası var. Var olan doğru kişisel öneri güzel bir temel, ancak ilk görünümde birden fazla çerçeve ve metin rakip oluyor.

Öneri: aynı gerçek öneri verisini koruyarak tek güçlü görsel başlangıç kartı, belirgin devam/oyna düğmesi ve daha kısa alt kısayollar kullan. Dünya sanatı ile gerçek bulunan kelime/yıldız sayısını görünür tut; oynama eylemi ilk görünümde yer alsın. Alt keşif alanlarının içerik/kimliklerini koru.

Kabul: ilk açılış ve geri dönen kullanıcı için tek ana eylem net; devam düğmesi gerçek yarım bölüme gider; Harita/Dünyalar/Arena bağlantıları çalışır; ilk görünümde oyun çağrısı kaybolmaz; hiçbir kayıt/ödül kuralı değişmez.

Etki orta-yüksek, maliyet küçük, risk düşük. Bu tur 1 ve 2 önceliklidir; kapsam büyütmeden 3 uygulanabilir.

## Doğrulama sınırı

Fiziksel cihaz veya tarayıcı ekran görüntüsü incelenmedi. Görsel kalite, dokunma doğruluğu ve tam ekran sığma bu günlükle doğrulanmış değildir. Koordinatör destekli önizleme ve zorunlu repo kontrolleriyle kabulü ölçmelidir. Bu dosya dışında değişiklik yapılmadı.
