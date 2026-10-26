# Ana ilerleme hesap sınırı · bağımsız dar inceleme

26 Ekim 2026 akşam. Başlangıç koordinatörün güncel Sites helper kaynağı `262c78ce48d0b2925b9a92bb754e9a6e0a845c62`, **0.12.1**. Kök AGENTS, ajan README/kayıt/öncelikler, reliability rolünün AGENT/RULES/HEARTBEAT/MEMORY/RUNBOOK dosyaları ve son maintenance-validation okundu. Kapsam yalnız ProgressSync/useCloudProgress ve `/api/progress` GET/PUT hesap sahipliği. Uygulama, test ve yayın değiştirilmez; tek yazılan dosya bu günlük. Rol MEMORY'sine tekil bulgu örüntü diye eklenmedi.

## 1. İstek gönderilirken değişmiş aktör, eski istemci sahibinin ilerlemesini alabiliyor

**Yüksek öncelikli veri koruma odağı. Kaynak (pinlenmiş 0.12.1):** `components/game/useCloudProgress.ts:11–14` load/save closure'ları; `app/api/progress/route.ts:10–13` context/GET/PUT; `lib/auth/firebase-client.ts:23–35` bearerHeaders/memberFetch; `lib/game/progress-sync.ts` connect/flush.

Hook'taki sync instance'ı owner'a bağlıdır; fakat GET URL'si ve PUT gövdesi beklenen owner'ı sunucuya iletmez. API yalnız isteğin gerçek kimliğini alır, gelen istemci niyetinin aynı sahibi bekleyip beklemediğini denetlemez. `memberFetch` token edinmeyi await eder, gerçek fetch bundan sonra başlar; 401'den sonra da o anda güncel auth kullanıcısıyla token yenileyerek aynı isteği tekrar edebilir. Başka sekmede cookie veya kimlik değişimi de actor'ı değiştirirken eski view/hook henüz yaşamaya devam edebilir. Disposed response'u istemcide yok saymak, sunucuda yanlış actor altında kabul edilmiş PUT'u geri almaz.

### Yalıtılmış yeniden üretim

Önce mevcut derlenmiş dist üzerinde iki misafirli Miniflare probe'u başlatıldı. Sonuç üretmeden beklediği için kendi exec oturumu Ctrl-C ile **130** koduyla sonlandırıldı. Bu denemeden HTTP başarısı veya negatif davranış kanıtı çıkarılmadı; derleme veya app kodu değiştirilmedi.

Ardından `git show 262c78c:app/api/progress/route.ts` ile **pinlenmiş gerçek route gövdesi**, gerçek `CloudProgress`, mevcut fixture'ın yalıtılmış SQLite DB'si ve kontrollü auth/delivery yardımcıları kullanıldı. Auth helper'ı actor'ı açık test request header'ından seçer; auth middleware'in kendi doğruluğu bu VM deneyinin konusu değildir. `boundedJson` request JSON'unu okur, response gerçek Response/JSON'dur; origin eşitliği kontrol edilir. Rate-limit ve operational telemetry yardımcıları bu dar deneyde yerine konmuştur. Canlı servis, gerçek kişi/hesap, canlı DB veya provider kimliği kullanılmadı.

1. Test Bob actor'ının ilerlemesine `sound=true` işareti yazıldı.
2. Gerçek GET, actor **Bob**, URL `expectedOwnerId=Alice` ile çağrıldı: **200**, Bob'un sound işareti geri geldi.
3. Gerçek PUT, actor **Bob**, gövde `expectedOwnerId=Alice` ve `contrast=true` ile çağrıldı: **200**. Gerçek store/SQLite okumasında Bob contrast true, Alice contrast false kaldı.
4. Script assert'leri geçti ve DB kapatıldı; hiçbir uygulama veya kalıcı test dosyası yazılmadı.

