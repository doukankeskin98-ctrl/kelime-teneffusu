# E-posta üyeliği

Durum: kod Studio sürümüne dahil edildi. Firebase projesi ve ortam yapılandırması henüz bağlı değil; e-posta yöntemi yapılandırma tamamlanıncaya kadar sunulmaz. Bu sırada misafir profili ve mevcut Sites ChatGPT girişi çalışır. E-posta gelen kutusu ve Emulator doğrulaması ayrıca tamamlanmalıdır.

## Hazırlanan akış

- Oyunun içinde Giriş yap / Kayıt ol ekranları.
- Kayıtta kullanıcı adı, e-posta, şifre ve şifre tekrarı.
- Firebase SDK ile e-posta ve şifre girişi; isteğe bağlı kalıcı oturum.
- Türkçe doğrulama ve şifre yenileme e-postaları.
- /uye adresinde doğrulama ve şifre yenileme sayfası.
- Kullanıcı adının D1 üzerinde benzersiz ve sunucu tarafından sahiplenilmesi.
- Üyelik tamamlanınca davet edilen odaya geri dönüş ve otomatik odaya katılma.
- Mevcut Sites kimliğiyle aynı doğrulanmış e-postaya sahip hesapların eski oyun kimliğine bağlanması.
- Çıkış yapma ve diğer oyunculardan gizli e-posta bilgisi.

Şifreler uygulama veritabanına yazılmaz. Firebase SDK oturumu yönetir. Sunucu Google imza anahtarlarını kullanarak RS256 imzasını, hedef projeyi, veren servisi ve zaman alanlarını doğrular; ayrıca devre dışı veya iptal edilmiş hesapları Firebase hesabından denetler. Olumlu hesap kontrolü en fazla 30 saniye önbelleklenir.

## Yayına alma sırası

1. Firebase bağlantısından bu oyun için uygun mevcut proje seçilir veya Spark planında yeni proje oluşturulur. Faturalandırma açılmaz.
2. Email/Password etkinleştirilir. Minimum şifre uzunluğu 10 karakter ve email enumeration protection ayarlanır. SMS ve zorunlu harici sosyal giriş eklenmez.
3. Oyun alan adı authorized domains listesine eklenir. E-posta gönderen görünen adı Kelime Teneffüsü, dil Türkçe, action URL /uye olarak ayarlanır.
4. Web app oluşturulur. FIREBASE_PROJECT_ID, FIREBASE_WEB_API_KEY, FIREBASE_AUTH_DOMAIN ve FIREBASE_APP_ID çalışma zamanı değişkenleri olarak Sites üzerinden kaydedilir. Bunlar web istemcisinin yayımlanabilir yapılandırmasıdır; servis hesabı veya özel anahtar değildir.
5. pnpm install --frozen-lockfile çalıştırılır. 0001_lying_speed.sql ve Drizzle meta dosyaları CI içinde üretildi ve kaydedildi. Uygulanmış 0000 geçişi değiştirilmedi.
6. pnpm typecheck, pnpm test ve üretim derlemesi çalıştırılır. Firebase Auth Emulator ile iki hesap, doğrulama, sıfırlama, kalıcı oturum ve davet bağlantısı denenir.
7. Değişiklik Sites kaynak deposuna da senkronize edilir, paketlenir ve var olan herkese açık Siteye yayımlanır. GitHub dalını güncellemek tek başına canlı Siteyi güncellemez.
8. CI sabitlenmiş kilit dosyasıyla kurulum yapar; şema üretiminde kaydedilmemiş fark oluşursa durur. Geçici çıktı aktarım betiği kaldırıldı.

## Referanslar

- https://firebase.google.com/docs/auth/web/start
- https://firebase.google.com/docs/auth/web/manage-users
- https://firebase.google.com/docs/auth/custom-email-handler
- https://firebase.google.com/docs/auth/admin/verify-id-tokens
- https://firebase.google.com/docs/reference/rest/auth
- https://github.com/panva/jose
