# İlk döngü kararı ve kabul ölçütü

24 Ekim 2026. Girdiler: `2026-10-24_experience-review.md` ve `2026-10-24_reliability-review.md`. İki gerçek bağımsız inceleme tamamlandı; altı kaynaklı aday raporlandı. Bu sayı oyuncu başarısı veya üretim hata oranı değildir.

| Aday | Oyuncuya fayda | Karar |
| --- | --- | --- |
| Yerel hata dönüşündeki tamamlamanın gönderime alınması | Başka cihazda eksik görünen tamamlamanın yeni hamle gerektirmeden eşitlenmesini sağlar. | Seçildi; somut yalıtılmış tekrar üretimi, küçük değişiklik ve düşük kapsam riski. |
| Depolama hatasında olumlu onay simgesini kaldırma | Oyuncu cihaz kaydının başarısız olduğunu simge ve metinle fark eder. | Aynı kayıt güvenilirliği işinde küçük sunum düzeltmesi. |
| İndirilmiş tahtayı ağdan bağımsız açma | Zayıf bağlantıdaki açılış bekleyişini azaltabilir. | Ayrı aşama; geç bulut yanıtını güvenli birleştirme ve gerçek cihaz kontrolü gerekir. |
| Uçuş sırasında tamamlama/çıkış ve eski hesap PUT kilidi | Son bulut gönderiminin kaçırılması veya yeni sahibin bekletilmesi riskini azaltır. | İki ayrı kabul testiyle planlanacak kuyruk işi; sırf finally'ye flush eklenmeyecek. |
| Arşivden dönüş bağlamı | Eski tarihe yeniden ulaşma adımlarını azaltabilir. | Kayıt işinden sonra; mevcut Albüm dönüşü korunur. |

Uygulama öncesi kabul:

1. Doğru sahipte geçerli tahta ve cihazda tamamlanmış kayıt varken tahta GET'i hata/zaman aşımı verirse aynı kayıt yeni hamle olmadan gönderilecek kabul edilir. Bulut onayı gelmeden hesabında kayıtlı denmez.
2. PUT gerçek yerel tamamlamayı, yıldız/ipuçları ve iyi sonucu korur; başka sahipteki yerel kayıt gönderilmez. Geçersiz/eksik tahta fallback ile açılmaz. Mevcut generation ve aktif sahip korumaları korunur.
3. `storage-error` için uyarı simgesi ve hata sınıfı; gönderim sürerken bekleme simgesi. Metinli durum, dar ekran sarılması ve mevcut dokunma akışı korunur. Bu stil düzenlemesi gerçek cihaz/ekran okuyucu testi sayılmaz.
4. Hedefli tekrar üretim/regresyon, mevcut testler, içerik kontrolü, tip denetimi, üretim derlemesi ve Worker HTTP kontrolleri geçmeden yayın yok. GitHub/Sites kaynakları aynı olacak.

İlk günlükteki kurulum/inceleme aşamaları bu kayıtla ilerledi. Kod ve yayın henüz tamamlanmış sayılmaz. Bugünün iki bölümü aynı kalır; yeni çift üretilmez. Bağlı görevin ajan yönergesi kalıcı kaynak kaydından sonra güncellenecek; zamanlama değişmeyecek.
