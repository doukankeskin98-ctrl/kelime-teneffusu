# 30 Ekim 2026 · Safari ve görünür oyun alanı düzeltmesi

Kullanıcının iPhone 6 Plus/Safari son satır bildirimi. Adaylar: cihaz adına özel küçültme (elenir), mevcut serbest alanı yeniden ölçmek (Safari'nin şişen flex track'ini tekrar temel alır), gerçek HUD/hedef/kontrol ölçümü + eski Safari yolu (seçildi). Tek koordinatör, dar kapsam. Kabul: son satır ve kontroller gerçek görünen alan içinde; adres çubuğu/döndürme/yazı büyütme sonrası ölçüm yenilenir; sığmayan büyük yazı doğal akışa taşar, tahta kesilmez; ResizeObserver/aspect-ratio/cqw/:has olmadan ölçüm ve kare tahta çalışır. İçerik/kayıt/ödül/Arena protokolü korunur.

Kök kusurlar: zorunlu ResizeObserver, yalnız modern CSS ölçüleri, Safari'nin büyüttüğü stage yüksekliğinden türetilen bütçe. Eski iOS için ayrıca istemci sözdizimi hedefi, kullanılan eksik API'ler, Touch Events ve native dialog alternatifi gerekir. Bunlar aynı oyun/sonuç yolunu korur; yeni bağımlılık veya ayrı oyun yok. Birincil kaynaklar: WebKit Safari 13.1 (ResizeObserver), Safari 14.1 (flex gap), Safari 15 (aspect-ratio), Safari 15.4 (viewport birimleri); Apple iOS 12.5.7 belgesinde iPhone 6 Plus bulunur. Fiziksel cihaz ve gerçek Safari kanıtı olmadan tam cihaz desteği ilan edilmez.

Yerel doğrulama: 388 test/81 grup, 56 son hedefli kontrol, tip ve 120 tahta/2.400 alternatif başarılı. Kontrollü kutu ve bileşen testlerinde son satır, toolbar/döndürme/restore, notice, büyük yazı, API'siz başlangıç, native Touch Events ve dialog fallback kapsandı. Sözdizimi guard'ının SW bulgusu düzeltildi. Fiziksel cihaz/Safari ve önceki engelli browser yolu doğrulanmış sayılmaz. Ayrıntı kısa koordinatör kaydı `2026-10-30_safari-fit.md`; son paket/CI/yayın araç makbuzları ayrıca doğrulanır.

# 30 Ekim 2026 · İnceleme dalı · Numaralı ana yolculuk

Kapsam: ana ekran → bölüm → gerçek sonuç → sonraki bölüm. Kullanıcı isteğiyle tek koordinatör; ek ajan/araştırma/tarihli içerik/yayın/birleştirme yok. Adaylar: yalnız mevcut kartı numaralandırma (yetersiz), yeni kayıt/ödül ekonomisi (gereksiz), mevcut 96 sabit bölüm ve 3/5/6 ödül kurallarını kullanan sade ana akış (seçildi).

Kabul: tek ana CTA ve yakın ödül, gerçek kayıttan devam/eksik bölüm, korunmuş ID/tahta/kazanım, sonuçta önce/sonra albüm ve tek sonraki eylem, diğer modların ikincil erişimi. İlk 10: 6/7/9 hücreyle öğrenme; 4. bölüm küçük Türkiye molası, 5. tersten arama, 6–7. Türkiye, 8. küçük Hababam molası, 9. mevcut ustalık tahtası, 10. ilk altılı albüm. Dünyalar mevcut eşiklerle 3 ve 7 sonunda açılır. Eski kelimeler ve tahtalar değiştirilmez; numara kayıt değildir, hiçbir boşluk tamamlanmış sayılmaz. Uygulama tamamlandı. 377/377 test, 120 tahta/2.400 alternatif içerik denetimi, TypeScript, üretim derlemesi ve 339 Worker HTTP kontrolü geçti. Yeni/eskiden yarım kayıt, eksik numara, ilk 10 eşikleri, gerçek Solo tamamlama→sonraki→tekrar, albüm önce/sonra, öğretici statüsü ve ana/Keşfet dönüşü test edildi. Sonlu katalogda yeni bulmaca varmış gibi tekrar sunulmaz.

Korunan içerik/motor/ilerleme/şema/göç ve Arena dosyaları başlangıçla aynı. Kaynakta ödeme, reklam, enerji, yeni bağımlılık veya göç yok. Önizleme generated eski kilit kenara alınarak başlatıldı. Önceki destekli tarayıcı bağlantı/güvenlik engelinde düzelme kanıtı yok; aynı başarısız tarayıcı yolu tekrarlanmadı. Gerçek DOM/telefon, ilk görünüm piksel sığması ve dokunma doğrulanmış sayılmaz. Kullanıcı talimatıyla yalnız inceleme dalı; Sites yayını ve GitHub birleştirmesi yapılmadı. Bu odak tamamlandı; başka geliştirme turu başlatılmadı.



# 30 Ekim 2026 · 0.15.0 · Ekrana uyum ve kesintisiz grup Arena

Kullanıcının üç somut isteği birlikte uygulandı. Önceden alınan odak/kabul kararı `studio-agents/journal/entries/2026-10-30_arena-fit-decision.md`. Adaylar: yalnız tahta küçültme (yetersiz), yalnız oyuncu limitini kaldırma (iki kişilik protokol nedeniyle hatalı), ölçülen ortak çerçeve + grup protokolü + kalıcı gerçek içerik seçimi (seçildi). Mevcut çalışan motor, D1/CAS, SSE, WordList ve Modal yeniden kullanıldı; ücret/bağımlılık/entegrasyon eklenmedi.

Oyuncuya değişen davranış: normal oyunda tek hedef listesi; ekran yüksekliğinden HUD ve kontroller çıkarıldıktan sonra kalan alana tahta; özel odada dört/üstü kişi, herkes hazırken host başlangıcı; tek ortak sonuç; Yeni oyun oyna ile aynı oda, yeni içerik ve önceki sonucu açabilme. Gerçek konfor veya oyuncu tutma artışı ölçülmedi.

İki uzman incelemesinin somut düzeltmeleri: sığmayan adayın allocator'ı kilitlememesi; deadline→next öncesi sonuç kaydı; terminal sıralamanın ayrılmayla değişmemesi; süresi dolmuş üyeliğin dirilmemesi; 16 hazır isteğinin kaybolmaması; eski tur/owner talepleri; quick queue oda transferi; stale recovery/ACK; tek modal; stretched hedef panelinde küçülme; ayrılma/rövanş yarışı. Ayrıntı ve bağımsız kanıt `arena-final-*` günlüklerinde.

Doğrulama: 362 test/74 grup başlangıç son kapısı; 4/8/16 aynı oda katılımı, hazır/başlat/hamle/sonuç; 16 oyuncu ve eşzamanlı yeni tur bağımsız probe; üç ardışık tur; aynı hesap/server instance geçmişi; kelime/grid imzası, havuzun ilk geçişinden sonra üretim, gerçek tükenme ve transaction rollback. Geometri testleri 320×568–430×932 ve tablet/masaüstü bütçelerini, sıfır/kısa stage ve büyütülmüş metin fallback'ini kapsar, DOM/piksel kanıtı değildir. Üretim Worker, CI ve yayın sonucu son doğrulama günlüğünde kesinleştirilecek.

Sınırlar: destekli preview eski süreç kilidi giderildikten sonra healthy, CUA tam URL'de ERR_CONNECTION_REFUSED. Gerçek telefon/dokunma/sistem yazısı/sağlayıcı ile yeniden giriş doğrulanmadı. HTTP trusted test kimliği gerçek provider girişi diye raporlanmaz. 16 servis oyuncusu ve sekiz Worker HTTP oturumu üretim kapasitesi garantisi değildir. 1.600.508 altılı adayın tamamı yayımlanabilir/oynanmış sayılmaz; seçilen her tahta doğrulanır. Eski tamamlanmış Arena turlarında içerik geçmişi yok; yeni altılı alanı bu sürümden itibaren kalıcı izlenir, geçmiş veri uydurulmaz.

Sıradaki öncelik: destekli gerçek iPhone/Android ekran/çentik/araç çubuğu ve 4+ gerçek cihaz oyunu; sağlayıcıyla aynı hesaba dönüş; D1/SSE dağıtık yük ölçümü. Var olan kayıt/çevrimdışı/PWA kuyruğu korunur, yeni kozmetik özellikler bu kanıtları atlamaz. Tarihli içerik bu doğrudan düzeltme turunda değiştirilmedi.

## 29 Ekim 2026 · 0.13.1 · Arena bitiş tahtası incelemesi


## 30 Ekim 2026 · 0.14.0 · Yumuşak keşif sesleri

**Başlangıç/odak:** Site31 kaynağı `ad12f7814845fd978f91fdcad58aaa3ac4f4b9e6`, GitHub `a79c8054f2df0ffd610e47e78f995874e1360102`. Kullanıcı açıkça daha sempatik, yormayan oyun sesleri istedi. Sürekli müzik ve tüm düğmeleri seslendirme adayları yerine anlamlı eylem→doğrulanmış başarı→keşif/bitiş motifleri seçildi. Kabul uygulama öncesi `2026-10-30_sound-decision` günlüğünde; iki gerçek sınırlı uzman kendi deneyim/güvenilirlik günlüklerinde, koordinatör tek kod/yayın sahibi. Bu doğrudan ses işi günlük içerik üretimini kapsamıyor; eski bölüm dosyaları korunuyor.

**Yapılan:** Ortak pentatonik mallet ailesi, yumuşak atak/sönüş ve sessiz oktav katmanı; sekiz kısa motif. Seçim başına tek tını; harf, saniye, yanlış seçim ve her arayüz tıklamasında ses yok. Solo/tutorial/klasik/tarihli/günlük, Gizli Tema, Hızlı Tur, Arena ve kayıtlı meydan okuma mevcut tetikleyicilerle aynı motifi kullanır. İpucu, gizli bağlantı, pause/devam ve tempo modlarının başlama/bitişi ayrılır. Sonuç incelemesi veya kayıttan tamamlanmış oyun açmak yeniden kutlamaz. Arena/Meydan kelime sesi sunucu onayından sonra gelir; geç eski ACK bitmiş turu tekrar seslendirmez. Kaynak uzmanının bulduğu bu iki gerçek doğruluk sınırı uygulama ve regresyonla ele alındı.

**Kontrol/maliyet:** Mevcut sound/haptics boolean'ları değişmedi; varsayılan sessiz ve titreşim ayrı. Albümde Hafif/Dengeli/Belirgin ve gerçek örnek dinleme; yalnız düzey ayrı cihaz anahtarında, bulut şeması değişmez. Tek AudioContext/aktif motif, kısa release kuyruğu, cooldown/öncelik; görünmez sekme, mute ve unmount temizliği. Sesi kapattıktan sonraki eski async callback güncel tercihe uyar. Pointer/keyboard/assistive click gerçek jestiyle unlock; play() jest dışı context açmaz, suspended olayları atar. Desteksiz API/resume reddi oyunu bozmaz. Yeni bağımlılık, indirme, sample lisansı, ücret veya dış entegrasyon yok.

**Kanıt/sınır:** Kaynak, kontrollü gerçek hook/caller/Board kabulleri ve tam yayın kapıları son validation günlüğünde. Platform dayanağı Apple Feedback ve MDN Web Audio best practices; rakip sample kopyası veya “dünyanın en iyisi” iddiası yok. .vinext/dev/lock.json eski /site kaydı yalnız yerel generated state olarak yedeklendi; destekli preview sağlıklı başladı fakat CUA terminal.local:4173 bağlantısı reddedildi. Alternatif tarayıcı yolu kullanılmadı. Gerçek iPhone/sessiz anahtar/telefon araması sonrası audio, hoparlör/kulaklık ve uzun oturum dinlemesi; oyuncu konforu ve tutma etkisi ölçülmedi. Sonraki odak bu cihaz dinlemesi ve mevcut hedef→oyun→sonuç/hesap/PWA kuyruğu; cold-start pending tasarımı açık kalır.

**Aday ve seçim:** Canlı yayın kontrolünde uygulama istisnası bulunmadı; iki iptal edilmiş bölüm isteği tarayıcı önizleme istemcisine, `/robots.txt` ve `/sitemap.xml` 404'leri tarayıcıya aitti. Arama yardımcıları yerine açık kuyruktaki oyuncu görünür Arena kusuru seçildi: `finished` tahtası `paused` kaldığından Board harfleri noktayla örtüyordu. Tek güvenilirlik uzmanı kaynak ve mevcut sunucu korumalarını salt okunur inceledi; koordinatör uygulama, test ve yayının tek sahibidir. Kabul ölçütü koddan önce `2026-10-29_arena-terminal-decision.md` kaydına yazıldı.

**Oyuncunun gördüğü değişiklik:** Düello sonucu ilk bitişte açılır. Pencere kapatılınca aynı tahta açık harfleri ve yalnız sunucudan onaylı oyuncu çizgilerini gösterir; salt okunur durumda yeni seçim göndermez. Arena'ya özgü “Düello tamamlandı · Tahtanı inceleyebilirsin.” metni görünür. Sağ paneldeki **Düello sonucu** aynı skor ve rövanş eylemlerini yeniden açar. Countdown kapalı, aktif tur oynanabilir, süresi sıfırlanmış fakat terminal revizyonu henüz gelmemiş tur kilitli kalır.

**Korunan sınır:** `commit` faz ve sunucu zamanı kapısı, server claim/settle, skor, Elo, round'a bağlı tekil sonuç, karşılıklı rövanş, ayrılma ve canlı bağlantı kodu değişmedi. Şema/göç, içerik, tahta, kimlik, kayıt, ödül ve ödeme yok. 29 Ekim'in **Bayram sabahı / Bilim sergisi** çifti zaten yayında; yeniden eklenmedi.

**Doğrulama:** Gerçek Arena caller'ını kontrollü sunucu durumuyla çalıştıran test sonuç aç→kapat→salt okunur tahta→sonucu yeniden aç akışını, eski onCommit'in claim üretmemesini ve countdown/active/terminal-bekleme ayrımını doğrular. Board ve server testleri harf/çizgi görünürlüğü, girdi kilidi, süre, skor, sonuç tekilleştirme ve rövanşı korur. Tam kapı sonuçları `2026-10-29_arena-terminal-validation.md` kaydında tamamlanır.

**Sınır ve sıradaki iş:** Destekli preview/gerçek cihaz bulunmadığı için iPhone/Safari dokunma, kaydırma, odak, büyük yazı, ekran okuyucu, iki gerçek hesap ve PWA doğrulanmış sayılmaz. Bu kanıt birinci sırada; cold-start/cihazlar arası bekleyen günlük niyet ayrıca tasarım ister. Ölçülmüş eğlence, tutma veya App Store hazır iddiası yoktur.

# Geliştirme defteri

## 29 Ekim 2026 · 0.13.0 · Hedef, oyun ve gerçek kazanım

Kullanıcı doğrudan ana deneyimin yeterince başarı/ilerleme hissi vermediğini bildirdi. Güncel Site29/0.12.7 ve eş GitHub ana ağacı baz alındı. Bugünün Bayram sabahı / Bilim sergisi zaten yayında; içerik ve beşli harita kümeleri değiştirilmedi. Yeni ücret/servis/hesap/bağımlılık veya raster üretim harcaması yok.

**Aday ve seçim:** gerçek cihaz/preview, Arena bitmiş inceleme ve ana hedef→oyun→kazanım bütünlüğü karşılaştırıldı. Son kullanıcı isteğine göre üçüncü odak seçildi: üç kritik ekranda görünür yüksek etki, mevcut güvenilir koleksiyon API'leri, yeni kayıt biçimi gerektirmeyen sınır. Kod öncesi kabul achievement-decision; iki gerçek sınırlı uzman experience/reliability ilk ve son inceleme yaptı, yalnız kendi günlüklerine yazdı. Koordinatör uygulama ve yayının tek sahibi. Supercell Trophy Road ve Apple Game Center/Feedback birincil ilkelerinden önceden görünen hedef, açıklanan eşik ve önemine göre geri bildirim uyarlandı. Ölçülmüş tutma/eğlence/gelir artışı iddiası yok.

