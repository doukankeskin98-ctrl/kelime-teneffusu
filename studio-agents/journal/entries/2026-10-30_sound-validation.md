# 30 Ekim · 0.14.0 ses doğrulaması

## Gerçek değişiklik

Sekiz özgün kısa motif (select/word/hint/reveal/start/pause/complete/finish), yumuşak envelope ve düşük geçiren filtre. Board'da seçim başına bir ses; Solo/klasik/tutorial/tarihli/günlük/Gizli Tema/Hızlı Tur/Arena/kayıtlı meydan okuma mevcut olayları ortak ses ailesini kullanır. Son saniye alarmı, yanlış seçim azarı, sürekli müzik ve her harfte ses yok.

Albüm → Oyun hissi: mevcut aç/kapa ve ayrı titreşim, Hafif/Dengeli/Belirgin düzeyi ve Sesi dene. Düzey `kt-sound-level-v1` cihaz anahtarında; yazma hatasında önceki değer ve yeniden deneme korunur. Eski sound/haptics tercihi ve varsayılan kapalı kalır. Sesi kapatma mevcut motifleri 25ms kısa sönüşle keser; hidden/unmount ve geç callback aynı sınıra uyar. Jest dışı context oluşturulmaz; askıda/reddedilen audio olayı kuyruğa alınmaz. Özgün sentez kodu çevrimdışı istemci paketiyle gelir; ek runtime bağımlılığı/servis/sample indirmesi yok.

Arena/Meydan başarısı yerel tahmin yerine kabul edilmiş claim'e bağlandı. Arena güncel phase/revision/player/round guard'ı eski ACK'in terminal kutlamadan sonra ses vermesini engeller. İlk eski sonuç, yeniden açılan sonuç ve aynı terminal fazı yeniden kutlamaz; kayıp/beraberlik ve süre bitişi nötr motiftir. Sunucu kuralları değiştirilmedi.

## Geçen kapılar

- Tam paket: **331/331 test, 70 grup**, sıfır fail/skip. Önceki 312 korunur; 19 yeni ses motoru/hook/caller/Board kabulleri.
- Kontrollü gerçek motor: sessiz/lazy başlangıç, eksik API, suspended olayların düşürülmesi, resume reddi, cooldown/öncelik, mute/hidden/dispose, oscillator/gain temizliği, sonlu ve sınırlı score.
- Kontrollü gerçek hook: trusted pointer/keyboard/assistive click, güncel tercih/eski callback, ayrı haptics ve Strict Effect cleanup/yeniden kurulum.
- Kontrollü gerçek caller: Arena pending/ret/kabul/eski ACK/SSE finish/restore/sonuç reopen/start; Challenge pending/ret/confirmed/geç terminal/unmount; Sprint başlangıç/süre sonu tek olay. Board drag/tap/keyboard seçimi tek ses, pan/blocked/readonly sessiz.
- TypeScript **geçti**.
- İçerik: **120 yazarlı tahta, 2.400 alternatif** geçti.
- Sites üretim derlemesi **geçti**, **22 sürümlü offline istemci varlığı** hazırlandı.
- Üretim Worker HTTP: **258 kontrol, iki bağımsız oyuncu** geçti. Bu yerel üretim Worker harness'ıdır; canlı oyuncu veya cihaz testi değildir. Script değiştirilmedi; kontrol sayısı çalışma içi polling dallarına göre değişebilir.
- `git diff --check` **geçti**. Mevcut içerik/tarihli yayınlar, motor/katalog/harita/ilerleme/legacy, DB/uygulanmış göçler ve hosting manifesti başlangıçla aynı. Package sürümü dışında bağımlılık yok.
- İki gerçek sınırlı uzman kendi günlüklerine yazdı. Güvenilirlik uzmanı iki somut aday buldu; koordinatör düzeltti ve kalıcı regresyon ekledi. Son incelemede açık engel yok; uzmanın ayrıca çalıştırdığı dar paket **55/55**.

## Açık doğrulama

Destekli preview'daki 21 Ekim tarihli `/site` lock kaydı yalnız generated yerel dosya olarak yedeklendi. CLI sonrasında healthy ve `http://terminal.local:4173/` verdi; destekli CUA bu tam adreste **ERR_CONNECTION_REFUSED** bildirdi. Alternatif host/port, tarayıcı sürücüsü veya ağ yolu kullanılmadı. Gerçek browser DOM/native odak/duyulabilirlik, iPhone/Safari sessiz anahtar/arama kesintisi, hoparlör/kulaklık, uzun dinleme ve oyuncu konforu ölçülmedi. İşitsel kalite veya “rahatsız etmez” garantisi yok.

Öncelik: gerçek cihaz dinleme ve mevcut hedef→oyun→sonuç/PWA/iki hesap sağlayıcısı kuyruğu. Kaynak/test başarıları App Store hazırlığı veya ölçülmüş eğlence/tutma sonucu sayılmaz.

GitHub CI/tam ağaç ve Sites saved version/deployment sonucu kendi kaynak commit'ine gömülmez; son dış sistem makbuzlarıyla ayrıca doğrulanır. Bu doğrudan ses isteğinde yeni günlük bölüm eklenmedi; mevcut tüm içerik korunur.
