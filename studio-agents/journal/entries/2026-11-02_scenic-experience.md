# 2 Kasım 2026 · Sahne, tahta ve yolculuk deneyimi

Salt okunur uygulama incelemesi; başlangıç Sites HEAD `764a7e7`. Koordinatörün gerçek iPhone yansıtma gözlemleri girdi olarak kullanıldı. Bu uzman tarayıcı veya telefon çalıştırmadı; uygulama kodu ve kayıtlar değiştirilmedi. Kullanıcı geniş yenilemeye izin verdi; aşağıdaki tek odak, ana ekran → oynama → sonuç boyunca aynı görsel dünyayı kurmaktır. Keyif/tutma etkileri tasarım varsayımıdır.

## 1. Sahne kartı yerine oyun boyunca devam eden dünya; tahta bütçesini koru

- Kaynak: `components/game/JourneyHome.tsx:29`, `components/game/StoryExperience.tsx:31-36`, `components/game/common.tsx:76-98`, `components/game/App.tsx:107-110`; `app/living-stories.css:6-9`, `app/main-journey.css:14-19`.
- Bulgu: Ana yolculuk resmi panorama kartıyla sınırlı. Hikâyede aynı resim HUD içinde 137px (masaüstünde 160px) ayrı blok; oyun kökü düz renk. PlayLayout'ın scene/theme girdisi yok. Sonuç native dialog içinde ayrıca krem yüzeydir. Yalnız home görselini iyileştirmek, kullanıcının açıkça istediği oynarken sahnenin içinde olma hissini kurmaz.
- Öneri: Bölümün sabit temasından türeyen tek sahne ana ekranda, aktif oyunda ve sonuçta sürsün. Ortak dekoratif katman ölçülen HUD/tahta akışının dışında ve `pointer-events:none` olsun. Hikâye HUD'ında ikinci büyük resim yerine kısa adım sayacı/son keşif geri bildirimi kalsın. Gerçek hikâye aşaması, yalnız doğrulanmış strokes üzerinden devam etsin; sıradaki cevaplar sahne alt yazısı veya erişilebilir ada sızmasın. Sonuç dialogunun top-layer olması nedeniyle aynı sahneyi görünür bırakmak/taşımak ayrıca tasarlanmalı; sadece sayfa arka planına güvenilmemeli.
- Etki/kanıt/maliyet/risk: Kullanıcının önceliğine doğrudan karşılık, bileşen kanıtı yüksek, maliyet orta. Risk: zengin resim üstünde başlık/hedef okunmazlığı ve büyük HUD yüzünden yeniden küçük tahta.
- Kabul: En az iki farklı dünya ve bir hikâyede home → play → result aynı sahne kimliğini gösterir. 360×568 ve 414×622'de normal ve bilmeceli görünümde tüm tahta satırları ve alt kontroller görünür; hedef metni kırpılmaz. 200% yazıda doğal erişilebilir taşma korunur. Sahne animasyonu azaltılmış hareket tercihini izler, dekoratif katman harf seçimini yakalamaz. Sonuç CTA ve kapatma/tahtaya dön eylemi kısa ekranda erişilir.

## 2. Tahtayı sadeleştirirken kare varsayımını CSS ile bozma