**Gerçek değişen davranış:** Ana kart oynanacak gerçek journey'nin parçasını, altılı albümünü ve sıradaki açılışını gösterir; başlatma eylemi ayrıntının önündedir. Standart/yarım standart öneriye ilgisiz ödül gösterilmez. Solo'da bulunan/kalan grup sayısı, yıldız hedefi ve parçanın adı görünür. Sekiz veya daha az hedef gruplu solo listeleri tahta yüzeyinde açık durur; yinelenen aside ve popup kaldırılır. Günlük/klasik/uzun listeler ve diğer modlar mevcut Kelimeler erişimini korur. Confirmed veri, tanım gizliliği, split-group tamamlaması ve tahta/zoom/minimum hücre sözleşmeleri aynıdır.

Sonuçta gerçek parça ve yeni dünya/bonus/albüm açılışı istatistiklerden önce gelir. 3/5/6 gerçek eşikleri ve eski başlanmış dünya erişimi korunur. Bu turun yıldızları/ipuçları/süresi ile kalıcı en iyi ayrı gösterilir; tekrar aynı parçayı çoğaltmaz. Sonraki hedef mevcut nextJourneyAfter kaynağına bağlıdır; next/replay/map/review aynı callback'lerle çalışır. Header ve eylemler, kayabilen sonuç gövdesinden ayrıldı; kısa yatay görünüm doğal scroll kullanır. Genel Modal çağrıları footer yokken eski yapısını korur. Görünüm krem/orman yeşili ve mevcut özgün tema SVG'lerini kullanır; check/metin, 44px eylemler ve reduced-motion desteği vardır.

**Yakalanan/düzeltilen sınır:** Güvenilirlik uzmanı klasik Hababam'ın standart hababam.0 kaydını önceki en iyi diye gösterebildiğini buldu. Classic sonucu bu prop'u almaz; actual Solo'da standart3yıldız/1sn kaydı + klasik tamamlama regresyonu eklendi. İlk mevcut VM rekor testi, ayrılan VictorySummary bileşeni nedeniyle metne erişemiyordu; gerçek caller improved/best prop'ları ve ayrı gerçek SSR duyuru kabulleriyle sınır güncellendi. Yeni SSR saat beklentisi00:45 gerçek timeLabel0:45'e düzeltildi; bunlar ürün arızası diye sayılmaz. İlk Worker kapısı kaldırılan eski hero görselinin adresini markup'ta aradı; yeni gerçek tema SVG'sini doğrulayan eşdeğer kabul kullanıldı, eski asset HTTP erişimi ve diğer kontroller korunur.

**Doğrulama:** 308/308 test,64grup; önceki293 korunur +15 yeni kabul. Saf hedef ve 3/5/6/legacy/tam katalog kuralları, gerçek stateless React SSR hedef/ödül/replay/yıldız/rekor metinleri; actual Solo completion/worldunlock/next/replay/classic ve Modal body/footer/close, kısa liste confirmed/no-duplicate/Board props. SSR'de yalnız dekoratif WorldArt stub'ı vardır; görsel/piksel doğrulaması değildir. TypeScript,120 tahta/2400 alternatif ve üretim build/22 offline asset geçti. Son Worker HTTP ve kaynak/CI/yayın kapısı achievement-validation kaydında tutulur.77 korunmuş mevcut dosya,9 tarih snapshot, motor/katalog/harita/kayıt/merge/DB/CI/hosting; package sürümü dışında bağımlılıklar aynı. Final uygulama derlemesi sonrası yalnız doğrulama scripti/belgeleri güncellendi.

**Sınır ve sıradaki iş:** Destekli preview status stopped, önceki connection engeli için recovery kanıtı yok; başka erişim yolu denenmedi. Gerçek telefon/native odak/scroll/büyük yazı/piksel/FPS/concurrent React, iki gerçek hesap-provider ve fiziksel PWA hâlâ açık. Sonraki öncelik bu üç ekranın destekli cihazda oynanması ve izinli oyuncu gözlemi; Arena terminal inceleme ve cold pending ayrı açık işlerdir. Dünya standardı veya App Store hazır sonucu verilmez. Haftalık değerlendirme31Ekim/sonraki uygun mevcut çalışmada, yeni görev yok.


## 29 Ekim 2026 · 0.12.7 · Kelimeler tahtanın hemen yanında

Başlangıç güncel Site28/0.12.6, owner/public ve aynı URL; helper `b9969c10fcc9236c5ac303b9060f86eb78355827`, GitHub main `232629509f8b75dd75f1b0a861c157a46e0493c6`, eş tam ağaç `905ff88778ea9bfa110b516f17ba888819a61206`. Son0.12.6 başarılı yayını `appgdep_6ae25bdbbb888191bc90fecff35afb72`,28Ekim20:32:48Z. Güncel sözleşme/README/sürüm/harita/registry/öncelik/son koordinatör kaydından devam. Eski yerel sürüm temel alınmadı.

### İki yeni kalıcı keşif

- **Bayram sabahı:** Türkiye, Rahat6×6; BAYRAK / YURT / COŞKU / TÖREN. Seed `2026102901`, ID `20261029-0001-4000-8000-000000000001`.
- **Bilim sergisi:** Bilim, Dengeli8×8; DENEY / ÖLÇÜM / ATOM / ENERJİ / GÖZLEM / MERCEK / BULUŞ. Seed `2026102902`, ID `20261029-0002-4000-8000-000000000001`.
- Yeni tek `content/releases/2026-10-29.json` ve RELEASE_BATCHES'e sona tek ekleme. Kimlik/spec hash/frozen board, iki çapraz eğim ve20 alternatif doğrulandı. Türkçe/tema uygunluğu kaynak incelemesidir; ölçülmüş oyuncu zorluğu değildir. Aynı tarih dosyası varsa üzerine yazmadan kalan doğrulama/yayın sürdürülür. Ana sayfa/ilgili dünya/kalıcı arşiv/tarihli damga yolları mevcut sözleşmeyi kullanır; eski5+1 kümeleri büyütülmez, sekiz eski snapshot korunur.

### Kanıt ve tek odak

Gerçek cihaz/preview, tahta yanından hedef erişimi ve Arena bitmiş inceleme adayları karşılaştırıldı. Kullanıcının kelimeler için yukarı kaydırma şikâyeti ile source'taki mobil order:-1 hedef paneli, doğrudan erişim adayını öne çıkardı. Tek gerçek experience uzmanı kendi role/shared dosyalarını okuyup yalnız mobile-words-review günlüğüne yazdı; root uygulama/test/GitHub/Sites sahibi. Kabul koddan önce mobile-words-decision kaydına yazıldı. Arena finished'ın hâlâ paused kalması ayrı kaynak adayıdır; bu tur sessizce tamamlanmış sayılmadı.

Yeni salt okunur Sites DB yeteneğiyle yalnız opt-in toplu metrics81 satırı4 sınırlı sayfada ve operational_faults0 satır okundu. Accounts/players/sessions/özel oyun kayıtları okunmadı.28/29Ekim1'er app_open güncel kelime deneyimini ölçmek için yetersiz.25Ekim client_error7 sayımı mesaj/stack içermez; yeni0.12.6 arızası veya neden diye sunulmaz. Sayımlar benzersiz kullanıcı veya retention/FPS/UX başarısı değildir; nedensellik çıkarılmaz. Son180dk Worker error log örneği0 olaydır, bütün oturumlara genellenmez. Karar kullanıcı geri bildirimi ve kaynak kanıtından gelir.

### Gerçek değişen davranış

**Tahta → Kelimeler:** selection-preview ile board-stage arasındaki normal akış44px düğme, güncel listeyi native dialog içinde açar. Harflerin üstüne bindirilmiş sabit/floating yüzey yok. Tahtaya dön/X/Escape/backdrop aynı close yolundadır. Mevcut listeler yerinde kalır; yeni yüzey aynı WordList verisini kullanır. Uzun etiketler/tanımlar doğal sarılır, pasif bulunan kartlar yeniden kutlama animasyonu başlatmaz. Açık liste güncel confirmed strokes ve golden değişimini alır. Minimum hücre/zoom/hit fonksiyonları değişmez; mevcut ResizeObserver fitter ek normal akış yüksekliğini hesaba katar. Bütün telefonlarda scrollsuzluk iddiası yoktur.

**Doğru veri:** Solo/Günlük save.strokes ve journey.clues; Arena room.you.strokes/golden; kayıtlı meydan okumada view.strokes; Mystery yalnız visibleBoard; Sprint gerçek round/strokes. Optimistic Board çizgisi yeni listede bulunmuş sayılmaz. Sayaç liste gruplarını sayar; uzun ad ancak tüm parçaları bulununca tamamdır. İpucu Avı cevabı görünür/erişilebilir ada erken sızmaz, Mystery bonusu doğru aşamaya kadar listelenmez. Tek data objesi hem aside hem yakın listeyi besler.

**Geri dönüş ve durumlar:** paused/readOnly/inputBlocked veya caller'ın yardım/exit/choose/result engelinde BoardWords subtree renderdan çıkar; yeni board/room/view key'i eski popup state'ini taşımaz. Close bağlı opener'a preventScroll focus talep eder; detached opener'a fokus yok, unmount'ta bekleyen RAF iptal edilir. Board subtree/zoom scroll ayarı değiştirilmez ve pencere scroll reset çağrısı eklenmez. Listeyi aç/kapa claim/hint/pause/score/save/seed/ödül dispatch'i üretmez; Solo/Günlük ve yarışmalı modların mevcut saatleri sürer. Bu kaynak sözleşmesi gerçek native odak/scroll veya React subtree davranışı ölçümü değildir.

### Son kapılar ve sınırlar

**293/293 test,61grup**, önceki279 +14 yeni kabul:12 word-access +1 daily actualSolo +1 actualMystery. Split group/duplicate/unknown stroke/empty state, orijinal Board props ve dışındaki kontrol, guard/key değişimi, open/live data/close/focus talebi/cleanup, clue görünürlük+ARIA ve native Modal handler/body cleanup sözleşmesi. Actual Arena/Challenge/Sprint/Solo timer/data/guard gövdeleri ayrı kontrollü BoardWords VM'iyle sınanır; gerçek React ağacında modal unmount/stacking veya native dialog/focus/scroll testi değildir. Daily pending ink vs confirmed ve help engeli; Mystery hiddenbonus/choose geçişi kapsanır. İlk dar testte yanlış CSS class seçicisi düzeltildi; uygulama kusuru diye sayılmadı. Son dar paket37 kabulü geçti, empty/key/baseline güçlendirmeleri tam pakette geçti. Bağımsız uzman son source/test kapsamını okuyup engel bildirmedi; geçen testler root'un kendi araç kanıtıdır.

**120 tahta /2400 alternatif**, TypeScript ve final production build başarılı;22 versioned offline asset hazırlandı. Son build ile **258 üretim Worker HTTP kontrolü** iki yalıtılmış oyuncuyla geçti. Mevcut checker/regresyonlar kaldırılmadı; yeni tarihin ana sayfa/dünya/arşiv/damga yolları aynı checker tarafından sınanır. HTTP sayaç, mevcut challenge/room target/claim döngüsüne göre değişebilir.38 korunan dosya byte aynı:8 eski release snapshot, engine/catalog/content/atlas/discovery/legacy/progress/cloud/sync/server/daily-action+pending+transport/App/chapter queue+progress, şema/tüm uygulanmış göç/manifest/lock/hosting. Kaynak kayıt dizisinde yalnız9.tarih append; eski ID/kelime/seed/board/best/ödül/5+1 ve günlük idempotency/owner kuralları korunur.

Cloud Environment yönergesi ve networking referansı okundu; environment_status aracı ve policy JSON'u sunulmadı, genel readiness varsayılmadı veya ağ/izin değiştirilmedi. Mevcut source/node/hosting yolu gerçek sonuçlarla çalışır. Destekli preview status yeniden salt okunur sorguda stopped; önceki ERR_CONNECTION_REFUSED için somut recovery yok. Aynı başarısız browser veya alternatif server/izin yolu denenmedi. Gerçek telefon/DOM/piksel/büyük sistem yazısı/native storage/dialog/scroll/odak/ekran okuyucu/FPS/concurrentReact/provider/iki cihaz/fiziksel PWA açıktır. App Store hazır veya ölçülmüş keyif/tutma/gelir/üstün stüdyo başarısı iddiası yok.

Son yerel kanıt mobile-words-validation günlüğünde; tam kaynak helper ile kaydedilip paketlenir, GitHub gerekli CI+tam ağaç/birleştirme ve aynı public URL Sites sonucu gerçek araç makbuzuyla ayrıca doğrulanır. Runtime/test sonrasında yalnız kaynak belgeleri güncellenir; geçen kapılar gereksiz yinelenmez. Yeni ücret/hesap/servis/bağımlılık/raster grafik/zamanlayıcı veya başka proje değişikliği yok. Sıradaki öncelik destekli cihaz gözlemi, sonra ayrı Arena terminal-review kabulü; haftalık inceleme24Ekim→31Ekim/sonraki uygun mevcut çalışmada kalır.

## 28 Ekim 2026 akşam · 0.12.6 · Aynı sekmede günlük keşfine dönüş

Güncel Site27/0.12.5, owner/public ve aynı URL; helper `7cb1daa40fc73744e3379ffba8efdbe29cd6cca9`, GitHub main `a2e9ce907c5f083268602b46392afcdbeced89c0`, tam eş ağaç `fbc124658a1b58f19c08fc3345193ae1bb89cbd5`. Sözleşme/rol kaydı/README/sürüm/harita/son defter/öncelik/son koordinatör kaydından devam. Sabahın başarılı Site27 yayını ve **Yazlık sinema / Sette bir gün** çifti korunur; yeni tarih JSON'u veya ikinci çift yok. Sekiz eski dosya ve RELEASE_BATCHES aynıdır.

### Seçim, gerçek inceleme ve uygulanan aşama

Destekli gerçek telefon/preview, günlük intent'in lifetime dışına taşınması ve yeni kozmetik oda karşılaştırıldı. Önceki ERR_CONNECTION_REFUSED için somut recovery kanıtı yok; alternatif browser/server veya aynı başarısız yol denenmedi. Önceki açık kuyruk ve doğrudan kanıt nedeniyle ikinci iş seçildi. Kabul koddan önce evening-daily-recovery-decision günlüğünde. Tek gerçek güvenilirlik uzmanı kendi role/shared dosyalarını yeniden okudu, yalnız atanmış evening-daily-recovery-review günlüğüne yazdı; root kod/test/GitHub/Sites sahibi.

Başlangıç actual session+SQLite kanıtı: lost hint → dispose → aynı owner/id hints0 ile yeniden açış → yeni UUID → eski late commit iki ceza üretti. Eski callback UI guard'ı doğruydu, key'in ömrü yetersizdi. App belleği reload'u çözmez; paylaşılan localStorage ise cross-tab atomiklik sorunu getirir. **sessionStorage ile aynı sekmede geri dönüş ve sayfa yenileme** kullanılabilir dar aşama seçildi. Sekme kapanışı/OS/PWA cold açılış veya başka cihaz güvencesi değildir.

**Günlük → tekrar aç:** owner'a tek v1 descriptor id/day/public board imzası ve claim/hint niyetini taşır; kimlik token'ı veya çözüm yerleşimleri içermez. İlk mutation'dan önce yazma ve geri okuma başarısı gerekir. Önceki pending varken yeni intent overwrite edilmez. App varsa bu kimliğin salt okunur guarded GET'ini yapar; current-day daily() ile eski işlemi görünmez kılmaz. Gün/board/id mismatch veya bozuk kayıt sessiz boş sayılmaz; yeni oyun/hamle fallback'i yok. Başlık gerçek günlük tarihini gösterir.

**Tahta → bekleyen işlem:** restore bütün saklanan niyetleri önceden gönderilmiş olabilecek belirsiz işlem sayar. Önce yalnız GET; completed/found claim kapanabilir, hint sayısından o key'in kabulü çıkarılmaz. Değişmemiş hint otomatik yeniden gönderilmez; açık **Kontrol et ve sürdür** aynı key'i kullanır. Önceki belirsizlik ordinary400/409/429 ile silinmez. ACK veya kesin kapanış yalnız kendi descriptor+intent'i conditional-clear ederse idle açar. Clear hatasında sunucu snapshot'ı görülebilir ama yeni hamle açılmaz; **Kaydı yeniden dene** ve geri dönüş çalışır. Dispose/back/owner değişimi pending kaydını silmez; eski callback yeni UI/progress/journal'a dokunamaz. Kayıt hatası yeni UUID ile sessiz tekrar değildir.8sn request/owner/retirement ve normal pause/review davranışları korunur.

