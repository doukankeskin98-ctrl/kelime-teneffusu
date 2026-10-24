# Öncelikler

24 Ekim 2026. Başlangıç: Sites `14e8cceb5f4d7ece7911eba21ab98b5523b254cf`, GitHub `33b85d16c7291576969ca4914ae15087538603b1`, 0.8.2.

İlk döngü: iki bağımsız inceleme tamamlandı; yerel hata dönüşündeki gönderim eksikliği ve kayıt durumu simgeleri düzeltildi. 121 test, 175 Worker HTTP kontrolü, tip denetimi, 32 tahta/640 alternatif ve üretim derlemesi geçti. Gerçek yayın sonucu Sites metadata'sından ayrıca doğrulanır. Son durum: `../journal/entries/2026-10-24_coordinator-validation.md`.

1. Uçuş sırasında tamamlama/çıkış son kaydını düşürmeyen sahip sınırına bağlı kuyruk. Kabul: geciken ilk kısmi PUT'tan sonra son tamamlamayı da aynı sahip için gönder; yeni sahibin kimliğiyle eski kayıt gönderme. Mevcut sunucu/yerel iyi sonuç birleştirmesi korunmalı.
2. Eski hesap PUT'u yeni sahibin gönderimini kilitlememeli. Kabul: sahibi/nesli değişince ayrı istek kanalı; eski finally yeni kilidi açamaz, süre aşımı sonrası tekrar denenir. İlk kuyruk işiyle birleştirilecekse iki ayrı regresyon korunmalı.
3. İndirilmiş tahtayı ağ beklemeden açma ve geç bulut yanıtını yeni kelimeleri silmeden birleştirme. Önce kaynak/yalıtılmış test, sonra destekli iPhone/Android doğrulaması. Önceki önizleme kilit/erişim engeli çözülmüş değildir.
4. Arşivden dönüşte seçilen tarih ve yüklenmiş aralığı koruma. Doğrudan ana sayfa ve Albüm dönüşü kendi bağlamında kalmalı.
5. Gerçek izinli oyuncu gözlemi ve iOS dikey prototipi: ilk açılış → solo bölüm → kayıt → geri dönüş. Xcode/cihaz ve giriş sağlayıcısı doğrulanmadan hazır sayma; ölçülmemiş tutma/FPS artışı iddiası kurma.

24 Ekim'in **Parkede küçük mola** ve **Yörüngede bir gün** çifti yayımlandı; bu çalışmada ikinci çift yok. Yeni keşif odası/ortak gizem, temel erişim ve kayıt doğrulamasından sonra değerlendirilir. Reklam/ödeme, yeni ücretli hizmet veya mağaza yayını bu ilk ajan kurulumunun kapsamı değildir.