- Kaynak: `lib/game/viewport.ts:34-50,77-94`, `components/game/Board.tsx:19,73-74`, `components/game/common.tsx:78-83`; `app/viewport-arena.css:30-40`, `app/clear-play.css:10-29`, `app/layout.tsx:2-21`.
- Bulgu: Tahta piksel yüksekliği doğrudan genişliğe eşitleniyor; SVG koordinat sistemi `size × size`, ölçüm ve input aynı kare geometriye dayanıyor. Ayrıca yerleşim çok sayıda ardışık CSS dosyasınca değiştiriliyor. Referanstaki 6×7 veya7×8 tahta, bu sözleşmede salt CSS esnetmesiyle güvenli kopyalanamaz. Harflerin arkasında yeni bir görsel/gradient göstermek de beyaz tek yüzeyin okunurluk faydasını kaybettirir.
- Öneri: Bu yenilemede yayımlanmış tahtaları ve onların kare koordinatlarını koru; tahta çevresindeki çok katlı kart/padding/gölgeleri kaldır, seçili ve bulunan kelime kapsüllerini tek açık yüzeyde belirgin tut. Dikdörtgen yeni içerik eklenecekse ayrı sürümlü yeni tahta olarak generator, matcher, input, SVG ve fitter birlikte ele alınmalı; eski tahtaları yeniden üretmemeli. Sahne stili açık bir sınıf altında son sırada yüklensin; Arena gibi farklı kökteki ekranları global seçiciyle istemeden değiştirmesin.
- Etki/kanıt/maliyet/risk: Geometri riski doğrudan kaynakla kanıtlı. Sunum sadeleştirme düşük/orta maliyet; yeni dikdörtgen format yüksek uyumluluk ve test maliyeti. Eski kayıtları korumak bu tur önceliklidir.
- Kabul: Sürükleme ve iki uca dokunmada yatay/dikey/iki çapraz eğim aynı doğru hedefi seçer. Renkli izin merkezleri harf merkezleriyle örtüşür; alt/sağ son hücreler seçilebilir. Hint veya found durumunda tahta yer değiştirmez. Normal/bilmeceli/Arena ekranlarında 44px araç erişimi ve okunaklı hedefler kalır. Eski 12×12 aktif snapshot içeriği ve tüm katılımcılar için ortak tahta korunur. Gerçek parmak/Safari testi ayrıca gerekir.

## 3. Yeni bölge beklentisini gerçek kayıtla göster; ana CTA tekrar oyununa düşmesin

- Kaynak: `components/game/JourneyHome.tsx:18-36`, `components/game/StoryExperience.tsx:22-28`, `components/game/Solo.tsx:116-149`, `lib/game/main-journey.ts:29-55`.
- Bulgu: Ana yolculuk gerçek yarım kayıt ve ilk açık eksik bölümden ilerliyor; bu korunmalı. `nextMainMilestone` gerçek kapılardan hesaplama yapıyor ancak home'da yalnız metin olarak sunuluyor. Hikâye rafı bütün hikâyeler bitince `LIVING_STORIES[0]` fallback'ine dönüyor; doğru biçimde 'Yeniden canlandır' dese de büyük birincil CTA tekrar olmuş oluyor. Bu, kullanıcının sürekli aynı oyunla karşılaşma algısını yeniden güçlendirebilir.
- Öneri: Mevcut gerçek milestone'ı sıradaki bölgenin resmi ve anlaşılır kalan bölüm sayısıyla göster. Sonuçta önce açılan dünya/gerçek parça ve tek devam eylemi; ayrıntılı istatistikler ikincil alanda olsun. Beş hikâye bittiğinde büyük CTA ana yolculuğun gerçek yeni/yarım bölümüne veya yeni keşiflere götürsün, hikâyeyi yeniden oynama koleksiyonda açıkça kalsın. Sunucu Arena geçmişi ve kayıt formatına dokunma; bölge görseli için ayrı ilerleme sayacı yaratma.
- Etki/kanıt/maliyet/risk: Doğrudan kayıt akışı kanıtı; orta maliyet. Risk: görsel doluluk/ilerleme çemberinin gerçek 3/5/6 kapıları yerine uydurma lineer sıra göstermesi veya yeniden oynama halinde ödülü iki kez kazanılmış gibi sunması.
- Kabul: Boş, yarım, dünyayı yeni açmış, tekrar oynayan ve beş hikâyeyi bitirmiş kayıtlarda ana CTA doğru eylemi seçer. Reload sonrasında aynı yarım kayıt korunur; tamamlanan bölüm yeni keşif diye gösterilmez. Milestone resmi/başlığı/kalan sayısı aynı gerçek dünya kapısından türetilir. Tekrar oyununda kazanım sayısı artmaz. Hesap değişiminde başka hesabın devam ekranı görünmez.

## Doğrulama sınırı

Bu belge kaynak incelemesidir. Görsel önizleme, gerçek cihaz, ses/titreşim, FPS veya kullanıcı tutma ölçümü değildir. Koordinatörün üretim build/Worker/CI ve dokunma/yerleşim kabulünden sonra uygulanmış kapsam ayrıca kaydedilmelidir.
