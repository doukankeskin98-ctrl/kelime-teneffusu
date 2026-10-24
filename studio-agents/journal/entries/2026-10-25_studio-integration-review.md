# Tema içeriği ve arkadaş akışı incelemesi · 25 Ekim 2026

Kaynak incelemesi: app/page.tsx, lib/studio/releases.ts, release-identity.ts, release-stamps.ts, app/api/chapters/route.ts, App.tsx, Pages.tsx, PublishedChapters.tsx, Friends.tsx, useChapterCards.ts, GameService.enter ve ilgili testler. Kod değiştirilmedi.

## 1. Tema kataloğu filtresi sayfalama öncesinde uygulanmalı; kayıt ve damga kimlikleri korunmalı

**Kanıt:** `app/page.tsx:4` yalnız son iki özet gönderir. `releaseCatalogue` kullanılabilir bütün kayıtları tarihe göre sıralar, sonra 24'lük sayfalar üretir. `Pages.tsx` tema kartları sabit altı bölüm ve varsa beş rota sayar; `App.tsx` tema modalında yalnız bu iki kaynak vardır. Sadece mevcut `releases` prop'unu tema bazında filtrelemek eski günlük bölümleri kaçırır.

**Entegrasyon:** Sunucuda `available(now)` üzerine `spec.themeId` filtresi uygulandıktan sonra offset/limit hesaplanmalı. Tema toplamları yalnız son iki/ilk 24 kayıt üzerinden hesaplanmamalı. Özet cevabı board/placements taşımamalı; `/api/chapters?id=...` ve `PublishedPlay` aynı kalıcı kimliği açmalı. Tema filtreli istemci önbelleği anahtarı tema içermeli; tema değişince eski istek iptal edilmeli ve liste temizlenmeli.

`useChapterCards` zaten 24'lük gruplar, owner+contentHash eşlemesi, bilinmeyen kayıt ve çevrimdışı kullanılabilirlik sağlar; yeni kartlarda bunu yeniden yazmadan kullanın. `releasePairs` yalnız aynı tarihin özgün iki kimliği birlikte gelirse pair üretir. İki bölüm farklı temalardaysa tema filtreli liste tek başına pair/result damgasını kuramaz; seçilen bölümün tam özgün pair metadatasını ayrı koruyun veya mevcut kaynaktan tamamlayın. Eski `${theme}.${level}`, `route:*` ve `chapter_saves` alanlarını birleştirip yeniden numaralandırmayın.

**Kabul:** 24'ten fazla sentetik kayıtla eski tema bölümü sonraki sayfada ulaşılır; toplam aynı filtreli kümenin sayısıdır; başka tema/future kayıt sızmaz. Aynı yayımlanmış kimlik aynı board/contentHash ve sahip kaydını açar. Tema seçicisinden geri dönünce seçilen tema korunur. Çapraz temalı gün çiftinin damga koşulu iki özgün bölüm olarak kalır. Mevcut releases/chapter-cards/release-stamps/published-play-sync regresyonları geçer.

## 2. Arkadaş düello butonu özel davet oluşturmuyor ve enter sonucu her zaman yeni oda değil

**Kanıt:** `Friends.tsx:19` arkadaş satırında `f.id` kullanmadan `api('enter',{kind:'friend'})` çağırıp yalnız genel Arena sekmesine geçer. Arkadaşa istek/bağlantı gönderilmez. `GameService.enter` (`server.ts:113–115`) mevcut aktif oda varsa istenen türden bağımsız o odayı döndürür; hızlı eşleşme veya başlamış maç da olabilir.

**Entegrasyon:** Yanıtı `RoomView` olarak inceleyin. Yalnız `kind==='friend' && phase==='waiting'` durumunda paylaşılabilir davet gösterin; dönen oda kodunu aynen kullanın. Mevcut quick/ready/active oda için açıkça odaya dönüş sunun, yeni arkadaş daveti üretildi demeyin ve otomatik maçı terk etmeyin. Davet bağlantısı/kodu kullanıcıya gözle görünür ve tekrar paylaşılabilir olmalı; native share iptali, clipboard hatası ve bağlantı olmaması ayrı durumlar. Arkadaş adı bağlamdır, sunucuda alıcıya özel oda sınırı yoktur; otomatik bildirim/gönderim iddia edilmemeli. Satır eylemleri pending sırasında devre dışı kalmalı.

