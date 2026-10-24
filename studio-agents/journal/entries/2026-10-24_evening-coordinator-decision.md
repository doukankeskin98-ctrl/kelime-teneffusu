# Akşam odağı ve uygulama öncesi kabul ölçütleri

Başlangıç: en güncel Sites kaynağı `4e3e63c8c9df9af590128c21e198c1e16712ffc4`, 14. sürüm, herkese açık sahip erişimi; GitHub main `4e311d7bea09a784f4fedf612f77de5031fd9db1`. 24 Ekim'in iki kalıcı bölümü zaten yayında; aynı dosyalar korunur.

| Aday | Kanıt ve fayda | Maliyet / risk / karar |
| --- | --- | --- |
| Gönderim sürerken tamamlayıp çıkış ve hesap değiştirme | Önceki bağımsız inceleme iki tekrar üretilebilir tetikleyici buldu. Son keşif aynı sekmede çıkışta gönderilebilmeli; başka hesap eski isteğe takılmamalı. | Sınırlı fakat yaşam döngüsü riski var. Seçildi; tek sahipli, bölüme/hesaba bağlı gönderim kanalı ve ayrı kabul senaryoları. |
| İndirilmiş tahtayı ağ beklemeden açma | Önceki deneyim incelemesinde sekiz saniyeye kadar bekleme. | Geç bulut yanıtı ve canlı Solo birleştirmesi ayrıca tasarlanmalı. Sonraki odak. |
| Arşiv dönüş konumunu koruma | Önceki kaynak incelemesinde bağlam kaybı. | Kayıt sorunlarından sonra; bu sürümde yeni ekran/oyun mekaniği yok. |

## Kabul

1. İlk kısmi PUT beklerken tamamla ve bölümden çık: ilk yanıtın ardından son tamamlama da aynı hesaba gönderilir. Onaydan önce hesapta kayıtlı denmez. Sekme kapatma/işletim sistemi sonlandırması için teslim garantisi verilmez; cihazdaki kayıt korunur.
2. Aynı bölümde A'dan B'ye geç: A isteği iptal edilir, B bağımsız gönderir. A'nın geç yanıtı B'nin kaydını, durumunu veya uçuş kilidini değiştiremez. Yeni B uçuşu varken tekrar tetikleme ikinci eşzamanlı B isteği doğurmaz.
3. Her gönderimin uygulama süre sınırı var; zaman aşımında kilit açılır ve son kayıt sonraki denemeye kalır. Hata/zaman aşımı anında sınırsız tekrar yapılmaz.
4. Eski kanalda gecikmiş kimlik/token işlemi yeni hesapla istek üretirse sunucu beklenen hesap eşleşmesini zorunlu kılar. Ek alan eski istemciler için isteğe bağlıdır; kimlik veya yetki sağlamaz. Yanlış/boş/sahte beklenen kimlik hiçbir hesapta kayıt yazmaz.
5. Yerel anahtarlar, kayıt biçimi, en iyi sonuç/bulut birleştirmesi ve tüm eski tahta/ödül/harita kuralları aynı. Ayrılmış kanal yalnız kendi hesabının cihaz kaydını birleştirir. Bağımlılık, şema, ücret veya entegrasyon eklenmez.
6. Mevcut üç TSX regresyonu korunur; yeni kuyruk, hesap, zaman aşımı ve sunucu kimlik sınırı senaryoları doğrulanır. İçerik, tip, test, üretim derlemesi, Worker HTTP, CI ve tam kaynak eşleşmesi geçmeden yayın yok.

Bu tur tek sınırlı güvenilirlik uzmanı tasarım ve son diff incelemesi için kullanılır. Deneyim bulguları zaten kayıtlı olduğundan aynı geniş tarama tekrarlanmaz. Destekli önizleme engeli için toparlanma kanıtı yok; gerçek telefon/DOM/ekran okuyucu/FPS doğrulaması yapılmış sayılmaz. Gerçek oyuncu etkisi henüz ölçülmedi.
