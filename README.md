# Kelime Teneffüsü

Türkçe, telefon öncelikli kelime bulma oyunu. Lovable kredisi veya Lovable çalışma zamanı gerektirmez. React arayüzü, Vinext/Vite, Cloudflare Workers ve D1 üzerinde çalışır.

## Oyunda

- 16 tema, her temada 6 bölüm: 96 farklı kelime listesi.
- Sekiz yönde seçim, her yeni tahtada her iki eğimde en az bir çapraz kelime.
- Kaydırma, iki uca dokunma ve klavye seçimi; büyük harf modu; isteğe bağlı ses; azaltılmış hareket desteği.
- Günlük ortak tahta, İstanbul saatine göre gün değişimi, sunucuda tutulan süre, ipucu başına 15 saniye ve gerçek günlük sıralama.
- İki gerçek oyunculu Arena: hızlı eşleşme, özel oda, ortak geri sayım, 120 saniye, Altın Kelime, bağlantı sonrası dönüş ve karşılıklı rövanş.
- Sahte rakip, sahte çevrimiçi oyuncu sayısı veya hazırlanmış sıralama bulunmaz.

## Geliştirme

Node 24 ve pnpm 10 kullanın:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

`npm run` komutları da kullanılabilir. Bağımlılıklar `pnpm-lock.yaml` ile sabitlenmiştir. Geliştirme sunucusu 5173 portundan açılır. Sites ortamındaki geliştirme/yayınlama için Sites yardımcılarını kullanın. Normal taşınabilir geliştirme ortamında yerel deneme kimliği starter tarafından sağlanır; üretim kimliğini Sites doğrular.

## Sunucu ve veri

`.openai/hosting.json` içinde D1 bağlaması `DB` olarak tanımlıdır. Şema `db/schema.ts`, sürümlenen SQL geçişi `drizzle/` içindedir. Yeni şemalarda `pnpm db:generate` çalıştırın. Veritabanı tabloları istek sırasında oluşturulmaz. Sites, yayımlarken geçişleri uygular. Başka bir Cloudflare hesabına taşımak için D1 veritabanını ve kimlik doğrulamasını ayrıca yapılandırın.

Arena ve günlük sıralama, Sites tarafından doğrulanmış kullanıcı kimliğini kullanır. Oyuncu kimliği, bitiş süresi veya puan tarayıcıdan kabul edilmez. Sunucu düz çizgiyi, sınırları, kelimeyi, oda üyeliğini, tekrarları ve son tarihi denetler. SQLite işlemleri ve sürüm karşılaştırmaları aynı anda gelen hamlelerde puan kaybını ve çift kayıtları önler. Rakibin çözüm yolları maç sırasında gönderilmez.

Keşif ilerlemesi ve tercihler bu tarayıcıda, Arena ve günlük yarışma sonuçları D1 içinde tutulur. Kaynak kodunda servis anahtarı veya hesap belirteci bulunmaz. Üretim verilerini, `.env` dosyalarını ve yerel çalışma dizinlerini depoya eklemeyin.

## Klasik oyunun korunması

Başlangıç kaynak sürümü: `f1405b3be941f075039e1348510c5b08c0b0903e`.

`lib/game/legacy.ts`, fotoğraftaki 20 özgün Hababam ismini, dört turu, eski deterministik yerleşimi ve `hababam-kelime-v1` kayıt biçimini korur. Eski sürümle aynı başlangıç değerleri, aynı tahtaları üretir. Klasik oyun ana sayfadan açılır. Tarayıcı güvenliği nedeniyle başka bir alan adındaki eski kayıtlar yeni alan adına otomatik taşınamaz; eski oyun kendi adresinde kalır.

## Doğrulama

`tests/engine.test.ts` ve `tests/server.test.ts` içerik bütünlüğünü, 4.800 yeni tahtayı, 1.200 klasik tahtayı, İstanbul gün sınırını, kayıtları ve gerçek SQLite üzerinde iki bağımsız oyuncunun düello akışını sınar. Eşzamanlı eşleşme, tekrar edilen hamle, süre sonu, ayrılma, rövanş ve günlük yarışma da kapsanır.

Bu geliştirme ortamında tarayıcı otomasyonu bulunmadığı için fiziksel telefonda dokunma, Safari ses davranışı ve yayımlanmış sitede iki gerçek hesapla uçtan uca test henüz yapılmadı. Bu kontroller, motor ve sunucu testlerinden ayrıdır.
