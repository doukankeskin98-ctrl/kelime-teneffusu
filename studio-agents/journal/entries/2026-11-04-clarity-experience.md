# Harf netliği ve Koleksiyon bütünlüğü — deneyim incelemesi

- Tarih: 2026-11-04
- Rol: experience; uygulama salt okunur.
- Kaynak tabanı: `bc998c6` (`/private/tmp/kt-device-settings-fix`).
- Kullanıcı görselleri: koordinatörün ilettiği `1-Fotoğraf-1.jpg` (Journey), `2-Fotoğraf-2.jpg` (Arena), `3-Fotoğraf-3.jpg` (Koleksiyon), `/tmp/codex-remote-attachments/01a1930c-cacd-7d42-913b-095633ca312a/D893BFC7-B725-4468-AC73-45F5B5BF8133/` altında yerel olarak görüntülendi. Bunlar kullanıcı ekran görüntüleridir; canlı telefon/browser denemesi yapılmadı. Bu üç görselde oyun tahtası veya hedef kelime listesi yoktur; harf silikliği bu fotoğraflardan ölçülmedi.
- Korunacaklar: bütün ilerleme/metadata/tahta/kimlik/ödül ve haptics davranışı; `lib/game/word-feedback.ts:5` içindeki 720 ms uçuş, 180 ms varış ve 1040 ms sonuç gecikmesi. Yeni font, varlık veya bağımlılık önerilmedi.

## 1. Harf ve hedef metninde son tipografi kuralları gerçek metne her modda ulaşmıyor

**Kök neden ve kaynak:** `app/scenic-journey.css:19` içindeki `.game-app .scenic-play .letter-grid span` doğrudan Arial/750 tanımlıyor. Daha sonra gelen `app/studio-polish.css:25` içindeki `.scenic-play .letter-grid>span` mevcut Teneffus fontunu ve 700 ağırlığını tanımlasa da daha düşük seçici gücü nedeniyle `.game-app` içindeki Solo'da bunu geçemiyor. Arena'nın ana kabuğunda `.game-app` yok (`components/game/App.tsx:123`), dolayısıyla aynı son kural orada farklı sonuç veriyor. Ayrıca `app/studio.css:16` içindeki `.word-tag>div{font-weight:650}` görünür hedef metninin kendi ağırlığı; dış `.word-tag` için sonradan yazılan 700 değeri (`app/studio-polish.css:33`) bu çocuğu değiştirmiyor. Mobil etkin hedefin kendi `strong` öğesi de `:38` üzerinde 650 ağırlıkta. Bu, kaynakta kesin bir modlar arası tipografi farkıdır; kullanıcının algıladığı silikliğin tek sebebi olduğu cihaz ölçümüyle kanıtlanmış değildir.

**Minimal öneri:** En son netlik katmanında doğrudan `.letter-grid>span`, `.word-tag>div` ve `.mobile-target-card>strong` için tutarlı mevcut font ve koyu mürekkep tanımlamak. Harfler için 800, etkin hedefler için 750/800 mevcut variable font aralığında kalır (`app/typography.css:1-21`). Boyut/tahta geometrisini değiştirmeden normal harflerde koyu yeşil, bulunan hedeflerde de hâlâ okunur bir ikincil yeşil kullanılmalı. Bulundu işareti/üstü çizgi korunmalı; netlik için bütün `.word-tag` opaklıklarını zorlamak uçuş/varış durumunu bozabileceğinden önerilmez.

**Kabul:** Solo ve Arena'da aynı hücre ve hedef metni için computed font-family/weight aynı; beyaz, ceviz, adaçayı ve kum tahtalarında harfler, seçili/ipuçlu/bulunmuş haller okunur. Hedef ve harflerin kutu ölçüleri değişmez. 720/180/1040 ms hareketi, gizli hedefler ve reduced-motion yolu etkilenmez. Gerçek telefon okunaklılığı ayrı görsel kabul gerektirir.

## 2. Koleksiyon ayrı açık tema kabuğunda ve eski yüzey renklerinde kalıyor