**Kabul:** Yeni waiting friend oda doğru paylaşım kodu verir; mevcut quick/active oda yanlış davet sunmaz; iptal başarısızlık diye gösterilmez; kopyalama olmazsa seçilebilir URL/kod kalır; arka arkaya dokunma çelişkili işlem üretmez. Gerçek davet kabulü ve iki oyuncu ready/claim akışı mevcut sunucu testleriyle korunur.

## 3. Arkadaş listesi ilk yükleme hatasında sonsuz yükleniyor görünür

**Kanıt:** `Friends.tsx:11` başarısız overview isteğinde yalnız `error` doldurur; `data` null kalır. `19` numaralı satır `!data` için sürekli “Arkadaşların hazırlanıyor…” gösterir ve yeniden deneme eylemi yoktur. `accept` veya `remove` başarılı mutasyon sonrasında `refresh()` hatası da aynı catch'e düşüp başarılı işlemi başarısızmış gibi gösterebilir (`14,20`).

**Entegrasyon:** Overview yükleme, hata ve mevcut veri durumlarını ayırın; ilk hata ekranında belirgin retry olsun. Yenileme hatasında mevcut listeyi koruyun ve işlemin başarı mesajını geri almayın. Gönderim ve liste yenileme hatasını farklı anlatın. `refresh` ve initial fetch sırasında unmount/hesap değişimi iptali göz önüne alınmalı; aynı boolean authenticated iki farklı hesabı ayırt etmez, owner değişimi için key veya açık owner bağımlılığı kullanın.

**Kabul:** İlk GET hatası spinner'ı sonlandırır, retry başarılı olunca liste açılır. Accept başarılı + overview hatası arkadaşın eklenmediğini iddia etmez. A hesabının geç overview yanıtı B hesabının listesini dolduramaz. Mutasyon sırasında satır ve kabul eylemleri çift istek üretmez.

## Sınır

Bunlar kaynakta doğrulanan sözleşme ve kusurlardır. Tarayıcı, gerçek hesap, fiziksel telefon veya gönderim testi yapılmadı; üretim oyuncu verisine dokunulmadı. Destekli tarayıcı bağlantısı önceki turda ERR_CONNECTION_REFUSED ile engelliydi. Uygulama, test ve yayın koordinatöre aittir.

## Son sınırlı diff incelemesi

Sprint reducer/bileşeni, Friends, PublishedChapters ve releases tekrar salt okunur incelendi. Yeni Sprint deadline girişini puan vermeden bitiriyor; countdown ve tahta geçişi seçimleri engelliyor, kayıt anahtarı sahibi App'teki key ile ayrılıyor. Friends account key, action kilidi, bağımsız refreshError ve waiting friend oda denetimi önceki kritik bulguları ele alıyor. Bu incelemede ek kritik süre/kayıt kusuru saptanmadı; fiziksel cihaz zamanlaması doğrulanmış değildir.

**Somut yeni sayfalama kusuru:** `releaseCatalogue(...,themeId)` içindeki companions filtresi yalnız farklı temayı alıyor. Tema bazında önceki tarihler tek kayıt içerirse 24'lük sayfa aynı tarihin aynı temalı çiftini bölebilir. İlk bölüm sayfada, aynı temalı eş bölüm sonraki sayfada kalır ve companions'a alınmaz. Böylece ilk bölüm kartının `releasePairs([...chapters,...companions])` sonucu pair içermez; tamamlanma damga akışı o açılışta kaybolur. Çözüm: companions, sayfadaki tarihlerde bulunan ve sayfadaki chapter ID kümesinde olmayan tüm kayıtları almalı; tema eşitliğine göre dışlama yapılmamalı. Kabul: 23 önceki filtreli kayıt + sınırda iki aynı temalı bölümlü tarih fixture'ında ilk sayfanın partneri companions içinde, toplam/sayfa listesi aynı kalmalı. Bulguyu koordinatöre ilettim; uygulama dosyası değiştirilmedi.
