# 27 Ekim · koordinatör başlangıç ve uygulama öncesi kabul

Güncel Site24, owner/public, aynı oyun URL'si. Sites helper kaynağı `258fe66fa71b4b834abf03b6e7699f56ca85a0e4`; GitHub main `00646a4c6d26ae8360e8a5d86149bd691ee75dac` ve tam ağaç `2f00fe32f8f18845efdf122002f3463c946ea0e9` eşleşir. Kök AGENTS, README, studio-release, discovery-map, defter başı, rol kaydı/öncelikler/son koordinatör doğrulaması ve ortak bilgi okundu. Orchestrator'da IDENTITY/HEARTBEAT/PRIORITIES var; bulunmayan rol dosyaları varmış gibi sayılmadı. Bugün henüz kayıtlı kaynak çifti yok.

## Adaylar ve tek odak

1. Gerçek telefon/sağlayıcı geçişi gözlemi: yüksek değer; önceki destekli preview ERR_CONNECTION_REFUSED için somut recovery kanıtı yok. Aynı denemeyi veya alternatif server/browser'ı tekrarlayarak kredi tüketme; fiziksel cihaz ve bu doğrulama açık kalır.
2. **Ana eşitlemede süre sınırı ve ulaşılabilir retry:** doğrudan kaynak kanıtı, orta maliyet/dar kayıt riski. ProgressSync load/save'i sınırsız await eder; hiç dönmeyen istek loading/sending guard'ını sürekli tutar. Hook8sn cycle bunu açamaz; kt-sync-now ilk load başarısızken yalnız flush çağırır. Seçildi. Token/HTTP/JSON dahil beklemeyi sınırla; yerel keşifleri ve doğru ACK sınırını koru.
3. Kozmetik oda veya yeni büyük mod: çekici olabilir fakat oyuncu/cihaz kanıtı yok, daha yüksek maliyet/gerileme. Temel kayıt akışının önüne geçmez.

Tek gerçek uzman bağımsız dar güvenilirlik incelemesinde, yalnız `2026-10-27_sync-deadline-review.md` dosyasına yazar. Uygulama/test/GitHub/Sites koordinatörde. Etki beklenen oyuncu faydasıdır; retansiyon veya ölçülmüş keyif iddiası değildir. Geniş dış araştırma, yeni varlık/bağımlılık/hesap/servis/zamanlayıcı yok.

## Uygulamadan önce kabul

- Her ana ilerleme GET/PUT denemesi, token edinme/yenileme ve JSON gövdesi dahil8sn sınırında biter. Signal'i dinlemeyen callback de instance'ı kilitlemez. Her denemenin ayrı controller'ı vardır; timeout/dispose uçuşu iptal eder, timer/listener temizlenir.
- Timeout sonrasında local kayıt, yeni kelimeler ve daha iyi sonuç korunur; sunucu onayı gelmediyse saved denmez. Yeni deneme yeni signal ile yapılır; tek eşzamanlı GET/PUT sınırı korunur. Geç eski success veya owner-error yeni state/cache/status/ACK'ı değiştiremez. Sonsuz anlık retry döngüsü yok; mevcut8sn/online ve açık kullanıcı eylemi kullanılır.
- Sahip değişimi guard'ı, özel409 code'u ile normal conflict409 ayrımı, dispose/current predicate ve storage-error üstünlüğü korunur. Aktif turda reload veya sahte saved sunulmaz; pagehide keepalive boyut sınırı aynı.
- `kt-sync-now` connect+flush dener; ilk GET kesintisinden sonra da işler. Albümde bekleyen bulut kaydı mevcut durum satırında anlaşılır olur ve offline hata durumunda en az44px 'Yeniden eşitle' eylemi vardır. İlk yükleme/sending/saved/owner-blocked durumda yanlış retry veya ek modal yok.
- Yeni iki bölüm: **Mahalle maçı**, Futbol/Rahat6×6,4 hedef; **Sokakta doksanlar**,90'lar/Dengeli8×8,7 hedef. UTC2026-10-27 slot1/2 kalıcı kimliği, tarihli seed, spec/hash/sabit board ve iki çapraz eğim;20 alternatif. Aynı tarih dosyası varsa yeniden üretme, eksik kayıt/yayını sürdür. Ana sayfa/ilgili dünya/arşiv/damga API kontrolleri.
- Eski release dosyaları/ID/kelime/seed/board, engine/catalog/atlas/legacy, sabit5+1 kümeleri, reward/best/merge biçimi, DB/göç/manifest/lock korunur. Yeni release sona eklenir.
- İlgili anlamlı negatif/pozitif kabuller, tüm mevcut testler, güncel içerik denetimi, typecheck, final production build, Worker HTTP, CI ve tam GitHub/Sites ağaç eşleşmesi geçmeden aynı adrese yayın yok.

Son haftalık inceleme24Ekim;31Ekim/sonraki uygun mevcut çalışmada. Gerçek telefon/DOM/büyük sistem yazısı/provider timing/React concurrency/PWA/FPS/App Store hazır oluşu bu kaynak/VM/HTTP kontrolleriyle tamamlanmış sayılmaz.
