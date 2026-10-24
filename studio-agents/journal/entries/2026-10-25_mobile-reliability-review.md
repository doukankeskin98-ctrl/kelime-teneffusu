# Mobil arayüz güvenilirlik incelemesi · 25 Ekim 2026

Kapsam: kök AGENTS, rol kuralları/runbook, strateji, README, sürüm ve harita belgeleri, son geliştirme/rol kayıtları; Board, common, Solo, Arena, CSS ve mevcut testler salt okunur incelendi. Uygulama veya test kaynağı değiştirilmedi. Bu tur üç odak aşağıdadır.

## 1. Tüm kelimelerin görünmesi ve erişilebilir büyütme ayrı kabul koşullarıdır

**Kanıt:** `app/studio.css:28` mobil `.word-list` için `max-height:133px;overflow-y:auto` uygular; `app/quality.css:51–52` etiket ve parça yazılarını büyütür. `components/game/common.tsx:25–27` bir hedef grubu içinde birden fazla aranabilir parçayı gösterir. Bu iç kaydırma kullanıcı şikâyetiyle doğrudan uyumludur. Kaynakta görülmesi, her cihazdaki görünümün ölçüldüğü anlamına gelmez.

**Risk/öneri:** Listeyi `overflow:hidden` ile kırpmayın, tamamlanan kelimeleri saklamayın ve parça metinlerini düşürmeyin. Varsayılan mobil görünümde tahta, bütün kelimeler ve ana kontroller birlikte sığmalı. Metin büyütme ve kısa yatay ekranda erişilebilir kaydırma tercih edilmeli; küçük harfe zorlamayla görünürde fit elde edilmemeli. Büyük harf modu zaten bilinçli olarak 46 px hücre ve pan kullanır (`Board.tsx:24–35`); bu modun kaydırması varsayılan oyunun başarısızlığıyla karıştırılmamalı.

**Kabul:** Destekli tarayıcıda 360×640, 390×844, 430×932 dikey boyutlarda öğretici, en yoğun standart ve 13×13 klasik tahta açın. Normal metinde bütün etiket/parçalar, kare tahta ve kontrol çubuğu viewport içinde olsun; kelime listesinde gizli içerik/scrollbar olmasın. 200% metin ve yatay görünümde içerik kırpılmasın ve bütün kontroller ulaşılabilir kalsın. Büyütülmüş modda pan ve iki uç seçimi ayrıca çalışsın.

## 2. Tahta geometrisini animasyon veya dinamik fit sırasında değiştirmeyin

**Kanıt:** `Board.tsx:17,24–30` pointerdown anındaki DOMRect'i hareket boyunca kullanır; SVG çizgileri ve harfler aynı kareye dayanır (`33–37`). Pause, board imzası ve zoom değişince seçim temizlenir (`13–15`). Mevcut engine testleri içerik/çapraz eşleşmeyi sınar, DOM pointer geometrisini sınamaz.

**Risk/öneri:** Giriş veya başarı animasyonu tahta öğesine translate/scale uygularken oynama açık olursa ölçülmüş alan güncelliğini kaybedebilir. Ekrana sığdırmada resize, yön değişimi veya kelime etiketi yüksekliği değişince tahta yer değiştirmesi aynı riski taşır. Animasyonu dekorasyon/renk üzerinde tutun; ölçü değişince etkin seçimi iptal edin veya geometrinin güncelliğini koruyun. Fit değişikliği bu koordinat riskini büyütmedikçe oyun motorunu değiştirmek gerekmez.

**Kabul:** Gerçek DOM üzerinde ileri/ters çapraz sürükleme, iki uç dokunma, kenara yakın kelime, pointercancel, pause ortasında seçim, zoom aç/kapa, ekran döndürme ve oklar+Enter kontrolü. İptal veya geometri değişiminde yanlış hedef commit edilmemeli, kalıcı çizgi kalmamalı. Geçerli seçimin önizlemesi harflerin üstüne oturmalı ve tek commit üretmeli.

## 3. Ortak PlayLayout solo dışında Arena ve parçalı kelime durumlarını da taşıyor

**Kanıt:** `common.tsx:29–30` ortak layout serbest `children`, `aside` ve `footer` alır. `Arena.tsx:50–52` aynı yere skor, sunucu saati, bağlantı/hata ve Altın Kelime bilgisi koyar; pending çizgi ayrı, WordList onaylı sunucu strokes kullanır. `Solo.tsx` sonuç/pause/help ve günlük süre farklılıklarını bu yerleşimden geçirir. Sadece Solo yüksekliğiyle sabit viewport tasarlamak Arena hata/bağlantı satırlarını kırpabilir.

**Risk/öneri:** Yeni panel CSS'ini `.play-screen` altında sınırlayın; admin önizlemesi de `.board-panel/.word-list` kullanır. Durum/hata ve çifte puan anlamını dekorasyon için gizlemeyin. Sunucu onayı gelmeden found chip veya skor üretmeyin. Düello süresini UI pause/yardım ile durdurmayın.

**Kabul:** Solo devam/pause/sonuç, günlük süre, Arena aktif/bağlantı yenileniyor/hata/sonuç yerleşimlerinin taşmaması. Parçalı etiket ancak tüm parçalar bulununca tamamlanmalı; golden ×2 etiketi görünür olmalı. Üretim Worker testleri iki oyuncu, doğrulanan skor/süre ve kayıt sahipliği için; mevcut engine/studio/discovery ve published-play-sync testleri veri uyumluluğu için korunmalı.

## Doğrulama sınırı

Bu bağımsız inceleme kaynak kanıtıdır; tarayıcı, fiziksel telefon, ekran okuyucu veya FPS testi yapılmadı. Zorunlu test, içerik, tip, üretim derlemesi, Worker HTTP, CI/kaynak eşleşmesi ve yayın sonucu koordinatörde. Oyuncu tutma veya profesyonel stüdyo eşdeğerliği ölçülmüş sonuç değildir.