**Kanıtın anlamı:** Sunucu gerçek authenticated actor sınırını kullanıyor; bu deney kimliği olmayan birinin başkasının verisini okuyabildiği bir auth bypass göstermez. Gösterdiği eksik koruma, actor değişmiş stale istemcinin **eski owner niyetinin** sunucuda denetlenmemesidir. Gerçek oyuncu verilerinin karıştığı canlı olay, olay sıklığı veya bütün tarayıcılarda bu native zamanlamanın oluştuğu iddia edilmez. Solo ilerleme zaten rekabet derecesi vermez; bu risk oyuncunun kendi ana keşifleri/ayarları/koleksiyon kaydıyla ilgilidir.

### Öneri / fayda / maliyet / risk

- Ana ilerleme GET'e optional `expectedOwnerId` query, PUT'a optional `expectedOwnerId` alanı. Yeni hook her ikisinde kendi değişmez sync owner'ını gönderir. Alan gerçekten verilmiş ve actor'la uyuşmuyor, boş/null/yanlış tip geliyorsa özel owner-mismatch cevabı; yanlış sahibin kaydını okuma/yazma yapılmaz. Actor request body'den seçilmez.
- Alanı göndermeyen eski istemci biçimi mevcut authenticated actor davranışıyla çalışmayı sürdürür. Yeni alan legacy auth'ı gevşetmez; aynı-origin, body sınırı, oran sınırı, merge ve veri temizleme kuralları korunur.
- Fayda yüksek veri koruma; şema veya yeni hizmet gerektirmeyen sınırlı uygulama. Risk, yanlış kimlik türünü owner saymak veya bütün409'ları kalıcı hesap hatası diye ele almaktır.

**Kabul:** wrong/empty owner GET ve PUT özel409 döndürür; diğer actor DB'si değişmez, özel progress response'a sızmaz. Doğru owner ve alanı eksik eski biçim çalışır; unauthenticated401/origin403 ve mevcut merge/best/ödül regresyonları korunur. Hook request'leri gerçekten owner taşır; member token bekleme/401 retry sonrası actor değişimi yeni owner'a yazılmaz. Yeni Worker kontrolleri koordinatörün gerçek son build'iyle geçmelidir.

## 2. Passive cleanup öncesi ortak current ref'i owner değişimine karşı ayrıca bağlamak gerekli

**Kaynak temelli dar yarış adayı; ayrı canlı arıza tekrarı yapılmadı. Kaynak:** `useCloudProgress.ts` render başında `current.current=progress`, passive effect içindeki `sync.dispose` ve ortak read/write/status closure'ları; `ProgressSync` yalnız `stopped` üzerinden yapılan entry/await-sonrası kontroller.

Render yeni owner/progress'i current ref'e yazdıktan sonra eski effect cleanup henüz çalışmamış olabilir. Eski sync'in periyodik/async continuation'ı o aralıkta aynı current ref'i okuyabilir veya geç yanıtını ortak write/status closure'ına verebilir. Mevcut dispose testleri cleanup sonrası yanıtı kapsıyor; cleanup öncesi owner render sınırını doğrudan modellemiyor. Bu, kaynak ve React effect yaşam döngüsünden çıkarımdır; gerçek concurrent React/StrictMode gözlemi olarak sunulmaz.

Koordinatörün önerdiği optional `isCurrent` predicate'i düşük maliyetli ilave sınırdır: owner ref'i her render güncellenir, predicate hem mevcut owner'ı hem sync instance kimliğini denetler. Class entry/read/persist/report ve awaited load/save sonrası bu aynı aktiflik kontrolünü kullanır. Owner değişmiş eski instance yeni current ref'ini okuyamaz, yeni sahibin state/cache/status'unu değiştiremez. Render sırasında dispose gibi yeni side effect gerekmez. Her await'ten sonra yalnız token/sunucu guard'ına değil, instance-current sınırına da bakılmalı; eski callback generic network hata raporuyla yeni UI'yı değiştirmemeli.

**Kabul:** eski load/PUT pending iken current predicate false olsun, dispose henüz çağrılmadan response tamamlatılsın. Okuma/yazma/cache/status sayıları ve yeni owner state'i değişmesin. Scheduled flush/changed/connect eski instance üzerinde no-op kalsın. Yeni owner için yeni instance normal load/merge/save yapabilsin. Predicate verilmediği mevcut class kullanım/testleri uyumlu kalsın. Bu kontrollü predicate kabulü gerçek concurrent React garantisi diye sunulmaz.