**Kök neden ve kaynak:** `components/game/App.tsx:123` `native-scene` sınıfını yalnız Yolculuk ve canlı Arena'ya ekliyor. Koleksiyon `native-shell` tabanını alıyor: krem arka plan, yeşil üst bar, açık alt gezinme (`app/game-shell.css:2,5,10-18`). İçerik de aynı açık temaya bağlı: başlık/özet renkleri `app/studio-polish.css:63`; albüm kartı ve kapalı mozaik yüzeyleri `app/discovery.css:17,24`; tarihli hatıralar `app/releases.css:43-50`. Üçüncü görseldeki açık sayfa, ilk iki görselin sahneli kabuğundan bu nedenle kopuyor; yalnız bir yüklenmemiş arka plan resmi değildir.

**Minimal öneri:** Koleksiyon'a sakin mevcut bir SceneArt ve koyu yeşil/mavi kabuk uygulamak; bunu içerik rafları için ayrılmış `native-collection` benzeri bir sınıfla sınırlamak. Yalnız `native-scene` eklemek yetmez: bu sınıfın `main-content` kuralı (`game-shell.css:14`) Journey için padding/max-width düzenini değiştirir. Koleksiyon içerik genişliği, yatay albüm kaydırması ve dikey kaydırması korunmalı. Dünya albümleri, hikâye kartları, tarihli raflar, profil/istatistik ve başarı bölümünde ortak koyu yüzey + açık ana metin + okunur ikincil metin kullanılmalı; bütün sayfaya körlemesine `color:inherit` uygulanmamalı. Modal içerikleri mevcut okunaklı açık yüzey olarak kalabilir.

**Kabul:** Yolculuk → Arena → Koleksiyon geçişinde üst/alt gezinme aynı görsel ailede kalır. Fotoğraftaki dünya albümü yapısı ve gerçek parça durumları korunur. Sadece ilk raf değil profil açılımı, hikâye hatıraları, tarihli damgalar ve sayfa sonu ayarlar da koyu zeminde okunur. Parçalar → Bölümler, hesap, yayınlı bölüm ve geri dönüş yolları aynı çalışır; son içerik alt gezinme altında kalmaz.

## 3. Sahneli alt menüde eski seçili ikon dolgusu yaşamaya devam ediyor

**Kök neden ve kaynak:** İlk iki görselde seçili Yolculuk/Arena ikonunun arkasındaki soluk dolu blok görülüyor. Yeni seçili düğme renkleri `app/game-shell.css:18` ve `app/studio-polish.css:13` üzerinde olsa da ikonun eski `fill:#e6ebd8` (`app/game.css:12`) ve `background:#e0efcb; box-shadow:0 0 0 7px #e0efcb` (`app/mobile-game.css:14`) değerleri sıfırlanmıyor. Sonuç: koyu sahneli sekme ile eski açık tema ikon rozeti birlikte çiziliyor.

**Minimal öneri:** Ana alt gezinmede ikonların fill/background/box-shadow değerini açıkça sıfırlayıp ortak stroke dili kullanmak; seçili durumu düğme yüzeyi ve altın ikon/metin rengiyle göstermek. Aynı yaklaşım Koleksiyon'a da uygulanmalı. Mevcut ikonlar ve düğme dokunma alanları korunmalı.

**Kabul:** Üç ana sekmede seçili ikonun şekli dolgu bloğunun içinde kaybolmaz; durum renk dışında mevcut aktif düğme yüzeyi ve etiketle anlaşılır. Klavye odağı, safe area ve 44 px üzeri dokunma alanları korunur. Haptics ve nav callback'leri değişmez.

## Doğrulama sınırı

Bu tur yalnız kaynak ve sağlanan üç statik görsel incelendi; uygulama/test/browser değiştirilmedi veya test çalıştırılmadı. Canlı computed-style, kontrast oranı, font rasterizasyonu, tahta rahatlığı, VoiceOver, fiziksel iPhone akıcılığı veya FPS sonucu üretilmedi. Koordinatörün ilgili 320/414 önizleme ve davranış kontrolleriyle son renk/kalınlık kararı doğrulanmalı. Görseller mevcut Journey/Arena sahnelerinin beğenildiği yönü destekliyor; yeni bütün proje tasarımı gerektirmiyor.

