# 5 Kasım 2026 · 0.36.4 davet güvenilirliği

## Karar ve kabul

Kullanıcı Opus değerlendirmesinden doğrulanan çıkarımların uygulanmasını istedi. Eksik denilen paylaşım, öğretici ve isteğe bağlı ölçümün mevcut olduğu önceki kaynak incelemesinde görüldü. İlk somut odak native davet URL'si: yüksek etki, dört doğrudan çağıranla açık kanıt, düşük değişiklik maliyeti, içerik/kayıt göçü yok. İlk kullanıcı güncellemesinde doğru oyun adresi, alıcıdaki kod ve mevcut ilerlemeyi koruma kabulü belirtildi. Tek uzman davet güvenilirliğini bağımsız inceledi; koordinatör uyguladı.

## Değişiklik

- Ortak URL kurucusu oda/arkadaş/meydan kodunu doğrular. iOS yerel origin yerine HTTPS oyun adresi; web mevcut web origin. İlgisiz sorgu, hash ve auth verisi taşınmaz.
- GameSharing UIKit paneli; tek uçuş, iptal/başarı/kopya/hata ayrımı. İptal panoya yazmaz ve başarı olayı üretmez. Kapalı veya değişmiş ekrana geç sonuç uygulanmaz.
- Sistem Copy ile gerçek Paste kontrolü ilk native uygulamada yalnız başlığın kopyalandığını yakaladı. İki ayrı UIKit öğesi tek başlık+satır sonu+URL metnine dönüştürüldü; aynı test bu kez geçti.
- iOS sürüm 0.36.4, build 17. Yeni bağımlılık/SDK yok. Tahta, animasyon, haptics, bölüm/kelime/tohum, ilerleme, ödül, sunucu üyelik/puan ve Arena tekrar kuralları değişmedi. 0.36.3 tarihli içerik korunur.

## Doğrulama

- 755 test / 152 grup, 0 hata/atlama. Native/local origin, üç davet türü, auth dönüşündeki kod, SSR, web share/clipboard/cancel/error, tek uçuş ve Arena çağıranının geç yanıtı dahil. Arena VM gerçek native transport ile çalışır.
- 243 sabit tahta / 4860 alternatif; 64 ek grup, 96 yarışma tahtası, 774 tanım/919 kelime ve 714 hızlı oyun kelimesi içerik kontrolünden geçti.
- Tip, 23 tablo ve sıfır şema değişimi, web üretim/42 offline varlık/21 Safari 12 parçası, mobil üretim/sync/paket kontrolleri ve 639 izole Worker HTTP senaryosu geçti.
- iPhone 16e simülatöründe üretim GameSharing köprüsünü kullanan ayrı QA paketi: üç türde sistem Copy, iptal, yeniden açma ve son oda davetinin sistem Paste içeriğinde doğru HTTPS/kod. XCTest 1 test, 0 hata. Sonuç: `kt-sharing-nGrxYO/sharing.xcresult`; dört ekran görüntüsü teslim çalışma alanında `world-review/0.36.4/`. Test uygulaması sonunda kaldırıldı; gerçek kullanıcı hesabı, ağ mutation'ı veya cihaz kaydı kullanılmadı.
- Tekrarlama: `node scripts/verify-ios-edge.mjs SIMULATOR_UDID sharing`. Varsayılan kenar çizim testi değişmedi.

## Sınırlar ve sıradaki iş

Tarayıcı paylaşım önizlemesi açıldı ancak host sistem paneli destekli tarayıcı yüzeyinden gözlenemedi; web sistem paylaşımı için görsel E2E başarı iddiası yok. Tarayıcı davranışı regresyon testleriyle, gerçek UIKit paneli simülatörle doğrulandı. Kimseye mesaj gönderilmedi. Fiziksel telefona kurulum kullanıcı isteğiyle ertelendi. Universal Links/kurulu uygulamaya davetten geçiş ve iki gerçek kullanıcı kabulü açık. Bu sürüm oyuncu kazanımı veya WoW eşdeğerliği kanıtı değildir.

Sonraki öncelikler: fiziksel uzun çizim ve yaşam döngüsü kabulü, hesap silme ve ad moderasyonu; mevcut isteğe bağlı ölçümden ilk oyuncu kaybını anlama. Yayıncı/destek bilgileri ve diğer mağaza kapıları açık; reklam/SDK eklenmedi. Sites/GitHub ağaç eşitliği, CI ve gerçek yayın yanıtı ayrı teslim makbuzuna yazılır.
