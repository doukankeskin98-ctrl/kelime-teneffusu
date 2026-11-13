# 0.51 kalite kapıları — bağımsız güvenilirlik incelemesi

13 Kasım 2026. Salt okunur uygulama incelemesi; yalnız bu günlük yazıldı. Geniş test veya tarayıcı/telefon deneyi yapılmadı. Başlangıç b782b98 / 0.50.0. En fazla üç öncelikli bulgu.

## 1. Yeni taslakların editoryal kontrolü sunucu yayın sınırında eksik

Kaynak: lib/game/content-review.ts:12–15, lib/studio/content.ts:40–45, lib/studio/store.ts:78–104; tests/horizons-pack.test.ts:26–30. UI incelemesi yalnız tam küme tekrarını arıyor. checkNewChapter ise güvenlik/yerleşim kontrolü yapıyor; aynı kelime kümesi, büyük örtüşme veya kelimelerin geçmişteki sıklığı yayın kapısında denetlenmiyor. Horizons üreteci bütün bölümleri dört hedefli yapıyor (lib/game/horizons-content.ts:809–815); yerel indeks etiketi gerçek zorluğun ölçüsü değil.

Öneri: Bir ortak saf editoryal analiz hem kaynak paketi CI hem sunucu preview/save/publish içinde kullanılmalı. Normalizasyon, karşılaştırılan korpus ve payda açık olmalı. Korpus yalnız ilk192 değil aktif ana/yan/tarihli ve yayımlanmış dinamik bölümleri içermeli; taslağın kendi kimliği dışlanırken başka taslak/kopya muaf tutulmamalı. Tam aynı kümeyi reddet; mevcut bir bölümle en az üç hedef ve adayın en az %75'i ortaksa yakın kopya olarak reddet. Tüm geçmişe göre >%50 tekrar veya son12 bölümde >%25 tekrar başlangıç editoryal inceleme eşiği olabilir; bunlar oyuncu araştırmasıyla doğrulanmış evrensel oranlar değildir. Eşik üzerinde yeni taslak sessiz uyarıyla yayımlanmamalı; açık inceleme kaydı veya değişiklik istenmeli. Gelecekte sınırsız kelime yeniliği mümkün olmayacağından kontrollü öğretici tekrar türü ayrı, gerekçeli karar olmalı.

Zorluk raporu hedef sayısı/harf uzunluğu, görünür hücre, ileri/ters/çapraz yerleşim oranı, kesişim, benzer başlangıçlar ve gizli/tanımlı hedefleri ayrı ölçmeli. Etiket için açıklanabilir koşullar kullanılmalı; 6×6 dört açık basit kelimeyi yalnız 'Ustalık' etiketiyle kabul etmemeli. Bölüm başlığıyla anlam uyumu otomatik olarak kanıtlanamaz; yazılı dahil etme kuralı ve editör onayı gereklidir. Altılı rotada rahat giriş, artan uygulama ve bilinçli nefes bölümü bulunabilir; her bölümün bir öncekinden daha büyük olması şartı konmamalı. Ölçümler bir oyun tasarımı tahmini, gerçek çözüm süresi/yanlış çizim/ipucu kullanımı ise ayrı kabul kanıtıdır.

Yayınlı312 için istisna basit `id in oldIds` olmamalı: kimlik + normalize içerik/tahta digest'i + bilinen ihlal kodu ile tam dondurulmuş bir borç kaydı olmalı. Bu kayıt, eski kusurların giderildiği anlamına gelmez. Aynı eski kimliğin içeriğini değiştirince veya yeni kimlik ekleyince tam yeni kalite kapısı çalışmalı. Kabul: mevcut312 immutable kalır; gezegen örneğinin yeni kimlikle kopyası ve %75 yakın kopyası sunucuda reddedilir; bir kelime değiştirerek küme testi aşılamaz; eski hash değişirse kontrol başarısız olur.

## 2. Boyut bütçesini birleştirmeden sonra da korumak gerekir

Kaynak: lib/game/cloud.ts:5–12 ile lib/game/progress.ts:33–40. CloudProgress.save iki kaydı birleştirip sonuç JSON'unun UTF-8 boyutunu kontrol etmeden yazıyor. loadProgress sınırı aşan kaydı boş ilerlemeye çeviriyor. Mevcut kapasite testi 256KB altında olsa bile bu sözleşme yeni içerik/iki cihaz birleşiminde veri kaybına açık bir sınırdır.

Öneri: şemayı değiştirmeden DB yazısından önce birleştirilmiş veri boyutunu kontrol et; sığmıyorsa mevcut satır/revision hiç değişmesin, istemcinin yerel kaydı silinmesin ve yazma başarılı gösterilmesin. Mevcut DB satırı taşmışsa `emptyProgress()` gibi görünür sıfırlama yerine kurtarılabilir hata üret. Yalnız istek gövdesi sınırına güvenme. Kabul: tek tek sınıraltı A/B birleşince taşan kayıt yazılmaz, eski satır birebir kalır; owner mismatch ve eşzamanlı CAS davranışı korunur; Türkçe UTF-8 karakterleriyle de test edilir.