## Uygulama sonrası dar kaynak kontrolü

`app/clarity.css`, App ve Pages deltası okundu; uygulama/test/browser değiştirilmedi. Son harf kuralı artık `.game-app .scenic-play .letter-grid>span` kapsamına sahip, gerçek hedef çocuğu ağırlığı miras alıyor. Koleksiyon sahnesi içerik genişliği/padding'iyle ayrı ele alınmış; eski aktif nav SVG dolgusu sıfırlanmış. Koordinatör fontun Teneffus/800, hedef çocuğunun 800 olduğunu ve ELMA seçiminin onaylandığını tarayıcıda gördüğünü bildirdi; bu uzmanın doğrudan gözlemi değildir.

Son kaynak kontrolünde üç kapsam açığı koordinatöre iletildi:

1. **Açık dialoglara açık mürekkep mirası:** `clarity.css:29` kabuk seviyesinde `--ink:#fff5df` tanımlıyor. `studio.css:18` `.modal` öğesinde krem `background:#fffdf4` ile `color:var(--ink)` kullanıyor. Albüm ayrıntısı, Ayarlar, ChapterPicker ve auth dialogları da bu kabuğun DOM altındadır; native top-layer CSS mirasını kesmez. Kabul: `.game-dialog:not(.scenic-outcome)` açık yüzeyinde koyu ink/muted/line değerleri korunmalı; koleksiyon için ayrı renk tokenları veya kontrollü dialog reseti kullanılmalı.

2. **Tarihli albüm seçicileri gerçek DOM'a ulaşmıyor:** `clarity.css:60` içindeki `.release-album-heading` ve `.release-album` bileşenlerde yok. `ReleaseAlbum.tsx:14` gerçek `.release-album-card`, `time`, `.release-stamp`, `.release-album-titles` ve eylem düğmesini üretiyor. Bunlar `releases.css:57` üzerinde eski krem yüzeylerdir. Kabul: tarihli rafın gerçek kart/earned/tarih/liste/damga/eylem seçicileri aynı koyu yüzey diline alınmalı; içlerinden açılan normal dialog ve yayınlı bölüm kartlarının okunabilirliği korunmalı.

3. **Hikâye sayacı ve profil açıklaması eksik hedeflenmiş:** `clarity.css:57` `.story-collection-count` mevcut değil; gerçek sayaç `StoryExperience.tsx:15` `.story-collection-heading>span`. `clarity.css:53` yalnız `.progress-cloud-status` ebeveyn rengini değiştiriyor; `.cloud-status` çocuğunun açık zemin için koyu `--readable-caption` rengi `quality.css:2,10` üzerinden doğrudan uygulanıyor. Profil içindeki `.nickname-form .muted` de aynı eski ikincil metin yolundadır. Kabul: gerçek sayaç ve profil açıklaması çocukları açık metin almalı, durum/retry metinleri koyu yüzeyde okunmalı; bunun için değiştirilen tokenlar açık dialoglara sızmamalı.

Bu not kaynak bulgularını kaydeder; koordinatörün düzeltmeleri ve alt bölüm görsel kontrolü tamamlanmadan üç nokta kabul edilmiş sayılmaz.

**İlk düzeltme doğrulaması:** Kabuktaki `--ink/--muted/--line` override'ları kaldırıldı; açık dialog token sızıntısı kaynakta giderildi. Koordinatör bu hatayı gerçek albüm ayrıntısında da gördüğünü bildirdi. Hikâye sayacı gerçek `heading>span` seçicisine alındı; `.progress-cloud-status .cloud-status` ve `.nickname-form .muted` doğrudan açık metin alıyor. Tarihli kart/earned/time/titles seçicileri artık gerçek DOM'a ulaşıyor. Bununla birlikte `.release-album-card` içindeki `.release-stamp` kendi koyu metinlerini (`releases.css:43-45,57`) hâlâ taşıdığından, bu iç katmanın başlık/kopya/eyebrow/status/rule/art renkleri için son kapsam düzeltmesi koordinatöre iletildi. Bu, ikinci bulgunun kalan kısmıdır; yeni inceleme kapsamı değildir.
