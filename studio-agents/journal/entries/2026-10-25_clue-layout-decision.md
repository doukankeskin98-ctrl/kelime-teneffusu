# İpucu Avı yerleşimi · uygulama öncesi karar

Başlangıç güncel Sites helper kaynağı `bb33a116f8d7adb859890b5edbd8942d54526e60` / 0.11.1; GitHub main `84cc59ea6cf970723f3464de6a047a243e472cb2`, eş ağaç `eaff7e5546b31b9fe371ba94ac8797955690b7eb`. Herkese açık sahip erişimi doğrulandı. README, sürüm/harita belgeleri ve son koordinatör kaydı aynı kaynakta değişmemiştir; mevcut bağlam ve güncel sözleşme/öncelik kaydı kullanıldı. Yeni geniş inceleme/araştırma tekrarlanmadı.

Bugünün **Kıyıda bir gün** ve **Efsanelerin kapısı** çifti zaten başarıyla yayında. Bölüm dosyası, kimlikler/kelimeler/tohumlar değiştirilmez, ikinci çift yok.

Adaylar: (1) tanım→cevap geçişinde hedef/tahta yüksekliği; (2) arşiv konumu; (3) gerçek telefon/PWA kanıtı. Önceki iki dar incelemenin ortak günlüğünden kalan 1 numaralı somut sunum kusuru seçildi. Kaynakta `copy.isClue` bulununca false oluyor; `clue-tag` sınıfı ve harf sayısı kayboluyor. Mobilde 43 px tanım minimumu 28 px normal etikete, uzun metin de kısa cevaba dönebiliyor; PlayLayout yeniden ölçümü tahtayı oynatabilir. Gerçek cihazda ölçülmüş hata veya tutma etkisi iddia edilmiyor.

## Kabul

1. İpucu Avı kartı aynı kalıcı `clue-tag` tipinde kalır. Tanım+harf sayısı ve cevap aynı intrinsic grid alanında her iki durumda da yer tutar; yalnız görünür yüz değişir. İki yüzün daha büyük ölçüsü ayrılır, sabit piksel yüksekliği/metin kırpma/iç scroll kullanılmaz. Cevap uzun olduğunda da başlangıçta alanı ayrılmış olur.
2. Bulunmadan cevap yüzü `visibility:hidden` ve `aria-hidden=true`; erişilebilir kart adı yalnız tanım/harf sayısıdır. Bulununca tanım gizlenir ve cevap görünür. Gizleme CSS dosyasının yüklenmesine bağlı olmaz. Kartın gizli ölçü yüzü okunabilir cevap veya etkileşimli kontrol olarak sunulmaz.
3. Normal kelimeler, çok parçalı adlar, golden etiket, bulunmuş renkleri ve azaltılmış hareket kuralları korunur. Boyut değişen gerçek viewport'ta seçimi temizleyen Board korumasına dokunulmaz. Eski tahtalar, kayıtlar, atlas/ödül/hesap ve göçler aynı kalır.
4. Gerçek WordList gövdesiyle tüm mevcut İpucu Avı hedeflerinin önce/sonra ölçü yüzü ve erişilebilir ad sözleşmesi; uzun tanım/cevap; normal çok parçalı/golden davranış denetlenir. Bunlar CSS piksel yerleşimi veya gerçek tarayıcı/telefon kanıtı sayılmaz.
5. Ortak WordList/CSS değiştiği için ilgili testler, tam regresyon, tip, güncel içerik, üretim derlemesi ve Worker HTTP çalışır. Tek dar bağımsız son deneyim incelemesi yeterli; iki geniş uzman taraması tekrar edilmez. CI/tam ağaç eşleşmesi ve aynı adrese gerçek yayın sonucu olmadan yayımlandı denmez.

Önceki destekli preview ERR_CONNECTION_REFUSED engelinde toparlanma kanıtı yok; alternatif tarayıcı/server denenmez. Kapsam basit ve mevcut bulguya bağlıdır; yeni grafik, servis, bağımlılık, ücret veya zamanlayıcı yok. Haftalık değerlendirme yeniden yapılmaz.
