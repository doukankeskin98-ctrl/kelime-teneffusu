# Paket kapsamı ve ertelenen işler

## Bu pakette uygulanan

Koyu ve kalıcı boot; güvenli soğuk/sıcak davet yönlendirme çekirdeği; Türkçe proje dili; yeni kullanıcı ses/titreşim açık (eski tercih aynı);9 kısa CC0 ses; yanlış çizimde kısa yerinde geri bildirim;240ms altında dokunmayla kesilen giriş;280ms dokunmayla kesilen dönüş; sabit sonuç başlığı ve erişilebilir footer/art; tek satırlık bloklamayan dünya karşılaması; Saklı kelime ad tutarlılığı; hazır açık gruba5sn otomatik başlama ve ayrılma/stale kilitlenme koruması; canlı rakip kelime sayısı; lobide bildirme için ayrılmış alan; altı kapalı rev2 aday ve prose/target/yerleşim/eğri kapıları.

## Kullanıcı seçimi / hesap / fiziksel kanıt isteyenler

- İkon: kullanıcı C / tek K yönünü seçti. Web ikonları ve iOS 1024 px ikon uygulandı; üç yönün 1024/180/120/60 px önizlemeleri saklandı. Rakip ikonları kullanılmadı.
- Harita: kullanıcı yakın dünyalarla başlayan görünümü seçti. Mevcut seçicinin yerine uygulandı: yakın dünyalar → dünyanın altı bölümü; tüm 52 dünyaya ayrı erişim. Kilitler, bölüm numaraları ve ilerleme değişmedi.
- Kayıtlı rakip:ayrı dosyada açık kimlikli, isteğe bağlı geçiş; veri/izin tasarımı onaylanmadan yeni ortak havuz yok.
- Universal links:JS yönlendirme var; TeamID/AASA/entitlement ve imzalı cihaz deneyi yok.
- Destek/gizlilik:taslaklar var; gerçek yayıncı/kanal yok, otomatik destek gönderimi yok.
- GameCenter:köprü kapalı; AppStoreConnect ve cihaz kabulü yok.
- Hatırlatma / StoreKit: yerel iOS köprüsü uygulandı. İsteğe bağlı sessiz günlük bildirim izni ve aç/kapat simülatörde denendi. StoreKit yalnız uygun doğal bölüm sonunda, üç ayrı kullanım gününden sonra istenir; sürüm ve 120 günlük bekleme sınırı vardır. Apple pencereyi göstermeyebilir. Gerçek bildirim teslimi, saat dilimi geçişi ve StoreKit mağaza davranışı fiziksel test bekler.
- Rev2/v3:mevcutonaylıaşamalıplankorunur; altılı içerik telefonda/oyuncuda kabul edilmedi, flagsfalse.
- Arşiv/TestFlight/AppStore:simülatör derlemesi dağıtım imzası değildir; hesap ve açık yükleme kararı gerekir.

## Ses kalitesi sınırı

`public/audio/interface-v1/sources.json` kaynak, hash ve işleme bilgilerini içerir. KenneyInterfaceSoundsCC0,9dosya87.698bayt; .019–.501sn, gerçekPCM tepe≤.251. Yükleme/çözme çizim olayından ayrı ve birkez; dosya yoksa sonlu eski efekt devreye girer. Ambiyans yok. Bunlar fiziksel hoparlör/kulaklık/sessiz anahtarı veya öznel beğeni kanıtı değildir. Sesi kapatmış mevcut kayıt aynen kapalı kalır.

## Sonraki işlerin kapsam tahmini (garanti değil)

| İş | Tahmini odaklı iş | Çıkış kanıtı |
|---|---|---|
| Moderasyon/destek operasyonu ve politika son hali |1–2gün + hukuki inceleme| Gerçek iletişim, cevap, silme ve saklama deneyi |
| Hatırlatma ve StoreKit cihaz kabulü | 0,5–1 gün + takvim günü deneyi | Bildirim teslimi, saat dilimi, red/kabul/geri çekme/arka plan ve StoreKit |
| Kayıtlı rakip güvenli genel havuz |2–4gün| Paylaşım izni, silme/engelleme, atomik eşleşme yarışı |
| 20 içerik rotasının yazar düzenlemesi |Rota başına0,5–1gün + oyuncu turu| Tema/tekrar/yük eğrisi ve gerçek oynama |
| Büyük CSS/JS paketini modlara ayırma |2–4gün| Önce/sonra transfer, native açılış, bütün modların lazy-load testi |
| Lint borcunu eritme |Dosya grupları halinde3–6gün| Baseline428/162azalır; testler değişmeden |
| iPad |3–5gün + cihaz| Ayrı ergonomi, bölünmüş ekran, VoiceOver |
| Gelir modeli/ekonomi |Önce oyuncu verisi ve tasarım; sonra ayrıpaket| Reklam/IAPbuilkpaketeyok |

## Sahne kalitesi

18 sahne52dünyada kullanılıyor.1024×1536kaynağı yalnız büyütmek yeni ayrıntı üretmez; paket boyutunu artırır. Bu tur otomatik52yüksekçözünürlüklüdosyaeklenmedi. Öncelikli özgün kompozisyon önerisi:yağmurlu orman yolu, göl kıyısında iskele, kamp ateşsiz yıldızlı vadi, dokuma tezgâhı, ışık tayfı/gözlemevi. Konu uyumu, metin kontrastı ve14:30dikeykırpma önce doğrulanır; seçilensahnelertek tek üretilir. Son native ekranlar ve sahne dosyaları ölçülmeden “retina keskinliği tamam” denmez.
