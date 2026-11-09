# 0.47.2 — hızlı eşleşmede bağlantı sonrası toparlanma

Kabul: aynı tur tercihindeki iki canlı oyuncu, arka planda kalma/bağlantı kesintisi yüzünden ayrı ilk-tur bekleme odalarına düştüğünde sonraki durum yenilemesinde aynı hazır lobide buluşmalı. Kişi başına tek aktif üyelik korunmalı. Ayrılmış/engellenmiş oyuncular, farklı tercihler, özel odalar, aktif maçlar ve oynanmış oda serileri birleştirilmemeli. SSE ve native polling yeni oda kimliğine geçmeli; eski iptal edilmiş oda görüntüsü oyuncuyu kilitlememeli. Kayıtlar, puanlar ve bulmacalar değişmez.

Arkadaşların canlı olayındaki tam mesaj bilinmiyor. Aynı belirtiyi üreten kesinti/geri dönüş hatası yerel gerçek SQLite işlemleriyle tekrar üretildi. Canlı servis erişimi ve düzeltme testleri ayrı raporlanır.

Uygulama: ilk turda tek kişi kalmış hızlı grup lobileri, aynı tur tercihi ve canlı oyuncu filtresiyle atomik olarak birleştirilir. İki odanın sürümü ve aktif üyelikleri aynı işlemde doğrulanır; eski oda izleyicisi yeni üyeliğe yönlenir. SSE heartbeat ve watch oda değişimini benimser. Kalan çevrimdışı oyuncunun odasını ayrılmış bir istemcinin gecikmiş sorgusu taze gösteremez.

Doğrulama: 884 test / 168 süit; kesinti, eşzamanlı dönüş, ayrılma yarışı, engelleme, tur tercihi ve gerçek SSE handler regresyonları dahil. Tip/içerik/veritabanı değişmezliği/üretim derlemesi ve 46 dosyalı native paket geçti. Canlı Arena girişinin erişilebilirliği incelendi; arkadaşların özel oturumları veya iki fiziksel telefon test edilmedi. HTTP ve yayın sonuçları sürüm kanıt klasöründedir.
