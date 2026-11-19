# 0.58.0-pilot.1 · İlk 18 bölüm

19 Kasım 2026. Bu sürüm 0.57.5 arayüzünü kullanır. İçerik, ZIP parmak izi `2c83efee4704ce6a57e5e2c551fdd559f48203a3894bb9e872a3d42dec6af52b` olan paketteki onaylı yerleşim tablosundan üretilir.

## Deneme

Mac’te `http://127.0.0.1:5175/` adresini aç. İlk bölümün konu bandında **Gökyüzüne bak** görünür. Tek tarayıcı profili ve aynı adres yarım oyunun devam etmesini sağlar. Önizleme durursa depo kökünde `pnpm journey:local` ile açılabilir. Derlenmiş önizleme için `pnpm journey:pilot:build` ardından `pnpm exec vite preview --config mobile/vite.config.ts --mode journey-pilot --host 127.0.0.1 --port 5175 --strictPort` kullanılabilir.

Yalnız yeni ve daha önce açılmamış ilk 18 bölüm pilot tahtayı seçer. Başlanmış veya bitmiş bir bölüm kayıtlı sürümünü kullanır. 19. bölümden itibaren yayımlanmış içerik geçerlidir. Standart web ve iOS derlemeleri varsayılan olarak yayımlanmış bölümleri açar. Pilot seçimi hem derleme modu hem yerel bilgisayar adresi gerektirir.

## İçerik ve kayıt

Oyuna yalnız başlıklar, harfler, yerleşimler ve gizli hedef kimlikleri girer. Yayınlanan 312 bölümün kimlikleri ile eski tahta koordinatları korunur. Arena, günlük bulmaca ve bonus turlarının içerik seçimi kendi mevcut yolunu kullanır. Pilot tahtaları yeniden üretilmez ve sıkıştırılmaz. Kelime bulununca saklı harfler açılır, ipucu seçimi aynı grubu izler.

Kelime bankasının 221 adayında 40 editör uyarısı ve sıfır hata var. Uyarılar sözlükteki özel ad ve sıklık işaretlerini içerir. 18 tahtanın 153 hedefinin her biri sekiz yönlü aramada bir kez bulunur. Bozuk girdilerle yapılan denemelerde sahte ve yinelenen saklı kimlikler, geçersiz yön dağılımı ve sekiz yönde yerleştirilen engelli diziler reddedildi. Paketin ham sözlük aracı ÜLKER'i Takımyıldızlar kategorisine geri ekleyen değişikliği kabul ediyordu. Projedeki kapı, bu editör kararını ve her hedefin doğru başlığın bankasında bulunmasını ayrıca denetler.

`pnpm journey:check` bankayı, tahta kurallarını ve tablodan üretilen modülün eşliğini doğrular. `tests/authored-journey.test.ts` bölüm sırası, her hedefin iki yönde çözümü, saklı kimlikler, eski/yeni yarım ve tamamlanmış kayıtlar, kayıt birleştirme ve sınır dışı koordinatları kontrol eder. PR yerleşim iş akışı, yayımlanmış 312 bölüm ile 18 pilot bölümü dört ekran boyunda ölçer.

## Görsel kabul ve kalan karar

Dört ekran boyunda 72 yerleşim ölçüldü. Liste en çok üç satır ve satır başına dört kelime kullanır. Başlık ile liste ve liste ile tahta arasında 4 piksel, komşu kelimeler arasında en az 14 piksel bulunur. 320 ve 393 pikselde her bölüm parmak hareketini temsil eden gerçek tarayıcı girişleriyle çözüldü. Başlangıç ve tek hedef kaldığı an için alınan 72 görüntü, altı dünya çizelgesinde toplandı. Kanıt başlangıcı `../world-review.nosync/release-0575/pilot-final/cizelgeler/index.html`.

Oyuncu kullanım ölçümünü açarsa yerel pilot süre, başlangıç, bitiş, yanlış seçim ve ipucu özetlerini yalnız kendi tarayıcısında saklar. Başlanan ve tamamlanan oturumların farkı yarım turları da içerir. Şu anda gerçek oyuncu zorluk verisi yok. Üç dünyayı ürün sahibinin baştan sona oynaması ve gerçek iPhone kontrolü sonraki içerik dilimi için bekleyen adımlardır.

## Geri dönüş

Standart derlemeyi açmak pilot seçimini kapatır. Pilotun kendi tarayıcı kaydını korumak için önizleme adresindeki site verilerini sakla. Canlı oyuna veri aktarılmadı.