## Düzeltmenin hata ve UI sözleşmesi

`lib/game/cloud.ts` mevcut altı optimistic deneme sonunda normal eşzamanlı kayıt çatışmasını **409 GameError** ile döndürüyor. **Bütün409'ları hesap değişimi diye sınıflandırmak hatadır.** Owner mismatch ayrı `PROGRESS_OWNER_CHANGED` benzeri kararlı makine code'u taşımalı; client yalnız bu açık code'u kalıcı hesap sınırı olarak ele almalı. Normal concurrency409, network/500 ve malformed error JSON mevcut güvenli yeniden deneme yolunda kalmalı.

Koordinatörün planı uygun: açık owner code'undan ayrı ProgressAccountError; o sync instance'ının bulut istekleri bloke olurken yeni yerel changed/persist devam eder. Cihaz yazımı sağlam `account-changed` ile bozuk `account-changed-storage-error` ayrı gösterilirse, gerçekten kaydedilemeyen duruma "cihazında korundu" denmez. Yazım bozukken reload kapalı olmalı; yalnız persist'i yeniden deneme, düzeldikten sonra profili yenileme güvenli çıkıştır. Yeni owner/yeni instance blok durumunu taşımamalı. Bloğu kaldırmak için aynı owner'la otomatik tekrar yanlış hesaba yazmayı denememeli.

Ortak banner shell ve tüm game early-return'lerde görünmeli. Mevcut **Sprint** early return, diğer Solo/Mystery/extra branch'lerinin kullandığı saveWarning'ı render etmiyordu; bu yeni hesap bildirimi Hızlı Tur'da da görünür kılınmalı. Profil cloud-status aynı gerçeği metinle anlatmalı, çevrimdışı gibi göstermemeli. Reload kullanıcı eylemiyle olmalı; ilerleme yazılamıyorsa otomatik reload yapılmamalı.

## Sınırlar

İki araç denemesinden yalnız pinlenmiş route + gerçek CloudProgress/SQLite kabuğu sonuç üretip assert geçti. Tam Worker negatif probe'u tamamlanmadı. Tam test/tip/build/HTTP/CI, gerçek cookie/token provider yarışması, browser/telefon, native focus/pointer sırası, ekran okuyucu, FPS veya canlı oyuncu olayı bu rol tarafından doğrulanmadı. Final uygulama/test/yayın koordinatöründedir; final diff ayrı istenirse bu günlükte devam edilir. Yeni bağımlılık, ücret, hesap, servis, göç, kalıcı cache veya zamanlayıcı önerilmez.

## Uygulama sonrası son dar inceleme

Koordinatörün son route, ProgressSync, useCloudProgress, ProgressAccountNotice, App/Pages/CSS ve ilgili test/Worker diff'i okundu. İlk değerlendirmeden kalan iki küçük netleştirme de son kaynakta doğrulandı. **Bu kapsamda kalan yeni somut yayın engeli saptanmadı.** Tam test/tip/içerik/build/Worker HTTP/CI ve kaynak/yayın kapıları koordinatöre aittir; bu son inceleme bunları tekrar çalıştırmış sayılmaz.