**Eski denemeyi kapatma:**24saat sınırı,15sn ceza,3hint ve rank/best kuralları aynı. Önceden kabul edilen samekey receipt ve finished dönüşü önce değerlendirilir. Hiç kabul edilmemiş eski niyet, yalnız başarılı id/revision CAS ile revision artıran fence sonrası DAILY_EXPIRED409 alır; eski hazırlanmış yazı artık commit edemez. Fence kaybederse yeniden read/receipt; DB hatası/sekiz deneme sınırı terminalcode değildir. JSON/hints/strokes/duration/score silinmez. Client ancak bu açık kapanıştan sonra kendi slotunu temizleyip günlük sayfasına döner; sonra güncel keşif açılabilir.

İnceleme bir ek kilit yakaladı: ilk kesinret sonrası descriptor kalırsa reload onu belirsiz sayıp quota400 döngüsüne giriyordu. Önceden belirsizlik olmayan ilk kesin mutation reddi kalıcı slotunu kapatır; mounted GET count uzlaştırması kalır. Daha önce gerçek belirsizlik varsa bu kural ordinary ret için geçerli değildir. Receipt yok + monotonik hints3 durumunda ayrı DAILY_HINT_LIMIT400 güvenli terminaldir: eski <3 writer revision'ı kaybeder, hints3 okuyan yeni key zaten eklenemez. Bu kod yalnız hint mutation cevabında clear yetkisi verir. Sunucu hata kodu API'den korunarak taşınır; legacy HTTP durumları değişmez. Yeni SQL göçü yok.

### Gerçek kanıt, koruma ve sıradaki iş

Uzmanın bağımsız gerçek helper/store/SQLite tekrarında `restoredCheckOnly=true,newKeyBlocked=true,reusedOriginalKey=true,finalHints=1,journalCleared=true`. İlk kesinret probe'u düzeltme sonrası `knownRejectionCleared=true,restoredPhase=idle,serverHints=3`. İki expiry yarış yönü de bağımsız gerçek SQLite ile sınandı: fence kazanırsa eski CAS0 ve JSON byte aynı; eski writer kazanırsa fence0/reload/original receipt. Bunlar kontrollü kaynak kanıtı, canlı oyuncu veya cihaz gözlemi değildir. Son dar diff'te engel bildirilmedi.

**279/279 test,59grup**: önceki261 +18 yeni kabul (13 store/session/SQLite/race,4 actualSolo/App,1 route). Aynı sekme remount/check/manual retry, late ACK'nin yeni pending'i silmemesi, sticky reload429, read/write/readback/clear failure, yanlış owner/board/day/claim/bozukJSON, midnight eskiid, kesinret/limit ve iki expiry-CAS yönü. ActualApp yeni mount'ta eski id'yi okur; storage/mismatched-response halinde current-day POST/mount yok. ActualSolo'da store başarısızken network mutation0, çalışan retry ve tek hint cezası. İlk dar UI fixture'ında VM realm object/Error farkları düzeltildi; ürün veya sağlayıcı kusuru diye sayılmadı. **118 tahta/2360 alternatif**, TypeScript ve son production build başarılı;22 offline client asset hazırlandı. **253 üretim Worker HTTP kontrolü**, yeni terminalcode/JSON korunması/expired receipt ve önceki tüm regresyonlarla geçti; yalıtılmış DB'de eski starts simülasyonu canlı oyuncu verisine dokunmaz. Mevcut target döngüsüne göre toplam HTTP sayaç değişebilir.

**34 korunan dosya** byte aynı:8 tarih snapshot, kayıt dizisi, eski engine/catalog/content/atlas/discovery/legacy/progress/cloud/sync/chapter queue+progress, şema/tüm uygulanmış göç/manifest/lock/hosting. Aynı kimlik/kelime/seed/board, sabit5+1 ve kazanımlar korunur. Yeni ücret/servis/hesap/bağımlılık/grafik/zamanlayıcı veya başka proje değişikliği yok. Yakın production log örneği0 hata olayıdır; bütün kullanıcı oturumlarına genellenmez. Runtime/test sonrası yalnız kaynak belgeleri değişir; geçen app kapıları gereksiz yinelenmez.

Son yerel doğrulama evening-daily-recovery-validation günlüğü; tam kaynak helper ile paketlenir, gerekli GitHub CI/tam ağaç/birleştirme ve aynı public URL'de gerçek Sites sonucu ayrıca doğrulanır. Gerçek telefon/DOM/yerleşim/büyük sistem yazısı/native storage/scroll/ekran okuyucu/FPS/concurrentReact/provider/iki cihaz/fiziksel PWA hâlâ açık. App Store hazır oluşu, ölçülmüş keyif/tutma/gelir veya dünya standardı başarısı iddia edilmez. Sıradaki öncelik destekli gerçek cihazda kelime-tahta görünümü/ilk hamle/review/arşiv/hesap akışını gözlemek; sekme kapanışı/OS cold pending sürekliliği ayrı kabul ister. Haftalık inceleme24Ekim→31Ekim/sonraki uygun mevcut çalışmada kalır.

## 28 Ekim 2026 · 0.12.5 · Günlük oyunda açık ve güvenli bekleme

Başlangıç güncel Site26/0.12.4, owner/public ve aynı adres; helper `072f4283d98ae0389ba89a05479fc5df27ca4bef`, GitHub main `a0b20a620736cbac93f29200458715c34ef8ec33`, eş tam ağaç `60bbbc3094f8bb801d01c4c585fdb0b3ba9f492a`. Güncel README/sürüm/harita/defter, kök sözleşme, rol kaydı/öncelik ve son koordinatör günlüğü okundu. Aynı talebin tekrarı mevcut çalışmaya dahil edildi; ikinci içerik veya yayın akışı açılmadı.

### İki yeni kalıcı keşif

- **Yazlık sinema:** Yeşilçam, Rahat6×6, PERDE / AFİŞ / BİLET / MISIR; seed `2026102801`, ID `20261028-0001-4000-8000-000000000001`.
- **Sette bir gün:** Diziler, Dengeli8×8, DEKOR / KOSTÜM / PROVA / REPLİK / BÖLÜM / OYUNCU / SENARYO; seed `2026102802`, ID `20261028-0002-4000-8000-000000000001`.
- Yeni tek `content/releases/2026-10-28.json`, kayıt dizisine yalnız sona ekleme. Kalıcı spec/hash/board, iki çapraz eğim ve20 alternatif doğrulanır. Kaynak Türkçe/tema incelemesi; ölçülmüş oyuncu zorluğu değildir. Yeniden çalışmada var olan tarih dosyası üzerine yazılmaz; eksik doğrulama/yayın sürdürülür. Mevcut ana sayfa, ilgili dünya, arşiv ve tarihli damga çifti bulur; eski sabit5+1 kümeleri büyümez.

### Seçim, davranış ve bağımsız inceleme

Cihaz/preview doğrulaması, günlük claim/hint beklemesi ve yeni oda/kozmetik karşılaştırıldı; önceki açık kuyruk ve doğrudan kaynak kanıtı nedeniyle günlük akış seçildi. Kabul uygulamadan önce `2026-10-28_maintenance-decision.md` içine yazıldı. Tek gerçek güvenilirlik uzmanı yalnız kendi daily-action-review günlüğüne yazdı; root uygulama/test/GitHub/Sites sahibi. Önceki preview ERR_CONNECTION_REFUSED için somut repair/recovery kanıtı yok; aynı başarısız yol veya alternatif sunucu/browser denenmedi, cihaz önceliği korunur.

**Günlük → hamle/ipucu:** bekleme gerçek pause veya bitmiş inceleme değildir. Harfler/kabul edilmiş çizgiler görünür; yeni seçim ve ipucu engellenir, zoom/ses/yardım kalır. Sunucu saati devam eder; onay gelmeden hint hakkı, buluş sesi, günlük tamamlama veya ödül üretilmez. Bekleme/check metni ve gerçek busy semantiği, timeout sonrası **Kontrol et ve sürdür** ve günlük sayfasına dönüş sunulur. Cream/forest kimliği, doğal satır sarma ve44px eylemler korunur. Normal Solo/review varsayılanları değişmez.

**Sınırlı ve sahip korumalı istek:** açılış ve her mutation/check token/HTTP/JSON dahil8sn yarışında; sinyal yok sayılırsa bile arayüz süresiz kilitlenmez. Tek synchronous pending guard aynı event turunda ikinci claim/hint'i düşürür. Her deneme yeni controller, temiz timer/listener; unmount, owner/instance değişimi ve render'daki tek yönlü retirement geç yanıtı yok sayar. A→B→A cleanup öncesinde de eski oyuna geri canlanmaz. Gecikmiş sonuç yeni sahibin günlerine eklenmez. Yeni istemci açılış/claim/hint beklenen owner'ı taşır; mismatch açık kod409, legacy guard'sız istek uyumlu. Günlükten geri dönüş mevcut auth güncelleme olayını tetikler; yeni profil okunur. Gerçek sağlayıcı testi değildir; yenileme bitmeden çok hızlı açış owner guard ile yine güvenle reddedilebilir.

**Aynı belirsiz ipucunu kurtarma:** ilk GET aynı owner+daily-id durumunu okur, current-day daily() çağırıp gece yarısından sonra yeni oyun başlatmaz. Hint'e özgün UUID verilir, aynı açık oturumdaki retry onu korur. Sunucu ceza+private receipt'i mevcut daily JSON revision CAS içinde atomik saklar; aynı key quota/expiry/finished kontrolünden önce güncel snapshot ve özgün hücreyi döndürür. Receipt/çözümler public yanıta çıkmaz. Eski JSON optional alan olmadan okunur, legacy no-key davranışı korunur; SQL göçü yok. Bilinen ilk400/409/429 reddi yalnız read ile uzlaştırılır. Önceki belirsiz mutation'dan sonra gelen retry reddi ilk isteğin gerçekleşmediğini kanıtlamaz; sticky uncertainty key'in erken temizlenmesini önler. Aggregate hint sayısından işlem başarı tahmini yapılmaz.

Uzman bu son uç durumu gerçek helper+SQLite'da yeniden üretti: ilk belirsiz istek→GET0→retry429→GET0 pending'i temizliyor, yeni UUID ve sonradan ilk commit iki ceza yaratıyordu. Dar düzeltmeden sonra bağımsız probe `newKeyBlocked=true,reusedOriginalKey=true,confirmed=1,finalHints=1`; gerçek regresyon eklendi. Aktif oturum dışına key taşıma uygulanmadı: uncertain geri çıkış/reload sonrası tüm yollarda tek-ceza garantisi yoktur; ayrı sonraki aşama olarak açık kaldı.

### Geçen kapılar ve sonraki iş

**261/261 test,57grup**, önceki234 ve27 yeni kabul. Gerçek servis/SQLite CAS, expiry/midnight/same-id/owner/private receipt, route/transport/legacy, kontrollü deadline/reconcile/late result; actual Solo/App/notice ve Board/shared blocked davranışları sınandı. TypeScript, **118 düzenlenmiş tahta /2360 alternatif**, final production build ve iki yalıtılmış oyuncuyla **247 üretim Worker HTTP kontrolü** geçti. Kontrol sayısı mevcut challenge/room target döngüsüne bağlı değişebilir; mevcut kontroller kaldırılmadı. Başlangıçtaki pnpm dosyasını doğrudan çağırma126 yalnız komut izin hatasıydı; node üzerinden aynı CLI ile bütün kapılar başarılı. Test fixture'ında spread ile getter sabitleme ve ilk nav sonrası profil okuma sayısı varsayımları düzeltildi; ürün clock/provider kusuru diye sayılmadı.

Yedi eski release snapshot dahil32 korunan kaynak/veri dosyası byte karşılaştırmasında aynı. Engine/catalog/content/atlas/discovery/legacy/progress/sync/cloud/chapter queue/schema/uygulanmış göç/manifest/lock korunur; hint dedup dışında sunucu süre/15sn/3hak/rank/best kuralları aynı. Yeni hesap/ücret/servis/bağımlılık/grafik/zamanlayıcı veya başka proje değişikliği yok. Yakın production log örneği0 olaydır, bütün oyuncuların hatasızlığı iddia edilmez.

Son yerel kanıt `studio-agents/journal/entries/2026-10-28_maintenance-validation.md`; tam kaynak helper ile paketlenir, GitHub gerekli CI+tam ağaç/birleştirme ve aynı URL'de Sites yayın sonucu gerçek araç makbuzlarıyla ayrıca doğrulanır. Gerçek telefon/DOM/piksel/büyük sistem yazısı/native scroll/ekran okuyucu/FPS/React concurrency/iki gerçek hesap-provider/fiziksel PWA hâlâ açık. App Store hazır oluşu, ölçülmüş keyif/tutma/gelir veya üstün stüdyo iddiası yok. Sonraki öncelik destekli cihaz erişimi ve ardından owner+daily kimliğiyle mount dışına belirsiz işlem taşıma. Haftalık inceleme24Ekim→31Ekim/sonraki uygun mevcut çalışma.

## 27 Ekim 2026 akşam · 0.12.4 · Biten keşfine yeniden bak

Güncel Site25/0.12.3 helper `34fa40459d180ac0e893db6ccd85b7be4f49c49a`, GitHub main `79de8c94407d12a653b06f3412e96cab2f257c83`, eş tam ağaç `d84cb38403d7dd2c1d72f4334300a3782f2fdbd7`. Owner/public ve aynı URL doğrulandı; son kaynak, README/sürüm/harita/defter, rol/öncelik/son koordinatör kaydından devam edildi. **Mahalle maçı** ve **Sokakta doksanlar** sabah başarılı deployment ile yayımlanmıştı; bugün ikinci çift oluşturulmadı, yedi frozen kaynak dosyası ve RELEASE_BATCHES aynı kaldı.

### Seçim ve gerçek davranış

Gerçek cihaz/preview doğrulaması, bitmiş inceleme kontrolü ve günlük hamlede bekleme geri bildirimi karşılaştırıldı. Somut preview recovery kanıtı olmadığı için aynı başarısız browser yolu/alternatif sunucu denenmedi; açık cihaz önceliği korunur. Tek gerçek deneyim uzmanının iki kontrollü actual-source proof'u odak belirledi: bitmiş Solo'da Devam et ilk tıkta görünür tahtayı gizliyordu; bitmiş Gizli Tema sonucu kapatılınca yeniden sonuç eylemi yoktu. Kaynak/VM bulgusudur, gözlenmiş canlı oyuncu vakası değildir. Kabul uygulamadan önce `studio-agents/journal/entries/2026-10-27_evening-review-decision.md` içine yazıldı. Uzman yalnız kendi evening-experience-review günlüğüne ilk bulgu/son diff incelemesi yazdı; root kod/test/GitHub/Sites sahibi.

**Bölüm sonu → tahtaya bak:** completed artık paused gibi sunulmaz. İşlevsiz Devam et ve ipucu yerine İnceleme bilgisi, çalışan büyütme/ses/yardım vardır. Harfler, bulunmuş çizgiler ve klavye cursor'ıyla harf incelemesi korunur. Yeni drag/tap/Enter/Space seçimi/commit yok; geç handler/RAF ve yarım anchor temizlenir. Normal boyutta review yüzeyi pan-x/pan-y bildirir, aktif tahtanın touchAction ve seçimleri değişmez. Bu native scroll ölçümü değildir. Paused hâlâ gerçek pause/hide durumudur; hesap merge'i paused oyunu bitirirse review görünür. Bir daha oyna yeni aktif turunu açar.

**Gizli Tema → sonucu yeniden aç:** Sonucu göster ile X/Escape/backdrop kapatma niyetinden sonra sonuç, gerçek sonraki bölüm ve tekrar eylemlerine yeniden ulaşılır. Bağlantı kartı tamamlanmayı anlatır; bitmiş oyunda son kelimeyi tekrar istemez. Help/choose/result guard'ı aynı anda iki pencereyi önler. Ayrı connection flag'i eksik ama board kaydı tamamlanmış eski durumda bitmiş kart/tüm kelimeler görünür; yeni koleksiyon veya reward yazılmaz. Gerçek replay boş save/aktif kontrollerle başlar, kalıcı tamamlanmış best ve mysteries listesi korunur.

### Kanıt ve sınırlar

