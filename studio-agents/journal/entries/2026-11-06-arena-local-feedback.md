# Arena ve Meydan yerel kelime geri bildirimi · 0.38.2

Kullanıcı iPhone 0.38.1 denemesinde normal oyundaki kelime onayını dengeli, Arena tarafını biraz geç buldu. Kaynakta Arena ve Meydan yerel eşleşmeden sonra kelime sesi/titreşimi ve uçuş için HTTP yanıtını bekliyordu. Solo aynı geri bildirimi yerel eşleşmede başlatıyor.

Kabul ölçütü: geçerli yerel kelime aynı çizimde ses/titreşim ve uçuş başlatır; resmi raf, puan/sıralama, bitiş ve kayıtlar sunucu snapshot'ında kalır. HTTP/canlı güncelleme ikinci kelime sesi/uçuşu üretmez. Ret/iptal bekleyen uçuşu temizler; aynı kelimeyi yeniden çizme çalışır. Süresi bitmiş maçta bekleyen çizgi bulunmuş kelime gibi kalmaz. Mevcut tek isteklik giriş kilidi ve sunucu kuralları korunur.

Kapsam: Arena, Meydan, ortak dekoratif uçuş. Animasyonun kullanıcı tarafından kabul edilmiş 720 ms uçuş/180 ms iniş hızları, haptik şiddeti ve Solo değişmez. Yeni ağ kuyruğu/SDK/kayıt göçü yok.

Doğrulama: 121 hedefli ve toplam 792 test geçti. Tip kontrolü, içerik denetimi, değişmeyen veritabanı şeması, web/42 offline/21 Safari 12 parçası, mobil paket/21 sahne, 695 Worker HTTP ve iPhone Release imzası başarılı. Bağımsız dar güvenilirlik incelemesi engel bulmadı. Gerçek iPhone his kabulü açık; resmi raf işareti ve sonraki çizim kilidi hâlâ sunucu yanıtını bekler. Kurulum ve yayın makbuzu çalışma alanındaki world-review altında ayrıca tutulur.