Kapasite kapısı: mevcut stres verisini açıkça sabitle (511 bilinen kayıt +3660 tarih +2100'e kadar haftalık hatıra); gerçek tipik oyuncu diye sunma. Şimdi yeni bölüm eklenmeyeceği için mevcut yaklaşık227.8KB test üst sınırına dar, gerekçeli bir payla yeni büyümeyi engelle; 'sunucu limitinin altında' tek başına kabul olmasın. Kayıt biçimi değiştirilmeden bu bütçeyi büyütme. Küçültme planı onaylandığında sonrasında hedef en az %25–30 boşluk; tarih/ödül silerek yer açma yok.

## 3. İçerik revizyonu ve kompakt kayıt planı atomik, eski istemciye dayanıklı olmalı

Kaynak: progress.ts:20–40,56–75; progress-sync.ts:55,62,78; app/api/progress/route.ts:11–12. Mevcut kayıt anahtarı tek tahta ile çözülüyor; aynı bölüm kimliğine yeni kelime koymak eski strokes'u geçersiz sayar. Sadece v:3 yazmak veya eski localStorage anahtarını silmek güvenli geçiş değildir.

Somut önerilen plan — uygulama öncesi inceleme/onay için:

1. Mevcut312 ve yan içerik `contentRevision=1` immutable manifestte saklanır. Manifest bölüm kimliği, hedef ID'leri, kanonik tahta ve sunum eşleme digest'ini içerir. Mantıksal bölüm kimliği ödül/yolculuk kredisi için sabit kalır; revizyon ayrı anahtardır.
2. v2 okuyucu önce eski kaydı manifest rev1'e doğrular. Tamamlanmış kaydın yıldız/ipucu/süresi, yarım kaydın seçilmiş hedef/koordinatları, sahip, günlük, bonus, haftalık, albüm ve son bölüm bilgisi aynen taşınır. Boş/bozuk/sürümü bilinmeyen kayıt asla başarıyla göçtü diye işaretlenmez.
3. İlk kompakt aday kayıpsız tuple encoding kullanabilir: stroke=[hedefId,başSatır,başSütun,sonSatır,sonSütun]; isimli alan tekrarını kaldırır ama ters çizim/koordinatı korur. Kanıta dayanmadan tüm completed strokes'u silme. Tarih aralıkları/delta kodlama ancak deliklerin ve bütün ödül tarihlerinin eksiksiz geri açılabildiği test edilirse kullanılmalı. Oyun içi model v2 kalabilir, ayrı taşıma/saklama codec'i v3 olur.
4. İki aşamalı dağıtım: önce server/yeni istemci iki biçimi okur, rev1 ile yazar; fixture ve shadow dönüştürme eşitliği ölçülür. Ardından owner'a bağlı yeni storage namespace'e v3 yazılır, geri okunup karşılaştırılır; eski anahtar/yedek silinmez. Güç kesilmesinde eski sağlam kayıt seçilebilir olmalı.
5. Eski istemci PUT'u yalnız rev1 dalına birleşir; bilmediği rev2/v3 alanlarının yokluğu silme sayılmaz. Sunucu authoritative mevcut kaydı önce okur, revizyon başına birleştirir, sonra boyut kontrolü+CAS yazar. Hesap değişimi/çıkışta bekleyen istekler başka owner'a geçemez. Geç ACK yeni yerel stroke'u silemez.
6. Yeni içerik revizyonu, başlamamış bölüm için seçilebilir; başlanmış rev1 turu rev1 snapshot ile sürer. Çevrimdışı başlatma seçilen revizyonu ilk etkileşimden önce yerelde sabitler. İki cihaz farklı revizyon başlamışsa stroke'lar farklı tahtalar arasında birleştirilmez. Ödül kredisi mantıksal bölüm bazında en iyi tamamlamadan bir kez türetilir; yeni revizyon ikinci albüm/haftalık ödülü doğurmaz. Eski istemcinin yeni revizyonu gösterememe durumu açıkça tanımlanmalı, gerekirse yeni içeriğe başlamadan güncelleme istemeli; mevcut çevrimdışı eski tur kaybolmamalı.
7. Geri dönüş dağıtımı eski arayüz/davranışı geri alabilir fakat çift okuyucu, revizyon manifestleri, yeni kimlikler ve veri birleştirme katmanını korur. 0.49/0.50 eski sunucusunu kör yeniden yayımlamak kabul edilmez. Gerçek oyuncu DB'si eski yedeğe döndürülmez.
8. Kabul matrisi: bütün eski kayıtlar round-trip; yarım/tam/tam ters çizilmiş; iki owner; eski-yeni cihaz sırası; offline başla→diğer cihaz bitir; geç ACK; göç sırasında kapanış; bozuk/taşmış kayıt; ikinci ödül yok; v3→uyumlu geri dönüş. Gerçek iPhone, VoiceOver ve iki canlı cihaz bu kaynak/test kabulünden ayrı kalır.

Bu rapor mevcut zorluk/tekrar kusurlarını çözüldü saymaz. Güvenli yayın için tamamlanabilen kapıları ve sonraki içerik/kayıt değişikliğinin somut sınırını tarif eder.