**234/234 test,50grup**, **116 düzenlenmiş tahta/2320 alternatif**, TypeScript ve final üretim build başarılı.11 yeni kabul:3 Board review/visible ink/pan/keyboard/stale handler/RAF/active reentry,2 actualSolo review/result/help/paused merge,6 ortak controls/layout+actualMystery resultreturn/helpstack/replay/missingflag. Önceki223 regresyon, owner/deadline/private merge/ödül/atlas/klasik ve bütün input yönleri korunur. İlk dar testte iki fixture varsayımı düzeltildi: VM array realm karşılaştırması ve text helper'ın aside prop'una bakmaması. Final35 dar kabul başarılı; ürün kusuru diye sayılmadı. Son Worker/CI/tam kaynak eşleşmesi ve yayın kanıtı evening-review-validation günlüğü/gerçek araç sonuçlarıyla ayrıca tutulur.

Yedi release JSON ve26 korunan kaynak/veri dosyası byte karşılaştırması, schema/uygulanmış göç/manifest/lock korunur. Motor, kelime/seed/board, sabit5+1/ödül/best, progress/sync/cloud/queue/merge kuralları, App/account, PublishedPlay ve Sprint aynı. Yeni ücret/hesap/servis/bağımlılık/görsel/zamanlayıcı yok. Destekli gerçek telefon/DOM/yerleşim/büyük yazı/odak/native scroll/ekran okuyucu/FPS/provider ve fiziksel PWA doğrulanmadı. App Store hazır oluşu, ölçülmüş keyif/tutma veya dünya standardı başarısı iddia edilmez.

Sonraki öncelik destekli cihaz/preview erişimi ve ilk kelime/bitmiş inceleme/arşiv/hesap geçişi gözlemi. Sıradaki kaynakta uygulanabilir aday: günlük hamle/hint isteği beklerken etkin görünen kontrol ve state geri bildirimi; bu tur tamamlanmış sayılmaz, ayrı deadline/reconcile kabulleri gerekir. Haftalık inceleme24Ekim→31Ekim/sonraki uygun mevcut çalışmada kalır.

## 27 Ekim 2026 · 0.12.3 · Bekleyen bulut kaydından geri dönüş

En güncel Sites helper `258fe66fa71b4b834abf03b6e7699f56ca85a0e4`, Site24/0.12.2 ve GitHub main `00646a4c6d26ae8360e8a5d86149bd691ee75dac`; eş tam ağaç `2f00fe32f8f18845efdf122002f3463c946ea0e9` üzerinden devam. Owner/public ve aynı URL doğrulandı. README/sürüm/harita, rol/öncelikler/son koordinatör kaydı ve ortak bilgi okundu. Tek bağımsız güvenilirlik uzmanı sınırlı kaynak/probe ve son diff incelemesinde; kod/test/yayın koordinatörde. Uygulama öncesi adaylar, gerekçe ve kabul `studio-agents/journal/entries/2026-10-27_maintenance-decision.md` içindedir.

### Bugünün kalıcı iki keşfi

- **Mahalle maçı:** Futbol, Rahat6×6, KALE / FORMA / PAS / GOL; seed `2026102701`, ID `20261027-0001-4000-8000-000000000001`.
- **Sokakta doksanlar:** 90’lar, Dengeli8×8, KASET / WALKMAN / BİLYE / JETON / MİSKET / SEKSEK / MEKTUP; seed `2026102702`, ID `20261027-0002-4000-8000-000000000001`.
- Yeni tek `content/releases/2026-10-27.json` ve sona eklenen RELEASE_BATCHES girişi. Kimlik, spec/hash, sabit board, iki çapraz eğim ve20 alternatif kontrolü. Türkçe/tema/yük incelemesi kaynak düzeyinde; ölçülmüş oyuncu zorluğu iddiası yok. Aynı dosyayı yeniden çalışmada üzerine yazmak yerine mevcut snapshot/kayıt/yayından devam edilir. Ana sayfa/ilgili dünya/arşiv/tarihli damga yolları bu çifti bulur; eski beşli harita kümeleri genişlemez.

### Seçilen davranış ve oyuncu faydası

Gerçek cihaz gözlemi, yanıt vermeyen ana eşitleme ve yeni kozmetik oda karşılaştırıldı. Destekli preview'in önceki ERR_CONNECTION_REFUSED engelinde somut recovery kanıtı yok; alternatif server/browser denenmedi ve aynı başarısız deneme tekrarlanmadı. Doğrudan kanıtlı kayıt beklemesi seçildi. Uzmanın eski gerçek ProgressSync bellek probe'unda hiç çözülmeyen GET/PUT, üç yeni cycle sonrasında da sırasıyla loading/sending ve syncing durumunda kaldı; dispose sinyali iptal etse de callback yok sayınca public promise bitmedi. Bu kaynak kusurudur, canlı kullanıcı olayı veya sağlayıcı testi değildir.

Her load/save callback'i artık8sn deneme sınırında: token/yenileme/HTTP/yanıt gövdesi dahil. Her deneme ayrı controller kullanır, instance dispose aktif attempt'i iptal eder, timer/listener temizlenir. Signal'i dinlemeyen callback bile race sonrası kanalı sürekli kilitlemez. Timeout loaded/ACK üretmez; son yerel kelime ve iyi sonuç korunur. Sonraki olağan veya manuel deneme güncel snapshot ve yeni signal kullanır; geç eski success veya owner-error yeni state/cache/status/ACK/account blokunu değiştirmez. HTTP iptali sunucunun yazıyı kesin geri aldığı anlamına gelmez; mevcut idempotent/best merge korunur. Yoğun anlık retry, çıkış veya reload eklenmez.

**Albüm → ana kayıt satırı:** bulut onayı beklemesi fiziksel bağlantının kesin koptuğu diye anlatılmaz. Ana ilerlemenin cihazda kaldığı ve bulut eşitlemesinin beklediği görünür; **Yeniden eşitle** ilk GET başarısızlığını da anında tekrar dener. Cihaz yazımı başarısızsa sahte başarı yok; owner-blocked durumda bulut yeniden açılmaz ve mevcut local-only kurtarma kalır. Bu metin ayrı ek bölüm/Sprint/aktif tur kaydını kapsamış gibi sunulmaz. Min44px doğal sarılan düğme ve mevcut status alanı, yeni modal yok.

Önceki owner/current/explicit409 ayrımı, cache/load/merge/ACK ve keepalive boyut sınırı korunur. Eski daily/atlas/engine/catalog/legacy, sabit5+1, reward/best, CloudProgress algoritması, DB/uygulanmış göç/manifest/lock aynı kalır. Yeni bağımlılık, ücret, hesap, hizmet, grafik veya zamanlayıcı yok. Son kapı sayıları ve gerçek GitHub/Sites yayın kanıtı `studio-agents/journal/entries/2026-10-27_maintenance-validation.md` içinde tamamlanır. Gerçek telefon/DOM/yerleşim/büyük yazı/ekran okuyucu/FPS/provider timing/concurrent React/iki cihaz/PWA doğrulanmış sayılmaz. App Store hazır veya ölçülmüş tutma/keyif iddiası yok. Haftalık inceleme24Ekim kaydına göre31Ekim/sonraki uygun çalışmada kalır.

## 26 Ekim 2026 · 0.12.2 · Ana ilerlemenin hesap sınırı

Başlangıç güncel Sites helper `262c78ce48d0b2925b9a92bb754e9a6e0a845c62`, başarılı Site23 /0.12.1; owner/public, aynı URL, GitHub main `3e7f595dc8f8039ef7e013c1b7978498b839a1ea` tam ağaç `7686ef09d4ee04db6bd840d43b39ffeb812becba` ile eşleşti. README/sürüm/harita, çalışma sözleşmesi/rol kaydı/öncelikler ve son koordinatör kaydından devam edildi. **Patili komşular** ve **Perde açılıyor** zaten başarıyla yayımlanmıştı; yeni çift veya snapshot üretimi yok.

Gerçek cihaz/görsel kanıtı, ana eşitlemede hesap niyeti sınırı ve kozmetik/keşif odası adaylarından kayıt güvenliği seçildi. Uygulama öncesi kapsam/kabul `studio-agents/journal/entries/2026-10-26_evening-account-decision.md` içinde. Tek bağımsız güvenilirlik uzmanı yalnız kendi evening-account-review günlüğüne yazdı; uygulama/test/yayın koordinatörde. Negatif kanıt: pinlenmiş gerçek route + gerçek CloudProgress/yalıtılmış SQLite kabuğunda actor Bob/beklenen Alice GET200 Bob verisini döndürdü, PUT200 Bob marker'ını değiştirdi. Bu, auth bypass veya canlı veri olayı değildir; stale istemci niyetinin sunucu actor'ına bağlanmadığı kaynak kusurudur. Tam Worker negatif probe'u tamamlanmamış ve sonlandırılmış; kanıt diye sayılmadı.

**Ana eşitleme:** yeni hook her GET query/PUT body'de instance owner'ını taşır. Route mismatch/empty owner'da başka progress verisini döndürmeden/yazmadan409 ve açık PROGRESS_OWNER_CHANGED kodu verir. Doğru owner ve guard alanı olmayan eski istek biçimi çalışır. Bu geriye uyum kararı nedeniyle koruma yeni guard taşıyan istemci içindir; eski istemciye otomatik retrofit sayılmaz. Auth/CSRF/rate/size ve DB/göç korunur. Mevcut concurrency409 kodsuz kalır; sıradan retry gerektiren çakışma hesap-değişti sanılmaz.

**Gecikmiş callback:** class opsiyonel isCurrent predicate'i hook'taki canlı owner ve instance ref'ine bakar; eski instance dispose öncesi de yeni read/current ref'ine, cache/write/status'a dokunmaz. Render sırasında dispose yan etkisi eklenmez. Açık owner hatası o instance için bulut alışverişini durdurur; aynı sahibin yeni yerel discoveries/persist'i sürer. Yeni owner yeni instance ile mevcut load/merge yoluna döner.

**Oyuncunun gördüğü değişiklik:** ana sayfa/Albüm ve Solo, ek bölüm, Gizli Tema, Hızlı Tur/Arena yüzeylerinde Hesap değişti bildirimi vardır. Cihazın ana progress yazımı gerçekten başarılıysa ve oyun dışındaysa Profili yenile eylemi açılır. Yazım başarısızsa bu başarı iddiası yapılmaz; yalnız cihaz kaydını yeniden dene ile persist denenir, yanlış bulut kanalına istek gitmez. Aktif turda reload sunulmaz; turdan çıkınca kullanılacağı açıklanır. Ana Progress'in kaydı, ayrı ek bölüm/Sprint/tüm aktif tur durumunun kaydı diye sunulmaz. Albüm durum metni hesap değişimini çevrimdışı diye anlatmaz.

Son kaynakla **206/206 test /44 grup**, **114 tahta /2280 alternatif**, TypeScript ve üretim build geçti. 16 yeni kabul gerçek route/store/SQLite, gerçek hook request/code/predicate, ProgressSync blocked/local/storage/inactive GET+PUT ve notice eylemlerini kapsar; önceki App gezinme kabulüne shell/oyun inGame kablolaması eklenir. Başlangıç uyumluluk fixture'ında PUT kendi sound tercihini değiştirdiği için sonraki true varsayımı yanlıştı; fixture aynı marker'ı yollayacak şekilde düzeltildi. Son kontrollerde başarısızlık kalmadı. **217 üretim Worker HTTP kontrolü** de son build ile geçti. CI/paket ve gerçek yayın kanıtı koordinatör doğrulama kaydında ayrıca tutulur.

Eski içerikler, motor/tahta, ödül/best/unlock, solo/ek bölüm merge ve kuyruk, cloud merge algoritması, şema/göç/manifest/lock değişmez. Yeni servis, hesap, ücret, bağımlılık, görsel veya zamanlayıcı yok. Önceki preview bağlantı engelinde yeni recovery kanıtı yok; alternatif server/browser veya aynı başarısız erişim denemesi yinelenmedi. Gerçek telefon/DOM/yerleşim/ekran okuyucu/FPS, gerçek cookie-token provider yarışı ve concurrent React doğrulanmadı. Sıradaki öncelik destekli gerçek cihaz, zayıf bağlantı ve iki gerçek hesapla bu geçişi izlemek; App Store hazır oluşu iddiası yok. Haftalık değerlendirme son24Ekim kaydına göre31Ekim/sonraki uygun çalışmada kalır.

## 26 Ekim 2026 · 0.12.1 · Aradan sonra temiz seçim

Güncel Sites helper `7d06e7fc2f50a00fabe79b26e92b39cf00c88d8c`, başarılı 22. sürüm / package 0.12.0 ile başlandı. GitHub main `0a2d81092bc7fc1054da28595bb49a1f20be5b8a`, tam ağaç `9e7caf15901aa873dd3e6491e3cddba7a7cf52c8` eşleşir; owner/public erişimi ve aynı adres korunur. Eski yerel 0.11.3 tabanı kullanılmadı. Gece eklenen ana ekran/yeşim-fildişi tahta/seçili harf/kenar bildirimi ve onaylı günlük sesi değişmeden kalır. Başlangıç/kabul `studio-agents/journal/entries/2026-10-26_maintenance-intake.md`; tek odak uygulama öncesi maintenance-decision kaydında.

### İki yeni kalıcı keşif

- **Patili komşular:** Hayvanlar, Rahat, 6×6, KEDİ / KÖPEK / PATİ / YUVA; seed `2026102601`, ID `20261026-0001-4000-8000-000000000001`.
- **Perde açılıyor:** Dünya Sineması, Dengeli, 8×8, SENARYO / KAMERA / KURGU / SAHNE / AFİŞ / SEANS / REJİ; seed `2026102602`, ID `20261026-0002-4000-8000-000000000001`.
- `content/releases/2026-10-26.json` yeni tek snapshot; RELEASE_BATCHES'e yalnız bir giriş eklendi. İki çapraz eğim, spec/hash, seed/ID ve 20 alternatif yerleşim doğrulanır. Türkçe kelime ve tema uyumu kaynak incelemesiyle değerlendirildi; ölçülmüş oyuncu zorluğu iddia edilmez. Önceki beş tarih/tahta/kelime/seed dosyası aynı. Mevcut ana sayfa, kalıcı arşiv, dünya filtresi ve tarihli damga yolu çifti bulur; eski beşli harita kümeleri genişletilmez.

### Seçilen iyileştirme

Gerçek cihaz gözlemi, input yaşam döngüsü kusuru ve yeni kozmetik keşif odası adaylarından ikinci iş seçildi: doğrudan kaynak/VM kanıtı, düşük maliyet ve kayıt dışı dar etki. Tek sınırlı güvenilirlik uzmanı kendi günlüğünde eski Board gövdesinde global blur/hidden sonrası preview ve pointerup commit'ini doğruladı; son diff'i de inceledi. Bu native cancel üretmeyen kontrollü olay dizisi uygulamadaki eksik korumayı gösterir; fiziksel telefonda gözlenmiş arıza gibi sunulmaz.

**Tahta → başka pencere/sekme/arka plan:** window blur veya yalnız hidden visibility olayı aynı clear yolunu çağırır. Drag, iki-uç ve klavye anchor'ı, bekleyen preview RAF'ı ve seçili harfler temizlenir; eski pointerup kelime göndermez. Yeniden seçim yeni girdiden başlar. Visible olayı tek başına aktif seçimi bozmaz. Listener'lar unmount'ta kaldırılır; ref üzerinden güncel onPreview kullanılır. Kabul edilmiş çizgiler, tahta rect/hit/ölçüleri, saat/ceza/skor/kayıt kuralları değiştirilmez. Günlük/Arena zamanı arada sürer.

**Duraklatma → erişilebilir açıklama:** odak kalmış olsa bile paused etiketi gerçek cursor harfi yerine duraklamayı anlatır. Devamda normal konum/harf ve klavye talimatları döner. Görünür nokta yüzeyi ve tabIndex davranışı korunur; ekran okuyucu anonsu gözlenmedi.

### Doğrulama ve sınırlar

12 yeni gerçek Board TSX/snapLine VM kabulü; global iptaller, pending RAF/stale up, keyboard/tap anchor, visible event, latest callback/unmount, sekiz yön, ters çaprazlar, mouse/touch iki-uç, zoom pan, Escape/native cancel/blur/resize/signature ve paused ARIA. Aynı testler değiştirilmemiş 0.12.0 Board kaynağında **6 başarısız / 6 başarılı**, düzeltilmiş kaynakta **12/12 başarılı**. Bu karşılaştırma yalnız input/markup sözleşmesidir. Bütün paket **190/190 test, 41 grup**, **114 tahta / 2280 alternatif**, TypeScript ve üretim derlemesi geçti. İki bağımsız oyuncuyla **204 üretim Worker HTTP kontrolü** de geçti. CI ve tam kaynak/yayın kanıtı ayrı koordinatör kaydında tutulur.

