# Arşiv dönüşü · karar ve uygulama öncesi kabul

Başlangıç: güncel Sites helper `965a4bea9af80d347bfaab8cca630ba02a0c8bc1`, 0.11.2, sürüm 20; owner/public erişimi doğrulandı. GitHub main `8bf758e73367f9bb07dcac76e92c0164968997da`, tam ağaç `03b38f117c5f0c1dc02ac53f883bc40886766748` eşleşir. Bugünün Kıyıda bir gün / Efsanelerin kapısı çifti kaynakta ve son başarılı yayında var; çoğaltılmayacak.

Adaylar: (1) arşiv/Albümden dönüş bağlamı, açık öncelik ve doğrudan kaynak kanıtı, orta uygulama maliyeti/düşük veri riski; (2) gerçek telefon/büyük yazı doğrulaması, yüksek değer fakat önceki destekli preview engelinde toparlanma kanıtı yok; (3) yeni keşif odası, daha geniş kapsam ve temel yolculuğa göre düşük öncelik. Birinci odak seçildi. Tek sınırlı güvenilirlik uzmanı köken, sayfalama ve kayıt sınırlarını inceler; koordinatör uygulama/test/yayın sahibi. Geniş araştırma ve iki uzman taraması tekrarlanmaz.

## Kabul

- Ana sayfa arşivinden açılan bölümün geri eylemi aynı arşivi, önceden yüklenmiş aralığı ve seçilen kartı geri getirir. Albümden açılan bölüm aynı tarih penceresine döner. Dünya listesi kendi temasında kalır; doğrudan ana sayfa kartı arşiv penceresi açmaz.
- Bölüm sonucundan aynı çiftin diğer bölümüne geçmek ilk dönüş kökenini korur. İlk açılış hatasından geri dönüş de aynı bağlamı kullanır.
- Dönüş yalnız oturum belleğindeki genel katalog metaverisini taşır; özel ilerleme, kayıt, puan veya ödül snapshot'ı taşımaz. Hesap/koleksiyon/tema/köken uyuşmazlığı geri yüklenmez. Kart ilerlemesi güncel sahibin mevcut hook'undan okunur.
- Başarılı sayfalar dönüşte ağ beklemeden görünür. Sayfalama hatası/yeniden deneme veya bağlantının geri gelmesi yüklenen eski aralığı ve sonraki offset'i sıfırlamaz; iptal edilmiş eski yanıt state'i değiştirmez. Çevrimdışı indirilmemiş bölüm kuralı sürer.
- Gerçek bileşen/hook kontrolü dönüş, Albüm tarihi, ilgili bölüm, farklı köken, iki sayfa ve ağ hatası/iptal senaryolarını doğrular. Bunlar DOM, CSS piksel veya fiziksel telefon testi sayılmaz. Mevcut 165 test, içerik, tip, build ve Worker HTTP kontrolleri korunur; değişen girdiler yeniden doğrulanır.
- Eski yayın JSON'ları, tahta/kelime/ID/tohum, beşli atlas kümeleri, ödül/best/save/queue, DB/göç/manifest değişmez. Ücret, servis, bağımlılık ve zamanlayıcı eklenmez. Kaynak/CI eşleşmesiyle aynı adrese gerçek yayın sonucu gereklidir.
