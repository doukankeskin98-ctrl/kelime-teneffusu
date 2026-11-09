# Hızlı eşleşme dar güvenilirlik incelemesi · 9 Kasım 2026

Kaynak: 0.47.1. Salt okunur uygulama incelemesi; yalnız bu günlük yazıldı. Canlı oyuncu/oturum/veri değiştirilmedi. Kullanıcının az önce bildirdiği olayın kesin nedeni henüz canlı kanıtla belirlenmedi.

## P1 · Kısa bağlantı kesintisi aynı tercihteki iki canlı oyuncuyu ayrı bekleme odalarında bırakıyor

- Kaynak: `lib/game/server.ts:142,161–168,208–228`. `enterQuickGroup` son 15 saniyede canlı olmayan lobiyi doğru biçimde atlıyor; fakat `pairWaiting` grup odalarında hemen dönüyor. `state` yalnız bu yordamı çağırıyor; `enter` mevcut üyeliği varsa yeni kuyruk aramadan `state` dönüyor.
- Tetikleyici: Alice quick/group/words girer. 20 saniye heartbeat gelmez. Bob quick/group/words girer; yeni oda oluşur. Alice bağlantısını yeniler. Her ikisi artık çevrimiçidir ama farklı tek kişilik `waiting` odalarında kalır.
- Gerçek tekrar üretim: bellekte SQLite kullanan gerçek `tests/fixtures.ts` / `GameService` ile 20, 25, 30 ve 35. saniyelerde iki oyuncunun `state` yanıtları ayrı oda kimlikleri, `waiting`, birer oyuncu döndürdü. Alice'in tekrar `enter` çağrısı da eski odayı döndürdü. Fixture dışına kayıt yazılmadı.
- Gerçek istemci tetikleyicisi kaynakta mevcut: `components/game/useLiveRoom.ts:15,20,25,44–45` gizli sayfada native sorguları durdurur veya web akışını keser; görünür olunca mevcut oda yeniden okunur. 20 saniye başka uygulamaya geçmek testteki kesintiyi açıklayabilir; bu olayın gerçek cihazda gerçekleştiği ayrıca gözlenmedi.
- Öneri: yalnız uygun quick/group bekleme lobilerinde, aynı roundPolicy ve engel/kapasite kuralları korunarak state/reconnect sırasında güvenli yeniden eşleşme sağlanmalı. Üyelik aktarımı revision/transaction korumasında olmalı; aktif/hazır çok oyunculu oda, sonuçlar ve seri geçmişi gelişigüzel taşınmamalı.
- Minimum regresyon: Alice girsin; saat 20 saniye ilerlesin; Bob girsin ve eski oda canlandırılmasın; Alice ve Bob `state` çağırsın. Sonraki iki görünümün aynı oda kimliğine, `ready` durumuna ve tam iki gerçek oyuncuya sahip olduğunu; her oyuncunun tam bir aktif üyeliği kaldığını doğrula. Ayrıca farklı policy ve engelli oyuncu ayrılığı korunmalı.

```ts
const f = fixture();
const old = (await f.game.enter('alice', 'quick', undefined, true, 'words'))!;
f.advance(20_000);
const fresh = (await f.game.enter('bob', 'quick', undefined, true, 'words'))!;
assert.notEqual(old.id, fresh.id); // Kesilen oyuncu yeni gelenle hemen eşleşmez.
await f.game.state('alice');
await f.game.state('bob');
const a = (await f.game.state('alice'))!;
const b = (await f.game.state('bob'))!;
assert.equal(a.id, b.id); // 0.47.1 burada başarısız olur.
assert.equal(a.phase, 'ready');
assert.deepEqual(a.players!.map(p => p.id).sort(), ['alice', 'bob']);
```

## Düzeltmenin SSE sınırı

`app/api/live/route.ts:14,25–26` oda kimliğini sabit tutuyor ve heartbeat `state()` yanıtını atıyor. Yeniden eşleştirme `state()` içinde oda değiştirdiğinde akış yeni kimliği/görünümü benimsemeli; eski iptal edilmiş oda görünümü gönderilmemeli. `components/game/Arena.tsx:51` transferi yalnız önceki görünüm `waiting` iken kabul ediyor; önce eski `cancelled` görünümünü göndermek sonraki doğru oda aktarımını reddettirebilir. Minimum akış kabulü: açık akışın heartbeat'i yeni odaya geçtiğinde yeni gerçek oda kimliği ve oyuncular gönderilir; emekli oda callback'i yeni durumu ezmez.

## Doğrulama ve sınır

`node --experimental-strip-types --experimental-transform-types --test tests/arena-series.test.ts`: mevcut 12 testin 12'si geçti. Eşzamanlı ilk giriş/policy ayrımı ve stale lobiyi atlama kapsanıyor; stale oyuncunun geri dönüşünde lobi birleştirme kapsanmıyor. Yeni test dosyası veya uygulama değişikliği yapılmadı. Canlı auth, iki fiziksel telefon ve canlı olayın oda/policy kimlikleri koordinatör doğrulamasında; bu rapor bunları doğrulanmış saymaz.

Koordinatör uygulaması: aynı tercihte yalnız oynanmamış ilk-tur tek kişilik hızlı grup odalarını birleştiren CAS/üyelik aktarımı ve SSE oda yönlendirmesi eklendi. İkinci incelemede bulunan non-left oyuncu seen tazeliği de filtreye alındı; ayrılmış istemcinin gecikmiş sorgusu regresyon testiyle korundu. 884 test geçti. Kalıcı kayıt, puan, ipucu veya ses değişikliği yok.