Destekli `sites-preview status` stopped döndürdü; önceki ERR_CONNECTION_REFUSED için somut repair/recovery kanıtı yoktu. Aynı tarayıcı denemesi veya alternatif server/browser tekrarlanmadı. DOM/native pointer sırası, React concurrency/StrictMode, gerçek telefon/büyük sistem yazısı, ekran okuyucu, fiziksel PWA ve FPS doğrulanmadı. Bu sınır açık cihaz önceliğidir; dünya standardı, eğlence/tutma, App Store hazır oluşu veya gelir sonucu iddia edilmez. Canlı log örneği 0 olaydır, bütün oturumlara genellenmez.

Yeni ücret, servis, hesap, grafik üretimi, bağımlılık veya zamanlayıcı yok. Önceki bölüm/atlas/ödül, Solo/PublishedPlay ve save kuyruğu/merge, DB/göç/manifest/lock aynı kaldı. Sonraki öncelik destekli gerçek cihaz/önizleme erişimi ve ilk kelime/çapraz/duraklatma/arşiv dönüşü gözlemi; yeni büyük deneyim bunun önüne geçirilmez. Haftalık değerlendirme 24 Ekim kaydına göre 31 Ekim veya sonraki uygun çalışmada yapılır; bugün yinelenmedi.

## 25 Ekim 2026 · 0.12.0 · Dokunulan bir keşif

Kullanıcının skill odaklı görsel/oynanış isteği: game-ui-ux ve layout-and-flow, game-feel ve feedback-recipes okunarak mevcut React/TypeScript SVG/CSS yüzeyinde uygulandı. Kalıcı skill push'ı önceki turda başarısız olduğundan korunmuş kaynak kopyaları çalışma rehberi olarak kullanıldı. Motor/dependency, hesap, kayıt, kelime, tohum ve ödül değişikliği yok.

Ana sayfada gerçek yıldız/keşif/dünya birikimi, daha kısa resimli giriş ve doğrudan sıradaki bölüm eylemi. Oyun ekranında yeşim zemin, fildişi harf yüzeyi ve belirgin kontrast. Seçilen harfler aynı preview hücrelerinden türetilen renk/ölçek tepkisi verir; hit koordinatları değişmez. Normal buluşlar alt kenar bildirimi, son kelime büyük kutlama kullanır. Günlük buluş sesi yalnız başarılı sunucu yanıtından sonra çalar. Hareket azaltma, büyük yazıda doğal akış ve ipucu kartlarının iki yüzlü boyut koruması sürer.

Tek sınırlı deneyim incelemesi: grid positioning ve Sprint başlık kontrastı bulguları düzeltildi. 178 test, TypeScript, 112 tahta/2240 alternatif, üretim derlemesi başarılı. Worker HTTP 200 kontrolü ve final paket doğrulaması yayın kaydında. Destekli preview yine ERR_CONNECTION_REFUSED; DOM, gerçek telefon, büyük yazı piksel ölçümü ve FPS gözlenmedi. Dünya standardı, retansiyon veya eğlence başarısı kanıtlanmış sayılmaz.


## 25 Ekim 2026 · 0.11.3 · Keşiflerine aynı yerden dön

Güncel Sites helper `965a4bea9af80d347bfaab8cca630ba02a0c8bc1`, sürüm 20, owner/public erişimi ve GitHub main `8bf758e73367f9bb07dcac76e92c0164968997da` aynı tam ağaçla açıldı. Bugünün **Kıyıda bir gün** / **Efsanelerin kapısı** çifti zaten yayımlanmış; snapshot/kimlik/tohum/kelimeler değişmedi. Kök sözleşme, güncel README/sürüm/harita, öncelik ve son günlükten devam edildi.

Arşiv dönüşü, gerçek cihaz kanıtı ve yeni keşif odası adaylarından, açık öncelik ve doğrudan kaynak kanıtı nedeniyle ilk iş seçildi. Kabul uygulamadan önce `studio-agents/journal/entries/2026-10-25_archive-decision.md` içine yazıldı. Tek sınırlı güvenilirlik uzmanı ilk kaynak/VM incelemesini ve son diff kontrolünü yürüttü; uygulama ve yayın koordinatörde.

**Oyuncunun gördüğü değişiklik:** Ana sayfadaki bölüm arşivinden açıp geri döndüğünde arşiv yeniden açılır; Albümde tarih seçip oynadıysa aynı tarih penceresi geri gelir. Dünya filtresi kendi temasında kalır. Yüklenen eski sayfalar ve çiftin companion özetleri aynı oturum belleğinde durur; ilk sayfa ağ yanıtı bunları silmez. Seçilen karta yeniden odak/nearest scroll istenir. Sonuçtan çiftin diğer bölümüne geçiş ilk dönüş hedefini korur. Doğrudan ana sayfa kartı arşiv açmaz; Solo, Gizli Tema, Hızlı Tur veya yeni gezinme eski dönüş niyetini temizler. Son nokta bağımsız incelemenin yakaladığı somut ek kusurdu ve kabul testine eklendi.

**Katalog güvenilirliği:** Başarısız sayfa kendi offset'iyle denenir; başarılı aralık korunur. Reconnect ilk sayfayı birleştirir. Yeni ön bölümler sayısal offset'i kaydırmışsa overlap üzerinden düzeltilir; yeni ilk sayfayla hiç örtüşme yoksa yeni içerik boşluğu yüklenebilir kalır, eski kartlar yine kaybolmaz. İptal edilmiş/geç yanıtlar istek nesliyle yok sayılır. API'nin ilk sayfası gelmeden bir kart seçilmişse dönüşte görünür özetler korunur ve eksik ilk sayfa tamamlanır. Yeni kalıcı cache/DB biçimi yoktur; mevcut ilk-sayfa cihaz cache'i korunur.

Taşınan snapshot yalnız public katalog metaverisi, köken/hesap/filtre ve dönüş hedefidir; private kart değerleri, earned bayrağı, playable tahta veya save taşınmaz. Sahip/köken/koleksiyon/tema/seçili kimlik uyuşmazlığı reddedilir; ilerleme mevcut sahibin hook'uyla yeniden okunur. Sekme yenilemesi veya OS kapanmasında gezinme konumu kalıcılığı iddia edilmez. Önceki kayıt kuyruğu, Solo birleşimi, rekor, ödül ve sabit atlas kümeleri değiştirilmedi.

13 yeni gerçek hook/bileşen VM kabulü: iki sayfa ve devam imleci, çevrimdışı dönüş, ilk yanıt öncesi seçim, aynı sayfa retry, reconnect/ön ek/boşluk, stale/abort/unmount, eski cache, Albüm tarihi, sahip/filtre ayrımı, odak/scroll hedef çağrısı ve gerçek App related/doğrudan/dünya/bağımsız mod dönüşleri. Bunlar DOM, React concurrency/StrictMode veya telefon testi değildir. **178/178 test, 39 grup**, **112 tahta/2240 alternatif**, TypeScript, üretim build ve iki bağımsız oyuncuyla **200 Worker HTTP** geçti; kanıt son koordinatör kaydında tutulur; GitHub CI/tam ağaç eşleşmesi ve gerçek Sites yayın cevabı ayrıca gereklidir. Yeni ücret, hesap, bağımlılık, görsel üretimi veya zamanlayıcı yok. Sıradaki öncelik destekli gerçek cihaz/ilk açılış ve bu dönüşün büyük yazı/dokunma gözlemidir; preview toparlanma kanıtı bulunmadığından alternatif yol denenmedi.

## 25 Ekim 2026 · 0.11.2 · İpucu Avı kartlarının alanını koru

Başlangıç güncel Sites helper kaynağı `bb33a116f8d7adb859890b5edbd8942d54526e60` / başarılı 19. sürüm ve public sahip erişimi; GitHub main `84cc59ea6cf970723f3464de6a047a243e472cb2`, eş ağaç `eaff7e5546b31b9fe371ba94ac8797955690b7eb`. Bugünün **Kıyıda bir gün** ve **Efsanelerin kapısı** çifti zaten yayında; yeni çift eklenmedi. Önceki kayıt/açılış düzeltmesi aynı kaldı.

Önceki deneyim incelemesinden kalan somut sorun seçildi: hedef bulununca tanım sınıfı ve uzun metin kayboluyor, kart/ızgara küçülebiliyor ve PlayLayout yeniden ölçümü tahtayı değiştirebiliyordu. Arşiv dönüşü ve gerçek cihaz kanıtı diğer adaylar; yeni büyük özellik veya geniş araştırma tekrarı yapılmadı. Uygulama öncesi kabul `studio-agents/journal/entries/2026-10-25_clue-layout-decision.md` içinde.

**Oyun ekranı → İpucu Avı:** kartın `clue-tag` türü artık tamamlamadan bağımsız. Tanım/harf sayısı ve cevap aynı intrinsic grid alanında her iki durumda da ölçüye katılır; yalnız görünür yüz değişir. Böylece kısa tanımın uzun cevabı için de yer önceden ayrılır. Sabit metin yüksekliği, kırpma ve iç scroll yoktur; büyük yazı doğal sarılır. Bulunmamış cevap inline `visibility:hidden` ve `aria-hidden=true`; erişilebilir kart adı yalnız tanımı/harf sayısını içerir. Harf sayısı bileşenin açık kuralıyla ayrı satırdadır. Normal çok parçalı kelimeler, Altın Kelime ve bulunmuş renk/hareket tercihleri korunur.

**165/165 test, 37 grup**, **112 tahta / 2240 alternatif**, TypeScript, son üretim derlemesi ve iki bağımsız oyunculu **200 Worker HTTP kontrolü** geçti. Dört yeni gerçek WordList markup sözleşmesi, tüm 26 İpucu Avı bölümünün durumlarını, gizli/erişilebilir yüzleri, uzun metin ve normal parçalı/golden davranışını denetler. Bu testler CSS piksel geometrisi ölçmez. Paylaşılan bileşen değiştiği için tüm regresyonlar ve son build/HTTP doğrulandı; içerik/tahta/atlas/Progress/ödül/kayıt kuyruğu/DB/göç/manifest başlangıçla aynı. Yeni bağımlılık, servis, görsel üretimi, harcama veya zamanlayıcı yok.

Tek sınırlı uzman son kaynak/erişilebilirlik incelemesi yaptı. Açık harf sayısı satır kuralı önerisi uygulandı; başlangıçtaki olası bitişme uyarısı gözlenmiş üretim kusuru sayılmadı. Son inceleme engel bulmadı. Gerçek DOM, telefon, büyük sistem yazısı, ekran okuyucu ve FPS doğrulanmadı; önceki preview engelinde toparlanma kanıtı yok, başka browser/server denenmedi. Sıradaki odak arşivden dönüş bağlamını koruma; gerçek cihaz doğrulaması açık kalır. CI/tam kaynak eşleşmesi/birleştirme ve aynı adrese Sites yayını gerçek araç sonuçlarıyla ayrıca doğrulanır.

## 25 Ekim 2026 · 0.11.1 · Beklemeden keşfe dön

Başlangıç en güncel Sites kaynağı `d3dfeb4a91453c56e15b1cf1a947434bc5a875f7`, başarılı 18. sürüm, aynı public adres ve sahip erişimi; GitHub main `69d219b217d02764b8721bb674e9c4285aeda7db`. Eski yerel 0.8.4 paketi kullanılmadı. Güncel 0.9/0.10/0.11 mobil düzeni, Hızlı Tur ve atlas devamı korundu. Root sözleşmesi, rol ve son doğrulama/öncelikler okundu; iki sınırlı bağımsız inceleme yalnız ayrılmış günlüklerine yazdı. Uygulama/yayın tek koordinatörde kaldı.

### İki kalıcı bölüm

- **Kıyıda bir gün:** Dünya Turu, Rahat, 6×6; KUM, ADA, KIYI, DALGA. Tohum `2026102501`, kimlik `20261025-0001-4000-8000-000000000001`.
- **Efsanelerin kapısı:** Mitoloji, Dengeli, 8×8; ZEUS, HERA, HERMES, ATHENA, APOLLON, ARTEMİS, ATLAS. Tohum `2026102502`, kimlik `20261025-0002-4000-8000-000000000001`.
- `content/releases/2026-10-25.json` tek değişmez snapshot'tır. İki çapraz eğim, temizlenmiş spec/hash ve 20 alternatif kontrolü geçer. Mevcut ana sayfa, kalıcı arşiv, tarihli damga ve dünya filtresi bu çifti bulur. Önceki dört tarih dosyası ve harita kümeleri aynı kalır. Yeniden çalışmada mevcut çift çoğaltılmaz.

### Seçim ve yapılan davranış

Üç aday: doğrulanmış cihaz tahtasında ağ beklemesi; mobil hedef görünürlüğü/İpucu Avı kart yüksekliği; arşiv dönüş bağlamı. Kullanıcının iç kelime kaydırması şikayeti 0.9 kaynak düzeninde giderilmiş; aynı yenileme tekrarlanmadı ve cihazda doğrulanmış gibi sunulmadı. İki uzman da hâlâ açık indirilmiş bölüm bekleyişini önceliklendirdi. Uygulama öncesi kabul `studio-agents/journal/entries/2026-10-25_maintenance-decision.md` içinde.

- **Çevrimdışı hazır → aç:** yalnız kimlik/hash/spec/yolları eşleşen cihaz tahtasıyla hemen Solo açılır; seri tahta/progress GET'leri atlanır. Hesap varsa mevcut beklenen sahip korumalı merge PUT'u arka planda başlar. İlk indirme/bozuk cache mevcut cold yol, açık hata ve yeniden denemede kalır. Cold özel okumada da beklenen sahip kontrolü vardır.
- **Geç hesap onayı:** aynı kuyruk/nesil ayrı resume snapshot'ı verir. Solo key/tur sıfırlanmaz; functional merge ve functional yeni seçim yeni/diğer cihaz kelimelerini birlikte korur. Süre güncel state'e performans tick farkı eklediği için yüksek bulut süresinden geriye dönmez; Daily sunucu saati ayrı kalır.
- **Tekrar / rekor / yardım:** tekrar turu tarihsel snapshot'ı almaz; eski iyi sonuç kuyruk/cihazda saklanır. İlk cached turda hesap tabanı kesin değilse yeni kişisel rekor iddiası kapalıdır; sonraki tekrar onaylı başlangıçla karşılaştırabilir. Yüklenen kelimeye sahte buluş animasyonu verilmez; yardım açıkken sonuç penceresi üstüne binmez.
- **Korunanlar:** hesap değişimi iptali, geç eski yanıtı yok sayma, aynı sekmede son kayıt drain'i, token/HTTP/JSON deadline'ı, depolama uyarısı ve çevrimdışı yeniden deneme. Yeni endpoint, tablo, göç, bağımlılık, grafik üretimi, ücretli hizmet veya zamanlayıcı yok.

### Kanıt ve sonraki iş

**161/161 test, 36 grup**, **112 tahta / 2240 alternatif**, TypeScript, son Sites üretim derlemesi ve iki bağımsız oyuncuyla **200 Worker HTTP kontrolü** geçti. Dört yeni PublishedPlay bağlantı ve sekiz gerçek Solo gövdesi senaryosu eklendi; önceki 12 kuyruk kabulü korunarak eski cached bekleme varsayımı anında açılışa, cold timeout ayrı fixture'a taşındı. Yalıtılmış hook/IO/zamanlayıcı kabuğunda eski 0.11.0 Solo sekiz yeni kabulün beşinde, eski PublishedPlay seçilmiş iki açılış/birleşim kabulünün ikisinde başarısız oldu; düzeltilmiş kaynakta geçti. Bu VM'ler DOM, React eşzamanlı/StrictMode veya telefon kanıtı değildir.

Worker yanlış/boş beklenen sahipte özel okumayı reddeder, doğru sahipte kayıt verir; eski istemci biçimleri çalışır. Yeni iki bölümün ana sayfa/arşiv/API/dünya filtresi, eski atlas snapshotları, hesap/misafir, bulut birleşimi, arkadaş/Arena, kayıt ve çevrimdışı regresyonları da geçti. Eski yayın dosyaları, motor/katalog/klasik/atlas içerik, ödül/harita/Progress kuralları, veritabanı/göçler ve hosting manifesti başlangıçla aynı. Son bağımsız dar inceleme yeni engel bulmadı.

