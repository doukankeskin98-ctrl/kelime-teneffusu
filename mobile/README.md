# iOS test uygulaması

Aynı React GameApp, tahta, 144 ana bölüm ve sahneler yerel Vite paketiyle iOS uygulamasına alınır. Uzak `server.url`, cleartext veya wildcard navigation yoktur. iOS 15+ hedefi; web Safari 12 yolu korunur. `com.kelimeteneffusu.game` geliştirme bundle kimliğidir; Apple hesabında rezerve edildiği iddia edilmez.

## Derleme

`pnpm mobile:build` → `pnpm exec cap sync ios` → `pnpm mobile:check`.

`pnpm mobile:open` mevcut Xcode projesini açar. Simülatör derlemesinde Apple Developer üyeliği gerekmez. Fiziksel cihazın imzalama takımı ve TestFlight dağıtımı yayıncı hesabında ayarlanır; kimlik, sertifika, profil veya parola repoya konmaz.

## Gerçek cihaz denemesi

Kişisel Apple hesabıyla Xcode imzalaması kullanılabilir; takım/sertifika bilgisi kaynak deposuna yazılmaz. Üst sağ dişli → Dokunma titreşimi mevcut tercihi açar/kapatır. Koleksiyon ve diğer uzun sayfalar native belge kaydırmasını kullanır; tahta dokunma korumaları kendi alanında kalır. Kişisel test imzası süreli olduğundan profil süresi bitince yeniden derleyip kurmak gerekir.

## Ağ ve kayıt

Sabit HTTPS API adresi mevcut Sites sunucusudur. Native JSON taşıması kendi `Origin` başlığını bu sunucuya bağlar; sunucudaki same-origin/kimlik kontrolleri aynen kalır. Kimlik çerezi iOS HTTP cookie store'dadır. JavaScript yedeğine veya URL'ye oturum anahtarı yazılmaz. Global fetch patch açık değildir. Web SSE korunur; iOS Arena aynı sunucu durumunu tek uçuşlu, arka planda durdurulan sorguyla yeniler. İstek iptali sonucu emekliye ayırır; sunucuya ulaşmış mutation'ın iptali garanti edilmez.

Paketlenmiş 144 solo bölüm ilk açılışta çevrimdışı kullanılabilir. Arena/günlük/sunucu arşivi internet ister. WKWebView cihaz kaydı Safari depolamasından ayrıdır; yeni kurulumda Safari kaydının otomatik aktarılacağı iddia edilmez. Kalıcı hesabı veya güvenli misafir geçişini doğrulamadan genel dağıtım yapılamaz. iOS'ta ChatGPT web yönlendirmesi gösterilmez; bu girişin native hesap geçişi ve Apple 4.8 değerlendirmesi ayrıca tamamlanmalıdır.

## Yayın kapısı

Bu ilk test derlemesidir; App Store onayı veya WoW ile eşdeğer FPS/his iddiası değildir. `docs/app-store-readiness.md` gerçek açıkları ve politika taslaklarını içerir. Developer hesabı, işletmeci/destek bilgisi, hesap silme, moderasyon, kayıt aktarımı ve fiziksel cihaz kabulü kapatılmadan mağazaya gönderilmez.
