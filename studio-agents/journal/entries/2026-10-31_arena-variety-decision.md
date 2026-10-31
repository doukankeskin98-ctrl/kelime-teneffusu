# 31 Ekim 2026 · Oturumlar arasında Arena çeşitliliği

Kullanıcı belirtisi: aynı odada sürerken farklı içerik; çıkıp yeni hızlı eşleşme/özel grup açınca tanıdık bilmeceler. Kaynak nedeni: arena_seen tam kelime kümesi/grid için kalıcı; tekil usedRiddleIds yalnız oda kaydında.144 tanım/8 dar tema farklı yedililer altında tekrar edebilir. Kimlik kaybı olduğu varsayılmadı.

Seçim: mevcut kalıcı makbuzlardan tüm katılımcıların tekil kelime sıklığı/son görünümü okunur; bütün Arena modları önce herkes için yeni hedefleri seçer. Yüzlerce yeni bağımsız tanımla ayrı rekabet kütüphanesi; yeterli alternatifte son12 maçın kelimeleri dışlanır, hiç görülmeyenler sonra az/eski görülenler öncelenir. Tam kelime kümesi/grid tekrar yasağı ve oda içi tekil bilmece yasağı gevşetilmez. Kütüphane sonludur; sonsuz yeni kelime vaadi yok. Yeni sürümlü havuzlar, eski üreticiler/snapshot/kayıt/göçlere dokunulmaz. Şema eklemek yerine eski arena_seen JSON makbuzları doğrudan kullanılır; eski oyuncular sıfırdan başlamaz.

Kabul: aynı kimlikle en az40 kez özel/açık oda kapatıp açma; arada dereceli düello; yeni GameService/reload; herkesin geçmişi birleşir, ilk yüzlerce hedef tekrar etmez. Çıkılmış/yarım tur da görülmüş sayılır. Eski makbuzların etkisi, yeni hedefler tükenince kontrollü düşük sıklık seçimi, tam set/grid engeli, atomik hata/yarış ve eski12×12 devamı hedefli kontrol edilir.9×9/yedi grup ve8×8/altı düello, mobil düzen, saat/puan/ödül aynıdır. Tek saltokunur uzman. Gerekli test/içerik/tip/build/Worker/CI ve tam ağaç eşleşmesinden sonra aynı publicSite yayını.

## Uygulama ve doğrulama

630 yeni bağımsız tanım; eski144 cevap/kimlik/tanım değişmeden774 bilmece, normal havuzla919 tekil kelime. Bütün919cevap tam yedili tahtada yerleştirme denetiminden geçti. Eski makbuzlar SQL içinde JSONvalid/type guard ve per-user ROW_NUMBER ile gruplanıyor; istemciden hedef geçmişi kabul edilmiyor. Farklı oda ve normal/düello/bilmece aynı makbuz geçmişini kullanıyor. Kaydedilen veri zaten oyunun başlangıcındaki bütünhedefler; bitirmeden ayrılma geçmişi sıfırlamıyor.

Tek uzman eski davranışı12yeniodada doğruladı:84hedefte75tekilcevap. Yeni test54oda/mod değişiminde372hedef/372farklıcevap, freshService/reload ve gerçekclaim/erkenleave içeriyor. İlk review'da az/eski görülmüş aynı7hedefin exact-set engeline takıldığı bulundu; variation adayları gerçekten farklıkelimelere ilerletiyor, görülmemiş/hedefsoğutma önceliği korunuyor. Bu kilidin servis regresyonu geçti, uzman sonincelemede kapattı. RADYO/ÇAP/KORNER tanımları netleştirildi.

520test/111grup,161eski authored/3220alternatif+64legacygroup+96yeni rekabet tahtası, tip/üretim build/20Safari12syntaxchunk ve559üretim WorkerHTTP kontrolü geçti. HTTP:8özeloyuncu→önceki3turdan ayrılma→aynıhesaplarla derecelidüello→yeni hızlıgrup; hedeflerin geçmişten dönmediği ve ortak tahta doğrulandı;16eşzamanlı halka açık misafir kontrolü korundu. Eski12×12/8×8 snapshot claim/reload/next, eskihavuzcursorları ve kayıt/ödültestleri geçiyor. Son tipdüzeltmesi yalnızcheck-content.ts callbackannotasyonu; uygulamaderlemesini etkilemedi.

Destekli CUA tab binding 'browser.user is unavailable' ile açılamadı; mevcutbrowser için biryenibağlanmadenemesi deaynısonuç, resetdispatchiptal. Başka kontrol yoluna geçilmedi. UIyerleşimi buiştedeğişmedi; yeni mobilgörüntü/fizikselcihaz/FPS doğrulaması yapılmış sayılmaz. Üretimde binlercegeçmişmakbuz yükü/çokgerçekhesap yük testi yapılmadı. Sonsuzhiçkelimeteğrarı garantisi yok; hiçgörülmeyenbitince az/eski görülen hedefler kontrollü seçilir, aynıtamküme/grid aslatekrarlanmaz. Aynıhesap veya aynı kalıcımisafirkimliği şarttır; yeni hesap ayrıgeçmiştir.

CI/GitHub–Sites tam kaynak eşleşmesi ve gerçekyayın sonucu repo dışı0.23.0release kaydında tamamlanır.