Erişilebilen üretim hata günlüğü örneği boş döndü; tüm oyuncu oturumları için hatasızlık kanıtı sayılmaz. Destekli preview ERR_CONNECTION_REFUSED sonrasında toparlanma kanıtı yok; başka browser/server denenmedi. Gerçek telefon, ekran okuyucu, fiziksel çevrimdışı PWA ve FPS doğrulanmadı. Cached açılış başına tek başlangıç PUT'u mevcut 40/dk sınırına tabidir; sekme/OS kapanışında buluta kesin teslim garantisi yoktur. Oyuncu tutma/keyif, gelir veya App Store hazır oluşu iddia edilmez. Sonraki öncelik İpucu Avı hedef/tahta yüksekliğini buluş sırasında sabit tutma ve destekli gerçek cihaz kontrolü; arşiv dönüş konumu açık. GitHub CI/tam ağaç eşleşmesi ve gerçek Sites yayın sonucu bu kayıttan sonra ayrıca doğrulanır.

## 25 Ekim 2026 · 0.11.0 · Keşif atlasının devamı

Kullanıcı üç haritayı bitirdiğini bildirdi. 13 yeni temalı 5+1 harita, toplam 78 bölüm eklendi. İlk üçlü, kimlikler ve 18 mevcut tahta birebir korundu. İlerlemeyle yeni dünya açılır; bitmiş eski üçlü yeni ilk dünyaya önerilir. Yeni bölüm kayıtları v2 Progress ile yerel/bulut doğrulamaya dahildir. Toplam 16 harita, 96 parça/bölüm; sınırsız üretim veya gerçek oyuncu tutma artışı iddia edilmez.

Yeni 26 İpucu Avı bölümü kısa tanım ve harf sayısından kelime bulmayı gerektirir. Tanım yalnız kabul edilmiş kelime bulununca cevaba döner; erişilebilir etiket cevabı sızdırmaz. Yeni tahtalar 6–9 hücre, dört ila altı hedeftir. Hareketli bulut/yıldız, hacimli duraklar, seçili hedef alanı ve koleksiyon göstergesiyle harita baştan düzenlendi, ana ekranın ilk oyun alanına taşındı. Bölüm sonu gerçek sıradaki keşfin adını gösterir ve gerektiğinde yeni dünyaya geçirir.

Kabul edilmiş kelime tahtada adıyla kısa animasyon gösterir. Son kelimeden sonra 650ms görünürlük; azaltılmış harekette beklemeden sonuç. Daha önce bulunan çizgiler yüklenirken yeniden canlandırılmaz. Yeni mod yardımında tanım oyunu açıklanır. Tahta üzerindeki efekt yerleşim veya seçim koordinatlarını değiştirmez; hedefler açık kalır.

Referans ilkeleri: Dream Games resmi Royal Match dünya/alan ilerlemesi ve tutarlı sanat; PeopleFun resmi Wordscapes kelime keşfi ve sakin sahneleri. Varlık kopyası veya yeni ücretli servis yok. Mevcut SVG sistemi, tek uygulama sahibi ve iki sınırlı ajan incelemesi kullanıldı. Kapsam ve kabul atlas-intake; kaynak/kayıt incelemesi atlas-reliability; doğrulama atlas-validation günlüğündedir.

## 25 Ekim 2026 · 0.10.0 · Oynanış, dünyalar ve arkadaşlar

Önceki görsel yenilemenin ötesinde isteğe bağlı Hızlı Tur eklendi: 3 saniye hazırlık, 60 saniye oyun, 6×6 tahtada dört kelime, 7 saniye seri penceresi, en fazla ×3 çarpan, tamamlanan tahta için 100 puan ve yeni tahta. Yanlış seçim seriyi sıfırlar; süre arka planda devam eder. Sonuç gerçek puan, kelime, tahta ve en uzun seriyi gösterir. Cihaz rekoru hesap anahtarıyla ayrılır; bulut ilerlemesi, ödül veya rekabetçi derecelere yazılmaz.

Tarihli kaynak bölümler dünya kartlarının toplamına ve ilgili dünyanın bölüm penceresine katılır. API temayı sayfalamadan önce filtreler, bütün arşivden sayar ve damga çiftinin eksik eşini özet olarak taşır. Aynı tema çifti 24 kayıt sınırında bölünse de bağlantı korunur. Son eklenenler yalnız isteğe bağlı özet alanıdır. Eski kimlikler, tohumlar, kelimeler, beşli keşif haritaları ve tamamlamalar korunur. Tema üzerinden bölümden dönünce dünya penceresi tekrar açılır.

Arkadaşlar; ekip araması, haftalık lig ve maç geçmişi sekmeleri, görünür davet kodu/paylaş/odaya dön adımları, boş/yükleniyor/hata/yeniden dene durumlarıyla yenilendi. Var olan aktif oda yeni arkadaş daveti sanılmaz. Mutasyon başarısı ile yenileme hatası ayrılır; hesap değişiminde bileşen yeniden açılır. Sunucu oturum, oda, izin ve sonuç kuralları korunur.

Tek özgün ada illüstrasyonu WebP olarak 173 KB'a indirildi. Hareketli yıldız, süre halkası, seri çubuğu, puan geri bildirimi ve geri sayım eklendi. Azaltılmış hareket desteği var. İki sınırlı uzman incelemesi yapıldı; uygulama ve yayın tek koordinatörde. Yeni servis, bağımlılık veya zamanlayıcı yok.

Doğrulama sonuçları ortak sürüm günlüğünde. Önizleme bağlantısı önceki denemede reddedildi; toparlanma kanıtı olmadan alternatif yol denenmedi. Gerçek telefon, görsel sığma, FPS, oyuncu keyfi/tutma artışı ve App Store hazır oluşu doğrulanmış sayılmaz.

## 25 Ekim 2026 · 0.9.0 · Mobil oyun deneyimi

Kullanıcının profesyonel mobil UI/UX isteği öncelik oldu. İki sınırlı uzman incelemesi, tek uygulama sahibi. Kelime listesindeki 133px iç kaydırma kaldırıldı; tüm hedef/parçalar açık ızgarada kalır. Ortak PlayLayout kullanılabilir viewport, gerçek içerik yüksekliği ve güvenli alt boşluğa göre tahtayı boyutlar; aşırı kısa ekran/büyük yazıda 22px hücre alt sınırıyla doğal taşma korunur. Büyük harf modu bilinçli kaydırma ve iki uca dokunma davranışını korur. Tahta ölçüsü değişirse seçim temizlenir.

Krem/yeşil/altın kimliği; yuvarlak başlıklar, daha canlı dünya başlangıç kartı, hacimli kontroller, hedef/çizgi geri bildirimi ve hafif sonuç kutlamasıyla yenilendi. Azaltılmış hareket ve kontrast korunur. Oyun motoru, tahta kimlikleri, içerik, ödül, hesap ve kayıt kodu değiştirilmedi. Yeni bağımlılık veya ücretli servis yok.

Destekli preview CLI çalışıyor bildirdi, bulut tarayıcısı ERR_CONNECTION_REFUSED verdi; status aynı adresi bildirdi. Alternatif tarayıcı yolu kullanılmadı. Görsel/gerçek telefon sığması ve FPS doğrulanmadı. Yerel 133 test, 32 tahta/640 alternatif ve tip kontrolü geçti. Son derleme/Worker/CI/yayın kanıtı ortak doğrulama günlüğünde takip edilir.


## 24 Ekim 2026 · 0.8.4 · Son kayıt ve hesap kuyruğu

Güncel Sites kaynağı `4e3e63c8c9df9af590128c21e198c1e16712ffc4`, kayıtlı 14. sürüm ve herkese açık sahip erişimi; GitHub main `4e311d7bea09a784f4fedf612f77de5031fd9db1` kontrol edildi. Bugünün **Parkede küçük mola** ve **Yörüngede bir gün** çifti zaten yayında; dört kaynak yayın dosyası aynen korunur.

Adaylar, seçim ve uygulama öncesi kabul ölçütleri `studio-agents/journal/entries/2026-10-24_evening-coordinator-decision.md` içinde. Açık iki kayıt sorunu, indirilmiş tahtanın açılışı ve arşiv dönüşü karşılaştırıldı. Son tamamlamanın başka cihazda görünmesi ve hesap güvenliği önce geldi. Tek sınırlı güvenilirlik uzmanı tasarım ve son diff'i bağımsız inceledi; aynı deneyim taraması/araştırması tekrarlanmadı. Koordinatör kod, test ve yayının tek sahibi kaldı.

### Oyuncuda değişen davranış

- **Tarihli/ek bölüm → geri dönüş:** ilk kısmi gönderim sürerken son kelimeyi bulup geri dönersen, başarılı ilk yanıtın ardından son tamamlama da aynı hesap için gönderilir. İkinci gönderimde yeni son kayıt oluşması da korunur. Başarısız gönderimde kayıt cihazda kalır; kontrolsüz tekrar döngüsü yoktur.
- **Aynı bölümde hesap değişimi:** eski kanal iptal edilir, yeni hesap ayrı gönderir. Geç eski yanıt veya `finally` yeni kaydı/arayüzü/kilidi değiştiremez. Hesap değişiminin geçiş karesinde eski kayıt veya boş hata yerine hazırlık durumu gösterilir.
- **Uzayan istek:** sekiz saniyelik uygulama sınırı token bekleme, HTTP ve JSON okumayı kapsar. Aktif oyunda sonraki olağan bağlantı/periyodik deneme en son kaydı gönderir. Sunucu beklenen hesapla doğrulanmış kimliği karşılaştırır; değişmiş/yanlış/boş kimlik altında eski snapshot yazılamaz. Alanı olmayan eski istemci isteği geriye uyumludur.
- **Cihaz kaydı:** yazı hemen yapılır, ayrılmış kanalın geç yanıtı da kendi sahibinin mevcut cihaz kaydıyla en iyi sonuç kuralını kullanır. Depolama hatası açık kalır; gerçekten düzeldiğinde durum yenilenir. Oyun içi **Neler değişti? → 0.8.4** bu davranışları anlatır.

### Doğrulama ve sınırlar

**130/130 test, 30 grup**, **32 tahta / 640 alternatif**, TypeScript ve son üretim derlemesi geçti. Son üretim paketiyle iki bağımsız oyunculu **180 Worker HTTP kontrolü** başarılı. Mevcut üç TSX regresyonuna dokuz anlamlı senaryo eklendi: çıkışta son kayıt, hesap/iptal/geç yanıt, zaman aşımı ve tekrar, hata sonrası durma, daha iyi cihaz sonucu, ikinci uçuşta üçüncü kayıt, takılan JSON, cihaz yazma hatası/düzelme ve çevrimdışı dönüş. İlk yeni senaryo kümesi eski 0.8.3 bileşeniyle altı başarısızlık vererek asıl tetikleyicileri yakaladı; düzeltilmiş kaynakta geçti. Bu testler gerçek TSX ve kuyruk gövdesini sahte hook/IO/zamanlayıcıyla çalıştırır; DOM, React eşzamanlı/StrictMode veya telefon testi değildir.

Worker kontrolleri yanlış/boş beklenen sahip ve yetkisiz yazıyı reddeder, diğer oyuncunun kaydını değiştirmez, doğru sahipte ve eski istemci biçiminde kayıt kabul eder. Önceki hesap, misafir, bulut birleştirme, arkadaş odası, Arena, çevrimdışı/önbellek ve sabit harita regresyonları korunur. Eski bölümler/tahtalar/kelimeler, motor, klasik içerik, kayıt/ödül/harita kuralları, veritabanı/göçler ve hosting manifesti başlangıçla aynı. Yeni bağımlılık, ücret veya entegrasyon yoktur.

Bağımsız son inceleme engel bulmadı. Son küçük hazırlık görünümü değişikliği koordinatör tarafından TSX kabulü, tip, tam test, yeniden derleme ve son HTTP paketiyle doğrulandı; bağımsız incelemeye dahilmiş gibi sunulmaz. İlk haftalık değerlendirme `2026-10-24_weekly-review.md` içinde, gerçek erişilebilir 21–24 Ekim kaydı ve eksik cihaz kanıtıyla yapıldı. Sonraki öncelik indirilen tahtayı ağ beklemeden açmak ve geç bulut yanıtını yeni kelimeleri silmeden birleştirmek; ardından arşiv dönüşü ve destekli gerçek cihaz kontrolü.

Destekli önizleme engelinde toparlanma kanıtı yok; alternatif tarayıcı/server denenmedi. Telefon, ekran okuyucu, fiziksel çevrimdışı PWA açılışı ve FPS doğrulanmadı. Sekme kapanması/işletim sistemi sonlandırmasında buluta kesin teslim iddiası yok; cihaz kaydı korunur. Oyuncu tutma, gelir veya deneyim artışı ölçülmedi. App Store/native paket, e-posta sağlayıcısı, reklam ve ödeme bu sürümde kurulmadı. GitHub CI, tam ağaç eşleşmesi ve Sites'in gerçek yayın cevabı ayrıca tamamlanmadan bu yerel kayıt yayın kanıtı değildir.

## 24 Ekim 2026 · 0.8.3 · İlk ajan döngüsü

Kullanıcı `Agent-dosyaları v1(1).zip` ile bakım ve geliştirmede ajan yapısını kullanmamızı istedi. Güncel Sites kaynağı `14e8cceb5f4d7ece7911eba21ab98b5523b254cf`, kayıtlı 13. sürüm, herkese açık sahip erişimi ve GitHub `33b85d16c7291576969ca4914ae15087538603b1` doğrulandı. Bugünün iki bölümü zaten yayımlandı; aynı içerik dosyaları korunur.

Şablon `studio-agents/` altında oyuna uyarlandı. Kök AGENTS, iki uzman rolü, hedef/ölçüt, uygulama rehberi, mevcut göreve bağlı döngü, ortak günlük ve boş başlayan kanıtlı rol hafızaları var. Yeni eklenti/hesap/ücretli servis veya ayrı zamanlama kurulmadı. Koordinatör uygulama ve yayının tek sahibi; iki gerçek alt ajan salt okunur bağımsız inceleme yaptı. Dosya varlığı çalışan süreç veya ürün başarısı gibi sunulmaz.

Deneyim incelemesi açılış beklemesi, kayıt hatasının olumlu simgesi ve arşiv dönüş bağlamını; güvenilirlik incelemesi hata dönüşündeki gönderim eksiği ile iki uçuş/kuyruk sorununu raporladı. Kaynaklı bulgular ve sınırlar `studio-agents/journal/entries/2026-10-24_*review.md`, seçim ve uygulama öncesi kabul ölçütü `2026-10-24_coordinator-decision.md` içindedir.

Seçilen odak: tahta GET'i hata/zaman aşımı verince cihazdaki tamamlanmış kayıt `dirty=false` kaldığı için yeni hamle olmadan buluta gönderilmiyordu. Geri dönüş yolu artık gönderim bekleyen kayıt sayılır; mevcut sahip/generation sınırı ve birleştirme korunur. Aynı kayıt güvenilirliği işinde depolama hatası uyarı simgesi/hata biçimi, uçuş sırasında bekleme simgesi eklenir. İndirilmiş bölümün sekiz saniyeye kadar ağ bekleyişi, uçuş sırasındaki son kaydın kaçması, eski hesap PUT kilidi ve arşiv konumu ayrı açık işlerdir; bu sürüm bunları düzeltmiş sayılmaz.

Yerel sonuç: **121/121 test**, **32 tahta + 640 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. Son paketle iki bağımsız oyunculu **175 Worker HTTP kontrolü** geçti. Üç yeni kalıcı regresyon gerçek TSX gövdesini yalıtılmış hook/IO kabuğunda çalıştırır; yeni hamle olmadan doğru sahipte gönderimi ve bulut onayını beklemeyi denetler. Eski kaynakla iki hata senaryosu başarısız, düzeltilmiş kaynakla üçü başarılı. Bu test DOM, gerçek React eşzamanlı render veya telefon testi değildir. Günlük yayınlar, motor/klasik içerik, ilerleme/harita kuralları ve veritabanı/göçler başlangıçla aynı. Son bağımsız diff incelemesi ve kısa ortak sonuç ajan günlüğünde tutulur. GitHub CI/kaynak eşleşmesi ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Gerçek telefon, ekran okuyucu, tarayıcı çevrimdışı geçişi veya FPS bu tur ölçülmedi. Önceki destekli önizleme engelinde toparlanma kanıtı yok; başka tarayıcı/server yolu denenmedi. Oyuncu tutma veya performans artışı iddiası yoktur. Son üretim hata örneğindeki istemci iptalleri ve varsayılan simge 404'leri takip listesinde; uygulama istisnası görülmemesi tüm oturumlar için başarı garantisi sayılmaz.