- **Sunucu sınırı:** GET `expectedOwnerId` parametresi gerçekten varsa authenticated userId ile karşılaştırır; mismatch/boş değer store.read'den önce durur. PUT verilmiş owner alanını store.save'den önce aynı aktörle karşılaştırır. `PROGRESS_OWNER_CHANGED` yalnız owner uyuşmazlığı için verilen açık409 code'udur; generic failure ve CloudProgress concurrency409 değişmez. Doğru owner ve alanı olmayan eski istemci biçimi desteklenir; actor gövdeden seçilmez. Body/origin/rate/merge sınırları korunur.
- **İstemci isteği:** Hook GET query ve PUT gövdesinde closure'a ait owner'ı iletir. `checkProgressResponse` yalnız409 + açık `PROGRESS_OWNER_CHANGED` code'unu ProgressOwnerChangedError'a dönüştürür. Diğer409 veya malformed JSON genel hata/retry yolunda kalır; yeni hesap blok durumu yanlışlıkla transient çatışmaya uygulanmaz.
- **Önceki render sınırı:** liveOwner ref'i render'da güncellenir; `isCurrent` hem owner'ı hem session instance'ını doğrular. Class'ın active kontrolü entry, persist/report ve awaited cevap sonrası ortak state okuma/yazmadan önce kullanılır. Dispose önceki AbortController'ı da iptal eder. Yanıt decode/validation işi, gerçek concurrent React garanti testi gibi sunulmaz; özel state/cache/status mutasyon sınırı kaynakta korunur.
- **Blok ve yerel devam:** Açık owner mismatch o instance'ın yeni cloud connect/save işlemlerini bloke eder; changed ve flush yerel persist'i sürdürebilir. Yeni yerel keşifler yanlış sahibin server kaydına yüklenmez. `account-changed-storage-error` başarısız cihaz yazımını ayrı gösterir; bu sırada kullanıcı retry'si yalnız yerel persist'i dener. Başarıdan sonra status account-changed'a dönebilir, aynı yanlış bulut kanalı yeniden açılmaz. Yeni owner/yeni instance kendi normal sync akışını kurar.
- **Bildirim ve oyun güvenliği:** App banner'ı shell ve Sprint dahil tüm oyun early-return'lerinde vardır. `inGame` sprint/extra/solo/mystery/playing üzerinden verilir. Sağlam ana kayıt olsa bile aktif oyun sırasında reload düğmesi yok, oyun dışına çıkınca yenile metni vardır; bu ana progress kanıtını ayrı PublishedPlay/Sprint run state'i için garantiye dönüştürmez. Storage hatasında yalnız cihaz kaydı retry düğmesi sunulur. Hem normal hem storageFailed kopyası açıkça **ana ilerleme** kapsamındadır; ayrı modların bütün kayıtları güvenli diye bir iddia yoktur. Profil durum metni hesap değişimini çevrimdışı gibi sunmaz.
- **Dar öneriler uygulandı:** storageFailed metni de “Ana ilerlemenin…” kapsamına alındı. Gerçek App kabulüne shell için `inGame=false`, PublishedPlay ve Solo/Mystery/Sprint için `inGame=true` assertion'ları eklendi. Böylece Notice bileşeninin kendi testini geçip App'te varsayılan false ile yanlış reload sunan kablolama gerilemesi de yakalanır. Bunlar kaynakta okundu; bu rol tarafından test tekrarı yapılmadı.
- **Kabul kapsamı:** Yeni progress-owner testleri actual route/store/SQLite üzerinde yanlış/boş/null/non-string owner ve legacy/same-owner kabulünü; actual hook owner taşımayı, başlangıç/load/save mismatch'i, normal concurrency409 retry'sini ve passive cleanup öncesi geç cevabı; Notice normal/oyun içi/storage hata dönüşlerini denetler. Quality testleri yerel devam/retry ve inactive GET/PUT/scheduled işin read/cache/write/status sınırını ekler. Worker diff'i gerçek build'e yanlış ve doğru owner istekleriyle özel veri sızmama/yazmama kontrolleri ekler. Koordinatör önceki44 dar kontrolün geçtiğini bildirdi; son UI netleştirmeleriyle full test/type/build yeniden kendi çalışmasında yürütülür.

Bu son aşamada yeni araç/servis/göç/ücret önerilmedi, uygulama/test/başka belge/yayın değiştirilmedi. Gerçek provider-token/cookie zamanlaması, live kullanıcı olayı, browser/telefon, DOM/piksel, ekran okuyucu/FPS ve concurrent React/StrictMode sınırı aynen açıktır. Negative Worker denemesinin tamamlanmadığı üstteki kayıt korunur; final Worker doğrulaması koordinatörün yeni üretim build sonucu olmalıdır.
