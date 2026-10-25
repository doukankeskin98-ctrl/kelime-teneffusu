# Odak kararı ve uygulama öncesi kabul · 25 Ekim

Girdi: güncel 0.11.0 kaynak, bakım başlangıcı, iki sınırlı uzman. Deneyim incelemesi iç kelime kaydırmasının giderildiğini doğruladı; indirilmiş bölüm bekleyişini ve tanımdan cevaba geçen kart yüksekliğini açık buldu. Güvenilirlik incelemesi cached yolun iki seri GET beklediğini ve Solo'nun external.save'i yalnız ilk açılışta okuduğunu doğruladı. Eski kayıt kuyruğu korumaları yerinde; yeni P0/P1 bulunmadı.

Seçim: **doğrulanmış cihaz tahtasıyla hemen başlama**. Kullanıcıya beklemeden oynama faydası, kaynaktaki açık seri ağ engeline doğrudan bağlı. Yeni harita/mekanik veya görsel yenileme yapılmaz. Tanım kartlarının sabit yüksekliği ve arşiv dönüşü sonraki işlerdir. Gerçek telefon kanıtı engeli açık kalır.

## Kabul

1. `matchingCachedChapter` doğrulamasından geçen tahta varsa cihaz kaydıyla Solo açılır; public tahta veya ilerleme GET'i beklenmez. Bozuk/eksik/hash'i farklı tahta bu yola giremez. İlk indirmede mevcut tahta GET yolu ve açık hata/yeniden dene korunur.
2. Cached hesap eşitlemesi mevcut `expectedOwnerId` korumalı merge PUT'uyla arka planda başlar. Sunucu hem geçmiş kelimeleri hem cihaz kaydını birleştirir; ek servis, endpoint veya göç gerekmez. Hesap başına açılışta en fazla bir başlangıç PUT'u; mevcut oran sınırı geçerli. Soğuk açılışın özel progress GET'ine de isteğe bağlı beklenen sahip kontrolü eklenir.
3. Başarılı PUT onayı mevcut oynanabilir turla functional merge edilir. Key değiştirip Solo'yu yeniden başlatma yok. Yeni kelimeler, ipuçları, geçen süre ve en iyi tamamlanma korunur; gerçek onaydan önce hesapta kayıtlı denmez. Başka hesaba geçen, ayrılan, iptal olan veya zaman aşımındaki kanal aktif tura snapshot veremez.
4. Solo zamanı eski efekt bazından geri alınamaz: geç bulut süresinden sonra tick ilerler. Kabul edilmiş yeni seçim functional append kullanır; cloud merge ile aynı aralıkta yeni kelimeyi düşürmez. Yardım açıkken eşitleme tamamlarsa üst üste sonuç penceresi açılmaz.
5. Tekrar turu tarihsel tamamlanmış snapshot'ı canlı oyuna almaz. Queue tarihsel iyi sonucu saklarken tekrar boş başlar ve kendi hamleleriyle ilerler. Bulut başlangıcı kesinleşmemiş ilk cached turda “yeni kişisel en iyi” iddiası bastırılır; onaylanmış kayıtla sonraki tekrarın karşılaştırma temeli açılışta sabitlenir.
6. Önceki 12 kuyruk/hesap/depolama/çevrimdışı regresyonu davranışlarını korur; cached timeout testinin eski bekleme varsayımı yeni anında açılış kabulüne dönüşür. Gerçek PublishedPlay ve Solo gövdeleri yalıtılmış hook/IO/zamanlayıcılarla sınanır. Bunlar DOM/gerçek React/telefon/FPS kanıtı değildir.
7. Bugünün iki değişmez snapshot'ı, ana sayfa/arşiv/dünya filtresi, kaynak kimlik/hash/iki çapraz eğim ve 20 alternatif doğrulanır. Eski tahtalar, atlas satırları, ödüller, hesap/puanlar ve göçler değişmez.
8. İçerik/tip/test/üretim derlemesi/Worker HTTP, son bağımsız diff, GitHub CI ve tam kaynak eşleşmesi geçmeden yayın yok. Aynı public URL ve ücretsiz yapı korunur. Sonuçlar gerçek araç yanıtlarıyla doğrulanır.
