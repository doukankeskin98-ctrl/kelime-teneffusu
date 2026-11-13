# Tahta ve hedef alanı

Kullanıcı kanıtı: 5. bölümde 3 yüksek hedef satırı ve 10×10 kare, WoW'un 6×7 tahtasından belirgin daha sıkışık. Önceki 26 px alt sınır/taşmama kontrolü ergonomi kabulü değildir.

Sonuç: 31/192 ana tahta güvenli sıkıştırmaya uygun. Bölüm 5 8×10 sunumda, 414×736 raf 140→72 px/hücre 36,4→45,1 px; 375×667 hücre 39,4, 320×568 hücre 31,1 px. İkincil hedef seçiciler gerçek 36 px satırlara indirildi; ana kontroller 44 px. Küçük ekranda çizim, ipucu, normal/ters görünüm, devam kaydı, parçalı kelime, sonuç ve sonraki bölüm geçişi doğrulandı. 923 test, 722 Worker; tip/içerik/şema/web/native/lint-artış geçti. Kayıt göçü yok. Fiziksel iPhone ve çok cihazlı Arena kabulü bu turda yapılmadı. Ayrıntı: docs/release-0.49.0.md.

Seçilen odak: mevcut kelime ve kayıtları koruyan, boş dolgu satır/sütunlarını güvenli biçimde kaldıran dikdörtgen sunum; ortak hedef rafındaki kart boşluklarını azaltma. Tek salt okunur uzman bölüm 5'in 8 sütun ×10 satır sunumunda bütün hedeflerin ve içerik güvenliğinin korunduğunu doğruladı. Yeni motor, içerik/ödül/kayıt göçü yok.

Kabul: aynı tahta bütün ekranlarda aynı harflere sahip; her kabul edilen kelime ve koordinat geri eşlenir; yeni sakıncalı dizi/yanlış hedef oluşursa eski sunuma dönülür. Çizim, döndürme, ipucu, klavye ve harf uçuşları ortak geometri kullanır. Hedef düğmeleri çakışmaz; küçük ekranlarda bütün satırlar görünür. 5. bölümün hücre ve raf ölçülerini önce/sonra karşılaştır. Zorunlu kontroller ve gerçek tarayıcı önizlemesi; fiziksel iPhone hissi ayrıca açık.
