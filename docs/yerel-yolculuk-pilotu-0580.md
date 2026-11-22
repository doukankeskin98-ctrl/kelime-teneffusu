# Kelime Teneffüsü · 0.58.0 yerel pilotu

22 Kasım 2026. Canlı web sürümü 0.57.7, Sites v118, kaynak `2f5eaa2`. Bu kaynak GitHub’daki `codex/0.57.7-butunluk` dalında. 0.58.0, yerel `codex/0.58.0-yolculuk-guvenligi` dalında. Standart iOS paketi 0.58.0 (60) doğrulandı ve Xcode simülatör hedefi için derlendi. TestFlight gönderimi ve fiziksel iPhone kurulumu yapılmadı.

**Pilotu Mac’te açmak için** [yerel oyuna git](http://127.0.0.1:5175/). Sunucu kapanmışsa Terminal’de şu satırı çalıştır.

```sh
cd "$HOME/Desktop/proje kopyalama/oyun/kelime-teneffusu-current.nosync" && pnpm journey:local
```

İlk kez açılan bir tarayıcı profilinde **Bölüm 1** düğmesi, **Gökyüzüne bak** başlıklı altı hedefli tahtayı açar. Eski yerel pilotta başladığın bir bölüm varsa aynı adres ve aynı tarayıcı profiliyle devam edebilirsin. Oyuncu ilerlemesi bölümün ilk oynandığı tahtaya bağlı.

## Oyuncuya yansıyan değişiklikler

- 52 dünyada 312 bölüm, 3.159 hedef ve 54 bilmece bölümü için 416 tanım yerel pilotta oynanabilir. İleri dünyalarda çapraz ve ters yönler, kesişimler ve saklı kelimeler birlikte artıyor. Haritadaki ve ana düğmedeki **Zor** etiketi ilgili bölümü gösteriyor.
- 44 başlık yeniden düzenlendi. Konu bandından gizli hedefin veya bilmece cevabının okunabildiği örnekler için denetim var. Tanıma dokunarak listeden seçmek ve üzerinde sağa ya da sola kaydırmak mümkün. Etkin tanımın erişilebilir metni harf sayısını içeriyor.
- Yarım ve tamamlanmış kayıtlar kendi tahta sürümünde açılıyor. 295–300 arasındaki altı bölümde eski deneme kaydı revizyon 2’de, pilotta ilk kez başlayan oyuncu revizyon 3’te oynuyor. Web’de IndexedDB, iOS’ta Application Support içindeki atomik dosya, oyuncu başına ayrı bir ikinci kopya tutuyor. Kopya onarımı, sahip değişimi, silme ve geriye dönük istemci uyumluluğu sınandı.
- Arena girişinde bilmece seçeneği hızlı eşleşmenin altında. Bağlantı kesildiğinde Arena sahnesi yerinde kalıyor. Profilsiz arkadaş ekranında davet kodu formu oyuncuya erken gösterilmiyor. İki ayar başlığı 22 px ve aynı ağırlıkta. Satırlar 17 px. Renk seçimi çerçeve ve onay işaretiyle okunuyor.

## Ölçülen zorluk eğrisi

Aynı kodda yayımlanmış yol ve pilot yolu boş kayıtla ayrı ayrı açıldı. Ortalamalar bölüm başına. Bilmece sırasında tanımla aranan hedefler saklı kelime sütununa dahil edilmedi.

| Bölüm | Eskiden hedef | Pilotta hedef | Eskiden saklı | Pilotta saklı | Eskiden en fazla 4 hedefli | Pilotta en fazla 4 hedefli |
|---|---:|---:|---:|---:|---:|---:|
| 1–18 | 5,6 | 8,5 | 0,4 | 1,2 | 3 | 0 |
| 19–60 | 4,6 | 8,8 | 0,6 | 1,4 | 25 | 0 |
| 61–100 | 4,9 | 10,2 | 0,7 | 2,3 | 19 | 0 |
| 101–150 | 4,2 | 10,6 | 0,2 | 3,1 | 40 | 0 |
| 151–200 | 4,2 | 10,5 | 0,2 | 3,0 | 42 | 0 |
| 201–250 | 4,0 | 10,5 | 0,2 | 3,5 | 50 | 0 |
| 251–312 | 4,0 | 10,5 | 0,2 | 3,9 | 62 | 0 |

Bu sayılar katalog ölçümüdür. İlk dünyanın yeni oyuncuya nasıl hissettirdiği ve ilerleyen dünyalarda bölüm süreleri için gerçek oynama verisi henüz yok.

## Doğrulama

Kanıt klasörü oyun deposunun yanında `../world-review.nosync/release-0580-local/` altında. ZIP’in SHA-256 değeri `3b90a2728bbb50f8ad91237d931be2ad0460006177e64b91722daf552e0b5f26`. Beş kelime bankasından yeniden üretilen 312 bölümlük tablo ve paketteki tablo aynı SHA-256 değerini verdi. Değer `799556ca62b80c7c22c1f9ddc5470bf8e8f18a90fc94711757a07f74c5d15c45`.

| Kontrol | Sonuç ve kanıt |
|---|---|
| İçerik, oyun modülü ve yeniden üretim | 312 bölüm, 0 fark. Tahta denetiminde 0 hata, 443 editör uyarısı. Ayrıntılar `content.log` ve `reproduction/` |
| Tahta, kelime rafı, tanımlar ve düğmeler | 312 bölüm × 2 katalog × 4 ekran = 2.496 düzen, 0 ihlal. 320×568, 375×667, 393×852, 430×932. Pilotun 416 tanımının her biri dört ekranda açıldı. `matrix/measurements.json` ve `matrix/issues.json` |
| Görseller | `yolculuk-galerisi.html` dosyasında 52 dünyanın ilk ve son bölümü 320/393 genişlikte; ayrıca dört boyutta bilmece örneği |
| Çizim | Gerçek React tahtasına tarayıcıda sentetik dokunma gönderildi. 312 bölüm iki yönde tamamlandı; 6.318 seçim, 0 başarısız. `touch-both.json` |
| Oyunun menüsünden giriş | Bölüm seçiciden 1, 29, 191, 276, 297 ve 300. bölümlere giriş, çizim, son hedef ve sonuç 320/393 boyutunda geçti. `first-visit.log` |
| Kayıt uyumluluğu | Önceki sürümden alınan 12 yarım ve bitmiş örnek hem yerelde hem test veritabanında açıldı. Üç revizyon birlikte saklandı. Eski bir istemcinin tanımadığı kaydın üstüne yazması engellendi. Dolu pilot kaydı mevcut 256.000 bayt sınırında yerel ve bulut gidiş dönüşünden geçti. `compatibility.log` |
| Masaüstü kapanışı | Tamamlanmanın ardından yaklaşık bir saniyede 5 normal kapanış, 5 SIGTERM, 5 SIGKILL. 15/15 yeniden açılışta yıldız, birincil kayıt ve bağımsız kopya eşleşti. `persistence.json` |
| Menüler | İki boyutta 34’er ekran. Okunurluk ve kontrol konumlarında 0 ihlal. Altı menü durumu için 12 önce ve 12 sonra görüntüsü. `independent-ui-validation.json`, `ui/` |
| Proje ve derleme | 1.062/1.062 test, tip denetimi, içerik, web/mobil derlemeleri ve 749 yerel Worker HTTP kontrolü geçti. Lint borcunda artış 0. Standart mobil paketin 60 dosyası iOS kopyasıyla eşleşti. `tests.log`, `types.log`, `lint.log`, `worker.log`, `ios-bundle.log`, `native-build-final.log` |

İçerik taramasındaki terim eşleşmeleri ayrı `content-terms.txt` dosyasında. Pakette Claude’a ayrılan metin düzenlemeleri bekliyor. Web/mobil derlemelerindeki büyük JavaScript parçası uyarısı sürüyor. VoiceOver seslendirmesi, dokunma hissi, titreşim, FPS ve fiziksel iPhone kapanışları bu çalışmada ölçülmedi.

## iPhone için ayrılmış kabul

Fiziksel cihaz sonucu **0/20 denendi**. Kullanıcının oyununa dokunmadan, **ayrı test uygulaması ve test kaydıyla** yapılacak. Başlangıç örneği `scripts/visual/integrity/kayit-120-bolum.json`. Yeni kayıtla yapılan denemeler ayrı bir boş test profili kullanır.

1. Cihazı, iOS sürümünü ve kurulan yapı numarasını kaydet. Ayrı uygulamadaki başlangıç bölümünü, yıldız sayısını ve ayarları not al.
2. Bir bölümü bitir. Son kelime onaylandıktan sonra bir saniye içinde uygulamayı uygulama değiştiricisinden kapat. Süreyi ve bölüm numarasını kaydet.
3. Uygulamayı yeniden aç. Tamamlanan bölüm, yıldız, sonraki bölüm ve ayarları beklenen değerlerle karşılaştır. Bir fark varsa o test kaydını ayrıca koru.
4. Hem boş hem önceden ilerlemiş test kaydıyla toplam 20 deneme yap. Her satıra önceki ve sonraki değerleri gir. Başarı sayısını cihazda ölçüldüğünde raporla.

## Yayın ve geri dönüş

Canlı sürümün geri dönüş kaynağı GitHub’daki `codex/0.57.7-butunluk` dalında `2f5eaa2f7120413b57ecaaeebec1a15f48f1e89a`. Yeni katalog yalnız yerel pilot derleme bayrağı ile localhost üzerinde seçilir. Standart paket eski bölümleri sunar. Pilot kayıtlarını korumak için aynı tarayıcı profilini ve adresini kullan. Pilot benimsenirse geri dönüş için yeni kayıt sürümlerini okuyabilen paketi saklamak gerekir. 0.57.7’ye dönmek, pilotta yeni kazanılan ilerlemenin o eski sürümde okunacağını garanti etmez.
