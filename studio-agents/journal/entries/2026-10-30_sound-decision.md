# 30 Ekim · Yumuşak oyun sesleri — uygulama öncesi karar

Güncel Site31 / 0.13.1, kaynak ad12f7814845fd978f91fdcad58aaa3ac4f4b9e6 ve GitHub main a79c8054f2df0ffd610e47e78f995874e1360102 açıldı. Kullanıcının doğrudan ses tasarımı isteği uygulanır; içerik/ödül/kayıt/şema değişikliği kapsam dışıdır. Otomatik günlük içerik işi bu ses isteğine eklenmez.

Adaylar: (1) sürekli ortam müziği — yorgunluk, indirme ve kesinti maliyeti yüksek; (2) bütün düğmelere efekt — anlamı azaltır, tekrar yükü yüksek; (3) oynanışın anlamlı anlarına ortak, kısa ve yumuşak ses ailesi — seçildi. Hedef, seçim/gerçek başarı/keşif farkını sezilebilir yapmak. Keyif artışı henüz oyuncuda ölçülmedi.

## Kabul
- Özgün, yumuşak giriş/çıkışlı ahşap/pluck tınıları: seçim başlangıcı, doğru kelime, ipucu, gizli bağlantı, başlat/devam, tahta/bölüm bitişi. Her harfte, yanlış seçimde ve son saniyelerde tekrar alarmı yok.
- Yeni oyuncuda mevcut sessiz başlangıç ve kayıtlı ses/titreşim tercihleri korunur. Oyun içi kapatma hemen etkili; Albümde cihaz ses düzeyi ve gerçek örnek dinleme vardır. Titreşim ayrı tercih kalır.
- Tek aktif ses grubu, hız sınırı ve önemli bitiş sesine öncelik; gizli sekme, kapatma ve unmount sesleri temizler. Gecikmiş async callback kapatılmış sesi açmaz.
- AudioContext yalnız etkileşimle açılır/uyanır; klavye ve pointer desteklenir. Desteksiz/reddedilen API oyunu bozmaz; sonraki etkileşimde eski ses kuyruğu çalmaz.
- Arena/Meydan başarı sesi yalnız kabul edilmiş claim için, tekrar/ret ve ilk eski sonuç yüklemesi sessiz. Puan, zaman, ödül, sunucu protokolü ve tahtalar değişmez.
- Anlamlı ses motoru ve gerçek caller regresyonları; tam test/içerik/tip/üretim build/Worker kapıları, GitHub CI ve tam kaynak eşleşmesi sonrası aynı adrese yayın.

## İlk sınır
Destekli preview start, başka bir vinext server kaydı (/site PID14) nedeniyle sağlıklı başlayamadı; status stopped. Bu hata uygulama sesi hatası değildir. Yalnız somut onarım varsa tekrar denenir. Gerçek hoparlör/kulaklık/iPhone dinlemesi ve ses konforu ölçümü ayrıca açık kalır. Tek sınırlı experience uzmanı kaynak/olay dili incelemesi yapar; gerekirse son güvenilirlik incelemesi ikinci uzmanla sınırlıdır.