## 24 Ekim 2026 · 0.8.2

Güncel Sites kaynağı `acaa1fc2de1fc64bbec85d3fa08cd400b69f9122`, kayıtlı 12. sürüm, herkese açık sahip erişimi ve GitHub `main` başlangıcı `33d9d6f3034e7cec4f190fc0eb68678a589187b3` doğrulandı. 24 Ekim kaynak çifti henüz yok. Önceki sürümün kişisel başlangıç kartı korunuyor.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kartta doğrulanmış çevrimdışı hazırlık | Bağlantı kesildiğinde hangi tarihli/ek bölümün bu cihazda açılacağını önceden bilir. | Seçildi. Yalnız kimliği, hash'i, içeriği ve kelime yolları doğrulanan yerel tahta hazır sayılır; bulut tamamlaması indirme kanıtı değildir. |
| Kelime listesinde yalnız kalanları gösterme | Kalabalık tahtada aramayı kolaylaştırabilir. | Sonraki aday. Temel çevrimdışı erişim belirsizliği daha doğrudan bir sorun; gerçek cihaz gözlemi önce gelir. |
| Yeni keşif odası / iOS prototipi | Kalıcı koleksiyon veya kurulabilir uygulama deneyimini genişletir. | Ayrı aşama. Destekli etkileşim/cihaz doğrulaması olmadan geniş yeni akış eklenmedi. |

### Uygulama öncesi kabul ölçütleri

- **Parkede küçük mola:** Basketbol, Rahat, 6 × 6; POTA, PAS, ŞUT, FİLE. **Yörüngede bir gün:** Uzay, Dengeli, 8 × 8; UYDU, ROKET, KAPSÜL, YÖRÜNGE, MODÜL, İSTASYON, ANTEN. Her ikisinde iki çapraz eğim, geçerli Türkçe yazım ve alternatif yerleşim kontrolü.
- Sabit UTC tarih/sıra kimlikleri ve yeni snapshot: `content/releases/2026-10-24.json`. Dosya yeniden çalışmada yeniden üretilmez; önceki yayınlar, tahta motoru ve beşli harita kümeleri aynı kalır.
- Ana sayfa, arşiv ve Albüm içindeki bölüm kartlarında gerçekten indirilmiş tahta için **Çevrimdışı hazır**. Çevrimdışıyken eksik/bozuk/uyuşmayan tahta için **İnternet gerekli**, açıklama ve devre dışı açma eylemi. Bağlantı gelince mevcut yenileme yolu eylemi yeniden açar.
- Yerel kontrol tamamlanmadan hazır/eksik iddiası yok. Bulut ilerlemesi ve cihaz hazırlığı ayrı tutulur; başka hesaba ait kayıt veya sahte tamamlanma üretilmez. Puan, yıldız, damga ve kayıt birleştirme kuralları değişmez.
- Kartı hazır gösteren doğrulama ile çevrimdışı bölüm açılışı aynı kimlik/hash/içerik kuralını kullanır. Bozuk önbellek veya kapalı depolama hazır sayılmaz. Eski bölüm bir kez çevrimiçi açılarak mevcut indirme yoluyla hazırlanır; yeni indirme/abonelik servisi yok.
- Mevcut testler, güncel içerik denetimi, TypeScript, üretim derlemesi ve iki oyunculu Worker HTTP kontrolleri geçmeden yayın yapılmaz. GitHub ve Sites tam kaynak eşleşmesi korunur.

### Doğrulama ve sıradaki iş

İki bölümün değişmez dosyası oluşturuldu; kimlikleri `20261024-0001-4000-8000-000000000001` ve `20261024-0002-4000-8000-000000000001`, tohumları `2026102401` ve `2026102402`. Katalog, ana sayfa ve arşiv kaydı eklendi. Aynı tarihte yeniden çalışılırsa bu çift korunur ve varsa yarım kalan yayın bu kaynak durumundan sürdürülür.

Kartlara cihaz hazırlığı ve çevrimdışı eksik tahta açıklaması uygulandı. Aynı doğrulama bölüm açılışında da kullanılır; farklı kimlikteki ağ yanıtı kabul edilmez. Hesap veya katalog değiştiğinde eski kart durumu gösterilmez. Bağlantı kesildikten sonra gelen geç bir ağ yanıtı çevrimdışı durumunu yanlışlıkla hata/hazır durumuna çeviremez. Başka sekmedeki önbellek değişikliği/silinmesi ve bağlantı dönüşü mevcut olay dinleyicilerinden güncellenir. Yeni sunucu isteği, göç, ödül, bağımlılık veya ücretli servis yoktur. Metin ve ikon birlikte kullanılır; eksik kart soluklaştırılıp okunmaz hale getirilmez. Bulut ilerlemesi için belirsiz indirme metni kaldırılarak cihaz hazırlığı ayrı gösterilir.

Beş yeni regresyon testi: tamamlanmış kayıt tek başına indirme sayılmaz; yanlış kimlikteki tahta reddedilir; hash/içerik/yol uyuşmazlığı reddedilir; kapalı depolama veya yazma hatası hazır sayılmaz; yeni içerik eklenirken eski arşiv tahtası, hesap ayrımı ve iyi sonuç korunur. Önceki bütün regresyonlar geçerli.

Yerel sonuç: **118/118 test**, **32 tahta + 640 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. Son metin düzenlemesinden sonra etkilenen 15 kart/çevrimdışı testi yeniden geçti ve son üretim paketiyle iki bağımsız oyunculu **175 Worker HTTP kontrolü** başarılı oldu. Önceki üç yayın dosyası, tahta motoru, klasik oyun, standart katalog, ilerleme/harita kuralları ve veritabanı/göçler başlangıç kaynağıyla aynı. GitHub CI, tam kaynak eşleşmesi ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üç saatlik üretim hata günlüğü boş; bu tüm oturumların hatasız olduğuna kanıt değildir. Mevcut Sites yayın görüntüsü ilk öğrenme turunun masaüstü görünümünü gösteriyor; yeni değişikliğin mobil/etkileşim testi sayılmaz. Destekli önizleme durumu kapalı ve önceki kilit sorununda toparlanma kanıtı yok; tekrar tekrar başlatılmadı. Gerçek telefon, ekran okuyucu, FPS ve tarayıcı çevrimdışı geçişi doğrulanmış sayılmaz. Tahta önbelleği testleri, PWA kabuğunun fiziksel cihazda ilk indirme testinin yerine geçmez. Öncelik destekli gerçek iPhone/Android üzerinde ilk karttan oyuna, çevrimdışı bölüm açılışına ve arşive dönüşe kadar doğrulama; ardından izinli oyuncu gözlemi ve iOS dikey prototipi.

## 24 Ekim 2026 · 0.8.1

Başlangıç: en güncel Sites kaynağı `99630ee37b9fdac40922725787e3d155fef7ae6d`, kayıtlı 11. sürüm ve herkese açık sahip erişimi doğrulandı. GitHub `main` başlangıcı `f24d2b7d9d0cf14eb3efd3e9f6a05a9d339ed7f6`; kaynak ağaçları aynı. UTC 23 Ekim'in iki bölümü zaten yayında olduğundan yeni çift üretilmedi. İstanbul'da 24 Ekim'e geçilmiş olması UTC içerik kaydını değiştirmez.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Kişisel keşfi ana sayfanın başına alma | Oyuna dönmek için günlük kartları, damgayı ve büyük tanıtım alanını kaydırma ihtiyacını azaltır. | Seçildi. Doğru başla/devam/tekrar hedefi günlük katalogdan önce görünür; mevcut öneri ve kayıt kuralları kullanılır. |
| Arşivde küçük metin ve çizim ölçülerini düzeltme | Tarih, zorluk ve oynama eylemi telefonda daha rahat okunur. | Aynı gezinme işinin parçası olarak seçildi. Sayfa/pencerede en az 11 px tarih, 12 px metaveri, 13 px eylem ve dar ekranda tek sütun. |
| Kişisel keşif odası / yeni gizem mekaniği | Kalıcı ilerlemeyi daha zengin bir deneyime dönüştürür. | Sonraki aşama. Önce mevcut keşfe ulaşma ve gerçek cihaz doğrulaması; yüzeysel yeni ödül veya kalabalık eklenmedi. |
| iOS uygulama prototipi | Kurulum, dokunma ve çevrimdışı akışın mağaza yolunda sınanmasını sağlar. | Xcode/iPhone ve giriş akışı doğrulaması gereken ayrı iş. Native sürüm hazır veya App Store'a uygun iddiası yok. |

### Yapılanlar ve kabul ölçütleri

- **Keşfet → ilk kart:** kişisel sonraki/yarım kalan keşif, gerçek bölüm başlığı, tema ve varsa bulunan kelime sayısı. Tek bir ana eylem mevcut `nextDiscovery` sonucunu açar. Tamamlanmış kayıt yanlışlıkla yarım gösterilmez; tekrar en iyi sonucu korur.
- **Harita / Dünyalar / Arkadaşla oyna:** ilk iki bağlantı sayfadaki gerçek bölümlere, üçüncü düğme mevcut Arena'ya gider. İlk öğrenme turu, Günlük sekmesi, sosyal akışlar ve arşiv korunur.
- Krem/orman yeşili tasarım, önerilen temanın mevcut özgün SVG çizimi, 48 px ana eylemler, dar ekranda tek sütun, görünür klavye odağı ve azaltılmış hareket desteği. Büyük tekrarlı tanıtım ve hızlı seçim alanları tek başlangıç alanında birleştirildi.
- Arşiv kartlarının çizimine doğru `theme-art` sınıfı bağlandı; sınırlı çizim alanı gerçekten uygulanır. Tarih/metaveri/oynama yazıları sayfa ve pencerede aynı okunabilir ölçeği kullanır. Küçük ekranda kartlar bir sütun olur.
- Kartların gerçek yükleniyor/boş/çevrimdışı/hata/yeniden dene durumları, hesap ayrımı ve bölümden dönüş korunur. Yeni ağ isteği, bağımlılık, ödeme, ölçüm, tablo veya göç eklenmedi.
- Eski bölüm kimlikleri, kelimeler, deterministik tahtalar, beşli harita kümeleri ve ödül kuralları değişmedi. Kaynak yayın dosyaları yeniden üretilmedi.
- Bağlı bakım görevinin yönergesine somut etki/kanıt/maliyet/risk önceliklendirmesi, tutarlı tasarım ve tamamlanmış küçük aşamalarla ilerleyen proaktif stüdyo çalışma biçimi eklendi. Zamanlama, mevcut kalite kapıları ve kayıt koruma şartları aynı kaldı. Kesintisiz çalışma garantisi verilmez.

### Doğrulama ve sınırlar

Üretim Worker akışına kişisel başlangıcın günlük katalogdan önce geldiğini ve iki sayfa bağlantısının gerçek hedefleri olduğunu denetleyen iki kabul kontrolü eklendi. Mevcut öneri/başla/devam/tekrar, hesap, misafir, bulut birleştirme, arkadaş, Arena, içerik ve çevrimdışı solo regresyonları korunur.

Yerel sonuç: **113/113 test**, **30 tahta + 600 alternatif yerleşim**, TypeScript ve son üretim derlemesi başarılı. Son paket üzerinde iki bağımsız oyuncuyla **171 üretim Worker HTTP kontrolü** geçti. Kaynak fark kontrolünde eski yayın dosyaları, motor, klasik içerik, katalog, ilerleme ve veritabanı/göçler başlangıçla aynı. Son üç saat için erişilebilir üretim hata günlüğü boş döndü; bu tüm oyuncu oturumlarının hatasız olduğuna kanıt değildir. Özel oyuncu verisi veya izinsiz ölçüm okunmadı. Kaynak ağacı/GitHub CI ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Destekli önizleme bu tur yeniden denendi ancak mevcut Vinext sunucu kilidi (`PID 14`, `/site`, `4173`) nedeniyle başlatılamadı. Önizleme yardımcısı başlatılmış bir önizleme göstermedi. Kilit silinmedi, bilinmeyen süreç durdurulmadı ve başka tarayıcı yolu denenmedi. Gerçek tarayıcı düzeni, telefon dokunması, ekran okuyucu ve FPS doğrulanmış değildir; kaynak/HTTP incelemesi bunların yerine geçmez.

### Sıradaki öncelikler

1. Destekli önizleme/gerçek iPhone ve Android doğrulaması: ilk karttan başlama, yarım oyuna dönüş, çapraz seçim, arşiv, büyük yazı ve çevrimdışı yeniden açılış. Kabul: taşma veya erişilemeyen kontrol yok; bölüm/kayıt/dönüş aynı kalıyor.
2. İzinli ilk oyuncu gözlemlerinden en büyük sürtünmeyi seçme. Kabul: gerçek örnek ve ölçülebilir hedef; uydurma kullanım veya başarı oranı yok.
3. iOS için tek oynanabilir dikey akış: ilk açılış, solo bölüm, kayıt ve geri dönüş. Kabul: gerçek derleme/cihaz doğrulaması; giriş sağlayıcısı veya satın alma bağlanmadan çalışıyor sayılmaz.

## 23 Ekim 2026 · 0.8.0

En güncel Sites kaynağı `f8c047a097196d0262502b2c1f111a5591ad2477`, herkese açık sahip erişimi ve 10. sürüm kontrol edildi. Önceki başarılı yayın `appgdep_6ada6e8c26508191865368588bcdbf2b`; GitHub başlangıcı `e5a8ea97f4583b87216cdeb2b30565021047e8d7`. 23 Ekim dosyası yoktu; iki yeni, değişmez bölüm `content/releases/2026-10-23.json` içine eklendi. Önceki yayın dosyaları korunur.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Albümde kalıcı damga rafı | Oyuncu eski hatıralarını bir yerde görür, kalan keşfi bulur ve bölümden aynı rafa döner. | Seçildi. Önceki sonuç ekranı aşamasını tamamlar. Yalnız gerçek iki tamamlamadan türetilir, yeni kayıt veya ödül talebi yoktur. |
| iOS prototipi ve App Store hazırlığı | Kurulabilir uygulamada dokunma, çevrimdışı kayıt ve giriş sınanabilir. | Bu tur uygulanmadı. Gerçek Xcode/iPhone doğrulaması ve yayın hesabı kurulumu ayrı aşama; çalışan web sürümü korunur. |
| Varsayılan iOS simge adreslerini tamamlama | Ana ekrana ekleme uyumluluğuna yardımcı olabilir. | Küçük 404'ler kaydedildi; temel oynanış arızası kanıtı yok. Cihaz/PWA doğrulamasıyla ele alınacak. |

### Yeni içerik

- **Fırında bir sabah:** Lezzetler, Rahat, 6 × 6, EKMEK, SİMİT, MAYA, PİDE. Tohum `2026102301`, kimlik `20261023-0001-4000-8000-000000000001`.
- **Eski kentin izleri:** Dünya Turu, Dengeli, 8 × 8, MOZAİK, SÜTUN, KEMER, HEYKEL, KİTABE, HARABE, KAZI. Tohum `2026102302`, kimlik `20261023-0002-4000-8000-000000000001`.
- Her tahtada iki çapraz eğim; istenen boyut ve bölüm başına 20 alternatif yerleşim kontrolü. Yeni kelime/tema çifti, ana sayfa kartları ve kalıcı arşivde bulunur.
- Aynı UTC tarihinin yeniden çalışmasında bu dosya yeniden üretilmez. Eksik yayın aynı kimlikler ve snapshotlarla sürdürülür; önceki tarihler değişmez.

### Yapılanlar ve kabul ölçütleri

