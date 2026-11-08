# 0.43.0 · Kesintisiz bölüm akışı ve yerleşme titreşimi

8 Kasım 2026 · iOS 0.43.0 / build 29.

## Değişiklik
- Oyun kontrol satırındaki ayrı duraklat düğmesi kaldırıldı. Solo, Gizli Tema ve bonus turu arka planda süreyi durdurur; öne gelince ayrıca devam düğmesi istemez. Açık yardım/ayar kapanmadan tahta etkinleşmez. Arena ve günlük sunucu süreleri aynı kalır. Bonus yardımındaki X de süreyi yeniden başlatır.
- Ana ekran, tahta başlığı ve sonuç aynı mevcut global bölüm numarasını gösterir. Konu büyük, dünya adı ikincil kalır. Eski 1,2,3,5,9,10 ilk dünya numaraları yeniden sıralanmaz.
- Ana ekranda kazanılacak gerçek albüm parçası ve mevcut parça sayısı; sonuçta mevcut kurallardan hesaplanan sonraki dünya/albüm hedefi görünür. Albüm finali ile süreli bonus ayrıldı. Yeni para, ödül, kapı veya kayıt göçü yok; tekrar oynama mevcut parçayı yeniden kazandırmaz.
- Son uçan harfin gerçek yerleşme callback'i ayrı, kısa bir iOS light impact üretir. İptal, arka plan, ayar kapalı, azaltılmış hareket ve unmount sessizdir; ACK tekrar titreştirmez. Ayrı kanal sonraki çizimin selection oturumunu kapatmaz; native köprü biriktirmez ve etkin olmayan/geç pulse'ı düşürür.
- Görsel kontrolde saptanan kısa ekran sonucu düzeltildi: 420px ve üstü kullanılabilir yükseklikte ödül ayrıntıları kayarken sonraki bölüm düğmesi görünür kalır.

## Kanıt
189 hedefli test ve tüm 835 test geçti. Son ödül sunumu iddiaları 20 ilgili testte yeniden geçti. Tip, içerik, şema kontrolü (göç yok), üretim web derlemesi, 695 Worker HTTP kontrolü, 39 dosya/21 sahne native paket doğrulaması ve imzalı Release iPhone derlemesi geçti.

Yerel gerçek React önizlemesinde 414×628 CSS px (iPhone 8 Plus Safari kullanılabilir alanı) ve 321×487 kısa alan kontrol edildi. 7×7/9×9 tahtalar, ardışık dikey/çapraz seçimler, gizli kelimenin açılması, Bölüm 2→3 geçişi, sonuç/albüm/yeni dünya ve ana ekrana dönüş görüldü. Sonuçta devam eylemi kısa alanda görünür, yalnız ayrıntı bölgesi kayar. Önizleme tarayıcı ölçeği hesaba katılarak DOM ölçüsü doğrulandı. Görseller yalnız yerel world-review/0.43.0 içinde. QA ayrı localhost kayıtlarıyla yapıldı; kullanıcının üretim kayıtları değiştirilmedi.

## Sınır
Telefon Mac'te unavailable; bu sürüm fiziksel telefona kurulmadı ve yeni titreşimin hissi doğrulanmadı. Tarayıcı QA gerçek iPhone/Safari/WKWebView parmak testi veya FPS ölçümü değildir. Uzun oturum, VoiceOver ve TestFlight/App Store kabulü ayrıca gerekir. İçerik, tohumlar, kayıt formatı, ödül/rekabet hesaplamaları değişmedi.
