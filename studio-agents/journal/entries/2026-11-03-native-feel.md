# 0.28.0 · Sahne odaklı oyun ve Kıyı Günlüğü

Kullanıcı 14 maddelik tasarım planının uygulanmasını istedi. Seçilen ilk bütünlüklü teslim: üç ana hedefli tam sahne kabuğu, tek devam yolu, erişilebilir harita/oyun kitaplığı, sade Arena girişi, mevcut asenkron meydan okuma, 24 özgün bölüm, içerik inceleme aracı ve hız/erişilebilirlik iyileştirmeleri. 300/600 bölümlük katalog, bu 24 bölümlük paketin gerçek oyuncu gözlemi sonrasındaki büyüme hedefidir; sahte bölüm sayısı yok. Ticari model önerileri mevcut oyuna ücret veya satın alınan avantaj ekleme kararı değildir.

## Kabul
- Ana ekranda kaydırmadan Oyna/Devam; üç ana gezinme hedefi. Günlük/hikâye/arşiv/klasik ve davet URL'leri erişilebilir.
- İlk 96 bölüm, bütün eski kelime/tohum/tahtalar, albüm ve 3/5/6 kapıları değişmez. Yeni 24 bölüm yeni rota kimlikleriyle ana sıranın sonuna eklenir.
- Dört altılı rota konuya bağlı kelimeler, 6–8 hücreli tahtalar ve hafif gizleme kullanır. Aynı kelime kümesi/grid yeni bölüm sayılmaz.
- Arena paylaşılan tahta ve kalıcı görülme geçmişi değişmez; özel oda/katılma/gerçek rövanş ve mevcut asenkron akış korunur.
- Dar mobil alanda tahta/sonuç/devam kontrolleri görünür. Hareket azaltma, kontrast ve sol el tercihi çalışır. Sahne hazırlama engelleyici bekleyiş oluşturmaz.
- Gerekli içerik/tip/test/build/Worker kapıları, GitHub eş ağaç + CI ve gerçek Sites yayın makbuzu.

## Doğrulama
Uygulama ve yerel doğrulama tamamlandı. Fiziksel iPhone Safari, iki gerçek telefon, dinleme/VoiceOver ve bağımsız oyuncu gözlemi yapılmış sayılmayacak. Gerçek bulgular ve kalan sınırlar teslim öncesi eklenecek.

- 594 test/127 grup; içerik189+3780,64 grup,774 Arena tanımı/919 kelime,714 hızlı oyun kelimesi; typecheck/build ve622 Worker HTTP kontrolü geçti.
- İki uzman: tema listesinden yeni rota kilidi atlama ve aynı adlı parça sunumu düzeltildi. Atölyede küçük harfli Türkçe tanım anahtarı normalize edildi; temsil edilemeyen çok parçalı bilmece ihracı engellenir.
- 360×568 ve414×622 kullanılabilir tarayıcı alanında ana ekran kaydırmasız. Küçük Arena sosyal satırı nav altında kaldığı için tek sıraya alındı ve yeniden kontrol edildi. Altı bölüm düğmesi44px.
- Gerçek UI ile normal bölümde GÜNEŞ/DÜNYA/MARS/YILDIZ çizildi; DÜNYA sonunun ötesine sürüklenerek kabul edildi. Üç aşamalı ipucu, sonucu açma/sonraki bölüm, sol el/azaltılmış hareket tercihlerinin reload sonrası kalması doğrulandı. Test tercihleri sonunda geri alındı.
- Hikâye drawerı, Koleksiyon, Arena özel oda oluşturma ve çıkış doğrulandı. Atölyede99. Teknenin parçaları gerçek tanımlarla açıldı. Eski12satırlı kayıt değiştirilmez; yeni tahta boyutları6–8.
- Yeni24 bölüm için tam tarayıcı kampanya geçişi oynanmadı; deterministik içerik, erişim ve bulut uyumluluğu testlerle doğrulandı. Fiziksel Safari/iki gerçek telefon/ses/VoiceOver/FPS/gerçek oyuncu gözlemi bekliyor.
- Yayın sonucu önceden varsayılmaz; GitHub eş ağaç/CI ve Sites makbuzu depo dışı release-0.28.0.json içinde tutulacak.