- **Albüm → Keşif damgaların:** tarihe göre raf; kazanılmış damganın gerçek hatıra penceresi, iki bölümün adları, tamamlanma koşulu ve **Keşifleri aç** eylemi.
- Kalan veya eski bölümler raftaki tarihin penceresinden açılır. Tamamlanan bölüm doğrudan tekrar oyununa, yarım bölüm kendi kaydına gider. Aynı sabit çift bağlamı sonuç ekranına taşınır.
- Raftan açılan bölümden geri dönünce Albüm ve damga alanı korunur. Sonuçtaki geri dönüş yazısı her iki giriş noktası için **Keşiflerine dön** olarak genelleştirildi.
- Tamamlanmış damgalar eski kayıtlardan otomatik görünür; tekrar, yeni tarih veya ek içerik damgayı çoğaltmaz ya da kilitlemez. Beşli dünya kümeleri ve mevcut bonuslar değiştirilmez.
- Yükleniyor, boş, çevrimdışı ve hata durumları mevcut ortak katalog/özel ilerleme okumasını kullanır. Bilinmeyen kayıtta uydurma sayı veya ödül yoktur. Yeniden deneme ve eski tarihler için sayfalama korunur. Yalnız yüklenen tarihler gösterilir; bütün koleksiyon için doğrulanmamış toplam iddiası yoktur.
- Özgün damga SVG'si ve krem/orman yeşili/altın dili; dar ekranda tek sütun, 44 px eylemler, okunur metinli durumlar ve mevcut azaltılmış hareket tercihi. Yeni animasyon, görsel üretimi, bağımlılık veya ücretli hizmet eklenmedi.
- Raf aynı hesaba özel doğrulanmış bölüm kayıtlarını okur. Yeni tablo/göç, ödül bakiyesi, sunucu yazması veya Arena puanı yoktur. Hesap değişiminde önceki yanıtı göstermeme ve cihaz/bulut birleştirme yolu korunur.

### Kontroller ve sınırlar

Tarih büyümesini hesaba katmak için eski damga senaryoları sabit 22 Ekim örneğine bağlandı; bütün arşiv sayfaları testte okunur. Önceki kazanım, hesap ayrımı, çevrimdışı doğrulama, son kelime ve tekrar testleri korunur. Yeni regresyon, yalnız yalıtılmış test belleğindeki sentetik tarihlerle 24 bölüm sınırını aşar; eski damga çiftlerinin kaybolmadığını, sayfada bölünmediğini ve yinelenmediğini doğrular. Üretim içeriğine sahte bölüm eklenmez.

Yerel sonuç: **113/113 test**, **30 tahta + 600 alternatif yerleşim**, TypeScript ve son üretim derlemesi başarılı. İki bağımsız oyuncuyla **169 üretim Worker HTTP kontrolü** geçti. Küçük ekrandaki raf başlığı ve durum metinleri okunur boyuta getirildikten sonra üretim paketi yeniden derlendi ve HTTP akışı bu paketle çalıştırıldı. Önceki yayın JSON'ları, tahta motoru, klasik içerik ve veritabanı göçleri başlangıç kaynağıyla aynıdır. Tam kaynak ağacı/GitHub CI ve Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üretim günlüklerinde istemci iptalleri ve varsayılan simge/robots adreslerinde 404 vardı; uygulama istisnası kaydı görülmedi. Bu örnek tüm oturumların hatasız olduğu anlamına gelmez. Yetkili oyun oturumu olmadan özel kullanım ölçümleri veya oyuncu verisi okunmadı.

Önceki destekli önizleme erişim engelinin giderildiğine dair kanıt yok; başka tarayıcı veya güvenlik aşma yolu denenmedi. Bu tur gerçek telefon, tarayıcı etkileşimi, ekran okuyucu ve FPS doğrulanmış sayılmaz. Mobil düzen, metin, odak ve dokunma boyutları kaynakta incelenir; bu inceleme gerçek cihaz testinin yerine geçmez.

Sonraki öncelik gerçek iPhone/Android üzerinde albümden bölüme geçiş ve geri dönüş, çapraz seçim, büyük yazı ve çevrimdışı dönüş. Sonra iOS prototipinin giriş/kayıt/çevrimdışı davranışını küçük bir dikey akışta doğrulama. Native paket, Apple ile Giriş, reklam, ödeme veya abonelik henüz uygulanmadı.

## 22 Ekim 2026 · 0.7.1

Güncel Sites kaynağı `3201ab2a4addeb0a57f3eed3a915ee84f6c4bc66`, kayıtlı 9. sürüm ve `appgdep_6ada36fcbb448191b5e70f34f7dfb857` başarılı yayını esas alındı. GitHub başlangıcı `bba457490d84e81503610f411bdf7b36c9ef88c8`. Bugünün **Bir avuç melodi** ve **Robot atölyesi** bölümleri zaten yayında; ikinci çift eklenmedi. Kaynak yayın dosyaları, kimlikler, kelimeler ve sabit tahtalar korunur.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Damga durumunu gerçek bölüm sonucuna bağlama | Oyuncu tamamlamasının kalıcı hedefe nasıl katkı yaptığını hemen görür ve diğer keşfe kolay döner. | Seçildi. Geçerli son kelimeyle güncellenir; eksik/başka hesaptaki kayıt kazanım sayılmaz. |
| Albümde ayrı damga rafı | Hatıraları tek yerde toplar. | Sonraki aşama. Önce sonuçtan hedefe bağlantıyı tamamla; arşivdeki mevcut hatıralar korunur. |
| iOS varsayılan simge adreslerini düzenleme | Ana ekrana ekleme uyumluluğunu iyileştirebilir. | Günlüklerdeki küçük 404'ler kaydedildi; temel oyun hatası kanıtı yok. Gerçek cihaz/PWA kontrolünde ele alınacak. |

### Yapılanlar ve kabul ölçütleri

- Tarihli bir bölüm tamamlanınca sonuç penceresinde **Keşif damgan tamam** veya kalan keşif hedefi görünür. Tamamlanmış gerçek tahta kullanılır; kendi kaydının bulut yanıtını beklemeden son doğru kelime hesaba katılır.
- Diğer bölümün doğrulanmış kaydı eksikse başlığı ve **Diğer keşfi aç** eylemi gösterilir. Oyuncu kendi seçimiyle aynı tarihin diğer bölümüne geçer; sonuç ve geri dönüş eylemleri korunur, otomatik yeni oyun başlatılmaz.
- Sonuç kartında gerçek cihaz/bulut eşitleme durumu da görünür; cihaz kaydı hatası sonuç penceresinde uyarılır. Bulut onayı gelmeden hesabında kayıtlı denmez.
- Diğer kayıt yükleniyor/çevrimdışı/hata durumundaysa bilinmiyor olarak kalır. Eksik bulut bilgisi tamamlandı veya sıfır gibi sunulmaz. Hata/eksik kayıtta yeniden kontrol, bağlantı gelince mevcut otomatik okuma ve çevrimdışı doğrulanmış cihaz kaydı davranışı korunur.
- Ana sayfa, eski tarihli arşiv ve yeniden oyundan aynı sabit çift bağlamı taşınır. Bölüm kimliği, hash, tarih veya içerik eşleşmiyorsa bu sonuç kartı açılmaz. Yönetim panelindeki bağımsız bölümler bu hedefe dahil edilmez.
- Tekrarda aynı hatıra gösterilir; yeni damga veya bakiye kazanıldığı söylenmez. Hız, yıldız veya ipucu şartı yok. Koleksiyon/harita açılışları, bulut yazma ve en iyi kayıt birleştirme yolu değiştirilmedi; Arena derecesi verilmez.
- Aynı özgün SVG damgası, krem/orman yeşili/altın dili, metinli durum ve 44 px eylemler kullanılır. Sonuç penceresinin kaydırma, klavye odağı, geri dönüş ve azaltılmış hareket davranışı korunur.
- Yeni servis, bağımlılık, ücret, tablo veya göç yok. Salt okunan tek ek bölüm metaverisi mevcut hesaba özel toplu uçtan alınır. Hesap değişiminde önceki yanıtın gösterilmemesi önceki kancayla sürer.

### Doğrulama ve sınırlar

Yedi yeni test: doğru çift/hash/içerik sınırı; sahte tamamlama/yol reddi; son kelimeyi bulut onayından önce doğru sayma; iki sıra için doğru diğer hedef; bilinmeyen kayıt durumları; tekrar/ipuçlu oyunda aynı damga; eski arşiv ve gerçek sahip ayrımı. Üretim Worker akışına gerçek tamamlamadan diğer hedef, ardından gerçek ikinci kayıttan tek damga kontrolü eklendi. Önceki testler ve HTTP kontrolleri korunur.

Yerel sonuç: **112/112 test**, **28 tahta + 560 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı. İki bağımsız oyuncuyla **165 üretim Worker HTTP kontrolü** geçti. Önceki bütün kaynak bölüm dosyaları, tahta motoru, klasik oyun, içerik ve veritabanı göçleri başlangıç kaynağıyla aynıdır. GitHub ağacı/CI ve gerçek Sites yayın sonucu tamamlanmadan bu kayıt yayın kanıtı değildir.

Erişilebilir son üretim günlüklerinde iki istemci iptali ve varsayılan simge/robots adreslerinde 404 vardı; uygulama istisnası kaydı yoktu. Bu sınırlı günlük örneği tüm oyuncu oturumlarının hatasız olduğu anlamına gelmez. İzinli ürün ölçümlerine yetkili oyun oturumu olmadan erişilmedi.

Önceki destekli önizleme erişim engeli için onarım/toparlanma kanıtı yok; başka tarayıcı veya güvenlik aşma yolu denenmedi. Gerçek telefon, tarayıcı etkileşimi, ekran okuyucu ve FPS bu tur doğrulanmadı. Bu sınırla kaynak, servis ve üretim Worker doğrulaması sürdürülür.

Sonraki öncelik iPhone/Android üzerinde seçim, 200% metin, sonuçtan diğer keşfe geçiş ve geri dönüş; ardından Albümde kalıcı damga rafı. Kullanıcıyla iOS/App Store hazırlığı ve gelir modeli konuşuluyor; native paket, Apple hesabı, ödeme/reklam SDK'sı veya abonelik henüz uygulanmadı.

## 22 Ekim 2026 · 0.7.0

Güncel Sites kaynağı `edc2a77eb91fc9f1c08336399d14606be80072fe`, herkese açık sahip erişimi ve 8. sürüm kontrol edildi. GitHub `main` başlangıcı `480360f7bb92bee3a18becec0766e6d22345009a`. Önceki iki tarihli bölüm değişmeden korunur; 22 Ekim girdisi yoktu. Yeni, değişmez kayıt `content/releases/2026-10-22.json` olarak eklendi. Aynı tarihin yeniden çalışmasında bu dosya ve sabit kimlikler kullanılacak.

| Aday | Oyuncuya fayda | Karar / kabul ölçütü |
| --- | --- | --- |
| Tarihin iki keşfini bir kalıcı damgaya bağlama | Açık, ulaşılabilir küçük hedef ve eski keşiflere dönmek için anlamlı bir hatıra sağlar. | Seçildi. Yalnız o tarihin sabit iki kimliğinin gerçek tamamlanmasıyla açılır; tekrar veya yeni içerik çoğaltmaz ve kilitlemez. |
| Arşivde tema filtresi ve arama | Büyüyen içerikte istediği bölümü bulmayı kolaylaştırır. | Dört bölüm varken öncelik değil. Önce tarihe göre anlaşılır gruplama. |
| Dokunmatik toleransı değiştirme | Gerçek yanlış seçimleri azaltabilir. | Önce destekli iPhone/Android gözlemi gerekli. Kanıt olmadan çekirdek seçim davranışı değiştirilmedi. |

### İçerik ve kabul ölçütleri

- **Bir avuç melodi:** Müzik, Rahat, 6 × 6, NOTA, RİTİM, GİTAR, PLAK. Sabit tohum `2026102201`.
- **Robot atölyesi:** Teknoloji, Dengeli, 8 × 8, SENSÖR, YONGA, YAZILIM, BELLEK, ROBOT, İŞLEMCİ, KODLAMA. Sabit tohum `2026102202`.
- Tarih/sıra kimlikleri `20261022-0001-4000-8000-000000000001` ve `20261022-0002-4000-8000-000000000001`. Her iki çapraz eğim, istenen tahta boyutu ve bölüm başına 20 alternatif yerleşim doğrulaması.
- Önceki yayın JSON'u, klasik oyun, standart içerik ve beşli harita kümeleri değiştirilmedi.

### Uygulanan deneyim

- Ana sayfada **İki keşif, bir hatıra** alanı; iki bölümün adları ve gerçek tamamlanma işaretleri. İpucu, yıldız veya hız şartı yok. Tarih kaçırma, süre sonu, ceza veya seri zorunluluğu yok.
- İki tamamlama doğrulanınca **Damganı gör** gerçek kazanımı, tarihini ve iki başlığını gösteren özgün SVG hatıra ekranını açar. Eski tamamlamalar aynı kuralla otomatik tanınır; yeniden kazanıldı iddiası veya ek bakiye yok.
- Kalıcı arşiv tarihe göre gruplanır, her çiftin damgası yanında kalır. Yalnız sabit sıra 1 ve 2 kimlikleri hedefi belirler; sonradan eklenen içerik hedefi büyütemez.
- Yükleniyor, eksik kayıt, çevrimdışı ve hata durumlarında bilinmeyen kayıt sıfır veya kazanılmış ödül gibi sunulmaz. Eksik ilerleme önceki sürümün yeniden kontrol düğmesiyle okunabilir. Doğrulanmış iki cihaz kaydı çevrimdışıyken damgayı göstermeye yeterlidir. İndirilmemiş/önbellekten çıkmış tahtanın çevrimdışı kaydı bilinmiyor olarak kalır.
- Ayrı ödül talebi, yeni sunucu yazması, şema/göç, bağımlılık, ücretli hizmet veya analitik toplama eklenmedi. Damga mevcut hesaba özel, doğrulanmış bölüm kayıtlarından türetilir; Arena derecesi vermez. Hesaplar, arkadaşlar, puanlar ve kazanılmış dünyalar korunur.
- Krem, orman yeşili ve sıcak altın çizgisi; özgün yaprak damgası, metinli durumlar, 44 px eylemler, dar ekranda tek sütun, klavye odağı ve mevcut azaltılmış hareket desteği.
- Bu aşama ana sayfa ve arşivde kalıcı damga gösterimini kapsar. Oyun sonu penceresinde anlık damga bildirimi ve Albüm sekmesinde ayrı damga rafı henüz uygulanmadı; tamamlanmış sayılmaz.

### Kontroller ve sınırlar

Yedi yeni senaryo sabit çift/gruplama, sahte kimlik, eksik kayıt durumları, sahte tamamlama, ipuçlu/yavaş oyun, eski kazanımın korunması, gerçek hesaba özel bulut ve çevrimdışı kayıtları kapsar. Üretim Worker kontrolü ana sayfadaki koşulun ödül vermeden gösterildiğini ve arşivde tarih/sıra bilgisinin korunduğunu denetler. Önceki kayıt birleştirme, hesap/misafir, arkadaş, Arena, arşiv, güvenlik ve PWA regresyonları korunur.

Erişilebilir üretim günlüklerinde uygulama istisnası görülmedi; üç iptal edilmiş istemci isteği ve iki iOS simge araması için 404 vardı. İptaller tek başına veri kaybı veya sunucu hatası kanıtı değildir. Belirli Apple simge boyutunun keşfi sonraki PWA cihaz kontrolünde incelenecek. Gerçek kullanım ölçümlerine yetkili uygulama oturumu olmadan erişilmedi; kullanıcı kimliği taklit edilmedi.

Önceki destekli önizleme bağlantısı/güvenlik engeli için altyapı onarımı veya toparlanma kanıtı yok. Başka tarayıcı yolu denenmedi. Gerçek mobil düzen, fiziksel dokunma, ekran okuyucu ve FPS bu tur doğrulanmış sayılmaz. Kaynak, içerik, servis ve üretim Worker kontrolleri bu sınırla sürdürülür.

Yerel sonuç: **105/105 test**, **28 tahta + 560 alternatif yerleşim**, TypeScript ve üretim derlemesi başarılı; iki bağımsız oyuncuyla **160 üretim Worker HTTP kontrolü** geçti. 21 Ekim yayın JSON’u başlangıç kaynağıyla byte düzeyinde aynıdır. Test veritabanı üretimden ayrıdır.

Çıkış kapıları: tam kaynak ağacının GitHub eşleşmesi ve CI; ardından aynı Sites adresine başarılı yayın sonucu. Bu kayıt tek başına yayın kanıtı değildir.

Sonraki öncelik destekli iPhone/Android kontrolünde seçim, 200% metin, arşiv ve damga ekranından dönüş, ana ekrana ekleme. Ardından bir sonraki faydalı adım, gerçek tamamlanma anında damga bilgisini oyun sonucuna bağlamak; yeni içerik mevcut kazanımları genişletmeyecek.

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
